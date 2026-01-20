import { z } from 'zod';
// Type Definitions
export type NewPet = {
  name: string;
  tag?: string;
};
export type Pet = NewPet & {
  id: number;
};
export type Error = {
  code: number;
  message: string;
};
// Zod Schemas
export const NewPet = z
  .object({
    name: z.string(),
    tag: z.string().optional(),
  })
  .strict();
export const Pet = NewPet.and(
  z
    .object({
      id: z.number().int(),
    })
    .strict(),
);
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
        name: 'tags',
        type: 'Query',
        schema: z.array(z.string()).optional(),
        description: 'tags to filter by',
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional(),
        description: 'maximum number of results to return',
      },
    ],
    response: z.array(Pet),
    errors: [
      {
        status: 'default',
        schema: Error,
        description: 'unexpected error',
      },
    ],
    responses: {
      200: {
        schema: z.array(Pet),
        description: 'pet response',
      },
      default: {
        schema: Error,
        description: 'unexpected error',
      },
    },
    request: {
      queryParams: z
        .object({
          tags: z.array(z.string()).optional(),
          limit: z.number().int().optional(),
        })
        .strict(),
    },
    alias: 'findPets',
    description:
      'Returns all pets from the system that the user has access to\nNam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.\n\nSed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.\n',
  },
  {
    method: 'post',
    path: '/pets',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: NewPet,
        description: 'Pet to add to the store',
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
        description: 'pet response',
      },
      default: {
        schema: Error,
        description: 'unexpected error',
      },
    },
    request: {
      body: NewPet,
    },
    alias: 'addPet',
    description: 'Creates a new pet in the store. Duplicates are allowed',
  },
  {
    method: 'get',
    path: '/pets/{id}',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
        description: 'ID of pet to fetch',
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
        description: 'pet response',
      },
      default: {
        schema: Error,
        description: 'unexpected error',
      },
    },
    request: {
      pathParams: z
        .object({
          id: z.number().int(),
        })
        .strict(),
    },
    alias: 'find pet by id',
    description: 'Returns a user based on a single ID, if the user does not have access to the pet',
  },
  {
    method: 'delete',
    path: '/pets/{id}',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.number().int(),
        description: 'ID of pet to delete',
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
      204: {
        schema: z.object({}).strict(),
        description: 'pet deleted',
      },
      default: {
        schema: Error,
        description: 'unexpected error',
      },
    },
    request: {
      pathParams: z
        .object({
          id: z.number().int(),
        })
        .strict(),
    },
    alias: 'deletePet',
    description: 'deletes a single pet based on the ID supplied',
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: 'find_pets',
      description:
        'Returns all pets from the system that the user has access to\nNam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.\n\nSed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'object',
            properties: {
              tags: { type: 'array', items: { type: 'string' } },
              limit: { type: 'integer', format: 'int32' },
            },
          },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'array',
            items: {
              allOf: [
                {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    tag: { type: 'string' },
                  },
                  required: ['name'],
                },
                {
                  type: 'object',
                  properties: { id: { type: 'integer', format: 'int64' } },
                  required: ['id'],
                },
              ],
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
      operationId: 'findPets',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: 'add_pet',
      description: 'Creates a new pet in the store. Duplicates are allowed',
      inputSchema: {
        type: 'object',
        properties: {
          body: {
            type: 'object',
            properties: { name: { type: 'string' }, tag: { type: 'string' } },
            required: ['name'],
          },
        },
        required: ['body'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            allOf: [
              {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  tag: { type: 'string' },
                },
                required: ['name'],
              },
              {
                type: 'object',
                properties: { id: { type: 'integer', format: 'int64' } },
                required: ['id'],
              },
            ],
          },
        },
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
      operationId: 'addPet',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: 'find_pet_by_id',
      description:
        'Returns a user based on a single ID, if the user does not have access to the pet',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: { id: { type: 'integer', format: 'int64' } },
            required: ['id'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          value: {
            allOf: [
              {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  tag: { type: 'string' },
                },
                required: ['name'],
              },
              {
                type: 'object',
                properties: { id: { type: 'integer', format: 'int64' } },
                required: ['id'],
              },
            ],
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
      path: '/pets/{id}',
      originalPath: '/pets/{id}',
      operationId: 'find pet by id',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: 'delete_pet',
      description: 'deletes a single pet based on the ID supplied',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'object',
            properties: { id: { type: 'integer', format: 'int64' } },
            required: ['id'],
          },
        },
        required: ['path'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: 'delete',
      path: '/pets/{id}',
      originalPath: '/pets/{id}',
      operationId: 'deletePet',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
] as const;
