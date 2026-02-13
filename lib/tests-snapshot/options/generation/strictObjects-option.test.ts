import { getZodSchema } from '../../../src/schema-processing/conversion/zod/index.js';
import { test, expect } from 'vitest';

/**
 * Test: strictObjects option behavior
 *
 * Note: The `options` parameter was removed from getZodSchema.
 * This test now verifies default behavior only.
 */
test('strictObjects-option', () => {
  // Default behavior - passthrough added for objects
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "code": "z.object({
      str: z.string().optional(),
    }).passthrough()",
        "schema": {
            "properties": {
                "str": {
                    "type": "string",
                },
            },
            "type": "object",
        },
    }
  `);
});
