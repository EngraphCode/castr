import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/test-helpers/legacy-compat.js';

// https://github.com/astahmer/@engraph/castr/issues/49
test('missing-zod-chains', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.1.0',
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
    // Type Definitions
    export type test1 = string;
    export type test2 = number;
    export type test3 = {
      text: string;
      num: number;
    };
    export type nulltype = unknown;
    export type anyOfType = unknown;
    // Zod Schemas
    export const test1 = z.string().min(5);
    export const test2 = z.number().min(10).int();
    export const test3 = z
      .object({
        text: z.string().min(5),
        num: z.number().min(10).int(),
      })
      .strict();
    export const nulltype = z.union([z.object({}).strict(), z.null()]);
    export const anyOfType = z.union([
      z.object({}).strict(),
      z
        .object({
          foo: z.string().optional(),
        })
        .strict(),
      z.null(),
    ]);
    // Endpoints
    export const endpoints = [
      {
        method: "put",
        path: "/pet",
        requestFormat: "json",
        parameters: [],
        response: test1,
        errors: [
          {
            status: 401,
            schema: test2,
            description: "Successful operation",
          },
          {
            status: 402,
            schema: test3,
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
            schema: test1,
            description: "Successful operation",
          },
          401: {
            schema: test2,
            description: "Successful operation",
          },
          402: {
            schema: test3,
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
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "put_pet",
          description: "PUT /pet",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: { value: { type: "string", minLength: 5 } },
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
