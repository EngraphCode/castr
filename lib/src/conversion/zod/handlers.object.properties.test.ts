import { describe, it, expect } from 'vitest';
import { buildPropertyZodCode, buildPropertyEntry } from './handlers.object.properties.js';
import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import type { CodeMetaData, ConversionTypeContext } from './index.js';
import type { TemplateContext } from '../../context/template-context.types.js';

describe('buildPropertyZodCode', () => {
  it('should generate code for property with $ref', () => {
    // Arrange: property that references another schema
    const propSchema: ReferenceObject = {
      $ref: '#/components/schemas/winner',
    };
    const propActualSchema: SchemaObject = {
      type: 'string',
      enum: ['.', 'X', 'O'],
    };
    const propMetadata: CodeMetaData = {
      isRequired: true,
    };
    
    const mockGetZodSchema = ({ schema }: { schema: SchemaObject | ReferenceObject }) => {
      if ('$ref' in schema) {
        // For references, return the schema name
        const schemaName = schema.$ref.split('/').pop() || '';
        return { code: schemaName, schema };
      }
      return { code: 'z.string()', schema };
    };
    
    const mockGetZodChain = () => '';
    
    // Act
    const result = buildPropertyZodCode(
      propSchema,
      propActualSchema,
      propMetadata,
      undefined,
      mockGetZodSchema,
      mockGetZodChain,
      undefined,
    );
    
    // Assert: should return the schema name, not an empty string
    expect(result).toBe('winner');
    expect(result).not.toBe('');
  });

  it('should generate code for nested object with $ref properties', () => {
    // Arrange: status schema with properties referencing other schemas
    const statusSchema: SchemaObject = {
      type: 'object',
      properties: {
        winner: {
          $ref: '#/components/schemas/winner',
        },
        board: {
          $ref: '#/components/schemas/board',
        },
      },
    };

    const ctx: ConversionTypeContext = {
      doc: {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            winner: {
              type: 'string',
              enum: ['.', 'X', 'O'],
            },
            board: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/mark',
                },
              },
            },
            mark: {
              type: 'string',
              enum: ['.', 'X', 'O'],
            },
          },
        },
      },
      zodSchemaByName: {
        winner: 'winner',
        board: 'board',
      },
      refsPath: [],
    };

    const mockGetZodSchema = ({ schema }: { schema: SchemaObject | ReferenceObject }) => {
      if ('$ref' in schema) {
        const schemaName = schema.$ref.split('/').pop() || '';
        return { code: schemaName, schema };
      }
      return { code: 'z.unknown()', schema };
    };

    const mockGetZodChain = () => '';

    // Act: build property entries for winner and board
    const [winnerProp, winnerCode] = buildPropertyEntry(
      'winner',
      statusSchema.properties!.winner as ReferenceObject,
      statusSchema,
      ctx,
      { isRequired: true },
      false,
      false,
      mockGetZodSchema,
      mockGetZodChain,
      undefined,
    );

    const [boardProp, boardCode] = buildPropertyEntry(
      'board',
      statusSchema.properties!.board as ReferenceObject,
      statusSchema,
      ctx,
      { isRequired: true },
      false,
      false,
      mockGetZodSchema,
      mockGetZodChain,
      undefined,
    );

    // Assert: both properties should have valid code, not empty strings
    expect(winnerProp).toBe('winner');
    expect(winnerCode).toBe('winner');
    expect(winnerCode).not.toBe('');

    expect(boardProp).toBe('board');
    expect(boardCode).toBe('board');
    expect(boardCode).not.toBe('');
  });
});

