/**
 * Additional Properties Handling
 *
 * The Zod writer builds an object with `z.strictObject({...})`. A constrained map, the
 * first row of the specification's Appendix B.2, adds `.catchall(S)` to one with no
 * properties (see `collections.ts`). No passthrough or strip modifier is emitted.
 */

import type { CastrSchema } from '../../ir/index.js';
import { isObjectSchemaType } from '../../ir/index.js';

/**
 * Check if a schema should use the `z.strictObject()` constructor.
 *
 * Every object the writer builds starts from the strict constructor.
 *
 * @internal
 */
export function shouldUseStrictObjectConstructor(schema: CastrSchema): boolean {
  return (
    schema.additionalProperties === false ||
    isObjectSchemaType(schema.type) ||
    schema.properties !== undefined
  );
}
