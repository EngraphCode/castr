/**
 * The Zod documents of the cases, run against the installed Zod.
 *
 * Each case of the note that holds a Zod document has a test here that builds it and
 * proves what the note says it does. The last test reads the note from the repository, so
 * this is an end-to-end test: it fails when the note gains a Zod document with no test.
 */

import { describe, it, expect } from 'vitest';
import * as z from 'zod';

import { readCasesNote } from './case-documents.js';

/** The cases this file runs: every case of the note that holds a Zod document. */
const RUN = [
  'A20',
  'C1',
  'C3',
  'C4',
  'C5',
  'C6',
  'D1',
  'D2',
  'D4',
  'E6',
  'H2',
  'I1',
  'I2',
  'I4',
  'I5',
];

const A = z.object({ a: z.string() });
const AB = z.object({ a: z.string(), b: z.string() });

describe('the Zod documents of the cases', () => {
  it('A20: a name is the `id` in the registry, and a reference is the same schema met twice', () => {
    const Name = z.string().meta({ id: 'Name' });
    const written = z.toJSONSchema(z.object({ first: Name, last: Name }));
    z.globalRegistry.remove(Name);

    expect(written.properties).toEqual({
      first: { $ref: '#/$defs/Name' },
      last: { $ref: '#/$defs/Name' },
    });
  });

  it('C1: the four policies for unknown keys', () => {
    const value = { a: 'x', b: 1 };

    expect(z.strictObject({ a: z.string() }).safeParse(value).success).toBe(false);
    expect(z.looseObject({ a: z.string() }).parse(value)).toEqual({ a: 'x', b: 1 });
    expect(A.catchall(z.number()).safeParse(value).success).toBe(true);
    expect(A.catchall(z.number()).safeParse({ a: 'x', b: 'n' }).success).toBe(false);
    expect(A.parse(value)).toEqual({ a: 'x' });
  });

  it('C3: a stripped object accepts an unknown key and produces none', () => {
    expect(A.parse({ a: 'x', b: 1 })).toEqual({ a: 'x' });
  });

  it('C4: an intersection of two closed objects is closed over the keys of both', () => {
    const both = z.intersection(
      z.strictObject({ a: z.string() }),
      z.strictObject({ b: z.string() }),
    );

    expect(both.safeParse({ a: 'x', b: 'y' }).success).toBe(true);
    expect(both.safeParse({ a: 'x', b: 'y', c: 1 }).success).toBe(false);
  });

  it('C5: a record over a finite set of keys requires each, unless it is partial', () => {
    const whole = z.record(z.enum(['a', 'b']), z.number());
    const partial = z.partialRecord(z.enum(['a', 'b']), z.number());
    const loose = z.looseRecord(z.string().regex(/^x-/), z.number());

    expect(whole.safeParse({ a: 1 }).success).toBe(false);
    expect(whole.safeParse({ a: 1, b: 2 }).success).toBe(true);
    expect(whole.safeParse({ a: 1, b: 2, c: 3 }).success).toBe(false);
    expect(partial.safeParse({}).success).toBe(true);
    expect(loose.safeParse({ 'x-a': 1, b: 'q' }).success).toBe(true);
    expect(loose.safeParse({ 'x-a': 'no' }).success).toBe(false);
  });

  it('C6: three kinds of choice over the same alternatives', () => {
    const value = { a: 'x', b: 'y' };
    const Cat = z.object({ kind: z.literal('cat') });
    const Dog = z.object({ kind: z.literal('dog') });

    expect(z.union([A, AB]).parse(value)).toEqual({ a: 'x' });
    expect(z.xor([A, AB]).safeParse(value).success).toBe(false);
    expect(z.discriminatedUnion('kind', [Cat, Dog]).parse({ kind: 'dog' })).toEqual({
      kind: 'dog',
    });
  });

  it('D1: a default is produced unvalidated, and a prefault is validated', () => {
    expect(z.string().min(5).default('x').parse(undefined)).toBe('x');
    expect(z.string().min(5).prefault('x').safeParse(undefined).success).toBe(false);
  });

  it('D2: a union produces by the first alternative that matches', () => {
    const value = { a: 'x', b: 'y' };

    expect(z.union([A, AB]).parse(value)).toEqual({ a: 'x' });
    expect(z.union([AB, A]).parse(value)).toEqual({ a: 'x', b: 'y' });
  });

  it('D4: values that are changed on the way through', () => {
    expect(z.string().trim().min(2).safeParse(' a ').success).toBe(false);
    expect(z.coerce.number().parse('12')).toBe(12);
    expect(z.string().min(5).catch('x').parse(1)).toBe('x');
    expect(z.string().default('x').nonoptional().parse(undefined)).toBe('x');
    expect(z.tuple([z.string(), z.number().default(5)]).parse(['a'])).toEqual(['a', 5]);
  });

  it('E6: formats with parameters, and one meaning in two places', () => {
    expect(z.int().safeParse(2 ** 53).success).toBe(false);
    expect(z.int64().safeParse(1).success).toBe(false);
    expect(z.url({ protocol: /^https$/ }).safeParse('http://example.com').success).toBe(false);
    expect(z.string().regex(/a/i).safeParse('A').success).toBe(true);
    expect(z.email().safeParse('a@example.com').success).toBe(true);
    expect(z.string().email().safeParse('a@example.com').success).toBe(true);
    expect(z.email().safeParse('a').success).toBe(false);
    expect(z.string().email().safeParse('a').success).toBe(false);
  });

  it('H2: a template literal, by the expression Zod builds, which drops a range', () => {
    expect(z.templateLiteral(['id-', z.number()]).safeParse('id-5').success).toBe(true);
    expect(z.templateLiteral(['id-', z.number()]).safeParse('x').success).toBe(false);
    expect(z.templateLiteral(['id-', z.number().positive()]).safeParse('id--1').success).toBe(true);
  });

  it('H2: an exact optional key may be absent and may not be `undefined`', () => {
    const both = z.object({ a: z.string().exactOptional(), b: z.string().optional() });

    expect(both.safeParse({}).success).toBe(true);
    expect(both.safeParse({ a: undefined }).success).toBe(false);
    expect(both.safeParse({ b: undefined }).success).toBe(true);
  });

  it('H2: read-only accepts what its inner schema accepts and freezes what it produces', () => {
    expect(Object.isFrozen(A.readonly().parse({ a: 'x' }))).toBe(true);
    expect(z.string().readonly().parse('x')).toBe('x');
  });

  it('H2: a cycle is the same schema met again', () => {
    const Node = z.object({
      name: z.string(),
      get next() {
        return Node.optional();
      },
    });

    expect(Node.shape.next.unwrap()).toBe(Node);
    expect(Node.safeParse({ name: 'a', next: { name: 'b' } }).success).toBe(true);
  });

  it('H2: a brand leaves nothing, and metadata follows a check and not a wrapper', () => {
    const plain = z.string();
    const named = z.string().meta({ title: 'A name' });
    const found = [
      z.globalRegistry.get(named),
      z.globalRegistry.get(named.min(3)),
      z.globalRegistry.get(named.optional()),
    ];
    z.globalRegistry.remove(named);

    expect(plain.brand('Id')).toBe(plain);
    expect(found).toEqual([{ title: 'A name' }, { title: 'A name' }, undefined]);
  });

  it('I1: the closed set: one optional string and no other key', () => {
    const closed = z.strictObject({ a: z.string().optional() });

    expect(closed.safeParse({}).success).toBe(true);
    expect(closed.safeParse({ a: 's' }).success).toBe(true);
    expect(closed.safeParse({ a: 's', b: 1 }).success).toBe(false);
    expect(closed.safeParse({ a: 1 }).success).toBe(false);
  });

  it('I2: a tuple has both positions and nothing after them', () => {
    const tuple = z.tuple([z.string(), z.number()]);

    expect(tuple.safeParse([]).success).toBe(false);
    expect(tuple.safeParse(['s']).success).toBe(false);
    expect(tuple.safeParse(['s', 1]).success).toBe(true);
    expect(tuple.safeParse(['s', 1, 2]).success).toBe(false);
  });

  it('I4: string or null', () => {
    expect(z.string().nullable().safeParse('s').success).toBe(true);
    expect(z.string().nullable().safeParse(null).success).toBe(true);
    expect(z.string().nullable().safeParse(1).success).toBe(false);
  });

  it('I5: one value', () => {
    expect(z.literal('a').safeParse('a').success).toBe(true);
    expect(z.literal('a').safeParse('b').success).toBe(false);
  });
});

describe('the cases note', () => {
  it('holds a Zod document in exactly the cases run here', () => {
    const held = readCasesNote()
      .filter((entry) => entry.zod.length > 0)
      .map((entry) => entry.id);

    expect([...held].sort()).toEqual([...RUN].sort());
  });
});
