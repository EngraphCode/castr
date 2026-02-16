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
      const { sourceFile } = createZodProject('const x = 1;');

      expect(sourceFile).toBeDefined();
    });
  });

  describe('isZodCall', () => {
    it('should identify z.string() as a Zod call', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string();',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      expect(init).toBeDefined();
      if (!init) {
        throw new Error('Expected init');
      }
      expect(Node.isCallExpression(init)).toBe(true);
      expect(isZodCall(init, resolver)).toBe(true);
    });

    it('should identify chained z.string().min(1) as a Zod call', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string().min(1);',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      if (!init) {
        throw new Error('Expected init');
      }
      expect(isZodCall(init, resolver)).toBe(true);
    });

    it('should not identify non-Zod calls', () => {
      const { sourceFile, resolver } = createZodProject('const x = foo.bar();');
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      if (!init) {
        throw new Error('Expected init');
      }
      expect(isZodCall(init, resolver)).toBe(false);
    });
  });

  describe('getZodBaseMethod', () => {
    it('should extract base method from z.string()', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string();',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const baseMethod = getZodBaseMethod(init as Parameters<typeof getZodBaseMethod>[0], resolver);
      expect(baseMethod).toBe('string');
    });

    it('should extract base method from chained z.string().min(1)', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string().min(1);',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const baseMethod = getZodBaseMethod(init as Parameters<typeof getZodBaseMethod>[0], resolver);
      expect(baseMethod).toBe('string');
    });

    it('should extract base method from z.object()', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.object({ name: z.string() });',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const baseMethod = getZodBaseMethod(init as Parameters<typeof getZodBaseMethod>[0], resolver);
      expect(baseMethod).toBe('object');
    });
  });

  describe('getZodMethodChain', () => {
    it('should extract chain from z.string() (no chain)', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string();',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const chain = getZodMethodChain(init as Parameters<typeof getZodMethodChain>[0], resolver);

      expect(chain?.baseMethod).toBe('string');
      expect(chain?.chainedMethods).toHaveLength(0);
    });

    it('should extract chain from z.string().min(1)', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string().min(1);',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const chain = getZodMethodChain(init as Parameters<typeof getZodMethodChain>[0], resolver);

      expect(chain?.baseMethod).toBe('string');
      expect(chain?.chainedMethods).toHaveLength(1);
      expect(chain?.chainedMethods[0]?.name).toBe('min');
      expect(chain?.chainedMethods[0]?.args[0]).toBe(1);
    });

    it('should extract chain from z.string().min(1).max(100).email()', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string().min(1).max(100).email();',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const chain = getZodMethodChain(init as Parameters<typeof getZodMethodChain>[0], resolver);

      expect(chain?.baseMethod).toBe('string');
      expect(chain?.chainedMethods).toHaveLength(3);
      expect(chain?.chainedMethods[0]?.name).toBe('min');
      expect(chain?.chainedMethods[1]?.name).toBe('max');
      expect(chain?.chainedMethods[2]?.name).toBe('email');
    });

    it('should extract optional() method', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string().optional();',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const chain = getZodMethodChain(init as Parameters<typeof getZodMethodChain>[0], resolver);

      expect(chain?.chainedMethods).toHaveLength(1);
      expect(chain?.chainedMethods[0]?.name).toBe('optional');
    });
  });

  describe('findZodSchemaDeclarations', () => {
    it('should find schema declarations', () => {
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const UserSchema = z.object({ name: z.string() });
        const notASchema = "hello";
      `);
      const declarations = findZodSchemaDeclarations(sourceFile, resolver);

      expect(declarations).toHaveLength(1);
      expect(declarations[0]?.name).toBe('UserSchema');
    });

    it('should find multiple schema declarations', () => {
      const { sourceFile, resolver } = createZodProject(`
        import { z } from 'zod';
        const NameSchema = z.string().min(1);
        const AgeSchema = z.number().int();
        const UserSchema = z.object({ name: NameSchema, age: AgeSchema });
      `);
      const declarations = findZodSchemaDeclarations(sourceFile, resolver);

      expect(declarations).toHaveLength(3);
    });
  });

  describe('extractObjectProperties', () => {
    it('should extract properties from z.object()', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.object({ name: z.string(), age: z.number() });',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const props = extractObjectProperties(
        init as Parameters<typeof extractObjectProperties>[0],
        resolver,
      );

      expect(props?.size).toBe(2);
      expect(props?.has('name')).toBe(true);
      expect(props?.has('age')).toBe(true);
    });

    it('should return undefined for non-object schemas', () => {
      const { sourceFile, resolver } = createZodProject(
        'import { z } from "zod"; const x = z.string();',
      );
      const varDecl = sourceFile.getVariableDeclarations()[0];
      const init = varDecl?.getInitializer();

      const props = extractObjectProperties(
        init as Parameters<typeof extractObjectProperties>[0],
        resolver,
      );

      expect(props).toBeUndefined();
    });
  });
});
