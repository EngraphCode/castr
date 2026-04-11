import { describe, expect, test } from 'vitest';
import type { HeaderObject, OpenAPIDocument } from '../../../../../shared/openapi-types.js';
import type { IRBuildContext } from '../../builder.types.js';
import { buildResponseHeaders } from './builder.response-headers.js';

function createContext(doc: OpenAPIDocument): IRBuildContext {
  return {
    doc,
    path: ['paths', '/phase-e', 'additionalOperations', 'PURGE', 'responses', '202'],
    required: false,
  };
}

describe('buildResponseHeaders', () => {
  test('derives a compatibility schema from itemSchema-only header content', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const headers = buildResponseHeaders(
      {
        'X-Phase-E-Acks': {
          description: 'Ack stream',
          content: {
            'application/x-ndjson': {
              itemSchema: {
                type: 'string',
                minLength: 1,
              },
            },
          },
        } satisfies HeaderObject,
      },
      createContext(doc),
    );

    const header = headers['X-Phase-E-Acks'];
    const mediaType = header?.content?.['application/x-ndjson'];

    expect(header?.schema.type).toBe('string');
    expect(mediaType).toBeDefined();
    if (!mediaType || '$ref' in mediaType) {
      throw new Error('Expected inline media type entry');
    }

    expect(mediaType.itemSchema?.type).toBe('string');
    expect(mediaType.itemSchema?.minLength).toBe(1);
  });
});
