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
  ZOD_GENERATION_FAILURE_FIXTURES,
  readZodFixture,
  expectNoParseErrors,
  generateZodFromOpenAPI,
  loadDynamicZodSchemas,
  assertValidationParity,
  assertParsedOutputParity,
  selectFixtureRoundTripDocument,
  selectSchemaComponents,
  writeOpenApi,
  parseZodSource,
} from '../utils/transform-helpers.js';

const RECURSIVE_UNKNOWN_KEY_FAILURE =
  /Recursive object schemas with unknown-key behavior "(passthrough|catchall)" cannot yet be emitted safely in Zod\./;

// ============================================================================
// Scenario 4: Zod → IR → OpenAPI → IR → Zod
// ============================================================================

describe('Transform Sample Scenario 4: Zod → OpenAPI → Zod', () => {
  describe('Losslessness: Schema count preserved through cross-format trip', () => {
    it.each(ZOD_FIXTURES)('$name: Zod → OpenAPI → Zod preserves schema count', async (fixture) => {
      // Zod → IR
      const source = await readZodFixture(fixture.path);
      const result1 = parseZodSource(source);
      expectNoParseErrors(fixture.name, 'Scenario 4 arbitrary-input parse', result1);

      const roundTripIR = selectFixtureRoundTripDocument(fixture, result1.ir);

      const originalCount = roundTripIR.components.length;

      // IR → OpenAPI → Zod (REAL generator) → IR
      const openApiOutput = writeOpenApi(roundTripIR);
      const zodOutput = await generateZodFromOpenAPI(openApiOutput);
      const result3 = parseZodSource(zodOutput);
      expectNoParseErrors(fixture.name, 'Scenario 4 generated-output parse', result3);

      // Schema count preserved
      expect(result3.ir.components.length).toBe(originalCount);
    });
  });

  describe('Strictness: unsupported recursive unknown-key modes fail fast', () => {
    it.each(ZOD_GENERATION_FAILURE_FIXTURES)(
      '$fixtureName: $label',
      async ({ fixtureName, fixturePath, schemaNames, expectedError }) => {
        const source = await readZodFixture(fixturePath);
        const result = parseZodSource(source);
        expectNoParseErrors(fixtureName, 'Scenario 4 arbitrary-input parse', result);

        const failingIR = selectSchemaComponents(result.ir, schemaNames);
        const openApiOutput = writeOpenApi(failingIR);

        await expect(generateZodFromOpenAPI(openApiOutput)).rejects.toThrow(expectedError);
      },
    );

    it('rejects the full mixed unknown-key fixture instead of partially generating it', async () => {
      const fixture = ZOD_FIXTURES.find((candidate) => candidate.name === 'unknown-key-semantics');
      if (!fixture) {
        throw new Error('Expected unknown-key-semantics fixture');
      }

      const source = await readZodFixture(fixture.path);
      const result = parseZodSource(source);
      expectNoParseErrors(fixture.name, 'Scenario 4 arbitrary-input parse', result);

      const openApiOutput = writeOpenApi(result.ir);

      await expect(generateZodFromOpenAPI(openApiOutput)).rejects.toThrow(
        RECURSIVE_UNKNOWN_KEY_FAILURE,
      );
    });
  });

  describe('Functional Equivalence: Validation Parity', () => {
    it.each(ZOD_FIXTURES)(
      '$name: Zod → OpenAPI → Zod yields identical validation behavior',
      async (fixture) => {
        const source = await readZodFixture(fixture.path);
        const result1 = parseZodSource(source);
        expectNoParseErrors(fixture.name, 'Scenario 4 arbitrary-input parse', result1);

        const openApiOutput = writeOpenApi(selectFixtureRoundTripDocument(fixture, result1.ir));
        const zodOutput = await generateZodFromOpenAPI(openApiOutput);

        const originalSchemas = await loadDynamicZodSchemas(source);
        const transformedSchemas = await loadDynamicZodSchemas(zodOutput);

        assertValidationParity(fixture.name, originalSchemas, transformedSchemas);
        assertParsedOutputParity(fixture.name, originalSchemas, transformedSchemas);
      },
    );
  });
});
