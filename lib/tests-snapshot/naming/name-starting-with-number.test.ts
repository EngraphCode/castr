import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../src/index.js';

test('operationId-starting-with-number', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/operationId-starting-with-number': {
        get: {
          operationId: '123_example',
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Basic' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Basic: { type: 'string' },
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
            "path": "/operationId-starting-with-number",
            "requestFormat": "json",
            "response": "z.string()",
        },
    ]
  `);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { withAlias: true },
  });
  assertSingleFileResult(result);
  expect(result.content).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const Basic = z.string();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/operationId-starting-with-number",
        operationId: "123_example",
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
          name: "123_example",
          description: "GET /operationId-starting-with-number",
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
          path: "/operationId-starting-with-number",
          originalPath: "/operationId-starting-with-number",
          operationId: "123_example",
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
