/**
 * The constructs of Zod, read from the installed package's own types through the
 * compiler.
 *
 * Zod states what a schema can be in three closed unions of its core types: the schemas,
 * the checks and the formats. Each schema and each check holds a definition, a plain
 * object whose fields are what the construct says. This reading lists those, so that a
 * release of Zod that adds one changes the list.
 *
 * Nothing is read from the text of a declaration. Every name and every literal value
 * comes from a type the compiler has resolved.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { Project, ts, type Node, type Type } from 'ts-morph';

/**
 * The version of Zod the lists were read at. A different installed version fails the
 * test that compares them, and the lists are read again.
 */
export const ZOD_PINNED_VERSION = '4.6.7';

/**
 * One kind of schema, with the fields its definition holds beyond the three every
 * definition holds.
 */
interface ZodSchemaKind {
  readonly kind: string;
  readonly fields: readonly string[];
}

/**
 * One kind of check, with the fields its definition holds beyond the four every check
 * holds.
 */
interface ZodCheckKind {
  readonly check: string;
  readonly fields: readonly string[];
}

/**
 * What the installed Zod can hold, as its core types state it.
 */
export interface ZodConstructs {
  readonly version: string;
  readonly kindValues: readonly string[];
  readonly schemaKinds: readonly ZodSchemaKind[];
  readonly checks: readonly ZodCheckKind[];
  readonly stringFormats: readonly string[];
  readonly numberFormats: readonly string[];
  readonly bigintFormats: readonly string[];
}

const SHARED_SCHEMA_FIELDS = new Set(['type', 'error', 'checks']);
const SHARED_CHECK_FIELDS = new Set(['check', 'error', 'abort', 'when']);

const PROBE_SOURCE = `import type * as core from 'zod/v4/core';
export type Definition = core.$ZodTypeDef;
export type Schemas = core.$ZodTypes;
export type Checks = core.$ZodChecks;
export type StringFormats = core.$ZodStringFormats;
export type NumberFormats = core.$ZodNumberFormats;
export type BigIntFormats = core.$ZodBigIntFormats;
`;

function byName(left: string, right: string): number {
  return left.localeCompare(right);
}

function membersOf(type: Type): readonly Type[] {
  return type.isUnion() ? type.getUnionTypes() : [type];
}

function literalValues(type: Type): readonly string[] {
  return membersOf(type)
    .map((member) => member.getLiteralValue())
    .filter((value) => typeof value === 'string')
    .sort(byName);
}

function propertyType(type: Type, name: string, at: Node): Type {
  const property = type.getProperty(name);
  if (property === undefined) {
    throw new Error(`${type.getText()} has no property ${name}`);
  }
  return property.getTypeAtLocation(at);
}

function fieldNames(definition: Type, shared: ReadonlySet<string>): readonly string[] {
  return definition
    .getProperties()
    .map((property) => property.getName())
    .filter((name) => !shared.has(name))
    .sort(byName);
}

function oneLiteral(type: Type, what: string): string {
  const values = literalValues(type);
  const [value] = values;
  if (value === undefined || values.length !== 1) {
    throw new Error(`${what} does not name exactly one kind: ${values.join(', ')}`);
  }
  return value;
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

  const definition = probe.getTypeAliasOrThrow('Definition');
  const schemas = probe.getTypeAliasOrThrow('Schemas');
  const checks = probe.getTypeAliasOrThrow('Checks');

  const schemaKinds = membersOf(schemas.getType())
    .map((schema) => {
      const schemaDefinition = propertyType(propertyType(schema, '_zod', schemas), 'def', schemas);
      return {
        kind: oneLiteral(propertyType(schemaDefinition, 'type', schemas), schema.getText()),
        fields: fieldNames(schemaDefinition, SHARED_SCHEMA_FIELDS),
      };
    })
    .sort((left, right) => byName(left.kind, right.kind));

  const checkKinds = membersOf(checks.getType())
    .map((check) => {
      const checkDefinition = propertyType(propertyType(check, '_zod', checks), 'def', checks);
      return {
        check: oneLiteral(propertyType(checkDefinition, 'check', checks), check.getText()),
        fields: fieldNames(checkDefinition, SHARED_CHECK_FIELDS),
      };
    })
    .sort((left, right) => byName(left.check, right.check));

  return {
    version: readInstalledVersion(),
    kindValues: literalValues(propertyType(definition.getType(), 'type', definition)),
    schemaKinds,
    checks: checkKinds,
    stringFormats: literalValues(probe.getTypeAliasOrThrow('StringFormats').getType()),
    numberFormats: literalValues(probe.getTypeAliasOrThrow('NumberFormats').getType()),
    bigintFormats: literalValues(probe.getTypeAliasOrThrow('BigIntFormats').getType()),
  };
}
