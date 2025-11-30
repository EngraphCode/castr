import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';

// https://github.com/astahmer/openapi-zod-client/issues/61
test('array-default-values', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'enums min max',
    },
    paths: {
      '/sample': {
        get: {
          parameters: [
            {
              in: 'query',
              name: 'array-empty',
              schema: {
                type: 'array',
                items: { type: 'string' },
                default: [],
              },
            },
            {
              in: 'query',
              name: 'array-string',
              schema: {
                type: 'array',
                items: { type: 'string' },
                default: ['one', 'two'],
              },
            },
            {
              in: 'query',
              name: 'array-number',
              schema: {
                type: 'array',
                items: { type: 'number' },
                default: [1, 2],
              },
            },
            {
              in: 'query',
              name: 'array-object',
              schema: {
                type: 'array',
                items: { type: 'object', properties: { foo: { type: 'string' } } },
                default: [{ foo: 'bar' }],
              },
            },
            {
              in: 'query',
              name: 'array-ref-object',
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/MyComponent' },
                default: [{ id: 1, name: 'foo' }],
              },
            },
            {
              in: 'query',
              name: 'array-ref-enum',
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/MyEnum' },
                default: ['one', 'two'],
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
        MyEnum: {
          type: 'string',
          enum: ['one', 'two', 'three'],
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Zod Schemas
    export const array_object = z
      .array(z.object({ foo: z.string() }).partial().strict())
      .optional()
      .default([{ foo: "bar" }]);
    export const MyComponent = z
      .object({ id: z.number(), name: z.string() })
      .partial()
      .strict();
    export const MyEnum = z.enum(["one", "two", "three"]);
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/sample",
        requestFormat: "json",
        parameters: [
          {
            name: "array-empty",
            type: "Query",
            schema: z.array(z.string()).optional().default([]),
          },
          {
            name: "array-string",
            type: "Query",
            schema: z.array(z.string()).optional().default(["one", "two"]),
          },
          {
            name: "array-number",
            type: "Query",
            schema: z.array(z.number()).optional().default([1, 2]),
          },
          {
            name: "array-object",
            type: "Query",
            schema: array_object,
          },
          {
            name: "array-ref-object",
            type: "Query",
            schema: z
              .array(MyComponent)
              .optional()
              .default([{ id: 1, name: "foo" }]),
          },
          {
            name: "array-ref-enum",
            type: "Query",
            schema: z.array(MyEnum).optional().default(["one", "two"]),
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
            "array-empty": z.array(z.string()).optional().default([]),
            "array-string": z.array(z.string()).optional().default(["one", "two"]),
            "array-number": z.array(z.number()).optional().default([1, 2]),
            "array-object": array_object,
            "array-ref-object": z
              .array(MyComponent)
              .optional()
              .default([{ id: 1, name: "foo" }]),
            "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
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
                  "array-empty": {
                    default: [],
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  "array-string": {
                    default: ["one", "two"],
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  "array-number": {
                    default: [1, 2],
                    type: "array",
                    items: {
                      type: "number",
                    },
                  },
                  "array-object": {
                    default: [
                      {
                        foo: "bar",
                      },
                    ],
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        foo: {
                          type: "string",
                        },
                      },
                    },
                  },
                  "array-ref-object": {
                    default: [
                      {
                        id: 1,
                        name: "foo",
                      },
                    ],
                    type: "array",
                    items: {
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
                  "array-ref-enum": {
                    default: ["one", "two"],
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["one", "two", "three"],
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
