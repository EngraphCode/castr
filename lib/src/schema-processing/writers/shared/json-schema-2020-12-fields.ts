/**
 * Shared JSON Schema 2020-12 extension field writers.
 *
 * Handles keywords introduced in 2020-12 that aren't covered by the
 * core field writers: dependentRequired, dependentSchemas, prefixItems,
 * unevaluatedProperties, unevaluatedItems, minContains, maxContains.
 *
 * @module writers/shared/json-schema-2020-12-fields
 * @internal
 */

import type { CastrSchema } from '../../ir/index.js';
import type { JsonSchemaObject, WriteSchemaFn } from './json-schema-object.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSortedRecordEntries<T>(record: Record<string, T>): [string, T][] {
  return Object.entries(record).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
}

// ---------------------------------------------------------------------------
// Simple (non-recursive) 2020-12 fields
// ---------------------------------------------------------------------------

/**
 * Write simple JSON Schema 2020-12 keywords
 * (dependentRequired, minContains, maxContains).
 * @internal
 */
export function writeJsonSchema2020SimpleFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
): void {
  if (schema.dependentRequired !== undefined) {
    const sorted: Record<string, string[]> = {};
    for (const [key, requiredKeys] of getSortedRecordEntries(schema.dependentRequired)) {
      sorted[key] = requiredKeys;
    }
    result.dependentRequired = sorted;
  }
  if (schema.minContains !== undefined) {
    result.minContains = schema.minContains;
  }
  if (schema.maxContains !== undefined) {
    result.maxContains = schema.maxContains;
  }
}

// ---------------------------------------------------------------------------
// Recursive 2020-12 fields
// ---------------------------------------------------------------------------

/**
 * Write unevaluatedProperties and unevaluatedItems.
 * @internal
 */
export function writeUnevaluatedFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.unevaluatedProperties !== undefined) {
    result.unevaluatedProperties =
      typeof schema.unevaluatedProperties === 'boolean'
        ? schema.unevaluatedProperties
        : writeSchema(schema.unevaluatedProperties);
  }
  if (schema.unevaluatedItems !== undefined) {
    result.unevaluatedItems =
      typeof schema.unevaluatedItems === 'boolean'
        ? schema.unevaluatedItems
        : writeSchema(schema.unevaluatedItems);
  }
}

/**
 * Write recursive JSON Schema 2020-12 fields
 * (prefixItems, unevaluated*, dependentSchemas).
 * @internal
 */
export function writeJsonSchema2020RecursiveFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.prefixItems !== undefined) {
    result.prefixItems = schema.prefixItems.map((item) => writeSchema(item));
  }
  writeUnevaluatedFields(schema, result, writeSchema);
  if (schema.dependentSchemas !== undefined) {
    const deps: Record<string, JsonSchemaObject> = {};
    for (const [key, depSchema] of getSortedRecordEntries(schema.dependentSchemas)) {
      deps[key] = writeSchema(depSchema);
    }
    result.dependentSchemas = deps;
  }
}
