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
});
