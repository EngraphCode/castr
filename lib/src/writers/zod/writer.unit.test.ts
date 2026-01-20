import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import type { SchemaObjectType } from 'openapi3-ts/oas31';
import { writeZodSchema } from './index.js';
import type { CastrSchema } from '../../ir/schema.js';
import { CastrSchemaProperties } from '../../ir/schema-properties.js';
import type { CastrSchemaContext } from '../../ir/context.js';

describe('ZodWriter', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  function generate(context: CastrSchemaContext): string {
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

  function createMockSchema(
    type: CastrSchema['type'] = 'string',
    metadata: Partial<CastrSchema['metadata']> = {},
  ): CastrSchema {
    return {
      type,
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: {
          presence: '',
          validations: [],
          defaults: [],
        },
        ...metadata,
      },
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

  function createPropertyContext(schema: CastrSchema, optional: boolean): CastrSchemaContext {
    return {
      contextType: 'property',
      name: 'testProp',
      schema,
      optional,
    };
  }

  it('generates string schema', () => {
    const schema = createMockSchema('string');
    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.string()');
  });

  it('generates number schema', () => {
    const schema = createMockSchema('number');
    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.number()');
  });

  it('generates boolean schema', () => {
    const schema = createMockSchema('boolean');
    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.boolean()');
  });

  it('generates null schema (OAS 3.1)', () => {
    const schema = createMockSchema('null');
    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.null()');
  });

  it('generates z.literal() for const string value', () => {
    const schema = createMockSchema('string');
    schema.const = 'active';
    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.literal("active")');
  });

  it('generates z.literal() for const number value', () => {
    const schema = createMockSchema('number');
    schema.const = 42;
    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.literal(42)');
  });

  it('generates z.literal() for const boolean value', () => {
    const schema = createMockSchema('boolean');
    schema.const = true;
    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.literal(true)');
  });

  it('throws on unsupported schema type (fail-fast)', () => {
    const schema = createMockSchema('unsupported' as SchemaObjectType);
    const context = createComponentContext(schema);
    expect(() => generate(context)).toThrow(/Unsupported schema type/);
  });

  it('generates array schema', () => {
    const itemsSchema = createMockSchema('string');
    const schema = createMockSchema('array');
    schema.items = itemsSchema;

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.array(z.string())');
  });

  it('generates object schema', () => {
    const propSchema = createMockSchema('string');
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      prop1: propSchema,
    });
    schema.required = ['prop1']; // prop1 is required

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.object({ prop1: z.string() }).passthrough()');
  });

  it('generates object schema with optional property', () => {
    const propSchema = createMockSchema('string');
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      prop1: propSchema,
    });
    schema.required = []; // prop1 is optional

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.object({ prop1: z.string().optional() }).passthrough()');
  });

  it('generates schema with chains', () => {
    const schema = createMockSchema('string', {
      zodChain: {
        presence: '', // Presence should be ignored/overridden by context, but validations/defaults kept
        validations: ['.min(1)', '.email()'],
        defaults: ['.default("test")'],
      },
    });

    const context = createComponentContext(schema);
    // Component context is never optional
    expect(generate(context)).toBe('z.string().min(1).email().default("test")');
  });

  it('generates optional property with chains', () => {
    const schema = createMockSchema('string', {
      zodChain: {
        presence: '',
        validations: ['.min(1)'],
        defaults: [],
      },
    });

    const context = createPropertyContext(schema, true);
    // Property context with optional=true should have .optional()
    expect(generate(context)).toBe('z.string().min(1).optional()');
  });

  it('generates lazy schema for circular references', () => {
    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/Node'],
    });
    schema.properties = new CastrSchemaProperties({});

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.lazy(() => z.object({ }).passthrough())');
  });

  // ========== Metadata via .meta() tests (Zod 4) ==========

  describe('metadata via .meta()', () => {
    it('generates .meta() with description', () => {
      const schema = createMockSchema('string');
      schema.description = 'User email address';

      const context = createComponentContext(schema);
      expect(generate(context)).toBe('z.string().meta({"description":"User email address"})');
    });

    it('generates .meta() with deprecated flag', () => {
      const schema = createMockSchema('string');
      schema.deprecated = true;

      const context = createComponentContext(schema);
      expect(generate(context)).toBe('z.string().meta({"deprecated":true})');
    });

    it('generates .meta() with single example', () => {
      const schema = createMockSchema('string');
      schema.example = 'john@example.com';

      const context = createComponentContext(schema);
      expect(generate(context)).toBe('z.string().meta({"examples":["john@example.com"]})');
    });

    it('generates .meta() with examples array', () => {
      const schema = createMockSchema('string');
      schema.examples = ['john@example.com', 'jane@example.com'];

      const context = createComponentContext(schema);
      expect(generate(context)).toBe(
        'z.string().meta({"examples":["john@example.com","jane@example.com"]})',
      );
    });

    it('generates .meta() with title', () => {
      const schema = createMockSchema('object');
      schema.properties = new CastrSchemaProperties({});
      schema.title = 'UserSchema';

      const context = createComponentContext(schema);
      const expected = 'z.object({ }).passthrough().meta({"title":"UserSchema"})';
      expect(generate(context)).toBe(expected);
    });

    it('generates .meta() with externalDocs', () => {
      const schema = createMockSchema('string');
      schema.externalDocs = { url: 'https://docs.example.com/user' };

      const context = createComponentContext(schema);
      expect(generate(context)).toBe(
        'z.string().meta({"externalDocs":{"url":"https://docs.example.com/user"}})',
      );
    });

    it('generates .meta() with multiple metadata fields', () => {
      const schema = createMockSchema('string');
      schema.description = 'User email';
      schema.deprecated = true;
      schema.example = 'test@example.com';

      const context = createComponentContext(schema);
      // Multiple metadata fields should be combined in one .meta() call
      expect(generate(context)).toContain('.meta(');
      expect(generate(context)).toContain('"description":"User email"');
      expect(generate(context)).toContain('"deprecated":true');
    });

    it('does not generate .meta() when no metadata present', () => {
      const schema = createMockSchema('string');
      // No description, deprecated, example, etc.

      const context = createComponentContext(schema);
      expect(generate(context)).toBe('z.string()');
      expect(generate(context)).not.toContain('.meta(');
    });

    it('generates .meta() after chains', () => {
      const schema = createMockSchema('string', {
        zodChain: {
          presence: '',
          validations: ['.min(1)'],
          defaults: [],
        },
      });
      schema.description = 'Required string';

      const context = createComponentContext(schema);
      const expectedOutput = `z.string().min(1).meta({"description":"Required string"})`;
      expect(generate(context)).toBe(expectedOutput);
    });
  });
});
