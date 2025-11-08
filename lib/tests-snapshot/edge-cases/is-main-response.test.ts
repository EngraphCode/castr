import { type SchemasObject } from 'openapi3-ts/oas31';
import { expect, it } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

it('determines which one is-main-response', async () => {
  const schemas = {
    Main: {
      type: 'object',
      properties: {
        str: { type: 'string' },
        nb: { type: 'number' },
      },
      required: ['str', 'nb'],
    },
    AnotherSuccess: { type: 'number' },
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
              description: 'OK',
              content: { 'application/json': { schema: schemas['Main'] } },
            },
            '201': {
              description: 'Created',
              content: { 'application/json': { schema: schemas['AnotherSuccess'] } },
            },
          },
        },
      },
    },
    components: { schemas },
  };

  const result = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
    options: { isMainResponseStatus: 'status === 201' },
  });

  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const Main = z.object({ str: z.string(), nb: z.number() }).strict();
    export const AnotherSuccess = z.number();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/example",
        operationId: "getExample",
        request: {},
        responses: {
          200: {
            description: "OK",
            schema: z.object({ str: z.string(), nb: z.number() }).strict(),
          },
          201: { description: "Created", schema: z.number() },
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
