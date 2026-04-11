import { describe, expect, it } from 'vitest';
import type { OpenAPIDocument } from '../../../shared/openapi-types.js';
import {
  getItemSchemaFromIRMediaTypeEntry,
  getSchemaFromIRMediaTypeEntry,
} from '../../ir/index.js';
import { buildIR } from './index.js';

describe('buildIR Phase E native OpenAPI 3.2 operations', () => {
  it('extracts QUERY operations from native OpenAPI 3.2 path items', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: {
        title: 'Query API',
        version: '1.0.0',
      },
      paths: {
        '/search': {
          query: {
            operationId: 'searchUsers',
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    };

    const result = buildIR(doc);

    expect(result.operations).toHaveLength(1);
    expect(result.operations[0]?.method).toBe('query');
    expect(result.operations[0]?.path).toBe('/search');
    expect(result.operations[0]?.operationId).toBe('searchUsers');
  });

  it('extracts additionalOperations into separate IR storage', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: {
        title: 'Additional Operations API',
        version: '1.0.0',
      },
      paths: {
        '/cache': {
          additionalOperations: {
            PURGE: {
              operationId: 'purgeCache',
              responses: { '202': { description: 'Accepted' } },
            },
          },
        },
      },
    };

    const result = buildIR(doc);

    expect(result.operations).toEqual([]);
    expect(result.additionalOperations).toHaveLength(1);
    expect(result.additionalOperations[0]).toMatchObject({
      operationId: 'purgeCache',
      method: 'PURGE',
      path: '/cache',
    });
  });

  it('preserves custom additionalOperations method casing verbatim', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: {
        title: 'Additional Operations API',
        version: '1.0.0',
      },
      paths: {
        '/cache': {
          additionalOperations: {
            PuRgE: {
              operationId: 'purgeCache',
              responses: { '202': { description: 'Accepted' } },
            },
          },
        },
      },
    };

    const result = buildIR(doc);

    expect(result.additionalOperations).toHaveLength(1);
    expect(result.additionalOperations[0]?.method).toBe('PuRgE');
  });

  it('rejects fixed-field methods inside additionalOperations', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: {
        title: 'Invalid Additional Operations API',
        version: '1.0.0',
      },
      paths: {
        '/cache': {
          additionalOperations: {
            POST: {
              operationId: 'invalidPostOverride',
              responses: { '202': { description: 'Accepted' } },
            },
          },
        },
      },
    };

    expect(() => buildIR(doc)).toThrow(/must not appear in additionalOperations/i);
  });

  it('extracts x-ext mediaTypes so external refs remain resolvable in IR', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: {
        title: 'External Media Types API',
        version: '1.0.0',
      },
      paths: {
        '/stream': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/x-ndjson': {
                    $ref: '#/x-ext/abc123/components/mediaTypes/EventStream',
                  },
                },
              },
            },
          },
        },
      },
      'x-ext': {
        abc123: {
          components: {
            mediaTypes: {
              EventStream: {
                schema: { type: 'array' },
                itemSchema: { type: 'string' },
              },
            },
          },
        },
      },
    };

    const result = buildIR(doc);

    expect(result.components.some((component) => component.type === 'mediaType')).toBe(true);
    expect(
      result.components.some(
        (component) => component.type === 'mediaType' && component.xExtKey === 'abc123',
      ),
    ).toBe(true);
    expect(
      getItemSchemaFromIRMediaTypeEntry(
        result,
        { $ref: '#/x-ext/abc123/components/mediaTypes/EventStream' },
        '#/paths/~1stream/get/responses/200/content/application~1x-ndjson',
      )?.type,
    ).toBe('string');
  });

  it('keeps local and x-ext mediaTypes with the same name distinct in IR', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: {
        title: 'Colliding Media Types API',
        version: '1.0.0',
      },
      components: {
        mediaTypes: {
          EventStream: {
            schema: { type: 'object', additionalProperties: false },
          },
        },
      },
      paths: {
        '/stream': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    $ref: '#/components/mediaTypes/EventStream',
                  },
                  'application/x-ndjson': {
                    $ref: '#/x-ext/abc123/components/mediaTypes/EventStream',
                  },
                },
              },
            },
          },
        },
      },
      'x-ext': {
        abc123: {
          components: {
            mediaTypes: {
              EventStream: {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    };

    const result = buildIR(doc);
    const content = result.operations[0]?.responses[0]?.content;

    if (!content) {
      throw new Error('Expected response content');
    }
    const jsonMediaType = content['application/json'];
    const streamingMediaType = content['application/x-ndjson'];

    if (!jsonMediaType || !streamingMediaType) {
      throw new Error('Expected both local and x-ext media type entries');
    }

    expect(
      getSchemaFromIRMediaTypeEntry(
        result,
        jsonMediaType,
        '#/paths/~1stream/get/responses/200/content/application~1json',
      )?.type,
    ).toBe('object');
    expect(
      getSchemaFromIRMediaTypeEntry(
        result,
        streamingMediaType,
        '#/paths/~1stream/get/responses/200/content/application~1x-ndjson',
      )?.type,
    ).toBe('string');
  });

  it('extracts enums from parameter content beyond the derived fallback schema', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: {
        title: 'Parameter Content Enums API',
        version: '1.0.0',
      },
      components: {
        parameters: {
          mode: {
            name: 'mode',
            in: 'query',
            required: false,
            content: {
              'application/json': {
                schema: { type: 'string' },
              },
              'text/plain': {
                schema: { type: 'string', enum: ['fast', 'safe'] },
              },
            },
          },
        },
      },
      paths: {
        '/stream': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/mode',
              },
              {
                name: 'state',
                in: 'query',
                required: false,
                content: {
                  'application/json': {
                    schema: { type: 'string' },
                  },
                  'text/plain': {
                    schema: { type: 'string', enum: ['warm', 'cold'] },
                  },
                },
              },
            ],
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    };

    const result = buildIR(doc);

    expect(result.enums.get('mode')?.values).toEqual(['fast', 'safe']);
    expect(result.enums.get('state')?.values).toEqual(['warm', 'cold']);
  });
});
