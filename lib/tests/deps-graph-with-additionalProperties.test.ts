import { type ReferenceObject, type SchemaObject, type SchemasObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { getOpenApiDependencyGraph } from "../src/index.js";

const makeOpenApiDoc = (schemas: SchemasObject, responseSchema: SchemaObject | ReferenceObject) => ({
    openapi: "3.0.3",
    info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
    paths: {
        "/example": {
            get: {
                operationId: "getExample",
                responses: {
                    "200": { description: "OK", content: { "application/json": { schema: responseSchema } } },
                },
            },
        },
    },
    components: { schemas },
});

test("deps-graph-with-additionalProperties", async () => {
    const schemas = {
        ResponseItem: {
            type: "object",
            properties: {
                id: { type: "string" },
            },
        },
        Something: {
            type: "object",
            properties: {
                str: { type: "string" },
            },
        },
        ResponsesMap: {
            type: "object",
            properties: {
                smth: { $ref: "Something" },
            },
            additionalProperties: {
                $ref: "ResponseItem",
            },
        },
    } as SchemasObject;
    const openApiDoc = makeOpenApiDoc(schemas, { $ref: "ResponsesMap" });
    const getSchemaByRef = (ref: string): SchemaObject | ReferenceObject => {
        const schema = schemas[ref];
        if (!schema) throw new Error(`Schema not found: ${ref}`);
        return schema;
    };
    expect(getOpenApiDependencyGraph(Object.keys(openApiDoc.components.schemas), getSchemaByRef))
        .toMatchInlineSnapshot(`
          {
              "deepDependencyGraph": {
                  "ResponsesMap": Set {
                      "Something",
                      "ResponseItem",
                  },
              },
              "refsDependencyGraph": {
                  "ResponsesMap": Set {
                      "Something",
                      "ResponseItem",
                  },
              },
          }
        `);
});
