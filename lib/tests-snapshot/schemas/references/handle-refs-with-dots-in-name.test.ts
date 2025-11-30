import { generateZodClientFromOpenAPI, getEndpointDefinitionList } from '../../../src/index.js';
import { expect, test } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

test('handle-refs-with-dots-in-name', async () => {
  const doc = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/usual-ref-format': {
        get: {
          operationId: 'getWithUsualRefFormat',
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Basic' } } },
            },
          },
        },
      },
      '/ref-with-dot-in-name': {
        get: {
          operationId: 'getWithUnusualRefFormat',
          responses: {
            '200': {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Basic.Thing' } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Basic: { type: 'string' },
        'Basic.Thing': {
          type: 'object',
          properties: {
            thing: { $ref: '#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj' },
          },
        },
        'Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj': {
          type: 'object',
          properties: {
            aaa: { type: 'string' },
            bbb: { type: 'string' },
          },
        },
      },
    },
  } as OpenAPIObject;

  expect(getEndpointDefinitionList(doc)).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {
            "#/components/schemas/Basic.Thing": Set {
                "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
            },
        },
        "doc": {
            "components": {
                "schemas": {
                    "Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj": {
                        "properties": {
                            "aaa": {
                                "type": "string",
                            },
                            "bbb": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                    },
                    "Basic": {
                        "type": "string",
                    },
                    "Basic.Thing": {
                        "properties": {
                            "thing": {
                                "$ref": "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
                            },
                        },
                        "type": "object",
                    },
                },
            },
            "info": {
                "title": "Example API",
                "version": "1",
            },
            "openapi": "3.0.3",
            "paths": {
                "/ref-with-dot-in-name": {
                    "get": {
                        "operationId": "getWithUnusualRefFormat",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Basic.Thing",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "/usual-ref-format": {
                    "get": {
                        "operationId": "getWithUsualRefFormat",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Basic",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "endpoints": [
            {
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/usual-ref-format",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/ref-with-dot-in-name",
                "requestFormat": "json",
                "response": "Basic.Thing",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {
            "#/components/schemas/Basic.Thing": Set {
                "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
            },
        },
        "zodSchemaByName": {
            "Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj": "z.object({ aaa: z.string(), bbb: z.string() }).partial().passthrough()",
            "Basic": "z.string()",
            "Basic.Thing": "z.object({ thing: Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj }).partial().passthrough()",
        },
    }
  `);

  const output = await generateZodClientFromOpenAPI({ openApiDoc: doc, disableWriteToFile: true });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Zod Schemas
    export const Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj = z
      .object({ aaa: z.string(), bbb: z.string() })
      .partial()
      .strict();
    export const Basic_Thing = z
      .object({ thing: Aaa - bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj })
      .partial()
      .strict();
    export const Basic = z.string();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/ref-with-dot-in-name",
        requestFormat: "json",
        parameters: [],
        response: Basic.Thing,
        errors: [],
        responses: {
          200: {
            schema: Basic.Thing,
          },
        },
        request: {},
        alias: "getWithUnusualRefFormat",
      },
      {
        method: "get",
        path: "/usual-ref-format",
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
        alias: "getWithUsualRefFormat",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_with_unusual_ref_format",
          description: "GET /ref-with-dot-in-name",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              thing: {
                type: "object",
                properties: {
                  aaa: {
                    type: "string",
                  },
                  bbb: {
                    type: "string",
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
          method: "get",
          path: "/ref-with-dot-in-name",
          originalPath: "/ref-with-dot-in-name",
          operationId: "getWithUnusualRefFormat",
        },
        security: {
          isPublic: true,
          usesGlobalSecurity: false,
          requirementSets: [],
        },
      },
      {
        tool: {
          name: "get_with_usual_ref_format",
          description: "GET /usual-ref-format",
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
          path: "/usual-ref-format",
          originalPath: "/usual-ref-format",
          operationId: "getWithUsualRefFormat",
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
