/**
 * OpenAPI document validation using `@scalar/openapi-parser`.
 */

import { validate } from '@scalar/openapi-parser';
import type { OpenAPIDocument } from '../../../shared/openapi-types.js';
import { isRecord } from '../../../shared/type-utils/type-guards.js';

/**
 * Validates an OpenAPI document using external parser.
 *
 * @param doc - OpenAPI document to validate
 * @throws Error if document is invalid
 *
 * @internal
 */
export async function validateOpenAPI(doc: OpenAPIDocument): Promise<void> {
  // Boundary widening to Scalar's `validate()` input (`Record<string, unknown>`).
  // castr's strict OpenAPIDocument deliberately omits a general index signature
  // (vendor index-signature stripping, see shared/openapi-types.ts), so it is not
  // directly assignable since @scalar/openapi-parser tightened the input to
  // `unknown`-valued records. Narrow at the boundary rather than weaken the type.
  if (!isRecord(doc)) {
    throw new Error('Invalid OpenAPI document: expected an object.');
  }
  const result = await validate(doc);
  if (!result.valid) {
    throw new Error(`Invalid OpenAPI document: ${JSON.stringify(result.errors)}`);
  }
}
