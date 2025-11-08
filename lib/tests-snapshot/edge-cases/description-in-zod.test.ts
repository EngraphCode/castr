import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
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
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const endpoints = [
      {
        method: "get" as const,
        path: "/sample",
        operationId: "getSample",
        request: {
          queryParams: z
            .object({
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
            })
            .optional(),
          queryParams: z
            .object({
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
            })
            .optional(),
          queryParams: z
            .object({
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
            })
            .optional(),
          queryParams: z
            .object({
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
            })
            .optional(),
        },
        responses: { 200: { description: "resoponse", schema: z.void() } },
      },
    ] as const;

    /**
     * MCP (Model Context Protocol) tool metadata derived from the OpenAPI document.
     *
     * Each entry provides:
     * - \`tool\`: JSON Schema Draft 07 compliant tool definition (name, description, annotations, schemas)
     * - \`httpOperation\`: source HTTP metadata (method, templated path, original path, operationId)
     * - \`security\`: upstream API security requirements (Layer 2 metadata only)
     *
     * Use \`tool\` when wiring into the MCP SDK, and \`httpOperation\`/\`security\` when presenting
     * additional context to operators or logging.
     */
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
          method: "get" as const,
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
