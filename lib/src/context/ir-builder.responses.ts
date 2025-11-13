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
import type { IRResponse, IRMediaType, IRSchema } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';
import { isReferenceObject } from '../validation/type-guards.js';
import { buildIRSchema } from './ir-builder.core.js';

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
 * Converts response definitions for each status code into IRResponse structures
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
export function buildIRResponses(
  responses: ResponsesObject | undefined,
  context: IRBuildContext,
): IRResponse[] {
  if (!responses) {
    return [];
  }

  const irResponses: IRResponse[] = [];

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
function buildSingleResponse(
  statusCode: string,
  responseObj: ResponseObject | ReferenceObject,
  context: IRBuildContext,
): IRResponse {
  // Handle $ref responses (for now, create minimal response)
  if (isReferenceObject(responseObj)) {
    return createPlaceholderResponse(statusCode);
  }

  return buildConcreteResponse(statusCode, responseObj, context);
}

/**
 * Create placeholder response for unresolved references.
 * @internal
 */
function createPlaceholderResponse(statusCode: string): IRResponse {
  return {
    statusCode,
  };
}

/**
 * Build IR response from concrete OpenAPI response (processes content and headers).
 * @internal
 */
function buildConcreteResponse(
  statusCode: string,
  response: ResponseObject,
  context: IRBuildContext,
): IRResponse {
  const irResponse: IRResponse = {
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
    schema: buildIRSchema(mediaTypeObj.schema, responseContext),
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
): Record<string, IRSchema> {
  const result: Record<string, IRSchema> = {};

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
): IRSchema | undefined {
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

  return buildIRSchema(headerObj.schema, headerContext);
}
