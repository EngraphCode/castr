import type { SchemaObject, SchemasObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import {
  getOpenApiDependencyGraph,
  getZodClientTemplateContext,
  getEndpointDefinitionList,
} from '../../../src/test-helpers/legacy-compat.js';
import { generateZodClientFromOpenAPI } from '../../../src/rendering/index.js';
import { topologicalSort } from '../../../src/shared/topological-sort.js';
import { asComponentSchema } from '../../../src/shared/utils/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

/**
 * Tests for recursive schema handling.
 *
 * Note: The old ConversionTypeContext and ctx parameter were removed from getZodSchema.
 * These tests now use the higher-level APIs (generateZodClientFromOpenAPI) for
 * recursive schema verification.
 */

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

    const rootSchema = schemas['Root'];
    if (!rootSchema) {
      throw new Error('Root schema not found');
    }

    const openApiDoc = makeOpenApiDoc(schemas, rootSchema);
    const depsGraph = getOpenApiDependencyGraph(
      Object.keys(schemas).map((name) => asComponentSchema(name)),
      openApiDoc,
    );
    expect(depsGraph).toMatchSnapshot();

    expect(topologicalSort(depsGraph.refsDependencyGraph)).toMatchSnapshot();

    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    assertSingleFileResult(prettyOutput);
    expect(prettyOutput.content).toMatchSnapshot();
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
    expect(getEndpointDefinitionList(makeOpenApiDoc(schemas2, ResponseSchema))).toMatchSnapshot();
  });
});

describe('recursive-schema - direct recursive', () => {
  test('should handle direct recursive schemas', async () => {
    const schemas = { User: UserSchema };
    const openApiDoc = makeOpenApiDoc(schemas, UserSchema);

    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    assertSingleFileResult(prettyOutput);
    expect(prettyOutput.content).toMatchSnapshot();
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
    assertSingleFileResult(prettyOutput);
    expect(prettyOutput.content).toMatchSnapshot();
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

    const RootSchema = {
      type: 'object',
      properties: {
        playlist: { $ref: '#/components/schemas/Playlist' },
        by_author: { $ref: '#/components/schemas/Author' },
      },
    } as SchemaObject;

    const openApiDoc = makeOpenApiDoc(schemas, RootSchema);
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    assertSingleFileResult(prettyOutput);
    expect(prettyOutput.content).toMatchSnapshot();
  });
});
