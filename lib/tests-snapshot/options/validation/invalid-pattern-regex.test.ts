import { getZodSchema } from '../../../src/test-helpers/legacy-compat.js';
import { expect, test } from 'vitest';
import { type SchemaObject } from 'openapi3-ts/oas31';

/**
 * Test: invalid-pattern-regex
 *
 * BEHAVIORAL INTENT: Regex patterns in OpenAPI schemas should be converted
 * to Zod regex validators using regex literal format.
 */
test('invalid-pattern-regex', () => {
  // Standard pattern without slashes
  const standardPattern: SchemaObject = {
    type: 'string',
    pattern: '[0-9]+',
  };

  // Pattern already wrapped in slashes (legacy format)
  const slashWrappedPattern: SchemaObject = {
    type: 'string',
    pattern: '/[0-9]+/',
  };

  // BEHAVIOR: Both should generate regex literal format
  const standardResult = getZodSchema({ schema: standardPattern }).code;
  const slashWrappedResult = getZodSchema({ schema: slashWrappedPattern }).code;

  // Should use .regex() method
  expect(standardResult).toContain('.regex(');
  expect(slashWrappedResult).toContain('.regex(');

  // Should use regex literal format (not new RegExp constructor)
  expect(standardResult).toContain('/[0-9]+/');
  expect(standardResult).not.toContain('new RegExp');
});
