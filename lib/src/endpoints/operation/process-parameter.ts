import type {
  ParameterObject,
  ReferenceObject,
  SchemaObject,
  OpenAPIObject,
} from 'openapi3-ts/oas31';
import { isReferenceObject, isSchemaObject } from 'openapi3-ts/oas31';
import { match } from 'ts-pattern';
import type { ZodCodeResult, ConversionTypeContext } from '../../conversion/zod/index.js';
import type { TemplateContext } from '../../context/template-context.js';
import type { EndpointParameter, ParameterType } from '../definition.types.js';
import {
  getParameterByRef,
  resolveSchemaRef,
  assertNotReference,
} from '../../shared/component-access.js';
import { getZodSchema, getZodChain } from '../../conversion/zod/index.js';
import { pathParamToVariableName } from '../../shared/utils/index.js';
import { extractParameterMetadata } from '../parameter-metadata.js';

/**
 * Type signature for function that generates Zod variable names
 * @public
 */
export type GetZodVarNameFn = (input: ZodCodeResult, fallbackName?: string) => string;

/**
 * Allowed parameter locations according to OpenAPI 3.0 spec
 * @internal
 */
const allowedPathInValues = ['header', 'query', 'path'] as const;
type AllowedParameterLocation = (typeof allowedPathInValues)[number];

/**
 * Type guard to check if parameter location is allowed
 * @internal
 */
function isAllowedParameterLocation(location: string): location is AllowedParameterLocation {
  const stringAllowedPathInValues: readonly string[] = allowedPathInValues;
  return stringAllowedPathInValues.includes(location);
}

/**
 * Check if media type is allowed for parameters
 * @internal
 */
function isAllowedParamMediaTypes(mediaType: string): boolean {
  const wildcardType = '*' + '/' + '*'; // Avoid JSDoc parsing issues
  return (
    mediaType === wildcardType ||
    mediaType.includes('json') ||
    mediaType.includes('x-www-form-urlencoded') ||
    mediaType.includes('form-data') ||
    mediaType.includes('octet-stream')
  );
}

/**
 * Resolve parameter reference to ParameterObject
 * @internal
 */
function resolveParameterRef(
  param: ParameterObject | ReferenceObject,
  doc: OpenAPIObject,
): ParameterObject {
  if (!isReferenceObject(param)) {
    return param;
  }

  const resolved = getParameterByRef(doc, param.$ref);
  assertNotReference(
    resolved,
    `parameter ${param.$ref} (use SwaggerParser.bundle() to dereference)`,
  );

  return resolved;
}

/**
 * Extract schema from parameter content or schema property
 * @internal
 */
function extractParameterSchema(
  paramItem: ParameterObject,
  doc: OpenAPIObject,
): SchemaObject | ReferenceObject {
  // Extract from 'content' property
  if (paramItem.content) {
    const mediaTypes = Object.keys(paramItem.content ?? {});
    const matchingMediaType = mediaTypes.find(isAllowedParamMediaTypes);

    if (!matchingMediaType) {
      throw new Error(
        `Unsupported media type for param ${paramItem.name}: ${mediaTypes.join(', ')}`,
      );
    }

    const mediaTypeObject = paramItem.content[matchingMediaType];
    if (!mediaTypeObject) {
      throw new Error(
        `No content with media type for param ${paramItem.name}: ${matchingMediaType}`,
      );
    }

    if (!mediaTypeObject.schema) {
      throw new Error(
        `Invalid OpenAPI specification: mediaTypeObject for parameter "${paramItem.name}" ` +
          `must have a 'schema' property. Found ${Object.keys(mediaTypeObject).join(', ')}. ` +
          `See: https://spec.openapis.org/oas/v3.0.3#media-type-object`,
      );
    }

    return mediaTypeObject.schema;
  }

  // Extract from 'schema' property
  if (paramItem.schema) {
    return resolveSchemaRef(doc, paramItem.schema);
  }

  // Neither 'content' nor 'schema' present - invalid per OAS spec
  throw new Error(
    `Invalid OpenAPI specification: Parameter "${paramItem.name}" (in: ${paramItem.in}) must have either 'schema' or 'content' property. ` +
      `See: https://spec.openapis.org/oas/v3.0.3#parameter-object`,
  );
}

/**
 * Convert parameter location to type enum
 * @internal
 */
function parameterLocationToType(location: AllowedParameterLocation): ParameterType {
  return match<AllowedParameterLocation, ParameterType>(location)
    .with('header', () => 'Header' as const)
    .with('query', () => 'Query' as const)
    .with('path', () => 'Path' as const)
    .exhaustive();
}

/**
 * Get parameter name, applying transformation for path parameters.
 * Path parameters use variable name format (e.g., ":id" -> "id").
 *
 * @param paramItem - Parameter object with name and location
 * @returns Transformed parameter name
 * @internal
 */
function getParameterName(paramItem: ParameterObject): string {
  return match(paramItem.in)
    .with('path', () => pathParamToVariableName(paramItem.name))
    .otherwise(() => paramItem.name);
}

/**
 * Apply parameter description to schema if withDescription option is enabled.
 * Mutates the schema object if conditions are met.
 *
 * @param schema - Schema to potentially add description to
 * @param paramItem - Parameter with description
 * @param options - Template context options
 * @internal
 */
function applyDescriptionToSchema(
  schema: SchemaObject | ReferenceObject,
  paramItem: ParameterObject,
  options?: TemplateContext['options'],
): void {
  if (options?.withDescription && isSchemaObject(schema)) {
    schema.description = (paramItem.description ?? '').trim();
  }
}

/**
 * Process a single parameter for an endpoint operation
 *
 * Handles all parameter types (path, query, header) per OpenAPI 3.0 spec.
 * Resolves references, extracts schemas from `schema` or `content` property,
 * generates Zod validation code, and extracts rich metadata for SDK generation.
 *
 * **Metadata extraction includes:**
 * - Description, deprecated flag
 * - Examples and default values
 * - Schema constraints (min/max, length, patterns, etc.)
 *
 * @param param - Parameter object or reference to process
 * @param ctx - Conversion context with OpenAPI document
 * @param getZodVarName - Function to generate Zod variable names
 * @param options - Template context options
 * @returns Parameter definition with metadata, or undefined if skipped
 * @throws {Error} If parameter has invalid structure
 *
 * @example Basic parameter processing
 * ```typescript
 * const param: ParameterObject = {
 *   name: 'userId',
 *   in: 'path',
 *   required: true,
 *   schema: { type: 'string' }
 * };
 * const result = processParameter(param, ctx, getZodVarName);
 * // { name: 'userId', type: 'Path', schema: 'z.string()' }
 * ```
 *
 * @example Parameter with metadata
 * ```typescript
 * const param: ParameterObject = {
 *   name: 'age',
 *   in: 'query',
 *   description: 'User age',
 *   example: 25,
 *   schema: {
 *     type: 'integer',
 *     minimum: 0,
 *     maximum: 120,
 *     default: 18
 *   }
 * };
 * const result = processParameter(param, ctx, getZodVarName);
 * // {
 * //   name: 'age',
 * //   type: 'Query',
 * //   schema: 'z.number().int().min(0).max(120)',
 * //   description: 'User age',
 * //   example: 25,
 * //   default: 18,
 * //   constraints: { minimum: 0, maximum: 120 }
 * // }
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#parameter-object|OAS Parameter Object}
 * @see {@link extractParameterMetadata}
 * @public
 */
export function processParameter(
  param: ParameterObject | ReferenceObject,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
): EndpointParameter | undefined {
  const paramItem = resolveParameterRef(param, ctx.doc);

  // Filter: Only process header, query, and path parameters
  if (!isAllowedParameterLocation(paramItem.in)) {
    return undefined;
  }

  // Extract and resolve schema
  let paramSchema = extractParameterSchema(paramItem, ctx.doc);

  // Optionally add parameter description to schema
  applyDescriptionToSchema(paramSchema, paramItem, options);

  paramSchema = resolveSchemaRef(ctx.doc, paramSchema);

  // Generate Zod schema code
  const paramMeta = { isRequired: paramItem.in === 'path' ? true : (paramItem.required ?? false) };
  const paramCode = getZodSchema({
    schema: paramSchema,
    ctx,
    meta: paramMeta,
    options,
  });

  const schema = getZodVarName(
    {
      ...paramCode,
      code: paramCode.code + getZodChain({ schema: paramSchema, meta: paramMeta, options }),
    },
    paramItem.name,
  );

  // Extract metadata from parameter and schema (if schema is resolved)
  const metadata = isSchemaObject(paramSchema)
    ? extractParameterMetadata(paramItem, paramSchema)
    : {};

  return {
    name: getParameterName(paramItem),
    type: parameterLocationToType(paramItem.in),
    schema,
    ...metadata,
  };
}
