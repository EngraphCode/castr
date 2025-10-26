import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import SwaggerParser from '@apidevtools/swagger-parser';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';
import { isOpenAPIObject } from '../cli-type-guards.js';

/**
 * Phase 0 - Task 0.2: Schema Dependencies Tests
 *
 * These tests validate schema dependency resolution and ordering.
 *
 * CRITICAL: These tests document PUBLIC API behavior around:
 * - Dependency graph generation
 * - Topological sorting
 * - Circular dependency detection
 * - Schema ordering in generated output
 *
 * Test Strategy:
 * - Test behavior, not implementation
 * - Verify schemas are ordered correctly (dependencies before dependents)
 * - Check circular dependencies are handled gracefully
 * - Ensure self-referencing schemas work
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

describe('E2E: Schema Dependency Resolution', () => {
  describe('Schema Ordering', () => {
    it('should order schemas by dependencies (Address before User)', async () => {
      // Arrange: User depends on Address
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { $ref: '#/components/schemas/Address' },
              },
            },
            Address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
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

      // Assert: Address must appear before User in generated code
      const addressIndex = result.indexOf('Address');
      const userIndex = result.indexOf('User');
      expect(addressIndex).toBeGreaterThan(-1);
      expect(userIndex).toBeGreaterThan(-1);
      expect(addressIndex).toBeLessThan(userIndex);
    });

    it('should handle multi-level dependencies (A → B → C)', async () => {
      // Arrange: Company depends on User, User depends on Address
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            Company: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                owner: { $ref: '#/components/schemas/User' },
              },
            },
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { $ref: '#/components/schemas/Address' },
              },
            },
            Address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
              },
            },
          },
        },
        paths: {
          '/companies': {
            get: {
              operationId: 'getCompanies',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Company' },
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

      // Assert: Address before User, User before Company
      const addressIndex = result.indexOf('Address');
      const userIndex = result.indexOf('User');
      const companyIndex = result.indexOf('Company');

      expect(addressIndex).toBeLessThan(userIndex);
      expect(userIndex).toBeLessThan(companyIndex);
    });

    it('should handle schemas with multiple dependencies', async () => {
      // Arrange: Person depends on both Address and Contact
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            Person: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { $ref: '#/components/schemas/Address' },
                contact: { $ref: '#/components/schemas/Contact' },
              },
            },
            Address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
              },
            },
            Contact: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                phone: { type: 'string' },
              },
            },
          },
        },
        paths: {
          '/people': {
            get: {
              operationId: 'getPeople',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Person' },
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

      // Assert: Address and Contact both appear before Person
      const addressIndex = result.indexOf('Address');
      const contactIndex = result.indexOf('Contact');
      const personIndex = result.indexOf('Person');

      expect(addressIndex).toBeLessThan(personIndex);
      expect(contactIndex).toBeLessThan(personIndex);
    });

    it('should handle array dependencies', async () => {
      // Arrange: Group depends on User (via array)
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            Group: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                members: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
        paths: {
          '/groups': {
            get: {
              operationId: 'getGroups',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Group' },
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

      // Assert: User appears before Group
      const userIndex = result.indexOf('User');
      const groupIndex = result.indexOf('Group');

      expect(userIndex).toBeLessThan(groupIndex);
    });
  });

  describe('Circular Dependencies', () => {
    it('should handle circular references (Node → Node)', async () => {
      // Arrange: TreeNode references itself
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

      // Assert: Uses z.lazy for circular reference
      expect(result).toContain('TreeNode');
      expect(result).toContain('z.lazy');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle mutual circular references (A → B → A)', async () => {
      // Arrange: Author references Book, Book references Author
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            Author: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                books: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Book' },
                },
              },
            },
            Book: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                author: { $ref: '#/components/schemas/Author' },
              },
            },
          },
        },
        paths: {
          '/authors': {
            get: {
              operationId: 'getAuthors',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Author' },
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

      // Assert: Both schemas generated with z.lazy
      expect(result).toContain('Author');
      expect(result).toContain('Book');
      expect(result).toContain('z.lazy');
      expect(result).not.toContain('as unknown as');
    });

    it('should handle circular references in allOf', async () => {
      // Arrange: Node with allOf that includes circular reference
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        components: {
          schemas: {
            BaseNode: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
            ExtendedNode: {
              allOf: [
                { $ref: '#/components/schemas/BaseNode' },
                {
                  type: 'object',
                  properties: {
                    parent: { $ref: '#/components/schemas/ExtendedNode' },
                  },
                },
              ],
            },
          },
        },
        paths: {
          '/nodes': {
            get: {
              operationId: 'getNodes',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/ExtendedNode' },
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

      // Assert: Circular reference handled
      expect(result).toContain('ExtendedNode');
      expect(result).toContain('BaseNode');
      expect(result).not.toContain('as unknown as');
    });
  });

  /**
   * NOTE: Tests for internal dependency graph implementation exist in
   * getOpenApiDependencyGraph.test.ts. This file focuses on PUBLIC API behavior
   * (E2E tests showing that generated code has correct schema ordering).
   *
   * The 7 tests above thoroughly document the PUBLIC API behavior around
   * schema dependency ordering in generated output.
   */
});
