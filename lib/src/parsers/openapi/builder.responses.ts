/**
 * IR Builder - Response Processing
 *
 * Handles conversion of OpenAPI response objects to IR response structures.
 *
 * @module
 */

import type {
  ResponsesObject,
  ResponseObject,
  ReferenceObject,
  HeaderObject,
  MediaTypeObject,
} from 'openapi3-ts/oas31';
import type { CastrResponse, IRMediaType, CastrSchema } from '../../ir/schema.js';
import type { IRBuildContext } from './builder.types.js';
import { isReferenceObject } from '../../validation/type-guards.js';
import { buildCastrSchema } from './builder.core.js';

/**
 * Type guard to check if a value is a ResponseObject or ReferenceObject.
 * @internal
 */
function isResponseOrReference(value: unknown): value is ResponseObject | ReferenceObject {
  return value !== null && typeof value === 'object';
}

/**
 * Build IR responses from OpenAPI responses object.
 *
 * Converts response definitions for each status code into CastrResponse structures
 * with schema and content type information. Handles both concrete responses
 * and reference objects.
 *
 * @param responses - OpenAPI responses object (may be undefined)
 * @param context - Build context for schema resolution
 * @returns Array of IR responses
 *
 * @remarks
 * - Reference objects return minimal response structures with only status code
 * - Each content type is processed independently
 * - Response headers are included when present
 *
 * @internal
 */
export function buildCastrResponses(
  responses: ResponsesObject | undefined,
  context: IRBuildContext,
): CastrResponse[] {
  if (!responses) {
    return [];
  }

  const irResponses: CastrResponse[] = [];

  for (const [statusCode, responseValue] of Object.entries(responses)) {
    // OpenAPI library types values as 'any' due to index signature
    // Type guard narrows to ResponseObject | ReferenceObject
    if (isResponseOrReference(responseValue)) {
      const irResponse = buildSingleResponse(statusCode, responseValue, context);
      irResponses.push(irResponse);
    }
  }

  return irResponses;
}

/**
 * Build a single IR response (handles references and concrete responses).
 * @internal
 */
export function buildSingleResponse(
  statusCode: string,
  responseObj: ResponseObject | ReferenceObject,
  context: IRBuildContext,
): CastrResponse {
  // Handle $ref responses - attempt to resolve
  if (isReferenceObject(responseObj)) {
    const resolved = resolveResponse(responseObj, context);
    if (resolved) {
      return buildConcreteResponse(statusCode, resolved, context);
    }
    return throwUnresolvedResponseRefError(responseObj, statusCode, context);
  }

  return buildConcreteResponse(statusCode, responseObj, context);
}

/**
 * Resolve a response reference.
 * @param ref - Reference object
 * @param context - Build context containing the full document
 * @returns Resolved response object or undefined if not found
 * @internal
 */
function resolveResponse(
  ref: ReferenceObject,
  context: IRBuildContext,
): ResponseObject | undefined {
  const refPath = ref.$ref;
  if (!refPath.startsWith('#/components/responses/')) {
    return undefined;
  }

  const responseName = refPath.split('/').pop();
  if (!responseName || !context.doc.components?.responses) {
    return undefined;
  }

  const response = context.doc.components.responses[responseName];
  if (isReferenceObject(response)) {
    // Recursive resolution
    return resolveResponse(response, context);
  }

  return response;
}

/**
 * Throw error for unresolved response reference.
 * Enforces strictness: invalid specs must fail fast with helpful errors.
 * @internal
 */
function throwUnresolvedResponseRefError(
  ref: ReferenceObject,
  statusCode: string,
  context: IRBuildContext,
): never {
  const location = context.path.join('/');
  throw new Error(
    `Unresolvable response reference "${ref.$ref}" for status ${statusCode} at ${location}. ` +
      'The referenced response does not exist in components.responses.',
  );
}

/**
 * Build IR response from concrete OpenAPI response (processes content and headers).
 * @internal
 */
function buildConcreteResponse(
  statusCode: string,
  response: ResponseObject,
  context: IRBuildContext,
): CastrResponse {
  const irResponse: CastrResponse = {
    statusCode,
  };

  if (response.description) {
    irResponse.description = response.description;
  }

  if (response.content) {
    irResponse.content = buildResponseContent(statusCode, response.content, context);
  }

  if (response.headers) {
    irResponse.headers = buildResponseHeaders(response.headers, context);
  }

  if (response.links) {
    irResponse.links = response.links;
  }

  return irResponse;
}

/**
 * Build content type mappings for response.
 * @internal
 */
function buildResponseContent(
  statusCode: string,
  content: Record<string, MediaTypeObject>,
  context: IRBuildContext,
): Record<string, IRMediaType> {
  const result: Record<string, IRMediaType> = {};

  for (const [mediaType, mediaTypeObj] of Object.entries(content)) {
    const mediaContent = buildResponseMediaType(statusCode, mediaType, mediaTypeObj, context);
    if (mediaContent) {
      result[mediaType] = mediaContent;
    }
  }

  return result;
}

/**
 * Build IR media type object for response content.
 * @internal
 */
function buildResponseMediaType(
  statusCode: string,
  mediaType: string,
  mediaTypeObj: MediaTypeObject,
  context: IRBuildContext,
): IRMediaType | undefined {
  if (!mediaTypeObj.schema) {
    return undefined;
  }

  const responseContext: IRBuildContext = {
    ...context,
    path: [...context.path, 'responses', statusCode, mediaType],
  };

  const irMediaType: IRMediaType = {
    schema: buildCastrSchema(mediaTypeObj.schema, responseContext),
  };

  if (mediaTypeObj.example !== undefined) {
    irMediaType.example = mediaTypeObj.example;
  }

  if (mediaTypeObj.examples) {
    irMediaType.examples = mediaTypeObj.examples;
  }

  return irMediaType;
}

/**
 * Build response headers mapping.
 * @internal
 */
function buildResponseHeaders(
  headers: Record<string, HeaderObject | ReferenceObject>,
  context: IRBuildContext,
): Record<string, CastrSchema> {
  const result: Record<string, CastrSchema> = {};

  for (const [headerName, headerObj] of Object.entries(headers)) {
    const headerSchema = buildResponseHeader(headerName, headerObj, context);
    if (headerSchema) {
      result[headerName] = headerSchema;
    }
  }

  return result;
}

/**
 * Build IR schema for a single response header.
 * @internal
 */
function buildResponseHeader(
  headerName: string,
  headerObj: HeaderObject | ReferenceObject,
  context: IRBuildContext,
): CastrSchema | undefined {
  if (isReferenceObject(headerObj)) {
    return undefined;
  }

  if (!headerObj.schema) {
    return undefined;
  }

  const headerContext: IRBuildContext = {
    ...context,
    path: [...context.path, 'headers', headerName],
  };

  return buildCastrSchema(headerObj.schema, headerContext);
}
