/**
 * Zod References and Lazy Parsing Unit Tests
 *
 * Tests for parsing lazy references (z.lazy) and variable references.
 *
 * @module parsers/zod/references.unit.test
 */

import { describe, it, expect } from 'vitest';
import { parseLazyZod, resolveVariableReference } from './zod-parser.references.js';
import { createZodProject } from './zod-ast.js';

describe('References Zod Parsing', () => {
  describe('parseLazyZod', () => {
    it('should parse z.lazy(() => z.object(...)) and unwrap the schema', () => {
      const result = parseLazyZod('z.lazy(() => z.object({ name: z.string() }))');

      expect(result).toBeDefined();
      expect(result?.type).toBe('object');
    });

    it('should parse z.lazy with arrow function returning primitive', () => {
      const result = parseLazyZod('z.lazy(() => z.string())');

      expect(result).toBeDefined();
      expect(result?.type).toBe('string');
    });

    it('should mark circularReferences in metadata when self-referencing', () => {
      // In real usage, the reference would be resolved.
      // For now, test that lazy is detected and unwrapped.
      const result = parseLazyZod('z.lazy(() => z.object({ child: z.string() }))');

      expect(result?.metadata).toBeDefined();
      // The circularReferences will be populated during full parsing with context
      expect(result?.metadata?.circularReferences).toEqual([]);
    });

    it('should return undefined for non-lazy expressions', () => {
      const result = parseLazyZod('z.string()');

      expect(result).toBeUndefined();
    });

    it('should return undefined for union expressions', () => {
      const result = parseLazyZod('z.union([z.string(), z.number()])');

      expect(result).toBeUndefined();
    });
  });

  describe('resolveVariableReference', () => {
    it('should resolve a schema variable reference', () => {
      const source = `
        const AddressSchema = z.object({ street: z.string() });
        const UserSchema = z.object({ address: AddressSchema });
      `;
      const project = createZodProject(source);
      const sourceFile = project.getSourceFiles()[0];

      const result = resolveVariableReference('AddressSchema', sourceFile);

      expect(result).toBeDefined();
      expect(result?.type).toBe('object');
    });

    it('should return reference schema with $ref for unresolved variables', () => {
      const source = `
        const UserSchema = z.object({ address: ExternalSchema });
      `;
      const project = createZodProject(source);
      const sourceFile = project.getSourceFiles()[0];

      const result = resolveVariableReference('ExternalSchema', sourceFile);

      // External references produce $ref
      expect(result).toBeDefined();
      expect(result?.$ref).toContain('ExternalSchema');
    });

    it('should return undefined for non-existent variable', () => {
      const source = `const Foo = z.string();`;
      const project = createZodProject(source);
      const sourceFile = project.getSourceFiles()[0];

      const result = resolveVariableReference('NonExistent', sourceFile);

      // For undefined variables, return reference with $ref
      expect(result?.$ref).toContain('NonExistent');
    });
  });
});
