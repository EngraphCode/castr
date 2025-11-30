import { getZodSchema } from '../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';

test('handle-props-with-special-characters', async () => {
  const schemaWithSpecialCharacters = {
    properties: {
      '@id': { type: 'string' },
      id: { type: 'number' },
    },
  } as SchemaObject;

  expect(getZodSchema({ schema: schemaWithSpecialCharacters })).toMatchInlineSnapshot(
    `
    {
        "code": "z.object({ "@id": z.string(), id: z.number() }).partial().passthrough()",
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
    openApiDoc: {
      openapi: '3.0.3',
      info: { version: '1', title: 'Example API' },
      paths: {
        '/something': {
          get: {
            operationId: 'getSomething',
            responses: {
              '200': {
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
    } as OpenAPIObject,
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
        response: z
          .object({ "@id": z.string(), id: z.number() })
          .partial()
          .strict(),
        errors: [],
        responses: {
          200: {
            schema: z
              .object({ "@id": z.string(), id: z.number() })
              .partial()
              .strict(),
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
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              value: {
                type: "object",
                properties: {
                  "@id": {
                    type: "string",
                  },
                  id: {
                    type: "number",
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
