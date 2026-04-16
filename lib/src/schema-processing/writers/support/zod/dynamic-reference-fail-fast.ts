import type { CastrSchema } from '../../../ir/index.js';

/**
 * Reject schemas with dynamic reference keywords that cannot be expressed
 * in static Zod code generation.
 *
 * `$anchor` is NOT rejected — it's a reference marker consumed at parse time.
 * `$dynamicRef` and `$dynamicAnchor` require runtime scope resolution that
 * has no static code-gen equivalent.
 */
export function rejectDynamicReferenceKeywords(schema: CastrSchema): void {
  if (schema.$dynamicRef !== undefined) {
    throw new Error(
      'Genuinely impossible: $dynamicRef cannot be represented in Zod. ' +
        '$dynamicRef requires runtime resolution against a dynamic scope chain — ' +
        'there is no static code-gen equivalent.',
    );
  }
  if (schema.$dynamicAnchor !== undefined) {
    throw new Error(
      'Genuinely impossible: $dynamicAnchor cannot be represented in Zod. ' +
        '$dynamicAnchor declares an override point for runtime schema extension — ' +
        'there is no static code-gen equivalent.',
    );
  }
}
