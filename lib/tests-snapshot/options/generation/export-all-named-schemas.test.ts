import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';

test('export-all-named-schemas', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/export-all-named-schemas': {
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
              name: 'sameSchemaSameName',
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
              name: 'sameSchemaDifferentName',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
            },
            {
              name: 'sameSchemaSameName',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
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
  const ctx = getZodClientTemplateContext(openApiDoc, {
    complexityThreshold: 2,
    exportAllNamedSchemas: true,
  });
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
                        "name": "sameSchemaSameName",
                        "schema": "sameSchemaSameName",
                        "type": "Query",
                    },
                ],
                "path": "/export-all-named-schemas",
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
                        "schema": "schemaNameAlreadyUsed",
                        "type": "Query",
                    },
                ],
                "path": "/export-all-named-schemas",
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
                        "schema": "schemaNameAlreadyUsed__2",
                        "type": "Query",
                    },
                ],
                "path": "/export-all-named-schemas",
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
                                "xxx",
                                "yyy",
                                "zzz",
                            ],
                        },
                        "name": "sameSchemaDifferentName",
                        "schema": "sameSchemaDifferentName",
                        "type": "Query",
                    },
                    {
                        "constraints": {
                            "enum": [
                                "xxx",
                                "yyy",
                                "zzz",
                            ],
                        },
                        "name": "sameSchemaSameName",
                        "schema": "sameSchemaSameName",
                        "type": "Query",
                    },
                ],
                "path": "/export-all-named-schemas",
                "requestFormat": "json",
                "response": "z.string()",
            },
        ],
        "endpointsGroups": {},
        "mcpTools": [
            {
                "method": "get",
                "operationId": "getSchemaNameAlreadyUsed",
                "originalPath": "/export-all-named-schemas",
                "path": "/export-all-named-schemas",
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
                    "description": "GET /export-all-named-schemas",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "sameSchemaSameName": {
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
                "originalPath": "/export-all-named-schemas",
                "path": "/export-all-named-schemas",
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
                    "description": "POST /export-all-named-schemas",
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
                "originalPath": "/export-all-named-schemas",
                "path": "/export-all-named-schemas",
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
                    "description": "PUT /export-all-named-schemas",
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
                "originalPath": "/export-all-named-schemas",
                "path": "/export-all-named-schemas",
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
                    "description": "DELETE /export-all-named-schemas",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "sameSchemaDifferentName": {
                                        "enum": [
                                            "xxx",
                                            "yyy",
                                            "zzz",
                                        ],
                                        "type": "string",
                                    },
                                    "sameSchemaSameName": {
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
            "sameSchemaDifferentName": "z.enum(["xxx", "yyy", "zzz"]).optional()",
            "sameSchemaSameName": "z.enum(["xxx", "yyy", "zzz"]).optional()",
            "schemaNameAlreadyUsed": "z.enum(["ggg", "hhh", "iii"]).optional()",
            "schemaNameAlreadyUsed__2": "z.enum(["aaa", "bbb", "ccc"]).optional()",
        },
        "types": {},
    }
  `);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2, exportAllNamedSchemas: true },
  });

  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const sameSchemaSameName = z.enum(["xxx", "yyy", "zzz"]).optional();
    export const schemaNameAlreadyUsed = z.enum(["ggg", "hhh", "iii"]).optional();
    export const schemaNameAlreadyUsed__2 = z
      .enum(["aaa", "bbb", "ccc"])
      .optional();
    export const sameSchemaDifferentName = z.enum(["xxx", "yyy", "zzz"]).optional();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/export-all-named-schemas",
        operationId: "getSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ sameSchemaSameName: sameSchemaSameName })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "post" as const,
        path: "/export-all-named-schemas",
        operationId: "postSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "put" as const,
        path: "/export-all-named-schemas",
        operationId: "putSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed__2 })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "delete" as const,
        path: "/export-all-named-schemas",
        operationId: "deleteSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({
              sameSchemaDifferentName: sameSchemaDifferentName,
              sameSchemaSameName: sameSchemaSameName,
            })
            .optional(),
          queryParams: z
            .object({
              sameSchemaDifferentName: sameSchemaDifferentName,
              sameSchemaSameName: sameSchemaSameName,
            })
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
          method: "get" as const,
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
          method: "post" as const,
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
          method: "put" as const,
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
          method: "delete" as const,
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
    "
  `);
});
