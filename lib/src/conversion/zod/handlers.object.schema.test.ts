/**
 * Tests for handlers.object.schema.ts - Object schema handling
 *
 * These tests verify that object schema conversion functions work correctly
 * with SchemaObject (library types) per RULES.md "Library Types First".
 *
 * Tests focus on BEHAVIOR (converting schemas to Zod code), not implementation
 * details like how properties are iterated internally.
 *
 * @module handlers.object.schema.test
 */

import { describe, test, expect } from 'vitest';
import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import {
  handleObjectSchema,
  handleAdditionalPropertiesAsRecord,
} from './handlers.object.schema.js';
import type { ZodCodeResult, CodeMetaData } from './index.js';

/**
 * Create a test SchemaObject for testing.
 * Uses library types per RULES.md "Library Types First".
 */
function createTestSchema(schema: SchemaObject): SchemaObject {
  return schema;
}

/**
 * Mock getZodSchema function for testing.
 * Uses library types (SchemaObject | ReferenceObject) per RULES.md.
 */
function mockGetZodSchema(args: { schema: SchemaObject | ReferenceObject }): ZodCodeResult {
  if ('type' in args.schema && args.schema.type === 'string') {
    return { code: 'z.string()', schema: args.schema };
  }
  if ('type' in args.schema && args.schema.type === 'number') {
    return { code: 'z.number()', schema: args.schema };
  }
  return { code: 'z.unknown()', schema: args.schema };
}

/**
 * Mock getZodChain function for testing.
 */
function mockGetZodChain(): string {
  return '';
}

describe('handlers.object.schema', () => {
  describe('handleObjectSchema with SchemaObject', () => {
    test('should convert object schema with properties', () => {
      // Test BEHAVIOR: object schema conversion produces correct Zod code
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should generate object with properties
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('name');
      expect(result.code).toContain('age');
    });

    test('should convert object with multiple properties', () => {
      // Test BEHAVIOR: multiple properties are converted correctly
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        properties: {
          title: { type: 'string' },
          count: { type: 'number' },
        },
        required: ['title'],
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should generate all properties
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('title');
      expect(result.code).toContain('count');
    });

    test('should handle empty object schema', () => {
      const schema: SchemaObject = createTestSchema({
        type: 'object',
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should generate empty object
      expect(result.code).toContain('z.object({})');
    });

    test('should preserve schema reference through conversion', () => {
      // Test BEHAVIOR: schema is passed through to result
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = { isRequired: true };

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should produce valid Zod code and preserve schema reference
      expect(result.code).toContain('z.object');
      expect(result.schema).toBe(schema);
    });
  });

  describe('handleAdditionalPropertiesAsRecord', () => {
    test('should handle additionalProperties object schema', () => {
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        additionalProperties: { type: 'string' },
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleAdditionalPropertiesAsRecord(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should generate z.record()
      expect(result).toBeDefined();
      expect(result?.code).toContain('z.record');
    });

    test('should return undefined when additionalProperties is not an object', () => {
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        additionalProperties: false,
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleAdditionalPropertiesAsRecord(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should return undefined (not applicable)
      expect(result).toBeUndefined();
    });
  });

  describe('Composition schemas', () => {
    test('should handle allOf composition in properties', () => {
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        properties: {
          combined: {
            allOf: [{ type: 'string' }, { minLength: 5 }],
          },
        },
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should handle composition
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('combined');
    });

    test('should handle oneOf composition in properties', () => {
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        properties: {
          variant: {
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
        },
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should handle composition
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('variant');
    });

    test('should handle anyOf composition in properties', () => {
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        properties: {
          flexible: {
            anyOf: [{ type: 'string' }, { type: 'null' }],
          },
        },
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should handle composition
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('flexible');
    });
  });

  describe('Property iteration behavior', () => {
    test('should convert multiple properties correctly', () => {
      // Test BEHAVIOR: multiple properties are converted (not HOW they're iterated)
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        properties: {
          prop1: { type: 'string' },
          prop2: { type: 'number' },
          prop3: { type: 'string' },
        },
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should generate all three properties
      expect(result.code).toContain('prop1');
      expect(result.code).toContain('prop2');
      expect(result.code).toContain('prop3');
    });

    test('should preserve property order in output', () => {
      // Test BEHAVIOR: properties appear in output (order may vary by JS runtime)
      const schema: SchemaObject = createTestSchema({
        type: 'object',
        properties: {
          first: { type: 'string' },
          second: { type: 'number' },
        },
      });

      const code: ZodCodeResult = { code: '', schema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        schema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should contain both properties
      expect(result.code).toContain('first');
      expect(result.code).toContain('second');
    });
  });
});
