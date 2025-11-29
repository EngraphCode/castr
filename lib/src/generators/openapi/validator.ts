import { validate } from '@scalar/openapi-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

export async function validateOpenAPI(doc: OpenAPIObject): Promise<void> {
  const result = await validate(doc);
  if (!result.valid) {
    throw new Error(`Invalid OpenAPI document: ${JSON.stringify(result.errors)}`);
  }
}
