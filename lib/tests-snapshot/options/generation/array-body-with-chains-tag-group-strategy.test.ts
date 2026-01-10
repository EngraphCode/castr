import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertGroupedFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/test-helpers/legacy-compat.js';

test('array-body-with-chains-tag-group-strategy', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.1' },
    paths: {
      '/test': {
        put: {
          summary: 'Test',
          description: 'Test',
          tags: ['Test'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      testItem: {
                        type: 'string',
                      },
                    },
                    additionalProperties: false,
                  },
                  minItems: 1,
                  maxItems: 10,
                },
              },
            },
          },
          parameters: [],
          responses: {
            '200': {
              description: 'Success',
              content: { 'application/json': {} },
            },
          },
        },
      },
    },
    components: {},
    tags: [],
  };

  const output = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { groupStrategy: 'tag-file' },
  });
  assertGroupedFileResult(output);
  expect(output.files).toMatchInlineSnapshot(`
    {
        "__index": "export * as TestApi from "./test";
    ",
        "test": "import { z } from "zod";
    // Type Definitions
    export type put_test_Body = {
      testItem?: string;
    }[];
    // Zod Schemas
    export const put_test_Body = z
      .array(
        z
          .object({
            testItem: z.string().optional(),
          })
          .strict(),
      )
      .min(1)
      .max(10);
    // Endpoints
    export const endpoints = [
      {
        method: "put",
        path: "/test",
        requestFormat: "json",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z
              .array(
                z
                  .object({
                    testItem: z.string().optional(),
                  })
                  .strict(),
              )
              .min(1)
              .max(10),
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
          body: z
            .array(
              z
                .object({
                  testItem: z.string().optional(),
                })
                .strict(),
            )
            .min(1)
            .max(10),
        },
        description: "Test",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "put_test",
          title: "Test",
          description: "Test",
          inputSchema: {
            type: "object",
            properties: {
              body: {
                type: "object",
                properties: {
                  value: {
                    type: "array",
                    minItems: 1,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: { testItem: { type: "string" } },
                      required: [],
                      additionalProperties: false,
                    },
                  },
                },
              },
            },
          },
          annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
          },
        },
        httpOperation: {
          method: "put",
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
    ",
    }
  `);
});
