import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';

test('schema-name-already-used', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/schema-name-already-used': {
        get: {
          operationId: 'getSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
            },
          ],
        },
        put: {
          operationId: 'putSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
          ],
        },
        delete: {
          operationId: 'deleteSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['ddd', 'eee', 'fff'] },
            },
          ],
        },
        post: {
          operationId: 'postSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['ggg', 'hhh', 'iii'] },
            },
          ],
        },
      },
    },
  };
  const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2 });
  expect(ctx).toMatchInlineSnapshot(`
    {
        "circularTypeByName": {},
        "emittedType": {},
        "endpoints": [
            {
                "errors": [],
                "method": "get",
                "parameters": [
                    {
                        "constraints": {
                            "enum": [
                                "xxx",
                                "yyy",
                                "zzz",
                            ],
                        },
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "post",
                "parameters": [
                    {
                        "constraints": {
                            "enum": [
                                "ggg",
                                "hhh",
                                "iii",
                            ],
                        },
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__2",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "put",
                "parameters": [
                    {
                        "constraints": {
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                        },
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__3",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "delete",
                "parameters": [
                    {
                        "constraints": {
                            "enum": [
                                "ddd",
                                "eee",
                                "fff",
                            ],
                        },
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__4",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
        ],
        "endpointsGroups": {},
        "mcpTools": [
            {
                "method": "get",
                "operationId": "getSchemaNameAlreadyUsed",
                "originalPath": "/schema-name-already-used",
                "path": "/schema-name-already-used",
                "security": {
                    "isPublic": true,
                    "requirementSets": [],
                    "usesGlobalSecurity": false,
                },
                "tool": {
                    "annotations": {
                        "destructiveHint": false,
                        "idempotentHint": false,
                        "readOnlyHint": true,
                    },
                    "description": "GET /schema-name-already-used",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "schemaNameAlreadyUsed": {
                                        "enum": [
                                            "xxx",
                                            "yyy",
                                            "zzz",
                                        ],
                                        "type": "string",
                                    },
                                },
                                "type": "object",
                            },
                        },
                        "type": "object",
                    },
                    "name": "get_schema_name_already_used",
                    "outputSchema": {
                        "properties": {
                            "value": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                    },
                },
            },
            {
                "method": "post",
                "operationId": "postSchemaNameAlreadyUsed",
                "originalPath": "/schema-name-already-used",
                "path": "/schema-name-already-used",
                "security": {
                    "isPublic": true,
                    "requirementSets": [],
                    "usesGlobalSecurity": false,
                },
                "tool": {
                    "annotations": {
                        "destructiveHint": false,
                        "idempotentHint": false,
                        "readOnlyHint": false,
                    },
                    "description": "POST /schema-name-already-used",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "schemaNameAlreadyUsed": {
                                        "enum": [
                                            "ggg",
                                            "hhh",
                                            "iii",
                                        ],
                                        "type": "string",
                                    },
                                },
                                "type": "object",
                            },
                        },
                        "type": "object",
                    },
                    "name": "post_schema_name_already_used",
                    "outputSchema": {
                        "properties": {
                            "value": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                    },
                },
            },
            {
                "method": "put",
                "operationId": "putSchemaNameAlreadyUsed",
                "originalPath": "/schema-name-already-used",
                "path": "/schema-name-already-used",
                "security": {
                    "isPublic": true,
                    "requirementSets": [],
                    "usesGlobalSecurity": false,
                },
                "tool": {
                    "annotations": {
                        "destructiveHint": false,
                        "idempotentHint": true,
                        "readOnlyHint": false,
                    },
                    "description": "PUT /schema-name-already-used",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "schemaNameAlreadyUsed": {
                                        "enum": [
                                            "aaa",
                                            "bbb",
                                            "ccc",
                                        ],
                                        "type": "string",
                                    },
                                },
                                "type": "object",
                            },
                        },
                        "type": "object",
                    },
                    "name": "put_schema_name_already_used",
                    "outputSchema": {
                        "properties": {
                            "value": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                    },
                },
            },
            {
                "method": "delete",
                "operationId": "deleteSchemaNameAlreadyUsed",
                "originalPath": "/schema-name-already-used",
                "path": "/schema-name-already-used",
                "security": {
                    "isPublic": true,
                    "requirementSets": [],
                    "usesGlobalSecurity": false,
                },
                "tool": {
                    "annotations": {
                        "destructiveHint": true,
                        "idempotentHint": false,
                        "readOnlyHint": false,
                    },
                    "description": "DELETE /schema-name-already-used",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "schemaNameAlreadyUsed": {
                                        "enum": [
                                            "ddd",
                                            "eee",
                                            "fff",
                                        ],
                                        "type": "string",
                                    },
                                },
                                "type": "object",
                            },
                        },
                        "type": "object",
                    },
                    "name": "delete_schema_name_already_used",
                    "outputSchema": {
                        "properties": {
                            "value": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                    },
                },
            },
        ],
        "options": {
            "baseUrl": "",
            "withAlias": false,
        },
        "schemas": {
            "schemaNameAlreadyUsed": "z.enum(["xxx", "yyy", "zzz"]).optional()",
            "schemaNameAlreadyUsed__2": "z.enum(["ggg", "hhh", "iii"]).optional()",
            "schemaNameAlreadyUsed__3": "z.enum(["aaa", "bbb", "ccc"]).optional()",
            "schemaNameAlreadyUsed__4": "z.enum(["ddd", "eee", "fff"]).optional()",
        },
        "types": {},
    }
  `);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2 },
  });

  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

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

    export const endpoints = [
      {
        method: "get" as const,
        path: "/schema-name-already-used",
        operationId: "getSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "post" as const,
        path: "/schema-name-already-used",
        operationId: "postSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed__2 })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "put" as const,
        path: "/schema-name-already-used",
        operationId: "putSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed__3 })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "delete" as const,
        path: "/schema-name-already-used",
        operationId: "deleteSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed__4 })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
    ] as const;

    /**
     * MCP (Model Context Protocol) tool metadata derived from the OpenAPI document.
     *
     * Each entry provides:
     * - \`tool\`: JSON Schema Draft 07 compliant tool definition (name, description, annotations, schemas)
     * - \`httpOperation\`: source HTTP metadata (method, templated path, original path, operationId)
     * - \`security\`: upstream API security requirements (Layer 2 metadata only)
     *
     * Use \`tool\` when wiring into the MCP SDK, and \`httpOperation\`/\`security\` when presenting
     * additional context to operators or logging.
     */
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
          method: "get" as const,
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
          method: "post" as const,
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
          method: "put" as const,
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
          method: "delete" as const,
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
    "
  `);
});
