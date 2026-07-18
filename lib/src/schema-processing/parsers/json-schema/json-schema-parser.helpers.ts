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

import type {
  SchemaObject,
  ReferenceObject,
  SchemaObjectType,
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
 * `{ $ref }`. The reference `summary` annotation (OAS 3.1+ Reference
 * Object) is carried into the IR `summary` field.
 *
 * Boolean values are rejected explicitly: this position is object-form
 * only, and normalising a boolean would silently invert `false`
 * (reject-all) into `{}` (allow-any). Boolean-capable keywords route
 * through {@link parseBoolOrSchemaOrRef} instead.
 *
 * @internal
 */
export function parseSingleSchemaOrRef(
  value: SchemaObject | ReferenceObject | boolean,
  parseSchema: ParseSchemaFn,
): CastrSchema {
  if (typeof value === 'boolean') {
    const objectForm = value ? '`{}`' : '`{ "not": {} }`';
    throw new Error(
      `Boolean JSON Schema \`${String(value)}\` is valid JSON Schema, but this nested position ` +
        `carries object-form schemas only and refuses to normalise the boolean silently ` +
        `(\`false\` would invert from reject-all to allow-any). Use the equivalent object ` +
        `form ${objectForm} instead.`,
    );
  }
  return parseSchema(value);
}

/**
 * Parse a value that may be a boolean schema, a schema object, or a `$ref`.
 *
 * Used at boolean-capable keywords (`if`/`then`/`else`, `contentSchema`).
 * Boolean schemas are converted to `{ booleanSchema, metadata }` IR nodes.
 * Metadata is constructed inline to avoid a circular dependency with
 * core.ts.
 *
 * @internal
 */
export function parseBoolOrSchemaOrRef(
  value: SchemaObject | ReferenceObject | boolean,
  parseSchema: ParseSchemaFn,
): CastrSchema {
  if (typeof value === 'boolean') {
    return {
      booleanSchema: value,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };
  }
  return parseSingleSchemaOrRef(value, parseSchema);
}
