/**
 * Transform Scenario 6: Zod → IR → JSON Schema → IR → Zod (Cross-Format Round-Trip)
 *
 * Proves that a supported subset of Zod schemas survives a cross-format trip
 * through JSON Schema.
 * Pipeline: parseZodSource → IR → writeJsonSchemaBundle → parseJsonSchemaDocument
 *           → IR (with components swapped) → writeOpenApi → generateZodFromOpenAPI
 *
 * Uses the current supported fixture set from `transform-helpers.ts`.
 *
 * @see ADR-027 Transform Validation with Sample Input as Correctness Proof
 * @see ADR-035 Transform Validation Parity
 */

import { describe, expect, it } from 'vitest';

import { parseJsonSchemaDocument } from '../../src/schema-processing/parsers/json-schema/index.js';
import { writeJsonSchemaBundle } from '../../src/schema-processing/writers/json-schema/index.js';
import type { CastrSchemaComponent, CastrDocument } from '../../src/schema-processing/ir/index.js';

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
const JSON_SCHEMA_SUPPORTED_INTERSECTION_SCHEMA_NAMES = [
  'IntersectionSchema',
  'AndMethodSchema',
  'TripleIntersectionSchema',
  'IntersectionWithConstraintsSchema',
  'NewItemSchema',
  // Keep the supported subset dependency-closed: these helper components are
  // referenced by the exported intersections even though they are not exports.
  'PersonBase',
  'HasEmail',
  'HasTimestamps',
  'WithId',
  'WithVersion',
] as const;
const ZOD_JSON_SCHEMA_SUPPORTED_FIXTURES = ZOD_FIXTURES.map((fixture) =>
  fixture.name === 'intersections'
    ? { ...fixture, roundTripSchemaNames: JSON_SCHEMA_SUPPORTED_INTERSECTION_SCHEMA_NAMES }
    : fixture,
);

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extract schema components from an IR, route them through JSON Schema,
 * and reassemble back into a CastrDocument suitable for writeOpenApi.
 *
 * Preserves the original document's info/servers/operations but replaces
 * schema components with the round-tripped versions.
 */
function roundTripSchemasViaJsonSchema(ir: CastrDocument): CastrDocument {
  const schemaComponents = ir.components.filter(
    (c): c is CastrSchemaComponent => c.type === 'schema',
  );

  // IR → JSON Schema Bundle → IR
  const jsonSchemaBundle = writeJsonSchemaBundle(schemaComponents);
  const roundTrippedComponents = parseJsonSchemaDocument(jsonSchemaBundle);

  // Replace schema components in the original IR
  const nonSchemaComponents = ir.components.filter((c) => c.type !== 'schema');
  return {
    ...ir,
    components: [...nonSchemaComponents, ...roundTrippedComponents],
    schemaNames: roundTrippedComponents.map((component) => component.name),
  };
}

// ============================================================================
// Scenario 6: Zod → IR → JSON Schema → IR → Zod
// ============================================================================

describe('Transform Scenario 6: Zod → IR → JSON Schema → IR → Zod', () => {
  describe('Losslessness: Schema count preserved through cross-format trip', () => {
    it.each(ZOD_JSON_SCHEMA_SUPPORTED_FIXTURES)(
      '$name: Zod → JSON Schema → Zod preserves schema count',
      async (fixture) => {
        // Zod → IR
        const source = await readZodFixture(fixture.path);
        const result1 = parseFixtureZodSource(fixture, source);
        expectNoParseErrors(fixture.name, 'Scenario 6 Zod parse', result1);
        const roundTripIR = selectFixtureRoundTripDocument(fixture, result1.ir);
        const originalCount = roundTripIR.components.length;

        // Route schemas through JSON Schema, then generate Zod
        const modifiedIR = roundTripSchemasViaJsonSchema(roundTripIR);
        const openApiDoc = writeOpenApi(modifiedIR);
        const zodOutput = await generateZodFromOpenAPI(openApiDoc);
        const result3 = parseFixtureZodSource(fixture, zodOutput);
        expectNoParseErrors(fixture.name, 'Scenario 6 round-tripped Zod parse', result3);

        // Schema count preserved through full cross-format trip
        expect(result3.ir.components.length).toBe(originalCount);
      },
    );
  });

  describe('Supported-subset consistency: schema names survive the JSON Schema detour', () => {
    it.each(ZOD_JSON_SCHEMA_SUPPORTED_FIXTURES)(
      '$name: schema component names match after JSON Schema round-trip',
      async (fixture) => {
        // Zod → IR
        const source = await readZodFixture(fixture.path);
        const result1 = parseFixtureZodSource(fixture, source);
        expectNoParseErrors(fixture.name, 'Scenario 6 Zod parse', result1);

        const roundTripIR = selectFixtureRoundTripDocument(fixture, result1.ir);

        const originalSchemaComponents = roundTripIR.components.filter(
          (c): c is CastrSchemaComponent => c.type === 'schema',
        );

        // IR → JSON Schema Bundle → IR
        const jsonSchemaBundle = writeJsonSchemaBundle(originalSchemaComponents);
        const roundTrippedComponents = parseJsonSchemaDocument(jsonSchemaBundle);

        // Compare schema names
        const originalNames = originalSchemaComponents.map((c) => c.name).sort();
        const roundTrippedNames = roundTrippedComponents.map((c) => c.name).sort();
        expect(roundTrippedNames).toEqual(originalNames);
      },
    );
  });

  describe('Functional Equivalence: Validation Parity', () => {
    it.each(ZOD_JSON_SCHEMA_SUPPORTED_FIXTURES)(
      '$name: Zod → JSON Schema → Zod yields identical validation behavior',
      async (fixture) => {
        // Original Zod schemas
        const source = await readZodFixture(fixture.path);
        const result1 = parseFixtureZodSource(fixture, source);
        expectNoParseErrors(fixture.name, 'Scenario 6 Zod parse', result1);

        // Cross-format round-trip: IR → JSON Schema → IR → OpenAPI → Zod
        const modifiedIR = roundTripSchemasViaJsonSchema(
          selectFixtureRoundTripDocument(fixture, result1.ir),
        );
        const openApiDoc = writeOpenApi(modifiedIR);
        const zodOutput = await generateZodFromOpenAPI(openApiDoc);

        // Load both sets of schemas dynamically
        const originalSchemas = await loadDynamicZodSchemas(source);
        const transformedSchemas = await loadDynamicZodSchemas(zodOutput);

        assertValidationParity(
          fixture.name,
          originalSchemas,
          transformedSchemas,
          fixture.roundTripSchemaNames,
        );
        assertParsedOutputParity(
          fixture.name,
          originalSchemas,
          transformedSchemas,
          fixture.roundTripSchemaNames,
        );
      },
    );
  });

  describe('Strictness: unsupported recursive unknown-key modes fail fast', () => {
    it('rejects the ItemSchema intersection before JSON Schema emission because it contains int64 semantics', async () => {
      const fixture = ZOD_FIXTURES.find((candidate) => candidate.name === 'intersections');
      if (!fixture) {
        throw new Error('Expected intersections fixture');
      }

      const source = await readZodFixture(fixture.path);
      const result = parseFixtureZodSource(fixture, source);
      expectNoParseErrors(fixture.name, 'Scenario 6 Zod parse', result);

      const failingIR = selectSchemaComponents(result.ir, ['ItemSchema']);
      const schemaComponents = failingIR.components.filter(
        (component): component is CastrSchemaComponent => component.type === 'schema',
      );

      expect(() => writeJsonSchemaBundle(schemaComponents)).toThrow(
        /JSON Schema 2020-12 cannot represent signed 64-bit integer semantics natively/,
      );
    });

    it('rejects z.bigint() before JSON Schema emission because JSON Schema has no native bigint type', () => {
      const result = parseZodSource(`
        import { z } from 'zod';
        export const HugeCounterSchema = z.bigint();
      `);

      expectNoParseErrors('inline bigint test', 'Scenario 6 Zod parse', result);

      const schemaComponents = result.ir.components.filter(
        (component): component is CastrSchemaComponent => component.type === 'schema',
      );

      expect(() => writeJsonSchemaBundle(schemaComponents)).toThrow(
        /JSON Schema 2020-12 cannot represent arbitrary-precision bigint natively/,
      );
    });

    it('rejects z.int64() before JSON Schema emission because JSON Schema has no native int64 type', () => {
      const result = parseZodSource(`
        import { z } from 'zod';
        export const Signed64Schema = z.int64();
      `);

      expectNoParseErrors('inline int64 test', 'Scenario 6 Zod parse', result);

      const schemaComponents = result.ir.components.filter(
        (component): component is CastrSchemaComponent => component.type === 'schema',
      );

      expect(() => writeJsonSchemaBundle(schemaComponents)).toThrow(
        /JSON Schema 2020-12 cannot represent signed 64-bit integer semantics natively/,
      );
    });

    it.each(ZOD_GENERATION_FAILURE_FIXTURES)(
      '$fixtureName: $label',
      async ({ fixtureName, fixturePath, schemaNames, expectedError }) => {
        const source = await readZodFixture(fixturePath);
        const result = parseZodSource(source);
        expectNoParseErrors(fixtureName, 'Scenario 6 Zod parse', result);

        const failingIR = roundTripSchemasViaJsonSchema(
          selectSchemaComponents(result.ir, schemaNames),
        );
        const openApiDoc = writeOpenApi(failingIR);

        await expect(generateZodFromOpenAPI(openApiDoc)).rejects.toThrow(expectedError);
      },
    );
  });
});
