/**
 * Where the profile supplies a closure, and what each target can write for it.
 */

import { describe, it, expect } from 'vitest';

import {
  EVERY,
  ROOT,
  STRING,
  all,
  at,
  closed,
  fields,
  model,
  named,
  object,
  ofObjects,
  ref,
} from './build.js';
import { inJsonSchema, inZod, suppliedClosures } from './closures.js';
import type { Shape } from './model.js';

const A = object({ fields: fields({ a: STRING }) });
const B = object({ fields: fields({ b: STRING }) });

describe('where the profile supplies a closure', () => {
  it('is the object itself where it stands alone, and each target writes a closed object', () => {
    const [only, ...rest] = suppliedClosures(model(A));

    expect(rest).toEqual([]);
    expect(only).toEqual({ at: [], parts: 1, how: 'alone', roots: 'one' });
    expect(only && [inJsonSchema(only), inZod(only)]).toEqual([
      { can: true, as: 'a closed object' },
      { can: true, as: 'a closed object' },
    ]);
  });

  it('is nowhere under a closure the source states', () => {
    const BASE = at(named('Base'));
    const stated = model(closed(all(ref(BASE), ofObjects({ fields: fields({ extra: STRING }) }))), [
      [BASE, object({ fields: fields({ id: STRING }) })],
    ]);

    expect(suppliedClosures(stated)).toEqual([]);
  });

  it('is one closure over a definition and what is built on it', () => {
    const BASE = at(named('Base'));
    const built = model(all(ref(BASE), ofObjects({ fields: fields({ extra: STRING }) })), [
      [BASE, object({ fields: fields({ id: STRING }) })],
    ]);
    const [only] = suppliedClosures(built);

    expect(only).toEqual({ at: [], parts: 2, how: 'together', roots: 'one' });
    expect(only && [inJsonSchema(only), inZod(only)]).toEqual([
      { can: true, as: 'a closure over the composition' },
      { can: true, as: 'an intersection of closed objects' },
    ]);
  });

  it('is one a choice reaches, which Zod cannot write', () => {
    const [only] = suppliedClosures(model({ kind: 'some', of: [A, B] }));

    expect(only).toEqual({ at: [], parts: 2, how: 'chosen', roots: 'one' });
    expect(only && inJsonSchema(only).can).toBe(true);
    expect(only && inZod(only).can).toBe(false);
  });

  it('is one neither target can write where two places in a schema describe one place in a value', () => {
    const nested = (key: string): Shape =>
      ofObjects({ fields: fields({ p: object({ fields: fields({ [key]: STRING }) }) }) });
    const found = suppliedClosures(model(all(nested('a'), nested('b'))));
    const inner = found.find((one) => one.at.length === 1);

    expect(inner).toEqual({
      at: [{ into: 'field', name: 'p' }],
      parts: 2,
      how: 'together',
      roots: 'several',
    });
    expect(inner && [inJsonSchema(inner).can, inZod(inner).can]).toEqual([false, false]);
  });

  it('ends on a definition that refers to itself, and finds what is built on the root', () => {
    const CHILD = at(named('child'));
    const tree = model(object({ fields: fields({ name: STRING, child: ref(CHILD) }) }), [
      [CHILD, all(ref(ROOT), ofObjects({ fields: fields({ extra: EVERY }) }))],
    ]);

    expect(suppliedClosures(tree)).toEqual([
      { at: [], parts: 1, how: 'alone', roots: 'one' },
      { at: [{ into: 'field', name: 'child' }], parts: 2, how: 'together', roots: 'one' },
    ]);
  });
});
