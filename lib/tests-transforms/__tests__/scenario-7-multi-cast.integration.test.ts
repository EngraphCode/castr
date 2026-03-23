/**
 * Transform Scenario 7: Multi-Cast (Single IR → Zod + JSON Schema + OpenAPI)
 *
 * Proves that a single IR can produce structurally aligned output across the
 * currently supported subset of Zod, JSON Schema, and OpenAPI paths.
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

const JSON_SCHEMA_INT64_REJECTION =
  /JSON Schema 2020-12 cannot represent signed 64-bit integer semantics natively/;
const JSON_SCHEMA_SUPPORTED_FIXTURE_NAMES = new Set(['tictactoe-3.1.yaml', 'callback-3.0.yaml']);
const JSON_SCHEMA_SUPPORTED_FIXTURES = ARBITRARY_FIXTURES.filter(([name]) =>
  JSON_SCHEMA_SUPPORTED_FIXTURE_NAMES.has(name),
);
const JSON_SCHEMA_REJECTED_FIXTURES = ARBITRARY_FIXTURES.filter(
  ([name]) => !JSON_SCHEMA_SUPPORTED_FIXTURE_NAMES.has(name),
);

function getSchemaComponents(ir: Awaited<ReturnType<typeof parseToIR>>): CastrSchemaComponent[] {
  return ir.components.filter(
    (component): component is CastrSchemaComponent => component.type === 'schema',
  );
}

async function generateParsedZod(openApiOutput: ReturnType<typeof writeOpenApi>) {
  const zodSource = await generateZodFromOpenAPI(openApiOutput);
  const zodResult = parseZodSource(zodSource);

  return { zodSource, zodResult };
}

// ============================================================================
// Scenario 7: Multi-Cast
// ============================================================================

describe('Transform Scenario 7: Multi-Cast (Single IR → Multiple Outputs)', () => {
  describe('Schema name consistency across supported outputs', () => {
    it.each(JSON_SCHEMA_SUPPORTED_FIXTURES)(
      '%s: all three outputs share identical schema names',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const schemaComponents = getSchemaComponents(ir);

        const openApiOutput = writeOpenApi(ir);
        const openApiSchemaNames = Object.keys(openApiOutput.components?.schemas ?? {}).sort();

        const jsonSchemaBundle = writeJsonSchemaBundle(schemaComponents);
        const bundleDefs = jsonSchemaBundle['$defs'] ?? {};
        const jsonSchemaNames = Object.keys(bundleDefs).sort();

        const { zodResult } = await generateParsedZod(openApiOutput);
        expectNoParseErrors(_name, 'Scenario 7 Zod parse', zodResult);
        const zodSchemaNames = zodResult.ir.components.map((c) => c.name).sort();

        expect(jsonSchemaNames).toEqual(openApiSchemaNames);
        expect(zodSchemaNames).toEqual(openApiSchemaNames);
      },
    );

    it.each(JSON_SCHEMA_REJECTED_FIXTURES)(
      '%s: OpenAPI and Zod stay aligned while JSON Schema rejects int64 semantics',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const schemaComponents = getSchemaComponents(ir);

        const openApiOutput = writeOpenApi(ir);
        const openApiSchemaNames = Object.keys(openApiOutput.components?.schemas ?? {}).sort();

        expect(() => writeJsonSchemaBundle(schemaComponents)).toThrow(JSON_SCHEMA_INT64_REJECTION);

        const { zodResult } = await generateParsedZod(openApiOutput);
        expectNoParseErrors(_name, 'Scenario 7 Zod parse', zodResult);

        const zodSchemaNames = zodResult.ir.components.map((component) => component.name).sort();
        expect(zodSchemaNames).toEqual(openApiSchemaNames);
      },
    );
  });

  describe('Schema count consistency across supported outputs', () => {
    it.each(JSON_SCHEMA_SUPPORTED_FIXTURES)(
      '%s: all three outputs have the same schema count',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const schemaComponents = getSchemaComponents(ir);
        const expectedCount = schemaComponents.length;

        const openApiOutput = writeOpenApi(ir);
        const openApiCount = Object.keys(openApiOutput.components?.schemas ?? {}).length;
        expect(openApiCount).toBe(expectedCount);

        const jsonSchemaBundle = writeJsonSchemaBundle(schemaComponents);
        const bundleDefs = jsonSchemaBundle['$defs'] ?? {};
        const jsonSchemaCount = Object.keys(bundleDefs).length;
        expect(jsonSchemaCount).toBe(expectedCount);

        const { zodResult } = await generateParsedZod(openApiOutput);
        expectNoParseErrors(_name, 'Scenario 7 Zod parse', zodResult);
        expect(zodResult.ir.components.length).toBe(expectedCount);
      },
    );

    it.each(JSON_SCHEMA_REJECTED_FIXTURES)(
      '%s: OpenAPI and Zod preserve schema count while JSON Schema rejects int64 semantics',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const schemaComponents = getSchemaComponents(ir);
        const openApiOutput = writeOpenApi(ir);
        const expectedCount = schemaComponents.length;

        expect(Object.keys(openApiOutput.components?.schemas ?? {})).toHaveLength(expectedCount);
        expect(() => writeJsonSchemaBundle(schemaComponents)).toThrow(JSON_SCHEMA_INT64_REJECTION);

        const { zodResult } = await generateParsedZod(openApiOutput);
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
        const { zodResult } = await generateParsedZod(openApiOutput);

        expectNoParseErrors(_name, 'Scenario 7 Zod output', zodResult);
      },
    );
  });

  describe('JSON Schema bundle validity', () => {
    it.each(JSON_SCHEMA_SUPPORTED_FIXTURES)(
      '%s: JSON Schema bundle has $schema and $defs with expected keys',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const schemaComponents = getSchemaComponents(ir);

        const bundle = writeJsonSchemaBundle(schemaComponents);

        expect(bundle['$schema']).toBe('https://json-schema.org/draft/2020-12/schema');

        if (schemaComponents.length > 0) {
          const bundleDefs = bundle['$defs'];
          expect(bundleDefs).toBeDefined();
          if (bundleDefs) {
            expect(Object.keys(bundleDefs).length).toBe(schemaComponents.length);
          }
        }
      },
    );

    it.each(JSON_SCHEMA_REJECTED_FIXTURES)(
      '%s: JSON Schema bundle rejects unsupported int64 semantics early',
      async (_name, path) => {
        const ir = await parseToIR(path);
        const schemaComponents = getSchemaComponents(ir);

        expect(() => writeJsonSchemaBundle(schemaComponents)).toThrow(JSON_SCHEMA_INT64_REJECTION);
      },
    );
  });
});
