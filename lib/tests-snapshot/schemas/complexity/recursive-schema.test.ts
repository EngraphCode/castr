import type { SchemaObject, SchemasObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import {
  getOpenApiDependencyGraph,
  getZodClientTemplateContext,
  getEndpointDefinitionList,
  getZodSchema,
} from '../../../src/index.js';
import { generateZodClientFromOpenAPI } from '../../../src/rendering/index.js';
import { topologicalSort } from '../../../src/shared/topological-sort.js';
import type { ConversionTypeContext } from '../../../src/conversion/zod/index.js';
import { asComponentSchema } from '../../../src/shared/utils/index.js';

// Note: Recursive inline response/param schemas are a potential future enhancement

function createExamplePath(responseSchema: SchemaObject) {
  return {
    '/example': {
      get: {
        operationId: 'getExample',
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: responseSchema } } },
        },
      },
    },
  };
}

function makeOpenApiDoc(schemas: SchemasObject, responseSchema: SchemaObject) {
  return {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: createExamplePath(responseSchema),
    components: { schemas },
  };
}

const UserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    parent: { $ref: '#/components/schemas/User' },
  },
} as SchemaObject;

describe('recursive-schema - indirect single recursive', () => {
  test('should handle indirect single recursive schemas', async () => {
    const schemas = {
      User: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          middle: { $ref: '#/components/schemas/Middle' },
        },
      },
      Middle: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Root: {
        type: 'object',
        properties: {
          recursive: {
            $ref: '#/components/schemas/User',
          },
          basic: { type: 'number' },
        },
      },
    } as SchemasObject;
    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      doc,
    };
    const rootSchema = schemas['Root'];
    if (!rootSchema) {
      throw new Error('Root schema not found');
    }
    expect(getZodSchema({ schema: rootSchema, ctx })).toMatchSnapshot();
    expect(ctx).toMatchSnapshot();

    const openApiDoc = makeOpenApiDoc(schemas, rootSchema);
    const depsGraph = getOpenApiDependencyGraph(
      Object.keys(ctx.zodSchemaByName).map((name) => asComponentSchema(name)),
      ctx.doc,
    );
    expect(depsGraph).toMatchSnapshot();

    expect(topologicalSort(depsGraph.refsDependencyGraph)).toMatchSnapshot();

    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});

const ObjectWithRecursiveArray = {
  type: 'object',
  properties: {
    isInsideObjectWithRecursiveArray: { type: 'boolean' },
    array: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/ObjectWithRecursiveArray',
      },
    },
  },
} as SchemaObject;

describe('recursive-schema - recursive array', () => {
  const schemas2 = { ObjectWithRecursiveArray };
  const ResponseSchema = {
    type: 'object',
    properties: {
      recursiveRef: {
        $ref: '#/components/schemas/ObjectWithRecursiveArray',
      },
      basic: { type: 'number' },
    },
  } as SchemaObject;

  test('should handle recursive array schemas', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas: schemas2 },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      doc,
    };
    expect(getZodSchema({ schema: ResponseSchema, ctx })).toMatchSnapshot();
    expect(ctx).toMatchSnapshot();

    expect(getEndpointDefinitionList(makeOpenApiDoc(schemas2, ResponseSchema))).toMatchSnapshot();
  });
});

describe('recursive-schema - direct recursive', () => {
  test('should handle direct recursive schemas', () => {
    const schemas = { User: UserSchema };
    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      doc,
    };
    expect(getZodSchema({ schema: UserSchema, ctx })).toMatchSnapshot();
    expect(ctx).toMatchSnapshot();
  });
});

const UserWithFriends = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    parent: { $ref: '#/components/schemas/UserWithFriends' },
    friends: { type: 'array', items: { $ref: '#/components/schemas/Friend' } },
    bestFriend: { $ref: '#/components/schemas/Friend' },
  },
} as SchemaObject;

const Friend = {
  type: 'object',
  properties: {
    nickname: { type: 'string' },
    user: { $ref: '#/components/schemas/UserWithFriends' },
    circle: { type: 'array', items: { $ref: '#/components/schemas/Friend' } },
  },
} as SchemaObject;

describe('recursive-schema - multiple recursive in one root schema', () => {
  test('should handle multiple recursive references in one root schema', async () => {
    const schemas = {
      User: UserSchema,
      UserWithFriends,
      Friend,
      ResponseSchema: {
        type: 'object' as const,
        properties: {
          recursiveRef: {
            $ref: '#/components/schemas/ObjectWithRecursiveArray',
          },
          basic: { type: 'number' as const },
        },
      } as SchemaObject,
      ObjectWithRecursiveArray,
    };
    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      doc,
    };
    expect(
      getZodSchema({
        schema: {
          type: 'object',
          properties: {
            recursiveUser: {
              $ref: '#/components/schemas/UserWithFriends',
            },
            basic: { type: 'number' },
          },
        },
        ctx,
      }),
    ).toMatchSnapshot();
    expect(ctx).toMatchSnapshot();

    const openApiDoc = makeOpenApiDoc(schemas, {
      type: 'object',
      properties: {
        someUser: {
          $ref: '#/components/schemas/UserWithFriends',
        },
        someProp: { type: 'boolean' },
      },
    });

    expect(getEndpointDefinitionList(openApiDoc)).toMatchSnapshot();

    const templateCtx = getZodClientTemplateContext(openApiDoc);
    expect(templateCtx).toMatchSnapshot();

    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});

describe('recursive-schema - with ref to simple schema', () => {
  test('should generate simple schema and dependencies when recursive schema has $ref to it', async () => {
    const Playlist = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        author: { $ref: '#/components/schemas/Author' },
        songs: { type: 'array', items: { $ref: '#/components/schemas/Song' } },
      },
    } as SchemaObject;

    const Song = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        duration: { type: 'number' },
        in_playlists: { type: 'array', items: { $ref: '#/components/schemas/Playlist' } },
      },
    } as SchemaObject;

    const Author = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        mail: { type: 'string' },
        settings: { $ref: '#/components/schemas/Settings' },
      },
    } as SchemaObject;
    const Settings = {
      type: 'object',
      properties: {
        theme_color: { type: 'string' },
      },
    } as SchemaObject;
    const schemas = { Playlist, Song, Author, Settings };

    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      doc,
    };

    const RootSchema = {
      type: 'object',
      properties: {
        playlist: { $ref: '#/components/schemas/Playlist' },
        by_author: { $ref: '#/components/schemas/Author' },
      },
    } as SchemaObject;
    expect(getZodSchema({ schema: RootSchema, ctx })).toMatchSnapshot();
    expect(ctx).toMatchSnapshot();

    const openApiDoc = makeOpenApiDoc(schemas, RootSchema);
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});
