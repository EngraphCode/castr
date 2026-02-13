/**
 * Zod Union Parser Tests
 *
 * TDD for Unions, Discriminated Unions, and XOR.
 *
 * @module parsers/zod/union.test
 */

import { describe, it, expect } from 'vitest';
import { parseUnionZod } from './zod-parser.union.js';
// Side-effect imports to register parsers needed for nested parsing
import './zod-parser.primitives.js';
import './zod-parser.object.js';

describe('Zod Union Parsing', () => {
  describe('Unions (anyOf)', () => {
    it('should parse z.union([string, number])', () => {
      const result = parseUnionZod('z.union([z.string(), z.number()])');
      expect(result).toMatchObject({
        anyOf: [{ type: 'string' }, { type: 'number' }],
      });
    });

    it('should parse nested unions', () => {
      const result = parseUnionZod('z.union([z.string(), z.union([z.number(), z.boolean()])])');
      expect(result).toMatchObject({
        anyOf: [
          { type: 'string' },
          {
            anyOf: [{ type: 'number' }, { type: 'boolean' }],
          },
        ],
      });
    });
  });

  describe('Discriminated Unions (oneOf + discriminator)', () => {
    // Note: z.discriminatedUnion expects object schemas with literal discriminators
    it('should parse z.discriminatedUnion', () => {
      const result = parseUnionZod(`
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("a"), val: z.string() }),
          z.object({ type: z.literal("b"), val: z.number() })
        ])
      `);

      // Verify structure
      expect(result?.oneOf).toHaveLength(2);
      expect(result?.discriminator).toMatchObject({ propertyName: 'type' });

      // Verify first variant
      const variant0 = result?.oneOf?.[0];
      expect(variant0?.type).toBe('object');
      expect(variant0?.properties?.get('type')?.type).toBe('string');
      expect(variant0?.properties?.get('type')?.enum).toEqual(['a']);
      expect(variant0?.properties?.get('val')?.type).toBe('string');

      // Verify second variant
      const variant1 = result?.oneOf?.[1];
      expect(variant1?.type).toBe('object');
      expect(variant1?.properties?.get('type')?.type).toBe('string');
      expect(variant1?.properties?.get('type')?.enum).toEqual(['b']);
      expect(variant1?.properties?.get('val')?.type).toBe('number');
    });
  });
});
