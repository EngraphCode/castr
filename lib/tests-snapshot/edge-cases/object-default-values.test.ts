import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

// https://github.com/astahmer/@engraph/castr/issues/61
test('object-default-values', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'object default values',
    },
    paths: {
      '/sample': {
        get: {
          parameters: [
            {
              in: 'query',
              name: 'empty-object',
              schema: {
                type: 'object',
                properties: { foo: { type: 'string' } },
                default: {},
              },
            },
            {
              in: 'query',
              name: 'default-object',
              schema: {
                type: 'object',
                properties: { foo: { type: 'string' } },
                default: { foo: 'bar' },
              },
            },
            {
              in: 'query',
              name: 'ref-object',
              schema: {
                type: 'object',
                additionalProperties: { $ref: '#/components/schemas/MyComponent' },
                default: { id: 1, name: 'foo' },
              },
            },
          ],
          responses: {
            '200': {
              description: 'resoponse',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        MyComponent: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
            name: {
              type: 'string',
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type MyComponent = {
      id?: number;
      name?: string;
    };
    // Zod Schemas
    export const MyComponent = z
      .object({
        id: z.number().optional(),
        name: z.string().optional(),
      })
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/sample",
        requestFormat: "json",
        parameters: [
          {
            name: "empty-object",
            type: "Query",
            schema: z
              .object({
                foo: z.string().optional(),
              })
              .strict()
              .optional(),
          },
          {
            name: "default-object",
            type: "Query",
            schema: z
              .object({
                foo: z.string().optional(),
              })
              .strict()
              .optional(),
          },
          {
            name: "ref-object",
            type: "Query",
            schema: z.object({}).strict().optional(),
          },
        ],
        response: z.object({}).strict(),
        errors: [],
        responses: {
          200: {
            schema: z.object({}).strict(),
            description: "resoponse",
          },
        },
        request: {
          queryParams: z
            .object({
              "empty-object": z
                .object({
                  foo: z.string().optional(),
                })
                .strict()
                .optional(),
              "default-object": z
                .object({
                  foo: z.string().optional(),
                })
                .strict()
                .optional(),
              "ref-object": z.object({}).strict().optional(),
            })
            .strict(),
        },
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_sample",
          description: "GET /sample",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  "empty-object": {
                    type: "object",
                    default: {},
                    properties: { foo: { type: "string" } },
                    required: [],
                  },
                  "default-object": {
                    type: "object",
                    default: { foo: "bar" },
                    properties: { foo: { type: "string" } },
                    required: [],
                  },
                  "ref-object": {
                    type: "object",
                    default: { id: 1, name: "foo" },
                    additionalProperties: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        name: { type: "string" },
                      },
                      required: [],
                    },
                  },
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
          method: "get",
          path: "/sample",
          originalPath: "/sample",
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
