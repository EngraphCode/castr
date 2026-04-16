import { getZodSchema } from '../../../src/schema-processing/conversion/zod/index.js';
import { test, expect, describe } from 'vitest';

/**
 * Test: withImplicitRequired option behavior
 *
 * Note: The `options` parameter was removed from getZodSchema.
 */
describe('withImplicitRequired-option', () => {
  test('object with properties (no additionalProperties) produces strict output', () => {
    expect(
      getZodSchema({
        schema: {
          type: 'object',
          properties: {
            str: { type: 'string' },
            num: { type: 'number' },
          },
        },
      }),
    ).toMatchInlineSnapshot(
      `
      {
          "code": "z.strictObject({
        num: z.number().optional(),
        str: z.string().optional(),
      })",
          "schema": {
              "properties": {
                  "num": {
                      "type": "number",
                  },
                  "str": {
                      "type": "string",
                  },
              },
              "type": "object",
          },
      }
    `,
    );
  });

  test('nested schema-valued additionalProperties is emitted via catchall', () => {
    expect(
      getZodSchema({
        schema: {
          type: 'object',
          properties: {
            str: { type: 'string' },
            nested: {
              additionalProperties: { type: 'number' },
            },
          },
        },
      }),
    ).toMatchInlineSnapshot(`
      {
          "code": "z.strictObject({
        nested: z.object({
        }).catchall(z.number()).optional(),
        str: z.string().optional(),
      })",
          "schema": {
              "properties": {
                  "nested": {
                      "additionalProperties": {
                          "type": "number",
                      },
                  },
                  "str": {
                      "type": "string",
                  },
              },
              "type": "object",
          },
      }
    `);
  });
});
