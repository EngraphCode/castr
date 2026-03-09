import { describe, expect, it } from 'vitest';

import {
  classifyReferenceWrapper,
  buildWrappedReferenceSchema,
  reduceReferenceWrapperMethods,
} from './zod-parser.reference-wrappers.js';

describe('Zod Reference Wrapper Helpers', () => {
  describe('classifyReferenceWrapper', () => {
    it('classifies supported wrapper methods', () => {
      expect(classifyReferenceWrapper('optional')).toBe('optional');
      expect(classifyReferenceWrapper('nullable')).toBe('nullable');
      expect(classifyReferenceWrapper('nullish')).toBe('nullish');
    });

    it('returns undefined for unsupported methods', () => {
      expect(classifyReferenceWrapper('default')).toBeUndefined();
      expect(classifyReferenceWrapper('transform')).toBeUndefined();
    });
  });

  describe('reduceReferenceWrapperMethods', () => {
    it('reduces optional to optional only', () => {
      expect(reduceReferenceWrapperMethods(['optional'])).toEqual({
        optional: true,
        nullable: false,
      });
    });

    it('reduces nullable to nullable only', () => {
      expect(reduceReferenceWrapperMethods(['nullable'])).toEqual({
        optional: false,
        nullable: true,
      });
    });

    it('reduces nullish to optional + nullable', () => {
      expect(reduceReferenceWrapperMethods(['nullish'])).toEqual({
        optional: true,
        nullable: true,
      });
    });

    it('merges chained optional and nullable wrappers', () => {
      expect(reduceReferenceWrapperMethods(['optional', 'nullable'])).toEqual({
        optional: true,
        nullable: true,
      });
    });
  });

  describe('buildWrappedReferenceSchema', () => {
    it('builds optional recursive refs as direct refs with optional property metadata', () => {
      const result = buildWrappedReferenceSchema('#/components/schemas/TreeNode', ['optional']);

      expect(result.$ref).toBe('#/components/schemas/TreeNode');
      expect(result.metadata.required).toBe(false);
      expect(result.anyOf).toBeUndefined();
    });

    it('builds nullable recursive refs as nullable reference composition', () => {
      const result = buildWrappedReferenceSchema('#/components/schemas/LinkedListNode', [
        'nullable',
      ]);

      expect(result.$ref).toBeUndefined();
      expect(result.metadata.required).toBe(true);
      expect(result.anyOf).toHaveLength(2);
      expect(result.anyOf?.[0]?.$ref).toBe('#/components/schemas/LinkedListNode');
      expect(result.anyOf?.[1]?.type).toBe('null');
    });

    it('builds nullish recursive refs as nullable composition plus optional property metadata', () => {
      const result = buildWrappedReferenceSchema('#/components/schemas/LinkedListNode', [
        'nullish',
      ]);

      expect(result.metadata.required).toBe(false);
      expect(result.anyOf).toHaveLength(2);
      expect(result.anyOf?.[0]?.$ref).toBe('#/components/schemas/LinkedListNode');
      expect(result.anyOf?.[1]?.type).toBe('null');
    });
  });
});
