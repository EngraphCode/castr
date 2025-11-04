import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/61
test('array-default-values', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'enums min max',
    },
    paths: {
      '/sample': {
        get: {
          parameters: [
            {
              in: 'query',
              name: 'array-empty',
              schema: {
                type: 'array',
                items: { type: 'string' },
                default: [],
              },
            },
            {
              in: 'query',
              name: 'array-string',
              schema: {
                type: 'array',
                items: { type: 'string' },
                default: ['one', 'two'],
              },
            },
            {
              in: 'query',
              name: 'array-number',
              schema: {
                type: 'array',
                items: { type: 'number' },
                default: [1, 2],
              },
            },
            {
              in: 'query',
              name: 'array-object',
              schema: {
                type: 'array',
                items: { type: 'object', properties: { foo: { type: 'string' } } },
                default: [{ foo: 'bar' }],
              },
            },
            {
              in: 'query',
              name: 'array-ref-object',
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/MyComponent' },
                default: [{ id: 1, name: 'foo' }],
              },
            },
            {
              in: 'query',
              name: 'array-ref-enum',
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/MyEnum' },
                default: ['one', 'two'],
              },
            },
          ],
          responses: {
            '200': {
              description: 'resoponse',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        MyComponent: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
            name: {
              type: 'string',
            },
          },
        },
        MyEnum: {
          type: 'string',
          enum: ['one', 'two', 'three'],
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const array_object = z
      .array(z.object({ foo: z.string() }).partial().strict())
      .optional()
      .default([{ foo: "bar" }]);
    export const MyComponent = z
      .object({ id: z.number(), name: z.string() })
      .partial()
      .strict();
    export const MyEnum = z.enum(["one", "two", "three"]);

    export const endpoints = [
      {
        method: "get" as const,
        path: "/sample",
        operationId: "getSample",
        request: {
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
          queryParams: z
            .object({
              "array-empty": z.array(z.string()).optional().default([]),
              "array-string": z
                .array(z.string())
                .optional()
                .default(["one", "two"]),
              "array-number": z.array(z.number()).optional().default([1, 2]),
              "array-object": array_object,
              "array-ref-object": z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
              "array-ref-enum": z.array(MyEnum).optional().default(["one", "two"]),
            })
            .optional(),
        },
        responses: { 200: { description: "resoponse", schema: z.void() } },
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
