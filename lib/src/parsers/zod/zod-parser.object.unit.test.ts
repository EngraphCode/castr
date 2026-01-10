/**
 * Zod Object Parsing Tests
 *
 * TDD tests for parsing z.object() schemas to IR.
 *
 * @module parsers/zod/object.test
 */

import { describe, it, expect } from 'vitest';
import { parseObjectZod } from './zod-parser.object.js';

describe('Object Zod Parsing', () => {
  describe('parseObjectZod', () => {
    it('should parse empty z.object({}) to empty object schema', () => {
      const result = parseObjectZod('z.object({})');

      expect(result).toBeDefined();
      expect(result?.type).toBe('object');
      expect(result?.properties?.size).toBe(0);
      expect(result?.required).toEqual([]);
    });

    it('should parse z.object({ name: z.string() }) with property', () => {
      const result = parseObjectZod('z.object({ name: z.string() })');

      expect(result).toBeDefined();
      expect(result?.type).toBe('object');
      expect(result?.properties?.size).toBe(1);
      expect(result?.properties?.get('name')).toBeDefined();
      expect(result?.properties?.get('name')?.type).toBe('string');
      // All Zod properties are required by default
      expect(result?.required).toContain('name');
    });

    it('should parse z.object with multiple properties', () => {
      const result = parseObjectZod('z.object({ a: z.string(), b: z.number() })');

      expect(result).toBeDefined();
      expect(result?.type).toBe('object');
      expect(result?.properties?.size).toBe(2);
      expect(result?.properties?.get('a')?.type).toBe('string');
      expect(result?.properties?.get('b')?.type).toBe('number');
      expect(result?.required).toContain('a');
      expect(result?.required).toContain('b');
    });

    it('should have valid metadata structure', () => {
      const result = parseObjectZod('z.object({ name: z.string() })');

      expect(result?.metadata).toBeDefined();
      expect(result?.metadata.required).toBe(true);
      expect(result?.metadata.nullable).toBe(false);
      expect(result?.metadata.zodChain).toBeDefined();
      expect(result?.metadata.dependencyGraph).toBeDefined();
    });

    it('should return undefined for non-object Zod calls', () => {
      const result = parseObjectZod('z.string()');

      expect(result).toBeUndefined();
    });

    it('should return undefined for non-Zod expressions', () => {
      const result = parseObjectZod('someObject({})');

      expect(result).toBeUndefined();
    });

    it('should handle property names with special characters', () => {
      const result = parseObjectZod("z.object({ 'my-prop': z.string() })");

      expect(result).toBeDefined();
      expect(result?.properties?.get('my-prop')).toBeDefined();
    });
  });
});
