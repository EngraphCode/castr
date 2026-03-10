/**
 * JSON Schema parsing helpers — field extraction and recursive structures.
 *
 * Pure functions used by the core parser. Split to comply with ADR-036.
 *
 * **Library Types:**
 * Uses JsonSchema2020 (extends SchemaObject from openapi3-ts/oas31).
 *
 * @module parsers/json-schema/json-schema-parser.helpers
 * @internal
 */

import type { SchemaObject, ReferenceObject, SchemaObjectType } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type { CastrSchema } from '../../ir/index.js';
import type { JsonSchema2020 } from './json-schema-parser.types.js';

const NULL_TYPE: SchemaObjectType = 'null';

type ParseSchemaFn = (input: JsonSchema2020) => CastrSchema;

// ── Type parsing ──────────────────────────────────────────────────────────

/** @internal */
export function parseType(input: JsonSchema2020, result: CastrSchema, nullable: boolean): void {
  if (input.type === undefined) {
    return;
  }
  if (typeof input.type === 'string') {
    result.type = input.type;
    return;
  }
  if (Array.isArray(input.type)) {
    parseTypeArray(input.type, result, nullable);
  }
}

function parseTypeArray(types: SchemaObjectType[], result: CastrSchema, nullable: boolean): void {
  const nonNull: SchemaObjectType[] = [];
  for (const t of types) {
    if (t !== NULL_TYPE) {
      nonNull.push(t);
    }
  }
  if (nonNull.length === 1 && nonNull[0] !== undefined) {
    result.type = nonNull[0];
    return;
  }
  if (nonNull.length === 0) {
    result.type = NULL_TYPE;
    return;
  }
  result.type = nullable ? nonNull : types;
}

// ── Constraints ───────────────────────────────────────────────────────────

/** @internal */
export function parseStringConstraints(input: JsonSchema2020, result: CastrSchema): void {
  if (input.format !== undefined) {
    result.format = input.format;
  }
  if (input.minLength !== undefined) {
    result.minLength = input.minLength;
  }
  if (input.maxLength !== undefined) {
    result.maxLength = input.maxLength;
  }
  if (input.pattern !== undefined) {
    result.pattern = input.pattern;
  }
  if (input.contentEncoding !== undefined) {
    result.contentEncoding = input.contentEncoding;
  }
}

/** @internal */
export function parseNumberConstraints(input: JsonSchema2020, result: CastrSchema): void {
  if (input.minimum !== undefined) {
    result.minimum = input.minimum;
  }
  if (input.maximum !== undefined) {
    result.maximum = input.maximum;
  }
  if (input.exclusiveMinimum !== undefined) {
    result.exclusiveMinimum = input.exclusiveMinimum;
  }
  if (input.exclusiveMaximum !== undefined) {
    result.exclusiveMaximum = input.exclusiveMaximum;
  }
  if (input.multipleOf !== undefined) {
    result.multipleOf = input.multipleOf;
  }
}

/** @internal */
export function parseEnumConst(input: JsonSchema2020, result: CastrSchema): void {
  if (input.enum !== undefined) {
    result.enum = input.enum;
  }
  if (input.const !== undefined) {
    result.const = input.const;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────

/** @internal */
export function parseCoreMetadata(input: JsonSchema2020, result: CastrSchema): void {
  if (input.title !== undefined) {
    result.title = input.title;
  }
  if (input.description !== undefined) {
    result.description = input.description;
  }
  if (input.default !== undefined) {
    result.default = input.default;
  }
  if (input.example !== undefined) {
    result.example = input.example;
  }
  if (input.examples !== undefined) {
    result.examples = input.examples;
  }
}

/** @internal */
export function parseAccessMetadata(input: JsonSchema2020, result: CastrSchema): void {
  if (input.deprecated !== undefined) {
    result.deprecated = input.deprecated;
  }
  if (input.readOnly !== undefined) {
    result.readOnly = input.readOnly;
  }
  if (input.writeOnly !== undefined) {
    result.writeOnly = input.writeOnly;
  }
}

// ── Array fields ──────────────────────────────────────────────────────────

/** @internal */
export function parseArrayFields(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  if (input.items !== undefined && !isReferenceObject(input.items)) {
    result.items = parseSchema(input.items);
  } else if (input.items !== undefined) {
    result.items = parseSchema({ $ref: input.items.$ref });
  }
  if (input.prefixItems !== undefined) {
    result.prefixItems = input.prefixItems.map((i) => parseSingleSchemaOrRef(i, parseSchema));
  }
  if (input.minItems !== undefined) {
    result.minItems = input.minItems;
  }
  if (input.maxItems !== undefined) {
    result.maxItems = input.maxItems;
  }
  if (input.uniqueItems !== undefined) {
    result.uniqueItems = input.uniqueItems;
  }
}

// ── Composition ───────────────────────────────────────────────────────────

/** @internal */
export function parseComposition(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  if (input.allOf !== undefined) {
    result.allOf = input.allOf.map((m) => parseSingleSchemaOrRef(m, parseSchema));
  }
  if (input.oneOf !== undefined) {
    result.oneOf = input.oneOf.map((m) => parseSingleSchemaOrRef(m, parseSchema));
  }
  if (input.anyOf !== undefined) {
    result.anyOf = input.anyOf.map((m) => parseSingleSchemaOrRef(m, parseSchema));
  }
  if (input.not !== undefined) {
    result.not = parseSingleSchemaOrRef(input.not, parseSchema);
  }
}

// ── Shared utility ────────────────────────────────────────────────────────

function parseSingleSchemaOrRef(
  value: SchemaObject | ReferenceObject,
  parseSchema: ParseSchemaFn,
): CastrSchema {
  if (isReferenceObject(value)) {
    return parseSchema({ $ref: value.$ref });
  }
  return parseSchema(value);
}
