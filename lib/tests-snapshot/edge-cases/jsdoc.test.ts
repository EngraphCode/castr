import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { test, expect } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/test-helpers/legacy-compat.js';

test('jsdoc', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/test': {
        get: {
          operationId: '123_example',
          responses: {
            '200': {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ComplexObject' } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        SimpleObject: {
          type: 'object',
          properties: {
            str: { type: 'string' },
          },
        },
        ComplexObject: {
          type: 'object',
          properties: {
            example: {
              type: 'string',
              description: 'A string with example tag',
              example: 'example',
            },
            examples: {
              type: 'string',
              description: 'A string with examples tag',
              examples: ['example1', 'example2'],
            },
            manyTagsStr: {
              type: 'string',
              description: 'A string with many tags',
              minLength: 1,
              maxLength: 10,
              pattern: '^[a-z]*$',
              enum: ['a', 'b', 'c'],
            },
            numMin: {
              type: 'number',
              description: 'A number with minimum tag',
              minimum: 0,
            },
            numMax: {
              type: 'number',
              description: 'A number with maximum tag',
              maximum: 10,
            },
            manyTagsNum: {
              type: 'number',
              description: 'A number with many tags',
              minimum: 0,
              maximum: 10,
              default: 5,
              example: 3,
              deprecated: true,
              externalDocs: { url: 'https://example.com' },
            },
            bool: {
              type: 'boolean',
              description: 'A boolean',
              default: true,
            },
            ref: { $ref: '#/components/schemas/SimpleObject' },
            refArray: {
              type: 'array',
              description: 'An array of SimpleObject',
              items: {
                $ref: '#/components/schemas/SimpleObject',
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
    options: {
      withDocs: true,
      shouldExportAllTypes: true,
    },
  });

  assertSingleFileResult(output);

  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type SimpleObject = {
      str?: string;
    };
    export type ComplexObject = {
      examples?: unknown;
      /** A string with many tags */ manyTagsStr?: string;
      /** A number with minimum tag */ numMin?: number;
      /** A number with maximum tag */ numMax?: number;
      /** A number with many tags */ manyTagsNum?: number;
      /** A boolean */ bool?: boolean;
      ref?: SimpleObject;
      /** An array of SimpleObject */ refArray?: SimpleObject[];
    };
    // Zod Schemas
    export const SimpleObject = z
      .object({
        str: z.string().optional(),
      })
      .strict();
    export const ComplexObject = z
      .object({
        examples: z.unknown().optional(),
        manyTagsStr: z
          .enum(["a", "b", "c"])
          .min(1)
          .max(10)
          .regex(/^[a-z]*$/)
          .optional(),
        numMin: z.number().min(0).optional(),
        numMax: z.number().max(10).optional(),
        manyTagsNum: z.number().min(0).max(10).optional(),
        bool: z.boolean().optional(),
        ref: SimpleObject.optional(),
        refArray: z.array(SimpleObject).optional(),
      })
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/test",
        requestFormat: "json",
        parameters: [],
        response: ComplexObject,
        errors: [],
        responses: {
          200: {
            schema: ComplexObject,
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
          description: "GET /test",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: {
              examples: {},
              manyTagsStr: {
                type: "string",
                description: "A string with many tags",
                minLength: 1,
                maxLength: 10,
                pattern: "^[a-z]*$",
                enum: ["a", "b", "c"],
              },
              numMin: {
                type: "number",
                description: "A number with minimum tag",
                minimum: 0,
              },
              numMax: {
                type: "number",
                description: "A number with maximum tag",
                maximum: 10,
              },
              manyTagsNum: {
                type: "number",
                description: "A number with many tags",
                default: 5,
                examples: [3],
                minimum: 0,
                maximum: 10,
              },
              bool: { type: "boolean", description: "A boolean", default: true },
              ref: {
                type: "object",
                properties: { str: { type: "string" } },
                required: [],
              },
              refArray: {
                type: "array",
                description: "An array of SimpleObject",
                items: {
                  type: "object",
                  properties: { str: { type: "string" } },
                  required: [],
                },
              },
            },
            required: [],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get",
          path: "/test",
          originalPath: "/test",
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
