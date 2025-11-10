import { describe, it, expect } from 'vitest';
import { handleReferenceObject } from './handlers.core.js';
import type { ReferenceObject } from 'openapi3-ts/oas31';
import type { ZodCodeResult, CodeMetaData, ConversionTypeContext } from './index.js';

describe('handleReferenceObject', () => {
  it('should return schema name when reference is already registered', () => {
    // Arrange
    const schema: ReferenceObject = {
      $ref: '#/components/schemas/winner',
    };
    const code: ZodCodeResult = {
      code: '',
      schema,
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
          },
        },
      },
      zodSchemaByName: {
        winner: 'winner', // Already registered
      },
      refsPath: [],
    };
    const meta: CodeMetaData = { isRequired: true };
    const mockGetZodSchema = () => ({ code: 'winner', schema });

    // Act
    const result = handleReferenceObject(schema, code, ctx, [], meta, mockGetZodSchema);

    // Assert: should return the schema name, not empty code
    expect(result.code).toBe('winner');
    expect(result.code).not.toBe('');
  });

  it('should return schema name when registering new reference', () => {
    // Arrange
    const schema: ReferenceObject = {
      $ref: '#/components/schemas/board',
    };
    const code: ZodCodeResult = {
      code: '',
      schema,
    };
    const ctx: ConversionTypeContext = {
      doc: {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
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
      zodSchemaByName: {}, // Not yet registered
      refsPath: [],
    };
    const meta: CodeMetaData = { isRequired: true };
    const mockGetZodSchema = () => ({ code: 'z.array(z.array(mark))', schema });

    // Act
    const result = handleReferenceObject(schema, code, ctx, [], meta, mockGetZodSchema);

    // Assert: should return the schema name, not empty code
    expect(result.code).toBe('board');
    expect(result.code).not.toBe('');
    // And it should be registered
    expect(ctx.zodSchemaByName.board).toBeDefined();
  });

  it('should handle nested object properties with references', () => {
    // Arrange: This simulates the tictactoe status schema bug
    const statusRef: ReferenceObject = {
      $ref: '#/components/schemas/winner',
    };
    const code: ZodCodeResult = {
      code: '',
      schema: statusRef,
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
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'array',
                minItems: 3,
                maxItems: 3,
                items: {
                  $ref: '#/components/schemas/mark',
                },
              },
            },
            status: {
              type: 'object',
              properties: {
                winner: {
                  $ref: '#/components/schemas/winner',
                },
                board: {
                  $ref: '#/components/schemas/board',
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
    const meta: CodeMetaData = { isRequired: true };
    const mockGetZodSchema = () => ({ code: 'winner', schema: statusRef });

    // Act
    const result = handleReferenceObject(statusRef, code, ctx, [], meta, mockGetZodSchema);

    // Assert: when used as a property value, it should return the schema name
    // This is what buildPropertyZodCode expects to get back
    expect(result.code).toBe('winner');
    expect(result.code).not.toBe('');
  });
});

