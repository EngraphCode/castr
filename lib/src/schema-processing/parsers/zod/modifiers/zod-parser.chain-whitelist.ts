/**
 * Zod Chain Whitelist — strict fail-fast handling of chained methods.
 *
 * Implements the strict-whitelist parsing doctrine (finding C5): any
 * union/tuple/enum member or chained method the parser does not recognise
 * must throw, so the declaration-level error channel records a structured
 * PARSE_ERROR naming the construct and its source location, instead of the
 * construct being silently dropped or text-captured.
 *
 * Also provides the shared capture of recognised chained modifiers —
 * presence (.optional(), .nullable(), .nullish()) and literal .default() —
 * into IR metadata so composite parsers (object, array, tuple, enum, union)
 * preserve them rather than dropping them.
 *
 * Known shared limitation: .default() capture only extracts statically
 * extractable literal arguments; non-literal arguments (identifiers,
 * array/object literals) yield no captured default. This mirrors the
 * primitive chain behaviour.
 */

import type { CastrSchema } from '../../../ir/index.js';
import { Node } from 'ts-morph';
import { extractLiteralValue, type ZodMethodCall } from '../ast/zod-ast.js';
import type { ParsedOptionality } from './zod-parser.constraints.js';
import {
  NUMBER_CHAIN_METHODS,
  NUMERIC_BASE_METHODS,
  STRING_CHAIN_METHODS,
  processOptionalityMethod,
} from './zod-parser.constraints.js';
import { applyMetaAndReturn } from './zod-parser.meta.js';
import { isZod3Method } from '../zod-parser.detection.js';
import {
  ZOD_METHOD_DEFAULT,
  ZOD_METHOD_DESCRIBE,
  ZOD_METHOD_META,
  ZOD_METHOD_NULLABLE,
  ZOD_METHOD_NULLISH,
  ZOD_METHOD_OPTIONAL,
  ZOD_SCHEMA_TYPE_STRING,
} from '../zod-constants.js';

// ============================================================================
// Presence capture
// ============================================================================

/**
 * Chained presence modifier method names.
 * @internal
 */
export const PRESENCE_CHAIN_METHODS: ReadonlySet<string> = new Set([
  ZOD_METHOD_OPTIONAL,
  ZOD_METHOD_NULLABLE,
  ZOD_METHOD_NULLISH,
]);

/**
 * Render an optionality state as its canonical Zod presence chain string.
 * @internal
 */
export function computePresence(optionality: ParsedOptionality): string {
  if (optionality.optional && optionality.nullable) {
    return '.nullish()';
  }
  if (optionality.optional) {
    return '.optional()';
  }
  if (optionality.nullable) {
    return '.nullable()';
  }
  return '';
}

/**
 * Reduce a method chain to its combined optionality state.
 * @internal
 */
function extractChainOptionality(methods: readonly ZodMethodCall[]): ParsedOptionality {
  const optionality: ParsedOptionality = { optional: false, nullable: false };
  for (const method of methods) {
    processOptionalityMethod(method, optionality);
  }
  return optionality;
}

/**
 * Capture chained presence modifiers into a schema's metadata.
 *
 * Sets `metadata.required`, `metadata.nullable`, and the canonical
 * `metadata.zodChain.presence` string. No-op when the chain carries
 * no presence modifiers.
 *
 * @internal
 */
export function applyChainPresence(schema: CastrSchema, methods: readonly ZodMethodCall[]): void {
  const optionality = extractChainOptionality(methods);
  if (!optionality.optional && !optionality.nullable) {
    return;
  }
  schema.metadata.required = !optionality.optional;
  schema.metadata.nullable = schema.metadata.nullable || optionality.nullable;
  schema.metadata.zodChain.presence = computePresence(optionality);
}

// ============================================================================
// Default capture
// ============================================================================

/**
 * Render a captured default value as its canonical Zod chain string list.
 * @internal
 */
export function collectDefaults(defaultValue: unknown): string[] {
  if (defaultValue === undefined) {
    return [];
  }
  const val = typeof defaultValue === 'string' ? `"${defaultValue}"` : String(defaultValue);
  return [`.default(${val})`];
}

/**
 * Extract the last chained .default() literal value from a method chain.
 * @internal
 */
function extractChainDefaultValue(methods: readonly ZodMethodCall[]): unknown {
  let defaultValue: unknown;
  for (const method of methods) {
    if (method.name !== ZOD_METHOD_DEFAULT) {
      continue;
    }
    const argNode = method.argNodes[0];
    defaultValue = argNode === undefined ? undefined : extractLiteralValue(argNode);
  }
  return defaultValue;
}

/**
 * Capture a chained literal .default() into a schema's metadata.
 * No-op when the chain has no .default() with an extractable literal.
 * @internal
 */
export function applyChainDefault(schema: CastrSchema, methods: readonly ZodMethodCall[]): void {
  const defaultValue = extractChainDefaultValue(methods);
  if (defaultValue === undefined) {
    return;
  }
  schema.metadata.default = defaultValue;
  schema.metadata.zodChain.defaults = collectDefaults(defaultValue);
}

// ============================================================================
// Fail-fast helpers
// ============================================================================

const MAX_EXPRESSION_DESCRIPTION_DEPTH = 6;

/**
 * Format a node's 1-indexed source position for error messages.
 * Returns an empty string when no node is available.
 *
 * @internal
 */
export function describeNodeLocation(node: Node | undefined): string {
  if (!node) {
    return '';
  }
  const { line, column } = node.getSourceFile().getLineAndColumnAtPos(node.getStart());
  return ` at line ${line}, column ${column}`;
}

/**
 * Describe an expression for error messages using semantic APIs only
 * (ADR-026): symbol names for identifiers, property names for member
 * accesses, and syntax-kind names as the fallback.
 *
 * @internal
 */
function describeZodExpression(node: Node, depth = 0): string {
  if (depth > MAX_EXPRESSION_DESCRIPTION_DEPTH) {
    return node.getKindName();
  }
  if (Node.isIdentifier(node)) {
    return node.getSymbol()?.getName() ?? node.getKindName();
  }
  if (Node.isCallExpression(node)) {
    return `${describeZodExpression(node.getExpression(), depth + 1)}()`;
  }
  if (Node.isPropertyAccessExpression(node)) {
    return `${describeZodExpression(node.getExpression(), depth + 1)}.${node.getName()}`;
  }
  return node.getKindName();
}

/**
 * Fail fast on a member schema the parser cannot represent.
 *
 * @param memberContext - Human-readable slot description, e.g. "z.union member"
 * @param memberNode - The AST node of the unrecognised member expression
 *
 * @internal
 */
export function throwUnsupportedMemberSchema(memberContext: string, memberNode: Node): never {
  throw new Error(
    `Unsupported ${memberContext} "${describeZodExpression(memberNode)}"` +
      `${describeNodeLocation(memberNode)}. ` +
      'The Zod parser fails fast on unrecognised constructs instead of silently dropping them.',
  );
}

/**
 * Enforce a strict whitelist over a Zod method chain.
 *
 * Throws for the first chained method that is not in the allowed set,
 * naming the method and its source location. Callers pass the chain's
 * base construct (e.g. "z.strictObject()") for context and the chain's
 * AST node as a location fallback for argument-less methods.
 *
 * Zod 3 methods are exempt: the detection pass already records a
 * structured ZOD3_SYNTAX error (with location) for every occurrence,
 * so the parse result is never silently lossy for them, and throwing
 * here as well would double-report the same construct.
 *
 * @internal
 */
export function assertSupportedChainedMethods(
  baseConstruct: string,
  chainedMethods: readonly ZodMethodCall[],
  allowedMethods: ReadonlySet<string>,
  chainNode?: Node,
): void {
  for (const method of chainedMethods) {
    if (allowedMethods.has(method.name) || isZod3Method(method.name)) {
      continue;
    }
    const locationNode = method.argNodes[0] ?? chainNode;
    throw new Error(
      `Unsupported chained method ".${method.name}(...)" on ${baseConstruct}` +
        `${describeNodeLocation(locationNode)}. ` +
        'The Zod parser fails fast on unrecognised chained methods instead of ' +
        'silently dropping or text-capturing them.',
    );
  }
}

// ============================================================================
// Whitelist builders and shared finalisation
// ============================================================================

/**
 * Build a composite-parser chain whitelist: the modifiers every composite
 * parser recognises (.meta(), .default(), presence) plus any kind-specific
 * extras (e.g. array constraint methods, tuple .rest()).
 *
 * @internal
 */
export function buildCompositeChainMethods(
  ...extraMethods: readonly string[]
): ReadonlySet<string> {
  return new Set([ZOD_METHOD_META, ZOD_METHOD_DEFAULT, ...PRESENCE_CHAIN_METHODS, ...extraMethods]);
}

/**
 * Apply the shared recognised chain modifiers (presence, literal default,
 * meta) to a composite schema and return it. Passes undefined through so
 * callers can chain directly on their kind-specific parse result.
 *
 * @internal
 */
export function finalizeCompositeSchema<T extends CastrSchema>(
  schema: T | undefined,
  chainedMethods: ZodMethodCall[],
): T | undefined {
  if (!schema) {
    return undefined;
  }
  applyChainPresence(schema, chainedMethods);
  applyChainDefault(schema, chainedMethods);
  return applyMetaAndReturn(schema, chainedMethods);
}

/**
 * Chained methods recognised on every primitive base method.
 * @internal
 */
const PRIMITIVE_COMMON_CHAIN_METHODS: ReadonlySet<string> = new Set([
  ...PRESENCE_CHAIN_METHODS,
  ZOD_METHOD_DEFAULT,
  ZOD_METHOD_DESCRIBE,
  ZOD_METHOD_META,
]);

/**
 * Build the strict whitelist of chained methods for a primitive base.
 *
 * Common modifiers are always allowed; string-typed bases additionally
 * accept the string constraint/format methods and numeric bases accept
 * the number constraint methods.
 *
 * @internal
 */
function buildAllowedPrimitiveChainMethods(
  baseMethod: string,
  schemaType: CastrSchema['type'],
): ReadonlySet<string> {
  const allowed = new Set(PRIMITIVE_COMMON_CHAIN_METHODS);
  if (schemaType === ZOD_SCHEMA_TYPE_STRING) {
    for (const method of STRING_CHAIN_METHODS) {
      allowed.add(method);
    }
  }
  if (NUMERIC_BASE_METHODS.has(baseMethod)) {
    for (const method of NUMBER_CHAIN_METHODS) {
      allowed.add(method);
    }
  }
  return allowed;
}

/**
 * Enforce the primitive strict whitelist for a base method's chain.
 * Anything outside the whitelist fails fast (finding C5).
 *
 * @internal
 */
export function assertSupportedPrimitiveChain(
  baseMethod: string,
  schemaType: CastrSchema['type'],
  chainedMethods: readonly ZodMethodCall[],
  chainNode: Node,
): void {
  assertSupportedChainedMethods(
    `z.${baseMethod}()`,
    chainedMethods,
    buildAllowedPrimitiveChainMethods(baseMethod, schemaType),
    chainNode,
  );
}
