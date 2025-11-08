import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';

test('export-schemas-option', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/export-schemas-option': {
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
        UnusedSchemas: {
          type: 'object',
          properties: {
            nested_prop: { type: 'boolean' },
            another: { type: 'string' },
          },
        },
      },
    },
  };

  expect(getZodClientTemplateContext(openApiDoc, { shouldExportAllSchemas: false }).schemas)
    .toMatchInlineSnapshot(`
      {
          "Basic": "z.string()",
      }
    `);

  const ctx = getZodClientTemplateContext(openApiDoc, { shouldExportAllSchemas: true });
  expect(ctx.endpoints).toMatchInlineSnapshot(`
    [
        {
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/export-schemas-option",
            "requestFormat": "json",
            "response": "z.string()",
        },
    ]
  `);

  expect(ctx.schemas).toMatchInlineSnapshot(`
    {
        "Basic": "z.string()",
        "UnusedSchemas": "z.object({ nested_prop: z.boolean(), another: z.string() }).partial().passthrough()",
    }
  `);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { shouldExportAllSchemas: true },
  });
  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const Basic = z.string();
    export const UnusedSchemas = z
      .object({ nested_prop: z.boolean(), another: z.string() })
      .partial()
      .strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/export-schemas-option",
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
          description: "GET /export-schemas-option",
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
          path: "/export-schemas-option",
          originalPath: "/export-schemas-option",
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
