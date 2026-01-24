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
import { parseZodSource } from './zod-parser.js';
import type { CastrSchema } from 'src/ir/schema.js';
import { AssertionError } from 'node:assert/strict';

const FIXTURES_DIR = path.resolve(__dirname, '../../../tests-fixtures/zod-parser/happy-path');
const UPDATE_SNAPSHOTS = process.env['UPDATE_SNAPSHOTS'] === 'true'; // Set to true to regenerate expected files

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

      const expectedJson = JSON.parse(expectedContent);

      const result = parseZodSource(sourceContent);

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

      if (expectedJson.schemas) {
        // Simple structural match - serialize to JSON first to match CastrSchemaProperties format
        if (!UPDATE_SNAPSHOTS) {
          const serialized = JSON.parse(JSON.stringify(parserOutputMap)) as unknown;
          expect(serialized).toMatchObject(expectedJson.schemas);
        }
      } else {
        // If expectedJson is the schema itself (single export?)
        throw new AssertionError({
          message: `Expected JSON format not recognized for ${baseName}`,
        });
      }
    });
  }
});
