import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../src/index.js';

test('name-with-special-characters', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/name-with-special-characters': {
        get: {
          operationId: 'nameWithSPecialCharacters',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/1Name-With-Special---Characters' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        '1Name-With-Special---Characters': { type: 'string' },
      },
    },
  };
  const ctx = getZodClientTemplateContext(openApiDoc);
  expect(ctx.endpoints).toMatchInlineSnapshot(`
    [
        {
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/name-with-special-characters",
            "requestFormat": "json",
            "response": "z.string()",
        },
    ]
  `);

  const result = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(result);
  expect(result.content).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const _1Name_With_Special_Characters = z.string();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/name-with-special-characters",
        operationId: "nameWithSPecialCharacters",
        request: {},
        responses: { 200: { schema: z.string() } },
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
          name: "name_with_s_pecial_characters",
          description: "GET /name-with-special-characters",
          inputSchema: {
            type: "object",
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
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get" as const,
          path: "/name-with-special-characters",
          originalPath: "/name-with-special-characters",
          operationId: "nameWithSPecialCharacters",
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
