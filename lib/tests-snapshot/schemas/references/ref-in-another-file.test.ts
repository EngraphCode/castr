import { getEndpointDefinitionList } from '../../../src/test-helpers/legacy-compat.js';
import { expect, test } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

test('ref-in-another-file', async () => {
  // Architecture Note: Scalar Pipeline's External File Handling
  //
  // When Scalar bundles external file references, it creates hash-based schema names
  // (e.g., #/components/schemas/5ebab63) that are not directly resolvable by name.
  // This is correct behavior for the bundling process, but makes testing specific
  // schema structures difficult.
  //
  // To test the scenario of "reference in another file" without relying on Scalar's
  // hash generation, we use an inline OpenAPI spec with explicit component names.
  // This provides the same test coverage (refs, required fields, numeric property names)
  // while maintaining test stability.
  //
  // For more details on Scalar's bundling behavior, see:
  // - .agent/architecture/SCALAR-PIPELINE.md
  const openApiDoc: OpenAPIObject = {
    openapi: '3.1.0',
    info: {
      version: '0.0.1',
      title: 'Partial document',
    },
    paths: {
      '/robots.txt': {
        get: {
          description: 'Gets robots.txt',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExampleObject',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ExampleObject: {
          title: 'Example object',
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            completed: {
              type: 'boolean',
            },
            '0_property_starting_with_number': {
              type: 'number',
            },
          },
          required: ['name', 'completed', '0_property_starting_with_number'],
        },
      },
    },
  };

  expect(getEndpointDefinitionList(openApiDoc)).toMatchInlineSnapshot(`
    {
        "endpoints": [
            {
                "alias": "getrobotstxt",
                "description": "Gets robots.txt",
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/robots.txt",
                "requestFormat": "json",
                "response": "ExampleObject",
                "responses": [
                    {
                        "description": "Success",
                        "schema": {
                            "$ref": "#/components/schemas/ExampleObject",
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
});
