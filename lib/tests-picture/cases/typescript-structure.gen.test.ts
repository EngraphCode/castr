/**
 * How the types a generated module exports are read as something to compare and search.
 *
 * The compiler runs in this process on the text of a generated module and reads its own
 * library from disk, as the generated-code suite does (`tests-generated/*.gen.test.ts`),
 * and takes that suite's name. Castr is not run: each generated module is a constant.
 */

import { describe, it, expect } from 'vitest';

import { holds, sameProjection, type Projection } from './projection.js';
import { typesIn } from './typescript-structure.js';

function held(content: string): Projection {
  const types = typesIn(content);
  if (types.kind !== 'held') {
    throw new Error(`the types were not read: ${types.kind}`);
  }
  return types.projection;
}

describe('typesIn', () => {
  it('holds an exported type under its name, with the keys and literals inside it', () => {
    const types = held(`export type paths = { '/kestrels': { get: { status: 200 } } };`);

    expect(holds(types, 'paths')).toBe(true);
    expect(holds(types, '/kestrels')).toBe(true);
    expect(holds(types, 'get')).toBe(true);
    expect(holds(types, 200)).toBe(true);
  });

  it('reads an alias and an interface of the same type the same', () => {
    const alias = held('export type T = { a: string; b?: number[] };');
    const viaInterface = held('export interface T { a: string; b?: Array<number> }');
    const viaAnotherName = held(
      'type Inner = { a: string; b?: number[] };\nexport type T = Inner;',
    );

    expect(sameProjection(alias, viaInterface)).toBe(true);
    expect(sameProjection(alias, viaAnotherName)).toBe(true);
  });

  it('reads a union the same in whatever order its members were written', () => {
    const one = held(`export type T = 'a' | 'b' | number;`);
    const other = held(`type Earlier = 'b' | 'a';\nexport type T = number | 'b' | 'a';`);

    expect(sameProjection(one, other)).toBe(true);
    expect(sameProjection(one, held(`export type T = 'a' | 'c' | number;`))).toBe(false);
  });

  it('reads a type the module exports after declaring it, as one it exports in place', () => {
    const inPlace = held('export type Kestrel = { a: string };');
    const after = held('type Kestrel = { a: string };\nexport type { Kestrel };');

    expect(sameProjection(inPlace, after)).toBe(true);
  });

  it('holds a type under the name the module exports it by', () => {
    const types = held('type Inner = { a: string };\nexport type { Inner as Kestrel };');

    expect(holds(types, 'Kestrel')).toBe(true);
    expect(holds(types, 'Inner')).toBe(false);
  });

  it('tells an array from a tuple and from a readonly array', () => {
    const array = held('export type T = string[];');

    expect(sameProjection(array, held('export type T = [string];'))).toBe(false);
    expect(sameProjection(array, held('export type T = readonly string[];'))).toBe(false);
    expect(sameProjection(array, held('export type T = number[];'))).toBe(false);
  });

  it('tells one function type from another', () => {
    const takesString = held('export type T = (a: string) => void;');

    expect(sameProjection(takesString, held('export type T = (a: number) => void;'))).toBe(false);
  });

  it('tells an optional property from a required one, and a readonly one from neither', () => {
    const plain = held('export type T = { a: string };');

    expect(sameProjection(plain, held('export type T = { a?: string };'))).toBe(false);
    expect(sameProjection(plain, held('export type T = { readonly a: string };'))).toBe(false);
  });

  it('holds a documentation comment and its tags, on a type and on a property', () => {
    const types = held(
      '/** A kestrel. */\nexport type T = {\n  /** @deprecated use b */\n  a: string;\n};',
    );

    expect(holds(types, 'A kestrel.')).toBe(true);
    expect(holds(types, 'deprecated')).toBe(true);
    expect(holds(types, 'use b')).toBe(true);
  });

  it('holds every tag where two have one name', () => {
    const types = held(
      '/**\n * @example kestrel\n * @example osprey\n */\nexport type T = string;',
    );

    expect(holds(types, 'kestrel')).toBe(true);
    expect(holds(types, 'osprey')).toBe(true);
  });

  it("does not read the documentation of a value that shares a type's name", () => {
    const plain = held('export type T = string;\nexport const T = 1;');
    const valueDocumented = held(
      'export type T = string;\n/** Kestrel words. */\nexport const T = 1;',
    );
    const typeDocumented = held(
      '/** Kestrel words. */\nexport type T = string;\nexport const T = 1;',
    );

    expect(sameProjection(plain, valueDocumented)).toBe(true);
    expect(holds(typeDocumented, 'Kestrel words.')).toBe(true);
  });

  it('does not read a comment that is not documentation', () => {
    const plain = held('export type T = { a: string };');

    expect(sameProjection(plain, held('// a note\nexport type T = { a: string };'))).toBe(true);
  });

  it('does not read a value the module exports, whatever its type', () => {
    expect(held(`export const endpoints = [{ path: '/kestrels' }] as const;`)).toEqual({});
  });

  it('reads a type that contains itself without entering it twice', () => {
    const tree = held('export type Tree = { name: "kestrel"; children: Tree[] };');
    const leaves = held('export type Tree = { name: "kestrel"; children: string[] };');

    expect(holds(tree, 'kestrel')).toBe(true);
    expect(sameProjection(tree, leaves)).toBe(false);
  });

  it('reads a generic type that grows each time it contains itself, and stops', () => {
    const types = held(
      'export type Grows<T> = { name: T; next: Grows<T[]> };\nexport type T = Grows<"kestrel">;',
    );

    expect(holds(types, 'kestrel')).toBe(true);
  });

  it('reads an index signature', () => {
    const closed = held('export type T = { a: string };');
    const open = held('export type T = { a: string; [key: string]: unknown };');

    expect(sameProjection(closed, open)).toBe(false);
  });

  it('says that a module that does not compile cannot be used', () => {
    const types = typesIn('export type T = Missing;');

    expect(types.kind === 'output unusable' && types.reason).toMatch(/^does not compile: /);
  });
});
