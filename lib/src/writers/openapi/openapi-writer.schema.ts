/**
 * OpenAPI schema writer — converts CastrSchema (IR) to OpenAPI SchemaObject.
 *
 * This module handles the conversion of the canonical IR schema representation
 * to valid OpenAPI 3.1 SchemaObject format. It preserves all schema properties
 * and handles nullable conversion using OAS 3.1 type arrays.
 *
 * @module
 */

import type { SchemaObject, SchemaObjectType, ReferenceObject } from 'openapi3-ts/oas31';

import type { CastrSchema } from '../../ir/schema.js';

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
 * Writes object-related fields (properties, required, additionalProperties).
 * @internal
 */
function writeObjectFields(schema: CastrSchema, result: SchemaObject): void {
  if (schema.properties !== undefined) {
    result.properties = {};
    for (const [key, propSchema] of schema.properties.entries()) {
      result.properties[key] = writeOpenApiSchema(propSchema);
    }
  }
  // Omit empty required arrays (idiomatic per OAS 3.1 / JSON Schema 2020-12)
  if (schema.required !== undefined && schema.required.length > 0) {
    result.required = schema.required;
  }
  if (schema.additionalProperties !== undefined) {
    if (typeof schema.additionalProperties === 'boolean') {
      result.additionalProperties = schema.additionalProperties;
    } else {
      result.additionalProperties = writeOpenApiSchema(schema.additionalProperties);
    }
  }
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
 * Writes metadata fields (title, description, default, example, deprecated, etc.).
 * @internal
 */
function writeMetadataFields(schema: CastrSchema, result: SchemaObject): void {
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
 * Extended SchemaObject with JSON Schema 2020-12 keywords.
 * The openapi3-ts types don't include these, but they are valid in OAS 3.1.
 * @internal
 */
type ExtendedSchemaObject = SchemaObject & {
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
    result.dependentRequired = schema.dependentRequired;
  }
  if (schema.minContains !== undefined) {
    result.minContains = schema.minContains;
  }
  if (schema.maxContains !== undefined) {
    result.maxContains = schema.maxContains;
  }
}

/**
 * Writes recursive JSON Schema 2020-12 fields (prefixItems, unevaluated*, dependentSchemas).
 * @internal
 */
function writeJsonSchema2020RecursiveFields(
  schema: CastrSchema,
  result: ExtendedSchemaObject,
): void {
  if (schema.prefixItems !== undefined) {
    result.prefixItems = schema.prefixItems.map((item) => writeOpenApiSchema(item));
  }
  if (schema.unevaluatedProperties !== undefined) {
    result.unevaluatedProperties =
      typeof schema.unevaluatedProperties === 'boolean'
        ? schema.unevaluatedProperties
        : writeOpenApiSchema(schema.unevaluatedProperties);
  }
  if (schema.unevaluatedItems !== undefined) {
    result.unevaluatedItems =
      typeof schema.unevaluatedItems === 'boolean'
        ? schema.unevaluatedItems
        : writeOpenApiSchema(schema.unevaluatedItems);
  }
  if (schema.dependentSchemas !== undefined) {
    const deps: Record<string, SchemaObject> = {};
    for (const [key, depSchema] of Object.entries(schema.dependentSchemas)) {
      deps[key] = writeOpenApiSchema(depSchema);
    }
    result.dependentSchemas = deps;
  }
}

/**
 * Writes OpenAPI extensions and JSON Schema 2020-12 keywords.
 * @internal
 */
function writeExtensionFields(schema: CastrSchema, result: ExtendedSchemaObject): void {
  writeOasExtensions(schema, result);
  writeJsonSchema2020SimpleFields(schema, result);
  writeJsonSchema2020RecursiveFields(schema, result);
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

  // Write all field groups
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
  writeExtensionFields(schema, result);

  return result;
}
