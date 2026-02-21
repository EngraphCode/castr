/**
 * OpenAPI schema writer — converts CastrSchema (IR) to OpenAPI SchemaObject.
 *
 * This module handles the conversion of the canonical IR schema representation
 * to valid OpenAPI 3.1 SchemaObject format. It preserves all schema properties
 * and handles nullable conversion using OAS 3.1 type arrays.
 *
 * @module
 */

import type { SchemaObject, SchemaObjectType } from 'openapi3-ts/oas31';

import type { CastrSchema } from '../../../ir/index.js';
import type { ExtendedSchemaObject } from './openapi-writer.schema.extensions.js';
import { writeExtensionFields } from './openapi-writer.schema.extensions.js';

function getSortedPropertyEntries(schema: CastrSchema): [string, CastrSchema][] {
  if (schema.properties === undefined) {
    return [];
  }

  return [...schema.properties.entries()].sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey),
  );
}

/**
 * Valid schema types for OAS 3.1.
 */
const VALID_SCHEMA_TYPES: readonly SchemaObjectType[] = [
  'string',
  'number',
  'integer',
  'boolean',
  'array',
  'object',
  'null',
] as const;

/**
 * Type guard for valid schema types.
 */
function isSchemaObjectType(value: unknown): value is SchemaObjectType {
  if (typeof value !== 'string') {
    return false;
  }
  // Use some() with strict equality to avoid type assertion
  return VALID_SCHEMA_TYPES.some((t) => t === value);
}

/**
 * Writes type field with nullable conversion (OAS 3.1 style).
 * @internal
 */
function writeTypeField(schema: CastrSchema, result: SchemaObject): void {
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
 * Writes string constraint fields (format, minLength, maxLength, pattern).
 * @internal
 */
function writeStringFields(schema: CastrSchema, result: SchemaObject): void {
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
 * Writes number constraint fields (min, max, exclusiveMin, exclusiveMax, multipleOf).
 * @internal
 */
function writeNumberFields(schema: CastrSchema, result: SchemaObject): void {
  if (schema.minimum !== undefined) {
    result.minimum = schema.minimum;
  }
  if (schema.maximum !== undefined) {
    result.maximum = schema.maximum;
  }
  // OAS 3.1 uses numeric-only exclusiveMinimum/exclusiveMaximum
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
 * Writes the additionalProperties field.
 * @internal
 */
function writeAdditionalProperties(schema: CastrSchema, result: SchemaObject): void {
  if (schema.additionalProperties === undefined) {
    return;
  }
  if (typeof schema.additionalProperties === 'boolean') {
    result.additionalProperties = schema.additionalProperties;
  } else {
    result.additionalProperties = writeOpenApiSchema(schema.additionalProperties);
  }
}

/**
 * Writes object-related fields (properties, required, additionalProperties).
 * @internal
 */
function writeObjectFields(schema: CastrSchema, result: SchemaObject): void {
  if (schema.properties !== undefined) {
    result.properties = {};
    for (const [key, propSchema] of getSortedPropertyEntries(schema)) {
      result.properties[key] = writeOpenApiSchema(propSchema);
    }
  }
  // Omit empty required arrays (idiomatic per OAS 3.1 / JSON Schema 2020-12)
  if (schema.required !== undefined && schema.required.length > 0) {
    result.required = schema.required;
  }
  writeAdditionalProperties(schema, result);
}

/**
 * Writes array-related fields (items, prefixItems, minItems, maxItems, uniqueItems).
 * @internal
 */
function writeArrayFields(schema: CastrSchema, result: SchemaObject): void {
  // OAS 3.1: items is a single schema, prefixItems is for tuples
  if (schema.items !== undefined) {
    if (Array.isArray(schema.items)) {
      result.prefixItems = schema.items.map((item) => writeOpenApiSchema(item));
    } else {
      result.items = writeOpenApiSchema(schema.items);
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
 * Writes composition fields (allOf, oneOf, anyOf, not, discriminator).
 * @internal
 */
function writeCompositionFields(schema: CastrSchema, result: SchemaObject): void {
  if (schema.allOf !== undefined) {
    result.allOf = schema.allOf.map((s) => writeOpenApiSchema(s));
  }
  if (schema.oneOf !== undefined) {
    result.oneOf = schema.oneOf.map((s) => writeOpenApiSchema(s));
  }
  if (schema.anyOf !== undefined) {
    result.anyOf = schema.anyOf.map((s) => writeOpenApiSchema(s));
  }
  if (schema.not !== undefined) {
    result.not = writeOpenApiSchema(schema.not);
  }
  if (schema.discriminator !== undefined) {
    result.discriminator = schema.discriminator;
  }
}

/**
 * Writes core metadata fields (title, description, default, example, examples).
 * @internal
 */
function writeCoreMetadata(schema: CastrSchema, result: SchemaObject): void {
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
 * Writes access metadata fields (deprecated, readOnly, writeOnly).
 * @internal
 */
function writeAccessMetadata(schema: CastrSchema, result: SchemaObject): void {
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
 * Writes metadata fields (title, description, default, example, deprecated, etc.).
 * @internal
 */
function writeMetadataFields(schema: CastrSchema, result: SchemaObject): void {
  writeCoreMetadata(schema, result);
  writeAccessMetadata(schema, result);
}

/**
 * Writes all field groups for a non-ref schema.
 * @internal
 */
function writeSchemaFields(schema: CastrSchema, result: ExtendedSchemaObject): void {
  writeTypeField(schema, result);
  writeStringFields(schema, result);
  writeNumberFields(schema, result);
  if (schema.enum !== undefined) {
    result.enum = schema.enum;
  }
  writeObjectFields(schema, result);
  writeArrayFields(schema, result);
  writeCompositionFields(schema, result);
  writeMetadataFields(schema, result);
  writeExtensionFields(schema, result, writeOpenApiSchema);
}

/**
 * Converts an IR schema to an OpenAPI SchemaObject.
 *
 * Handles all schema types (primitives, objects, arrays, composition) and
 * preserves constraints, formats, and metadata. Nullable schemas are converted
 * to OAS 3.1 type arrays (e.g., `['string', 'null']`).
 *
 * @param schema - The IR schema to convert
 * @returns A valid OpenAPI 3.1 SchemaObject
 *
 * @example
 * ```typescript
 * const irSchema: CastrSchema = {
 *   type: 'string',
 *   format: 'email',
 *   metadata: { nullable: true, ... },
 * };
 *
 * const oasSchema = writeOpenApiSchema(irSchema);
 * // { type: ['string', 'null'], format: 'email' }
 * ```
 *
 * @public
 */
export function writeOpenApiSchema(schema: CastrSchema): ExtendedSchemaObject {
  const result: ExtendedSchemaObject = {};

  // Handle $ref - if present, only output $ref (per OAS spec)
  if (schema.$ref !== undefined) {
    result.$ref = schema.$ref;
    return result;
  }

  writeSchemaFields(schema, result);

  return result;
}
