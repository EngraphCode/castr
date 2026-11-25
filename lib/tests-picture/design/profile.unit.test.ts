/**
 * Castr's profile, read by value: an object that states no policy is closed over what
 * the shapes that describe it account for, wherever in a schema those shapes are.
 */

import { describe, it, expect } from 'vitest';

import type { JsonValue } from '../refusals/judge.js';

import {
  ANY,
  EVERY,
  NUMBER,
  ROOT,
  STRING,
  all,
  array,
  at,
  fields,
  model,
  named,
  object,
  ofArrays,
  ofObjects,
  ref,
} from './build.js';
import { constantOf } from './exact.js';
import { asStated, underProfile } from './evaluate.js';
import type { Model, Shape } from './model.js';

function accepts(value: Model, instance: JsonValue): boolean {
  return underProfile(value, instance).accepted;
}

const only = (text: string): Shape => ({ kind: 'values', values: [constantOf(text)] });

describe('an object that states no policy', () => {
  it('is closed over its own fields when nothing else describes it', () => {
    const alone = model(object({ fields: fields({ a: STRING }) }));

    expect(accepts(alone, { a: 's' })).toBe(true);
    expect(accepts(alone, { a: 's', b: 1 })).toBe(false);
  });

  it('accepts only the empty object when it names the kind and no field', () => {
    expect(accepts(model(object({})), {})).toBe(true);
    expect(accepts(model(object({})), { a: 1 })).toBe(false);
  });

  it('is not what a shape is that says nothing of objects', () => {
    const lengthOnly: Shape = {
      kind: 'by-kind',
      kinds: { ...ANY, string: { length: { least: 3n } } },
    };

    expect(accepts(model(EVERY), { a: 1 })).toBe(true);
    expect(accepts(model(lengthOnly), { a: 1 })).toBe(true);
  });

  it('accepts no object when it requires a key it has no field for', () => {
    const requires = model(ofObjects({ required: new Set(['a']) }));

    expect(asStated(requires, { present: true, value: { a: 1 } }).accepted).toBe(true);
    expect(accepts(requires, { a: 1 })).toBe(false);
  });
});

describe('two shapes that describe one place', () => {
  const nested = (key: string): Shape =>
    ofObjects({ fields: fields({ p: object({ fields: fields({ [key]: STRING }) }) }) });
  const both = model(all(nested('a'), nested('b')));

  it('close over the keys of both', () => {
    expect(accepts(both, { p: { a: 'x', b: 'y' } })).toBe(true);
    expect(accepts(both, { p: { a: 'x', b: 'y', zzz: 1 } })).toBe(false);
  });

  it('do so for a branch a condition adds', () => {
    const conditional = model(
      all(
        ofObjects({
          fields: fields({ kind: STRING, p: object({ fields: fields({ a: NUMBER }) }) }),
        }),
        {
          kind: 'when',
          test: ofObjects({ fields: fields({ kind: only('x') }, ['kind']) }),
          then: ofObjects({ fields: fields({ p: object({ fields: fields({ b: NUMBER }) }) }) }),
        },
      ),
    );

    expect(accepts(conditional, { kind: 'x', p: { a: 1, b: 1 } })).toBe(true);
    expect(accepts(conditional, { kind: 'y', p: { a: 1, b: 1 } })).toBe(false);
  });

  it('do so for a definition that is both the root and built on', () => {
    const EXTENDED = at(named('child'));
    const tree = model(
      object({ fields: fields({ name: STRING, child: ref('child', EXTENDED) }) }),
      [[EXTENDED, all(ref('#', ROOT), ofObjects({ fields: fields({ extra: EVERY }) }))]],
    );

    expect(accepts(tree, { name: 'r', child: { name: 'c', extra: 1 } })).toBe(true);
    expect(accepts(tree, { name: 'r', zzz: 1 })).toBe(false);
    expect(accepts(tree, { name: 'r', child: { name: 'c', zzz: 1 } })).toBe(false);
  });
});

describe('a shape used as a test', () => {
  it('does not close the value it tests, in `contains`', () => {
    const tagged = object({ fields: fields({ kind: only('x') }, ['kind']) });
    const list = model(ofArrays({ contains: { shape: tagged, least: 1n } }));

    expect(accepts(list, [{ kind: 'x', extra: 1 }])).toBe(true);
  });

  it('does not close the value it tests, in a negation', () => {
    const negated = model(
      ofObjects({
        fields: fields({ p: { kind: 'not', of: ofObjects({ required: new Set(['a']) }) } }),
      }),
    );

    expect(accepts(negated, { p: { b: 1 } })).toBe(true);
  });

  it('accounts for the keys it names when it accepts, as a condition does', () => {
    const discriminated = model({
      kind: 'when',
      test: ofObjects({ fields: fields({ kind: only('x') }, ['kind']) }),
      then: ofObjects({ fields: fields({ a: EVERY }) }),
    });

    expect(accepts(discriminated, { kind: 'x', a: 1 })).toBe(true);
    expect(accepts(discriminated, { kind: 'x', a: 1, b: 1 })).toBe(false);
    expect(accepts(discriminated, { kind: 'y', q: 1 })).toBe(true);
  });
});

describe('a closure the source states', () => {
  it('is not folded into later items where the array has `contains`', () => {
    const folded = model(array({ contains: { shape: STRING, least: 1n }, after: NUMBER }));

    expect(asStated(folded, { present: true, value: ['s', 1] }).accepted).toBe(false);
  });
});
