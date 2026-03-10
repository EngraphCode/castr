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

  it('infers object type from additionalProperties without explicit type', () => {
    const result = parseJsonSchemaObject({
      additionalProperties: false,
    });

    expect(result.type).toBe('object');
    expect(result.additionalProperties).toBe(false);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'strict' });
  });

  it('parses additionalProperties as schema', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      additionalProperties: { type: 'string' },
    });

    expect(typeof result.additionalProperties).toBe('object');
    if (typeof result.additionalProperties === 'object') {
      expect(result.additionalProperties.type).toBe('string');
    }
    expect(result.unknownKeyBehavior?.mode).toBe('catchall');
  });

  it('parses strip unknown-key behavior from the governed extension', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      additionalProperties: true,
      'x-castr-unknownKeyBehavior': 'strip',
    });

    expect(result.additionalProperties).toBe(true);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('parses passthrough unknown-key behavior from the governed extension', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      additionalProperties: true,
      'x-castr-unknownKeyBehavior': 'passthrough',
    });

    expect(result.additionalProperties).toBe(true);
    expect(result.unknownKeyBehavior).toEqual({ mode: 'passthrough' });
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
