import { describe, expect, it } from 'vitest';
import {
  type ComponentsObject,
  type OpenAPIDocument,
  type SchemaObject,
  isReferenceObject,
} from '../../../shared/openapi-types.js';

import { buildCastrSchemas, buildIR } from './index.js';
import { assertSchemaComponent } from '../../ir/index.js';

describe('buildCastrSchemas object keyword preservation', () => {
  it('should preserve strict additionalProperties: false', () => {
    const components: ComponentsObject = {
      schemas: {
        StrictObject: {
          type: 'object',
          additionalProperties: false,
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(false);
  });

  it('rejects additionalProperties: true', () => {
    const components: ComponentsObject = {
      schemas: {
        LooseObject: {
          type: 'object',
          additionalProperties: true,
          properties: {
            name: { type: 'string' },
          },
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(/additionalProperties: true.*rejected/);
  });

  it('reads a constrained map: an object that names no property and constrains every key', () => {
    const components: ComponentsObject = {
      schemas: {
        Verdicts: {
          type: 'object',
          propertyNames: { type: 'string' },
          additionalProperties: { type: 'string', enum: ['ogl-compatible', 'restricted'] },
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.type).toBe('object');
    expect(schema.additionalProperties).toMatchObject({
      type: 'string',
      enum: ['ogl-compatible', 'restricted'],
    });
    expect(schema.propertyNames).toMatchObject({ type: 'string' });
  });

  describe.each(['minProperties', 'maxProperties'] as const)('%s', (keyword) => {
    const rejected = new RegExp(`${keyword}.*rejected`);

    it('is rejected on an object that names its properties', () => {
      const components: ComponentsObject = {
        schemas: {
          Counted: {
            type: 'object',
            properties: { a: { type: 'string' } },
            additionalProperties: false,
            [keyword]: 1,
          },
        },
      };

      expect(() => buildCastrSchemas(components)).toThrow(rejected);
    });

    it('is rejected beside a constrained map', () => {
      const components: ComponentsObject = {
        schemas: {
          Counted: { type: 'object', additionalProperties: { type: 'string' }, [keyword]: 1 },
        },
      };

      expect(() => buildCastrSchemas(components)).toThrow(rejected);
    });

    it('is rejected on a schema that states no type', () => {
      const components: ComponentsObject = { schemas: { Counted: { [keyword]: 1 } } };

      expect(() => buildCastrSchemas(components)).toThrow(rejected);
    });

    it('is rejected below the root of a schema', () => {
      const components: ComponentsObject = {
        schemas: {
          Holder: {
            type: 'object',
            properties: {
              inner: { type: 'object', additionalProperties: false, [keyword]: 1 },
            },
            additionalProperties: false,
          },
        },
      };

      expect(() => buildCastrSchemas(components)).toThrow(rejected);
    });
  });

  it('rejects a schema-valued additionalProperties on an object that names a property', () => {
    const components: ComponentsObject = {
      schemas: {
        CatchallObject: {
          type: 'object',
          properties: { name: { type: 'string' } },
          additionalProperties: { type: 'string' },
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(
      /schema-valued additionalProperties.*rejected/,
    );
  });

  const OUTSIDE_THE_ROW: readonly (readonly [string, SchemaObject])[] = [
    ['no type', { additionalProperties: { type: 'string' } }],
    ['a list of types', { type: ['object', 'null'], additionalProperties: { type: 'string' } }],
    ['the empty schema', { type: 'object', additionalProperties: {} }],
    [
      'allOf beside it',
      { type: 'object', additionalProperties: { type: 'string' }, allOf: [{ type: 'object' }] },
    ],
    [
      'patternProperties beside it',
      {
        type: 'object',
        additionalProperties: { type: 'string' },
        patternProperties: { '^n_': { type: 'number' } },
      },
    ],
  ];

  it.each(OUTSIDE_THE_ROW)(
    'rejects a schema-valued additionalProperties with %s',
    (_name, schema) => {
      const components: ComponentsObject = { schemas: { Outside: schema } };

      expect(() => buildCastrSchemas(components)).toThrow(/rejected/);
    },
  );

  it('sets additionalProperties: false when omitted on object schemas', () => {
    const components: ComponentsObject = {
      schemas: {
        ImplicitObject: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(false);
  });

  it('should infer object type from additionalProperties false without explicit type', () => {
    const components: ComponentsObject = {
      schemas: {
        StrictObject: {
          additionalProperties: false,
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.type).toBe('object');
    expect(schema.additionalProperties).toBe(false);
  });

  it('does not stamp additionalProperties onto primitive parameter schemas', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.1.0',
      info: { title: 'Parameters', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'listUsers',
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', minimum: 1 },
              },
            ],
            responses: {
              '200': { description: 'ok' },
            },
          },
        },
      },
    };

    const result = buildIR(doc);
    const operation = result.operations.find((candidate) => candidate.operationId === 'listUsers');
    const parameter = operation?.parameters.find((candidate) => candidate.name === 'page');

    expect(parameter?.schema.type).toBe('integer');
    expect(parameter?.schema.additionalProperties).toBeUndefined();
  });

  it('does not stamp additionalProperties onto array schemas or array items', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.1.0',
      info: { title: 'Arrays', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'listUsers',
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = buildIR(doc);
    const operation = result.operations.find((candidate) => candidate.operationId === 'listUsers');
    const responseContent = operation?.responses.find((candidate) => candidate.statusCode === '200')
      ?.content?.['application/json'];
    const responseSchema =
      responseContent && !isReferenceObject(responseContent) ? responseContent.schema : undefined;

    expect(responseSchema?.type).toBe('array');
    expect(responseSchema?.additionalProperties).toBeUndefined();
    expect(responseSchema?.items).toBeDefined();
    if (Array.isArray(responseSchema?.items)) {
      throw new Error('Expected array response to use a single items schema');
    }
    expect(responseSchema?.items?.additionalProperties).toBeUndefined();
  });
});

function createLooseRawSurfaceDoc(): OpenAPIDocument {
  const looseObjectSchema = {
    type: 'object',
    additionalProperties: true,
    properties: {
      name: { type: 'string' },
    },
  } satisfies SchemaObject;

  const doc = {
    openapi: '3.1.0',
    info: { title: 'Raw surfaces', version: '1.0.0' },
    paths: {},
    components: {
      headers: {
        LooseHeader: {
          required: false,
          schema: structuredClone(looseObjectSchema),
        },
      },
      callbacks: {
        LooseCallback: {
          '{$request.body#/callbackUrl}': {
            post: {
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: structuredClone(looseObjectSchema),
                  },
                },
              },
              responses: {
                '200': { description: 'ok' },
              },
            },
          },
        },
      },
      pathItems: {
        LoosePath: {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: structuredClone(looseObjectSchema),
                  },
                },
              },
            },
          },
        },
      },
    },
    webhooks: {
      notify: {
        post: {
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: structuredClone(looseObjectSchema),
              },
            },
          },
          responses: {
            '200': { description: 'ok' },
          },
        },
      },
    },
  } satisfies OpenAPIDocument;

  return doc;
}

function createStrictRawSurfaceDocWithExamplePayload(): OpenAPIDocument {
  const strictObjectSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      metadata: {
        type: 'string',
        example: {
          required: ['example-only'],
        },
      },
    },
  } satisfies SchemaObject;

  return {
    openapi: '3.1.0',
    info: { title: 'Raw surface examples', version: '1.0.0' },
    paths: {},
    components: {
      pathItems: {
        StrictPath: {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: strictObjectSchema,
                  },
                },
              },
            },
          },
        },
      },
    },
  } satisfies OpenAPIDocument;
}

function createLooseRawQuerySurfaceDoc(): OpenAPIDocument {
  const looseObjectSchema = {
    type: 'object',
    additionalProperties: true,
    properties: {
      name: { type: 'string' },
    },
  } satisfies SchemaObject;

  return {
    openapi: '3.2.0',
    info: { title: 'Raw query surfaces', version: '1.0.0' },
    paths: {},
    components: {
      pathItems: {
        LooseQueryPath: {
          query: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: structuredClone(looseObjectSchema),
                  },
                },
              },
            },
          },
        },
      },
    },
    webhooks: {
      notify: {
        query: {
          responses: {
            '200': {
              description: 'ok',
              content: {
                'application/json': {
                  schema: structuredClone(looseObjectSchema),
                },
              },
            },
          },
        },
      },
    },
  } satisfies OpenAPIDocument;
}

describe('buildIR raw OpenAPI non-strict object enforcement', () => {
  it('rejects non-strict object schemas on raw OpenAPI surfaces', () => {
    expect(() => buildIR(createLooseRawSurfaceDoc())).toThrow(
      /additionalProperties: true.*rejected/,
    );
  });

  it('rejects non-strict object schemas on raw query path-item and webhook surfaces', () => {
    expect(() => buildIR(createLooseRawQuerySurfaceDoc())).toThrow(
      /additionalProperties: true.*rejected/,
    );
  });

  it('ignores example payload objects when enforcing raw OpenAPI surface object policy', () => {
    expect(() => buildIR(createStrictRawSurfaceDocWithExamplePayload())).not.toThrow();
  });
});
