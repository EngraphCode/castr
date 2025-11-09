export const hyphenatedParametersSnapshot = `import { z } from "zod";

export const endpoints = [
  {
    method: "post" as const,
    path: "/pet/:ownerName",
    operationId: "postPetOwnerName",
    request: { pathParams: z.object({ ownerName: z.string() }) },
    responses: {
      200: { description: "Successful operation", schema: z.boolean() },
    },
  },
  {
    method: "post" as const,
    path: "/pet/:ownerNameId",
    operationId: "postPetOwnerNameId",
    request: { pathParams: z.object({ ownerNameId: z.string() }) },
    responses: {
      200: { description: "Successful operation", schema: z.boolean() },
    },
  },
  {
    method: "post" as const,
    path: "/pet/:petId/uploadImage",
    operationId: "postPetPetIdUploadImage",
    request: { pathParams: z.object({ petId: z.string() }) },
    responses: {
      200: { description: "Successful operation", schema: z.boolean() },
    },
  },
] as const;

/**
 * MCP (Model Context Protocol) tool metadata derived from the OpenAPI document.
 *
 * Each entry provides:
 * - \`tool\`: JSON Schema Draft 07 compliant tool definition (name, description, annotations, schemas)
 * - \`httpOperation\`: source HTTP metadata (method, templated path, original path, operationId)
 * - \`security\`: upstream API security requirements (Layer 2 metadata only)
 *
 * Use \`tool\` when wiring into the MCP SDK, and \`httpOperation\`/\`security\` when presenting
 * additional context to operators or logging.
 */
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
      method: "post" as const,
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
      method: "post" as const,
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
      method: "post" as const,
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
