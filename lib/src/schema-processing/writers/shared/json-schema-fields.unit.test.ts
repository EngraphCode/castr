/**
 * Unit tests for the shared JSON Schema field writers.
 *
 * Covers keyword-fidelity seams reported by the initial review:
 * - H2: contentEncoding / contentMediaType / contentSchema emission
 * - H2: boolean exclusiveMinimum / exclusiveMaximum normalise-or-fail
 */

import { describe, it, expect } from 'vitest';

import type { CastrSchema, CastrSchemaNode } from '../../ir/index.js';

import type { JsonSchemaObject } from './json-schema-object.js';
import { writeAllJsonSchemaFields } from './json-schema-fields.js';

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

function writeFields(schema: CastrSchema): JsonSchemaObject {
  const result: JsonSchemaObject = {};
  writeAllJsonSchemaFields(schema, result, writeFields);
  return result;
}

describe('content keyword emission (H2/H4)', () => {
  it('emits contentEncoding', () => {
    const schema: CastrSchema = {
      type: 'string',
      contentEncoding: 'base64',
      metadata: createMetadata(),
    };

    const result = writeFields(schema);

    expect(result.contentEncoding).toBe('base64');
  });

  it('emits contentMediaType', () => {
    const schema: CastrSchema = {
      type: 'string',
      contentMediaType: 'image/png',
      metadata: createMetadata(),
    };

    const result = writeFields(schema);

    expect(result.contentMediaType).toBe('image/png');
  });

  it('emits contentSchema recursively', () => {
    const schema: CastrSchema = {
      type: 'string',
      contentMediaType: 'application/json',
      contentSchema: {
        type: 'string',
        minLength: 1,
        metadata: createMetadata(),
      },
      metadata: createMetadata(),
    };

    const result = writeFields(schema);

    expect(result.contentSchema).toEqual({ type: 'string', minLength: 1 });
  });
});

describe('boolean exclusive bounds normalise-or-fail (H2)', () => {
  it('promotes boolean exclusiveMinimum with companion minimum to numeric form', () => {
    const schema: CastrSchema = {
      type: 'number',
      minimum: 5,
      exclusiveMinimum: true,
      metadata: createMetadata(),
    };

    const result = writeFields(schema);

    expect(result.exclusiveMinimum).toBe(5);
    expect(result.minimum).toBeUndefined();
  });

  it('promotes boolean exclusiveMaximum with companion maximum to numeric form', () => {
    const schema: CastrSchema = {
      type: 'number',
      maximum: 10,
      exclusiveMaximum: true,
      metadata: createMetadata(),
    };

    const result = writeFields(schema);

    expect(result.exclusiveMaximum).toBe(10);
    expect(result.maximum).toBeUndefined();
  });

  it('drops exclusiveMinimum: false and keeps the inclusive minimum', () => {
    const schema: CastrSchema = {
      type: 'number',
      minimum: 5,
      exclusiveMinimum: false,
      metadata: createMetadata(),
    };

    const result = writeFields(schema);

    expect(result.minimum).toBe(5);
    expect(result.exclusiveMinimum).toBeUndefined();
  });

  it('drops exclusiveMaximum: false and keeps the inclusive maximum', () => {
    const schema: CastrSchema = {
      type: 'number',
      maximum: 10,
      exclusiveMaximum: false,
      metadata: createMetadata(),
    };

    const result = writeFields(schema);

    expect(result.maximum).toBe(10);
    expect(result.exclusiveMaximum).toBeUndefined();
  });

  it('fails fast on boolean exclusiveMinimum: true without a companion minimum', () => {
    const schema: CastrSchema = {
      type: 'number',
      exclusiveMinimum: true,
      metadata: createMetadata(),
    };

    expect(() => writeFields(schema)).toThrow(/exclusiveMinimum/);
  });

  it('fails fast on boolean exclusiveMaximum: true without a companion maximum', () => {
    const schema: CastrSchema = {
      type: 'number',
      exclusiveMaximum: true,
      metadata: createMetadata(),
    };

    expect(() => writeFields(schema)).toThrow(/exclusiveMaximum/);
  });

  it('emits numeric exclusive bounds unchanged', () => {
    const schema: CastrSchema = {
      type: 'number',
      exclusiveMinimum: 1,
      exclusiveMaximum: 9,
      metadata: createMetadata(),
    };

    const result = writeFields(schema);

    expect(result.exclusiveMinimum).toBe(1);
    expect(result.exclusiveMaximum).toBe(9);
  });
});
