/**
 * Zod schemas of the cases, as values of the prototype, held to Zod.
 *
 * Each row is a Zod schema and the value a reader would build for it. Both are given the
 * same inputs, an absent one among them, and must agree on what is accepted and on what
 * is produced: that is where a Zod schema's two sides show.
 */

import { describe, it, expect } from 'vitest';
import * as z from 'zod';

import type { JsonValue } from '../refusals/judge.js';

import { EVERY, NONE, NUMBER, STRING, fields, model, pattern } from './build.js';
import { constantOf } from './exact.js';
import { asStated, type Given } from './evaluate.js';
import type { ObjectPart, Shape } from './model.js';

const ABSENT: Given = { present: false };

function given(value: JsonValue): Given {
  return { present: true, value };
}

function ofZod(schema: z.ZodType, input: Given): Given | 'refused' {
  const parsed = schema.safeParse(input.present ? input.value : undefined);
  if (!parsed.success) {
    return 'refused';
  }
  return parsed.data === undefined ? ABSENT : given(JSON.parse(JSON.stringify(parsed.data)));
}

function ofModel(shape: Shape, input: Given): Given | 'refused' {
  const outcome = asStated(model(shape), input);
  return outcome.accepted ? outcome.produced : 'refused';
}

function objectOf(part: Partial<ObjectPart> & Pick<ObjectPart, 'rest'>): Shape {
  return { kind: 'by-kind', kinds: { object: part } };
}

const only = (...values: JsonValue[]): Shape => ({
  kind: 'values',
  values: values.map((value) => constantOf(value)),
});
const A_STRING = fields({ a: STRING }, ['a']);
const STRIPPED_A = objectOf({ fields: A_STRING, rest: 'dropped' });
const STRIPPED_AB = objectOf({
  fields: fields({ a: STRING, b: STRING }, ['a', 'b']),
  rest: 'dropped',
});
const LONG: Shape = { kind: 'by-kind', kinds: { string: { length: { least: 5n } } } };
const zA = z.object({ a: z.string() });
const zAB = z.object({ a: z.string(), b: z.string() });

interface Row {
  readonly name: string;
  readonly zod: z.ZodType;
  readonly shape: Shape;
  readonly inputs: readonly Given[];
}

const AB = given({ a: 'x', b: 'y' });
const A_AND_NUMBER = given({ a: 'x', b: 1 });

const ROWS: readonly Row[] = [
  {
    name: 'C1 a closed object',
    zod: z.strictObject({ a: z.string() }),
    shape: objectOf({ fields: A_STRING, rest: NONE }),
    inputs: [A_AND_NUMBER, given({ a: 'x' }), given({})],
  },
  {
    name: 'C1 an open object',
    zod: z.looseObject({ a: z.string() }),
    shape: objectOf({ fields: A_STRING, rest: EVERY }),
    inputs: [A_AND_NUMBER, given({ a: 1 })],
  },
  {
    name: 'C1 a constrained object',
    zod: zA.catchall(z.number()),
    shape: objectOf({ fields: A_STRING, rest: NUMBER }),
    inputs: [A_AND_NUMBER, given({ a: 'x', b: 'n' })],
  },
  { name: 'C3 a stripped object', zod: zA, shape: STRIPPED_A, inputs: [A_AND_NUMBER, given(5)] },
  {
    name: 'C5 a record over an enum, every key required',
    zod: z.record(z.enum(['a', 'b']), z.number()),
    shape: objectOf({ fields: fields({ a: NUMBER, b: NUMBER }, ['a', 'b']), rest: NONE }),
    inputs: [given({ a: 1 }), given({ a: 1, b: 2 }), given({ a: 1, b: 2, c: 3 })],
  },
  {
    name: 'C5 a partial record over an enum',
    zod: z.partialRecord(z.enum(['a', 'b']), z.number()),
    shape: objectOf({ fields: fields({ a: NUMBER, b: NUMBER }), rest: NONE }),
    inputs: [given({}), given({ a: 1 }), given({ c: 3 }), given({ a: 's' })],
  },
  {
    name: 'C5 a loose record over a pattern',
    zod: z.looseRecord(z.string().regex(/^x-/), z.number()),
    shape: objectOf({
      patterns: [{ pattern: { ...pattern('^x-'), flags: [] }, shape: NUMBER }],
      rest: EVERY,
    }),
    inputs: [given({ 'x-a': 1, b: 'q' }), given({ 'x-a': 'no' })],
  },
  {
    name: 'C6 and D2 a union takes the first that matches',
    zod: z.union([zA, zAB]),
    shape: { kind: 'first', of: [STRIPPED_A, STRIPPED_AB] },
    inputs: [AB, given({ b: 'y' })],
  },
  {
    name: 'D2 the same union in the other order',
    zod: z.union([zAB, zA]),
    shape: { kind: 'first', of: [STRIPPED_AB, STRIPPED_A] },
    inputs: [AB, given({ a: 'x' })],
  },
  {
    name: 'C6 an exclusive union',
    zod: z.xor([zA, zAB]),
    shape: { kind: 'one', of: [STRIPPED_A, STRIPPED_AB] },
    inputs: [AB, given({ a: 'x' })],
  },
  {
    name: 'D1 a default is not checked',
    zod: z.string().min(5).default('x'),
    shape: { kind: 'absent-becomes', of: LONG, value: constantOf('x'), checked: false },
    inputs: [ABSENT, given('x'), given('xxxxx')],
  },
  {
    name: 'D1 a prefault is checked',
    zod: z.string().min(5).prefault('x'),
    shape: { kind: 'absent-becomes', of: LONG, value: constantOf('x'), checked: true },
    inputs: [ABSENT, given('xxxxx')],
  },
  {
    name: 'D1 a default at a key',
    zod: z.object({ a: z.string().default('x') }),
    shape: objectOf({
      fields: fields({
        a: { kind: 'absent-becomes', of: STRING, value: constantOf('x'), checked: false },
      }),
      rest: 'dropped',
    }),
    inputs: [given({}), given({ a: 'y' }), given({ a: 1 })],
  },
  {
    name: 'I2 a tuple',
    zod: z.tuple([z.string(), z.number()]),
    shape: {
      kind: 'by-kind',
      kinds: { array: { positions: [STRING, NUMBER], after: NONE, length: { least: 2n } } },
    },
    inputs: [given(['s']), given(['s', 1]), given(['s', 1, 2])],
  },
  {
    name: 'I4 a nullable string',
    zod: z.string().nullable(),
    shape: { kind: 'by-kind', kinds: { string: 'any', null: 'any' } },
    inputs: [given(null), given('s'), given(1)],
  },
  { name: 'I5 a literal', zod: z.literal('a'), shape: only('a'), inputs: [given('a'), given('b')] },
];

describe('Zod schemas of the cases as values of the prototype', () => {
  it.each(ROWS)('$name', ({ zod, shape, inputs }) => {
    expect(inputs.map((input) => ofModel(shape, input))).toEqual(
      inputs.map((input) => ofZod(zod, input)),
    );
  });

  it('includes inputs that are refused and inputs whose produced value differs', () => {
    const results = ROWS.flatMap(({ zod, inputs }) =>
      inputs.map((input) => ({ input, result: ofZod(zod, input) })),
    );

    expect(results.some(({ result }) => result === 'refused')).toBe(true);
    expect(
      results.some(
        ({ input, result }) =>
          result !== 'refused' && JSON.stringify(result) !== JSON.stringify(input),
      ),
    ).toBe(true);
  });
});
