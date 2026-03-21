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
  parseFixtureZodSource,
  parseZodSource,
} from '../utils/transform-helpers.js';

// ============================================================================
// Scenario 4: Zod → IR → OpenAPI → IR → Zod
// ============================================================================

describe('Transform Sample Scenario 4: Zod → OpenAPI → Zod', () => {
  describe('Losslessness: Schema count preserved through cross-format trip', () => {
    it.each(ZOD_FIXTURES)('$name: Zod → OpenAPI → Zod preserves schema count', async (fixture) => {
      // Zod → IR
      const source = await readZodFixture(fixture.path);
      const result1 = parseFixtureZodSource(fixture, source);
      expectNoParseErrors(fixture.name, 'Scenario 4 arbitrary-input parse', result1);

      const roundTripIR = selectFixtureRoundTripDocument(fixture, result1.ir);

      const originalCount = roundTripIR.components.length;

      // IR → OpenAPI → Zod (REAL generator) → IR
      const openApiOutput = writeOpenApi(roundTripIR);
      const zodOutput = await generateZodFromOpenAPI(openApiOutput);
      const result3 = parseFixtureZodSource(fixture, zodOutput);
      expectNoParseErrors(fixture.name, 'Scenario 4 generated-output parse', result3);

      // Schema count preserved
      expect(result3.ir.components.length).toBe(originalCount);
    });
  });

  describe('Portable UUID subtype widening', () => {
    it('widens UUID subtype helpers to plain uuid when detouring through OpenAPI', async () => {
      const source = `
        import { z } from 'zod';

        export const UuidV4Schema = z.uuidv4();
        export const UuidV7Schema = z.uuidv7();
      `;

      const result = parseZodSource(source);
      expectNoParseErrors('inline uuid subtype test', 'Scenario 4 arbitrary-input parse', result);

      const uuidV4Component = result.ir.components.find(
        (component) => component.type === 'schema' && component.name === 'UuidV4',
      );
      const uuidV7Component = result.ir.components.find(
        (component) => component.type === 'schema' && component.name === 'UuidV7',
      );

      expect(uuidV4Component?.type).toBe('schema');
      expect(uuidV7Component?.type).toBe('schema');
      if (uuidV4Component?.type !== 'schema' || uuidV7Component?.type !== 'schema') {
        throw new Error('Expected UUID subtype components to be present in IR');
      }

      expect(uuidV4Component.schema.format).toBe('uuid');
      expect(uuidV4Component.schema.uuidVersion).toBe(4);
      expect(uuidV7Component.schema.format).toBe('uuid');
      expect(uuidV7Component.schema.uuidVersion).toBe(7);

      const openApiOutput = writeOpenApi(result.ir);
      const zodOutput = await generateZodFromOpenAPI(openApiOutput);
      const regenerated = parseZodSource(zodOutput);

      expectNoParseErrors(
        'inline uuid subtype test',
        'Scenario 4 generated-output parse',
        regenerated,
      );
      expect(zodOutput).toContain('z.uuid()');
      expect(zodOutput).not.toContain('z.uuidv4()');
      expect(zodOutput).not.toContain('z.uuidv7()');
    });
  });

  describe('Strictness: unsupported recursive unknown-key modes fail fast', () => {
    it('rejects z.bigint() before OpenAPI emission because OpenAPI has no native bigint type', () => {
      const result = parseZodSource(`
        import { z } from 'zod';
        export const HugeCounterSchema = z.bigint();
      `);

      expectNoParseErrors('inline bigint test', 'Scenario 4 arbitrary-input parse', result);

      expect(() => writeOpenApi(result.ir)).toThrow(
        /OpenAPI 3\.1 cannot represent arbitrary-precision bigint natively/,
      );
    });

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
  });

  describe('Functional Equivalence: Validation Parity', () => {
    it.each(ZOD_FIXTURES)(
      '$name: Zod → OpenAPI → Zod yields identical validation behavior',
      async (fixture) => {
        const source = await readZodFixture(fixture.path);
        const result1 = parseFixtureZodSource(fixture, source);
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
