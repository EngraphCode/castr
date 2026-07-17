/**
 * TypeScript Writer - Literal Value and Type-Array Support.
 *
 * Faithful emission of `const`/`enum` literal types and multi-type
 * (`type: [...]`) unions, plus the parenthesisation predicates the core
 * writer needs to place those unions in higher-precedence positions.
 *
 * Callback parameters (`renderMember`, `writeMember`) are injected by the
 * core writer to avoid a circular module dependency on its recursive
 * writer functions.
 *
 * @internal
 */

import { CodeBlockWriter, type WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../../../ir/index.js';
import { getIntegerSemantics } from '../../../ir/index.js';
import type { SchemaObjectType } from '../../../../shared/openapi-types.js';

const NULL_SCHEMA_TYPE: SchemaObjectType = 'null';
const NUMBER_SCHEMA_TYPE: SchemaObjectType = 'number';
const NULL_LITERAL_TOKEN = 'null';

/**
 * Render a writer function to text using a scratch writer.
 * Used for union deduplication keys and parenthesisation decisions;
 * the real output is always re-written into the caller's writer.
 *
 * @internal
 */
export function renderTypeText(write: WriterFunction): string {
  const scratchWriter = new CodeBlockWriter();
  write(scratchWriter);
  return scratchWriter.toString();
}

/**
 * Format a primitive IR value as a TypeScript literal type token.
 *
 * When `asBigIntLiteral` is set (int64/bigint integer semantics), integer
 * numeric values become bigint literal tokens (`1n`) so the literal type
 * matches the runtime `bigint` representation those semantics produce.
 *
 * @throws Error for values with no TypeScript literal type (objects, arrays,
 * non-finite numbers, non-integer numbers under integer semantics) — fail
 * fast instead of silently widening.
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
 * @throws Error for non-integer values under int64/bigint semantics — no
 * bigint literal exists for them.
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
 * Resolve the literal union tokens for a schema carrying `const` or `enum`.
 * Returns undefined when the schema carries neither. An empty enum yields an
 * empty token list (nothing validates → `never`). Integer values under
 * int64/bigint semantics resolve to bigint literal tokens.
 *
 * @internal
 */
function resolveLiteralUnionTokens(schema: CastrSchema): string[] | undefined {
  const asBigIntLiteral = usesBigIntLiterals(schema);
  if (schema.const !== undefined) {
    return [formatLiteralTypeToken(schema.const, asBigIntLiteral)];
  }
  if (schema.enum !== undefined) {
    return [...new Set(schema.enum.map((value) => formatLiteralTypeToken(value, asBigIntLiteral)))];
  }
  return undefined;
}

/**
 * Write `const`/`enum` literal value types. Returns `true` if written.
 *
 * - `const: v` → the literal type of `v`
 * - `enum: [...]` → union of the deduplicated literal types
 * - `enum: []` → `never` (nothing validates)
 *
 * @internal
 */
export function writeLiteralValueType(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  const tokens = resolveLiteralUnionTokens(schema);
  if (tokens === undefined) {
    return false;
  }
  writer.write(tokens.length === 0 ? 'never' : tokens.join(' | '));
  return true;
}

/**
 * Write a union for a multi-type schema (e.g. `type: ['string', 'number']`),
 * rendering each member through the injected single-type writer. An empty
 * type array matches nothing and is written as `never`.
 *
 * @internal
 */
export function writeTypeArrayUnion(
  schema: CastrSchema,
  memberTypes: readonly SchemaObjectType[],
  writer: CodeBlockWriter,
  writeMember: (memberSchema: CastrSchema, memberWriter: CodeBlockWriter) => void,
): void {
  const uniqueMemberTypes = [...new Set(memberTypes)];
  if (uniqueMemberTypes.length === 0) {
    writer.write('never');
    return;
  }
  uniqueMemberTypes.forEach((memberType, index) => {
    writer.conditionalWrite(index > 0, ' | ');
    writeMember({ ...schema, type: memberType }, writer);
  });
}

/**
 * Whether the schema body already renders its own top-level `null` branch —
 * a `null` literal token (`const: null` or `enum` containing null) or a
 * `null` member of a type array. The nullable-metadata append must not
 * duplicate that branch.
 *
 * @internal
 */
export function rendersOwnNullBranch(schema: CastrSchema): boolean {
  if (
    schema.booleanSchema !== undefined ||
    schema.$ref !== undefined ||
    schema.allOf !== undefined ||
    schema.oneOf !== undefined ||
    schema.anyOf !== undefined
  ) {
    return false;
  }
  const literalTokens = resolveLiteralUnionTokens(schema);
  if (literalTokens !== undefined) {
    return literalTokens.some((token) => token === NULL_LITERAL_TOKEN);
  }
  return (
    Array.isArray(schema.type) && schema.type.some((memberType) => memberType === NULL_SCHEMA_TYPE)
  );
}

/**
 * Whether the schema renders as a top-level union (`A | B`), and therefore
 * needs parentheses in positions with higher-precedence operators
 * (`[]` suffix, `&` intersection members).
 *
 * Mirrors the core writer's precedence: boolean schemas, $refs and
 * intersections never render a top-level `|`; oneOf/anyOf render one when
 * more than one deduplicated member survives; literal (`enum`) and
 * type-array schemas render one for more than one unique token.
 *
 * @param schema - Schema whose rendering is being placed
 * @param renderMember - Renders a schema body to text (injected by core)
 *
 * @internal
 */
export function rendersAsTopLevelUnion(
  schema: CastrSchema,
  renderMember: (member: CastrSchema) => string,
): boolean {
  if (
    schema.booleanSchema !== undefined ||
    schema.$ref !== undefined ||
    schema.allOf !== undefined
  ) {
    return false;
  }
  const unionMembers = schema.oneOf ?? schema.anyOf;
  if (unionMembers !== undefined) {
    return new Set(unionMembers.map((member) => renderMember(member))).size > 1;
  }
  const literalTokens = resolveLiteralUnionTokens(schema);
  if (literalTokens !== undefined) {
    return literalTokens.length > 1;
  }
  return Array.isArray(schema.type) && new Set(schema.type).size > 1;
}

/**
 * Whether an array item type must be parenthesised before the `[]` suffix.
 * True for items rendering a top-level `|` (unions, multi-token literals,
 * type arrays, `| null` from nullable) or a top-level `&` (intersections).
 *
 * @param item - Array item schema
 * @param renderMember - Renders a schema body to text (injected by core)
 *
 * @internal
 */
export function arrayItemNeedsParens(
  item: CastrSchema,
  renderMember: (member: CastrSchema) => string,
): boolean {
  if (item.metadata.nullable) {
    return true;
  }
  if (item.booleanSchema !== undefined || item.$ref !== undefined) {
    return false;
  }
  if (item.allOf !== undefined) {
    return item.allOf.length > 1;
  }
  return rendersAsTopLevelUnion(item, renderMember);
}
