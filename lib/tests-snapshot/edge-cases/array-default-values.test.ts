import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/test-helpers/legacy-compat.js';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';

// https://github.com/astahmer/@engraph/castr/issues/61
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
    // Type Definitions
    export type MyComponent = {
      id?: number;
      name?: string;
    };
    export type MyEnum = string;
    // Zod Schemas
    export const MyComponent = z
      .object({
        id: z.number().optional(),
        name: z.string().optional(),
      })
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
            schema: z.array(z.string()).optional(),
          },
          {
            name: "array-string",
            type: "Query",
            schema: z.array(z.string()).optional(),
          },
          {
            name: "array-number",
            type: "Query",
            schema: z.array(z.number()).optional(),
          },
          {
            name: "array-object",
            type: "Query",
            schema: z
              .array(
                z
                  .object({
                    foo: z.string().optional(),
                  })
                  .strict(),
              )
              .optional(),
          },
          {
            name: "array-ref-object",
            type: "Query",
            schema: z.array(MyComponent).optional(),
          },
          {
            name: "array-ref-enum",
            type: "Query",
            schema: z.array(MyEnum).optional(),
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
              "array-empty": z.array(z.string()).optional(),
              "array-string": z.array(z.string()).optional(),
              "array-number": z.array(z.number()).optional(),
              "array-object": z
                .array(
                  z
                    .object({
                      foo: z.string().optional(),
                    })
                    .strict(),
                )
                .optional(),
              "array-ref-object": z.array(MyComponent).optional(),
              "array-ref-enum": z.array(MyEnum).optional(),
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
                  "array-empty": {
                    type: "array",
                    default: [],
                    items: { type: "string" },
                  },
                  "array-string": {
                    type: "array",
                    default: ["one", "two"],
                    items: { type: "string" },
                  },
                  "array-number": {
                    type: "array",
                    default: [1, 2],
                    items: { type: "number" },
                  },
                  "array-object": {
                    type: "array",
                    default: [{ foo: "bar" }],
                    items: {
                      type: "object",
                      properties: { foo: { type: "string" } },
                      required: [],
                    },
                  },
                  "array-ref-object": {
                    type: "array",
                    default: [{ id: 1, name: "foo" }],
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        name: { type: "string" },
                      },
                      required: [],
                    },
                  },
                  "array-ref-enum": {
                    type: "array",
                    default: ["one", "two"],
                    items: { type: "string", enum: ["one", "two", "three"] },
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
