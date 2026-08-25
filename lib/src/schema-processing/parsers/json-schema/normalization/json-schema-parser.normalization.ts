/**
 * JSON Schema Draft 07 → 2020-12 normalization.
 *
 * Pure function that transforms Draft 07 constructs into their 2020-12
 * equivalents. Runs as a pre-processing step before the core parser.
 *
 * Does NOT mutate the input — always returns a new object.
 *
 * **Library Types:**
 * Uses JsonSchema2020 (extends the shared OpenAPI seam).
 * Uses lodash-es split/join for $ref rewriting (ADR-026 compliant).
 */

import type { JsonSchema2020 } from '../json-schema-parser.types.js';
import type { Draft07Input } from './json-schema-parser.normalization.types.js';
import {
  liftDefinitions,
  splitDependencies,
  stripDraft07Keys,
} from './json-schema-parser.normalization.helpers.js';
import { rewriteRef } from './json-schema-parser.normalization.refs.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Normalize a JSON Schema from Draft 07 to 2020-12 conventions.
 *
 * Accepts Draft 07 input (with `definitions`, `dependencies`, boolean
 * exclusive bounds, tuple `items`) and returns a clean 2020-12 schema.
 * Boolean schemas (`true`/`false`) are complete schemas in both drafts and
 * pass through unchanged — spreading one into an object would silently
 * turn `false` into `{}` (defect F-03).
 *
 * @public
 */
export function normalizeDraft07(input: Draft07Input): JsonSchema2020;
export function normalizeDraft07(input: boolean): boolean;
export function normalizeDraft07(input: Draft07Input | boolean): JsonSchema2020 | boolean;
// eslint-disable-next-line sonarjs/function-return-type -- JC: a JSON Schema document is an object or a boolean schema by specification; the overloads above give each caller the exact type.
export function normalizeDraft07(input: Draft07Input | boolean): JsonSchema2020 | boolean {
  if (typeof input === 'boolean') {
    return input;
  }
  return normalizeDraft07Object(input);
}

/**
 * Object-schema normalization pipeline. The recursion in
 * `stripDraft07Keys` routes booleans past this function (they need no
 * normalization), so the pipeline itself only ever sees objects.
 * @internal
 */
function normalizeDraft07Object(input: Draft07Input): JsonSchema2020 {
  let result: Draft07Input = { ...input };

  result = liftDefinitions(result);
  result = splitDependencies(result);
  result = normalizeTupleItems(result);
  result = normalizeExclusiveBounds(result);
  result = rewriteRef(result);

  return stripDraft07Keys(result, normalizeDraft07Object);
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

// Sub-schema recursion lives in a single place: `stripDraft07Keys` re-normalises
// every recursive position through `normalizeDraft07` itself. A second pre-pass
// here would duplicate that work per nesting level (O(2^depth)) and split the
// boolean-schema handling across two sites.
