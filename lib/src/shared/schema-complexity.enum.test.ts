/**
 * Unit tests for enum complexity calculation
 *
 * PURPOSE: Define the expected behavior for how enum complexity should be calculated.
 * This determines whether enums get inlined or extracted to variables.
 *
 * CONTEXT:
 * - Default complexity threshold is 4
 * - Schemas with complexity < 4 get inlined
 * - Schemas with complexity >= 4 get extracted to variables
 *
 * RATIONALE:
 * The complexity calculation affects code generation. We need to define:
 * 1. Should enum size (number of values) affect complexity?
 * 2. Should enum type (string vs number) affect complexity?
 * 3. What is the base complexity of an enum?
 */

import { expect, test, describe } from 'vitest';
import type { SchemaObject } from 'openapi3-ts/oas31';
import { getSchemaComplexity } from './schema-complexity.js';

const getComplexity = (schema: SchemaObject) => getSchemaComplexity({ schema, current: 0 });

describe('schema-complexity: enum calculations', () => {
  describe('base enum complexity (without type)', () => {
    test('enum with 2 values should have complexity 2', () => {
      // Rationale: enum keyword (1) + minimal enum declaration (1) = 2
      expect(getComplexity({ enum: ['a', 'b'] })).toBe(2);
    });

    test('enum with 3 values should have complexity 2', () => {
      // Rationale: Enum size should NOT affect complexity
      // An enum is an enum whether it has 2 or 20 values
      // The base complexity is constant: enum keyword (1) + declaration (1) = 2
      expect(getComplexity({ enum: ['a', 'b', 'c'] })).toBe(2);
    });

    test('enum with 10 values should have complexity 2', () => {
      // Rationale: Even large enums maintain base complexity
      // This ensures they can be inlined (< threshold of 4)
      expect(getComplexity({ enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })).toBe(2);
    });
  });

  describe('string enum with type', () => {
    test('string enum with 2 values', () => {
      // Rationale: type (1) + enum complexity (1) = 2
      expect(getComplexity({ type: 'string', enum: ['a', 'b'] })).toBe(2);
    });

    test('string enum with 3 values', () => {
      // Rationale: Same as above - size doesn't matter
      expect(getComplexity({ type: 'string', enum: ['aaa', 'bbb', 'ccc'] })).toBe(2);
    });

    test('string enum with many values', () => {
      // Rationale: Even with many values, complexity stays constant
      const values = Array.from({ length: 50 }, (_, i) => `value${i}`);
      expect(getComplexity({ type: 'string', enum: values })).toBe(2);
    });
  });

  describe('number enum with type', () => {
    test('number enum with integers', () => {
      // Rationale: type (1) + enum complexity (1) = 2
      expect(getComplexity({ type: 'number', enum: [1, 2, 3] })).toBe(2);
    });

    test('number enum with floats', () => {
      expect(getComplexity({ type: 'number', enum: [1.5, 2.7, 3.9] })).toBe(2);
    });

    test('number enum with mixed and null', () => {
      // Rationale: null in enum doesn't add complexity
      expect(getComplexity({ type: 'number', enum: [1, 2, 3, null] })).toBe(2);
    });
  });

  describe('integer enum with type', () => {
    test('integer enum with positive values', () => {
      expect(getComplexity({ type: 'integer', enum: [1, 2, 3] })).toBe(2);
    });

    test('integer enum with negative values', () => {
      expect(getComplexity({ type: 'integer', enum: [-1, -2, -3] })).toBe(2);
    });

    test('integer enum with mixed positive/negative', () => {
      expect(getComplexity({ type: 'integer', enum: [1, -2, 3, -4] })).toBe(2);
    });
  });

  describe('enum complexity in context', () => {
    test('enum in object property', () => {
      // Rationale: object (2) + enum (1 for type + 1 for enum composite) = 4
      // Note: Properties do NOT add additional traversal cost, just their schema complexity
      expect(
        getComplexity({
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
          },
        }),
      ).toBe(4);
    });

    test('multiple enums in object', () => {
      // Rationale: object (2) + enum1 (2) + enum2 (2) = 6
      expect(
        getComplexity({
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['a', 'b'] },
            role: { type: 'string', enum: ['x', 'y', 'z'] },
          },
        }),
      ).toBe(6);
    });

    test('enum in array items', () => {
      // Rationale: array (1) + enum (1 for type + 1 for enum composite) = 3
      expect(
        getComplexity({
          type: 'array',
          items: { type: 'string', enum: ['option1', 'option2', 'option3'] },
        }),
      ).toBe(3);
    });
  });

  describe('threshold behavior verification', () => {
    test('simple enum should inline (complexity < 4)', () => {
      const complexity = getComplexity({ type: 'string', enum: ['a', 'b', 'c'] });
      expect(complexity).toBeLessThan(4);
      // This means it will be inlined, not extracted to a variable
    });

    test('enum with 100 values should still inline', () => {
      const values = Array.from({ length: 100 }, (_, i) => `val${i}`);
      const complexity = getComplexity({ type: 'string', enum: values });
      expect(complexity).toBeLessThan(4);
      // Even large enums should inline - the Zod code size is not that different
    });
  });

  describe('edge cases', () => {
    test('enum with single value', () => {
      // Rationale: Single-value enum is still an enum
      expect(getComplexity({ type: 'string', enum: ['only'] })).toBe(2);
    });

    test('enum with empty array (invalid but handle gracefully)', () => {
      // Rationale: Should not crash, return base complexity
      expect(getComplexity({ type: 'string', enum: [] })).toBe(2);
    });

    test('enum with null value', () => {
      expect(getComplexity({ type: 'string', enum: ['a', null] })).toBe(2);
    });

    test('enum with mixed types (string and number)', () => {
      // Note: This might not be valid OpenAPI, but we should handle it
      const invalidSchema = { enum: ['a', 1, 'b', 2] as unknown };
      // @ts-expect-error TS2322 - Testing invalid enum input (mixed types as unknown) to verify error handling
      expect(getComplexity(invalidSchema)).toBe(2);
    });
  });
});
