import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writeTypeDefinition } from './type-writer/index.js';
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

  it('preserves non-integer members of integer-semantics type arrays', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: ['string', 'integer'],
          integerSemantics: 'int64',
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('string | bigint');
  });

  it('preserves the null member of integer-semantics type arrays without nullable metadata', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: ['integer', 'null'],
          integerSemantics: 'int64',
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('bigint | null');
  });

  it('generates bigint literals for an int64 enum', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: 'integer',
          integerSemantics: 'int64',
          enum: [1, 2],
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('1n | 2n');
  });

  it('generates a bigint literal for a bigint-semantics const', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: 'integer',
          integerSemantics: 'bigint',
          const: 5,
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('5n');
  });

  it('generates bigint literals from the int64 format alone', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: 'integer',
          format: 'int64',
          enum: [1],
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('1n');
  });

  it('generates mixed literal unions with bigint literals for integer-semantics type arrays', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: ['string', 'integer'],
          integerSemantics: 'int64',
          enum: ['a', 1],
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('"a" | 1n');
  });

  it('keeps plain number literals when a type array also carries the number type', () => {
    expect(
      generate(
        createMockCastrSchema({
          type: ['number', 'integer'],
          integerSemantics: 'int64',
          enum: [1.5, 2],
          metadata: createMetadata(false),
        }),
      ),
    ).toBe('1.5 | 2');
  });

  it('throws for non-integer literal values under integer semantics', () => {
    expect(() =>
      generate(
        createMockCastrSchema({
          type: 'integer',
          integerSemantics: 'int64',
          enum: [1.5],
          metadata: createMetadata(false),
        }),
      ),
    ).toThrow(/Genuinely impossible/);
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
