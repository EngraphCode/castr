/**
 * IR Builder - Request Body Processing
 *
 * Handles conversion of OpenAPI request body objects to IR request body structures.
 *
 * @module
 */

import type { RequestBodyObject, ReferenceObject, MediaTypeObject } from 'openapi3-ts/oas31';
import type { IRRequestBody, IRMediaType } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';
import { isReferenceObject } from '../validation/type-guards.js';
import { buildIRSchema } from './ir-builder.core.js';

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
 * - Reference objects currently return minimal placeholder structures
 * - Each content type is processed independently with its own schema
 * - Examples are preserved when present
 *
 * @internal
 */
export function buildIRRequestBody(
  requestBody: RequestBodyObject | ReferenceObject,
  context: IRBuildContext,
): IRRequestBody {
  // Handle $ref request bodies (for now, return minimal structure)
  if (isReferenceObject(requestBody)) {
    return createPlaceholderRequestBody();
  }

  return buildConcreteRequestBody(requestBody, context);
}

/**
 * Create placeholder request body for unresolved references.
 *
 * @returns Minimal IR request body structure
 *
 * @internal
 */
function createPlaceholderRequestBody(): IRRequestBody {
  return {
    required: false,
    content: {},
  };
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
    schema: buildIRSchema(mediaTypeObj.schema, mediaContext),
  };

  if (mediaTypeObj.example !== undefined) {
    irMediaType.example = mediaTypeObj.example;
  }

  if (mediaTypeObj.examples) {
    irMediaType.examples = mediaTypeObj.examples;
  }

  return irMediaType;
}
