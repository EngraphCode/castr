import { getZodSchema } from '../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';

test('handle-props-with-special-characters', async () => {
  const schemaWithSpecialCharacters = {
    properties: {
      '@id': { type: 'string' },
      id: { type: 'number' },
    },
  } as SchemaObject;

  expect(getZodSchema({ schema: schemaWithSpecialCharacters })).toMatchInlineSnapshot(
    '"z.object({ "@id": z.string(), id: z.number() }).partial().passthrough()"',
  );

  const output = await generateZodClientFromOpenAPI({
    openApiDoc: {
      openapi: '3.0.3',
      info: { version: '1', title: 'Example API' },
      paths: {
        '/something': {
          get: {
            operationId: 'getSomething',
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: schemaWithSpecialCharacters,
                  },
                },
              },
            },
          },
        },
      },
    } as OpenAPIObject,
    disableWriteToFile: true,
  });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const endpoints = [
      {
        method: "get" as const,
        path: "/something",
        operationId: "getSomething",
        request: {},
        responses: {
          200: {
            schema: z
              .object({ "@id": z.string(), id: z.number() })
              .partial()
              .strict(),
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
          name: "get_something",
          description: "GET /something",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              value: {
                type: "object",
                properties: {
                  "@id": {
                    type: "string",
                  },
                  id: {
                    type: "number",
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
          path: "/something",
          originalPath: "/something",
          operationId: "getSomething",
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
