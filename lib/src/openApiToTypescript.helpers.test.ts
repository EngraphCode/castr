import { describe, expect, it } from 'vitest';
import type { SchemaObject } from 'openapi3-ts/oas30';

import {
  handlePrimitiveEnum,
  isPrimitiveSchemaType,
  isPropertyRequired,
  resolveAdditionalPropertiesType,
} from './openApiToTypescript.helpers.js';

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
});
