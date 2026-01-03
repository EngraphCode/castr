import { getEndpointDefinitionList } from '../../../src/test-helpers/legacy-compat.js';
import { expect, test } from 'vitest';
import { type OpenAPIObject } from 'openapi3-ts/oas31';

test('with-deprecated', () => {
  const doc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/deprecated-endpoint': {
        get: {
          operationId: 'deprecatedEndpoint',
          responses: { '200': { content: { 'application/json': { schema: { type: 'string' } } } } },
          deprecated: true,
        },
      },
      '/new-endpoint': {
        get: {
          operationId: 'newEndpoint',
          responses: { '200': { content: { 'application/json': { schema: { type: 'number' } } } } },
        },
      },
    },
  };

  const defaultResult = getEndpointDefinitionList(doc);
  expect(defaultResult.endpoints).toMatchInlineSnapshot(`
    [
        {
            "alias": "deprecatedEndpoint",
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/deprecated-endpoint",
            "requestFormat": "json",
            "response": "z.string()",
            "responses": [
                {
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
                    "statusCode": "200",
                },
            ],
        },
        {
            "alias": "newEndpoint",
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/new-endpoint",
            "requestFormat": "json",
            "response": "z.number()",
            "responses": [
                {
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
            ],
        },
    ]
  `);

  const withCustomOption = getEndpointDefinitionList(doc, {
    withDeprecatedEndpoints: true,
  });
  expect(withCustomOption.endpoints).toMatchInlineSnapshot(`
    [
        {
            "alias": "deprecatedEndpoint",
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/deprecated-endpoint",
            "requestFormat": "json",
            "response": "z.string()",
            "responses": [
                {
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
                    "statusCode": "200",
                },
            ],
        },
        {
            "alias": "newEndpoint",
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/new-endpoint",
            "requestFormat": "json",
            "response": "z.number()",
            "responses": [
                {
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
            ],
        },
    ]
  `);
});
