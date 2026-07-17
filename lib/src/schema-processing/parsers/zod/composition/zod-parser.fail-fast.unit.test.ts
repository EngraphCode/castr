/**
 * Zod Composition Fail-Fast Tests (C5 remediation)
 *
 * The parser must return structured PARSE_ERRORs for unrecognised
 * union/tuple/enum members and chained methods instead of silently
 * dropping them. Losslessness doctrine: lossless or loud.
 */

import { describe, it, expect } from 'vitest';
import { parseZodSource } from '../zod-parser.js';
import { assertSchemaComponent } from '../../../ir/index.js';

describe('Zod composition fail-fast (strict whitelist)', () => {
  describe('union members', () => {
    it('rejects a union containing an unrecognised member instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.union([z.string(), z.coerce.number()]);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.coerce.number()');
      expect(result.errors[0]?.message).toContain('union member');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects a discriminated union containing an unrecognised member', () => {
      const result = parseZodSource(`
        export const S = z.discriminatedUnion('type', [
          z.strictObject({ type: z.literal('a') }),
          z.coerce.number(),
        ]);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.coerce.number()');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects an unsupported chained method on a union instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.union([z.string(), z.number()]).describe('a description');
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.describe(');
      expect(result.errors[0]?.location).toBeDefined();
    });
  });

  describe('tuple members', () => {
    it('rejects a tuple with an unrecognised middle member instead of shrinking arity', () => {
      const result = parseZodSource(`
        export const S = z.tuple([z.string(), z.coerce.number(), z.boolean()]);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.coerce.number()');
      expect(result.errors[0]?.message).toContain('tuple member');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects an unresolvable .rest() argument instead of dropping the rest schema', () => {
      const result = parseZodSource(`
        export const S = z.tuple([z.string()]).rest(SomeUnknownSchema);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('rest');
      expect(result.errors[0]?.location).toBeDefined();
    });
  });

  describe('enums', () => {
    it('rejects z.nativeEnum instead of widening it to a plain string', () => {
      const result = parseZodSource(`
        enum Color { Red, Green }
        export const S = z.nativeEnum(Color);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.nativeEnum');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects non-literal enum members instead of dropping them', () => {
      const result = parseZodSource(`
        const dynamicValue = 'a';
        export const S = z.enum([dynamicValue, 'b']);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('enum member');
      expect(result.errors[0]?.location).toBeDefined();
    });
  });

  describe('arrays', () => {
    it('rejects an unsupported chained method on an array instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.array(z.string()).refine((value) => value.length > 0);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.refine(');
      expect(result.errors[0]?.location).toBeDefined();
    });
  });

  describe('presence modifiers on composites are captured, not dropped', () => {
    it('captures .optional() on an array-typed property', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({ arr: z.array(z.string()).optional() });
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      const arr = component.schema.properties?.get('arr');
      expect(arr?.metadata.required).toBe(false);
      expect(arr?.metadata.zodChain?.presence).toBe('.optional()');
      expect(component.schema.required).not.toContain('arr');
    });

    it('captures .optional() on a union-typed property', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({ u: z.union([z.string(), z.number()]).optional() });
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      const u = component.schema.properties?.get('u');
      expect(u?.metadata.required).toBe(false);
      expect(component.schema.required).not.toContain('u');
    });

    it('captures .nullable() on an enum-typed property', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({ e: z.enum(['a', 'b']).nullable() });
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      const e = component.schema.properties?.get('e');
      expect(e?.metadata.nullable).toBe(true);
      expect(e?.metadata.zodChain?.presence).toBe('.nullable()');
    });

    it('captures a literal .default() on an enum-typed property', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({ e: z.enum(['a', 'b']).default('a') });
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      const e = component.schema.properties?.get('e');
      expect(e?.metadata.default).toBe('a');
      expect(e?.metadata.zodChain?.defaults).toEqual(['.default("a")']);
    });
  });
});
