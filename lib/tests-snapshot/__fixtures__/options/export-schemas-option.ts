export const exportSchemasOptionContextSnapshot = {
  Basic: 'z.string()',
  UnusedSchemas:
    'z.object({ nested_prop: z.boolean(), another: z.string() }).partial().passthrough()',
} as const;

export const exportSchemasOptionOutputSnapshot = `import { z } from "zod";
// Zod Schemas
export const Basic = z.string();
export const UnusedSchemas = z
  .object({ nested_prop: z.boolean(), another: z.string() })
  .partial()
  .strict();
// Endpoints
export const endpoints = [
  {
    method: "get",
    path: "/export-schemas-option",
    requestFormat: "json",
    parameters: [],
    response: z.string(),
    errors: [],
    responses: {
      200: {
        schema: z.string(),
      },
    },
    request: {},
    alias: "123_example",
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: "123_example",
      description: "GET /export-schemas-option",
      inputSchema: {
        type: "object",
      },
      outputSchema: {
        type: "object",
        properties: {
          value: {
            type: "string",
          },
        },
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "get",
      path: "/export-schemas-option",
      originalPath: "/export-schemas-option",
      operationId: "123_example",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
] as const;
` as const;
