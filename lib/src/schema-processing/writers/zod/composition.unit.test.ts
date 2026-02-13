/**
 * Unit tests for Zod composition schema generation.
 *
 * Tests the generation of:
 * - z.xor() for oneOf (exclusive union)
 * - z.discriminatedUnion() for oneOf + discriminator
 * - z.union() for anyOf (inclusive union)
 *
 * @module writers/zod/composition.unit.test
 */

import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import type { CastrSchema } from '../../ir/schema.js';
import type { CastrSchemaContext } from '../../ir/context.js';
import { writeZodSchema } from './index.js';

describe('ZodCompositionWriter', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  function generateComposition(context: CastrSchemaContext): string {
    const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });
    sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: 'schema',
          initializer: writeZodSchema(context),
        },
      ],
    });
    return sourceFile
      .getVariableDeclarationOrThrow('schema')
      .getInitializerOrThrow()
      .getText()
      .replace(/\s+/g, ' ')
      .replace(/, }/g, ' }');
  }

  function createMockSchema(overrides: Partial<CastrSchema> = {}): CastrSchema {
    return {
      type: 'object',
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
      ...overrides,
    } as CastrSchema;
  }

  function createComponentContext(schema: CastrSchema): CastrSchemaContext {
    return {
      contextType: 'component',
      name: 'TestComponent',
      schema,
      metadata: schema.metadata,
    };
  }

  describe('oneOf → z.xor()', () => {
    it('generates z.xor() for oneOf with multiple schemas', () => {
      const schema = createMockSchema({
        oneOf: [createMockSchema({ type: 'string' }), createMockSchema({ type: 'number' })],
      });
      const result = generateComposition(createComponentContext(schema));
      expect(result).toContain('z.xor([z.string(), z.number()])');
    });

    it('generates single schema directly for oneOf with one schema', () => {
      const schema = createMockSchema({
        oneOf: [createMockSchema({ type: 'string' })],
      });
      const result = generateComposition(createComponentContext(schema));
      expect(result).toBe('z.string()');
    });

    it('generates z.never() for empty oneOf', () => {
      const schema = createMockSchema({ oneOf: [] });
      const result = generateComposition(createComponentContext(schema));
      expect(result).toBe('z.never()');
    });
  });

  describe('oneOf + discriminator → z.discriminatedUnion()', () => {
    it('generates z.discriminatedUnion() when discriminator is present', () => {
      const schema = createMockSchema({
        oneOf: [createMockSchema({ type: 'object' }), createMockSchema({ type: 'object' })],
        discriminator: { propertyName: 'type' },
      });
      const result = generateComposition(createComponentContext(schema));
      expect(result).toContain('z.discriminatedUnion("type",');
    });

    it('uses discriminator propertyName in output', () => {
      const schema = createMockSchema({
        oneOf: [createMockSchema({ type: 'object' }), createMockSchema({ type: 'object' })],
        discriminator: { propertyName: 'petType' },
      });
      const result = generateComposition(createComponentContext(schema));
      expect(result).toContain('"petType"');
    });

    it('falls back to z.xor() when no discriminator is present', () => {
      const schema = createMockSchema({
        oneOf: [createMockSchema({ type: 'string' }), createMockSchema({ type: 'number' })],
        // No discriminator - should use z.xor()
      });
      const result = generateComposition(createComponentContext(schema));
      expect(result).toContain('z.xor(');
    });
  });

  describe('anyOf → z.union()', () => {
    it('generates z.union() for anyOf with multiple schemas', () => {
      const schema = createMockSchema({
        anyOf: [createMockSchema({ type: 'string' }), createMockSchema({ type: 'number' })],
      });
      const result = generateComposition(createComponentContext(schema));
      expect(result).toContain('z.union([z.string(), z.number()])');
    });

    it('generates single schema directly for anyOf with one schema', () => {
      const schema = createMockSchema({
        anyOf: [createMockSchema({ type: 'boolean' })],
      });
      const result = generateComposition(createComponentContext(schema));
      expect(result).toBe('z.boolean()');
    });
  });
});
