/**
 * Zod Primitive Parsing Tests
 *
 * TDD tests for parsing primitive Zod types to IR.
 *
 * @module parsers/zod/primitives.test
 */

import { describe, it, expect } from 'vitest';
import { parsePrimitiveZod } from './zod-parser.primitives.js';

describe('Primitive Zod Parsing', () => {
  describe('parsePrimitiveZod', () => {
    it('should parse z.string() to CastrSchema with type string', () => {
      const result = parsePrimitiveZod('z.string()');

      expect(result).toBeDefined();
      expect(result?.type).toBe('string');
      expect(result?.metadata).toBeDefined();
      expect(result?.metadata.nullable).toBe(false);
      expect(result?.metadata.required).toBe(true);
    });

    it('should parse z.number() to CastrSchema with type number', () => {
      const result = parsePrimitiveZod('z.number()');

      expect(result).toBeDefined();
      expect(result?.type).toBe('number');
      expect(result?.metadata).toBeDefined();
    });

    it('should parse z.boolean() to CastrSchema with type boolean', () => {
      const result = parsePrimitiveZod('z.boolean()');

      expect(result).toBeDefined();
      expect(result?.type).toBe('boolean');
      expect(result?.metadata).toBeDefined();
    });

    it('should parse z.null() to CastrSchema with type null', () => {
      const result = parsePrimitiveZod('z.null()');

      expect(result).toBeDefined();
      expect(result?.type).toBe('null');
      expect(result?.metadata.nullable).toBe(true);
    });

    it('should parse z.undefined() to empty schema metadata', () => {
      const result = parsePrimitiveZod('z.undefined()');

      // z.undefined() doesn't map cleanly to JSON Schema types
      // We represent it with a special marker
      expect(result).toBeDefined();
    });

    it('should return undefined for non-primitive Zod calls', () => {
      const result = parsePrimitiveZod('z.object({})');

      expect(result).toBeUndefined();
    });

    it('should return undefined for non-Zod expressions', () => {
      const result = parsePrimitiveZod('someFunction()');

      expect(result).toBeUndefined();
    });

    it('should have valid zodChain metadata structure', () => {
      const result = parsePrimitiveZod('z.string()');

      expect(result?.metadata.zodChain).toBeDefined();
      expect(result?.metadata.zodChain.validations).toEqual([]);
      expect(result?.metadata.zodChain.defaults).toEqual([]);
    });

    it('should have valid dependencyGraph metadata structure', () => {
      const result = parsePrimitiveZod('z.string()');

      expect(result?.metadata.dependencyGraph).toBeDefined();
      expect(result?.metadata.dependencyGraph.references).toEqual([]);
      expect(result?.metadata.dependencyGraph.referencedBy).toEqual([]);
      expect(result?.metadata.dependencyGraph.depth).toBe(0);
    });

    it('should have empty circularReferences array', () => {
      const result = parsePrimitiveZod('z.string()');

      expect(result?.metadata.circularReferences).toEqual([]);
    });
  });

  describe('parsePrimitiveZod with constraints (Session 2.2)', () => {
    it('should parse z.string().min(1) with minLength', () => {
      const result = parsePrimitiveZod('z.string().min(1)');

      expect(result?.type).toBe('string');
      expect(result?.minLength).toBe(1);
    });

    it('should parse z.string().max(100) with maxLength', () => {
      const result = parsePrimitiveZod('z.string().max(100)');

      expect(result?.type).toBe('string');
      expect(result?.maxLength).toBe(100);
    });

    it('should parse z.string().min(1).max(100) with both constraints', () => {
      const result = parsePrimitiveZod('z.string().min(1).max(100)');

      expect(result?.minLength).toBe(1);
      expect(result?.maxLength).toBe(100);
    });

    it('should parse z.string().regex(/pattern/) with pattern', () => {
      const result = parsePrimitiveZod('z.string().regex(/^[a-z]+$/)');

      expect(result?.pattern).toBe('^[a-z]+$');
    });

    it('should parse z.number().min(0) with minimum', () => {
      const result = parsePrimitiveZod('z.number().min(0)');

      expect(result?.type).toBe('number');
      expect(result?.minimum).toBe(0);
    });

    it('should parse z.number().max(100) with maximum', () => {
      const result = parsePrimitiveZod('z.number().max(100)');

      expect(result?.maximum).toBe(100);
    });

    it('should parse z.number().int() with format int32', () => {
      const result = parsePrimitiveZod('z.number().int()');

      expect(result?.format).toBe('int32');
    });
  });

  describe('parsePrimitiveZod with formats (Session 2.2)', () => {
    it('should parse z.string().email() with format email', () => {
      const result = parsePrimitiveZod('z.string().email()');

      expect(result?.format).toBe('email');
    });

    it('should parse z.string().url() with format uri', () => {
      const result = parsePrimitiveZod('z.string().url()');

      expect(result?.format).toBe('uri');
    });

    it('should parse z.string().uuid() with format uuid', () => {
      const result = parsePrimitiveZod('z.string().uuid()');

      expect(result?.format).toBe('uuid');
    });

    it('should parse z.string().datetime() with format date-time', () => {
      const result = parsePrimitiveZod('z.string().datetime()');

      expect(result?.format).toBe('date-time');
    });
  });

  describe('parsePrimitiveZod with optionality (Session 2.2)', () => {
    it('should parse z.string().optional() as not required', () => {
      const result = parsePrimitiveZod('z.string().optional()');

      expect(result?.metadata.required).toBe(false);
      expect(result?.metadata.nullable).toBe(false);
    });

    it('should parse z.string().nullable() as nullable', () => {
      const result = parsePrimitiveZod('z.string().nullable()');

      expect(result?.metadata.required).toBe(true);
      expect(result?.metadata.nullable).toBe(true);
    });

    it('should parse z.string().nullish() as optional and nullable', () => {
      const result = parsePrimitiveZod('z.string().nullish()');

      expect(result?.metadata.required).toBe(false);
      expect(result?.metadata.nullable).toBe(true);
    });
  });

  describe('parsePrimitiveZod with defaults (Session 2.2)', () => {
    it('should parse z.string().default("hello") with default value', () => {
      const result = parsePrimitiveZod('z.string().default("hello")');

      expect(result?.default).toBe('hello');
      expect(result?.metadata.default).toBe('hello');
    });

    it('should parse z.number().default(0) with default value', () => {
      const result = parsePrimitiveZod('z.number().default(0)');

      expect(result?.default).toBe(0);
    });
  });

  describe('parsePrimitiveZod with complex chains (Session 2.2)', () => {
    it('should parse full chain: z.string().min(1).max(100).email().optional()', () => {
      const result = parsePrimitiveZod('z.string().min(1).max(100).email().optional()');

      expect(result?.type).toBe('string');
      expect(result?.minLength).toBe(1);
      expect(result?.maxLength).toBe(100);
      expect(result?.format).toBe('email');
      expect(result?.metadata.required).toBe(false);
    });

    it('should populate zodChain validations for transform-path assertions', () => {
      const result = parsePrimitiveZod('z.string().min(1).email()');

      expect(result?.metadata.zodChain.validations).toContain('.min(1)');
      expect(result?.metadata.zodChain.validations).toContain('.email()');
    });

    it('should populate zodChain presence for optionality', () => {
      const result = parsePrimitiveZod('z.string().optional()');

      expect(result?.metadata.zodChain.presence).toBe('.optional()');
    });
  });

  describe('parsePrimitiveZod with number sign constraints (Session 2.2 gaps)', () => {
    it('should parse z.number().positive() with exclusiveMinimum 0', () => {
      const result = parsePrimitiveZod('z.number().positive()');

      expect(result?.type).toBe('number');
      expect(result?.exclusiveMinimum).toBe(0);
    });

    it('should parse z.number().negative() with exclusiveMaximum 0', () => {
      const result = parsePrimitiveZod('z.number().negative()');

      expect(result?.type).toBe('number');
      expect(result?.exclusiveMaximum).toBe(0);
    });

    it('should parse z.number().nonnegative() with minimum 0', () => {
      const result = parsePrimitiveZod('z.number().nonnegative()');

      expect(result?.type).toBe('number');
      expect(result?.minimum).toBe(0);
    });

    it('should parse z.number().nonpositive() with maximum 0', () => {
      const result = parsePrimitiveZod('z.number().nonpositive()');

      expect(result?.type).toBe('number');
      expect(result?.maximum).toBe(0);
    });

    it('should parse z.number().multipleOf(5) with multipleOf 5', () => {
      const result = parsePrimitiveZod('z.number().multipleOf(5)');

      expect(result?.type).toBe('number');
      expect(result?.multipleOf).toBe(5);
    });
  });

  describe('parsePrimitiveZod with describe (Session 2.2 gaps)', () => {
    it('should parse z.string().describe("User email") with description', () => {
      const result = parsePrimitiveZod('z.string().describe("User email")');

      expect(result?.description).toBe('User email');
    });

    it('should parse z.number().describe("Age in years") with description', () => {
      const result = parsePrimitiveZod('z.number().describe("Age in years")');

      expect(result?.description).toBe('Age in years');
    });
  });
});
