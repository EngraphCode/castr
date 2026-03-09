/**
 * Zod Parser Entry Point Tests
 *
 * Integration tests for the main parseZodSource function.
 *
 * @module parsers/zod/integration.test
 */

import { describe, it, expect } from 'vitest';
import { parseZodSource, extractSchemaName } from './zod-parser.js';
import { assertSchemaComponent } from '../../ir/index.js';

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

    it('should return parse errors for unsupported declarations with source context', () => {
      const source = `
        const BrokenSchema = z.promise(z.string());
      `;
      const result = parseZodSource(source);

      const parseError = result.errors.find((e: { code: string }) => e.code === 'PARSE_ERROR');
      expect(parseError).toBeDefined();
      expect(parseError?.message).toContain('BrokenSchema');
      expect(parseError?.location).toBeDefined();
      expect(parseError?.location?.line).toBeGreaterThan(0);
      expect(parseError?.location?.column).toBeGreaterThan(0);
    });

    it('should reject z.undefined() declarations with location and guidance', () => {
      const source = `
        const UndefinedSchema = z.undefined();
      `;
      const result = parseZodSource(source);

      expect(result.ir.components).toHaveLength(0);

      const parseError = result.errors.find((e: { code: string }) => e.code === 'PARSE_ERROR');
      expect(parseError).toBeDefined();
      expect(parseError?.message).toContain('UndefinedSchema');
      expect(parseError?.message).toContain('z.undefined() is not representable');
      expect(parseError?.message).toContain('Use .optional() on the parent field or parameter');
      expect(parseError?.location).toBeDefined();
      expect(parseError?.location?.line).toBeGreaterThan(0);
      expect(parseError?.location?.column).toBeGreaterThan(0);
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

    it('should parse identifier-rooted .and() declarations emitted by the writer', () => {
      const source = `
        const NewPet = z.object({ name: z.string() });
        const Pet = NewPet.and(z.object({ id: z.number() }));
      `;
      const result = parseZodSource(source);

      expect(result.errors).toHaveLength(0);
      expect(result.ir.components).toHaveLength(2);

      const names = result.ir.components.map((component) => component.name);
      expect(names).toContain('NewPet');
      expect(names).toContain('Pet');

      const petComponent = result.ir.components.find((component) => component.name === 'Pet');
      if (!petComponent || petComponent.type !== 'schema') {
        throw new Error('Expected Pet schema component');
      }

      expect(petComponent.schema.allOf).toHaveLength(2);
      expect(petComponent.schema.allOf?.[0]?.$ref).toBe('#/components/schemas/NewPet');
    });

    it('preserves recursive optional, nullable, and nullish getter wrappers in the first IR', () => {
      const source = `
        import { z } from 'zod';

        export const TreeNodeSchema = z.object({
          value: z.number(),
          get left() {
            return TreeNodeSchema.optional();
          },
          get right() {
            return TreeNodeSchema.optional();
          },
        });

        export const LinkedListNodeSchema = z.object({
          data: z.string(),
          get next() {
            return LinkedListNodeSchema.nullable();
          },
        });

        export const MaybeLinkedListNodeSchema = z.object({
          data: z.string(),
          get next() {
            return MaybeLinkedListNodeSchema.nullish();
          },
        });
      `;

      const result = parseZodSource(source);

      expect(result.errors).toHaveLength(0);

      const treeComponent = result.ir.components.find((component) => component.name === 'TreeNode');
      const treeSchema = assertSchemaComponent(treeComponent).schema;
      expect(treeSchema.properties?.get('left')?.$ref).toBe('#/components/schemas/TreeNode');
      expect(treeSchema.properties?.get('left')?.metadata.required).toBe(false);
      expect(treeSchema.properties?.get('right')?.$ref).toBe('#/components/schemas/TreeNode');
      expect(treeSchema.properties?.get('right')?.metadata.required).toBe(false);

      const listComponent = result.ir.components.find(
        (component) => component.name === 'LinkedListNode',
      );
      const listSchema = assertSchemaComponent(listComponent).schema;
      const nextSchema = listSchema.properties?.get('next');
      expect(nextSchema?.metadata.required).toBe(true);
      expect(nextSchema?.anyOf).toHaveLength(2);
      expect(nextSchema?.anyOf?.[0]?.$ref).toBe('#/components/schemas/LinkedListNode');
      expect(nextSchema?.anyOf?.[1]?.type).toBe('null');

      const maybeListComponent = result.ir.components.find(
        (component) => component.name === 'MaybeLinkedListNode',
      );
      const maybeListSchema = assertSchemaComponent(maybeListComponent).schema;
      const maybeNextSchema = maybeListSchema.properties?.get('next');
      expect(maybeNextSchema?.metadata.required).toBe(false);
      expect(maybeNextSchema?.anyOf).toHaveLength(2);
      expect(maybeNextSchema?.anyOf?.[0]?.$ref).toBe('#/components/schemas/MaybeLinkedListNode');
      expect(maybeNextSchema?.anyOf?.[1]?.type).toBe('null');
    });
  });
});
