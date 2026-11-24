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

/** Every schema kind, with the fields its definition holds beyond `type`, `error` and `checks`. */
const SCHEMA_KINDS: readonly Row[] = [
  ['any', []],
  ['array', ['element']],
  ['bigint', ['coerce']],
  ['boolean', ['coerce']],
  ['catch', ['catchValue', 'innerType']],
  ['custom', ['abort', 'check', 'fn', 'params', 'path', 'when']],
  ['date', ['coerce']],
  ['default', ['defaultValue', 'innerType']],
  ['enum', ['entries']],
  ['file', []],
  ['function', ['input', 'output']],
  ['intersection', ['left', 'right']],
  ['lazy', ['getter']],
  ['literal', ['values']],
  ['map', ['keyType', 'valueType']],
  ['nan', []],
  ['never', []],
  ['nonoptional', ['innerType']],
  ['null', []],
  ['nullable', ['innerType']],
  ['number', ['coerce']],
  ['object', ['catchall', 'shape']],
  ['optional', ['innerType']],
  ['pipe', ['in', 'out', 'reverseTransform', 'transform']],
  ['prefault', ['defaultValue', 'innerType']],
  ['promise', ['innerType']],
  ['readonly', ['innerType']],
  ['record', ['keyType', 'mode', 'partial', 'valueType']],
  ['set', ['valueType']],
  ['string', ['coerce']],
  ['success', ['innerType']],
  ['symbol', []],
  ['template_literal', ['format', 'parts']],
  ['transform', ['transform']],
  ['tuple', ['items', 'rest']],
  ['undefined', []],
  ['union', ['inclusive', 'options']],
  ['unknown', []],
  ['void', []],
];

/** Every check, with the fields its definition holds beyond `check`, `error`, `abort` and `when`. */
const CHECKS: readonly Row[] = [
  ['bigint_format', ['format']],
  ['greater_than', ['inclusive', 'value']],
  ['length_equals', ['length']],
  ['less_than', ['inclusive', 'value']],
  ['max_length', ['maximum']],
  ['max_size', ['maximum']],
  ['mime_type', ['mime']],
  ['min_length', ['minimum']],
  ['min_size', ['minimum']],
  ['multiple_of', ['value']],
  ['number_format', ['format']],
  ['overwrite', ['tx']],
  ['property', ['property', 'schema']],
  ['size_equals', ['size']],
  ['string_format', ['format', 'pattern']],
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

  it('reads a definition for 39 of them, and none for int, which is a format of number', () => {
    const read = constructs.schemaKinds.map((entry) => entry.kind);

    expect(read).toHaveLength(39);
    expect(constructs.kindValues.filter((kind) => !read.includes(kind))).toEqual(['int']);
  });

  it('lists every kind with the fields of its definition', () => {
    expect(constructs.schemaKinds.map((entry) => [entry.kind, entry.fields])).toEqual(SCHEMA_KINDS);
  });
});

describe('the checks of Zod', () => {
  it('lists all 15 checks with the fields of each definition', () => {
    expect(constructs.checks).toHaveLength(15);
    expect(constructs.checks.map((entry) => [entry.check, entry.fields])).toEqual(CHECKS);
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
