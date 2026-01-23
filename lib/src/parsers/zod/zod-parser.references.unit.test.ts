/**
 * Zod Reference Parser Tests
 *
 * TDD for References (Identifiers) and Recursion (z.lazy).
 *
 * @module parsers/zod/references.test
 */

import { describe, it, expect } from 'vitest';
import { parseZodSchemaFromNode } from './zod-parser.core.js';
import { createZodProject } from './zod-ast.js';
// Side-effect imports to register all parsers for core dispatcher
import './zod-parser.primitives.js';
import './zod-parser.object.js';
import './zod-parser.references.js';

// Helper to get nodes
function getNode(code: string) {
  const project = createZodProject(code);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    throw new Error('No source file');
  }
  const varDecl = sourceFile.getVariableDeclarations()[0];
  if (!varDecl) {
    throw new Error('No variable declaration');
  }
  return varDecl.getInitializerOrThrow();
}

describe('Zod Reference Parsing', () => {
  describe('Identifiers (References)', () => {
    it('should parse an Identifier as a $ref', () => {
      // Code: const MySchema = z.string(); const Result = MySchema;
      // We parse 'MySchema' identifier.
      const project = createZodProject(`
        import { z } from 'zod';
        const MySchema = z.string();
        const Result = MySchema; 
      `);
      const sourceFile = project.getSourceFiles()[0];
      if (!sourceFile) {
        throw new Error('No source file');
      }
      const resultNode = sourceFile.getVariableDeclaration('Result')?.getInitializer();

      expect(resultNode).toBeDefined();
      if (resultNode) {
        // We need core dispatcher to delegate to reference parser for Identifier
        const result = parseZodSchemaFromNode(resultNode);
        expect(result).toMatchObject({
          $ref: '#/components/schemas/MySchema',
        });
      }
    });
  });

  describe('Recursion (z.lazy)', () => {
    it('should parse z.lazy(() => Schema)', () => {
      const node = getNode('const Recursive = z.lazy(() => z.string())');
      // We expect lazy to be resolved to the inner schema effectively,
      // OR wrapped if we want to preserve lazy semantics?
      // OpenAPI doesn't have "lazy", it relies on $ref recursion.
      // So z.lazy(() => z.string()) is effectively z.string() (unless it's recursive ref).

      const result = parseZodSchemaFromNode(node);
      expect(result).toMatchObject({
        type: 'string',
      });
    });

    it('should parse z.lazy(() => Identifier)', () => {
      // const User = z.lazy(() => UserSchema);
      // This mimics recursive structure.
      const project = createZodProject(`
        import { z } from 'zod';
        const UserSchema = z.string(); // Dummy for AST resolution
        const Recursive = z.lazy(() => UserSchema);
      `);
      const sourceFile = project.getSourceFiles()[0];
      if (!sourceFile) {
        throw new Error('No source file for z.lazy Identifier test');
      }
      const node = sourceFile.getVariableDeclaration('Recursive')?.getInitializer();

      if (node) {
        const result = parseZodSchemaFromNode(node);
        expect(result).toMatchObject({
          $ref: '#/components/schemas/UserSchema',
        });
      }
    });
  });
});
