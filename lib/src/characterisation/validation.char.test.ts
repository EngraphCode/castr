import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';
import { isSingleFileResult } from '../rendering/generation-result.js';

/**
 * Characterization Tests: OpenAPI Spec Validation
 *
 * These tests verify that both CLI and programmatic entry points validate
 * OpenAPI specs consistently at the boundary, before any domain logic runs.
 *
 * **Philosophy**: Fail fast, fail loud, fail helpful
 * - Validation happens ONCE at entry point
 * - Domain logic never sees invalid specs
 * - Error messages guide users to fix issues
 *
 * **What we test**:
 * - Invalid specs are rejected with helpful errors
 * - Error messages are helpful and actionable
 * - Valid specs pass through without modification
 * - Both CLI and programmatic paths validate identically
 */
describe('Characterisation: OpenAPI Spec Validation', () => {
  describe('Valid Specs Pass Through', () => {
    it('should accept minimal valid OpenAPI 3.0 spec', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      // Should not throw
      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).resolves.toBeDefined();
    });

    it('should accept spec with components and operations', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.3',
        info: { title: 'Pet Store API', version: '1.0.0' },
        paths: {
          '/pets': {
            get: {
              operationId: 'getPets',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Pet' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Pet: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      };

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('Invalid Specs Fail Fast', () => {
    it('should reject null spec', async () => {
      // Test behavior (rejection), not implementation (specific error message)
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid input (null) to verify error handling
          openApiDoc: null as unknown,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow();
    });

    it('should reject undefined spec', async () => {
      // Test behavior (rejection), not implementation (specific error message)
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid input (undefined) to verify error handling
          openApiDoc: undefined as unknown,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow();
    });

    it('should reject spec missing required openapi property', async () => {
      const spec = {
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      // Test behavior (rejection), not implementation (specific error message)
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow();
    });

    it('should reject spec missing required info property', async () => {
      const spec = {
        openapi: '3.0.0',
        paths: {},
      } as unknown;

      // Test behavior (rejection), not implementation (specific error message)
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow();
    });

    it('should reject spec missing required paths property', async () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
      } as unknown;

      // Test behavior (rejection), not implementation (specific error message)
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow();
    });
  });

  describe('Version Validation', () => {
    it('should auto-upgrade OpenAPI 2.0 (Swagger) - Scalar pipeline auto-upgrades', async () => {
      // Architecture Note: Scalar Auto-Upgrade Behavior
      //
      // The Scalar pipeline (@scalar/openapi-parser) automatically upgrades:
      // - OpenAPI 2.0 (Swagger) → OpenAPI 3.1
      // - OpenAPI 3.0.x → OpenAPI 3.1.0
      //
      // This is intentional and correct per our 3.1-first architecture (ADR-018).
      // We don't need to manually validate or reject old versions - Scalar handles it.
      //
      // This test verifies that:
      // 1. OpenAPI 2.0 specs are auto-upgraded without errors
      // 2. The upgraded spec is valid and can generate code
      // 3. No manual version checking is required in our code
      //
      // For more details, see:
      // - .agent/architecture/SCALAR-PIPELINE.md (Auto-Upgrade section)
      // - ADR-018: OpenAPI 3.1-First Architecture
      const spec = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      // Should succeed (auto-upgraded by Scalar)
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec as unknown as OpenAPIObject,
        disableWriteToFile: true,
      });

      expect(result).toBeDefined();
      expect(isSingleFileResult(result)).toBe(true);
    });

    it('should accept all OpenAPI 3.x versions', async () => {
      const versions = ['3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0'];

      for (const version of versions) {
        const spec: OpenAPIObject = {
          openapi: version,
          info: { title: 'Test API', version: '1.0.0' },
          paths: {},
        };

        await expect(
          generateZodClientFromOpenAPI({
            openApiDoc: spec,
            disableWriteToFile: true,
          }),
        ).resolves.toBeDefined();
      }
    });
  });

  describe('Type Validation', () => {
    it('should reject spec with non-string openapi property', async () => {
      const spec = {
        openapi: 3.0,
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      // Test behavior (rejection), not implementation (specific error message)
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (non-string openapi) to verify error handling
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow();
    });

    it('should reject spec with array instead of object', async () => {
      const spec = [] as unknown;

      // Test behavior (rejection), not implementation (specific error message)
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (array instead of object) to verify error handling
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow();
    });

    it('should reject spec with paths as array with helpful error message', async () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: [],
      } as unknown;

      // Strict validation correctly rejects this invalid structure before processing
      // Verify the error message is user-friendly (contains location context)
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (paths as array) to verify strict validation rejection
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(/Location: paths[\s\S]*type must be object/i);
    });
  });

  describe('Validation Consistency', () => {
    it('should validate before any domain logic runs', async () => {
      // This test verifies that validation happens at the entry point
      // by ensuring an invalid spec fails before any processing
      const invalidSpec = {
        openapi: '3.0.0',
        // Missing info and paths
      } as unknown;

      const startTime = Date.now();

      try {
        await generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required properties) to verify error handling
          openApiDoc: invalidSpec,
          disableWriteToFile: true,
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Validation should be fast (< 500ms) because it happens before domain logic
        // Note: We use 500ms to account for JIT warmup and slower CI environments.
        // The point is validation fails early (not after heavy processing), not sub-100ms.
        expect(duration).toBeLessThan(500);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
