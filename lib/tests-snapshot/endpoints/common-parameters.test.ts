import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/test-helpers/legacy-compat.js';

// https://github.com/astahmer/@engraph/castr/issues/78
test('common-parameters', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/pet': {
        parameters: [
          { name: 'petId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'otherParam', in: 'query', schema: { $ref: '#/components/schemas/paramRef' } },
        ],
        put: {
          parameters: [
            { name: 'petId', in: 'query', required: true, schema: { type: 'number' } },
            { name: 'personId', in: 'query', required: true, schema: { type: 'number' } },
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
        },
        post: {
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { type: 'boolean' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        paramRef: { type: 'number' },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type paramRef = number;
    // Zod Schemas
    export const paramRef = z.number();
    // Endpoints
    export const endpoints = [
      {
        method: "post",
        path: "/pet",
        requestFormat: "json",
        parameters: [
          {
            name: "petId",
            type: "Query",
            schema: z.string(),
          },
          {
            name: "otherParam",
            type: "Query",
            schema: paramRef.optional(),
          },
        ],
        response: z.boolean(),
        errors: [],
        responses: {
          200: {
            schema: z.boolean(),
            description: "Successful operation",
          },
        },
        request: {
          queryParams: z
            .object({
              petId: z.string(),
              otherParam: paramRef.optional(),
            })
            .strict(),
        },
      },
      {
        method: "put",
        path: "/pet",
        requestFormat: "json",
        parameters: [
          {
            name: "petId",
            type: "Query",
            schema: z.string(),
          },
          {
            name: "otherParam",
            type: "Query",
            schema: paramRef.optional(),
          },
          {
            name: "petId",
            type: "Query",
            schema: z.number(),
          },
          {
            name: "personId",
            type: "Query",
            schema: z.number(),
          },
        ],
        response: z.string(),
        errors: [],
        responses: {
          200: {
            schema: z.string(),
            description: "Successful operation",
          },
        },
        request: {
          queryParams: z
            .object({
              petId: z.string(),
              otherParam: paramRef.optional(),
              petId: z.number(),
              personId: z.number(),
            })
            .strict(),
        },
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "post_pet",
          description: "POST /pet",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  petId: { type: "string" },
                  otherParam: { type: "number" },
                },
                required: ["petId"],
              },
            },
            required: ["query"],
          },
          outputSchema: {
            type: "object",
            properties: { value: { type: "boolean" } },
          },
          annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "post",
          path: "/pet",
          originalPath: "/pet",
        },
        security: {
          isPublic: true,
          usesGlobalSecurity: false,
          requirementSets: [],
        },
      },
      {
        tool: {
          name: "put_pet",
          description: "PUT /pet",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  petId: { type: "number" },
                  otherParam: { type: "number" },
                  personId: { type: "number" },
                },
                required: ["petId", "personId"],
              },
            },
            required: ["query"],
          },
          outputSchema: {
            type: "object",
            properties: { value: { type: "string" } },
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
