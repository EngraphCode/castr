import type { ResponseObject, ReferenceObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';
import type { CodeMeta, ConversionTypeContext } from '../CodeMeta.js';
import type { TemplateContext } from '../template-context.js';
import { getResponseByRef, resolveSchemaRef } from '../component-access.js';
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
 * Process a single response for an endpoint operation
 *
 * This function handles response processing according to OpenAPI 3.0 spec.
 * It resolves references, extracts schemas from content media types, and
 * categorizes responses as:
 * - **Main response** (2xx status codes)
 * - **Error response** (4xx-5xx status codes)
 * - **Response entry** (all responses when `withAllResponses` is enabled)
 *
 * **Media Type Support:**
 * - Supports JSON and text/* media types
 * - Uses `z.void()` for responses without content
 *
 * **Status Code Handling:**
 * - 2xx: Main/success response
 * - 4xx-5xx: Error response
 * - default: Special case (see processDefaultResponse)
 *
 * @param statusCode - HTTP status code as string (e.g., "200", "404", "default")
 * @param responseObj - The response object or reference to process
 * @param ctx - Conversion context with OpenAPI document
 * @param getZodVarName - Function to generate Zod variable names
 * @param options - Template context options (e.g., withAllResponses)
 * @returns Object with optional responseEntry, mainResponse, error
 * @throws {Error} If response reference is nested (not dereferenced)
 *
 * @example Success response
 * ```typescript
 * const response: ResponseObject = {
 *   description: 'User found',
 *   content: {
 *     'application/json': {
 *       schema: { type: 'object', properties: { id: { type: 'string' } } }
 *     }
 *   }
 * };
 *
 * const result = processResponse('200', response, ctx, getZodVarName);
 * // result = {
 * //   mainResponse: 'z.object({ id: z.string() })',
 * //   mainResponseDescription: 'User found'
 * // }
 * ```
 *
 * @example Error response
 * ```typescript
 * const response: ResponseObject = {
 *   description: 'Not found',
 *   content: {
 *     'application/json': {
 *       schema: { type: 'object', properties: { error: { type: 'string' } } }
 *     }
 *   }
 * };
 *
 * const result = processResponse('404', response, ctx, getZodVarName);
 * // result = {
 * //   error: {
 * //     status: 404,
 * //     schema: 'z.object({ error: z.string() })',
 * //     description: 'Not found'
 * //   }
 * // }
 * ```
 *
 * @example Response without content
 * ```typescript
 * const response: ResponseObject = {
 *   description: 'No content'
 * };
 *
 * const result = processResponse('204', response, ctx, getZodVarName);
 * // result = {
 * //   mainResponse: 'z.void()'
 * // }
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#response-object|OpenAPI Response Object}
 *
 * @public
 * @since 2.0.0
 */
export function processResponse(
  statusCode: string,
  responseObj: ResponseObject | ReferenceObject,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
): ProcessResponseResult {
  // Resolve response reference if needed
  let responseItem: ResponseObject;
  if (isReferenceObject(responseObj)) {
    const resolved = getResponseByRef(ctx.doc, responseObj.$ref);
    if (isReferenceObject(resolved)) {
      throw new Error(
        `Nested $ref in response: ${responseObj.$ref}. Use SwaggerParser.bundle() to dereference.`,
      );
    }
    responseItem = resolved;
  } else {
    responseItem = responseObj;
  }

  // Extract schema from supported media types
  const mediaTypes = Object.keys(responseItem.content ?? {});
  const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);
  const maybeSchema = matchingMediaType ? responseItem.content?.[matchingMediaType]?.schema : null;

  let schemaString = matchingMediaType ? undefined : voidSchema;
  let schema: CodeMeta | undefined;

  if (maybeSchema) {
    schema = getZodSchema({ schema: maybeSchema, ctx, meta: { isRequired: true }, options });
    schemaString =
      (schema.ref ? getZodVarName(schema) : schema.toString()) +
      getZodChain({
        schema: resolveSchemaRef(ctx.doc, maybeSchema),
        meta: schema.meta,
      });
  }

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
  }

  return result;
}

