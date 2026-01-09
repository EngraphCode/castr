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
            schema: z
              .object({
                str: z.string().optional(),
              })
              .strict(),
          },
          {
            status: 404,
            schema: SimpleObject,
          },
          {
            status: 405,
            schema: z.array(SimpleObject),
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
          },
          {
            status: 407,
            schema: z.array(ComplexObject),
          },
        ],
        responses: {
          200: {
            schema: BasicString,
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
            schema: z
              .object({
                str: z.string().optional(),
              })
              .strict(),
          },
          404: {
            schema: SimpleObject,
          },
          405: {
            schema: z.array(SimpleObject),
          },
          406: {
            schema: z.array(
              z
                .object({
                  str: z.string().optional(),
                })
                .strict(),
            ),
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
