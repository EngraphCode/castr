import { describe, expect, it } from 'vitest';
import type { CastrOperation, CastrSchemaNode } from '../../ir/schema.js';
import { writeOpenApiPaths } from './openapi-writer.operations.js';

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

describe('writeOpenApiPaths determinism', () => {
  it('sorts path keys lexicographically regardless of input operation order', () => {
    const operations: CastrOperation[] = [
      createOperation({
        method: 'get',
        path: '/z-users',
        responses: [{ statusCode: '200', description: 'ok' }],
      }),
      createOperation({
        method: 'get',
        path: '/a-users',
        responses: [{ statusCode: '200', description: 'ok' }],
      }),
    ];

    const result = writeOpenApiPaths(operations);

    expect(Object.keys(result)).toEqual(['/a-users', '/z-users']);
  });

  it('sorts methods within a path by canonical HTTP method order', () => {
    const operations: CastrOperation[] = [
      createOperation({
        method: 'post',
        path: '/users',
        responses: [{ statusCode: '200', description: 'ok' }],
      }),
      createOperation({
        method: 'get',
        path: '/users',
        responses: [{ statusCode: '200', description: 'ok' }],
      }),
      createOperation({
        method: 'patch',
        path: '/users',
        responses: [{ statusCode: '200', description: 'ok' }],
      }),
    ];

    const result = writeOpenApiPaths(operations);

    expect(Object.keys(result['/users'] ?? {})).toEqual(['get', 'post', 'patch']);
  });

  it('sorts request body media types for deterministic output', () => {
    const operations: CastrOperation[] = [
      createOperation({
        method: 'post',
        path: '/users',
        requestBody: {
          required: true,
          content: {
            'text/plain': {
              schema: { type: 'string', metadata: createMetadata() },
            },
            'application/json': {
              schema: { type: 'object', metadata: createMetadata() },
            },
          },
        },
      }),
    ];

    const result = writeOpenApiPaths(operations);
    const requestBody = result['/users']?.post?.requestBody;
    const mediaTypeKeys =
      requestBody !== undefined &&
      typeof requestBody === 'object' &&
      'content' in requestBody &&
      requestBody.content !== undefined
        ? Object.keys(requestBody.content)
        : [];

    expect(mediaTypeKeys).toEqual(['application/json', 'text/plain']);
  });

  it('sorts response status codes for deterministic output', () => {
    const operations: CastrOperation[] = [
      createOperation({
        method: 'get',
        path: '/users',
        responses: [
          { statusCode: 'default', description: 'Fallback error' },
          { statusCode: '404', description: 'Not found' },
          { statusCode: '200', description: 'Success' },
          { statusCode: '2XX', description: 'Any success response' },
        ],
      }),
    ];

    const result = writeOpenApiPaths(operations);
    const responseKeys = Object.keys(result['/users']?.get?.responses ?? {});

    expect(responseKeys).toEqual(['200', '404', '2XX', 'default']);
  });

  it('sorts response content and headers by key', () => {
    const operations: CastrOperation[] = [
      createOperation({
        method: 'get',
        path: '/users',
        responses: [
          {
            statusCode: '200',
            description: 'Success',
            content: {
              'text/plain': { schema: { type: 'string', metadata: createMetadata() } },
              'application/json': { schema: { type: 'object', metadata: createMetadata() } },
            },
            headers: {
              'x-zeta': { schema: { type: 'string', metadata: createMetadata() } },
              'x-alpha': { schema: { type: 'string', metadata: createMetadata() } },
            },
          },
        ],
      }),
    ];

    const result = writeOpenApiPaths(operations);
    const response = result['/users']?.get?.responses?.['200'];

    expect(Object.keys(response?.content ?? {})).toEqual(['application/json', 'text/plain']);
    expect(Object.keys(response?.headers ?? {})).toEqual(['x-alpha', 'x-zeta']);
  });

  it('sorts operation security requirements by scheme name', () => {
    const operations: CastrOperation[] = [
      createOperation({
        method: 'get',
        path: '/secure',
        responses: [{ statusCode: '200', description: 'ok' }],
        security: [
          { schemeName: 'oauth2', scopes: ['read'] },
          { schemeName: 'apiKey', scopes: [] },
        ],
      }),
    ];

    const result = writeOpenApiPaths(operations);
    const security = result['/secure']?.get?.security;

    expect(security).toEqual([{ apiKey: [] }, { oauth2: ['read'] }]);
  });
});
