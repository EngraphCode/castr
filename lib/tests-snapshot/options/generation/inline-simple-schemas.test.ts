import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

test('inline-simple-schemas', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/inline-simple-schemas': {
        get: {
          operationId: '123_example',
          responses: {
            '200': {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/BasicString' } },
              },
            },
            400: {
              content: {
                'application/json': { schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] } },
              },
            },
            401: {
              content: {
                'application/json': { schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] } },
              },
            },
            402: {
              content: {
                'application/json': { schema: { type: 'array', items: { type: 'string' } } },
              },
            },
            403: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      str: { type: 'string' },
                    },
                  },
                },
              },
            },
            404: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SimpleObject',
                  },
                },
              },
            },
            405: {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/SimpleObject',
                    },
                  },
                },
              },
            },
            406: {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        str: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            407: {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ComplexObject',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        BasicString: { type: 'string' },
        SimpleObject: {
          type: 'object',
          properties: {
            str: { type: 'string' },
          },
        },
        ComplexObject: {
          type: 'object',
          properties: {
            str: { type: 'string' },
            strRef: { $ref: '#/components/schemas/BasicString' },
            num: { type: 'number' },
            bool: { type: 'boolean' },
            ref: { $ref: '#/components/schemas/SimpleObject' },
            refArray: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SimpleObject',
              },
            },
          },
        },
      },
    },
  };

  const ctx = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
  expect(ctx).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const BasicString = z.string();
    export const SimpleObject = z.object({ str: z.string() }).partial().strict();
    export const ComplexObject = z
      .object({
        str: z.string(),
        strRef: BasicString,
        num: z.number(),
        bool: z.boolean(),
        ref: SimpleObject,
        refArray: z.array(SimpleObject),
      })
      .partial()
      .strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/inline-simple-schemas",
        operationId: "123_example",
        request: {},
        responses: {
          200: { schema: z.string() },
          400: { schema: z.enum(["xxx", "yyy", "zzz"]) },
          401: { schema: z.enum(["xxx", "yyy", "zzz"]) },
          402: { schema: z.array(z.string()) },
          403: { schema: z.object({ str: z.string() }).partial().strict() },
          404: { schema: z.object({ str: z.string() }).partial().strict() },
          405: { schema: z.array(SimpleObject) },
          406: {
            schema: z.array(z.object({ str: z.string() }).partial().strict()),
          },
          407: { schema: z.array(ComplexObject) },
        },
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
          name: "123_example",
          description: "GET /inline-simple-schemas",
          inputSchema: {
            type: "object",
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
          path: "/inline-simple-schemas",
          originalPath: "/inline-simple-schemas",
          operationId: "123_example",
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
