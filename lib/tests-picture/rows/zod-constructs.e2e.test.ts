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

function kindNamed(name: string) {
  const found = constructs.schemaKinds.find((candidate) => candidate.kind === name);
  if (found === undefined) {
    throw new Error(`no schema kind named ${name}`);
  }
  return found;
}

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
    expect(new Set(read).size).toBe(39);
    expect(constructs.kindValues.filter((kind) => !read.includes(kind))).toEqual(['int']);
  });

  it('lists the fields of a definition, without the three every definition holds', () => {
    expect(kindNamed('object').fields).toEqual(['catchall', 'shape']);
    expect(kindNamed('default').fields).toEqual(['defaultValue', 'innerType']);
    expect(kindNamed('prefault').fields).toEqual(['defaultValue', 'innerType']);
    expect(kindNamed('tuple').fields).toEqual(['items', 'rest']);
    expect(kindNamed('record').fields).toEqual(['keyType', 'mode', 'partial', 'valueType']);
    expect(kindNamed('lazy').fields).toEqual(['getter']);
    expect(kindNamed('template_literal').fields).toEqual(['format', 'parts']);
    expect(kindNamed('union').fields).toEqual(['inclusive', 'options']);
    expect(kindNamed('never').fields).toEqual([]);
  });

  it('holds a function of the author where a definition says so', () => {
    expect(kindNamed('custom').fields).toContain('fn');
    expect(kindNamed('transform').fields).toContain('transform');
    expect(kindNamed('pipe').fields).toContain('transform');
    expect(kindNamed('lazy').fields).toContain('getter');
  });
});

describe('the checks of Zod', () => {
  it('lists the 15 kinds of check', () => {
    expect(constructs.checks.map((entry) => entry.check)).toEqual([
      'bigint_format',
      'greater_than',
      'length_equals',
      'less_than',
      'max_length',
      'max_size',
      'mime_type',
      'min_length',
      'min_size',
      'multiple_of',
      'number_format',
      'overwrite',
      'property',
      'size_equals',
      'string_format',
    ]);
  });

  it('lists the fields of a check, without the four every check holds', () => {
    const fieldsOf = new Map(constructs.checks.map((entry) => [entry.check, entry.fields]));

    expect(fieldsOf.get('less_than')).toEqual(['inclusive', 'value']);
    expect(fieldsOf.get('multiple_of')).toEqual(['value']);
    expect(fieldsOf.get('string_format')).toEqual(['format', 'pattern']);
    expect(fieldsOf.get('overwrite')).toEqual(['tx']);
  });
});

describe('the formats of Zod', () => {
  it('lists the 32 string formats', () => {
    expect(constructs.stringFormats).toHaveLength(32);
    expect(constructs.stringFormats).toContain('url');
    expect(constructs.stringFormats).toContain('json_string');
    expect(constructs.stringFormats).toContain('regex');
  });

  it('lists the five number formats and the two bigint formats', () => {
    expect(constructs.numberFormats).toEqual(['float32', 'float64', 'int32', 'safeint', 'uint32']);
    expect(constructs.bigintFormats).toEqual(['int64', 'uint64']);
  });
});
