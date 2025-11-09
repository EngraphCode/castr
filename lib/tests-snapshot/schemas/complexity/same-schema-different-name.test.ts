import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';

test('same-schema-different-name', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/same-schema-different-name': {
        put: {
          operationId: 'putSameSchemaDifferentName',
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
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
          ],
        },
        post: {
          operationId: 'postSameSchemaDifferentName',
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
              name: 'differentNameSameSchema',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
            {
              name: 'anotherDifferentNameWithSlightlyDifferentSchema',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'], default: 'aaa' },
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
                "method": "post",
                "parameters": [
                    {
                        "constraints": {
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                        },
                        "name": "differentNameSameSchema",
                        "schema": "differentNameSameSchema",
                        "type": "Query",
                    },
                    {
                        "constraints": {
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                        },
                        "default": "aaa",
                        "name": "anotherDifferentNameWithSlightlyDifferentSchema",
                        "schema": "anotherDifferentNameWithSlightlyDifferentSchema",
                        "type": "Query",
                    },
                ],
                "path": "/same-schema-different-name",
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
                        "name": "sameSchemaDifferentName",
                        "schema": "differentNameSameSchema",
                        "type": "Query",
                    },
                ],
                "path": "/same-schema-different-name",
                "requestFormat": "json",
                "response": "z.string()",
            },
        ],
        "endpointsGroups": {},
        "mcpTools": [
            {
                "httpOperation": {
                    "method": "post",
                    "operationId": "postSameSchemaDifferentName",
                    "originalPath": "/same-schema-different-name",
                    "path": "/same-schema-different-name",
                },
                "method": "post",
                "operationId": "postSameSchemaDifferentName",
                "originalPath": "/same-schema-different-name",
                "path": "/same-schema-different-name",
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
                    "description": "POST /same-schema-different-name",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "anotherDifferentNameWithSlightlyDifferentSchema": {
                                        "default": "aaa",
                                        "enum": [
                                            "aaa",
                                            "bbb",
                                            "ccc",
                                        ],
                                        "type": "string",
                                    },
                                    "differentNameSameSchema": {
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
                    "name": "post_same_schema_different_name",
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
                "httpOperation": {
                    "method": "put",
                    "operationId": "putSameSchemaDifferentName",
                    "originalPath": "/same-schema-different-name",
                    "path": "/same-schema-different-name",
                },
                "method": "put",
                "operationId": "putSameSchemaDifferentName",
                "originalPath": "/same-schema-different-name",
                "path": "/same-schema-different-name",
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
                    "description": "PUT /same-schema-different-name",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "sameSchemaDifferentName": {
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
                    "name": "put_same_schema_different_name",
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
            "anotherDifferentNameWithSlightlyDifferentSchema": "z.enum(["aaa", "bbb", "ccc"]).optional().default("aaa")",
            "differentNameSameSchema": "z.enum(["aaa", "bbb", "ccc"]).optional()",
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

    export const differentNameSameSchema = z.enum(["aaa", "bbb", "ccc"]).optional();
    export const anotherDifferentNameWithSlightlyDifferentSchema = z
      .enum(["aaa", "bbb", "ccc"])
      .optional()
      .default("aaa");

    export const endpoints = [
      {
        method: "post" as const,
        path: "/same-schema-different-name",
        operationId: "postSameSchemaDifferentName",
        request: {
          queryParams: z
            .object({
              differentNameSameSchema: differentNameSameSchema,
              anotherDifferentNameWithSlightlyDifferentSchema:
                anotherDifferentNameWithSlightlyDifferentSchema,
            })
            .optional(),
          queryParams: z
            .object({
              differentNameSameSchema: differentNameSameSchema,
              anotherDifferentNameWithSlightlyDifferentSchema:
                anotherDifferentNameWithSlightlyDifferentSchema,
            })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "put" as const,
        path: "/same-schema-different-name",
        operationId: "putSameSchemaDifferentName",
        request: {
          queryParams: z
            .object({ sameSchemaDifferentName: differentNameSameSchema })
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
          name: "post_same_schema_different_name",
          description: "POST /same-schema-different-name",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  differentNameSameSchema: {
                    type: "string",
                    enum: ["aaa", "bbb", "ccc"],
                  },
                  anotherDifferentNameWithSlightlyDifferentSchema: {
                    default: "aaa",
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
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "post" as const,
          path: "/same-schema-different-name",
          originalPath: "/same-schema-different-name",
          operationId: "postSameSchemaDifferentName",
        },
        security: {
          isPublic: true,
          usesGlobalSecurity: false,
          requirementSets: [],
        },
      },
      {
        tool: {
          name: "put_same_schema_different_name",
          description: "PUT /same-schema-different-name",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  sameSchemaDifferentName: {
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
          path: "/same-schema-different-name",
          originalPath: "/same-schema-different-name",
          operationId: "putSameSchemaDifferentName",
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
