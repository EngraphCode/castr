/**
 * Fail-Fast Behavior Tests - Zod Writer
 *
 * PROVES that the Zod writer fails fast on unsupported patterns.
 * Per RULES.md: "Unsupported patterns MUST throw—Never fall back to z.unknown()"
 *
 * These tests verify the fail-fast principle is enforced.
 *
 * @module
 */

import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeZodSchema } from './index.js';
import type { CastrSchema } from '../../ir/schema.js';
import type { CastrSchemaContext } from '../../ir/context.js';

describe('Zod Writer Fail-Fast Behavior', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  /**
   * Helper to generate Zod output from a schema.
   * Used to verify fail-fast behavior when calling the writer.
   */
  function generate(context: CastrSchemaContext): string {
    const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });
    sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: 'test',
          initializer: writeZodSchema(context),
        },
      ],
    });
    return sourceFile.getVariableDeclarationOrThrow('test').getInitializerOrThrow().getText();
  }

  /**
   * Create a mock CastrSchema with test metadata.
   */
  function createMockSchema(type: CastrSchema['type'] = 'string'): CastrSchema {
    return {
      type,
      metadata: {
        required: true,
        nullable: false,
        zodChain: {
          presence: '',
          validations: [],
          defaults: [],
        },
        dependencyGraph: {
          references: [],
          referencedBy: [],
          depth: 0,
        },
        circularReferences: [],
      },
    };
  }

  function createComponentContext(schema: CastrSchema): CastrSchemaContext {
    return {
      contextType: 'component',
      name: 'TestSchema',
      schema,
      metadata: schema.metadata,
    };
  }

  function forceInvalidType(schema: CastrSchema, invalidType: string): void {
    Object.defineProperty(schema, 'type', {
      value: invalidType,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  // ============================================================================
  // Fail-Fast Tests - Unsupported Patterns MUST Throw
  // ============================================================================

  describe('unsupported schema types throw errors', () => {
    it('throws for unknown type string', () => {
      const schema = createMockSchema();
      forceInvalidType(schema, 'unknownType');
      const context = createComponentContext(schema);

      expect(() => generate(context)).toThrow(/Unsupported schema type/);
    });

    it('throws for invalid type that is not a primitive', () => {
      const schema = createMockSchema();
      forceInvalidType(schema, 'custom');
      const context = createComponentContext(schema);

      expect(() => generate(context)).toThrow(/Unsupported schema type/);
    });
  });

  // ============================================================================
  // Supported Patterns DO NOT Throw
  // ============================================================================

  describe('supported patterns do not throw', () => {
    it('does not throw for string type', () => {
      const schema = createMockSchema('string');
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toBe('z.string()');
    });

    it('does not throw for number type', () => {
      const schema = createMockSchema('number');
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toBe('z.number()');
    });

    it('does not throw for integer type', () => {
      const schema = createMockSchema('integer');
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toBe('z.int()');
    });

    it('does not throw for boolean type', () => {
      const schema = createMockSchema('boolean');
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toBe('z.boolean()');
    });

    it('does not throw for null type', () => {
      const schema = createMockSchema('null');
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toBe('z.null()');
    });

    it('does not throw for array type', () => {
      const schema = createMockSchema('array');
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toBe('z.array(z.unknown())');
    });

    it('does not throw for object type', () => {
      const schema = createMockSchema('object');
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toContain('z.object(');
    });
  });

  // ============================================================================
  // Edge Cases - No Silent Degradation
  // ============================================================================

  describe('no silent degradation to z.unknown()', () => {
    it('empty schema {} outputs z.unknown() (valid OAS 3.1 pattern)', () => {
      // Empty schema {} in OAS 3.1 means "any value"
      // This is an explicit case, NOT a fallback
      const schema: CastrSchema = {
        metadata: {
          required: true,
          nullable: false,
          zodChain: {
            presence: '',
            validations: [],
            defaults: [],
          },
          dependencyGraph: {
            references: [],
            referencedBy: [],
            depth: 0,
          },
          circularReferences: [],
        },
      };
      const context = createComponentContext(schema);

      // This is valid behavior - empty schema means any value
      expect(generate(context)).toBe('z.unknown()');
    });

    it('array without items outputs z.array(z.unknown())', () => {
      // Array without items schema - items are unknown
      const schema = createMockSchema('array');
      const context = createComponentContext(schema);

      // This is valid - array of unknown items
      expect(generate(context)).toBe('z.array(z.unknown())');
    });
  });
});
