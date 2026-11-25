/**
 * The coverage map, held to the computed lists and to the prototype's own elements.
 *
 * The lists are recomputed from the pinned definitions of the formats and the elements
 * are read from `model.ts` through the compiler, so this is an end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import {
  dialect2020OwnNames,
  draft07Keywords,
  draft07TypeValues,
  schemaKeywords,
  schemaTypeValues,
} from '../rows/published-rows.js';

import {
  DIALECT_2020_12_OWN_NAMES,
  DRAFT_07,
  DRAFT_2020_12,
  TYPE_VALUES,
  type Coverage,
} from './coverage.js';
import { elements } from './elements.js';

const LISTS: readonly (readonly [string, readonly string[], Readonly<Record<string, Coverage>>])[] =
  [
    [
      'Draft 2020-12 keyword',
      schemaKeywords(loadDefinition).map((one) => one.keyword),
      DRAFT_2020_12,
    ],
    ['Draft-07 keyword', draft07Keywords(loadDefinition).map((one) => one.keyword), DRAFT_07],
    ['Draft 2020-12 type', schemaTypeValues(loadDefinition), TYPE_VALUES],
    ['Draft-07 type', draft07TypeValues(loadDefinition), TYPE_VALUES],
    [
      'Draft 2020-12 name outside its vocabularies',
      dialect2020OwnNames(loadDefinition).map((one) => one.name),
      DIALECT_2020_12_OWN_NAMES,
    ],
  ];

describe('the elements of the prototype', () => {
  const known = elements();

  it('are its types, their properties, and the members of a union by their literal', () => {
    expect(
      ['ObjectPart', 'ObjectPart.rest', 'Shape[when]', 'Shape[rest-of].keys'].filter(
        (name) => !known.has(name),
      ),
    ).toEqual([]);
  });

  it('do not include a name the types do not have', () => {
    expect(
      ['Shape[keyed]', 'ObjectPart.additional', 'Table'].filter((name) => known.has(name)),
    ).toEqual([]);
  });
});

describe('the coverage map', () => {
  it('has an entry for every kind computed, and none for a kind that is gone', () => {
    const wrong = LISTS.flatMap(([list, kinds, map]) => [
      ...kinds.filter((kind) => map[kind] === undefined).map((kind) => `${list} ${kind}: no entry`),
      ...Object.keys(map)
        .filter((kind) => !kinds.includes(kind))
        .map((kind) => `${list} ${kind}: an entry for no kind`),
    ]);

    expect(wrong).toEqual([]);
  });

  it('names only elements the prototype has', () => {
    const known = elements();
    const unknown = LISTS.flatMap(([, , map]) =>
      Object.values(map).flatMap((entry) =>
        'held' in entry ? entry.held.filter((element) => !known.has(element)) : [],
      ),
    );

    expect([...new Set(unknown)]).toEqual([]);
  });

  it('owes these kinds an element, and no other', () => {
    const owed = LISTS.flatMap(([list, , map]) =>
      Object.entries(map)
        .filter(([, entry]) => 'owed' in entry)
        .map(([kind]) => `${list} ${kind}`),
    );

    expect(owed).toEqual([
      'Draft 2020-12 keyword $comment',
      'Draft 2020-12 keyword format',
      'Draft 2020-12 keyword contentEncoding',
      'Draft 2020-12 keyword contentMediaType',
      'Draft 2020-12 keyword examples',
      'Draft 2020-12 keyword contentSchema',
      'Draft-07 keyword $comment',
      'Draft-07 keyword format',
      'Draft-07 keyword contentEncoding',
      'Draft-07 keyword contentMediaType',
      'Draft-07 keyword examples',
      'Draft 2020-12 name outside its vocabularies dependencies',
      'Draft 2020-12 name outside its vocabularies $recursiveAnchor',
      'Draft 2020-12 name outside its vocabularies $recursiveRef',
    ]);
  });
});
