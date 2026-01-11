/**
 * Zod Union Parsing Unit Tests
 *
 * Tests for parsing union types: z.union(), z.discriminatedUnion().
 *
 * @module parsers/zod/union.unit.test
 */

import { describe, it, expect } from 'vitest';
import { parseUnionZod, parseDiscriminatedUnionZod } from './zod-parser.union.js';

describe('Union Zod Parsing', () => {
  describe('parseUnionZod', () => {
    it('should parse z.union([z.string(), z.number()]) to oneOf with 2 schemas', () => {
      const result = parseUnionZod('z.union([z.string(), z.number()])');

      expect(result).toBeDefined();
      expect(result?.oneOf).toHaveLength(2);
      expect(result?.oneOf?.[0]).toEqual(expect.objectContaining({ type: 'string' }));
      expect(result?.oneOf?.[1]).toEqual(expect.objectContaining({ type: 'number' }));
    });

    it('should parse z.union([z.literal("a"), z.literal("b")]) to string const schemas', () => {
      const result = parseUnionZod('z.union([z.literal("pending"), z.literal("approved")])');

      expect(result).toBeDefined();
      expect(result?.oneOf).toHaveLength(2);
      expect(result?.oneOf?.[0]).toEqual(expect.objectContaining({ const: 'pending' }));
      expect(result?.oneOf?.[1]).toEqual(expect.objectContaining({ const: 'approved' }));
    });

    it('should parse z.union with boolean and null types', () => {
      const result = parseUnionZod('z.union([z.boolean(), z.null()])');

      expect(result).toBeDefined();
      expect(result?.oneOf).toHaveLength(2);
      expect(result?.oneOf?.[0]).toEqual(expect.objectContaining({ type: 'boolean' }));
      expect(result?.oneOf?.[1]).toEqual(expect.objectContaining({ type: 'null' }));
    });

    it('should include metadata on union schema', () => {
      const result = parseUnionZod('z.union([z.string(), z.number()])');

      expect(result?.metadata).toBeDefined();
      expect(result?.metadata?.required).toBe(true);
      expect(result?.metadata?.nullable).toBe(false);
    });

    it('should return undefined for non-union expressions', () => {
      const result = parseUnionZod('z.string()');

      expect(result).toBeUndefined();
    });

    it('should return undefined for z.array expressions', () => {
      const result = parseUnionZod('z.array(z.string())');

      expect(result).toBeUndefined();
    });
  });

  describe('parseDiscriminatedUnionZod', () => {
    it('should parse z.discriminatedUnion with discriminator property', () => {
      const result = parseDiscriminatedUnionZod(`z.discriminatedUnion('type', [
        z.object({ type: z.literal('click'), x: z.number() }),
        z.object({ type: z.literal('scroll'), offset: z.number() }),
      ])`);

      expect(result).toBeDefined();
      expect(result?.oneOf).toHaveLength(2);
      expect(result?.discriminator).toEqual({ propertyName: 'type' });
    });

    it('should parse discriminated union with string discriminator', () => {
      const result = parseDiscriminatedUnionZod(`z.discriminatedUnion("status", [
        z.object({ status: z.literal("pending"), createdAt: z.string() }),
        z.object({ status: z.literal("approved"), approvedAt: z.string() }),
      ])`);

      expect(result).toBeDefined();
      expect(result?.discriminator?.propertyName).toBe('status');
    });

    it('should extract variant schemas with their properties', () => {
      const result = parseDiscriminatedUnionZod(`z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('user'), name: z.string() }),
        z.object({ kind: z.literal('bot'), model: z.string() }),
      ])`);

      expect(result?.oneOf).toHaveLength(2);
      const firstVariant = result?.oneOf?.[0];
      expect(firstVariant?.type).toBe('object');
    });

    it('should return undefined for non-discriminated union expressions', () => {
      const result = parseDiscriminatedUnionZod('z.union([z.string(), z.number()])');

      expect(result).toBeUndefined();
    });

    it('should return undefined for primitive expressions', () => {
      const result = parseDiscriminatedUnionZod('z.string()');

      expect(result).toBeUndefined();
    });
  });
});
