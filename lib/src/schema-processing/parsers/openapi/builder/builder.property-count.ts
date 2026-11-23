/**
 * IR Builder - `minProperties` and `maxProperties`
 *
 * The model has no place for a count of an object's properties, and no writer writes
 * one. A schema that holds either keyword is refused, wherever it stands, so the count is
 * never read past and left behind.
 *
 * @internal
 */

import type { ReferenceObject, SchemaObject } from '../../../../shared/openapi-types.js';

/** Keywords that count an object's properties. */
const PROPERTY_COUNT_KEYWORDS = ['minProperties', 'maxProperties'] as const;

/**
 * Refuse a schema that holds a count of properties, naming where it stands. It is given
 * a reference too: the reader keeps a reference's `$ref` and none of the keywords beside
 * it.
 *
 * @internal
 */
export function rejectPropertyCount(
  schema: SchemaObject | ReferenceObject,
  path: readonly string[],
): void {
  // A boolean schema reaches here too, and holds no keyword.
  if (typeof schema !== 'object') {
    return;
  }
  const held = PROPERTY_COUNT_KEYWORDS.find(
    (keyword) => Reflect.get(schema, keyword) !== undefined,
  );
  if (held !== undefined) {
    throw new Error(
      `A schema that holds ${held} is rejected, at ${path.join('/')}: ` +
        `Castr's model does not carry ${held}, ` +
        'so the constraint would be dropped.',
    );
  }
}
