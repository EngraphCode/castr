import { z } from 'zod';
// Endpoints
export const endpoints = [
  {
    method: 'post',
    path: '/streams',
    requestFormat: 'json',
    parameters: [
      {
        name: 'callbackUrl',
        type: 'Query',
        schema: z
          .string()
          .url()
          .meta({ examples: ['https://tonys-server.com'] }),
        description:
          'the location where data will be sent.  Must be network accessible\nby the source server\n',
      },
    ],
    response: z
      .object({
        subscriptionId: z.string().meta({
          description: 'this unique identifier allows management of the subscription',
          examples: ['2531329f-fb09-4ef7-887e-84e648214436'],
        }),
      })
      .strict()
      .meta({ description: 'subscription information' }),
    errors: [],
    responses: {
      201: {
        schema: z
          .object({
            subscriptionId: z.string().meta({
              description: 'this unique identifier allows management of the subscription',
              examples: ['2531329f-fb09-4ef7-887e-84e648214436'],
            }),
          })
          .strict()
          .meta({ description: 'subscription information' }),
        description: 'subscription successfully created',
      },
    },
    request: {
      queryParams: z
        .object({
          callbackUrl: z
            .string()
            .url()
            .meta({ examples: ['https://tonys-server.com'] }),
        })
        .strict(),
    },
    description: 'subscribes a client to receive out-of-band data',
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: 'post_streams',
      description: 'subscribes a client to receive out-of-band data',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'object',
            properties: {
              callbackUrl: {
                type: 'string',
                format: 'uri',
                examples: ['https://tonys-server.com'],
              },
            },
            required: ['callbackUrl'],
          },
        },
        required: ['query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          subscriptionId: {
            type: 'string',
            description: 'this unique identifier allows management of the subscription',
            examples: ['2531329f-fb09-4ef7-887e-84e648214436'],
          },
        },
        required: ['subscriptionId'],
        description: 'subscription information',
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'post',
      path: '/streams',
      originalPath: '/streams',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
] as const;
