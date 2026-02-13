import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeTypeDefinition } from './type-writer.js';
import type { CastrSchema } from '../../ir/schema.js';
import { CastrSchemaProperties } from '../../ir/schema-properties.js';

describe('TypeWriter', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  function generate(schema: CastrSchema): string {
    const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });
    sourceFile.addTypeAlias({
      name: 'TestType',
      type: writeTypeDefinition(schema),
    });
    return sourceFile
      .getTypeAliasOrThrow('TestType')
      .getTypeNodeOrThrow()
      .getText()
      .replace(/\s+/g, ' ')
      .replace(/, }/g, ' }');
  }

  it('generates string type', () => {
    const schema: CastrSchema = {
      type: 'string',
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(generate(schema)).toBe('string');
  });

  it('generates number type', () => {
    const schema: CastrSchema = {
      type: 'number',
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(generate(schema)).toBe('number');
  });

  it('generates boolean type', () => {
    const schema: CastrSchema = {
      type: 'boolean',
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(generate(schema)).toBe('boolean');
  });

  it('generates array type', () => {
    const schema: CastrSchema = {
      type: 'array',
      items: {
        type: 'string',
        metadata: {
          required: true,
          nullable: false,
          circularReferences: [],
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      },
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(generate(schema)).toBe('string[]');
  });

  it('generates object type', () => {
    const schema: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        prop1: {
          type: 'string',
          metadata: {
            required: true,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
      }),
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(generate(schema)).toBe('{ prop1: string; }');
  });

  it('generates nullable type', () => {
    const schema: CastrSchema = {
      type: 'string',
      metadata: {
        required: true,
        nullable: true,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(generate(schema)).toBe('string | null');
  });

  it('generates object type with JSDoc', () => {
    const schema: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        prop1: {
          type: 'string',
          description: 'Property description',
          metadata: {
            required: true,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
      }),
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(generate(schema)).toBe('{ /** Property description */ prop1: string; }');
  });

  describe('Composition Types', () => {
    it('generates intersection type for allOf', () => {
      const schema: CastrSchema = {
        allOf: [
          {
            type: 'object',
            properties: new CastrSchemaProperties({
              name: {
                type: 'string',
                metadata: {
                  required: true,
                  nullable: false,
                  circularReferences: [],
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  zodChain: { presence: '', validations: [], defaults: [] },
                },
              },
            }),
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
          {
            type: 'object',
            properties: new CastrSchemaProperties({
              id: {
                type: 'number',
                metadata: {
                  required: true,
                  nullable: false,
                  circularReferences: [],
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  zodChain: { presence: '', validations: [], defaults: [] },
                },
              },
            }),
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
        ],
        metadata: {
          required: true,
          nullable: false,
          circularReferences: [],
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      };
      expect(generate(schema)).toBe('{ name: string; } & { id: number; }');
    });

    it('generates intersection with schema references', () => {
      const schema: CastrSchema = {
        allOf: [
          {
            $ref: '#/components/schemas/Base',
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
          {
            type: 'object',
            properties: new CastrSchemaProperties({
              extra: {
                type: 'string',
                metadata: {
                  required: true,
                  nullable: false,
                  circularReferences: [],
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  zodChain: { presence: '', validations: [], defaults: [] },
                },
              },
            }),
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
        ],
        metadata: {
          required: true,
          nullable: false,
          circularReferences: [],
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      };
      expect(generate(schema)).toBe('Base & { extra: string; }');
    });

    it('generates union type for oneOf', () => {
      const schema: CastrSchema = {
        oneOf: [
          {
            type: 'string',
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
          {
            type: 'number',
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
        ],
        metadata: {
          required: true,
          nullable: false,
          circularReferences: [],
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      };
      expect(generate(schema)).toBe('string | number');
    });

    it('generates union type for anyOf', () => {
      const schema: CastrSchema = {
        anyOf: [
          {
            type: 'boolean',
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
          {
            type: 'null',
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
        ],
        metadata: {
          required: true,
          nullable: false,
          circularReferences: [],
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      };
      expect(generate(schema)).toBe('boolean | null');
    });

    it('generates nested composition with correct precedence', () => {
      const schema: CastrSchema = {
        allOf: [
          {
            type: 'object',
            properties: new CastrSchemaProperties({
              base: {
                type: 'string',
                metadata: {
                  required: true,
                  nullable: false,
                  circularReferences: [],
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  zodChain: { presence: '', validations: [], defaults: [] },
                },
              },
            }),
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
          {
            oneOf: [
              {
                type: 'object',
                properties: new CastrSchemaProperties({
                  a: {
                    type: 'number',
                    metadata: {
                      required: true,
                      nullable: false,
                      circularReferences: [],
                      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                      zodChain: { presence: '', validations: [], defaults: [] },
                    },
                  },
                }),
                metadata: {
                  required: true,
                  nullable: false,
                  circularReferences: [],
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  zodChain: { presence: '', validations: [], defaults: [] },
                },
              },
              {
                type: 'object',
                properties: new CastrSchemaProperties({
                  b: {
                    type: 'boolean',
                    metadata: {
                      required: true,
                      nullable: false,
                      circularReferences: [],
                      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                      zodChain: { presence: '', validations: [], defaults: [] },
                    },
                  },
                }),
                metadata: {
                  required: true,
                  nullable: false,
                  circularReferences: [],
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  zodChain: { presence: '', validations: [], defaults: [] },
                },
              },
            ],
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
        ],
        metadata: {
          required: true,
          nullable: false,
          circularReferences: [],
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      };
      // Union inside intersection needs parentheses for correct precedence
      expect(generate(schema)).toBe('{ base: string; } & ({ a: number; } | { b: boolean; })');
    });
  });
});
