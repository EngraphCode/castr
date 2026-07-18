/**
 * Zod Parser Fixture Round-Trip (e2e)
 *
 * Verifies that the Zod parser parses every happy-path fixture on disk and
 * produces the exact expected IR JSON. Lives in the e2e gate because it reads
 * fixture files from the filesystem — `test-hygiene.arch.test.ts` forbids
 * filesystem imports in the suites the primary `pnpm test` gate collects
 * (outside its named shrink-only baseline), so fixture-driven IO belongs
 * here.
 *
 * Every `<name>.zod4.ts` fixture MUST have a `<name>.expected.json` sibling —
 * a missing expectation fails the suite rather than being skipped.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { JsonObject, JsonValue } from 'type-fest';
import { AssertionError } from 'node:assert/strict';
import { parseZodSource } from '../src/schema-processing/parsers/zod/zod-parser.js';
import type { CastrSchema } from '../src/schema-processing/ir/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = path.resolve(__dirname, '../tests-fixtures/zod-parser/happy-path');

interface ExpectedFixtureEnvelope {
  $schema?: string;
  schemas: JsonObject;
}

function isPlainObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  return isJsonObject(value);
}

function isJsonObject(value: unknown): value is JsonObject {
  return isPlainObject(value) && Object.values(value).every(isJsonValue);
}

function getExpectedFixture(value: unknown, baseName: string): ExpectedFixtureEnvelope {
  if (!isJsonObject(value)) {
    throw new AssertionError({
      message: `Expected JSON root to be an object for ${baseName}`,
    });
  }

  const schemaRef = value['$schema'];
  if (schemaRef !== undefined && typeof schemaRef !== 'string') {
    throw new AssertionError({
      message: `Expected "$schema" to be a string for ${baseName}`,
    });
  }

  const schemas = value['schemas'];
  if (!isJsonObject(schemas)) {
    throw new AssertionError({
      message: `Expected JSON format not recognized for ${baseName}`,
    });
  }

  return {
    ...(schemaRef === undefined ? {} : { $schema: schemaRef }),
    schemas,
  };
}

describe('Zod Parser Fixture Round-Trip', () => {
  const files = fs.readdirSync(FIXTURES_DIR);
  const zodFiles = files.filter((f) => f.endsWith('.zod4.ts'));

  it('discovers happy-path fixtures', () => {
    expect(zodFiles.length).toBeGreaterThan(0);
  });

  for (const zodFile of zodFiles) {
    const baseName = zodFile.replace('.zod4.ts', '');
    const expectedFile = `${baseName}.expected.json`;

    it(`matches expected output for ${baseName}`, () => {
      // Fail fast on a missing expectation — never soft-skip a fixture.
      expect(files).toContain(expectedFile);

      const sourceContent = fs.readFileSync(path.join(FIXTURES_DIR, zodFile), 'utf-8');
      const expectedContent = fs.readFileSync(path.join(FIXTURES_DIR, expectedFile), 'utf-8');

      const expectedJson: unknown = JSON.parse(expectedContent);

      const result = parseZodSource(sourceContent);

      // Happy-path fixtures must parse without errors; toEqual prints the
      // errors on failure.
      expect(result.errors).toEqual([]);

      // The expected JSON format is { schemas: { Name: Schema } }; the parser
      // outputs { ir: { components: [ { name, schema } ] } }. Transform the
      // parser output to the expected map shape for comparison.
      const parserOutputMap: Record<string, CastrSchema> = {};
      for (const component of result.ir.components) {
        if (component.type === 'schema') {
          parserOutputMap[component.name] = component.schema;
        }
      }

      const expectedFixture = getExpectedFixture(expectedJson, baseName);
      const serializedBoundary: unknown = JSON.parse(JSON.stringify(parserOutputMap));

      if (!isJsonObject(serializedBoundary)) {
        throw new AssertionError({
          message: `Serialized parser output is not an object for ${baseName}`,
        });
      }

      // Strict equality — serialize to JSON first to match the
      // CastrSchemaProperties format. `toEqual` (not `toMatchObject`) so an
      // unintended extra schema or extra nested IR field fails the round-trip
      // exactly like a missing one.
      expect(serializedBoundary).toEqual(expectedFixture.schemas);
    });
  }
});
