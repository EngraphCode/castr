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
    // Type Definitions
    export type Main = {
      str: string;
      nb: number;
    };
    // Zod Schemas
    export const Main = z
      .object({
        str: z.string(),
        nb: z.number(),
      })
      .strict();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/example",
        requestFormat: "json",
        parameters: [],
        response: z
          .object({
            str: z.string(),
            nb: z.number(),
          })
          .strict(),
        errors: [],
        responses: {
          200: {
            schema: z
              .object({
                str: z.string(),
                nb: z.number(),
              })
              .strict(),
            description: "get example",
          },
        },
        request: {},
        alias: "getExample",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_example",
          description: "GET /example",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: { str: { type: "string" }, nb: { type: "number" } },
            required: ["str", "nb"],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get",
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
