import { describe, it, expect } from 'vitest';
import { isReferenceObject } from '../../../../shared/openapi-types.js';
import type { CastrSchemaNode, CastrOperation, CastrParameter } from '../../../ir/index.js';

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

describe('writeOpenApiPaths parameter example canonicalization', () => {
  it('prefers named examples over the singular example in canonical parameter output', () => {
    const filterParameter: CastrParameter = {
      name: 'filter',
      in: 'query',
      required: false,
      schema: { type: 'string', metadata: createMetadata() },
      example: 'active devices',
      examples: {
        default: {
          dataValue: 'active devices',
          serializedValue: 'active%20devices',
        },
      },
    };

    const operations: CastrOperation[] = [
      createOperation({
        method: 'get',
        path: '/users',
        parameters: [filterParameter],
        parametersByLocation: {
          query: [filterParameter],
          path: [],
          header: [],
          cookie: [],
        },
      }),
    ];

    const result = writeOpenApiPaths(operations);
    const param = result['/users']?.get?.parameters?.[0];

    expect(param).toBeDefined();
    if (!param || isReferenceObject(param)) {
      throw new Error('Expected query parameter to be written inline');
    }

    expect(param.example).toBeUndefined();
    expect(param.examples).toEqual({
      default: {
        dataValue: 'active devices',
        serializedValue: 'active%20devices',
      },
    });
  });
});
