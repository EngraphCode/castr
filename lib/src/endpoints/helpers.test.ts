import { describe, expect, it } from 'vitest';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';

import type { ZodCodeResult } from '../conversion/zod/index.js';
import {
  generateUniqueVarName,
  handleInlineEverything,
  handleRefSchema,
  registerSchemaName,
  shouldInlineSchema,
} from './helpers.js';

const mockDoc: OpenAPIObject = {
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0.0' },
  paths: {},
  components: {
    schemas: {
      Pet: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
    },
  },
};

describe('endpoint.helpers', () => {
  describe('shouldInlineSchema', () => {
    it('should return true when threshold is -1 (inline everything)', () => {
      expect(shouldInlineSchema(10, -1)).toBe(true);
      expect(shouldInlineSchema(100, -1)).toBe(true);
    });

    it('should return true when complexity is below threshold', () => {
      expect(shouldInlineSchema(2, 4)).toBe(true);
      expect(shouldInlineSchema(3, 10)).toBe(true);
    });

    it('should return false when complexity meets or exceeds threshold', () => {
      expect(shouldInlineSchema(4, 4)).toBe(false);
      expect(shouldInlineSchema(5, 4)).toBe(false);
      expect(shouldInlineSchema(10, 5)).toBe(false);
    });
  });

  describe('generateUniqueVarName', () => {
    it('should return base name if not used', () => {
      const existingNames = {};
      expect(generateUniqueVarName('Pet', existingNames)).toBe('Pet');
    });

    it('should add suffix if name is taken', () => {
      const existingNames = { Pet: 'z.object(...)' };
      expect(generateUniqueVarName('Pet', existingNames)).toBe('Pet__2');
    });

    it('should increment suffix until unique', () => {
      const existingNames = {
        Pet: 'z.object(...)',
        Pet__2: 'z.object(...)',
        Pet__3: 'z.object(...)',
      };
      expect(generateUniqueVarName('Pet', existingNames)).toBe('Pet__4');
    });

    it('should reuse name if it maps to the same base', () => {
      const existingNames = { Pet: 'Pet' };
      expect(generateUniqueVarName('Pet', existingNames)).toBe('Pet');
    });

    it('should handle exportAllNamedSchemas option', () => {
      const existingNames = { Pet: 'z.object(...)' };
      const schemasByName = { '#/components/schemas/Pet': ['Pet'] };

      const result = generateUniqueVarName('Pet', existingNames, {
        exportAllNamedSchemas: true,
        schemasByName,
        schemaKey: '#/components/schemas/Pet',
      });

      expect(result).toBe('Pet');
    });
  });

  describe('registerSchemaName', () => {
    it('should register schema in context', () => {
      const ctx = {
        zodSchemaByName: {} as Record<string, string>,
        doc: mockDoc,
      };

      registerSchemaName(ctx, 'Pet', 'z.object({ id: z.number() })');

      expect(ctx.zodSchemaByName['Pet']).toBe('z.object({ id: z.number() })');
    });
  });

  describe('handleInlineEverything', () => {
    it('should return result if no ref', () => {
      const schema: SchemaObject = { type: 'string' };
      const input: ZodCodeResult = { code: 'z.string()', schema };
      const ctx = {
        zodSchemaByName: {},
        doc: mockDoc,
      };

      const result = handleInlineEverything(input, 'z.string()', ctx);
      expect(result).toBe('z.string()');
    });

    it('should return zodSchema if ref exists', () => {
      const schema = { $ref: '#/components/schemas/Pet' };
      const input: ZodCodeResult = { code: 'Pet', schema, ref: '#/components/schemas/Pet' };
      const ctx = {
        zodSchemaByName: { Pet: 'z.object({ id: z.number() })' },
        doc: mockDoc,
      };

      const result = handleInlineEverything(input, 'Pet', ctx);
      expect(result).toBe('z.object({ id: z.number() })');
    });

    it('should throw if ref exists but schema not found', () => {
      const schema = { $ref: '#/components/schemas/Pet' };
      const input: ZodCodeResult = { code: 'Pet', schema, ref: '#/components/schemas/Pet' };
      const ctx = {
        zodSchemaByName: {},
        doc: mockDoc,
      };

      expect(() => handleInlineEverything(input, 'Pet', ctx)).toThrow(
        'Zod schema not found for ref: Pet',
      );
    });
  });

  describe('handleRefSchema', () => {
    it('should return result if complexity is below threshold', () => {
      const schema = { $ref: '#/components/schemas/Pet' };
      const input: ZodCodeResult = { code: 'Pet', schema, ref: '#/components/schemas/Pet' };
      const ctx = {
        zodSchemaByName: { Pet: 'z.string()' },
        doc: mockDoc,
      };

      const result = handleRefSchema(input, 'Pet', ctx, 5);
      expect(result).toBe('z.string()');
    });

    it('should return result unchanged if complexity exceeds threshold', () => {
      const schema = { $ref: '#/components/schemas/Pet' };
      const input: ZodCodeResult = { code: 'Pet', schema, ref: '#/components/schemas/Pet' };
      const ctx = {
        zodSchemaByName: { Pet: 'z.object({ id: z.number(), name: z.string() })' },
        doc: mockDoc,
      };

      const result = handleRefSchema(input, 'Pet', ctx, 2);
      expect(result).toBe('Pet');
    });

    it('should throw for invalid ref', () => {
      const schema = { $ref: '#/components/schemas/Invalid' };
      const input: ZodCodeResult = { code: 'Invalid', schema, ref: '#/components/schemas/Invalid' };
      const ctx = {
        zodSchemaByName: {},
        doc: mockDoc,
      };

      expect(() => handleRefSchema(input, 'Invalid', ctx, 5)).toThrow(
        'Invalid ref: #/components/schemas/Invalid',
      );
    });
  });
});
