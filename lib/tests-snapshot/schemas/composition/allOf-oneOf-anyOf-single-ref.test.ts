import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/test-helpers/legacy-compat.js';

// https://github.com/astahmer/@engraph/castr/issues/49
test('allOf-single-ref', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.2',
    info: {
      title: 'allOf single ref',
      version: 'v1',
    },
    paths: {
      '/test': {
        get: {
          parameters: [
            {
              name: 'allOf_ref_param',
              schema: {
                allOf: [{ $ref: '#/components/schemas/MyComponent' }],
              },
              in: 'query',
            },
            {
              name: 'oneOf_ref_param',
              schema: {
                oneOf: [{ $ref: '#/components/schemas/MyComponent' }],
              },
              in: 'query',
            },
            {
              name: 'anyOf_ref_param',
              schema: {
                anyOf: [{ $ref: '#/components/schemas/MyComponent' }],
              },
              in: 'query',
            },
          ],
          responses: {
            '200': { description: 'Success' },
          },
        },
      },
    },
    components: {
      schemas: {
        MyComponent: {
          title: 'MyComponent',
          enum: ['one', 'two', 'three'],
          type: 'string',
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type MyComponent = string;
    // Zod Schemas
    export const MyComponent = z.enum(["one", "two", "three"]);
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/test",
        requestFormat: "json",
        parameters: [
          {
            name: "allOf_ref_param",
            type: "Query",
            schema: MyComponent.optional(),
          },
          {
            name: "oneOf_ref_param",
            type: "Query",
            schema: MyComponent.optional(),
          },
          {
            name: "anyOf_ref_param",
            type: "Query",
            schema: MyComponent.optional(),
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
          queryParams: z.object({
            allOf_ref_param: MyComponent.optional(),
            oneOf_ref_param: MyComponent.optional(),
            anyOf_ref_param: MyComponent.optional(),
          }),
        },
        alias: "gettest",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_test",
          description: "GET /test",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  allOf_ref_param: {
                    allOf: [{ type: "string", enum: ["one", "two", "three"] }],
                  },
                  oneOf_ref_param: {
                    oneOf: [{ type: "string", enum: ["one", "two", "three"] }],
                  },
                  anyOf_ref_param: {
                    anyOf: [{ type: "string", enum: ["one", "two", "three"] }],
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
          method: "get",
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
