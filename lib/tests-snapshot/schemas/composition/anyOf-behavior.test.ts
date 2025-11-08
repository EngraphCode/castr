import { describe, test, expect } from 'vitest';
import { getZodSchema } from '../../../src/conversion/zod/index.js';
import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../../../src/rendering/index.js';

// the schemas and fixtures used in these tests are modified from examples here: https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/#anyof

describe('anyOf behavior', () => {
  test('adds passthrough() to objects', () => {
    const zodSchema = getZodSchema({
      schema: {
        anyOf: [
          {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
              },
              nickname: {
                type: 'string',
              },
            },
            required: ['age'],
          },
          {
            type: 'object',
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat', 'Dog'],
              },
              hunts: {
                type: 'boolean',
              },
            },
            required: ['pet_type'],
          },
        ],
      },
    });

    expect(zodSchema).toMatchInlineSnapshot(
      '"z.union([z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough()])"',
    );
  });

  test('handles mixes of primitive types and objects', () => {
    const zodSchema = getZodSchema({
      schema: {
        anyOf: [
          {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
              },
              nickname: {
                type: 'string',
              },
            },
            required: ['age'],
          },
          {
            type: 'object',
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat', 'Dog'],
              },
              hunts: {
                type: 'boolean',
              },
            },
            required: ['pet_type'],
          },
          { type: 'number' },
        ],
      },
    });

    expect(zodSchema).toMatchInlineSnapshot(
      '"z.union([z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough(), z.number()])"',
    );
  });

  test('handles an array of types', () => {
    const zodSchema = getZodSchema({
      schema: {
        anyOf: [
          {
            type: ['number', 'boolean'],
          },
          {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
              },
              nickname: {
                type: 'string',
              },
            },
            required: ['age'],
          },
          {
            type: 'object',
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat', 'Dog'],
              },
              hunts: {
                type: 'boolean',
              },
            },
            required: ['pet_type'],
          },
          { type: 'string' },
        ],
      },
    });

    expect(zodSchema).toMatchInlineSnapshot(
      '"z.union([z.union([z.number(), z.boolean()]), z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough(), z.string()])"',
    );
  });

  test('handles $refs', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.2',
      info: {
        title: 'anyOf with refs',
        version: 'v1',
      },
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'anyOfRef',
                schema: {
                  anyOf: [
                    { $ref: '#/components/schemas/PetByAge' },
                    { $ref: '#/components/schemas/PetByType' },
                  ],
                },
                in: 'query',
              },
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
      components: {
        schemas: {
          PetByAge: {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
              },
              nickname: {
                type: 'string',
              },
            },
            required: ['age'],
          },
          PetByType: {
            type: 'object',
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat', 'Dog'],
              },
              hunts: {
                type: 'boolean',
              },
            },
            required: ['pet_type'],
          },
        },
      },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { z } from "zod";

      export const PetByAge = z
        .object({ age: z.number().int(), nickname: z.string().optional() })
        .strict();
      export const PetByType = z
        .object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() })
        .strict();
      export const anyOfRef = z.union([PetByAge, PetByType]).optional();

      export const endpoints = [
        {
          method: "get" as const,
          path: "/test",
          operationId: "getTest",
          request: { queryParams: z.object({ anyOfRef: anyOfRef }).optional() },
          responses: { 200: { description: "Success", schema: z.void() } },
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
            name: "get_test",
            description: "GET /test",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "object",
                  properties: {
                    anyOfRef: {
                      anyOf: [
                        {
                          $ref: "#/definitions/PetByAge",
                        },
                        {
                          $ref: "#/definitions/PetByType",
                        },
                      ],
                    },
                  },
                },
              },
            },
            annotations: {
              readOnlyHint: true,
              destructiveHint: false,
              idempotentHint: false,
            },
          },
          httpOperation: {
            method: "get" as const,
            path: "/test",
            originalPath: "/test",
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
});
