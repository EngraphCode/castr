/**
 * What Zod's public functions and methods build, and what the constructs Appendix A of
 * the specification names leave in a schema.
 *
 * Two readings, set against each other:
 *
 * - **By type.** Every function the `zod` module exports, every function of its `iso`
 *   and `coerce` namespaces, and every method of a schema, that returns a schema or a
 *   check, with the kind its return type states. Read through the compiler from resolved types.
 * - **By running.** Each construct Appendix A names is built at the installed version,
 *   and the definition it leaves is read: its class, its kind, its fields, the checks it
 *   holds and the kind of each field that is itself a schema. This shows what no type states, such as
 *   the `catchall` a strict object is given.
 */

import type { Node, Symbol as MorphSymbol, Type } from 'ts-morph';
import * as z from 'zod';

import {
  byName,
  compileZodProbe,
  declaredInterface,
  definitionOf,
  literalValues,
  propertyType,
} from './zod-types.js';

/**
 * What one function or method returns, by its return type: a schema, a check, or both.
 * A return type cannot say whether the schema was made or was already there, so a
 * function that hands back a schema it was given, such as `.unwrap` or
 * `z.getDiscriminatedOption`, is listed beside one that makes a new schema. Telling
 * the two apart is for the list made by hand. `anySchema` and `anyCheck` say
 * the return type states a schema or a check without saying which kind.
 */
export interface ZodBuilder {
  readonly name: string;
  readonly schemaKinds: readonly string[];
  readonly anySchema: boolean;
  readonly checkKinds: readonly string[];
  readonly anyCheck: boolean;
}

/** What Zod's public surface builds, by type. */
export interface ZodBuilders {
  /** Exported functions that return a schema or a check, named as `z.name`. */
  readonly factories: readonly ZodBuilder[];
  /** Methods of every schema that return a schema, named as `.name`. */
  readonly methods: readonly ZodBuilder[];
  /** For each kind of schema, such methods its classes have beyond those of every schema. */
  readonly kindMethods: readonly ZodKindMethods[];
}

/**
 * The methods the classes of one kind of schema have beyond those every schema has, that
 * return a schema or a check.
 */
interface ZodKindMethods {
  readonly kind: string;
  readonly methods: readonly string[];
}

/** What one built schema holds, read from its definition. */
export interface ZodBuilt {
  readonly construct: string;
  readonly builtClass: string;
  readonly kind: string;
  /** The definition's fields beyond `type`, `error` and `checks` that hold a value. */
  readonly fields: readonly string[];
  /** The check each attached check states, with its format where it states one. */
  readonly checks: readonly string[];
  /**
   * For each field whose value is itself a schema, the kind of that schema. A schema held
   * inside a list or a map, such as an object's shape, is not read.
   */
  readonly inner: Readonly<Record<string, string>>;
  /** Whether building the construct entered the schema in Zod's registry of metadata. */
  readonly registered: boolean;
}

const NAMESPACES = ['iso', 'coerce'] as const;
const SHARED_FIELDS = new Set(['type', 'error', 'checks']);
const PROBE_SOURCE = `import * as z from 'zod';
export type Schema = z.ZodType;
`;

/** What one return type states it is: a schema of some kinds, a check of some kinds. */
function readReturn(returned: Type, at: Node, everyKind: number): Omit<ZodBuilder, 'name'> {
  const definition = definitionOf(returned, at);
  const kinds = literalValues(propertyType(definition, 'type', at));
  const checks = literalValues(propertyType(definition, 'check', at));
  const statesAKind = definition?.getProperty('type') !== undefined;
  const statesACheck = definition?.getProperty('check') !== undefined;
  const anySchema = statesAKind && (kinds.length === 0 || kinds.length === everyKind);
  return {
    schemaKinds: anySchema ? [] : kinds,
    anySchema,
    checkKinds: checks,
    anyCheck: statesACheck && checks.length === 0,
  };
}

function merged(name: string, parts: readonly Omit<ZodBuilder, 'name'>[]): ZodBuilder {
  const distinct = (values: readonly string[]): readonly string[] =>
    [...new Set(values)].sort(byName);
  return {
    name,
    schemaKinds: distinct(parts.flatMap((part) => part.schemaKinds)),
    anySchema: parts.some((part) => part.anySchema),
    checkKinds: distinct(parts.flatMap((part) => part.checkKinds)),
    anyCheck: parts.some((part) => part.anyCheck),
  };
}

function returnsASchemaOrACheck(builder: ZodBuilder): boolean {
  return (
    builder.anySchema ||
    builder.anyCheck ||
    builder.schemaKinds.length > 0 ||
    builder.checkKinds.length > 0
  );
}

function readCallables(
  prefix: string,
  symbols: readonly MorphSymbol[],
  at: Node,
  everyKind: number,
): readonly ZodBuilder[] {
  return symbols
    .flatMap((symbol) => {
      const signatures = symbol.getTypeAtLocation(at).getCallSignatures();
      if (signatures.length === 0) {
        return [];
      }
      const returns = signatures.map((signature) =>
        readReturn(signature.getReturnType(), at, everyKind),
      );
      return [merged(`${prefix}${symbol.getName()}`, returns)];
    })
    .filter(returnsASchemaOrACheck)
    .sort((left, right) => byName(left.name, right.name));
}

/**
 * Reads, for every exported schema class, the methods it has that not every schema has
 * and that return a schema or a check, and gathers them by the kind the class's
 * definition states. A method that returns anything else, such as a function schema's
 * `implement`, is left out.
 */
function readKindMethods(
  exported: readonly MorphSymbol[],
  shared: ReadonlySet<string>,
  at: Node,
  everyKind: number,
): readonly ZodKindMethods[] {
  const byKind = new Map<string, Set<string>>();
  for (const symbol of exported) {
    const declared = declaredInterface(symbol);
    const [kind, ...others] = literalValues(propertyType(definitionOf(declared, at), 'type', at));
    if (declared === undefined || kind === undefined || others.length > 0) {
      continue;
    }
    const own = declared.getProperties().filter((property) => !shared.has(property.getName()));
    const methods = byKind.get(kind) ?? new Set<string>();
    for (const builder of readCallables('', own, at, everyKind)) {
      methods.add(builder.name);
    }
    byKind.set(kind, methods);
  }
  return [...byKind]
    .filter(([, methods]) => methods.size > 0)
    .map(([kind, methods]) => ({ kind, methods: [...methods].sort(byName) }))
    .sort((left, right) => byName(left.kind, right.kind));
}

/**
 * Reads what Zod's exported functions and its schemas' methods build, from their types.
 */
export function readZodBuilders(): ZodBuilders {
  const probe = compileZodProbe('zod-builders.probe.ts', 'zod', PROBE_SOURCE);
  const at = probe.file.getTypeAliasOrThrow('Schema');
  const schema = at.getType();
  const everyKind = literalValues(propertyType(definitionOf(schema, at), 'type', at)).length;
  const { exported } = probe;

  const inNamespaces = NAMESPACES.flatMap((namespace) => {
    const found = exported.find((symbol) => symbol.getName() === namespace);
    if (found === undefined) {
      throw new Error(`zod exports no namespace ${namespace}`);
    }
    const members = found.getTypeAtLocation(at).getProperties();
    return readCallables(`z.${namespace}.`, members, at, everyKind);
  });

  return {
    factories: [...readCallables('z.', exported, at, everyKind), ...inNamespaces].sort(
      (left, right) => byName(left.name, right.name),
    ),
    methods: readCallables('.', schema.getProperties(), at, everyKind),
    kindMethods: readKindMethods(
      exported,
      new Set(schema.getProperties().map((property) => property.getName())),
      at,
      everyKind,
    ),
  };
}

function checkName(check: z.core.$ZodCheck): string {
  const definition = check._zod.def;
  const format: unknown = 'format' in definition ? definition.format : undefined;
  return typeof format === 'string' ? `${definition.check}:${format}` : definition.check;
}

/**
 * Reads what one built schema holds.
 */
function readBuilt(construct: string, schema: z.ZodType): ZodBuilt {
  const definition = schema._zod.def;
  // Zod's registry is one for the whole process. What the example entered is taken out
  // again, so that reading leaves no trace for whatever runs next.
  const registered = z.globalRegistry.has(schema);
  z.globalRegistry.remove(schema);
  const held = Object.entries(definition).filter(
    ([name, value]: [string, unknown]) => !SHARED_FIELDS.has(name) && value !== undefined,
  );
  const inner = held.flatMap(([name, value]: [string, unknown]) =>
    value instanceof z.ZodType ? [[name, value._zod.def.type] as const] : [],
  );
  return {
    construct,
    builtClass: schema.constructor.name,
    kind: definition.type,
    fields: held.map(([name]) => name).sort(byName),
    checks: (definition.checks ?? []).map(checkName),
    inner: Object.fromEntries(inner),
    registered,
  };
}

const text = z.string();
const shape = { a: z.string() };

/**
 * One example of each construct Appendix A names, built at the installed version. The
 * name is the one Appendix A gives; a row there that names a family, such as
 * `z.coerce.*`, has one example here.
 */
const APPENDIX_A_EXAMPLES: readonly (readonly [string, () => z.ZodType])[] = [
  ['.refine', () => text.refine(() => true)],
  ['.superRefine', () => text.superRefine(() => undefined)],
  ['.check', () => text.check(z.minLength(1))],
  ['.overwrite', () => text.overwrite((value) => value)],
  ['.transform', () => text.transform((value) => value)],
  ['.pipe', () => text.pipe(z.string())],
  ['z.preprocess', () => z.preprocess((value) => value, text)],
  ['z.codec', () => z.codec(z.string(), z.number(), { decode: Number, encode: String })],
  ['z.stringbool', () => z.stringbool()],
  ['z.coerce.*', () => z.coerce.number()],
  ['.catch', () => text.catch('x')],
  ['.default', () => text.default('x')],
  ['.prefault', () => text.prefault('x')],
  ['.optional', () => text.optional()],
  ['.exactOptional', () => text.exactOptional()],
  ['.nullable', () => text.nullable()],
  ['.nullish', () => text.nullish()],
  ['.readonly', () => z.object(shape).readonly()],
  ['.brand', () => text.brand('Brand')],
  ['z.lazy', () => z.lazy(() => text)],
  ['z.custom', () => z.custom(() => true)],
  ['z.instanceof', () => z.instanceof(Date)],
  ['z.date', () => z.date()],
  ['z.bigint', () => z.bigint()],
  ['z.map', () => z.map(text, text)],
  ['z.set', () => z.set(text)],
  ['z.undefined', () => z.undefined()],
  ['z.void', () => z.void()],
  ['z.symbol', () => z.symbol()],
  ['z.nan', () => z.nan()],
  ['z.file', () => z.file()],
  ['z.never', () => z.never()],
  ['z.unknown', () => z.unknown()],
  ['z.any', () => z.any()],
  ['z.templateLiteral', () => z.templateLiteral(['a', z.number()])],
  ['z.email', () => z.email()],
  ['z.uuid', () => z.uuid()],
  ['z.iso.*', () => z.iso.datetime()],
  ['.meta', () => text.meta({ title: 'a title' })],
  ['.describe', () => text.describe('a description')],
  ['z.strictObject', () => z.strictObject(shape)],
  ['z.looseObject', () => z.looseObject(shape)],
  ['.catchall', () => z.object(shape).catchall(z.number())],
  ['z.object', () => z.object(shape)],
];

/**
 * Builds one example of each construct Appendix A names and reads what it holds.
 */
export function readAppendixABuilt(): readonly ZodBuilt[] {
  return APPENDIX_A_EXAMPLES.map(([construct, build]) => readBuilt(construct, build()));
}
