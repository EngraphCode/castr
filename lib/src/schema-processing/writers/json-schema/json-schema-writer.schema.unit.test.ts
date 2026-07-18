/**
 * Unit tests for JSON Schema schema writer.
 *
 * Tests the writeJsonSchema function that converts a CastrSchema (IR) to a
 * pure JSON Schema 2020-12 object. Follows TDD — tests written first.
 */

import { describe, it, expect } from 'vitest';

import type { CastrSchema, CastrSchemaNode } from '../../ir/index.js';
import { CastrSchemaProperties, UUID_V4_PATTERN } from '../../ir/index.js';
import { assertSchemaSupportsIntegerTargetCapabilities } from '../../compatibility/integer-target-capabilities.js';
import type { JsonSchemaObject } from '../shared/json-schema-fields.js';
import { writeJsonSchema } from './json-schema-writer.schema.js';

/**
 * Test-local wrapper that narrows `writeJsonSchema` return to `JsonSchemaObject`.
 * Existing tests never exercise boolean schemas, so the assertion is safe.
 */
function writeJsonSchemaAsObject(schema: CastrSchema): JsonSchemaObject {
  const result = writeJsonSchema(schema);
  if (typeof result === 'boolean') {
    throw new Error(`Expected JsonSchemaObject but got boolean: ${String(result)}`);
  }
  return result;
}

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

      const result = writeJsonSchemaAsObject(schema);

      expect(result).toEqual({ type: 'string' });
    });

    it('converts number type', () => {
      const schema = createSchema({ type: 'number' });

      const result = writeJsonSchemaAsObject(schema);

      expect(result).toEqual({ type: 'number' });
    });

    it('converts integer type', () => {
      const schema = createSchema({ type: 'integer' });

      const result = writeJsonSchemaAsObject(schema);

      expect(result).toEqual({ type: 'integer' });
    });

    it('converts boolean type', () => {
      const schema = createSchema({ type: 'boolean' });

      const result = writeJsonSchemaAsObject(schema);

      expect(result).toEqual({ type: 'boolean' });
    });

    it('converts null type', () => {
      const schema = createSchema({ type: 'null' });

      const result = writeJsonSchemaAsObject(schema);

      expect(result).toEqual({ type: 'null' });
    });
  });

  describe('nullable handling', () => {
    it('folds nullable into type array', () => {
      const schema = createSchema({
        type: 'string',
        metadata: createMetadata({ nullable: true }),
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.type).toEqual(['string', 'null']);
    });

    it('preserves nullable reference compositions as anyOf', () => {
      const schema = createSchema({
        anyOf: [createSchema({ $ref: '#/$defs/LinkedListNode' }), createSchema({ type: 'null' })],
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.anyOf).toEqual([{ $ref: '#/$defs/LinkedListNode' }, { type: 'null' }]);
    });
  });

  describe('string constraints', () => {
    it('writes format', () => {
      const schema = createSchema({ type: 'string', format: 'email' });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.format).toBe('email');
    });

    it('keeps JSON Schema UUID output plain while preserving existing pattern content', () => {
      const schema = createSchema({
        type: 'string',
        format: 'uuid',
        uuidVersion: 4,
        pattern: UUID_V4_PATTERN,
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.format).toBe('uuid');
      expect(result.pattern).toBe(UUID_V4_PATTERN);
      expect('uuidVersion' in result).toBe(false);
    });

    it('writes minLength and maxLength', () => {
      const schema = createSchema({ type: 'string', minLength: 1, maxLength: 100 });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(100);
    });

    it('writes pattern', () => {
      const schema = createSchema({ type: 'string', pattern: '^[a-z]+$' });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.pattern).toBe('^[a-z]+$');
    });
  });

  describe('number constraints', () => {
    it('writes minimum and maximum', () => {
      const schema = createSchema({ type: 'number', minimum: 0, maximum: 100 });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(100);
    });

    it('writes exclusiveMinimum and exclusiveMaximum', () => {
      const schema = createSchema({
        type: 'number',
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.exclusiveMinimum).toBe(0);
      expect(result.exclusiveMaximum).toBe(100);
    });

    it('writes multipleOf', () => {
      const schema = createSchema({ type: 'number', multipleOf: 5 });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.multipleOf).toBe(5);
    });
  });

  describe('enum and const', () => {
    it('writes enum values', () => {
      const schema = createSchema({ type: 'string', enum: ['a', 'b', 'c'] });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.enum).toEqual(['a', 'b', 'c']);
    });

    it('writes const value', () => {
      const schema = createSchema({ type: 'string', const: 'fixed' });

      const result = writeJsonSchemaAsObject(schema);

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

      const result = writeJsonSchemaAsObject(schema);

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

      const result = writeJsonSchemaAsObject(schema);

      expect(result.required).toEqual(['id']);
    });

    it('writes additionalProperties as boolean', () => {
      const schema = createSchema({
        type: 'object',
        additionalProperties: false,
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.additionalProperties).toBe(false);
    });
  });

  describe('array fields', () => {
    it('writes items schema', () => {
      const schema = createSchema({
        type: 'array',
        items: createSchema({ type: 'string' }),
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.items).toEqual({ type: 'string' });
    });

    it('writes prefixItems for tuple arrays', () => {
      const schema = createSchema({
        type: 'array',
        items: [createSchema({ type: 'string' }), createSchema({ type: 'number' })],
      });

      const result = writeJsonSchemaAsObject(schema);

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

      const result = writeJsonSchemaAsObject(schema);

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

      const result = writeJsonSchemaAsObject(schema);

      expect(result.allOf).toHaveLength(2);
      expect(result.allOf?.[0]).toEqual({ type: 'object', additionalProperties: false });
    });

    it('writes oneOf', () => {
      const schema = createSchema({
        oneOf: [createSchema({ type: 'string' }), createSchema({ type: 'number' })],
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.oneOf).toHaveLength(2);
    });

    it('writes anyOf', () => {
      const schema = createSchema({
        anyOf: [createSchema({ type: 'string' }), createSchema({ type: 'null' })],
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.anyOf).toHaveLength(2);
    });

    it('writes not', () => {
      const schema = createSchema({
        not: createSchema({ type: 'string' }),
      });

      const result = writeJsonSchemaAsObject(schema);

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

      const result = writeJsonSchemaAsObject(schema);

      expect(result.title).toBe('Email');
      expect(result.description).toBe('User email address');
    });

    it('writes default value', () => {
      const schema = createSchema({
        type: 'string',
        default: 'unknown',
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.default).toBe('unknown');
    });

    it('emits examples but not example (OAS-only) in pure JSON Schema output', () => {
      const schema = createSchema({
        type: 'string',
        example: 'user@example.com',
        examples: ['alice@test.com', 'bob@test.com'],
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.example).toBeUndefined();
      expect(result.examples).toEqual(['alice@test.com', 'bob@test.com']);
    });

    it('folds example-only into examples array for JSON Schema 2020-12', () => {
      const schema = createSchema({
        type: 'string',
        example: 'user@example.com',
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.example).toBeUndefined();
      expect(result.examples).toEqual(['user@example.com']);
    });

    it('emits examples when only examples is set', () => {
      const schema = createSchema({
        type: 'string',
        examples: ['alice@test.com', 'bob@test.com'],
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.example).toBeUndefined();
      expect(result.examples).toEqual(['alice@test.com', 'bob@test.com']);
    });

    it('writes deprecated, readOnly, writeOnly', () => {
      const schema = createSchema({
        type: 'string',
        deprecated: true,
        readOnly: true,
        writeOnly: false,
      });

      const result = writeJsonSchemaAsObject(schema);

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

      const result = writeJsonSchemaAsObject(schema);

      expect(result.unevaluatedProperties).toBe(false);
    });

    it('writes unevaluatedProperties as schema', () => {
      const schema = createSchema({
        type: 'object',
        unevaluatedProperties: createSchema({ type: 'string' }),
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.unevaluatedProperties).toEqual({ type: 'string' });
    });

    it('writes unevaluatedItems as boolean', () => {
      const schema = createSchema({
        type: 'array',
        unevaluatedItems: false,
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.unevaluatedItems).toBe(false);
    });

    it('writes dependentSchemas', () => {
      const schema = createSchema({
        type: 'object',
        dependentSchemas: {
          creditCard: createSchema({ type: 'object' }),
        },
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.dependentSchemas?.['creditCard']).toEqual({
        type: 'object',
        additionalProperties: false,
      });
    });

    it('writes dependentRequired', () => {
      const schema = createSchema({
        type: 'object',
        dependentRequired: {
          email: ['emailVerified'],
        },
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.dependentRequired).toEqual({ email: ['emailVerified'] });
    });

    it('writes minContains and maxContains', () => {
      const schema = createSchema({
        type: 'array',
        minContains: 1,
        maxContains: 5,
      });

      const result = writeJsonSchemaAsObject(schema);

      expect(result.minContains).toBe(1);
      expect(result.maxContains).toBe(5);
    });
  });
});

describe('writeJsonSchema — OAS-only fields are NOT emitted', () => {
  it('does not emit xml', () => {
    const schema = createSchema({
      type: 'string',
      xml: { name: 'tag' },
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result['xml']).toBeUndefined();
  });

  it('does not emit externalDocs', () => {
    const schema = createSchema({
      type: 'string',
      externalDocs: { url: 'https://example.com' },
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result['externalDocs']).toBeUndefined();
  });

  it('does not emit discriminator', () => {
    const schema = createSchema({
      oneOf: [createSchema({ type: 'object' })],
      discriminator: { propertyName: 'type' },
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result['discriminator']).toBeUndefined();
  });
});

describe('writeJsonSchema — boolean schemas', () => {
  it('writes boolean schema false as literal false', () => {
    const schema = createSchema({ booleanSchema: false });

    const result = writeJsonSchema(schema);

    expect(result).toBe(false);
  });

  it('writes boolean schema true as literal true', () => {
    const schema = createSchema({ booleanSchema: true });

    const result = writeJsonSchema(schema);

    expect(result).toBe(true);
  });
});

describe('writeJsonSchema — $ref emission', () => {
  it('returns bare $ref for a pure reference', () => {
    const schema = createSchema({
      $ref: '#/$defs/Address',
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({ $ref: '#/$defs/Address' });
  });

  it('emits sibling keywords alongside $ref (2020-12 applies them)', () => {
    const schema = createSchema({
      $ref: '#/$defs/Base',
      description: 'hi',
      minLength: 5,
      title: 'T',
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      $ref: '#/$defs/Base',
      description: 'hi',
      minLength: 5,
      title: 'T',
    });
  });

  it('emits a type: object sibling with closed-world semantics, matching the parser IR', () => {
    const schema = createSchema({
      $ref: '#/$defs/Address',
      type: 'object',
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      $ref: '#/$defs/Address',
      type: 'object',
      additionalProperties: false,
    });
  });

  it('emits the reference summary annotation alongside $ref', () => {
    const schema = createSchema({
      $ref: '#/$defs/Base',
      summary: 'Short reference summary',
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      $ref: '#/$defs/Base',
      summary: 'Short reference summary',
    });
  });
});

describe('writeJsonSchema — boolean sub-schema emission', () => {
  it('emits if/then boolean schemas as booleans, not empty objects', () => {
    const schema = createSchema({
      if: createSchema({ booleanSchema: false }),
      then: createSchema({ type: 'string' }),
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      if: false,
      then: { type: 'string' },
    });
  });

  it('emits contentSchema: false as a boolean, not an empty object', () => {
    const schema = createSchema({
      type: 'string',
      contentMediaType: 'application/json',
      contentSchema: createSchema({ booleanSchema: false }),
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      type: 'string',
      contentMediaType: 'application/json',
      contentSchema: false,
    });
  });

  it('fails fast when a boolean schema reaches an object-only position', () => {
    const schema = createSchema({
      type: 'object',
      properties: new CastrSchemaProperties({
        flag: createSchema({ booleanSchema: false }),
      }),
      additionalProperties: false,
    });

    expect(() => writeJsonSchema(schema)).toThrow(/[Bb]oolean/);
  });
});

describe('writeJsonSchema — capability assertions honour conditional branch reachability', () => {
  const INT64_ERROR = /cannot represent signed 64-bit integer semantics natively/;

  function createInt64Schema(): CastrSchema {
    return createSchema({
      type: 'integer',
      format: 'int64',
      integerSemantics: 'int64',
    });
  }

  it('emits an unreachable then branch verbatim instead of failing its capability assertion', () => {
    // Guard/writer coherence: the capability preflight skips branches that can
    // never apply (JSON Schema 2020-12 core §10.2.2 — `if: false` never
    // validates, so `then` never constrains instances). The writer must apply
    // the same rule while still emitting the branch verbatim (losslessness).
    const schema = createSchema({
      if: createSchema({ booleanSchema: false }),
      then: createInt64Schema(),
    });

    expect(() =>
      assertSchemaSupportsIntegerTargetCapabilities(schema, 'JSON Schema 2020-12'),
    ).not.toThrow();

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      if: false,
      then: { type: 'integer', format: 'int64' },
    });
  });

  it('emits an unreachable else branch verbatim when if is literally true', () => {
    const schema = createSchema({
      if: createSchema({ booleanSchema: true }),
      else: createInt64Schema(),
    });

    expect(() =>
      assertSchemaSupportsIntegerTargetCapabilities(schema, 'JSON Schema 2020-12'),
    ).not.toThrow();

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      if: true,
      else: { type: 'integer', format: 'int64' },
    });
  });

  it('emits then and else verbatim when if is absent (2020-12 ignores them entirely)', () => {
    const schema = createSchema({
      then: createInt64Schema(),
      else: createInt64Schema(),
    });

    expect(() =>
      assertSchemaSupportsIntegerTargetCapabilities(schema, 'JSON Schema 2020-12'),
    ).not.toThrow();

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      then: { type: 'integer', format: 'int64' },
      else: { type: 'integer', format: 'int64' },
    });
  });

  it('exempts the whole unreachable subtree, not just its root', () => {
    const schema = createSchema({
      if: createSchema({ booleanSchema: false }),
      then: createSchema({
        type: 'object',
        properties: new CastrSchemaProperties({
          big: createInt64Schema(),
        }),
      }),
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      if: false,
      then: {
        type: 'object',
        properties: {
          big: { type: 'integer', format: 'int64' },
        },
        additionalProperties: false,
      },
    });
  });

  it('exempts nested conditionals inside an unreachable branch', () => {
    // The nested `if` is object-form (both nested branches would be live),
    // but the whole subtree sits under `if: false` and can never apply.
    const schema = createSchema({
      if: createSchema({ booleanSchema: false }),
      then: createSchema({
        if: createSchema({ type: 'string' }),
        then: createInt64Schema(),
      }),
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      if: false,
      then: {
        if: { type: 'string' },
        then: { type: 'integer', format: 'int64' },
      },
    });
  });

  it('emits the carrier-less integer shape for bigint semantics inside an unreachable branch', () => {
    // JSON Schema has no bigint carrier keyword; in a live position that is a
    // fail-fast. In a branch that can never apply, the capability demand is
    // vacuous, so the writer emits the honest carrier-less shape instead.
    const schema = createSchema({
      if: createSchema({ booleanSchema: false }),
      then: createSchema({ type: 'integer', integerSemantics: 'bigint' }),
    });

    const result = writeJsonSchemaAsObject(schema);

    expect(result).toEqual({
      if: false,
      then: { type: 'integer' },
    });
  });

  it('still fails the assertion for a reachable then branch (if: true)', () => {
    const schema = createSchema({
      if: createSchema({ booleanSchema: true }),
      then: createInt64Schema(),
    });

    expect(() => writeJsonSchema(schema)).toThrow(INT64_ERROR);
  });

  it('still fails the assertion for a reachable else branch (if: false)', () => {
    const schema = createSchema({
      if: createSchema({ booleanSchema: false }),
      else: createInt64Schema(),
    });

    expect(() => writeJsonSchema(schema)).toThrow(INT64_ERROR);
  });

  it('still fails the assertion for branches gated by an object-form if', () => {
    const schema = createSchema({
      if: createSchema({ type: 'string' }),
      then: createInt64Schema(),
    });

    expect(() => writeJsonSchema(schema)).toThrow(INT64_ERROR);
  });
});
