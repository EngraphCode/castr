import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/61
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
    // Zod Schemas
    export const MyComponent = z
      .object({ id: z.number(), name: z.string() })
      .partial()
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
              .object({ foo: z.string() })
              .partial()
              .strict()
              .optional()
              .default({}),
          },
          {
            name: "default-object",
            type: "Query",
            schema: z
              .object({ foo: z.string() })
              .partial()
              .strict()
              .optional()
              .default({ foo: "bar" }),
          },
          {
            name: "ref-object",
            type: "Query",
            schema: z
              .record(MyComponent)
              .optional()
              .default({ id: 1, name: "foo" }),
          },
        ],
        response: z.void(),
        errors: [],
        responses: {
          200: {
            schema: z.void(),
            description: "resoponse",
          },
        },
        request: {
          queryParams: z.object({
            "empty-object": z
              .object({ foo: z.string() })
              .partial()
              .strict()
              .optional()
              .default({}),
            "default-object": z
              .object({ foo: z.string() })
              .partial()
              .strict()
              .optional()
              .default({ foo: "bar" }),
            "ref-object": z
              .record(MyComponent)
              .optional()
              .default({ id: 1, name: "foo" }),
          }),
        },
        alias: "getSample",
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
                    default: {},
                    type: "object",
                    properties: {
                      foo: {
                        type: "string",
                      },
                    },
                  },
                  "default-object": {
                    default: {
                      foo: "bar",
                    },
                    type: "object",
                    properties: {
                      foo: {
                        type: "string",
                      },
                    },
                  },
                  "ref-object": {
                    default: {
                      id: 1,
                      name: "foo",
                    },
                    type: "object",
                    additionalProperties: {
                      type: "object",
                      properties: {
                        id: {
                          type: "number",
                        },
                        name: {
                          type: "string",
                        },
                      },
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
