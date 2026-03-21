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

  test('nested schema-valued additionalProperties is rejected', () => {
    expect(() =>
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
    ).toThrow(/non-strict object input/i);
  });
});
