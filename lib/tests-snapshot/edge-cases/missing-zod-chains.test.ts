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

    export const endpoints = [
      {
        method: "put" as const,
        path: "/pet",
        operationId: "putPet",
        request: {},
        responses: {
          200: { description: "Successful operation", schema: z.string().min(5) },
          401: {
            description: "Successful operation",
            schema: z.number().int().gte(10),
          },
          402: {
            description: "Successful operation",
            schema: z
              .object({ text: z.string().min(5), num: z.number().int().gte(10) })
              .strict(),
          },
          403: { description: "Successful operation", schema: nulltype },
          404: { description: "Successful operation", schema: anyOfType },
        },
      },
    ] as const;

    /**
     * MCP (Model Context Protocol) tool metadata derived from the OpenAPI document.
     *
     * Each entry provides:
     * - \`tool\`: JSON Schema Draft 07 compliant tool definition (name, description, annotations, schemas)
     * - \`httpOperation\`: source HTTP metadata (method, templated path, original path, operationId)
     * - \`security\`: upstream API security requirements (Layer 2 metadata only)
     *
     * Use \`tool\` when wiring into the MCP SDK, and \`httpOperation\`/\`security\` when presenting
     * additional context to operators or logging.
     */
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
          method: "put" as const,
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
