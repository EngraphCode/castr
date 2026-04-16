import { describe, expect, it } from 'vitest';
import {
  type ComponentsObject,
  type OpenAPIDocument,
  type SchemaObject,
  isReferenceObject,
} from '../../../shared/openapi-types.js';

import { buildCastrSchemas, buildIR } from './index.js';
import { assertSchemaComponent } from '../../ir/index.js';

function assertSchemaValuedAdditionalPropertiesString(
  schema: SchemaObject,
  expectedDescription?: string,
): void {
  if (
    typeof schema.additionalProperties === 'boolean' ||
    schema.additionalProperties === undefined ||
    isReferenceObject(schema.additionalProperties)
  ) {
    throw new Error('Expected schema-valued additionalProperties.');
  }

  expect(schema.additionalProperties.type).toBe('string');
  if (expectedDescription !== undefined) {
    expect(schema.additionalProperties.description).toBe(expectedDescription);
  }
}

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

  it('preserves explicit additionalProperties: true', () => {
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

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(true);
  });

  it('preserves schema-valued additionalProperties', () => {
    const components: ComponentsObject = {
      schemas: {
        CatchallObject: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(typeof schema.additionalProperties).toBe('object');
    expect(Array.isArray(schema.additionalProperties)).toBe(false);
    if (
      typeof schema.additionalProperties === 'boolean' ||
      schema.additionalProperties === undefined
    ) {
      throw new Error('Expected schema-valued additionalProperties to be preserved.');
    }
    expect(schema.additionalProperties.type).toBe('string');
  });

  it('keeps additionalProperties undefined when omitted on object schemas', () => {
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

    expect(schema.additionalProperties).toBeUndefined();
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

function createSchemaValuedRawSurfaceDoc(): OpenAPIDocument {
  const looseObjectSchema = {
    type: 'object',
    additionalProperties: {
      type: 'string',
      description: 'free-form extra value',
    },
    properties: {
      name: { type: 'string' },
    },
  } satisfies SchemaObject;

  return {
    openapi: '3.1.0',
    info: { title: 'Raw surfaces with schema-valued catchall', version: '1.0.0' },
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

function createSchemaValuedRawQuerySurfaceDoc(): OpenAPIDocument {
  const looseObjectSchema = {
    type: 'object',
    additionalProperties: {
      type: 'string',
      description: 'free-form extra value',
    },
    properties: {
      name: { type: 'string' },
    },
  } satisfies SchemaObject;

  return {
    openapi: '3.2.0',
    info: { title: 'Raw query surfaces with schema-valued catchall', version: '1.0.0' },
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

describe('buildIR raw OpenAPI explicit additionalProperties support', () => {
  it('preserves explicit additionalProperties on raw OpenAPI surfaces in IR', () => {
    const result = buildIR(createLooseRawSurfaceDoc());
    const header = result.components.find(
      (component) => component.type === 'header' && component.name === 'LooseHeader',
    );
    const callback = result.components.find(
      (component) => component.type === 'callback' && component.name === 'LooseCallback',
    );
    const pathItem = result.components.find(
      (component) => component.type === 'pathItem' && component.name === 'LoosePath',
    );

    expect(header?.type).toBe('header');
    if (!header || header.type !== 'header') {
      throw new Error('Expected LooseHeader header component.');
    }
    if (isReferenceObject(header.header)) {
      throw new Error('Expected concrete header object.');
    }
    if (header.header.schema === undefined || isReferenceObject(header.header.schema)) {
      throw new Error('Expected concrete header schema.');
    }
    expect(header.header.schema.additionalProperties).toBe(true);

    expect(callback?.type).toBe('callback');
    if (!callback || callback.type !== 'callback') {
      throw new Error('Expected LooseCallback callback component.');
    }
    if (isReferenceObject(callback.callback)) {
      throw new Error('Expected concrete callback object.');
    }
    const callbackPathItem = callback.callback['{$request.body#/callbackUrl}'];
    if (callbackPathItem === undefined || isReferenceObject(callbackPathItem)) {
      throw new Error('Expected concrete callback path-item.');
    }
    const callbackRequestBody = callbackPathItem.post?.requestBody;
    if (callbackRequestBody === undefined || isReferenceObject(callbackRequestBody)) {
      throw new Error('Expected concrete callback request body.');
    }
    const callbackSchema = callbackRequestBody.content?.['application/json'];
    if (callbackSchema === undefined || isReferenceObject(callbackSchema)) {
      throw new Error('Expected callback content schema.');
    }
    if (callbackSchema.schema === undefined || isReferenceObject(callbackSchema.schema)) {
      throw new Error('Expected concrete callback content schema.');
    }
    expect(callbackSchema.schema.additionalProperties).toBe(true);

    expect(pathItem?.type).toBe('pathItem');
    if (!pathItem || pathItem.type !== 'pathItem') {
      throw new Error('Expected LoosePath pathItem component.');
    }
    if (isReferenceObject(pathItem.pathItem)) {
      throw new Error('Expected concrete path-item object.');
    }
    const response = pathItem.pathItem.get?.responses?.['200'];
    if (response === undefined || isReferenceObject(response)) {
      throw new Error('Expected concrete path-item response object.');
    }
    const responseSchema = response.content?.['application/json'];
    if (responseSchema === undefined || isReferenceObject(responseSchema)) {
      throw new Error('Expected path-item response content schema.');
    }
    if (responseSchema.schema === undefined || isReferenceObject(responseSchema.schema)) {
      throw new Error('Expected concrete path-item response schema.');
    }
    expect(responseSchema.schema.additionalProperties).toBe(true);
  });

  it('preserves explicit additionalProperties on raw query path-item and webhook surfaces', () => {
    const result = buildIR(createLooseRawQuerySurfaceDoc());
    const pathItem = result.components.find(
      (component) => component.type === 'pathItem' && component.name === 'LooseQueryPath',
    );

    expect(pathItem?.type).toBe('pathItem');
    if (!pathItem || pathItem.type !== 'pathItem') {
      throw new Error('Expected LooseQueryPath pathItem component.');
    }
    if (isReferenceObject(pathItem.pathItem)) {
      throw new Error('Expected concrete query path-item object.');
    }
    const queryResponse = pathItem.pathItem.query?.responses?.['200'];
    if (queryResponse === undefined || isReferenceObject(queryResponse)) {
      throw new Error('Expected concrete query response object.');
    }
    const queryResponseSchema = queryResponse.content?.['application/json'];
    if (queryResponseSchema === undefined || isReferenceObject(queryResponseSchema)) {
      throw new Error('Expected path-item query response content schema.');
    }
    if (queryResponseSchema.schema === undefined || isReferenceObject(queryResponseSchema.schema)) {
      throw new Error('Expected concrete path-item query response schema.');
    }
    expect(queryResponseSchema.schema.additionalProperties).toBe(true);
    if (result.webhooks === undefined) {
      throw new Error('Expected webhook map.');
    }
    const webhook = result.webhooks.get('notify');
    const webhookResponse = webhook?.query?.responses?.['200'];
    if (webhookResponse === undefined || isReferenceObject(webhookResponse)) {
      throw new Error('Expected concrete webhook response object.');
    }
    const webhookSchema = webhookResponse.content?.['application/json'];
    if (webhookSchema === undefined || isReferenceObject(webhookSchema)) {
      throw new Error('Expected webhook query response content schema.');
    }
    if (webhookSchema.schema === undefined || isReferenceObject(webhookSchema.schema)) {
      throw new Error('Expected concrete webhook response schema.');
    }
    expect(webhookSchema.schema.additionalProperties).toBe(true);
  });

  it('preserves schema-valued additionalProperties on raw OpenAPI surfaces in IR', () => {
    const result = buildIR(createSchemaValuedRawSurfaceDoc());
    const header = result.components.find(
      (component) => component.type === 'header' && component.name === 'LooseHeader',
    );
    const callback = result.components.find(
      (component) => component.type === 'callback' && component.name === 'LooseCallback',
    );
    const pathItem = result.components.find(
      (component) => component.type === 'pathItem' && component.name === 'LoosePath',
    );

    if (!header || header.type !== 'header' || isReferenceObject(header.header)) {
      throw new Error('Expected concrete LooseHeader header component.');
    }
    if (header.header.schema === undefined || isReferenceObject(header.header.schema)) {
      throw new Error('Expected concrete LooseHeader header schema.');
    }
    assertSchemaValuedAdditionalPropertiesString(header.header.schema, 'free-form extra value');

    if (!callback || callback.type !== 'callback' || isReferenceObject(callback.callback)) {
      throw new Error('Expected concrete LooseCallback callback component.');
    }
    const callbackPathItem = callback.callback['{$request.body#/callbackUrl}'];
    if (callbackPathItem === undefined || isReferenceObject(callbackPathItem)) {
      throw new Error('Expected concrete callback path-item.');
    }
    const callbackRequestBody = callbackPathItem.post?.requestBody;
    if (callbackRequestBody === undefined || isReferenceObject(callbackRequestBody)) {
      throw new Error('Expected concrete callback request body.');
    }
    const callbackSchema = callbackRequestBody.content?.['application/json'];
    if (callbackSchema === undefined || isReferenceObject(callbackSchema)) {
      throw new Error('Expected callback content schema.');
    }
    if (callbackSchema.schema === undefined || isReferenceObject(callbackSchema.schema)) {
      throw new Error('Expected concrete callback content schema.');
    }
    assertSchemaValuedAdditionalPropertiesString(callbackSchema.schema, 'free-form extra value');

    if (!pathItem || pathItem.type !== 'pathItem' || isReferenceObject(pathItem.pathItem)) {
      throw new Error('Expected concrete LoosePath pathItem component.');
    }
    const response = pathItem.pathItem.get?.responses?.['200'];
    if (response === undefined || isReferenceObject(response)) {
      throw new Error('Expected concrete path-item response object.');
    }
    const responseSchema = response.content?.['application/json'];
    if (responseSchema === undefined || isReferenceObject(responseSchema)) {
      throw new Error('Expected path-item response content schema.');
    }
    if (responseSchema.schema === undefined || isReferenceObject(responseSchema.schema)) {
      throw new Error('Expected concrete path-item response schema.');
    }
    assertSchemaValuedAdditionalPropertiesString(responseSchema.schema, 'free-form extra value');
  });

  it('preserves schema-valued additionalProperties on raw query path-item and webhook surfaces', () => {
    const result = buildIR(createSchemaValuedRawQuerySurfaceDoc());
    const pathItem = result.components.find(
      (component) => component.type === 'pathItem' && component.name === 'LooseQueryPath',
    );

    if (!pathItem || pathItem.type !== 'pathItem' || isReferenceObject(pathItem.pathItem)) {
      throw new Error('Expected concrete LooseQueryPath pathItem component.');
    }
    const queryResponse = pathItem.pathItem.query?.responses?.['200'];
    if (queryResponse === undefined || isReferenceObject(queryResponse)) {
      throw new Error('Expected concrete query response object.');
    }
    const queryResponseSchema = queryResponse.content?.['application/json'];
    if (queryResponseSchema === undefined || isReferenceObject(queryResponseSchema)) {
      throw new Error('Expected path-item query response content schema.');
    }
    if (queryResponseSchema.schema === undefined || isReferenceObject(queryResponseSchema.schema)) {
      throw new Error('Expected concrete path-item query response schema.');
    }
    assertSchemaValuedAdditionalPropertiesString(
      queryResponseSchema.schema,
      'free-form extra value',
    );

    if (result.webhooks === undefined) {
      throw new Error('Expected webhook map.');
    }
    const webhook = result.webhooks.get('notify');
    const webhookResponse = webhook?.query?.responses?.['200'];
    if (webhookResponse === undefined || isReferenceObject(webhookResponse)) {
      throw new Error('Expected concrete webhook response object.');
    }
    const webhookSchema = webhookResponse.content?.['application/json'];
    if (webhookSchema === undefined || isReferenceObject(webhookSchema)) {
      throw new Error('Expected webhook query response content schema.');
    }
    if (webhookSchema.schema === undefined || isReferenceObject(webhookSchema.schema)) {
      throw new Error('Expected concrete webhook response schema.');
    }
    assertSchemaValuedAdditionalPropertiesString(webhookSchema.schema, 'free-form extra value');
  });

  it('ignores example payload objects when enforcing raw OpenAPI surface object policy', () => {
    expect(() => buildIR(createStrictRawSurfaceDocWithExamplePayload())).not.toThrow();
  });
});
