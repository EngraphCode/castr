/**
 * Processes request body for an endpoint operation
 *
 * Extracts and validates request body schema from OpenAPI operation object,
 * determines the request format (JSON, form-data, etc.), and generates
 * the corresponding Zod schema.
 *
 * @module endpoint-operation/process-request-body
 */

import type {
  OperationObject,
  RequestBodyObject,
} from 'openapi3-ts/oas30';
import { match, P } from 'ts-pattern';

import type { CodeMeta, ConversionTypeContext } from '../CodeMeta.js';
import { getZodChain, getZodSchema } from '../openApiToZod.js';
import type { TemplateContext } from '../template-context.js';
import { isReferenceObject } from '../openapi-type-guards.js';
import { getRequestBodyByRef, resolveSchemaRef } from '../component-access.js';

/**
 * Function type for getting Zod variable names
 */
export type GetZodVarNameFn = (input: CodeMeta, fallbackName?: string) => string;

/**
 * Represents a processed endpoint parameter
 */
export type EndpointParameter = {
  name: string;
  type: 'Body' | 'Header' | 'Query' | 'Path';
  description?: string;
  schema: string;
};

/**
 * Checks if a media type is allowed for request parameters
 *
 * @param mediaType - Media type string (e.g., "application/json")
 * @returns True if the media type is supported
 *
 * @internal
 */
function isAllowedParamMediaTypes(mediaType: string): boolean {
  return (
    mediaType === '*/*' ||
    mediaType.includes('json') ||
    mediaType.includes('x-www-form-urlencoded') ||
    mediaType.includes('form-data') ||
    mediaType.includes('octet-stream') ||
    mediaType.includes('text/')
  );
}

/**
 * Processes request body for an endpoint
 *
 * Extracts the request body schema from an OpenAPI operation,
 * resolves any $refs, determines the request format, and generates
 * the corresponding Zod validation schema.
 *
 * @param operation - OpenAPI operation object
 * @param ctx - Conversion context with document and schema registry
 * @param operationName - Name of the operation (for schema naming)
 * @param getZodVarName - Function to generate Zod variable names
 * @param options - Optional template context options
 * @returns Object with parameter and request format, or undefined if no body
 *
 * @throws {Error} When nested $ref is found (spec not properly dereferenced)
 *
 * @example
 * ```typescript
 * const result = processRequestBody(
 *   operation,
 *   ctx,
 *   'createUser',
 *   getZodVarName,
 *   options
 * );
 * // Returns: {
 * //   parameter: { name: 'body', type: 'Body', schema: 'z.object(...)' },
 * //   requestFormat: 'json'
 * // }
 * ```
 *
 * @public
 */
export function processRequestBody(
  operation: OperationObject,
  ctx: ConversionTypeContext,
  operationName: string,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
):
  | {
      parameter: EndpointParameter;
      requestFormat: 'json' | 'binary' | 'form-url' | 'form-data' | 'text';
    }
  | undefined {
  if (!operation.requestBody) {
    return undefined;
  }

  let requestBody: RequestBodyObject;
  if (isReferenceObject(operation.requestBody)) {
    const resolved = getRequestBodyByRef(ctx.doc, operation.requestBody.$ref);
    if (isReferenceObject(resolved)) {
      throw new Error(
        `Nested $ref in requestBody: ${operation.requestBody.$ref}. Use SwaggerParser.bundle() to dereference.`,
      );
    }

    requestBody = resolved;
  } else {
    requestBody = operation.requestBody;
  }

  const mediaTypes = Object.keys(requestBody.content ?? {});
  const matchingMediaType = mediaTypes.find(isAllowedParamMediaTypes);
  const bodySchema = matchingMediaType && requestBody.content?.[matchingMediaType]?.schema;

  if (!bodySchema) {
    return undefined;
  }

  const requestFormat = match(matchingMediaType)
    .with('application/octet-stream', () => 'binary' as const)
    .with('application/x-www-form-urlencoded', () => 'form-url' as const)
    .with('multipart/form-data', () => 'form-data' as const)
    .with(P.string.includes('json'), () => 'json' as const)
    .otherwise(() => 'text' as const);

  const bodyCode = getZodSchema({
    schema: bodySchema,
    ctx,
    meta: { isRequired: requestBody.required ?? true },
    options,
  });

  const schema =
    getZodVarName(bodyCode, operationName + '_Body') +
    getZodChain({
      schema: resolveSchemaRef(ctx.doc, bodySchema),
      meta: bodyCode.meta,
    });

  return {
    parameter: {
      name: 'body',
      type: 'Body',
      description: requestBody.description ?? '',
      schema,
    },
    requestFormat,
  };
}
