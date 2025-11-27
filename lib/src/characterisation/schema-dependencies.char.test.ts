import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';
import { assertAndExtractContent, extractContent } from './test-utils.js';

/**
 * Characterisation Tests: Schema Dependencies
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

describe('Characterisation: Schema Dependency Resolution - Schema Ordering', () => {
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
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: Address must appear before User in generated code
    const content = assertAndExtractContent(result, 'generated code');
    const addressIndex = content.indexOf('Address');
    const userIndex = content.indexOf('User');
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
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: Address before User, User before Company
    const content = assertAndExtractContent(result, 'generated code');
    const addressIndex = content.indexOf('Address');
    const userIndex = content.indexOf('User');
    const companyIndex = content.indexOf('Company');

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
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: Address and Contact both appear before Person
    const content = assertAndExtractContent(result, 'generated code');
    const addressIndex = content.indexOf('Address');
    const contactIndex = content.indexOf('Contact');
    const personIndex = content.indexOf('Person');

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
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: User appears before Group
    const content = assertAndExtractContent(result, 'generated code');
    const userIndex = content.indexOf('User');
    const groupIndex = content.indexOf('Group');

    expect(userIndex).toBeLessThan(groupIndex);
  });
});

describe('Characterisation: Schema Dependency Resolution - Circular Dependencies', () => {
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
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: Uses z.lazy for circular reference
    expect(extractContent(result)).toContain('TreeNode');
    expect(extractContent(result)).toContain('z.lazy');
    expect(extractContent(result)).not.toContain('as unknown as');
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
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: Both schemas generated with z.lazy
    expect(extractContent(result)).toContain('Author');
    expect(extractContent(result)).toContain('Book');
    expect(extractContent(result)).toContain('z.lazy');
    expect(extractContent(result)).not.toContain('as unknown as');
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
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: Circular reference handled
    expect(extractContent(result)).toContain('ExtendedNode');
    expect(extractContent(result)).toContain('BaseNode');
    expect(extractContent(result)).not.toContain('as unknown as');
  });
});

describe('Characterisation: Schema Dependency Resolution - Additional Dependency Scenarios', () => {
  it('should handle dependencies through additionalProperties', async () => {
    // Arrange: Schema with additionalProperties referencing another schema
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      components: {
        schemas: {
          Dictionary: {
            type: 'object',
            additionalProperties: { $ref: '#/components/schemas/Value' },
          },
          Value: {
            type: 'object',
            properties: {
              data: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/dict': {
          get: {
            operationId: 'getDict',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Dictionary' },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Act
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: Value appears before Dictionary
    const content = assertAndExtractContent(result, 'generated code');
    const valueIndex = content.indexOf('Value');
    const dictionaryIndex = content.indexOf('Dictionary');

    expect(valueIndex).toBeLessThan(dictionaryIndex);
    expect(extractContent(result)).not.toContain('as unknown as');
  });

  it('should handle dependencies in oneOf/anyOf union members', async () => {
    // Arrange: Union schema with multiple referenced schemas
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      components: {
        schemas: {
          TypeA: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['a'] },
              valueA: { type: 'string' },
            },
          },
          TypeB: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['b'] },
              valueB: { type: 'number' },
            },
          },
          Union: {
            oneOf: [{ $ref: '#/components/schemas/TypeA' }, { $ref: '#/components/schemas/TypeB' }],
          },
        },
      },
      paths: {
        '/union': {
          get: {
            operationId: 'getUnion',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Union' },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Act
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: TypeA and TypeB appear before Union
    const content = assertAndExtractContent(result, 'generated code');
    const typeAIndex = content.indexOf('TypeA');
    const typeBIndex = content.indexOf('TypeB');
    const unionIndex = content.indexOf('Union');

    expect(typeAIndex).toBeLessThan(unionIndex);
    expect(typeBIndex).toBeLessThan(unionIndex);
    expect(extractContent(result)).not.toContain('as unknown as');
  });

  it('should handle complex dependency diamond (A→B, A→C, B→D, C→D)', async () => {
    // Arrange: Diamond dependency pattern
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      components: {
        schemas: {
          Base: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
          Left: {
            type: 'object',
            properties: {
              base: { $ref: '#/components/schemas/Base' },
              leftValue: { type: 'string' },
            },
          },
          Right: {
            type: 'object',
            properties: {
              base: { $ref: '#/components/schemas/Base' },
              rightValue: { type: 'number' },
            },
          },
          Top: {
            type: 'object',
            properties: {
              left: { $ref: '#/components/schemas/Left' },
              right: { $ref: '#/components/schemas/Right' },
            },
          },
        },
      },
      paths: {
        '/diamond': {
          get: {
            operationId: 'getDiamond',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Top' },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Act
    // Bundling not needed for in-memory specs with internal refs
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Assert: Base appears before Left and Right, which appear before Top
    const content = assertAndExtractContent(result, 'generated code');
    const baseIndex = content.indexOf('Base');
    const leftIndex = content.indexOf('Left');
    const rightIndex = content.indexOf('Right');
    const topIndex = content.indexOf('Top');

    expect(baseIndex).toBeLessThan(leftIndex);
    expect(baseIndex).toBeLessThan(rightIndex);
    expect(leftIndex).toBeLessThan(topIndex);
    expect(rightIndex).toBeLessThan(topIndex);
    expect(extractContent(result)).not.toContain('as unknown as');
  });
});

/**
 * NOTE: Tests for internal dependency graph implementation exist in
 * getOpenApiDependencyGraph.test.ts. This file focuses on PUBLIC API behavior
 * (characterisation tests showing that generated code has correct schema ordering).
 *
 * The tests above thoroughly document the PUBLIC API behavior around
 * schema dependency ordering in generated output.
 */
