/**
 * Zod 4 AST Utilities Tests
 *
 * Tests specifically for Zod 4 features (new primitives, namespaces).
 *
 * @module parsers/zod/ast.zod4.test
 */

import { describe, it, expect } from 'vitest';
import { createZodProject, getZodBaseMethod, isZodCall } from './zod-ast.js';
import type { CallExpression } from 'ts-morph';
import { Node } from 'ts-morph';

/**
 * Helper to extract initializer as CallExpression from Zod code.
 * Uses proper type narrowing to avoid `as any` casts.
 * Throws if AST structure is unexpected (fail-fast).
 */
function getCallExpression(code: string): CallExpression {
  const project = createZodProject(code);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    throw new Error('No source file created');
  }
  const varDecl = sourceFile.getVariableDeclarations()[0];
  if (!varDecl) {
    throw new Error('No variable declaration found');
  }
  const init = varDecl.getInitializerOrThrow();
  if (!Node.isCallExpression(init)) {
    throw new Error('Expected CallExpression');
  }
  return init;
}

describe('Zod 4 AST Utilities', () => {
  describe('Zod 4 Primitives', () => {
    it('should identify z.int()', () => {
      const init = getCallExpression('const x = z.int();');
      expect(getZodBaseMethod(init)).toBe('int');
    });

    it('should identify z.int32()', () => {
      const init = getCallExpression('const x = z.int32();');
      expect(getZodBaseMethod(init)).toBe('int32');
    });

    it('should identify z.int64()', () => {
      const init = getCallExpression('const x = z.int64();');
      expect(getZodBaseMethod(init)).toBe('int64');
    });

    it('should identify z.float32()', () => {
      const init = getCallExpression('const x = z.float32();');
      expect(getZodBaseMethod(init)).toBe('float32');
    });
  });

  describe('Zod 4 Namespaces (z.iso.*)', () => {
    it('should identify z.iso.date()', () => {
      const init = getCallExpression('const x = z.iso.date();');
      expect(isZodCall(init)).toBe(true);
      expect(getZodBaseMethod(init)).toBe('iso.date');
    });

    it('should identify z.iso.datetime()', () => {
      const init = getCallExpression('const x = z.iso.datetime();');
      expect(isZodCall(init)).toBe(true);
      expect(getZodBaseMethod(init)).toBe('iso.datetime');
    });

    it('should identify z.iso.duration()', () => {
      const init = getCallExpression('const x = z.iso.duration();');
      expect(isZodCall(init)).toBe(true);
      expect(getZodBaseMethod(init)).toBe('iso.duration');
    });
  });

  describe('Zod 4 Format Functions', () => {
    it('should identify z.email()', () => {
      const init = getCallExpression('const x = z.email();');
      expect(getZodBaseMethod(init)).toBe('email');
    });

    it('should identify z.uuidv4()', () => {
      const init = getCallExpression('const x = z.uuidv4();');
      expect(getZodBaseMethod(init)).toBe('uuidv4');
    });
  });
});
