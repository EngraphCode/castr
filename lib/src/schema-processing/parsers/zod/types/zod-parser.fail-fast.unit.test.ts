/**
 * Zod Primitive/Object Fail-Fast Tests (C5 remediation)
 *
 * Unrecognised chained methods on primitives and objects must produce
 * structured PARSE_ERRORs instead of being text-captured with their
 * arguments destroyed, or silently dropped.
 * Losslessness doctrine: lossless or loud.
 */

import { describe, it, expect } from 'vitest';
import { parseZodSource } from '../zod-parser.js';
import { assertSchemaComponent } from '../../../ir/index.js';

describe('Zod primitive/object fail-fast (strict whitelist)', () => {
  describe('primitive chains', () => {
    it('rejects .refine() on a primitive instead of erasing the predicate', () => {
      const result = parseZodSource(`
        export const S = z.string().refine((value) => value.length > 3);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.refine(');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects .transform() on a primitive instead of capturing it as text', () => {
      const result = parseZodSource(`
        export const S = z.string().transform((value) => value.trim());
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.transform(');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects z.literal() with a non-literal argument instead of corrupting the value', () => {
      const result = parseZodSource(`
        const someValue = 'x';
        export const S = z.literal(someValue);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.literal()');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects a string-only chain method on a non-string primitive', () => {
      const result = parseZodSource(`
        export const S = z.boolean().email();
      `);

      expect(result.ir.components).toHaveLength(0);
      // The detection pass also flags `.email()` as a discouraged refinement,
      // so assert on the structured PARSE_ERROR entry specifically.
      const parseError = result.errors.find((error) => error.code === 'PARSE_ERROR');
      expect(parseError).toBeDefined();
      expect(parseError?.message).toContain('.email(');
      expect(parseError?.message).toContain('z.boolean()');
      expect(parseError?.location).toBeDefined();
    });
  });

  describe('recognised chained methods with unextractable arguments fail fast', () => {
    it('rejects z.string().min() with a non-literal argument instead of dropping the constraint', () => {
      const result = parseZodSource(`
        const limit = 1;
        export const S = z.string().min(limit);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.min(');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects z.number().max() with a non-literal argument instead of dropping the constraint', () => {
      const result = parseZodSource(`
        const bound = 10;
        export const S = z.number().max(bound);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.max(');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects z.string().regex() with a non-literal argument instead of dropping the pattern', () => {
      const result = parseZodSource(`
        const pattern = /^[a-z]+$/;
        export const S = z.string().regex(pattern);
      `);

      expect(result.ir.components).toHaveLength(0);
      const parseError = result.errors.find((error) => error.code === 'PARSE_ERROR');
      expect(parseError).toBeDefined();
      expect(parseError?.message).toContain('.regex(');
      expect(parseError?.location).toBeDefined();
    });

    it('rejects a primitive .default() with a non-extractable argument instead of dropping it', () => {
      const result = parseZodSource(`
        const fallback = 'x';
        export const S = z.string().default(fallback);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.default(');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects a primitive non-literal .describe() argument instead of dropping it', () => {
      const result = parseZodSource(`
        const dynamicDescription = 'computed';
        export const S = z.string().describe(dynamicDescription);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.describe(');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects a primitive .meta() with a non-extractable argument instead of dropping it', () => {
      const result = parseZodSource(`
        const dynamicMeta = { description: 'x' };
        export const S = z.string().meta(dynamicMeta);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.meta(');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('serialises a primitive string default containing quotes as valid Zod source', () => {
      const result = parseZodSource(`
        export const S = z.string().default('a"b');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.metadata.default).toBe('a"b');
      expect(component.schema.metadata.zodChain?.defaults).toEqual(['.default("a\\"b")']);
    });

    it('serialises a primitive string default containing a newline as valid Zod source', () => {
      const result = parseZodSource(`
        export const S = z.string().default('line1\\nline2');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.metadata.default).toBe('line1\nline2');
      expect(component.schema.metadata.zodChain?.defaults).toEqual(['.default("line1\\nline2")']);
    });
  });

  describe('multi-value literal members are validated', () => {
    it('parses a homogeneous string literal set with a single derived type', () => {
      const result = parseZodSource(`
        export const S = z.literal(['red', 'green']);
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.type).toBe('string');
      expect(component.schema.enum).toEqual(['red', 'green']);
    });

    it('represents a heterogeneous literal set without a contradictory single type', () => {
      const result = parseZodSource(`
        export const S = z.literal(['x', 1]);
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.enum).toEqual(['x', 1]);
      expect(component.schema.type).toBeUndefined();
    });

    it('marks a literal set containing null as nullable', () => {
      const result = parseZodSource(`
        export const S = z.literal(['x', null]);
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.enum).toEqual(['x', null]);
      expect(component.schema.type).toBeUndefined();
      expect(component.schema.metadata.nullable).toBe(true);
    });

    it('rejects nested-array literal members instead of corrupting the enum', () => {
      const result = parseZodSource(`
        export const S = z.literal([['a']]);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.literal()');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('captures .describe() on a literal schema', () => {
      const result = parseZodSource(`
        export const S = z.literal('x').describe('A marker literal');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.enum).toEqual(['x']);
      expect(component.schema.description).toBe('A marker literal');
    });
  });

  describe('object chains', () => {
    it('rejects .refine() on a strict object instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({ a: z.string() }).refine((value) => true);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.refine(');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects .readonly() on a strict object instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({ a: z.string() }).readonly();
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.readonly(');
      expect(result.errors[0]?.location).toBeDefined();
    });
  });

  describe('presence modifiers on objects are captured, not dropped', () => {
    it('captures .optional() on a nested strict object property', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({
          inner: z.strictObject({ a: z.string() }).optional(),
        });
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      const inner = component.schema.properties?.get('inner');
      expect(inner?.metadata.required).toBe(false);
      expect(inner?.metadata.zodChain?.presence).toBe('.optional()');
      expect(component.schema.required).not.toContain('inner');
    });

    it('captures .nullable() on a nested strict object property', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({
          inner: z.strictObject({ a: z.string() }).nullable(),
        });
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      const inner = component.schema.properties?.get('inner');
      expect(inner?.metadata.nullable).toBe(true);
      expect(inner?.metadata.zodChain?.presence).toBe('.nullable()');
    });
  });

  describe('.describe() on objects is captured, not rejected', () => {
    it('captures .describe() on a strict object', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({ a: z.string() }).describe('A described object');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.type).toBe('object');
      expect(component.schema.description).toBe('A described object');
    });

    it('rejects a non-literal .describe() argument instead of dropping it', () => {
      const result = parseZodSource(`
        const dynamicDescription = 'computed';
        export const S = z.strictObject({ a: z.string() }).describe(dynamicDescription);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.describe(');
      expect(result.errors[0]?.location).toBeDefined();
    });
  });
});
