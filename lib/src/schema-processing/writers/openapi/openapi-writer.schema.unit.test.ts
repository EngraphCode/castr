/**
 * Unit tests for OpenAPI schema writer.
 *
 * Tests conversion from CastrSchema (IR) to OpenAPI SchemaObject.
 * Follows TDD - tests written first, implementation follows.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

import type { CastrSchema, CastrSchemaNode } from '../../ir/schema.js';
import { CastrSchemaProperties } from '../../ir/schema-properties.js';

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

describe('primitive types', () => {
  it('converts string type correctly', () => {
    const schema: CastrSchema = {
      type: 'string',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toBe('string');
  });

  it('converts number type correctly', () => {
    const schema: CastrSchema = {
      type: 'number',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toBe('number');
  });

  it('converts integer type correctly', () => {
    const schema: CastrSchema = {
      type: 'integer',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toBe('integer');
  });

  it('converts boolean type correctly', () => {
    const schema: CastrSchema = {
      type: 'boolean',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toBe('boolean');
  });
});

describe('string formats', () => {
  it('preserves email format', () => {
    const schema: CastrSchema = {
      type: 'string',
      format: 'email',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toBe('string');
    expect(result.format).toBe('email');
  });

  it('preserves uuid format', () => {
    const schema: CastrSchema = {
      type: 'string',
      format: 'uuid',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.format).toBe('uuid');
  });

  it('preserves date-time format', () => {
    const schema: CastrSchema = {
      type: 'string',
      format: 'date-time',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.format).toBe('date-time');
  });
});

describe('string constraints', () => {
  it('preserves minLength', () => {
    const schema: CastrSchema = {
      type: 'string',
      minLength: 1,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.minLength).toBe(1);
  });

  it('preserves maxLength', () => {
    const schema: CastrSchema = {
      type: 'string',
      maxLength: 100,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.maxLength).toBe(100);
  });

  it('preserves pattern', () => {
    const schema: CastrSchema = {
      type: 'string',
      pattern: '^[a-z]+$',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.pattern).toBe('^[a-z]+$');
  });
});

describe('number constraints', () => {
  it('preserves minimum', () => {
    const schema: CastrSchema = {
      type: 'number',
      minimum: 0,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.minimum).toBe(0);
  });

  it('preserves maximum', () => {
    const schema: CastrSchema = {
      type: 'number',
      maximum: 100,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.maximum).toBe(100);
  });

  it('preserves exclusiveMinimum', () => {
    const schema: CastrSchema = {
      type: 'number',
      exclusiveMinimum: 0,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.exclusiveMinimum).toBe(0);
  });

  it('preserves multipleOf', () => {
    const schema: CastrSchema = {
      type: 'number',
      multipleOf: 0.01,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.multipleOf).toBe(0.01);
  });
});

describe('enum values', () => {
  it('preserves string enum', () => {
    const schema: CastrSchema = {
      type: 'string',
      enum: ['admin', 'user', 'guest'],
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.enum).toEqual(['admin', 'user', 'guest']);
  });

  it('preserves mixed enum', () => {
    const schema: CastrSchema = {
      enum: [1, 'two', true],
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.enum).toEqual([1, 'two', true]);
  });
});

describe('nullable handling', () => {
  it('converts nullable string to OAS 3.1 type array', () => {
    const schema: CastrSchema = {
      type: 'string',
      metadata: createMetadata({ nullable: true }),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toEqual(['string', 'null']);
  });

  it('does not modify non-nullable type', () => {
    const schema: CastrSchema = {
      type: 'string',
      metadata: createMetadata({ nullable: false }),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toBe('string');
  });
});

describe('object schemas', () => {
  it('converts object with properties', () => {
    const schema: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        name: { type: 'string', metadata: createMetadata() },
        age: { type: 'integer', metadata: createMetadata() },
      }),
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toBe('object');
    expect(result.properties).toBeDefined();
    expect(result.properties?.['name']).toEqual({ type: 'string' });
    expect(result.properties?.['age']).toEqual({ type: 'integer' });
  });

  it('preserves required array', () => {
    const schema: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        id: { type: 'string', metadata: createMetadata({ required: true }) },
        name: { type: 'string', metadata: createMetadata() },
      }),
      required: ['id'],
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.required).toEqual(['id']);
  });

  it('handles additionalProperties false', () => {
    const schema: CastrSchema = {
      type: 'object',
      additionalProperties: false,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.additionalProperties).toBe(false);
  });

  it('handles additionalProperties with schema', () => {
    const schema: CastrSchema = {
      type: 'object',
      additionalProperties: { type: 'string', metadata: createMetadata() },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.additionalProperties).toEqual({ type: 'string' });
  });
});

describe('array schemas', () => {
  it('converts array with items', () => {
    const schema: CastrSchema = {
      type: 'array',
      items: { type: 'string', metadata: createMetadata() },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.type).toBe('array');
    expect(result.items).toEqual({ type: 'string' });
  });

  it('preserves minItems', () => {
    const schema: CastrSchema = {
      type: 'array',
      items: { type: 'string', metadata: createMetadata() },
      minItems: 1,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.minItems).toBe(1);
  });

  it('preserves maxItems', () => {
    const schema: CastrSchema = {
      type: 'array',
      items: { type: 'string', metadata: createMetadata() },
      maxItems: 10,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.maxItems).toBe(10);
  });

  it('preserves uniqueItems', () => {
    const schema: CastrSchema = {
      type: 'array',
      items: { type: 'string', metadata: createMetadata() },
      uniqueItems: true,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.uniqueItems).toBe(true);
  });
});

describe('composition schemas', () => {
  it('converts allOf composition', () => {
    const schema: CastrSchema = {
      allOf: [
        { type: 'object', metadata: createMetadata() },
        { $ref: '#/components/schemas/Base', metadata: createMetadata() },
      ],
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.allOf).toHaveLength(2);
    expect(result.allOf?.[0]).toEqual({ type: 'object' });
    expect(result.allOf?.[1]).toEqual({ $ref: '#/components/schemas/Base' });
  });

  it('converts oneOf composition', () => {
    const schema: CastrSchema = {
      oneOf: [
        { type: 'string', metadata: createMetadata() },
        { type: 'number', metadata: createMetadata() },
      ],
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.oneOf).toHaveLength(2);
    expect(result.oneOf?.[0]).toEqual({ type: 'string' });
    expect(result.oneOf?.[1]).toEqual({ type: 'number' });
  });

  it('converts anyOf composition', () => {
    const schema: CastrSchema = {
      anyOf: [
        { type: 'string', metadata: createMetadata() },
        { type: 'null', metadata: createMetadata() },
      ],
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.anyOf).toHaveLength(2);
  });

  it('preserves discriminator', () => {
    const schema: CastrSchema = {
      oneOf: [
        { $ref: '#/components/schemas/Cat', metadata: createMetadata() },
        { $ref: '#/components/schemas/Dog', metadata: createMetadata() },
      ],
      discriminator: { propertyName: 'petType' },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.discriminator).toEqual({ propertyName: 'petType' });
  });
});

describe('references', () => {
  it('preserves $ref', () => {
    const schema: CastrSchema = {
      $ref: '#/components/schemas/User',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.$ref).toBe('#/components/schemas/User');
  });
});

describe('metadata fields', () => {
  it('preserves description', () => {
    const schema: CastrSchema = {
      type: 'string',
      description: 'User email address',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.description).toBe('User email address');
  });

  it('preserves default value', () => {
    const schema: CastrSchema = {
      type: 'string',
      default: 'unknown',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.default).toBe('unknown');
  });

  it('preserves example', () => {
    const schema: CastrSchema = {
      type: 'string',
      example: 'user@example.com',
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.example).toBe('user@example.com');
  });

  it('preserves deprecated flag', () => {
    const schema: CastrSchema = {
      type: 'string',
      deprecated: true,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.deprecated).toBe(true);
  });

  it('preserves readOnly flag', () => {
    const schema: CastrSchema = {
      type: 'string',
      readOnly: true,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.readOnly).toBe(true);
  });

  it('preserves writeOnly flag', () => {
    const schema: CastrSchema = {
      type: 'string',
      writeOnly: true,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.writeOnly).toBe(true);
  });
});

describe('OpenAPI extensions', () => {
  it('preserves xml object', () => {
    const schema: CastrSchema = {
      type: 'object',
      xml: { name: 'Pet', namespace: 'http://example.com/pet', prefix: 'pet' },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.xml).toEqual({
      name: 'Pet',
      namespace: 'http://example.com/pet',
      prefix: 'pet',
    });
  });

  it('preserves externalDocs', () => {
    const schema: CastrSchema = {
      type: 'object',
      externalDocs: { url: 'https://example.com/docs', description: 'More info' },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.externalDocs).toEqual({
      url: 'https://example.com/docs',
      description: 'More info',
    });
  });
});

describe('JSON Schema 2020-12 keywords', () => {
  it('converts prefixItems recursively', () => {
    const schema: CastrSchema = {
      type: 'array',
      prefixItems: [
        { type: 'string', metadata: createMetadata() },
        { type: 'number', metadata: createMetadata() },
      ],
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.prefixItems).toEqual([{ type: 'string' }, { type: 'number' }]);
  });

  it('preserves unevaluatedProperties when boolean false', () => {
    const schema: CastrSchema = {
      type: 'object',
      unevaluatedProperties: false,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.unevaluatedProperties).toBe(false);
  });

  it('preserves unevaluatedProperties when boolean true', () => {
    const schema: CastrSchema = {
      type: 'object',
      unevaluatedProperties: true,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.unevaluatedProperties).toBe(true);
  });

  it('converts unevaluatedProperties schema recursively', () => {
    const schema: CastrSchema = {
      type: 'object',
      unevaluatedProperties: { type: 'string', metadata: createMetadata() },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.unevaluatedProperties).toEqual({ type: 'string' });
  });

  it('preserves unevaluatedItems when boolean false', () => {
    const schema: CastrSchema = {
      type: 'array',
      unevaluatedItems: false,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.unevaluatedItems).toBe(false);
  });

  it('preserves unevaluatedItems when boolean true', () => {
    const schema: CastrSchema = {
      type: 'array',
      unevaluatedItems: true,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.unevaluatedItems).toBe(true);
  });

  it('converts unevaluatedItems schema recursively', () => {
    const schema: CastrSchema = {
      type: 'array',
      unevaluatedItems: { type: 'number', metadata: createMetadata() },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.unevaluatedItems).toEqual({ type: 'number' });
  });

  it('converts dependentSchemas recursively', () => {
    const schema: CastrSchema = {
      type: 'object',
      dependentSchemas: {
        creditCard: {
          type: 'object',
          properties: new CastrSchemaProperties({
            billingAddress: { type: 'string', metadata: createMetadata() },
          }),
          metadata: createMetadata(),
        },
      },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.dependentSchemas).toEqual({
      creditCard: {
        type: 'object',
        properties: { billingAddress: { type: 'string' } },
      },
    });
  });

  it('preserves dependentRequired', () => {
    const schema: CastrSchema = {
      type: 'object',
      dependentRequired: {
        creditCard: ['billingAddress', 'securityCode'],
      },
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.dependentRequired).toEqual({
      creditCard: ['billingAddress', 'securityCode'],
    });
  });

  it('preserves minContains', () => {
    const schema: CastrSchema = {
      type: 'array',
      minContains: 2,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.minContains).toBe(2);
  });

  it('preserves maxContains', () => {
    const schema: CastrSchema = {
      type: 'array',
      maxContains: 5,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.maxContains).toBe(5);
  });

  it('preserves minContains and maxContains together', () => {
    const schema: CastrSchema = {
      type: 'array',
      minContains: 1,
      maxContains: 3,
      metadata: createMetadata(),
    };

    const result = writeOpenApiSchema(schema);

    expect(result.minContains).toBe(1);
    expect(result.maxContains).toBe(3);
  });
});
