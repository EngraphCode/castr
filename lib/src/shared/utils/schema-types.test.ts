import { describe, expect, it } from 'vitest';

import { isPrimitiveSchemaType, type PrimitiveSchemaType } from './schema-types.js';

describe('schema-types', () => {
  describe('isPrimitiveSchemaType', () => {
    it('should return true for string type', () => {
      expect(isPrimitiveSchemaType('string')).toBe(true);
    });

    it('should return true for number type', () => {
      expect(isPrimitiveSchemaType('number')).toBe(true);
    });

    it('should return true for integer type', () => {
      expect(isPrimitiveSchemaType('integer')).toBe(true);
    });

    it('should return true for boolean type', () => {
      expect(isPrimitiveSchemaType('boolean')).toBe(true);
    });

    it('should return true for null type', () => {
      expect(isPrimitiveSchemaType('null')).toBe(true);
    });

    it('should return false for object type', () => {
      expect(isPrimitiveSchemaType('object')).toBe(false);
    });

    it('should return false for array type', () => {
      expect(isPrimitiveSchemaType('array')).toBe(false);
    });

    it('should narrow type correctly from unknown', () => {
      const value: unknown = 'string';
      if (isPrimitiveSchemaType(value)) {
        // Type should be narrowed to PrimitiveSchemaType
        const primitiveType: PrimitiveSchemaType = value;
        expect(primitiveType).toBe('string');
      }
    });

    it('should handle invalid types gracefully', () => {
      expect(isPrimitiveSchemaType('invalid')).toBe(false);
      expect(isPrimitiveSchemaType(undefined)).toBe(false);
      expect(isPrimitiveSchemaType(null)).toBe(false);
      expect(isPrimitiveSchemaType(123)).toBe(false);
    });
  });
});
