import { type SchemasObject } from 'openapi3-ts/oas31';
import { expect, it } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
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

  assertSingleFileResult(result);

  expect(result.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Zod Schemas
    export const Main = z.object({ str: z.string(), nb: z.number() }).strict();
    export const AnotherSuccess = z.number();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/example",
        requestFormat: "json",
        parameters: [],
        response: z.object({ str: z.string(), nb: z.number() }).strict(),
        errors: [],
        responses: {
          200: {
            schema: z.object({ str: z.string(), nb: z.number() }).strict(),
            description: "OK",
          },
          201: {
            schema: z.number(),
            description: "Created",
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
