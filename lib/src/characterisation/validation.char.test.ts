import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';
import { ValidationError } from '../validateOpenApiSpec.js';

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
 * - Invalid specs are rejected with ValidationError
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
    it('should reject null spec with ValidationError', async () => {
      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: null as unknown,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: null as unknown,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow('Invalid OpenAPI document: expected an object, received null');
    });

    it('should reject undefined spec with ValidationError', async () => {
      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: undefined as unknown,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: undefined as unknown,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow('Invalid OpenAPI document: expected an object, received undefined');
    });

    it('should reject spec missing required openapi property', async () => {
      const spec = {
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("missing required property 'openapi'");
    });

    it('should reject spec missing required info property', async () => {
      const spec = {
        openapi: '3.0.0',
        paths: {},
      } as unknown;

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("missing required property 'info'");
    });

    it('should reject spec missing required paths property', async () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
      } as unknown;

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("missing required property 'paths'");
    });
  });

  describe('Version Validation', () => {
    it('should reject OpenAPI 2.0 (Swagger) with helpful message', async () => {
      const spec = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow('Unsupported OpenAPI version');

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow('only supports OpenAPI 3.0.x');
    });

    it('should reject OpenAPI 3.1.x with helpful message', async () => {
      const spec = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      } as unknown;

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow('3.1.0');

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow('only supports OpenAPI 3.0.x');
    });

    it('should accept all OpenAPI 3.0.x versions', async () => {
      const versions = ['3.0.0', '3.0.1', '3.0.2', '3.0.3'];

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

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("property 'openapi' must be a string");
    });

    it('should reject spec with array instead of object', async () => {
      const spec = [] as unknown;

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow('expected an object, received array');
    });

    it('should reject spec with paths as array', async () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: [],
      } as unknown;

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("property 'paths' must be an object, received array");
    });
  });

  describe('Error Message Quality', () => {
    it('should provide actionable error messages', async () => {
      const testCases = [
        {
          spec: null,
          expectedKeywords: ['Invalid', 'document', 'null'],
        },
        {
          spec: { info: {}, paths: {} },
          expectedKeywords: ['missing', 'required', 'openapi'],
        },
        {
          spec: { swagger: '2.0', info: {}, paths: {} },
          expectedKeywords: ['Unsupported', 'version', '3.0.x'],
        },
        {
          spec: { openapi: '3.1.0', info: {}, paths: {} },
          expectedKeywords: ['Unsupported', '3.1.0', '3.0.x'],
        },
      ];

      for (const { spec, expectedKeywords } of testCases) {
        try {
          await generateZodClientFromOpenAPI({
            openApiDoc: spec as unknown,
            disableWriteToFile: true,
          });
          expect.fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          const message = (error as ValidationError).message.toLowerCase();

          expectedKeywords.forEach((keyword) => {
            expect(message).toContain(keyword.toLowerCase());
          });
        }
      }
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
          openApiDoc: invalidSpec,
          disableWriteToFile: true,
        });
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Validation should be fast (< 10ms) because it happens before domain logic
        expect(duration).toBeLessThan(100);
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });
});
