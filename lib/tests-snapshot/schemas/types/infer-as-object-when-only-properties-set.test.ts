import { getZodSchema } from '../../../src/schema-processing/conversion/zod/index.js';
import { test, expect } from 'vitest';

test('infer-as-object-when-only-properties-set', () => {
  expect(
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
  ).toMatchInlineSnapshot(
    `
    {
        "code": "z.object({
      nested: z.object({
      }).strip().optional(),
      str: z.string().optional(),
    }).strip()",
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
        },
    }
  `,
  );
});
