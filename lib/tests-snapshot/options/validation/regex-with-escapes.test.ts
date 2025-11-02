import { getZodSchema } from '../../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';

test('regex-with-escapes', () => {
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: {
            type: 'string',
            pattern: '^/$',
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(
    String.raw`"z.object({ str: z.string().regex(/^\/$/) }).partial().passthrough()"`,
  );
});
