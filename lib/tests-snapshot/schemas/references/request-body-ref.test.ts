import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/122
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
          responses: {},
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

    export const PostPetsRequest = z.object({ id: z.string() }).partial().strict();

    export const endpoints = [
      {
        method: "post" as const,
        path: "/pets",
        operationId: "PostPets",
        request: { body: z.object({ id: z.string() }).partial().strict() },
        responses: {
          200: {
            description: "Success",
            schema: z.void(),
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
          name: "post_pets",
          title: "Post pets.",
          description: "Post pets.",
          inputSchema: {
            type: "object",
            properties: {
              body: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                },
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
