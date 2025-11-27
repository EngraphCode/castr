import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';
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

    export const test3 = z.object({ text3: z.boolean() }).partial().strict();
    export const test1 = z.object({ text1: z.string() }).partial().strict();
    export const test2 = z.object({ text2: z.number() }).partial().strict();

    export const endpoints = [
      {
        method: "put" as const,
        path: "/pet",
        operationId: "putPet",
        request: {
          pathParams: z.object({ store: z.number().int() }),
          queryParams: z
            .object({
              thing: z.object({ text1: z.string() }).partial().strict().optional(),
              "wrong param": z
                .object({ text2: z.number() })
                .partial()
                .strict()
                .optional(),
            })
            .optional(),
          headers: z
            .object({ "Accept-Language": z.string().optional().default("EN") })
            .optional(),
        },
        responses: {
          200: {
            description: "Successful operation",
            schema: z.object({ text3: z.boolean() }).partial().strict(),
          },
        },
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
          name: "put_pet",
          description: "PUT /pet",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "object",
                properties: {
                  store: {
                    type: "integer",
                  },
                },
                required: ["store"],
              },
              query: {
                type: "object",
                properties: {
                  thing: {
                    type: "object",
                    properties: {
                      text1: {
                        type: "string",
                      },
                    },
                  },
                  "wrong param": {
                    type: "object",
                    properties: {
                      text2: {
                        type: "number",
                      },
                    },
                  },
                },
              },
              headers: {
                type: "object",
                properties: {
                  "Accept-Language": {
                    default: "EN",
                    type: "string",
                  },
                },
              },
            },
            required: ["path"],
          },
          outputSchema: {
            type: "object",
            properties: {
              text3: {
                type: "boolean",
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
          method: "put" as const,
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
