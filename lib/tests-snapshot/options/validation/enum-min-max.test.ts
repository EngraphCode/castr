import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

// https://github.com/astahmer/openapi-zod-client/issues/61
test('enum-min-max', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'enums min max',
    },
    paths: {
      '/sample': {
        get: {
          parameters: [
            {
              in: 'query',
              name: 'foo',
              schema: {
                type: 'integer',
                enum: [1, -2, 3],
                minimum: 4,
                maximum: 10,
              },
            },
            {
              in: 'query',
              name: 'bar',
              schema: {
                type: 'string',
                enum: ['Dogs', 'Cats', 'Mice'],
                minLength: 4,
              },
            },
          ],
          responses: {
            '200': {
              description: 'resoponse',
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/sample",
        requestFormat: "json",
        parameters: [
          {
            name: "foo",
            type: "Query",
            schema: z.union([z.literal(1), z.literal(-2), z.literal(3)]).optional(),
          },
          {
            name: "bar",
            type: "Query",
            schema: z.enum(["Dogs", "Cats", "Mice"]).optional(),
          },
        ],
        response: z.void(),
        errors: [],
        responses: {
          200: {
            schema: z.void(),
            description: "resoponse",
          },
        },
        request: {
          queryParams: z.object({
            foo: z.union([z.literal(1), z.literal(-2), z.literal(3)]).optional(),
            bar: z.enum(["Dogs", "Cats", "Mice"]).optional(),
          }),
        },
        alias: "getSample",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_sample",
          description: "GET /sample",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  foo: {
                    type: "integer",
                    enum: [1, -2, 3],
                    minimum: 4,
                    maximum: 10,
                  },
                  bar: {
                    type: "string",
                    enum: ["Dogs", "Cats", "Mice"],
                    minLength: 4,
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
          path: "/sample",
          originalPath: "/sample",
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
