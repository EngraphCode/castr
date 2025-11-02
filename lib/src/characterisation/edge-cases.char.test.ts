import { describe, it, expect } from 'vitest';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';
import {
  createMinimalSpec,
  createSpecWithSchema,
  createSpecWithSchemas,
  createResponseWithSchema,
  createMultipleSchemas,
} from './__fixtures__/edge-cases-helpers.js';

/**
 * Characterisation Tests: Edge Cases
 *
 * These tests validate edge case scenarios and boundary conditions.
 *
 * CRITICAL: These tests document PUBLIC API behavior for edge cases.
 * They must survive the architectural rewrite (Phases 1-3).
 *
 * Test Strategy:
 * - Test empty/minimal specs
 * - Test special characters and naming
 * - Test very large/complex specs
 * - Test unusual but valid OpenAPI constructs
 */

describe('Characterisation: Edge Cases', () => {
  describe('Empty/Minimal Specs', () => {
    it('should handle spec with no operations', async () => {
      const spec = createMinimalSpec({
        info: { title: 'Empty API', version: '1.0.0' },
      });

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('import { z }');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle spec with only schemas, no paths', async () => {
      const spec = createSpecWithSchema(
        'User',
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        {},
      );

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        template: 'schemas-only',
      });

      expect(result).toBeTruthy();
      expect(result).toContain('import { z }');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle single operation spec', async () => {
      const spec = createMinimalSpec({
        paths: {
          '/': {
            get: {
              operationId: 'root',
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
      });

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('/');
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Special Characters in Names', () => {
    it('should handle schemas with hyphens in names', async () => {
      const spec = createSpecWithSchema(
        'User-Profile',
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: createResponseWithSchema('#/components/schemas/User-Profile'),
            },
          },
        },
      );

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).not.toContain('as unknown as');
    });

    it('should handle paths with special characters', async () => {
      const spec = createMinimalSpec({
        paths: {
          '/users/{user-id}/profiles/{profile.id}': {
            get: {
              operationId: 'getUserProfile',
              parameters: [
                {
                  name: 'user-id',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' },
                },
                {
                  name: 'profile.id',
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
                      schema: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).not.toContain('as unknown as');
    });

    it('should handle property names with special characters', async () => {
      const spec = createSpecWithSchema(
        'SpecialProps',
        {
          type: 'object',
          properties: {
            'kebab-case': { type: 'string' },
            'dot.notation': { type: 'number' },
            '@special': { type: 'boolean' },
            $reserved: { type: 'string' },
          },
        },
        {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: createResponseWithSchema('#/components/schemas/SpecialProps'),
            },
          },
        },
      );

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('SpecialProps');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle schema names that are JavaScript reserved words', async () => {
      const spec = createSpecWithSchemas(
        {
          class: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
          function: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
        {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: createResponseWithSchema('#/components/schemas/class'),
            },
          },
        },
      );

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle deeply nested inline schemas', async () => {
      const spec = createMinimalSpec({
        paths: {
          '/nested': {
            get: {
              operationId: 'getNested',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          level1: {
                            type: 'object',
                            properties: {
                              level2: {
                                type: 'object',
                                properties: {
                                  level3: {
                                    type: 'object',
                                    properties: {
                                      level4: {
                                        type: 'object',
                                        properties: {
                                          value: { type: 'string' },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('level1');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle schemas with very long names', async () => {
      const longName = 'VeryLongSchemaNameThatExceedsNormalLimitsAndTestsEdgeCasesForNameHandling';
      const spec = createSpecWithSchema(
        longName,
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: createResponseWithSchema(`#/components/schemas/${longName}`),
            },
          },
        },
      );

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain(longName);
      expect(result).not.toContain('as unknown as');
    });

    it('should handle many schemas (50+)', async () => {
      const schemas = createMultipleSchemas(50, () => ({
        type: 'object',
        properties: {
          id: { type: 'string' },
          value: { type: 'number' },
        },
      }));

      const spec = createSpecWithSchemas(schemas, {
        '/test': {
          get: {
            operationId: 'getTest',
            responses: createResponseWithSchema('#/components/schemas/Schema0'),
          },
        },
      });

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('Schema0');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle empty string as enum value', async () => {
      const spec = createSpecWithSchema(
        'EmptyEnum',
        {
          type: 'string',
          enum: ['', 'value1', 'value2'],
        },
        {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: createResponseWithSchema('#/components/schemas/EmptyEnum'),
            },
          },
        },
      );

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('EmptyEnum');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle schema with nullable type (OpenAPI 3.0 style)', async () => {
      const spec = createSpecWithSchema(
        'NullableField',
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
            optionalField: { type: 'string', nullable: true },
          },
        },
        {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: createResponseWithSchema('#/components/schemas/NullableField'),
            },
          },
        },
      );

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('NullableField');
      expect(result).toContain('nullable');
      expect(result).not.toContain('as unknown as');
    });
  });
});
