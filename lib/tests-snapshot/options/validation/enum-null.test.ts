import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/61
test('enum-null', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'enum null',
    },
    components: {
      schemas: {
        Null1: {
          type: 'string',
          enum: [null],
        },
        Null2: {
          type: 'string',
          enum: ['a', null],
        },
        Null3: {
          type: 'string',
          enum: ['a', null],
          nullable: true,
        },
        Null4: {
          type: 'string',
          enum: [null],
          nullable: true,
        },
        Compound: {
          type: 'object',
          properties: {
            field: {
              oneOf: [
                { $ref: '#/components/schemas/Null1' },
                { $ref: '#/components/schemas/Null2' },
                { $ref: '#/components/schemas/Null3' },
                { $ref: '#/components/schemas/Null4' },
                { type: 'string' },
              ],
            },
          },
        },
      },
    },
    paths: {
      '/sample': {
        get: {
          responses: {
            '200': {
              description: 'one null',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Null1',
                  },
                },
              },
            },
            '400': {
              description: 'null with a string',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Null2',
                  },
                },
              },
            },
            '401': {
              description: 'null with a string and nullable',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Null3',
                  },
                },
              },
            },
            '402': {
              description: 'null with nullable',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Null4',
                  },
                },
              },
            },
            '403': {
              description: 'object that references null',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Compound',
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { shouldExportAllTypes: true },
  });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    type Compound = Partial<{ field: Null1 | Null2 | Null3 | Null4 | string }>;
    type Null1 = null;
    type Null2 = "a" | null;
    type Null3 = "a" | null;
    type Null4 = null;

    export const Null1 = z.literal(null);
    export const Null2 = z.enum(["a", null]);
    export const Null3 = z.enum(["a", null]);
    export const Null4 = z.literal(null);
    export const Compound: z.ZodType<Compound> = z
      .object({ field: z.union([Null1, Null2, Null3, Null4, z.string()]) })
      .partial()
      .strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/sample",
        operationId: "getSample",
        request: {},
        responses: {
          200: { description: "one null", schema: z.literal(null) },
          400: { description: "null with a string", schema: z.enum(["a", null]) },
          401: {
            description: "null with a string and nullable",
            schema: z.enum(["a", null]).nullable(),
          },
          402: {
            description: "null with nullable",
            schema: z.literal(null).nullable(),
          },
          403: { description: "object that references null", schema: Compound },
          400: { description: "null with a string", schema: z.enum(["a", null]) },
          401: {
            description: "null with a string and nullable",
            schema: z.enum(["a", null]).nullable(),
          },
          402: {
            description: "null with nullable",
            schema: z.literal(null).nullable(),
          },
          403: { description: "object that references null", schema: Compound },
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
