/**
 * IR Builder - Request Body Processing
 *
 * Handles conversion of OpenAPI request body objects to IR request body structures.
 *
 * @module
 */

import type { RequestBodyObject, ReferenceObject, MediaTypeObject } from 'openapi3-ts/oas31';
import type { IRBuildContext } from '../builder.types.js';
import { isReferenceObject } from '../../../../validation/type-guards.js';
import { buildCastrSchema } from '../builder.core.js';
import {
  assertNoCircularComponentRef,
  parseComponentNameForType,
} from '../components/builder.component-ref-resolution.js';
import type { IRRequestBody, IRMediaType } from '../../../ir/index.js';

const OPENAPI_COMPONENT_TYPE_REQUEST_BODIES = 'requestBodies' as const;

/**
 * Build IR request body from OpenAPI request body object.
 *
 * Converts request body definition into IRRequestBody structure with
 * content type and schema mappings. Handles both concrete request bodies
 * and reference objects.
 *
 * @param requestBody - OpenAPI request body (may be a reference)
 * @param context - Build context for schema resolution
 * @returns IR request body with resolved content types
 *
 * @remarks
 * - Component refs are resolved eagerly and fail fast on invalid syntax or missing targets
 * - Each content type is processed independently with its own schema
 * - Examples are preserved when present
 *
 * @internal
 */
export function buildIRRequestBody(
  requestBody: RequestBodyObject | ReferenceObject,
  context: IRBuildContext,
): IRRequestBody {
  // Handle $ref request bodies - resolve from components/requestBodies
  if (isReferenceObject(requestBody)) {
    return buildConcreteRequestBody(resolveRequestBodyRef(requestBody, context), context);
  }

  return buildConcreteRequestBody(requestBody, context);
}

/**
 * Resolve a requestBody reference from components/requestBodies.
 *
 * @param ref - Reference object pointing to requestBody component
 * @param context - Build context containing the full document
 * @returns Resolved RequestBodyObject
 * @throws Error when ref syntax is invalid, points to non-requestBody components,
 *         cannot be resolved, or forms a circular reference
 *
 * @internal
 */
function resolveRequestBodyRef(
  ref: ReferenceObject,
  context: IRBuildContext,
  seenRefs = new Set<string>(),
): RequestBodyObject {
  const location = context.path.join('/');
  assertNoCircularComponentRef(ref.$ref, location, seenRefs, 'request body');

  const requestBodyName = parseComponentNameForType(
    ref.$ref,
    OPENAPI_COMPONENT_TYPE_REQUEST_BODIES,
    location,
    'request body',
    '#/components/requestBodies/{name}',
  );
  const resolved = getReferencedRequestBody(requestBodyName, ref, context);

  if (isReferenceObject(resolved)) {
    return resolveRequestBodyRef(resolved, context, seenRefs);
  }

  return resolved;
}

function getReferencedRequestBody(
  requestBodyName: string,
  ref: ReferenceObject,
  context: IRBuildContext,
): RequestBodyObject | ReferenceObject {
  const requestBodies = context.doc.components?.requestBodies;
  if (!requestBodies) {
    return throwUnresolvedRequestBodyRefError(ref, context);
  }

  const resolved = requestBodies[requestBodyName];
  if (!resolved) {
    return throwUnresolvedRequestBodyRefError(ref, context);
  }

  return resolved;
}

/**
 * Throw error for unresolved request body reference.
 * Enforces strictness: invalid specs must fail fast with helpful errors.
 *
 * @param ref - The unresolved reference object
 * @param context - Build context for error location
 * @throws Error with descriptive message including reference path and location
 * @internal
 */
function throwUnresolvedRequestBodyRefError(ref: ReferenceObject, context: IRBuildContext): never {
  const location = context.path.join('/');
  throw new Error(
    `Unresolvable request body reference "${ref.$ref}" at ${location}. ` +
      'The referenced request body does not exist in components.requestBodies.',
  );
}

/**
 * Build IR request body from a concrete (non-reference) OpenAPI request body.
 *
 * @param requestBody - OpenAPI request body object
 * @param context - Build context for schema resolution
 * @returns IR request body with resolved content types
 *
 * @internal
 */
function buildConcreteRequestBody(
  requestBody: RequestBodyObject,
  context: IRBuildContext,
): IRRequestBody {
  const content = buildRequestBodyContent(requestBody, context);

  const irRequestBody: IRRequestBody = {
    required: requestBody.required ?? false,
    content,
  };

  if (requestBody.description) {
    irRequestBody.description = requestBody.description;
  }

  return irRequestBody;
}

/**
 * Build content type mappings for request body.
 *
 * @param requestBody - OpenAPI request body object
 * @param context - Build context for schema resolution
 * @returns Record of media types to IR media type objects
 *
 * @internal
 */
function buildRequestBodyContent(
  requestBody: RequestBodyObject,
  context: IRBuildContext,
): Record<string, IRMediaType> {
  const content: Record<string, IRMediaType> = {};

  if (!requestBody.content) {
    return content;
  }

  for (const [mediaType, mediaTypeObj] of Object.entries(requestBody.content)) {
    const mediaContent = buildMediaTypeContent(mediaType, mediaTypeObj, context);
    if (mediaContent) {
      content[mediaType] = mediaContent;
    }
  }

  return content;
}

/**
 * Build IR media type object from OpenAPI media type definition.
 *
 * @param mediaType - Media type string (e.g., 'application/json')
 * @param mediaTypeObj - OpenAPI media type object
 * @param context - Build context for schema resolution
 * @returns IR media type object or undefined if no schema present
 *
 * @internal
 */
function buildMediaTypeContent(
  mediaType: string,
  mediaTypeObj: MediaTypeObject,
  context: IRBuildContext,
): IRMediaType | undefined {
  if (!mediaTypeObj.schema) {
    return undefined;
  }

  const mediaContext: IRBuildContext = {
    ...context,
    path: [...context.path, 'requestBody', mediaType],
  };

  const irMediaType: IRMediaType = {
    schema: buildCastrSchema(mediaTypeObj.schema, mediaContext),
  };

  if (mediaTypeObj.example !== undefined) {
    irMediaType.example = mediaTypeObj.example;
  }

  if (mediaTypeObj.examples) {
    irMediaType.examples = mediaTypeObj.examples;
  }

  // Extract encoding for multipart/form-data requests
  if (mediaTypeObj.encoding) {
    irMediaType.encoding = mediaTypeObj.encoding;
  }

  return irMediaType;
}
