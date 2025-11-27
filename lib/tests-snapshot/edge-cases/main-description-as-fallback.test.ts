import { type SchemasObject } from 'openapi3-ts/oas31';
import { expect, it } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

it('use main-description-as-fallback', async () => {
  const schemas = {
    Main: {
      type: 'object',
      properties: {
        str: { type: 'string' },
        nb: { type: 'number' },
      },
      required: ['str', 'nb'],
    },
  } as SchemasObject;

  const openApiDoc = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/example': {
        get: {
          operationId: 'getExample',
          responses: {
            '200': {
              description: 'get example',
              content: { 'application/json': { schema: schemas['Main'] } },
            },
          },
        },
      },
    },
    components: { schemas },
  };

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { useMainResponseDescriptionAsEndpointDefinitionFallback: true },
  });

  assertSingleFileResult(result);

  expect(result.content).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const Main = z.object({ str: z.string(), nb: z.number() }).strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/example",
        operationId: "getExample",
        description: \`get example\`,
        request: {},
        responses: {
          200: {
            description: "get example",
            schema: z.object({ str: z.string(), nb: z.number() }).strict(),
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
          name: "get_example",
          description: "GET /example",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              str: {
                type: "string",
              },
              nb: {
                type: "number",
              },
            },
            required: ["str", "nb"],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get" as const,
          path: "/example",
          originalPath: "/example",
          operationId: "getExample",
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
