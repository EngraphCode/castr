import { getZodSchema } from '../../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';

/**
 * Test: regex-with-escapes
 *
 * BEHAVIORAL INTENT: Forward slashes in regex patterns should be properly
 * escaped when generating regex literals.
 */
test('regex-with-escapes', () => {
  // Pattern with forward slash: ^/$
  const result = getZodSchema({
    schema: {
      type: 'object',
      properties: {
        str: {
          type: 'string',
          pattern: '^/$',
        },
      },
    },
  }).code;

  // BEHAVIOR: Should use regex literal format
  expect(result).toContain('.regex(');

  // BEHAVIOR: Forward slash should be escaped in the regex literal
  expect(result).toContain('/^');
  expect(result).toContain('/$/');
});
