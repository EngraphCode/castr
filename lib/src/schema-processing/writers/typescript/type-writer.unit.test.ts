import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeTypeDefinition } from './type-writer/index.js';
import type { CastrSchema } from '../../ir/index.js';
import { CastrSchemaProperties } from '../../ir/index.js';

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

describe('TypeWriter', () => {
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

  describe('Boolean Schemas', () => {
    it('generates never type for boolean schema false', () => {
      const schema: CastrSchema = {
        booleanSchema: false,
        metadata: {
          required: true,
          nullable: false,
          circularReferences: [],
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      };
      expect(generate(schema)).toBe('never');
    });

    it('generates unknown type for boolean schema true (accept-everything)', () => {
      const schema: CastrSchema = {
        booleanSchema: true,
        metadata: {
          required: true,
          nullable: false,
          circularReferences: [],
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
        },
      };
      expect(generate(schema)).toBe('unknown');
    });
  });
});

describe('Dependent Required — discriminated union output', () => {
  it('generates union for single trigger property', () => {
    const schema: CastrSchema = {
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
        email: {
          type: 'string',
          metadata: {
            required: false,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
        emailVerified: {
          type: 'boolean',
          metadata: {
            required: false,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
      }),
      dependentRequired: {
        email: ['emailVerified'],
      },
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    const result = generate(schema);
    // Must contain intersection of base object with discriminated union
    expect(result).toContain('email: string');
    expect(result).toContain('emailVerified: boolean');
    expect(result).toContain('email?: never');
  });

  it('generates intersected unions for multiple trigger properties', () => {
    const schema: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        email: {
          type: 'string',
          metadata: {
            required: false,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
        emailVerified: {
          type: 'boolean',
          metadata: {
            required: false,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
        phone: {
          type: 'string',
          metadata: {
            required: false,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
        phoneVerified: {
          type: 'boolean',
          metadata: {
            required: false,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
      }),
      dependentRequired: {
        email: ['emailVerified'],
        phone: ['phoneVerified'],
      },
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    const result = generate(schema);
    // Must contain two independent union groups intersected
    expect(result).toContain('email?: never');
    expect(result).toContain('phone?: never');
    expect(result).toContain('&');
  });
});

describe('Dependent Schemas — discriminated union output', () => {
  it('generates union with dependent schema intersection for single trigger', () => {
    const schema: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        creditCard: {
          type: 'string',
          metadata: {
            required: false,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
      }),
      dependentSchemas: {
        creditCard: {
          type: 'object',
          properties: new CastrSchemaProperties({
            billingAddress: {
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
      },
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    const result = generate(schema);
    // Must contain dependent schema properties in the "present" branch
    expect(result).toContain('billingAddress: string');
    expect(result).toContain('creditCard?: never');
  });
});

describe('Dynamic Reference Keywords — TypeScript fail-fast', () => {
  it('throws for schema with $dynamicRef', () => {
    const schema: CastrSchema = {
      type: 'string',
      $dynamicRef: '#node',
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(() => generate(schema)).toThrow(/\$dynamicRef/);
  });

  it('throws for schema with $dynamicAnchor', () => {
    const schema: CastrSchema = {
      type: 'string',
      $dynamicAnchor: 'node',
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(() => generate(schema)).toThrow(/\$dynamicAnchor/);
  });

  it('does NOT throw for schema with $anchor (reference marker only)', () => {
    const schema: CastrSchema = {
      type: 'string',
      $anchor: 'address',
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
    };
    expect(() => generate(schema)).not.toThrow();
    expect(generate(schema)).toBe('string');
  });
});
