/**
 * OpenAPI document validation using @scalar/openapi-parser.
 *
 * @module
 */

import { validate } from '@scalar/openapi-parser';
import type { OpenAPIDocument } from '../../../shared/openapi-types.js';

/**
 * Validates an OpenAPI document using external parser.
 *
 * @param doc - OpenAPI document to validate
 * @throws Error if document is invalid
 *
 * @internal
 */
export async function validateOpenAPI(doc: OpenAPIDocument): Promise<void> {
  const result = await validate(doc);
  if (!result.valid) {
    throw new Error(`Invalid OpenAPI document: ${JSON.stringify(result.errors)}`);
  }
}
