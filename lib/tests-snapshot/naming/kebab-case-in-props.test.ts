import { getZodSchema } from '../../src/schema-processing/conversion/zod/index.js';
import { test, expect } from 'vitest';

test('kebab-case-in-props', () => {
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          lowercase: { type: 'string' },
          'kebab-case': { type: 'number' },
        },
      },
    }),
  ).toMatchInlineSnapshot(
    `
    {
        "code": "z.object({
      lowercase: z.string().optional(),
      'kebab-case': z.number().optional(),
    }).passthrough()",
        "schema": {
            "properties": {
                "kebab-case": {
                    "type": "number",
                },
                "lowercase": {
                    "type": "string",
                },
            },
            "type": "object",
        },
    }
  `,
  );
});
