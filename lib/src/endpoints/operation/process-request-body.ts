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
  OpenAPIObject,
  SchemaObject,
  ReferenceObject,
} from 'openapi3-ts/oas30';
import { match, P } from 'ts-pattern';

import type { CodeMeta, ConversionTypeContext } from '../../shared/code-meta.js';
import { getZodChain, getZodSchema } from '../../conversion/zod/index.js';
import type { TemplateContext } from '../../context/template-context.js';
import { isReferenceObject } from '../../validation/type-guards.js';
import {
  getRequestBodyByRef,
  resolveSchemaRef,
  assertNotReference,
} from '../../shared/component-access.js';

/**
 * Function type for getting Zod variable names
 */
export type GetZodVarNameFn = (input: CodeMeta, fallbackName?: string) => string;

/**
 * Represents a processed endpoint parameter
 */
export interface EndpointParameter {
  name: string;
  type: 'Body' | 'Header' | 'Query' | 'Path';
  description?: string;
  schema: string;
}

/**
 * Checks if a media type is allowed for request parameters
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
 * Resolve request body reference to RequestBodyObject
 * @internal
 */
function resolveRequestBodyRef(operation: OperationObject, doc: OpenAPIObject): RequestBodyObject {
  const requestBodyRef = operation.requestBody;
  if (!requestBodyRef) {
    throw new Error('Request body is undefined');
  }

  if (!isReferenceObject(requestBodyRef)) {
    return requestBodyRef;
  }

  const resolved = getRequestBodyByRef(doc, requestBodyRef.$ref);
  assertNotReference(
    resolved,
    `requestBody ${requestBodyRef.$ref} (use SwaggerParser.bundle() to dereference)`,
  );

  return resolved;
}

/**
 * Extract schema from request body content by media type
 * @internal
 */
function extractRequestBodySchema(
  requestBody: RequestBodyObject,
): { schema: SchemaObject | ReferenceObject; mediaType: string } | null {
  const mediaTypes = Object.keys(requestBody.content ?? {});
  const matchingMediaType = mediaTypes.find(isAllowedParamMediaTypes);
  const bodySchema = matchingMediaType && requestBody.content?.[matchingMediaType]?.schema;

  if (!bodySchema) {
    return null;
  }

  return { schema: bodySchema, mediaType: matchingMediaType };
}

/**
 * Determine request format from media type
 * @internal
 */
function determineRequestFormat(
  mediaType: string,
): 'json' | 'binary' | 'form-url' | 'form-data' | 'text' {
  return match(mediaType)
    .with('application/octet-stream', () => 'binary' as const)
    .with('application/x-www-form-urlencoded', () => 'form-url' as const)
    .with('multipart/form-data', () => 'form-data' as const)
    .with(P.string.includes('json'), () => 'json' as const)
    .otherwise(() => 'text' as const);
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
 * @throws {Error} When nested $ref is found (spec not properly dereferenced)
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

  const requestBody = resolveRequestBodyRef(operation, ctx.doc);
  const extracted = extractRequestBodySchema(requestBody);
  if (!extracted) {
    return undefined;
  }

  const { schema: bodySchema, mediaType } = extracted;
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
    requestFormat: determineRequestFormat(mediaType),
  };
}
