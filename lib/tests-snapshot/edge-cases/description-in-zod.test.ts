import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

test('description-in-zod', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Numerical enums',
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
              },
              description: 'foo description',
            },
            {
              in: 'query',
              name: 'bar',
              schema: {
                type: 'number',
                enum: [1.2, 34, -56.789],
              },
              description: 'bar description',
            },
            {
              in: 'query',
              name: 'baz',
              schema: {
                type: 'number',
                enum: [1.3, 34.1, -57.89],
              },
              description: 'baz\nmultiline\ndescription',
            },
            {
              in: 'query',
              name: 'qux',
              schema: {
                type: 'string',
              },
              description: '      ', // spaces only description
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

  const output = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { withDescription: true },
  });
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
            schema: z
              .union([z.literal(1), z.literal(-2), z.literal(3)])
              .describe("foo description")
              .optional(),
            description: "foo description",
          },
          {
            name: "bar",
            type: "Query",
            schema: z
              .union([z.literal(1.2), z.literal(34), z.literal(-56.789)])
              .describe("bar description")
              .optional(),
            description: "bar description",
          },
          {
            name: "baz",
            type: "Query",
            schema: z
              .union([z.literal(1.3), z.literal(34.1), z.literal(-57.89)])
              .describe(
                \`baz
    multiline
    description\`,
              )
              .optional(),
            description: "baz\\nmultiline\\ndescription",
          },
          {
            name: "qux",
            type: "Query",
            schema: z.string().optional(),
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
            foo: z
              .union([z.literal(1), z.literal(-2), z.literal(3)])
              .describe("foo description")
              .optional(),
            bar: z
              .union([z.literal(1.2), z.literal(34), z.literal(-56.789)])
              .describe("bar description")
              .optional(),
            baz: z
              .union([z.literal(1.3), z.literal(34.1), z.literal(-57.89)])
              .describe(
                \`baz
    multiline
    description\`,
              )
              .optional(),
            qux: z.string().optional(),
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
                    description: "foo description",
                    type: "integer",
                    enum: [1, -2, 3],
                  },
                  bar: {
                    description: "bar description",
                    type: "number",
                    enum: [1.2, 34, -56.789],
                  },
                  baz: {
                    description: "baz\\nmultiline\\ndescription",
                    type: "number",
                    enum: [1.3, 34.1, -57.89],
                  },
                  qux: {
                    description: "",
                    type: "string",
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
