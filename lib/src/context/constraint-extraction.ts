/**
 * Schema Constraint Extraction Helpers
 *
 * Extracts validation constraints from CastrSchema for endpoint parameters.
 * Uses explicit type-safe property copying (no dynamic iteration).
 *
 * @module
 */

import type { CastrSchema } from '../ir/schema.js';
import type { SchemaConstraints } from '../endpoints/definition.types.js';

/** Accumulator type for building constraints */
interface ConstraintBuilder {
  constraints: SchemaConstraints;
  hasAny: boolean;
}

/** Copy numeric constraints from schema */
function copyNumericConstraints(schema: CastrSchema, builder: ConstraintBuilder): void {
  if (schema.minimum !== undefined) {
    builder.constraints.minimum = schema.minimum;
    builder.hasAny = true;
  }
  if (schema.maximum !== undefined) {
    builder.constraints.maximum = schema.maximum;
    builder.hasAny = true;
  }
  // OAS 3.1 uses number for exclusive bounds; ignore boolean (older JSON Schema)
  if (typeof schema.exclusiveMinimum === 'number') {
    builder.constraints.exclusiveMinimum = schema.exclusiveMinimum;
    builder.hasAny = true;
  }
  if (typeof schema.exclusiveMaximum === 'number') {
    builder.constraints.exclusiveMaximum = schema.exclusiveMaximum;
    builder.hasAny = true;
  }
}

/** Copy string constraints from schema */
function copyStringConstraints(schema: CastrSchema, builder: ConstraintBuilder): void {
  if (schema.minLength !== undefined) {
    builder.constraints.minLength = schema.minLength;
    builder.hasAny = true;
  }
  if (schema.maxLength !== undefined) {
    builder.constraints.maxLength = schema.maxLength;
    builder.hasAny = true;
  }
  if (schema.pattern !== undefined) {
    builder.constraints.pattern = schema.pattern;
    builder.hasAny = true;
  }
}

/** Copy array constraints from schema */
function copyArrayConstraints(schema: CastrSchema, builder: ConstraintBuilder): void {
  if (schema.minItems !== undefined) {
    builder.constraints.minItems = schema.minItems;
    builder.hasAny = true;
  }
  if (schema.maxItems !== undefined) {
    builder.constraints.maxItems = schema.maxItems;
    builder.hasAny = true;
  }
  if (schema.uniqueItems !== undefined) {
    builder.constraints.uniqueItems = schema.uniqueItems;
    builder.hasAny = true;
  }
}

/** Copy enum and format constraints from schema */
function copyMiscConstraints(schema: CastrSchema, builder: ConstraintBuilder): void {
  if (schema.enum !== undefined) {
    builder.constraints.enum = schema.enum;
    builder.hasAny = true;
  }
  if (schema.format !== undefined) {
    builder.constraints.format = schema.format;
    builder.hasAny = true;
  }
}

/**
 * Extract schema constraints from CastrSchema for EndpointParameter.
 *
 * Copies validation constraints (min/max, length limits, pattern, etc.) from
 * the IR schema to a SchemaConstraints object.
 *
 * @param schema - Source IR schema
 * @returns SchemaConstraints object if any constraints exist, undefined otherwise
 */
export function extractConstraintsFromIR(schema: CastrSchema): SchemaConstraints | undefined {
  const builder: ConstraintBuilder = { constraints: {}, hasAny: false };

  copyNumericConstraints(schema, builder);
  copyStringConstraints(schema, builder);
  copyArrayConstraints(schema, builder);
  copyMiscConstraints(schema, builder);

  return builder.hasAny ? builder.constraints : undefined;
}
