import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeTypeDefinition } from './type-writer.js';
import type { CastrSchema } from '../../ir/index.js';
import { CastrSchemaProperties } from '../../ir/index.js';

function createSchemaMetadata(required: boolean): CastrSchema['metadata'] {
  return {
    required,
    nullable: false,
    circularReferences: [],
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    zodChain: { presence: '', validations: [], defaults: [] },
  };
}

describe('TypeWriter determinism', () => {
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

  it('emits identical object type text for different property insertion orders', () => {
    const schemaWithZebraFirst: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        zebra: { type: 'string', metadata: createSchemaMetadata(true) },
        alpha: { type: 'number', metadata: createSchemaMetadata(true) },
      }),
      metadata: createSchemaMetadata(true),
    };

    const schemaWithAlphaFirst: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        alpha: { type: 'number', metadata: createSchemaMetadata(true) },
        zebra: { type: 'string', metadata: createSchemaMetadata(true) },
      }),
      metadata: createSchemaMetadata(true),
    };

    expect(generate(schemaWithZebraFirst)).toBe(generate(schemaWithAlphaFirst));
    expect(generate(schemaWithZebraFirst)).toBe('{ alpha: number; zebra: string; }');
  });

  it('keeps quoted keys, optional flags, and JSDoc deterministic across permutations', () => {
    const schemaWithReverseOrder: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        'zeta-key': {
          type: 'number',
          description: 'Zeta docs',
          metadata: createSchemaMetadata(false),
        },
        alpha: {
          type: 'string',
          metadata: createSchemaMetadata(true),
        },
        'beta-key': {
          type: 'boolean',
          description: 'Beta docs',
          metadata: createSchemaMetadata(true),
        },
      }),
      metadata: createSchemaMetadata(true),
    };

    const schemaWithCanonicalOrder: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        alpha: {
          type: 'string',
          metadata: createSchemaMetadata(true),
        },
        'beta-key': {
          type: 'boolean',
          description: 'Beta docs',
          metadata: createSchemaMetadata(true),
        },
        'zeta-key': {
          type: 'number',
          description: 'Zeta docs',
          metadata: createSchemaMetadata(false),
        },
      }),
      metadata: createSchemaMetadata(true),
    };

    const expected =
      "{ alpha: string; /** Beta docs */ 'beta-key': boolean; /** Zeta docs */ 'zeta-key'?: number; }";

    expect(generate(schemaWithReverseOrder)).toBe(generate(schemaWithCanonicalOrder));
    expect(generate(schemaWithReverseOrder)).toBe(expected);
  });
});
