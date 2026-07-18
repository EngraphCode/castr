import { describe, expect, test } from 'vitest';
import type { OpenAPIDocument } from '../../../../shared/openapi-types.js';

import { buildCastrAdditionalOperations, buildCastrOperations } from './builder.operations.js';

describe('buildCastrOperations paths-level specification extensions', () => {
  // Per OAS 3.x, the Paths Object MAY be extended with ^x- Specification
  // Extensions; an extension value whose shape resembles a Path Item must not
  // produce phantom operations keyed by the extension name.
  const doc: OpenAPIDocument = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          responses: {
            '200': { description: 'Success' },
          },
        },
        additionalOperations: {
          purge: {
            operationId: 'purgeUsers',
            responses: {
              '204': { description: 'Purged' },
            },
          },
        },
      },
      'x-router': {
        get: {
          operationId: 'phantomGet',
          responses: {
            '200': { description: 'Success' },
          },
        },
        additionalOperations: {
          purge: {
            operationId: 'phantomPurge',
            responses: {
              '204': { description: 'Purged' },
            },
          },
        },
      },
    },
  };

  test('skips x-* Paths Object extension entries instead of treating them as paths', () => {
    const operations = buildCastrOperations(doc);

    expect(operations.map((operation) => operation.path)).toEqual(['/users']);
  });

  test('skips x-* Paths Object extension entries when building additional operations', () => {
    const additionalOperations = buildCastrAdditionalOperations(doc);

    expect(additionalOperations.map((operation) => [operation.path, operation.method])).toEqual([
      ['/users', 'purge'],
    ]);
  });
});
