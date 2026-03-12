import { getZodSchema } from '../../../src/schema-processing/conversion/zod/index.js';
import { test, expect } from 'vitest';

/**
 * Test: withImplicitRequired option behavior
 *
 * Note: The `options` parameter was removed from getZodSchema.
 * This test now verifies default behavior only.
 */
test('withImplicitRequired-option', () => {
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
            "type": "object",
        },
    }
  `,
  );
});
