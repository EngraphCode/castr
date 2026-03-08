/**
 * Transform Scenario 6: Zod → IR → JSON Schema → IR → Zod (Cross-Format Round-Trip)
 *
 * Proves that Zod schemas survive a cross-format trip through JSON Schema.
 * Pipeline: parseZodSource → IR → writeJsonSchemaBundle → parseJsonSchemaDocument
 *           → IR (with components swapped) → writeOpenApi → generateZodFromOpenAPI
 *
 * Uses ALL Zod fixtures (objects, string-formats, constraints).
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
  readZodFixture,
  expectNoParseErrors,
  generateZodFromOpenAPI,
  loadDynamicZodSchemas,
  assertValidationParity,
  writeOpenApi,
  parseZodSource,
} from '../utils/transform-helpers.js';

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
  };
}

// ============================================================================
// Scenario 6: Zod → IR → JSON Schema → IR → Zod
// ============================================================================

describe('Transform Scenario 6: Zod → IR → JSON Schema → IR → Zod', () => {
  describe('Losslessness: Schema count preserved through cross-format trip', () => {
    it.each(ZOD_FIXTURES)(
      '%s: Zod → JSON Schema → Zod preserves schema count',
      async (_name, path) => {
        // Zod → IR
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);
        expectNoParseErrors(_name, 'Scenario 6 Zod parse', result1);
        const originalCount = result1.ir.components.length;

        // Route schemas through JSON Schema, then generate Zod
        const modifiedIR = roundTripSchemasViaJsonSchema(result1.ir);
        const openApiDoc = writeOpenApi(modifiedIR);
        const zodOutput = await generateZodFromOpenAPI(openApiDoc);
        const result3 = parseZodSource(zodOutput);
        expectNoParseErrors(_name, 'Scenario 6 round-tripped Zod parse', result3);

        // Schema count preserved through full cross-format trip
        expect(result3.ir.components.length).toBe(originalCount);
      },
    );
  });

  describe('Semantic equivalence: IR matches through JSON Schema detour', () => {
    it.each(ZOD_FIXTURES)(
      '%s: IR component schemas match after JSON Schema round-trip',
      async (_name, path) => {
        // Zod → IR
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);
        expectNoParseErrors(_name, 'Scenario 6 Zod parse', result1);

        const originalSchemaComponents = result1.ir.components.filter(
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
    it.each(ZOD_FIXTURES)(
      '%s: Zod → JSON Schema → Zod yields identical validation behavior',
      async (_name, path) => {
        // Original Zod schemas
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);
        expectNoParseErrors(_name, 'Scenario 6 Zod parse', result1);

        // Cross-format round-trip: IR → JSON Schema → IR → OpenAPI → Zod
        const modifiedIR = roundTripSchemasViaJsonSchema(result1.ir);
        const openApiDoc = writeOpenApi(modifiedIR);
        const zodOutput = await generateZodFromOpenAPI(openApiDoc);

        // Load both sets of schemas dynamically
        const originalSchemas = await loadDynamicZodSchemas(source);
        const transformedSchemas = await loadDynamicZodSchemas(zodOutput);

        assertValidationParity(_name, originalSchemas, transformedSchemas);
      },
    );
  });
});
