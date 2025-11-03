import { generateZodClientFromOpenAPI, getEndpointDefinitionList } from '../../../src/index.js';
import { expect, test } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';

test('handle-refs-with-dots-in-name', async () => {
  const doc = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/usual-ref-format': {
        get: {
          operationId: 'getWithUsualRefFormat',
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Basic' } } },
            },
          },
        },
      },
      '/ref-with-dot-in-name': {
        get: {
          operationId: 'getWithUnusualRefFormat',
          responses: {
            '200': {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Basic.Thing' } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Basic: { type: 'string' },
        'Basic.Thing': {
          type: 'object',
          properties: {
            thing: { $ref: '#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj' },
          },
        },
        'Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj': {
          type: 'object',
          properties: {
            aaa: { type: 'string' },
            bbb: { type: 'string' },
          },
        },
      },
    },
  } as OpenAPIObject;

  expect(getEndpointDefinitionList(doc)).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {
            "#/components/schemas/Basic.Thing": Set {
                "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
            },
        },
        "doc": {
            "components": {
                "schemas": {
                    "Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj": {
                        "properties": {
                            "aaa": {
                                "type": "string",
                            },
                            "bbb": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                    },
                    "Basic": {
                        "type": "string",
                    },
                    "Basic.Thing": {
                        "properties": {
                            "thing": {
                                "$ref": "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
                            },
                        },
                        "type": "object",
                    },
                },
            },
            "info": {
                "title": "Example API",
                "version": "1",
            },
            "openapi": "3.0.3",
            "paths": {
                "/ref-with-dot-in-name": {
                    "get": {
                        "operationId": "getWithUnusualRefFormat",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Basic.Thing",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "/usual-ref-format": {
                    "get": {
                        "operationId": "getWithUsualRefFormat",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Basic",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "endpoints": [
            {
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/usual-ref-format",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/ref-with-dot-in-name",
                "requestFormat": "json",
                "response": "Basic.Thing",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {
            "#/components/schemas/Basic.Thing": Set {
                "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
            },
        },
        "schemaByName": {},
        "zodSchemaByName": {
            "Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj": "z.object({ aaa: z.string(), bbb: z.string() }).partial().passthrough()",
            "Basic": "z.string()",
            "Basic.Thing": "z.object({ thing: Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj }).partial().passthrough()",
        },
    }
  `);

  const output = await generateZodClientFromOpenAPI({ openApiDoc: doc, disableWriteToFile: true });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj = z
      .object({ aaa: z.string(), bbb: z.string() })
      .partial()
      .strict();
    export const Basic_Thing = z
      .object({ thing: Aaa - bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj })
      .partial()
      .strict();
    export const Basic = z.string();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/ref-with-dot-in-name",
        operationId: "getWithUnusualRefFormat",
        request: {},
        responses: { 200: { schema: Basic.Thing } },
      },
      {
        method: "get" as const,
        path: "/usual-ref-format",
        operationId: "getWithUsualRefFormat",
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
