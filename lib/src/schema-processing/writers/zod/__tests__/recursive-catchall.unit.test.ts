import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeZodSchema } from '../index.js';
import type { CastrSchema, CastrSchemaContext } from '../../../ir/index.js';
import { CastrSchemaProperties } from '../../../ir/index.js';

describe('Zod Writer Recursive Catchall Fail Fast', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  function generate(context: CastrSchemaContext): string {
    const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });
    sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name: 'test', initializer: writeZodSchema(context) }],
    });
    return sourceFile.getVariableDeclarationOrThrow('test').getInitializerOrThrow().getText();
  }

  function createMockSchema(type: CastrSchema['type'] = 'string'): CastrSchema {
    return {
      type,
      metadata: {
        required: true,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };
  }

  function createNamedComponentContext(schema: CastrSchema, name = 'Node'): CastrSchemaContext {
    return {
      contextType: 'component',
      name,
      schema,
      metadata: schema.metadata,
    };
  }

  it('throws for nested property recursive catchall schemas', () => {
    const schema = createMockSchema('object');
    schema.properties = new CastrSchemaProperties({
      child: {
        type: 'object',
        properties: new CastrSchemaProperties({}),
        additionalProperties: {
          $ref: '#/components/schemas/Node',
          metadata: {
            required: true,
            nullable: false,
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: ['#/components/schemas/Node'],
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
        metadata: {
          required: true,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      },
    });

    expect(() => generate(createNamedComponentContext(schema))).toThrow(
      /explicit additionalProperties/,
    );
  });

  it('throws for composition-member recursive catchall schemas', () => {
    const schema = createMockSchema('object');
    schema.anyOf = [
      {
        type: 'object',
        properties: new CastrSchemaProperties({}),
        additionalProperties: {
          $ref: '#/components/schemas/Node',
          metadata: {
            required: true,
            nullable: false,
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: ['#/components/schemas/Node'],
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
        metadata: {
          required: true,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      },
    ];

    expect(() => generate(createNamedComponentContext(schema))).toThrow(
      /explicit additionalProperties/,
    );
  });

  it('throws for prefixItems-driven recursive catchall schemas', () => {
    const schema = createMockSchema('object');
    schema.metadata = {
      required: true,
      nullable: false,
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: ['#/components/schemas/Node'],
      zodChain: { presence: '', validations: [], defaults: [] },
    };
    schema.additionalProperties = {
      type: 'array',
      prefixItems: [
        {
          $ref: '#/components/schemas/Node',
          metadata: {
            required: true,
            nullable: false,
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: ['#/components/schemas/Node'],
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
      ],
      metadata: {
        required: true,
        nullable: false,
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };

    expect(() => generate(createNamedComponentContext(schema))).toThrow(
      /explicit additionalProperties/,
    );
  });

  it('throws for direct self-referential catchall refs', () => {
    const schema = createMockSchema('object');
    schema.metadata = {
      required: true,
      nullable: false,
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: ['#/components/schemas/Node'],
      zodChain: { presence: '', validations: [], defaults: [] },
    };
    schema.additionalProperties = {
      $ref: '#/components/schemas/Node',
      metadata: {
        required: true,
        nullable: false,
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };

    expect(() => generate(createNamedComponentContext(schema))).toThrow(
      /explicit additionalProperties/,
    );
  });

  it('throws for catchall object recursion reachable only through properties', () => {
    const schema = createMockSchema('object');
    schema.metadata = {
      required: true,
      nullable: false,
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: ['#/components/schemas/Node'],
      zodChain: { presence: '', validations: [], defaults: [] },
    };
    schema.additionalProperties = {
      type: 'object',
      properties: new CastrSchemaProperties({
        child: {
          $ref: '#/components/schemas/Node',
          metadata: {
            required: true,
            nullable: false,
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: ['#/components/schemas/Node'],
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
      }),
      metadata: {
        required: true,
        nullable: false,
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };

    expect(() => generate(createNamedComponentContext(schema))).toThrow(
      /explicit additionalProperties/,
    );
  });
});
