import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/test-helpers/legacy-compat.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

test('schema-type-wrong-case', async () => {
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
        // @ts-expect-error TS2322 - Testing invalid schema type ('Integer' instead of 'integer') to verify error handling
        test1: { type: 'object', properties: { text1: { type: 'Integer' as unknown } } },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type test1 = {
      text1?: unknown;
    };
    // Zod Schemas
    export const test1 = z
      .object({
        text1: z.unknown().optional(),
      })
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
            properties: { text1: { type: "Integer" } },
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
