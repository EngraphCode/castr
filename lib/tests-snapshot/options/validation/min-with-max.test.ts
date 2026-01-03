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
              content: { 'application/json': { schema: { $ref: '#/components/schemas/test2' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        test2: {
          type: 'object',
          properties: { text2: { type: 'string', minLength: 5, maxLength: 10 } },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type test2 = {
      text2?: string;
    };
    // Zod Schemas
    export const test2 = z
      .object({
        text2: z.string().min(5).max(10).optional(),
      })
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "put",
        path: "/pet",
        requestFormat: "json",
        parameters: [],
        response: test2,
        errors: [],
        responses: {
          200: {
            schema: test2,
            description: "Successful operation",
          },
        },
        request: {},
        alias: "putpet",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "put_pet",
          description: "PUT /pet",
          inputSchema: { type: "object" },
          outputSchema: {
            type: "object",
            properties: { text2: { type: "string", minLength: 5, maxLength: 10 } },
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
