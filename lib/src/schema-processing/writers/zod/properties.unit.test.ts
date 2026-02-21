/**
 * Property Writing Helper Tests
 *
 * Unit tests for pure functions extracted from writeProperties.
 * Tests property context building, circular reference detection,
 * and property syntax selection.
 *
 * @module writers/zod/properties.unit.test
 */

import { describe, it, expect } from 'vitest';
import { createMockCastrSchema } from '../../ir/index.js';
import {
  buildPropertyContext,
  detectCircularReference,
  shouldUseGetterSyntax,
  formatPropertyKey,
} from './properties.js';

describe('Property Writing Helpers', () => {
  describe('formatPropertyKey', () => {
    it('returns key unchanged for valid JS identifiers', () => {
      expect(formatPropertyKey('name')).toBe('name');
      expect(formatPropertyKey('userId')).toBe('userId');
      expect(formatPropertyKey('_private')).toBe('_private');
    });

    it('quotes keys that start with numbers', () => {
      expect(formatPropertyKey('123abc')).toBe("'123abc'");
    });

    it('quotes keys with special characters', () => {
      expect(formatPropertyKey('content-type')).toBe("'content-type'");
      expect(formatPropertyKey('foo.bar')).toBe("'foo.bar'");
    });

    it('quotes keys with spaces', () => {
      expect(formatPropertyKey('my key')).toBe("'my key'");
    });
  });

  describe('buildPropertyContext', () => {
    it('builds context for required property', () => {
      const schema = createMockCastrSchema({ type: 'string' });
      const result = buildPropertyContext('name', schema, true);

      expect(result.contextType).toBe('property');
      expect(result.name).toBe('name');
      expect(result.schema).toBe(schema);
      expect(result.optional).toBe(false);
    });

    it('builds context for optional property', () => {
      const schema = createMockCastrSchema({ type: 'number' });
      const result = buildPropertyContext('age', schema, false);

      expect(result.contextType).toBe('property');
      expect(result.name).toBe('age');
      expect(result.optional).toBe(true);
    });
  });

  describe('detectCircularReference', () => {
    it('returns false for schema without circular references', () => {
      const propSchema = createMockCastrSchema({ type: 'string' });
      const parentSchema = createMockCastrSchema({ type: 'object' });

      expect(detectCircularReference(propSchema, parentSchema)).toBe(false);
    });

    it('returns true when property has circularReferences metadata', () => {
      const propSchema = createMockCastrSchema({
        type: 'object',
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['SelfRef'],
        },
      });
      const parentSchema = createMockCastrSchema({ type: 'object' });

      expect(detectCircularReference(propSchema, parentSchema)).toBe(true);
    });

    it('returns true when parent has circularReferences AND property has $ref', () => {
      const propSchema = createMockCastrSchema({
        $ref: '#/components/schemas/Node',
      });
      const parentSchema = createMockCastrSchema({
        type: 'object',
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['Node'],
        },
      });

      expect(detectCircularReference(propSchema, parentSchema)).toBe(true);
    });

    it('returns false when parent has circularReferences but property has no $ref', () => {
      const propSchema = createMockCastrSchema({ type: 'string' });
      const parentSchema = createMockCastrSchema({
        type: 'object',
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['Node'],
        },
      });

      expect(detectCircularReference(propSchema, parentSchema)).toBe(false);
    });

    it('returns true when array items have $ref and parent has circular refs', () => {
      const propSchema = createMockCastrSchema({
        type: 'array',
        items: createMockCastrSchema({ $ref: '#/components/schemas/Child' }),
      });
      const parentSchema = createMockCastrSchema({
        type: 'object',
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['Child'],
        },
      });

      expect(detectCircularReference(propSchema, parentSchema)).toBe(true);
    });
  });

  describe('shouldUseGetterSyntax', () => {
    it('returns false for non-circular schemas', () => {
      const propSchema = createMockCastrSchema({ type: 'string' });
      const parentSchema = createMockCastrSchema({ type: 'object' });

      expect(shouldUseGetterSyntax(propSchema, parentSchema)).toBe(false);
    });

    it('returns true for circular schemas', () => {
      const propSchema = createMockCastrSchema({
        type: 'object',
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['SelfRef'],
        },
      });
      const parentSchema = createMockCastrSchema({ type: 'object' });

      expect(shouldUseGetterSyntax(propSchema, parentSchema)).toBe(true);
    });
  });
});
