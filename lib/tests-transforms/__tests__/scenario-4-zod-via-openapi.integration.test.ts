/**
 * Transform Scenario 4: Zod → OpenAPI → Zod
 *
 * Tests that Zod schemas survive a full cross-format transform path.
 *
 * @see ADR-027 Transform Validation with Sample Input as Correctness Proof
 * @see ADR-035 Transform Validation Parity
 */

import { describe, expect, it } from 'vitest';

import {
  ZOD_FIXTURES,
  readZodFixture,
  expectNoParseErrors,
  generateZodFromOpenAPI,
  loadDynamicZodSchemas,
  assertValidationParity,
  writeOpenApi,
  parseZodSource,
} from '../utils/transform-helpers.js';

// ============================================================================
// Scenario 4: Zod → IR → OpenAPI → IR → Zod
// ============================================================================

describe('Transform Sample Scenario 4: Zod → OpenAPI → Zod', () => {
  describe('Losslessness: Schema count preserved through cross-format trip', () => {
    it.each(ZOD_FIXTURES)('%s: Zod → OpenAPI → Zod preserves schema count', async (_name, path) => {
      // Zod → IR
      const source = await readZodFixture(path);
      const result1 = parseZodSource(source);
      expectNoParseErrors(_name, 'Scenario 4 arbitrary-input parse', result1);

      const originalCount = result1.ir.components.length;

      // IR → OpenAPI → Zod (REAL generator) → IR
      const openApiOutput = writeOpenApi(result1.ir);
      const zodOutput = await generateZodFromOpenAPI(openApiOutput);
      const result3 = parseZodSource(zodOutput);
      expectNoParseErrors(_name, 'Scenario 4 generated-output parse', result3);

      // Schema count preserved
      expect(result3.ir.components.length).toBe(originalCount);
    });
  });

  describe('Functional Equivalence: Validation Parity', () => {
    it.each(ZOD_FIXTURES)(
      '%s: Zod → OpenAPI → Zod yields identical validation behavior',
      async (_name, path) => {
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);

        const openApiOutput = writeOpenApi(result1.ir);
        const zodOutput = await generateZodFromOpenAPI(openApiOutput);

        const originalSchemas = await loadDynamicZodSchemas(source);
        const transformedSchemas = await loadDynamicZodSchemas(zodOutput);

        assertValidationParity(_name, originalSchemas, transformedSchemas);
      },
    );
  });
});
