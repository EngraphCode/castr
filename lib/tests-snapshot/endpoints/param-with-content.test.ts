import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/test-helpers/legacy-compat.js';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';

test('param-with-content', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/pet': {
        put: {
          parameters: [
            {
              name: 'store',
              in: 'path',
              description: 'Store number',
              required: true,
              schema: { type: 'integer', format: 'int32' },
              example: 49,
            },
            {
              name: 'thing',
              in: 'query',
              content: { '*/*': { schema: { $ref: '#/components/schemas/test1' } } },
            },
            {
              name: 'wrong param',
              in: 'query',
              content: {
                // CORRECT: $ref is inside the schema property
                '*/*': { schema: { $ref: '#/components/schemas/test2' } },
              },
            },
            {
              name: 'Accept-Language',
              in: 'header',
              description: 'Accept language (fr-CA)',
              content: { '*/*': { schema: { type: 'string', default: 'EN' } } },
            },
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/test3' } } },
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
    // Endpoints
    export const endpoints = [
      {
        method: "put",
        path: "/pet",
        requestFormat: "json",
        parameters: [
          {
            name: "store",
            type: "Path",
            schema: z.int32(),
            description: "Store number",
          },
          {
            name: "thing",
            type: "Query",
            schema: test1.optional(),
          },
          {
            name: "wrong param",
            type: "Query",
            schema: test2.optional(),
          },
          {
            name: "Accept-Language",
            type: "Header",
            schema: z.string().optional(),
            description: "Accept language (fr-CA)",
          },
        ],
        response: test3,
        errors: [],
        responses: {
          200: {
            schema: test3,
            description: "Successful operation",
          },
        },
        request: {
          pathParams: z
            .object({
              store: z.int32(),
            })
            .strict(),
          queryParams: z
            .object({
              thing: test1.optional(),
              "wrong param": test2.optional(),
            })
            .strict(),
          headers: z
            .object({
              "Accept-Language": z.string().optional(),
            })
            .strict(),
        },
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "put_pet",
          description: "PUT /pet",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "object",
                properties: { store: { type: "integer", format: "int32" } },
                required: ["store"],
              },
              query: {
                type: "object",
                properties: {
                  thing: {
                    type: "object",
                    properties: { text1: { type: "string" } },
                    required: [],
                  },
                  "wrong param": {
                    type: "object",
                    properties: { text2: { type: "number" } },
                    required: [],
                  },
                },
              },
              headers: {
                type: "object",
                properties: {
                  "Accept-Language": { type: "string", default: "EN" },
                },
              },
            },
            required: ["path"],
          },
          outputSchema: {
            type: "object",
            properties: { text3: { type: "boolean" } },
            required: [],
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
