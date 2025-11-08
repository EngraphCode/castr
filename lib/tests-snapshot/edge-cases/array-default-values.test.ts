import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

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
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const array_object = z
      .array(z.object({ foo: z.string() }).partial().strict())
      .optional()
      .default([{ foo: "bar" }]);
    export const MyComponent = z
      .object({ id: z.number(), name: z.string() })
      .partial()
      .strict();
    export const MyEnum = z.enum(["one", "two", "three"]);

    export const endpoints = [
      {
        method: "get" as const,
        path: "/sample",
        operationId: "getSample",
        request: {
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
        },
        responses: { 200: { description: "resoponse", schema: z.void() } },
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
                      $ref: "#/definitions/MyComponent",
                    },
                  },
                  "array-ref-enum": {
                    default: ["one", "two"],
                    type: "array",
                    items: {
                      $ref: "#/definitions/MyEnum",
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
          method: "get" as const,
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
