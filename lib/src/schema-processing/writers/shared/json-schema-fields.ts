/**
 * Shared JSON Schema core field writers.
 *
 * Format-agnostic functions that populate a {@link JsonSchemaObject} from
 * CastrSchema IR nodes.  Used by the OpenAPI writer and JSON Schema writer.
 *
 * JSON Schema 2020-12 extension keywords live in the companion module
 * `json-schema-2020-12-fields.ts`.
 *
 * @module writers/shared/json-schema-fields
 * @internal
 */

import type { CastrSchema } from '../../ir/index.js';
import { isObjectSchemaType } from '../../ir/index.js';
import type { JsonSchemaObject, WriteSchemaFn } from './json-schema-object.js';
import { isSchemaObjectType } from './json-schema-object.js';
import {
  writeJsonSchema2020SimpleFields,
  writeJsonSchema2020RecursiveFields,
} from './json-schema-2020-12-fields.js';

// Re-export for convenience
export type { JsonSchemaObject, WriteSchemaFn } from './json-schema-object.js';
export { isSchemaObjectType } from './json-schema-object.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSortedPropertyEntries(schema: CastrSchema): [string, CastrSchema][] {
  if (schema.properties === undefined) {
    return [];
  }
  return [...schema.properties.entries()].sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey),
  );
}

// ---------------------------------------------------------------------------
// Core field writers
// ---------------------------------------------------------------------------

/**
 * Write the `type` field, folding nullable into a type array.
 * @internal
 */
export function writeTypeField(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.type === undefined) {
    return;
  }
  if (schema.metadata.nullable && isSchemaObjectType(schema.type)) {
    result.type = [schema.type, 'null'];
  } else {
    result.type = schema.type;
  }
}

/**
 * Write string-constraint fields.
 * @internal
 */
export function writeStringFields(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.format !== undefined) {
    result.format = schema.format;
  }
  if (schema.minLength !== undefined) {
    result.minLength = schema.minLength;
  }
  if (schema.maxLength !== undefined) {
    result.maxLength = schema.maxLength;
  }
  if (schema.pattern !== undefined) {
    result.pattern = schema.pattern;
  }
}

/**
 * Write number-constraint fields.
 * @internal
 */
export function writeNumberFields(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.minimum !== undefined) {
    result.minimum = schema.minimum;
  }
  if (schema.maximum !== undefined) {
    result.maximum = schema.maximum;
  }
  if (typeof schema.exclusiveMinimum === 'number') {
    result.exclusiveMinimum = schema.exclusiveMinimum;
  }
  if (typeof schema.exclusiveMaximum === 'number') {
    result.exclusiveMaximum = schema.exclusiveMaximum;
  }
  if (schema.multipleOf !== undefined) {
    result.multipleOf = schema.multipleOf;
  }
}

/**
 * Write the `additionalProperties` field.
 *
 * Under IDENTITY doctrine, all objects are closed-world with explicit
 * properties. Always emits `additionalProperties: false`.
 *
 * @internal
 */
function writeAdditionalProperties(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.additionalProperties === false) {
    result.additionalProperties = false;
    return;
  }

  // Closed-world default: all object schemas get additionalProperties: false
  if (schema.properties !== undefined || isObjectSchemaType(schema.type)) {
    result.additionalProperties = false;
  }
}

/**
 * Write object fields (properties, required, additionalProperties).
 * @internal
 */
export function writeObjectFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.properties !== undefined) {
    const props: Record<string, JsonSchemaObject> = {};
    for (const [key, propSchema] of getSortedPropertyEntries(schema)) {
      props[key] = writeSchema(propSchema);
    }
    result.properties = props;
  }
  if (schema.required !== undefined && schema.required.length > 0) {
    result.required = schema.required;
  }
  writeAdditionalProperties(schema, result);
}

/**
 * Write array fields (items, prefixItems, minItems, maxItems, uniqueItems).
 * @internal
 */
export function writeArrayFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.items !== undefined) {
    if (Array.isArray(schema.items)) {
      result.prefixItems = schema.items.map((item) => writeSchema(item));
    } else {
      result.items = writeSchema(schema.items);
    }
  }
  if (schema.minItems !== undefined) {
    result.minItems = schema.minItems;
  }
  if (schema.maxItems !== undefined) {
    result.maxItems = schema.maxItems;
  }
  if (schema.uniqueItems !== undefined) {
    result.uniqueItems = schema.uniqueItems;
  }
}

/**
 * Write composition fields (allOf, oneOf, anyOf, not).
 * NOTE: `discriminator` is OAS-only and not written here.
 * @internal
 */
export function writeCompositionFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.allOf !== undefined) {
    result.allOf = schema.allOf.map((s) => writeSchema(s));
  }
  if (schema.oneOf !== undefined) {
    result.oneOf = schema.oneOf.map((s) => writeSchema(s));
  }
  if (schema.anyOf !== undefined) {
    result.anyOf = schema.anyOf.map((s) => writeSchema(s));
  }
  if (schema.not !== undefined) {
    result.not = writeSchema(schema.not);
  }
}

/**
 * Write core metadata (title, description, default, example, examples).
 * @internal
 */
function writeCoreMetadata(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.title !== undefined) {
    result.title = schema.title;
  }
  if (schema.description !== undefined) {
    result.description = schema.description;
  }
  if (schema.default !== undefined) {
    result.default = schema.default;
  }
  if (schema.example !== undefined) {
    result.example = schema.example;
  }
  if (schema.examples !== undefined) {
    result.examples = schema.examples;
  }
}

/**
 * Write access metadata (deprecated, readOnly, writeOnly).
 * @internal
 */
function writeAccessMetadata(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.deprecated !== undefined) {
    result.deprecated = schema.deprecated;
  }
  if (schema.readOnly !== undefined) {
    result.readOnly = schema.readOnly;
  }
  if (schema.writeOnly !== undefined) {
    result.writeOnly = schema.writeOnly;
  }
}

/**
 * Write enum / const fields.
 * @internal
 */
export function writeEnumFields(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.enum !== undefined) {
    result.enum = schema.enum;
  }
  if (schema.const !== undefined) {
    result.const = schema.const;
  }
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

/**
 * Write ALL standard JSON Schema fields from an IR schema.
 *
 * Covers core fields + 2020-12 extension keywords.
 * Does NOT write OAS-only fields (xml, externalDocs, discriminator).
 * @internal
 */
export function writeAllJsonSchemaFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  writeTypeField(schema, result);
  writeStringFields(schema, result);
  writeNumberFields(schema, result);
  writeEnumFields(schema, result);
  writeObjectFields(schema, result, writeSchema);
  writeArrayFields(schema, result, writeSchema);
  writeCompositionFields(schema, result, writeSchema);
  writeCoreMetadata(schema, result);
  writeAccessMetadata(schema, result);
  writeJsonSchema2020SimpleFields(schema, result);
  writeJsonSchema2020RecursiveFields(schema, result, writeSchema);
}
