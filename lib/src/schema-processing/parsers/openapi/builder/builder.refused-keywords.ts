/**
 * IR Builder - keywords the model this reader builds does not carry
 *
 * A schema that holds one of these keywords is refused, with the place it stands. Read
 * past and left behind, each would be dropped without a word, and the schema Castr
 * writes would accept what the source refuses.
 *
 * - `minProperties` and `maxProperties`: the model has no place for a count of an
 *   object's properties, and no writer writes one.
 * - `not`, `if`, `then` and `else`: the model has a place for each, and this reader does
 *   not fill it. Each is refused until the scope-and-fidelity tables give it a row.
 *
 * @internal
 */

import type { ReferenceObject, SchemaObject } from '../../../../shared/openapi-types.js';

/** Each refused keyword, with why it is refused. */
const REFUSED_KEYWORDS: readonly (readonly [keyword: string, why: string])[] = [
  ['minProperties', "Castr's model does not carry a count of properties"],
  ['maxProperties', "Castr's model does not carry a count of properties"],
  ['not', 'the OpenAPI reader does not read it into the model'],
  ['if', 'the OpenAPI reader does not read it into the model'],
  ['then', 'the OpenAPI reader does not read it into the model'],
  ['else', 'the OpenAPI reader does not read it into the model'],
];

/**
 * Refuse a schema that holds a keyword the model would not carry, naming where it
 * stands. It is given a reference too: the reader keeps a reference's `$ref` and none of
 * the keywords beside it.
 *
 * @internal
 */
export function rejectKeywordsNotCarried(
  schema: SchemaObject | ReferenceObject,
  path: readonly string[],
): void {
  // A boolean schema reaches here too, and holds no keyword.
  if (typeof schema !== 'object') {
    return;
  }
  const held = REFUSED_KEYWORDS.find(([keyword]) => Reflect.get(schema, keyword) !== undefined);
  if (held !== undefined) {
    const [keyword, why] = held;
    throw new Error(
      `A schema that holds the keyword ${keyword} is rejected, at ${path.join('/')}: ${why}, ` +
        'so the constraint would be dropped.',
    );
  }
}
