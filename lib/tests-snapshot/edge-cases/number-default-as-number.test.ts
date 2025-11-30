import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

test('number-default-cast', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/pet': {
        put: {
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/test1' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        test1: {
          type: 'object',
          properties: {
            text1: { type: 'string', default: 'aaa' },
            shouldBeFixed: { type: 'number', default: '20' },
            isFine: { type: 'number', default: 30 },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Zod Schemas
    export const test1 = z
      .object({
        text1: z.string().default("aaa"),
        shouldBeFixed: z.number().default(20),
        isFine: z.number().default(30),
      })
      .partial()
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "put",
        path: "/pet",
        requestFormat: "json",
        parameters: [],
        response: test1,
        errors: [],
        responses: {
          200: {
            schema: test1,
            description: "Successful operation",
          },
        },
        request: {},
        alias: "putPet",
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
          },
          outputSchema: {
            type: "object",
            properties: {
              text1: {
                default: "aaa",
                type: "string",
              },
              shouldBeFixed: {
                default: "20",
                type: "number",
              },
              isFine: {
                default: 30,
                type: "number",
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
