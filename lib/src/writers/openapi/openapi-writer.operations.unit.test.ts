/**
 * Unit tests for OpenAPI operations/paths writer.
 *
 * Tests conversion from CastrOperation[] (IR) to OpenAPI PathsObject.
 * Follows TDD - tests written first, implementation follows.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

import type { CastrOperation, CastrSchemaNode } from '../../ir/schema.js';

import { writeOpenApiPaths } from './openapi-writer.operations.js';

/**
 * Creates a minimal valid CastrSchemaNode for testing.
 */
function createMetadata(overrides: Partial<CastrSchemaNode> = {}): CastrSchemaNode {
  return {
    required: false,
    nullable: false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
    ...overrides,
  };
}

/**
 * Creates a minimal valid CastrOperation for testing.
 */
function createOperation(overrides: Partial<CastrOperation> = {}): CastrOperation {
  return {
    method: 'get',
    path: '/test',
    parameters: [],
    parametersByLocation: { query: [], path: [], header: [], cookie: [] },
    responses: [],
    ...overrides,
  };
}

describe('writeOpenApiPaths', () => {
  describe('basic operations', () => {
    it('converts single GET operation', () => {
      const operations: CastrOperation[] = [
        createOperation({
          operationId: 'getUsers',
          method: 'get',
          path: '/users',
        }),
      ];

      const result = writeOpenApiPaths(operations);

      const pathItem = result['/users'];
      expect(pathItem).toBeDefined();
      expect(pathItem?.get).toBeDefined();
      expect(pathItem?.get?.operationId).toBe('getUsers');
    });

    it('converts POST operation', () => {
      const operations: CastrOperation[] = [
        createOperation({
          operationId: 'createUser',
          method: 'post',
          path: '/users',
        }),
      ];

      const result = writeOpenApiPaths(operations);

      const pathItem = result['/users'];
      expect(pathItem?.post).toBeDefined();
      expect(pathItem?.post?.operationId).toBe('createUser');
    });

    it('groups multiple methods on same path', () => {
      const operations: CastrOperation[] = [
        createOperation({
          operationId: 'getUsers',
          method: 'get',
          path: '/users',
        }),
        createOperation({
          operationId: 'createUser',
          method: 'post',
          path: '/users',
        }),
      ];

      const result = writeOpenApiPaths(operations);

      const pathItem = result['/users'];
      expect(pathItem?.get).toBeDefined();
      expect(pathItem?.post).toBeDefined();
    });

    it('handles multiple different paths', () => {
      const operations: CastrOperation[] = [
        createOperation({ method: 'get', path: '/users' }),
        createOperation({ method: 'get', path: '/pets' }),
      ];

      const result = writeOpenApiPaths(operations);

      expect(result['/users']).toBeDefined();
      expect(result['/pets']).toBeDefined();
    });
  });

  describe('operation metadata', () => {
    it('preserves summary', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          summary: 'Get all users',
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const op = result['/users']?.get;

      expect(op?.summary).toBe('Get all users');
    });

    it('preserves description', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          description: 'Retrieves a list of all users',
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const op = result['/users']?.get;

      expect(op?.description).toBe('Retrieves a list of all users');
    });

    it('preserves tags', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          tags: ['users', 'admin'],
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const op = result['/users']?.get;

      expect(op?.tags).toEqual(['users', 'admin']);
    });

    it('preserves deprecated flag', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          deprecated: true,
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const op = result['/users']?.get;

      expect(op?.deprecated).toBe(true);
    });
  });

  describe('parameters', () => {
    it('converts path parameters', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users/{userId}',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string', metadata: createMetadata() },
            },
          ],
          parametersByLocation: {
            path: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string', metadata: createMetadata() },
              },
            ],
            query: [],
            header: [],
            cookie: [],
          },
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const op = result['/users/{userId}']?.get;

      expect(op?.parameters).toHaveLength(1);
      expect(op?.parameters?.[0]).toMatchObject({
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      });
    });

    it('converts query parameters', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', metadata: createMetadata() },
            },
          ],
          parametersByLocation: {
            query: [
              {
                name: 'page',
                in: 'query',
                required: false,
                schema: { type: 'integer', metadata: createMetadata() },
              },
            ],
            path: [],
            header: [],
            cookie: [],
          },
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const params = result['/users']?.get?.parameters;

      expect(params).toHaveLength(1);
      expect(params?.[0]).toMatchObject({
        name: 'page',
        in: 'query',
        required: false,
      });
    });

    it('preserves parameter description', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', metadata: createMetadata() },
              description: 'Maximum number of results',
            },
          ],
          parametersByLocation: { query: [], path: [], header: [], cookie: [] },
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const param = result['/users']?.get?.parameters?.[0];

      expect(param?.description).toBe('Maximum number of results');
    });
  });

  describe('request body', () => {
    it('converts POST request body', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'post',
          path: '/users',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  metadata: createMetadata(),
                },
              },
            },
          },
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const reqBody = result['/users']?.post?.requestBody;

      expect(reqBody).toBeDefined();
      expect(reqBody).toMatchObject({
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      });
    });

    it('preserves request body description', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'post',
          path: '/users',
          requestBody: {
            required: true,
            description: 'User data to create',
            content: {
              'application/json': {
                schema: { type: 'object', metadata: createMetadata() },
              },
            },
          },
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const reqBody = result['/users']?.post?.requestBody;

      expect(reqBody).toHaveProperty('description', 'User data to create');
    });
  });

  describe('responses', () => {
    it('converts success response', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          responses: [
            {
              statusCode: '200',
              description: 'Successful response',
              schema: { type: 'array', metadata: createMetadata() },
            },
          ],
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const responses = result['/users']?.get?.responses;

      expect(responses?.['200']).toBeDefined();
      expect(responses?.['200']?.description).toBe('Successful response');
    });

    it('converts multiple response status codes', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users/{id}',
          responses: [
            {
              statusCode: '200',
              description: 'Success',
              schema: { type: 'object', metadata: createMetadata() },
            },
            {
              statusCode: '404',
              description: 'Not found',
            },
          ],
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const responses = result['/users/{id}']?.get?.responses;

      expect(responses?.['200']).toBeDefined();
      expect(responses?.['404']).toBeDefined();
    });

    it('includes response content when schema provided', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          responses: [
            {
              statusCode: '200',
              description: 'Success',
              schema: { type: 'object', metadata: createMetadata() },
            },
          ],
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const response200 = result['/users']?.get?.responses?.['200'];

      expect(response200?.content).toBeDefined();
      expect(response200?.content?.['application/json']).toBeDefined();
    });
  });

  describe('security', () => {
    it('converts security requirements', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          security: [{ schemeName: 'bearerAuth', scopes: [] }],
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const security = result['/users']?.get?.security;

      expect(security).toBeDefined();
      expect(security).toEqual([{ bearerAuth: [] }]);
    });

    it('converts security with scopes', () => {
      const operations: CastrOperation[] = [
        createOperation({
          method: 'get',
          path: '/users',
          security: [{ schemeName: 'oauth2', scopes: ['read:users', 'write:users'] }],
        }),
      ];

      const result = writeOpenApiPaths(operations);
      const security = result['/users']?.get?.security;

      expect(security).toEqual([{ oauth2: ['read:users', 'write:users'] }]);
    });
  });

  describe('empty cases', () => {
    it('returns empty object for empty operations', () => {
      const result = writeOpenApiPaths([]);

      expect(result).toEqual({});
    });
  });
});
