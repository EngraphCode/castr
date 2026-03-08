/**
 * Transform Scenario 2: Zod → IR → Zod Round-Trip
 *
 * Tests the full transform path through the REAL system:
 * Zod → IR → OpenAPI → Zod (via real generator) → IR
 *
 * Includes losslessness, idempotency, strictness, and validation parity proofs.
 *
 * @see ADR-027 Transform Validation with Sample Input as Correctness Proof
 * @see ADR-035 Transform Validation Parity
 */

import { describe, expect, it } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

import {
  ZOD_FIXTURES,
  ZOD_DEFECT_FIXTURES,
  readZodFixture,
  expectNoParseErrors,
  generateZodFromOpenAPI,
  loadDynamicZodSchemas,
  assertValidationParity,
  buildIR,
  writeOpenApi,
  parseZodSource,
} from '../utils/transform-helpers.js';

// ============================================================================
// Scenario 2: Zod → IR → Zod Transform Path
// ============================================================================

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

    it.skip.each(ZOD_DEFECT_FIXTURES)(
      '%s: Zod → IR → Zod → IR preserves schema count (DEFECT)',
      async (_name, path) => {
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);
        expectNoParseErrors(_name, 'Scenario 2 arbitrary-input parse', result1);
        const openApiDoc = writeOpenApi(result1.ir);
        const zodOutput = await generateZodFromOpenAPI(openApiDoc);
        const result2 = parseZodSource(zodOutput);
        expect(result2.ir.components.length).toBe(result1.ir.components.length);
      },
    );
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

    it.skip.each(ZOD_DEFECT_FIXTURES)(
      '%s: normalized output is byte-identical on second pass (DEFECT)',
      async (_name, path) => {
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);
        const openApiDoc1 = writeOpenApi(result1.ir);
        const normalizedOutput1 = await generateZodFromOpenAPI(openApiDoc1);
        const result2 = parseZodSource(normalizedOutput1);
        const openApiDoc2 = writeOpenApi(result2.ir);
        const normalizedOutput2 = await generateZodFromOpenAPI(openApiDoc2);
        expect(normalizedOutput2).toBe(normalizedOutput1);
      },
    );
  });

  describe('Functional Equivalence: Validation Parity', () => {
    it.each(ZOD_FIXTURES)(
      '%s: Zod → IR → Zod yields identical validation behavior',
      async (_name, path) => {
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);

        const openApiDoc = writeOpenApi(result1.ir);
        const zodOutput = await generateZodFromOpenAPI(openApiDoc);

        // Load both sets of schemas dynamically to run payloads
        const originalSchemas = await loadDynamicZodSchemas(source);
        const transformedSchemas = await loadDynamicZodSchemas(zodOutput);

        assertValidationParity(_name, originalSchemas, transformedSchemas);
      },
    );

    it.skip.each(ZOD_DEFECT_FIXTURES)(
      '%s: Zod → IR → Zod yields identical validation behavior (DEFECT)',
      async (_name, path) => {
        const source = await readZodFixture(path);
        const result1 = parseZodSource(source);
        const openApiDoc = writeOpenApi(result1.ir);
        const zodOutput = await generateZodFromOpenAPI(openApiDoc);
        const originalSchemas = await loadDynamicZodSchemas(source);
        const transformedSchemas = await loadDynamicZodSchemas(zodOutput);
        assertValidationParity(_name, originalSchemas, transformedSchemas);
      },
    );
  });
});
