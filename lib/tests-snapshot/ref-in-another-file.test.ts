import SwaggerParser from '@apidevtools/swagger-parser';
import { type OpenAPIObject } from 'openapi3-ts/oas30';
import { resolve } from 'node:path';
import { getZodiosEndpointDefinitionList } from '../src/index.js';
import { expect, test } from 'vitest';

test('ref-in-another-file', async () => {
  const openApiDoc = (await SwaggerParser.bundle(
    resolve(__dirname, 'ref-in-another-file', 'partial.yaml'),
  )) as OpenAPIObject;
  expect(getZodiosEndpointDefinitionList(openApiDoc)).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {},
        "doc": {
            "info": {
                "title": "Partial document",
                "version": "0.0.1",
            },
            "openapi": "3.0.0",
            "paths": {
                "/robots.txt": {
                    "get": {
                        "description": "Gets robots.txt",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
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
                "response": "z.object({ name: z.string(), completed: z.boolean(), "0_property_starting_with_number": z.number() }).passthrough()",
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
