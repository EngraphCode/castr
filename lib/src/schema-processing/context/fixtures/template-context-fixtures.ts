import type { OpenAPIDocument, SchemaObject } from '../../../shared/openapi-types.js';

export function createMinimalDoc(
  path: string,
  operationId: string,
  responseSchema: SchemaObject | { $ref: string },
): OpenAPIDocument {
  return {
    openapi: '3.0.3',
    info: { version: '1', title: 'Test API' },
    paths: {
      [path]: {
        get: {
          operationId,
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: responseSchema,
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {},
    },
  };
}

export function createDocWithSchemas(schemas: Record<string, SchemaObject>): OpenAPIDocument {
  return {
    openapi: '3.0.3',
    info: { version: '1', title: 'Test API' },
    paths: {},
    components: {
      schemas,
    },
  };
}

export function createDocWithSchemaRef(
  path: string,
  operationId: string,
  schemaRef: string,
  schemas: Record<string, SchemaObject>,
): OpenAPIDocument {
  return {
    openapi: '3.0.3',
    info: { version: '1', title: 'Test API' },
    paths: {
      [path]: {
        get: {
          operationId,
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: { $ref: schemaRef },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas,
    },
  };
}

export function createDocWithTags(
  paths: Record<
    string,
    {
      operationId: string;
      tags: string[];
      responseSchema?: SchemaObject | { $ref: string };
    }
  >,
  schemas: Record<string, SchemaObject> = {},
): OpenAPIDocument {
  const pathItems: OpenAPIDocument['paths'] = {};

  for (const [path, config] of Object.entries(paths)) {
    pathItems[path] = {
      get: {
        operationId: config.operationId,
        tags: config.tags,
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: config.responseSchema ?? { type: 'string' },
              },
            },
          },
        },
      },
    };
  }

  return {
    openapi: '3.0.3',
    info: { version: '1', title: 'Test API' },
    paths: pathItems,
    components: {
      schemas,
    },
  };
}
