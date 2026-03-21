/**
 * Unit tests for JSON Schema core parser.
 *
 * TDD: These tests are written FIRST, before the implementation.
 * Tests the conversion of JSON Schema 2020-12 objects into CastrSchema IR.
 *
 * @module parsers/json-schema/json-schema-parser.core.unit.test
 */

import { describe, it, expect } from 'vitest';

import { parseJsonSchemaObject } from './json-schema-parser.core.js';
import { CastrSchemaProperties, UUID_V7_PATTERN } from '../../ir/index.js';

describe('parseJsonSchemaObject', () => {
  // =========================================================================
  // Primitive types
  // =========================================================================
  describe('primitive types', () => {
    it('parses string type', () => {
      const result = parseJsonSchemaObject({ type: 'string' });

      expect(result.type).toBe('string');
      expect(result.metadata.required).toBe(false);
      expect(result.metadata.nullable).toBe(false);
    });

    it('parses number type', () => {
      const result = parseJsonSchemaObject({ type: 'number' });

      expect(result.type).toBe('number');
    });

    it('parses integer type', () => {
      const result = parseJsonSchemaObject({ type: 'integer' });

      expect(result.type).toBe('integer');
    });

    it('parses boolean type', () => {
      const result = parseJsonSchemaObject({ type: 'boolean' });

      expect(result.type).toBe('boolean');
    });

    it('parses null type', () => {
      const result = parseJsonSchemaObject({ type: 'null' });

      expect(result.type).toBe('null');
    });

    it('parses schema with no type', () => {
      const result = parseJsonSchemaObject({});

      expect(result.type).toBeUndefined();
    });
  });

  // =========================================================================
  // Nullable via type arrays
  // =========================================================================
  describe('nullable via type arrays', () => {
    it('parses type array with null as nullable', () => {
      const result = parseJsonSchemaObject({ type: ['string', 'null'] });

      expect(result.type).toBe('string');
      expect(result.metadata.nullable).toBe(true);
    });

    it('preserves type array without null', () => {
      const result = parseJsonSchemaObject({ type: ['string', 'number'] });

      expect(result.type).toEqual(['string', 'number']);
      expect(result.metadata.nullable).toBe(false);
    });

    it('handles single-element type array', () => {
      const result = parseJsonSchemaObject({ type: ['string'] });

      expect(result.type).toBe('string');
      expect(result.metadata.nullable).toBe(false);
    });

    it('handles type array that is only null', () => {
      const result = parseJsonSchemaObject({ type: ['null'] });

      expect(result.type).toBe('null');
      expect(result.metadata.nullable).toBe(false);
    });
  });

  // =========================================================================
  // $ref passthrough
  // =========================================================================
  describe('$ref passthrough', () => {
    it('preserves $ref as-is', () => {
      const result = parseJsonSchemaObject({ $ref: '#/$defs/Address' });

      expect(result.$ref).toBe('#/$defs/Address');
    });

    it('returns $ref schema with minimal metadata', () => {
      const result = parseJsonSchemaObject({ $ref: '#/$defs/Address' });

      expect(result.metadata).toBeDefined();
      expect(result.metadata.required).toBe(false);
      expect(result.metadata.nullable).toBe(false);
    });

    it('rejects int64 siblings on $ref because JSON Schema 2020-12 has no native int64 type', () => {
      expect(() =>
        parseJsonSchemaObject({ $ref: '#/$defs/Count', type: 'integer', format: 'int64' }),
      ).toThrow(/JSON Schema 2020-12 cannot represent signed 64-bit integer semantics natively/);
    });

    it('rejects bigint siblings on $ref because JSON Schema 2020-12 has no native bigint type', () => {
      expect(() =>
        parseJsonSchemaObject({ $ref: '#/$defs/Count', type: 'integer', format: 'bigint' }),
      ).toThrow(/JSON Schema 2020-12 cannot represent arbitrary-precision bigint natively/);
    });

    it('rejects bigint siblings on $ref when integer is part of a nullable type array', () => {
      expect(() =>
        parseJsonSchemaObject({
          $ref: '#/$defs/Count',
          type: ['integer', 'null'],
          format: 'bigint',
        }),
      ).toThrow(/JSON Schema 2020-12 cannot represent arbitrary-precision bigint natively/);
    });
  });

  // =========================================================================
  // String constraints
  // =========================================================================
  describe('string constraints', () => {
    it('parses format', () => {
      const result = parseJsonSchemaObject({ type: 'string', format: 'email' });

      expect(result.format).toBe('email');
    });

    it('parses minLength and maxLength', () => {
      const result = parseJsonSchemaObject({ type: 'string', minLength: 1, maxLength: 100 });

      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(100);
    });

    it('parses pattern', () => {
      const result = parseJsonSchemaObject({ type: 'string', pattern: '^[a-z]+$' });

      expect(result.pattern).toBe('^[a-z]+$');
    });

    it('infers UUID v7 semantics from canonical pattern', () => {
      const result = parseJsonSchemaObject({ type: 'string', pattern: UUID_V7_PATTERN });

      expect(result.pattern).toBe(UUID_V7_PATTERN);
      expect(result.format).toBe('uuid');
      expect(result.uuidVersion).toBe(7);
    });

    it('parses contentEncoding', () => {
      const result = parseJsonSchemaObject({ type: 'string', contentEncoding: 'base64' });

      expect(result.contentEncoding).toBe('base64');
    });
  });

  // =========================================================================
  // Number constraints
  // =========================================================================
  describe('number constraints', () => {
    it('parses minimum and maximum', () => {
      const result = parseJsonSchemaObject({ type: 'number', minimum: 0, maximum: 100 });

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(100);
    });

    it('parses exclusiveMinimum and exclusiveMaximum', () => {
      const result = parseJsonSchemaObject({
        type: 'number',
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
      });

      expect(result.exclusiveMinimum).toBe(0);
      expect(result.exclusiveMaximum).toBe(100);
    });

    it('parses multipleOf', () => {
      const result = parseJsonSchemaObject({ type: 'number', multipleOf: 5 });

      expect(result.multipleOf).toBe(5);
    });
  });

  describe('unsupported native integer semantics', () => {
    it('rejects int64 because JSON Schema 2020-12 has no native int64 type', () => {
      expect(() => parseJsonSchemaObject({ type: 'integer', format: 'int64' })).toThrow(
        /JSON Schema 2020-12 cannot represent signed 64-bit integer semantics natively/,
      );
    });

    it('rejects bigint because JSON Schema 2020-12 has no native bigint type', () => {
      expect(() => parseJsonSchemaObject({ type: 'integer', format: 'bigint' })).toThrow(
        /JSON Schema 2020-12 cannot represent arbitrary-precision bigint natively/,
      );
    });
  });

  // =========================================================================
  // Enum and const
  // =========================================================================
  describe('enum and const', () => {
    it('parses enum values', () => {
      const result = parseJsonSchemaObject({ type: 'string', enum: ['a', 'b', 'c'] });

      expect(result.enum).toEqual(['a', 'b', 'c']);
    });

    it('parses const value', () => {
      const result = parseJsonSchemaObject({ type: 'string', const: 'fixed' });

      expect(result.const).toBe('fixed');
    });
  });

  // =========================================================================
  // Object properties
  // =========================================================================
  describe('object properties', () => {
    it('parses properties into CastrSchemaProperties', () => {
      const result = parseJsonSchemaObject({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
      });

      expect(result.properties).toBeInstanceOf(CastrSchemaProperties);
      expect(result.properties?.get('name')?.type).toBe('string');
      expect(result.properties?.get('age')?.type).toBe('integer');
    });

    it('marks required properties', () => {
      const result = parseJsonSchemaObject({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
        required: ['name'],
      });

      expect(result.required).toEqual(['name']);
      expect(result.properties?.get('name')?.metadata.required).toBe(true);
      expect(result.properties?.get('age')?.metadata.required).toBe(false);
    });
  });

  // =========================================================================
  // Array items
  // =========================================================================
  describe('array items', () => {
    it('parses single-schema items', () => {
      const result = parseJsonSchemaObject({
        type: 'array',
        items: { type: 'string' },
      });

      expect(result.items).toBeDefined();
      if (!Array.isArray(result.items) && result.items) {
        expect(result.items.type).toBe('string');
      }
    });

    it('parses prefixItems as tuple', () => {
      const result = parseJsonSchemaObject({
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
      });

      expect(result.prefixItems).toHaveLength(2);
      expect(result.prefixItems?.[0]?.type).toBe('string');
      expect(result.prefixItems?.[1]?.type).toBe('number');
    });

    it('parses minItems, maxItems, uniqueItems', () => {
      const result = parseJsonSchemaObject({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
      });

      expect(result.minItems).toBe(1);
      expect(result.maxItems).toBe(10);
      expect(result.uniqueItems).toBe(true);
    });
  });

  // =========================================================================
  // Composition
  // =========================================================================
  describe('composition', () => {
    it('parses allOf', () => {
      const result = parseJsonSchemaObject({
        allOf: [{ type: 'object' }, { type: 'object' }],
      });

      expect(result.allOf).toHaveLength(2);
    });

    it('parses oneOf', () => {
      const result = parseJsonSchemaObject({
        oneOf: [{ type: 'string' }, { type: 'number' }],
      });

      expect(result.oneOf).toHaveLength(2);
    });

    it('parses anyOf', () => {
      const result = parseJsonSchemaObject({
        anyOf: [{ type: 'string' }, { type: 'null' }],
      });

      expect(result.anyOf).toHaveLength(2);
    });

    it('parses nullable reference compositions without collapsing the ref', () => {
      const result = parseJsonSchemaObject({
        anyOf: [{ $ref: '#/$defs/LinkedListNode' }, { type: 'null' }],
      });

      expect(result.anyOf).toHaveLength(2);
      expect(result.anyOf?.[0]?.$ref).toBe('#/$defs/LinkedListNode');
      expect(result.anyOf?.[1]?.type).toBe('null');
    });

    it('parses not', () => {
      const result = parseJsonSchemaObject({
        not: { type: 'string' },
      });

      expect(result.not).toBeDefined();
      expect(result.not?.type).toBe('string');
    });
  });

  // =========================================================================
  // Metadata
  // =========================================================================
  describe('metadata', () => {
    it('parses title and description', () => {
      const result = parseJsonSchemaObject({
        type: 'string',
        title: 'Email',
        description: 'User email address',
      });

      expect(result.title).toBe('Email');
      expect(result.description).toBe('User email address');
    });

    it('parses default value', () => {
      const result = parseJsonSchemaObject({
        type: 'string',
        default: 'unknown',
      });

      expect(result.default).toBe('unknown');
    });

    it('parses example and examples', () => {
      const result = parseJsonSchemaObject({
        type: 'string',
        example: 'user@example.com',
        examples: ['alice@test.com', 'bob@test.com'],
      });

      expect(result.example).toBe('user@example.com');
      expect(result.examples).toEqual(['alice@test.com', 'bob@test.com']);
    });

    it('parses deprecated, readOnly, writeOnly', () => {
      const result = parseJsonSchemaObject({
        type: 'string',
        deprecated: true,
        readOnly: true,
        writeOnly: false,
      });

      expect(result.deprecated).toBe(true);
      expect(result.readOnly).toBe(true);
      expect(result.writeOnly).toBe(false);
    });
  });

  // =========================================================================
  // JSON Schema 2020-12 keywords
  // =========================================================================
  describe('2020-12 keywords', () => {
    it('parses unevaluatedProperties as boolean', () => {
      const result = parseJsonSchemaObject({
        type: 'object',
        unevaluatedProperties: false,
      });

      expect(result.unevaluatedProperties).toBe(false);
    });

    it('parses unevaluatedProperties as schema', () => {
      const result = parseJsonSchemaObject({
        type: 'object',
        unevaluatedProperties: { type: 'string' },
      });

      expect(typeof result.unevaluatedProperties).toBe('object');
      if (typeof result.unevaluatedProperties === 'object') {
        expect(result.unevaluatedProperties.type).toBe('string');
      }
    });

    it('parses unevaluatedItems as boolean', () => {
      const result = parseJsonSchemaObject({
        type: 'array',
        unevaluatedItems: false,
      });

      expect(result.unevaluatedItems).toBe(false);
    });

    it('parses unevaluatedItems as schema', () => {
      const result = parseJsonSchemaObject({
        type: 'array',
        unevaluatedItems: { type: 'number' },
      });

      expect(typeof result.unevaluatedItems).toBe('object');
      if (typeof result.unevaluatedItems === 'object') {
        expect(result.unevaluatedItems.type).toBe('number');
      }
    });

    it('parses dependentSchemas', () => {
      const result = parseJsonSchemaObject({
        type: 'object',
        dependentSchemas: {
          creditCard: { type: 'object' },
        },
      });

      expect(result.dependentSchemas?.['creditCard']?.type).toBe('object');
    });

    it('parses dependentRequired', () => {
      const result = parseJsonSchemaObject({
        type: 'object',
        dependentRequired: {
          email: ['emailVerified'],
        },
      });

      expect(result.dependentRequired).toEqual({ email: ['emailVerified'] });
    });

    it('parses minContains and maxContains', () => {
      const result = parseJsonSchemaObject({
        type: 'array',
        minContains: 1,
        maxContains: 5,
      });

      expect(result.minContains).toBe(1);
      expect(result.maxContains).toBe(5);
    });
  });

  // =========================================================================
  // CastrSchemaNode metadata
  // =========================================================================
  describe('CastrSchemaNode metadata defaults', () => {
    it('provides default metadata with empty dependency graph', () => {
      const result = parseJsonSchemaObject({ type: 'string' });

      expect(result.metadata.dependencyGraph).toEqual({
        references: [],
        referencedBy: [],
        depth: 0,
      });
    });

    it('provides empty zodChain', () => {
      const result = parseJsonSchemaObject({ type: 'string' });

      expect(result.metadata.zodChain).toEqual({
        presence: '',
        validations: [],
        defaults: [],
      });
    });

    it('provides empty circularReferences', () => {
      const result = parseJsonSchemaObject({ type: 'string' });

      expect(result.metadata.circularReferences).toEqual([]);
    });
  });
});
