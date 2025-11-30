import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

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
  assertSingleFileResult(ctx);
  expect(ctx.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Zod Schemas
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
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/inline-simple-schemas",
        requestFormat: "json",
        parameters: [],
        response: z.string(),
        errors: [
          {
            status: 400,
            schema: z.enum(["xxx", "yyy", "zzz"]),
          },
          {
            status: 401,
            schema: z.enum(["xxx", "yyy", "zzz"]),
          },
          {
            status: 402,
            schema: z.array(z.string()),
          },
          {
            status: 403,
            schema: z.object({ str: z.string() }).partial().strict(),
          },
          {
            status: 404,
            schema: z.object({ str: z.string() }).partial().strict(),
          },
          {
            status: 405,
            schema: z.array(SimpleObject),
          },
          {
            status: 406,
            schema: z.array(z.object({ str: z.string() }).partial().strict()),
          },
          {
            status: 407,
            schema: z.array(ComplexObject),
          },
        ],
        responses: {
          200: {
            schema: z.string(),
          },
          400: {
            schema: z.enum(["xxx", "yyy", "zzz"]),
          },
          401: {
            schema: z.enum(["xxx", "yyy", "zzz"]),
          },
          402: {
            schema: z.array(z.string()),
          },
          403: {
            schema: z.object({ str: z.string() }).partial().strict(),
          },
          404: {
            schema: z.object({ str: z.string() }).partial().strict(),
          },
          405: {
            schema: z.array(SimpleObject),
          },
          406: {
            schema: z.array(z.object({ str: z.string() }).partial().strict()),
          },
          407: {
            schema: z.array(ComplexObject),
          },
        },
        request: {},
        alias: "123_example",
      },
    ] as const;
    // MCP Tools
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
          method: "get",
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
