#!/usr/bin/env npx tsx
/**
 * Generate Normalized Fixtures
 *
 * Takes arbitrary OpenAPI specs and generates normalized output for inspection.
 * Creates six files for each input:
 * - input.yaml (original, symlinked)
 * - normalized.json (first pass output)
 * - reprocessed.json (second pass output — should be identical to normalized)
 * - ir.json (intermediate representation from first pass)
 * - ir2.json (intermediate representation from second pass)
 * - zod.ts (generated Zod schemas from the IR)
 *
 * Usage:
 *   npx tsx scripts/generate-normalized-fixtures.ts
 *
 * Output:
 *   lib/tests-roundtrip/__fixtures__/normalized/{fixture-name}/
 *     - input.yaml (symlink to original)
 *     - normalized.json
 *     - reprocessed.json
 *     - ir.json
 *     - ir2.json
 *     - zod.ts
 */

import { existsSync, mkdirSync, writeFileSync, symlinkSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildIR } from '../src/schema-processing/parsers/openapi/index.js';
import { loadOpenApiDocument } from '../src/shared/load-openapi-document/index.js';
import { writeOpenApi } from '../src/schema-processing/writers/openapi/index.js';
import { generateZodClientFromOpenAPI, isSingleFileResult } from '../src/rendering/index.js';

const ARBITRARY_FIXTURES_DIR = resolve(
  import.meta.dirname,
  '../tests-roundtrip/__fixtures__/arbitrary',
);
const OUTPUT_DIR = resolve(import.meta.dirname, '../tests-roundtrip/__fixtures__/normalized');

const FIXTURES = [
  'tictactoe-3.1.yaml',
  'webhook-3.1.yaml',
  'petstore-3.0.yaml',
  'petstore-expanded-3.0.yaml',
  'callback-3.0.yaml',
  'oak-api.json',
];

/** Ensure directory exists, creating if necessary. */
function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/** Write JSON file with pretty printing. */
function writeJson(filePath: string, data: unknown): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  → ${filePath}`);
}

/** Write text file. */
function writeText(filePath: string, content: string): void {
  writeFileSync(filePath, content);
  console.log(`  → ${filePath}`);
}

/** Create symlink, removing existing if present. */
function createSymlink(target: string, linkPath: string): void {
  if (existsSync(linkPath)) {
    unlinkSync(linkPath);
  }
  symlinkSync(target, linkPath);
  console.log(`  → ${linkPath} (symlink)`);
}

/** Convert IR to serializable format (convert Map to array of entries). */
function serializeIR(ir: unknown): unknown {
  return JSON.parse(
    JSON.stringify(ir, (_key, value: unknown) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      return value;
    }),
  );
}

/** Process a single fixture through the pipeline. */
async function processFixture(fixtureName: string): Promise<void> {
  const inputPath = resolve(ARBITRARY_FIXTURES_DIR, fixtureName);
  const outputDirName = fixtureName.replace(/\.(yaml|yml|json)$/, '');
  const fixtureOutputDir = resolve(OUTPUT_DIR, outputDirName);

  console.log(`Processing: ${fixtureName}`);
  ensureDir(fixtureOutputDir);

  // Load and transform
  const result = await loadOpenApiDocument(inputPath);
  const ir = buildIR(result.document);
  const normalized = writeOpenApi(ir);
  const ir2 = buildIR(normalized);
  const reprocessed = writeOpenApi(ir2);

  // Write OpenAPI outputs
  writeJson(resolve(fixtureOutputDir, 'normalized.json'), normalized);
  writeJson(resolve(fixtureOutputDir, 'reprocessed.json'), reprocessed);

  // Write IR outputs for debugging
  writeJson(resolve(fixtureOutputDir, 'ir.json'), serializeIR(ir));
  writeJson(resolve(fixtureOutputDir, 'ir2.json'), serializeIR(ir2));

  // Generate Zod TypeScript output
  await writeZodOutput(inputPath, fixtureOutputDir);

  // Symlink input
  const ext = fixtureName.split('.').pop();
  createSymlink(`../../arbitrary/${fixtureName}`, resolve(fixtureOutputDir, `input.${ext}`));

  console.log('');
}

/** Generate and write Zod output for a fixture. */
async function writeZodOutput(inputPath: string, outputDir: string): Promise<void> {
  const zodResult = await generateZodClientFromOpenAPI({
    input: inputPath,
    disableWriteToFile: true,
  });
  if (isSingleFileResult(zodResult)) {
    writeText(resolve(outputDir, 'zod.ts'), zodResult.content);
  } else {
    for (const [fileName, content] of Object.entries(zodResult.files)) {
      const safeFileName = fileName.replace(/[/\\]/g, '_');
      writeText(resolve(outputDir, `zod_${safeFileName}`), content);
    }
  }
}

async function generateNormalizedFixtures(): Promise<void> {
  console.log('Generating normalized fixtures...\n');
  ensureDir(OUTPUT_DIR);

  for (const fixtureName of FIXTURES) {
    await processFixture(fixtureName);
  }

  console.log('Done! All normalized fixtures generated.');
  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
}

generateNormalizedFixtures().catch((error: unknown) => {
  console.error('Error generating fixtures:', error);
  process.exit(1);
});
