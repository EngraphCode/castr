import type { SchemaObject } from '../../shared/openapi-types.js';
import type { UnknownRecord } from '../../shared/type-utils/types.js';

interface OpenApiSchemaNode extends UnknownRecord {
  type?: SchemaObject['type'];
  format?: string;
}

export type OpenApiSchemaVisitor = (schema: OpenApiSchemaNode, seen: WeakSet<object>) => void;

const OPENAPI_SINGLE_SCHEMA_KEYWORDS = [
  'items',
  'not',
  'if',
  'then',
  'else',
  'contains',
  'propertyNames',
  'unevaluatedItems',
  'unevaluatedProperties',
] as const;
const OPENAPI_ARRAY_SCHEMA_KEYWORDS = ['prefixItems', 'allOf', 'anyOf', 'oneOf'] as const;
const OPENAPI_MAP_SCHEMA_KEYWORDS = ['patternProperties', 'dependentSchemas'] as const;

export function markOpenApiNodeSeen(value: object, seen: WeakSet<object>): boolean {
  if (seen.has(value)) {
    return false;
  }

  seen.add(value);
  return true;
}

function isObjectRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSchemaObjectCandidate(value: unknown): value is OpenApiSchemaNode {
  return isObjectRecord(value);
}

function visitSchemaArray(
  values: unknown,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (!Array.isArray(values)) {
    return;
  }

  for (const value of values) {
    visitOpenApiSchemaNode(value, seen, visitSchema);
  }
}

function visitSchemaRecord(
  values: unknown,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (!isObjectRecord(values)) {
    return;
  }

  for (const value of Object.values(values)) {
    visitOpenApiSchemaNode(value, seen, visitSchema);
  }
}

export function visitOpenApiSchemaNode(
  value: unknown,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (!isSchemaObjectCandidate(value) || !markOpenApiNodeSeen(value, seen)) {
    return;
  }

  visitSchema(value, seen);
  visitSchemaRecord(value['properties'], seen, visitSchema);
  visitOpenApiSchemaNode(value['additionalProperties'], seen, visitSchema);

  for (const key of OPENAPI_SINGLE_SCHEMA_KEYWORDS) {
    visitOpenApiSchemaNode(Reflect.get(value, key), seen, visitSchema);
  }

  for (const key of OPENAPI_ARRAY_SCHEMA_KEYWORDS) {
    visitSchemaArray(Reflect.get(value, key), seen, visitSchema);
  }

  for (const key of OPENAPI_MAP_SCHEMA_KEYWORDS) {
    visitSchemaRecord(Reflect.get(value, key), seen, visitSchema);
  }
}
