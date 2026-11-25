/**
 * Exact numbers and stated values, for the prototype of the model.
 */

import type { JsonValue } from '../refusals/judge.js';

import type { Constant, Exact } from './model.js';

function canonical(coefficient: bigint, exponent: bigint): Exact {
  if (coefficient === 0n) {
    return { coefficient: 0n, exponent: 0n };
  }
  let c = coefficient;
  let e = exponent;
  while (c % 10n === 0n) {
    c /= 10n;
    e += 1n;
  }
  return { coefficient: c, exponent: e };
}

/** An exact number from its coefficient and its power of ten. */
export function exact(coefficient: bigint, exponent = 0n): Exact {
  return canonical(coefficient, exponent);
}

/**
 * The exact number a JavaScript number stands for here: the shortest decimal that reads
 * back as the same number, which is what a JSON document that parsed to it wrote, or is
 * indistinguishable from it once parsed.
 */
export function exactOfDouble(value: number): Exact {
  const [digits = '0', power = '0'] = value.toExponential().split('e');
  const [whole = '0', fraction = ''] = digits.split('.');
  return canonical(BigInt(`${whole}${fraction}`), BigInt(power) - BigInt(fraction.length));
}

function aligned(a: Exact, b: Exact): readonly [bigint, bigint] {
  const low = a.exponent < b.exponent ? a.exponent : b.exponent;
  return [a.coefficient * 10n ** (a.exponent - low), b.coefficient * 10n ** (b.exponent - low)];
}

/** Negative, zero or positive as `a` is below, equal to or above `b`. */
export function compare(a: Exact, b: Exact): number {
  const [x, y] = aligned(a, b);
  if (x === y) {
    return 0;
  }
  return x < y ? -1 : 1;
}

export function isWhole(value: Exact): boolean {
  return value.exponent >= 0n;
}

export function isMultipleOf(value: Exact, step: Exact): boolean {
  const [x, y] = aligned(value, step);
  return y !== 0n && x % y === 0n;
}

function doubleOf(value: Exact): number {
  const coefficient = Number(value.coefficient);
  const power = 10 ** Number(value.exponent < 0n ? -value.exponent : value.exponent);
  return value.exponent < 0n ? coefficient / power : coefficient * power;
}

/** The stated value a JSON value is. */
export function constantOf(value: JsonValue): Constant {
  if (value === null) {
    return { kind: 'null' };
  }
  if (typeof value === 'boolean') {
    return { kind: 'boolean', value };
  }
  if (typeof value === 'number') {
    return { kind: 'number', value: exactOfDouble(value) };
  }
  if (typeof value === 'string') {
    return { kind: 'string', value };
  }
  if (Array.isArray(value)) {
    return { kind: 'array', items: value.map((item) => constantOf(item)) };
  }
  return {
    kind: 'object',
    members: new Map(Object.entries(value).map(([key, member]) => [key, constantOf(member)])),
  };
}

/** The JSON value a stated value is, as a JavaScript program holds it. */
export function jsonOf(constant: Constant): JsonValue {
  switch (constant.kind) {
    case 'null':
      return null;
    case 'boolean':
    case 'string':
      return constant.value;
    case 'number':
      return doubleOf(constant.value);
    case 'array':
      return constant.items.map((item) => jsonOf(item));
    case 'object':
      return Object.fromEntries(
        [...constant.members].map(([key, member]) => [key, jsonOf(member)]),
      );
  }
}

function sameMembers(members: ReadonlyMap<string, Constant>, value: JsonValue): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const entries = Object.entries(value);
  return (
    entries.length === members.size &&
    entries.every(([key, member]) => {
      const stated = members.get(key);
      return stated !== undefined && isConstant(stated, member);
    })
  );
}

/** Whether a JSON value is the stated value, numbers compared exactly. */
export function isConstant(constant: Constant, value: JsonValue): boolean {
  switch (constant.kind) {
    case 'null':
      return value === null;
    case 'boolean':
    case 'string':
      return value === constant.value;
    case 'number':
      return typeof value === 'number' && compare(constant.value, exactOfDouble(value)) === 0;
    case 'array':
      return (
        Array.isArray(value) &&
        value.length === constant.items.length &&
        constant.items.every((item, index) => {
          const given = value[index];
          return given !== undefined && isConstant(item, given);
        })
      );
    case 'object':
      return sameMembers(constant.members, value);
  }
}
