/**
 * What a shape of the prototype accepts, accounts for and produces.
 *
 * Evaluation has two layers. The first is the shape as stated: it accepts or refuses a
 * value, says what it produces, and notes for each place in the value which keys and
 * items the shapes applied there accounted for. The second is Castr's profile: at each
 * place where the value is an object and an object part that describes it accepted, a
 * key nothing accounted for is refused.
 */

import { isDeepStrictEqual } from 'node:util';

import type { JsonValue } from '../refusals/judge.js';

import { compare, exactOfDouble, isConstant, isMultipleOf, isWhole, jsonOf } from './exact.js';
import type {
  ArrayPart,
  Bound,
  ByKind,
  DefinitionId,
  Edge,
  Model,
  NumberPart,
  ObjectPart,
  Pattern,
  ResourceId,
  RestShape,
  Shape,
  StringPart,
} from './model.js';

/** A value, or the absence of one at a key, a position or the top. */
export type Given =
  { readonly present: true; readonly value: JsonValue } | { readonly present: false };

/** What the shapes applied at one place of a value accounted for. */
interface Notes {
  readonly keys: ReadonlySet<string>;
  readonly items: ReadonlySet<number>;
  /** Whether an object part in a describing position accepted the value here. */
  readonly described: boolean;
  readonly below: ReadonlyMap<string | number, Notes>;
  /** A rest this object part would apply, were it not a side of a Zod intersection. */
  readonly held?: 'closed' | 'dropped';
}

export type Outcome =
  | { readonly accepted: true; readonly notes: Notes; readonly produced: Given }
  | { readonly accepted: false };

interface Context {
  readonly model: Model;
  /** The resources entered, outermost first. */
  readonly scope: readonly ResourceId[];
  /** False inside a test, where nothing describes the value. */
  readonly describing: boolean;
  /** True for a side of a Zod intersection, until its object part is reached. */
  readonly together: boolean;
}

const REFUSED: Outcome = { accepted: false };
const NOTHING: Notes = { keys: new Set(), items: new Set(), described: false, below: new Map() };
const ABSENT: Given = { present: false };

function accept(produced: Given, notes: Notes = NOTHING): Outcome {
  return { accepted: true, notes, produced };
}

function merge(a: Notes, b: Notes): Notes {
  const below = new Map(a.below);
  for (const [at, notes] of b.below) {
    const already = below.get(at);
    below.set(at, already === undefined ? notes : merge(already, notes));
  }
  return {
    keys: new Set([...a.keys, ...b.keys]),
    items: new Set([...a.items, ...b.items]),
    described: a.described || b.described,
    below,
  };
}

function isObject(value: JsonValue): value is Record<string, JsonValue> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** What two branches of an `all` produce together, or nothing if they cannot agree. */
function together(a: JsonValue, b: JsonValue): Given {
  if (isObject(a) && isObject(b)) {
    const merged: Record<string, JsonValue> = { ...a };
    for (const [key, value] of Object.entries(b)) {
      const already = merged[key];
      const member = already === undefined ? { present: true, value } : together(already, value);
      if (!member.present) {
        return ABSENT;
      }
      merged[key] = member.value;
    }
    return { present: true, value: merged };
  }
  return isDeepStrictEqual(a, b) ? { present: true, value: a } : ABSENT;
}

function definitionAt(model: Model, id: DefinitionId): Shape {
  const found = model.definitions.find((definition) => isDeepStrictEqual(definition.id, id));
  if (found === undefined) {
    throw new Error(`no definition at ${JSON.stringify(id)}`);
  }
  return found.shape;
}

function follow(edge: Edge, id: DefinitionId | undefined, given: Given, context: Context): Outcome {
  const target = id ?? (edge.target.state === 'resolved' ? edge.target.to : undefined);
  if (target === undefined) {
    throw new Error(`the reference ${edge.written} has no one target`);
  }
  const scope = [...context.scope, target.resource];
  return apply(definitionAt(context.model, target), given, { ...context, scope });
}

function inScope(anchor: string, context: Context): DefinitionId | undefined {
  for (const entered of context.scope) {
    const resource = context.model.resources.find((one) => isDeepStrictEqual(one.id, entered));
    const declared = resource?.dynamicAnchors.get(anchor);
    if (declared !== undefined) {
      return declared;
    }
  }
  return undefined;
}

function matches(pattern: Pattern, text: string): boolean {
  return new RegExp(pattern.source, pattern.flags.join('')).test(text);
}

function within(
  count: number,
  range: { readonly least?: bigint; readonly most?: bigint },
): boolean {
  const n = BigInt(count);
  return (
    (range.least === undefined || n >= range.least) && (range.most === undefined || n <= range.most)
  );
}

function bounded(value: number, least: Bound | undefined, most: Bound | undefined): boolean {
  const given = exactOfDouble(value);
  const above = least === undefined ? 1 : compare(given, least.value);
  const below = most === undefined ? 1 : compare(most.value, given);
  return (
    (above > 0 || (above === 0 && least?.exclusive === false)) &&
    (below > 0 || (below === 0 && most?.exclusive === false))
  );
}

function number(part: NumberPart, value: number): boolean {
  const given = exactOfDouble(value);
  return (
    (part.whole !== true || isWhole(given)) &&
    bounded(value, part.least, part.most) &&
    (part.multipleOf === undefined || isMultipleOf(given, part.multipleOf))
  );
}

function string(part: StringPart, value: string): boolean {
  return (
    (part.length === undefined || within([...value].length, part.length)) &&
    (part.patterns ?? []).every((pattern) => matches(pattern, value))
  );
}

/** Applies a shape to each of some children of a value, gathering what is produced and noted. */
interface Gathered {
  readonly below: Map<string | number, Notes>;
  refused: boolean;
}

function child(
  shape: Shape,
  at: string | number,
  given: Given,
  context: Context,
  gathered: Gathered,
): Given {
  const outcome = apply(shape, given, { ...context, together: false });
  if (!outcome.accepted) {
    gathered.refused = true;
    return ABSENT;
  }
  const already = gathered.below.get(at);
  gathered.below.set(at, already === undefined ? outcome.notes : merge(already, outcome.notes));
  return outcome.produced;
}

function fillsAbsence(shape: Shape, context: Context): boolean {
  switch (shape.kind) {
    case 'absent-becomes':
      return true;
    case 'said':
      return fillsAbsence(shape.of, context);
    case 'reference':
      return shape.edge.target.state === 'resolved'
        ? fillsAbsence(definitionAt(context.model, shape.edge.target.to), context)
        : false;
    default:
      return false;
  }
}

function isClosed(rest: RestShape | 'unstated'): boolean {
  return rest !== 'dropped' && rest !== 'unstated' && rest.kind === 'none';
}

function heldRest(part: ObjectPart, context: Context): 'closed' | 'dropped' | undefined {
  if (!context.together) {
    return undefined;
  }
  if (part.rest === 'dropped') {
    return 'dropped';
  }
  return isClosed(part.rest) ? 'closed' : undefined;
}

function restKey(
  part: ObjectPart,
  key: string,
  value: JsonValue,
  context: Context,
  gathered: Gathered,
  held: boolean,
): { readonly accounted: boolean; readonly produced: Given } {
  if (part.rest === 'unstated' || held) {
    return { accounted: false, produced: { present: true, value } };
  }
  if (part.rest === 'dropped') {
    return { accounted: true, produced: ABSENT };
  }
  return {
    accounted: true,
    produced: child(part.rest, key, { present: true, value }, context, gathered),
  };
}

function knownKey(
  part: ObjectPart,
  key: string,
  value: JsonValue,
  context: Context,
  gathered: Gathered,
): Given | undefined {
  let produced: Given | undefined;
  const field = part.fields?.get(key);
  if (field !== undefined) {
    produced = child(field.shape, key, { present: true, value }, context, gathered);
  }
  for (const { pattern, shape } of part.patterns ?? []) {
    if (matches(pattern, key)) {
      const through = child(shape, key, { present: true, value }, context, gathered);
      produced ??= through;
    }
  }
  return produced;
}

function absentFields(
  part: ObjectPart,
  value: Record<string, JsonValue>,
  context: Context,
  gathered: Gathered,
  produced: Record<string, JsonValue>,
): void {
  for (const [name, field] of part.fields ?? []) {
    if (name in value) {
      continue;
    }
    if (fillsAbsence(field.shape, context)) {
      const filled = child(field.shape, name, ABSENT, context, gathered);
      if (filled.present) {
        produced[name] = filled.value;
      }
    } else if (field.presence === 'required') {
      gathered.refused = true;
    }
  }
}

function namesHold(part: ObjectPart, keys: readonly string[], context: Context): boolean {
  const { names } = part;
  return (
    names === undefined ||
    keys.every(
      (key) =>
        apply(names, { present: true, value: key }, { ...context, describing: false }).accepted,
    )
  );
}

function object(part: ObjectPart, value: Record<string, JsonValue>, context: Context): Outcome {
  const gathered: Gathered = { below: new Map(), refused: false };
  const held = heldRest(part, context);
  const keys = new Set<string>();
  const produced: Record<string, JsonValue> = {};
  for (const [key, member] of Object.entries(value)) {
    const known = knownKey(part, key, member, context, gathered);
    const rest =
      known === undefined
        ? restKey(part, key, member, context, gathered, held !== undefined)
        : undefined;
    if (known !== undefined || rest?.accounted === true) {
      keys.add(key);
    }
    const through = known ?? rest?.produced ?? ABSENT;
    if (through.present) {
      produced[key] = through.value;
    }
  }
  absentFields(part, value, context, gathered, produced);
  const present = Object.keys(value);
  const whole =
    !gathered.refused &&
    [...(part.required ?? [])].every((key) => key in value) &&
    namesHold(part, present, context) &&
    (part.count === undefined || within(present.length, part.count));
  if (!whole) {
    return REFUSED;
  }
  const notes: Notes = {
    keys,
    items: new Set(),
    described: context.describing,
    below: gathered.below,
    ...(held === undefined ? {} : { held }),
  };
  return accept({ present: true, value: produced }, notes);
}

function contained(
  part: ArrayPart,
  value: readonly JsonValue[],
  context: Context,
  gathered: Gathered,
): number[] | undefined {
  const { contains } = part;
  if (contains === undefined) {
    return [];
  }
  const matched: number[] = [];
  value.forEach((item, index) => {
    const outcome = apply(
      contains.shape,
      { present: true, value: item },
      { ...context, describing: false, together: false },
    );
    if (outcome.accepted) {
      matched.push(index);
      const already = gathered.below.get(index);
      gathered.below.set(
        index,
        already === undefined ? outcome.notes : merge(already, outcome.notes),
      );
    }
  });
  return within(matched.length, contains) ? matched : undefined;
}

function array(part: ArrayPart, value: readonly JsonValue[], context: Context): Outcome {
  const gathered: Gathered = { below: new Map(), refused: false };
  const items = new Set<number>();
  const positions = part.positions ?? [];
  const produced = value.map((item, index) => {
    const shape = positions[index] ?? (part.after === 'unstated' ? undefined : part.after);
    if (shape === undefined) {
      return item;
    }
    items.add(index);
    const through = child(shape, index, { present: true, value: item }, context, gathered);
    return through.present ? through.value : item;
  });
  const matched = contained(part, value, context, gathered);
  const whole =
    !gathered.refused &&
    matched !== undefined &&
    (part.length === undefined || within(value.length, part.length)) &&
    (part.distinct !== true ||
      value.every(
        (item, index) => value.findIndex((other) => isDeepStrictEqual(other, item)) === index,
      ));
  if (!whole) {
    return REFUSED;
  }
  for (const index of matched) {
    items.add(index);
  }
  return accept({ present: true, value: produced }, { ...NOTHING, items, below: gathered.below });
}

function byKind(kinds: ByKind, value: JsonValue, context: Context): Outcome {
  const same: Given = { present: true, value };
  if (value === null) {
    return kinds.null === undefined ? REFUSED : accept(same);
  }
  if (typeof value === 'boolean') {
    return kinds.boolean === undefined ? REFUSED : accept(same);
  }
  if (typeof value === 'number') {
    const part = kinds.number;
    return part !== undefined && (part === 'any' || number(part, value)) ? accept(same) : REFUSED;
  }
  if (typeof value === 'string') {
    const part = kinds.string;
    return part !== undefined && (part === 'any' || string(part, value)) ? accept(same) : REFUSED;
  }
  const part = Array.isArray(value) ? kinds.array : kinds.object;
  if (part === undefined) {
    return REFUSED;
  }
  if (part === 'any') {
    return accept(same);
  }
  if (Array.isArray(value)) {
    return 'after' in part ? array(part, value, context) : REFUSED;
  }
  return 'rest' in part ? object(part, value, context) : REFUSED;
}

/** A key no side of a Zod intersection accounts for: refused, dropped or kept. */
function settleHeld(sides: readonly Notes[], notes: Notes, produced: Given): Outcome {
  const held = sides.flatMap((side) => (side.held === undefined ? [] : [side.held]));
  if (held.length === 0 || !produced.present || !isObject(produced.value)) {
    return accept(produced, notes);
  }
  const loose = Object.keys(produced.value).filter((key) => !notes.keys.has(key));
  if (loose.length === 0) {
    return accept(produced, notes);
  }
  if (!held.includes('dropped')) {
    return REFUSED;
  }
  const kept = Object.fromEntries(
    Object.entries(produced.value).filter(([key]) => notes.keys.has(key)),
  );
  return accept(
    { present: true, value: kept },
    { ...notes, keys: new Set(Object.keys(produced.value)) },
  );
}

/** What two branches produce together; undefined where they cannot agree. */
function both(a: Given, b: Given): Given | undefined {
  if (!a.present || !b.present) {
    return a.present === b.present ? a : undefined;
  }
  const merged = together(a.value, b.value);
  return merged.present ? merged : undefined;
}

function all(shape: Extract<Shape, { kind: 'all' }>, given: Given, context: Context): Outcome {
  const side = { ...context, together: shape.unknownKeys === 'together' };
  let notes = NOTHING;
  let produced: Given | undefined;
  const sides: Notes[] = [];
  for (const branch of shape.of) {
    const outcome = apply(branch, given, side);
    if (!outcome.accepted) {
      return REFUSED;
    }
    sides.push(outcome.notes);
    notes = merge(notes, outcome.notes);
    produced = produced === undefined ? outcome.produced : both(produced, outcome.produced);
    if (produced === undefined) {
      return REFUSED;
    }
  }
  produced ??= given;
  return shape.unknownKeys === 'together'
    ? settleHeld(sides, notes, produced)
    : accept(produced, notes);
}

function accepting(
  branches: readonly Shape[],
  given: Given,
  context: Context,
): Extract<Outcome, { accepted: true }>[] {
  const side = { ...context, together: false };
  return branches.flatMap((branch) => {
    const outcome = apply(branch, given, side);
    return outcome.accepted ? [outcome] : [];
  });
}

function unordered(
  shape: Extract<Shape, { kind: 'some' | 'one' }>,
  given: Given,
  context: Context,
): Outcome {
  const outcomes = accepting(shape.of, given, context);
  const [first] = outcomes;
  if (first === undefined || (shape.kind === 'one' && outcomes.length !== 1)) {
    return REFUSED;
  }
  if (!outcomes.every((outcome) => isDeepStrictEqual(outcome.produced, first.produced))) {
    throw new Error('a choice with no order has branches that produce different values');
  }
  return accept(first.produced, outcomes.map((outcome) => outcome.notes).reduce(merge));
}

function when(shape: Extract<Shape, { kind: 'when' }>, given: Given, context: Context): Outcome {
  const test = apply(shape.test, given, { ...context, describing: false, together: false });
  const branch = test.accepted ? shape.then : shape.otherwise;
  const tested = test.accepted ? test.notes : NOTHING;
  if (branch === undefined) {
    return accept(given, tested);
  }
  const taken = apply(branch, given, { ...context, together: false });
  return taken.accepted ? accept(taken.produced, merge(tested, taken.notes)) : REFUSED;
}

function restItems(
  over: Extract<Outcome, { accepted: true }>,
  items: Shape,
  context: Context,
): Outcome {
  const { produced } = over;
  if (!produced.present || !Array.isArray(produced.value)) {
    return over;
  }
  const gathered: Gathered = { below: new Map(over.notes.below), refused: false };
  const value = produced.value.map((item: JsonValue, index) => {
    if (over.notes.items.has(index)) {
      return item;
    }
    const through = child(items, index, { present: true, value: item }, context, gathered);
    return through.present ? through.value : item;
  });
  if (gathered.refused) {
    return REFUSED;
  }
  const every = new Set(value.map((_, index) => index));
  return accept({ present: true, value }, { ...over.notes, items: every, below: gathered.below });
}

function restKeys(
  over: Extract<Outcome, { accepted: true }>,
  keys: RestShape,
  context: Context,
): Outcome {
  const { produced } = over;
  if (!produced.present || !isObject(produced.value)) {
    return over;
  }
  const gathered: Gathered = { below: new Map(over.notes.below), refused: false };
  const value: Record<string, JsonValue> = {};
  for (const [key, member] of Object.entries(produced.value)) {
    if (over.notes.keys.has(key)) {
      value[key] = member;
    } else if (keys !== 'dropped') {
      const through = child(keys, key, { present: true, value: member }, context, gathered);
      value[key] = through.present ? through.value : member;
    }
  }
  if (gathered.refused) {
    return REFUSED;
  }
  const every = new Set(Object.keys(produced.value));
  return accept({ present: true, value }, { ...over.notes, keys: every, below: gathered.below });
}

function restOf(
  shape: Extract<Shape, { kind: 'rest-of' }>,
  given: Given,
  context: Context,
): Outcome {
  const side = { ...context, together: false };
  let outcome = apply(shape.over, given, side);
  if (outcome.accepted && shape.keys !== undefined) {
    outcome = restKeys(outcome, shape.keys, side);
  }
  if (outcome.accepted && shape.items !== undefined) {
    outcome = restItems(outcome, shape.items, side);
  }
  return outcome;
}

function absentBecomes(
  shape: Extract<Shape, { kind: 'absent-becomes' }>,
  given: Given,
  context: Context,
): Outcome {
  if (given.present) {
    return apply(shape.of, given, context);
  }
  const filled: Given = { present: true, value: jsonOf(shape.value) };
  return shape.checked ? apply(shape.of, filled, context) : accept(filled);
}

function present(shape: Shape, value: JsonValue, context: Context): Outcome {
  const given: Given = { present: true, value };
  switch (shape.kind) {
    case 'every':
      return accept(given);
    case 'none':
      return REFUSED;
    case 'by-kind':
      return byKind(shape.kinds, value, context);
    case 'values':
      return shape.values.some((stated) => isConstant(stated, value)) ? accept(given) : REFUSED;
    case 'all':
      return all(shape, given, context);
    case 'some':
    case 'one':
      return unordered(shape, given, context);
    case 'first':
      return accepting(shape.of, given, context)[0] ?? REFUSED;
    case 'not':
      return apply(shape.of, given, { ...context, describing: false, together: false }).accepted
        ? REFUSED
        : accept(given);
    case 'when':
      return when(shape, given, context);
    case 'rest-of':
      return restOf(shape, given, context);
    default:
      return through(shape, given, context);
  }
}

/** The nodes that pass a value, or an absence, to another shape. */
function through(
  shape: Extract<Shape, { kind: 'reference' | 'reference-in-scope' | 'absent-becomes' | 'said' }>,
  given: Given,
  context: Context,
): Outcome {
  switch (shape.kind) {
    case 'reference':
      return follow(shape.edge, undefined, given, context);
    case 'reference-in-scope':
      return follow(shape.edge, inScope(shape.anchor, context), given, context);
    case 'absent-becomes':
      return absentBecomes(shape, given, context);
    case 'said':
      return apply(shape.of, given, context);
  }
}

function apply(shape: Shape, given: Given, context: Context): Outcome {
  if (given.present) {
    return present(shape, given.value, context);
  }
  switch (shape.kind) {
    case 'reference':
    case 'reference-in-scope':
    case 'absent-becomes':
    case 'said':
      return through(shape, given, context);
    default:
      return REFUSED;
  }
}

/** Whether Castr's profile refuses a value: an object described somewhere holds a key nothing accounts for. */
function profileRefuses(value: JsonValue, notes: Notes): boolean {
  if (Array.isArray(value)) {
    return value.some((item, index) => {
      const below = notes.below.get(index);
      return below !== undefined && profileRefuses(item, below);
    });
  }
  if (!isObject(value)) {
    return false;
  }
  return Object.entries(value).some(([key, member]) => {
    const below = notes.below.get(key);
    return (
      (notes.described && !notes.keys.has(key)) ||
      (below !== undefined && profileRefuses(member, below))
    );
  });
}

/**
 * Evaluates a value against the model's entry as its source states it: the first layer.
 */
export function asStated(model: Model, given: Given): Outcome {
  const context: Context = {
    model,
    scope: [model.entry.resource],
    describing: true,
    together: false,
  };
  return apply(definitionAt(model, model.entry), given, context);
}

/**
 * Evaluates a value against the model's entry under Castr's profile: both layers.
 */
export function underProfile(model: Model, value: JsonValue): Outcome {
  const stated = asStated(model, { present: true, value });
  return stated.accepted && profileRefuses(value, stated.notes) ? REFUSED : stated;
}
