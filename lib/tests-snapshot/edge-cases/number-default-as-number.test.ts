import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
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
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const test1 = z
      .object({
        text1: z.string().default("aaa"),
        shouldBeFixed: z.number().default(20),
        isFine: z.number().default(30),
      })
      .partial()
      .strict();

    export const endpoints = [
      {
        method: "put" as const,
        path: "/pet",
        operationId: "putPet",
        request: {},
        responses: { 200: { description: "Successful operation", schema: test1 } },
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
