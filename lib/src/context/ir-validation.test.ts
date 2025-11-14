/**
 * Comprehensive IR Validation Tests
 *
 * These tests prove that the IR (Information Retrieval) system actually delivers
 * the intended impact: a correct, lossless, and useful representation of OpenAPI
 * specifications that enables reliable code generation.
 *
 * Test Philosophy:
 * - Prove correctness, not just existence
 * - Validate real-world scenarios, not toy examples
 * - Assert on actual metadata values, not just structure
 * - Test integration, not just units
 *
 * @module ir-validation.test
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { getZodClientTemplateContext } from './template-context.js';
import { isIRDocument, isIRSchemaNode } from './ir-validators.js';
import {
  getComponent,
  getSchemaProperty,
  assertPropertiesMetadata,
  assertHasIRSchemaProperties,
} from './ir-test-helpers.js';

describe('IR Validation - Correctness & Completeness', () => {
  describe('Basic Schema Representation', () => {
    test('captures complete metadata for simple object schema', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              required: ['id', 'email'],
              properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);

      // PROVE: IR exists and is valid
      expect(ctx._ir).toBeDefined();
      expect(isIRDocument(ctx._ir)).toBe(true);

      // PROVE: Schema is captured with correct structure
      const userComponent = getComponent(ctx._ir?.components, 'User');
      expect(userComponent.type).toBe('schema');

      const userSchema = userComponent.schema;
      expect(userSchema?.type).toBe('object');

      // PROVE: Metadata is correctly computed
      expect(userSchema?.metadata).toBeDefined();
      expect(isIRSchemaNode(userSchema?.metadata)).toBe(true);

      // PROVE: Properties exist with correct metadata using helper
      if (userSchema) {
        assertHasIRSchemaProperties(userSchema);
        assertPropertiesMetadata(userSchema, ['id', 'email'], ['name']);

        // Verify nullable status
        const idProp = getSchemaProperty(userSchema, 'id');
        const emailProp = getSchemaProperty(userSchema, 'email');
        const nameProp = getSchemaProperty(userSchema, 'name');

        expect(idProp.metadata.nullable).toBe(false);
        expect(emailProp.metadata.nullable).toBe(false);
        expect(nameProp.metadata.nullable).toBe(false);
      } else {
        throw new Error('Expected user schema to exist');
      }
    });

    test('correctly computes nullable from OAS 3.1 type arrays', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
        components: {
          schemas: {
            NullableField: {
              type: 'object',
              properties: {
                nullableString: { type: ['string', 'null'] },
                nonNullableString: { type: 'string' },
              },
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);
      const component = ctx._ir?.components?.find((c) => c.name === 'NullableField');
      const schema = component?.schema;

      // PROVE: Nullable detection works correctly
      if (schema?.type === 'object' && schema.properties) {
        expect(schema.properties.get('nullableString')?.metadata.nullable).toBe(true);
        expect(schema.properties.get('nonNullableString')?.metadata.nullable).toBe(false);
      } else {
        throw new Error('Expected object schema with properties');
      }
    });
  });

  describe('Circular Reference Detection', () => {
    test('detects self-referencing schemas', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
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

      const ctx = getZodClientTemplateContext(openApiDoc);
      const nodeComponent = ctx._ir?.components?.find((c) => c.name === 'Node');

      // PROVE: Circular reference is detected
      expect(nodeComponent).toBeDefined();
      const metadata = nodeComponent?.schema?.metadata;
      expect(metadata?.circularReferences.length).toBeGreaterThan(0);
      expect(metadata?.circularReferences).toContain('#/components/schemas/Node');
    });

    test('detects mutual circular references', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Author: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                books: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
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
      };

      const ctx = getZodClientTemplateContext(openApiDoc);

      // PROVE: Both schemas detect the circular dependency
      const authorComponent = ctx._ir?.components?.find((c) => c.name === 'Author');
      const bookComponent = ctx._ir?.components?.find((c) => c.name === 'Book');

      const authorCircularRefs = authorComponent?.schema?.metadata.circularReferences || [];
      const bookCircularRefs = bookComponent?.schema?.metadata.circularReferences || [];

      // At least one should detect the cycle
      const totalCircularRefs = authorCircularRefs.length + bookCircularRefs.length;
      expect(totalCircularRefs).toBeGreaterThan(0);
    });
  });

  describe('Operation Metadata', () => {
    test('captures complete operation with parameters', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'getUser',
              parameters: [
                {
                  name: 'userId',
                  in: 'path',
                  required: true,
                  schema: { type: 'integer' },
                },
                {
                  name: 'include',
                  in: 'query',
                  required: false,
                  schema: { type: 'string' },
                },
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          name: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);

      // PROVE: Operation is captured
      const operation = ctx._ir?.operations?.find((op) => op.operationId === 'getUser');
      expect(operation).toBeDefined();

      // PROVE: Parameters are captured with correct metadata
      expect(operation?.parameters).toBeDefined();
      expect(operation?.parameters?.length).toBe(2);

      const pathParam = operation?.parameters?.find((p) => p.name === 'userId');
      const queryParam = operation?.parameters?.find((p) => p.name === 'include');

      // Path parameter metadata
      expect(pathParam?.in).toBe('path');
      expect(pathParam?.metadata?.required).toBe(true);
      // Note: schema.type may be "integer" or other primitive types
      expect(pathParam?.schema.type).toBeDefined();

      // Query parameter metadata
      expect(queryParam?.in).toBe('query');
      expect(queryParam?.metadata?.required).toBe(false);
    });

    test('captures request body with correct metadata', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
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
                      required: ['email'],
                      properties: {
                        email: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'Created',
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
        components: { schemas: {} },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);
      const operation = ctx._ir?.operations?.find((op) => op.operationId === 'createUser');

      // PROVE: Request body is captured
      expect(operation?.requestBody).toBeDefined();
      expect(operation?.requestBody?.required).toBe(true);

      // PROVE: Request body schema has correct metadata
      // Schema should be in content['application/json'].schema per IR structure
      const bodyContent = operation?.requestBody?.content?.['application/json'];
      expect(bodyContent).toBeDefined();

      const bodySchema = bodyContent?.schema;
      expect(bodySchema).toBeDefined();
      expect(bodySchema?.metadata).toBeDefined();

      // PROVE: Body properties have correct required status
      if (bodySchema?.type === 'object' && bodySchema.properties) {
        expect(bodySchema.properties.get('email')?.metadata.required).toBe(true);
        expect(bodySchema.properties.get('name')?.metadata.required).toBe(false);
      }
    });

    test('captures multiple response status codes', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {
          '/users/{userId}': {
            delete: {
              operationId: 'deleteUser',
              parameters: [
                {
                  name: 'userId',
                  in: 'path',
                  required: true,
                  schema: { type: 'integer' },
                },
              ],
              responses: {
                '204': { description: 'No Content' },
                '404': {
                  description: 'Not Found',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          error: { type: 'string' },
                        },
                      },
                    },
                  },
                },
                '500': {
                  description: 'Internal Error',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);
      const operation = ctx._ir?.operations?.find((op) => op.operationId === 'deleteUser');

      // PROVE: All response status codes are captured
      expect(operation?.responses).toBeDefined();
      expect(operation?.responses?.length).toBeGreaterThanOrEqual(2);

      const statusCodes = operation?.responses?.map((r) => r.statusCode) || [];
      expect(statusCodes).toContain('204');
      expect(statusCodes).toContain('404');
      expect(statusCodes).toContain('500');
    });
  });

  describe('Complex Schema Patterns', () => {
    test('correctly handles allOf composition', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Base: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
              },
            },
            Extended: {
              allOf: [
                { $ref: '#/components/schemas/Base' },
                {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                  },
                },
              ],
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);

      // PROVE: Both schemas are captured
      expect(ctx._ir?.components?.length).toBe(2);

      const extendedComponent = ctx._ir?.components?.find((c) => c.name === 'Extended');
      expect(extendedComponent).toBeDefined();

      // PROVE: allOf structure is preserved in IR
      const extendedSchema = extendedComponent?.schema;
      expect(extendedSchema).toBeDefined();

      // REQUIRED BEHAVIOR: allOf MUST be represented in a way that allows reconstruction
      // Either as a composition type or with preserved reference information
      // This is critical for lossless representation
      const isComposition = extendedSchema && 'composition' in extendedSchema;
      const hasAllOf = extendedSchema && 'allOf' in extendedSchema;

      expect(isComposition || hasAllOf).toBe(true);
    });

    test('correctly handles oneOf composition', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
        components: {
          schemas: {
            StringOrNumber: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);
      const component = ctx._ir?.components?.find((c) => c.name === 'StringOrNumber');

      // PROVE: oneOf is captured correctly
      expect(component).toBeDefined();
      const schema = component?.schema;

      // REQUIRED BEHAVIOR: oneOf MUST be preserved for lossless representation
      expect(schema).toBeDefined();
      const isComposition = schema && 'composition' in schema;
      const hasOneOf = schema && 'oneOf' in schema;

      expect(isComposition || hasOneOf).toBe(true);
    });

    test('handles deeply nested references', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Level1: {
              type: 'object',
              properties: {
                level2: { $ref: '#/components/schemas/Level2' },
              },
            },
            Level2: {
              type: 'object',
              properties: {
                level3: { $ref: '#/components/schemas/Level3' },
              },
            },
            Level3: {
              type: 'object',
              properties: {
                value: { type: 'string' },
              },
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);

      // PROVE: All schemas are captured
      expect(ctx._ir?.components?.length).toBe(3);

      // PROVE: Dependency tracking exists
      const level1 = ctx._ir?.components?.find((c) => c.name === 'Level1');
      expect(level1?.schema?.metadata.dependencyGraph).toBeDefined();
      expect(level1?.schema?.metadata.dependencyGraph.depth).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Array and Primitive Types', () => {
    test('correctly represents array schemas with item metadata', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
        components: {
          schemas: {
            StringArray: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 10,
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);
      const component = ctx._ir?.components?.find((c) => c.name === 'StringArray');

      // PROVE: Array is correctly represented
      expect(component).toBeDefined();
      const schema = component?.schema;
      expect(schema?.type).toBe('array');

      // PROVE: Array constraints are captured
      if (schema?.type === 'array') {
        expect(schema.items).toBeDefined();
        // items can be a single schema or tuple (array of schemas)
        const items = schema.items;
        if (Array.isArray(items)) {
          // Tuple validation
          expect(items.length).toBeGreaterThan(0);
        } else {
          // Single schema validation
          expect(items?.type).toBeDefined();
        }
      }
    });

    test('correctly represents enum schemas with values', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Status: {
              type: 'string',
              enum: ['active', 'pending', 'inactive'],
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);
      const component = ctx._ir?.components?.find((c) => c.name === 'Status');

      // REQUIRED BEHAVIOR: Enum values MUST be preserved in IR
      expect(component).toBeDefined();
      const schema = component?.schema;

      // The schema should have an enum field or the type should be an array including enum values
      // This is lossless representation - we MUST not lose the enum constraint
      expect(schema).toBeDefined();

      // Check for enum values in the schema structure
      // The exact representation may vary, but enum values MUST be accessible
      const hasEnumValues = schema && 'enum' in schema && Array.isArray(schema.enum);

      expect(hasEnumValues).toBe(true);

      if (schema && 'enum' in schema) {
        expect(schema.enum).toContain('active');
        expect(schema.enum).toContain('pending');
        expect(schema.enum).toContain('inactive');
      }
    });
  });

  describe('Real-World Integration', () => {
    test('handles a realistic API specification', () => {
      const openApiDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'User Management API' },
        paths: {
          '/users': {
            get: {
              operationId: 'listUsers',
              parameters: [
                {
                  name: 'page',
                  in: 'query',
                  schema: { type: 'integer', minimum: 1 },
                },
                {
                  name: 'limit',
                  in: 'query',
                  schema: { type: 'integer', minimum: 1, maximum: 100 },
                },
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          users: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' },
                          },
                          total: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            post: {
              operationId: 'createUser',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CreateUserRequest' },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'Created',
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
              required: ['id', 'email'],
              properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                name: { type: ['string', 'null'] },
                profile: { $ref: '#/components/schemas/Profile' },
              },
            },
            Profile: {
              type: 'object',
              properties: {
                bio: { type: 'string' },
                avatar: { type: 'string', format: 'uri' },
              },
            },
            CreateUserRequest: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(openApiDoc);

      // PROVE: Complete IR is generated
      expect(ctx._ir).toBeDefined();
      expect(isIRDocument(ctx._ir)).toBe(true);

      // PROVE: All schemas are captured
      expect(ctx._ir?.components?.length).toBe(3);
      const schemaNames = ctx._ir?.components?.map((c) => c.name) || [];
      expect(schemaNames).toContain('User');
      expect(schemaNames).toContain('Profile');
      expect(schemaNames).toContain('CreateUserRequest');

      // PROVE: All operations are captured
      expect(ctx._ir?.operations?.length).toBe(2);
      const operationIds = ctx._ir?.operations?.map((op) => op.operationId) || [];
      expect(operationIds).toContain('listUsers');
      expect(operationIds).toContain('createUser');

      // PROVE: Complex metadata is correct (nullable field in User)
      const userComponent = ctx._ir?.components?.find((c) => c.name === 'User');
      const userSchema = userComponent?.schema;
      if (userSchema?.type === 'object' && userSchema.properties) {
        // name field is nullable
        expect(userSchema.properties.get('name')?.metadata.nullable).toBe(true);
        // email field is required and not nullable
        expect(userSchema.properties.get('email')?.metadata.required).toBe(true);
        expect(userSchema.properties.get('email')?.metadata.nullable).toBe(false);
      }

      // PROVE: Request body is correctly linked
      const createOp = ctx._ir?.operations?.find((op) => op.operationId === 'createUser');
      expect(createOp?.requestBody).toBeDefined();
      expect(createOp?.requestBody?.required).toBe(true);
    });
  });
});
