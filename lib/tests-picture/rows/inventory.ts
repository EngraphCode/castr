import { isJsonObject, membersOf, type JsonObject } from './json.js';

/**
 * One field an object of a format may hold, with the fixed values the published
 * definition allows it. A field with no fixed values has an empty list.
 */
export interface FieldKind {
  readonly name: string;
  readonly values: readonly string[];
  /**
   * True where a declaration that applies to every instance leaves the field's value
   * free, and none that applies to every instance fixes it. A parameter's `required` is
   * any boolean, and `true` where the parameter is in the path: it is open and has one
   * fixed value. A parameter's `in` is only ever one of its locations: it is not open. A
   * field whose fixed values are restated with a default in a branch is not open either.
   */
  readonly open: boolean;
}

/**
 * One object of a format: its fields, the patterns its other entries are keyed by, and
 * whether it admits specification extensions.
 */
export interface ObjectKind {
  readonly name: string;
  readonly fields: readonly FieldKind[];
  readonly keyedBy: readonly string[];
  readonly extensible: boolean;
}

/**
 * A place where a published definition differs from its specification's text. The
 * inventory reads the field the specification names.
 */
export interface Correction {
  readonly object: string;
  readonly published: string;
  readonly specified: string;
  readonly section: string;
}

/**
 * How one published definition is read.
 */
export interface InventoryOptions {
  /** The name given to the definition's own top-level object. */
  readonly rootName: string;
  /** The reference by which an object admits specification extensions. */
  readonly extensionRef: string;
  readonly corrections: readonly Correction[];
}

/**
 * The objects a published definition declares.
 */
export interface Inventory {
  readonly objects: readonly ObjectKind[];
  /** Definitions that only ever compose other objects, folded into them. */
  readonly folded: readonly string[];
  /** Anything met that the reading rules do not cover. Empty when the reading is whole. */
  readonly problems: readonly string[];
}

interface CollectedField {
  readonly values: Set<string>;
  /** Some declaration that always applies fixes the field's value. */
  fixedAlways: boolean;
  /** Some declaration that always applies leaves the field's value free. */
  freeAlways: boolean;
}

/** Where the walk is: the references it has composed, and whether it is in a branch. */
interface Scope {
  readonly seen: ReadonlySet<string>;
  /** True inside a branch that applies to some instances of the object only. */
  readonly conditional: boolean;
}

/** Keywords whose subschemas apply to some instances of the object only. */
const BRANCHING: ReadonlySet<string> = new Set([
  'if',
  'then',
  'else',
  'dependentSchemas',
  'oneOf',
  'anyOf',
]);

interface Collected {
  readonly name: string;
  readonly fields: Map<string, CollectedField>;
  readonly keyedBy: Set<string>;
  extensible: boolean;
}

const DEFS_PREFIX = '#/$defs/';

/** Orders names the same way on every machine. */
function byName(a: string, b: string): number {
  return a.localeCompare(b, 'en');
}

function shortName(ref: string): string {
  return ref.slice(DEFS_PREFIX.length).replaceAll('/$defs/', '/');
}

/** The values a field's declaration fixes it to, by `enum` or `const`. */
function fixedValuesOf(declaration: JsonObject): readonly string[] {
  const allowed = declaration['enum'];
  const fixed = Array.isArray(allowed) ? allowed.map(String) : [];
  return 'const' in declaration ? [...fixed, String(declaration['const'])] : fixed;
}

function refOf(node: unknown): string | undefined {
  if (!isJsonObject(node)) {
    return undefined;
  }
  const ref = node['$ref'];
  return typeof ref === 'string' ? ref : undefined;
}

/**
 * Reads the objects of a format from one published JSON Schema definition of it.
 *
 * - A reference that composes an object (under `allOf`, a conditional or
 *   `dependentSchemas`) is resolved, so a field factored out of an object is counted on
 *   it.
 * - A reference that is a field's value is another object and is not followed. When it
 *   points inside the same definition, that target is an object of its own.
 * - A definition that is a choice between two references, or a list, is not an object.
 * - A field's own value schema is never searched for further fields of the object.
 */
export function readInventory(schema: JsonObject, options: InventoryOptions): Inventory {
  const problems: string[] = [];
  const composed = new Set<string>();
  const usedAsValue = new Set<string>();
  const nestedQueue: string[] = [];

  const resolve = (ref: string): JsonObject | undefined => {
    let node: unknown = schema;
    for (const segment of ref.slice(2).split('/')) {
      node = isJsonObject(node) ? node[segment] : undefined;
    }
    return isJsonObject(node) ? node : undefined;
  };

  const noteValueRef = (ref: string): void => {
    usedAsValue.add(ref);
    if (resolve(ref) === undefined) {
      problems.push(`a reference has no target: ${ref}`);
    }
    if (ref.split('/').length > 3) {
      nestedQueue.push(ref);
    }
  };

  const noteValueRefsIn = (value: JsonObject): void => {
    for (const holder of [value, value['additionalProperties'], value['items']]) {
      const ref = refOf(holder);
      if (ref !== undefined) {
        noteValueRef(ref);
      }
    }
  };

  const collectField = (acc: Collected, name: string, value: unknown, scope: Scope): void => {
    const field: CollectedField = acc.fields.get(name) ?? {
      values: new Set(),
      fixedAlways: false,
      freeAlways: false,
    };
    acc.fields.set(name, field);
    const fixed = isJsonObject(value) ? fixedValuesOf(value) : [];
    for (const item of fixed) {
      field.values.add(item);
    }
    if (!scope.conditional) {
      field.fixedAlways ||= fixed.length > 0;
      field.freeAlways ||= fixed.length === 0;
    }
    if (!isJsonObject(value)) {
      return;
    }
    noteValueRefsIn(value);
    if (isJsonObject(value['properties'])) {
      problems.push(`${acc.name}.${name} declares fields inline; they are not counted`);
    }
  };

  const collectKeyed = (acc: Collected, pattern: string, value: unknown): void => {
    const ref = refOf(value);
    if (ref !== undefined) {
      noteValueRef(ref);
    }
    acc.keyedBy.add(pattern);
  };

  type Visit = (value: unknown, acc: Collected, scope: Scope) => void;

  const visitProperties: Visit = (value, acc, scope) => {
    if (isJsonObject(value)) {
      for (const [name, field] of membersOf(value)) {
        collectField(acc, name, field, scope);
      }
    }
  };

  const visitPatternProperties: Visit = (value, acc) => {
    if (isJsonObject(value)) {
      for (const [pattern, entry] of membersOf(value)) {
        collectKeyed(acc, pattern, entry);
      }
    }
  };

  const visitAdditionalProperties: Visit = (value, acc) => {
    if (isJsonObject(value)) {
      collectKeyed(acc, '*', value);
    }
  };

  const visitRef: Visit = (value, acc, scope) => {
    if (typeof value !== 'string') {
      return;
    }
    if (value === options.extensionRef) {
      acc.extensible = true;
    } else if (!scope.seen.has(value)) {
      const target = resolve(value);
      if (target === undefined) {
        problems.push(`${acc.name} composes a reference that has no target: ${value}`);
        return;
      }
      composed.add(value);
      walk(target, acc, { ...scope, seen: new Set([...scope.seen, value]) });
    }
  };

  const skip: Visit = () => undefined;

  // Keywords that do not state a field of the object being read: nested definitions,
  // which are objects of their own, and schemas that describe a value or a predicate.
  const visitors = new Map<string, Visit>([
    ['properties', visitProperties],
    ['patternProperties', visitPatternProperties],
    ['additionalProperties', visitAdditionalProperties],
    ['$ref', visitRef],
    ['$defs', skip],
    ['items', skip],
    ['prefixItems', skip],
    ['contains', skip],
    ['not', skip],
  ]);

  function walk(node: unknown, acc: Collected, scope: Scope): void {
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item, acc, scope);
      }
      return;
    }
    if (!isJsonObject(node)) {
      return;
    }
    for (const [key, value] of membersOf(node)) {
      const visit = visitors.get(key) ?? walk;
      visit(value, acc, BRANCHING.has(key) ? { ...scope, conditional: true } : scope);
    }
  }

  // A definition that is a choice between two references is one object or the other.
  const noteChoice = (definition: JsonObject): void => {
    for (const branch of [definition['then'], definition['else']]) {
      const target = refOf(branch);
      if (target !== undefined) {
        noteValueRef(target);
      }
    }
  };

  // A definition that is a list of other objects declares no fields of its own.
  const isList = (definition: JsonObject): boolean => definition['type'] === 'array';

  const isChoice = (definition: JsonObject): boolean =>
    !isJsonObject(definition['properties']) &&
    refOf(definition['then']) !== undefined &&
    refOf(definition['else']) !== undefined;

  const describe = (name: string, definition: JsonObject, ref: string | undefined): ObjectKind => {
    const acc: Collected = { name, fields: new Map(), keyedBy: new Set(), extensible: false };
    walk(definition, acc, { seen: new Set(ref === undefined ? [] : [ref]), conditional: false });
    for (const correction of options.corrections) {
      if (correction.object !== name) {
        continue;
      }
      const published = acc.fields.get(correction.published);
      if (published === undefined) {
        problems.push(`a correction no longer applies: ${name}.${correction.published}`);
        continue;
      }
      acc.fields.delete(correction.published);
      acc.fields.set(correction.specified, published);
    }
    return {
      name,
      extensible: acc.extensible,
      keyedBy: [...acc.keyedBy].sort(byName),
      fields: [...acc.fields]
        .map(([fieldName, field]) => ({
          name: fieldName,
          values: [...field.values].sort(byName),
          open: field.freeAlways && !field.fixedAlways,
        }))
        .sort((a, b) => byName(a.name, b.name)),
    };
  };

  const found: { readonly ref: string | undefined; readonly kind: ObjectKind }[] = [
    { ref: undefined, kind: describe(options.rootName, schema, undefined) },
  ];
  const definitions = schema['$defs'];
  if (isJsonObject(definitions)) {
    for (const [name, definition] of membersOf(definitions)) {
      if (!isJsonObject(definition)) {
        continue;
      }
      if (isList(definition)) {
        noteValueRefsIn(definition);
        continue;
      }
      if (isChoice(definition)) {
        noteChoice(definition);
        continue;
      }
      const ref = `${DEFS_PREFIX}${name}`;
      found.push({ ref, kind: describe(name, definition, ref) });
    }
  }
  const described = new Set<string>();
  for (let next = nestedQueue.shift(); next !== undefined; next = nestedQueue.shift()) {
    const definition = resolve(next);
    if (described.has(next) || definition === undefined) {
      continue;
    }
    described.add(next);
    found.push({ ref: next, kind: describe(shortName(next), definition, next) });
  }

  const folded = [...composed].filter(
    (ref) => !usedAsValue.has(ref) && ref.split('/').length === 3,
  );
  return {
    objects: found
      .filter((entry) => entry.ref === undefined || !folded.includes(entry.ref))
      .map((entry) => entry.kind),
    folded: folded.map(shortName).sort(byName),
    problems,
  };
}

/**
 * One keyword a JSON Schema vocabulary declares.
 */
export interface KeywordKind {
  readonly vocabulary: string;
  readonly keyword: string;
}

/**
 * The values `type` may take, as the validation vocabulary's meta-schema lists them.
 */
export function readTypeValues(validationMetaSchema: JsonObject): readonly string[] {
  const definitions = validationMetaSchema['$defs'];
  const simpleTypes = isJsonObject(definitions) ? definitions['simpleTypes'] : undefined;
  const values = isJsonObject(simpleTypes) ? simpleTypes['enum'] : undefined;
  return Array.isArray(values) ? values.map(String).sort(byName) : [];
}

/**
 * The keywords a vocabulary's meta-schema declares: its property names.
 */
export function readKeywords(vocabulary: string, metaSchema: JsonObject): readonly KeywordKind[] {
  const properties = metaSchema['properties'];
  if (!isJsonObject(properties)) {
    return [];
  }
  return Object.keys(properties).map((keyword) => ({ vocabulary, keyword }));
}
