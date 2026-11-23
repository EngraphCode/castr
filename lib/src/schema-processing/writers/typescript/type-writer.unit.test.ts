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

  describe('const', () => {
    const metadata: CastrSchema['metadata'] = {
      required: true,
      nullable: false,
      circularReferences: [],
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      zodChain: { presence: '', validations: [], defaults: [] },
    };

    it.each([
      ['a string', 'all-years', '"all-years"'],
      ['a string that holds a quote', 'a"b', '"a\\"b"'],
      ['a number', 1.5, '1.5'],
      ['a boolean', false, 'false'],
      ['null', null, 'null'],
    ])('writes a const that is %s as a literal type', (_name, value, written) => {
      expect(generate({ type: undefined, const: value, metadata })).toBe(written);
    });

    it('writes the literal for a const beside its type', () => {
      expect(generate({ type: 'string', const: 'a', metadata })).toBe('"a"');
    });
  });

  describe('enum', () => {
    const metadata: CastrSchema['metadata'] = {
      required: true,
      nullable: false,
      circularReferences: [],
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      zodChain: { presence: '', validations: [], defaults: [] },
    };

    it('writes an enum of strings as the union of their literal types', () => {
      expect(generate({ type: 'string', enum: ['a', 'b'], metadata })).toBe('"a" | "b"');
    });

    it('writes an enum of one member as its literal type', () => {
      expect(generate({ type: 'string', enum: ['a'], metadata })).toBe('"a"');
    });

    it('writes an enum of mixed primitives as the union of their literal types', () => {
      expect(generate({ enum: ['a', 1, null, true], metadata })).toBe('"a" | 1 | null | true');
    });

    it('keeps every member of a union whose members are each an enum of one type', () => {
      const schema: CastrSchema = {
        anyOf: [
          { type: 'string', enum: ['a', 'b'], metadata },
          { type: 'string', enum: ['c'], metadata },
        ],
        metadata,
      };

      expect(generate(schema)).toBe('"a" | "b" | "c"');
    });

    it('refuses an enum with a member that is an object or an array', () => {
      expect(() => generate({ enum: [{ a: 1 }], metadata })).toThrow(/enum.*object or an array/);
    });

    it('keeps an enum whole as one member of an intersection', () => {
      const schema: CastrSchema = {
        allOf: [
          { type: 'string', enum: ['a', 'b'], metadata },
          { type: 'string', metadata },
        ],
        metadata,
      };

      expect(generate(schema)).toBe('("a" | "b") & string');
    });
  });

  describe('an array whose items are a union', () => {
    const metadata: CastrSchema['metadata'] = {
      required: true,
      nullable: false,
      circularReferences: [],
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      zodChain: { presence: '', validations: [], defaults: [] },
    };
    const arrayOf = (items: CastrSchema): CastrSchema => ({ type: 'array', items, metadata });

    it('keeps the union whole when the items are an anyOf', () => {
      const items: CastrSchema = {
        anyOf: [
          { type: 'string', metadata },
          { type: 'number', metadata },
        ],
        metadata,
      };

      expect(generate(arrayOf(items))).toBe('(string | number)[]');
    });

    it('keeps the union whole when the items may be null', () => {
      const items: CastrSchema = { type: 'string', metadata: { ...metadata, nullable: true } };

      expect(generate(arrayOf(items))).toBe('(string | null)[]');
    });

    it('keeps the union whole when the items are an enum', () => {
      expect(generate(arrayOf({ type: 'string', enum: ['a', 'b'], metadata }))).toBe(
        '("a" | "b")[]',
      );
    });

    it('writes no parentheses round items that are one type', () => {
      expect(generate(arrayOf({ type: 'string', metadata }))).toBe('string[]');
    });
  });

  describe('a schema-valued additionalProperties', () => {
    const metadata: CastrSchema['metadata'] = {
      required: true,
      nullable: false,
      circularReferences: [],
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      zodChain: { presence: '', validations: [], defaults: [] },
    };

    it('writes a constrained map as an index signature over string', () => {
      const schema: CastrSchema = {
        type: 'object',
        additionalProperties: { type: 'number', metadata },
        metadata,
      };

      expect(generate(schema)).toBe('{ [key: string]: number; }');
    });

    it('refuses a constrained map that also holds dependentRequired', () => {
      const schema: CastrSchema = {
        type: 'object',
        additionalProperties: { type: 'number', metadata },
        dependentRequired: { a: ['b'] },
        metadata,
      };

      expect(() => generate(schema)).toThrow(/dependentRequired beside a constrained map/);
    });

    it('writes nothing for a propertyNames that refuses no name', () => {
      const schema: CastrSchema = {
        type: 'object',
        additionalProperties: { type: 'number', metadata },
        propertyNames: { type: 'string', metadata },
        metadata,
      };

      expect(generate(schema)).toBe('{ [key: string]: number; }');
    });

    it('refuses a propertyNames that can refuse a name', () => {
      const schema: CastrSchema = {
        type: 'object',
        additionalProperties: false,
        propertyNames: { type: 'string', pattern: '^[a-z]+$', metadata },
        metadata,
      };

      expect(() => generate(schema)).toThrow(/propertyNames cannot be represented/);
    });

    it('refuses a schema-valued additionalProperties on an object that names a property', () => {
      const schema: CastrSchema = {
        type: 'object',
        properties: new CastrSchemaProperties({ a: { type: 'string', metadata } }),
        additionalProperties: { type: 'number', metadata },
        metadata,
      };

      expect(() => generate(schema)).toThrow(/outside that row/);
    });
  });
});
