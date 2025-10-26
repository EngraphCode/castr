import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';

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
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Empty API', version: '1.0.0' },
        paths: {},
      };

      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('import { z }');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle spec with only schemas, no paths', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Schemas Only', version: '1.0.0' },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
          },
        },
        paths: {},
      };

      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
        template: 'schemas-only',
      });

      expect(result).toBeTruthy();
      // Note: Unused schemas may not be exported by default
      expect(result).toContain('import { z }');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle single operation spec', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Single Op', version: '1.0.0' },
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
      };

      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('/'); // Path is in output
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Special Characters in Names', () => {
    it('should handle schemas with hyphens in names', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            'User-Profile': {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
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
                      schema: { $ref: '#/components/schemas/User-Profile' },
                    },
                  },
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
      expect(result).not.toContain('as unknown as');
    });

    it('should handle paths with special characters', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
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
      };

      // Bundling not needed for in-memory specs with internal refs
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      expect(result).toBeTruthy();
      expect(result).not.toContain('as unknown as');
    });

    it('should handle property names with special characters', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            SpecialProps: {
              type: 'object',
              properties: {
                'kebab-case': { type: 'string' },
                'dot.notation': { type: 'number' },
                '@special': { type: 'boolean' },
                $reserved: { type: 'string' },
              },
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
                      schema: { $ref: '#/components/schemas/SpecialProps' },
                    },
                  },
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
      expect(result).toContain('SpecialProps');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle schema names that are JavaScript reserved words', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
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
                      schema: { $ref: '#/components/schemas/class' },
                    },
                  },
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
      expect(result).not.toContain('as unknown as');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle deeply nested inline schemas', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
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
      };

      // Bundling not needed for in-memory specs with internal refs
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
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            [longName]: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
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
                      schema: { $ref: `#/components/schemas/${longName}` },
                    },
                  },
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
      expect(result).toContain(longName);
      expect(result).not.toContain('as unknown as');
    });

    it('should handle many schemas (50+)', async () => {
      const schemas: Record<string, any> = {};
      for (let i = 0; i < 50; i++) {
        schemas[`Schema${i}`] = {
          type: 'object',
          properties: {
            id: { type: 'string' },
            value: { type: 'number' },
          },
        };
      }

      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: { schemas },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Schema0' },
                    },
                  },
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
      expect(result).toContain('Schema0');
      // Note: Unused schemas may not all be included by default
      expect(result).not.toContain('as unknown as');
    });

    it('should handle empty string as enum value', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            EmptyEnum: {
              type: 'string',
              enum: ['', 'value1', 'value2'],
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
                      schema: { $ref: '#/components/schemas/EmptyEnum' },
                    },
                  },
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
      expect(result).toContain('EmptyEnum');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle schema with nullable type (OpenAPI 3.0 style)', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            NullableField: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                optionalField: { type: 'string', nullable: true },
              },
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
                      schema: { $ref: '#/components/schemas/NullableField' },
                    },
                  },
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
      expect(result).toContain('NullableField');
      expect(result).toContain('nullable');
      expect(result).not.toContain('as unknown as');
    });
  });
});
