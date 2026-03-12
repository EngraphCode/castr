import { describe, expect, it } from 'vitest';
import type { ComponentsObject, OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';

import { buildCastrSchemas, buildIR } from './index.js';
import { assertSchemaComponent } from '../../ir/index.js';
import { isRecord } from '../../../shared/type-utils/types.js';

describe('buildCastrSchemas object keyword preservation', () => {
  it('should preserve strict unknown-key behavior from additionalProperties false', () => {
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
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strict' });
  });

  it('rejects omitted object strictness by default with the compatibility hint', () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          LooseObject: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    } as const;

    expect(() => buildIR(doc)).toThrow(/strict object ingest is the default/);
    expect(() => buildIR(doc)).toThrow(/nonStrictObjectPolicy: 'strip'/);
  });

  it('normalizes omitted object strictness to strip when nonStrictObjectPolicy is strip', () => {
    const components: ComponentsObject = {
      schemas: {
        LooseObject: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    };

    const result = buildCastrSchemas(components, { nonStrictObjectPolicy: 'strip' });
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(true);
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('normalizes schema-valued additionalProperties to strip in compatibility mode', () => {
    const components: ComponentsObject = {
      schemas: {
        CatchallObject: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    };

    const result = buildCastrSchemas(components, { nonStrictObjectPolicy: 'strip' });
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(true);
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('discards schema-valued additionalProperties payloads before parsing them in compatibility mode', () => {
    const components: ComponentsObject = {
      schemas: {
        CatchallObject: {
          type: 'object',
          additionalProperties: {
            type: 'string',
            additionalProperties: true,
          },
        },
      },
    };

    const result = buildCastrSchemas(components, { nonStrictObjectPolicy: 'strip' });
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(true);
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strip' });
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
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strict' });
  });

  it('rejects strip extension input by default with the compatibility hint', () => {
    const components: ComponentsObject = {
      schemas: {
        StripObject: {
          type: 'object',
          additionalProperties: true,
          'x-castr-unknownKeyBehavior': 'strip',
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(/strict object ingest is the default/);
    expect(() => buildCastrSchemas(components)).toThrow(/nonStrictObjectPolicy: 'strip'/);
  });

  it('rejects passthrough extension input by default with the compatibility hint', () => {
    const components: ComponentsObject = {
      schemas: {
        PassthroughObject: {
          type: 'object',
          additionalProperties: true,
          'x-castr-unknownKeyBehavior': 'passthrough',
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(/strict object ingest is the default/);
    expect(() => buildCastrSchemas(components)).toThrow(/nonStrictObjectPolicy: 'strip'/);
  });

  it('normalizes passthrough extension input to strip in compatibility mode', () => {
    const components: ComponentsObject = {
      schemas: {
        PassthroughObject: {
          type: 'object',
          additionalProperties: true,
          'x-castr-unknownKeyBehavior': 'passthrough',
        },
      },
    };

    const result = buildCastrSchemas(components, { nonStrictObjectPolicy: 'strip' });
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(true);
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('rejects schema-valued additionalProperties by default with the compatibility hint', () => {
    const components: ComponentsObject = {
      schemas: {
        CatchallObject: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(/strict object ingest is the default/);
    expect(() => buildCastrSchemas(components)).toThrow(/nonStrictObjectPolicy: 'strip'/);
  });

  it('should reject invalid x-castr-unknownKeyBehavior values', () => {
    const components: ComponentsObject = {
      schemas: {
        InvalidObject: {
          type: 'object',
          additionalProperties: true,
          'x-castr-unknownKeyBehavior': 'strict',
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(
      /Invalid x-castr-unknownKeyBehavior value "strict"/,
    );
  });

  it('should reject x-castr-unknownKeyBehavior without additionalProperties true', () => {
    const components: ComponentsObject = {
      schemas: {
        InvalidObject: {
          type: 'object',
          'x-castr-unknownKeyBehavior': 'passthrough',
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(
      /x-castr-unknownKeyBehavior requires additionalProperties: true/,
    );
  });

  it('should reject object-only keywords on non-object schemas', () => {
    const components: ComponentsObject = {
      schemas: {
        InvalidString: {
          type: 'string',
          additionalProperties: true,
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(
      /Object-only keywords properties, required, additionalProperties, and x-castr-unknownKeyBehavior require an object schema type/,
    );
  });
});

function createLooseRawSurfaceDoc(): OpenAPIObject {
  const looseObjectSchema = {
    type: 'object',
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
  } satisfies OpenAPIObject;

  return doc;
}

function createStrictRawSurfaceDocWithExamplePayload(): OpenAPIObject {
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
  } satisfies OpenAPIObject;
}

function expectRawSchemaStripNormalized(schema: unknown): void {
  expect(schema).toMatchObject({
    type: 'object',
    additionalProperties: true,
    'x-castr-unknownKeyBehavior': 'strip',
  });
}

function getNestedRecordProperty(value: unknown, key: string): unknown {
  if (!isRecord(value)) {
    return undefined;
  }

  return value[key];
}

function getHeaderSchema(header: unknown): unknown {
  return getNestedRecordProperty(header, 'schema');
}

function getApplicationJsonSchema(container: unknown): unknown {
  return getNestedRecordProperty(getNestedRecordProperty(container, 'application/json'), 'schema');
}

function getCallbackSchema(callback: unknown): unknown {
  return getNestedRecordProperty(
    getNestedRecordProperty(
      getNestedRecordProperty(
        getNestedRecordProperty(callback, '{$request.body#/callbackUrl}'),
        'post',
      ),
      'requestBody',
    ),
    'content',
  );
}

function getPathItemSchema(pathItem: unknown): unknown {
  return getApplicationJsonSchema(
    getNestedRecordProperty(
      getNestedRecordProperty(
        getNestedRecordProperty(getNestedRecordProperty(pathItem, 'get'), 'responses'),
        '200',
      ),
      'content',
    ),
  );
}

function getWebhookSchema(webhook: unknown): unknown {
  return getApplicationJsonSchema(
    getNestedRecordProperty(
      getNestedRecordProperty(getNestedRecordProperty(webhook, 'post'), 'requestBody'),
      'content',
    ),
  );
}

describe('buildIR raw OpenAPI non-strict object enforcement', () => {
  it('rejects non-strict object schemas on raw OpenAPI surfaces by default', () => {
    expect(() => buildIR(createLooseRawSurfaceDoc())).toThrow(
      /strict object ingest is the default/,
    );
  });

  it('normalizes non-strict object schemas on raw OpenAPI surfaces in compatibility mode', () => {
    const ir = buildIR(createLooseRawSurfaceDoc(), { nonStrictObjectPolicy: 'strip' });

    const headerComponent = ir.components.find((component) => component.type === 'header');
    if (!headerComponent || headerComponent.type !== 'header') {
      throw new Error('Expected header component');
    }
    expectRawSchemaStripNormalized(getHeaderSchema(headerComponent.header));

    const callbackComponent = ir.components.find((component) => component.type === 'callback');
    if (!callbackComponent || callbackComponent.type !== 'callback') {
      throw new Error('Expected callback component');
    }
    expectRawSchemaStripNormalized(
      getApplicationJsonSchema(getCallbackSchema(callbackComponent.callback)),
    );

    const pathItemComponent = ir.components.find((component) => component.type === 'pathItem');
    if (!pathItemComponent || pathItemComponent.type !== 'pathItem') {
      throw new Error('Expected pathItem component');
    }
    expectRawSchemaStripNormalized(getPathItemSchema(pathItemComponent.pathItem));

    expectRawSchemaStripNormalized(getWebhookSchema(ir.webhooks?.get('notify')));
  });

  it('ignores example payload objects when enforcing raw OpenAPI surface object policy', () => {
    expect(() => buildIR(createStrictRawSurfaceDocWithExamplePayload())).not.toThrow();
  });
});
