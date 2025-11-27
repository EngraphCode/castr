/**
 * Tests for handlers.object.helpers.ts - Pure helper functions for object schema handling
 *
 * These tests verify pure functions extracted from handlers.object.properties.ts
 * and handlers.object.schema.ts to eliminate code duplication.
 *
 * @module handlers.object.helpers.test
 */

import { describe, test, expect } from 'vitest';
import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import type { CodeMetaData } from './index.js';
import {
  determinePropertyRequired,
  buildPropertyMetadata,
  resolveSchemaForChain,
} from './handlers.object.helpers.js';

describe('handlers.object.helpers', () => {
  describe('determinePropertyRequired', () => {
    test('should return true when schema is partial', () => {
      const schema: SchemaObject = { type: 'object' };
      const result = determinePropertyRequired('name', schema, true, false, undefined);
      expect(result).toBe(true);
    });

    test('should return true when property is in required array', () => {
      const schema: SchemaObject = {
        type: 'object',
        required: ['name', 'age'],
      };
      const result = determinePropertyRequired('name', schema, false, true, undefined);
      expect(result).toBe(true);
    });

    test('should return false when property is not in required array', () => {
      const schema: SchemaObject = {
        type: 'object',
        required: ['name'],
      };
      const result = determinePropertyRequired('age', schema, false, true, undefined);
      expect(result).toBe(false);
    });

    test('should return withImplicitRequiredProps option value when no required array', () => {
      const schema: SchemaObject = { type: 'object' };
      const result = determinePropertyRequired('name', schema, false, false, {
        withImplicitRequiredProps: true,
      });
      expect(result).toBe(true);
    });

    test('should return undefined when withImplicitRequiredProps is false', () => {
      const schema: SchemaObject = { type: 'object' };
      const result = determinePropertyRequired('name', schema, false, false, {
        withImplicitRequiredProps: false,
      });
      expect(result).toBe(false);
    });
  });

  describe('buildPropertyMetadata', () => {
    test('should preserve existing metadata fields', () => {
      const meta: CodeMetaData = {
        parent: { code: 'test', schema: { type: 'string' } },
      };
      const result = buildPropertyMetadata(meta, undefined);

      expect(result.parent).toBe(meta.parent);
    });

    test('should add isRequired when propIsRequired is true', () => {
      const meta: CodeMetaData = {};
      const result = buildPropertyMetadata(meta, true);

      expect(result.isRequired).toBe(true);
    });

    test('should add isRequired when propIsRequired is false', () => {
      const meta: CodeMetaData = {};
      const result = buildPropertyMetadata(meta, false);

      expect(result.isRequired).toBe(false);
    });

    test('should not add isRequired when propIsRequired is undefined', () => {
      const meta: CodeMetaData = {};
      const result = buildPropertyMetadata(meta, undefined);

      expect(result).not.toHaveProperty('isRequired');
    });

    test('should create new object (not mutate input)', () => {
      const meta: CodeMetaData = { parent: { code: 'test', schema: { type: 'string' } } };
      const result = buildPropertyMetadata(meta, true);

      expect(result).not.toBe(meta);
      expect(result.isRequired).toBe(true);
      expect(meta).not.toHaveProperty('isRequired');
    });
  });

  describe('resolveSchemaForChain', () => {
    test('should return schema as-is when not a reference', () => {
      const schema: SchemaObject = { type: 'string', minLength: 5 };
      const result = resolveSchemaForChain(schema, undefined);

      expect(result).toBe(schema);
    });

    test('should return schema as-is when reference but no context', () => {
      const schema: ReferenceObject = { $ref: '#/components/schemas/User' };
      const result = resolveSchemaForChain(schema, undefined);

      expect(result).toBe(schema);
    });

    test('should resolve reference when context provided', () => {
      const schema: ReferenceObject = { $ref: '#/components/schemas/User' };
      const ctx = {
        doc: {
          openapi: '3.1.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: {},
          components: {
            schemas: {
              User: { type: 'object' as const, properties: { name: { type: 'string' as const } } },
            },
          },
        },
        zodSchemaByName: {},
      };

      const result = resolveSchemaForChain(schema, ctx);

      // Should return the resolved User schema
      expect(result).toHaveProperty('type', 'object');
      expect(result).toHaveProperty('properties');
    });
  });
});
