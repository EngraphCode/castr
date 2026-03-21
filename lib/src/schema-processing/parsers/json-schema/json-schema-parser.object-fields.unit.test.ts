import { describe, expect, it } from 'vitest';

import { parseJsonSchemaObject } from './json-schema-parser.core.js';

describe('parseJsonSchemaObject object keyword preservation', () => {
  it('parses additionalProperties: false on object schemas', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      additionalProperties: false,
    });

    expect(result.additionalProperties).toBe(false);
  });

  it('sets additionalProperties: false when omitted on object schemas', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    });

    expect(result.additionalProperties).toBe(false);
  });

  it('infers object type from additionalProperties without explicit type', () => {
    const result = parseJsonSchemaObject({
      additionalProperties: false,
    });

    expect(result.type).toBe('object');
    expect(result.additionalProperties).toBe(false);
  });

  it('does not stamp additionalProperties onto primitive roots', () => {
    const result = parseJsonSchemaObject({
      type: 'string',
      minLength: 1,
    });

    expect(result.type).toBe('string');
    expect(result.additionalProperties).toBeUndefined();
  });

  it('does not stamp additionalProperties onto array roots or array item schemas', () => {
    const result = parseJsonSchemaObject({
      type: 'array',
      items: { type: 'integer', minimum: 1 },
    });

    expect(result.type).toBe('array');
    expect(result.additionalProperties).toBeUndefined();
    expect(Array.isArray(result.items)).toBe(false);
    if (Array.isArray(result.items)) {
      throw new Error('Expected array root to use a single items schema');
    }
    expect(result.items?.type).toBe('integer');
    expect(result.items?.additionalProperties).toBeUndefined();
  });

  it('rejects additionalProperties: true', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'object',
        additionalProperties: true,
      }),
    ).toThrow(/additionalProperties: true.*rejected/);
  });

  it('rejects schema-valued additionalProperties', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'object',
        additionalProperties: { type: 'string' },
      }),
    ).toThrow(/schema-valued additionalProperties.*rejected/);
  });

  it('rejects object-only keywords on non-object schemas', () => {
    expect(() =>
      parseJsonSchemaObject({
        type: 'string',
        additionalProperties: true,
      }),
    ).toThrow(
      /Object-only keywords properties, required, and additionalProperties require an object schema type/,
    );
  });
});
