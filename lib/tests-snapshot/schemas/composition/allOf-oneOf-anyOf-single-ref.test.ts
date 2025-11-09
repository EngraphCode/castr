import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/49
test('allOf-single-ref', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.2',
    info: {
      title: 'allOf single ref',
      version: 'v1',
    },
    paths: {
      '/test': {
        get: {
          parameters: [
            {
              name: 'allOf_ref_param',
              schema: {
                allOf: [{ $ref: '#/components/schemas/MyComponent' }],
              },
              in: 'query',
            },
            {
              name: 'oneOf_ref_param',
              schema: {
                oneOf: [{ $ref: '#/components/schemas/MyComponent' }],
              },
              in: 'query',
            },
            {
              name: 'anyOf_ref_param',
              schema: {
                anyOf: [{ $ref: '#/components/schemas/MyComponent' }],
              },
              in: 'query',
            },
          ],
          responses: {
            '200': { description: 'Success' },
          },
        },
      },
    },
    components: {
      schemas: {
        MyComponent: {
          title: 'MyComponent',
          enum: ['one', 'two', 'three'],
          type: 'string',
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const MyComponent = z.enum(["one", "two", "three"]);
    export const allOf_ref_param = MyComponent.optional();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/test",
        operationId: "getTest",
        request: {
          queryParams: z
            .object({
              allOf_ref_param: allOf_ref_param,
              oneOf_ref_param: allOf_ref_param,
              anyOf_ref_param: allOf_ref_param,
            })
            .optional(),
          queryParams: z
            .object({
              allOf_ref_param: allOf_ref_param,
              oneOf_ref_param: allOf_ref_param,
              anyOf_ref_param: allOf_ref_param,
            })
            .optional(),
          queryParams: z
            .object({
              allOf_ref_param: allOf_ref_param,
              oneOf_ref_param: allOf_ref_param,
              anyOf_ref_param: allOf_ref_param,
            })
            .optional(),
        },
        responses: { 200: { description: "Success", schema: z.void() } },
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
          name: "get_test",
          description: "GET /test",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  allOf_ref_param: {
                    allOf: [
                      {
                        type: "string",
                        enum: ["one", "two", "three"],
                      },
                    ],
                  },
                  oneOf_ref_param: {
                    oneOf: [
                      {
                        type: "string",
                        enum: ["one", "two", "three"],
                      },
                    ],
                  },
                  anyOf_ref_param: {
                    anyOf: [
                      {
                        type: "string",
                        enum: ["one", "two", "three"],
                      },
                    ],
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
          path: "/test",
          originalPath: "/test",
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
