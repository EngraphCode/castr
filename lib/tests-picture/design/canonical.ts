/**
 * The canonical rules of the prototype: one meaning written two ways becomes one value.
 *
 * Each rule leaves unchanged, wherever the shape stands, what is accepted, what is
 * produced, which keys and items are accounted for at each place, and whether an object
 * part that describes a value accepted it. The rules do not claim that any two shapes
 * accepting the same values become one value.
 */

import { isDeepStrictEqual } from 'node:util';

import type { ArrayPart, ByKind, ObjectPart, RestShape, Shape } from './model.js';

const EVERY: Shape = { kind: 'every' };
const NONE: Shape = { kind: 'none' };
const ANY: ByKind = {
  null: 'any',
  boolean: 'any',
  number: 'any',
  string: 'any',
  array: 'any',
  object: 'any',
};
const KINDS = ['null', 'boolean', 'number', 'string', 'array', 'object'] as const;

function rest(shape: RestShape | 'unstated'): RestShape | 'unstated' {
  return shape === 'dropped' || shape === 'unstated' ? shape : canonical(shape);
}

function objectPart(part: ObjectPart): ObjectPart {
  return {
    ...part,
    ...(part.fields === undefined
      ? {}
      : {
          fields: new Map(
            [...part.fields].map(([name, field]) => [
              name,
              { ...field, shape: canonical(field.shape) },
            ]),
          ),
        }),
    ...(part.patterns === undefined
      ? {}
      : { patterns: part.patterns.map((one) => ({ ...one, shape: canonical(one.shape) })) }),
    ...(part.names === undefined ? {} : { names: canonical(part.names) }),
    rest: rest(part.rest),
  };
}

function arrayPart(part: ArrayPart): ArrayPart | 'any' {
  const made: ArrayPart = {
    ...part,
    ...(part.positions === undefined
      ? {}
      : { positions: part.positions.map((one) => canonical(one)) }),
    ...(part.contains === undefined
      ? {}
      : { contains: { ...part.contains, shape: canonical(part.contains.shape) } }),
    after: part.after === 'unstated' ? 'unstated' : canonical(part.after),
  };
  // An array part that constrains nothing and accounts for nothing says nothing.
  return isDeepStrictEqual(made, { after: 'unstated' }) ? 'any' : made;
}

function scalarPart<Part extends object>(part: 'any' | Part): 'any' | Part {
  return part === 'any' || Object.keys(part).length === 0 ? 'any' : part;
}

function byKind(kinds: ByKind): Shape {
  const made: ByKind = {
    ...kinds,
    ...(kinds.number === undefined ? {} : { number: scalarPart(kinds.number) }),
    ...(kinds.string === undefined ? {} : { string: scalarPart(kinds.string) }),
    ...(kinds.array === undefined || kinds.array === 'any'
      ? {}
      : { array: arrayPart(kinds.array) }),
    ...(kinds.object === undefined || kinds.object === 'any'
      ? {}
      : { object: objectPart(kinds.object) }),
  };
  return KINDS.every((kind) => made[kind] === 'any') ? EVERY : { kind: 'by-kind', kinds: made };
}

function all(shape: Extract<Shape, { kind: 'all' }>): Shape {
  const branches = shape.of
    .map((branch) => canonical(branch))
    .flatMap((branch) =>
      branch.kind === 'all' && branch.unknownKeys === shape.unknownKeys ? branch.of : [branch],
    )
    .filter((branch) => branch.kind !== 'every');
  const [only] = branches;
  if (only === undefined) {
    return EVERY;
  }
  return branches.length === 1 ? only : { ...shape, of: branches };
}

function disjointKinds(branches: readonly Shape[]): ByKind | undefined {
  let merged: ByKind = {};
  for (const branch of branches) {
    if (
      branch.kind !== 'by-kind' ||
      KINDS.some((kind) => branch.kinds[kind] !== undefined && merged[kind] !== undefined)
    ) {
      return undefined;
    }
    merged = { ...merged, ...branch.kinds };
  }
  return merged;
}

function choice(shape: Extract<Shape, { kind: 'some' | 'one' | 'first' }>): Shape {
  const branches = shape.of.map((branch) => canonical(branch));
  const [only] = branches;
  if (only !== undefined && branches.length === 1) {
    return only;
  }
  const merged = shape.kind === 'first' ? undefined : disjointKinds(branches);
  return merged === undefined ? { ...shape, of: branches } : byKind(merged);
}

/** What a shape says by kind, where it is of that form. */
function kindsOf(shape: Shape): ByKind | undefined {
  if (shape.kind === 'every') {
    return ANY;
  }
  return shape.kind === 'by-kind' ? shape.kinds : undefined;
}

/** A closure over keys, folded into the object part it closes where that changes nothing. */
function foldKeys(over: Shape, keys: RestShape): Shape | undefined {
  const kinds = kindsOf(over);
  if (kinds === undefined) {
    return undefined;
  }
  const part = kinds.object;
  if (part === undefined || (part !== 'any' && part.rest !== 'unstated')) {
    return over;
  }
  const object: ObjectPart = part === 'any' ? { rest: keys } : { ...part, rest: keys };
  return { kind: 'by-kind', kinds: { ...kinds, object } };
}

/** The same for items, only where the array part has no `contains`. */
function foldItems(over: Shape, items: Shape): Shape | undefined {
  const kinds = kindsOf(over);
  if (kinds === undefined) {
    return undefined;
  }
  const part = kinds.array;
  if (part === undefined) {
    return over;
  }
  if (part !== 'any' && part.contains !== undefined) {
    return undefined;
  }
  if (part !== 'any' && part.after !== 'unstated') {
    return over;
  }
  const array: ArrayPart = part === 'any' ? { after: items } : { ...part, after: items };
  return { kind: 'by-kind', kinds: { ...kinds, array } };
}

function restOf(shape: Extract<Shape, { kind: 'rest-of' }>): Shape {
  let over = canonical(shape.over);
  let keys =
    shape.keys === undefined || shape.keys === 'dropped' ? shape.keys : canonical(shape.keys);
  let items = shape.items === undefined ? undefined : canonical(shape.items);
  const withKeys = keys === undefined ? undefined : foldKeys(over, keys);
  if (withKeys !== undefined) {
    over = withKeys;
    keys = undefined;
  }
  const withItems = items === undefined ? undefined : foldItems(over, items);
  if (withItems !== undefined) {
    over = withItems;
    items = undefined;
  }
  if (keys === undefined && items === undefined) {
    return over;
  }
  return {
    kind: 'rest-of',
    over,
    ...(keys === undefined ? {} : { keys }),
    ...(items === undefined ? {} : { items }),
  };
}

function negation(of: Shape): Shape {
  if (of.kind === 'every') {
    return NONE;
  }
  return of.kind === 'none' ? EVERY : { kind: 'not', of };
}

/**
 * The canonical form of a shape.
 */
export function canonical(shape: Shape): Shape {
  switch (shape.kind) {
    case 'by-kind':
      return byKind(shape.kinds);
    case 'all':
      return all(shape);
    case 'some':
    case 'one':
    case 'first':
      return choice(shape);
    case 'not':
      return negation(canonical(shape.of));
    case 'when':
      return {
        kind: 'when',
        test: canonical(shape.test),
        ...(shape.then === undefined ? {} : { then: canonical(shape.then) }),
        ...(shape.otherwise === undefined ? {} : { otherwise: canonical(shape.otherwise) }),
      };
    case 'rest-of':
      return restOf(shape);
    case 'absent-becomes':
    case 'said':
      return { ...shape, of: canonical(shape.of) };
    default:
      return shape;
  }
}
