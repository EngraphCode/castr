/**
 * TypeScript Writer - Literal Value and Type-Array Support.
 *
 * Faithful emission of `const`/`enum` literal types and multi-type
 * (`type: [...]`) unions, plus the parenthesisation predicates the core
 * writer needs to place those unions in higher-precedence positions.
 * Literal tokens come from `literal-token-resolution.ts`, which applies the
 * conjunctive `type` ∧ `const` ∧ `enum` intersection.
 *
 * Callback parameters (`renderMember`, `writeMember`, `writeComposition`)
 * are injected by the core writer to avoid a circular module dependency on
 * its recursive writer functions.
 *
 * @internal
 */

import { CodeBlockWriter, type WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../../../ir/index.js';
import type { SchemaObjectType } from '../../../../shared/openapi-types.js';
import { hasCompositionKeywords, resolveLiteralUnionTokens } from './literal-token-resolution.js';

const NULL_SCHEMA_TYPE: SchemaObjectType = 'null';
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
 * Write `const`/`enum` literal value types. Returns `true` if written.
 *
 * - `const: v` → the literal type of `v`
 * - `enum: [...]` → union of the deduplicated literal types intersected with
 *   the declared `type` set
 * - empty intersection (including `enum: []`) → `never` (nothing validates)
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
 * Write a composition that carries a sibling `const`/`enum` constraint.
 * JSON Schema applies both conjunctively, so the output is
 * `(composition) & (literal union)` — an empty literal intersection means
 * nothing validates and is written as `never`. Returns `true` if written.
 *
 * @param schema - Schema carrying both composition and literal keywords
 * @param writer - Destination writer
 * @param writeComposition - Renders the composition body (injected by core)
 *
 * @internal
 */
export function writeCompositionLiteralConjunction(
  schema: CastrSchema,
  writer: CodeBlockWriter,
  writeComposition: (schema: CastrSchema, writer: CodeBlockWriter) => boolean,
): boolean {
  if (!hasCompositionKeywords(schema)) {
    return false;
  }
  const literalTokens = resolveLiteralUnionTokens(schema);
  if (literalTokens === undefined) {
    return false;
  }
  if (literalTokens.length === 0) {
    writer.write('never');
    return true;
  }
  const compositionNeedsParens = (schema.oneOf ?? schema.anyOf) !== undefined;
  writer.conditionalWrite(compositionNeedsParens, '(');
  writeComposition(schema, writer);
  writer.conditionalWrite(compositionNeedsParens, ')');
  writer.write(' & ');
  const literalNeedsParens = literalTokens.length > 1;
  writer.conditionalWrite(literalNeedsParens, '(');
  writer.write(literalTokens.join(' | '));
  writer.conditionalWrite(literalNeedsParens, ')');
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
  if (schema.booleanSchema !== undefined || schema.$ref !== undefined) {
    return false;
  }
  if (hasCompositionKeywords(schema)) {
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
 * Whether the schema's rendering can never open with a top-level `|`:
 * boolean schemas, $refs and allOf intersections.
 *
 * @internal
 */
function rendersWithoutTopLevelUnion(schema: CastrSchema): boolean {
  return (
    schema.booleanSchema !== undefined || schema.$ref !== undefined || schema.allOf !== undefined
  );
}

/**
 * Whether the schema renders as a top-level union (`A | B`), and therefore
 * needs parentheses in positions with higher-precedence operators
 * (`[]` suffix, `&` intersection members).
 *
 * Mirrors the core writer's precedence: boolean schemas, $refs and
 * intersections never render a top-level `|`; oneOf/anyOf render one when
 * more than one deduplicated member survives (unless a sibling literal
 * constraint turns the rendering into a top-level `&`); literal (`enum`)
 * and type-array schemas render one for more than one unique token.
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
  if (rendersWithoutTopLevelUnion(schema)) {
    return false;
  }
  const literalTokens = resolveLiteralUnionTokens(schema);
  const unionMembers = schema.oneOf ?? schema.anyOf;
  if (unionMembers !== undefined) {
    if (literalTokens !== undefined) {
      // Composition ∧ literal renders `(union) & (literals)` — a top-level
      // `&` (or bare `never` for an empty intersection), never a `|`.
      return false;
    }
    return new Set(unionMembers.map((member) => renderMember(member))).size > 1;
  }
  if (literalTokens !== undefined) {
    return literalTokens.length > 1;
  }
  return Array.isArray(schema.type) && new Set(schema.type).size > 1;
}

/**
 * Whether an array item type must be parenthesised before the `[]` suffix.
 * True for items rendering a top-level `|` (unions, multi-token literals,
 * type arrays, `| null` from nullable) or a top-level `&` (intersections,
 * composition ∧ literal conjunctions).
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
  if (hasCompositionKeywords(item)) {
    const literalTokens = resolveLiteralUnionTokens(item);
    if (literalTokens !== undefined) {
      // Composition ∧ literal renders `(composition) & (literals)` — a
      // top-level `&` — unless the intersection is empty (`never`).
      return literalTokens.length > 0;
    }
  }
  if (item.allOf !== undefined) {
    return item.allOf.length > 1;
  }
  return rendersAsTopLevelUnion(item, renderMember);
}
