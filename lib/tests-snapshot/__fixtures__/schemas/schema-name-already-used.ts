export const schemaNameAlreadyUsedContextSnapshot = {
  schemas: {
    schemaNameAlreadyUsed: 'z.enum(["xxx", "yyy", "zzz"]).optional()',
    schemaNameAlreadyUsed__2: 'z.enum(["ggg", "hhh", "iii"]).optional()',
    schemaNameAlreadyUsed__3: 'z.enum(["aaa", "bbb", "ccc"]).optional()',
    schemaNameAlreadyUsed__4: 'z.enum(["ddd", "eee", "fff"]).optional()',
  },
  endpoints: [
    {
      method: 'get',
      path: '/schema-name-already-used',
      requestFormat: 'json',
      parameters: [
        {
          name: 'schemaNameAlreadyUsed',
          type: 'Query',
          schema: 'schemaNameAlreadyUsed',
          constraints: {
            enum: ['xxx', 'yyy', 'zzz'],
          },
        },
      ],
      errors: [],
      response: 'z.string()',
    },
    {
      method: 'post',
      path: '/schema-name-already-used',
      requestFormat: 'json',
      parameters: [
        {
          name: 'schemaNameAlreadyUsed',
          type: 'Query',
          schema: 'schemaNameAlreadyUsed__2',
          constraints: {
            enum: ['ggg', 'hhh', 'iii'],
          },
        },
      ],
      errors: [],
      response: 'z.string()',
    },
    {
      method: 'put',
      path: '/schema-name-already-used',
      requestFormat: 'json',
      parameters: [
        {
          name: 'schemaNameAlreadyUsed',
          type: 'Query',
          schema: 'schemaNameAlreadyUsed__3',
          constraints: {
            enum: ['aaa', 'bbb', 'ccc'],
          },
        },
      ],
      errors: [],
      response: 'z.string()',
    },
    {
      method: 'delete',
      path: '/schema-name-already-used',
      requestFormat: 'json',
      parameters: [
        {
          name: 'schemaNameAlreadyUsed',
          type: 'Query',
          schema: 'schemaNameAlreadyUsed__4',
          constraints: {
            enum: ['ddd', 'eee', 'fff'],
          },
        },
      ],
      errors: [],
      response: 'z.string()',
    },
  ],
  endpointsGroups: {},
  types: {},
  circularTypeByName: {},
  emittedType: {},
  mcpTools: [
    {
      tool: {
        name: 'get_schema_name_already_used',
        description: 'GET /schema-name-already-used',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'object',
              properties: {
                schemaNameAlreadyUsed: {
                  type: 'string',
                  enum: ['xxx', 'yyy', 'zzz'],
                },
              },
            },
          },
        },
        outputSchema: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
            },
          },
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: false,
        },
      },
      method: 'get',
      path: '/schema-name-already-used',
      originalPath: '/schema-name-already-used',
      operationId: 'getSchemaNameAlreadyUsed',
      httpOperation: {
        method: 'get',
        path: '/schema-name-already-used',
        originalPath: '/schema-name-already-used',
        operationId: 'getSchemaNameAlreadyUsed',
      },
      security: {
        isPublic: true,
        usesGlobalSecurity: false,
        requirementSets: [],
      },
    },
    {
      tool: {
        name: 'post_schema_name_already_used',
        description: 'POST /schema-name-already-used',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'object',
              properties: {
                schemaNameAlreadyUsed: {
                  type: 'string',
                  enum: ['ggg', 'hhh', 'iii'],
                },
              },
            },
          },
        },
        outputSchema: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
            },
          },
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
        },
      },
      method: 'post',
      path: '/schema-name-already-used',
      originalPath: '/schema-name-already-used',
      operationId: 'postSchemaNameAlreadyUsed',
      httpOperation: {
        method: 'post',
        path: '/schema-name-already-used',
        originalPath: '/schema-name-already-used',
        operationId: 'postSchemaNameAlreadyUsed',
      },
      security: {
        isPublic: true,
        usesGlobalSecurity: false,
        requirementSets: [],
      },
    },
    {
      tool: {
        name: 'put_schema_name_already_used',
        description: 'PUT /schema-name-already-used',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'object',
              properties: {
                schemaNameAlreadyUsed: {
                  type: 'string',
                  enum: ['aaa', 'bbb', 'ccc'],
                },
              },
            },
          },
        },
        outputSchema: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
            },
          },
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
        },
      },
      method: 'put',
      path: '/schema-name-already-used',
      originalPath: '/schema-name-already-used',
      operationId: 'putSchemaNameAlreadyUsed',
      httpOperation: {
        method: 'put',
        path: '/schema-name-already-used',
        originalPath: '/schema-name-already-used',
        operationId: 'putSchemaNameAlreadyUsed',
      },
      security: {
        isPublic: true,
        usesGlobalSecurity: false,
        requirementSets: [],
      },
    },
    {
      tool: {
        name: 'delete_schema_name_already_used',
        description: 'DELETE /schema-name-already-used',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'object',
              properties: {
                schemaNameAlreadyUsed: {
                  type: 'string',
                  enum: ['ddd', 'eee', 'fff'],
                },
              },
            },
          },
        },
        outputSchema: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
            },
          },
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
        },
      },
      method: 'delete',
      path: '/schema-name-already-used',
      originalPath: '/schema-name-already-used',
      operationId: 'deleteSchemaNameAlreadyUsed',
      httpOperation: {
        method: 'delete',
        path: '/schema-name-already-used',
        originalPath: '/schema-name-already-used',
        operationId: 'deleteSchemaNameAlreadyUsed',
      },
      security: {
        isPublic: true,
        usesGlobalSecurity: false,
        requirementSets: [],
      },
    },
  ],
  options: {
    withAlias: false,
    baseUrl: '',
  },
} as const;

export const schemaNameAlreadyUsedOutputSnapshot = `import { z } from "zod";
// Zod Schemas
export const schemaNameAlreadyUsed = z.enum(["xxx", "yyy", "zzz"]).optional();
export const schemaNameAlreadyUsed__2 = z
  .enum(["ggg", "hhh", "iii"])
  .optional();
export const schemaNameAlreadyUsed__3 = z
  .enum(["aaa", "bbb", "ccc"])
  .optional();
export const schemaNameAlreadyUsed__4 = z
  .enum(["ddd", "eee", "fff"])
  .optional();
// Endpoints
export const endpoints = [
  {
    method: "get",
    path: "/schema-name-already-used",
    requestFormat: "json",
    parameters: [
      {
        name: "schemaNameAlreadyUsed",
        type: "Query",
        schema: schemaNameAlreadyUsed,
      },
    ],
    response: z.string(),
    errors: [],
    responses: {
      200: {
        schema: z.string(),
      },
    },
    request: {
      queryParams: z.object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed }),
    },
    alias: "getSchemaNameAlreadyUsed",
  },
  {
    method: "post",
    path: "/schema-name-already-used",
    requestFormat: "json",
    parameters: [
      {
        name: "schemaNameAlreadyUsed",
        type: "Query",
        schema: schemaNameAlreadyUsed__2,
      },
    ],
    response: z.string(),
    errors: [],
    responses: {
      200: {
        schema: z.string(),
      },
    },
    request: {
      queryParams: z.object({
        schemaNameAlreadyUsed: schemaNameAlreadyUsed__2,
      }),
    },
    alias: "postSchemaNameAlreadyUsed",
  },
  {
    method: "put",
    path: "/schema-name-already-used",
    requestFormat: "json",
    parameters: [
      {
        name: "schemaNameAlreadyUsed",
        type: "Query",
        schema: schemaNameAlreadyUsed__3,
      },
    ],
    response: z.string(),
    errors: [],
    responses: {
      200: {
        schema: z.string(),
      },
    },
    request: {
      queryParams: z.object({
        schemaNameAlreadyUsed: schemaNameAlreadyUsed__3,
      }),
    },
    alias: "putSchemaNameAlreadyUsed",
  },
  {
    method: "delete",
    path: "/schema-name-already-used",
    requestFormat: "json",
    parameters: [
      {
        name: "schemaNameAlreadyUsed",
        type: "Query",
        schema: schemaNameAlreadyUsed__4,
      },
    ],
    response: z.string(),
    errors: [],
    responses: {
      200: {
        schema: z.string(),
      },
    },
    request: {
      queryParams: z.object({
        schemaNameAlreadyUsed: schemaNameAlreadyUsed__4,
      }),
    },
    alias: "deleteSchemaNameAlreadyUsed",
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: "get_schema_name_already_used",
      description: "GET /schema-name-already-used",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "object",
            properties: {
              schemaNameAlreadyUsed: {
                type: "string",
                enum: ["xxx", "yyy", "zzz"],
              },
            },
          },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          value: {
            type: "string",
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
      method: "get",
      path: "/schema-name-already-used",
      originalPath: "/schema-name-already-used",
      operationId: "getSchemaNameAlreadyUsed",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: "post_schema_name_already_used",
      description: "POST /schema-name-already-used",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "object",
            properties: {
              schemaNameAlreadyUsed: {
                type: "string",
                enum: ["ggg", "hhh", "iii"],
              },
            },
          },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          value: {
            type: "string",
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
      method: "post",
      path: "/schema-name-already-used",
      originalPath: "/schema-name-already-used",
      operationId: "postSchemaNameAlreadyUsed",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: "put_schema_name_already_used",
      description: "PUT /schema-name-already-used",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "object",
            properties: {
              schemaNameAlreadyUsed: {
                type: "string",
                enum: ["aaa", "bbb", "ccc"],
              },
            },
          },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          value: {
            type: "string",
          },
        },
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    httpOperation: {
      method: "put",
      path: "/schema-name-already-used",
      originalPath: "/schema-name-already-used",
      operationId: "putSchemaNameAlreadyUsed",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: "delete_schema_name_already_used",
      description: "DELETE /schema-name-already-used",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "object",
            properties: {
              schemaNameAlreadyUsed: {
                type: "string",
                enum: ["ddd", "eee", "fff"],
              },
            },
          },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          value: {
            type: "string",
          },
        },
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "delete",
      path: "/schema-name-already-used",
      originalPath: "/schema-name-already-used",
      operationId: "deleteSchemaNameAlreadyUsed",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
] as const;
` as const;
