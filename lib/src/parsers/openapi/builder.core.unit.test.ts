import { describe, test, expect } from 'vitest';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { buildPropertySchema, buildCompositionMember, buildCastrSchema } from './builder.core.js';
import type { IRBuildContext } from './builder.types.js';

/**
 * Extended SchemaObject for test fixtures.
 * Includes JSON Schema 2020-12 keywords not yet in openapi3-ts types.
 * This is a TEST-ONLY type extension for constructing test fixtures.
 */
type TestSchemaObject = SchemaObject & {
  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, SchemaObject>;
  minContains?: number;
  maxContains?: number;
  contains?: SchemaObject;
  unevaluatedProperties?: boolean | SchemaObject;
  unevaluatedItems?: boolean | SchemaObject;
  prefixItems?: SchemaObject[];
};

describe('buildPropertySchema', () => {
  test('buildPropertySchema creates property context with correct optionality', () => {
    const schema: SchemaObject = { type: 'string' };
    const parentRequired = ['id', 'name']; // 'email' is NOT in this list
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const context: IRBuildContext = {
      doc,
      path: [],
      required: false,
    };

    const result = buildPropertySchema('email', schema, parentRequired, context);

    expect(result.contextType).toBe('property');
    expect(result.name).toBe('email');
    expect(result.optional).toBe(true); // Not in required array
  });

  test('buildPropertySchema creates required property context', () => {
    const schema: SchemaObject = { type: 'string' };
    const parentRequired = ['id', 'email']; // 'email' IS in this list
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const context: IRBuildContext = {
      doc,
      path: [],
      required: false,
    };

    const result = buildPropertySchema('email', schema, parentRequired, context);

    expect(result.contextType).toBe('property');
    expect(result.name).toBe('email');
    expect(result.optional).toBe(false); // In required array
  });
});

describe('buildCompositionMember', () => {
  test('buildCompositionMember creates context without .optional()', () => {
    const memberSchema: SchemaObject = { type: 'string' };
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const context: IRBuildContext = {
      doc,
      path: [],
      required: false,
    };

    const result = buildCompositionMember(memberSchema, 'oneOf', 0, context);

    expect(result.contextType).toBe('compositionMember');
    expect(result.compositionType).toBe('oneOf');
    expect(result.schema.metadata.zodChain.presence).toBe(''); // NEVER .optional()
  });
});

/**
 * Tests for OpenAPI Extension Field Extraction (2.6.2)
 *
 * TDD RED phase: These tests specify the expected behavior for extracting
 * 9 new schema fields from OpenAPI 3.1 input.
 */
describe('buildCastrSchema - OpenAPI extension fields', () => {
  const createContext = (): IRBuildContext => ({
    doc: {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    },
    path: [],
    required: true,
  });

  describe('xml extraction', () => {
    test('extracts xml metadata from schema', () => {
      const schema: SchemaObject = {
        type: 'object',
        xml: {
          name: 'Pet',
          namespace: 'http://example.com/schema/pet',
          prefix: 'pet',
        },
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.xml).toBeDefined();
      expect(result.xml?.name).toBe('Pet');
      expect(result.xml?.namespace).toBe('http://example.com/schema/pet');
      expect(result.xml?.prefix).toBe('pet');
    });
  });

  describe('externalDocs extraction', () => {
    test('extracts externalDocs from schema', () => {
      const schema: SchemaObject = {
        type: 'object',
        externalDocs: {
          url: 'https://docs.example.com/schema',
          description: 'External documentation for this schema',
        },
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.externalDocs).toBeDefined();
      expect(result.externalDocs?.url).toBe('https://docs.example.com/schema');
      expect(result.externalDocs?.description).toBe('External documentation for this schema');
    });
  });

  describe('prefixItems extraction', () => {
    test('extracts prefixItems tuple from schema', () => {
      const schema: SchemaObject = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.prefixItems).toBeDefined();
      expect(result.prefixItems).toHaveLength(2);
      expect(result.prefixItems?.[0]?.type).toBe('string');
      expect(result.prefixItems?.[1]?.type).toBe('number');
    });

    test('recursively builds nested schemas in prefixItems', () => {
      const schema: SchemaObject = {
        type: 'array',
        prefixItems: [
          {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
        ],
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.prefixItems?.[0]?.type).toBe('object');
      expect(result.prefixItems?.[0]?.properties).toBeDefined();
      expect(result.prefixItems?.[0]?.metadata).toBeDefined();
    });
  });

  describe('unevaluatedProperties extraction', () => {
    test('extracts unevaluatedProperties boolean false', () => {
      const schema: SchemaObject = {
        type: 'object',
        unevaluatedProperties: false,
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.unevaluatedProperties).toBe(false);
    });

    test('extracts unevaluatedProperties boolean true', () => {
      const schema: SchemaObject = {
        type: 'object',
        unevaluatedProperties: true,
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.unevaluatedProperties).toBe(true);
    });

    test('extracts unevaluatedProperties schema recursively', () => {
      const schema: SchemaObject = {
        type: 'object',
        unevaluatedProperties: { type: 'string' },
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.unevaluatedProperties).not.toBe(true);
      expect(result.unevaluatedProperties).not.toBe(false);
      expect(typeof result.unevaluatedProperties).toBe('object');
      if (typeof result.unevaluatedProperties === 'object') {
        expect(result.unevaluatedProperties.type).toBe('string');
        expect(result.unevaluatedProperties.metadata).toBeDefined();
      }
    });
  });

  describe('unevaluatedItems extraction', () => {
    test('extracts unevaluatedItems boolean false', () => {
      const schema: SchemaObject = {
        type: 'array',
        unevaluatedItems: false,
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.unevaluatedItems).toBe(false);
    });

    test('extracts unevaluatedItems schema recursively', () => {
      const schema: SchemaObject = {
        type: 'array',
        unevaluatedItems: { type: 'number' },
      };

      const result = buildCastrSchema(schema, createContext());

      expect(typeof result.unevaluatedItems).toBe('object');
      if (typeof result.unevaluatedItems === 'object') {
        expect(result.unevaluatedItems.type).toBe('number');
        expect(result.unevaluatedItems.metadata).toBeDefined();
      }
    });
  });

  describe('dependentSchemas extraction', () => {
    test('extracts dependentSchemas with recursive schema building', () => {
      const schema: SchemaObject = {
        type: 'object',
        dependentSchemas: {
          creditCard: {
            type: 'object',
            properties: {
              billingAddress: { type: 'string' },
            },
            required: ['billingAddress'],
          },
        },
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.dependentSchemas).toBeDefined();
      expect(result.dependentSchemas?.['creditCard']).toBeDefined();
      expect(result.dependentSchemas?.['creditCard']?.type).toBe('object');
      expect(result.dependentSchemas?.['creditCard']?.metadata).toBeDefined();
    });
  });

  describe('dependentRequired extraction', () => {
    test('extracts dependentRequired object', () => {
      const schema: TestSchemaObject = {
        type: 'object',
        dependentRequired: {
          creditCard: ['billingAddress', 'securityCode'],
          name: ['firstName', 'lastName'],
        },
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.dependentRequired).toBeDefined();
      expect(result.dependentRequired?.['creditCard']).toEqual(['billingAddress', 'securityCode']);
      expect(result.dependentRequired?.['name']).toEqual(['firstName', 'lastName']);
    });
  });

  describe('minContains and maxContains extraction', () => {
    test('extracts minContains from schema', () => {
      const schema: TestSchemaObject = {
        type: 'array',
        contains: { type: 'number' },
        minContains: 1,
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.minContains).toBe(1);
    });

    test('extracts maxContains from schema', () => {
      const schema: TestSchemaObject = {
        type: 'array',
        contains: { type: 'number' },
        maxContains: 5,
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.maxContains).toBe(5);
    });

    test('extracts both minContains and maxContains', () => {
      const schema: TestSchemaObject = {
        type: 'array',
        contains: { type: 'number' },
        minContains: 2,
        maxContains: 10,
      };

      const result = buildCastrSchema(schema, createContext());

      expect(result.minContains).toBe(2);
      expect(result.maxContains).toBe(10);
    });
  });
});
