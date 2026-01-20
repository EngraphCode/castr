import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/test-helpers/legacy-compat.js';

// https://github.com/astahmer/@engraph/castr/issues/49
test('allOf-missing-and', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/pet': {
        put: {
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/test4' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        test1: { type: 'object', properties: { text1: { type: 'string' } } },
        test2: { type: 'object', properties: { text2: { type: 'number' } } },
        test3: { type: 'object', properties: { text3: { type: 'boolean' } } },
        test4: {
          allOf: [
            { $ref: '#/components/schemas/test1' },
            { $ref: '#/components/schemas/test2' },
            { $ref: '#/components/schemas/test3' },
          ],
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type test1 = {
      text1?: string;
    };
    export type test2 = {
      text2?: number;
    };
    export type test3 = {
      text3?: boolean;
    };
    export type test4 = test1 & test2 & test3;
    // Zod Schemas
    export const test1 = z
      .object({
        text1: z.string().optional(),
      })
      .strict();
    export const test2 = z
      .object({
        text2: z.number().optional(),
      })
      .strict();
    export const test3 = z
      .object({
        text3: z.boolean().optional(),
      })
      .strict();
    export const test4 = test1.and(test2).and(test3);
    // Endpoints
    export const endpoints = [
      {
        method: "put",
        path: "/pet",
        requestFormat: "json",
        parameters: [],
        response: test4,
        errors: [],
        responses: {
          200: {
            schema: test4,
            description: "Successful operation",
          },
        },
        request: {},
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "put_pet",
          description: "PUT /pet",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: {
              value: {
                allOf: [
                  {
                    type: "object",
                    properties: { text1: { type: "string" } },
                    required: [],
                  },
                  {
                    type: "object",
                    properties: { text2: { type: "number" } },
                    required: [],
                  },
                  {
                    type: "object",
                    properties: { text3: { type: "boolean" } },
                    required: [],
                  },
                ],
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
          path: "/pet",
          originalPath: "/pet",
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
