import { describe, test, expect } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
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
      `
      {
          "code": "z.union([z.object({
        age: z.number().int(),
        nickname: z.string().optional(),
      }).passthrough(), z.object({
        pet_type: z.enum(["Cat", "Dog"]),
        hunts: z.boolean().optional(),
      }).passthrough()])",
          "schema": {
              "anyOf": [
                  {
                      "properties": {
                          "age": {
                              "type": "integer",
                          },
                          "nickname": {
                              "type": "string",
                          },
                      },
                      "required": [
                          "age",
                      ],
                      "type": "object",
                  },
                  {
                      "properties": {
                          "hunts": {
                              "type": "boolean",
                          },
                          "pet_type": {
                              "enum": [
                                  "Cat",
                                  "Dog",
                              ],
                              "type": "string",
                          },
                      },
                      "required": [
                          "pet_type",
                      ],
                      "type": "object",
                  },
              ],
          },
      }
    `,
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
      `
      {
          "code": "z.union([z.object({
        age: z.number().int(),
        nickname: z.string().optional(),
      }).passthrough(), z.object({
        pet_type: z.enum(["Cat", "Dog"]),
        hunts: z.boolean().optional(),
      }).passthrough(), z.number()])",
          "schema": {
              "anyOf": [
                  {
                      "properties": {
                          "age": {
                              "type": "integer",
                          },
                          "nickname": {
                              "type": "string",
                          },
                      },
                      "required": [
                          "age",
                      ],
                      "type": "object",
                  },
                  {
                      "properties": {
                          "hunts": {
                              "type": "boolean",
                          },
                          "pet_type": {
                              "enum": [
                                  "Cat",
                                  "Dog",
                              ],
                              "type": "string",
                          },
                      },
                      "required": [
                          "pet_type",
                      ],
                      "type": "object",
                  },
                  {
                      "type": "number",
                  },
              ],
          },
      }
    `,
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
      `
      {
          "code": "z.union([z.unknown(), z.object({
        age: z.number().int(),
        nickname: z.string().optional(),
      }).passthrough(), z.object({
        pet_type: z.enum(["Cat", "Dog"]),
        hunts: z.boolean().optional(),
      }).passthrough(), z.string()])",
          "schema": {
              "anyOf": [
                  {
                      "type": [
                          "number",
                          "boolean",
                      ],
                  },
                  {
                      "properties": {
                          "age": {
                              "type": "integer",
                          },
                          "nickname": {
                              "type": "string",
                          },
                      },
                      "required": [
                          "age",
                      ],
                      "type": "object",
                  },
                  {
                      "properties": {
                          "hunts": {
                              "type": "boolean",
                          },
                          "pet_type": {
                              "enum": [
                                  "Cat",
                                  "Dog",
                              ],
                              "type": "string",
                          },
                      },
                      "required": [
                          "pet_type",
                      ],
                      "type": "object",
                  },
                  {
                      "type": "string",
                  },
              ],
          },
      }
    `,
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
    assertSingleFileResult(output);
    expect(output.content).toMatchInlineSnapshot(`
      "import { z } from "zod";
      // Type Definitions
      export type PetByAge = {
        age: number;
        nickname?: string;
      };
      export type PetByType = {
        pet_type: string;
        hunts?: boolean;
      };
      // Zod Schemas
      export const PetByAge = z
        .object({
          age: z.number().int(),
          nickname: z.string().optional(),
        })
        .strict();
      export const PetByType = z
        .object({
          pet_type: z.enum(["Cat", "Dog"]),
          hunts: z.boolean().optional(),
        })
        .strict();
      // Endpoints
      export const endpoints = [
        {
          method: "get",
          path: "/test",
          requestFormat: "json",
          parameters: [
            {
              name: "anyOfRef",
              type: "Query",
              schema: z.union([PetByAge, PetByType]).optional(),
            },
          ],
          response: z.object({}).strict(),
          errors: [],
          responses: {
            200: {
              schema: z.object({}).strict(),
              description: "Success",
            },
          },
          request: {
            queryParams: z.object({
              anyOfRef: z.union([PetByAge, PetByType]).optional(),
            }),
          },
          alias: "gettest",
        },
      ] as const;
      // MCP Tools
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
                          type: "object",
                          properties: {
                            age: { type: "integer" },
                            nickname: { type: "string" },
                          },
                          required: ["age"],
                        },
                        {
                          type: "object",
                          properties: {
                            pet_type: { type: "string", enum: ["Cat", "Dog"] },
                            hunts: { type: "boolean" },
                          },
                          required: ["pet_type"],
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
            method: "get",
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
