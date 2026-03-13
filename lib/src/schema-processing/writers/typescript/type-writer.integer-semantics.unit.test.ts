import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeTypeDefinition } from './type-writer.js';
import {
  createMockCastrSchema,
  createMockCastrSchemaNode,
  type CastrSchema,
} from '../../ir/index.js';

describe('TypeWriter integer semantics', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  function createMetadata(nullable: boolean) {
    return createMockCastrSchemaNode({ required: true, nullable });
  }

  function generate(schema: CastrSchema): string {
    const sourceFile = project.createSourceFile('integer-semantics.ts', '', {
      overwrite: true,
    });
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

  it('generates bigint type for int64 semantics', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: 'integer',
          format: 'int64',
          integerSemantics: 'int64',
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('bigint');
  });

  it('generates bigint type for bigint semantics', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: 'integer',
          integerSemantics: 'bigint',
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('bigint');
  });

  it('generates nullable bigint type for nullable int64 carrier arrays', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: ['integer', 'null'],
          integerSemantics: 'int64',
          metadata: createMetadata(true),
        }),
      ),
    ).toBe('bigint | null');
  });

  it('preserves both number and bigint branches in mixed integer unions', () => {
    expect(
      generate(
        createMockCastrSchema({
          oneOf: [
            createMockCastrSchema({
              type: 'integer',
              format: 'int64',
              integerSemantics: 'int64',
              metadata: createMetadata(false),
            }),
            createMockCastrSchema({
              type: 'integer',
              metadata: createMetadata(false),
            }),
          ],
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('bigint | number');
  });
});
