import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/116
test('array-oneOf-discriminated-union', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: {
      title: 'array oneOf discriminated union',
      version: 'v1',
    },
    paths: {
      '/test': {
        post: {
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ArrayRequest' } },
            },
          },
          responses: {
            '200': { description: 'Success' },
          },
        },
      },
    },
    components: {
      schemas: {
        ArrayRequest: {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'object',
                required: ['type', 'a'],
                properties: {
                  type: {
                    type: 'string',
                    enum: ['a'],
                  },
                },
              },
              {
                type: 'object',
                required: ['type', 'b'],
                properties: {
                  type: {
                    type: 'string',
                    enum: ['b'],
                  },
                },
              },
            ],
            discriminator: { propertyName: 'type' },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const ArrayRequest = z.array(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("a") }).strict(),
        z.object({ type: z.literal("b") }).strict(),
      ]),
    );

    export const endpoints = [
      {
        method: "post" as const,
        path: "/test",
        operationId: "postTest",
        request: { body: ArrayRequest },
        responses: { 200: { description: "Success", schema: z.void() } },
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
          name: "post_test",
          description: "POST /test",
          inputSchema: {
            type: "object",
            properties: {
              body: {
                type: "object",
                properties: {
                  value: {
                    type: "array",
                    items: {
                      oneOf: [
                        {
                          type: "object",
                          properties: {
                            type: {
                              type: "string",
                              enum: ["a"],
                            },
                          },
                          required: ["type", "a"],
                        },
                        {
                          type: "object",
                          properties: {
                            type: {
                              type: "string",
                              enum: ["b"],
                            },
                          },
                          required: ["type", "b"],
                        },
                      ],
                    },
                  },
                },
              },
            },
            required: ["body"],
          },
          annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "post" as const,
          path: "/test",
          originalPath: "/test",
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
