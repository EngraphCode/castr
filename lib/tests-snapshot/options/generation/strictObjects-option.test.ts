import { getZodSchema } from '../../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';

test('strictObjects-option', () => {
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
        "code": "z.object({ str: z.string() }).partial().passthrough()",
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
  // When strictObjects is true, .passthrough() should NOT be added (they contradict each other)
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
        },
      },
      options: {
        strictObjects: true,
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "code": "z.object({ str: z.string() }).partial().strict()",
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
