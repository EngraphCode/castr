import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/test-helpers/legacy-compat.js';
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
              description: 'Success',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/BasicString' } },
              },
            },
            400: {
              description: 'Bad Request',
              content: {
                'application/json': { schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] } },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': { schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] } },
              },
            },
            402: {
              description: 'Payment Required',
              content: {
                'application/json': { schema: { type: 'array', items: { type: 'string' } } },
              },
            },
            403: {
              description: 'Forbidden',
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
              description: 'Not Found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SimpleObject',
                  },
                },
              },
            },
            405: {
              description: 'Method Not Allowed',
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
              description: 'Not Acceptable',
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
              description: 'Proxy Authentication Required',
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
    // Type Definitions
    export type BasicString = string;
    export type SimpleObject = {
      str?: string;
    };
    export type ComplexObject = {
      str?: string;
      strRef?: BasicString;
      num?: number;
      bool?: boolean;
      ref?: SimpleObject;
      refArray?: SimpleObject[];
    };
    // Zod Schemas
    export const BasicString = z.string();
    export const SimpleObject = z
      .object({
        str: z.string().optional(),
      })
      .strict();
    export const ComplexObject = z
      .object({
        str: z.string().optional(),
        strRef: BasicString.optional(),
        num: z.number().optional(),
        bool: z.boolean().optional(),
        ref: SimpleObject.optional(),
        refArray: z.array(SimpleObject).optional(),
      })
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/inline-simple-schemas",
        requestFormat: "json",
        parameters: [],
        response: BasicString,
        errors: [
          {
            status: 400,
            schema: z.enum(["xxx", "yyy", "zzz"]),
            description: "Bad Request",
          },
          {
            status: 401,
            schema: z.enum(["xxx", "yyy", "zzz"]),
            description: "Unauthorized",
          },
          {
            status: 402,
            schema: z.array(z.string()),
            description: "Payment Required",
          },
          {
            status: 403,
            schema: z
              .object({
                str: z.string().optional(),
              })
              .strict(),
            description: "Forbidden",
          },
          {
            status: 404,
            schema: SimpleObject,
            description: "Not Found",
          },
          {
            status: 405,
            schema: z.array(SimpleObject),
            description: "Method Not Allowed",
          },
          {
            status: 406,
            schema: z.array(
              z
                .object({
                  str: z.string().optional(),
                })
                .strict(),
            ),
            description: "Not Acceptable",
          },
          {
            status: 407,
            schema: z.array(ComplexObject),
            description: "Proxy Authentication Required",
          },
        ],
        responses: {
          200: {
            schema: BasicString,
            description: "Success",
          },
          400: {
            schema: z.enum(["xxx", "yyy", "zzz"]),
            description: "Bad Request",
          },
          401: {
            schema: z.enum(["xxx", "yyy", "zzz"]),
            description: "Unauthorized",
          },
          402: {
            schema: z.array(z.string()),
            description: "Payment Required",
          },
          403: {
            schema: z
              .object({
                str: z.string().optional(),
              })
              .strict(),
            description: "Forbidden",
          },
          404: {
            schema: SimpleObject,
            description: "Not Found",
          },
          405: {
            schema: z.array(SimpleObject),
            description: "Method Not Allowed",
          },
          406: {
            schema: z.array(
              z
                .object({
                  str: z.string().optional(),
                })
                .strict(),
            ),
            description: "Not Acceptable",
          },
          407: {
            schema: z.array(ComplexObject),
            description: "Proxy Authentication Required",
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
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: { value: { type: "string" } },
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
