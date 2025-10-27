import { generateZodClientFromOpenAPI, getZodiosEndpointDefinitionList } from '../src/index.js';
import { expect, test } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';

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

  expect(getZodiosEndpointDefinitionList(doc)).toMatchInlineSnapshot(`
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
                "description": undefined,
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/usual-ref-format",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "description": undefined,
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
    "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
    import { z } from "zod";

    export const Basic = z.string();
    export const Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj = z
      .object({ aaa: z.string(), bbb: z.string() })
      .partial()
      .passthrough();
    export const Basic_Thing = z
      .object({ thing: Aaa - bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj })
      .partial()
      .passthrough();

    const endpoints = makeApi([
      {
        method: "get",
        path: "/ref-with-dot-in-name",
        requestFormat: "json",
        response: Basic.Thing,
      },
      {
        method: "get",
        path: "/usual-ref-format",
        requestFormat: "json",
        response: z.string(),
      },
    ]);

    export const api = new Zodios(endpoints);

    export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
      return new Zodios(baseUrl, endpoints, options);
    }
    "
  `);
});
