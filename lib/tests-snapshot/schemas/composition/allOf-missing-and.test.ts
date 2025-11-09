import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/49
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
              content: { 'application/json': { schema: { $ref: '#/components/schemas/test4' } } },
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
        test4: {
          allOf: [
            { $ref: '#/components/schemas/test1' },
            { $ref: '#/components/schemas/test2' },
            { $ref: '#/components/schemas/test3' },
          ],
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const test1 = z.object({ text1: z.string() }).partial().strict();
    export const test2 = z.object({ text2: z.number() }).partial().strict();
    export const test3 = z.object({ text3: z.boolean() }).partial().strict();
    export const test4 = test1.and(test2).and(test3);

    export const endpoints = [
      {
        method: "put" as const,
        path: "/pet",
        operationId: "putPet",
        request: {},
        responses: { 200: { description: "Successful operation", schema: test4 } },
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
          },
          outputSchema: {
            type: "object",
            properties: {
              value: {
                allOf: [
                  {
                    type: "object",
                    properties: {
                      text1: {
                        type: "string",
                      },
                    },
                  },
                  {
                    type: "object",
                    properties: {
                      text2: {
                        type: "number",
                      },
                    },
                  },
                  {
                    type: "object",
                    properties: {
                      text3: {
                        type: "boolean",
                      },
                    },
                  },
                ],
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
