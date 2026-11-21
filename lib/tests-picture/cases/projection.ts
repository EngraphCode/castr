import { z } from 'zod';

import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

/**
 * A value reduced to what can be compared and searched: primitives, arrays and objects
 * with string keys. A function has no content to compare and is left out.
 */
export type Projection =
  string | number | boolean | null | readonly Projection[] | { readonly [key: string]: Projection };

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

/**
 * Zod's JSON Schema for a validator, with the one fact it leaves out that a construct of
 * the picture states: which property a discriminated union discriminates on. Without it
 * a discriminated union reads the same as a plain choice.
 */
function described(schema: z.ZodType): unknown {
  return z.toJSONSchema(schema, {
    override: ({ zodSchema, jsonSchema }) => {
      if (zodSchema instanceof z.ZodDiscriminatedUnion) {
        jsonSchema['discriminator'] = { propertyName: zodSchema.def.discriminator };
      }
    },
  });
}

function projectionOfSchema(schema: z.ZodType): Projection {
  try {
    return { zod: projectionOf(described(schema)) };
  } catch {
    // Zod has no JSON Schema for some validators. Such a validator still shows that
    // something is held; what it holds cannot be read here.
    return { zod: 'a validator Zod cannot describe' };
  }
}

/**
 * Reduces what a generated module exports to a projection. A Zod validator is read as
 * the JSON Schema Zod gives for it, so that what a validator requires can be compared too.
 *
 * Where a value inside is the very object the module exports under a name, the name is
 * shown beside it: that is how a reference to a named component is held, and no value
 * shows it.
 */
export function projectionOf(
  value: unknown,
  names: ReadonlyMap<unknown, string> = new Map(),
): Projection {
  const name = names.get(value);
  const projection = projectionOfValue(value, names);
  return name === undefined ? projection : { 'exported as': name, value: projection };
}

function projectionOfValue(value: unknown, names: ReadonlyMap<unknown, string>): Projection {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (value instanceof z.ZodType) {
    return projectionOfSchema(value);
  }
  if (Array.isArray(value)) {
    return value.map((item: unknown) => projectionOf(item, names));
  }
  if (!isRecord(value)) {
    return null;
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => typeof entry !== 'function')
      .map(([key, entry]) => [key, projectionOf(entry, names)]),
  );
}

/**
 * Whether a projection holds a value anywhere: as a string or number in it, or as a key.
 * A number and its digits as a string are the same value here, since a status code is
 * written either way.
 */
export function holds(projection: Projection, value: string | number): boolean {
  if (typeof projection === 'string' || typeof projection === 'number') {
    return String(projection) === String(value);
  }
  if (projection === null || typeof projection !== 'object') {
    return false;
  }
  if (Array.isArray(projection)) {
    return projection.some((item: Projection) => holds(item, value));
  }
  return Object.entries(projection).some(
    ([key, entry]) => key === String(value) || holds(entry, value),
  );
}

/**
 * Whether two projections are the same, whatever order their keys were written in.
 */
export function sameProjection(left: Projection, right: Projection): boolean {
  return canonical(left) === canonical(right);
}

function canonical(projection: Projection): string {
  if (projection === null || typeof projection !== 'object') {
    return JSON.stringify(projection);
  }
  if (Array.isArray(projection)) {
    return `[${projection.map((item: Projection) => canonical(item)).join(',')}]`;
  }
  const entries = Object.entries(projection)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`);
  return `{${entries.join(',')}}`;
}
