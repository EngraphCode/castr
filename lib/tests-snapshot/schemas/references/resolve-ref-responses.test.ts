import { getEndpointDefinitionList } from '../../../src/test-helpers/legacy-compat.js';
import { expect, test } from 'vitest';

test('resolve-ref-responses', () => {
  // Without the refiner function passed.
  expect(
    getEndpointDefinitionList({
      openapi: '3.0.3',
      info: { version: '1', title: 'Example API' },
      paths: {
        '/': {
          get: {
            operationId: 'getExample',
            responses: {
              '200': {
                $ref: '#/components/responses/ExampleResponse',
              },
            },
          },
        },
      },
      components: {
        responses: {
          ExampleResponse: {
            description: 'example response',
            content: { 'application/json': { schema: { type: 'string' } } },
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "endpoints": [
            {
                "alias": "getExample",
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/",
                "requestFormat": "json",
                "response": "z.object({
    }).passthrough()",
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
                                    "presence": "",
                                    "validations": [],
                                },
                            },
                            "type": "object",
                        },
                        "statusCode": "200",
                    },
                ],
            },
        ],
    }
  `);
});
