import { getZodSchema } from '../../src/schema-processing/conversion/zod/index.js';
import { test, expect } from 'vitest';

test('required-additional-props-not-in-properties', () => {
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
        required: ['name', 'email', 'phone'],
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "code": "z.object({
      email: z.string(),
      name: z.string(),
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
            "required": [
                "name",
                "email",
                "phone",
            ],
        },
    }
  `);
});
