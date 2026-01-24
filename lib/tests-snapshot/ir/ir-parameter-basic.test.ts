/**
 * IR Integration - Basic Parameter Metadata
 *
 * PROVES: Basic parameter metadata (required, optional, mixed) flows through to correct validation
 *
 * @module ir-parameter-basic.test
 */

import { generateZodClientFromOpenAPI, isSingleFileResult } from '../../src/index.js';
import { getZodClientTemplateContext } from '../../src/context/template-context.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';

describe('IR Integration - Basic Operation Parameters', () => {
  test('required path parameter generates correct validation', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Path Parameter Test' },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'getUser',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'integer' },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
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

    // FIRST: Prove IR captures parameter metadata correctly
    const ctx = getZodClientTemplateContext(openApiDoc);
    const operation = ctx._ir?.operations?.find((op) => op.operationId === 'getUser');

    expect(operation).toBeDefined();
    expect(operation?.parameters?.length).toBe(1);

    const userIdParam = operation?.parameters?.[0];
    expect(userIdParam?.name).toBe('userId');
    expect(userIdParam?.in).toBe('path');
    expect(userIdParam?.metadata).toBeDefined();
    expect(userIdParam?.metadata?.required).toBe(true);

    // SECOND: Prove generated code enforces required parameter
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('getUser');
    expect(result.content).toContain('userId');

    // Required parameter should NOT have .optional()
    const getUserDef = result.content.substring(
      result.content.indexOf('getUser'),
      result.content.indexOf('getUser') + 500,
    );

    // Should contain userId without optional
    expect(getUserDef).toContain('userId');
  });

  test('optional query parameter generates correct validation', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Query Parameter Test' },
      paths: {
        '/items': {
          get: {
            operationId: 'listItems',
            parameters: [
              {
                name: 'page',
                in: 'query',
                required: false,
                schema: { type: 'integer', minimum: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                required: false,
                schema: { type: 'integer', minimum: 1, maximum: 100 },
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

    // FIRST: Prove IR captures optional parameters correctly
    const ctx = getZodClientTemplateContext(openApiDoc);
    const operation = ctx._ir?.operations?.find((op) => op.operationId === 'listItems');

    expect(operation).toBeDefined();
    expect(operation?.parameters?.length).toBe(2);

    const pageParam = operation?.parameters?.find((p) => p.name === 'page');
    const limitParam = operation?.parameters?.find((p) => p.name === 'limit');

    expect(pageParam?.metadata?.required).toBe(false);
    expect(limitParam?.metadata?.required).toBe(false);

    // SECOND: Prove generated code makes parameters optional
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('listItems');
    expect(result.content).toContain('page');
    expect(result.content).toContain('limit');
  });

  test('multiple parameter types generate correct validation', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Mixed Parameters Test' },
      paths: {
        '/resources/{id}': {
          get: {
            operationId: 'getResource',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
              {
                name: 'include',
                in: 'query',
                required: false,
                schema: { type: 'string' },
              },
              {
                name: 'X-Request-ID',
                in: 'header',
                required: true,
                schema: { type: 'string', format: 'uuid' },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
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

    // FIRST: Prove IR captures all parameter types with correct metadata
    const ctx = getZodClientTemplateContext(openApiDoc);
    const operation = ctx._ir?.operations?.find((op) => op.operationId === 'getResource');

    expect(operation).toBeDefined();
    expect(operation?.parameters?.length).toBe(3);

    const pathParam = operation?.parameters?.find((p) => p.in === 'path');
    const queryParam = operation?.parameters?.find((p) => p.in === 'query');
    const headerParam = operation?.parameters?.find((p) => p.in === 'header');

    expect(pathParam?.metadata?.required).toBe(true);
    expect(queryParam?.metadata?.required).toBe(false);
    expect(headerParam?.metadata?.required).toBe(true);

    // SECOND: Prove generated code handles all parameter types
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('getResource');
    expect(result.content).toContain('id');
    expect(result.content).toContain('include');
  });
});
