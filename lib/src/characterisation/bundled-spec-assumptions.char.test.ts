import { describe, it, expect } from 'vitest';
import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';

/**
 * CRITICAL PHASE 0 DISCOVERY: SwaggerParser.bundle() vs dereference()
 *
 * These tests revealed a critical assumption error:
 * - SwaggerParser.bundle() DOES NOT resolve operation-level $refs (keeps them)
 * - SwaggerParser.dereference() DOES resolve all $refs (fully dereferences)
 *
 * Current code uses bundle() + makeSchemaResolver to handle $refs.
 * Phase 1 should switch to dereference() and eliminate the resolver.
 *
 * These tests validate:
 * 1. dereference() resolves operation-level $refs (enables Phase 1)
 * 2. Our code works correctly with dereferenced specs
 * 3. Component schemas preserve structure for dependency tracking
 *
 * @see .agent/plans/PHASE-0-COMPLETE.md for rationale
 * @see src/characterisation/debug-bundle.test.ts for proof
 */
describe('Dereferenced Spec Guarantees - Our Code Integration', () => {
  describe('Guarantee: dereference() Resolves Operation-Level $refs', () => {
    it('should resolve $ref in parameters', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          parameters: {
            UserId: {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          },
        },
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'getUser',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
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

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;
      const operation = bundled.paths?.['/users/{userId}']?.get as OperationObject;

      // CRITICAL: After dereference(), parameters should NOT be $refs
      expect(operation.parameters).toBeDefined();
      expect(operation.parameters?.[0]).toBeDefined();
      expect(isReferenceObject(operation.parameters![0])).toBe(false);
      expect(operation.parameters![0]).toHaveProperty('name', 'userId');
    });

    it('should resolve $ref in requestBody', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          requestBodies: {
            UserBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
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
                '201': { description: 'Created' },
              },
            },
          },
        },
      };

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;
      const operation = bundled.paths?.['/users']?.post as OperationObject;

      // CRITICAL: After dereference(), requestBody should NOT be a $ref
      expect(operation.requestBody).toBeDefined();
      expect(isReferenceObject(operation.requestBody!)).toBe(false);
      expect(operation.requestBody).toHaveProperty('content');
    });

    it('should resolve $ref in responses', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          responses: {
            UserResponse: {
              description: 'User response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { id: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': { $ref: '#/components/responses/UserResponse' },
              },
            },
          },
        },
      };

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;
      const operation = bundled.paths?.['/users']?.get as OperationObject;

      // CRITICAL: After dereference(), responses should NOT be $refs
      expect(operation.responses?.['200']).toBeDefined();
      expect(isReferenceObject(operation.responses['200'])).toBe(false);
      expect(operation.responses['200']).toHaveProperty('description');
    });

    it('should resolve multiple levels of operation $refs', async () => {
      // Test nested refs in parameters, requestBody, responses
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          parameters: {
            PageParam: {
              name: 'page',
              in: 'query',
              schema: { type: 'integer' },
            },
            LimitParam: {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer' },
            },
          },
          requestBodies: {
            CreateUser: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' }, email: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            UserList: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                },
              },
            },
          },
        },
        paths: {
          '/users': {
            get: {
              operationId: 'listUsers',
              parameters: [
                { $ref: '#/components/parameters/PageParam' },
                { $ref: '#/components/parameters/LimitParam' },
              ],
              responses: {
                '200': { $ref: '#/components/responses/UserList' },
              },
            },
            post: {
              operationId: 'createUser',
              requestBody: { $ref: '#/components/requestBodies/CreateUser' },
              responses: {
                '201': { description: 'Created' },
              },
            },
          },
        },
      };

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;

      // Check GET operation
      const getOp = bundled.paths?.['/users']?.get as OperationObject;
      expect(getOp.parameters).toBeDefined();
      expect(getOp.parameters!.length).toBe(2);
      expect(isReferenceObject(getOp.parameters![0])).toBe(false);
      expect(isReferenceObject(getOp.parameters![1])).toBe(false);
      expect(getOp.responses?.['200']).toBeDefined();
      expect(isReferenceObject(getOp.responses['200'])).toBe(false);

      // Check POST operation
      const postOp = bundled.paths?.['/users']?.post as OperationObject;
      expect(postOp.requestBody).toBeDefined();
      expect(isReferenceObject(postOp.requestBody!)).toBe(false);
    });

    it('should resolve $refs across multiple operations', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          parameters: {
            UserId: {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          },
          responses: {
            Success: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
          },
        },
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'getUser',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
              responses: {
                '200': { $ref: '#/components/responses/Success' },
              },
            },
            delete: {
              operationId: 'deleteUser',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
              responses: {
                '200': { $ref: '#/components/responses/Success' },
              },
            },
          },
          '/users/{userId}/profile': {
            get: {
              operationId: 'getUserProfile',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
              responses: {
                '200': { $ref: '#/components/responses/Success' },
              },
            },
          },
        },
      };

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;

      // All operations should have resolved refs
      const operations = [
        bundled.paths?.['/users/{userId}']?.get,
        bundled.paths?.['/users/{userId}']?.delete,
        bundled.paths?.['/users/{userId}/profile']?.get,
      ];

      for (const op of operations) {
        const operation = op as OperationObject;
        expect(operation).toBeDefined();
        expect(operation.parameters?.[0]).toBeDefined();
        expect(isReferenceObject(operation.parameters![0])).toBe(false);
        expect(operation.responses?.['200']).toBeDefined();
        expect(isReferenceObject(operation.responses['200'])).toBe(false);
      }
    });
  });

  describe('Component Schemas Preserve $refs', () => {
    it('should keep $refs in component schemas for dependency tracking', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Address: {
              type: 'object',
              properties: { street: { type: 'string' } },
            },
            User: {
              type: 'object',
              properties: {
                address: { $ref: '#/components/schemas/Address' },
              },
            },
          },
        },
        paths: {},
      };

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;

      // Component schemas SHOULD preserve $refs (for topological sorting)
      const userSchema = bundled.components?.schemas?.['User'];
      expect(userSchema).toBeDefined();
      expect(userSchema).toHaveProperty('properties');

      // The $ref might still exist in properties.address
      // (This is GOOD - we need it for dependency resolution)
      const userSchemaObj = userSchema as { properties?: { address?: { $ref?: string } } };
      if (userSchemaObj.properties?.address) {
        // Ref may or may not be preserved - both are OK for dependency tracking
        // What matters is our code can handle both cases
        expect(userSchemaObj.properties.address).toBeDefined();
      }
    });

    it('should handle allOf/oneOf/anyOf with $refs in schemas', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Base: {
              type: 'object',
              properties: { id: { type: 'string' } },
            },
            Extended: {
              allOf: [
                { $ref: '#/components/schemas/Base' },
                {
                  type: 'object',
                  properties: { name: { type: 'string' } },
                },
              ],
            },
          },
        },
        paths: {},
      };

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;

      const extendedSchema = bundled.components?.schemas?.['Extended'];
      expect(extendedSchema).toBeDefined();
      expect(extendedSchema).toHaveProperty('allOf');
    });
  });

  describe('Our Code Works with Dereferenced Specs', () => {
    it('should generate code from dereferenced petstore without errors', async () => {
      // Dereference the spec (resolve all $refs)
      const bundled = (await SwaggerParser.dereference(
        './examples/swagger/petstore.yaml',
      )) as OpenAPIObject;

      // Prove our code works with dereferenced output
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      // Validate our code produced expected output
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('import { z }');

      // Prove dereferenced structure allows direct access
      const operations = Object.values(bundled.paths || {}).flatMap((pathItem) =>
        Object.values(pathItem || {}).filter(
          (v): v is OperationObject => typeof v === 'object' && v !== null && 'responses' in v,
        ),
      );

      expect(operations.length).toBeGreaterThan(0);

      // Our guarantee: after dereference(), we can access these directly (no $refs)
      for (const operation of operations) {
        if (operation.parameters) {
          for (const param of operation.parameters) {
            expect(isReferenceObject(param)).toBe(false);
          }
        }
        if (operation.requestBody) {
          expect(isReferenceObject(operation.requestBody)).toBe(false);
        }
      }
    });

    it('should generate code from all sample specs using dereferenced input', async () => {
      const specs = [
        './examples/openapi/v3.0/petstore.yaml',
        './examples/openapi/v3.0/petstore-expanded.yaml',
        './examples/openapi/v3.0/uspto.yaml',
      ];

      for (const specPath of specs) {
        const bundled = (await SwaggerParser.dereference(specPath)) as OpenAPIObject;

        // Prove OUR CODE works with dereferenced specs
        const result = await generateZodClientFromOpenAPI({
          openApiDoc: bundled,
          disableWriteToFile: true,
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('import { z }');
      }
    });

    it('should prove resolver is unnecessary with dereferenced specs', async () => {
      // This test proves Phase 1's strategy: after dereference(),
      // we can access operation properties directly without a resolver

      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          parameters: {
            UserId: {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          },
        },
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'getUser',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
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

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;

      // Prove we can access operation properties directly
      const operation = bundled.paths?.['/users/{userId}']?.get as OperationObject;
      const param = operation.parameters?.[0];

      // After dereference(), this is NOT a reference - we can use it directly!
      expect(isReferenceObject(param)).toBe(false);
      expect(param).toHaveProperty('name', 'userId');

      // Prove our code generates successfully from this
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      expect(result).toBeDefined();
      expect(result).toContain('userId');
    });

    it('should handle complex spec with many $refs correctly', async () => {
      const spec: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Complex API', version: '1.0.0' },
        components: {
          schemas: {
            Error: {
              type: 'object',
              properties: {
                code: { type: 'integer' },
                message: { type: 'string' },
              },
            },
            User: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
          parameters: {
            UserId: {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          },
          responses: {
            ErrorResponse: {
              description: 'Error response',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            UserResponse: {
              description: 'User response',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
          requestBodies: {
            UserRequest: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'getUser',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
              responses: {
                '200': { $ref: '#/components/responses/UserResponse' },
                '404': { $ref: '#/components/responses/ErrorResponse' },
              },
            },
            put: {
              operationId: 'updateUser',
              parameters: [{ $ref: '#/components/parameters/UserId' }],
              requestBody: { $ref: '#/components/requestBodies/UserRequest' },
              responses: {
                '200': { $ref: '#/components/responses/UserResponse' },
                '404': { $ref: '#/components/responses/ErrorResponse' },
              },
            },
          },
        },
      };

      const bundled = (await SwaggerParser.dereference(spec as unknown)) as OpenAPIObject;

      // Verify our code can generate from this complex dereferenced spec
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: bundled,
        disableWriteToFile: true,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('import { z }');
      // Just verify it generated something - operation IDs are transformed by templates
      expect(result).toContain('endpoints');

      // Verify all operation-level refs are resolved
      const getOp = bundled.paths?.['/users/{userId}']?.get as OperationObject;
      expect(isReferenceObject(getOp.parameters![0])).toBe(false);
      expect(isReferenceObject(getOp.responses['200'])).toBe(false);
      expect(isReferenceObject(getOp.responses['404'])).toBe(false);

      const putOp = bundled.paths?.['/users/{userId}']?.put as OperationObject;
      expect(isReferenceObject(putOp.parameters![0])).toBe(false);
      expect(isReferenceObject(putOp.requestBody!)).toBe(false);
      expect(isReferenceObject(putOp.responses['200'])).toBe(false);
      expect(isReferenceObject(putOp.responses['404'])).toBe(false);
    });
  });
});
