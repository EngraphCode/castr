import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { writeZodSchema } from './index.js';
import type { CastrSchema, CastrSchemaContext } from '../../ir/index.js';
import { CastrSchemaProperties } from '../../ir/index.js';

describe('ZodWriter object unknown-key behaviour', () => {
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
    $ref?: string,
  ): CastrSchema {
    const schema: CastrSchema = {
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
    };
    if ($ref) {
      schema.$ref = $ref;
    }
    return schema;
  }

  function createComponentContext(schema: CastrSchema, name = 'TestComponent'): CastrSchemaContext {
    return {
      contextType: 'component',
      name,
      schema,
      metadata: schema.metadata,
    };
  }

  it('generates object schema', () => {
    const propSchema = createMockSchema('string');
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      prop1: propSchema,
    });
    schema.required = ['prop1'];

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.strictObject({ prop1: z.string() })');
  });

  it('generates object schema with optional property', () => {
    const propSchema = createMockSchema('string');
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      prop1: propSchema,
    });
    schema.required = [];

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.strictObject({ prop1: z.string().optional() })');
  });

  it('generates explicit strip object schema from unknownKeyBehavior', () => {
    const propSchema = createMockSchema('string');
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      prop1: propSchema,
    });
    schema.required = ['prop1'];
    schema.additionalProperties = true;
    schema.unknownKeyBehavior = { mode: 'strip' };

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.object({ prop1: z.string() }).strip()');
  });

  it('generates explicit strict object schema from unknownKeyBehavior using z.strictObject()', () => {
    const propSchema = createMockSchema('string');
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      prop1: propSchema,
    });
    schema.required = ['prop1'];
    schema.additionalProperties = false;
    schema.unknownKeyBehavior = { mode: 'strict' };

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.strictObject({ prop1: z.string() })');
  });

  it('generates explicit passthrough object schema from unknownKeyBehavior', () => {
    const propSchema = createMockSchema('string');
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      prop1: propSchema,
    });
    schema.required = ['prop1'];
    schema.additionalProperties = true;
    schema.unknownKeyBehavior = { mode: 'passthrough' };

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.object({ prop1: z.string() }).passthrough()');
  });

  it('generates explicit catchall object schema from unknownKeyBehavior', () => {
    const propSchema = createMockSchema('string');
    const catchallSchema = createMockSchema('string');
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      prop1: propSchema,
    });
    schema.required = ['prop1'];
    schema.additionalProperties = catchallSchema;
    schema.unknownKeyBehavior = {
      mode: 'catchall',
      schema: catchallSchema,
    };

    const context = createComponentContext(schema);
    expect(generate(context)).toBe('z.object({ prop1: z.string() }).catchall(z.string())');
  });

  it('generates getter syntax for circular reference properties', () => {
    const childSchema = createMockSchema('array', {
      circularReferences: ['#/components/schemas/Node'],
    });
    childSchema.items = createMockSchema(undefined, {}, '#/components/schemas/Node');

    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      value: createMockSchema('string'),
      children: childSchema,
    });
    schema.required = ['value'];

    const context = createComponentContext(schema);
    const result = generate(context);

    expect(result).toContain('get children()');
    expect(result).toContain('return z.array(Node)');
    expect(result).not.toContain('z.lazy');
  });

  it('generates getter syntax with .optional() for optional recursive refs', () => {
    const leftSchema = createMockSchema(
      undefined,
      { required: false },
      '#/components/schemas/TreeNode',
    );
    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/TreeNode'],
    });
    schema.properties = new CastrSchemaProperties({
      value: createMockSchema('number'),
      left: leftSchema,
    });
    schema.required = ['value'];

    const context = createComponentContext(schema);
    const result = generate(context);

    expect(result).toContain('get left()');
    expect(result).toContain('return TreeNode.optional()');
  });

  it('generates getter syntax with .nullable() for nullable recursive refs', () => {
    const nextSchema = createMockSchema(undefined);
    nextSchema.anyOf = [
      createMockSchema(undefined, {}, '#/components/schemas/LinkedListNode'),
      createMockSchema('null'),
    ];

    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/LinkedListNode'],
    });
    schema.properties = new CastrSchemaProperties({
      data: createMockSchema('string'),
      next: nextSchema,
    });
    schema.required = ['data', 'next'];

    const context = createComponentContext(schema);
    const result = generate(context);

    expect(result).toContain('get next()');
    expect(result).toContain('return LinkedListNode.nullable()');
  });

  it('generates getter syntax with .nullish() for optional nullable recursive refs', () => {
    const nextSchema = createMockSchema(undefined, { required: false });
    nextSchema.anyOf = [
      createMockSchema(undefined, {}, '#/components/schemas/MaybeLinkedListNode'),
      createMockSchema('null'),
    ];

    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/MaybeLinkedListNode'],
    });
    schema.properties = new CastrSchemaProperties({
      data: createMockSchema('string'),
      next: nextSchema,
    });
    schema.required = ['data'];

    const context = createComponentContext(schema);
    const result = generate(context);

    expect(result).toContain('get next()');
    expect(result).toContain('return MaybeLinkedListNode.nullish()');
  });

  it('throws for recursive passthrough object schemas', () => {
    const childSchema = createMockSchema('array', {
      circularReferences: ['#/components/schemas/Node'],
    });
    childSchema.items = createMockSchema(undefined, {}, '#/components/schemas/Node');

    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/Node'],
    });
    schema.properties = new CastrSchemaProperties({
      value: createMockSchema('string'),
      children: childSchema,
    });
    schema.required = ['value'];
    schema.additionalProperties = true;
    schema.unknownKeyBehavior = { mode: 'passthrough' };

    const context = createComponentContext(schema);

    expect(() => generate(context)).toThrow(
      /Recursive object schemas with unknown-key behavior "passthrough" cannot yet be emitted safely in Zod/,
    );
  });

  it('omits explicit .strip() for recursive strip object schemas', () => {
    const childSchema = createMockSchema('array', {
      circularReferences: ['#/components/schemas/Node'],
    });
    childSchema.items = createMockSchema(undefined, {}, '#/components/schemas/Node');

    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/Node'],
    });
    schema.properties = new CastrSchemaProperties({
      value: createMockSchema('string'),
      children: childSchema,
    });
    schema.required = ['value', 'children'];
    schema.additionalProperties = true;
    schema.unknownKeyBehavior = { mode: 'strip' };

    const context = createComponentContext(schema);

    expect(generate(context)).toBe(
      'z.object({ get children() { return z.array(Node); }, value: z.string() })',
    );
  });

  it('uses z.strictObject() for recursive strict object schemas', () => {
    const childSchema = createMockSchema('array', {
      circularReferences: ['#/components/schemas/Node'],
    });
    childSchema.items = createMockSchema(undefined, {}, '#/components/schemas/Node');

    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/Node'],
    });
    schema.properties = new CastrSchemaProperties({
      value: createMockSchema('string'),
      children: childSchema,
    });
    schema.required = ['value', 'children'];
    schema.additionalProperties = false;
    schema.unknownKeyBehavior = { mode: 'strict' };

    const context = createComponentContext(schema, 'Node');

    expect(generate(context)).toBe(
      'z.strictObject({ get children() { return z.array(Node); }, value: z.string() })',
    );
  });

  it('throws for recursive catchall object schemas', () => {
    const childSchema = createMockSchema('array', {
      circularReferences: ['#/components/schemas/Node'],
    });
    childSchema.items = createMockSchema(undefined, {}, '#/components/schemas/Node');

    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/Node'],
    });
    schema.properties = new CastrSchemaProperties({
      value: createMockSchema('string'),
      children: childSchema,
    });
    schema.required = ['value'];
    schema.additionalProperties = createMockSchema('string');
    schema.unknownKeyBehavior = {
      mode: 'catchall',
      schema: createMockSchema('string'),
    };

    const context = createComponentContext(schema);

    expect(() => generate(context)).toThrow(
      /Recursive object schemas with unknown-key behavior "catchall" cannot yet be emitted safely in Zod/,
    );
  });

  it('throws when catchall itself references the recursive object', () => {
    const catchallSchema = createMockSchema(undefined, {}, '#/components/schemas/Node');
    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/Node'],
    });
    schema.properties = new CastrSchemaProperties({
      value: createMockSchema('string'),
    });
    schema.required = ['value'];
    schema.additionalProperties = catchallSchema;
    schema.unknownKeyBehavior = {
      mode: 'catchall',
      schema: catchallSchema,
    };

    const context = createComponentContext(schema);

    expect(() => generate(context)).toThrow(
      /Recursive object schemas with unknown-key behavior "catchall" cannot yet be emitted safely in Zod/,
    );
  });

  it('preserves passthrough on wrappers around separately recursive child schemas', () => {
    const childSchema = createMockSchema('array', {
      circularReferences: ['#/components/schemas/RecursiveNode'],
    });
    childSchema.items = createMockSchema(undefined, {}, '#/components/schemas/RecursiveNode');

    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      child: childSchema,
      value: createMockSchema('string'),
    });
    schema.required = ['child', 'value'];
    schema.additionalProperties = true;
    schema.unknownKeyBehavior = { mode: 'passthrough' };

    const context = createComponentContext(schema);
    const output = generate(context);

    expect(output).toContain('.passthrough()');
  });

  it('throws for child-marked recursive passthrough object schemas when the component ref matches', () => {
    const childSchema = createMockSchema('array', {
      circularReferences: ['#/components/schemas/Node'],
    });
    childSchema.items = createMockSchema(undefined, {}, '#/components/schemas/Node');

    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      children: childSchema,
      value: createMockSchema('string'),
    });
    schema.required = ['children', 'value'];
    schema.additionalProperties = true;
    schema.unknownKeyBehavior = { mode: 'passthrough' };

    const context = createComponentContext(schema, 'Node');

    expect(() => generate(context)).toThrow(
      /Recursive object schemas with unknown-key behavior "passthrough" cannot yet be emitted safely in Zod/,
    );
  });

  it('throws for recursive portable additionalProperties true without explicit unknownKeyBehavior', () => {
    const childSchema = createMockSchema('array', {
      circularReferences: ['#/components/schemas/Node'],
    });
    childSchema.items = createMockSchema(undefined, {}, '#/components/schemas/Node');

    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/Node'],
    });
    schema.properties = new CastrSchemaProperties({
      children: childSchema,
      value: createMockSchema('string'),
    });
    schema.required = ['children', 'value'];
    schema.additionalProperties = true;

    const context = createComponentContext(schema, 'Node');

    expect(() => generate(context)).toThrow(
      /Recursive object schemas with additionalProperties: true and no explicit unknown-key behavior cannot be emitted safely in Zod/,
    );
  });

  it('throws for recursive portable catchall schemas without explicit unknownKeyBehavior', () => {
    const catchallSchema = createMockSchema(undefined, {}, '#/components/schemas/Node');
    const schema = createMockSchema('object', {
      circularReferences: ['#/components/schemas/Node'],
    });
    schema.properties = new CastrSchemaProperties({
      value: createMockSchema('string'),
    });
    schema.required = ['value'];
    schema.additionalProperties = catchallSchema;

    const context = createComponentContext(schema, 'Node');

    expect(() => generate(context)).toThrow(
      /Recursive object schemas with unknown-key behavior "catchall" cannot yet be emitted safely in Zod/,
    );
  });
});
