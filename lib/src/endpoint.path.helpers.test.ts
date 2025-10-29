/**
 * Unit tests for endpoint.path.helpers
 *
 * These tests define the expected behavior with the new doc-based context API.
 * Tests are written FIRST (TDD) to define the desired system state.
 */

import { describe, test, expect } from 'vitest';
import type { OpenAPIObject, OperationObject, SchemaObject } from 'openapi3-ts/oas30';
import { processOperation } from './endpoint.path.helpers.js';
import type { ConversionTypeContext } from './CodeMeta.js';

/**
 * Helper to create minimal ConversionTypeContext for testing
 */
function createTestContext(doc: OpenAPIObject): ConversionTypeContext {
  return {
    doc,
    zodSchemaByName: {},
    schemaByName: {},
  };
}

/**
 * Helper to create minimal getZodVarName function for testing
 */
const mockGetZodVarName = (_input: { toString: () => string }, fallbackName?: string) => {
  return fallbackName ?? 'MockVarName';
};

describe('endpoint.path.helpers with doc-based context', () => {
  describe('processOperation', () => {
    test('should process operation with inline schemas', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        summary: 'Get user',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { id: { type: 'number' } } } as SchemaObject,
              },
            },
          },
        },
      };

      const result = processOperation({
        path: '/users/{id}',
        method: 'get',
        operation,
        operationName: 'getUser',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        ctx,
        getZodVarName: mockGetZodVarName,
        defaultStatusBehavior: 'auto-correct',
      });

      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.method).toBe('get');
      expect(result.endpoint.path).toBe('/users/:id');
      expect(result.endpoint.parameters).toHaveLength(1);
      expect(result.endpoint.response).toBeDefined();
    });

    test('should process operation with response $refs', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          responses: {
            UserResponse: {
              description: 'User data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                  } as SchemaObject,
                },
              },
            },
          },
        },
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        summary: 'Get user',
        responses: {
          '200': { $ref: '#/components/responses/UserResponse' },
        },
      };

      const result = processOperation({
        path: '/users',
        method: 'get',
        operation,
        operationName: 'getUsers',
        parameters: [],
        ctx,
        getZodVarName: mockGetZodVarName,
        defaultStatusBehavior: 'auto-correct',
      });

      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.response).toBeDefined();
    });

    test('should process operation with default response', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        summary: 'Get data',
        responses: {
          default: {
            description: 'Default response',
            content: {
              'application/json': {
                schema: { type: 'object' } as SchemaObject,
              },
            },
          },
        },
      };

      const result = processOperation({
        path: '/data',
        method: 'get',
        operation,
        operationName: 'getData',
        parameters: [],
        ctx,
        getZodVarName: mockGetZodVarName,
        defaultStatusBehavior: 'auto-correct',
      });

      expect(result.endpoint).toBeDefined();
      // In auto-correct mode with no 2xx response, default becomes main response
      expect(result.endpoint.response).toBeDefined();
      expect(result.endpoint.response).not.toBe('z.void()');
    });

    test('should handle default response with component $ref', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          responses: {
            DefaultError: {
              description: 'Default error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { error: { type: 'string' } },
                  } as SchemaObject,
                },
              },
            },
          },
        },
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        summary: 'Get data',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'object' } as SchemaObject,
              },
            },
          },
          default: { $ref: '#/components/responses/DefaultError' },
        },
      };

      const result = processOperation({
        path: '/data',
        method: 'get',
        operation,
        operationName: 'getData',
        parameters: [],
        ctx,
        getZodVarName: mockGetZodVarName,
        defaultStatusBehavior: 'auto-correct',
      });

      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.response).toBeDefined();
      // In auto-correct mode with 2xx response, default becomes error
      expect(result.endpoint.errors).toHaveLength(1);
    });

    test('should throw on nested $ref in default response', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          responses: {
            DefaultError: { $ref: '#/components/responses/OtherError' },
          },
        },
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        responses: {
          default: { $ref: '#/components/responses/DefaultError' },
        },
      };

      expect(() =>
        processOperation({
          path: '/data',
          method: 'get',
          operation,
          operationName: 'getData',
          parameters: [],
          ctx,
          getZodVarName: mockGetZodVarName,
          defaultStatusBehavior: 'auto-correct',
        }),
      ).toThrow(/Unexpected \$ref/);
    });

    test('should process operation with request body', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        summary: 'Create user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' } } } as SchemaObject,
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { id: { type: 'number' } } } as SchemaObject,
              },
            },
          },
        },
      };

      const result = processOperation({
        path: '/users',
        method: 'post',
        operation,
        operationName: 'createUser',
        parameters: [],
        ctx,
        getZodVarName: mockGetZodVarName,
        defaultStatusBehavior: 'auto-correct',
      });

      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.parameters).toHaveLength(1);
      expect(result.endpoint.parameters[0]).toBeDefined();
      expect(result.endpoint.parameters[0]?.type).toBe('Body');
      expect(result.endpoint.requestFormat).toBe('json');
    });

    test('should process operation with parameter $refs', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          parameters: {
            LimitParam: {
              name: 'limit',
              in: 'query',
              schema: { type: 'number' },
            },
          },
        },
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        summary: 'Get items',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object' } } as SchemaObject,
              },
            },
          },
        },
      };

      const result = processOperation({
        path: '/items',
        method: 'get',
        operation,
        operationName: 'getItems',
        parameters: [{ $ref: '#/components/parameters/LimitParam' }],
        ctx,
        getZodVarName: mockGetZodVarName,
        defaultStatusBehavior: 'auto-correct',
      });

      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.parameters).toHaveLength(1);
      expect(result.endpoint.parameters[0]).toBeDefined();
      expect(result.endpoint.parameters[0]?.type).toBe('Query');
    });

    test('should handle operations with errors', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        summary: 'Get user',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'object' } as SchemaObject,
              },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string' } },
                } as SchemaObject,
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string' } },
                } as SchemaObject,
              },
            },
          },
        },
      };

      const result = processOperation({
        path: '/user',
        method: 'get',
        operation,
        operationName: 'getUser',
        parameters: [],
        ctx,
        getZodVarName: mockGetZodVarName,
        defaultStatusBehavior: 'auto-correct',
      });

      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.errors).toHaveLength(2);
      expect(result.endpoint.errors[0]).toBeDefined();
      expect(result.endpoint.errors[0]?.status).toBe(404);
      expect(result.endpoint.errors[1]).toBeDefined();
      expect(result.endpoint.errors[1]?.status).toBe(500);
    });

    test('should use void schema when no response content', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };
      const ctx = createTestContext(doc);

      const operation: OperationObject = {
        summary: 'Delete user',
        responses: {
          '204': {
            description: 'No content',
          },
        },
      };

      const result = processOperation({
        path: '/user',
        method: 'delete',
        operation,
        operationName: 'deleteUser',
        parameters: [],
        ctx,
        getZodVarName: mockGetZodVarName,
        defaultStatusBehavior: 'auto-correct',
      });

      expect(result.endpoint).toBeDefined();
      expect(result.endpoint.response).toBe('z.void()');
    });
  });
});
