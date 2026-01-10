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

  describe('parseObjectZod with chained properties (Session 2.2)', () => {
    it('should parse property with chain: z.string().min(1)', () => {
      const result = parseObjectZod('z.object({ name: z.string().min(1) })');

      expect(result?.properties?.get('name')?.type).toBe('string');
      expect(result?.properties?.get('name')?.minLength).toBe(1);
      expect(result?.required).toContain('name');
    });

    it('should parse optional property and exclude from required', () => {
      const result = parseObjectZod('z.object({ name: z.string().optional() })');

      expect(result?.properties?.get('name')?.type).toBe('string');
      expect(result?.properties?.get('name')?.metadata.required).toBe(false);
      expect(result?.required).not.toContain('name');
    });

    it('should parse mixed required and optional properties', () => {
      const result = parseObjectZod('z.object({ id: z.string(), name: z.string().optional() })');

      expect(result?.required).toContain('id');
      expect(result?.required).not.toContain('name');
    });

    it('should parse property with format: z.string().email()', () => {
      const result = parseObjectZod('z.object({ email: z.string().email() })');

      expect(result?.properties?.get('email')?.format).toBe('email');
    });

    it('should parse property with complex chain', () => {
      const result = parseObjectZod('z.object({ age: z.number().int().min(0).max(150) })');

      const ageProp = result?.properties?.get('age');
      expect(ageProp?.type).toBe('number');
      expect(ageProp?.format).toBe('int32');
      expect(ageProp?.minimum).toBe(0);
      expect(ageProp?.maximum).toBe(150);
    });
  });
});
