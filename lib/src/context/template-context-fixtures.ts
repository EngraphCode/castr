import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';

/**
 * Creates a minimal OpenAPI document with a single endpoint
 */
export function createMinimalDoc(
  path: string,
  operationId: string,
  responseSchema: SchemaObject | { $ref: string },
): OpenAPIObject {
  return {
    openapi: '3.0.3',
    info: { version: '1', title: 'Test API' },
    paths: {
      [path]: {
        get: {
          operationId,
          responses: {
            '200': {
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

/**
 * Creates an OpenAPI document with specified schemas
 */
export function createDocWithSchemas(schemas: Record<string, SchemaObject>): OpenAPIObject {
  return {
    openapi: '3.0.3',
    info: { version: '1', title: 'Test API' },
    paths: {},
    components: {
      schemas,
    },
  };
}

/**
 * Creates an OpenAPI document with schemas and a path that references a schema
 */
export function createDocWithSchemaRef(
  path: string,
  operationId: string,
  schemaRef: string,
  schemas: Record<string, SchemaObject>,
): OpenAPIObject {
  return {
    openapi: '3.0.3',
    info: { version: '1', title: 'Test API' },
    paths: {
      [path]: {
        get: {
          operationId,
          responses: {
            '200': {
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

/**
 * Creates an OpenAPI document with a path and tags
 */
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
): OpenAPIObject {
  const pathItems: OpenAPIObject['paths'] = {};

  for (const [path, config] of Object.entries(paths)) {
    pathItems[path] = {
      get: {
        operationId: config.operationId,
        tags: config.tags,
        responses: {
          '200': {
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
