/**
 * Transform Scenario 3: OpenAPI → Zod → OpenAPI
 *
 * Tests that schemas flow through the Zod layer without loss.
 * Proves OpenAPI schemas can be represented in Zod and parsed back.
 *
 * @see ADR-027 Transform Validation with Sample Input as Correctness Proof
 * @see ADR-035 Transform Validation Parity
 */

import { describe, expect, it } from 'vitest';

import {
  ARBITRARY_FIXTURES,
  parseToIR,
  expectNoParseErrors,
  generateZodFromOpenAPI,
  loadDynamicZodSchemas,
  assertValidationParity,
  writeOpenApi,
  parseZodSource,
} from '../utils/transform-helpers.js';

// ============================================================================
// Scenario 3: OpenAPI → IR → Zod → IR → OpenAPI
// ============================================================================

describe('Transform Sample Scenario 3: OpenAPI → Zod → OpenAPI', () => {
  describe('Losslessness: Schema content flows through Zod layer', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: OpenAPI → Zod → IR preserves schema count',
      async (_name, path) => {
        // OpenAPI → IR
        const originalIR = await parseToIR(path);
        const originalSchemaCount = originalIR.components.filter((c) => c.type === 'schema').length;

        // IR → OpenAPI → Zod (REAL generator)
        const openApiDoc = writeOpenApi(originalIR);
        const zodSource = await generateZodFromOpenAPI(openApiDoc);

        // Zod source → IR (only schema components)
        const zodParsed = parseZodSource(zodSource);
        expectNoParseErrors(_name, 'Scenario 3 generated-output parse', zodParsed);

        // Schema count must be preserved exactly through the transform path.
        expect(zodParsed.ir.components.length).toBe(originalSchemaCount);
      },
    );
  });

  describe('Functional Equivalence: Validation Parity (Zod Evaluation)', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: OpenAPI → Zod → OpenAPI maintains equal behavior at Zod step',
      async (_name, path) => {
        // 1. Initial output Zod schemas
        const originalIR = await parseToIR(path);
        const openApiDoc1 = writeOpenApi(originalIR);
        const firstZodSource = await generateZodFromOpenAPI(openApiDoc1);

        // 2. Transformed output Zod schemas
        const result2 = parseZodSource(firstZodSource);
        const openApiDoc2 = writeOpenApi(result2.ir);
        const secondZodSource = await generateZodFromOpenAPI(openApiDoc2);

        const firstSchemas = await loadDynamicZodSchemas(firstZodSource);
        const secondSchemas = await loadDynamicZodSchemas(secondZodSource);

        // For this scenario we use the test filename base as the dictionary key for parity testing
        const fixtureKey = _name.split('-')[0];
        if (!fixtureKey) {
          throw new Error('Missing fixture key');
        }
        assertValidationParity(fixtureKey, firstSchemas, secondSchemas);
      },
    );
  });
});
