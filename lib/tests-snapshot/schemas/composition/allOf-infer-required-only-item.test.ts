import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/49
test('allOf-infer-required-only-item', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: {
      title: 'User',
      version: '1.0.0',
    },
    paths: {
      '/user': {
        get: {
          responses: {
            '200': {
              description: 'return user',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/userResponse',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        user: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
          },
        },
        userResponse: {
          type: 'object',
          properties: {
            user: {
              allOf: [
                {
                  $ref: '#/components/schemas/user',
                },
                {
                  required: ['name'],
                },
              ],
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: {
      shouldExportAllTypes: true,
      shouldExportAllSchemas: true,
      withImplicitRequiredProps: true,
    },
  });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    type userResponse = Partial<{ user: user & { name: string } }>;
    type user = Partial<{ name: string; email: string }>;

    export const user: z.ZodType<user> = z
      .object({ name: z.string(), email: z.string() })
      .strict();
    export const userResponse: z.ZodType<userResponse> = z
      .object({ user: user.and(z.object({ name: z.string() }).strict()) })
      .strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/user",
        operationId: "getUser",
        request: {},
        responses: { 200: { description: "return user", schema: userResponse } },
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
