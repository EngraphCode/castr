/**
 * Semantic Output Tests - Zod Writer
 *
 * PROVES that the Zod writer produces semantic .refine() output for
 * JSON Schema 2020-12 keywords that have no native Zod equivalent.
 *
 * Per the Input-Output Pair Compatibility Model: Zod CAN express these
 * keywords via .refine() runtime validation closures. Fail-fast was
 * an implementation gap, not a genuine impossibility.
 *
 * @module
 */

import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeZodSchema } from './index.js';
import type { CastrSchema, CastrSchemaContext } from '../../ir/index.js';

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
  // Fail-Fast Tests - Truly Unsupported Patterns MUST Throw
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
      expect(generate(context)).toContain('z.strictObject(');
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

  // ============================================================================
  // patternProperties / propertyNames — semantic .refine() output
  // ============================================================================

  describe('patternProperties and propertyNames semantic output', () => {
    it('emits .refine() for object schema with patternProperties', () => {
      const schema = createMockSchema('object');
      schema.patternProperties = {
        '^x-': createMockSchema('string'),
      };
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('patternProperties');
    });

    it('emits .refine() for object schema with propertyNames', () => {
      const schema = createMockSchema('object');
      schema.propertyNames = createMockSchema('string');
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('propertyNames');
    });
  });

  // ============================================================================
  // 2020-12 keywords — semantic .refine() output
  // ============================================================================

  describe('2020-12 object keywords semantic output', () => {
    it('emits .refine() for dependentSchemas', () => {
      const schema = createMockSchema('object');
      schema.dependentSchemas = { role: createMockSchema('object') };
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('dependentSchemas');
    });

    it('emits .refine() for dependentRequired', () => {
      const schema = createMockSchema('object');
      schema.dependentRequired = { email: ['emailVerified'] };
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('dependentRequired');
    });

    it('emits .refine() for schema-valued unevaluatedProperties', () => {
      const schema = createMockSchema('object');
      schema.unevaluatedProperties = createMockSchema('string');
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('unevaluatedProperties');
    });

    it('does NOT emit .refine() for boolean unevaluatedProperties', () => {
      const schema = createMockSchema('object');
      schema.unevaluatedProperties = false;
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).not.toContain('unevaluatedProperties');
    });
  });

  describe('2020-12 array keywords semantic output', () => {
    it('emits z.tuple() for prefixItems', () => {
      const schema = createMockSchema('array');
      schema.prefixItems = [createMockSchema('string'), createMockSchema('number')];
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toBe('z.tuple([z.string(), z.number()])');
    });

    it('emits .refine() for unevaluatedItems', () => {
      const schema = createMockSchema('array');
      schema.unevaluatedItems = false;
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('unevaluatedItems');
    });

    it('emits .refine() for minContains with contains', () => {
      const schema = createMockSchema('array');
      schema.contains = createMockSchema('string');
      schema.minContains = 2;
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('contains');
    });

    it('emits .refine() for maxContains with contains', () => {
      const schema = createMockSchema('array');
      schema.contains = createMockSchema('string');
      schema.maxContains = 5;
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('contains');
    });

    it('emits .refine() for contains', () => {
      const schema = createMockSchema('array');
      schema.contains = createMockSchema('string');
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('contains');
    });
  });
  describe('boolean schema handling', () => {
    it('emits z.never() for boolean schema false', () => {
      const schema: CastrSchema = {
        booleanSchema: false,
        metadata: {
          required: true,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      };
      const context = createComponentContext(schema);

      expect(generate(context)).toBe('z.never()');
    });

    it('emits z.any() for boolean schema true (accept-everything)', () => {
      const schema: CastrSchema = {
        booleanSchema: true,
        metadata: {
          required: true,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      };
      const context = createComponentContext(schema);

      expect(generate(context)).toBe('z.any()');
    });
  });

  // ============================================================================
  // if/then/else conditional applicators — semantic .refine() output
  // ============================================================================

  describe('if/then/else conditional applicators semantic output', () => {
    it('emits .refine() for object schema with if keyword', () => {
      const schema = createMockSchema('object');
      schema.if = createMockSchema('string');
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('if/then/else');
    });

    it('emits .refine() for object schema with then keyword', () => {
      const schema = createMockSchema('object');
      schema.then = createMockSchema('string');
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('if/then/else');
    });

    it('emits .refine() for object schema with else keyword', () => {
      const schema = createMockSchema('object');
      schema.else = createMockSchema('number');
      const context = createComponentContext(schema);

      const output = generate(context);
      expect(output).toContain('.refine(');
      expect(output).toContain('if/then/else');
    });
  });

  // ============================================================================
  // Dynamic reference keywords — fail-fast for $dynamicRef/$dynamicAnchor
  // ============================================================================

  describe('dynamic reference keyword handling', () => {
    it('throws for schema with $dynamicRef', () => {
      const schema = createMockSchema('string');
      schema.$dynamicRef = '#node';
      const context = createComponentContext(schema);

      expect(() => generate(context)).toThrow(/\$dynamicRef/);
    });

    it('throws for schema with $dynamicAnchor', () => {
      const schema = createMockSchema('string');
      schema.$dynamicAnchor = 'node';
      const context = createComponentContext(schema);

      expect(() => generate(context)).toThrow(/\$dynamicAnchor/);
    });

    it('does NOT throw for schema with $anchor (reference marker only)', () => {
      const schema = createMockSchema('string');
      schema.$anchor = 'address';
      const context = createComponentContext(schema);

      expect(() => generate(context)).not.toThrow();
      expect(generate(context)).toBe('z.string()');
    });
  });
});
