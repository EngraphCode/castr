/**
 * How what a generated module exports is reduced, searched and compared.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { holds, projectionOf, sameProjection } from './projection.js';

describe('projectionOf', () => {
  it('keeps primitives, arrays and objects, and leaves a function out', () => {
    expect(projectionOf({ a: [1, 'b', true, null], run: () => 1, nothing: undefined })).toEqual({
      a: [1, 'b', true, null],
      nothing: null,
    });
  });

  it('reads a Zod validator as the JSON Schema Zod gives for it', () => {
    expect(projectionOf({ schema: z.strictObject({ kestrel: z.string() }) })).toMatchObject({
      schema: { zod: { type: 'object', required: ['kestrel'], additionalProperties: false } },
    });
  });

  it('still shows a validator that Zod cannot describe', () => {
    expect(projectionOf(z.custom(() => true))).toEqual({
      zod: 'a validator Zod cannot describe',
    });
  });
});

describe('holds', () => {
  const projection = projectionOf({
    method: 'get',
    responses: { 404: { status: 404 } },
    tags: ['a'],
  });

  it('finds a value as a string or number anywhere, and as a key', () => {
    expect(holds(projection, 'get')).toBe(true);
    expect(holds(projection, 'a')).toBe(true);
    expect(holds(projection, 'responses')).toBe(true);
  });

  it('reads a number and its digits as one value', () => {
    expect(holds(projection, 404)).toBe(true);
    expect(holds(projection, '404')).toBe(true);
    expect(holds(projectionOf({ status: '201' }), 201)).toBe(true);
  });

  it('does not find a value that is only part of a string, or absent', () => {
    expect(holds(projection, 'ge')).toBe(false);
    expect(holds(projection, 'post')).toBe(false);
    expect(holds(projectionOf([true, null]), 'true')).toBe(false);
  });
});

describe('sameProjection', () => {
  it('holds whatever order the keys were written in', () => {
    expect(sameProjection({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 })).toBe(true);
  });

  it('does not hold where a value, a key or the order of an array differs', () => {
    expect(sameProjection({ a: 1 }, { a: 2 })).toBe(false);
    expect(sameProjection({ a: 1 }, { a: 1, b: null })).toBe(false);
    expect(sameProjection([1, 2], [2, 1])).toBe(false);
  });
});
