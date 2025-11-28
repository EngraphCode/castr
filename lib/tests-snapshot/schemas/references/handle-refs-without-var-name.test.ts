import { getZodClientTemplateContext } from '../../../src/index.js';
import { expect, test } from 'vitest';

test('handle-refs-without-var-name', () => {
  expect(
    getZodClientTemplateContext({
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
                    schema: { type: 'array', items: { $ref: '#/components/schemas/Basic' } },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Basic: { type: 'object' },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "_ir": {
            "components": [
                {
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
                            "presence": "optional",
                            "validations": [],
                        },
                    },
                    "name": "Basic",
                    "schema": {
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
                                "presence": "optional",
                                "validations": [],
                            },
                        },
                        "type": "object",
                    },
                    "type": "schema",
                },
            ],
            "dependencyGraph": {
                "circularReferences": [],
                "nodes": Map {},
                "topologicalOrder": [],
            },
            "enums": Map {},
            "info": {
                "title": "Example API",
                "version": "1",
            },
            "openApiVersion": "3.0.3",
            "operations": [
                {
                    "method": "get",
                    "operationId": "getSomething",
                    "parameters": [],
                    "parametersByLocation": {
                        "cookie": [],
                        "header": [],
                        "path": [],
                        "query": [],
                    },
                    "path": "/something",
                    "responses": [
                        {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "items": {
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
                                                    "presence": "optional",
                                                    "validations": [],
                                                },
                                            },
                                        },
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
                                                "presence": "optional",
                                                "validations": [],
                                            },
                                        },
                                        "type": "array",
                                    },
                                },
                            },
                            "statusCode": "200",
                        },
                    ],
                },
            ],
            "version": "1.0.0",
        },
        "circularTypeByName": {},
        "emittedType": {},
        "endpoints": [
            {
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/something",
                "requestFormat": "json",
                "response": "z.array(Basic)",
            },
        ],
        "endpointsGroups": {},
        "mcpTools": [
            {
                "httpOperation": {
                    "method": "get",
                    "operationId": "getSomething",
                    "originalPath": "/something",
                    "path": "/something",
                },
                "method": "get",
                "operationId": "getSomething",
                "originalPath": "/something",
                "path": "/something",
                "security": {
                    "isPublic": true,
                    "requirementSets": [],
                    "usesGlobalSecurity": false,
                },
                "tool": {
                    "annotations": {
                        "destructiveHint": false,
                        "idempotentHint": false,
                        "readOnlyHint": true,
                    },
                    "description": "GET /something",
                    "inputSchema": {
                        "type": "object",
                    },
                    "name": "get_something",
                    "outputSchema": {
                        "properties": {
                            "value": {
                                "items": {
                                    "type": "object",
                                },
                                "type": "array",
                            },
                        },
                        "type": "object",
                    },
                },
            },
        ],
        "options": {
            "baseUrl": "",
            "withAlias": false,
        },
        "schemas": {
            "Basic": "z.object({}).partial().passthrough()",
        },
        "types": {},
    }
  `);
});
