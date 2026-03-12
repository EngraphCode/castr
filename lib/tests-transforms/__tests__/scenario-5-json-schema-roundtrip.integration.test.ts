/**
 * Transform Scenario 5: JSON Schema → IR → JSON Schema (Idempotence)
 *
 * Proves that the JSON Schema parser + writer pair produces lossless
 * and idempotent round-trips through the IR.
 *
 * Pipeline: parseJsonSchemaDocument(fixture) → CastrSchemaComponent[]
 *           → writeJsonSchemaBundle(components) → JSON output
 *
 * @see ADR-027 Transform Validation with Sample Input as Correctness Proof
 * @see ADR-035 Transform Validation Parity
 */

import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { parseJsonSchemaDocument } from '../../src/schema-processing/parsers/json-schema/index.js';
import { writeJsonSchemaBundle } from '../../src/schema-processing/writers/json-schema/index.js';
import type { Draft07Input } from '../../src/schema-processing/parsers/json-schema/index.js';

const JSON_SCHEMA_COMPATIBILITY_OPTIONS = { nonStrictObjectPolicy: 'strip' } as const;

// ============================================================================
// Fixtures
// ============================================================================

const JSON_SCHEMA_FIXTURES_DIR = resolve(__dirname, '../__fixtures__/json-schema');

/**
 * JSON Schema 2020-12 fixtures for round-trip testing.
 * Format: [displayName, absolutePath]
 */
const JSON_SCHEMA_FIXTURES: [string, string][] = [
  ['objects', `${JSON_SCHEMA_FIXTURES_DIR}/objects.json`],
  ['constraints', `${JSON_SCHEMA_FIXTURES_DIR}/constraints.json`],
  ['string-formats', `${JSON_SCHEMA_FIXTURES_DIR}/string-formats.json`],
  ['composition', `${JSON_SCHEMA_FIXTURES_DIR}/composition.json`],
  ['nullable', `${JSON_SCHEMA_FIXTURES_DIR}/nullable.json`],
  ['2020-12-keywords', `${JSON_SCHEMA_FIXTURES_DIR}/2020-12-keywords.json`],
  ['unions', `${JSON_SCHEMA_FIXTURES_DIR}/unions.json`],
  ['intersections', `${JSON_SCHEMA_FIXTURES_DIR}/intersections.json`],
  ['recursion', `${JSON_SCHEMA_FIXTURES_DIR}/recursion.json`],
];

function assertDraft07Input(value: unknown, context: string): asserts value is Draft07Input {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Expected JSON Schema object in ${context}`);
  }
}

/**
 * Load and parse a JSON Schema fixture file.
 */
async function loadJsonSchemaFixture(path: string): Promise<Draft07Input> {
  const content = await readFile(path, 'utf-8');
  const parsed = JSON.parse(content);
  assertDraft07Input(parsed, `JSON Schema fixture ${path}`);
  return parsed;
}

/**
 * Extract $defs keys from a JSON Schema document.
 */
function getDefsKeys(doc: Draft07Input | ReturnType<typeof writeJsonSchemaBundle>): string[] {
  const defs = '$defs' in doc ? doc['$defs'] : undefined;
  if (typeof defs !== 'object' || defs === null) {
    return [];
  }
  return Object.keys(defs).sort();
}

// ============================================================================
// Scenario 5: JSON Schema → IR → JSON Schema (Losslessness)
// ============================================================================

describe('Transform Scenario 5: JSON Schema → IR → JSON Schema', () => {
  describe('Losslessness: IR is preserved through round-trip', () => {
    it.each(JSON_SCHEMA_FIXTURES)(
      '%s: parse → write → re-parse yields deep-equal IR',
      async (_name, path) => {
        const fixture = await loadJsonSchemaFixture(path);

        // First pass: JSON Schema → IR
        const components1 = parseJsonSchemaDocument(fixture, JSON_SCHEMA_COMPATIBILITY_OPTIONS);
        expect(components1.length).toBeGreaterThan(0);

        // Write IR back to JSON Schema
        const output1 = writeJsonSchemaBundle(components1);

        // Second pass: re-parse the output
        const components2 = parseJsonSchemaDocument(output1, JSON_SCHEMA_COMPATIBILITY_OPTIONS);

        // IR deep-equals: same schemas, same structure
        expect(components2.length).toBe(components1.length);

        // Compare schema names
        const names1 = components1.map((c) => c.name).sort();
        const names2 = components2.map((c) => c.name).sort();
        expect(names2).toEqual(names1);

        // Compare individual schema components by name
        for (const comp1 of components1) {
          const comp2 = components2.find((c) => c.name === comp1.name);
          expect(comp2, `Component '${comp1.name}' missing after round-trip`).toBeDefined();
          if (!comp2) {
            throw new Error(`Component '${comp1.name}' missing after round-trip`);
          }
          expect(comp2.schema).toEqual(comp1.schema);
        }
      },
    );
  });

  describe('Schema count preservation', () => {
    it.each(JSON_SCHEMA_FIXTURES)(
      '%s: component count preserved through round-trip',
      async (_name, path) => {
        const fixture = await loadJsonSchemaFixture(path);
        const components = parseJsonSchemaDocument(fixture, JSON_SCHEMA_COMPATIBILITY_OPTIONS);
        const output = writeJsonSchemaBundle(components);
        const roundTripped = parseJsonSchemaDocument(output, JSON_SCHEMA_COMPATIBILITY_OPTIONS);

        expect(roundTripped.length).toBe(components.length);
      },
    );
  });

  describe('$defs key preservation', () => {
    it.each(JSON_SCHEMA_FIXTURES)(
      '%s: all $defs keys preserved through round-trip',
      async (_name, path) => {
        const fixture = await loadJsonSchemaFixture(path);
        const inputDefs = getDefsKeys(fixture);

        const components = parseJsonSchemaDocument(fixture, JSON_SCHEMA_COMPATIBILITY_OPTIONS);
        const output = writeJsonSchemaBundle(components);
        const outputDefs = getDefsKeys(output);

        expect(outputDefs).toEqual(inputDefs);
      },
    );
  });

  // ============================================================================
  // Idempotency (Output Stability)
  // ============================================================================

  describe('Idempotency: Normalized output is byte-stable', () => {
    it.each(JSON_SCHEMA_FIXTURES)(
      '%s: second pass produces byte-identical output',
      async (_name, path) => {
        const fixture = await loadJsonSchemaFixture(path);

        // First pass: fixture → IR → JSON Schema
        const components1 = parseJsonSchemaDocument(fixture, JSON_SCHEMA_COMPATIBILITY_OPTIONS);
        const output1 = writeJsonSchemaBundle(components1);

        // Second pass: output1 → IR → JSON Schema
        const components2 = parseJsonSchemaDocument(output1, JSON_SCHEMA_COMPATIBILITY_OPTIONS);
        const output2 = writeJsonSchemaBundle(components2);

        // Byte-identical comparison
        expect(JSON.stringify(output2)).toBe(JSON.stringify(output1));
      },
    );
  });
});
