import type {
  ParameterObject,
  ReferenceObject,
  SchemaObject,
  OpenAPIObject,
} from 'openapi3-ts/oas30';
import { isReferenceObject, isSchemaObject } from 'openapi3-ts/oas30';
import { match } from 'ts-pattern';
import type { CodeMeta, ConversionTypeContext } from '../CodeMeta.js';
import type { TemplateContext } from '../template-context.js';
import { getParameterByRef, resolveSchemaRef, assertNotReference } from '../component-access.js';
import { getZodSchema, getZodChain } from '../openApiToZod.js';
import { pathParamToVariableName } from '../utils.js';

/**
 * Type signature for function that generates Zod variable names
 * @public
 */
export type GetZodVarNameFn = (input: CodeMeta, fallbackName?: string) => string;

/**
 * Parameter type enum
 * @public
 */
export type ParameterType = 'Header' | 'Query' | 'Path';

/**
 * Parameter definition for an endpoint
 * @public
 */
export interface EndpointParameter {
  name: string;
  type: ParameterType;
  schema: string;
}

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
  assertNotReference(resolved, `parameter ${param.$ref} (use SwaggerParser.bundle() to dereference)`);

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
 * Process a single parameter for an endpoint operation
 *
 * Handles all parameter types (path, query, header) per OpenAPI 3.0 spec.
 * Resolves references, extracts schemas from `schema` or `content` property,
 * and generates Zod validation code.
 *
 * @param param - Parameter object or reference to process
 * @param ctx - Conversion context with OpenAPI document
 * @param getZodVarName - Function to generate Zod variable names
 * @param options - Template context options
 * @returns Parameter definition or undefined if skipped
 * @throws {Error} If parameter has invalid structure
 *
 * @example
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
 * @see {@link https://spec.openapis.org/oas/v3.0.3#parameter-object|OAS Parameter Object}
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
  if (!isAllowedParameterLocation(paramItem.in)) return undefined;

  // Extract and resolve schema
  let paramSchema = extractParameterSchema(paramItem, ctx.doc);

  // Optionally add parameter description to schema
  if (options?.withDescription && isSchemaObject(paramSchema)) {
    paramSchema.description = (paramItem.description ?? '').trim();
  }

  paramSchema = resolveSchemaRef(ctx.doc, paramSchema);

  // Generate Zod schema code
  const paramCode = getZodSchema({
    schema: paramSchema,
    ctx,
    meta: { isRequired: paramItem.in === 'path' ? true : (paramItem.required ?? false) },
    options,
  });

  const schema = getZodVarName(
    paramCode.assign(
      paramCode.toString() + getZodChain({ schema: paramSchema, meta: paramCode.meta, options }),
    ),
    paramItem.name,
  );

  // Convert parameter name (path params get special treatment)
  const name = match(paramItem.in)
    .with('path', () => pathParamToVariableName(paramItem.name))
    .otherwise(() => paramItem.name);

  return { name, type: parameterLocationToType(paramItem.in), schema };
}
