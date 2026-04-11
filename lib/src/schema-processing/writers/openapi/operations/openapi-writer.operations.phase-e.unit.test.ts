import { describe, expect, it } from 'vitest';
import type {
  CastrAdditionalOperation,
  CastrOperation,
  CastrSchemaNode,
} from '../../../ir/index.js';
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

function createAdditionalOperation(
  overrides: Partial<CastrAdditionalOperation> = {},
): CastrAdditionalOperation {
  return {
    method: 'PURGE',
    path: '/test',
    parameters: [],
    parametersByLocation: { query: [], path: [], header: [], cookie: [] },
    responses: [],
    ...overrides,
  };
}

describe('writeOpenApiPaths Phase E operations', () => {
  it('writes custom additionalOperations methods alongside fixed path item fields', () => {
    const result = writeOpenApiPaths(
      [createOperation({ operationId: 'listUsers', method: 'get', path: '/users' })],
      [
        createAdditionalOperation({
          operationId: 'purgeUsers',
          method: 'PURGE',
          path: '/users',
        }),
      ],
    );

    expect(result['/users']?.get?.operationId).toBe('listUsers');
    expect(result['/users']?.additionalOperations?.['PURGE']?.operationId).toBe('purgeUsers');
  });

  it('preserves custom additionalOperations method casing verbatim', () => {
    const result = writeOpenApiPaths(
      [],
      [
        createAdditionalOperation({
          operationId: 'purgeUsers',
          method: 'PuRgE',
          path: '/users',
        }),
      ],
    );

    expect(result['/users']?.additionalOperations?.['PuRgE']?.operationId).toBe('purgeUsers');
    expect(result['/users']?.additionalOperations?.['PURGE']).toBeUndefined();
  });

  it('rejects invalid programmatic additionalOperations methods while writing', () => {
    expect(() =>
      writeOpenApiPaths(
        [],
        [
          createAdditionalOperation({
            method: 'GET',
            path: '/users',
          }),
        ],
      ),
    ).toThrow(/must not appear in additionalOperations/i);

    expect(() =>
      writeOpenApiPaths(
        [createOperation({ method: 'get', path: '/users', operationId: 'listUsers' })],
        [
          createAdditionalOperation({
            method: 'get',
            path: '/users',
            operationId: 'shadowUsers',
          }),
        ],
      ),
    ).toThrow(/must not appear in additionalOperations/i);

    expect(() =>
      writeOpenApiPaths(
        [],
        [
          createAdditionalOperation({
            method: 'PUR GE',
            path: '/users',
          }),
        ],
      ),
    ).toThrow(/valid HTTP method tokens without spaces/i);
  });

  it('sorts additionalOperations keys lexicographically after fixed method fields', () => {
    const result = writeOpenApiPaths(
      [createOperation({ method: 'get', path: '/users', responses: [{ statusCode: '200' }] })],
      [
        createAdditionalOperation({
          method: 'SEARCH',
          path: '/users',
          responses: [{ statusCode: '200', description: 'ok' }],
        }),
        createAdditionalOperation({
          method: 'PURGE',
          path: '/users',
          responses: [{ statusCode: '202', description: 'accepted' }],
        }),
      ],
    );

    expect(Object.keys(result['/users'] ?? {})).toEqual(['get', 'additionalOperations']);
    expect(Object.keys(result['/users']?.additionalOperations ?? {})).toEqual(['PURGE', 'SEARCH']);
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
});
