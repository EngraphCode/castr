export const hyphenatedParametersSnapshot = `import { z } from "zod";
// Endpoints
export const endpoints = [
  {
    method: "post",
    path: "/pet/{owner_name-id}",
    requestFormat: "json",
    parameters: [
      {
        name: "owner_name-id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.boolean(),
    errors: [],
    responses: {
      200: {
        schema: z.boolean(),
        description: "Successful operation",
      },
    },
    request: {
      pathParams: z.object({
        "owner_name-id": z.string(),
      }),
    },
    alias: "postpetowner_nameid",
  },
  {
    method: "post",
    path: "/pet/{owner_name}",
    requestFormat: "json",
    parameters: [
      {
        name: "owner_name",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.boolean(),
    errors: [],
    responses: {
      200: {
        schema: z.boolean(),
        description: "Successful operation",
      },
    },
    request: {
      pathParams: z.object({
        owner_name: z.string(),
      }),
    },
    alias: "postpetowner_name",
  },
  {
    method: "post",
    path: "/pet/{pet-id}/uploadImage",
    requestFormat: "json",
    parameters: [
      {
        name: "pet-id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.boolean(),
    errors: [],
    responses: {
      200: {
        schema: z.boolean(),
        description: "Successful operation",
      },
    },
    request: {
      pathParams: z.object({
        "pet-id": z.string(),
      }),
    },
    alias: "postpetpetiduploadImage",
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: "post_pet_owner_name_id",
      description: "POST /pet/{owner_name-id}",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "object",
            properties: { ownerNameId: { type: "string" } },
            required: ["ownerNameId"],
          },
        },
        required: ["path"],
      },
      outputSchema: {
        type: "object",
        properties: { value: { type: "boolean" } },
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "post",
      path: "/pet/{owner_name-id}",
      originalPath: "/pet/{owner_name-id}",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: "post_pet_owner_name",
      description: "POST /pet/{owner_name}",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "object",
            properties: { ownerName: { type: "string" } },
            required: ["ownerName"],
          },
        },
        required: ["path"],
      },
      outputSchema: {
        type: "object",
        properties: { value: { type: "boolean" } },
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "post",
      path: "/pet/{owner_name}",
      originalPath: "/pet/{owner_name}",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
  {
    tool: {
      name: "post_pet_pet_id_upload_image",
      description: "POST /pet/{pet-id}/uploadImage",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "object",
            properties: { petId: { type: "string" } },
            required: ["petId"],
          },
        },
        required: ["path"],
      },
      outputSchema: {
        type: "object",
        properties: { value: { type: "boolean" } },
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "post",
      path: "/pet/{pet-id}/uploadImage",
      originalPath: "/pet/{pet-id}/uploadImage",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
] as const;
` as const;
