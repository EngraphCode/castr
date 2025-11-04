import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../src/index.js';

test('name-with-special-characters', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/name-with-special-characters': {
        get: {
          operationId: 'nameWithSPecialCharacters',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/1Name-With-Special---Characters' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        '1Name-With-Special---Characters': { type: 'string' },
      },
    },
  };
  const ctx = getZodClientTemplateContext(openApiDoc);
  expect(ctx.endpoints).toMatchInlineSnapshot(`
    [
        {
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/name-with-special-characters",
            "requestFormat": "json",
            "response": "z.string()",
        },
    ]
  `);

  const result = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const _1Name_With_Special_Characters = z.string();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/name-with-special-characters",
        operationId: "nameWithSPecialCharacters",
        request: {},
        responses: { 200: { schema: z.string() } },
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
