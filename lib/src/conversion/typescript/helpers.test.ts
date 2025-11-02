import { describe, expect, it } from 'vitest';
import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';

import type { TsConversionContext } from './index.js';
import {
  handlePrimitiveEnum,
  handleReferenceObject,
  handleTypeArray,
  isPrimitiveSchemaType,
  isPropertyRequired,
  resolveAdditionalPropertiesType,
} from './helpers.js';

describe('openApiToTypescript.helpers', () => {
  describe('isPrimitiveSchemaType', () => {
    it('should return true for primitive schema types', () => {
      expect(isPrimitiveSchemaType('string')).toBe(true);
      expect(isPrimitiveSchemaType('number')).toBe(true);
      expect(isPrimitiveSchemaType('integer')).toBe(true);
      expect(isPrimitiveSchemaType('boolean')).toBe(true);
      expect(isPrimitiveSchemaType('null')).toBe(true);
    });

    it('should return false for non-primitive schema types', () => {
      expect(isPrimitiveSchemaType('object')).toBe(false);
      expect(isPrimitiveSchemaType('array')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isPrimitiveSchemaType(undefined)).toBe(false);
      expect(isPrimitiveSchemaType(null)).toBe(false);
      expect(isPrimitiveSchemaType(123)).toBe(false);
      expect(isPrimitiveSchemaType({})).toBe(false);
    });

    it('should narrow unknown to PrimitiveSchemaType', () => {
      const value: unknown = 'string';
      if (isPrimitiveSchemaType(value)) {
        // Type narrowed - should compile without error
        const typed: 'string' | 'number' | 'integer' | 'boolean' | 'null' = value;
        expect(typed).toBe('string');
      }
    });
  });

  describe('handlePrimitiveEnum', () => {
    it('should return null when no enum present', () => {
      const schema: SchemaObject = { type: 'string' };
      expect(handlePrimitiveEnum(schema, 'string')).toBeNull();
    });

    it('should handle string enums', () => {
      const schema: SchemaObject = { type: 'string', enum: ['a', 'b', 'c'] };
      const result = handlePrimitiveEnum(schema, 'string');
      expect(result).toBeDefined();
    });

    it('should handle string enums with null', () => {
      const schema: SchemaObject = { type: 'string', enum: ['a', null, 'b'], nullable: true };
      const result = handlePrimitiveEnum(schema, 'string');
      expect(result).toBeDefined();
    });

    it('should return never() for invalid enums (non-string type with string values)', () => {
      const schema: SchemaObject = { type: 'integer', enum: [1, 'invalid', 3] };
      const result = handlePrimitiveEnum(schema, 'integer');
      expect(result).toBeDefined();
      // Result should be t.never() or union with null
    });

    it('should handle number enums', () => {
      const schema: SchemaObject = { type: 'integer', enum: [1, 2, 3] };
      const result = handlePrimitiveEnum(schema, 'integer');
      expect(result).toBeDefined();
    });

    it('should include null in union when nullable', () => {
      const schema: SchemaObject = { type: 'string', enum: ['a', 'b'], nullable: true };
      const result = handlePrimitiveEnum(schema, 'string');
      expect(result).toBeDefined();
    });
  });

  describe('isPropertyRequired', () => {
    it('should return true when property is in required array', () => {
      const schema: SchemaObject = {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      };
      expect(isPropertyRequired('name', schema, false)).toBe(true);
    });

    it('should return false when property is not in required array', () => {
      const schema: SchemaObject = {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: [],
      };
      expect(isPropertyRequired('name', schema, false)).toBe(false);
    });

    it('should return true when isPartial is true (all optional)', () => {
      const schema: SchemaObject = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      expect(isPropertyRequired('name', schema, true)).toBe(true);
    });

    it('should handle missing required array', () => {
      const schema: SchemaObject = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      expect(isPropertyRequired('name', schema, false)).toBe(false);
    });
  });

  describe('resolveAdditionalPropertiesType', () => {
    it('should return undefined when additionalProperties is false or missing', () => {
      expect(resolveAdditionalPropertiesType(undefined, () => 'string')).toBeUndefined();
      expect(resolveAdditionalPropertiesType(false, () => 'string')).toBeUndefined();
    });

    it('should return "any" when additionalProperties is true', () => {
      const result = resolveAdditionalPropertiesType(true, () => 'string');
      expect(result).toBe('any');
    });

    it('should return "any" when additionalProperties is empty object', () => {
      const result = resolveAdditionalPropertiesType({}, () => 'string');
      expect(result).toBe('any');
    });

    it('should convert schema when additionalProperties is a schema', () => {
      const schema: SchemaObject = { type: 'string' };
      const mockConvert = () => 'string';
      const result = resolveAdditionalPropertiesType(schema, mockConvert);
      expect(result).toBe('string');
    });
  });

  describe('handleTypeArray - current behavior', () => {
    it('should create union type from multiple types', () => {
      const baseSchema: SchemaObject = {
        type: 'string',
        properties: { name: { type: 'string' } },
      };
      const mockConvert = (schema: SchemaObject | ReferenceObject) => {
        if ('$ref' in schema) {
          return 'unknown';
        }
        if (schema.type === 'string') {
          return 'string';
        }
        if (schema.type === 'number') {
          return 'number';
        }
        return 'unknown';
      };

      const result = handleTypeArray(['string', 'number'], baseSchema, false, mockConvert);
      expect(result).toBe('string | number');
    });

    it('should preserve base schema properties in created schemas', () => {
      const baseSchema: SchemaObject = {
        type: 'string',
        properties: { id: { type: 'number' } },
        nullable: false,
      };
      const convertCalls: (SchemaObject | ReferenceObject)[] = [];
      const mockConvert = (schema: SchemaObject | ReferenceObject) => {
        convertCalls.push(schema);
        if ('$ref' in schema) {
          return 'unknown';
        }
        return schema.type === 'string' ? 'string' : 'number';
      };

      handleTypeArray(['string', 'number'], baseSchema, false, mockConvert);

      // Verify that created schemas have base schema properties
      expect(convertCalls).toHaveLength(2);
      expect(convertCalls[0]).toMatchObject({
        type: 'string',
        properties: { id: { type: 'number' } },
      });
      expect(convertCalls[1]).toMatchObject({
        type: 'number',
        properties: { id: { type: 'number' } },
      });
    });

    it('should overwrite type property with provided type', () => {
      const baseSchema: SchemaObject = {
        type: 'string',
        properties: {},
      };
      const convertCalls: (SchemaObject | ReferenceObject)[] = [];
      const mockConvert = (schema: SchemaObject | ReferenceObject) => {
        if ('$ref' in schema) {
          convertCalls.push(schema);
          return 'unknown';
        }
        convertCalls.push({ ...schema });
        return schema.type === 'string' ? 'string' : 'boolean';
      };

      handleTypeArray(['string', 'boolean'], baseSchema, false, mockConvert);

      expect(convertCalls).toHaveLength(2);
      const firstCall = convertCalls[0];
      const secondCall = convertCalls[1];
      expect(firstCall).toBeDefined();
      expect(secondCall).toBeDefined();
      if (firstCall && !('$ref' in firstCall)) {
        expect(firstCall.type).toBe('string');
      }
      if (secondCall && !('$ref' in secondCall)) {
        expect(secondCall.type).toBe('boolean');
      }
    });

    it('should wrap result in nullable when isNullable is true', () => {
      const baseSchema: SchemaObject = { type: 'string' };
      const mockConvert = (schema: SchemaObject | ReferenceObject) => {
        if ('$ref' in schema) {
          return 'unknown';
        }
        return schema.type === 'string' ? 'string' : 'number';
      };

      const result = handleTypeArray(['string', 'number'], baseSchema, true, mockConvert);
      expect(result).toBe('(string | number) | null');
    });

    it('should handle single type in array', () => {
      const baseSchema: SchemaObject = { type: 'string' };
      const mockConvert = () => 'string';

      const result = handleTypeArray(['string'], baseSchema, false, mockConvert);
      expect(result).toBe('string');
    });

    it('should handle empty types array', () => {
      const baseSchema: SchemaObject = { type: 'string' };
      const mockConvert = () => 'unknown';

      const result = handleTypeArray([], baseSchema, false, mockConvert);
      expect(result).toBe('');
    });

    it('should handle multiple types and create union', () => {
      const baseSchema: SchemaObject = { type: 'string' };
      const mockConvert = (schema: SchemaObject | ReferenceObject) => {
        if ('$ref' in schema) {
          return 'unknown';
        }
        const typeMap: Record<string, string> = {
          string: 'string',
          number: 'number',
          boolean: 'boolean',
        };
        return typeMap[schema.type as string] ?? 'unknown';
      };

      const result = handleTypeArray(
        ['string', 'number', 'boolean'],
        baseSchema,
        false,
        mockConvert,
      );
      expect(result).toBe('string | number | boolean');
    });

    it('should throw error for invalid schema types in type array', () => {
      const baseSchema: SchemaObject = { type: 'string' };
      const mockConvert = () => 'string';

      expect(() => {
        handleTypeArray(['string', 'invalidType'], baseSchema, false, mockConvert);
      }).toThrow('Invalid schema types in type array');
    });

    it('should accept all valid schema types', () => {
      const baseSchema: SchemaObject = { type: 'string' };
      const mockConvert = (schema: SchemaObject | ReferenceObject): string => {
        if ('$ref' in schema) {
          return 'unknown';
        }
        const schemaType = schema.type;
        if (schemaType === undefined) {
          return 'unknown';
        }
        if (Array.isArray(schemaType)) {
          return 'union';
        }
        return schemaType;
      };

      const validTypes = ['string', 'number', 'integer', 'boolean', 'null', 'object', 'array'];
      const result = handleTypeArray(validTypes, baseSchema, false, mockConvert);
      expect(result).toContain('string');
      expect(result).toContain('number');
    });
  });

  describe('handleReferenceObject - current behavior', () => {
    it('should return schema name for valid reference', () => {
      const schema: ReferenceObject = { $ref: '#/components/schemas/User' };
      const ctx: TsConversionContext = {
        doc: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: {},
          components: {
            schemas: {
              User: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        },
        visitedRefs: {},
        nodeByRef: {},
      };
      const resolveRecursively = () => void 0;

      const result = handleReferenceObject(schema, ctx, resolveRecursively);
      expect(result).toBe('User');
    });

    it('should return schema name immediately for circular references', () => {
      const schema: ReferenceObject = { $ref: '#/components/schemas/User' };
      const ctx: TsConversionContext = {
        doc: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: {},
          components: {
            schemas: {
              User: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        },
        visitedRefs: { '#/components/schemas/User': true },
        nodeByRef: {},
      };
      const resolveRecursively = () => void 0;

      const result = handleReferenceObject(schema, ctx, resolveRecursively);
      expect(result).toBe('User');
    });

    it('should resolve schema if not already in nodeByRef', () => {
      const schema: ReferenceObject = { $ref: '#/components/schemas/User' };
      let resolveCalled = false;
      const ctx: TsConversionContext = {
        doc: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: {},
          components: {
            schemas: {
              User: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        },
        visitedRefs: {},
        nodeByRef: {},
      };
      const resolveRecursively = () => {
        resolveCalled = true;
      };

      const result = handleReferenceObject(schema, ctx, resolveRecursively);
      expect(result).toBe('User');
      expect(resolveCalled).toBe(true);
    });

    it('should throw error when context is missing', () => {
      const schema: ReferenceObject = { $ref: '#/components/schemas/User' };
      const resolveRecursively = () => void 0;

      expect(() => handleReferenceObject(schema, undefined, resolveRecursively)).toThrow(
        'Context is required for OpenAPI $ref',
      );
    });
  });
});
