import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

test('same-schema-different-name - Generation Snapshot', async () => {
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

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2 },
  });
  assertSingleFileResult(result);
  expect(result.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Zod Schemas
    export const differentNameSameSchema = z.enum(["aaa", "bbb", "ccc"]).optional();
    export const anotherDifferentNameWithSlightlyDifferentSchema = z
      .enum(["aaa", "bbb", "ccc"])
      .optional()
      .default("aaa");
    export const sameSchemaDifferentName = z.enum(["aaa", "bbb", "ccc"]).optional();
    // Endpoints
    export const endpoints = [
      {
        method: "post",
        path: "/same-schema-different-name",
        requestFormat: "json",
        parameters: [
          {
            name: "differentNameSameSchema",
            type: "Query",
            schema: differentNameSameSchema,
          },
          {
            name: "anotherDifferentNameWithSlightlyDifferentSchema",
            type: "Query",
            schema: anotherDifferentNameWithSlightlyDifferentSchema,
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
            differentNameSameSchema: differentNameSameSchema,
            anotherDifferentNameWithSlightlyDifferentSchema:
              anotherDifferentNameWithSlightlyDifferentSchema,
          }),
        },
        alias: "postSameSchemaDifferentName",
      },
      {
        method: "put",
        path: "/same-schema-different-name",
        requestFormat: "json",
        parameters: [
          {
            name: "sameSchemaDifferentName",
            type: "Query",
            schema: sameSchemaDifferentName,
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
          }),
        },
        alias: "putSameSchemaDifferentName",
      },
    ] as const;
    // MCP Tools
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
          method: "post",
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
          method: "put",
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
