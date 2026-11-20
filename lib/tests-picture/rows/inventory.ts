import { isJsonObject, membersOf, type JsonObject } from './json.js';

/**
 * One field an object of a format may hold, with the fixed values the published
 * definition allows it. A field with no fixed values has an empty list.
 */
export interface FieldKind {
  readonly name: string;
  readonly values: readonly string[];
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

interface Collected {
  readonly name: string;
  readonly fields: Map<string, Set<string>>;
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
 * - A definition that is a choice between two references is not an object.
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

  const collectField = (acc: Collected, name: string, value: unknown): void => {
    const values = acc.fields.get(name) ?? new Set<string>();
    acc.fields.set(name, values);
    if (!isJsonObject(value)) {
      return;
    }
    const allowed = value['enum'];
    if (Array.isArray(allowed)) {
      for (const item of allowed) {
        values.add(String(item));
      }
    }
    if ('const' in value) {
      values.add(String(value['const']));
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

  type Visit = (value: unknown, acc: Collected, seen: ReadonlySet<string>) => void;

  const visitProperties: Visit = (value, acc) => {
    if (isJsonObject(value)) {
      for (const [name, field] of membersOf(value)) {
        collectField(acc, name, field);
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

  const visitRef: Visit = (value, acc, seen) => {
    if (typeof value !== 'string') {
      return;
    }
    if (value === options.extensionRef) {
      acc.extensible = true;
    } else if (!seen.has(value)) {
      composed.add(value);
      walk(resolve(value), acc, new Set([...seen, value]));
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

  function walk(node: unknown, acc: Collected, seen: ReadonlySet<string>): void {
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item, acc, seen);
      }
      return;
    }
    if (!isJsonObject(node)) {
      return;
    }
    for (const [key, value] of membersOf(node)) {
      const visit = visitors.get(key) ?? walk;
      visit(value, acc, seen);
    }
  }

  // A definition that is a list of other objects declares no fields of its own.
  const isList = (definition: JsonObject): boolean => definition['type'] === 'array';

  const isChoice = (definition: JsonObject): boolean =>
    !isJsonObject(definition['properties']) &&
    refOf(definition['then']) !== undefined &&
    refOf(definition['else']) !== undefined;

  const describe = (name: string, definition: JsonObject, ref: string | undefined): ObjectKind => {
    const acc: Collected = { name, fields: new Map(), keyedBy: new Set(), extensible: false };
    if (isChoice(definition)) {
      for (const branch of [definition['then'], definition['else']]) {
        const target = refOf(branch);
        if (target !== undefined) {
          noteValueRef(target);
        }
      }
    } else {
      walk(definition, acc, new Set(ref === undefined ? [] : [ref]));
    }
    for (const correction of options.corrections) {
      if (correction.object !== name) {
        continue;
      }
      const values = acc.fields.get(correction.published);
      if (values === undefined) {
        problems.push(`a correction no longer applies: ${name}.${correction.published}`);
        continue;
      }
      acc.fields.delete(correction.published);
      acc.fields.set(correction.specified, values);
    }
    return {
      name,
      extensible: acc.extensible,
      keyedBy: [...acc.keyedBy].sort(byName),
      fields: [...acc.fields]
        .map(([fieldName, values]) => ({ name: fieldName, values: [...values].sort(byName) }))
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
 * The keywords a vocabulary's meta-schema declares: its property names.
 */
export function readKeywords(vocabulary: string, metaSchema: JsonObject): readonly KeywordKind[] {
  const properties = metaSchema['properties'];
  if (!isJsonObject(properties)) {
    return [];
  }
  return Object.keys(properties).map((keyword) => ({ vocabulary, keyword }));
}
