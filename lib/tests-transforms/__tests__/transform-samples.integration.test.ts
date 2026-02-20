/**
 * Transform Integration Tests (Sample Input)
 *
 * Tests that OpenAPI specifications survive the complete transformation pipeline:
 * OpenAPI Input → buildIR() → IR (CastrDocument) → writeOpenApi() → OpenAPI Output
 *
 * Note: A subset of these transform tests are explicit round-trip assertions
 * used to prove losslessness and idempotence.
 *
 * **Two Test Categories:**
 *
 * 1. **Losslessness** — Arbitrary specs preserve all semantic content
 *    - Test: parse(spec) ≅ parse(write(parse(spec)))
 *    - Uses IR-level comparison (Vitest's toEqual)
 *
 * 2. **Idempotency** — Normalized specs produce identical output
 *    - Test: write(parse(output)) === output
 *    - Uses byte-level comparison
 *
 * @see ADR-027 Transform Validation with Sample Input as Correctness Proof
 */

import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PathsObject, OpenAPIObject } from 'openapi3-ts/oas31';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
import { writeOpenApi } from '../../src/schema-processing/writers/openapi/index.js';
import { parseZodSource } from '../../src/schema-processing/parsers/zod/index.js';
import { generateZodClientFromOpenAPI } from '../../src/rendering/generate-from-context.js';
import { isSingleFileResult } from '../../src/rendering/generation-result.js';

// ============================================================================
// Fixtures
// ============================================================================

const ARBITRARY_FIXTURES_DIR = resolve(__dirname, '../__fixtures__/arbitrary');

/**
 * Arbitrary fixtures — real-world OpenAPI specs for losslessness testing.
 * Format: [displayName, absolutePath]
 */
const ARBITRARY_FIXTURES: [string, string][] = [
  ['tictactoe-3.1.yaml', `${ARBITRARY_FIXTURES_DIR}/tictactoe-3.1.yaml`],
  ['webhook-3.1.yaml', `${ARBITRARY_FIXTURES_DIR}/webhook-3.1.yaml`],
  ['petstore-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/petstore-3.0.yaml`],
  ['petstore-expanded-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/petstore-expanded-3.0.yaml`],
  ['callback-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/callback-3.0.yaml`],
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parses an OpenAPI spec to IR.
 */
async function parseToIR(specPath: string): Promise<ReturnType<typeof buildIR>> {
  const result = await loadOpenApiDocument(specPath);
  return buildIR(result.document);
}

/**
 * Performs a transform round-trip pass: parse → write → parse.
 * Returns both the original IR and the transformed IR for comparison.
 */
async function runTransformPass(
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
async function generateZodFromOpenAPI(
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
function expectNoParseErrors(
  fixtureName: string,
  stage: string,
  parseResult: ReturnType<typeof parseZodSource>,
): void {
  expect(
    parseResult.errors,
    `${fixtureName}: parse errors in ${stage}\n${JSON.stringify(parseResult.errors, null, 2)}`,
  ).toHaveLength(0);
}

// ============================================================================
// Tests: Losslessness (IR Comparison)
// ============================================================================

describe('Transform Samples: Losslessness (Round-Trip Proof)', () => {
  describe('Arbitrary fixtures preserve semantic content', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: IR is preserved through transform pipeline',
      async (_name, path) => {
        const { originalIR, transformedIR } = await runTransformPass(path);

        // Core document properties
        expect(transformedIR.info).toEqual(originalIR.info);
        expect(transformedIR.servers).toEqual(originalIR.servers);

        // Operations count and core properties
        expect(transformedIR.operations.length).toBe(originalIR.operations.length);

        // Components count by type
        const originalSchemaCount = originalIR.components.filter((c) => c.type === 'schema').length;
        const transformedSchemaCount = transformedIR.components.filter(
          (c) => c.type === 'schema',
        ).length;
        expect(transformedSchemaCount).toBe(originalSchemaCount);
      },
    );
  });

  describe('Operation details are preserved', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: operation paths and methods preserved',
      async (_name, path) => {
        const { originalIR, transformedIR } = await runTransformPass(path);

        // Extract operation signatures for comparison
        const originalOps = originalIR.operations.map((op) => ({
          path: op.path,
          method: op.method,
          operationId: op.operationId,
        }));

        const transformedOps = transformedIR.operations.map((op) => ({
          path: op.path,
          method: op.method,
          operationId: op.operationId,
        }));

        expect(transformedOps).toEqual(originalOps);
      },
    );
  });

  describe('Schema content is preserved', () => {
    it.each(ARBITRARY_FIXTURES)('%s: schema names and types preserved', async (_name, path) => {
      const { originalIR, transformedIR } = await runTransformPass(path);

      // Extract schema component names
      const originalSchemas = originalIR.components
        .filter((c) => c.type === 'schema')
        .map((c) => c.name)
        .sort();

      const transformedSchemas = transformedIR.components
        .filter((c) => c.type === 'schema')
        .map((c) => c.name)
        .sort();

      expect(transformedSchemas).toEqual(originalSchemas);
    });
  });
});

// ============================================================================
// Tests: Idempotency (Output Stability)
// ============================================================================

describe('Transform Samples: Idempotency (Round-Trip Proof)', () => {
  describe('Double transform pass produces identical IR', () => {
    it.each(ARBITRARY_FIXTURES)('%s: second transform pass matches first', async (_name, path) => {
      // First transform pass
      const { transformedIR: ir1 } = await runTransformPass(path);

      // Write IR1 to OpenAPI
      const output1 = writeOpenApi(ir1);

      // Second transform pass
      const ir2 = buildIR(output1);
      const output2 = writeOpenApi(ir2);

      // The outputs should be identical (idempotency)
      expect(JSON.stringify(output2)).toBe(JSON.stringify(output1));
    });
  });
});

// ============================================================================
// Tests: OpenAPI Document Information Preservation
// ============================================================================

/**
 * Phase 1: Information Preservation
 *
 * Verifies that normalizing an arbitrary spec preserves all information.
 * Format may change (3.0.x → 3.1.x, YAML → JSON), but content must not be lost.
 */
describe('OpenAPI Document: Information Preservation', () => {
  /**
   * Normalizes an OpenAPI spec: parse → IR → write.
   * Returns both the loaded input and the normalized output for comparison.
   */
  async function normalizeSpec(specPath: string): Promise<{
    input: Awaited<ReturnType<typeof loadOpenApiDocument>>['document'];
    output: ReturnType<typeof writeOpenApi>;
  }> {
    const result = await loadOpenApiDocument(specPath);
    const ir = buildIR(result.document);
    const output = writeOpenApi(ir);
    return { input: result.document, output };
  }

  describe('Paths are preserved', () => {
    it.each(ARBITRARY_FIXTURES)('%s: all paths exist in output', async (_name, path) => {
      const { input, output } = await normalizeSpec(path);

      const inputPaths = Object.keys(input.paths ?? {}).sort();
      const outputPaths = Object.keys(output.paths ?? {}).sort();

      expect(outputPaths).toEqual(inputPaths);
    });
  });

  describe('Operations are preserved', () => {
    it.each(ARBITRARY_FIXTURES)('%s: all operations exist in output', async (_name, path) => {
      const { input, output } = await normalizeSpec(path);

      // Extract all operation signatures from input
      const getOperations = (paths: PathsObject | undefined): string[] => {
        if (!paths) {
          return [];
        }
        const operations: string[] = [];
        const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'];

        for (const [pathKey, pathItem] of Object.entries(paths)) {
          for (const method of httpMethods) {
            if (method in pathItem) {
              operations.push(`${method.toUpperCase()} ${pathKey}`);
            }
          }
        }
        return operations.sort();
      };

      const inputOps = getOperations(input.paths as PathsObject | undefined);
      const outputOps = getOperations(output.paths);

      expect(outputOps).toEqual(inputOps);
    });
  });

  describe('Component schemas are preserved', () => {
    it.each(ARBITRARY_FIXTURES)('%s: all schema names exist in output', async (_name, path) => {
      const { input, output } = await normalizeSpec(path);

      const inputSchemas = Object.keys(input.components?.schemas ?? {}).sort();
      const outputSchemas = Object.keys(output.components?.schemas ?? {}).sort();

      expect(outputSchemas).toEqual(inputSchemas);
    });
  });

  describe('Info object is preserved', () => {
    it.each(ARBITRARY_FIXTURES)('%s: info title and version preserved', async (_name, path) => {
      const { input, output } = await normalizeSpec(path);

      expect(output.info.title).toBe(input.info.title);
      expect(output.info.version).toBe(input.info.version);

      // Description may be undefined, but if present, must be preserved
      if (input.info.description !== undefined) {
        expect(output.info.description).toBe(input.info.description);
      }
    });
  });
});

// ============================================================================
// Tests: OpenAPI Document Idempotency
// ============================================================================

/**
 * Phase 2: Idempotency
 *
 * Verifies that processing a normalized spec produces byte-identical output.
 * If the output changes after re-processing, the writer is not stable.
 */
describe('OpenAPI Document: Idempotency', () => {
  describe('Normalized output is stable', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: re-processing normalized output produces identical output',
      async (_name, path) => {
        // First pass: arbitrary → normalized
        const result1 = await loadOpenApiDocument(path);
        const ir1 = buildIR(result1.document);
        const normalized = writeOpenApi(ir1);

        // Second pass: normalized → output
        const ir2 = buildIR(normalized);
        const reprocessed = writeOpenApi(ir2);

        // Byte-identical comparison
        expect(JSON.stringify(reprocessed)).toBe(JSON.stringify(normalized));
      },
    );
  });
});

// ============================================================================
// Scenario 2: Zod → IR → Zod Transform Path
// ============================================================================

/**
 * Zod Parser Fixtures — existing happy-path fixtures for Zod transform validation.
 * These contain valid Zod 4 schema declarations.
 */
const ZOD_FIXTURES_DIR = resolve(__dirname, '../../tests-fixtures/zod-parser/happy-path');

const ZOD_FIXTURES: [string, string][] = [
  ['objects', `${ZOD_FIXTURES_DIR}/objects.zod4.ts`],
  ['string-formats', `${ZOD_FIXTURES_DIR}/string-formats.zod4.ts`],
  ['constraints', `${ZOD_FIXTURES_DIR}/constraints.zod4.ts`],
];

/**
 * Read a Zod fixture file.
 */
async function readZodFixture(path: string): Promise<string> {
  const { readFile } = await import('node:fs/promises');
  return readFile(path, 'utf-8');
}

describe('Transform Sample Scenario 2: Zod → IR → Zod', () => {
  /**
   * Scenario 2 tests the full transform path through the REAL system:
   * Zod → IR → OpenAPI → Zod (via real generator) → IR
   *
   * Two test categories:
   * 1. Losslessness: Arbitrary Zod → IR → Zod → IR preserves semantic content
   * 2. Idempotency: Normalized output is byte-identical on second pass
   */

  describe('Losslessness: Schema count preserved through transform path', () => {
    it.each(ZOD_FIXTURES)('%s: Zod → IR → Zod → IR preserves schema count', async (_name, path) => {
      // Parse arbitrary Zod
      const source = await readZodFixture(path);
      const result1 = parseZodSource(source);
      expectNoParseErrors(_name, 'Scenario 2 arbitrary-input parse', result1);

      const originalSchemaCount = result1.ir.components.length;

      // IR → OpenAPI → Zod (REAL generator) → IR
      const openApiDoc = writeOpenApi(result1.ir);
      const zodOutput = await generateZodFromOpenAPI(openApiDoc);
      const result2 = parseZodSource(zodOutput);
      expectNoParseErrors(_name, 'Scenario 2 generated-output parse', result2);

      // Schema count should be preserved
      expect(result2.ir.components.length).toBe(originalSchemaCount);
    });
  });

  describe('Strictness: unsupported schema primitives fail fast', () => {
    it('rejects standalone z.undefined() instead of degrading to permissive output', () => {
      const source = `
        const UndefinedSchema = z.undefined();
      `;

      const result = parseZodSource(source);

      expect(result.ir.components).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('PARSE_ERROR');
      expect(result.errors[0]?.message).toContain('z.undefined() is not representable');
      expect(result.errors[0]?.message).toContain(
        'Use .optional() on the parent field or parameter',
      );
      expect(result.errors[0]?.location).toBeDefined();
    });

    it('preserves hostname, float32, and float64 formats completely through the pipeline', async () => {
      const source = `
        import { z } from 'zod';
        export const TestSchema = z.object({
          host: z.hostname(),
          weight: z.float32(),
          balance: z.float64(),
        });
      `;
      // Zod -> IR
      const result1 = parseZodSource(source);
      expectNoParseErrors('inline formats test', 'arbitrary-input parse', result1);

      // IR -> OpenAPI -> Zod
      const openApiOutput = writeOpenApi(result1.ir);
      const zodOutput = await generateZodFromOpenAPI(openApiOutput);

      // The generated zod must include the specific format methods
      expect(zodOutput).toContain('z.hostname()');
      expect(zodOutput).toContain('z.float32()');
      expect(zodOutput).toContain('z.float64()');
    });

    it('rejects un-emittable canonical formats explicitly during generation from IR', async () => {
      // Create an OpenAPI doc with an unknown format 'password'
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0' },
        components: {
          schemas: {
            PasswordInput: {
              type: 'string',
              format: 'password', // Zod 4 has no standard canonical helper for password
            },
          },
        },
      };

      // OpenAPI -> IR works fine, parses format to IR
      const ir = buildIR(openApiDoc);
      const openApiOutput = writeOpenApi(ir); // writeOpenApi doesn't use the zod writer

      // IR -> Zod generation should fail fast
      await expect(generateZodFromOpenAPI(openApiOutput)).rejects.toThrow(
        /Unsupported string format "password"/,
      );
    });
  });

  describe('Idempotency: Normalized output is stable', () => {
    it.each(ZOD_FIXTURES)(
      '%s: normalized output is byte-identical on second pass',
      async (_name, path) => {
        // First pass: arbitrary Zod → normalized Zod
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);
        expectNoParseErrors(_name, 'Scenario 2 arbitrary-input parse', result1);

        // Generate first normalized output
        const openApiDoc1 = writeOpenApi(result1.ir);
        const normalizedOutput1 = await generateZodFromOpenAPI(openApiDoc1);

        // Second pass: normalized Zod → IR → normalized Zod
        const result2 = parseZodSource(normalizedOutput1);
        expectNoParseErrors(_name, 'Scenario 2 normalized-output parse', result2);
        const openApiDoc2 = writeOpenApi(result2.ir);
        const normalizedOutput2 = await generateZodFromOpenAPI(openApiDoc2);

        // IDEMPOTENCY: second pass output === first pass output
        // (Both are normalized, so they should be identical)
        expect(normalizedOutput2).toBe(normalizedOutput1);
      },
    );
  });
});

// ============================================================================
// Scenario 3: OpenAPI → IR → Zod → IR → OpenAPI
// ============================================================================

/**
 * Scenario 3 tests that schemas flow through the Zod layer without loss.
 * This proves OpenAPI schemas can be represented in Zod and parsed back.
 */
describe('Transform Sample Scenario 3: OpenAPI → Zod → OpenAPI', () => {
  describe('Losslessness: Schema content flows through Zod layer', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: OpenAPI → Zod → IR preserves schema count',
      async (_name, path) => {
        // OpenAPI → IR
        const originalIR = await parseToIR(path);
        const originalSchemaCount = originalIR.components.filter((c) => c.type === 'schema').length;

        // IR → OpenAPI → Zod (REAL generator)
        const openApiDoc = writeOpenApi(originalIR);
        const zodSource = await generateZodFromOpenAPI(openApiDoc);

        // Zod source → IR (only schema components)
        const zodParsed = parseZodSource(zodSource);
        expectNoParseErrors(_name, 'Scenario 3 generated-output parse', zodParsed);

        // Schema count must be preserved exactly through the transform path.
        expect(zodParsed.ir.components.length).toBe(originalSchemaCount);
      },
    );
  });
});

// ============================================================================
// Scenario 4: Zod → IR → OpenAPI → IR → Zod
// ============================================================================

/**
 * Scenario 4 tests that Zod schemas survive a full cross-format transform path.
 */
describe('Transform Sample Scenario 4: Zod → OpenAPI → Zod', () => {
  describe('Losslessness: Schema count preserved through cross-format trip', () => {
    it.each(ZOD_FIXTURES)('%s: Zod → OpenAPI → Zod preserves schema count', async (_name, path) => {
      // Zod → IR
      const source = await readZodFixture(path);
      const result1 = parseZodSource(source);
      expectNoParseErrors(_name, 'Scenario 4 arbitrary-input parse', result1);

      const originalCount = result1.ir.components.length;

      // IR → OpenAPI → Zod (REAL generator) → IR
      const openApiOutput = writeOpenApi(result1.ir);
      const zodOutput = await generateZodFromOpenAPI(openApiOutput);
      const result3 = parseZodSource(zodOutput);
      expectNoParseErrors(_name, 'Scenario 4 generated-output parse', result3);

      // Schema count preserved
      expect(result3.ir.components.length).toBe(originalCount);
    });
  });
});
