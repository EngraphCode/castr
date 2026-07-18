import { describe, expect, test } from 'vitest';
import type {
  OpenAPIDocument,
  ReferenceObject,
  ResponseObject,
} from '../../../../shared/openapi-types.js';

import { buildCastrResponses, buildSingleResponse } from './builder.responses.js';
import type { IRBuildContext } from '../builder.types.js';

function createContext(doc: OpenAPIDocument): IRBuildContext {
  return {
    doc,
    path: ['/users/{id}', 'get'],
    required: false,
  };
}

describe('buildCastrResponses specification extensions', () => {
  const emptyDoc: OpenAPIDocument = {
    openapi: '3.1.0',
    info: { title: 'Test', version: '1.0.0' },
    paths: {},
  };

  test('skips x-* specification-extension entries instead of building them as responses', () => {
    // Per OAS 3.x, the Responses Object MAY be extended with ^x- Specification
    // Extensions; those entries are metadata, not responses. The extension
    // value here is deliberately response-shaped to prove the skip is driven
    // by the key, not the value's shape.
    const responses = {
      '200': { description: 'Success' },
      default: { description: 'Fallback' },
      'x-codegen': { description: 'vendor codegen metadata' },
    };

    const result = buildCastrResponses(responses, createContext(emptyDoc));

    expect(result.map((response) => response.statusCode)).toEqual(['200', 'default']);
  });

  test('does not resolve ref-shaped x-* extension values as response refs', () => {
    // An extension value may carry any JSON, including a $ref-shaped object
    // that points nowhere. Treating it as a response reference aborts parsing
    // of an otherwise valid document.
    const responses = {
      '204': { description: 'No Content' },
      'x-vendor-link': { $ref: '#/components/responses/DoesNotExist' },
    };

    const result = buildCastrResponses(responses, createContext(emptyDoc));

    expect(result.map((response) => response.statusCode)).toEqual(['204']);
  });
});

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

  test('throws on response refs that only match inherited Object.prototype members', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: { responses: {} },
    };

    const ref: ReferenceObject = { $ref: '#/components/responses/constructor' };

    // A bare bracket lookup returns the inherited constructor function
    // instead of undefined, bypassing the unresolved-ref guard.
    expect(() => buildSingleResponse('500', ref, createContext(doc))).toThrow(
      /Unresolvable response reference/,
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
