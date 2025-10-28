import type { ResponseObject } from 'openapi3-ts/oas30';
import type { CodeMeta, ConversionTypeContext } from '../CodeMeta.js';
import type { TemplateContext } from '../template-context.js';
import type { DefaultStatusBehavior } from '../template-context.types.js';
import { resolveSchemaRef } from '../component-access.js';
import { getZodSchema, getZodChain } from '../openApiToZod.js';

/**
 * Type signature for function that generates Zod variable names
 * @public
 */
export type GetZodVarNameFn = (input: CodeMeta, fallbackName?: string) => string;

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
 * Result from processing a default response
 * @public
 */
export interface ProcessDefaultResponseResult {
  mainResponse?: string;
  error?: EndpointError;
  shouldIgnoreFallback?: boolean;
  shouldIgnoreGeneric?: boolean;
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
 * Process the default response for an endpoint operation
 *
 * The "default" response is a special OpenAPI construct that covers any status
 * code not explicitly defined. Its handling depends on the `defaultStatusBehavior`
 * configuration and whether a main response (2xx) is already defined.
 *
 * **Behavior Modes:**
 *
 * 1. **auto-correct** (legacy, backwards-compatible):
 *    - If main response exists: treat default as error
 *    - If no main response: treat default as main (success)
 *    - Automatically corrects potentially ambiguous specs
 *
 * 2. **spec-compliant** (strict, recommended):
 *    - If main response exists: ignore default (shouldIgnoreFallback)
 *    - If no main response: ignore default (shouldIgnoreGeneric)
 *    - Requires explicit status codes, prevents ambiguity
 *
 * **Why This Complexity?**
 *
 * The OpenAPI spec allows "default" to represent any status code, making it
 * inherently ambiguous. Some APIs use it as a catch-all error, others as a
 * success response. This function handles both interpretations.
 *
 * @param defaultResponse - The default response object
 * @param ctx - Conversion context with OpenAPI document
 * @param getZodVarName - Function to generate Zod variable names
 * @param hasMainResponse - Whether a 2xx response is already defined
 * @param defaultStatusBehavior - How to handle default responses
 * @param options - Template context options
 * @returns Object indicating how to handle the default response
 *
 * @example Auto-correct with main response (default as error)
 * ```typescript
 * const result = processDefaultResponse(
 *   defaultResponse,
 *   ctx,
 *   getZodVarName,
 *   true, // hasMainResponse
 *   'auto-correct'
 * );
 * // result = {
 * //   error: {
 * //     status: 'default',
 * //     schema: '...',
 * //     description: '...'
 * //   }
 * // }
 * ```
 *
 * @example Auto-correct without main response (default as success)
 * ```typescript
 * const result = processDefaultResponse(
 *   defaultResponse,
 *   ctx,
 *   getZodVarName,
 *   false, // hasMainResponse
 *   'auto-correct'
 * );
 * // result = {
 * //   mainResponse: '...'
 * // }
 * ```
 *
 * @example Spec-compliant mode (ignore default)
 * ```typescript
 * const result = processDefaultResponse(
 *   defaultResponse,
 *   ctx,
 *   getZodVarName,
 *   true, // hasMainResponse
 *   'spec-compliant'
 * );
 * // result = {
 * //   shouldIgnoreFallback: true
 * // }
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#responses-object|OpenAPI Responses Object}
 *
 * @public
 * @since 2.0.0
 */
export function processDefaultResponse(
  defaultResponse: ResponseObject,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  hasMainResponse: boolean,
  defaultStatusBehavior: DefaultStatusBehavior,
  options?: TemplateContext['options'],
): ProcessDefaultResponseResult {
  // Extract schema from supported media types
  const mediaTypes = Object.keys(defaultResponse.content ?? {});
  const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);
  const maybeSchema = matchingMediaType && defaultResponse.content?.[matchingMediaType]?.schema;

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

  // No schema to process
  if (!schemaString) {
    return {};
  }

  // Auto-correct mode: try to infer intent from context
  if (defaultStatusBehavior === 'auto-correct') {
    if (hasMainResponse) {
      // Assume default is for errors when success is already defined
      return {
        error: {
          schema: schemaString,
          status: 'default',
          description: defaultResponse.description,
        },
      };
    }
    // Assume default is the success response when no 2xx is defined
    return { mainResponse: schemaString };
  }

  // Spec-compliant mode: ignore ambiguous defaults
  if (hasMainResponse) {
    return { shouldIgnoreFallback: true };
  }
  return { shouldIgnoreGeneric: true };
}

