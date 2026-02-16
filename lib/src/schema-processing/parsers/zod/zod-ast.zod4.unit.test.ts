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
import type { ZodImportResolver } from './zod-import-resolver.js';

/**
 * Helper to extract initializer as CallExpression from Zod code.
 * Uses proper type narrowing to avoid `as any` casts.
 * Throws if AST structure is unexpected (fail-fast).
 */
function getCallExpression(code: string): { init: CallExpression; resolver: ZodImportResolver } {
  const { sourceFile, resolver } = createZodProject(code);
  const varDecl = sourceFile.getVariableDeclarations()[0];
  if (!varDecl) {
    throw new Error('No variable declaration found');
  }
  const init = varDecl.getInitializerOrThrow();
  if (!Node.isCallExpression(init)) {
    throw new Error('Expected CallExpression');
  }
  return { init, resolver };
}

describe('Zod 4 AST Utilities', () => {
  describe('Zod 4 Primitives', () => {
    it('should identify z.int()', () => {
      const { init, resolver } = getCallExpression('const x = z.int();');
      expect(getZodBaseMethod(init, resolver)).toBe('int');
    });

    it('should identify z.int32()', () => {
      const { init, resolver } = getCallExpression('const x = z.int32();');
      expect(getZodBaseMethod(init, resolver)).toBe('int32');
    });

    it('should identify z.int64()', () => {
      const { init, resolver } = getCallExpression('const x = z.int64();');
      expect(getZodBaseMethod(init, resolver)).toBe('int64');
    });

    it('should identify z.float32()', () => {
      const { init, resolver } = getCallExpression('const x = z.float32();');
      expect(getZodBaseMethod(init, resolver)).toBe('float32');
    });
  });

  describe('Zod 4 Namespaces (z.iso.*)', () => {
    it('should identify z.iso.date()', () => {
      const { init, resolver } = getCallExpression('const x = z.iso.date();');
      expect(isZodCall(init, resolver)).toBe(true);
      expect(getZodBaseMethod(init, resolver)).toBe('iso.date');
    });

    it('should identify z.iso.datetime()', () => {
      const { init, resolver } = getCallExpression('const x = z.iso.datetime();');
      expect(isZodCall(init, resolver)).toBe(true);
      expect(getZodBaseMethod(init, resolver)).toBe('iso.datetime');
    });

    it('should identify z.iso.duration()', () => {
      const { init, resolver } = getCallExpression('const x = z.iso.duration();');
      expect(isZodCall(init, resolver)).toBe(true);
      expect(getZodBaseMethod(init, resolver)).toBe('iso.duration');
    });
  });

  describe('Zod 4 Format Functions', () => {
    it('should identify z.email()', () => {
      const { init, resolver } = getCallExpression('const x = z.email();');
      expect(getZodBaseMethod(init, resolver)).toBe('email');
    });

    it('should identify z.uuidv4()', () => {
      const { init, resolver } = getCallExpression('const x = z.uuidv4();');
      expect(getZodBaseMethod(init, resolver)).toBe('uuidv4');
    });
  });
});
