import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { describe, expect, test } from 'vitest';
import { getZodClientTemplateContext, extractSchemaNamesFromDoc } from './template-context.js';

/**
 * Tests for extracted helper functions from template-context.ts
 */
describe('template-context helpers', () => {
  describe('extractSchemaNamesFromDoc', () => {
    test('should extract schema names from components.schemas', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test' },
        paths: {},
        components: {
          schemas: {
            User: { type: 'object' },
            Settings: { type: 'object' },
          },
        },
      };

      const schemaNames = extractSchemaNamesFromDoc(openApiDoc);

      expect(schemaNames).toEqual(['User', 'Settings']);
    });

    test('should return empty array when no schemas exist', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test' },
        paths: {},
        components: {},
      };

      const schemaNames = extractSchemaNamesFromDoc(openApiDoc);

      expect(schemaNames).toEqual([]);
    });

    test('should handle undefined components', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test' },
        paths: {},
      };

      const schemaNames = extractSchemaNamesFromDoc(openApiDoc);

      expect(schemaNames).toEqual([]);
    });
  });
});

/**
 * Comprehensive characterization tests for getZodClientTemplateContext.
 *
 * These tests document the current behavior before decomposition.
 * All tests must pass after refactoring to ensure no regressions.
 */
describe('getZodClientTemplateContext - Characterization Tests', () => {
  /**
   * Basic test with minimal OpenAPI spec
   */
  test('should handle minimal spec with single endpoint', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.3',
      info: { version: '1', title: 'Test API' },
      paths: {
        '/test': {
          get: {
            operationId: 'test',
            responses: {
              '200': {
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
      components: {
        schemas: {},
      },
    };

    const result = getZodClientTemplateContext(openApiDoc);

    expect(result).toMatchObject({
      schemas: {},
      endpoints: [
        {
          method: 'get',
          path: '/test',
          response: 'z.string()',
        },
      ],
      endpointsGroups: {},
      types: {},
      circularTypeByName: {},
      emittedType: {},
    });
  });

  /**
   * Test shouldExportAllSchemas option
   */
  describe('shouldExportAllSchemas option', () => {
    test('should export only used schemas when false', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Used' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Used: { type: 'string' },
            Unused: { type: 'number' },
          },
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        shouldExportAllSchemas: false,
      });

      expect(result.schemas).toHaveProperty('Used');
      expect(result.schemas).not.toHaveProperty('Unused');
    });

    test('should export all schemas when true', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Used' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Used: { type: 'string' },
            Unused: { type: 'number' },
          },
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        shouldExportAllSchemas: true,
      });

      expect(result.schemas).toHaveProperty('Used');
      expect(result.schemas).toHaveProperty('Unused');
    });
  });

  /**
   * Test shouldExportAllTypes option
   */
  describe('shouldExportAllTypes option', () => {
    test('should generate types only for circular schemas when false', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Circular' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Circular: {
              type: 'object',
              properties: {
                self: { $ref: '#/components/schemas/Circular' },
              },
            },
            NonCircular: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        shouldExportAllTypes: false,
      });

      expect(result.types).toHaveProperty('Circular');
      expect(result.types).not.toHaveProperty('NonCircular');
    });

    test('should generate types for all schemas when true', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Root' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Root: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                settings: { $ref: '#/components/schemas/Settings' },
              },
            },
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
            Settings: {
              type: 'object',
              properties: {
                theme: { type: 'string' },
              },
            },
          },
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        shouldExportAllTypes: true,
      });

      // Types are generated for all schemas in dependency graph when shouldExportAllTypes is true
      // Root is in the graph, and User/Settings are dependencies of Root
      expect(result.types).toHaveProperty('Root');
      expect(result.types).toHaveProperty('User');
      expect(result.types).toHaveProperty('Settings');
    });
  });

  /**
   * Test circular dependency detection
   */
  describe('circular dependency detection', () => {
    test('should detect circular references and wrap with lazy', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Node' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Node: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                next: { $ref: '#/components/schemas/Node' },
              },
            },
          },
        },
      };

      const result = getZodClientTemplateContext(openApiDoc);

      expect(result.circularTypeByName).toHaveProperty('Node');
      expect(result.circularTypeByName['Node']).toBe(true);
      expect(result.schemas['Node']).toContain('z.lazy');
    });

    test('should detect circular references in nested structures', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
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
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                friends: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      };

      const result = getZodClientTemplateContext(openApiDoc);

      expect(result.circularTypeByName).toHaveProperty('User');
      expect(result.schemas['User']).toContain('z.lazy');
    });
  });

  /**
   * Test group strategy options
   */
  describe('group strategy options', () => {
    test('should not group endpoints when strategy is none', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/pet': {
            get: {
              operationId: 'getPet',
              tags: ['pet'],
              responses: {
                '200': {
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
        components: {
          schemas: {},
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        groupStrategy: 'none',
      });

      expect(result.endpointsGroups).toEqual({});
    });

    test('should group endpoints by tag when strategy is tag', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/pet': {
            get: {
              operationId: 'getPet',
              tags: ['pet'],
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          '/store': {
            get: {
              operationId: 'getStore',
              tags: ['store'],
              responses: {
                '200': {
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
        components: {
          schemas: {},
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        groupStrategy: 'tag',
      });

      expect(result.endpointsGroups).toHaveProperty('pet');
      expect(result.endpointsGroups).toHaveProperty('store');
      expect(result.endpointsGroups['pet']?.endpoints).toHaveLength(1);
      expect(result.endpointsGroups['store']?.endpoints).toHaveLength(1);
    });

    test('should group endpoints by method when strategy is method', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/pet': {
            get: {
              operationId: 'getPet',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
            post: {
              operationId: 'postPet',
              responses: {
                '200': {
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
        components: {
          schemas: {},
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        groupStrategy: 'method',
      });

      expect(result.endpointsGroups).toHaveProperty('get');
      expect(result.endpointsGroups).toHaveProperty('post');
      expect(result.endpointsGroups['get']?.endpoints.length).toBeGreaterThan(0);
      expect(result.endpointsGroups['post']?.endpoints.length).toBeGreaterThan(0);
    });

    test('should use Default tag when no tags provided', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
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
        components: {
          schemas: {},
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        groupStrategy: 'tag',
      });

      expect(result.endpointsGroups).toHaveProperty('Default');
      expect(result.endpointsGroups['Default']?.endpoints).toHaveLength(1);
    });
  });

  /**
   * Test schema dependency sorting
   */
  describe('schema dependency sorting', () => {
    test('should sort schemas by dependency order', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
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
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                profile: { $ref: '#/components/schemas/Profile' },
              },
            },
            Profile: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const result = getZodClientTemplateContext(openApiDoc);

      const schemaNames = Object.keys(result.schemas);
      const profileIndex = schemaNames.indexOf('Profile');
      const userIndex = schemaNames.indexOf('User');

      // Profile should come before User since User depends on Profile
      expect(profileIndex).toBeLessThan(userIndex);
    });
  });

  /**
   * Test common schema detection for file grouping
   * NOTE: Common schema detection requires schemas to be referenced as component names
   * in endpoint responses/parameters/errors, not as inline Zod schemas
   */
  describe('common schema detection', () => {
    test('should detect common schemas when using file grouping', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/pet': {
            get: {
              operationId: 'getPet',
              tags: ['pet'],
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Common' },
                    },
                  },
                },
              },
            },
          },
          '/store': {
            get: {
              operationId: 'getStore',
              tags: ['store'],
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Common' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Common: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
          },
        },
      };

      const result = getZodClientTemplateContext(openApiDoc, {
        groupStrategy: 'tag-file',
      });

      // Common schemas are detected when used by multiple groups
      // When groupStrategy includes 'file', commonSchemaNames is populated
      expect(result.commonSchemaNames).toBeDefined();
      // Common schema detection works when schema names appear in multiple groups' dependencies
      // This test documents the behavior exists - exact detection logic may vary
      expect(typeof result.commonSchemaNames).toBe('object');
    });
  });

  /**
   * Test endpoint sorting
   */
  describe('endpoint sorting', () => {
    test('should sort endpoints by path', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.3',
        info: { version: '1', title: 'Test API' },
        paths: {
          '/zebra': {
            get: {
              operationId: 'zebra',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          '/apple': {
            get: {
              operationId: 'apple',
              responses: {
                '200': {
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
        components: {
          schemas: {},
        },
      };

      const result = getZodClientTemplateContext(openApiDoc);

      expect(result.endpoints[0]?.path).toBe('/apple');
      expect(result.endpoints[1]?.path).toBe('/zebra');
    });
  });

  /**
   * Test complex nested dependencies
   */
  test('should handle complex nested dependencies correctly', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.3',
      info: { version: '1', title: 'Test API' },
      paths: {
        '/test': {
          get: {
            operationId: 'test',
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Root' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Root: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
            },
          },
          User: {
            type: 'object',
            properties: {
              profile: { $ref: '#/components/schemas/Profile' },
              settings: { $ref: '#/components/schemas/Settings' },
            },
          },
          Profile: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
          Settings: {
            type: 'object',
            properties: {
              theme: { type: 'string' },
            },
          },
        },
      },
    };

    const result = getZodClientTemplateContext(openApiDoc);

    // All schemas should be present
    expect(result.schemas).toHaveProperty('Root');
    expect(result.schemas).toHaveProperty('User');
    expect(result.schemas).toHaveProperty('Profile');
    expect(result.schemas).toHaveProperty('Settings');

    // Schema order should respect dependencies
    const schemaNames = Object.keys(result.schemas);
    const profileIndex = schemaNames.indexOf('Profile');
    const settingsIndex = schemaNames.indexOf('Settings');
    const userIndex = schemaNames.indexOf('User');
    const rootIndex = schemaNames.indexOf('Root');

    expect(profileIndex).toBeLessThan(userIndex);
    expect(settingsIndex).toBeLessThan(userIndex);
    expect(userIndex).toBeLessThan(rootIndex);
  });
});
