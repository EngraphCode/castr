import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/78
test('common-parameters', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/pet': {
        parameters: [
          { name: 'petId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'otherParam', in: 'query', schema: { $ref: '#/components/schemas/paramRef' } },
        ],
        put: {
          parameters: [
            { name: 'petId', in: 'query', required: true, schema: { type: 'number' } },
            { name: 'personId', in: 'query', required: true, schema: { type: 'number' } },
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
        },
        post: {
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { type: 'boolean' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        paramRef: { type: 'number' },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const paramRef = z.number();

    export const endpoints = [
      {
        method: "post" as const,
        path: "/pet",
        operationId: "postPet",
        request: {
          queryParams: z
            .object({ petId: z.string(), otherParam: z.number().optional() })
            .optional(),
        },
        responses: {
          200: { description: "Successful operation", schema: z.boolean() },
        },
      },
      {
        method: "put" as const,
        path: "/pet",
        operationId: "putPet",
        request: {
          queryParams: z
            .object({
              petId: z.number(),
              otherParam: z.number().optional(),
              personId: z.number(),
            })
            .optional(),
        },
        responses: {
          200: { description: "Successful operation", schema: z.string() },
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
          name: "post_pet",
          description: "POST /pet",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  petId: {
                    type: "string",
                  },
                  otherParam: {
                    type: "number",
                  },
                },
                required: ["petId"],
              },
            },
            required: ["query"],
          },
          outputSchema: {
            type: "object",
            properties: {
              value: {
                type: "boolean",
              },
            },
          },
          annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "post" as const,
          path: "/pet",
          originalPath: "/pet",
        },
        security: {
          isPublic: true,
          usesGlobalSecurity: false,
          requirementSets: [],
        },
      },
      {
        tool: {
          name: "put_pet",
          description: "PUT /pet",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  petId: {
                    type: "number",
                  },
                  otherParam: {
                    type: "number",
                  },
                  personId: {
                    type: "number",
                  },
                },
                required: ["petId", "personId"],
              },
            },
            required: ["query"],
          },
          outputSchema: {
            type: "object",
            properties: {
              value: {
                type: "string",
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
