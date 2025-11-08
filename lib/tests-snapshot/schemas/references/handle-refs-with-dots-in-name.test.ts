import { generateZodClientFromOpenAPI, getEndpointDefinitionList } from '../../../src/index.js';
import { expect, test } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

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
        "schemaByName": {},
        "zodSchemaByName": {
            "Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj": "z.object({ aaa: z.string(), bbb: z.string() }).partial().passthrough()",
            "Basic": "z.string()",
            "Basic.Thing": "z.object({ thing: Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj }).partial().passthrough()",
        },
    }
  `);

  const output = await generateZodClientFromOpenAPI({ openApiDoc: doc, disableWriteToFile: true });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj = z
      .object({ aaa: z.string(), bbb: z.string() })
      .partial()
      .strict();
    export const Basic_Thing = z
      .object({ thing: Aaa - bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj })
      .partial()
      .strict();
    export const Basic = z.string();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/ref-with-dot-in-name",
        operationId: "getWithUnusualRefFormat",
        request: {},
        responses: { 200: { schema: Basic.Thing } },
      },
      {
        method: "get" as const,
        path: "/usual-ref-format",
        operationId: "getWithUsualRefFormat",
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
          name: "get_with_unusual_ref_format",
          description: "GET /ref-with-dot-in-name",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              thing: {
                $ref: "#/definitions/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
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
          method: "get" as const,
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
