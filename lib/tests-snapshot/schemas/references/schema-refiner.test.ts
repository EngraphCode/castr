import { getZodSchema } from '../../../src/schema-processing/conversion/zod/index.js';
import { test, expect } from 'vitest';

/**
 * Test: schema-refiner
 *
 * Note: The `options` parameter was removed from getZodSchema.
 * This test now verifies default behavior only.
 */

test('schema-refiner', () => {
  // Without options, just verify default behavior
  expect(
    getZodSchema({
      schema: {
        properties: {
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(
    `
    {
        "code": "z.object({
      name: z.string().optional(),
      email: z.string().optional(),
    }).passthrough()",
        "schema": {
            "properties": {
                "email": {
                    "type": "string",
                },
                "name": {
                    "type": "string",
                },
            },
        },
    }
  `,
  );
});
