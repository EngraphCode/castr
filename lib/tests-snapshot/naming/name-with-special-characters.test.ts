import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import {
  generateZodClientFromOpenAPI,
  getZodClientTemplateContext,
} from '../../src/test-helpers/legacy-compat.js';

test('name-with-special-characters', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/name-with-special-characters': {
        get: {
          operationId: 'nameWithSPecialCharacters',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/1Name-With-Special---Characters' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        '1Name-With-Special---Characters': { type: 'string' },
      },
    },
  };
  const ctx = getZodClientTemplateContext(openApiDoc);
  expect(ctx.endpoints).toMatchInlineSnapshot(`
    [
        {
            "alias": "nameWithSPecialCharacters",
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/name-with-special-characters",
            "requestFormat": "json",
            "response": {
                "$ref": "#/components/schemas/1Name-With-Special---Characters",
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
            "responses": [
                {
                    "schema": {
                        "$ref": "#/components/schemas/1Name-With-Special---Characters",
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
    ]
  `);

  const result = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(result);
  expect(result.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    // Zod Schemas
    // Endpoints
    export const endpoints = [
            {
                method: "get",
                path: "/name-with-special-characters",
                requestFormat: "json",
                parameters: [
                ],
                response: 1Name-With-Special---Characters,
                errors: [
                ],
                responses: {
                    200: {
                        schema: 1Name-With-Special---Characters
                    }
                },
                request: {},
    // MCP Tools
                alias: "nameWithSPecialCharacters"
            }
        ] as const;
    export const mcpTools = [
            {
                tool: {name: "name_with_s_pecial_characters", description: "GET /name-with-special-characters", inputSchema: {type: "object"}, outputSchema: {type: "object", properties: {value: {type: "string"}}}, annotations: {readOnlyHint: true, destructiveHint: false, idempotentHint: false}},
                httpOperation: {
                    method: "get",
                    path: "/name-with-special-characters",
                    originalPath: "/name-with-special-characters",
                    operationId: "nameWithSPecialCharacters"
                },
                security: {isPublic: true, usesGlobalSecurity: false, requirementSets: []}
            }
        ] as const;
    "
  `);
});
