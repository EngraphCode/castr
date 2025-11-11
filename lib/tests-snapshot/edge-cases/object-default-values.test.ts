import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
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
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const MyComponent = z
      .object({ id: z.number(), name: z.string() })
      .partial()
      .strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/sample",
        operationId: "getSample",
        request: {
          queryParams: z
            .object({
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
