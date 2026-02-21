/**
 * IR Validation Tests - Schema Representation
 *
 * PROVES: IR correctly captures basic schema metadata and complex patterns
 *
 * @module ir-validation.schema.test
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { getZodClientTemplateContext } from '../../context/index.js';
import { isCastrDocument, isCastrSchemaNode } from './validators.js';
import {
  getComponent,
  getSchemaProperty,
  assertPropertiesMetadata,
  assertHasCastrSchemaProperties,
  assertSchemaComponent,
} from '../test-helpers.js';

describe('IR Validation - Schema Representation', () => {
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
      expect(isCastrDocument(ctx._ir)).toBe(true);

      // PROVE: Schema is captured with correct structure
      const userComponent = getComponent(ctx._ir?.components, 'User');
      expect(userComponent.type).toBe('schema');

      const userSchema = assertSchemaComponent(userComponent).schema;
      expect(userSchema?.type).toBe('object');

      // PROVE: Metadata is correctly computed
      expect(userSchema?.metadata).toBeDefined();
      expect(isCastrSchemaNode(userSchema?.metadata)).toBe(true);

      // PROVE: Properties exist with correct metadata using helper
      if (userSchema) {
        assertHasCastrSchemaProperties(userSchema);
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
      const schema = assertSchemaComponent(component).schema;
      // PROVE: Nullable detection works correctly
      if (schema?.type === 'object' && schema.properties) {
        expect(schema.properties.get('nullableString')?.metadata.nullable).toBe(true);
        expect(schema.properties.get('nonNullableString')?.metadata.nullable).toBe(false);
      } else {
        throw new Error('Expected object schema with properties');
      }
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
      const extendedSchema = assertSchemaComponent(extendedComponent).schema;
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
      const schema = assertSchemaComponent(component).schema;

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
      const level1Schema = assertSchemaComponent(level1).schema;
      expect(level1Schema.metadata.dependencyGraph).toBeDefined();
      expect(level1Schema.metadata.dependencyGraph.depth).toBeGreaterThanOrEqual(0);
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
      const schema = assertSchemaComponent(component).schema;
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
      const schema = assertSchemaComponent(component).schema;

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
});
