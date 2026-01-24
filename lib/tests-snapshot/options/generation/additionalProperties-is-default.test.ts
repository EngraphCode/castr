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
          "code": "z.object({
      }).passthrough()",
          "schema": {
              "type": "object",
          },
      }
    `);
  });

  test('additionalProperties is true', () => {
    const schema = getZodSchema({
      schema: {
        type: 'object',
        additionalProperties: true,
      },
    });

    expect(schema).toMatchInlineSnapshot(`
      {
          "code": "z.object({
      }).passthrough()",
          "schema": {
              "additionalProperties": true,
              "type": "object",
          },
      }
    `);
  });

  test('additionalProperties is empty object', () => {
    const schema = getZodSchema({
      schema: {
        type: 'object',
        // empty object is equivalent to true according to swagger docs above
        additionalProperties: {},
      },
    });

    expect(schema).toMatchInlineSnapshot(`
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
          "code": "z.object({
      }).strict()",
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
          "code": "z.object({
        foo: z.string().optional(),
        bar: z.number().optional(),
      }).passthrough()",
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
