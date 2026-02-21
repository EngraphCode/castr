/**
 * JSON Schema 2020-12 and OAS extension field writers.
 *
 * Extracted from openapi-writer.schema.ts to reduce file size.
 *
 * @module writers/openapi/schema/extensions
 */

import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';

import type { CastrSchema } from '../../../ir/index.js';

/**
 * Function signature for recursively writing schemas.
 * Used to break circular module dependencies.
 * @internal
 */
type WriteSchemaFn = (schema: CastrSchema) => SchemaObject;

function getSortedRecordEntries<T>(record: Record<string, T>): [string, T][] {
  return Object.entries(record).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
}

/**
 * Extended SchemaObject with JSON Schema 2020-12 keywords.
 * The openapi3-ts types don't include these, but they are valid in OAS 3.1.
 * @internal
 */
export type ExtendedSchemaObject = SchemaObject & {
  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, SchemaObject | ReferenceObject>;
  minContains?: number;
  maxContains?: number;
};

/**
 * Writes simple OpenAPI extension fields (xml, externalDocs).
 * @internal
 */
function writeOasExtensions(schema: CastrSchema, result: ExtendedSchemaObject): void {
  if (schema.xml !== undefined) {
    result.xml = schema.xml;
  }
  if (schema.externalDocs !== undefined) {
    result.externalDocs = schema.externalDocs;
  }
}

/**
 * Writes simple JSON Schema 2020-12 fields (dependentRequired, minContains, maxContains).
 * @internal
 */
function writeJsonSchema2020SimpleFields(schema: CastrSchema, result: ExtendedSchemaObject): void {
  if (schema.dependentRequired !== undefined) {
    const sortedDependentRequired: Record<string, string[]> = {};
    for (const [key, requiredKeys] of getSortedRecordEntries(schema.dependentRequired)) {
      sortedDependentRequired[key] = requiredKeys;
    }
    result.dependentRequired = sortedDependentRequired;
  }
  if (schema.minContains !== undefined) {
    result.minContains = schema.minContains;
  }
  if (schema.maxContains !== undefined) {
    result.maxContains = schema.maxContains;
  }
}

/**
 * Writes unevaluatedProperties and unevaluatedItems fields.
 * @internal
 */
function writeUnevaluatedFields(
  schema: CastrSchema,
  result: ExtendedSchemaObject,
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
 * Writes recursive JSON Schema 2020-12 fields (prefixItems, unevaluated*, dependentSchemas).
 * @internal
 */
function writeJsonSchema2020RecursiveFields(
  schema: CastrSchema,
  result: ExtendedSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.prefixItems !== undefined) {
    result.prefixItems = schema.prefixItems.map((item) => writeSchema(item));
  }
  writeUnevaluatedFields(schema, result, writeSchema);
  if (schema.dependentSchemas !== undefined) {
    const deps: Record<string, SchemaObject> = {};
    for (const [key, depSchema] of getSortedRecordEntries(schema.dependentSchemas)) {
      deps[key] = writeSchema(depSchema);
    }
    result.dependentSchemas = deps;
  }
}

/**
 * Writes OpenAPI extensions and JSON Schema 2020-12 keywords.
 * @internal
 */
export function writeExtensionFields(
  schema: CastrSchema,
  result: ExtendedSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  writeOasExtensions(schema, result);
  writeJsonSchema2020SimpleFields(schema, result);
  writeJsonSchema2020RecursiveFields(schema, result, writeSchema);
}
