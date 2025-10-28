import { type OpenAPIObject } from 'openapi3-ts/oas30';
import { test, expect } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

test('jsdoc', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/test': {
        get: {
          operationId: '123_example',
          responses: {
            '200': {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ComplexObject' } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        SimpleObject: {
          type: 'object',
          properties: {
            str: { type: 'string' },
          },
        },
        ComplexObject: {
          type: 'object',
          properties: {
            example: {
              type: 'string',
              description: 'A string with example tag',
              example: 'example',
            },
            examples: {
              type: 'string',
              description: 'A string with examples tag',
              examples: ['example1', 'example2'],
            },
            manyTagsStr: {
              type: 'string',
              description: 'A string with many tags',
              minLength: 1,
              maxLength: 10,
              pattern: '^[a-z]*$',
              enum: ['a', 'b', 'c'],
            },
            numMin: {
              type: 'number',
              description: 'A number with minimum tag',
              minimum: 0,
            },
            numMax: {
              type: 'number',
              description: 'A number with maximum tag',
              maximum: 10,
            },
            manyTagsNum: {
              type: 'number',
              description: 'A number with many tags',
              minimum: 0,
              maximum: 10,
              default: 5,
              example: 3,
              deprecated: true,
              externalDocs: { url: 'https://example.com' },
            },
            bool: {
              type: 'boolean',
              description: 'A boolean',
              default: true,
            },
            ref: { $ref: '#/components/schemas/SimpleObject' },
            refArray: {
              type: 'array',
              description: 'An array of SimpleObject',
              items: {
                $ref: '#/components/schemas/SimpleObject',
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
    options: {
      withDocs: true,
      shouldExportAllTypes: true,
    },
  });

  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    type ComplexObject = Partial<{
      example: string;
      examples: string;
      manyTagsStr: "a" | "b" | "c";
      numMin: number;
      numMax: number;
      manyTagsNum: number;
      bool: boolean;
      ref: SimpleObject;
      refArray: Array<SimpleObject>;
    }>;
    type SimpleObject = Partial<{ str: string }>;

    export const SimpleObject: z.ZodType<SimpleObject> = z
      .object({ str: z.string() })
      .partial()
      .strict();
    export const ComplexObject: z.ZodType<ComplexObject> = z
      .object({
        example: z.string(),
        examples: z.string(),
        manyTagsStr: z.enum(["a", "b", "c"]).regex(/^[a-z]*$/),
        numMin: z.number().gte(0),
        numMax: z.number().lte(10),
        manyTagsNum: z.number().gte(0).lte(10).default(5),
        bool: z.boolean().default(true),
        ref: SimpleObject,
        refArray: z.array(SimpleObject),
      })
      .partial()
      .strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/test",
        operationId: "123_example",
        request: {},
        responses: { 200: { schema: ComplexObject } },
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
