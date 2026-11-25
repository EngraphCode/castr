/**
 * A Zod intersection of two objects, as the prototype reads it, held to Zod.
 *
 * Zod does not let a closed or stripped side of an intersection refuse or drop a key
 * the other side accounts for, and a side with a catchall checks every key that is not
 * its own. Every pairing of the four policies is run here against Zod itself, for what
 * is accepted and for what is produced.
 */

import { describe, it, expect } from 'vitest';
import * as z from 'zod';

import type { JsonValue } from '../refusals/judge.js';

import { EVERY, NONE, NUMBER, STRING, fields, model } from './build.js';
import { asStated } from './evaluate.js';
import type { RestShape, Shape } from './model.js';

const POLICIES = ['closed', 'open', 'stripped', 'constrained'] as const;
type Policy = (typeof POLICIES)[number];

const REST: Readonly<Record<Policy, RestShape>> = {
  closed: NONE,
  open: EVERY,
  stripped: 'dropped',
  constrained: NUMBER,
};

function zodSide(key: string, value: z.ZodType, policy: Policy): z.ZodType {
  const shape = { [key]: value };
  switch (policy) {
    case 'closed':
      return z.strictObject(shape);
    case 'open':
      return z.looseObject(shape);
    case 'stripped':
      return z.object(shape);
    case 'constrained':
      return z.object(shape).catchall(z.number());
  }
}

function side(key: string, value: Shape, policy: Policy): Shape {
  return {
    kind: 'by-kind',
    kinds: { object: { fields: fields({ [key]: value }, [key]), rest: REST[policy] } },
  };
}

interface Result {
  readonly accepted: boolean;
  readonly produced?: JsonValue;
}

function ofZod(schema: z.ZodType, instance: JsonValue): Result {
  const parsed = schema.safeParse(instance);
  return parsed.success
    ? { accepted: true, produced: JSON.parse(JSON.stringify(parsed.data)) }
    : { accepted: false };
}

function ofModel(shape: Shape, instance: JsonValue): Result {
  const outcome = asStated(model(shape), { present: true, value: instance });
  return outcome.accepted && outcome.produced.present
    ? { accepted: true, produced: outcome.produced.value }
    : { accepted: false };
}

const INSTANCES: readonly JsonValue[] = [
  { a: 'x', b: 'y' },
  { a: 'x', b: 'y', c: 1 },
  { a: 'x', b: 'y', c: 'z' },
  { a: 1, b: 2 },
  { a: 1, b: 2, c: 3 },
  { a: 1, b: 2, c: 'z' },
  { a: 'x' },
];

describe('a Zod intersection of two objects', () => {
  const pairs = POLICIES.flatMap((left) => POLICIES.map((right) => [left, right] as const));

  it.each(pairs)('of a %s side and a %s side does what Zod does', (left, right) => {
    for (const [zodValue, value] of [
      [z.string(), STRING],
      [z.number(), NUMBER],
    ] as const) {
      const schema = z.intersection(zodSide('a', zodValue, left), zodSide('b', zodValue, right));
      const shape: Shape = {
        kind: 'all',
        unknownKeys: 'together',
        of: [side('a', value, left), side('b', value, right)],
      };

      expect(INSTANCES.map((instance) => ofModel(shape, instance))).toEqual(
        INSTANCES.map((instance) => ofZod(schema, instance)),
      );
    }
  });

  it('is not what two closed schemas under `allOf` are', () => {
    const shape: Shape = {
      kind: 'all',
      of: [side('a', STRING, 'closed'), side('b', STRING, 'closed')],
    };

    expect(ofModel(shape, { a: 'x', b: 'y' }).accepted).toBe(false);
  });
});
