import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/49
test('missing-zod-chains', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Schema test', version: '1.0.0' },
    components: {
      schemas: {
        test1: { type: 'string', minLength: 5 },
        test2: { type: 'integer', minimum: 10 },
        test3: {
          required: ['text', 'num'],
          properties: {
            text: { type: 'string', minLength: 5 },
            num: { type: 'integer', minimum: 10 },
          },
        },
        nulltype: { anyOf: [{ type: 'object' }, { type: 'null' }] },
        anyOfType: {
          anyOf: [
            { type: 'object' },
            { type: 'object', properties: { foo: { type: 'string' } } },
            { type: 'null' },
          ],
        },
      },
    },
    paths: {
      '/pet': {
        put: {
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/test1' } } },
            },
            '401': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/test2' } } },
            },
            '402': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/test3' } } },
            },
            '403': {
              description: 'Successful operation',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/nulltype' } },
              },
            },
            '404': {
              description: 'Successful operation',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/anyOfType' } },
              },
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Zod Schemas
    export const test1 = z.string();
    export const test2 = z.number();
    export const test3 = z
      .object({ text: z.string().min(5), num: z.number().int().gte(10) })
      .strict();
    export const nulltype = z.union([z.object({}).partial().strict(), z.null()]);
    export const anyOfType = z.union([
      z.object({}).partial().strict(),
      z.object({ foo: z.string() }).partial().strict(),
      z.null(),
    ]);
    // Endpoints
    export const endpoints = [
      {
        method: "put",
        path: "/pet",
        requestFormat: "json",
        parameters: [],
        response: z.string().min(5),
        errors: [
          {
            status: 401,
            schema: z.number().int().gte(10),
            description: "Successful operation",
          },
          {
            status: 402,
            schema: z
              .object({ text: z.string().min(5), num: z.number().int().gte(10) })
              .strict(),
            description: "Successful operation",
          },
          {
            status: 403,
            schema: nulltype,
            description: "Successful operation",
          },
          {
            status: 404,
            schema: anyOfType,
            description: "Successful operation",
          },
        ],
        responses: {
          200: {
            schema: z.string().min(5),
            description: "Successful operation",
          },
          401: {
            schema: z.number().int().gte(10),
            description: "Successful operation",
          },
          402: {
            schema: z
              .object({ text: z.string().min(5), num: z.number().int().gte(10) })
              .strict(),
            description: "Successful operation",
          },
          403: {
            schema: nulltype,
            description: "Successful operation",
          },
          404: {
            schema: anyOfType,
            description: "Successful operation",
          },
        },
        request: {},
        alias: "putPet",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "put_pet",
          description: "PUT /pet",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              value: {
                type: "string",
                minLength: 5,
              },
            },
          },
          annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
          },
        },
        httpOperation: {
          method: "put",
          path: "/pet",
          originalPath: "/pet",
        },
        security: {
          isPublic: true,
          usesGlobalSecurity: false,
          requirementSets: [],
        },
      },
    ] as const;
    "
  `);
});
