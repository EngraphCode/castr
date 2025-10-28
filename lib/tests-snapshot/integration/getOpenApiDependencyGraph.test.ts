import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas30';
import { expect, test } from 'vitest';
import { getOpenApiDependencyGraph } from '../../src/getOpenApiDependencyGraph.js';
import { topologicalSort } from '../../src/topologicalSort.js';
import { asComponentSchema } from '../../src/utils.js';

/** Helper to wrap test schemas in OpenAPIObject */
const makeTestDoc = (schemas: Record<string, SchemaObject>): OpenAPIObject => ({
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0.0' },
  paths: {},
  components: { schemas },
});

test('petstore.yaml', async () => {
  const openApiDoc = (await SwaggerParser.parse(
    './examples/swagger/petstore.yaml',
  )) as OpenAPIObject;
  const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
    Object.keys(openApiDoc.components?.schemas || {}).map((name) => asComponentSchema(name)),
    openApiDoc,
  );
  expect(result).toMatchInlineSnapshot(`
      {
          "#/components/schemas/Customer": Set {
              "#/components/schemas/Address",
          },
          "#/components/schemas/Pet": Set {
              "#/components/schemas/Category",
              "#/components/schemas/Tag",
          },
      }
    `);
  expect(topologicalSort(result)).toMatchInlineSnapshot(`
      [
          "#/components/schemas/Address",
          "#/components/schemas/Customer",
          "#/components/schemas/Category",
          "#/components/schemas/Tag",
          "#/components/schemas/Pet",
      ]
    `);
  expect(deepDependencyGraph).toMatchInlineSnapshot(`
      {
          "#/components/schemas/Customer": Set {
              "#/components/schemas/Address",
          },
          "#/components/schemas/Pet": Set {
              "#/components/schemas/Category",
              "#/components/schemas/Tag",
          },
      }
    `);
  expect(topologicalSort(deepDependencyGraph)).toMatchInlineSnapshot(`
      [
          "#/components/schemas/Address",
          "#/components/schemas/Customer",
          "#/components/schemas/Category",
          "#/components/schemas/Tag",
          "#/components/schemas/Pet",
      ]
    `);
});

test('complex relations', () => {
  const schemas = {
    Basic: { type: 'object', properties: { prop: { type: 'string' }, second: { type: 'number' } } },
    WithNested: {
      type: 'object',
      properties: { nested: { type: 'string' }, nestedRef: { $ref: 'DeepNested' } },
    },
    ObjectWithArrayOfRef: {
      type: 'object',
      properties: {
        exampleProp: { type: 'string' },
        another: { type: 'number' },
        link: { type: 'array', items: { $ref: 'WithNested' } },
        someReference: { $ref: 'Basic' },
      },
    },
    DeepNested: { type: 'object', properties: { deep: { type: 'boolean' } } },
    Root: {
      type: 'object',
      properties: {
        str: { type: 'string' },
        reference: {
          $ref: 'ObjectWithArrayOfRef',
        },
        inline: {
          type: 'object',
          properties: {
            nested_prop: { type: 'boolean' },
          },
        },
        another: { $ref: 'WithNested' },
        basic: { $ref: 'Basic' },
        differentPropSameRef: { $ref: 'Basic' },
      },
    },
  } as Record<string, SchemaObject>;

  const openApiDoc = makeTestDoc(schemas);
  const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
    Object.keys(schemas).map((name) => asComponentSchema(name)),
    openApiDoc,
  );
  expect(result).toMatchInlineSnapshot(`
    {
        "#/components/schemas/ObjectWithArrayOfRef": Set {
            "WithNested",
            "Basic",
        },
        "#/components/schemas/Root": Set {
            "ObjectWithArrayOfRef",
            "WithNested",
            "Basic",
        },
        "#/components/schemas/WithNested": Set {
            "DeepNested",
        },
        "ObjectWithArrayOfRef": Set {
            "WithNested",
            "Basic",
        },
        "WithNested": Set {
            "DeepNested",
        },
    }
  `);
  expect(topologicalSort(result)).toMatchInlineSnapshot(`
    [
        "DeepNested",
        "#/components/schemas/WithNested",
        "WithNested",
        "Basic",
        "#/components/schemas/ObjectWithArrayOfRef",
        "ObjectWithArrayOfRef",
        "#/components/schemas/Root",
    ]
  `);
  expect(deepDependencyGraph).toMatchInlineSnapshot(`
    {
        "#/components/schemas/ObjectWithArrayOfRef": Set {
            "WithNested",
            "DeepNested",
            "Basic",
        },
        "#/components/schemas/Root": Set {
            "ObjectWithArrayOfRef",
            "WithNested",
            "DeepNested",
            "Basic",
        },
        "#/components/schemas/WithNested": Set {
            "DeepNested",
        },
    }
  `);
  expect(topologicalSort(deepDependencyGraph)).toMatchInlineSnapshot(`
    [
        "DeepNested",
        "#/components/schemas/WithNested",
        "WithNested",
        "Basic",
        "#/components/schemas/ObjectWithArrayOfRef",
        "ObjectWithArrayOfRef",
        "#/components/schemas/Root",
    ]
  `);
});

test('recursive relations', () => {
  const UserWithFriends = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      parent: { $ref: 'UserWithFriends' },
      friends: { type: 'array', items: { $ref: 'Friend' } },
      bestFriend: { $ref: 'Friend' },
    },
  } as SchemaObject;

  const Friend = {
    type: 'object',
    properties: {
      nickname: { type: 'string' },
      user: { $ref: 'UserWithFriends' },
      circle: { type: 'array', items: { $ref: 'Friend' } },
    },
  } as SchemaObject;
  const schemas = { UserWithFriends, Friend } as Record<string, SchemaObject>;

  const openApiDoc = makeTestDoc(schemas);
  const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
    Object.keys(schemas).map((name) => asComponentSchema(name)),
    openApiDoc,
  );
  expect(result).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Friend": Set {
            "UserWithFriends",
            "Friend",
        },
        "#/components/schemas/UserWithFriends": Set {
            "UserWithFriends",
            "Friend",
        },
        "Friend": Set {
            "UserWithFriends",
            "Friend",
        },
        "UserWithFriends": Set {
            "UserWithFriends",
            "Friend",
        },
    }
  `);
  expect(topologicalSort(result)).toMatchInlineSnapshot(`
    [
        "Friend",
        "UserWithFriends",
        "#/components/schemas/UserWithFriends",
        "#/components/schemas/Friend",
    ]
  `);
  expect(deepDependencyGraph).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Friend": Set {
            "UserWithFriends",
            "Friend",
        },
        "#/components/schemas/UserWithFriends": Set {
            "UserWithFriends",
            "Friend",
        },
    }
  `);
  expect(topologicalSort(deepDependencyGraph)).toMatchInlineSnapshot(`
    [
        "UserWithFriends",
        "Friend",
        "#/components/schemas/UserWithFriends",
        "#/components/schemas/Friend",
    ]
  `);
});

test('recursive relations along with some basics schemas', () => {
  const schemas = {
    UserWithFriends: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        parent: { $ref: 'UserWithFriends' },
        friends: { type: 'array', items: { $ref: 'Friend' } },
        bestFriend: { $ref: 'Friend' },
        withNested: { $ref: 'WithNested' },
      },
    },
    Friend: {
      type: 'object',
      properties: {
        nickname: { type: 'string' },
        user: { $ref: 'UserWithFriends' },
        circle: { type: 'array', items: { $ref: 'Friend' } },
        basic: { $ref: 'Basic' },
      },
    },
    Basic: { type: 'object', properties: { prop: { type: 'string' }, second: { type: 'number' } } },
    WithNested: {
      type: 'object',
      properties: { nested: { type: 'string' }, nestedRef: { $ref: 'DeepNested' } },
    },
    ObjectWithArrayOfRef: {
      type: 'object',
      properties: {
        exampleProp: { type: 'string' },
        another: { type: 'number' },
        link: { type: 'array', items: { $ref: 'WithNested' } },
        someReference: { $ref: 'Basic' },
      },
    },
    DeepNested: { type: 'object', properties: { deep: { type: 'boolean' } } },
    Root: {
      type: 'object',
      properties: {
        str: { type: 'string' },
        reference: {
          $ref: 'ObjectWithArrayOfRef',
        },
        inline: {
          type: 'object',
          properties: {
            nested_prop: { type: 'boolean' },
          },
        },
        another: { $ref: 'WithNested' },
        basic: { $ref: 'Basic' },
        differentPropSameRef: { $ref: 'Basic' },
      },
    },
  } as Record<string, SchemaObject>;

  const openApiDoc = makeTestDoc(schemas);
  const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
    Object.keys(schemas).map((name) => asComponentSchema(name)),
    openApiDoc,
  );
  expect(result).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Friend": Set {
            "UserWithFriends",
            "Friend",
            "Basic",
        },
        "#/components/schemas/ObjectWithArrayOfRef": Set {
            "WithNested",
            "Basic",
        },
        "#/components/schemas/Root": Set {
            "ObjectWithArrayOfRef",
            "WithNested",
            "Basic",
        },
        "#/components/schemas/UserWithFriends": Set {
            "UserWithFriends",
            "Friend",
            "WithNested",
        },
        "#/components/schemas/WithNested": Set {
            "DeepNested",
        },
        "Friend": Set {
            "UserWithFriends",
            "Friend",
            "Basic",
        },
        "ObjectWithArrayOfRef": Set {
            "WithNested",
            "Basic",
        },
        "UserWithFriends": Set {
            "UserWithFriends",
            "Friend",
            "WithNested",
        },
        "WithNested": Set {
            "DeepNested",
        },
    }
  `);
  expect(topologicalSort(result)).toMatchInlineSnapshot(`
    [
        "Basic",
        "Friend",
        "DeepNested",
        "WithNested",
        "UserWithFriends",
        "#/components/schemas/UserWithFriends",
        "#/components/schemas/Friend",
        "#/components/schemas/WithNested",
        "#/components/schemas/ObjectWithArrayOfRef",
        "ObjectWithArrayOfRef",
        "#/components/schemas/Root",
    ]
  `);
  expect(deepDependencyGraph).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Friend": Set {
            "UserWithFriends",
            "Friend",
            "Basic",
            "WithNested",
            "DeepNested",
        },
        "#/components/schemas/ObjectWithArrayOfRef": Set {
            "WithNested",
            "DeepNested",
            "Basic",
        },
        "#/components/schemas/Root": Set {
            "ObjectWithArrayOfRef",
            "WithNested",
            "DeepNested",
            "Basic",
        },
        "#/components/schemas/UserWithFriends": Set {
            "UserWithFriends",
            "Friend",
            "Basic",
            "WithNested",
            "DeepNested",
        },
        "#/components/schemas/WithNested": Set {
            "DeepNested",
        },
    }
  `);
  expect(topologicalSort(deepDependencyGraph)).toMatchInlineSnapshot(`
    [
        "UserWithFriends",
        "Friend",
        "Basic",
        "WithNested",
        "DeepNested",
        "#/components/schemas/UserWithFriends",
        "#/components/schemas/Friend",
        "#/components/schemas/WithNested",
        "#/components/schemas/ObjectWithArrayOfRef",
        "ObjectWithArrayOfRef",
        "#/components/schemas/Root",
    ]
  `);
});
