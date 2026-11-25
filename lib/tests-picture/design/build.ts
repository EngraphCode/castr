/**
 * Short ways to write values of the prototype by hand, for the cases and the tests.
 */

import type {
  ArrayPart,
  ByKind,
  DefinitionId,
  Field,
  Model,
  ObjectPart,
  Pattern,
  Resource,
  ResourceId,
  Shape,
  Step,
} from './model.js';

export const DOCUMENT: ResourceId = { resource: 'the document' };

export function at(...place: Step[]): DefinitionId {
  return { resource: DOCUMENT, place };
}

export function inResource(resource: string, ...place: Step[]): DefinitionId {
  return { resource: { resource }, place };
}

export function named(name: string): Step {
  return { step: 'named', name };
}

export const ROOT = at();
export const EVERY: Shape = { kind: 'every' };
export const NONE: Shape = { kind: 'none' };
/** A schema that names no kind accepts every kind. */
export const ANY: ByKind = {
  null: 'any',
  boolean: 'any',
  number: 'any',
  string: 'any',
  array: 'any',
  object: 'any',
};
export const STRING: Shape = { kind: 'by-kind', kinds: { string: 'any' } };
export const NUMBER: Shape = { kind: 'by-kind', kinds: { number: 'any' } };

export function ref(to: DefinitionId): Shape {
  return { kind: 'reference', edge: { target: { state: 'resolved', to } } };
}

export function fields(
  shapes: Record<string, Shape>,
  required: readonly string[] = [],
): Map<string, Field> {
  return new Map(
    Object.entries(shapes).map(([name, shape]) => [
      name,
      { presence: required.includes(name) ? 'required' : 'optional', shape },
    ]),
  );
}

/** A schema with `type: object`. */
export function object(part: Partial<ObjectPart>): Shape {
  return { kind: 'by-kind', kinds: { object: { rest: 'unstated', ...part } } };
}

/** A schema that names no kind and says something of objects. */
export function ofObjects(part: Partial<ObjectPart>): Shape {
  return { kind: 'by-kind', kinds: { ...ANY, object: { rest: 'unstated', ...part } } };
}

/** A schema with `type: array`. */
export function array(part: Partial<ArrayPart>): Shape {
  return { kind: 'by-kind', kinds: { array: { after: 'unstated', ...part } } };
}

/** A schema that names no kind and says something of arrays. */
export function ofArrays(part: Partial<ArrayPart>): Shape {
  return { kind: 'by-kind', kinds: { ...ANY, array: { after: 'unstated', ...part } } };
}

export function all(...of: Shape[]): Shape {
  return { kind: 'all', of };
}

export function closed(over: Shape): Shape {
  return { kind: 'rest-of', over, keys: NONE };
}

export function pattern(source: string): Pattern {
  return { dialect: 'ecma-262', source, flags: ['u'] };
}

export function model(
  root: Shape,
  others: readonly (readonly [DefinitionId, Shape, ...string[]])[] = [],
  resources: readonly Resource[] = [],
): Model {
  return {
    entry: ROOT,
    resources,
    record: { written: [] },
    definitions: [
      { id: ROOT, aliases: [], shape: root },
      ...others.map(([id, shape, ...aliases]) => ({ id, aliases, shape })),
    ],
  };
}
