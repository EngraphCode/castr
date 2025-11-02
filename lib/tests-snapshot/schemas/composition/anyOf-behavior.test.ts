import { describe, test, expect } from 'vitest';
import { getZodSchema } from '../../../src/openApiToZod.js';
import { type OpenAPIObject } from 'openapi3-ts/oas30';
import { generateZodClientFromOpenAPI } from '../../../src/generateZodClientFromOpenAPI.js';

// the schemas and fixtures used in these tests are modified from examples here: https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/#anyof

describe('anyOf behavior', () => {
  test('adds passthrough() to objects', () => {
    const zodSchema = getZodSchema({
      schema: {
        anyOf: [
          {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
              },
              nickname: {
                type: 'string',
              },
            },
            required: ['age'],
          },
          {
            type: 'object',
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat', 'Dog'],
              },
              hunts: {
                type: 'boolean',
              },
            },
            required: ['pet_type'],
          },
        ],
      },
    });

    expect(zodSchema).toMatchInlineSnapshot(
      '"z.union([z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough()])"',
    );
  });

  test('handles mixes of primitive types and objects', () => {
    const zodSchema = getZodSchema({
      schema: {
        anyOf: [
          {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
              },
              nickname: {
                type: 'string',
              },
            },
            required: ['age'],
          },
          {
            type: 'object',
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat', 'Dog'],
              },
              hunts: {
                type: 'boolean',
              },
            },
            required: ['pet_type'],
          },
          { type: 'number' },
        ],
      },
    });

    expect(zodSchema).toMatchInlineSnapshot(
      '"z.union([z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough(), z.number()])"',
    );
  });

  test('handles an array of types', () => {
    const zodSchema = getZodSchema({
      schema: {
        anyOf: [
          {
            type: ['number', 'boolean'],
          },
          {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
              },
              nickname: {
                type: 'string',
              },
            },
            required: ['age'],
          },
          {
            type: 'object',
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat', 'Dog'],
              },
              hunts: {
                type: 'boolean',
              },
            },
            required: ['pet_type'],
          },
          { type: 'string' },
        ],
      },
    });

    expect(zodSchema).toMatchInlineSnapshot(
      '"z.union([z.union([z.number(), z.boolean()]), z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough(), z.string()])"',
    );
  });

  test('handles $refs', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.2',
      info: {
        title: 'anyOf with refs',
        version: 'v1',
      },
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'anyOfRef',
                schema: {
                  anyOf: [
                    { $ref: '#/components/schemas/PetByAge' },
                    { $ref: '#/components/schemas/PetByType' },
                  ],
                },
                in: 'query',
              },
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
      components: {
        schemas: {
          PetByAge: {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
              },
              nickname: {
                type: 'string',
              },
            },
            required: ['age'],
          },
          PetByType: {
            type: 'object',
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat', 'Dog'],
              },
              hunts: {
                type: 'boolean',
              },
            },
            required: ['pet_type'],
          },
        },
      },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { z } from "zod";

      export const PetByAge = z
        .object({ age: z.number().int(), nickname: z.string().optional() })
        .strict();
      export const PetByType = z
        .object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() })
        .strict();
      export const anyOfRef = z.union([PetByAge, PetByType]).optional();

      export const endpoints = [
        {
          method: "get" as const,
          path: "/test",
          operationId: "getTest",
          request: { queryParams: z.object({ anyOfRef: anyOfRef }).optional() },
          responses: { 200: { description: "Success", schema: z.void() } },
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
});
