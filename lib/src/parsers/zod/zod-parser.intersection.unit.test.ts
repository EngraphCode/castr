/**
 * Zod Intersection Parsing Unit Tests
 *
 * Tests for parsing intersection types: z.intersection(), .and() method.
 *
 * @module parsers/zod/intersection.unit.test
 */

import { describe, it, expect } from 'vitest';
import { parseIntersectionZod } from './zod-parser.intersection.js';

describe('Intersection Zod Parsing', () => {
  describe('parseIntersectionZod', () => {
    it('should parse z.intersection(A, B) to allOf with 2 schemas', () => {
      const result = parseIntersectionZod(
        'z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() }))',
      );

      expect(result).toBeDefined();
      expect(result?.allOf).toHaveLength(2);
    });

    it('should parse intersection of primitives', () => {
      const result = parseIntersectionZod('z.intersection(z.string(), z.string())');

      expect(result).toBeDefined();
      expect(result?.allOf).toHaveLength(2);
      expect(result?.allOf?.[0]).toEqual(expect.objectContaining({ type: 'string' }));
    });

    it('should include metadata on intersection schema', () => {
      const result = parseIntersectionZod(
        'z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() }))',
      );

      expect(result?.metadata).toBeDefined();
      expect(result?.metadata?.required).toBe(true);
      expect(result?.metadata?.nullable).toBe(false);
    });

    it('should return undefined for non-intersection expressions', () => {
      const result = parseIntersectionZod('z.string()');

      expect(result).toBeUndefined();
    });

    it('should return undefined for union expressions', () => {
      const result = parseIntersectionZod('z.union([z.string(), z.number()])');

      expect(result).toBeUndefined();
    });
  });
});
