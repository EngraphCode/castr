import { prepareOpenApiDocument } from '../../src/shared/prepare-openapi-document.js';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import {
  getOpenApiDependencyGraph,
  topologicalSort,
} from '../../src/shared/dependency-graph/index.js';
import { asComponentSchema } from '../../src/shared/utils/index.js';

/** Helper to wrap test schemas in OpenAPIObject */
const makeTestDoc = (schemas: Record<string, SchemaObject>): OpenAPIObject => ({
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0.0' },
  paths: {},
  components: { schemas },
});

test('petstore.yaml', async () => {
  const openApiDoc = await prepareOpenApiDocument('./examples/swagger/petstore.yaml');
  const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
    Object.keys(openApiDoc.components?.schemas || {}).map((name) => asComponentSchema(name)),
    openApiDoc,
  );
  expect(result).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Address": Set {},
        "#/components/schemas/ApiResponse": Set {},
        "#/components/schemas/Category": Set {},
        "#/components/schemas/Customer": Set {
            "#/components/schemas/Address",
        },
        "#/components/schemas/Order": Set {},
        "#/components/schemas/Pet": Set {
            "#/components/schemas/Category",
            "#/components/schemas/Tag",
        },
        "#/components/schemas/Tag": Set {},
        "#/components/schemas/User": Set {},
    }
  `);
  expect(topologicalSort(result)).toMatchInlineSnapshot(`
    [
        "#/components/schemas/Order",
        "#/components/schemas/Address",
        "#/components/schemas/Customer",
        "#/components/schemas/Category",
        "#/components/schemas/User",
        "#/components/schemas/Tag",
        "#/components/schemas/Pet",
        "#/components/schemas/ApiResponse",
    ]
  `);
  expect(deepDependencyGraph).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Address": Set {},
        "#/components/schemas/ApiResponse": Set {},
        "#/components/schemas/Category": Set {},
        "#/components/schemas/Customer": Set {
            "#/components/schemas/Address",
        },
        "#/components/schemas/Order": Set {},
        "#/components/schemas/Pet": Set {
            "#/components/schemas/Category",
            "#/components/schemas/Tag",
        },
        "#/components/schemas/Tag": Set {},
        "#/components/schemas/User": Set {},
    }
  `);
  expect(topologicalSort(deepDependencyGraph)).toMatchInlineSnapshot(`
    [
        "#/components/schemas/Order",
        "#/components/schemas/Address",
        "#/components/schemas/Customer",
        "#/components/schemas/Category",
        "#/components/schemas/User",
        "#/components/schemas/Tag",
        "#/components/schemas/Pet",
        "#/components/schemas/ApiResponse",
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
        "#/components/schemas/Basic": Set {},
        "#/components/schemas/DeepNested": Set {},
        "#/components/schemas/ObjectWithArrayOfRef": Set {
            "#/components/schemas/WithNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/Root": Set {
            "#/components/schemas/ObjectWithArrayOfRef",
            "#/components/schemas/WithNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/WithNested": Set {
            "#/components/schemas/DeepNested",
        },
    }
  `);
  expect(topologicalSort(result)).toMatchInlineSnapshot(`
    [
        "#/components/schemas/Basic",
        "#/components/schemas/DeepNested",
        "#/components/schemas/WithNested",
        "#/components/schemas/ObjectWithArrayOfRef",
        "#/components/schemas/Root",
    ]
  `);
  expect(deepDependencyGraph).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Basic": Set {},
        "#/components/schemas/DeepNested": Set {},
        "#/components/schemas/ObjectWithArrayOfRef": Set {
            "#/components/schemas/WithNested",
            "#/components/schemas/DeepNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/Root": Set {
            "#/components/schemas/ObjectWithArrayOfRef",
            "#/components/schemas/WithNested",
            "#/components/schemas/DeepNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/WithNested": Set {
            "#/components/schemas/DeepNested",
        },
    }
  `);
  expect(topologicalSort(deepDependencyGraph)).toMatchInlineSnapshot(`
    [
        "#/components/schemas/Basic",
        "#/components/schemas/DeepNested",
        "#/components/schemas/WithNested",
        "#/components/schemas/ObjectWithArrayOfRef",
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
            "#/components/schemas/UserWithFriends",
            "#/components/schemas/Friend",
        },
        "#/components/schemas/UserWithFriends": Set {
            "#/components/schemas/UserWithFriends",
            "#/components/schemas/Friend",
        },
    }
  `);
  expect(topologicalSort(result)).toMatchInlineSnapshot(`
    [
        "#/components/schemas/Friend",
        "#/components/schemas/UserWithFriends",
    ]
  `);
  expect(deepDependencyGraph).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Friend": Set {
            "#/components/schemas/UserWithFriends",
            "#/components/schemas/Friend",
        },
        "#/components/schemas/UserWithFriends": Set {
            "#/components/schemas/UserWithFriends",
            "#/components/schemas/Friend",
        },
    }
  `);
  expect(topologicalSort(deepDependencyGraph)).toMatchInlineSnapshot(`
    [
        "#/components/schemas/Friend",
        "#/components/schemas/UserWithFriends",
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
        "#/components/schemas/Basic": Set {},
        "#/components/schemas/DeepNested": Set {},
        "#/components/schemas/Friend": Set {
            "#/components/schemas/UserWithFriends",
            "#/components/schemas/Friend",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/ObjectWithArrayOfRef": Set {
            "#/components/schemas/WithNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/Root": Set {
            "#/components/schemas/ObjectWithArrayOfRef",
            "#/components/schemas/WithNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/UserWithFriends": Set {
            "#/components/schemas/UserWithFriends",
            "#/components/schemas/Friend",
            "#/components/schemas/WithNested",
        },
        "#/components/schemas/WithNested": Set {
            "#/components/schemas/DeepNested",
        },
    }
  `);
  expect(topologicalSort(result)).toMatchInlineSnapshot(`
    [
        "#/components/schemas/Basic",
        "#/components/schemas/Friend",
        "#/components/schemas/DeepNested",
        "#/components/schemas/WithNested",
        "#/components/schemas/UserWithFriends",
        "#/components/schemas/ObjectWithArrayOfRef",
        "#/components/schemas/Root",
    ]
  `);
  expect(deepDependencyGraph).toMatchInlineSnapshot(`
    {
        "#/components/schemas/Basic": Set {},
        "#/components/schemas/DeepNested": Set {},
        "#/components/schemas/Friend": Set {
            "#/components/schemas/UserWithFriends",
            "#/components/schemas/Friend",
            "#/components/schemas/WithNested",
            "#/components/schemas/DeepNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/ObjectWithArrayOfRef": Set {
            "#/components/schemas/WithNested",
            "#/components/schemas/DeepNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/Root": Set {
            "#/components/schemas/ObjectWithArrayOfRef",
            "#/components/schemas/WithNested",
            "#/components/schemas/DeepNested",
            "#/components/schemas/Basic",
        },
        "#/components/schemas/UserWithFriends": Set {
            "#/components/schemas/UserWithFriends",
            "#/components/schemas/Friend",
            "#/components/schemas/Basic",
            "#/components/schemas/WithNested",
            "#/components/schemas/DeepNested",
        },
        "#/components/schemas/WithNested": Set {
            "#/components/schemas/DeepNested",
        },
    }
  `);
  expect(topologicalSort(deepDependencyGraph)).toMatchInlineSnapshot(`
    [
        "#/components/schemas/DeepNested",
        "#/components/schemas/WithNested",
        "#/components/schemas/Basic",
        "#/components/schemas/Friend",
        "#/components/schemas/UserWithFriends",
        "#/components/schemas/ObjectWithArrayOfRef",
        "#/components/schemas/Root",
    ]
  `);
});
