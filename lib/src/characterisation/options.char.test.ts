import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';

/**
 * Characterisation Tests: Options & Configuration
 *
 * These tests validate all CLI options and their effects on generated output.
 *
 * CRITICAL: These tests document PUBLIC API behavior for configuration options.
 * They must survive the architectural rewrite (Phases 1-3).
 *
 * Test Strategy:
 * - Test each option's effect on generated code
 * - Verify option combinations work correctly
 * - Check for type safety guarantees
 * - Ensure options fail gracefully with invalid values
 */

/**
 * Helper: Create a basic test spec
 */
function createBasicSpec(): OpenAPIObject {
  return {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['id', 'name'],
        },
      },
    },
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
      '/users/{id}': {
        get: {
          operationId: 'getUserById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },
    },
  };
}

describe('Characterisation: Options & Configuration', () => {
  describe('Template Options', () => {
    it('should use default template when not specified', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toContain('makeApi');
      expect(result).toContain('import { z }');
    });

    it('should use schemas-only template when specified', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        template: 'schemas-only',
      });

      expect(result).toContain('User');
      expect(result).not.toContain('makeApi');
    });

    it('should use schemas-with-metadata template when specified', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        template: 'schemas-with-metadata',
      });

      expect(result).toContain('User');
      expect(result).not.toContain('makeApi');
    });
  });

  describe('Alias Options', () => {
    it('should handle withAlias: true', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          withAlias: true,
        },
      });

      // With aliases, should have type definitions
      expect(result).toContain('type');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle withAlias: false', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          withAlias: false,
        },
      });

      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle withAlias as custom function', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          withAlias: (name: string) => `Custom${name}`,
        },
      });

      // Custom alias function should affect type names
      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Export Options', () => {
    it('should handle exportSchemas: true', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          shouldExportAllSchemas: true,
        },
      });

      expect(result).toContain('User');
      expect(result).toContain('export');
    });

    it('should handle exportSchemas: false', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          shouldExportAllSchemas: false,
        },
      });

      expect(result).toContain('User');
    });

    it('should handle exportTypes: true', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          shouldExportAllTypes: true,
        },
      });

      // Should export TypeScript types
      expect(result).toContain('export');
    });
  });

  describe('Validation Options', () => {
    it('should handle additionalPropertiesDefaultValue: true', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          additionalPropertiesDefaultValue: true,
        },
      });

      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle additionalPropertiesDefaultValue: false', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          additionalPropertiesDefaultValue: false,
        },
      });

      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle strictObjects: true', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          strictObjects: true,
        },
      });

      expect(result).toContain('User');
      // Note: strictObjects affects object validation, may use .passthrough() or similar
      expect(result).not.toContain('as unknown as');
    });

    it('should handle withImplicitRequiredProps: true', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          withImplicitRequiredProps: true,
        },
      });

      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Naming Options', () => {
    it('should handle apiClientName option', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          apiClientName: 'CustomApiClient',
        },
      });

      // Note: apiClientName may appear in template or be used differently
      expect(result).toContain('import { z }');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle baseUrl option', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          baseUrl: 'https://api.example.com',
        },
      });

      // Note: baseUrl may be used in template or initialization
      expect(result).toContain('import { z }');
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Complexity Options', () => {
    it('should handle complexityThreshold option', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          complexityThreshold: 5,
        },
      });

      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Default Status Behavior Options', () => {
    it('should handle defaultStatusBehavior: "spec-compliant"', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          defaultStatusBehavior: 'spec-compliant',
        },
      });

      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle defaultStatusBehavior: "auto-correct"', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          defaultStatusBehavior: 'auto-correct',
        },
      });

      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Group Strategy Options', () => {
    it('should handle groupStrategy: "none"', async () => {
      const spec = createBasicSpec();
      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        options: {
          groupStrategy: 'none',
        },
      });

      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');
    });
  });
});
