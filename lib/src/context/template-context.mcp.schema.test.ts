import { describe, expect, test } from 'vitest';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import {
  buildInputSchemaObject,
  buildOutputSchemaObject,
  buildMcpToolSchemas,
} from './template-context.mcp.js';
import type { HttpMethod } from '../endpoints/definition.types.js';

const baseSchema: SchemaObject = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
};

describe('template-context MCP schema helpers', () => {
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
});
