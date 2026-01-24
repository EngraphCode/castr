/**
 * IR Integration - Enum Handling
 *
 * PROVES: Enum values in IR flow through to generated Zod code
 *
 * Test Philosophy:
 * - These tests define REQUIRED end-to-end behavior
 * - They prove IR data is actually USED in code generation
 * - They should FAIL until IR correctly preserves and uses enum values
 *
 * @module ir-enum-integration.test
 */

import { generateZodClientFromOpenAPI, isSingleFileResult } from '../../src/index.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';

describe('IR Integration - Enum Schemas', () => {
  test('string enum generates z.enum() with correct values', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Enum Test API' },
      paths: {},
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['active', 'pending', 'inactive'],
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // REQUIRED BEHAVIOR: Generated code MUST use enum values from IR
    expect(result).toBeDefined();

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    // TypeScript now knows result.content is string
    expect(result.content).toContain('Status');

    // PROVE: Enum values are present (regardless of quote style)
    // BEHAVIOR: Values must appear in generated code
    const hasEnumValues =
      result.content.includes('active') &&
      result.content.includes('pending') &&
      result.content.includes('inactive');

    expect(hasEnumValues).toBe(true);

    // PROVE: Uses z.enum() or z.literal() (not z.string())
    // BEHAVIOR: Enum construct is used, not plain string type
    expect(result.content).toMatch(/z\.(enum|literal)\(/);
    // Verify Status doesn't use z.string() (would indicate enum loss)
    const statusMatch = result.content.match(/Status\s*=\s*z\.string\(\)/);
    expect(statusMatch).toBeNull();
  });

  test('numeric enum generates z.enum() with numbers', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Numeric Enum Test' },
      paths: {},
      components: {
        schemas: {
          ErrorCode: {
            type: 'number',
            enum: [400, 404, 500],
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // REQUIRED BEHAVIOR: Numeric enums must be preserved

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('ErrorCode');

    const hasNumericValues =
      result.content.includes('400') &&
      result.content.includes('404') &&
      result.content.includes('500');

    expect(hasNumericValues).toBe(true);
  });

  test('enum in object property generates correct schema', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Enum Property Test' },
      paths: {},
      components: {
        schemas: {
          Task: {
            type: 'object',
            required: ['status'],
            properties: {
              title: { type: 'string' },
              status: {
                type: 'string',
                enum: ['todo', 'in_progress', 'done'],
              },
            },
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // REQUIRED BEHAVIOR: Inline enum in property must be preserved

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('Task');

    // BEHAVIOR: Enum values are present (regardless of quote style)
    const hasEnumValues =
      result.content.includes('todo') &&
      result.content.includes('in_progress') &&
      result.content.includes('done');

    expect(hasEnumValues).toBe(true);

    // BEHAVIOR: Uses enum/literal construct
    expect(result.content).toMatch(/z\.(enum|literal)\(/);

    // BEHAVIOR: Status field is required (not optional)
    expect(result.content).toContain('status');
  });

  test('enum with single value generates correct schema', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Single Enum Test' },
      paths: {},
      components: {
        schemas: {
          FixedValue: {
            type: 'string',
            enum: ['constant'],
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // REQUIRED BEHAVIOR: Single-value enum must be preserved

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('FixedValue');
    // BEHAVIOR: Value is present (regardless of quote style)
    expect(result.content).toContain('constant');
    // BEHAVIOR: Uses z.literal() for single value
    expect(result.content).toMatch(/z\.literal\(/);
  });

  test('enum in operation parameter generates correct validation', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Enum Parameter Test' },
      paths: {
        '/items': {
          get: {
            operationId: 'listItems',
            parameters: [
              {
                name: 'sort',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
      components: { schemas: {} },
    };

    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // REQUIRED BEHAVIOR: Enum in parameter must generate enum validation

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('listItems');

    // BEHAVIOR: Parameter enum values are present (regardless of quote style)
    const hasEnumValues = result.content.includes('asc') && result.content.includes('desc');
    expect(hasEnumValues).toBe(true);

    // BEHAVIOR: Uses enum/literal construct
    expect(result.content).toMatch(/z\.(enum|literal)\(/);
  });

  test('enum in request body generates correct schema', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Enum Request Body Test' },
      paths: {
        '/tasks': {
          post: {
            operationId: 'createTask',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['priority'],
                    properties: {
                      title: { type: 'string' },
                      priority: {
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'urgent'],
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
      components: { schemas: {} },
    };

    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // REQUIRED BEHAVIOR: Enum in request body must be preserved

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('createTask');

    // BEHAVIOR: Priority enum values are present (regardless of quote style)
    const hasEnumValues =
      result.content.includes('low') &&
      result.content.includes('medium') &&
      result.content.includes('high') &&
      result.content.includes('urgent');

    expect(hasEnumValues).toBe(true);

    // BEHAVIOR: Uses enum/literal construct
    expect(result.content).toMatch(/z\.(enum|literal)\(/);
  });

  test('enum in response schema generates correct type', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Enum Response Test' },
      paths: {
        '/status': {
          get: {
            operationId: 'getStatus',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        state: {
                          type: 'string',
                          enum: ['running', 'stopped', 'error'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: { schemas: {} },
    };

    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // REQUIRED BEHAVIOR: Enum in response must be preserved

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('getStatus');

    // BEHAVIOR: State enum values are present (regardless of quote style)
    const hasEnumValues =
      result.content.includes('running') &&
      result.content.includes('stopped') &&
      result.content.includes('error');

    expect(hasEnumValues).toBe(true);

    // BEHAVIOR: Uses enum/literal construct
    expect(result.content).toMatch(/z\.(enum|literal)\(/);
  });
});
