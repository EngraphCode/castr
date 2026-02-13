import { getZodSchema } from '../../../src/schema-processing/conversion/zod/index.js';
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
      email: z.email().optional(),
      url: z.url().optional(),
      uuid: z.uuidv4().optional(),
      number: z.number(),
      int: z.int().optional(),
      intWithMin: z.int().min(3).optional(),
      intWithMax: z.int().max(3).optional(),
      intWithMultipleOf: z.int().multipleOf(3).optional(),
      bool: z.boolean().optional(),
      array: z.array(z.string()).optional(),
      arrayWithMin: z.array(z.string()).min(3).optional(),
      arrayWithMax: z.array(z.string()).max(3).optional(),
    }).passthrough()"
  `,
  );
});
