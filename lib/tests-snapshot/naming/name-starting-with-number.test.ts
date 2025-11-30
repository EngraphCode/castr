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
    // Zod Schemas
    export const Basic = z.string();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/operationId-starting-with-number",
        requestFormat: "json",
        parameters: [],
        response: z.string(),
        errors: [],
        responses: {
          200: {
            schema: z.string(),
          },
        },
        request: {},
        alias: "123_example",
      },
    ] as const;
    // MCP Tools
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
          method: "get",
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
