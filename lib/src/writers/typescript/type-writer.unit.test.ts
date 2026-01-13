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
});
