import { getZodSchema } from '../../../src/test-helpers/legacy-compat.js';
import { expect, test } from 'vitest';
import { type SchemaObject } from 'openapi3-ts/oas31';

/**
 * Test: unicode-pattern-regex
 *
 * BEHAVIORAL INTENT: Unicode patterns in OpenAPI schemas should be converted
 * to Zod regex validators, preserving the pattern structure.
 */
test('unicode-pattern-regex', () => {
  // Simple unicode pattern
  const schema: SchemaObject = {
    type: 'string',
    pattern: String.raw`\p{L}+`,
  };

  // Complex unicode pattern
  const schemaWithComplexPattern: SchemaObject = {
    type: 'string',
    pattern: String.raw`$|^[\p{L}\d]+[\p{L}\d\s.&()\*'',-;#]*|$`,
  };

  const simpleResult = getZodSchema({ schema: schema }).code;
  const complexResult = getZodSchema({ schema: schemaWithComplexPattern }).code;

  // BEHAVIOR: Should use regex method
  expect(simpleResult).toContain('.regex(');
  expect(complexResult).toContain('.regex(');

  // BEHAVIOR: Unicode pattern syntax should be preserved
  expect(simpleResult).toContain('\\p{L}');
  expect(complexResult).toContain('\\p{L}');

  // BEHAVIOR: No 'undefined' in output
  expect(simpleResult).not.toContain('undefined');
  expect(complexResult).not.toContain('undefined');
});
