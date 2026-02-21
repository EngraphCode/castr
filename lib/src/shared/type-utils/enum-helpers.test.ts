import { describe, expect, it } from 'vitest';

import {
  generateNonStringEnumZodCode,
  generateStringEnumZodCode,
  nonStringEnumValueToZodLiteral,
  safeStringifyEnumValue,
  shouldEnumBeNever,
  stringEnumValueToZodCode,
} from './enum-helpers.js';

describe('enumHelpers', () => {
  describe('safeStringifyEnumValue', () => {
    it("should return 'null' for null values", () => {
      expect(safeStringifyEnumValue(null)).toBe('null');
    });

    it('should return string values as-is', () => {
      expect(safeStringifyEnumValue('hello')).toBe('hello');
      expect(safeStringifyEnumValue('')).toBe('');
    });

    it('should JSON.stringify numbers', () => {
      expect(safeStringifyEnumValue(42)).toBe('42');
      expect(safeStringifyEnumValue(0)).toBe('0');
      expect(safeStringifyEnumValue(-3.14)).toBe('-3.14');
    });

    it('should JSON.stringify booleans', () => {
      expect(safeStringifyEnumValue(true)).toBe('true');
      expect(safeStringifyEnumValue(false)).toBe('false');
    });

    it('should JSON.stringify objects safely', () => {
      expect(safeStringifyEnumValue({ key: 'value' })).toBe('{"key":"value"}');
      expect(safeStringifyEnumValue([])).toBe('[]');
    });
  });

  describe('stringEnumValueToZodCode', () => {
    it("should convert null to 'null'", () => {
      expect(stringEnumValueToZodCode(null)).toBe('null');
    });

    it('should wrap string values in double quotes', () => {
      expect(stringEnumValueToZodCode('active')).toBe('"active"');
      expect(stringEnumValueToZodCode('')).toBe('""');
    });

    it('should handle values with special characters', () => {
      expect(stringEnumValueToZodCode('with-dash')).toBe('"with-dash"');
      expect(stringEnumValueToZodCode('with_underscore')).toBe('"with_underscore"');
    });

    it('should safely stringify and quote non-string values', () => {
      expect(stringEnumValueToZodCode(123)).toBe('"123"');
      expect(stringEnumValueToZodCode(true)).toBe('"true"');
    });

    it('should handle objects by JSON stringifying them', () => {
      expect(stringEnumValueToZodCode({ status: 'ok' })).toBe('"{"status":"ok"}"');
    });
  });

  describe('nonStringEnumValueToZodLiteral', () => {
    it("should return 'null' for null values", () => {
      expect(nonStringEnumValueToZodLiteral(null)).toBe('null');
    });

    it('should return numbers as-is', () => {
      expect(nonStringEnumValueToZodLiteral(42)).toBe(42);
      expect(nonStringEnumValueToZodLiteral(0)).toBe(0);
      expect(nonStringEnumValueToZodLiteral(-3.14)).toBe(-3.14);
    });

    it('should JSON.stringify non-null, non-number values', () => {
      expect(nonStringEnumValueToZodLiteral('string')).toBe('"string"');
      expect(nonStringEnumValueToZodLiteral(true)).toBe('true');
      expect(nonStringEnumValueToZodLiteral({ key: 'value' })).toBe('{"key":"value"}');
    });
  });

  describe('shouldEnumBeNever', () => {
    it('should return false for string enums regardless of values', () => {
      expect(shouldEnumBeNever('string', ['a', 'b', 'c'])).toBe(false);
      expect(shouldEnumBeNever('string', [1, 2, 3])).toBe(false);
      expect(shouldEnumBeNever('string', [null])).toBe(false);
    });

    it('should return true for non-string types with string values', () => {
      expect(shouldEnumBeNever('number', [1, 'two', 3])).toBe(true);
      expect(shouldEnumBeNever('integer', ['one'])).toBe(true);
      expect(shouldEnumBeNever('boolean', ['true'])).toBe(true);
    });

    it('should return false for non-string types with no string values', () => {
      expect(shouldEnumBeNever('number', [1, 2, 3])).toBe(false);
      expect(shouldEnumBeNever('integer', [null, 42])).toBe(false);
      expect(shouldEnumBeNever('boolean', [true, false, null])).toBe(false);
    });
  });

  describe('generateStringEnumZodCode', () => {
    it('should generate z.literal for single string value', () => {
      expect(generateStringEnumZodCode(['active'])).toBe('z.literal("active")');
    });

    it('should generate z.literal for single null value', () => {
      expect(generateStringEnumZodCode([null])).toBe('z.literal(null)');
    });

    it('should generate z.enum for multiple string values', () => {
      expect(generateStringEnumZodCode(['active', 'inactive'])).toBe(
        'z.enum(["active", "inactive"])',
      );
    });

    it('should handle null in multi-value enums', () => {
      expect(generateStringEnumZodCode(['active', null, 'inactive'])).toBe(
        'z.enum(["active", null, "inactive"])',
      );
    });

    it('should handle empty strings', () => {
      expect(generateStringEnumZodCode(['', 'value'])).toBe('z.enum(["", "value"])');
    });

    it('should handle special characters in enum values', () => {
      expect(generateStringEnumZodCode(['with-dash', 'with_underscore', 'with space'])).toBe(
        'z.enum(["with-dash", "with_underscore", "with space"])',
      );
    });
  });

  describe('generateNonStringEnumZodCode', () => {
    it('should generate z.literal for single number value', () => {
      expect(generateNonStringEnumZodCode([42])).toBe('z.literal(42)');
    });

    it('should generate z.literal for single null value', () => {
      expect(generateNonStringEnumZodCode([null])).toBe('z.literal(null)');
    });

    it('should generate z.union for multiple number values', () => {
      expect(generateNonStringEnumZodCode([1, 2, 3])).toBe(
        'z.union([z.literal(1), z.literal(2), z.literal(3)])',
      );
    });

    it('should handle null in multi-value enums', () => {
      expect(generateNonStringEnumZodCode([null, 1, 2])).toBe(
        'z.union([z.literal(null), z.literal(1), z.literal(2)])',
      );
    });

    it('should handle negative numbers', () => {
      expect(generateNonStringEnumZodCode([-1, 0, 1])).toBe(
        'z.union([z.literal(-1), z.literal(0), z.literal(1)])',
      );
    });

    it('should handle floating point numbers', () => {
      expect(generateNonStringEnumZodCode([1.5, 2.7])).toBe(
        'z.union([z.literal(1.5), z.literal(2.7)])',
      );
    });
  });

  describe('edge cases and integration', () => {
    it('should handle arrays with mixed null and values correctly', () => {
      // String enum with null
      const stringEnum = generateStringEnumZodCode([null, 'value']);
      expect(stringEnum).toBe('z.enum([null, "value"])');

      // Number enum with null
      const numberEnum = generateNonStringEnumZodCode([null, 42]);
      expect(numberEnum).toBe('z.union([z.literal(null), z.literal(42)])');
    });

    it('should handle empty arrays gracefully', () => {
      // While OpenAPI shouldn't have empty enums, we should handle it
      expect(generateStringEnumZodCode([])).toBe('z.enum([])');
      expect(generateNonStringEnumZodCode([])).toBe('z.union([])');
    });

    it('should preserve exact values without modification', () => {
      // Verify no data loss in transformation
      const values = ['test', null, '123', '0'];
      const result = generateStringEnumZodCode(values);
      expect(result).toBe('z.enum(["test", null, "123", "0"])');
    });
  });
});
