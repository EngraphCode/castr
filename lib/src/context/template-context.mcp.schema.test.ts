import { describe, expect, test } from 'vitest';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import {
  buildInputSchemaObject,
  buildOutputSchemaObject,
  buildMcpToolSchemas,
} from './template-context.mcp.js';
import { getTemplateContext } from './template-context.js';
import {
  createParameterSectionSchema,
  type ParameterAccumulator,
} from './template-context.mcp.parameters.js';
import type { HttpMethod } from '../endpoints/definition.types.js';

const baseSchema: SchemaObject = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
};

describe('template-context MCP schema helpers', () => {
  describe('createParameterSectionSchema', () => {
    test('omits required property when there are no required parameters', () => {
      const accumulator: ParameterAccumulator = {
        properties: {
          include: { type: 'string' },
        },
        required: new Set(),
      };

      const schema = createParameterSectionSchema(accumulator);

      expect(schema).toEqual({
        type: 'object',
        properties: {
          include: { type: 'string' },
        },
      });
      expect(Object.hasOwn(schema, 'required')).toBe(false);
    });
  });

  describe('buildInputSchemaObject', () => {
    test('returns the input when already object typed', () => {
      expect(buildInputSchemaObject(baseSchema)).toEqual(baseSchema);
    });

    test('wraps primitives to enforce object type', () => {
      const primitive: SchemaObject = { type: 'string' };
      expect(buildInputSchemaObject(primitive)).toEqual({
        type: 'object',
        properties: {
          value: primitive,
        },
      });
    });

    test('wraps undefined schema as empty object schema', () => {
      expect(buildInputSchemaObject(undefined)).toEqual({
        type: 'object',
      });
    });
  });

  describe('buildOutputSchemaObject', () => {
    test('returns object schemas unchanged', () => {
      expect(buildOutputSchemaObject(baseSchema)).toEqual(baseSchema);
    });

    test('wraps primitive outputs and includes value property', () => {
      const primitive: SchemaObject = { type: 'integer' };
      expect(buildOutputSchemaObject(primitive)).toEqual({
        type: 'object',
        properties: {
          value: primitive,
        },
      });
    });

    test('wraps undefined output with passthrough object', () => {
      expect(buildOutputSchemaObject(undefined)).toEqual({
        type: 'object',
      });
    });
  });
});

describe('buildMcpToolSchemas', () => {
  const document: OpenAPIObject = {
    openapi: '3.1.0',
    info: { title: 'Test', version: '1.0.0' },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
      '/users/{userId}': {
        parameters: [
          {
            name: 'accept-language',
            in: 'header',
            schema: { type: 'string' },
          },
        ],
        post: {
          operationId: 'createUserSession',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'include',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    active: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  test('builds input/output schemas and security metadata', () => {
    const result = buildMcpToolSchemas({
      document,
      path: '/users/{userId}',
      method: 'post' satisfies HttpMethod,
    });

    expect(result.inputSchema).toMatchObject({
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' },
          },
        },
        query: {
          type: 'object',
          properties: {
            include: { type: 'string' },
          },
        },
        headers: {
          type: 'object',
          properties: {
            'accept-language': { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            active: { type: 'boolean' },
          },
        },
      },
    });

    expect(result.outputSchema).toMatchObject({
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
      },
    });

    expect(result.security).toMatchObject({
      isPublic: false,
      usesGlobalSecurity: true,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'ApiKeyAuth',
              scopes: [],
            },
          ],
        },
      ],
    });
  });

  test('inlines referenced schemas when building manifest tool schemas', () => {
    const refDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Ref Example', version: '1.0.0' },
      components: {
        schemas: {
          Pet: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/pets/{petId}': {
          get: {
            operationId: 'getPet',
            parameters: [
              {
                name: 'petId',
                in: 'path',
                required: true,
                schema: { type: 'integer' },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Pet' },
                  },
                },
              },
            },
          },
        },
      },
    };

    const { inputSchema, outputSchema } = buildMcpToolSchemas({
      document: refDoc,
      path: '/pets/{petId}',
      method: 'get',
    });

    expect(JSON.stringify(inputSchema)).not.toContain('"$ref"');
    expect(JSON.stringify(outputSchema)).not.toContain('"$ref"');
  });

  test('marks required request body sections and inlines component refs', () => {
    const refDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Profiles', version: '1.0.0' },
      components: {
        schemas: {
          ProfileInput: {
            type: 'object',
            required: ['displayName'],
            properties: {
              displayName: { type: 'string' },
              biography: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/profiles/{profileId}': {
          put: {
            operationId: 'updateProfile',
            parameters: [
              {
                name: 'profileId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProfileInput' },
                },
              },
            },
            responses: {
              '204': {
                description: 'Updated',
              },
            },
          },
        },
      },
    };

    const { inputSchema } = buildMcpToolSchemas({
      document: refDoc,
      path: '/profiles/{profileId}',
      method: 'put',
    });

    expect(inputSchema).toMatchObject({
      type: 'object',
      required: ['path', 'body'],
    });
    expect(typeof inputSchema).not.toBe('boolean');
    if (typeof inputSchema === 'boolean') {
      throw new Error('Expected object schema');
    }

    const bodySchema = inputSchema['properties']?.body;
    expect(bodySchema).toBeDefined();
    if (!bodySchema || typeof bodySchema !== 'object') {
      throw new Error('Expected body schema object');
    }

    expect('properties' in bodySchema ? bodySchema.properties : undefined).toBeDefined();
    expect(JSON.stringify(inputSchema)).not.toContain('"$ref"');
  });
});

describe('buildMcpTools', () => {
  test('retains templated and original paths while resolving dotted parameters', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Profiles', version: '1.0.0' },
      paths: {
        '/users/{userId}/profiles/{profile.id}': {
          get: {
            operationId: 'showProfile',
            summary: 'Get profile',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
              {
                name: 'profile.id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Profile',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const context = getTemplateContext(doc);
    const profileTool = context.mcpTools.find((tool) => tool.operationId === 'showProfile');

    expect(profileTool).toBeDefined();
    expect(profileTool?.httpOperation.path).toBe('/users/:userId/profiles/:profileId');
    expect(profileTool?.httpOperation.originalPath).toBe('/users/{userId}/profiles/{profile.id}');
    expect(profileTool?.httpOperation.method).toBe('get');
    expect(profileTool?.tool.name).toBe('show_profile');
    expect(JSON.stringify(profileTool?.tool)).not.toContain('"$ref"');
  });
});
