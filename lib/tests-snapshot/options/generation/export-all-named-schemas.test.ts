import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';

test('export-all-named-schemas', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/export-all-named-schemas': {
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
              name: 'sameSchemaSameName',
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
              name: 'sameSchemaDifferentName',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
            },
            {
              name: 'sameSchemaSameName',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
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
  const ctx = getZodClientTemplateContext(openApiDoc, {
    complexityThreshold: 2,
    exportAllNamedSchemas: true,
  });
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
                        "name": "sameSchemaSameName",
                        "schema": "sameSchemaSameName",
                        "type": "Query",
                    },
                ],
                "path": "/export-all-named-schemas",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "post",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed",
                        "type": "Query",
                    },
                ],
                "path": "/export-all-named-schemas",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "put",
                "parameters": [
                    {
                        "name": "schemaNameAlreadyUsed",
                        "schema": "schemaNameAlreadyUsed__2",
                        "type": "Query",
                    },
                ],
                "path": "/export-all-named-schemas",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "delete",
                "parameters": [
                    {
                        "name": "sameSchemaDifferentName",
                        "schema": "sameSchemaDifferentName",
                        "type": "Query",
                    },
                    {
                        "name": "sameSchemaSameName",
                        "schema": "sameSchemaSameName",
                        "type": "Query",
                    },
                ],
                "path": "/export-all-named-schemas",
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
            "sameSchemaDifferentName": "z.enum(["xxx", "yyy", "zzz"]).optional()",
            "sameSchemaSameName": "z.enum(["xxx", "yyy", "zzz"]).optional()",
            "schemaNameAlreadyUsed": "z.enum(["ggg", "hhh", "iii"]).optional()",
            "schemaNameAlreadyUsed__2": "z.enum(["aaa", "bbb", "ccc"]).optional()",
        },
        "types": {},
    }
  `);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2, exportAllNamedSchemas: true },
  });

  expect(result).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const sameSchemaSameName = z.enum(["xxx", "yyy", "zzz"]).optional();
    export const schemaNameAlreadyUsed = z.enum(["ggg", "hhh", "iii"]).optional();
    export const schemaNameAlreadyUsed__2 = z
      .enum(["aaa", "bbb", "ccc"])
      .optional();
    export const sameSchemaDifferentName = z.enum(["xxx", "yyy", "zzz"]).optional();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/export-all-named-schemas",
        operationId: "getSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ sameSchemaSameName: sameSchemaSameName })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "post" as const,
        path: "/export-all-named-schemas",
        operationId: "postSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "put" as const,
        path: "/export-all-named-schemas",
        operationId: "putSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({ schemaNameAlreadyUsed: schemaNameAlreadyUsed__2 })
            .optional(),
        },
        responses: { 200: { schema: z.string() } },
      },
      {
        method: "delete" as const,
        path: "/export-all-named-schemas",
        operationId: "deleteSchemaNameAlreadyUsed",
        request: {
          queryParams: z
            .object({
              sameSchemaDifferentName: sameSchemaDifferentName,
              sameSchemaSameName: sameSchemaSameName,
            })
            .optional(),
          queryParams: z
            .object({
              sameSchemaDifferentName: sameSchemaDifferentName,
              sameSchemaSameName: sameSchemaSameName,
            })
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
