import { describe, expect, it } from 'vitest';
import { createMockCastrDocument } from '../test-helpers.js';
import { allOperations } from './schema-document.js';

describe('schema-document', () => {
  it('returns standard and additional operations in deterministic combined order', () => {
    const document = createMockCastrDocument({
      operations: [
        {
          operationId: 'listUsers',
          method: 'get',
          path: '/users',
          parameters: [],
          parametersByLocation: { query: [], path: [], header: [], cookie: [] },
          responses: [],
        },
      ],
      additionalOperations: [
        {
          operationId: 'purgeUsers',
          method: 'PURGE',
          path: '/users',
          parameters: [],
          parametersByLocation: { query: [], path: [], header: [], cookie: [] },
          responses: [],
        },
      ],
    });

    expect(allOperations(document).map((operation) => operation.method)).toEqual(['get', 'PURGE']);
  });
});
