export const exportAllNamedSchemasContextSnapshot = {
  schemas: {
    sameSchemaDifferentName: 'z.enum(["xxx", "yyy", "zzz"]).optional()',
    sameSchemaSameName: 'z.enum(["xxx", "yyy", "zzz"]).optional()',
    sameSchemaSameName__2: 'z.enum(["xxx", "yyy", "zzz"]).optional()',
    schemaNameAlreadyUsed: 'z.enum(["ggg", "hhh", "iii"]).optional()',
    schemaNameAlreadyUsed__2: 'z.enum(["aaa", "bbb", "ccc"]).optional()',
  },
  endpoints: [
    {
      method: 'get',
      path: '/export-all-named-schemas',
      requestFormat: 'json',
      parameters: [
        {
          name: 'sameSchemaSameName',
          type: 'Query',
          schema: 'sameSchemaSameName',
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
      path: '/export-all-named-schemas',
      requestFormat: 'json',
      parameters: [
        {
          name: 'schemaNameAlreadyUsed',
          type: 'Query',
          schema: 'schemaNameAlreadyUsed',
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
      path: '/export-all-named-schemas',
      requestFormat: 'json',
      parameters: [
        {
          name: 'schemaNameAlreadyUsed',
          type: 'Query',
          schema: 'schemaNameAlreadyUsed__2',
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
      path: '/export-all-named-schemas',
      requestFormat: 'json',
      parameters: [
        {
          name: 'sameSchemaDifferentName',
          type: 'Query',
          schema: 'sameSchemaDifferentName',
          constraints: {
            enum: ['xxx', 'yyy', 'zzz'],
          },
        },
        {
          name: 'sameSchemaSameName',
          type: 'Query',
          schema: 'sameSchemaSameName__2',
          constraints: {
            enum: ['xxx', 'yyy', 'zzz'],
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
        description: 'GET /export-all-named-schemas',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'object',
              properties: {
                sameSchemaSameName: {
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
      path: '/export-all-named-schemas',
      originalPath: '/export-all-named-schemas',
      operationId: 'getSchemaNameAlreadyUsed',
      httpOperation: {
        method: 'get',
        path: '/export-all-named-schemas',
        originalPath: '/export-all-named-schemas',
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
        description: 'POST /export-all-named-schemas',
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
      path: '/export-all-named-schemas',
      originalPath: '/export-all-named-schemas',
      operationId: 'postSchemaNameAlreadyUsed',
      httpOperation: {
        method: 'post',
        path: '/export-all-named-schemas',
        originalPath: '/export-all-named-schemas',
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
        description: 'PUT /export-all-named-schemas',
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
      path: '/export-all-named-schemas',
      originalPath: '/export-all-named-schemas',
      operationId: 'putSchemaNameAlreadyUsed',
      httpOperation: {
        method: 'put',
        path: '/export-all-named-schemas',
        originalPath: '/export-all-named-schemas',
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
        description: 'DELETE /export-all-named-schemas',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'object',
              properties: {
                sameSchemaDifferentName: {
                  type: 'string',
                  enum: ['xxx', 'yyy', 'zzz'],
                },
                sameSchemaSameName: {
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
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
        },
      },
      method: 'delete',
      path: '/export-all-named-schemas',
      originalPath: '/export-all-named-schemas',
      operationId: 'deleteSchemaNameAlreadyUsed',
      httpOperation: {
        method: 'delete',
        path: '/export-all-named-schemas',
        originalPath: '/export-all-named-schemas',
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

export const exportAllNamedSchemasOutputSnapshot = `import { z } from "zod";
// Zod Schemas
export const sameSchemaSameName = z.enum(["xxx", "yyy", "zzz"]).optional();
export const schemaNameAlreadyUsed = z.enum(["ggg", "hhh", "iii"]).optional();
export const schemaNameAlreadyUsed__2 = z
  .enum(["aaa", "bbb", "ccc"])
  .optional();
export const sameSchemaDifferentName = z.enum(["xxx", "yyy", "zzz"]).optional();
export const sameSchemaSameName__2 = z.enum(["xxx", "yyy", "zzz"]).optional();
// Endpoints
export const endpoints = [
  {
    method: "get",
    path: "/export-all-named-schemas",
    requestFormat: "json",
    parameters: [
      {
        name: "sameSchemaSameName",
        type: "Query",
        schema: sameSchemaSameName,
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
      queryParams: z.object({ sameSchemaSameName: sameSchemaSameName }),
    },
    alias: "getSchemaNameAlreadyUsed",
  },
  {
    method: "post",
    path: "/export-all-named-schemas",
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
    alias: "postSchemaNameAlreadyUsed",
  },
  {
    method: "put",
    path: "/export-all-named-schemas",
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
    alias: "putSchemaNameAlreadyUsed",
  },
  {
    method: "delete",
    path: "/export-all-named-schemas",
    requestFormat: "json",
    parameters: [
      {
        name: "sameSchemaDifferentName",
        type: "Query",
        schema: sameSchemaDifferentName,
      },
      {
        name: "sameSchemaSameName",
        type: "Query",
        schema: sameSchemaSameName__2,
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
        sameSchemaDifferentName: sameSchemaDifferentName,
        sameSchemaSameName: sameSchemaSameName__2,
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
      description: "GET /export-all-named-schemas",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "object",
            properties: {
              sameSchemaSameName: {
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
      path: "/export-all-named-schemas",
      originalPath: "/export-all-named-schemas",
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
      description: "POST /export-all-named-schemas",
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
      path: "/export-all-named-schemas",
      originalPath: "/export-all-named-schemas",
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
      description: "PUT /export-all-named-schemas",
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
      path: "/export-all-named-schemas",
      originalPath: "/export-all-named-schemas",
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
      description: "DELETE /export-all-named-schemas",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "object",
            properties: {
              sameSchemaDifferentName: {
                type: "string",
                enum: ["xxx", "yyy", "zzz"],
              },
              sameSchemaSameName: {
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
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "delete",
      path: "/export-all-named-schemas",
      originalPath: "/export-all-named-schemas",
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
