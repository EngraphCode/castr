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

  test('additionalProperties is true — rejected as non-strict', () => {
    expect(() =>
      getZodSchema({
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      }),
    ).toThrow(/non-strict object input/i);
  });

  test('additionalProperties is empty object — rejected as non-strict', () => {
    expect(() =>
      getZodSchema({
        schema: {
          type: 'object',
          // empty object is equivalent to true according to swagger docs above
          additionalProperties: {},
        },
      }),
    ).toThrow(/non-strict object input/i);
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
