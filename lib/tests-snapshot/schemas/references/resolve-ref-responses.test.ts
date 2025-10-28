import { getZodiosEndpointDefinitionList } from '../../../src/index.js';
import { expect, test } from 'vitest';

test('resolve-ref-responses', () => {
  // Without the refiner function passed.
  expect(
    getZodiosEndpointDefinitionList({
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
        "deepDependencyGraph": {},
        "doc": {
            "components": {
                "responses": {
                    "ExampleResponse": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "string",
                                },
                            },
                        },
                        "description": "example response",
                    },
                },
            },
            "info": {
                "title": "Example API",
                "version": "1",
            },
            "openapi": "3.0.3",
            "paths": {
                "/": {
                    "get": {
                        "operationId": "getExample",
                        "responses": {
                            "200": {
                                "$ref": "#/components/responses/ExampleResponse",
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
                "path": "/",
                "requestFormat": "json",
                "response": "z.string()",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {},
        "schemaByName": {},
        "zodSchemaByName": {},
    }
  `);
});
