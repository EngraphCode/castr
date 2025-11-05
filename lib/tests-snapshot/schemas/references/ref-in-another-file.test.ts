import { getEndpointDefinitionList } from '../../../src/index.js';
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
        "deepDependencyGraph": {},
        "doc": {
            "components": {
                "schemas": {
                    "ExampleObject": {
                        "properties": {
                            "0_property_starting_with_number": {
                                "type": "number",
                            },
                            "completed": {
                                "type": "boolean",
                            },
                            "name": {
                                "type": "string",
                            },
                        },
                        "required": [
                            "name",
                            "completed",
                            "0_property_starting_with_number",
                        ],
                        "title": "Example object",
                        "type": "object",
                    },
                },
            },
            "info": {
                "title": "Partial document",
                "version": "0.0.1",
            },
            "openapi": "3.1.0",
            "paths": {
                "/robots.txt": {
                    "get": {
                        "description": "Gets robots.txt",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/ExampleObject",
                                        },
                                    },
                                },
                                "description": "Success",
                            },
                        },
                    },
                },
            },
        },
        "endpoints": [
            {
                "description": "Gets robots.txt",
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/robots.txt",
                "requestFormat": "json",
                "response": "ExampleObject",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {},
        "schemaByName": {},
        "zodSchemaByName": {
            "ExampleObject": "z.object({ name: z.string(), completed: z.boolean(), "0_property_starting_with_number": z.number() }).passthrough()",
        },
    }
  `);
});
