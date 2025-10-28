import { type OpenAPIObject } from 'openapi3-ts/oas30';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';

test('schema-name-already-used', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/schema-name-already-used': {
        get: {
          operationId: 'getSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
            },
          ],
        },
        put: {
          operationId: 'putSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
          ],
        },
        delete: {
          operationId: 'deleteSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['ddd', 'eee', 'fff'] },
            },
          ],
        },
        post: {
          operationId: 'postSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['ggg', 'hhh', 'iii'] },
            },
          ],
        },
      },
    },
  };
  const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2 });
  expect(ctx).toMatchInlineSnapshot(`
    {
        "circularTypeByName": {},
        "emittedType": {},
        "endpoints": [
            {
                "errors": [],
                "method": "get",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "post",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__2",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "put",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__3",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "delete",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__4",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
        ],
        "endpointsGroups": {},
        "options": {
            "baseUrl": "",
            "withAlias": false,
        },
        "schemas": {
            "schemaNameAlreadyUsed": "z.enum(["xxx", "yyy", "zzz"]).optional()",
            "schemaNameAlreadyUsed__2": "z.enum(["ggg", "hhh", "iii"]).optional()",
            "schemaNameAlreadyUsed__3": "z.enum(["aaa", "bbb", "ccc"]).optional()",
            "schemaNameAlreadyUsed__4": "z.enum(["ddd", "eee", "fff"]).optional()",
        },
        "types": {},
    }
  `);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2 },
  });

  expect(result).toMatchInlineSnapshot(`
    "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
    import { z } from "zod";

    export const schemaNameAlreadyUsed = z.enum(["xxx", "yyy", "zzz"]).optional();
    export const schemaNameAlreadyUsed__2 = z
      .enum(["ggg", "hhh", "iii"])
      .optional();
    export const schemaNameAlreadyUsed__3 = z
      .enum(["aaa", "bbb", "ccc"])
      .optional();
    export const schemaNameAlreadyUsed__4 = z
      .enum(["ddd", "eee", "fff"])
      .optional();

    const endpoints = makeApi([
      {
        method: "get",
        path: "/schema-name-already-used",
        requestFormat: "json",
        parameters: [
          {
            name: "schemaNameAlreadyUsed",
            type: "Query",
            schema: schemaNameAlreadyUsed,
          },
        ],
        response: z.string(),
      },
      {
        method: "post",
        path: "/schema-name-already-used",
        requestFormat: "json",
        parameters: [
          {
            name: "schemaNameAlreadyUsed",
            type: "Query",
            schema: schemaNameAlreadyUsed__2,
          },
        ],
        response: z.string(),
      },
      {
        method: "put",
        path: "/schema-name-already-used",
        requestFormat: "json",
        parameters: [
          {
            name: "schemaNameAlreadyUsed",
            type: "Query",
            schema: schemaNameAlreadyUsed__3,
          },
        ],
        response: z.string(),
      },
      {
        method: "delete",
        path: "/schema-name-already-used",
        requestFormat: "json",
        parameters: [
          {
            name: "schemaNameAlreadyUsed",
            type: "Query",
            schema: schemaNameAlreadyUsed__4,
          },
        ],
        response: z.string(),
      },
    ]);

    export const api = new Zodios(endpoints);

    export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
      return new Zodios(baseUrl, endpoints, options);
    }
    "
  `);
});
