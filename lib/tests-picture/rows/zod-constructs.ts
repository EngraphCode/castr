/**
 * The constructs of Zod, read from the installed package's own types through the
 * compiler.
 *
 * Every schema and every check of Zod holds a definition, a plain object whose fields are
 * what the construct says. Zod's core module exports an interface for each. This reading
 * takes every exported interface that holds a definition and lists it, so that a release
 * of Zod that adds one changes the list.
 *
 * Zod also states unions of its own: its schemas and its checks. They are not complete,
 * so each entry here says whether Zod's own union lists it.
 *
 * Nothing is read from the text of a declaration. Every name and every literal value
 * comes from a type or a symbol the compiler has resolved.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { Project, ts, type Node, type Symbol as MorphSymbol, type Type } from 'ts-morph';

/**
 * The version of Zod the lists were read at. A different installed version fails the
 * test that compares them, and the lists are read again.
 */
export const ZOD_PINNED_VERSION = '4.6.7';

/**
 * One schema: the interface Zod exports for it, the kind its definition states, the
 * fields the definition holds beyond the three every definition holds, and whether Zod's
 * own union of schemas lists it.
 */
interface ZodSchemaConstruct {
  readonly name: string;
  readonly kind: string;
  readonly fields: readonly string[];
  readonly listed: boolean;
}

/**
 * One check: its interface, the check its definition states, the fields the definition
 * holds beyond the four every check holds, and whether Zod's own union of checks lists it.
 */
interface ZodCheckConstruct {
  readonly name: string;
  readonly check: string;
  readonly fields: readonly string[];
  readonly listed: boolean;
}

/**
 * One string format, with the fields its definition holds beyond those every string
 * format holds. A format with no fields takes no parameter.
 */
interface ZodStringFormatConstruct {
  readonly format: string;
  readonly fields: readonly string[];
}

/**
 * What the installed Zod can hold, as its core types state it.
 */
export interface ZodConstructs {
  readonly version: string;
  /** The values a schema definition may give for its `type`. */
  readonly kindValues: readonly string[];
  readonly schemas: readonly ZodSchemaConstruct[];
  readonly checks: readonly ZodCheckConstruct[];
  /** The names in Zod's own list of string formats. */
  readonly stringFormatNames: readonly string[];
  /** The string formats Zod defines a schema or a check for, each with its fields. */
  readonly stringFormats: readonly ZodStringFormatConstruct[];
  readonly numberFormats: readonly string[];
  readonly bigintFormats: readonly string[];
}

const SHARED_SCHEMA_FIELDS = new Set(['type', 'error', 'checks']);
const SHARED_CHECK_FIELDS = new Set(['check', 'error', 'abort', 'when']);
const SHARED_STRING_FORMAT_FIELDS = new Set([
  ...SHARED_SCHEMA_FIELDS,
  ...SHARED_CHECK_FIELDS,
  'coerce',
  'format',
  'pattern',
]);

const PROBE_SOURCE = `import type * as core from 'zod/v4/core';
export type Definition = core.$ZodTypeDef;
export type Schemas = core.$ZodTypes;
export type Checks = core.$ZodChecks;
export type StringFormats = core.$ZodStringFormats;
export type StringFormatConstructs = core.$ZodStringFormatChecks;
export type NumberFormats = core.$ZodNumberFormats;
export type BigIntFormats = core.$ZodBigIntFormats;
`;

/** One exported interface that holds a definition. */
interface Defined {
  readonly name: string;
  readonly definition: Type;
}

function byName(left: string, right: string): number {
  return left.localeCompare(right);
}

function membersOf(type: Type): readonly Type[] {
  return type.isUnion() ? type.getUnionTypes() : [type];
}

function literalValues(type: Type | undefined): readonly string[] {
  if (type === undefined) {
    return [];
  }
  return membersOf(type)
    .map((member) => member.getLiteralValue())
    .filter((value) => typeof value === 'string')
    .sort(byName);
}

/** The one literal a type states, or nothing when it states none or several. */
function oneLiteral(type: Type | undefined): string | undefined {
  const values = literalValues(type);
  return values.length === 1 ? values[0] : undefined;
}

function propertyType(type: Type | undefined, name: string, at: Node): Type | undefined {
  return type?.getProperty(name)?.getTypeAtLocation(at);
}

function fieldNames(definition: Type, shared: ReadonlySet<string>): readonly string[] {
  return definition
    .getProperties()
    .map((property) => property.getName())
    .filter((name) => !shared.has(name))
    .sort(byName);
}

function namesIn(union: Type): ReadonlySet<string> {
  return new Set(
    membersOf(union)
      .map((member) => member.getSymbol()?.getName())
      .filter((name) => name !== undefined),
  );
}

function isInterface(symbol: MorphSymbol): boolean {
  return symbol
    .getDeclarations()
    .some((declaration) => declaration.getKind() === ts.SyntaxKind.InterfaceDeclaration);
}

/** Every interface the module exports that holds a definition. */
function readDefined(exported: readonly MorphSymbol[], at: Node): readonly Defined[] {
  return exported.flatMap((symbol) => {
    const target = symbol.isAlias() ? symbol.getAliasedSymbolOrThrow() : symbol;
    if (!isInterface(target)) {
      return [];
    }
    const definition = propertyType(propertyType(target.getDeclaredType(), '_zod', at), 'def', at);
    return definition === undefined ? [] : [{ name: symbol.getName(), definition }];
  });
}

function readSchemas(
  defined: readonly Defined[],
  listed: ReadonlySet<string>,
  at: Node,
): readonly ZodSchemaConstruct[] {
  return defined
    .flatMap(({ name, definition }) => {
      const kind = oneLiteral(propertyType(definition, 'type', at));
      const formats = literalValues(propertyType(definition, 'format', at));
      const statesACheck = definition.getProperty('check') !== undefined;
      if (kind === undefined || (statesACheck && formats.length > 0)) {
        return [];
      }
      const fields = fieldNames(definition, SHARED_SCHEMA_FIELDS);
      return [{ name, kind, fields, listed: listed.has(name) }];
    })
    .sort((left, right) => byName(left.name, right.name));
}

function readChecks(
  defined: readonly Defined[],
  listed: ReadonlySet<string>,
  at: Node,
): readonly ZodCheckConstruct[] {
  return defined
    .flatMap(({ name, definition }) => {
      const check = oneLiteral(propertyType(definition, 'check', at));
      const isASchema = definition.getProperty('type') !== undefined;
      const formats = literalValues(propertyType(definition, 'format', at));
      if (check === undefined || isASchema || formats.length > 0) {
        return [];
      }
      const fields = fieldNames(definition, SHARED_CHECK_FIELDS);
      return [{ name, check, fields, listed: listed.has(name) }];
    })
    .sort((left, right) => byName(left.name, right.name));
}

/**
 * The string formats, read from Zod's union of every schema and check that states one.
 * The union is read, and not the exported interfaces, because Zod defines some formats
 * only as one generic interface given a name there: `hex`, `hostname`, the currency code
 * and the hash formats. One member may name several formats; each is listed.
 */
function readStringFormats(union: Type, at: Node): readonly ZodStringFormatConstruct[] {
  return membersOf(union)
    .flatMap((construct) => {
      const definition = propertyType(propertyType(construct, '_zod', at), 'def', at);
      if (definition === undefined) {
        return [];
      }
      const fields = fieldNames(definition, SHARED_STRING_FORMAT_FIELDS);
      return literalValues(propertyType(definition, 'format', at)).map((format) => ({
        format,
        fields,
      }));
    })
    .sort((left, right) => byName(left.format, right.format));
}

function readInstalledVersion(): string {
  const require = createRequire(import.meta.url);
  const manifest: unknown = require('zod/package.json');
  if (typeof manifest !== 'object' || manifest === null || !('version' in manifest)) {
    throw new TypeError('the installed zod package states no version');
  }
  const { version } = manifest;
  if (typeof version !== 'string') {
    throw new TypeError('the installed zod package states a version that is not text');
  }
  return version;
}

/**
 * Reads the installed Zod's constructs from its core types.
 */
export function readZodConstructs(): ZodConstructs {
  const project = new Project({
    compilerOptions: {
      strict: true,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      skipLibCheck: true,
      noEmit: true,
    },
    skipAddingFilesFromTsConfig: true,
  });
  const probe = project.createSourceFile(
    fileURLToPath(new URL('zod-constructs.probe.ts', import.meta.url)),
    PROBE_SOURCE,
    { overwrite: true },
  );
  const unresolved = project.getPreEmitDiagnostics();
  if (unresolved.length > 0) {
    throw new Error(`the probe of zod's types does not compile: ${String(unresolved.length)}`);
  }

  const at = probe.getTypeAliasOrThrow('Definition');
  const core = probe
    .getImportDeclarationOrThrow('zod/v4/core')
    .getModuleSpecifierSourceFileOrThrow();
  const exported = project.getTypeChecker().getExportsOfModule(core.getSymbolOrThrow());
  const defined = readDefined(exported, at);
  const aliasType = (name: string): Type => probe.getTypeAliasOrThrow(name).getType();

  return {
    version: readInstalledVersion(),
    kindValues: literalValues(propertyType(at.getType(), 'type', at)),
    schemas: readSchemas(defined, namesIn(aliasType('Schemas')), at),
    checks: readChecks(defined, namesIn(aliasType('Checks')), at),
    stringFormatNames: literalValues(aliasType('StringFormats')),
    stringFormats: readStringFormats(aliasType('StringFormatConstructs'), at),
    numberFormats: literalValues(aliasType('NumberFormats')),
    bigintFormats: literalValues(aliasType('BigIntFormats')),
  };
}
