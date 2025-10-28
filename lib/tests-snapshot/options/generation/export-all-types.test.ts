import type { SchemaObject, SchemasObject } from 'openapi3-ts/oas30';
import { describe, expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/generateZodClientFromOpenAPI.js';
import { getZodClientTemplateContext } from '../../../src/template-context.js';

const makeOpenApiDoc = (schemas: SchemasObject, responseSchema: SchemaObject) => ({
  openapi: '3.0.3',
  info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
  paths: {
    '/example': {
      get: {
        operationId: 'getExample',
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: responseSchema } } },
        },
      },
    },
  },
  components: { schemas },
});

describe('export-all-types', () => {
  test('shouldExportAllTypes option, non-circular types are exported', async () => {
    const Playlist = {
      allOf: [
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            author: { $ref: '#/components/schemas/Author' },
            songs: { type: 'array', items: { $ref: '#/components/schemas/Song' } },
          },
        },
        {
          $ref: '#/components/schemas/Settings',
        },
      ],
    } as SchemaObject;

    const Song = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        duration: { type: 'number' },
      },
    } as SchemaObject;

    const Title = {
      type: 'string',
      minLength: 1,
      maxLength: 30,
    } as SchemaObject;

    const Id = {
      type: 'number',
    } as SchemaObject;

    const Features = {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    } as SchemaObject;

    const Author = {
      type: 'object',
      properties: {
        name: { nullable: true, oneOf: [{ type: 'string', nullable: true }, { type: 'number' }] },
        title: {
          $ref: '#/components/schemas/Title',
        },
        id: {
          $ref: '#/components/schemas/Id',
        },
        mail: { type: 'string' },
        settings: { $ref: '#/components/schemas/Settings' },
      },
    } as SchemaObject;

    const Settings = {
      type: 'object',
      properties: {
        theme_color: { type: 'string' },
        features: {
          $ref: '#/components/schemas/Features',
        },
      },
    } as SchemaObject;
    const schemas = { Playlist, Song, Author, Settings, Title, Id, Features };

    const RootSchema = {
      type: 'object',
      properties: {
        playlist: { $ref: '#/components/schemas/Playlist' },
        by_author: { $ref: '#/components/schemas/Author' },
      },
    } as SchemaObject;

    const openApiDoc = makeOpenApiDoc(schemas, RootSchema);

    const data = getZodClientTemplateContext(openApiDoc, { shouldExportAllTypes: true });

    expect(data).toEqual({
      schemas: {
        Settings:
          'z.object({ theme_color: z.string(), features: Features.min(1) }).partial().passthrough()',
        Author:
          'z.object({ name: z.union([z.string(), z.number()]).nullable(), title: Title.min(1).max(30), id: Id, mail: z.string(), settings: Settings }).partial().passthrough()',
        Features: 'z.array(z.string())',
        Song: 'z.object({ name: z.string(), duration: z.number() }).partial().passthrough()',
        Playlist:
          'z.object({ name: z.string(), author: Author, songs: z.array(Song) }).partial().passthrough().and(Settings)',
        Title: 'z.string()',
        Id: 'z.number()',
      },
      endpoints: [
        {
          method: 'get',
          path: '/example',
          requestFormat: 'json',
          description: undefined,
          parameters: [],
          errors: [],
          response: 'z.object({ playlist: Playlist, by_author: Author }).partial().passthrough()',
        },
      ],
      types: {
        Author:
          'type Author = Partial<{ name: (string | null | number) | null; title: Title; id: Id; mail: string; settings: Settings }>;',
        Playlist:
          'type Playlist = Partial<{ name: string; author: Author; songs: Array<Song> }> & Settings;',
        Settings: 'type Settings = Partial<{ theme_color: string; features: Features }>;',
        Song: 'type Song = Partial<{ name: string; duration: number }>;',
        Features: 'type Features = Array<string>;',
        Id: 'type Id = number;',
        Title: 'type Title = string;',
      },
      circularTypeByName: {},
      endpointsGroups: {},
      emittedType: {
        Author: true,
        Settings: true,
        Playlist: true,
        Song: true,
      },
      options: {
        withAlias: false,
        baseUrl: '',
      },
    });

    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: {
        shouldExportAllTypes: true,
      },
    });
    expect(prettyOutput).toMatchInlineSnapshot(`
      "import { z } from "zod";

      type Playlist = Partial<{ name: string; author: Author; songs: Array<Song> }> &
        Settings;
      type Author = Partial<{
        name: (string | null | number) | null;
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
          name: z.union([z.string(), z.number()]).nullable(),
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
