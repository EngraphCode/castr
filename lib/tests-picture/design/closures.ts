/**
 * Where Castr's profile closes an object, and what a writer can write for it.
 *
 * The profile closes an object by value: over the keys every shape that describes one
 * place accounts for. That is not local to any one shape, so a writer cannot read it off
 * the shape in front of it. This module reads it from the model: for each place in a
 * value where an object that states no policy is described, how many shapes describe the
 * place, how they are combined, and whether they all descend from one shape applied
 * there. From that alone it says what JSON Schema and Zod can write for the closure, or
 * that they cannot. It takes no fact about the format the model was read from.
 */

import { isDeepStrictEqual } from 'node:util';

import type { ArrayPart, DefinitionId, Model, ObjectPart, Shape } from './model.js';

/** A step from a value to a value inside it. */
type Into =
  | { readonly into: 'field'; readonly name: string }
  | { readonly into: 'other-keys' }
  | { readonly into: 'position'; readonly index: number }
  | { readonly into: 'later-items' };

/** One place where the profile supplies a closure. */
export interface Supplied {
  /** The place, as steps from the value the entry describes. */
  readonly at: readonly Into[];
  /** How many object parts that state no policy describe the place. */
  readonly parts: number;
  /** Alone, several that must all hold, or some reached through a choice. */
  readonly how: 'alone' | 'together' | 'chosen';
  /** Whether they all descend from one shape applied at the place, or from several. */
  readonly roots: 'one' | 'several';
}

interface Found {
  readonly at: readonly Into[];
  readonly chosen: boolean;
  readonly root: number;
}

interface Walk {
  readonly model: Model;
  readonly found: Found[];
  /** The definitions being walked, so that a cycle of references ends. */
  readonly entered: DefinitionId[];
  /** Places where a cycle was cut: what is found at or below one is not the whole of it. */
  readonly cut: (readonly Into[])[];
  roots: number;
}

interface Here {
  readonly at: readonly Into[];
  readonly chosen: boolean;
  /** Inside a closure the source states, which accounts for every key. */
  readonly enclosed: boolean;
  readonly root: number;
}

function below(walk: Walk, shape: Shape, here: Here, step: Into): void {
  walk.roots += 1;
  visit(walk, shape, { at: [...here.at, step], chosen: false, enclosed: false, root: walk.roots });
}

function objectPart(walk: Walk, part: ObjectPart, here: Here): void {
  if (part.rest === 'unstated' && !here.enclosed) {
    walk.found.push({ at: here.at, chosen: here.chosen, root: here.root });
  }
  for (const [name, field] of part.fields ?? []) {
    below(walk, field.shape, here, { into: 'field', name });
  }
  for (const { shape } of part.patterns ?? []) {
    below(walk, shape, here, { into: 'other-keys' });
  }
  if (part.rest !== 'unstated' && part.rest !== 'dropped') {
    below(walk, part.rest, here, { into: 'other-keys' });
  }
}

function arrayPart(walk: Walk, part: ArrayPart, here: Here): void {
  (part.positions ?? []).forEach((shape, index) => {
    below(walk, shape, here, { into: 'position', index });
  });
  if (part.after !== 'unstated') {
    below(walk, part.after, here, { into: 'later-items' });
  }
}

function reference(walk: Walk, to: DefinitionId, here: Here): void {
  // A definition is walked once inside itself, so that what is built on it is seen there.
  if (walk.entered.filter((id) => isDeepStrictEqual(id, to)).length > 1) {
    walk.cut.push(here.at);
    return;
  }
  const target = walk.model.definitions.find((one) => isDeepStrictEqual(one.id, to));
  if (target !== undefined) {
    walk.entered.push(to);
    visit(walk, target.shape, here);
    walk.entered.pop();
  }
}

function composed(walk: Walk, shape: Shape, here: Here): boolean {
  switch (shape.kind) {
    case 'all':
      shape.of.forEach((branch) => {
        visit(walk, branch, here);
      });
      return true;
    case 'some':
    case 'one':
    case 'first':
      shape.of.forEach((branch) => {
        visit(walk, branch, { ...here, chosen: true });
      });
      return true;
    case 'when':
      // The test describes nothing; the branch taken does.
      [shape.then, shape.otherwise].forEach((branch) => {
        if (branch !== undefined) {
          visit(walk, branch, here);
        }
      });
      return true;
    default:
      return false;
  }
}

function visit(walk: Walk, shape: Shape, here: Here): void {
  if (composed(walk, shape, here)) {
    return;
  }
  switch (shape.kind) {
    case 'by-kind':
      if (shape.kinds.object !== undefined && shape.kinds.object !== 'any') {
        objectPart(walk, shape.kinds.object, here);
      }
      if (shape.kinds.array !== undefined && shape.kinds.array !== 'any') {
        arrayPart(walk, shape.kinds.array, here);
      }
      return;
    case 'reference':
    case 'reference-in-scope':
      if (shape.edge.target.state === 'resolved') {
        reference(walk, shape.edge.target.to, here);
      }
      return;
    case 'rest-of':
      visit(walk, shape.over, { ...here, enclosed: here.enclosed || shape.keys !== undefined });
      return;
    case 'absent-becomes':
    case 'said':
      visit(walk, shape.of, here);
      return;
    default:
    // `every`, `none`, `values` and a negation describe no object.
  }
}

function isUnder(at: readonly Into[], cut: readonly Into[]): boolean {
  return cut.every((step, index) => isDeepStrictEqual(step, at[index]));
}

function severalOrOne(parts: number): 'together' | 'alone' {
  return parts > 1 ? 'together' : 'alone';
}

function gathered(all: readonly Found[], cuts: readonly (readonly Into[])[]): readonly Supplied[] {
  const found = all.filter((one) => !cuts.some((cut) => isUnder(one.at, cut)));
  const places: Found[][] = [];
  for (const one of found) {
    const same = places.find(([first]) => isDeepStrictEqual(first?.at, one.at));
    if (same === undefined) {
      places.push([one]);
    } else {
      same.push(one);
    }
  }
  return places.map((parts) => {
    const chosen = parts.some((part) => part.chosen);
    const how = chosen ? 'chosen' : severalOrOne(parts.length);
    const roots = new Set(parts.map((part) => part.root)).size > 1 ? 'several' : 'one';
    return { at: parts[0]?.at ?? [], parts: parts.length, how, roots };
  });
}

/**
 * Finds every place in a value of the model's entry where the profile supplies a closure.
 * A definition that reaches itself is followed once round, and no further.
 */
export function suppliedClosures(model: Model): readonly Supplied[] {
  const walk: Walk = { model, found: [], entered: [model.entry], cut: [], roots: 0 };
  const entry = model.definitions.find((one) => isDeepStrictEqual(one.id, model.entry));
  if (entry !== undefined) {
    visit(walk, entry.shape, { at: [], chosen: false, enclosed: false, root: 0 });
  }
  return gathered(walk.found, walk.cut);
}

/** What a target can write for one supplied closure. */
export type Writing =
  | {
      readonly can: true;
      readonly as:
        'a closed object' | 'a closure over the composition' | 'an intersection of closed objects';
    }
  | { readonly can: false; readonly because: string };

const SEVERAL =
  'two places in the schema describe one place in the value, and no one of them can close it';

/** What JSON Schema Draft 2020-12 can write for a supplied closure. */
export function inJsonSchema(supplied: Supplied): Writing {
  if (supplied.roots === 'several') {
    return { can: false, because: SEVERAL };
  }
  return {
    can: true,
    as: supplied.how === 'alone' ? 'a closed object' : 'a closure over the composition',
  };
}

/** What Zod can write for a supplied closure. */
export function inZod(supplied: Supplied): Writing {
  if (supplied.roots === 'several') {
    return { can: false, because: SEVERAL };
  }
  if (supplied.how === 'chosen') {
    return {
      can: false,
      because:
        'a choice between closed objects refuses a value two of its branches account for together',
    };
  }
  return {
    can: true,
    as: supplied.how === 'alone' ? 'a closed object' : 'an intersection of closed objects',
  };
}
