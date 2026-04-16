/**
 * OpenAPI document-level schema visitor for portable object semantics.
 *
 * Traverses schema nodes so nested schema carriers such as
 * `additionalProperties` are still visited before IR build.
 *
 * @internal
 */

import { type SchemaObject, isReferenceObject } from '../../../shared/openapi-types.js';

import { isRecord } from '../../../shared/type-utils/types.js';

const SINGLE_SCHEMA_KEYWORDS = [
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

const ARRAY_SCHEMA_KEYWORDS = ['prefixItems', 'allOf', 'anyOf', 'oneOf'] as const;
const MAP_SCHEMA_KEYWORDS = ['patternProperties', 'dependentSchemas'] as const;

function getUnknownField(source: object, key: string): unknown {
  return Reflect.get(source, key);
}

function visitSchemaArray(values: unknown, seen: WeakSet<object>): void {
  if (!Array.isArray(values)) {
    return;
  }

  for (const value of values) {
    visitSchemaNode(value, seen);
  }
}

function visitSchemaMap(values: unknown, seen: WeakSet<object>): void {
  if (!isRecord(values)) {
    return;
  }

  for (const value of Object.values(values)) {
    visitSchemaNode(value, seen);
  }
}

function visitSchemaObject(schema: SchemaObject, seen: WeakSet<object>): void {
  if (seen.has(schema)) {
    return;
  }

  seen.add(schema);
  visitSchemaMap(schema.properties, seen);
  visitSchemaNode(schema.additionalProperties, seen);

  for (const key of SINGLE_SCHEMA_KEYWORDS) {
    visitSchemaNode(getUnknownField(schema, key), seen);
  }
  for (const key of ARRAY_SCHEMA_KEYWORDS) {
    visitSchemaArray(getUnknownField(schema, key), seen);
  }
  for (const key of MAP_SCHEMA_KEYWORDS) {
    visitSchemaMap(getUnknownField(schema, key), seen);
  }
}

export function visitSchemaNode(value: unknown, seen: WeakSet<object>): void {
  if (!isRecord(value) || isReferenceObject(value)) {
    return;
  }

  visitSchemaObject(value, seen);
}
