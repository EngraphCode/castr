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

const UNKNOWN_KEY_COMPATIBILITY_SCHEMA_NAMES = [
  'StripObjectSchema',
  'RecursiveStripCategorySchema',
] as const;

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

    it('rejects the full mixed unknown-key fixture by default and supports explicit strip normalization', async () => {
      const fixture = ZOD_FIXTURES.find((candidate) => candidate.name === 'unknown-key-semantics');
      if (!fixture) {
        throw new Error('Expected unknown-key-semantics fixture');
      }

      const source = await readZodFixture(fixture.path);
      const defaultResult = parseZodSource(source);
      expect(defaultResult.errors.length).toBeGreaterThan(0);
      expect(defaultResult.errors[0]?.message).toContain('strict object ingest is the default');
      expect(defaultResult.errors[0]?.message).toContain("nonStrictObjectPolicy: 'strip'");

      const compatibilityResult = parseFixtureZodSource(fixture, source);
      expectNoParseErrors(
        fixture.name,
        'Scenario 4 arbitrary-input parse with compatibility mode',
        compatibilityResult,
      );

      const openApiOutput = writeOpenApi(
        selectFixtureRoundTripDocument(fixture, compatibilityResult.ir),
      );
      const zodOutput = await generateZodFromOpenAPI(openApiOutput);
      const regenerated = parseFixtureZodSource(fixture, zodOutput);

      expectNoParseErrors(
        fixture.name,
        'Scenario 4 generated-output parse with compatibility mode',
        regenerated,
      );

      const regeneratedSchemas = selectSchemaComponents(regenerated.ir, [
        'StripObjectSchema',
        'PassthroughObjectSchema',
        'CatchallObjectSchema',
        'RecursiveStripCategorySchema',
      ]).components;

      for (const component of regeneratedSchemas) {
        if (component.type !== 'schema') {
          continue;
        }

        expect(component.schema.additionalProperties).toBe(true);
        expect(component.schema.unknownKeyBehavior).toEqual({ mode: 'strip' });
      }
    });
  });

  describe('Functional Equivalence: Validation Parity', () => {
    it.each(ZOD_FIXTURES.filter((fixture) => fixture.name !== 'unknown-key-semantics'))(
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

    it('unknown-key-semantics: compatibility mode preserves strip behavior where strip semantics are the target', async () => {
      expect.hasAssertions();

      const fixture = ZOD_FIXTURES.find((candidate) => candidate.name === 'unknown-key-semantics');
      if (!fixture) {
        throw new Error('Expected unknown-key-semantics fixture');
      }

      const source = await readZodFixture(fixture.path);
      const result1 = parseFixtureZodSource(fixture, source);
      expectNoParseErrors(fixture.name, 'Scenario 4 arbitrary-input parse', result1);

      const openApiOutput = writeOpenApi(selectFixtureRoundTripDocument(fixture, result1.ir));
      const zodOutput = await generateZodFromOpenAPI(openApiOutput);

      const originalSchemas = await loadDynamicZodSchemas(source);
      const transformedSchemas = await loadDynamicZodSchemas(zodOutput);

      assertValidationParity(
        fixture.name,
        originalSchemas,
        transformedSchemas,
        UNKNOWN_KEY_COMPATIBILITY_SCHEMA_NAMES,
      );
      assertParsedOutputParity(
        fixture.name,
        originalSchemas,
        transformedSchemas,
        UNKNOWN_KEY_COMPATIBILITY_SCHEMA_NAMES,
      );
    });
  });
});
