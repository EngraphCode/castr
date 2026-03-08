/**
 * Unit tests for JSON Schema schema writer.
 *
 * Tests the writeJsonSchema function that converts a CastrSchema (IR) to a
 * pure JSON Schema 2020-12 object. Follows TDD — tests written first.
 *
 * @module writers/json-schema/json-schema-writer.schema.unit.test
 */

import { describe, it, expect } from 'vitest';

import type { CastrSchema, CastrSchemaNode } from '../../ir/index.js';
import { CastrSchemaProperties } from '../../ir/index.js';
import { writeJsonSchema } from './json-schema-writer.schema.js';

/**
 * Creates a minimal valid CastrSchemaNode for testing.
 */
function createMetadata(overrides: Partial<CastrSchemaNode> = {}): CastrSchemaNode {
  return {
    required: false,
    nullable: false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
    ...overrides,
  };
}

/**
 * Creates a minimal CastrSchema for testing.
 */
function createSchema(overrides: Partial<CastrSchema> = {}): CastrSchema {
  return {
    metadata: createMetadata(),
    ...overrides,
  };
}

describe('writeJsonSchema', () => {
  describe('primitive types', () => {
    it('converts string type', () => {
      const schema = createSchema({ type: 'string' });

      const result = writeJsonSchema(schema);

      expect(result).toEqual({ type: 'string' });
    });

    it('converts number type', () => {
      const schema = createSchema({ type: 'number' });

      const result = writeJsonSchema(schema);

      expect(result).toEqual({ type: 'number' });
    });

    it('converts integer type', () => {
      const schema = createSchema({ type: 'integer' });

      const result = writeJsonSchema(schema);

      expect(result).toEqual({ type: 'integer' });
    });

    it('converts boolean type', () => {
      const schema = createSchema({ type: 'boolean' });

      const result = writeJsonSchema(schema);

      expect(result).toEqual({ type: 'boolean' });
    });

    it('converts null type', () => {
      const schema = createSchema({ type: 'null' });

      const result = writeJsonSchema(schema);

      expect(result).toEqual({ type: 'null' });
    });
  });

  describe('nullable handling', () => {
    it('folds nullable into type array', () => {
      const schema = createSchema({
        type: 'string',
        metadata: createMetadata({ nullable: true }),
      });

      const result = writeJsonSchema(schema);

      expect(result.type).toEqual(['string', 'null']);
    });
  });

  describe('$ref passthrough', () => {
    it('returns $ref without other fields', () => {
      const schema = createSchema({
        $ref: '#/$defs/Address',
        type: 'object',
      });

      const result = writeJsonSchema(schema);

      expect(result).toEqual({ $ref: '#/$defs/Address' });
    });
  });

  describe('string constraints', () => {
    it('writes format', () => {
      const schema = createSchema({ type: 'string', format: 'email' });

      const result = writeJsonSchema(schema);

      expect(result.format).toBe('email');
    });

    it('writes minLength and maxLength', () => {
      const schema = createSchema({ type: 'string', minLength: 1, maxLength: 100 });

      const result = writeJsonSchema(schema);

      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(100);
    });

    it('writes pattern', () => {
      const schema = createSchema({ type: 'string', pattern: '^[a-z]+$' });

      const result = writeJsonSchema(schema);

      expect(result.pattern).toBe('^[a-z]+$');
    });
  });

  describe('number constraints', () => {
    it('writes minimum and maximum', () => {
      const schema = createSchema({ type: 'number', minimum: 0, maximum: 100 });

      const result = writeJsonSchema(schema);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(100);
    });

    it('writes exclusiveMinimum and exclusiveMaximum', () => {
      const schema = createSchema({
        type: 'number',
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
      });

      const result = writeJsonSchema(schema);

      expect(result.exclusiveMinimum).toBe(0);
      expect(result.exclusiveMaximum).toBe(100);
    });

    it('writes multipleOf', () => {
      const schema = createSchema({ type: 'number', multipleOf: 5 });

      const result = writeJsonSchema(schema);

      expect(result.multipleOf).toBe(5);
    });
  });

  describe('enum and const', () => {
    it('writes enum values', () => {
      const schema = createSchema({ type: 'string', enum: ['a', 'b', 'c'] });

      const result = writeJsonSchema(schema);

      expect(result.enum).toEqual(['a', 'b', 'c']);
    });

    it('writes const value', () => {
      const schema = createSchema({ type: 'string', const: 'fixed' });

      const result = writeJsonSchema(schema);

      expect(result.const).toBe('fixed');
    });
  });

  describe('object fields', () => {
    it('writes properties with sorted keys', () => {
      const schema = createSchema({
        type: 'object',
        properties: new CastrSchemaProperties({
          zeta: createSchema({ type: 'string' }),
          alpha: createSchema({ type: 'number' }),
        }),
      });

      const result = writeJsonSchema(schema);

      expect(Object.keys(result.properties ?? {})).toEqual(['alpha', 'zeta']);
    });

    it('writes required array', () => {
      const schema = createSchema({
        type: 'object',
        properties: new CastrSchemaProperties({
          id: createSchema({ type: 'string' }),
        }),
        required: ['id'],
      });

      const result = writeJsonSchema(schema);

      expect(result.required).toEqual(['id']);
    });

    it('writes additionalProperties as boolean', () => {
      const schema = createSchema({
        type: 'object',
        additionalProperties: false,
      });

      const result = writeJsonSchema(schema);

      expect(result.additionalProperties).toBe(false);
    });

    it('writes additionalProperties as schema', () => {
      const schema = createSchema({
        type: 'object',
        additionalProperties: createSchema({ type: 'string' }),
      });

      const result = writeJsonSchema(schema);

      expect(result.additionalProperties).toEqual({ type: 'string' });
    });
  });

  describe('array fields', () => {
    it('writes items schema', () => {
      const schema = createSchema({
        type: 'array',
        items: createSchema({ type: 'string' }),
      });

      const result = writeJsonSchema(schema);

      expect(result.items).toEqual({ type: 'string' });
    });

    it('writes prefixItems for tuple arrays', () => {
      const schema = createSchema({
        type: 'array',
        items: [createSchema({ type: 'string' }), createSchema({ type: 'number' })],
      });

      const result = writeJsonSchema(schema);

      expect(result.prefixItems).toEqual([{ type: 'string' }, { type: 'number' }]);
    });

    it('writes minItems, maxItems, uniqueItems', () => {
      const schema = createSchema({
        type: 'array',
        items: createSchema({ type: 'string' }),
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
      });

      const result = writeJsonSchema(schema);

      expect(result.minItems).toBe(1);
      expect(result.maxItems).toBe(10);
      expect(result.uniqueItems).toBe(true);
    });
  });

  describe('composition', () => {
    it('writes allOf', () => {
      const schema = createSchema({
        allOf: [createSchema({ type: 'object' }), createSchema({ type: 'object' })],
      });

      const result = writeJsonSchema(schema);

      expect(result.allOf).toHaveLength(2);
      expect(result.allOf?.[0]).toEqual({ type: 'object' });
    });

    it('writes oneOf', () => {
      const schema = createSchema({
        oneOf: [createSchema({ type: 'string' }), createSchema({ type: 'number' })],
      });

      const result = writeJsonSchema(schema);

      expect(result.oneOf).toHaveLength(2);
    });

    it('writes anyOf', () => {
      const schema = createSchema({
        anyOf: [createSchema({ type: 'string' }), createSchema({ type: 'null' })],
      });

      const result = writeJsonSchema(schema);

      expect(result.anyOf).toHaveLength(2);
    });

    it('writes not', () => {
      const schema = createSchema({
        not: createSchema({ type: 'string' }),
      });

      const result = writeJsonSchema(schema);

      expect(result.not).toEqual({ type: 'string' });
    });
  });

  describe('metadata', () => {
    it('writes title and description', () => {
      const schema = createSchema({
        type: 'string',
        title: 'Email',
        description: 'User email address',
      });

      const result = writeJsonSchema(schema);

      expect(result.title).toBe('Email');
      expect(result.description).toBe('User email address');
    });

    it('writes default value', () => {
      const schema = createSchema({
        type: 'string',
        default: 'unknown',
      });

      const result = writeJsonSchema(schema);

      expect(result.default).toBe('unknown');
    });

    it('writes example and examples', () => {
      const schema = createSchema({
        type: 'string',
        example: 'user@example.com',
        examples: ['alice@test.com', 'bob@test.com'],
      });

      const result = writeJsonSchema(schema);

      expect(result.example).toBe('user@example.com');
      expect(result.examples).toEqual(['alice@test.com', 'bob@test.com']);
    });

    it('writes deprecated, readOnly, writeOnly', () => {
      const schema = createSchema({
        type: 'string',
        deprecated: true,
        readOnly: true,
        writeOnly: false,
      });

      const result = writeJsonSchema(schema);

      expect(result.deprecated).toBe(true);
      expect(result.readOnly).toBe(true);
      expect(result.writeOnly).toBe(false);
    });
  });

  describe('JSON Schema 2020-12 keywords', () => {
    it('writes unevaluatedProperties as boolean', () => {
      const schema = createSchema({
        type: 'object',
        unevaluatedProperties: false,
      });

      const result = writeJsonSchema(schema);

      expect(result.unevaluatedProperties).toBe(false);
    });

    it('writes unevaluatedProperties as schema', () => {
      const schema = createSchema({
        type: 'object',
        unevaluatedProperties: createSchema({ type: 'string' }),
      });

      const result = writeJsonSchema(schema);

      expect(result.unevaluatedProperties).toEqual({ type: 'string' });
    });

    it('writes unevaluatedItems as boolean', () => {
      const schema = createSchema({
        type: 'array',
        unevaluatedItems: false,
      });

      const result = writeJsonSchema(schema);

      expect(result.unevaluatedItems).toBe(false);
    });

    it('writes dependentSchemas', () => {
      const schema = createSchema({
        type: 'object',
        dependentSchemas: {
          creditCard: createSchema({ type: 'object' }),
        },
      });

      const result = writeJsonSchema(schema);

      expect(result.dependentSchemas?.['creditCard']).toEqual({ type: 'object' });
    });

    it('writes dependentRequired', () => {
      const schema = createSchema({
        type: 'object',
        dependentRequired: {
          email: ['emailVerified'],
        },
      });

      const result = writeJsonSchema(schema);

      expect(result.dependentRequired).toEqual({ email: ['emailVerified'] });
    });

    it('writes minContains and maxContains', () => {
      const schema = createSchema({
        type: 'array',
        minContains: 1,
        maxContains: 5,
      });

      const result = writeJsonSchema(schema);

      expect(result.minContains).toBe(1);
      expect(result.maxContains).toBe(5);
    });
  });

  describe('OAS-only fields are NOT emitted', () => {
    it('does not emit xml', () => {
      const schema = createSchema({
        type: 'string',
        xml: { name: 'tag' },
      });

      const result = writeJsonSchema(schema);

      expect(result['xml']).toBeUndefined();
    });

    it('does not emit externalDocs', () => {
      const schema = createSchema({
        type: 'string',
        externalDocs: { url: 'https://example.com' },
      });

      const result = writeJsonSchema(schema);

      expect(result['externalDocs']).toBeUndefined();
    });

    it('does not emit discriminator', () => {
      const schema = createSchema({
        oneOf: [createSchema({ type: 'object' })],
        discriminator: { propertyName: 'type' },
      });

      const result = writeJsonSchema(schema);

      expect(result['discriminator']).toBeUndefined();
    });
  });
});
