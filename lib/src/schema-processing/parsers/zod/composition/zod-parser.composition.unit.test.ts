/**
 * Zod Composition Parser Tests
 *
 * TDD for Arrays, Tuples, and Enums.
 *
 * @module parsers/zod/composition.test
 */

import { describe, it, expect } from 'vitest';
import { parseCompositionZod } from './zod-parser.composition.js';
// Side-effect import to register primitive parser needed for nested parsing
import '../types/zod-parser.primitives.js';
// Note: We test the public wrapper parseCompositionZod which uses string -> Node -> Core -> Composition
// Or we test parseCompositionZodFromNode directly?
// Let's test parseCompositionZod logic mainly.
// For recursion, we rely on core dispatcher working (verification in integration tests).

describe('Zod Composition Parsing', () => {
  describe('Arrays', () => {
    it('should parse z.array(z.string())', () => {
      const result = parseCompositionZod('z.array(z.string())');
      expect(result).toMatchObject({
        type: 'array',
        items: { type: 'string' },
      });
    });

    it('should parse array with min/max length', () => {
      const result = parseCompositionZod('z.array(z.string()).min(1).max(10)');
      expect(result).toMatchObject({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
      });
    });

    it('should parse array with exact length', () => {
      const result = parseCompositionZod('z.array(z.string()).length(5)');
      expect(result).toMatchObject({
        type: 'array',
        minItems: 5,
        maxItems: 5,
      });
    });

    it('should parse nested arrays', () => {
      const result = parseCompositionZod('z.array(z.array(z.number()))');
      expect(result).toMatchObject({
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'number' },
        },
      });
    });
  });

  describe('Tuples', () => {
    it('should parse z.tuple([string, number])', () => {
      const result = parseCompositionZod('z.tuple([z.string(), z.number()])');
      expect(result).toMatchObject({
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        minItems: 2,
        maxItems: 2,
      });
    });

    it('should parse variadic tuple .rest()', () => {
      const result = parseCompositionZod('z.tuple([z.string()]).rest(z.number())');
      expect(result).toMatchObject({
        type: 'array',
        prefixItems: [{ type: 'string' }],
        minItems: 1, // Rest allows more
        // items: { type: 'number' } // OpenAPI 3.1: items is the rest schema
      });
      expect(result?.items).toMatchObject({ type: 'number' });
      expect(result?.maxItems).toBeUndefined();
    });
  });
});
