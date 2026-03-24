/**
 * OpenAPI request body component writer — converts IRRequestBodyComponent to OpenAPI.
 *
 * Extracted from openapi-writer.components.ts to keep per-file line counts within limits.
 *
 * @module
 */

import type { RequestBodyObject } from 'openapi3-ts/oas31';
import { writeOpenApiSchema } from '../schema/openapi-writer.schema.js';
import type { IRComponent, IRRequestBodyComponent, IRMediaType } from '../../../ir/index.js';

const COMPONENT_TYPE_REQUEST_BODY = 'requestBody';

/**
 * Converts a media type entry to an OpenAPI MediaTypeObject.
 * @internal
 */
function writeMediaType(mediaType: IRMediaType): { schema: ReturnType<typeof writeOpenApiSchema> } {
  return {
    schema: writeOpenApiSchema(mediaType.schema),
  };
}

/**
 * Narrows an IRComponent to an IRRequestBodyComponent.
 * @internal
 */
function narrowRequestBody(component: IRComponent): IRRequestBodyComponent {
  if (component.type !== COMPONENT_TYPE_REQUEST_BODY) {
    throw new Error(
      `Expected requestBody component, got "${component.type}". This is an internal error.`,
    );
  }
  return component;
}

/**
 * Converts a request body component to OpenAPI RequestBodyObject.
 * @internal
 */
export function writeRequestBodyComponent(component: IRComponent): RequestBodyObject {
  const narrowed = narrowRequestBody(component);
  const requestBody: RequestBodyObject = {
    required: narrowed.requestBody.required,
    content: Object.fromEntries(
      Object.entries(narrowed.requestBody.content).map(([mediaTypeName, mediaType]) => [
        mediaTypeName,
        writeMediaType(mediaType),
      ]),
    ),
  };
  if (narrowed.requestBody.description !== undefined) {
    requestBody.description = narrowed.requestBody.description;
  }
  return requestBody;
}
