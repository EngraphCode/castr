/**
 * The constructs of Zod, read from the installed package's own types.
 *
 * This test compiles against the installed package, so it is an end-to-end test of the
 * reading. Each expectation is a fact about Zod at the pinned version: a release that adds
 * a schema kind, a check or a format fails here, and the lists are then read again.
 */

import { describe, it, expect } from 'vitest';

import { readZodConstructs, ZOD_PINNED_VERSION } from './zod-constructs.js';

const constructs = readZodConstructs();

type Row = readonly [string, readonly string[]];
type ConstructRow = readonly [string, string, readonly string[], boolean];

/**
 * Every schema Zod exports a definition for: its interface, the kind it states, the
 * fields it holds beyond `type`, `error` and `checks`, and whether Zod's own union of
 * schemas lists it.
 */
const SCHEMAS: readonly ConstructRow[] = [
  ['$ZodAny', 'any', [], true],
  ['$ZodArray', 'array', ['element'], true],
  ['$ZodBigInt', 'bigint', ['coerce'], true],
  ['$ZodBigIntFormat', 'bigint', ['abort', 'check', 'coerce', 'format', 'when'], false],
  ['$ZodBoolean', 'boolean', ['coerce'], true],
  ['$ZodCatch', 'catch', ['catchValue', 'innerType'], true],
  ['$ZodCodec', 'pipe', ['in', 'out', 'reverseTransform', 'transform'], false],
  ['$ZodCustom', 'custom', ['abort', 'check', 'fn', 'params', 'path', 'when'], true],
  [
    '$ZodCustomStringFormat',
    'string',
    ['abort', 'check', 'coerce', 'fn', 'format', 'pattern', 'when'],
    false,
  ],
  ['$ZodDate', 'date', ['coerce'], true],
  ['$ZodDefault', 'default', ['defaultValue', 'innerType'], true],
  [
    '$ZodDiscriminatedUnion',
    'union',
    ['discriminator', 'inclusive', 'options', 'unionFallback'],
    false,
  ],
  ['$ZodEnum', 'enum', ['entries'], true],
  ['$ZodExactOptional', 'optional', ['innerType'], false],
  ['$ZodFile', 'file', [], true],
  ['$ZodFunction', 'function', ['input', 'output'], true],
  ['$ZodIntersection', 'intersection', ['left', 'right'], true],
  ['$ZodLazy', 'lazy', ['getter'], true],
  ['$ZodLiteral', 'literal', ['values'], true],
  ['$ZodMap', 'map', ['keyType', 'valueType'], true],
  ['$ZodNaN', 'nan', [], true],
  ['$ZodNever', 'never', [], true],
  ['$ZodNonOptional', 'nonoptional', ['innerType'], true],
  ['$ZodNull', 'null', [], true],
  ['$ZodNullable', 'nullable', ['innerType'], true],
  ['$ZodNumber', 'number', ['coerce'], true],
  ['$ZodNumberFormat', 'number', ['abort', 'check', 'coerce', 'format', 'when'], false],
  ['$ZodObject', 'object', ['catchall', 'shape'], true],
  ['$ZodOptional', 'optional', ['innerType'], true],
  ['$ZodPipe', 'pipe', ['in', 'out', 'reverseTransform', 'transform'], true],
  ['$ZodPrefault', 'prefault', ['defaultValue', 'innerType'], true],
  ['$ZodPreprocess', 'pipe', ['in', 'out', 'reverseTransform', 'transform'], false],
  ['$ZodPromise', 'promise', ['innerType'], true],
  ['$ZodReadonly', 'readonly', ['innerType'], true],
  ['$ZodRecord', 'record', ['keyType', 'mode', 'partial', 'valueType'], true],
  ['$ZodSet', 'set', ['valueType'], true],
  ['$ZodString', 'string', ['coerce'], true],
  ['$ZodStringFormat', 'string', ['abort', 'check', 'coerce', 'format', 'pattern', 'when'], false],
  ['$ZodSuccess', 'success', ['innerType'], true],
  ['$ZodSymbol', 'symbol', [], true],
  ['$ZodTemplateLiteral', 'template_literal', ['format', 'parts'], true],
  ['$ZodTransform', 'transform', ['transform'], true],
  ['$ZodTuple', 'tuple', ['items', 'rest'], true],
  ['$ZodUndefined', 'undefined', [], true],
  ['$ZodUnion', 'union', ['inclusive', 'options'], true],
  ['$ZodUnknown', 'unknown', [], true],
  ['$ZodVoid', 'void', [], true],
  ['$ZodXor', 'union', ['inclusive', 'options'], false],
];

/**
 * Every check Zod exports a definition for: its interface, the check it states, the
 * fields it holds beyond `check`, `error`, `abort` and `when`, and whether Zod's own
 * union of checks lists it.
 */
const CHECKS: readonly ConstructRow[] = [
  ['$ZodCheckBigIntFormat', 'bigint_format', ['format'], true],
  ['$ZodCheckGreaterThan', 'greater_than', ['inclusive', 'value'], true],
  ['$ZodCheckLengthEquals', 'length_equals', ['length'], true],
  ['$ZodCheckLessThan', 'less_than', ['inclusive', 'value'], true],
  ['$ZodCheckMaxLength', 'max_length', ['maximum'], true],
  ['$ZodCheckMaxSize', 'max_size', ['maximum'], true],
  ['$ZodCheckMimeType', 'mime_type', ['mime'], true],
  ['$ZodCheckMinLength', 'min_length', ['minimum'], true],
  ['$ZodCheckMinSize', 'min_size', ['minimum'], true],
  ['$ZodCheckMultipleOf', 'multiple_of', ['value'], true],
  ['$ZodCheckNumberFormat', 'number_format', ['format'], true],
  ['$ZodCheckOverwrite', 'overwrite', ['tx'], true],
  ['$ZodCheckProperties', 'properties', ['shape'], false],
  ['$ZodCheckProperty', 'property', ['property', 'schema'], true],
  ['$ZodCheckSizeEquals', 'size_equals', ['size'], true],
  ['$ZodCheckStringFormat', 'string_format', ['format', 'pattern'], true],
];

/** Every string format Zod defines a schema or a check for, with its own fields. */
const STRING_FORMATS: readonly Row[] = [
  ['base64', []],
  ['base64url', []],
  ['cidrv4', ['version']],
  ['cidrv6', ['version']],
  ['credit_card', []],
  ['cuid', []],
  ['cuid2', []],
  ['currency_code', ['fn']],
  ['date', []],
  ['datetime', ['local', 'offset', 'precision']],
  ['duration', []],
  ['e164', []],
  ['email', []],
  ['emoji', []],
  ['ends_with', ['suffix']],
  ['guid', []],
  ['hex', ['fn']],
  ['hostname', ['fn']],
  ['iban', []],
  ['includes', ['includes', 'position']],
  ['ipv4', ['version']],
  ['ipv6', ['version']],
  ['jwt', ['alg']],
  ['ksuid', []],
  ['lowercase', []],
  ['mac', ['delimiter']],
  ['md5_base64', ['fn']],
  ['md5_base64url', ['fn']],
  ['md5_hex', ['fn']],
  ['nanoid', ['length']],
  ['regex', []],
  ['sha1_base64', ['fn']],
  ['sha1_base64url', ['fn']],
  ['sha1_hex', ['fn']],
  ['sha256_base64', ['fn']],
  ['sha256_base64url', ['fn']],
  ['sha256_hex', ['fn']],
  ['sha384_base64', ['fn']],
  ['sha384_base64url', ['fn']],
  ['sha384_hex', ['fn']],
  ['sha512_base64', ['fn']],
  ['sha512_base64url', ['fn']],
  ['sha512_hex', ['fn']],
  ['starts_with', ['prefix']],
  ['time', ['precision']],
  ['ulid', []],
  ['uppercase', []],
  ['url', ['hostname', 'normalize', 'protocol']],
  ['uuid', ['version']],
  ['xid', []],
];

/** The names in Zod's own list of string formats. */
const STRING_FORMAT_NAMES: readonly string[] = [
  'base64',
  'base64url',
  'cidrv4',
  'cidrv6',
  'credit_card',
  'cuid',
  'cuid2',
  'date',
  'datetime',
  'duration',
  'e164',
  'email',
  'emoji',
  'ends_with',
  'guid',
  'iban',
  'includes',
  'ipv4',
  'ipv6',
  'json_string',
  'jwt',
  'ksuid',
  'lowercase',
  'nanoid',
  'regex',
  'starts_with',
  'time',
  'ulid',
  'uppercase',
  'url',
  'uuid',
  'xid',
];

describe('the pinned version of Zod', () => {
  it('is the version the lists were read at', () => {
    expect(constructs.version).toBe(ZOD_PINNED_VERSION);
  });
});

describe('the schema kinds of Zod', () => {
  it('lists the 40 values a schema definition may give for its type', () => {
    expect(constructs.kindValues).toEqual([
      'any',
      'array',
      'bigint',
      'boolean',
      'catch',
      'custom',
      'date',
      'default',
      'enum',
      'file',
      'function',
      'int',
      'intersection',
      'lazy',
      'literal',
      'map',
      'nan',
      'never',
      'nonoptional',
      'null',
      'nullable',
      'number',
      'object',
      'optional',
      'pipe',
      'prefault',
      'promise',
      'readonly',
      'record',
      'set',
      'string',
      'success',
      'symbol',
      'template_literal',
      'transform',
      'tuple',
      'undefined',
      'union',
      'unknown',
      'void',
    ]);
  });

  it('reads a schema of every kind but int, which is a format of number', () => {
    const kinds = new Set(constructs.schemas.map((entry) => entry.kind));

    expect(constructs.kindValues.filter((kind) => !kinds.has(kind))).toEqual(['int']);
  });

  it('lists all 48 schemas, each with its kind and the fields of its definition', () => {
    expect(constructs.schemas).toHaveLength(48);
    expect(
      constructs.schemas.map((entry) => [entry.name, entry.kind, entry.fields, entry.listed]),
    ).toEqual(SCHEMAS);
  });

  it('finds nine schemas that the union Zod states of its schemas leaves out', () => {
    const unlisted = constructs.schemas.filter((entry) => !entry.listed);

    expect(unlisted.map((entry) => entry.name)).toEqual([
      '$ZodBigIntFormat',
      '$ZodCodec',
      '$ZodCustomStringFormat',
      '$ZodDiscriminatedUnion',
      '$ZodExactOptional',
      '$ZodNumberFormat',
      '$ZodPreprocess',
      '$ZodStringFormat',
      '$ZodXor',
    ]);
  });
});

describe('the checks of Zod', () => {
  it('lists all 16 checks, each with the fields of its definition', () => {
    expect(constructs.checks).toHaveLength(16);
    expect(
      constructs.checks.map((entry) => [entry.name, entry.check, entry.fields, entry.listed]),
    ).toEqual(CHECKS);
  });

  it('finds one check that the union Zod states of its checks leaves out', () => {
    const unlisted = constructs.checks.filter((entry) => !entry.listed);

    expect(unlisted.map((entry) => entry.name)).toEqual(['$ZodCheckProperties']);
  });
});

describe('the formats of Zod', () => {
  it('lists the 32 names in its own list of string formats', () => {
    expect(constructs.stringFormatNames).toHaveLength(32);
    expect(constructs.stringFormatNames).toEqual(STRING_FORMAT_NAMES);
  });

  it('lists the 50 string formats it defines, each with its own fields', () => {
    expect(constructs.stringFormats).toHaveLength(50);
    expect(constructs.stringFormats.map((entry) => [entry.format, entry.fields])).toEqual(
      STRING_FORMATS,
    );
  });

  it('defines 19 formats its own list of names leaves out, and names one it does not define', () => {
    const defined = constructs.stringFormats.map((entry) => entry.format);
    const named = constructs.stringFormatNames;

    expect(defined.filter((format) => !named.includes(format))).toEqual([
      'currency_code',
      'hex',
      'hostname',
      'mac',
      'md5_base64',
      'md5_base64url',
      'md5_hex',
      'sha1_base64',
      'sha1_base64url',
      'sha1_hex',
      'sha256_base64',
      'sha256_base64url',
      'sha256_hex',
      'sha384_base64',
      'sha384_base64url',
      'sha384_hex',
      'sha512_base64',
      'sha512_base64url',
      'sha512_hex',
    ]);
    expect(named.filter((format) => !defined.includes(format))).toEqual(['json_string']);
  });

  it('lists the five number formats and the two bigint formats', () => {
    expect(constructs.numberFormats).toEqual(['float32', 'float64', 'int32', 'safeint', 'uint32']);
    expect(constructs.bigintFormats).toEqual(['int64', 'uint64']);
  });
});
