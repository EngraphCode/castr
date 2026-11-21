/**
 * How the TypeScript compiler is asked whether a value belongs to a generated type.
 *
 * The compiler reads its own library from disk, so this is an end-to-end test. Castr is
 * not run: the generated module is a constant.
 */

import { describe, it, expect } from 'vitest';

import { typeIn } from './typescript-type.js';

const OBJECT_TYPE = 'export type T = { a: string; n?: number | null };';

describe('typeIn', () => {
  it('decides each sample as the compiler does', () => {
    const samples = [{ a: 'x' }, { a: 'x', n: null }, { a: 1 }, {}, 'x', ['x']];

    const type = typeIn(OBJECT_TYPE, samples);

    expect(type.kind === 'decides' && samples.map(type.accepts)).toEqual([
      true,
      true,
      false,
      false,
      false,
      false,
    ]);
  });

  it('asks about the value itself: a literal, a tuple, a property the type does not name', () => {
    const literal = typeIn(`export type T = 'a' | 2;`, ['a', 'b', 2, 3]);
    const tuple = typeIn('export type T = [string, number];', [['a', 1], ['a'], [1, 'a']]);
    const extra = typeIn(OBJECT_TYPE, [{ a: 'x', other: true }]);

    expect(literal.kind === 'decides' && ['a', 'b', 2, 3].map(literal.accepts)).toEqual([
      true,
      false,
      true,
      false,
    ]);
    expect(tuple.kind === 'decides' && tuple.accepts(['a'])).toBe(false);
    expect(extra.kind === 'decides' && extra.accepts({ a: 'x', other: true })).toBe(true);
  });

  it('reads a module that imports a package, as the generated module does', () => {
    const type = typeIn(
      `import { z } from 'zod';\nexport type T = string;\nexport const T = z.string();`,
      ['a', 1],
    );

    expect(type.kind === 'decides' && [type.accepts('a'), type.accepts(1)]).toEqual([true, false]);
  });

  it('refuses to decide a value it was not given', () => {
    const type = typeIn('export type T = string;', ['a']);

    expect(() => type.kind === 'decides' && type.accepts('b')).toThrow(
      'the compiler was not asked about "b"',
    );
  });

  it('reports a module that does not compile, with the compiler’s first words', () => {
    expect(typeIn('export type T = { a: string;', ['a'])).toEqual({
      kind: 'output unusable',
      reason: "does not compile: '}' expected.",
    });
    expect(typeIn('export type T = Missing;', ['a'])).toEqual({
      kind: 'output unusable',
      reason: "does not compile: Cannot find name 'Missing'.",
    });
  });

  it('reports a module that exports no type for the shape', () => {
    expect(typeIn('export const T = 1;', ['a'])).toEqual({ kind: 'nothing emitted' });
    expect(typeIn('export type Other = string;', ['a'])).toEqual({ kind: 'nothing emitted' });
  });
});
