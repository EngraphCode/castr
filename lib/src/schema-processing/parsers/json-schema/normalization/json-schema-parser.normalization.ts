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
 * @module parsers/json-schema/normalization/json-schema-parser.normalization
 */

import type { ReferenceObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type { JsonSchema2020 } from '../json-schema-parser.types.js';
import type { Draft07Input } from './json-schema-parser.normalization.types.js';
import {
  liftDefinitions,
  splitDependencies,
  stripDraft07Keys,
} from './json-schema-parser.normalization.helpers.js';
import { rewriteRef, rewriteRefObject } from './json-schema-parser.normalization.refs.js';

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

  return stripDraft07Keys(result, normalizeDraft07);
}

export type { Draft07Input } from './json-schema-parser.normalization.types.js';

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
  const normalized: Record<string, Draft07Input | ReferenceObject> = {};
  for (const k of Object.keys(map)) {
    const value = map[k];
    if (value !== undefined) {
      normalized[k] = isReferenceObject(value) ? rewriteRefObject(value) : normalizeDraft07(value);
    }
  }
  return { ...input, [key]: normalized };
}
