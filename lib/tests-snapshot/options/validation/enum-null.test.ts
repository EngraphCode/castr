import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

// https://github.com/astahmer/openapi-zod-client/issues/61
test('enum-null', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'enum null',
    },
    components: {
      schemas: {
        Null1: {
          type: 'string',
          enum: [null],
        },
        Null2: {
          type: 'string',
          enum: ['a', null],
        },
        Null3: {
          type: 'string',
          enum: ['a', null],
        },
        Null4: {
          type: 'string',
          enum: [null],
        },
        Compound: {
          type: 'object',
          properties: {
            field: {
              oneOf: [
                { $ref: '#/components/schemas/Null1' },
                { $ref: '#/components/schemas/Null2' },
                { $ref: '#/components/schemas/Null3' },
                { $ref: '#/components/schemas/Null4' },
                { type: 'string' },
              ],
            },
          },
        },
      },
    },
    paths: {
      '/sample': {
        get: {
          responses: {
            '200': {
              description: 'one null',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Null1',
                  },
                },
              },
            },
            '400': {
              description: 'null with a string',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Null2',
                  },
                },
              },
            },
            '401': {
              description: 'null with a string and nullable',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Null3',
                  },
                },
              },
            },
            '402': {
              description: 'null with nullable',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Null4',
                  },
                },
              },
            },
            '403': {
              description: 'object that references null',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Compound',
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { shouldExportAllTypes: true },
  });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    type Compound = Partial<{ field: Null1 | Null2 | Null3 | Null4 | string }>;
    type Null1 = null;
    type Null2 = "a" | null;
    type Null3 = "a" | null;
    type Null4 = null;
    // Zod Schemas
    export const Null1 = z.literal(null);
    export const Null2 = z.enum(["a", null]);
    export const Null3 = z.enum(["a", null]);
    export const Null4 = z.literal(null);
    export const Compound = z
      .object({ field: z.union([Null1, Null2, Null3, Null4, z.string()]) })
      .partial()
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/sample",
        requestFormat: "json",
        parameters: [],
        response: z.literal(null),
        errors: [
          {
            status: 400,
            schema: z.enum(["a", null]),
            description: "null with a string",
          },
          {
            status: 401,
            schema: z.enum(["a", null]),
            description: "null with a string and nullable",
          },
          {
            status: 402,
            schema: z.literal(null),
            description: "null with nullable",
          },
          {
            status: 403,
            schema: Compound,
            description: "object that references null",
          },
        ],
        responses: {
          200: {
            schema: z.literal(null),
            description: "one null",
          },
          400: {
            schema: z.enum(["a", null]),
            description: "null with a string",
          },
          401: {
            schema: z.enum(["a", null]),
            description: "null with a string and nullable",
          },
          402: {
            schema: z.literal(null),
            description: "null with nullable",
          },
          403: {
            schema: Compound,
            description: "object that references null",
          },
        },
        request: {},
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
          },
          outputSchema: {
            type: "object",
            properties: {
              value: {
                type: "string",
                enum: [null],
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
