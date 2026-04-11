import { describe, expect, it } from 'vitest';
import type { CastrOperation } from '../../../ir/index.js';
import { writeOpenApiPaths } from './openapi-writer.operations.js';

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

describe('writeOpenApiPaths basic operations', () => {
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

  it('converts QUERY operation', () => {
    const operations: CastrOperation[] = [
      createOperation({
        operationId: 'searchUsers',
        method: 'query',
        path: '/users/search',
      }),
    ];

    const result = writeOpenApiPaths(operations);

    const pathItem = result['/users/search'];
    expect(pathItem?.query).toBeDefined();
    expect(pathItem?.query?.operationId).toBe('searchUsers');
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
