import { getEndpointDefinitionList } from '../../src/test-helpers/legacy-compat.js';
import { expect, test } from 'vitest';
import { type OpenAPIObject } from 'openapi3-ts/oas31';

test('is-media-type-allowed', () => {
  const doc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/unusual-ref-format': {
        get: {
          operationId: 'getWithUnusualRefFormat',
          responses: {
            '200': {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Basic' } },
                'application/json-ld': { schema: { $ref: '#/components/schemas/CustomMediaType' } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Basic: { type: 'string' },
        CustomMediaType: { type: 'number' },
      },
    },
  };
  const defaultResult = getEndpointDefinitionList(doc);
  expect(defaultResult.endpoints).toMatchInlineSnapshot(`
    [
        {
            "alias": "getWithUnusualRefFormat",
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/unusual-ref-format",
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

  const withCustomOption = getEndpointDefinitionList(doc, {
    isMediaTypeAllowed: (mediaType) => mediaType === 'application/json-ld',
  });
  expect(withCustomOption.endpoints).toMatchInlineSnapshot(`
    [
        {
            "alias": "getWithUnusualRefFormat",
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/unusual-ref-format",
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
