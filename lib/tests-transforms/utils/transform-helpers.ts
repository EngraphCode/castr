/**
 * Shared transform test helpers and fixture constants.
 *
 * Extracted from the original `transform-samples.integration.test.ts`
 * to enable per-scenario test file splitting and reuse across
 * scenarios 1–7.
 *
 * @module tests-transforms/utils/transform-helpers
 */

import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { expect } from 'vitest';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
import { writeOpenApi } from '../../src/schema-processing/writers/openapi/index.js';
import type { parseZodSource } from '../../src/schema-processing/parsers/zod/index.js';
import { generateZodClientFromOpenAPI } from '../../src/rendering/generate-from-context.js';
import { isSingleFileResult } from '../../src/rendering/generation-result.js';

import * as Zod1 from 'zod';
import { ParityPayloadHarness } from '../../tests-fixtures/zod-parser/happy-path/payloads.js';

// ============================================================================
// Fixture Constants
// ============================================================================

const ARBITRARY_FIXTURES_DIR = resolve(__dirname, '../__fixtures__/arbitrary');

/**
 * Arbitrary fixtures — real-world OpenAPI specs for losslessness testing.
 * Format: [displayName, absolutePath]
 */
export const ARBITRARY_FIXTURES: [string, string][] = [
  ['tictactoe-3.1.yaml', `${ARBITRARY_FIXTURES_DIR}/tictactoe-3.1.yaml`],
  ['webhook-3.1.yaml', `${ARBITRARY_FIXTURES_DIR}/webhook-3.1.yaml`],
  ['petstore-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/petstore-3.0.yaml`],
  ['petstore-expanded-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/petstore-expanded-3.0.yaml`],
  ['callback-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/callback-3.0.yaml`],
  [
    'trading212.json',
    resolve(__dirname, '../../tests-fixtures/openapi-samples/real-world/trading212.json'),
  ],
];

const ZOD_FIXTURES_DIR = resolve(__dirname, '../../tests-fixtures/zod-parser/happy-path');

/**
 * Zod parser fixtures — valid Zod 4 schema declarations for transform testing.
 * Format: [displayName, absolutePath]
 */
export const ZOD_FIXTURES: [string, string][] = [
  ['objects', `${ZOD_FIXTURES_DIR}/objects.zod4.ts`],
  ['string-formats', `${ZOD_FIXTURES_DIR}/string-formats.zod4.ts`],
  ['constraints', `${ZOD_FIXTURES_DIR}/constraints.zod4.ts`],
];

/**
 * Fixtures that expose known parser/writer defects.
 * Skipped in CI per plan 3.3b-06 to separate fixture coverage from parser fixes.
 */
export const ZOD_DEFECT_FIXTURES: [string, string][] = [
  ['unions', `${ZOD_FIXTURES_DIR}/unions.zod4.ts`],
  ['intersections', `${ZOD_FIXTURES_DIR}/intersections.zod4.ts`],
  ['recursion', `${ZOD_FIXTURES_DIR}/recursion.zod4.ts`],
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parses an OpenAPI spec to IR.
 */
export async function parseToIR(specPath: string): Promise<ReturnType<typeof buildIR>> {
  const result = await loadOpenApiDocument(specPath);
  return buildIR(result.document);
}

/**
 * Performs a transform round-trip pass: parse → write → parse.
 * Returns both the original IR and the transformed IR for comparison.
 */
export async function runTransformPass(
  specPath: string,
): Promise<{ originalIR: ReturnType<typeof buildIR>; transformedIR: ReturnType<typeof buildIR> }> {
  // Parse original spec to IR
  const originalIR = await parseToIR(specPath);

  // Write IR to OpenAPI
  const openApiOutput = writeOpenApi(originalIR);

  // Parse the output back to IR (using in-memory document)
  const transformedIR = buildIR(openApiOutput);

  return { originalIR, transformedIR };
}

/**
 * Generate Zod TypeScript source from an OpenAPI document using the REAL generator.
 * This tests actual system output, not a mock or test helper.
 */
export async function generateZodFromOpenAPI(
  openApiDoc: ReturnType<typeof writeOpenApi>,
): Promise<string> {
  const result = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
  });

  if (!isSingleFileResult(result)) {
    throw new Error('Expected single file result');
  }

  return result.content;
}

/**
 * Assert that parsing produced no errors, with fixture-scoped context.
 */
export function expectNoParseErrors(
  fixtureName: string,
  stage: string,
  parseResult: ReturnType<typeof parseZodSource>,
): void {
  expect(
    parseResult.errors,
    `${fixtureName}: parse errors in ${stage}\n${JSON.stringify(parseResult.errors, null, 2)}`,
  ).toHaveLength(0);
}

/**
 * Execute dynamic Zod schemas to evaluate data.
 */
export async function loadDynamicZodSchemas(
  zodSourceCode: string,
): Promise<Record<string, Zod1.ZodTypeAny>> {
  // Transpile the generated Zod TS source (which contains top-level exports) into executable code
  const ts = await import('typescript');
  const compiled = ts.default.transpile(zodSourceCode, { module: ts.default.ModuleKind.CommonJS });

  // Safely execute the compiled module with a stubbed require
  const module = { exports: {} as Record<string, Zod1.ZodTypeAny> };
  const requireHook = (id: string) => {
    if (id === 'zod') {
      return Zod1;
    }
    throw new Error(`Unexpected require in generated code: ${id}`);
  };

  // eslint-disable-next-line sonarjs/code-eval -- Allowed in test harness for dynamic schema evaluation
  const executableFn = new Function('require', 'module', 'exports', compiled);
  executableFn(requireHook, module, module.exports);

  return module.exports;
}

/**
 * Validates functional equivalence of two maps of schemas against shared payloads.
 * Ensures the 'before' schema and 'after' schema accept/reject identical data.
 */
export function assertValidationParity(
  fixtureName: string,
  originalSchemas: Record<string, Zod1.ZodTypeAny>,
  transformedSchemas: Record<string, Zod1.ZodTypeAny>,
): void {
  const harness = ParityPayloadHarness[fixtureName];
  if (!harness) {
    return;
  } // Skip if no payloads defined

  for (const [schemaName, payloads] of Object.entries(harness)) {
    const originalSchema = originalSchemas[schemaName];
    const transformedSchema =
      transformedSchemas[schemaName] || transformedSchemas[schemaName.replace(/Schema$/, '')];

    // Ensure the schema exists on both sides
    expect(originalSchema).toBeDefined();
    expect(transformedSchema).toBeDefined();

    if (!originalSchema || !transformedSchema) {
      throw new Error(`Parity schemas missing for ${schemaName}`);
    }

    // Assert same success/fail outcome for all valid payloads
    for (const validPayload of payloads.valid) {
      const originalResult = originalSchema.safeParse(validPayload);
      const transformedResult = transformedSchema.safeParse(validPayload);

      expect(
        transformedResult.success,
        `Schema ${schemaName} parity mismatch on valid payload`,
      ).toBe(originalResult.success);
      expect(transformedResult.success).toBe(true);
    }

    // Assert same success/fail outcome for all invalid payloads
    for (const invalidPayload of payloads.invalid) {
      const originalResult = originalSchema.safeParse(invalidPayload);
      const transformedResult = transformedSchema.safeParse(invalidPayload);

      expect(
        transformedResult.success,
        `Schema ${schemaName} parity mismatch on invalid payload`,
      ).toBe(originalResult.success);
      expect(transformedResult.success).toBe(false);
    }
  }
}

/**
 * Read a Zod fixture file.
 */
export async function readZodFixture(path: string): Promise<string> {
  return readFile(path, 'utf-8');
}

// Re-export dependencies for test files
export { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
export { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
export { writeOpenApi } from '../../src/schema-processing/writers/openapi/index.js';
export { parseZodSource } from '../../src/schema-processing/parsers/zod/index.js';
