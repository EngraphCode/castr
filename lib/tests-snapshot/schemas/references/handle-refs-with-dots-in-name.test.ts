import {
  generateZodClientFromOpenAPI,
  getEndpointDefinitionList,
} from '../../../src/test-helpers/legacy-compat.js';
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
        "endpoints": [
            {
                "alias": "getWithUnusualRefFormat",
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/ref-with-dot-in-name",
                "requestFormat": "json",
                "response": "Basic.Thing",
                "responses": [
                    {
                        "schema": {
                            "$ref": "#/components/schemas/Basic.Thing",
                            "metadata": {
                                "circularReferences": [],
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                        },
                        "statusCode": "200",
                    },
                ],
            },
            {
                "alias": "getWithUsualRefFormat",
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/usual-ref-format",
                "requestFormat": "json",
                "response": "Basic",
                "responses": [
                    {
                        "schema": {
                            "$ref": "#/components/schemas/Basic",
                            "metadata": {
                                "circularReferences": [],
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                        },
                        "statusCode": "200",
                    },
                ],
            },
        ],
    }
  `);

  const output = await generateZodClientFromOpenAPI({ openApiDoc: doc, disableWriteToFile: true });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type Basic = string;
    // Zod Schemas
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
        response: Basic,
        errors: [],
        responses: {
          200: {
            schema: Basic,
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
          inputSchema: { type: "object" },
          outputSchema: {
            type: "object",
            properties: {
              thing: {
                type: "object",
                properties: { aaa: { type: "string" }, bbb: { type: "string" } },
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
          inputSchema: { type: "object" },
          outputSchema: {
            type: "object",
            properties: { value: { type: "string" } },
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
