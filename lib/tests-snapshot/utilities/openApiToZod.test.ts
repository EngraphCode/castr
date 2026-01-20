import type { SchemaObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { getZodSchema } from '../../src/conversion/zod/index.js';

/**
 * Tests for OpenAPI to Zod schema conversion.
 *
 * Note: The old CodeMetaData and ConversionTypeContext types were removed.
 * The meta and ctx parameters are no longer supported in getZodSchema.
 * These tests now use the simplified API that only accepts { schema }.
 */
const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsZodString = (schema: SchemaObject) =>
  getZodSchema({ schema: makeSchema(schema) }).code;

test('getSchemaAsZodString', () => {
  expect(getSchemaAsZodString({ type: 'null' })).toMatchInlineSnapshot(`"z.null()"`);
  expect(
    getSchemaAsZodString({ type: 'null', enum: ['Dogs', 'Cats', 'Mice'] }),
  ).toMatchInlineSnapshot(`"z.enum(["Dogs", "Cats", "Mice"])"`);
  expect(getSchemaAsZodString({ type: 'boolean' })).toMatchInlineSnapshot(`"z.boolean()"`);
  expect(getSchemaAsZodString({ type: 'string' })).toMatchInlineSnapshot(`"z.string()"`);
  expect(getSchemaAsZodString({ type: 'number' })).toMatchInlineSnapshot(`"z.number()"`);
  expect(getSchemaAsZodString({ type: 'integer' })).toMatchInlineSnapshot(`"z.int()"`);

  expect(getSchemaAsZodString({ type: 'array', items: { type: 'string' } })).toMatchInlineSnapshot(
    `"z.array(z.string())"`,
  );
  expect(getSchemaAsZodString({ type: 'object' })).toMatchInlineSnapshot(
    `
    "z.object({
    }).passthrough()"
  `,
  );
  expect(getSchemaAsZodString({ type: 'object', properties: { str: { type: 'string' } } }))
    .toMatchInlineSnapshot(`
      "z.object({
        str: z.string().optional(),
      }).passthrough()"
    `);

  expect(getSchemaAsZodString({ type: 'object', properties: { nb: { type: 'integer' } } }))
    .toMatchInlineSnapshot(`
      "z.object({
        nb: z.int().optional(),
      }).passthrough()"
    `);

  expect(
    getSchemaAsZodString({ type: 'object', properties: { pa: { type: 'number', minimum: 0 } } }),
  ).toMatchInlineSnapshot(`
    "z.object({
      pa: z.number().min(0).optional(),
    }).passthrough()"
  `);

  expect(
    getSchemaAsZodString({
      type: 'object',
      properties: { pa: { type: 'number', minimum: 0, maximum: 100 } },
    }),
  ).toMatchInlineSnapshot(`
    "z.object({
      pa: z.number().min(0).max(100).optional(),
    }).passthrough()"
  `);

  expect(
    getSchemaAsZodString({ type: 'object', properties: { ml: { type: 'string', minLength: 0 } } }),
  ).toMatchInlineSnapshot(`
    "z.object({
      ml: z.string().min(0).optional(),
    }).passthrough()"
  `);

  expect(
    getSchemaAsZodString({
      type: 'object',
      properties: { dt: { type: 'string', format: 'date-time' } },
    }),
  ).toMatchInlineSnapshot(`
    "z.object({
      dt: z.iso.datetime().optional(),
    }).passthrough()"
  `);

  expect(
    getSchemaAsZodString({
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
    }),
  ).toMatchInlineSnapshot(`
    "z.object({
      str: z.string().optional(),
      nb: z.number().optional(),
      nested: z.object({
        nested_prop: z.boolean().optional(),
      }).passthrough().optional(),
    }).passthrough()"
  `);

  expect(
    getSchemaAsZodString({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          str: { type: 'string' },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    "z.array(z.object({
      str: z.string().optional(),
    }).passthrough())"
  `);

  expect(
    getSchemaAsZodString({
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    }),
  ).toMatchInlineSnapshot(`"z.array(z.array(z.string()))"`);

  expect(
    getSchemaAsZodString({
      type: 'object',
      properties: {
        union: { oneOf: [{ type: 'string' }, { type: 'number' }] },
      },
    }),
  ).toMatchInlineSnapshot(`
    "z.object({
      union: z.xor([z.string(), z.number()]).optional(),
    }).passthrough()"
  `);

  expect(
    getSchemaAsZodString({
      type: 'object',
      properties: {
        anyOfExample: { anyOf: [{ type: 'string' }, { type: 'number' }] },
      },
    }),
  ).toMatchInlineSnapshot(`
    "z.object({
      anyOfExample: z.union([z.string(), z.number()]).optional(),
    }).passthrough()"
  `);

  expect(
    getSchemaAsZodString({
      type: 'object',
      properties: {
        intersection: { allOf: [{ type: 'string' }, { type: 'number' }] },
      },
    }),
  ).toMatchInlineSnapshot(`
    "z.object({
      intersection: z.string().and(z.number()).optional(),
    }).passthrough()"
  `);

  expect(
    getSchemaAsZodString({ type: 'string', enum: ['aaa', 'bbb', 'ccc'] }),
  ).toMatchInlineSnapshot(`"z.enum(["aaa", "bbb", "ccc"])"`);
  expect(getSchemaAsZodString({ type: 'number', enum: [1, 2, 3, null] })).toMatchInlineSnapshot(
    `"z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(null)])"`,
  );
  expect(getSchemaAsZodString({ type: 'number', enum: [1] })).toMatchInlineSnapshot(
    `"z.literal(1)"`,
  );
  expect(getSchemaAsZodString({ type: 'string', enum: ['aString'] })).toMatchInlineSnapshot(
    `"z.literal("aString")"`,
  );
});

test('getSchemaWithChainableAsZodString', () => {
  expect(getSchemaAsZodString({ type: ['string', 'null'] })).toMatchInlineSnapshot(
    `"z.string().nullable()"`,
  );
  expect(getSchemaAsZodString({ type: 'string' })).toMatchInlineSnapshot(`"z.string()"`);
});

/**
 * Note: Tests for $ref handling were removed because the simplified getZodSchema
 * no longer supports a ctx parameter. For $ref handling, use the higher-level
 * APIs like generateZodClientFromOpenAPI() which properly resolve references.
 */
