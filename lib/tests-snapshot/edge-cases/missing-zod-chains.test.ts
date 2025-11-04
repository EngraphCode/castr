import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
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
  expect(output).toMatchInlineSnapshot(`
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
