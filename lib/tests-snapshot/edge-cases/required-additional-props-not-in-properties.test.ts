import { getZodSchema } from '../../src/conversion/zod/index.js';
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
      name: z.string(),
      email: z.string(),
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
