import { describe, expect, test } from 'vitest';
import { getZodSchema } from '../../../src/index.js';

// see: https://swagger.io/docs/specification/data-models/data-types/#free-form
describe('additional-properties', () => {
  test('plain free-form object', () => {
    const schema = getZodSchema({
      schema: {
        type: 'object',
      },
    });

    expect(schema).toMatchInlineSnapshot(`
      {
          "code": "z.strictObject({
      })",
          "schema": {
              "type": "object",
          },
      }
    `);
  });

  test('additionalProperties is true emits explicit catchall semantics', () => {
    expect(
      getZodSchema({
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      }),
    ).toMatchInlineSnapshot(`
      {
          "code": "z.object({
      }).catchall(z.unknown())",
          "schema": {
              "additionalProperties": true,
              "type": "object",
          },
      }
    `);
  });

  test('additionalProperties is empty object emits schema-valued catchall semantics', () => {
    expect(
      getZodSchema({
        schema: {
          type: 'object',
          additionalProperties: {},
        },
      }),
    ).toMatchInlineSnapshot(`
      {
          "code": "z.object({
      }).catchall(z.unknown())",
          "schema": {
              "additionalProperties": {},
              "type": "object",
          },
      }
    `);
  });

  test('additional properties opt-out', () => {
    const additionalPropertiesOptOut = getZodSchema({
      schema: {
        type: 'object',
        additionalProperties: false,
      },
    });

    expect(additionalPropertiesOptOut).toMatchInlineSnapshot(`
      {
          "code": "z.strictObject({
      })",
          "schema": {
              "additionalProperties": false,
              "type": "object",
          },
      }
    `);
  });

  test('object with some properties', () => {
    const schema = getZodSchema({
      schema: {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          bar: { type: 'number' },
        },
      },
    });

    expect(schema).toMatchInlineSnapshot(
      `
      {
          "code": "z.strictObject({
        bar: z.number().optional(),
        foo: z.string().optional(),
      })",
          "schema": {
              "properties": {
                  "bar": {
                      "type": "number",
                  },
                  "foo": {
                      "type": "string",
                  },
              },
              "type": "object",
          },
      }
    `,
    );
  });
});
