import { type SchemasObject } from 'openapi3-ts/oas31';
import { expect, it } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/test-helpers/legacy-compat.js';

it('includes errors-responses', async () => {
  const schemas = {
    Main: {
      type: 'object',
      properties: {
        str: { type: 'string' },
        nb: { type: 'number' },
      },
      required: ['str', 'nb'],
    },
    AnotherSuccess: { type: 'number' },
    Error400: {
      type: 'object',
      properties: {
        is400: { type: 'boolean' },
      },
    },
    Error500: { type: 'string' },
  } as SchemasObject;

  const openApiDoc = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/example': {
        get: {
          operationId: 'getExample',
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: schemas['Main'] } },
            },
            '201': {
              description: 'Created',
              content: { 'application/json': { schema: schemas['AnotherSuccess'] } },
            },
            '400': {
              description: 'Bad request',
              content: { 'application/json': { schema: schemas['Error400'] } },
            },
            '500': {
              description: 'Internal server error',
              content: { 'application/json': { schema: schemas['Error500'] } },
            },
          },
        },
      },
    },
    components: { schemas },
  };

  const result = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });

  assertSingleFileResult(result);

  expect(result.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type Main = {
      str: string;
      nb: number;
    };
    export type AnotherSuccess = number;
    export type Error400 = {
      is400?: boolean;
    };
    export type Error500 = string;
    // Zod Schemas
    export const Main = z
      .object({
        str: z.string(),
        nb: z.number(),
      })
      .strict();
    export const AnotherSuccess = z.number();
    export const Error400 = z
      .object({
        is400: z.boolean().optional(),
      })
      .strict();
    export const Error500 = z.string();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/example",
        requestFormat: "json",
        parameters: [],
        response: z
          .object({
            str: z.string(),
            nb: z.number(),
          })
          .strict(),
        errors: [
          {
            status: 400,
            schema: z
              .object({
                is400: z.boolean().optional(),
              })
              .strict(),
            description: "Bad request",
          },
          {
            status: 500,
            schema: z.string(),
            description: "Internal server error",
          },
        ],
        responses: {
          200: {
            schema: z
              .object({
                str: z.string(),
                nb: z.number(),
              })
              .strict(),
            description: "OK",
          },
          201: {
            schema: z.number(),
            description: "Created",
          },
          400: {
            schema: z
              .object({
                is400: z.boolean().optional(),
              })
              .strict(),
            description: "Bad request",
          },
          500: {
            schema: z.string(),
            description: "Internal server error",
          },
        },
        request: {},
        alias: "getExample",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_example",
          description: "GET /example",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: { str: { type: "string" }, nb: { type: "number" } },
            required: ["str", "nb"],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get",
          path: "/example",
          originalPath: "/example",
          operationId: "getExample",
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

it('determines which status are considered errors-responses', async () => {
  const schemas = {
    Main: {
      type: 'object',
      properties: {
        str: { type: 'string' },
        nb: { type: 'number' },
      },
      required: ['str', 'nb'],
    },
    AnotherSuccess: { type: 'number' },
    Error400: {
      type: 'object',
      properties: {
        is400: { type: 'boolean' },
        nested: { $ref: '#/components/schemas/Nested' },
      },
    },
    Error404: { type: 'null' },
    Error500: { type: 'string' },
    Nested: {
      type: 'object',
      properties: {
        nested_prop: { type: 'boolean' },
        deeplyNested: { $ref: '#/components/schemas/DeeplyNested' },
        circularToMain: { $ref: '#/components/schemas/Main' },
        requiredProp: { type: 'string' },
      },
      required: ['requiredProp'],
    },
    DeeplyNested: {
      type: 'array',
      items: { $ref: '#/components/schemas/VeryDeeplyNested' },
    },
    VeryDeeplyNested: {
      type: 'string',
      enum: ['aaa', 'bbb', 'ccc'],
    },
  } as SchemasObject;

  const openApiDoc = {
    openapi: '3.1.0',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/example': {
        get: {
          operationId: 'getExample',
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: schemas['Main'] } },
            },
            '201': {
              description: 'Created',
              content: { 'application/json': { schema: schemas['AnotherSuccess'] } },
            },
            '400': {
              description: 'Bad request',
              content: { 'application/json': { schema: schemas['Error400'] } },
            },
            '404': {
              description: 'Not found',
              content: { 'application/json': { schema: schemas['Error400'] } },
            },
            '500': {
              description: 'Internal server error',
              content: { 'application/json': { schema: schemas['Error500'] } },
            },
          },
        },
      },
    },
    components: { schemas },
  };

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    options: {
      isErrorStatus: 'status === 400 || status === 500',
    },
    openApiDoc,
  });

  assertSingleFileResult(result);

  expect(result.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type Main = {
      str: string;
      nb: number;
    };
    export type AnotherSuccess = number;
    export type VeryDeeplyNested = string;
    export type DeeplyNested = VeryDeeplyNested[];
    export type Nested = {
      nested_prop?: boolean;
      deeplyNested?: DeeplyNested;
      circularToMain?: Main;
      requiredProp: string;
    };
    export type Error400 = {
      is400?: boolean;
      nested?: Nested;
    };
    export type Error404 = unknown;
    export type Error500 = string;
    // Zod Schemas
    export const Main = z
      .object({
        str: z.string(),
        nb: z.number(),
      })
      .strict();
    export const AnotherSuccess = z.number();
    export const VeryDeeplyNested = z.enum(["aaa", "bbb", "ccc"]);
    export const DeeplyNested = z.array(VeryDeeplyNested);
    export const Nested = z
      .object({
        nested_prop: z.boolean().optional(),
        deeplyNested: DeeplyNested.optional(),
        circularToMain: Main.optional(),
        requiredProp: z.string(),
      })
      .strict();
    export const Error400 = z
      .object({
        is400: z.boolean().optional(),
        nested: Nested.optional(),
      })
      .strict();
    export const Error404 = z.null();
    export const Error500 = z.string();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/example",
        requestFormat: "json",
        parameters: [],
        response: z
          .object({
            str: z.string(),
            nb: z.number(),
          })
          .strict(),
        errors: [
          {
            status: 400,
            schema: z
              .object({
                is400: z.boolean().optional(),
                nested: Nested.optional(),
              })
              .strict(),
            description: "Bad request",
          },
          {
            status: 404,
            schema: z
              .object({
                is400: z.boolean().optional(),
                nested: Nested.optional(),
              })
              .strict(),
            description: "Not found",
          },
          {
            status: 500,
            schema: z.string(),
            description: "Internal server error",
          },
        ],
        responses: {
          200: {
            schema: z
              .object({
                str: z.string(),
                nb: z.number(),
              })
              .strict(),
            description: "OK",
          },
          201: {
            schema: z.number(),
            description: "Created",
          },
          400: {
            schema: z
              .object({
                is400: z.boolean().optional(),
                nested: Nested.optional(),
              })
              .strict(),
            description: "Bad request",
          },
          404: {
            schema: z
              .object({
                is400: z.boolean().optional(),
                nested: Nested.optional(),
              })
              .strict(),
            description: "Not found",
          },
          500: {
            schema: z.string(),
            description: "Internal server error",
          },
        },
        request: {},
        alias: "getExample",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_example",
          description: "GET /example",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: { str: { type: "string" }, nb: { type: "number" } },
            required: ["str", "nb"],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get",
          path: "/example",
          originalPath: "/example",
          operationId: "getExample",
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

  const result2 = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    options: {
      isErrorStatus: (status) => status === 400 || status === 500,
    },
    openApiDoc,
  });
  assertSingleFileResult(result2);
  expect(result2.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type Main = {
      str: string;
      nb: number;
    };
    export type AnotherSuccess = number;
    export type VeryDeeplyNested = string;
    export type DeeplyNested = VeryDeeplyNested[];
    export type Nested = {
      nested_prop?: boolean;
      deeplyNested?: DeeplyNested;
      circularToMain?: Main;
      requiredProp: string;
    };
    export type Error400 = {
      is400?: boolean;
      nested?: Nested;
    };
    export type Error404 = unknown;
    export type Error500 = string;
    // Zod Schemas
    export const Main = z
      .object({
        str: z.string(),
        nb: z.number(),
      })
      .strict();
    export const AnotherSuccess = z.number();
    export const VeryDeeplyNested = z.enum(["aaa", "bbb", "ccc"]);
    export const DeeplyNested = z.array(VeryDeeplyNested);
    export const Nested = z
      .object({
        nested_prop: z.boolean().optional(),
        deeplyNested: DeeplyNested.optional(),
        circularToMain: Main.optional(),
        requiredProp: z.string(),
      })
      .strict();
    export const Error400 = z
      .object({
        is400: z.boolean().optional(),
        nested: Nested.optional(),
      })
      .strict();
    export const Error404 = z.null();
    export const Error500 = z.string();
    // Endpoints
    export const endpoints = [
      {
        method: "get",
        path: "/example",
        requestFormat: "json",
        parameters: [],
        response: z
          .object({
            str: z.string(),
            nb: z.number(),
          })
          .strict(),
        errors: [
          {
            status: 400,
            schema: z
              .object({
                is400: z.boolean().optional(),
                nested: Nested.optional(),
              })
              .strict(),
            description: "Bad request",
          },
          {
            status: 404,
            schema: z
              .object({
                is400: z.boolean().optional(),
                nested: Nested.optional(),
              })
              .strict(),
            description: "Not found",
          },
          {
            status: 500,
            schema: z.string(),
            description: "Internal server error",
          },
        ],
        responses: {
          200: {
            schema: z
              .object({
                str: z.string(),
                nb: z.number(),
              })
              .strict(),
            description: "OK",
          },
          201: {
            schema: z.number(),
            description: "Created",
          },
          400: {
            schema: z
              .object({
                is400: z.boolean().optional(),
                nested: Nested.optional(),
              })
              .strict(),
            description: "Bad request",
          },
          404: {
            schema: z
              .object({
                is400: z.boolean().optional(),
                nested: Nested.optional(),
              })
              .strict(),
            description: "Not found",
          },
          500: {
            schema: z.string(),
            description: "Internal server error",
          },
        },
        request: {},
        alias: "getExample",
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "get_example",
          description: "GET /example",
          inputSchema: { type: "object", properties: {} },
          outputSchema: {
            type: "object",
            properties: { str: { type: "string" }, nb: { type: "number" } },
            required: ["str", "nb"],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get",
          path: "/example",
          originalPath: "/example",
          operationId: "getExample",
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
