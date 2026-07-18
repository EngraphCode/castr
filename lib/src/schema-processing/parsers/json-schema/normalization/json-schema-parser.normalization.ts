/**
 * JSON Schema Draft 07 → 2020-12 normalization.
 *
 * Pure function that transforms Draft 07 constructs into their 2020-12
 * equivalents. Runs as a pre-processing step before the core parser.
 *
 * Does NOT mutate the input — always returns a new object.
 *
 * Sub-schema recursion is driven by the keyword classification on
 * `Draft07SubSchemaKeywords` (see the normalization types module): every
 * classified keyword is widened on `Draft07Input` and must be narrowed
 * back to `JsonSchema2020` by `stripDraft07Keys`, so the compiler rejects
 * a keyword that misses recursion.
 *
 * **Library Types:**
 * Uses JsonSchema2020 (extends the shared OpenAPI seam).
 * Uses lodash-es split/join for $ref rewriting (ADR-026 compliant).
 */

import type { JsonSchema2020 } from '../json-schema-parser.types.js';
import type { Draft07Input } from './json-schema-parser.normalization.types.js';
import { buildBooleanSubSchemaRejectionMessage } from './json-schema-parser.normalization.apply.js';
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
 *
 * Boolean root schemas are already normal in every dialect and have no
 * object form to build here; they are rejected with guidance (spreading a
 * boolean would silently produce `{}`). `parseJsonSchema` and
 * `parseJsonSchemaDocument` accept boolean roots directly.
 *
 * @public
 */
export function normalizeDraft07(input: Draft07Input | boolean): JsonSchema2020 {
  if (typeof input === 'boolean') {
    throw new Error(
      `Boolean JSON Schema \`${String(input)}\` needs no Draft 07 normalization — it is already ` +
        'normal in every dialect. Pass boolean schemas directly to `parseJsonSchema`, ' +
        '`parseJsonSchemaDocument`, or `parseJsonSchemaObject` instead.',
    );
  }

  let result: Draft07Input = { ...input };

  result = liftDefinitions(result);
  result = splitDependencies(result);
  result = normalizeTupleItems(result);
  result = normalizeExclusiveBounds(result);
  result = rewriteRef(result);

  return stripDraft07Keys(result, normalizeDraft07);
}

export type { Draft07Input } from './json-schema-parser.normalization.types.js';

// ---------------------------------------------------------------------------
// Step 3: tuple items array → prefixItems (+ additionalItems → items)
// ---------------------------------------------------------------------------

/**
 * Map the Draft 07 tuple form to 2020-12: array `items` becomes
 * `prefixItems`, and the remainder-item schema `additionalItems` becomes
 * 2020-12 `items` (the same position: it constrains elements beyond the
 * tuple prefix). A boolean `additionalItems` is rejected explicitly —
 * `items` is object-only downstream, and `{ ...false }` would silently
 * invert reject-all into allow-any.
 *
 * Without tuple `items`, Draft 07 says `additionalItems` MUST be ignored
 * (validation §6.4.2); the dead keyword is dropped by `stripDraft07Keys`.
 */
function normalizeTupleItems(input: Draft07Input): Draft07Input {
  if (!Array.isArray(input.items)) {
    return input;
  }
  const { items, additionalItems, ...rest } = input;
  const result: Draft07Input = { ...rest, prefixItems: items };
  if (additionalItems === undefined) {
    return result;
  }
  if (typeof additionalItems === 'boolean') {
    throw new Error(buildBooleanSubSchemaRejectionMessage('additionalItems', additionalItems));
  }
  return { ...result, items: additionalItems };
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
