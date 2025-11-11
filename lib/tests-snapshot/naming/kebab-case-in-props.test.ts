import { getZodSchema } from '../../src/conversion/zod/index.js';
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
        "code": "z.object({ lowercase: z.string(), "kebab-case": z.number() }).partial().passthrough()",
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
