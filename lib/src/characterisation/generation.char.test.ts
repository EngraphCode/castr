import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import SwaggerParser from '@apidevtools/swagger-parser';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';
import { isOpenAPIObject } from '../cli-type-guards.js';

/**
 * Phase 0 - Task 0.1: End-to-End Generation Tests
 *
 * These tests validate the FULL pipeline: OpenAPI → Generated TypeScript Code
 *
 * CRITICAL: These tests document PUBLIC API behavior, NOT implementation details.
 * They must survive the architectural rewrite (Phases 1-3).
 *
 * Test Strategy:
 * - Test behavior, not implementation
 * - Verify generated code characteristics (not exact output)
 * - Check for type safety guarantees (no type assertions)
 * - Ensure code is valid TypeScript
 */

/**
 * Helper: Bundle an OpenAPI spec using SwaggerParser
 *
 * SwaggerParser.bundle() returns its own OpenAPI type that is structurally
 * compatible with openapi3-ts's OpenAPIObject. We use a type guard to safely
 * narrow the type without using type assertions.
 *
 * This follows the pattern established in cli.ts for handling the type mismatch
 * between @apidevtools/swagger-parser and openapi3-ts.
 */
async function bundleSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
  const bundled: unknown = await SwaggerParser.bundle(spec);
  if (!isOpenAPIObject(bundled)) {
    throw new Error('SwaggerParser.bundle() returned invalid OpenAPI document');
  }
  return bundled;
}

describe('E2E: Full Generation Pipeline', () => {
  describe('Basic OpenAPI 3.0 Specs', () => {
    it('should generate valid TypeScript from minimal spec', async () => {
      // Arrange: Minimal valid OpenAPI 3.0 spec
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
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
                        items: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act: Bundle and generate code
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: Generated code characteristics (PUBLIC API BEHAVIOR)
      expect(typeof result).toBe('string');
      expect(result).toContain('import { z }'); // Has Zod imports
      expect(result).toContain('export const'); // Has exports
      expect(result).not.toContain('as unknown as'); // NO type assertions
      expect(result).not.toContain(' as any'); // NO any casts

      // Verify no type assertions (except 'as const')
      const assertionPattern = / as (?!const\b)/g;
      const matches = result.match(assertionPattern);
      expect(matches).toBeNull();

      // Should contain the operation path (behavior test, not exact format)
      expect(result).toContain('/users'); // Path is in output
    });

    it('should handle schemas with $ref after bundling', async () => {
      // Arrange: Spec with component schema reference
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id'],
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
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: Schema name preserved, no type assertions
      expect(result).toContain('User'); // Schema name in output
      expect(result).not.toContain('as unknown as');

      // Verify the schema structure was generated (flexible pattern)
      expect(result).toContain('.object'); // Has object schema
    });

    it('should handle requestBody with $ref', async () => {
      // Arrange: Spec with requestBody component reference
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          requestBodies: {
            UserBody: {
              description: 'User creation body',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      email: { type: 'string' },
                    },
                    required: ['name'],
                  },
                },
              },
            },
          },
        },
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              requestBody: { $ref: '#/components/requestBodies/UserBody' },
              responses: {
                '201': {
                  description: 'Created',
                  content: {
                    'application/json': {
                      schema: { type: 'object', properties: { id: { type: 'string' } } },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: RequestBody properly resolved and generated
      expect(result).toContain('createUser');
      expect(result).not.toContain('as unknown as');

      // Should have body schema
      expect(result).toMatch(/name.*z\.string/s);
    });

    it('should handle responses with $ref', async () => {
      // Arrange: Spec with response component reference
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          responses: {
            UserResponse: {
              description: 'User response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        paths: {
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
                '200': { $ref: '#/components/responses/UserResponse' },
              },
            },
          },
        },
      };

      // Act
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: Response properly resolved
      expect(result).toContain('/users/:id'); // Path is in output
      expect(result).not.toContain('as unknown as');

      // Should have response schema with id field
      expect(result).toContain('z.string()'); // Has string schema
    });

    it('should handle parameters with $ref', async () => {
      // Arrange: Spec with parameter component reference
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          parameters: {
            UserId: {
              name: 'userId',
              in: 'path',
              required: true,
              description: 'The user ID',
              schema: { type: 'string' },
            },
            PageNumber: {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1 },
            },
          },
        },
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'getUserById',
              parameters: [
                { $ref: '#/components/parameters/UserId' },
                { $ref: '#/components/parameters/PageNumber' },
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object', properties: { id: { type: 'string' } } },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: Parameters properly resolved
      expect(result).toContain('/users/:userId'); // Path with param is in output
      expect(result).not.toContain('as unknown as');

      // Should have parameter schemas
      expect(result).toContain('userId'); // userId parameter
      expect(result).toContain('page'); // page parameter
    });
  });

  describe('Complex OpenAPI Features', () => {
    it('should handle allOf composition', async () => {
      // Arrange: Spec with allOf schema composition
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            BaseEntity: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
              required: ['id'],
            },
            User: {
              allOf: [
                { $ref: '#/components/schemas/BaseEntity' },
                {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                  },
                  required: ['name'],
                },
              ],
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
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: allOf properly handled
      expect(result).toContain('User');
      expect(result).not.toContain('as unknown as');

      // Should have merged properties from allOf
      expect(result).toMatch(/id/);
      expect(result).toMatch(/name/);
    });

    it('should handle oneOf unions', async () => {
      // Arrange: Spec with oneOf union type
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            Cat: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['cat'] },
                meow: { type: 'boolean' },
              },
              required: ['type'],
            },
            Dog: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['dog'] },
                bark: { type: 'boolean' },
              },
              required: ['type'],
            },
            Pet: {
              oneOf: [{ $ref: '#/components/schemas/Cat' }, { $ref: '#/components/schemas/Dog' }],
            },
          },
        },
        paths: {
          '/pets': {
            get: {
              operationId: 'getPets',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Pet' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: oneOf properly handled as union
      expect(result).toContain('Pet');
      expect(result).toContain('Cat');
      expect(result).toContain('Dog');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle circular references', async () => {
      // Arrange: Spec with circular schema references
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            TreeNode: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                children: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TreeNode' },
                },
              },
            },
          },
        },
        paths: {
          '/tree': {
            get: {
              operationId: 'getTree',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/TreeNode' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: Circular reference handled (z.lazy)
      expect(result).toContain('TreeNode');
      expect(result).not.toContain('as unknown as');

      // Should use z.lazy for circular reference
      expect(result).toMatch(/z\.lazy/);
    });

    it('should handle deeply nested schemas', async () => {
      // Arrange: Spec with deeply nested object structures
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            DeepNested: {
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
        paths: {
          '/deep': {
            get: {
              operationId: 'getDeep',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/DeepNested' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: Deep nesting handled
      expect(result).toContain('DeepNested');
      expect(result).not.toContain('as unknown as');

      // Should contain nested properties
      expect(result).toMatch(/level1/);
      expect(result).toMatch(/level2/);
      expect(result).toMatch(/level3/);
    });
  });

  describe('Template Options', () => {
    it('should generate default template correctly', async () => {
      // Arrange
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
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act: Generate with default template (implicit)
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Assert: Default template includes Zodios client
      expect(result).toContain('import { z }');
      expect(result).toContain('makeApi'); // Default template has Zodios API
      expect(result).not.toContain('as unknown as');
    });

    it('should generate schemas-only template', async () => {
      // Arrange: Must have at least one path that references the schema
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id'],
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
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act: Generate with schemas-only template
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
        template: 'schemas-only',
      });

      // Assert: Schemas-only template has no API client
      expect(result).toContain('import { z }');
      expect(result).toContain('User');
      expect(result).not.toContain('makeApi'); // No Zodios client
      expect(result).not.toContain('as unknown as');
    });

    it('should generate schemas-with-metadata template', async () => {
      // Arrange
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id'],
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
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Act: Generate with schemas-with-metadata template
      const bundled = await bundleSpec(spec);
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
        template: 'schemas-with-metadata',
      });

      // Assert: Has schemas and metadata
      expect(result).toContain('import { z }');
      expect(result).toContain('User');
      expect(result).not.toContain('makeApi'); // No Zodios client
      expect(result).not.toContain('as unknown as');
    });
  });
});
