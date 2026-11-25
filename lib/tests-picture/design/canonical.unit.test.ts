/**
 * The canonical rules: a meaning written two ways is one value, and a value that only
 * looks like another is left apart.
 */

import { isDeepStrictEqual } from 'node:util';

import { describe, it, expect } from 'vitest';

import {
  ANY,
  EVERY,
  NONE,
  NUMBER,
  ROOT,
  STRING,
  all,
  array,
  closed,
  fields,
  object,
  ofObjects,
  ref,
} from './build.js';
import { canonical } from './canonical.js';
import { VALUES } from './cases-as-values.js';
import type { Shape } from './model.js';

const NULL: Shape = { kind: 'by-kind', kinds: { null: 'any' } };

describe('one meaning written two ways', () => {
  it('a closure round the one shape it closes is that shape, closed', () => {
    const written = closed(all(object({ fields: fields({ a: STRING }) })));

    expect(canonical(written)).toEqual(object({ fields: fields({ a: STRING }), rest: NONE }));
  });

  it('a closure round a shape that states its rest is that shape', () => {
    const open = ofObjects({ fields: fields({ a: EVERY }), rest: EVERY });

    expect(canonical(closed(all(open)))).toEqual(open);
  });

  it('a closure alone closes every object', () => {
    expect(canonical(closed(EVERY))).toEqual(ofObjects({ rest: NONE }));
  });

  it('a choice between kinds is one shape by kind', () => {
    expect(canonical({ kind: 'some', of: [STRING, NULL] })).toEqual({
      kind: 'by-kind',
      kinds: { string: 'any', null: 'any' },
    });
  });

  it('a reference beside nothing is the reference', () => {
    const reference = ref('#', ROOT);

    expect(canonical(all(reference, EVERY))).toEqual(reference);
  });

  it('nothing said of any kind is every value, and its negation is none', () => {
    expect(canonical({ kind: 'by-kind', kinds: ANY })).toEqual(EVERY);
    expect(canonical({ kind: 'not', of: { kind: 'by-kind', kinds: ANY } })).toEqual(NONE);
  });

  it('nested compositions are one composition', () => {
    expect(canonical(all(all(STRING, NUMBER), NULL))).toEqual(all(STRING, NUMBER, NULL));
  });
});

describe('what the rules leave apart', () => {
  it('a closure over items, where the array has `contains`', () => {
    const written: Shape = {
      kind: 'rest-of',
      over: array({ contains: { shape: STRING, least: 1n } }),
      items: NUMBER,
    };

    expect(canonical(written)).toEqual(written);
  });

  it('a choice between shapes that share a kind', () => {
    const written: Shape = { kind: 'some', of: [STRING, STRING] };

    expect(canonical(written)).toEqual(written);
  });

  it('an object that states no policy and the same object closed', () => {
    const unstated = object({ fields: fields({ a: STRING }) });

    expect(isDeepStrictEqual(canonical(unstated), canonical(closed(unstated)))).toBe(false);
  });
});

describe('the cases as values', () => {
  it('are each already canonical', () => {
    const changed = Object.entries(VALUES).flatMap(([id, documents]) =>
      Object.entries(documents).flatMap(([index, value]) =>
        value.definitions.every((definition) =>
          isDeepStrictEqual(canonical(definition.shape), definition.shape),
        )
          ? []
          : [`${id} document ${index}`],
      ),
    );

    expect(changed).toEqual([]);
  });
});
