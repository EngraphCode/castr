/**
 * TypeScript Writer - Literal Token Resolution.
 *
 * Resolves the TypeScript literal type tokens a schema's `const`/`enum`
 * constraint admits. JSON Schema keywords are conjunctive, so the candidate
 * values are intersected with the declared `type` set (and `const` with
 * `enum`) before formatting; an empty intersection resolves to an empty
 * token list (nothing validates → `never`).
 *
 * @internal
 */

import type { CastrSchema } from '../../../ir/index.js';
import { getIntegerSemantics } from '../../../ir/index.js';
import type { SchemaObjectType } from '../../../../shared/openapi-types.js';

const NULL_SCHEMA_TYPE: SchemaObjectType = 'null';
const NUMBER_SCHEMA_TYPE: SchemaObjectType = 'number';
const STRING_SCHEMA_TYPE: SchemaObjectType = 'string';
const BOOLEAN_SCHEMA_TYPE: SchemaObjectType = 'boolean';
const INTEGER_SCHEMA_TYPE: SchemaObjectType = 'integer';
const ARRAY_SCHEMA_TYPE: SchemaObjectType = 'array';
const OBJECT_SCHEMA_TYPE: SchemaObjectType = 'object';
const NULL_LITERAL_TOKEN = 'null';

/**
 * Format a primitive IR value as a TypeScript literal type token.
 *
 * When `asBigIntLiteral` is set (int64/bigint integer semantics), integer
 * numeric values become bigint literal tokens (`1n`) so the literal type
 * matches the runtime `bigint` representation those semantics produce.
 *
 * @throws Error for values with no TypeScript literal type (objects, arrays,
 * non-finite numbers, non-integer or unsafe-integer numbers under integer
 * semantics) — fail fast instead of silently widening.
 *
 * @internal
 */
function formatLiteralTypeToken(value: unknown, asBigIntLiteral: boolean): string {
  if (value === null) {
    return NULL_LITERAL_TOKEN;
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return formatNumericLiteralTypeToken(value, asBigIntLiteral);
  }
  throw new Error(
    `Genuinely impossible: enum/const value of type "${typeof value}" cannot be represented ` +
      'as a TypeScript literal type. Literal types exist only for finite primitive JSON values.',
  );
}

/**
 * Format a finite numeric value as a number or bigint literal type token.
 *
 * @throws Error under int64/bigint semantics for non-integer values (no
 * bigint literal exists for them) and for unsafe integers (the source
 * document's exact value was already rounded when parsed into a JavaScript
 * number, so a faithful bigint literal cannot be emitted from it).
 *
 * @internal
 */
function formatNumericLiteralTypeToken(value: number, asBigIntLiteral: boolean): string {
  if (!asBigIntLiteral) {
    return String(value);
  }
  if (!Number.isInteger(value)) {
    throw new Error(
      `Genuinely impossible: non-integer enum/const value ${String(value)} under int64/bigint ` +
        'integer semantics cannot be represented as a TypeScript bigint literal type. ' +
        'bigint literals exist only for integer values.',
    );
  }
  if (!Number.isSafeInteger(value)) {
    throw new Error(
      `Genuinely impossible: enum/const value ${String(value)} under int64/bigint integer ` +
        "semantics exceeds JavaScript's safe integer range. The source document's exact value " +
        'was already rounded when parsed into a JavaScript number, so a faithful bigint ' +
        'literal type cannot be emitted from it.',
    );
  }
  return `${BigInt(value)}n`;
}

/**
 * Whether literal numeric values must be emitted as bigint literals.
 *
 * True when the schema carries int64/bigint integer semantics (runtime values
 * are `bigint`) and its type set has no `number` member that could hold plain
 * numeric values instead.
 *
 * @internal
 */
function usesBigIntLiterals(schema: CastrSchema): boolean {
  if (getIntegerSemantics(schema) === undefined) {
    return false;
  }
  return !(
    Array.isArray(schema.type) &&
    schema.type.some((memberType) => memberType === NUMBER_SCHEMA_TYPE)
  );
}

/**
 * Whether the value has a primitive JSON literal representation
 * (`null`, string, boolean, or number).
 *
 * @internal
 */
function isPrimitiveLiteralValue(value: unknown): boolean {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'number'
  );
}

/**
 * Normalise a type-array member to its IR token. Scalar's OpenAPI 3.1
 * pipeline delivers a RUNTIME `null` member (YAML `- null`, JSON `null`)
 * where the specification requires the string token `'null'`; both denote
 * the null type. The Zod writer and the JSON Schema converter already fold
 * runtime null the same way — normalising here keeps the TypeScript surface
 * in lockstep instead of falling through to `unknown`.
 *
 * @internal
 */
export function normalizeTypeArrayMember(memberType: SchemaObjectType | null): SchemaObjectType {
  return memberType ?? NULL_SCHEMA_TYPE;
}

/**
 * The schema's declared type as a set, or undefined when `type` is absent.
 * Type-array members are normalised so a runtime `null` member counts as
 * the null type in the conjunctive `type` ∧ `enum`/`const` intersection.
 *
 * @internal
 */
function resolveDeclaredTypeSet(schema: CastrSchema): readonly SchemaObjectType[] | undefined {
  if (schema.type === undefined) {
    return undefined;
  }
  return Array.isArray(schema.type) ? schema.type.map(normalizeTypeArrayMember) : [schema.type];
}

/**
 * Whether the declared type set contains the candidate schema type.
 *
 * @internal
 */
function declaredTypesContain(
  declaredTypes: readonly SchemaObjectType[],
  candidate: SchemaObjectType,
): boolean {
  return declaredTypes.some((declaredType) => declaredType === candidate);
}

/**
 * Whether a literal value can satisfy the declared type set. JSON Schema
 * applies `type` and `enum`/`const` conjunctively, so a literal value outside
 * the declared types is a dead branch no instance can reach.
 *
 * @internal
 */
function literalValueMatchesDeclaredType(
  value: unknown,
  declaredTypes: readonly SchemaObjectType[],
): boolean {
  if (value === null) {
    return declaredTypesContain(declaredTypes, NULL_SCHEMA_TYPE);
  }
  if (typeof value === 'string') {
    return declaredTypesContain(declaredTypes, STRING_SCHEMA_TYPE);
  }
  if (typeof value === 'boolean') {
    return declaredTypesContain(declaredTypes, BOOLEAN_SCHEMA_TYPE);
  }
  if (typeof value === 'number') {
    return (
      declaredTypesContain(declaredTypes, NUMBER_SCHEMA_TYPE) ||
      (declaredTypesContain(declaredTypes, INTEGER_SCHEMA_TYPE) && Number.isInteger(value))
    );
  }
  if (Array.isArray(value)) {
    return declaredTypesContain(declaredTypes, ARRAY_SCHEMA_TYPE);
  }
  return declaredTypesContain(declaredTypes, OBJECT_SCHEMA_TYPE);
}

/**
 * Resolve the candidate literal values from `const`/`enum`, applying the
 * conjunctive `const` ∧ `enum` intersection: when both are present, only a
 * `const` value the enum contains survives. Non-primitive `const` values are
 * passed through so token formatting can fail fast on them as before.
 *
 * @internal
 */
function resolveLiteralCandidateValues(schema: CastrSchema): unknown[] | undefined {
  if (schema.const === undefined) {
    return schema.enum === undefined ? undefined : [...schema.enum];
  }
  const constValue = schema.const;
  if (schema.enum !== undefined && isPrimitiveLiteralValue(constValue)) {
    return schema.enum.some((member) => member === constValue) ? [constValue] : [];
  }
  return [constValue];
}

/**
 * Resolve the literal union tokens for a schema carrying `const` or `enum`.
 * Returns undefined when the schema carries neither. JSON Schema keywords are
 * conjunctive, so the candidate values are intersected with the declared
 * `type` set (and `const` with `enum`); an empty intersection yields an empty
 * token list (nothing validates → `never`), mirroring `enum: []`. Integer
 * values under int64/bigint semantics resolve to bigint literal tokens.
 *
 * @internal
 */
export function resolveLiteralUnionTokens(schema: CastrSchema): string[] | undefined {
  const candidateValues = resolveLiteralCandidateValues(schema);
  if (candidateValues === undefined) {
    return undefined;
  }
  const declaredTypes = resolveDeclaredTypeSet(schema);
  const admittedValues =
    declaredTypes === undefined
      ? candidateValues
      : candidateValues.filter((value) => literalValueMatchesDeclaredType(value, declaredTypes));
  const asBigIntLiteral = usesBigIntLiterals(schema);
  return [
    ...new Set(admittedValues.map((value) => formatLiteralTypeToken(value, asBigIntLiteral))),
  ];
}

/**
 * Whether the schema carries composition keywords (allOf/oneOf/anyOf).
 *
 * @internal
 */
export function hasCompositionKeywords(schema: CastrSchema): boolean {
  return schema.allOf !== undefined || schema.oneOf !== undefined || schema.anyOf !== undefined;
}
