import type { OpenAPIObject, ReferenceObject, SchemaObject } from '../src/shared/openapi-types.js';
import { assertNotReference } from '../src/shared/openapi/component-access.js';
import { isRecord } from '../src/shared/type-utils/types.js';
import { isOpenAPIDocument } from '../src/validation/cli-type-guards.js';

function describeValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

function isSchemaObjectCandidate(value: unknown): value is SchemaObject | ReferenceObject {
  return isRecord(value);
}

export function assertOpenApiObject(
  value: unknown,
  context: string,
): asserts value is OpenAPIObject {
  if (!isOpenAPIDocument(value)) {
    throw new Error(`Expected OpenAPIObject in ${context}, received ${describeValue(value)}`);
  }
}

export function assertSchemaObject(value: unknown, context: string): SchemaObject {
  if (!isSchemaObjectCandidate(value)) {
    throw new Error(`Expected SchemaObject in ${context}, received ${describeValue(value)}`);
  }

  assertNotReference(value, context);
  return value;
}
