import { describe, expect, it } from 'vitest';

import { parseJsonSchemaObject } from './json-schema-parser.core.js';

describe('parseJsonSchemaObject object keyword preservation', () => {
  it('parses additionalProperties as boolean', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      additionalProperties: false,
    });

    expect(result.additionalProperties).toBe(false);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'strict' });
  });

  it('rejects omitted additionalProperties on object schemas by default', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      }),
    ).toThrow(/strict object ingest is the default/);
  });

  it('normalizes omitted additionalProperties to strip when nonStrictObjectPolicy is strip', () => {
    const result = parseJsonSchemaObject(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result.additionalProperties).toBe(true);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('infers object type from additionalProperties without explicit type', () => {
    const result = parseJsonSchemaObject({
      additionalProperties: false,
    });

    expect(result.type).toBe('object');
    expect(result.additionalProperties).toBe(false);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'strict' });
  });

  it('rejects schema-valued additionalProperties by default', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'object',
        additionalProperties: { type: 'string' },
      }),
    ).toThrow(/strict object ingest is the default/);
  });

  it('normalizes schema-valued additionalProperties to strip in compatibility mode', () => {
    const result = parseJsonSchemaObject(
      {
        type: 'object',
        additionalProperties: { type: 'string' },
      },
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result.additionalProperties).toBe(true);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('discards schema-valued additionalProperties payloads before parsing them in compatibility mode', () => {
    const result = parseJsonSchemaObject(
      {
        type: 'object',
        additionalProperties: {
          type: 'string',
          additionalProperties: true,
        },
      },
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result.additionalProperties).toBe(true);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('rejects strip extension input by default', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'object',
        additionalProperties: true,
        'x-castr-unknownKeyBehavior': 'strip',
      }),
    ).toThrow(/strict object ingest is the default/);
  });

  it('rejects passthrough extension input by default', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'object',
        additionalProperties: true,
        'x-castr-unknownKeyBehavior': 'passthrough',
      }),
    ).toThrow(/strict object ingest is the default/);
  });

  it('normalizes passthrough extension input to strip in compatibility mode', () => {
    const result = parseJsonSchemaObject(
      {
        type: 'object',
        additionalProperties: true,
        'x-castr-unknownKeyBehavior': 'passthrough',
      },
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result.additionalProperties).toBe(true);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('rejects invalid x-castr-unknownKeyBehavior values', () => {
    const invalidSchema = {
      type: 'object',
      additionalProperties: true,
      'x-castr-unknownKeyBehavior': 'strict',
    };

    expect(() =>
      // @ts-expect-error TS2345 - invalid external keyword value should fail fast at runtime
      parseJsonSchemaObject(invalidSchema),
    ).toThrow(/Invalid x-castr-unknownKeyBehavior value "strict"/);
  });

  it('rejects x-castr-unknownKeyBehavior without additionalProperties true', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'object',
        'x-castr-unknownKeyBehavior': 'passthrough',
      }),
    ).toThrow(/x-castr-unknownKeyBehavior requires additionalProperties: true/);
  });

  it('rejects object-only keywords on non-object schemas', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'string',
        additionalProperties: true,
      }),
    ).toThrow(
      /Object-only keywords properties, required, additionalProperties, and x-castr-unknownKeyBehavior require an object schema type/,
    );
  });
});
