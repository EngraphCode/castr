import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';
import { ValidationError } from '../validateOpenApiSpec.js';

/**
 * Characterisation Tests: Error Handling
 *
 * These tests validate error handling behavior for invalid/malformed inputs.
 *
 * CRITICAL: These tests document PUBLIC API behavior for error conditions.
 * They must survive the architectural rewrite (Phases 1-3).
 *
 * Test Strategy:
 * - Test invalid OpenAPI specs
 * - Test missing required fields
 * - Test malformed references
 * - Test unsupported features
 * - Verify fail-fast with helpful errors
 */

describe('Characterisation: Error Handling', () => {
  describe('Invalid OpenAPI Specs', () => {
    it('should handle spec without openapi version', async () => {
      const invalidSpec = {
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      } as unknown;

      // Fail fast: reject invalid specs at the boundary with ValidationError
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: invalidSpec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: invalidSpec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("missing required property 'openapi'");
    });

    it('should handle spec without info object', async () => {
      const invalidSpec = {
        openapi: '3.0.0',
        paths: {},
      } as unknown;

      // Fail fast: reject invalid specs at the boundary with ValidationError
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: invalidSpec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: invalidSpec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("missing required property 'info'");
    });

    it('should handle spec without paths object', async () => {
      const invalidSpec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
      } as unknown;

      // Fail fast: reject invalid specs at the boundary with ValidationError
      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: invalidSpec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        generateZodClientFromOpenAPI({
          // @ts-expect-error TS2322 - Testing invalid spec (missing required property) to verify error handling
          openApiDoc: invalidSpec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("missing required property 'paths'");
    });
  });

  describe('Malformed References', () => {
    it('should handle invalid $ref format', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/ValidRef' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            ValidRef: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
          },
        },
      };

      // Bundling not needed for in-memory specs with internal refs

      // Should generate code successfully
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
    });

    it('should handle missing referenced schema', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/DoesNotExist' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // generateZodClientFromOpenAPI should throw for missing refs
      // (fails-fast when a ref doesn't exist)
      await expect(
        generateZodClientFromOpenAPI({
          openApiDoc: spec,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow("Schema 'DoesNotExist' not found in components.schemas");
    });
  });

  describe('Unsupported Features', () => {
    it('should handle schemas without type property', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            // @ts-expect-error TS2322 - Testing invalid schema (missing type property) to verify error handling
            NoType: {
              properties: {
                name: { type: 'string' },
              },
            } as unknown,
          },
        },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/NoType' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Bundling not needed for in-memory specs with internal refs

      // Should not throw, infer type from properties
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('NoType');
    });
  });

  describe('Response Handling Errors', () => {
    it('should handle operations with no success responses', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '400': {
                  description: 'Bad Request',
                },
                '500': {
                  description: 'Server Error',
                },
              },
            },
          },
        },
      };

      // Bundling not needed for in-memory specs with internal refs

      // Should not throw, might skip the operation
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
    });

    it('should handle responses with no content', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            delete: {
              operationId: 'deleteTest',
              responses: {
                '204': {
                  description: 'No Content',
                },
              },
            },
          },
        },
      };

      // Bundling not needed for in-memory specs with internal refs

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('import { z }');
    });
  });

  describe('Parameter Validation Errors', () => {
    it('should handle parameters with invalid "in" property', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              parameters: [
                {
                  name: 'invalid',
                  // @ts-expect-error TS2322 - Testing invalid parameter location to verify error handling
                  in: 'invalid-location' as unknown,
                  schema: { type: 'string' },
                },
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Bundling not needed for in-memory specs with internal refs

      // Should handle gracefully, might skip invalid parameter
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
    });
  });

  describe('Schema Validation Errors', () => {
    it('should handle schemas with conflicting properties', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            Conflicting: {
              type: 'string',
              // @ts-expect-error TS2322 - Testing conflicting properties on string type to verify error handling
              properties: {
                // Properties on string type (conflicting)
                name: { type: 'string' },
              } as unknown,
            },
          },
        },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Conflicting' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Bundling not needed for in-memory specs with internal refs

      // Should handle gracefully
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
    });
  });
});
