/**
 * Tests for Intermediate Representation (IR) Builder
 *
 * Following TDD: These tests are written FIRST (RED phase)
 * Implementation in ir-builder.ts will follow (GREEN phase)
 */

import { describe, expect, it } from 'vitest';
import type {
  ComponentsObject,
  OpenAPIObject,
  OperationObject,
  PathsObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { buildIR, buildCastrSchemas } from './index.js';
import type { CastrDocument } from '../../ir/schema.js';
import { assertSchemaComponent } from '../../ir/test-helpers.js';

describe('buildCastrSchemas', () => {
  describe('primitive schemas', () => {
    it('should build IR for string schema', () => {
      const components: ComponentsObject = {
        schemas: {
          Username: {
            type: 'string',
            description: 'User name',
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'schema',
        name: 'Username',
        schema: expect.objectContaining({
          type: 'string',
          metadata: expect.objectContaining({
            required: true,
            nullable: false,
          }),
        }),
      });
    });

    it('should build IR for number schema', () => {
      const components: ComponentsObject = {
        schemas: {
          Age: {
            type: 'number',
            description: 'User age',
            minimum: 0,
            maximum: 150,
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      expect(assertSchemaComponent(result[0]).schema.type).toBe('number');
      expect(result[0]?.name).toBe('Age');
    });

    it('should build IR for boolean schema', () => {
      const components: ComponentsObject = {
        schemas: {
          IsActive: {
            type: 'boolean',
            description: 'Active status',
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      expect(assertSchemaComponent(result[0]).schema.type).toBe('boolean');
      expect(result[0]?.name).toBe('IsActive');
    });

    it('should build IR for integer schema', () => {
      const components: ComponentsObject = {
        schemas: {
          Count: {
            type: 'integer',
            format: 'int32',
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      expect(assertSchemaComponent(result[0]).schema.type).toBe('integer');
    });

    it('should handle nullable primitive types (OAS 3.1)', () => {
      const components: ComponentsObject = {
        schemas: {
          NullableString: {
            type: ['string', 'null'],
            description: 'Optional string',
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      expect(assertSchemaComponent(result[0]).schema.metadata.nullable).toBe(true);
    });

    it('should handle multiple primitive schemas', () => {
      const components: ComponentsObject = {
        schemas: {
          Name: { type: 'string' } as SchemaObject,
          Age: { type: 'number' } as SchemaObject,
          Active: { type: 'boolean' } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.name)).toEqual(['Name', 'Age', 'Active']);
    });
  });

  describe('object schemas', () => {
    it('should build IR for simple object schema with properties', () => {
      const components: ComponentsObject = {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' } as SchemaObject,
              age: { type: 'number' } as SchemaObject,
            },
            required: ['name'],
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('User');
      const schema = assertSchemaComponent(result[0]).schema;
      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
      expect(schema.properties?.keys()).toEqual(['name', 'age']);
    });

    it('should mark required properties correctly', () => {
      const components: ComponentsObject = {
        schemas: {
          Pet: {
            type: 'object',
            properties: {
              name: { type: 'string' } as SchemaObject,
              tag: { type: 'string' } as SchemaObject,
            },
            required: ['name'],
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);
      const properties = assertSchemaComponent(result[0]).schema.properties;

      expect(properties?.get('name')?.metadata.required).toBe(true);
      expect(properties?.get('tag')?.metadata.required).toBe(false);
    });

    it('should handle nested object schemas', () => {
      const components: ComponentsObject = {
        schemas: {
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string' } as SchemaObject,
              city: { type: 'string' } as SchemaObject,
            },
          } as SchemaObject,
          Person: {
            type: 'object',
            properties: {
              name: { type: 'string' } as SchemaObject,
              address: {
                type: 'object',
                properties: {
                  street: { type: 'string' } as SchemaObject,
                  city: { type: 'string' } as SchemaObject,
                },
              } as SchemaObject,
            },
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(2);
      const personSchema = result.find((c) => c.name === 'Person');
      const schema = assertSchemaComponent(personSchema).schema;
      expect(schema.properties?.get('address')?.type).toBe('object');
      expect(schema.properties?.get('address')?.properties).toBeDefined();
    });

    it('should handle empty objects', () => {
      const components: ComponentsObject = {
        schemas: {
          EmptyObject: {
            type: 'object',
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      expect(assertSchemaComponent(result[0]).schema.type).toBe('object');
    });
  });

  describe('array schemas', () => {
    it('should build IR for simple array schema', () => {
      const components: ComponentsObject = {
        schemas: {
          StringArray: {
            type: 'array',
            items: { type: 'string' } as SchemaObject,
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      const schema = assertSchemaComponent(result[0]).schema;
      expect(schema.type).toBe('array');
      expect(schema.items).toBeDefined();
      if (!Array.isArray(schema.items)) {
        expect(schema.items?.type).toBe('string');
      }
    });

    it('should handle array of objects', () => {
      const components: ComponentsObject = {
        schemas: {
          UserArray: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' } as SchemaObject,
              },
            } as SchemaObject,
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);
      const schema = assertSchemaComponent(result[0]).schema;

      if (!Array.isArray(schema.items)) {
        expect(schema.items?.type).toBe('object');
        expect(schema.items?.properties).toBeDefined();
      }
    });
  });

  describe('composition schemas', () => {
    it('should build IR for allOf composition', () => {
      const components: ComponentsObject = {
        schemas: {
          Dog: {
            allOf: [
              { type: 'object', properties: { name: { type: 'string' } } } as SchemaObject,
              { type: 'object', properties: { breed: { type: 'string' } } } as SchemaObject,
            ],
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      expect(result).toHaveLength(1);
      const schema = assertSchemaComponent(result[0]).schema;
      expect(schema.allOf).toBeDefined();
      expect(schema.allOf).toHaveLength(2);
    });

    it('should build IR for oneOf composition', () => {
      const components: ComponentsObject = {
        schemas: {
          Pet: {
            oneOf: [
              { type: 'object', properties: { bark: { type: 'boolean' } } } as SchemaObject,
              { type: 'object', properties: { meow: { type: 'boolean' } } } as SchemaObject,
            ],
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);
      const schema = assertSchemaComponent(result[0]).schema;

      expect(schema.oneOf).toBeDefined();
      expect(schema.oneOf).toHaveLength(2);
    });

    it('should build IR for anyOf composition', () => {
      const components: ComponentsObject = {
        schemas: {
          Value: {
            anyOf: [{ type: 'string' } as SchemaObject, { type: 'number' } as SchemaObject],
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);
      const schema = assertSchemaComponent(result[0]).schema;

      expect(schema.anyOf).toBeDefined();
      expect(schema.anyOf).toHaveLength(2);
    });
  });

  describe('reference ($ref) schemas', () => {
    it('should preserve $ref in schema', () => {
      const components: ComponentsObject = {
        schemas: {
          User: {
            type: 'object',
            properties: {
              address: { $ref: '#/components/schemas/Address' },
            },
          } as SchemaObject,
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string' } as SchemaObject,
            },
          } as SchemaObject,
        },
      };

      const result = buildCastrSchemas(components);

      const userSchema = result.find((c) => c.name === 'User');
      const schema = assertSchemaComponent(userSchema).schema;
      expect(schema.properties?.get('address')?.$ref).toBe('#/components/schemas/Address');
    });
  });
});

describe('buildIR', () => {
  it('should build complete IR document from minimal OpenAPI spec', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {},
    };

    const result = buildIR(doc);

    expect(result).toMatchObject({
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: [],
      operations: [],
    } satisfies Partial<CastrDocument>);
    expect(result.dependencyGraph).toBeDefined();
  });

  it('should include schemas in IR document', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {},
      components: {
        schemas: {
          Pet: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          } as SchemaObject,
        },
      },
    };

    const result = buildIR(doc);

    expect(result.components).toHaveLength(1);
    expect(result.components[0]?.name).toBe('Pet');
  });
});

describe('buildCastrOperations', () => {
  describe('simple GET endpoint', () => {
    it('should extract operationId, method, and path from simple GET operation', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              summary: 'Get all users',
              responses: {
                '200': {
                  description: 'Success',
                },
              },
            } as OperationObject,
          },
        } as PathsObject,
      };

      const result = buildIR(doc);

      expect(result.operations).toHaveLength(1);
      expect(result.operations[0]).toMatchObject({
        operationId: 'getUsers',
        method: 'get',
        path: '/users',
      });
    });

    it('should handle GET endpoint with summary and description', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/pets/{petId}': {
            get: {
              operationId: 'getPetById',
              summary: 'Get pet by ID',
              description: 'Returns a single pet',
              responses: {
                '200': {
                  description: 'Success',
                },
              },
            } as OperationObject,
          },
        } as PathsObject,
      };

      const result = buildIR(doc);

      expect(result.operations).toHaveLength(1);
      expect(result.operations[0]).toMatchObject({
        operationId: 'getPetById',
        method: 'get',
        path: '/pets/{petId}',
        summary: 'Get pet by ID',
        description: 'Returns a single pet',
      });
    });

    it('should extract multiple operations from different paths', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { '200': { description: 'Success' } },
            } as OperationObject,
          },
          '/pets': {
            get: {
              operationId: 'getPets',
              responses: { '200': { description: 'Success' } },
            } as OperationObject,
          },
        } as PathsObject,
      };

      const result = buildIR(doc);

      expect(result.operations).toHaveLength(2);
      expect(result.operations.map((op) => op.operationId)).toContain('getUsers');
      expect(result.operations.map((op) => op.operationId)).toContain('getPets');
    });

    it('should handle multiple HTTP methods on same path', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { '200': { description: 'Success' } },
            } as OperationObject,
            post: {
              operationId: 'createUser',
              responses: { '201': { description: 'Created' } },
            } as OperationObject,
          },
        } as PathsObject,
      };

      const result = buildIR(doc);

      expect(result.operations).toHaveLength(2);
      const getUsersOp = result.operations.find((op) => op.operationId === 'getUsers');
      const createUserOp = result.operations.find((op) => op.operationId === 'createUser');

      expect(getUsersOp?.method).toBe('get');
      expect(createUserOp?.method).toBe('post');
      expect(getUsersOp?.path).toBe('/users');
      expect(createUserOp?.path).toBe('/users');
    });
  });

  describe('POST with requestBody, parameters, responses, and security', () => {
    it('should extract parameters from operation', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'getUserById',
              parameters: [
                {
                  name: 'userId',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' } as SchemaObject,
                },
                {
                  name: 'include',
                  in: 'query',
                  required: false,
                  schema: { type: 'string' } as SchemaObject,
                },
              ],
              responses: {
                '200': {
                  description: 'Success',
                },
              },
            } as OperationObject,
          },
        } as PathsObject,
      };

      const result = buildIR(doc);

      expect(result.operations).toHaveLength(1);
      expect(result.operations[0]?.parameters).toHaveLength(2);
      expect(result.operations[0]?.parameters[0]).toMatchObject({
        name: 'userId',
        in: 'path',
        required: true,
      });
      expect(result.operations[0]?.parameters[1]).toMatchObject({
        name: 'include',
        in: 'query',
        required: false,
      });
    });

    it('should extract requestBody from POST operation', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        email: { type: 'string' },
                      },
                      required: ['name', 'email'],
                    } as SchemaObject,
                  },
                },
              },
              responses: {
                '201': {
                  description: 'Created',
                },
              },
            } as OperationObject,
          },
        } as PathsObject,
      };

      const result = buildIR(doc);

      expect(result.operations).toHaveLength(1);
      expect(result.operations[0]?.requestBody).toBeDefined();
      expect(result.operations[0]?.requestBody?.required).toBe(true);
      expect(result.operations[0]?.requestBody?.content).toBeDefined();
    });

    it('should extract responses from operation', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
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
                        items: { type: 'object' } as SchemaObject,
                      } as SchemaObject,
                    },
                  },
                },
                '400': {
                  description: 'Bad Request',
                },
                '500': {
                  description: 'Internal Server Error',
                },
              },
            } as OperationObject,
          },
        } as PathsObject,
      };

      const result = buildIR(doc);

      expect(result.operations).toHaveLength(1);
      expect(result.operations[0]?.responses).toHaveLength(3);
      expect(result.operations[0]?.responses.map((r) => r.statusCode)).toContain('200');
      expect(result.operations[0]?.responses.map((r) => r.statusCode)).toContain('400');
      expect(result.operations[0]?.responses.map((r) => r.statusCode)).toContain('500');
    });

    it('should extract security requirements from operation', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/admin/users': {
            post: {
              operationId: 'createAdminUser',
              security: [
                {
                  bearerAuth: [],
                },
                {
                  apiKey: [],
                },
              ],
              responses: {
                '201': {
                  description: 'Created',
                },
              },
            } as OperationObject,
          },
        } as PathsObject,
      };

      const result = buildIR(doc);

      expect(result.operations).toHaveLength(1);
      expect(result.operations[0]?.security).toBeDefined();
      expect(result.operations[0]?.security).toHaveLength(2);
    });
  });
});

/**
 * Tests for IR-1: CastrDocument enhancements
 * Testing schemaNames and dependencyGraph population
 */
describe('buildIR - IR-1 enhancements', () => {
  describe('schemaNames', () => {
    it('should populate schemaNames from components', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: { type: 'object' } as SchemaObject,
            Address: { type: 'object' } as SchemaObject,
            Pet: { type: 'object' } as SchemaObject,
          },
        },
      };

      const result = buildIR(doc);

      expect(result.schemaNames).toBeDefined();
      expect(result.schemaNames).toEqual(['User', 'Address', 'Pet']);
    });

    it('should return empty array when no schemas exist', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      const result = buildIR(doc);

      expect(result.schemaNames).toEqual([]);
    });

    it('should include schemas from x-ext vendor extension', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: { type: 'object' } as SchemaObject,
          },
        },
        'x-ext': {
          abc123: {
            components: {
              schemas: {
                ExternalPet: { type: 'object' },
              },
            },
          },
        },
      };

      const result = buildIR(doc);

      expect(result.schemaNames).toContain('User');
      expect(result.schemaNames).toContain('ExternalPet');
    });
  });

  describe('dependencyGraph', () => {
    it('should build dependency graph with nodes for each schema', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                address: { $ref: '#/components/schemas/Address' },
              },
            } as SchemaObject,
            Address: { type: 'object' } as SchemaObject,
          },
        },
      };

      const result = buildIR(doc);

      expect(result.dependencyGraph.nodes.size).toBeGreaterThan(0);
      const userNode = result.dependencyGraph.nodes.get('#/components/schemas/User');
      expect(userNode).toBeDefined();
      expect(userNode?.dependencies).toContain('#/components/schemas/Address');
    });

    it('should compute topological order with leaves first', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                address: { $ref: '#/components/schemas/Address' },
              },
            } as SchemaObject,
            Address: { type: 'object' } as SchemaObject,
          },
        },
      };

      const result = buildIR(doc);

      const order = result.dependencyGraph.topologicalOrder;
      const addressIdx = order.indexOf('#/components/schemas/Address');
      const userIdx = order.indexOf('#/components/schemas/User');

      // Address should come before User (leaves first)
      expect(addressIdx).toBeLessThan(userIdx);
    });

    it('should detect circular references', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            Node: {
              type: 'object',
              properties: {
                child: { $ref: '#/components/schemas/Node' },
              },
            } as SchemaObject,
          },
        },
      };

      const result = buildIR(doc);

      // Should detect the self-referential cycle
      expect(result.dependencyGraph.circularReferences.length).toBeGreaterThan(0);
    });

    it('should build dependents (reverse edges) for each node', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                address: { $ref: '#/components/schemas/Address' },
              },
            } as SchemaObject,
            Address: { type: 'object' } as SchemaObject,
          },
        },
      };

      const result = buildIR(doc);

      const addressNode = result.dependencyGraph.nodes.get('#/components/schemas/Address');
      expect(addressNode?.dependents).toContain('#/components/schemas/User');
    });
  });
});
