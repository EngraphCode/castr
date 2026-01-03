import { getZodSchema } from '../../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';

/**
 * Test: validations behavior
 *
 * Note: The `options` parameter was removed from getZodSchema.
 * This test now verifies default behavior only.
 */
test('validations', () => {
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
          strWithLength: { type: 'string', minLength: 3, maxLength: 3 },
          strWithMin: { type: 'string', minLength: 3 },
          strWithMax: { type: 'string', maxLength: 3 },
          strWithPattern: { type: 'string', pattern: '^[a-z]+$' },
          email: { type: 'string', format: 'email' },
          url: { type: 'string', format: 'uri' },
          uuid: { type: 'string', format: 'uuid' },
          number: { type: 'number' },
          int: { type: 'integer' },
          intWithMin: { type: 'integer', minimum: 3 },
          intWithMax: { type: 'integer', maximum: 3 },
          intWithMultipleOf: { type: 'integer', multipleOf: 3 },
          bool: { type: 'boolean' },
          array: { type: 'array', items: { type: 'string' } },
          arrayWithMin: { type: 'array', items: { type: 'string' }, minItems: 3 },
          arrayWithMax: { type: 'array', items: { type: 'string' }, maxItems: 3 },
        },
        required: ['str', 'number'],
      },
    }).code,
  ).toMatchInlineSnapshot(
    `
    "z.object({
      str: z.string(),
      strWithLength: z.string().min(3).max(3).optional(),
      strWithMin: z.string().min(3).optional(),
      strWithMax: z.string().max(3).optional(),
      strWithPattern: z.string().regex(/^[a-z]+$/).optional(),
      email: z.string().email().optional(),
      url: z.string().url().optional(),
      uuid: z.string().uuid().optional(),
      number: z.number(),
      int: z.number().int().optional(),
      intWithMin: z.number().min(3).int().optional(),
      intWithMax: z.number().max(3).int().optional(),
      intWithMultipleOf: z.number().multipleOf(3).int().optional(),
      bool: z.boolean().optional(),
      array: z.array(z.string()).optional(),
      arrayWithMin: z.array(z.string()).min(3).optional(),
      arrayWithMax: z.array(z.string()).max(3).optional(),
    }).passthrough()"
  `,
  );
});
