import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/49
test('allOf-infer-required-only-item', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: {
      title: 'User',
      version: '1.0.0',
    },
    paths: {
      '/user': {
        get: {
          responses: {
            '200': {
              description: 'return user',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/userResponse',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        user: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
          },
        },
        userResponse: {
          type: 'object',
          properties: {
            user: {
              allOf: [
                {
                  $ref: '#/components/schemas/user',
                },
                {
                  required: ['name'],
                },
              ],
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: {
      shouldExportAllTypes: true,
      shouldExportAllSchemas: true,
      withImplicitRequiredProps: true,
    },
  });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";

    type userResponse = Partial<{ user: user & { name: string } }>;
    type user = Partial<{ name: string; email: string }>;

    export const user: z.ZodType<user> = z
      .object({ name: z.string(), email: z.string() })
      .strict();
    export const userResponse: z.ZodType<userResponse> = z
      .object({ user: user.and(z.object({ name: z.string() }).strict()) })
      .strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/user",
        operationId: "getUser",
        request: {},
        responses: { 200: { description: "return user", schema: userResponse } },
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
          name: "get_user",
          description: "GET /user",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              user: {
                allOf: [
                  {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      email: {
                        type: "string",
                      },
                    },
                  },
                  {
                    type: "object",
                    required: ["name"],
                  },
                ],
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
          path: "/user",
          originalPath: "/user",
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
