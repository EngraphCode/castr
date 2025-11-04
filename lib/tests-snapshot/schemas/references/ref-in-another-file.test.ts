import { prepareOpenApiDocument } from '../../../src/shared/prepare-openapi-document.js';
import { resolve } from 'node:path';
import { getEndpointDefinitionList } from '../../../src/index.js';
import { expect, test } from 'vitest';

test.skip('ref-in-another-file - Scalar bundling creates hash refs not in components', async () => {
  const openApiDoc = await prepareOpenApiDocument(
    resolve(__dirname, 'ref-in-another-file', 'partial.yaml'),
  );
  expect(getEndpointDefinitionList(openApiDoc)).toMatchInlineSnapshot(`
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
