import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/49
test('missing-zod-chains-on-z-object-with-refs-props', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Schema test', version: '1.0.0' },
    paths: {
      '/user/add': {
        post: {
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AddUser' } } },
          },
          responses: { '200': { description: 'foo' } },
        },
      },
      '/user/recover': {
        post: {
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PasswordReminder' } },
            },
          },
          responses: { '200': { description: 'bar' } },
        },
      },
    },
    components: {
      schemas: {
        Password: { type: 'string', pattern: '/(PasswordRegex)/', minLength: 16, maxLength: 255 },
        Email: { type: 'string', pattern: '/(EmailRegex)/', minLength: 6, maxLength: 255 },
        AddUser: {
          required: ['email', 'password'],
          properties: {
            email: { $ref: '#/components/schemas/Email' },
            password: { $ref: '#/components/schemas/Password' },
          },
        },
        PasswordReminder: {
          required: ['email'],
          properties: { email: { $ref: '#/components/schemas/Email' } },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    export const Email = z.string();
    export const Password = z.string();
    export const AddUser = z
      .object({
        email: Email.min(6)
          .max(255)
          .regex(/(EmailRegex)/),
        password: Password.min(16)
          .max(255)
          .regex(/(PasswordRegex)/),
      })
      .strict();
    export const PasswordReminder = z
      .object({
        email: Email.min(6)
          .max(255)
          .regex(/(EmailRegex)/),
      })
      .strict();

    export const endpoints = [
      {
        method: "post" as const,
        path: "/user/add",
        operationId: "postUserAdd",
        request: {
          body: z
            .object({
              email: Email.min(6)
                .max(255)
                .regex(/(EmailRegex)/),
              password: Password.min(16)
                .max(255)
                .regex(/(PasswordRegex)/),
            })
            .strict(),
        },
        responses: { 200: { description: "foo", schema: z.void() } },
      },
      {
        method: "post" as const,
        path: "/user/recover",
        operationId: "postUserRecover",
        request: {
          body: z
            .object({
              email: Email.min(6)
                .max(255)
                .regex(/(EmailRegex)/),
            })
            .strict(),
        },
        responses: { 200: { description: "bar", schema: z.void() } },
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
