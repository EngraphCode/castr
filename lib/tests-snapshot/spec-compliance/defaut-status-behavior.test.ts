import { getZodClientTemplateContext } from '../../src/test-helpers/legacy-compat.js';
import { expect, test } from 'vitest';
import { type OpenAPIObject } from 'openapi3-ts/oas31';

test('defaut-status-behavior', () => {
  const doc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/with-default-response': {
        get: {
          operationId: 'withDefaultResponse',
          responses: {
            default: {
              description: 'Default response',
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/with-default-error': {
        get: {
          operationId: 'withDefaultError',
          responses: {
            '200': {
              description: 'Success',
              content: { 'application/json': { schema: { type: 'number' } } },
            },
            default: {
              description: 'Default error',
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
        },
      },
    },
  };

  const defaultResult = getZodClientTemplateContext(doc);
  expect(defaultResult.endpoints).toMatchInlineSnapshot(`
    [
        {
            "alias": "withDefaultError",
            "errors": [
                {
                    "description": "Default error",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "status": "default",
                },
            ],
            "method": "get",
            "parameters": [],
            "path": "/with-default-error",
            "requestFormat": "json",
            "response": {
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
                "type": "number",
            },
            "responses": [
                {
                    "description": "Success",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "number",
                    },
                    "statusCode": "200",
                },
                {
                    "description": "Default error",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "statusCode": "default",
                },
            ],
        },
        {
            "alias": "withDefaultResponse",
            "errors": [
                {
                    "description": "Default response",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "status": "default",
                },
            ],
            "method": "get",
            "parameters": [],
            "path": "/with-default-response",
            "requestFormat": "json",
            "response": {
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
                        "presence": "",
                        "validations": [],
                    },
                },
                "type": "object",
            },
            "responses": [
                {
                    "description": "Default response",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "statusCode": "default",
                },
            ],
        },
    ]
  `);

  const withAutoCorrectResult = getZodClientTemplateContext(doc, {
    defaultStatusBehavior: 'auto-correct',
  });
  expect(withAutoCorrectResult.endpoints).toMatchInlineSnapshot(`
    [
        {
            "alias": "withDefaultError",
            "errors": [
                {
                    "description": "Default error",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "status": "default",
                },
            ],
            "method": "get",
            "parameters": [],
            "path": "/with-default-error",
            "requestFormat": "json",
            "response": {
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
                "type": "number",
            },
            "responses": [
                {
                    "description": "Success",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "number",
                    },
                    "statusCode": "200",
                },
                {
                    "description": "Default error",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "statusCode": "default",
                },
            ],
        },
        {
            "alias": "withDefaultResponse",
            "errors": [
                {
                    "description": "Default response",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "status": "default",
                },
            ],
            "method": "get",
            "parameters": [],
            "path": "/with-default-response",
            "requestFormat": "json",
            "response": {
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
                        "presence": "",
                        "validations": [],
                    },
                },
                "type": "object",
            },
            "responses": [
                {
                    "description": "Default response",
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
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "statusCode": "default",
                },
            ],
        },
    ]
  `);
});
