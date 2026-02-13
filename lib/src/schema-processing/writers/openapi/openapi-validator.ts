/**
 * OpenAPI document validation using @scalar/openapi-parser.
 *
 * @module
 */

import { validate } from '@scalar/openapi-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

/**
 * Validates an OpenAPI document using external parser.
 *
 * @param doc - OpenAPI document to validate
 * @throws Error if document is invalid
 *
 * @internal
 */
export async function validateOpenAPI(doc: OpenAPIObject): Promise<void> {
  const result = await validate(doc);
  if (!result.valid) {
    throw new Error(`Invalid OpenAPI document: ${JSON.stringify(result.errors)}`);
  }
}
