/**
 * Which formats state each element, and a sentence for each element only one states.
 *
 * The lists are computed from the coverage map, which is computed from the formats'
 * pinned definitions, so this is an end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { statedBy, statedOnlyBy } from './stated-by.js';

/**
 * Elements of the shape half that the map shows only JSON Schema stating. Each says what
 * meaning it is, or that another format states it by a way the computed lists do not show.
 */
const ONLY_JSON_SCHEMA: Readonly<Record<string, string>> = {
  'ArrayPart.contains': 'that some items, between two counts, satisfy a shape',
  'ArrayPart.distinct': 'that no two items are equal',
  ByKind: 'what a shape says of each kind of value; Zod states it by its kinds of schema',
  'ByKind.number': 'that a number is accepted; Zod states it too, and its entry is owed',
  'Format.asserted': 'whether a format is checked or only said; Zod always checks',
  'NumberPart.multipleOf':
    'that a number is a multiple of another; Zod states it too, and its entry is owed',
  'ObjectPart.count': 'how many keys an object may have',
  'ObjectPart.names': 'a shape every key must satisfy as a string',
  'ObjectPart.patterns':
    'a shape for each key that matches a pattern; a Zod record over a pattern states it, and its entry is owed',
  'ObjectPart.required': 'that a key is present, said apart from any shape for it',
  Resource: 'a part of a document with an identifier of its own',
  'Resource.dynamicAnchors': 'a name a reference in scope looks for among the resources entered',
  'Resource.id': 'the identifier of a resource',
  'Said.default': 'a value suggested for a place, which inserts nothing',
  'Said.deprecated':
    'that a shape is no longer to be used; a Zod registry states it, outside the computed lists',
  'Said.description': 'words about a shape; a Zod registry states them, outside the computed lists',
  'Said.title': 'a name for a person; a Zod registry states it, outside the computed lists',
  Shape: 'that a composition asserts nothing of its own; true of every format',
  'Shape[not]': 'that a value must not satisfy a shape',
  'Shape[reference-in-scope]': 'a reference resolved by where evaluation came from',
  'Shape[rest-of]': 'a closure over what a composition accounts for',
  'Shape[rest-of].items': 'a shape for the items a composition does not account for',
  'Shape[rest-of].keys': 'a shape for the keys a composition does not account for',
  'Shape[said]': 'something said of a shape that changes nothing it accepts',
  'Shape[some]': 'a choice with no order; Zod’s choices are all ordered or exclusive',
  'Shape[when]': 'a shape that applies only where a test holds',
  'Step[data]': 'the place of a schema inside data its dialect does not read',
  'Step[named]': 'the place of a definition filed under a name',
  'StringPart.patterns':
    'that a string matches a pattern; Zod states it as a format, and its entry is owed',
};

/** The same for Zod. */
const ONLY_ZOD: Readonly<Record<string, string>> = {
  'Shape[absent-becomes]': 'that an absent value becomes a stated one: a default that inserts',
  'Shape[absent-becomes].checked': 'whether the inserted value is checked against the shape first',
  'Shape[all].unknownKeys': 'that the sides of a conjunction reckon unknown keys together',
  'Shape[first]': 'a choice decided by the first branch that accepts, where order is meaning',
};

describe('which formats state each element', () => {
  it('gives a sentence for each element of the shape half only JSON Schema states', () => {
    expect(statedOnlyBy('JSON Schema')).toEqual(Object.keys(ONLY_JSON_SCHEMA));
  });

  it('gives a sentence for each element only Zod states', () => {
    expect(statedOnlyBy('Zod')).toEqual(Object.keys(ONLY_ZOD));
  });

  it('finds 125 elements only OpenAPI states: what a description says of an API’s boundaries', () => {
    // Neither of the other formats describes an API, so the boundary half is OpenAPI's alone.
    expect(statedOnlyBy('OpenAPI')).toHaveLength(125);
  });

  it('finds elements more than one format states', () => {
    const shared = [...statedBy()]
      .filter(([, formats]) => formats.size > 1)
      .map(([element]) => element);

    expect(shared).toContain('ObjectPart.rest');
    expect(shared).toContain('Shape[all]');
    expect(shared).toContain('Shape[values]');
  });
});
