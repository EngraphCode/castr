/**
 * JSON Schema Draft 07 → 2020-12 normalization.
 *
 * Pure function that transforms Draft 07 constructs into their 2020-12
 * equivalents. Runs as a pre-processing step before the core parser.
 *
 * Does NOT mutate the input — always returns a new object.
 *
 * **Library Types:**
 * Uses JsonSchema2020 (extends SchemaObject from openapi3-ts/oas31).
 * Uses lodash-es split/join for $ref rewriting (ADR-026 compliant).
 *
 * @module parsers/json-schema/json-schema-parser.normalization
 */

import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import { split, join } from 'lodash-es';
import type { JsonSchema2020 } from './json-schema-parser.types.js';

// ---------------------------------------------------------------------------
// Draft 07 boundary type
// ---------------------------------------------------------------------------

/**
 * Input type for Draft 07 normalization.
 *
 * Uses Omit to strip properties whose types are *wider* in Draft 07 than
 * in the 2020-12 base (exclusiveMinimum/Maximum are boolean|number in
 * Draft 07, number-only in 2020-12; items allows arrays for tuples).
 * This is the incoming external boundary — these keys are validated and
 * removed during normalization.
 */
export type Draft07Input = Omit<
  JsonSchema2020,
  'exclusiveMinimum' | 'exclusiveMaximum' | 'items' | '$defs' | 'dependentSchemas'
> & {
  definitions?: Record<string, Draft07Input | ReferenceObject>;
  dependencies?: Record<string, string[] | Draft07Input | ReferenceObject>;
  /** Draft 07: boolean (companion to minimum) or number (2020-12 style) */
  exclusiveMinimum?: boolean | number;
  /** Draft 07: boolean (companion to maximum) or number (2020-12 style) */
  exclusiveMaximum?: boolean | number;
  /** Draft 07: array for tuple validation, or single schema */
  items?: SchemaObject | ReferenceObject | (SchemaObject | ReferenceObject)[];
  /** Widened to accept Draft07Input during intermediate normalization */
  $defs?: Record<string, Draft07Input | ReferenceObject>;
  /** Widened to accept Draft07Input during intermediate normalization */
  dependentSchemas?: Record<string, Draft07Input | ReferenceObject>;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLASH = '/' as const;
const DEFINITIONS_REF_LEADING = '#' as const;
const DEFINITIONS_REF_SEGMENT = 'definitions' as const;
const DEFS_SEGMENT = '$defs' as const;
const EXPECTED_REF_SEGMENT_COUNT = 3;
const REF_SEGMENT_NAME_INDEX = 2;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Normalize a JSON Schema from Draft 07 to 2020-12 conventions.
 *
 * Accepts Draft 07 input (with `definitions`, `dependencies`, boolean
 * exclusive bounds, tuple `items`) and returns a clean 2020-12 schema.
 *
 * @public
 */
export function normalizeDraft07(input: Draft07Input): JsonSchema2020 {
  let result: Draft07Input = { ...input };

  result = liftDefinitions(result);
  result = splitDependencies(result);
  result = normalizeTupleItems(result);
  result = normalizeExclusiveBounds(result);
  result = normalizeSubSchemas(result);
  result = rewriteRef(result);

  return stripDraft07Keys(result);
}

function stripDraft07Keys(input: Draft07Input): JsonSchema2020 {
  const {
    definitions: _definitions,
    dependencies: _dependencies,
    exclusiveMinimum,
    exclusiveMaximum,
    items,
    $defs,
    dependentSchemas,
    ...clean
  } = input;

  const result: JsonSchema2020 = { ...clean };

  // After normalization, exclusiveMinimum/Maximum are always numeric (or absent)
  if (typeof exclusiveMinimum === 'number') {
    result.exclusiveMinimum = exclusiveMinimum;
  }
  if (typeof exclusiveMaximum === 'number') {
    result.exclusiveMaximum = exclusiveMaximum;
  }
  // After normalization, items is always a single schema (or absent; arrays became prefixItems)
  if (items !== undefined && !Array.isArray(items)) {
    result.items = items;
  }
  // $defs and dependentSchemas need value-level narrowing: iterate to produce
  // Record<string, JsonSchema2020 | ReferenceObject> from the Draft07 record type.
  // The normalizeDraft07 call is a no-op for already-normalized schemas.
  if ($defs !== undefined) {
    result.$defs = narrowSchemaMap($defs);
  }
  if (dependentSchemas !== undefined) {
    result.dependentSchemas = narrowSchemaMap(dependentSchemas);
  }

  return result;
}

/**
 * Narrow a Draft07Input record to JsonSchema2020 by running each schema
 * through normalizeDraft07, which is a no-op for already-normalized values.
 */
function narrowSchemaMap(
  map: Record<string, Draft07Input | ReferenceObject>,
): Record<string, JsonSchema2020 | ReferenceObject> {
  const out: Record<string, JsonSchema2020 | ReferenceObject> = {};
  for (const [k, v] of Object.entries(map)) {
    out[k] = isReferenceObject(v) ? v : normalizeDraft07(v);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Step 1: definitions → $defs
// ---------------------------------------------------------------------------

function liftDefinitions(input: Draft07Input): Draft07Input {
  if (input.definitions === undefined) {
    return input;
  }
  return { ...input, $defs: { ...(input.$defs ?? {}), ...input.definitions } };
}

// ---------------------------------------------------------------------------
// Step 2: dependencies → dependentRequired / dependentSchemas
// ---------------------------------------------------------------------------

function splitDependencies(input: Draft07Input): Draft07Input {
  if (input.dependencies === undefined) {
    return input;
  }
  const depReq: Record<string, string[]> = {};
  const depSch: Record<string, Draft07Input | ReferenceObject> = {};

  for (const [key, value] of Object.entries(input.dependencies)) {
    if (Array.isArray(value)) {
      depReq[key] = value;
    } else {
      depSch[key] = value;
    }
  }

  let result: Draft07Input = { ...input };
  if (Object.keys(depReq).length > 0) {
    result = { ...result, dependentRequired: depReq };
  }
  if (Object.keys(depSch).length > 0) {
    result = { ...result, dependentSchemas: depSch };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Step 3: tuple items array → prefixItems
// ---------------------------------------------------------------------------

function normalizeTupleItems(input: Draft07Input): Draft07Input {
  if (!Array.isArray(input.items)) {
    return input;
  }
  const { items, ...rest } = input;
  return { ...rest, prefixItems: items };
}

// ---------------------------------------------------------------------------
// Step 4: boolean exclusive bounds → numeric
// ---------------------------------------------------------------------------

function normalizeExclusiveBounds(input: Draft07Input): Draft07Input {
  let result = normalizeOneBound(input, 'exclusiveMinimum', 'minimum');
  result = normalizeOneBound(result, 'exclusiveMaximum', 'maximum');
  return result;
}

function normalizeOneBound(
  input: Draft07Input,
  exclKey: 'exclusiveMinimum' | 'exclusiveMaximum',
  boundKey: 'minimum' | 'maximum',
): Draft07Input {
  const excl = input[exclKey];
  if (typeof excl !== 'boolean') {
    return input;
  }
  // Boolean false — strip the exclusive key, keep the bound
  if (!excl) {
    const { [exclKey]: _stripped, ...rest } = input;
    return rest;
  }
  // Boolean true with numeric bound — promote bound to exclusive, strip original bound
  if (typeof input[boundKey] === 'number') {
    const { [exclKey]: _excl, [boundKey]: boundValue, ...rest } = input;
    return { ...rest, [exclKey]: boundValue };
  }
  return input;
}

// ---------------------------------------------------------------------------
// Step 5: Recurse into sub-schemas
// ---------------------------------------------------------------------------

function normalizeSubSchemas(input: Draft07Input): Draft07Input {
  let result = normalizeItems(input);
  result = normalizeSingleSchema(result, 'additionalProperties');
  result = normalizeSingleSchema(result, 'not');
  result = normalizeSchemaArray(result, 'allOf');
  result = normalizeSchemaArray(result, 'oneOf');
  result = normalizeSchemaArray(result, 'anyOf');
  result = normalizeSchemaArray(result, 'prefixItems');
  result = normalizeSchemaMap(result, '$defs');
  result = normalizeSchemaMap(result, 'properties');
  result = normalizeSchemaMap(result, 'dependentSchemas');
  return result;
}

/**
 * Normalize single-schema items (not array — array items were already
 * converted to prefixItems by normalizeTupleItems).
 */
function normalizeItems(input: Draft07Input): Draft07Input {
  const val = input.items;
  if (val === undefined || Array.isArray(val)) {
    return input;
  }
  if (isReferenceObject(val)) {
    return { ...input, items: rewriteRefObject(val) };
  }
  return { ...input, items: normalizeDraft07(val) };
}

function normalizeSingleSchema(
  input: Draft07Input,
  key: 'additionalProperties' | 'not',
): Draft07Input {
  const val = input[key];
  if (val === undefined || typeof val === 'boolean') {
    return input;
  }
  if (isReferenceObject(val)) {
    return { ...input, [key]: rewriteRefObject(val) };
  }
  return { ...input, [key]: normalizeDraft07(val) };
}

function normalizeSchemaArray(
  input: Draft07Input,
  key: 'allOf' | 'oneOf' | 'anyOf' | 'prefixItems',
): Draft07Input {
  const arr = input[key];
  if (arr === undefined) {
    return input;
  }
  return {
    ...input,
    [key]: arr.map((item) =>
      isReferenceObject(item) ? rewriteRefObject(item) : normalizeDraft07(item),
    ),
  };
}

function normalizeSchemaMap(
  input: Draft07Input,
  key: '$defs' | 'properties' | 'dependentSchemas',
): Draft07Input {
  const map = input[key];
  if (map === undefined) {
    return input;
  }
  const normalized: Record<string, SchemaObject | ReferenceObject> = {};
  for (const k of Object.keys(map)) {
    const value = map[k];
    if (value !== undefined) {
      normalized[k] = isReferenceObject(value) ? rewriteRefObject(value) : normalizeDraft07(value);
    }
  }
  return { ...input, [key]: normalized };
}

// Step 6: Rewrite $ref paths (#/definitions/X → #/$defs/X)

function rewriteRef(input: Draft07Input): Draft07Input {
  if (input.$ref === undefined) {
    return input;
  }
  const rewritten = rewriteRefPath(input.$ref);
  return rewritten === input.$ref ? input : { ...input, $ref: rewritten };
}

function rewriteRefObject(ref: ReferenceObject): ReferenceObject {
  const rewritten = rewriteRefPath(ref.$ref);
  return rewritten === ref.$ref ? ref : { ...ref, $ref: rewritten };
}

function rewriteRefPath(path: string): string {
  const segments = split(path, SLASH);
  if (
    segments.length !== EXPECTED_REF_SEGMENT_COUNT ||
    segments[0] !== DEFINITIONS_REF_LEADING ||
    segments[1] !== DEFINITIONS_REF_SEGMENT
  ) {
    return path;
  }
  const name = segments[REF_SEGMENT_NAME_INDEX];
  return name !== undefined ? join([DEFINITIONS_REF_LEADING, DEFS_SEGMENT, name], SLASH) : path;
}
