import { describe, expect, it } from 'vitest';
import generateJSDocArray from './generateJSDocArray.js';
import type { SchemaObject } from 'openapi3-ts/oas30';

describe('generateJSDocArray', () => {
  it('should generate description comment', () => {
    const schema: SchemaObject = {
      description: 'A user object',
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual(['A user object']);
  });

  it('should generate example comment', () => {
    const schema: SchemaObject = {
      example: { name: 'John', age: 30 },
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual(['@example {"name":"John","age":30}']);
  });

  it('should generate multiple examples', () => {
    const schema: SchemaObject = {
      examples: [{ name: 'Alice' }, { name: 'Bob' }],
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual([
      '@example Example 1: {"name":"Alice"}',
      '@example Example 2: {"name":"Bob"}',
    ]);
  });

  it('should generate deprecated comment', () => {
    const schema: SchemaObject = {
      deprecated: true,
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual(['@deprecated']);
  });

  it('should generate default value comment', () => {
    const schema: SchemaObject = {
      default: 'test-value',
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual(['@default "test-value"']);
  });

  it('should generate external docs link', () => {
    const schema: SchemaObject = {
      externalDocs: {
        url: 'https://example.com/docs',
      },
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual(['@see https://example.com/docs']);
  });

  it('should generate validation constraints', () => {
    const schema: SchemaObject = {
      minimum: 0,
      maximum: 100,
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-z]+$',
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual([
      '@minimum 0',
      '@maximum 100',
      '@minLength 1',
      '@maxLength 50',
      '@pattern ^[a-z]+$',
    ]);
  });

  it('should generate enum comment', () => {
    const schema: SchemaObject = {
      enum: ['red', 'green', 'blue'],
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual(['@enum red, green, blue']);
  });

  it('should generate type and format when withTypesAndFormat is true', () => {
    const schema: SchemaObject = {
      type: 'string',
      format: 'email',
    };

    const result = generateJSDocArray(schema, true);

    expect(result).toEqual(['@type {string}', '@format email']);
  });

  it('should not generate type and format when withTypesAndFormat is false', () => {
    const schema: SchemaObject = {
      type: 'string',
      format: 'email',
    };

    const result = generateJSDocArray(schema, false);

    expect(result).toEqual([]);
  });

  it('should generate type for array types', () => {
    const schema: SchemaObject = {
      type: ['string', 'number'],
    };

    const result = generateJSDocArray(schema, true);

    expect(result).toEqual(['@type {string|number}']);
  });

  it('should add spacing after description when other comments exist', () => {
    const schema: SchemaObject = {
      description: 'A user ID',
      minimum: 1,
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual(['A user ID', '', '@minimum 1']);
  });

  it('should handle complex schema with multiple properties', () => {
    const schema: SchemaObject = {
      description: 'User email address',
      type: 'string',
      format: 'email',
      example: 'user@example.com',
      minLength: 5,
      maxLength: 255,
      pattern: '^[^@]+@[^@]+\\.[^@]+$',
    };

    const result = generateJSDocArray(schema, true);

    expect(result).toEqual([
      'User email address',
      '',
      '@example "user@example.com"',
      '@type {string}',
      '@format email',
      '@minLength 5',
      '@maxLength 255',
      '@pattern ^[^@]+@[^@]+\\.[^@]+$',
    ]);
  });

  it('should handle empty schema', () => {
    const schema: SchemaObject = {};

    const result = generateJSDocArray(schema);

    expect(result).toEqual([]);
  });

  it('should skip undefined values', () => {
    const schema: SchemaObject = {
      description: 'Test',
      example: undefined,
      default: undefined,
    };

    const result = generateJSDocArray(schema);

    expect(result).toEqual(['Test']);
  });
});
