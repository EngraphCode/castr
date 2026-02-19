import { z } from 'zod';
// Type Definitions
export type Pet = {
  id: number;
  name: string;
  tag?: string;
};
export type Pets = Pet[];
export type Error = {
  code: number;
  message: string;
};
// Zod Schemas
export const Pet = z
  .object({
    id: z.number().int(),
    name: z.string(),
    tag: z.string().optional(),
  })
  .strict();
export const Pets = z.array(Pet).max(100);
export const Error = z
  .object({
    code: z.number().int(),
    message: z.string(),
  })
  .strict();
// Endpoints
export const endpoints = [
  {
    method: 'get',
    path: '/pets',
    requestFormat: 'json',
    parameters: [
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().max(100).int().optional(),
        description: 'How many items to return at one time (max 100)',
      },
    ],
    response: Pets,
    errors: [
      {
        status: 'default',
        schema: Error,
        description: 'unexpected error',
      },
    ],
    responses: {
      200: {
        schema: Pets,
        description: 'A paged array of pets',
      },
      default: {
        schema: Error,
        description: 'unexpected error',
      },
    },
    request: {
      queryParams: z
        .object({
          limit: z.number().max(100).int().optional(),
        })
        .strict(),
    },
    alias: 'listPets',
  },
  {
    method: 'post',
    path: '/pets',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Pet,
      },
    ],
    response: z.object({}).strict(),
    errors: [
      {
        status: 'default',
        schema: Error,
        description: 'unexpected error',
      },
    ],
    responses: {
      201: {
        schema: z.object({}).strict(),
        description: 'Null response',
      },
      default: {
        schema: Error,
        description: 'unexpected error',
      },
    },
    request: {
      body: Pet,
    },
    alias: 'createPets',
  },
  {
    method: 'get',
    path: '/pets/{petId}',
    requestFormat: 'json',
    parameters: [
      {
        name: 'petId',
        type: 'Path',
        schema: z.string(),
        description: 'The id of the pet to retrieve',
      },
    ],
    response: Pet,
    errors: [
      {
        status: 'default',
        schema: Error,
        description: 'unexpected error',
      },
    ],
    responses: {
      200: {
        schema: Pet,
        description: 'Expected response to a valid request',
      },
      default: {
        schema: Error,
        description: 'unexpected error',
      },
    },
    request: {
      pathParams: z
        .object({
          petId: z.string(),
        })
        .strict(),
    },
    alias: 'showPetById',
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: 'list_pets',
      title: 'List all pets',
      description: 'List all pets',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'object',
            properties: {
              limit: { type: 'integer', format: 'int32', maximum: 100 },
            },
          },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            maxItems: 100,
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', format: 'int64' },
                name: { type: 'string' },
                tag: { type: 'string' },
              },
              required: ['id', 'name'],
            },
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
      path: '/pets',
      originalPath: '/pets',
      operationId: 'listPets',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: 'create_pets',
      title: 'Create a pet',
      description: 'Create a pet',
      inputSchema: {
        type: 'object',
        properties: {
          body: {
            type: 'object',
            properties: {
              id: { type: 'integer', format: 'int64' },
              name: { type: 'string' },
              tag: { type: 'string' },
            },
            required: ['id', 'name'],
          },
        },
        required: ['body'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'post',
      path: '/pets',
      originalPath: '/pets',
      operationId: 'createPets',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: 'show_pet_by_id',
      title: 'Info for a specific pet',
      description: 'Info for a specific pet',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: { petId: { type: 'string' } },
            required: ['petId'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          name: { type: 'string' },
          tag: { type: 'string' },
        },
        required: ['id', 'name'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'get',
      path: '/pets/{petId}',
      originalPath: '/pets/{petId}',
      operationId: 'showPetById',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
] as const;
