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
  if (schema.$anchor !== undefined) {
    result['$anchor'] = schema.$anchor;
  }
  if (schema.$dynamicRef !== undefined) {
    result['$dynamicRef'] = schema.$dynamicRef;
  }
  if (schema.$dynamicAnchor !== undefined) {
    result['$dynamicAnchor'] = schema.$dynamicAnchor;
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
  if (schema.contains !== undefined) {
    result['contains'] = writeSchema(schema.contains);
  }
  writeUnevaluatedFields(schema, result, writeSchema);
  if (schema.dependentSchemas !== undefined) {
    const deps: Record<string, JsonSchemaObject> = {};
    for (const [key, depSchema] of getSortedRecordEntries(schema.dependentSchemas)) {
      deps[key] = writeSchema(depSchema);
    }
    result.dependentSchemas = deps;
  }
  writePatternProperties(schema, result, writeSchema);
  writePropertyNames(schema, result, writeSchema);
  writeConditionalApplicators(schema, result, writeSchema);
}

// ---------------------------------------------------------------------------
// patternProperties / propertyNames
// ---------------------------------------------------------------------------

/**
 * Write `patternProperties` from IR to JSON Schema output.
 * @internal
 */
function writePatternProperties(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.patternProperties === undefined) {
    return;
  }

  const output: Record<string, JsonSchemaObject> = {};
  for (const [pattern, patternSchema] of getSortedRecordEntries(schema.patternProperties)) {
    output[pattern] = writeSchema(patternSchema);
  }
  result.patternProperties = output;
}

/**
 * Write `propertyNames` from IR to JSON Schema output.
 * @internal
 */
function writePropertyNames(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.propertyNames === undefined) {
    return;
  }

  result.propertyNames = writeSchema(schema.propertyNames);
}

// ---------------------------------------------------------------------------
// if / then / else conditional applicators
// ---------------------------------------------------------------------------

/**
 * Write `if`/`then`/`else` conditional applicators from IR to JSON Schema output.
 * @internal
 */
function writeConditionalApplicators(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.if !== undefined) {
    result.if = writeSchema(schema.if);
  }
  if (schema.then !== undefined) {
    result.then = writeSchema(schema.then);
  }
  if (schema.else !== undefined) {
    result.else = writeSchema(schema.else);
  }
}
