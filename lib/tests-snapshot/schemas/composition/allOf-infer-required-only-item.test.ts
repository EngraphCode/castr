import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/@engraph/castr/issues/49
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
    // Type Definitions
    export type user = {
      name?: string;
      email?: string;
    };
    export type userResponse = {
      user?: user & unknown;
    };
    // Zod Schemas
    export const user = z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
      })
      .strict();
    export const userResponse = z
      .object({
        user: user.and(z.unknown()).optional(),
      })
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/user",
        requestFormat: "json",
        parameters: [],
        response: userResponse,
        errors: [],
        responses: {
          200: {
            schema: userResponse,
            description: "return user",
          },
        },
        request: {},
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_user",
          description: "GET /user",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: {
              user: {
                allOf: [
                  {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string" },
                    },
                    required: [],
                  },
                  {},
                ],
              },
            },
            required: [],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get",
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
