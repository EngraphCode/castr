import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';

test('schema-name-already-used', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/schema-name-already-used': {
        get: {
          operationId: 'getSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
            },
          ],
        },
        put: {
          operationId: 'putSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
          ],
        },
        delete: {
          operationId: 'deleteSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['ddd', 'eee', 'fff'] },
            },
          ],
        },
        post: {
          operationId: 'postSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['ggg', 'hhh', 'iii'] },
            },
          ],
        },
      },
    },
  };
  const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2 });
  expect(ctx).toMatchInlineSnapshot(`
    {
        "circularTypeByName": {},
        "emittedType": {},
        "endpoints": [
            {
                "errors": [],
                "method": "get",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "post",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__2",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "put",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__3",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "delete",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__4",
                        "type": "Query",
                    },
                ],
                "path": "/schema-name-already-used",
                "requestFormat": "json",
                "response": "z.string()",
            },
        ],
        "endpointsGroups": {},
        "options": {
            "baseUrl": "",
            "withAlias": false,
        },
        "schemas": {
            "schemaNameAlreadyUsed": "z.enum(["xxx", "yyy", "zzz"]).optional()",
            "schemaNameAlreadyUsed__2": "z.enum(["ggg", "hhh", "iii"]).optional()",
            "schemaNameAlreadyUsed__3": "z.enum(["aaa", "bbb", "ccc"]).optional()",
            "schemaNameAlreadyUsed__4": "z.enum(["ddd", "eee", "fff"]).optional()",
        },
        "types": {},
    }
  `);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2 },
  });

  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const schemaNameAlreadyUsed = z.enum(["xxx", "yyy", "zzz"]).optional();
    export const schemaNameAlreadyUsed__2 = z
      .enum(["ggg", "hhh", "iii"])
      .optional();
    export const schemaNameAlreadyUsed__3 = z
      .enum(["aaa", "bbb", "ccc"])
      .optional();
    export const schemaNameAlreadyUsed__4 = z
      .enum(["ddd", "eee", "fff"])
      .optional();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/schema-name-already-used",
        operationId: "getSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "post" as const,
        path: "/schema-name-already-used",
        operationId: "postSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed__2 })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "put" as const,
        path: "/schema-name-already-used",
        operationId: "putSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed__3 })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "delete" as const,
        path: "/schema-name-already-used",
        operationId: "deleteSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed__4 })
            .optional(),
        },
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
