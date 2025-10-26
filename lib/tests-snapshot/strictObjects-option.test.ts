import { getZodSchema } from '../src/openApiToZod.js';
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
  ).toMatchInlineSnapshot('"z.object({ str: z.string() }).partial().passthrough()"');
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
  ).toMatchInlineSnapshot('"z.object({ str: z.string() }).partial().strict()"');
});
