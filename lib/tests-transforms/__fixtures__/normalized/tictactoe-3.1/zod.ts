import { z } from 'zod';
// Type Definitions
export type errorMessage = string;
export type coordinate = number;
export type mark = string;
export type board = mark[][];
export type winner = string;
export type status = {
  winner?: winner;
  board?: board;
};
// Zod Schemas
export const errorMessage = z
  .string()
  .max(256)
  .meta({ description: 'A text message describing an error' });
export const coordinate = z
  .number()
  .min(1)
  .max(3)
  .int()
  .meta({ examples: [1] });
export const mark = z.enum(['.', 'X', 'O']).meta({
  description: 'Possible values for a board square. `.` means empty square.',
  examples: ['.'],
});
export const board = z.array(z.array(mark).min(3).max(3)).min(3).max(3);
export const winner = z.enum(['.', 'X', 'O']).meta({
  description: 'Winner of the game. `.` means nobody has won yet.',
  examples: ['.'],
});
export const status = z
  .object({
    winner: winner.optional(),
    board: board.optional(),
  })
  .strict();
// Endpoints
export const endpoints = [
  {
    method: 'get',
    path: '/board',
    requestFormat: 'json',
    parameters: [],
    response: status,
    errors: [],
    responses: {
      200: {
        schema: status,
        description: 'OK',
      },
    },
    request: {},
    alias: 'get-board',
    description: 'Retrieves the current state of the board and the winner.',
  },
  {
    method: 'get',
    path: '/board/{row}/{column}',
    requestFormat: 'json',
    parameters: [],
    response: mark,
    errors: [
      {
        status: 400,
        schema: errorMessage,
        description: 'The provided parameters are incorrect',
      },
    ],
    responses: {
      200: {
        schema: mark,
        description: 'OK',
      },
      400: {
        schema: errorMessage,
        description: 'The provided parameters are incorrect',
      },
    },
    request: {},
    alias: 'get-square',
    description: 'Retrieves the requested square.',
  },
  {
    method: 'put',
    path: '/board/{row}/{column}',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: mark,
      },
    ],
    response: status,
    errors: [
      {
        status: 400,
        schema: errorMessage,
        description: 'The provided parameters are incorrect',
      },
    ],
    responses: {
      200: {
        schema: status,
        description: 'OK',
      },
      400: {
        schema: errorMessage,
        description: 'The provided parameters are incorrect',
      },
    },
    request: {
      body: mark,
    },
    alias: 'put-square',
    description:
      'Places a mark on the board and retrieves the whole board and the winner (if any).',
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: 'get_board',
      title: 'Get the whole board',
      description: 'Retrieves the current state of the board and the winner.',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: {
        type: 'object',
        properties: {
          winner: {
            type: 'string',
            description: 'Winner of the game. `.` means nobody has won yet.',
            example: '.',
            enum: ['.', 'X', 'O'],
          },
          board: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'string',
                description: 'Possible values for a board square. `.` means empty square.',
                example: '.',
                enum: ['.', 'X', 'O'],
              },
            },
          },
        },
        required: [],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/board',
      originalPath: '/board',
      operationId: 'get-board',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'defaultApiKey',
              scheme: {
                description: 'API key provided in console',
                type: 'apiKey',
                name: 'api-key',
                in: 'header',
              },
              scopes: [],
            },
          ],
        },
        {
          schemes: [
            {
              schemeName: 'app2AppOauth',
              scheme: {
                type: 'oauth2',
                flows: {
                  clientCredentials: {
                    tokenUrl: 'https://learn.openapis.org/oauth/2.0/token',
                    scopes: { 'board:read': 'Read the board' },
                  },
                },
              },
              scopes: ['board:read'],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'get_square',
      title: 'Get a single board square',
      description: 'Retrieves the requested square.',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            description: 'Possible values for a board square. `.` means empty square.',
            example: '.',
            enum: ['.', 'X', 'O'],
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/board/{row}/{column}',
      originalPath: '/board/{row}/{column}',
      operationId: 'get-square',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerHttpAuthentication',
              scheme: {
                description: 'Bearer token using a JWT',
                type: 'http',
                scheme: 'Bearer',
                bearerFormat: 'JWT',
              },
              scopes: [],
            },
          ],
        },
        {
          schemes: [
            {
              schemeName: 'user2AppOauth',
              scheme: {
                type: 'oauth2',
                flows: {
                  authorizationCode: {
                    authorizationUrl: 'https://learn.openapis.org/oauth/2.0/auth',
                    tokenUrl: 'https://learn.openapis.org/oauth/2.0/token',
                    scopes: {
                      'board:read': 'Read the board',
                      'board:write': 'Write to the board',
                    },
                  },
                },
              },
              scopes: ['board:read'],
            },
          ],
        },
      ],
    },
  },
  {
    tool: {
      name: 'put_square',
      title: 'Set a single board square',
      description:
        'Places a mark on the board and retrieves the whole board and the winner (if any).',
      inputSchema: {
        type: 'object',
        properties: {
          body: {
            type: 'string',
            description: 'Possible values for a board square. `.` means empty square.',
            example: '.',
            enum: ['.', 'X', 'O'],
          },
        },
        required: ['body'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          winner: {
            type: 'string',
            description: 'Winner of the game. `.` means nobody has won yet.',
            example: '.',
            enum: ['.', 'X', 'O'],
          },
          board: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'string',
                description: 'Possible values for a board square. `.` means empty square.',
                example: '.',
                enum: ['.', 'X', 'O'],
              },
            },
          },
        },
        required: [],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    httpOperation: {
      method: 'put',
      path: '/board/{row}/{column}',
      originalPath: '/board/{row}/{column}',
      operationId: 'put-square',
    },
    security: {
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'bearerHttpAuthentication',
              scheme: {
                description: 'Bearer token using a JWT',
                type: 'http',
                scheme: 'Bearer',
                bearerFormat: 'JWT',
              },
              scopes: [],
            },
          ],
        },
        {
          schemes: [
            {
              schemeName: 'user2AppOauth',
              scheme: {
                type: 'oauth2',
                flows: {
                  authorizationCode: {
                    authorizationUrl: 'https://learn.openapis.org/oauth/2.0/auth',
                    tokenUrl: 'https://learn.openapis.org/oauth/2.0/token',
                    scopes: {
                      'board:read': 'Read the board',
                      'board:write': 'Write to the board',
                    },
                  },
                },
              },
              scopes: ['board:write'],
            },
          ],
        },
      ],
    },
  },
] as const;
