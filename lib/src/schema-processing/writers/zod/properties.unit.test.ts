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
import { CastrSchemaProperties, createMockCastrSchema } from '../../ir/index.js';
import {
  buildPropertyContext,
  detectCircularReference,
  shouldUseGetterSyntax,
  isRecursiveObjectSchema,
  formatPropertyKey,
  getNullableReferenceCompositionBaseSchema,
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

    it('returns true when nullable reference compositions appear on a circular property', () => {
      const propSchema = createMockCastrSchema({
        anyOf: [
          createMockCastrSchema({ $ref: '#/components/schemas/LinkedListNode' }),
          createMockCastrSchema({ type: 'null' }),
        ],
      });
      const parentSchema = createMockCastrSchema({
        type: 'object',
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['LinkedListNode'],
        },
      });

      expect(detectCircularReference(propSchema, parentSchema)).toBe(true);
    });
  });

  describe('getNullableReferenceCompositionBaseSchema', () => {
    it('returns the non-null ref member for nullable reference compositions', () => {
      const schema = createMockCastrSchema({
        anyOf: [
          createMockCastrSchema({ $ref: '#/components/schemas/LinkedListNode' }),
          createMockCastrSchema({ type: 'null' }),
        ],
      });

      const result = getNullableReferenceCompositionBaseSchema(schema);

      expect(result?.$ref).toBe('#/components/schemas/LinkedListNode');
    });

    it('returns undefined for non-reference nullable compositions', () => {
      const schema = createMockCastrSchema({
        anyOf: [createMockCastrSchema({ type: 'string' }), createMockCastrSchema({ type: 'null' })],
      });

      expect(getNullableReferenceCompositionBaseSchema(schema)).toBeUndefined();
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

  describe('isRecursiveObjectSchema', () => {
    it('returns false for non-recursive object schemas', () => {
      const schema = createMockCastrSchema({
        type: 'object',
        properties: new CastrSchemaProperties({
          value: createMockCastrSchema({ type: 'string' }),
        }),
      });

      expect(isRecursiveObjectSchema(schema)).toBe(false);
    });

    it('returns true when the object surface references one of its circular targets', () => {
      const schema = createMockCastrSchema({
        type: 'object',
        properties: new CastrSchemaProperties({
          next: createMockCastrSchema({
            $ref: '#/components/schemas/Node',
          }),
        }),
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['#/components/schemas/Node'],
        },
      });

      expect(isRecursiveObjectSchema(schema)).toBe(true);
    });

    it('returns false when a child schema is recursive but the parent is not part of the cycle', () => {
      const childSchema = createMockCastrSchema({
        type: 'array',
        items: createMockCastrSchema({ $ref: '#/components/schemas/Node' }),
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['Node'],
        },
      });
      const schema = createMockCastrSchema({
        type: 'object',
        properties: new CastrSchemaProperties({
          children: childSchema,
        }),
      });

      expect(isRecursiveObjectSchema(schema)).toBe(false);
      expect(isRecursiveObjectSchema(schema, '#/components/schemas/Wrapper')).toBe(false);
    });

    it('returns true when child-marked recursion targets the current component', () => {
      const childSchema = createMockCastrSchema({
        type: 'array',
        items: createMockCastrSchema({ $ref: '#/components/schemas/Node' }),
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['#/components/schemas/Node'],
        },
      });
      const schema = createMockCastrSchema({
        type: 'object',
        properties: new CastrSchemaProperties({
          children: childSchema,
        }),
      });

      expect(isRecursiveObjectSchema(schema, '#/components/schemas/Node')).toBe(true);
    });

    it('returns true when catchall references one of the object circular targets', () => {
      const schema = createMockCastrSchema({
        type: 'object',
        unknownKeyBehavior: {
          mode: 'catchall',
          schema: createMockCastrSchema({
            $ref: '#/components/schemas/Node',
          }),
        },
        metadata: {
          required: false,
          nullable: false,
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          zodChain: { presence: '', validations: [], defaults: [] },
          circularReferences: ['#/components/schemas/Node'],
        },
      });

      expect(isRecursiveObjectSchema(schema)).toBe(true);
    });
  });
});
