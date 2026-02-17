/**
 * Zod 4 Primitive Parsing Tests
 *
 * TDD tests for parsing Zod 4 specific primitives and formats.
 *
 * @module parsers/zod/primitives.zod4.test
 */

import { describe, it, expect } from 'vitest';
import { parsePrimitiveZod } from './zod-parser.primitives.js';

describe('Zod 4 Primitive Parsing', () => {
  describe('Integer Types', () => {
    it('should parse z.int() as integer', () => {
      const result = parsePrimitiveZod('z.int()');
      expect(result).toBeDefined();
      expect(result?.type).toBe('integer');
      // z.int() implies safe integer range, no specific format required by OAS
    });

    it('should parse z.int32() as integer int32', () => {
      const result = parsePrimitiveZod('z.int32()');
      expect(result?.type).toBe('integer');
      expect(result?.format).toBe('int32');
    });

    it('should parse z.int64() as integer int64', () => {
      const result = parsePrimitiveZod('z.int64()');
      expect(result?.type).toBe('integer');
      expect(result?.format).toBe('int64');
    });

    it('should parse z.bigint() as integer bigint', () => {
      const result = parsePrimitiveZod('z.bigint()');
      expect(result?.type).toBe('integer');
      expect(result?.format).toBe('bigint');
    });
  });

  describe('Float Types', () => {
    it('should parse z.float32() as number float', () => {
      const result = parsePrimitiveZod('z.float32()');
      expect(result?.type).toBe('number');
      expect(result?.format).toBe('float');
    });

    it('should parse z.float64() as number double', () => {
      const result = parsePrimitiveZod('z.float64()');
      expect(result?.type).toBe('number');
      expect(result?.format).toBe('double');
    });
  });

  describe('ISO String Formats', () => {
    it('should parse z.iso.date() as string date', () => {
      const result = parsePrimitiveZod('z.iso.date()');
      expect(result?.type).toBe('string');
      expect(result?.format).toBe('date');
    });

    it('should parse z.iso.datetime() as string date-time', () => {
      const result = parsePrimitiveZod('z.iso.datetime()');
      expect(result?.type).toBe('string');
      expect(result?.format).toBe('date-time');
    });

    it('should parse z.iso.time() as string time', () => {
      const result = parsePrimitiveZod('z.iso.time()');
      expect(result?.type).toBe('string');
      expect(result?.format).toBe('time');
    });

    it('should parse z.iso.duration() as string duration', () => {
      const result = parsePrimitiveZod('z.iso.duration()');
      expect(result?.type).toBe('string');
      expect(result?.format).toBe('duration');
    });
  });

  describe('Other Zod 4 Formats', () => {
    it('should parse z.uuidv4() as string uuid', () => {
      const result = parsePrimitiveZod('z.uuidv4()');
      expect(result?.type).toBe('string');
      expect(result?.format).toBe('uuid');
    });

    it('should parse z.uuidv7() as string uuidv7', () => {
      const result = parsePrimitiveZod('z.uuidv7()');
      expect(result?.type).toBe('string');
      expect(result?.format).toBe('uuidv7');
    });

    it('should parse z.base64() as string with contentEncoding', () => {
      // Note: contentEncoding is an OAS 3.1 field, Zod 4 base64() implies this
      // Depending on implementation, might map to format: byte or contentEncoding
      // Testing for contentEncoding per our writer strategy
      const result = parsePrimitiveZod('z.base64()');
      expect(result?.type).toBe('string');
      expect(result?.contentEncoding).toBe('base64');
    });

    it('should parse z.base64url() as string with contentEncoding', () => {
      const result = parsePrimitiveZod('z.base64url()');
      expect(result?.type).toBe('string');
      expect(result?.contentEncoding).toBe('base64url');
    });
  });
});
