/**
 * JSON Schema parsing helpers — field extraction and recursive structures.
 *
 * Pure functions used by the core parser. Split to comply with ADR-036.
 *
 * **Library Types:**
 * Uses JsonSchema2020 (extends the shared OpenAPI seam).
 *
 * @internal
 */

import {
  type SchemaObject,
  type ReferenceObject,
  type SchemaObjectType,
  isReferenceObject,
} from '../../../shared/openapi-types.js';
import type { CastrSchema } from '../../ir/index.js';
import { applyInferredUuidVersionFromPattern } from '../../ir/index.js';
import { assertPortableIntegerInputSemanticsSupported } from '../../compatibility/integer-target-capabilities.js';
import type { JsonSchema2020 } from './json-schema-parser.types.js';

const NULL_TYPE: SchemaObjectType = 'null';

type ParseSchemaFn = (input: JsonSchema2020) => CastrSchema;

/** @internal */
export function parseFormat(input: JsonSchema2020, result: CastrSchema): void {
  if (input.format === undefined) {
    return;
  }

  assertPortableIntegerInputSemanticsSupported('JSON Schema 2020-12', result.type, input.format);
  result.format = input.format;
}

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
  if (input.minLength !== undefined) {
    result.minLength = input.minLength;
  }
  if (input.maxLength !== undefined) {
    result.maxLength = input.maxLength;
  }
  if (input.pattern !== undefined) {
    result.pattern = input.pattern;
  }

  applyInferredUuidVersionFromPattern(result);
}

/**
 * Parse content keywords (contentEncoding, contentMediaType, contentSchema).
 *
 * All three are valid JSON Schema keywords (contentSchema is 2020-12 only)
 * and are carried into the IR verbatim; `contentSchema` recurses.
 *
 * @internal
 */
export function parseContentKeywords(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  if (input.contentEncoding !== undefined) {
    result.contentEncoding = input.contentEncoding;
  }
  if (input.contentMediaType !== undefined) {
    result.contentMediaType = input.contentMediaType;
  }
  if (input.contentSchema !== undefined) {
    result.contentSchema = parseSingleSchemaOrRef(input.contentSchema, parseSchema);
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
  if (input.items !== undefined) {
    result.items = parseSingleSchemaOrRef(input.items, parseSchema);
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

/**
 * Parse a schema-or-reference value at a nested position.
 *
 * JSON Schema 2020-12 applies keywords that appear next to `$ref`, so
 * reference values are routed through `parseSchema` in full — its `$ref`
 * handling carries the siblings (H4) — instead of being stripped to a bare
 * `{ $ref }`. The OAS-only `summary` field has no IR home and is not
 * carried.
 *
 * @internal
 */
export function parseSingleSchemaOrRef(
  value: SchemaObject | ReferenceObject,
  parseSchema: ParseSchemaFn,
): CastrSchema {
  if (isReferenceObject(value)) {
    const { summary: _summary, ...refWithSiblings } = value;
    return parseSchema(refWithSiblings);
  }
  return parseSchema(value);
}
