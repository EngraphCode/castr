import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/test-helpers/legacy-compat.js';

// https://github.com/astahmer/@engraph/castr/issues/122
test('request-body-ref', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: {
      title: 'Pets',
      version: '1.0.0',
    },
    paths: {
      '/pets': {
        post: {
          summary: 'Post pets.',
          operationId: 'PostPets',
          requestBody: {
            $ref: '#/components/requestBodies/PostPetsRequest',
          },
          responses: {
            '200': { description: 'OK' },
          },
        },
      },
    },
    components: {
      schemas: {
        PostPetsRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
      requestBodies: {
        PostPetsRequest: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PostPetsRequest',
              },
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
    // Type Definitions
    export type PostPetsRequest = {
      id?: string;
    };
    // Zod Schemas
    export const PostPetsRequest = z
      .object({
        id: z.string().optional(),
      })
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "post",
        path: "/pets",
        requestFormat: "json",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: PostPetsRequest,
          },
        ],
        response: z.object({}).strict(),
        errors: [],
        responses: {
          200: {
            schema: z.object({}).strict(),
            description: "OK",
          },
        },
        request: {
          body: PostPetsRequest,
        },
        alias: "PostPets",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "post_pets",
          title: "Post pets.",
          description: "Post pets.",
          inputSchema: {
            type: "object",
            properties: {
              body: {
                type: "object",
                properties: { id: { type: "string" } },
                required: [],
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
          method: "post",
          path: "/pets",
          originalPath: "/pets",
          operationId: "PostPets",
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
