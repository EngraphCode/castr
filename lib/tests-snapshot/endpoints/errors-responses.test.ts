import { type SchemasObject } from 'openapi3-ts/oas31';
import { expect, it } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

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

  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const Main = z.object({ str: z.string(), nb: z.number() }).strict();
    export const AnotherSuccess = z.number();
    export const Error400 = z.object({ is400: z.boolean() }).partial().strict();
    export const Error500 = z.string();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/example",
        operationId: "getExample",
        request: {},
        responses: {
          200: {
            description: "OK",
            schema: z.object({ str: z.string(), nb: z.number() }).strict(),
          },
          201: { description: "Created", schema: z.number() },
          400: {
            description: "Bad request",
            schema: z.object({ is400: z.boolean() }).partial().strict(),
          },
          500: { description: "Internal server error", schema: z.string() },
          400: {
            description: "Bad request",
            schema: z.object({ is400: z.boolean() }).partial().strict(),
          },
          500: { description: "Internal server error", schema: z.string() },
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
          name: "get_example",
          description: "GET /example",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              str: {
                type: "string",
              },
              nb: {
                type: "number",
              },
            },
            required: ["str", "nb"],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get" as const,
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

  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const VeryDeeplyNested = z.enum(["aaa", "bbb", "ccc"]);
    export const DeeplyNested = z.array(VeryDeeplyNested);
    export const Main = z.object({ str: z.string(), nb: z.number() }).strict();
    export const Nested = z
      .object({
        nested_prop: z.boolean().optional(),
        deeplyNested: DeeplyNested.optional(),
        circularToMain: Main.optional(),
        requiredProp: z.string(),
      })
      .strict();
    export const Error400 = z
      .object({ is400: z.boolean(), nested: Nested })
      .partial()
      .strict();
    export const AnotherSuccess = z.number();
    export const Error404 = z.null();
    export const Error500 = z.string();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/example",
        operationId: "getExample",
        request: {},
        responses: {
          200: {
            description: "OK",
            schema: z.object({ str: z.string(), nb: z.number() }).strict(),
          },
          201: { description: "Created", schema: z.number() },
          400: {
            description: "Bad request",
            schema: z
              .object({ is400: z.boolean(), nested: Nested })
              .partial()
              .strict(),
          },
          404: {
            description: "Not found",
            schema: z
              .object({ is400: z.boolean(), nested: Nested })
              .partial()
              .strict(),
          },
          500: { description: "Internal server error", schema: z.string() },
          400: {
            description: "Bad request",
            schema: z
              .object({ is400: z.boolean(), nested: Nested })
              .partial()
              .strict(),
          },
          404: {
            description: "Not found",
            schema: z
              .object({ is400: z.boolean(), nested: Nested })
              .partial()
              .strict(),
          },
          500: { description: "Internal server error", schema: z.string() },
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
          name: "get_example",
          description: "GET /example",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              str: {
                type: "string",
              },
              nb: {
                type: "number",
              },
            },
            required: ["str", "nb"],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get" as const,
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

  expect(
    await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      options: {
        isErrorStatus: (status) => status === 400 || status === 500,
      },
      openApiDoc,
    }),
  ).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const VeryDeeplyNested = z.enum(["aaa", "bbb", "ccc"]);
    export const DeeplyNested = z.array(VeryDeeplyNested);
    export const Main = z.object({ str: z.string(), nb: z.number() }).strict();
    export const Nested = z
      .object({
        nested_prop: z.boolean().optional(),
        deeplyNested: DeeplyNested.optional(),
        circularToMain: Main.optional(),
        requiredProp: z.string(),
      })
      .strict();
    export const Error400 = z
      .object({ is400: z.boolean(), nested: Nested })
      .partial()
      .strict();
    export const AnotherSuccess = z.number();
    export const Error404 = z.null();
    export const Error500 = z.string();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/example",
        operationId: "getExample",
        request: {},
        responses: {
          200: {
            description: "OK",
            schema: z.object({ str: z.string(), nb: z.number() }).strict(),
          },
          201: { description: "Created", schema: z.number() },
          400: {
            description: "Bad request",
            schema: z
              .object({ is400: z.boolean(), nested: Nested })
              .partial()
              .strict(),
          },
          404: {
            description: "Not found",
            schema: z
              .object({ is400: z.boolean(), nested: Nested })
              .partial()
              .strict(),
          },
          500: { description: "Internal server error", schema: z.string() },
          400: {
            description: "Bad request",
            schema: z
              .object({ is400: z.boolean(), nested: Nested })
              .partial()
              .strict(),
          },
          404: {
            description: "Not found",
            schema: z
              .object({ is400: z.boolean(), nested: Nested })
              .partial()
              .strict(),
          },
          500: { description: "Internal server error", schema: z.string() },
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
          name: "get_example",
          description: "GET /example",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              str: {
                type: "string",
              },
              nb: {
                type: "number",
              },
            },
            required: ["str", "nb"],
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get" as const,
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
