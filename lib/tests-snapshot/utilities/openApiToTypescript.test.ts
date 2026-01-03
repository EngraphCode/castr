import { getTypescriptFromOpenApi } from '../../src/conversion/typescript/index.js';

import type { SchemaObject, SchemasObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';

const makeSchema = (schema: SchemaObject) => schema;

/**
 * Helper to convert schema to TypeScript string.
 * Options parameter is removed because TypeScript generation doesn't use options
 * (unlike Zod generation which has options like allReadonly).
 */
const getSchemaAsTsString = (schema: SchemaObject, meta?: { name: string }) => {
  const params: Parameters<typeof getTypescriptFromOpenApi>[0] = { schema: makeSchema(schema) };
  if (meta) {
    params.meta = meta;
  }
  return getTypescriptFromOpenApi(params);
};

test('getSchemaAsTsString', () => {
  expect(getSchemaAsTsString({ type: 'null' })).toMatchInlineSnapshot(`"unknown"`);
  expect(getSchemaAsTsString({ type: 'boolean' })).toMatchInlineSnapshot('"boolean"');
  expect(getSchemaAsTsString({ type: 'string' })).toMatchInlineSnapshot('"string"');
  expect(getSchemaAsTsString({ type: 'number' })).toMatchInlineSnapshot('"number"');
  expect(getSchemaAsTsString({ type: 'integer' })).toMatchInlineSnapshot('"number"');
  expect(getSchemaAsTsString({})).toMatchInlineSnapshot('"unknown"');

  expect(getSchemaAsTsString({ type: 'null' }, { name: 'nullType' })).toMatchInlineSnapshot(
    `"export type nullType = unknown;"`,
  );
  expect(getSchemaAsTsString({ type: 'boolean' }, { name: 'booleanType' })).toMatchInlineSnapshot(
    `"export type booleanType = boolean;"`,
  );
  expect(getSchemaAsTsString({ type: 'string' }, { name: 'stringType' })).toMatchInlineSnapshot(
    `"export type stringType = string;"`,
  );
  expect(getSchemaAsTsString({ type: 'number' }, { name: 'numberType' })).toMatchInlineSnapshot(
    `"export type numberType = number;"`,
  );
  expect(getSchemaAsTsString({ type: 'integer' }, { name: 'integerType' })).toMatchInlineSnapshot(
    `"export type integerType = number;"`,
  );
  expect(getSchemaAsTsString({}, { name: 'unknownType' })).toMatchInlineSnapshot(
    `"export type unknownType = unknown;"`,
  );

  expect(getSchemaAsTsString({ type: 'array', items: { type: 'string' } })).toMatchInlineSnapshot(
    `"string[]"`,
  );
  expect(getSchemaAsTsString({ type: 'object' }, { name: 'EmptyObject' })).toMatchInlineSnapshot(
    `
    "export type EmptyObject = {
    };"
  `,
  );
  expect(
    getSchemaAsTsString(
      { type: 'object', properties: { str: { type: 'string' } } },
      { name: 'BasicObject' },
    ),
  ).toMatchInlineSnapshot(`
    "export type BasicObject = {
      str?: string;
    };"
  `);
  expect(
    getSchemaAsTsString(
      { type: 'object', properties: { str: { type: 'string' }, nb: { type: 'number' } } },
      { name: 'BasicObject2' },
    ),
  ).toMatchInlineSnapshot(`
    "export type BasicObject2 = {
      str?: string;
      nb?: number;
    };"
  `);

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: { str: { type: 'string' }, nb: { type: 'number' } },
        required: ['str', 'nb'],
      },
      { name: 'AllPropertiesRequired' },
    ),
  ).toMatchInlineSnapshot(`
    "export type AllPropertiesRequired = {
      str: string;
      nb: number;
    };"
  `);
  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: { str: { type: 'string' }, nb: { type: 'number' } },
        required: ['str'],
      },
      { name: 'SomeOptionalProps' },
    ),
  ).toMatchInlineSnapshot(`
    "export type SomeOptionalProps = {
      str: string;
      nb?: number;
    };"
  `);

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: {
          str: { type: 'string' },
          nb: { type: 'number' },
          nested: {
            type: 'object',
            properties: {
              nested_prop: { type: 'boolean' },
            },
          },
        },
      },
      { name: 'ObjectWithNestedProp' },
    ),
  ).toMatchInlineSnapshot(
    `
    "export type ObjectWithNestedProp = {
      str?: string;
      nb?: number;
      nested?: {
        nested_prop?: boolean;
      };
    };"
  `,
  );

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: { str: { type: 'string' } },
        additionalProperties: { type: 'number' },
      },
      { name: 'ObjectWithAdditionalPropsNb' },
    ),
  ).toMatchInlineSnapshot(
    `
    "export type ObjectWithAdditionalPropsNb = {
      str?: string;
    };"
  `,
  );

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: { str: { type: 'string' } },
        additionalProperties: { type: 'object', properties: { prop: { type: 'boolean' } } },
      },
      { name: 'ObjectWithNestedRecordBoolean' },
    ),
  ).toMatchInlineSnapshot(
    `
    "export type ObjectWithNestedRecordBoolean = {
      str?: string;
    };"
  `,
  );

  expect(
    getSchemaAsTsString({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          str: { type: 'string' },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    "{
      str?: string;
    }[]"
  `);

  expect(
    getSchemaAsTsString({
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    }),
  ).toMatchInlineSnapshot(`"string[][]"`);

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: {
          enumprop: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
        },
      },
      { name: 'ObjectWithEnum' },
    ),
  ).toMatchInlineSnapshot(
    `
    "export type ObjectWithEnum = {
      enumprop?: string;
    };"
  `,
  );

  expect(
    getSchemaAsTsString({ type: 'string', enum: ['aaa', 'bbb', 'ccc'] }),
  ).toMatchInlineSnapshot(`"string"`);
  expect(
    getSchemaAsTsString({ type: 'string', enum: ['aaa', 'bbb', 'ccc'] }, { name: 'StringENum' }),
  ).toMatchInlineSnapshot(`"export type StringENum = string;"`);

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: {
          union: { oneOf: [{ type: 'string' }, { type: 'number' }] },
        },
      },
      { name: 'ObjectWithUnion' },
    ),
  ).toMatchInlineSnapshot(`
    "export type ObjectWithUnion = {
      union?: unknown;
    };"
  `);
  expect(
    getSchemaAsTsString({ oneOf: [{ type: 'string' }, { type: 'number' }] }),
  ).toMatchInlineSnapshot(`"unknown"`);
  expect(
    getSchemaAsTsString(
      { oneOf: [{ type: 'string' }, { type: 'number' }] },
      { name: 'StringOrNumber' },
    ),
  ).toMatchInlineSnapshot(`"export type StringOrNumber = unknown;"`);

  expect(
    getSchemaAsTsString({ allOf: [{ type: 'string' }, { type: 'number' }] }),
  ).toMatchInlineSnapshot(`"unknown"`);
  expect(
    getSchemaAsTsString(
      { allOf: [{ type: 'string' }, { type: 'number' }] },
      { name: 'StringAndNumber' },
    ),
  ).toMatchInlineSnapshot(`"export type StringAndNumber = unknown;"`);

  expect(
    getSchemaAsTsString({ anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }] }),
  ).toMatchInlineSnapshot(`"unknown"`);
  expect(
    getSchemaAsTsString({ oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }] }),
  ).toMatchInlineSnapshot(`"unknown"`);
  expect(
    getSchemaAsTsString(
      { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }] },
      { name: 'StringOrNumber' },
    ),
  ).toMatchInlineSnapshot(`"export type StringOrNumber = unknown;"`);

  expect(
    getSchemaAsTsString({ allOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }] }),
  ).toMatchInlineSnapshot(`"unknown"`);
  expect(
    getSchemaAsTsString(
      { allOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }] },
      { name: 'StringAndNumber' },
    ),
  ).toMatchInlineSnapshot(`"export type StringAndNumber = unknown;"`);
  expect(
    getSchemaAsTsString({ anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }] }),
  ).toMatchInlineSnapshot(`"unknown"`);
  expect(
    getSchemaAsTsString(
      { anyOf: [{ type: 'string' }, { type: 'number' }] },
      { name: 'StringAndNumberMaybeMultiple' },
    ),
  ).toMatchInlineSnapshot(`"export type StringAndNumberMaybeMultiple = unknown;"`);

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: {
          unionOrArrayOfUnion: { anyOf: [{ type: 'string' }, { type: 'number' }] },
        },
      },
      { name: 'ObjectWithArrayUnion' },
    ),
  ).toMatchInlineSnapshot(
    `
    "export type ObjectWithArrayUnion = {
      unionOrArrayOfUnion?: unknown;
    };"
  `,
  );

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        properties: {
          intersection: { allOf: [{ type: 'string' }, { type: 'number' }] },
        },
      },
      { name: 'ObjectWithIntersection' },
    ),
  ).toMatchInlineSnapshot(
    `
    "export type ObjectWithIntersection = {
      intersection?: unknown;
    };"
  `,
  );

  expect(
    getSchemaAsTsString({ type: 'string', enum: ['aaa', 'bbb', 'ccc'] }),
  ).toMatchInlineSnapshot(`"string"`);
  expect(getSchemaAsTsString({ type: 'number', enum: [1, 2, 3] })).toMatchInlineSnapshot(
    `"number"`,
  );

  expect(
    getSchemaAsTsString(
      {
        type: 'object',
        required: ['propNumber', 'propString', 'propBoolean'],
        properties: {
          propNumber: {
            type: ['number', 'null'],
          },
          propString: {
            type: ['string', 'null'],
          },
          propBoolean: {
            type: ['boolean', 'null'],
          },
        },
      },
      { name: 'Category' },
    ),
  ).toMatchInlineSnapshot(
    `
    "export type Category = {
      propNumber: unknown | null;
      propString: unknown | null;
      propBoolean: unknown | null;
    };"
  `,
  );
});

describe('getSchemaAsTsString with context', () => {
  test('with ref', () => {
    const schemas = {
      Root: {
        type: 'object',
        properties: {
          str: { type: 'string' },
          nb: { type: 'number' },
          nested: { $ref: '#/components/schemas/Nested' },
        },
      },
      Nested: {
        type: 'object',
        properties: {
          nested_prop: { type: 'boolean' },
        },
      },
    } as SchemasObject;

    const rootSchema = schemas['Root'];
    if (!rootSchema) {
      throw new Error("Expected 'Root' schema to exist");
    }
    expect(
      getTypescriptFromOpenApi({
        schema: rootSchema,
        meta: { name: 'Root' },
      }),
    ).toMatchInlineSnapshot(
      `
      "export type Root = {
        str?: string;
        nb?: number;
        nested?: Nested;
      };"
    `,
    );
  });

  test('with multiple nested refs', () => {
    const schemas = {
      Root2: {
        type: 'object',
        properties: {
          str: { type: 'string' },
          nb: { type: 'number' },
          nested: { $ref: '#/components/schemas/Nested2' },
        },
      },
      Nested2: {
        type: 'object',
        properties: {
          nested_prop: { type: 'boolean' },
          deeplyNested: { $ref: '#/components/schemas/DeeplyNested' },
        },
      },
      DeeplyNested: {
        type: 'array',
        items: { $ref: '#/components/schemas/VeryDeeplyNested' },
      },
      VeryDeeplyNested: {
        type: 'string',
        enum: ['aaa', 'bbb', 'ccc'],
      },
    } as SchemasObject;

    const root2Schema = schemas['Root2'];
    if (!root2Schema) {
      throw new Error("Expected 'Root2' schema to exist");
    }
    expect(
      getTypescriptFromOpenApi({
        schema: root2Schema,
        meta: { name: 'Root2' },
      }),
    ).toMatchInlineSnapshot(
      `
      "export type Root2 = {
        str?: string;
        nb?: number;
        nested?: Nested2;
      };"
    `,
    );
  });

  test('with indirect recursive ref', () => {
    const schemas = {
      Root3: {
        type: 'object',
        properties: {
          str: { type: 'string' },
          nb: { type: 'number' },
          nested: { $ref: '#/components/schemas/Nested3' },
          arrayOfNested: { type: 'array', items: { $ref: '#/components/schemas/Nested3' } },
        },
      },
      Nested3: {
        type: 'object',
        properties: {
          nested_prop: { type: 'boolean' },
          backToRoot: { $ref: '#/components/schemas/Root3' },
        },
      },
    } as SchemasObject;

    const root3Schema = schemas['Root3'];
    if (!root3Schema) {
      throw new Error("Expected 'Root3' schema to exist");
    }
    expect(
      getTypescriptFromOpenApi({
        schema: root3Schema,
        meta: { name: 'Root3', $ref: '#/components/schemas/Root3' },
      }),
    ).toMatchInlineSnapshot(
      `
      "export type Root3 = {
        str?: string;
        nb?: number;
        nested?: Nested3;
        arrayOfNested?: Nested3[];
      };"
    `,
    );
  });

  test('with direct (self) recursive ref', () => {
    const schemas = {
      Root4: {
        type: 'object',
        properties: {
          str: { type: 'string' },
          nb: { type: 'number' },
          self: { $ref: '#/components/schemas/Root4' },
          nested: { $ref: '#/components/schemas/Nested4' },
          arrayOfSelf: { type: 'array', items: { $ref: '#/components/schemas/Root4' } },
        },
      },
      Nested4: {
        type: 'object',
        properties: {
          nested_prop: { type: 'boolean' },
          backToRoot: { $ref: '#/components/schemas/Root4' },
        },
      },
    } as SchemasObject;

    const root4Schema = schemas['Root4'];
    if (!root4Schema) {
      throw new Error("Expected 'Root4' schema to exist");
    }
    const result = getTypescriptFromOpenApi({
      schema: root4Schema,
      meta: { name: 'Root4', $ref: '#/components/schemas/Root4' },
    });

    expect(result).toMatchInlineSnapshot(
      `
      "export type Root4 = {
        str?: string;
        nb?: number;
        self?: Root4;
        nested?: Nested4;
        arrayOfSelf?: Root4[];
      };"
    `,
    );
  });

  test('same schemas as openApiToZod', () => {
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
      throw new Error("Expected 'Root' schema to exist");
    }
    const result = getTypescriptFromOpenApi({
      schema: rootSchema,
      meta: { name: 'Root', $ref: '#/components/schemas/Root' },
    });

    expect(result).toMatchInlineSnapshot(
      `
      "export type Root = {
        recursive?: User;
        basic?: number;
      };"
    `,
    );
  });

  test('anyOf with refs', () => {
    const schemas = {
      User: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
      Member: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
      Root: {
        type: 'object',
        properties: {
          user: {
            oneOf: [{ $ref: '#/components/schemas/User' }, { $ref: '#/components/schemas/Member' }],
          },
          users: {
            type: 'array',
            items: {
              anyOf: [
                { $ref: '#/components/schemas/User' },
                { $ref: '#/components/schemas/Member' },
              ],
            },
          },
          basic: { type: 'number' },
        },
      },
    } as SchemasObject;

    const rootSchema = schemas['Root'];
    if (!rootSchema) {
      throw new Error("Expected 'Root' schema to exist");
    }
    const result = getTypescriptFromOpenApi({
      schema: rootSchema,
      meta: { name: 'Root', $ref: '#/components/schemas/Root' },
    });

    expect(result).toMatchInlineSnapshot(
      `
      "export type Root = {
        user?: unknown;
        users?: unknown[];
        basic?: number;
      };"
    `,
    );
  });
});

/**
 * Tests for $ref resolution in TypeScript output.
 *
 * These tests verify that schemas with $ref produce the correct type name.
 * Note: The type name is extracted directly from the $ref string path,
 * NOT by looking up the referenced schema in a document context.
 * This is intentional - TypeScript output just needs the type name reference.
 */
describe('getTypescriptFromOpenApi $ref handling', () => {
  test('$ref should resolve to component type name', () => {
    const schemaWithRef = { $ref: '#/components/schemas/Pet' };

    const result = getTypescriptFromOpenApi({
      schema: schemaWithRef,
      meta: { name: 'PetRef' },
    });

    // Should output "Pet" as the type name (extracted from $ref path)
    expect(result).toContain('Pet');
  });

  test('nested $ref in properties should resolve to type name', () => {
    const userSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { $ref: '#/components/schemas/Address' },
      },
    } as const;

    const result = getTypescriptFromOpenApi({
      schema: userSchema,
      meta: { name: 'User' },
    });

    // address property should be typed as "Address" (from $ref path)
    expect(result).toContain('Address');
  });
});
