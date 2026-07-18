/**
 * Shared JSON Schema 2020-12 extension field writers.
 *
 * Handles keywords introduced in 2020-12 that aren't covered by the
 * core field writers: dependentRequired, dependentSchemas, prefixItems,
 * unevaluatedProperties, unevaluatedItems, minContains, maxContains.
 *
 * @internal
 */

import type { CastrSchema } from '../../ir/index.js';
import type {
  JsonSchemaObject,
  WriteBooleanCapableSchemaFn,
  WriteSchemaFn,
} from './json-schema-object.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSortedRecordEntries<T>(record: Record<string, T>): [string, T][] {
  return Object.entries(record).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
}

// ---------------------------------------------------------------------------
// Simple (non-recursive) 2020-12 fields
// ---------------------------------------------------------------------------

/**
 * Write simple JSON Schema 2020-12 keywords
 * (dependentRequired, minContains, maxContains).
 * @internal
 */
export function writeJsonSchema2020SimpleFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
): void {
  if (schema.dependentRequired !== undefined) {
    const sorted: Record<string, string[]> = {};
    for (const [key, requiredKeys] of getSortedRecordEntries(schema.dependentRequired)) {
      sorted[key] = requiredKeys;
    }
    result.dependentRequired = sorted;
  }
  if (schema.minContains !== undefined) {
    result.minContains = schema.minContains;
  }
  if (schema.maxContains !== undefined) {
    result.maxContains = schema.maxContains;
  }
  if (schema.$anchor !== undefined) {
    result['$anchor'] = schema.$anchor;
  }
  if (schema.$dynamicRef !== undefined) {
    result['$dynamicRef'] = schema.$dynamicRef;
  }
  if (schema.$dynamicAnchor !== undefined) {
    result['$dynamicAnchor'] = schema.$dynamicAnchor;
  }
}

// ---------------------------------------------------------------------------
// Recursive 2020-12 fields
// ---------------------------------------------------------------------------

/**
 * Write unevaluatedProperties and unevaluatedItems.
 * @internal
 */
export function writeUnevaluatedFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.unevaluatedProperties !== undefined) {
    result.unevaluatedProperties =
      typeof schema.unevaluatedProperties === 'boolean'
        ? schema.unevaluatedProperties
        : writeSchema(schema.unevaluatedProperties);
  }
  if (schema.unevaluatedItems !== undefined) {
    result.unevaluatedItems =
      typeof schema.unevaluatedItems === 'boolean'
        ? schema.unevaluatedItems
        : writeSchema(schema.unevaluatedItems);
  }
}

/**
 * Write recursive JSON Schema 2020-12 fields
 * (prefixItems, contains, contentSchema, unevaluated*, dependentSchemas,
 * patternProperties, propertyNames, if/then/else).
 *
 * `writeBooleanCapable` is used at the keyword positions whose IR values
 * may be `booleanSchema` nodes (`contentSchema`, `if`/`then`/`else`).
 * `writeUnreachableBranch` is used at `then`/`else` positions that are
 * statically unreachable (see {@link isThenBranchStaticallyUnreachable} and
 * {@link isElseBranchStaticallyUnreachable}); it defaults to
 * `writeBooleanCapable`, so writers that do not distinguish unreachable
 * branches keep their existing behaviour.
 * @internal
 */
export function writeJsonSchema2020RecursiveFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
  writeBooleanCapable: WriteBooleanCapableSchemaFn = writeSchema,
  writeUnreachableBranch: WriteBooleanCapableSchemaFn = writeBooleanCapable,
): void {
  if (schema.prefixItems !== undefined) {
    result.prefixItems = schema.prefixItems.map((item) => writeSchema(item));
  }
  if (schema.contains !== undefined) {
    result['contains'] = writeSchema(schema.contains);
  }
  if (schema.contentSchema !== undefined) {
    result.contentSchema = writeBooleanCapable(schema.contentSchema);
  }
  writeUnevaluatedFields(schema, result, writeSchema);
  if (schema.dependentSchemas !== undefined) {
    const deps: Record<string, JsonSchemaObject> = {};
    for (const [key, depSchema] of getSortedRecordEntries(schema.dependentSchemas)) {
      deps[key] = writeSchema(depSchema);
    }
    result.dependentSchemas = deps;
  }
  writePatternProperties(schema, result, writeSchema);
  writePropertyNames(schema, result, writeSchema);
  writeConditionalApplicators(schema, result, writeBooleanCapable, writeUnreachableBranch);
}

// ---------------------------------------------------------------------------
// patternProperties / propertyNames
// ---------------------------------------------------------------------------

/**
 * Write `patternProperties` from IR to JSON Schema output.
 * @internal
 */
function writePatternProperties(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.patternProperties === undefined) {
    return;
  }

  const output: Record<string, JsonSchemaObject> = {};
  for (const [pattern, patternSchema] of getSortedRecordEntries(schema.patternProperties)) {
    output[pattern] = writeSchema(patternSchema);
  }
  result.patternProperties = output;
}

/**
 * Write `propertyNames` from IR to JSON Schema output.
 * @internal
 */
function writePropertyNames(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.propertyNames === undefined) {
    return;
  }

  result.propertyNames = writeSchema(schema.propertyNames);
}

// ---------------------------------------------------------------------------
// if / then / else conditional applicators
// ---------------------------------------------------------------------------

/**
 * Is the `then` branch statically unreachable — can it ever constrain
 * instances?
 *
 * JSON Schema 2020-12 (core §10.2.2): when `if` is absent, `then` and `else`
 * MUST be entirely ignored, so they expose no validation semantics. A literal
 * boolean `if` fixes the conditional outcome the same way: `if: false` never
 * validates, so `then` never applies. Non-boolean `if` schemas (including
 * `$ref` nodes, whose outcome is not statically known here) keep the branch
 * reachable.
 *
 * The capability preflight (`compatibility/integer-target-capabilities`
 * traversal) skips unreachable branches under the same rule; writers that
 * re-run capability assertions during recursion consult this predicate so the
 * guard and the writer stay coherent — the branch is still emitted verbatim
 * (losslessness), only the capability assertion on content that can never
 * apply is skipped.
 *
 * @returns `true` when the `then` branch can never apply
 * @internal
 */
export function isThenBranchStaticallyUnreachable(schema: CastrSchema): boolean {
  return schema.if === undefined || schema.if.booleanSchema === false;
}

/**
 * Is the `else` branch statically unreachable — can it ever constrain
 * instances?
 *
 * Mirror of {@link isThenBranchStaticallyUnreachable}: `else` never applies
 * when `if` is absent (ignored per 2020-12 core §10.2.2) or when a literal
 * `if: true` always validates.
 *
 * @returns `true` when the `else` branch can never apply
 * @internal
 */
export function isElseBranchStaticallyUnreachable(schema: CastrSchema): boolean {
  return schema.if === undefined || schema.if.booleanSchema === true;
}

/**
 * Write `if`/`then`/`else` conditional applicators from IR to JSON Schema output.
 *
 * These positions are boolean-capable: `booleanSchema` IR nodes are
 * emitted as JSON Schema booleans by writers that support them.
 * Statically-unreachable branches are written via `writeUnreachableBranch`
 * (see {@link isThenBranchStaticallyUnreachable} and
 * {@link isElseBranchStaticallyUnreachable}).
 * @internal
 */
function writeConditionalApplicators(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeBooleanCapable: WriteBooleanCapableSchemaFn,
  writeUnreachableBranch: WriteBooleanCapableSchemaFn,
): void {
  if (schema.if !== undefined) {
    result.if = writeBooleanCapable(schema.if);
  }
  if (schema.then !== undefined) {
    const writeThen = isThenBranchStaticallyUnreachable(schema)
      ? writeUnreachableBranch
      : writeBooleanCapable;
    result.then = writeThen(schema.then);
  }
  if (schema.else !== undefined) {
    const writeElse = isElseBranchStaticallyUnreachable(schema)
      ? writeUnreachableBranch
      : writeBooleanCapable;
    result.else = writeElse(schema.else);
  }
}
