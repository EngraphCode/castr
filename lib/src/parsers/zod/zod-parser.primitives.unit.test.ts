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
});
