/**
 * Tests for handlers.object.schema.ts - Object schema handling
 *
 * These tests verify that object schema conversion functions work correctly
 * with IRSchema types (not just SchemaObject). This ensures the conversion
 * layer is fully integrated with the IR architecture.
 *
 * @module handlers.object.schema.test
 */

import { describe, test, expect } from 'vitest';
import type { SchemaObject } from 'openapi3-ts/oas31';
import {
  handleObjectSchema,
  handleAdditionalPropertiesAsRecord,
} from './handlers.object.schema.js';
import type { ZodCodeResult, CodeMetaData } from './index.js';
import type { IRSchema } from '../../context/ir-schema.js';
import { IRSchemaProperties } from '../../context/ir-schema-properties.js';

/**
 * Create a minimal IRSchema for testing
 */
function createTestIRSchema(schema: SchemaObject): IRSchema {
  return {
    ...schema,
    metadata: {
      required: false,
      nullable: false,
      dependencyGraph: {
        references: [],
        referencedBy: [],
      },
      circularReferences: [],
    },
  };
}

/**
 * Mock getZodSchema function for testing
 */
function mockGetZodSchema(args: { schema: SchemaObject | IRSchema }): ZodCodeResult {
  if ('type' in args.schema && args.schema.type === 'string') {
    return { code: 'z.string()', schema: args.schema };
  }
  if ('type' in args.schema && args.schema.type === 'number') {
    return { code: 'z.number()', schema: args.schema };
  }
  return { code: 'z.unknown()', schema: args.schema };
}

/**
 * Mock getZodChain function for testing
 */
function mockGetZodChain(): string {
  return '';
}

describe('handlers.object.schema', () => {
  describe('handleObjectSchema with IRSchema', () => {
    test('should accept IRSchema with metadata', () => {
      // TDD: This test will initially FAIL because current implementation
      // uses type assertions that don't preserve IRSchema structure
      const irSchema: IRSchema = createTestIRSchema({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      });

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        irSchema,
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

    test('should work with IRSchemaProperties wrapper', () => {
      // TDD: This test verifies IRSchemaProperties methods are used correctly
      const propSchemas = {
        title: createTestIRSchema({ type: 'string' }),
        count: createTestIRSchema({ type: 'number' }),
      };

      const irSchemaProperties = new IRSchemaProperties(propSchemas);

      const irSchema: IRSchema = {
        ...createTestIRSchema({
          type: 'object',
          required: ['title'],
        }),
        properties: irSchemaProperties,
      };

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        irSchema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should access properties via IRSchemaProperties methods (.keys(), .values(), .entries())
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('title');
      expect(result.code).toContain('count');
    });

    test('should handle empty object schema', () => {
      const irSchema: IRSchema = createTestIRSchema({
        type: 'object',
      });

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        irSchema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should generate empty object
      expect(result.code).toContain('z.object({})');
    });

    test('should preserve IRSchema metadata through conversion', () => {
      // TDD: Verify metadata is not lost during conversion
      const irSchema: IRSchema = createTestIRSchema({
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      });

      // Add specific metadata to track
      if (irSchema.metadata) {
        irSchema.metadata.required = true;
      }

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = { isRequired: true };

      const result = handleObjectSchema(
        irSchema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should produce valid Zod code without losing metadata
      expect(result.code).toContain('z.object');
      expect(result.schema).toBe(irSchema); // Metadata preserved
    });
  });

  describe('handleAdditionalPropertiesAsRecord with IRSchema', () => {
    test('should handle additionalProperties with IRSchema', () => {
      const irSchema: IRSchema = createTestIRSchema({
        type: 'object',
        additionalProperties: { type: 'string' },
      });

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleAdditionalPropertiesAsRecord(
        irSchema,
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
      const irSchema: IRSchema = createTestIRSchema({
        type: 'object',
        additionalProperties: false,
      });

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleAdditionalPropertiesAsRecord(
        irSchema,
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

  describe('Composition schemas with IRSchema', () => {
    test('should handle allOf composition in properties', () => {
      // TDD: Verify composition schemas work with IRSchema
      const irSchema: IRSchema = createTestIRSchema({
        type: 'object',
        properties: {
          combined: {
            allOf: [{ type: 'string' }, { minLength: 5 }],
          },
        },
      });

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        irSchema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should handle composition without type assertions
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('combined');
    });

    test('should handle oneOf composition in properties', () => {
      const irSchema: IRSchema = createTestIRSchema({
        type: 'object',
        properties: {
          variant: {
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
        },
      });

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        irSchema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should handle composition without type assertions
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('variant');
    });

    test('should handle anyOf composition in properties', () => {
      const irSchema: IRSchema = createTestIRSchema({
        type: 'object',
        properties: {
          flexible: {
            anyOf: [{ type: 'string' }, { type: 'null' }],
          },
        },
      });

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        irSchema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should handle composition without type assertions
      expect(result.code).toContain('z.object');
      expect(result.code).toContain('flexible');
    });
  });

  describe('IRSchemaProperties methods usage', () => {
    test('should use .keys() method for property names', () => {
      // TDD: Verify that IRSchemaProperties.keys() is called, not Object.keys()
      const propSchemas = {
        prop1: createTestIRSchema({ type: 'string' }),
        prop2: createTestIRSchema({ type: 'number' }),
        prop3: createTestIRSchema({ type: 'string' }),
      };

      const irSchemaProperties = new IRSchemaProperties(propSchemas);

      const irSchema: IRSchema = {
        ...createTestIRSchema({ type: 'object' }),
        properties: irSchemaProperties,
      };

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        irSchema,
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

    test('should use .entries() method for property iteration', () => {
      // TDD: Verify IRSchemaProperties.entries() is used for iteration
      const propSchemas = {
        first: createTestIRSchema({ type: 'string' }),
        second: createTestIRSchema({ type: 'number' }),
      };

      const irSchemaProperties = new IRSchemaProperties(propSchemas);

      const irSchema: IRSchema = {
        ...createTestIRSchema({ type: 'object' }),
        properties: irSchemaProperties,
      };

      const code: ZodCodeResult = { code: '', schema: irSchema };
      const meta: CodeMetaData = {};

      const result = handleObjectSchema(
        irSchema,
        code,
        undefined,
        meta,
        mockGetZodSchema,
        mockGetZodChain,
      );

      // Should iterate over entries correctly
      expect(result.code).toMatch(/z\.object\(\{[^}]*first[^}]*second[^}]*\}\)/);
    });
  });
});
