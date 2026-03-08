/**
 * Transform Scenario 7: Multi-Cast (Single IR → Zod + JSON Schema + OpenAPI)
 *
 * Proves that a single IR simultaneously produces valid output in
 * all three formats and that the outputs are consistent with each other.
 *
 * Pipeline: Single CastrDocument IR → simultaneously:
 *   1. writeOpenApi → generateZodFromOpenAPI → Zod source
 *   2. writeJsonSchemaBundle → JSON Schema document
 *   3. writeOpenApi → OpenAPI document
 *
 * @see ADR-027 Transform Validation with Sample Input as Correctness Proof
 * @see ADR-035 Transform Validation Parity
 */

import { describe, expect, it } from 'vitest';
import type { CastrSchemaComponent } from '../../src/schema-processing/ir/index.js';

import { writeJsonSchemaBundle } from '../../src/schema-processing/writers/json-schema/index.js';

import {
  ARBITRARY_FIXTURES,
  parseToIR,
  expectNoParseErrors,
  generateZodFromOpenAPI,
  writeOpenApi,
  parseZodSource,
} from '../utils/transform-helpers.js';

// ============================================================================
// Scenario 7: Multi-Cast
// ============================================================================

describe('Transform Scenario 7: Multi-Cast (Single IR → Multiple Outputs)', () => {
  describe('Schema name consistency across all outputs', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: all three outputs share identical schema names',
      async (_name, path) => {
        // Parse to IR (single source of truth)
        const ir = await parseToIR(path);
        const schemaComponents = ir.components.filter(
          (c): c is CastrSchemaComponent => c.type === 'schema',
        );

        // Output 1: OpenAPI
        const openApiOutput = writeOpenApi(ir);
        const openApiSchemaNames = Object.keys(openApiOutput.components?.schemas ?? {}).sort();

        // Output 2: JSON Schema Bundle
        const jsonSchemaBundle = writeJsonSchemaBundle(schemaComponents);
        const bundleDefs = jsonSchemaBundle['$defs'] ?? {};
        const jsonSchemaNames = Object.keys(bundleDefs).sort();

        // Output 3: Zod (via OpenAPI generator)
        const zodSource = await generateZodFromOpenAPI(openApiOutput);
        const zodResult = parseZodSource(zodSource);
        expectNoParseErrors(_name, 'Scenario 7 Zod parse', zodResult);
        const zodSchemaNames = zodResult.ir.components.map((c) => c.name).sort();

        // All three must share the same set of schema names
        expect(jsonSchemaNames).toEqual(openApiSchemaNames);
        expect(zodSchemaNames).toEqual(openApiSchemaNames);
      },
    );
  });

  describe('Schema count consistency across all outputs', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: all three outputs have the same schema count',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const schemaComponents = ir.components.filter(
          (c): c is CastrSchemaComponent => c.type === 'schema',
        );
        const expectedCount = schemaComponents.length;

        // OpenAPI
        const openApiOutput = writeOpenApi(ir);
        const openApiCount = Object.keys(openApiOutput.components?.schemas ?? {}).length;
        expect(openApiCount).toBe(expectedCount);

        // JSON Schema
        const jsonSchemaBundle = writeJsonSchemaBundle(schemaComponents);
        const bundleDefs = jsonSchemaBundle['$defs'] ?? {};
        const jsonSchemaCount = Object.keys(bundleDefs).length;
        expect(jsonSchemaCount).toBe(expectedCount);

        // Zod
        const zodSource = await generateZodFromOpenAPI(openApiOutput);
        const zodResult = parseZodSource(zodSource);
        expectNoParseErrors(_name, 'Scenario 7 Zod parse', zodResult);
        expect(zodResult.ir.components.length).toBe(expectedCount);
      },
    );
  });

  describe('Zod output validity', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: generated Zod source parses without errors',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const openApiOutput = writeOpenApi(ir);
        const zodSource = await generateZodFromOpenAPI(openApiOutput);
        const zodResult = parseZodSource(zodSource);

        expectNoParseErrors(_name, 'Scenario 7 Zod output', zodResult);
      },
    );
  });

  describe('JSON Schema bundle validity', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: JSON Schema bundle has $schema and $defs with expected keys',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const schemaComponents = ir.components.filter(
          (c): c is CastrSchemaComponent => c.type === 'schema',
        );

        const bundle = writeJsonSchemaBundle(schemaComponents);

        // Must have $schema dialect
        expect(bundle['$schema']).toBe('https://json-schema.org/draft/2020-12/schema');

        // Must have $defs if there are schemas
        if (schemaComponents.length > 0) {
          const bundleDefs = bundle['$defs'];
          expect(bundleDefs).toBeDefined();
          if (bundleDefs) {
            expect(Object.keys(bundleDefs).length).toBe(schemaComponents.length);
          }
        }
      },
    );
  });
});
