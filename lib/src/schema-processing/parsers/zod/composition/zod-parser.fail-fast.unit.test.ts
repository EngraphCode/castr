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
        export const S = z.union([z.string(), z.number()]).refine((value) => true);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.refine(');
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

  describe('intersections', () => {
    it('rejects z.intersection with an unrecognised member instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.intersection(z.string(), z.coerce.number());
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.coerce.number()');
      expect(result.errors[0]?.message).toContain('intersection member');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects an unrecognised right operand of .and() instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.string().and(z.coerce.number());
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.coerce.number()');
      expect(result.errors[0]?.message).toContain('intersection member');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects an unrecognised left operand of .and() instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.coerce.number().and(z.string());
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.coerce.number()');
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('rejects an unsupported chained method on z.intersection instead of dropping it', () => {
      const result = parseZodSource(`
        export const S = z.intersection(z.string(), z.number()).refine((value) => true);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.refine(');
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

    it('captures .optional() on an intersection-typed property', () => {
      const result = parseZodSource(`
        export const S = z.strictObject({
          i: z.intersection(z.strictObject({ a: z.string() }), z.strictObject({ b: z.number() })).optional(),
        });
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      const i = component.schema.properties?.get('i');
      expect(i?.metadata.required).toBe(false);
      expect(i?.metadata.zodChain?.presence).toBe('.optional()');
      expect(component.schema.required).not.toContain('i');
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

  describe('.describe() on composites is captured, not rejected', () => {
    it('captures .describe() on an array', () => {
      const result = parseZodSource(`
        export const S = z.array(z.string()).describe('An array of names');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.type).toBe('array');
      expect(component.schema.description).toBe('An array of names');
    });

    it('captures .describe() on a union', () => {
      const result = parseZodSource(`
        export const S = z.union([z.string(), z.number()]).describe('A described union');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.anyOf).toHaveLength(2);
      expect(component.schema.description).toBe('A described union');
    });

    it('captures .describe() on a tuple', () => {
      const result = parseZodSource(`
        export const S = z.tuple([z.string(), z.number()]).describe('A described tuple');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.prefixItems).toHaveLength(2);
      expect(component.schema.description).toBe('A described tuple');
    });

    it('captures .describe() on an enum', () => {
      const result = parseZodSource(`
        export const S = z.enum(['a', 'b']).describe('A described enum');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.enum).toEqual(['a', 'b']);
      expect(component.schema.description).toBe('A described enum');
    });

    it('captures .describe() on an intersection', () => {
      const result = parseZodSource(`
        export const S = z.intersection(
          z.strictObject({ a: z.string() }),
          z.strictObject({ b: z.number() }),
        ).describe('A described intersection');
      `);

      expect(result.errors).toHaveLength(0);
      const component = assertSchemaComponent(result.ir.components[0]);
      expect(component.schema.allOf).toHaveLength(2);
      expect(component.schema.description).toBe('A described intersection');
    });

    it('rejects a non-literal .describe() argument instead of dropping it', () => {
      const result = parseZodSource(`
        const dynamicDescription = 'computed';
        export const S = z.union([z.string(), z.number()]).describe(dynamicDescription);
      `);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('.describe(');
      expect(result.errors[0]?.location).toBeDefined();
    });
  });
});
