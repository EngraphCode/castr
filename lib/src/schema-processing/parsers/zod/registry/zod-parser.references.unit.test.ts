/**
 * Zod Reference Parser Tests
 *
 * TDD for References (Identifiers) and Recursion (z.lazy).
 *
 * @module parsers/zod/references.test
 */

import { describe, it, expect } from 'vitest';
import { parseZodSchemaFromNode } from '../zod-parser.core.js';
import { createZodProject } from '../ast/zod-ast.js';
// Side-effect imports to register all parsers for core dispatcher
import '../types/zod-parser.primitives.js';
import '../types/zod-parser.object.js';
import './zod-parser.references.js';

// Helper to get nodes
function getNode(code: string) {
  const { sourceFile, resolver } = createZodProject(code);
  const varDecl = sourceFile.getVariableDeclarations()[0];
  if (!varDecl) {
    throw new Error('No variable declaration');
  }
  return { node: varDecl.getInitializerOrThrow(), resolver };
}

describe('Zod Reference Parsing', () => {
  describe('Identifiers (References)', () => {
    it('should parse an Identifier as a $ref', () => {
      // Code: const MySchema = z.string(); const Result = MySchema;
      // We parse 'MySchema' identifier.
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const MySchema = z.string();
        const Result = MySchema; 
      `);
      const resultNode = sourceFile.getVariableDeclaration('Result')?.getInitializer();

      expect(resultNode).toBeDefined();
      if (resultNode) {
        // We need core dispatcher to delegate to reference parser for Identifier
        const result = parseZodSchemaFromNode(resultNode, resolver);
        // Parser must use the derived component name (suffix-stripped) for the $ref
        // to match how components are registered in the IR
        expect(result).toMatchObject({
          $ref: '#/components/schemas/My',
        });
      }
    });

    it('parses identifier-rooted .optional() wrappers as optional refs', () => {
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const TreeNodeSchema = z.object({ value: z.number() });
        const Result = TreeNodeSchema.optional();
      `);
      const resultNode = sourceFile.getVariableDeclaration('Result')?.getInitializer();

      expect(resultNode).toBeDefined();
      if (resultNode) {
        const result = parseZodSchemaFromNode(resultNode, resolver);

        expect(result).toMatchObject({
          $ref: '#/components/schemas/TreeNode',
        });
        expect(result?.metadata.required).toBe(false);
      }
    });

    it('parses identifier-rooted .nullable() wrappers as nullable ref compositions', () => {
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const LinkedListNodeSchema = z.object({ data: z.string() });
        const Result = LinkedListNodeSchema.nullable();
      `);
      const resultNode = sourceFile.getVariableDeclaration('Result')?.getInitializer();

      expect(resultNode).toBeDefined();
      if (resultNode) {
        const result = parseZodSchemaFromNode(resultNode, resolver);

        expect(result?.anyOf).toHaveLength(2);
        expect(result?.anyOf?.[0]?.$ref).toBe('#/components/schemas/LinkedListNode');
        expect(result?.anyOf?.[1]?.type).toBe('null');
        expect(result?.metadata.required).toBe(true);
      }
    });

    it('parses identifier-rooted .nullish() wrappers as optional nullable ref compositions', () => {
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const LinkedListNodeSchema = z.object({ data: z.string() });
        const Result = LinkedListNodeSchema.nullish();
      `);
      const resultNode = sourceFile.getVariableDeclaration('Result')?.getInitializer();

      expect(resultNode).toBeDefined();
      if (resultNode) {
        const result = parseZodSchemaFromNode(resultNode, resolver);

        expect(result?.anyOf).toHaveLength(2);
        expect(result?.anyOf?.[0]?.$ref).toBe('#/components/schemas/LinkedListNode');
        expect(result?.anyOf?.[1]?.type).toBe('null');
        expect(result?.metadata.required).toBe(false);
      }
    });

    it('parses chained identifier-rooted wrapper calls accepted from canonical writer output', () => {
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const TreeNodeSchema = z.object({ value: z.number() });
        const Result = TreeNodeSchema.optional().nullable();
      `);
      const resultNode = sourceFile.getVariableDeclaration('Result')?.getInitializer();

      expect(resultNode).toBeDefined();
      if (resultNode) {
        const result = parseZodSchemaFromNode(resultNode, resolver);

        expect(result?.anyOf).toHaveLength(2);
        expect(result?.anyOf?.[0]?.$ref).toBe('#/components/schemas/TreeNode');
        expect(result?.anyOf?.[1]?.type).toBe('null');
        expect(result?.metadata.required).toBe(false);
      }
    });
  });

  describe('Recursion (z.lazy)', () => {
    it('should parse z.lazy(() => Schema)', () => {
      const { node, resolver } = getNode('const Recursive = z.lazy(() => z.string())');
      // We expect lazy to be resolved to the inner schema effectively,
      // OR wrapped if we want to preserve lazy semantics?
      // OpenAPI doesn't have "lazy", it relies on $ref recursion.
      // So z.lazy(() => z.string()) is effectively z.string() (unless it's recursive ref).

      const result = parseZodSchemaFromNode(node, resolver);
      expect(result).toMatchObject({
        type: 'string',
      });
    });

    it('should parse z.lazy(() => Identifier)', () => {
      // const User = z.lazy(() => UserSchema);
      // This mimics recursive structure.
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const UserSchema = z.string(); // Dummy for AST resolution
        const Recursive = z.lazy(() => UserSchema);
      `);
      const node = sourceFile.getVariableDeclaration('Recursive')?.getInitializer();

      if (node) {
        const result = parseZodSchemaFromNode(node, resolver);
        // Parser must use the derived component name (suffix-stripped) for the $ref
        expect(result).toMatchObject({
          $ref: '#/components/schemas/User',
        });
      }
    });
  });

  describe('declaration proof', () => {
    it('does not promote a non-Zod identifier to $ref', () => {
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const notASchema = 42;
        const Result = notASchema;
      `);
      const resultNode = sourceFile.getVariableDeclaration('Result')?.getInitializer();

      expect(resultNode).toBeDefined();
      if (resultNode) {
        const result = parseZodSchemaFromNode(resultNode, resolver);
        // Should NOT generate a $ref for a non-Zod value
        expect(result?.$ref).toBeUndefined();
      }
    });

    it('still promotes a valid Zod schema identifier to $ref', () => {
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const UserSchema = z.strictObject({ name: z.string() });
        const Result = UserSchema;
      `);
      const resultNode = sourceFile.getVariableDeclaration('Result')?.getInitializer();

      expect(resultNode).toBeDefined();
      if (resultNode) {
        const result = parseZodSchemaFromNode(resultNode, resolver);
        expect(result?.$ref).toBe('#/components/schemas/User');
      }
    });
  });
});
