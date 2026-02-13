/**
 * Zod Parser Entry Point Tests
 *
 * Integration tests for the main parseZodSource function.
 *
 * @module parsers/zod/integration.test
 */

import { describe, it, expect } from 'vitest';
import { parseZodSource, extractSchemaName } from './zod-parser.js';

describe('Zod Parser Integration', () => {
  describe('extractSchemaName', () => {
    it('should extract name from UserSchema variable', () => {
      expect(extractSchemaName('UserSchema')).toBe('User');
    });

    it('should extract name from ProductSchema variable', () => {
      expect(extractSchemaName('ProductSchema')).toBe('Product');
    });

    it('should keep name when no Schema suffix', () => {
      expect(extractSchemaName('myThing')).toBe('myThing');
    });

    it('should handle lowercase schema suffix', () => {
      expect(extractSchemaName('userSchema')).toBe('user');
    });

    it('should handle just "Schema"', () => {
      expect(extractSchemaName('Schema')).toBe('Schema');
    });
  });

  describe('parseZodSource', () => {
    it('should parse source with single schema', () => {
      const source = `
        const UserSchema = z.object({ name: z.string() });
      `;
      const result = parseZodSource(source);

      expect(result.errors).toHaveLength(0);
      expect(result.ir.components).toHaveLength(1);

      const component = result.ir.components.at(0);
      expect(component?.type).toBe('schema');
      expect(component?.name).toBe('User');
    });

    it('should parse source with multiple schemas', () => {
      const source = `
        const UserSchema = z.object({ name: z.string() });
        const ProductSchema = z.object({ price: z.number() });
      `;
      const result = parseZodSource(source);

      expect(result.errors).toHaveLength(0);
      expect(result.ir.components).toHaveLength(2);
    });

    it('should generate recommendations for schemas missing .describe()', () => {
      const source = `
        const UserSchema = z.object({ name: z.string() });
      `;
      const result = parseZodSource(source);

      // Should recommend adding description
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.at(0)?.field).toBe('description');
    });

    it('should return errors for Zod 3 syntax', () => {
      const source = `
        const UserSchema = z.string().nonempty();
      `;
      const result = parseZodSource(source);

      expect(result.errors).toHaveLength(1);
      expect(result.errors.at(0)?.code).toBe('ZOD3_SYNTAX');
    });

    it('should return errors for dynamic schemas', () => {
      const source = `
        const key = 'name';
        const UserSchema = z.object({ [key]: z.string() });
      `;
      const result = parseZodSource(source);

      expect(result.errors.some((e: { code: string }) => e.code === 'DYNAMIC_SCHEMA')).toBe(true);
    });

    it('should return empty IR for invalid source', () => {
      const source = `
        not valid javascript
      `;
      const result = parseZodSource(source);

      // Should still return valid result structure
      expect(result.ir).toBeDefined();
      expect(result.ir.components).toEqual([]);
    });

    it('should handle primitive schema declarations', () => {
      const source = `
        const EmailSchema = z.string();
      `;
      const result = parseZodSource(source);

      expect(result.errors).toHaveLength(0);
      expect(result.ir.components).toHaveLength(1);
      const component = result.ir.components.at(0);
      expect(component?.name).toBe('Email');
    });
  });
});
