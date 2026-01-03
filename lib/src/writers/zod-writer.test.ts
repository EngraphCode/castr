import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeZodSchema } from './zod-writer.js';
import type { CastrSchema } from '../context/ir-schema.js';
import { CastrSchemaProperties } from '../context/ir-schema-properties.js';
import type { CastrSchemaContext } from '../context/ir-context.js';

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
});
