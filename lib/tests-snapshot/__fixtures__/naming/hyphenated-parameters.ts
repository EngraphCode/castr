export const hyphenatedParametersSnapshot = `import { z } from "zod";
// Endpoints
export const endpoints = [
  {
    method: "post",
    path: "/pet/:ownerName",
    requestFormat: "json",
    parameters: [
      {
        name: "ownerName",
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
      pathParams: z.object({ ownerName: z.string() }),
    },
    alias: "postPetOwnerName",
  },
  {
    method: "post",
    path: "/pet/:ownerNameId",
    requestFormat: "json",
    parameters: [
      {
        name: "ownerNameId",
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
      pathParams: z.object({ ownerNameId: z.string() }),
    },
    alias: "postPetOwnerNameId",
  },
  {
    method: "post",
    path: "/pet/:petId/uploadImage",
    requestFormat: "json",
    parameters: [
      {
        name: "petId",
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
      pathParams: z.object({ petId: z.string() }),
    },
    alias: "postPetPetIdUploadImage",
  },
] as const;
// MCP Tools
export const mcpTools = [
  {
    tool: {
      name: "post_pet_owner_name",
      description: "POST /pet/{owner_name}",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "object",
            properties: {
              ownerName: {
                type: "string",
              },
            },
            required: ["ownerName"],
          },
        },
        required: ["path"],
      },
      outputSchema: {
        type: "object",
        properties: {
          value: {
            type: "boolean",
          },
        },
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "post",
      path: "/pet/:ownerName",
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
      name: "post_pet_owner_name_id",
      description: "POST /pet/{owner_name-id}",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "object",
            properties: {
              ownerNameId: {
                type: "string",
              },
            },
            required: ["ownerNameId"],
          },
        },
        required: ["path"],
      },
      outputSchema: {
        type: "object",
        properties: {
          value: {
            type: "boolean",
          },
        },
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "post",
      path: "/pet/:ownerNameId",
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
      name: "post_pet_pet_id_upload_image",
      description: "POST /pet/{pet-id}/uploadImage",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "object",
            properties: {
              petId: {
                type: "string",
              },
            },
            required: ["petId"],
          },
        },
        required: ["path"],
      },
      outputSchema: {
        type: "object",
        properties: {
          value: {
            type: "boolean",
          },
        },
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    httpOperation: {
      method: "post",
      path: "/pet/:petId/uploadImage",
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
