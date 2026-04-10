import { describe, expect, test } from 'vitest';
import type {
  OpenAPIDocument,
  ReferenceObject,
  ResponseObject,
} from '../../../../shared/openapi-types.js';

import { buildSingleResponse } from './builder.responses.js';
import type { IRBuildContext } from '../builder.types.js';

function createContext(doc: OpenAPIDocument): IRBuildContext {
  return {
    doc,
    path: ['/users/{id}', 'get'],
    required: false,
  };
}

describe('buildSingleResponse strict ref resolution', () => {
  test('resolves valid response component refs', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        responses: {
          NotFound: {
            description: 'Not found',
          },
        },
      },
    };

    const ref: ReferenceObject = { $ref: '#/components/responses/NotFound' };
    const result = buildSingleResponse('404', ref, createContext(doc));

    expect(result).toMatchObject({
      statusCode: '404',
      description: 'Not found',
    } satisfies Partial<ResponseObject> & { statusCode: string });
  });

  test('throws on malformed response refs with actionable context', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: { responses: {} },
    };

    const ref: ReferenceObject = { $ref: '#/components/responses/' };

    expect(() => buildSingleResponse('500', ref, createContext(doc))).toThrow(
      /Invalid response reference.*Expected format/,
    );
  });

  test('throws on non-response component refs with actionable context', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          ErrorBody: {
            type: 'object',
          },
        },
      },
    };

    const ref: ReferenceObject = { $ref: '#/components/schemas/ErrorBody' };

    expect(() => buildSingleResponse('500', ref, createContext(doc))).toThrow(
      /Unsupported response reference.*Expected #\/components\/responses\/\{name\}/,
    );
  });
});
