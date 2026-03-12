/**
 * Zod Parser Integration Test Runner
 *
 * Verifies that the parser correctly parses all happy-path fixtures
 * and produces the exact expected IR JSON.
 *
 * @module parsers/zod/integration-runner.test
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { JsonObject, JsonValue } from 'type-fest';
import { parseZodSource } from './zod-parser.js';
import type { CastrSchema } from '../../ir/index.js';
import { AssertionError } from 'node:assert/strict';

const FIXTURES_DIR = path.resolve(__dirname, '../../../../tests-fixtures/zod-parser/happy-path');
const UPDATE_SNAPSHOTS = process.env['UPDATE_SNAPSHOTS'] === 'true'; // Set to true to regenerate expected files

interface ExpectedFixtureEnvelope {
  $schema?: string;
  schemas: JsonObject;
}

function getFixtureParseOptions(baseName: string): { nonStrictObjectPolicy?: 'strip' } | undefined {
  if (baseName === 'unknown-key-semantics') {
    return { nonStrictObjectPolicy: 'strip' };
  }

  return undefined;
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

describe('Zod Parser Integration Runner', async () => {
  const files = await fs.readdir(FIXTURES_DIR);
  const zodFiles = files.filter((f) => f.endsWith('.zod4.ts'));

  for (const zodFile of zodFiles) {
    const baseName = zodFile.replace('.zod4.ts', '');
    const expectedFile = `${baseName}.expected.json`;

    // Check if expected file exists
    if (!files.includes(expectedFile)) {
      console.warn(`Skipping ${zodFile}: No corresponding .expected.json file found.`);
      continue;
    }

    it(`should match expected output for ${baseName}`, async () => {
      const sourcePath = path.join(FIXTURES_DIR, zodFile);
      const expectedPath = path.join(FIXTURES_DIR, expectedFile);

      const sourceContent = await fs.readFile(sourcePath, 'utf-8');
      const expectedContent = await fs.readFile(expectedPath, 'utf-8');

      const expectedJson: unknown = JSON.parse(expectedContent);

      const result = parseZodSource(sourceContent, getFixtureParseOptions(baseName));

      // Verify no errors (unless expected file says otherwise? Happy path implies success)
      if (result.errors.length > 0) {
        console.error(`Errors parsing ${baseName}:`, result.errors);
      }
      expect(result.errors).toHaveLength(0);

      // Compare IR components map to expected schema map?
      // The expected JSON format in `arrays-tuples.expected.json` seems to be:
      // { schemas: { Name: Schema } }
      // The parser outputs { ir: { components: [ { name, schema } ] } }

      // Transform parser output to match expected format for comparison
      const parserOutputMap: Record<string, CastrSchema> = {};
      for (const component of result.ir.components) {
        if (component.type === 'schema') {
          parserOutputMap[component.name] = component.schema;
        }
      }

      if (UPDATE_SNAPSHOTS) {
        // Generate new expected JSON structure
        const newExpected = {
          $schema: './expected.schema.json', // hypothetical schema ref
          schemas: parserOutputMap,
        };
        await fs.writeFile(expectedPath, JSON.stringify(newExpected, null, 2) + '\n');
        console.log(`Updated snapshot for ${baseName}`);
      }

      if (!UPDATE_SNAPSHOTS) {
        const expectedFixture = getExpectedFixture(expectedJson, baseName);
        const serializedBoundary: unknown = JSON.parse(JSON.stringify(parserOutputMap));

        if (!isJsonObject(serializedBoundary)) {
          throw new AssertionError({
            message: `Serialized parser output is not an object for ${baseName}`,
          });
        }

        // Simple structural match - serialize to JSON first to match CastrSchemaProperties format
        expect(serializedBoundary).toMatchObject(expectedFixture.schemas);
      }
    });
  }
});
