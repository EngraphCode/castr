import type { SchemaObject, SchemasObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/rendering/index.js';
import { getZodClientTemplateContext } from '../../../src/context/index.js';
import { exportAllTypesSnapshot } from '../../__fixtures__/options/generation/export-all-types.js';

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

    // Exclude _ir field from comparison (internal implementation detail)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- _ir intentionally excluded from snapshot
    const { _ir, ...dataWithoutIR } = data;
    expect(dataWithoutIR).toEqual({
      schemas: {
        Settings:
          'z.object({ theme_color: z.string(), features: Features.min(1) }).partial().passthrough()',
        Author:
          'z.object({ name: z.union([z.string(), z.number()]), title: Title.min(1).max(30), id: Id, mail: z.string(), settings: Settings }).partial().passthrough()',
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
          parameters: [],
          errors: [],
          response: 'z.object({ playlist: Playlist, by_author: Author }).partial().passthrough()',
        },
      ],
      types: {
        Author:
          'type Author = Partial<{ name: string | number; title: Title; id: Id; mail: string; settings: Settings }>;',
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
      mcpTools: [
        {
          tool: {
            name: 'get_example',
            description: 'GET /example',
            inputSchema: {
              type: 'object',
            },
            outputSchema: {
              type: 'object',
              properties: {
                playlist: {
                  allOf: [
                    {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        author: {
                          type: 'object',
                          properties: {
                            name: { oneOf: [{ type: 'string' }, { type: 'number' }] },
                            title: { type: 'string', minLength: 1, maxLength: 30 },
                            id: { type: 'number' },
                            mail: { type: 'string' },
                            settings: {
                              type: 'object',
                              properties: {
                                theme_color: { type: 'string' },
                                features: {
                                  type: 'array',
                                  items: { type: 'string' },
                                  minItems: 1,
                                },
                              },
                            },
                          },
                        },
                        songs: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              duration: { type: 'number' },
                            },
                          },
                        },
                      },
                    },
                    {
                      type: 'object',
                      properties: {
                        theme_color: { type: 'string' },
                        features: {
                          type: 'array',
                          items: { type: 'string' },
                          minItems: 1,
                        },
                      },
                    },
                  ],
                },
                by_author: {
                  type: 'object',
                  properties: {
                    name: { oneOf: [{ type: 'string' }, { type: 'number' }] },
                    title: { type: 'string', minLength: 1, maxLength: 30 },
                    id: { type: 'number' },
                    mail: { type: 'string' },
                    settings: {
                      type: 'object',
                      properties: {
                        theme_color: { type: 'string' },
                        features: {
                          type: 'array',
                          items: { type: 'string' },
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
          method: 'get',
          path: '/example',
          originalPath: '/example',
          operationId: 'getExample',
          httpOperation: {
            method: 'get',
            path: '/example',
            originalPath: '/example',
            operationId: 'getExample',
          },
          security: {
            isPublic: true,
            usesGlobalSecurity: false,
            requirementSets: [],
          },
        },
      ],
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
    expect(prettyOutput).toBe(exportAllTypesSnapshot);
  });
});
