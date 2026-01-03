import { expect, test } from 'vitest';
import { getEndpointDefinitionList } from '../../src/test-helpers/legacy-compat.js';

test("missing operationId outputs variables['undefined_Body']", () => {
  const result = getEndpointDefinitionList({
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/media-objects/{id}': {
        put: {
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Basic' } } },
          },
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Basic' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Payload: { type: 'object', properties: { thing: { type: 'number' } } },
        Basic: { type: 'string' },
      },
    },
  });
  expect(result.endpoints).toMatchInlineSnapshot(`
    [
        {
            "alias": "putmediaobjectsid",
            "errors": [],
            "method": "put",
            "parameters": [
                {
                    "name": "body",
                    "schema": "Basic",
                    "type": "Body",
                },
            ],
            "path": "/media-objects/{id}",
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
    ]
  `);
});
