/**
 * Zod Composition Parsing Unit Tests
 *
 * Tests for parsing composition types: arrays, enums, unions, intersections.
 */

import { describe, it, expect } from 'vitest';
import { parseArrayZod, parseEnumZod } from './zod-parser.composition.js';

describe('Composition Zod Parsing', () => {
  describe('parseArrayZod', () => {
    it('should parse z.array(z.string()) to array schema with string items', () => {
      const result = parseArrayZod('z.array(z.string())');

      expect(result?.type).toBe('array');
      expect(result?.items).toEqual(
        expect.objectContaining({
          type: 'string',
        }),
      );
    });

    it('should parse z.array(z.number()) to array schema with number items', () => {
      const result = parseArrayZod('z.array(z.number())');

      expect(result?.type).toBe('array');
      expect(result?.items).toEqual(
        expect.objectContaining({
          type: 'number',
        }),
      );
    });

    it('should parse z.array(z.string()).min(1) with minItems', () => {
      const result = parseArrayZod('z.array(z.string()).min(1)');

      expect(result?.type).toBe('array');
      expect(result?.minItems).toBe(1);
    });

    it('should parse z.array(z.string()).max(10) with maxItems', () => {
      const result = parseArrayZod('z.array(z.string()).max(10)');

      expect(result?.type).toBe('array');
      expect(result?.maxItems).toBe(10);
    });

    it('should parse z.array(z.string()).length(5) with both min and max', () => {
      const result = parseArrayZod('z.array(z.string()).length(5)');

      expect(result?.type).toBe('array');
      expect(result?.minItems).toBe(5);
      expect(result?.maxItems).toBe(5);
    });

    it('should parse z.array(z.string()).nonempty() with minItems 1', () => {
      const result = parseArrayZod('z.array(z.string()).nonempty()');

      expect(result?.type).toBe('array');
      expect(result?.minItems).toBe(1);
    });

    it('should parse nested arrays z.array(z.array(z.string()))', () => {
      const result = parseArrayZod('z.array(z.array(z.string()))');

      expect(result?.type).toBe('array');
      const items = result?.items;
      expect(items).toBeDefined();
      if (items && !Array.isArray(items)) {
        expect(items.type).toBe('array');
      }
    });

    it('should return undefined for non-array expressions', () => {
      const result = parseArrayZod('z.string()');

      expect(result).toBeUndefined();
    });
  });

  describe('parseEnumZod', () => {
    it('should parse z.enum(["A", "B", "C"]) to string enum schema', () => {
      const result = parseEnumZod('z.enum(["A", "B", "C"])');

      expect(result?.type).toBe('string');
      expect(result?.enum).toEqual(['A', 'B', 'C']);
    });

    it('should parse z.enum(["admin", "user", "guest"])', () => {
      const result = parseEnumZod('z.enum(["admin", "user", "guest"])');

      expect(result?.type).toBe('string');
      expect(result?.enum).toEqual(['admin', 'user', 'guest']);
    });

    it('should return undefined for non-enum expressions', () => {
      const result = parseEnumZod('z.string()');

      expect(result).toBeUndefined();
    });
  });
});
