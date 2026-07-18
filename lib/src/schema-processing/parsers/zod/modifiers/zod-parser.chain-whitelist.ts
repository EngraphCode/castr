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
 * presence (.optional(), .nullable(), .nullish()), statically
 * extractable .default(), and literal .describe() — into IR metadata so
 * composite parsers (object, array, tuple, enum, union, intersection)
 * preserve them rather than dropping them.
 *
 * A recognised modifier whose argument cannot be captured statically
 * (identifiers, computed values) fails fast instead of no-oping, so the
 * whitelist can never accept a method name while silently discarding
 * its argument.
 */

import type { CastrSchema } from '../../../ir/index.js';
import type { Node } from 'ts-morph';
import {
  describeNodeLocation,
  extractStaticJsonValue,
  throwUnsupportedMethodArgument,
  type ZodMethodCall,
} from '../ast/zod-ast.js';
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
 *
 * Serialises with JSON.stringify so string defaults containing quotes,
 * backslashes, or line breaks — and array/object defaults — stay valid
 * Zod source for the writer.
 *
 * @internal
 */
export function collectDefaults(defaultValue: unknown): string[] {
  if (defaultValue === undefined) {
    return [];
  }
  return [`.default(${JSON.stringify(defaultValue)})`];
}

/**
 * Extract a .default() argument's statically known value.
 *
 * Fails fast when the argument is missing or cannot be extracted
 * statically (identifiers, computed values), so a recognised .default()
 * can never no-op silently.
 *
 * @internal
 */
export function extractDefaultArgumentValue(method: ZodMethodCall): unknown {
  const argNode = method.argNodes[0];
  const value = argNode === undefined ? undefined : extractStaticJsonValue(argNode);
  if (value === undefined) {
    throwUnsupportedMethodArgument(
      ZOD_METHOD_DEFAULT,
      'a statically extractable literal (string, number, boolean, null, array, or object)',
      argNode,
    );
  }
  return value;
}

/**
 * Extract the last chained .default() value from a method chain.
 * @internal
 */
function extractChainDefaultValue(methods: readonly ZodMethodCall[]): unknown {
  let defaultValue: unknown;
  for (const method of methods) {
    if (method.name !== ZOD_METHOD_DEFAULT) {
      continue;
    }
    defaultValue = extractDefaultArgumentValue(method);
  }
  return defaultValue;
}

/**
 * Capture a chained .default() into a schema's metadata.
 * No-op when the chain has no .default() call.
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
// Description capture
// ============================================================================

/**
 * Extract the last chained .describe() string literal from a method chain.
 *
 * `.describe()` is representable (CastrSchema.description), so it must be
 * captured, not rejected. A non-literal argument (computed string) fails
 * fast: its value cannot be captured statically, and silently dropping it
 * would be lossy.
 *
 * @internal
 */
function extractChainDescription(methods: readonly ZodMethodCall[]): string | undefined {
  let description: string | undefined;
  for (const method of methods) {
    if (method.name !== ZOD_METHOD_DESCRIBE) {
      continue;
    }
    description = extractDescribeArgumentValue(method);
  }
  return description;
}

/**
 * Extract a .describe() argument's string literal value.
 * Fails fast on missing or non-literal arguments: their value cannot be
 * captured statically, and silently dropping them would be lossy.
 *
 * @internal
 */
export function extractDescribeArgumentValue(method: ZodMethodCall): string {
  const argNode = method.argNodes[0];
  const value = argNode === undefined ? undefined : extractStaticJsonValue(argNode);
  if (typeof value !== 'string') {
    throwUnsupportedMethodArgument(ZOD_METHOD_DESCRIBE, 'a string literal', argNode);
  }
  return value;
}

/**
 * Capture a chained literal .describe() into a schema's description.
 * No-op when the chain has no .describe() call.
 * @internal
 */
export function applyChainDescription(
  schema: CastrSchema,
  methods: readonly ZodMethodCall[],
): void {
  const description = extractChainDescription(methods);
  if (description === undefined) {
    return;
  }
  schema.description = description;
}

// ============================================================================
// Chain whitelist enforcement
// ============================================================================

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
 * parser recognises (.meta(), .default(), .describe(), presence) plus any
 * kind-specific extras (e.g. array constraint methods, tuple .rest()).
 *
 * @internal
 */
export function buildCompositeChainMethods(
  ...extraMethods: readonly string[]
): ReadonlySet<string> {
  return new Set([
    ZOD_METHOD_META,
    ZOD_METHOD_DEFAULT,
    ZOD_METHOD_DESCRIBE,
    ...PRESENCE_CHAIN_METHODS,
    ...extraMethods,
  ]);
}

/**
 * Apply the shared recognised chain modifiers (presence, literal default,
 * literal describe, meta) to a composite schema and return it. Passes
 * undefined through so callers can chain directly on their kind-specific
 * parse result.
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
  applyChainDescription(schema, chainedMethods);
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
