/**
 * Unit tests for OpenAPI schema writer keyword fidelity.
 *
 * Covers seams reported by the initial review:
 * - H2: contentEncoding emission through the OpenAPI writer
 * - H4: $ref sibling keyword emission (2020-12 applies siblings)
 * - L9: boolean-schema rejection states the closed-world policy, not a
 *   false "no OpenAPI equivalent" impossibility claim
 */

import { describe, it, expect } from 'vitest';

import type { CastrSchema, CastrSchemaNode } from '../../../ir/index.js';

import { writeOpenApiSchema } from './openapi-writer.schema.js';

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

describe('contentEncoding emission (H2)', () => {
  it('emits contentEncoding for string schemas', () => {
    const schema: CastrSchema = {
      type: 'string',
      contentEncoding: 'base64',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result).toEqual({ type: 'string', contentEncoding: 'base64' });
  });

  it('emits contentMediaType and contentSchema', () => {
    const schema: CastrSchema = {
      type: 'string',
      contentMediaType: 'application/json',
      contentSchema: { type: 'string', minLength: 1, metadata: createMetadata() },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.contentMediaType).toBe('application/json');
    expect(result.contentSchema).toEqual({ type: 'string', minLength: 1 });
  });
});

describe('$ref sibling emission (H4)', () => {
  it('emits sibling keywords alongside $ref', () => {
    const schema: CastrSchema = {
      $ref: '#/components/schemas/Base',
      description: 'hi',
      minLength: 5,
      title: 'T',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.$ref).toBe('#/components/schemas/Base');
    expect(result.description).toBe('hi');
    expect(result.minLength).toBe(5);
    expect(result.title).toBe('T');
  });

  it('emits pure $ref nodes bare', () => {
    const schema: CastrSchema = {
      $ref: '#/components/schemas/Base',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result).toEqual({ $ref: '#/components/schemas/Base' });
  });
});

describe('boolean-schema rejection message truth (L9)', () => {
  it('states the closed-world policy instead of claiming impossibility', () => {
    const schema: CastrSchema = {
      booleanSchema: true,
      metadata: createMetadata(),
    };

    expect(() => writeOpenApiSchema(schema)).toThrow(/policy/);
    expect(() => writeOpenApiSchema(schema)).not.toThrow(/Genuinely impossible/);
    expect(() => writeOpenApiSchema(schema)).not.toThrow(/no OpenAPI equivalent/);
  });
});
