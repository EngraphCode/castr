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
      // A runtime-opaque value (read from an `unknown[]`, so the analyzer cannot
      // fold it to a literal) — exercises the guard with a genuinely unknown input.
      const candidates: unknown[] = ['string'];
      const value = candidates[0];
      expect(isPrimitiveSchemaType(value)).toBe(true);
      if (isPrimitiveSchemaType(value)) {
        // Compile-time proof: inside the guard `value` narrows to PrimitiveSchemaType
        // (this assignment fails to compile if the guard regresses).
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
