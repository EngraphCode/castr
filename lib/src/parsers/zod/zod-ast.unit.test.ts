/**
 * Zod AST Utilities Tests
 *
 * @module parsers/zod/ast.test
 */

import { describe, it, expect } from 'vitest';
import {
  createZodProject,
  isZodCall,
  getZodBaseMethod,
  getZodMethodChain,
  findZodSchemaDeclarations,
  extractObjectProperties,
} from './zod-ast.js';
import { Node } from 'ts-morph';

describe('Zod AST Utilities', () => {
  describe('createZodProject', () => {
    it('should create a project from source code', () => {
      const project = createZodProject('const x = 1;');
      const files = project.getSourceFiles();

      expect(files).toHaveLength(1);
    });
  });

  describe('isZodCall', () => {
    it('should identify z.string() as a Zod call', () => {
      const project = createZodProject('const x = z.string();');
      const sourceFile = project.getSourceFiles()[0];
      const varDecl = sourceFile?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      expect(init).toBeDefined();
      expect(Node.isCallExpression(init!)).toBe(true);
      expect(isZodCall(init!)).toBe(true);
    });

    it('should identify chained z.string().min(1) as a Zod call', () => {
      const project = createZodProject('const x = z.string().min(1);');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      expect(isZodCall(init!)).toBe(true);
    });

    it('should not identify non-Zod calls', () => {
      const project = createZodProject('const x = foo.bar();');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      expect(isZodCall(init!)).toBe(false);
    });
  });

  describe('getZodBaseMethod', () => {
    it('should extract base method from z.string()', () => {
      const project = createZodProject('const x = z.string();');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const baseMethod = getZodBaseMethod(init as Parameters<typeof getZodBaseMethod>[0]);
      expect(baseMethod).toBe('string');
    });

    it('should extract base method from chained z.string().min(1)', () => {
      const project = createZodProject('const x = z.string().min(1);');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const baseMethod = getZodBaseMethod(init as Parameters<typeof getZodBaseMethod>[0]);
      expect(baseMethod).toBe('string');
    });

    it('should extract base method from z.object()', () => {
      const project = createZodProject('const x = z.object({ name: z.string() });');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const baseMethod = getZodBaseMethod(init as Parameters<typeof getZodBaseMethod>[0]);
      expect(baseMethod).toBe('object');
    });
  });

  describe('getZodMethodChain', () => {
    it('should extract chain from z.string() (no chain)', () => {
      const project = createZodProject('const x = z.string();');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const chain = getZodMethodChain(init as Parameters<typeof getZodMethodChain>[0]);

      expect(chain?.baseMethod).toBe('string');
      expect(chain?.chainedMethods).toHaveLength(0);
    });

    it('should extract chain from z.string().min(1)', () => {
      const project = createZodProject('const x = z.string().min(1);');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const chain = getZodMethodChain(init as Parameters<typeof getZodMethodChain>[0]);

      expect(chain?.baseMethod).toBe('string');
      expect(chain?.chainedMethods).toHaveLength(1);
      expect(chain?.chainedMethods[0]?.name).toBe('min');
      expect(chain?.chainedMethods[0]?.args[0]).toBe(1);
    });

    it('should extract chain from z.string().min(1).max(100).email()', () => {
      const project = createZodProject('const x = z.string().min(1).max(100).email();');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const chain = getZodMethodChain(init as Parameters<typeof getZodMethodChain>[0]);

      expect(chain?.baseMethod).toBe('string');
      expect(chain?.chainedMethods).toHaveLength(3);
      expect(chain?.chainedMethods[0]?.name).toBe('min');
      expect(chain?.chainedMethods[1]?.name).toBe('max');
      expect(chain?.chainedMethods[2]?.name).toBe('email');
    });

    it('should extract optional() method', () => {
      const project = createZodProject('const x = z.string().optional();');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const chain = getZodMethodChain(init as Parameters<typeof getZodMethodChain>[0]);

      expect(chain?.chainedMethods).toHaveLength(1);
      expect(chain?.chainedMethods[0]?.name).toBe('optional');
    });
  });

  describe('findZodSchemaDeclarations', () => {
    it('should find schema declarations', () => {
      const project = createZodProject(`
        const UserSchema = z.object({ name: z.string() });
        const notASchema = "hello";
      `);
      const sourceFile = project.getSourceFiles()[0];

      const declarations = findZodSchemaDeclarations(sourceFile!);

      expect(declarations).toHaveLength(1);
      expect(declarations[0]?.name).toBe('UserSchema');
    });

    it('should find multiple schema declarations', () => {
      const project = createZodProject(`
        const NameSchema = z.string().min(1);
        const AgeSchema = z.number().int();
        const UserSchema = z.object({ name: NameSchema, age: AgeSchema });
      `);
      const sourceFile = project.getSourceFiles()[0];

      const declarations = findZodSchemaDeclarations(sourceFile!);

      expect(declarations).toHaveLength(3);
    });
  });

  describe('extractObjectProperties', () => {
    it('should extract properties from z.object()', () => {
      const project = createZodProject(
        'const x = z.object({ name: z.string(), age: z.number() });',
      );
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const props = extractObjectProperties(init as Parameters<typeof extractObjectProperties>[0]);

      expect(props?.size).toBe(2);
      expect(props?.has('name')).toBe(true);
      expect(props?.has('age')).toBe(true);
    });

    it('should return undefined for non-object schemas', () => {
      const project = createZodProject('const x = z.string();');
      const varDecl = project.getSourceFiles()[0]?.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const props = extractObjectProperties(init as Parameters<typeof extractObjectProperties>[0]);

      expect(props).toBeUndefined();
    });
  });
});
