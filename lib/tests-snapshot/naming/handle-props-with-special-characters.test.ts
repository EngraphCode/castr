import { getZodSchema } from '../../src/schema-processing/conversion/zod/index.js';
import { test, expect } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';

test('handle-props-with-special-characters', async () => {
  const schemaWithSpecialCharacters: SchemaObject = {
    properties: {
      '@id': { type: 'string' },
      id: { type: 'number' },
    },
  };

  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/something': {
        get: {
          operationId: 'getSomething',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: schemaWithSpecialCharacters,
                },
              },
            },
          },
        },
      },
    },
  };

  expect(getZodSchema({ schema: schemaWithSpecialCharacters })).toMatchInlineSnapshot(
    `
    {
        "code": "z.strictObject({
      '@id': z.string().optional(),
      id: z.number().optional(),
    })",
        "schema": {
            "properties": {
                "@id": {
                    "type": "string",
                },
                "id": {
                    "type": "number",
                },
            },
        },
    }
  `,
  );

  const output = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
  });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/something",
        requestFormat: "json",
        parameters: [],
        response: z.strictObject({
          "@id": z.string().optional(),
          id: z.number().optional(),
        }),
        errors: [],
        responses: {
          200: {
            schema: z.strictObject({
              "@id": z.string().optional(),
              id: z.number().optional(),
            }),
            description: "OK",
          },
        },
        request: {},
        alias: "getSomething",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_something",
          description: "GET /something",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: { "@id": { type: "string" }, id: { type: "number" } },
            required: [],
            additionalProperties: false,
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get",
          path: "/something",
          originalPath: "/something",
          operationId: "getSomething",
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
