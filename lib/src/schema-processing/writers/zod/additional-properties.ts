/**
 * Additional Properties Handling
 *
 * Under IDENTITY doctrine, all objects are closed-world. The Zod writer
 * always uses `z.strictObject({...})` for object construction.
 * No passthrough, catchall, or strip modifiers are emitted.
 *
 * @module writers/zod/additional-properties
 */

import type { CastrSchema } from '../../ir/index.js';
import { isObjectSchemaType } from '../../ir/index.js';

/**
 * Check if a schema should use the `z.strictObject()` constructor.
 *
 * Under IDENTITY doctrine, all objects use strict construction.
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
