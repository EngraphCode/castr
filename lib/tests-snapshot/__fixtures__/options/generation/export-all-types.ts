export const exportAllTypesSnapshot = `import { z } from "zod";

type Playlist = Partial<{ name: string; author: Author; songs: Array<Song> }> &
  Settings;
type Author = Partial<{
  name: (string | null) | null | number;
  title: Title;
  id: Id;
  mail: string;
  settings: Settings;
}>;
type Title = string;
type Id = number;
type Settings = Partial<{ theme_color: string; features: Features }>;
type Features = Array<string>;
type Song = Partial<{ name: string; duration: number }>;

export const Title = z.string();
export const Id = z.number();
export const Features = z.array(z.string());
export const Settings: z.ZodType<Settings> = z
  .object({ theme_color: z.string(), features: Features.min(1) })
  .partial()
  .strict();
export const Author: z.ZodType<Author> = z
  .object({
    name: z.union([z.union([z.string(), z.null()]), z.number()]),
    title: Title.min(1).max(30),
    id: Id,
    mail: z.string(),
    settings: Settings,
  })
  .partial()
  .strict();
export const Song: z.ZodType<Song> = z
  .object({ name: z.string(), duration: z.number() })
  .partial()
  .strict();
export const Playlist: z.ZodType<Playlist> = z
  .object({ name: z.string(), author: Author, songs: z.array(Song) })
  .partial()
  .strict()
  .and(Settings);

export const endpoints = [
  {
    method: "get" as const,
    path: "/example",
    operationId: "getExample",
    request: {},
    responses: {
      200: {
        description: "OK",
        schema: z
          .object({ playlist: Playlist, by_author: Author })
          .partial()
          .strict(),
      },
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
      name: "get_example",
      description: "GET /example",
      inputSchema: {
        type: "object",
      },
      outputSchema: {
        type: "object",
        properties: {
          playlist: {
            allOf: [
              {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  author: {
                    type: "object",
                    properties: {
                      name: {
                        oneOf: [
                          {
                            anyOf: [
                              {
                                type: "string",
                              },
                              {
                                type: "null",
                              },
                            ],
                          },
                          {
                            type: "number",
                          },
                        ],
                      },
                      title: {
                        type: "string",
                        minLength: 1,
                        maxLength: 30,
                      },
                      id: {
                        type: "number",
                      },
                      mail: {
                        type: "string",
                      },
                      settings: {
                        type: "object",
                        properties: {
                          theme_color: {
                            type: "string",
                          },
                          features: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                            minItems: 1,
                          },
                        },
                      },
                    },
                  },
                  songs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                        },
                        duration: {
                          type: "number",
                        },
                      },
                    },
                  },
                },
              },
              {
                type: "object",
                properties: {
                  theme_color: {
                    type: "string",
                  },
                  features: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    minItems: 1,
                  },
                },
              },
            ],
          },
          by_author: {
            type: "object",
            properties: {
              name: {
                oneOf: [
                  {
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                  {
                    type: "number",
                  },
                ],
              },
              title: {
                type: "string",
                minLength: 1,
                maxLength: 30,
              },
              id: {
                type: "number",
              },
              mail: {
                type: "string",
              },
              settings: {
                type: "object",
                properties: {
                  theme_color: {
                    type: "string",
                  },
                  features: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    minItems: 1,
                  },
                },
              },
            },
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
      method: "get" as const,
      path: "/example",
      originalPath: "/example",
      operationId: "getExample",
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  },
] as const;
` as const;
