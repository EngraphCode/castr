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
import type { CastrResponse, IRMediaType, IRResponseHeader } from '../../ir/schema.js';
import type { IRBuildContext } from './builder.types.js';
import { isReferenceObject } from '../../../validation/type-guards.js';
import { buildCastrSchema } from './builder.core.js';
import {
  assertNoCircularComponentRef,
  parseComponentNameForType,
} from './builder.component-ref-resolution.js';

const OPENAPI_COMPONENT_TYPE_RESPONSES = 'responses' as const;

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
 * - Component refs are resolved eagerly and fail fast on invalid syntax or missing targets
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
    return buildConcreteResponse(
      statusCode,
      resolveResponse(responseObj, context, statusCode),
      context,
    );
  }

  return buildConcreteResponse(statusCode, responseObj, context);
}

/**
 * Resolve a response reference.
 * @param ref - Reference object
 * @param context - Build context containing the full document
 * @param statusCode - Response status code for contextual error messages
 * @returns Resolved response object
 * @throws Error when ref syntax is invalid, points to non-response components,
 *         cannot be resolved, or forms a circular reference
 * @internal
 */
function resolveResponse(
  ref: ReferenceObject,
  context: IRBuildContext,
  statusCode: string,
  seenRefs = new Set<string>(),
): ResponseObject {
  const location = context.path.join('/');
  assertNoCircularComponentRef(ref.$ref, location, seenRefs, 'response');

  const responseName = parseComponentNameForType(
    ref.$ref,
    OPENAPI_COMPONENT_TYPE_RESPONSES,
    location,
    'response',
    '#/components/responses/{name}',
  );
  const response = getReferencedResponse(responseName, ref, statusCode, context);

  if (isReferenceObject(response)) {
    // Recursive resolution with circular detection
    return resolveResponse(response, context, statusCode, seenRefs);
  }

  return response;
}

function getReferencedResponse(
  responseName: string,
  ref: ReferenceObject,
  statusCode: string,
  context: IRBuildContext,
): ResponseObject | ReferenceObject {
  const responses = context.doc.components?.responses;
  if (!responses) {
    return throwUnresolvedResponseRefError(ref, statusCode, context);
  }

  const response = responses[responseName];
  if (!response) {
    return throwUnresolvedResponseRefError(ref, statusCode, context);
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
): Record<string, IRResponseHeader> {
  const result: Record<string, IRResponseHeader> = {};

  for (const [headerName, headerObj] of Object.entries(headers)) {
    const irHeader = buildResponseHeader(headerName, headerObj, context);
    if (irHeader) {
      result[headerName] = irHeader;
    }
  }

  return result;
}

/**
 * Build IRResponseHeader for a single response header.
 * Extracts all HeaderObject fields including description, required, deprecated.
 * @internal
 */
function buildResponseHeader(
  headerName: string,
  headerObj: HeaderObject | ReferenceObject,
  context: IRBuildContext,
): IRResponseHeader | undefined {
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

  const irHeader: IRResponseHeader = {
    schema: buildCastrSchema(headerObj.schema, headerContext),
  };

  // Preserve all HeaderObject fields that were previously lost
  if (headerObj.description !== undefined) {
    irHeader.description = headerObj.description;
  }
  if (headerObj.required !== undefined) {
    irHeader.required = headerObj.required;
  }
  if (headerObj.deprecated !== undefined) {
    irHeader.deprecated = headerObj.deprecated;
  }
  if (headerObj.example !== undefined) {
    irHeader.example = headerObj.example;
  }
  if (headerObj.examples !== undefined) {
    irHeader.examples = headerObj.examples;
  }

  return irHeader;
}
