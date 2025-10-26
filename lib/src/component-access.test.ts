import { describe, it, expect } from 'vitest';
import type { OpenAPIObject, SchemaObject, ReferenceObject } from 'openapi3-ts/oas30';
import {
  getSchemaFromComponents,
  resolveSchemaRef,
  assertNotReference,
} from './component-access.js';

/**
 * Test suite for component-access.ts
 *
 * These functions replace makeSchemaResolver with honest, type-safe component access.
 * Design principle: After SwaggerParser.dereference(), operation-level properties
 * should NEVER be ReferenceObjects. Only component definitions can have refs.
 *
 * @see .agent/plans/01-CURRENT-IMPLEMENTATION.md Task 1.1
 */
describe('component-access', () => {
  describe('getSchemaFromComponents', () => {
    it('should return schema when it exists in components.schemas', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const result = getSchemaFromComponents(doc, 'User');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('type', 'object');
      expect(result).toHaveProperty('properties');
    });

    it('should return ReferenceObject when schema contains a $ref', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            UserRef: {
              $ref: '#/components/schemas/User',
            },
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const result = getSchemaFromComponents(doc, 'UserRef');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('$ref', '#/components/schemas/User');
    });

    it('should throw error when schema does not exist', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {},
        },
      };

      expect(() => getSchemaFromComponents(doc, 'NonExistent')).toThrow(
        "Schema 'NonExistent' not found in components.schemas",
      );
    });

    it('should throw error when components is undefined', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };

      expect(() => getSchemaFromComponents(doc, 'User')).toThrow(
        "Schema 'User' not found in components.schemas",
      );
    });

    it('should throw error when components.schemas is undefined', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {},
      };

      expect(() => getSchemaFromComponents(doc, 'User')).toThrow(
        "Schema 'User' not found in components.schemas",
      );
    });
  });

  describe('resolveSchemaRef', () => {
    it('should return schema unchanged when not a ReferenceObject', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };

      const schema: SchemaObject = {
        type: 'string',
      };

      const result = resolveSchemaRef(doc, schema);

      expect(result).toBe(schema);
      expect(result).toHaveProperty('type', 'string');
    });

    it('should resolve valid schema $ref', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const ref: ReferenceObject = {
        $ref: '#/components/schemas/User',
      };

      const result = resolveSchemaRef(doc, ref);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('type', 'object');
      expect(result).toHaveProperty('properties');
    });

    it('should throw error for invalid $ref format', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };

      const ref: ReferenceObject = {
        $ref: 'invalid-ref-format',
      };

      expect(() => resolveSchemaRef(doc, ref)).toThrow('Invalid schema $ref: invalid-ref-format');
    });

    it('should throw error for $ref to non-schema component', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };

      const ref: ReferenceObject = {
        $ref: '#/components/parameters/UserId',
      };

      expect(() => resolveSchemaRef(doc, ref)).toThrow(
        'Invalid schema $ref: #/components/parameters/UserId',
      );
    });

    it('should throw error for nested $ref (not fully dereferenced)', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            UserRef: {
              $ref: '#/components/schemas/User',
            },
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const ref: ReferenceObject = {
        $ref: '#/components/schemas/UserRef',
      };

      expect(() => resolveSchemaRef(doc, ref)).toThrow(
        'Nested $ref in schema: #/components/schemas/UserRef -> #/components/schemas/User',
      );
      expect(() => resolveSchemaRef(doc, ref)).toThrow(
        'Use SwaggerParser.dereference() to fully dereference the spec',
      );
    });

    it('should handle allOf with $refs', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            Base: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
            Extended: {
              allOf: [{ $ref: '#/components/schemas/Base' }],
            },
          },
        },
      };

      const ref: ReferenceObject = {
        $ref: '#/components/schemas/Extended',
      };

      const result = resolveSchemaRef(doc, ref);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('allOf');
    });
  });

  describe('assertNotReference', () => {
    it('should pass for non-ReferenceObject', () => {
      const value = {
        name: 'userId',
        in: 'path' as const,
        required: true,
        schema: { type: 'string' as const },
      };

      // Should not throw
      expect(() => assertNotReference(value, 'operation.parameters[0]')).not.toThrow();
    });

    it('should pass for plain object without $ref', () => {
      const value = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      // Should not throw
      expect(() => assertNotReference(value, 'schema')).not.toThrow();
    });

    it('should throw for ReferenceObject', () => {
      const value = {
        $ref: '#/components/parameters/UserId',
      };

      expect(() => assertNotReference(value, 'operation.parameters[0]')).toThrow(
        'Unexpected $ref in operation.parameters[0]: #/components/parameters/UserId',
      );
      expect(() => assertNotReference(value, 'operation.parameters[0]')).toThrow(
        'Ensure you called SwaggerParser.dereference() before code generation',
      );
    });

    it('should throw for requestBody ReferenceObject', () => {
      const value = {
        $ref: '#/components/requestBodies/UserBody',
      };

      expect(() => assertNotReference(value, 'operation.requestBody')).toThrow(
        'Unexpected $ref in operation.requestBody: #/components/requestBodies/UserBody',
      );
    });

    it('should throw for response ReferenceObject', () => {
      const value = {
        $ref: '#/components/responses/ErrorResponse',
      };

      expect(() => assertNotReference(value, 'operation.responses["404"]')).toThrow(
        'Unexpected $ref in operation.responses["404"]: #/components/responses/ErrorResponse',
      );
    });

    it('should provide helpful error message about dereference()', () => {
      const value = {
        $ref: '#/components/schemas/User',
      };

      expect(() => assertNotReference(value, 'test context')).toThrow(
        'SwaggerParser.dereference()',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle real-world schema with nested properties', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            Address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
              },
            },
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { $ref: '#/components/schemas/Address' },
              },
            },
          },
        },
      };

      // Get User schema (may have $ref to Address)
      const userSchema = getSchemaFromComponents(doc, 'User');
      expect(userSchema).toBeDefined();

      // Resolve User schema if it's a ref (it's not in this case)
      const resolvedUser = resolveSchemaRef(doc, userSchema);
      expect(resolvedUser).toHaveProperty('properties');
    });

    it('should handle schema with dependencies for topological sorting', () => {
      const doc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            A: {
              type: 'object',
              properties: {
                b: { $ref: '#/components/schemas/B' },
              },
            },
            B: {
              type: 'object',
              properties: {
                c: { $ref: '#/components/schemas/C' },
              },
            },
            C: {
              type: 'object',
              properties: {
                value: { type: 'string' },
              },
            },
          },
        },
      };

      // We can access all schemas for dependency tracking
      const schemaA = getSchemaFromComponents(doc, 'A');
      const schemaB = getSchemaFromComponents(doc, 'B');
      const schemaC = getSchemaFromComponents(doc, 'C');

      expect(schemaA).toBeDefined();
      expect(schemaB).toBeDefined();
      expect(schemaC).toBeDefined();

      // Resolve them (they're not refs themselves)
      const resolvedA = resolveSchemaRef(doc, schemaA);
      const resolvedB = resolveSchemaRef(doc, schemaB);
      const resolvedC = resolveSchemaRef(doc, schemaC);

      expect(resolvedA).toHaveProperty('properties');
      expect(resolvedB).toHaveProperty('properties');
      expect(resolvedC).toHaveProperty('properties');
    });
  });
});
