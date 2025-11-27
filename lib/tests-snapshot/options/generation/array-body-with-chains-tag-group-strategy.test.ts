import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertGroupedFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

test('array-body-with-chains-tag-group-strategy', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.1' },
    paths: {
      '/test': {
        put: {
          summary: 'Test',
          description: 'Test',
          tags: ['Test'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      testItem: {
                        type: 'string',
                      },
                    },
                    additionalProperties: false,
                  },
                  minItems: 1,
                  maxItems: 10,
                },
              },
            },
          },
          parameters: [],
          responses: {
            '200': {
              description: 'Success',
              content: { 'application/json': {} },
            },
          },
        },
      },
    },
    components: {},
    tags: [],
  };

  const output = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { groupStrategy: 'tag-file' },
  });
  assertGroupedFileResult(output);
  expect(output.files).toMatchInlineSnapshot(`
    {
        "Test": "import { z } from "zod";

    export const putTest_Body = z.array(
      z.object({ testItem: z.string() }).partial().strict(),
    );

    export const endpoints = [
      {
        method: "put" as const,
        path: "/test",
        operationId: "putTest",
        description: \`Test\`,
        request: { body: putTest_Body.min(1).max(10) },
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
          name: "put_test",
          title: "Test",
          description: "Test",
          inputSchema: {
            type: "object",
            properties: {
              body: {
                type: "object",
                properties: {
                  value: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        testItem: {
                          type: "string",
                        },
                      },
                      additionalProperties: false,
                    },
                    minItems: 1,
                    maxItems: 10,
                  },
                },
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
    ",
        "__index": "export { TestApi } from "./Test";
    ",
    }
  `);
});
