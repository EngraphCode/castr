/**
 * TypeScript Writer - Genuinely Impossible Keyword Guards.
 *
 * Fail-fast rejection for IR keywords that CANNOT be represented
 * in TypeScript output. These are genuine impossibilities — the
 * TypeScript type system has no mechanism for these semantics.
 *
 * Per the Input-Output Pair Compatibility Model: fail-fast is
 * reserved for genuinely impossible output mappings only.
 *
 * @internal
 */

import type { CastrSchema } from '../../../ir/index.js';
import { holdsPropertyNamesThatRefuseNoName } from '../../../ir/index.js';

/**
 * Reject genuinely impossible 2020-12 object keywords.
 *
 * Called before writing an object type to ensure no IR keywords
 * are silently dropped from the output.
 *
 * @internal
 */
export function rejectUnsupportedObjectKeywords(schema: CastrSchema): void {
  rejectConditionalApplicators(schema);
  if (schema.patternProperties !== undefined) {
    throw new Error(
      'Genuinely impossible: patternProperties cannot be represented in TypeScript. ' +
        'TypeScript has no regex-keyed index signatures — property names are ' +
        'statically declared, not dynamically matched by pattern.',
    );
  }
  if (schema.propertyNames !== undefined && !holdsPropertyNamesThatRefuseNoName(schema)) {
    throw new Error(
      'Genuinely impossible: propertyNames cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for constraining property name values ' +
        '(e.g., minLength, pattern, enum) at the type level.',
    );
  }
  if (
    schema.unevaluatedProperties !== undefined &&
    typeof schema.unevaluatedProperties !== 'boolean'
  ) {
    throw new Error(
      'Genuinely impossible: schema-valued unevaluatedProperties cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for tracking which properties were "evaluated" by ' +
        'composition keywords and validating the remainder against a schema.',
    );
  }
}

function rejectConditionalApplicators(schema: CastrSchema): void {
  if (schema.if !== undefined || schema.then !== undefined || schema.else !== undefined) {
    throw new Error(
      'Genuinely impossible: if/then/else conditional applicators cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "validate against sub-schema A; if it passes apply B, ' +
        'otherwise apply C" runtime conditional logic at the type level.',
    );
  }
}

/**
 * Reject genuinely impossible 2020-12 array keywords.
 *
 * Called before writing an array type to ensure no IR keywords
 * are silently dropped from the output.
 *
 * @internal
 */
export function rejectUnsupportedArrayKeywords(schema: CastrSchema): void {
  if (schema.unevaluatedItems !== undefined) {
    throw new Error(
      'Genuinely impossible: unevaluatedItems cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for tracking which array items were "evaluated" by ' +
        'prefixItems/items and validating the remainder.',
    );
  }
  if (schema.minContains !== undefined) {
    throw new Error(
      'Genuinely impossible: minContains cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "at least N items must match schema X" ' +
        'count-based array validation at the type level.',
    );
  }
  if (schema.maxContains !== undefined) {
    throw new Error(
      'Genuinely impossible: maxContains cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "at most N items must match schema X" ' +
        'count-based array validation at the type level.',
    );
  }
  if (schema.contains !== undefined) {
    throw new Error(
      'Genuinely impossible: contains cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "at least one array element must match schema X" ' +
        'existential validation at the type level.',
    );
  }
}

/**
 * Reject schemas with dynamic reference keywords that cannot be expressed
 * in TypeScript's static type system.
 *
 * `$anchor` is NOT rejected — it's a reference marker consumed at parse time.
 * `$dynamicRef` and `$dynamicAnchor` require runtime scope resolution that
 * has no static type-system equivalent.
 *
 * @internal
 */
export function rejectDynamicReferenceKeywords(schema: CastrSchema): void {
  if (schema.$dynamicRef !== undefined) {
    throw new Error(
      'Genuinely impossible: $dynamicRef cannot be represented in TypeScript. ' +
        '$dynamicRef requires runtime resolution against a dynamic scope chain — ' +
        'there is no static type-system equivalent.',
    );
  }
  if (schema.$dynamicAnchor !== undefined) {
    throw new Error(
      'Genuinely impossible: $dynamicAnchor cannot be represented in TypeScript. ' +
        '$dynamicAnchor declares an override point for runtime schema extension — ' +
        'there is no static type-system equivalent.',
    );
  }
}
