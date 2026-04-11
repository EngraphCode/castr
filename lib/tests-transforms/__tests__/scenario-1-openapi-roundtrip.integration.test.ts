/**
 * Transform Scenario 1: OpenAPI ↔ IR Round-Trip
 *
 * Tests that OpenAPI specifications survive the complete transformation pipeline:
 * OpenAPI Input → buildIR() → IR (CastrDocument) → writeOpenApi() → OpenAPI Output
 *
 * Includes losslessness, idempotency, and information preservation proofs.
 *
 * @see ADR-027 Transform Validation with Sample Input as Correctness Proof
 */

import { describe, expect, it } from 'vitest';

import {
  ARBITRARY_FIXTURES,
  runTransformPass,
  buildIR,
  loadOpenApiDocument,
  writeOpenApi,
} from '../utils/transform-helpers.js';

type LoadedOpenApiPaths = Awaited<ReturnType<typeof loadOpenApiDocument>>['document']['paths'];
type WrittenOpenApiPaths = ReturnType<typeof writeOpenApi>['paths'];
type OpenApiPaths = LoadedOpenApiPaths | WrittenOpenApiPaths;

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
        const originalOps = originalIR.operations
          .map((op) => ({
            path: op.path,
            method: op.method,
            operationId: op.operationId,
          }))
          .sort((a, b) => `${a.path}${a.method}`.localeCompare(`${b.path}${b.method}`));

        const transformedOps = transformedIR.operations
          .map((op) => ({
            path: op.path,
            method: op.method,
            operationId: op.operationId,
          }))
          .sort((a, b) => `${a.path}${a.method}`.localeCompare(`${b.path}${b.method}`));

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
      const getOperations = (paths: OpenApiPaths): string[] => {
        if (!paths) {
          return [];
        }
        const operations: string[] = [];
        const httpMethods = [
          'get',
          'post',
          'put',
          'delete',
          'patch',
          'head',
          'options',
          'trace',
          'query',
        ];

        for (const [pathKey, pathItem] of Object.entries(paths)) {
          if (!pathItem) {
            continue;
          }
          for (const method of httpMethods) {
            if (method in pathItem) {
              operations.push(`${method.toUpperCase()} ${pathKey}`);
            }
          }
        }
        return operations.sort();
      };

      const inputOps = getOperations(input.paths);
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
