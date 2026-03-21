import { getZodSchema } from '../../../src/schema-processing/conversion/zod/index.js';
import { test, expect, describe } from 'vitest';

describe('infer-as-object-when-only-properties-set', () => {
  test('object with only properties (no type) is inferred as strict object', () => {
    expect(
      getZodSchema({
        schema: {
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
          },
      }
    `,
    );
  });

  test('nested schema-valued additionalProperties is rejected', () => {
    expect(() =>
      getZodSchema({
        schema: {
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
