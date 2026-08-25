/**
 * JSON Schema parsing helpers — field extraction, recursive structures, and
 * the shared recursion contract ({@link ParseSchemaFn},
 * {@link parseSingleSchemaOrRef}, {@link createDefaultMetadata}) every
 * keyword parser routes through, so root and nested schemas take one code
 * path (defect F-03 arose from the two diverging).
 *
 * Pure functions used by the core parser. Split to comply with ADR-036.
 *
 * **Library Types:**
 * Uses JsonSchema2020 (built on the shared OpenAPI seam; boolean-capable, not a `SchemaObject` subtype).
 *
 * @internal
 */

import {
  type ReferenceObject,
  type SchemaObjectType,
  isReferenceObject,
} from '../../../shared/openapi-types.js';
import type { CastrSchema, CastrSchemaNode } from '../../ir/index.js';
import { applyInferredUuidVersionFromPattern } from '../../ir/index.js';
import { assertPortableIntegerInputSemanticsSupported } from '../../compatibility/integer-target-capabilities.js';
import type { JsonSchema2020 } from './json-schema-parser.types.js';

const NULL_TYPE: SchemaObjectType = 'null';

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
  if (input.contentEncoding !== undefined) {
    result.contentEncoding = input.contentEncoding;
  }

  applyInferredUuidVersionFromPattern(result);
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

// ── Shared recursion contract ─────────────────────────────────────────────

/**
 * Recursive parse callback supplied by the core parser. Accepts boolean
 * schemas so nested `true`/`false` survive at every recursive position.
 * @internal
 */
export type ParseSchemaFn = (input: JsonSchema2020 | boolean) => CastrSchema;

/**
 * Create a default CastrSchemaNode.
 * @internal
 */
export function createDefaultMetadata(overrides?: { nullable?: boolean }): CastrSchemaNode {
  return {
    required: false,
    nullable: overrides?.nullable ?? false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
  };
}

/**
 * Parse a value that may be a boolean schema, a schema object, or a `$ref`.
 *
 * The boolean branch routes through the same callback as objects, so the
 * caller's post-processing (e.g. `metadata.required` mirroring on property
 * members) applies to boolean children identically.
 *
 * @internal
 */
export function parseSingleSchemaOrRef(
  value: JsonSchema2020 | ReferenceObject | boolean,
  parseSchema: ParseSchemaFn,
): CastrSchema {
  if (typeof value === 'boolean') {
    return parseSchema(value);
  }
  if (isReferenceObject(value)) {
    return parseSchema({ $ref: value.$ref });
  }
  return parseSchema(value);
}
