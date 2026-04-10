/**
 * OpenAPI request body component writer — converts IRRequestBodyComponent to OpenAPI.
 *
 * Extracted from openapi-writer.components.ts to keep per-file line counts within limits.
 *
 * @module
 */

import type { RequestBodyObject } from '../../../../shared/openapi-types.js';
import type { IRComponent, IRRequestBodyComponent } from '../../../ir/index.js';
import { writeMediaTypeEntries } from '../openapi-writer.media-types.js';

const COMPONENT_TYPE_REQUEST_BODY = 'requestBody';

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
    content: writeMediaTypeEntries(narrowed.requestBody.content),
  };
  if (narrowed.requestBody.description !== undefined) {
    requestBody.description = narrowed.requestBody.description;
  }
  return requestBody;
}
