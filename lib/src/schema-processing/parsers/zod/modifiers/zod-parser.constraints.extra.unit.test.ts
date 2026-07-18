/**
 * Zod Extra Constraints Tests
 *
 * TDD for constraints not yet covered (array length, number gt/lt, string helpers).
 */

import { describe, it, expect } from 'vitest';
import { parsePrimitiveZod } from '../types/zod-parser.primitives.js';

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

  describe('Signed numeric literals are captured', () => {
    it('captures a negative .min() bound instead of dropping it', () => {
      const result = parsePrimitiveZod('z.number().min(-100)');
      expect(result?.minimum).toBe(-100);
      expect(result?.metadata.zodChain.validations).toEqual(['.min(-100)']);
    });

    it('captures a negative .max() bound on an int32 base', () => {
      const result = parsePrimitiveZod('z.int32().max(-1)');
      expect(result?.maximum).toBe(-1);
    });

    it('captures an explicit positive-signed bound', () => {
      const result = parsePrimitiveZod('z.number().max(+10)');
      expect(result?.maximum).toBe(10);
    });

    it('captures a negative .default() value', () => {
      const result = parsePrimitiveZod('z.number().default(-1)');
      expect(result?.metadata.default).toBe(-1);
      expect(result?.metadata.zodChain.defaults).toEqual(['.default(-1)']);
    });
  });

  describe('String pattern literals are regex-escaped', () => {
    it('escapes startsWith(".") so the pattern matches a literal dot', () => {
      const result = parsePrimitiveZod("z.string().startsWith('.')");
      expect(result?.pattern).toBe('^\\.');
    });

    it('escapes endsWith("$") so the pattern matches a literal dollar sign', () => {
      const result = parsePrimitiveZod("z.string().endsWith('$')");
      expect(result?.pattern).toBe('\\$$');
    });

    it('escapes includes("(") so the pattern matches a literal parenthesis', () => {
      const result = parsePrimitiveZod("z.string().includes('(')");
      expect(result?.pattern).toBe('\\(');
    });

    it('escapes backslashes in startsWith literals', () => {
      const result = parsePrimitiveZod('z.string().startsWith("a\\\\b")');
      expect(result?.pattern).toBe('^a\\\\b');
    });

    it('leaves unescaped-safe literals unchanged', () => {
      const result = parsePrimitiveZod("z.string().startsWith('prefix_')");
      expect(result?.pattern).toBe('^prefix_');
    });

    it('passes .regex() patterns through without additional escaping', () => {
      const result = parsePrimitiveZod('z.string().regex(/^[a-z]+$/)');
      expect(result?.pattern).toBe('^[a-z]+$');
    });
  });
});
