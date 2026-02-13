/**
 * Zod Extra Constraints Tests
 *
 * TDD for constraints not yet covered (array length, number gt/lt, string helpers).
 *
 * @module parsers/zod/constraints.extra.test
 */

import { describe, it, expect } from 'vitest';
import { parsePrimitiveZod } from './zod-parser.primitives.js';

describe('Zod Extra Constraints Parsing', () => {
  describe('Number Exclusive Constraints', () => {
    it('should parse z.number().gt(5) as exclusiveMinimum', () => {
      const result = parsePrimitiveZod('z.number().gt(5)');
      expect(result?.type).toBe('number');
      expect(result?.exclusiveMinimum).toBe(5);
      expect(result?.minimum).toBeUndefined();
    });

    it('should parse z.number().lt(10) as exclusiveMaximum', () => {
      const result = parsePrimitiveZod('z.number().lt(10)');
      expect(result?.type).toBe('number');
      expect(result?.exclusiveMaximum).toBe(10);
      expect(result?.maximum).toBeUndefined();
    });
  });

  describe('String Helper Constraints', () => {
    it('should parse z.string().startsWith("prefix")', () => {
      const result = parsePrimitiveZod('z.string().startsWith("prefix")');
      expect(result?.pattern).toContain('^prefix');
    });

    it('should parse z.string().endsWith("suffix")', () => {
      const result = parsePrimitiveZod('z.string().endsWith("suffix")');
      expect(result?.pattern).toContain('suffix$');
    });

    it('should parse z.string().includes("middle")', () => {
      const result = parsePrimitiveZod('z.string().includes("middle")');
      expect(result?.pattern).toContain('middle');
    });

    it('should parse z.string().ip() as format:ip', () => {
      const result = parsePrimitiveZod('z.string().ip()');
      expect(result?.format).toBe('ip');
    });

    it('should parse z.string().cuid() as format:cuid', () => {
      const result = parsePrimitiveZod('z.string().cuid()');
      expect(result?.format).toBe('cuid');
    });

    it('should parse z.string().base64() as contentEncoding:base64', () => {
      const result = parsePrimitiveZod('z.string().base64()');
      expect(result?.contentEncoding).toBe('base64');
    });
  });
});
