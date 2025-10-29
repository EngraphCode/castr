import type { ParameterObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject, isSchemaObject } from 'openapi3-ts/oas30';
import { match } from 'ts-pattern';
import type { CodeMeta, ConversionTypeContext } from '../CodeMeta.js';
import type { TemplateContext } from '../template-context.js';
import { getParameterByRef, resolveSchemaRef } from '../component-access.js';
import { getZodSchema, getZodChain } from '../openApiToZod.js';
import { pathParamToVariableName } from '../utils.js';

/**
 * Type signature for function that generates Zod variable names
 * @public
 */
export type GetZodVarNameFn = (input: CodeMeta, fallbackName?: string) => string;

/**
 * Parameter definition for an endpoint
 * @public
 */
export interface EndpointParameter {
  name: string;
  type: 'Header' | 'Query' | 'Path';
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
  return (allowedPathInValues as readonly string[]).includes(location);
}

/**
 * Check if media type is allowed for parameters
 * Supports: wildcard (*\/*), JSON, form data, octet-stream
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
 * Process a single parameter for an endpoint operation
 *
 * This function handles all parameter types (path, query, header) according to
 * OpenAPI 3.0 spec. It resolves references, extracts schemas from either the
 * `schema` or `content` property, and generates corresponding Zod validation code.
 *
 * **Parameter Schema Resolution:**
 * - If `content` property exists: extracts schema from supported media types
 * - If `schema` property exists: uses schema directly
 * - Per OAS 3.0 SchemaXORContent constraint, exactly one must be present
 *
 * **Required vs Optional:**
 * - Path parameters are always required (per spec)
 * - Query/header parameters use the `required` field (defaults to false)
 *
 * @param param - The parameter object or reference to process
 * @param ctx - Conversion context with OpenAPI document
 * @param getZodVarName - Function to generate Zod variable names
 * @param options - Template context options (e.g., withDescription)
 * @returns Parameter definition with name, type, and Zod schema, or undefined if skipped
 * @throws {Error} If parameter has invalid structure or unsupported media type
 *
 * @example Basic usage
 * ```typescript
 * const param: ParameterObject = {
 *   name: 'userId',
 *   in: 'path',
 *   required: true,
 *   schema: { type: 'string' }
 * };
 *
 * const result = processParameter(param, ctx, getZodVarName);
 * // result = {
 * //   name: 'userId',
 * //   type: 'Path',
 * //   schema: 'z.string()'
 * // }
 * ```
 *
 * @example With content property
 * ```typescript
 * const param: ParameterObject = {
 *   name: 'filter',
 *   in: 'query',
 *   content: {
 *     'application/json': {
 *       schema: { type: 'object', properties: { ... } }
 *     }
 *   }
 * };
 *
 * const result = processParameter(param, ctx, getZodVarName);
 * // Extracts schema from content media type
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#parameter-object|OpenAPI Parameter Object}
 * @see {@link https://spec.openapis.org/oas/v3.0.3#media-type-object|OpenAPI Media Type Object}
 *
 * @public
 * @since 2.0.0
 */
export function processParameter(
  param: ParameterObject | ReferenceObject,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
): EndpointParameter | undefined {
  // Resolve parameter reference if needed
  let paramItem: ParameterObject;
  if (isReferenceObject(param)) {
    const resolved = getParameterByRef(ctx.doc, param.$ref);
    if (isReferenceObject(resolved)) {
      throw new Error(
        `Nested $ref in parameter: ${param.$ref}. Use SwaggerParser.bundle() to dereference.`,
      );
    }
    paramItem = resolved;
  } else {
    paramItem = param;
  }

  // Filter: Only process header, query, and path parameters
  if (!isAllowedParameterLocation(paramItem.in)) {
    return undefined;
  }

  let paramSchema: SchemaObject | ReferenceObject | undefined;

  // Extract schema from either 'content' or 'schema' property
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

    // Per OAS 3.0 spec: MediaType.schema must be Schema | Reference
    // $ref should be inside the schema property, not at the MediaType level
    if (!mediaTypeObject.schema) {
      throw new Error(
        `Invalid OpenAPI specification: mediaTypeObject for parameter "${paramItem.name}" ` +
          `must have a 'schema' property. Found ${Object.keys(mediaTypeObject).join(', ')}. ` +
          `See: https://spec.openapis.org/oas/v3.0.3#media-type-object`,
      );
    }

    paramSchema = mediaTypeObject.schema;
  } else if (paramItem.schema) {
    paramSchema = resolveSchemaRef(ctx.doc, paramItem.schema);
  } else {
    // OpenAPI spec requires parameters to have either 'schema' or 'content'
    // Per SchemaXORContent constraint in OAS 3.0+ spec
    throw new Error(
      `Invalid OpenAPI specification: Parameter "${paramItem.name}" (in: ${paramItem.in}) must have either 'schema' or 'content' property. ` +
        `See: https://spec.openapis.org/oas/v3.0.3#parameter-object`,
    );
  }

  // Ensure schema was successfully resolved from references
  if (!paramSchema) {
    throw new Error(
      `Invalid OpenAPI specification: Could not resolve schema for parameter "${paramItem.name}" (in: ${paramItem.in}). ` +
        `This may indicate a missing or invalid $ref target.`,
    );
  }

  // Optionally add parameter description to schema
  if (options?.withDescription && isSchemaObject(paramSchema)) {
    paramSchema.description = (paramItem.description ?? '').trim();
  }

  // Resolve ref if needed, fallback to default (unknown) value if needed
  paramSchema = resolveSchemaRef(ctx.doc, paramSchema);

  // Generate Zod schema code
  const paramCode = getZodSchema({
    schema: paramSchema,
    ctx,
    meta: { isRequired: paramItem.in === 'path' ? true : (paramItem.required ?? false) },
    options,
  });

  // Convert parameter name to variable name (path params get special treatment)
  const name = match(paramItem.in)
    .with('path', () => pathParamToVariableName(paramItem.name))
    .otherwise(() => paramItem.name);

  // Convert parameter location to type enum
  // Safe: We've already filtered for allowed values (header, query, path) above
  const type = match<string, 'Header' | 'Query' | 'Path'>(paramItem.in)
    .with('header', () => 'Header')
    .with('query', () => 'Query')
    .with('path', () => 'Path')
    .otherwise(() => 'Query'); // Fallback (unreachable due to filter above)

  // Generate final schema with chains (e.g., .optional(), .describe())
  const schema = getZodVarName(
    paramCode.assign(
      paramCode.toString() + getZodChain({ schema: paramSchema, meta: paramCode.meta, options }),
    ),
    paramItem.name,
  );

  return { name, type, schema };
}
