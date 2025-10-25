import { getZodClientTemplateContext } from "../src/index.js";
import { expect, test } from "vitest";
import { type OpenAPIObject } from "openapi3-ts/oas30";

test("defaut-status-behavior", () => {
    const doc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/with-default-response": {
                get: {
                    operationId: "withDefaultResponse",
                    responses: {
                        default: { description: "Default response", content: { "application/json": { schema: { type: "string" } } } },
                    },
                },
            },
            "/with-default-error": {
                get: {
                    operationId: "withDefaultError",
                    responses: {
                        "200": { description: "Success", content: { "application/json": { schema: { type: "number" } } } },
                        default: { description: "Default error", content: { "application/json": { schema: { type: "string" } } } },
                    },
                },
            },
        },
    };

    const defaultResult = getZodClientTemplateContext(doc);
    expect(defaultResult.endpoints).toMatchInlineSnapshot(`
      [
          {
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/with-default-error",
              "requestFormat": "json",
              "response": "z.number()",
          },
          {
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/with-default-response",
              "requestFormat": "json",
              "response": "z.void()",
          },
      ]
    `);

    const withAutoCorrectResult = getZodClientTemplateContext(doc, { defaultStatusBehavior: "auto-correct" });
    expect(withAutoCorrectResult.endpoints).toMatchInlineSnapshot(`
      [
          {
              "description": undefined,
              "errors": [
                  {
                      "description": "Default error",
                      "schema": "z.string()",
                      "status": "default",
                  },
              ],
              "method": "get",
              "parameters": [],
              "path": "/with-default-error",
              "requestFormat": "json",
              "response": "z.number()",
          },
          {
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/with-default-response",
              "requestFormat": "json",
              "response": "z.string()",
          },
      ]
    `);
});
