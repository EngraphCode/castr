import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { beforeAll, describe, expect, test } from 'vitest';

import { getZodClientTemplateContext } from '../template-context.js';

const mcpToolsDoc: OpenAPIObject = {
  openapi: '3.1.0',
  info: { version: '1.0.0', title: 'Test API' },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
  paths: {
    '/users/{userId}': {
      parameters: [
        {
          name: 'request-id',
          in: 'header',
          schema: { type: 'string' },
        },
      ],
      get: {
        operationId: 'getUser',
        summary: 'Retrieve a user',
        description: 'Fetch a single user record.',
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
        responses: {
          '200': {
            description: 'User found',
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
      post: {
        summary: 'Create a user session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['active'],
                properties: {
                  active: { type: 'boolean' },
                },
              },
            },
          },
        },
        security: [],
        responses: {
          '201': {
            description: 'Session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token'],
                  properties: {
                    token: { type: 'string' },
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

let context: ReturnType<typeof getZodClientTemplateContext>;

const findMcpToolByMethod = (method: 'get' | 'post') =>
  context.mcpTools?.find((entry) => entry.httpOperation.method === method);

describe('getZodClientTemplateContext - MCP tools', () => {
  beforeAll(() => {
    context = getZodClientTemplateContext(mcpToolsDoc);
  });

  test('collects MCP tool entries for each operation', () => {
    expect(context.mcpTools).toBeDefined();
    expect(context.mcpTools).toHaveLength(2);
  });

  test('builds metadata for GET operations', () => {
    const getTool = findMcpToolByMethod('get');
    expect(getTool).toBeDefined();
    expect(getTool?.tool.name).toBe('get_user');
    expect(getTool?.tool.title).toBe('Retrieve a user');
    expect(getTool?.tool.description).toBe('Fetch a single user record.');
    expect(getTool?.tool.annotations).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
    });
    expect(getTool?.tool.inputSchema).toMatchObject({
      type: 'object',
      properties: {
        path: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: {
              type: 'string',
            },
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
            'request-id': { type: 'string' },
          },
        },
      },
    });
    expect(getTool?.security).toMatchObject({
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

  test('builds metadata for POST operations', () => {
    const postTool = findMcpToolByMethod('post');
    expect(postTool).toBeDefined();
    expect(postTool?.tool.name).toBe('post_users_user_id');
    expect(postTool?.tool.annotations).toEqual({
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    });
    expect(postTool?.tool.inputSchema).toMatchObject({
      type: 'object',
      properties: {
        body: {
          type: 'object',
          required: ['active'],
          properties: {
            active: { type: 'boolean' },
          },
        },
      },
      required: expect.arrayContaining(['body']),
    });
    expect(postTool?.security).toMatchObject({
      isPublic: true,
      requirementSets: [],
    });
  });
});
