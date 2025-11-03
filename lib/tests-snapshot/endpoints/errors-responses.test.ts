import { type SchemasObject } from 'openapi3-ts/oas30';
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
     * MCP (Model Context Protocol) compatible tool definitions.
     *
     * Each endpoint is transformed into an MCP tool with:
     * - \`name\`: Unique identifier (operationId or auto-generated from method + path)
     * - \`description\`: Human-readable description of the tool's purpose
     * - \`inputSchema\`: Consolidated Zod schema for all request parameters (path, query, headers, body)
     * - \`outputSchema\`: Zod schema for the primary success response (200/201) or z.unknown()
     *
     * MCP tools use a consolidated input structure (all params in one object) rather than
     * the separated structure in \`endpoints\`, making them optimized for AI tool integration.
     * The output schema focuses on the "happy path" (primary success response). Error handling
     * is typically done at the protocol level.
     *
     * @see https://anthropic.com/mcp - Model Context Protocol specification
     * @example
     * \`\`\`typescript
     * import { mcpTools } from "./api";
     *
     * // AI assistant discovers and validates tool usage
     * const tool = mcpTools.find(t => t.name === "getUserById");
     * const input = tool.inputSchema.parse({
     *   path: { userId: "123" },
     *   query: { include: "profile" }
     * });
     * \`\`\`
     */
    export const mcpTools = endpoints.map((endpoint) => {
      // Build consolidated params object from all request parameter types
      // MCP requires a single inputSchema, not separated path/query/headers/body
      const params: Record<string, z.ZodTypeAny> = {};
      if (endpoint.request?.pathParams) params.path = endpoint.request.pathParams;
      if (endpoint.request?.queryParams)
        params.query = endpoint.request.queryParams;
      if (endpoint.request?.headers) params.headers = endpoint.request.headers;
      if (endpoint.request?.body) params.body = endpoint.request.body;

      return {
        // Use operationId for the canonical name, with fallback to generated name
        name:
          endpoint.operationId ||
          \`\${endpoint.method}_\${endpoint.path.replace(/[\\/{}]/g, "_")}\`,
        // Provide description for AI context
        description:
          endpoint.description ||
          \`\${endpoint.method.toUpperCase()} \${endpoint.path}\`,
        // Consolidated input schema (path, query, headers, body all nested)
        inputSchema:
          Object.keys(params).length > 0 ? z.object(params) : z.object({}),
        // Primary success response (200 or 201), fallback to z.unknown() for safety
        outputSchema:
          endpoint.responses[200]?.schema ||
          endpoint.responses[201]?.schema ||
          z.unknown(),
      };
    }) as const;
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
     * MCP (Model Context Protocol) compatible tool definitions.
     *
     * Each endpoint is transformed into an MCP tool with:
     * - \`name\`: Unique identifier (operationId or auto-generated from method + path)
     * - \`description\`: Human-readable description of the tool's purpose
     * - \`inputSchema\`: Consolidated Zod schema for all request parameters (path, query, headers, body)
     * - \`outputSchema\`: Zod schema for the primary success response (200/201) or z.unknown()
     *
     * MCP tools use a consolidated input structure (all params in one object) rather than
     * the separated structure in \`endpoints\`, making them optimized for AI tool integration.
     * The output schema focuses on the "happy path" (primary success response). Error handling
     * is typically done at the protocol level.
     *
     * @see https://anthropic.com/mcp - Model Context Protocol specification
     * @example
     * \`\`\`typescript
     * import { mcpTools } from "./api";
     *
     * // AI assistant discovers and validates tool usage
     * const tool = mcpTools.find(t => t.name === "getUserById");
     * const input = tool.inputSchema.parse({
     *   path: { userId: "123" },
     *   query: { include: "profile" }
     * });
     * \`\`\`
     */
    export const mcpTools = endpoints.map((endpoint) => {
      // Build consolidated params object from all request parameter types
      // MCP requires a single inputSchema, not separated path/query/headers/body
      const params: Record<string, z.ZodTypeAny> = {};
      if (endpoint.request?.pathParams) params.path = endpoint.request.pathParams;
      if (endpoint.request?.queryParams)
        params.query = endpoint.request.queryParams;
      if (endpoint.request?.headers) params.headers = endpoint.request.headers;
      if (endpoint.request?.body) params.body = endpoint.request.body;

      return {
        // Use operationId for the canonical name, with fallback to generated name
        name:
          endpoint.operationId ||
          \`\${endpoint.method}_\${endpoint.path.replace(/[\\/{}]/g, "_")}\`,
        // Provide description for AI context
        description:
          endpoint.description ||
          \`\${endpoint.method.toUpperCase()} \${endpoint.path}\`,
        // Consolidated input schema (path, query, headers, body all nested)
        inputSchema:
          Object.keys(params).length > 0 ? z.object(params) : z.object({}),
        // Primary success response (200 or 201), fallback to z.unknown() for safety
        outputSchema:
          endpoint.responses[200]?.schema ||
          endpoint.responses[201]?.schema ||
          z.unknown(),
      };
    }) as const;
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
     * MCP (Model Context Protocol) compatible tool definitions.
     *
     * Each endpoint is transformed into an MCP tool with:
     * - \`name\`: Unique identifier (operationId or auto-generated from method + path)
     * - \`description\`: Human-readable description of the tool's purpose
     * - \`inputSchema\`: Consolidated Zod schema for all request parameters (path, query, headers, body)
     * - \`outputSchema\`: Zod schema for the primary success response (200/201) or z.unknown()
     *
     * MCP tools use a consolidated input structure (all params in one object) rather than
     * the separated structure in \`endpoints\`, making them optimized for AI tool integration.
     * The output schema focuses on the "happy path" (primary success response). Error handling
     * is typically done at the protocol level.
     *
     * @see https://anthropic.com/mcp - Model Context Protocol specification
     * @example
     * \`\`\`typescript
     * import { mcpTools } from "./api";
     *
     * // AI assistant discovers and validates tool usage
     * const tool = mcpTools.find(t => t.name === "getUserById");
     * const input = tool.inputSchema.parse({
     *   path: { userId: "123" },
     *   query: { include: "profile" }
     * });
     * \`\`\`
     */
    export const mcpTools = endpoints.map((endpoint) => {
      // Build consolidated params object from all request parameter types
      // MCP requires a single inputSchema, not separated path/query/headers/body
      const params: Record<string, z.ZodTypeAny> = {};
      if (endpoint.request?.pathParams) params.path = endpoint.request.pathParams;
      if (endpoint.request?.queryParams)
        params.query = endpoint.request.queryParams;
      if (endpoint.request?.headers) params.headers = endpoint.request.headers;
      if (endpoint.request?.body) params.body = endpoint.request.body;

      return {
        // Use operationId for the canonical name, with fallback to generated name
        name:
          endpoint.operationId ||
          \`\${endpoint.method}_\${endpoint.path.replace(/[\\/{}]/g, "_")}\`,
        // Provide description for AI context
        description:
          endpoint.description ||
          \`\${endpoint.method.toUpperCase()} \${endpoint.path}\`,
        // Consolidated input schema (path, query, headers, body all nested)
        inputSchema:
          Object.keys(params).length > 0 ? z.object(params) : z.object({}),
        // Primary success response (200 or 201), fallback to z.unknown() for safety
        outputSchema:
          endpoint.responses[200]?.schema ||
          endpoint.responses[201]?.schema ||
          z.unknown(),
      };
    }) as const;
    "
  `);
});
