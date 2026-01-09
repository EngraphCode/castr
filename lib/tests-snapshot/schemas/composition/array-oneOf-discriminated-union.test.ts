import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/test-helpers/legacy-compat.js';

// https://github.com/astahmer/@engraph/castr/issues/116
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
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type ArrayRequest = unknown[];
    // Zod Schemas
    export const ArrayRequest = z.array(
      z.union([
        z
          .object({
            type: z.literal("a"),
          })
          .strict(),
        z
          .object({
            type: z.literal("b"),
          })
          .strict(),
      ]),
    );
    // Endpoints
    export const endpoints = [
      {
        method: "post",
        path: "/test",
        requestFormat: "json",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: ArrayRequest,
          },
        ],
        response: z.object({}).strict(),
        errors: [],
        responses: {
          200: {
            schema: z.object({}).strict(),
            description: "Success",
          },
        },
        request: {
          body: ArrayRequest,
        },
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "post_test",
          description: "POST /test",
          inputSchema: {
            type: "object",
            properties: {
              body: {
                type: "array",
                items: {
                  oneOf: [
                    {
                      type: "object",
                      properties: { type: { type: "string", enum: ["a"] } },
                      required: ["type", "a"],
                    },
                    {
                      type: "object",
                      properties: { type: { type: "string", enum: ["b"] } },
                      required: ["type", "b"],
                    },
                  ],
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
          method: "post",
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
