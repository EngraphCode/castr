/**
 * Round-Trip Integration Tests
 *
 * Tests that OpenAPI specifications survive the complete transformation pipeline:
 * OpenAPI Input → buildIR() → IR (CastrDocument) → writeOpenApi() → OpenAPI Output
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
 * @see ADR-027 Round-Trip Validation as Correctness Proof
 */

import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PathsObject } from 'openapi3-ts/oas31';

import { buildIR } from '../../src/parsers/openapi/index.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
import { writeOpenApi } from '../../src/writers/openapi/index.js';

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
 * Performs a round-trip: parse → write → parse.
 * Returns both the original IR and the round-tripped IR for comparison.
 */
async function roundTrip(
  specPath: string,
): Promise<{ originalIR: ReturnType<typeof buildIR>; roundTrippedIR: ReturnType<typeof buildIR> }> {
  // Parse original spec to IR
  const originalIR = await parseToIR(specPath);

  // Write IR to OpenAPI
  const openApiOutput = writeOpenApi(originalIR);

  // Parse the output back to IR (using in-memory document)
  const roundTrippedIR = buildIR(openApiOutput);

  return { originalIR, roundTrippedIR };
}

// ============================================================================
// Tests: Losslessness (IR Comparison)
// ============================================================================

describe('Round-Trip: Losslessness', () => {
  describe('Arbitrary fixtures preserve semantic content', () => {
    it.each(ARBITRARY_FIXTURES)('%s: IR is preserved through round-trip', async (_name, path) => {
      const { originalIR, roundTrippedIR } = await roundTrip(path);

      // Core document properties
      expect(roundTrippedIR.info).toEqual(originalIR.info);
      expect(roundTrippedIR.servers).toEqual(originalIR.servers);

      // Operations count and core properties
      expect(roundTrippedIR.operations.length).toBe(originalIR.operations.length);

      // Components count by type
      const originalSchemaCount = originalIR.components.filter((c) => c.type === 'schema').length;
      const roundTrippedSchemaCount = roundTrippedIR.components.filter(
        (c) => c.type === 'schema',
      ).length;
      expect(roundTrippedSchemaCount).toBe(originalSchemaCount);
    });
  });

  describe('Operation details are preserved', () => {
    it.each(ARBITRARY_FIXTURES)(
      '%s: operation paths and methods preserved',
      async (_name, path) => {
        const { originalIR, roundTrippedIR } = await roundTrip(path);

        // Extract operation signatures for comparison
        const originalOps = originalIR.operations.map((op) => ({
          path: op.path,
          method: op.method,
          operationId: op.operationId,
        }));

        const roundTrippedOps = roundTrippedIR.operations.map((op) => ({
          path: op.path,
          method: op.method,
          operationId: op.operationId,
        }));

        expect(roundTrippedOps).toEqual(originalOps);
      },
    );
  });

  describe('Schema content is preserved', () => {
    it.each(ARBITRARY_FIXTURES)('%s: schema names and types preserved', async (_name, path) => {
      const { originalIR, roundTrippedIR } = await roundTrip(path);

      // Extract schema component names
      const originalSchemas = originalIR.components
        .filter((c) => c.type === 'schema')
        .map((c) => c.name)
        .sort();

      const roundTrippedSchemas = roundTrippedIR.components
        .filter((c) => c.type === 'schema')
        .map((c) => c.name)
        .sort();

      expect(roundTrippedSchemas).toEqual(originalSchemas);
    });
  });
});

// ============================================================================
// Tests: Idempotency (Output Stability)
// ============================================================================

describe('Round-Trip: Idempotency', () => {
  describe('Double round-trip produces identical IR', () => {
    it.each(ARBITRARY_FIXTURES)('%s: second round-trip matches first', async (_name, path) => {
      // First round-trip
      const { roundTrippedIR: ir1 } = await roundTrip(path);

      // Write IR1 to OpenAPI
      const output1 = writeOpenApi(ir1);

      // Second round-trip
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
