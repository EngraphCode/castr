import type { ResponseObject, ReferenceObject, OpenAPIObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';
import type { CodeMeta, ConversionTypeContext } from '../CodeMeta.js';
import type { TemplateContext } from '../template-context.js';
import { getResponseByRef, resolveSchemaRef, assertNotReference } from '../component-access.js';
import { getZodSchema, getZodChain } from '../openApiToZod.js';

/**
 * Type signature for function that generates Zod variable names
 * @public
 */
export type GetZodVarNameFn = (input: CodeMeta, fallbackName?: string) => string;

/**
 * Response entry definition for an endpoint
 * @public
 */
export interface EndpointResponse {
  statusCode: string;
  schema: string;
  description?: string;
}

/**
 * Error response definition for an endpoint
 * @public
 */
export interface EndpointError {
  schema: string;
  status: number | 'default';
  description?: string;
}

/**
 * Result from processing a response
 * @public
 */
export interface ProcessResponseResult {
  responseEntry?: EndpointResponse;
  mainResponse?: string;
  mainResponseDescription?: string;
  error?: EndpointError;
}

/**
 * Void schema constant for responses without content
 * @internal
 */
const voidSchema = 'z.void()';

/**
 * Check if media type is allowed for response content
 * Allows JSON and text media types
 * @internal
 */
function isMediaTypeAllowed(mediaType: string): boolean {
  return mediaType.includes('json') || mediaType.includes('text/');
}

/**
 * Check if status code is a main/success response (2xx)
 * @internal
 */
function isMainResponseStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Check if status code is an error response (4xx-5xx)
 * @internal
 */
function isErrorStatus(status: number): boolean {
  return status >= 400 && status < 600;
}

/**
 * Resolve response reference to ResponseObject
 * @internal
 */
function resolveResponseRef(
  responseObj: ResponseObject | ReferenceObject,
  doc: OpenAPIObject,
): ResponseObject {
  if (!isReferenceObject(responseObj)) {
    return responseObj;
  }

  const resolved = getResponseByRef(doc, responseObj.$ref);
  assertNotReference(resolved, `response ${responseObj.$ref} (use SwaggerParser.bundle() to dereference)`);

  return resolved;
}

/**
 * Extract and generate Zod schema string from response
 * @internal
 */
function generateResponseSchema(
  responseItem: ResponseObject,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
): string | undefined {
  const mediaTypes = Object.keys(responseItem.content ?? {});
  const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);
  const maybeSchema = matchingMediaType ? responseItem.content?.[matchingMediaType]?.schema : null;

  if (!matchingMediaType) {
    return voidSchema;
  }

  if (!maybeSchema) {
    return undefined;
  }

  const schema = getZodSchema({ schema: maybeSchema, ctx, meta: { isRequired: true }, options });
  return (
    (schema.ref ? getZodVarName(schema) : schema.toString()) +
    getZodChain({
      schema: resolveSchemaRef(ctx.doc, maybeSchema),
      meta: schema.meta,
    })
  );
}

/**
 * Categorize response by status code
 * @internal
 */
function categorizeResponse(
  statusCode: string,
  schemaString: string,
  responseItem: ResponseObject,
  options?: TemplateContext['options'],
): Pick<ProcessResponseResult, 'mainResponse' | 'mainResponseDescription' | 'error'> {
  const result: Pick<ProcessResponseResult, 'mainResponse' | 'mainResponseDescription' | 'error'> = {};
  const status = Number(statusCode);

  if (isMainResponseStatus(status)) {
    result.mainResponse = schemaString;
    if (
      responseItem.description &&
      options?.useMainResponseDescriptionAsEndpointDefinitionFallback
    ) {
      result.mainResponseDescription = responseItem.description;
    }
  } else if (statusCode !== 'default' && isErrorStatus(status)) {
    result.error = {
      schema: schemaString,
      status,
      description: responseItem.description,
    };
  }

  return result;
}

/**
 * Process a single response for an endpoint operation
 *
 * Handles response processing per OpenAPI 3.0 spec. Resolves references,
 * extracts schemas from content media types, and categorizes responses by
 * status code: 2xx (main), 4xx-5xx (error), or all (when withAllResponses enabled).
 *
 * @param statusCode - HTTP status code as string
 * @param responseObj - Response object or reference to process
 * @param ctx - Conversion context with OpenAPI document
 * @param getZodVarName - Function to generate Zod variable names
 * @param options - Template context options
 * @returns Object with optional responseEntry, mainResponse, error
 * @throws {Error} If response reference is nested
 *
 * @example
 * ```typescript
 * const response = {
 *   description: 'User found',
 *   content: { 'application/json': { schema: { type: 'object', ... } } }
 * };
 * const result = processResponse('200', response, ctx, getZodVarName);
 * // { mainResponse: 'z.object(...)', mainResponseDescription: 'User found' }
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#response-object|OAS Response Object}
 * @public
 */
export function processResponse(
  statusCode: string,
  responseObj: ResponseObject | ReferenceObject,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
): ProcessResponseResult {
  const responseItem = resolveResponseRef(responseObj, ctx.doc);
  const schemaString = generateResponseSchema(responseItem, ctx, getZodVarName, options);

  const result: ProcessResponseResult = {};

  // Include in all responses list if enabled
  if (options?.withAllResponses) {
    result.responseEntry = {
      statusCode,
      schema: schemaString ?? voidSchema,
      description: responseItem.description,
    };
  }

  // Categorize by status code
  if (schemaString) {
    Object.assign(result, categorizeResponse(statusCode, schemaString, responseItem, options));
  }

  return result;
}
