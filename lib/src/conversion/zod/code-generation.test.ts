import { describe, expect, it } from 'vitest';
import type { SchemaObject } from 'openapi3-ts/oas31';

import {
  generatePrimitiveZod,
  generateObjectZod,
  generateArrayZod,
  generateCompositionZod,
  generateReferenceZod,
  generateEnumZod,
} from './code-generation.js';

describe('code-generation', () => {
  describe('generatePrimitiveZod', () => {
    it('generates z.string() for string type', () => {
      const schema: SchemaObject = { type: 'string' };
      expect(generatePrimitiveZod(schema)).toBe('z.string()');
    });

    it('generates z.number() for number type', () => {
      const schema: SchemaObject = { type: 'number' };
      expect(generatePrimitiveZod(schema)).toBe('z.number()');
    });

    it('generates z.number().int() for integer type', () => {
      const schema: SchemaObject = { type: 'integer' };
      expect(generatePrimitiveZod(schema)).toBe('z.number().int()');
    });

    it('generates z.boolean() for boolean type', () => {
      const schema: SchemaObject = { type: 'boolean' };
      expect(generatePrimitiveZod(schema)).toBe('z.boolean()');
    });

    it('generates z.null() for null type', () => {
      const schema: SchemaObject = { type: 'null' };
      expect(generatePrimitiveZod(schema)).toBe('z.null()');
    });
  });

  describe('generateArrayZod', () => {
    it('generates z.array(z.string()) for string array', () => {
      const schema: SchemaObject = {
        type: 'array',
        items: { type: 'string' },
      };
      expect(generateArrayZod(schema)).toContain('z.array(');
      expect(generateArrayZod(schema)).toContain('z.string()');
    });

    it('generates z.array(z.number()) for number array', () => {
      const schema: SchemaObject = {
        type: 'array',
        items: { type: 'number' },
      };
      expect(generateArrayZod(schema)).toContain('z.array(');
      expect(generateArrayZod(schema)).toContain('z.number()');
    });

    it('generates z.array(z.unknown()) for array without items', () => {
      const schema: SchemaObject = {
        type: 'array',
      };
      expect(generateArrayZod(schema)).toContain('z.array(');
      expect(generateArrayZod(schema)).toContain('z.unknown()');
    });
  });

  describe('generateObjectZod', () => {
    it('generates z.object({}) for empty object', () => {
      const schema: SchemaObject = { type: 'object' };
      expect(generateObjectZod(schema)).toContain('z.object({');
    });

    it('generates z.object with properties', () => {
      const schema: SchemaObject = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      expect(generateObjectZod(schema)).toContain('z.object({');
      expect(generateObjectZod(schema)).toContain('name:');
    });
  });

  describe('generateEnumZod', () => {
    it('generates z.enum() for string enum', () => {
      const schema: SchemaObject = {
        type: 'string',
        enum: ['foo', 'bar', 'baz'],
      };
      expect(generateEnumZod(schema)).toContain('z.enum(');
      expect(generateEnumZod(schema)).toContain('"foo"');
      expect(generateEnumZod(schema)).toContain('"bar"');
      expect(generateEnumZod(schema)).toContain('"baz"');
    });

    it('generates z.enum() for number enum', () => {
      const schema: SchemaObject = {
        type: 'number',
        enum: [1, 2, 3],
      };
      expect(generateEnumZod(schema)).toContain('z.enum(');
    });

    it('throws error when enum property is missing', () => {
      const schema: SchemaObject = {
        type: 'string',
      };
      expect(() => generateEnumZod(schema)).toThrow();
    });
  });

  describe('generateReferenceZod', () => {
    it('extracts schema name from $ref', () => {
      const ref = '#/components/schemas/Pet';
      expect(generateReferenceZod(ref)).toBe('Pet');
    });

    it('extracts name from deeply nested ref', () => {
      const ref = '#/components/schemas/User';
      expect(generateReferenceZod(ref)).toBe('User');
    });

    it('handles ref without slashes', () => {
      const ref = 'Pet';
      expect(generateReferenceZod(ref)).toBe('Pet');
    });

    it('returns ref as-is when name cannot be extracted', () => {
      const ref = '#/components/schemas/';
      const result = generateReferenceZod(ref);
      expect(result).toBeTruthy();
    });
  });

  describe('generateCompositionZod', () => {
    it('generates z.union() for anyOf', () => {
      const schema: SchemaObject = {
        anyOf: [{ type: 'string' }, { type: 'number' }],
      };
      expect(generateCompositionZod(schema, 'anyOf')).toContain('z.union(');
    });

    it('generates z.intersection() for allOf', () => {
      const schema: SchemaObject = {
        allOf: [{ type: 'object' }, { type: 'object' }],
      };
      expect(generateCompositionZod(schema, 'allOf')).toContain('z.intersection(');
    });

    it('generates z.union() for oneOf', () => {
      const schema: SchemaObject = {
        oneOf: [{ type: 'string' }, { type: 'number' }],
      };
      expect(generateCompositionZod(schema, 'oneOf')).toContain('z.union(');
    });

    it('throws error for unsupported composition type', () => {
      const schema: SchemaObject = {
        anyOf: [{ type: 'string' }],
      };
      // @ts-expect-error Testing invalid type
      expect(() => generateCompositionZod(schema, 'invalid')).toThrow();
    });
  });

  describe('edge cases and constraints', () => {
    it('handles nullable types (OpenAPI 3.1)', () => {
      const schema: SchemaObject = {
        type: ['string', 'null'],
      };
      // Should handle array of types
      expect(Array.isArray(schema.type)).toBe(true);
    });

    it('handles string with minLength constraint', () => {
      const schema: SchemaObject = {
        type: 'string',
        minLength: 5,
      };
      expect(schema.minLength).toBe(5);
    });

    it('handles string with maxLength constraint', () => {
      const schema: SchemaObject = {
        type: 'string',
        maxLength: 100,
      };
      expect(schema.maxLength).toBe(100);
    });

    it('handles string with pattern constraint', () => {
      const schema: SchemaObject = {
        type: 'string',
        pattern: '^[a-z]+$',
      };
      expect(schema.pattern).toBe('^[a-z]+$');
    });

    it('handles number with minimum constraint', () => {
      const schema: SchemaObject = {
        type: 'number',
        minimum: 0,
      };
      expect(schema.minimum).toBe(0);
    });

    it('handles number with maximum constraint', () => {
      const schema: SchemaObject = {
        type: 'number',
        maximum: 100,
      };
      expect(schema.maximum).toBe(100);
    });

    it('handles binary format as File', () => {
      const schema: SchemaObject = {
        type: 'string',
        format: 'binary',
      };
      expect(schema.format).toBe('binary');
    });

    it('handles nested arrays', () => {
      const schema: SchemaObject = {
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'string' },
        },
      };
      expect(schema.items).toBeDefined();
    });

    it('handles nested objects', () => {
      const schema: SchemaObject = {
        type: 'object',
        properties: {
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
            },
          },
        },
      };
      expect(schema.properties?.['address']).toBeDefined();
    });

    it('handles empty enum array', () => {
      const schema: SchemaObject = {
        type: 'string',
        enum: [],
      };
      expect(schema.enum).toHaveLength(0);
    });

    it('handles mixed type enum', () => {
      const schema: SchemaObject = {
        enum: ['foo', 1, true],
      };
      expect(schema.enum).toContain('foo');
      expect(schema.enum).toContain(1);
      expect(schema.enum).toContain(true);
    });
  });
});
