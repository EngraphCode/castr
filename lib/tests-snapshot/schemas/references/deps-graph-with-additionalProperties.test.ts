import { type ReferenceObject, type SchemaObject, type SchemasObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { getOpenApiDependencyGraph } from '../../../src/test-helpers/legacy-compat.js';

const makeOpenApiDoc = (
  schemas: SchemasObject,
  responseSchema: SchemaObject | ReferenceObject,
) => ({
  openapi: '3.0.3',
  info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
  paths: {
    '/example': {
      get: {
        operationId: 'getExample',
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: responseSchema } } },
        },
      },
    },
  },
  components: { schemas },
});

test('deps-graph-with-additionalProperties', () => {
  const schemas = {
    ResponseItem: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
    Something: {
      type: 'object',
      properties: {
        str: { type: 'string' },
      },
    },
    ResponsesMap: {
      type: 'object',
      properties: {
        smth: { $ref: 'Something' },
      },
      additionalProperties: {
        $ref: 'ResponseItem',
      },
    },
  } as SchemasObject;
  const openApiDoc = makeOpenApiDoc(schemas, { $ref: 'ResponsesMap' });
  expect(
    getOpenApiDependencyGraph(
      Object.keys(openApiDoc.components.schemas).map((name) => `#/components/schemas/${name}`),
      openApiDoc,
    ),
  ).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {
            "#/components/schemas/ResponseItem": Set {},
            "#/components/schemas/ResponsesMap": Set {
                "#/components/schemas/Something",
                "#/components/schemas/ResponseItem",
            },
            "#/components/schemas/Something": Set {},
        },
        "refsDependencyGraph": {
            "#/components/schemas/ResponseItem": Set {},
            "#/components/schemas/ResponsesMap": Set {
                "#/components/schemas/Something",
                "#/components/schemas/ResponseItem",
            },
            "#/components/schemas/Something": Set {},
        },
    }
  `);
});
