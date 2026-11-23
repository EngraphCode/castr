/**
 * IR Builder - `const`
 *
 * Reads a `const` that decides alone. The writers write a `const` as a literal and
 * nothing beside it, so a `const` is read only where that literal says everything the
 * schema decides. Every other `const` is refused: none is ever read with a keyword left
 * behind.
 *
 * @internal
 */

import type { SchemaObject } from '../../../../shared/openapi-types.js';
import { type CastrSchema, whyConstDoesNotDecideAlone } from '../../../ir/index.js';

/** @internal */
export function addConst(schema: SchemaObject, irSchema: CastrSchema): void {
  // A boolean schema reaches here too, and holds no keyword.
  if (typeof schema !== 'object' || schema.const === undefined) {
    return;
  }
  const reason = whyConstDoesNotDecideAlone(schema);
  if (reason !== undefined) {
    throw new Error(`A const ${reason} is rejected: Castr writes a const as a literal alone.`);
  }
  irSchema.const = schema.const;
}
