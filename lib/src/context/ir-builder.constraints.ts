/**
 * IR Builder - Schema Constraints
 *
 * Handles extraction of validation constraints from OpenAPI schemas.
 *
 * @module ir-builder.constraints
 * @internal
 */

import type { SchemaObject } from 'openapi3-ts/oas31';
import type { CastrSchema } from './ir-schema.js';

/** @internal */
export function addConstraints(schema: SchemaObject, irSchema: CastrSchema): void {
  addNumericConstraints(schema, irSchema);
  addStringConstraints(schema, irSchema);
  addArrayConstraints(schema, irSchema);

  // Preserve enum values (critical for data integrity)
  if (schema.enum !== undefined && Array.isArray(schema.enum)) {
    irSchema.enum = Array.from(schema.enum);
  }
}

/** @internal */
function addNumericConstraints(schema: SchemaObject, irSchema: CastrSchema): void {
  if (schema.minimum !== undefined) {
    irSchema.minimum = schema.minimum;
  }
  if (schema.maximum !== undefined) {
    irSchema.maximum = schema.maximum;
  }
  if (schema.exclusiveMinimum !== undefined) {
    irSchema.exclusiveMinimum = schema.exclusiveMinimum;
  }
  if (schema.exclusiveMaximum !== undefined) {
    irSchema.exclusiveMaximum = schema.exclusiveMaximum;
  }
  if (schema.multipleOf !== undefined) {
    irSchema.multipleOf = schema.multipleOf;
  }
}

/** @internal */
function addStringConstraints(schema: SchemaObject, irSchema: CastrSchema): void {
  if (schema.minLength !== undefined) {
    irSchema.minLength = schema.minLength;
  }
  if (schema.maxLength !== undefined) {
    irSchema.maxLength = schema.maxLength;
  }
  if (schema.pattern !== undefined) {
    irSchema.pattern = schema.pattern;
  }
}

/** @internal */
function addArrayConstraints(schema: SchemaObject, irSchema: CastrSchema): void {
  if (schema.minItems !== undefined) {
    irSchema.minItems = schema.minItems;
  }
  if (schema.maxItems !== undefined) {
    irSchema.maxItems = schema.maxItems;
  }
  if (schema.uniqueItems !== undefined) {
    irSchema.uniqueItems = schema.uniqueItems;
  }
}
