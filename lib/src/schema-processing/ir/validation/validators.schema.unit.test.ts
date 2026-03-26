/**
 * Tests for isCastrSchema and isCastrSchemaNode type predicates.
 *
 * Split from validators.unit.test.ts to respect file-size and
 * function-length lint limits.
 */

import { describe, expect, it } from 'vitest';
import type { CastrSchema, CastrSchemaNode } from '../models/schema.js';
import { CastrSchemaProperties } from '../models/schema.js';
import { isCastrSchema, isCastrSchemaNode } from './validators.js';

describe('isCastrSchema', () => {
  it('should return true for primitive schema', () => {
    const schema: CastrSchema = {
      type: 'string',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for object schema', () => {
    const schema: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        name: {
          type: 'string',
          metadata: {
            required: true,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      }),
      required: ['name'],
      additionalProperties: false,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return false for object schema with schema-valued additionalProperties (catchall)', () => {
    const schema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        name: {
          type: 'string',
          metadata: {
            required: true,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      }),
      required: ['name'],
      additionalProperties: {
        type: 'string',
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(false);
  });

  it('should return true for array schema', () => {
    const schema: CastrSchema = {
      type: 'array',
      items: {
        type: 'string',
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for composition schema (allOf)', () => {
    const schema: CastrSchema = {
      allOf: [
        {
          type: 'object',
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      ],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for reference schema', () => {
    const schema: CastrSchema = {
      $ref: '#/components/schemas/User',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: ['#/components/schemas/User'], referencedBy: [], depth: 1 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for UUID subtype semantics on UUID string schemas', () => {
    const schema: CastrSchema = {
      type: 'string',
      format: 'uuid',
      uuidVersion: 4,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for int64 semantics on integer schemas', () => {
    const schema: CastrSchema = {
      type: 'integer',
      format: 'int64',
      integerSemantics: 'int64',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return false when int64 semantics does not carry format int64', () => {
    const schema = {
      type: 'integer',
      format: 'int32',
      integerSemantics: 'int64',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(false);
  });

  it('should return false when bigint semantics carries a conflicting integer format', () => {
    const schema = {
      type: 'integer',
      format: 'int64',
      integerSemantics: 'bigint',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(false);
  });
});

describe('isCastrSchema rejection', () => {
  it('should return false for null and undefined', () => {
    expect(isCastrSchema(null)).toBe(false);
    expect(isCastrSchema(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isCastrSchema('string')).toBe(false);
    expect(isCastrSchema(123)).toBe(false);
    expect(isCastrSchema([])).toBe(false);
  });

  it('should return false for object missing metadata field', () => {
    const schemaWithoutMetadata = {
      type: 'string',
    };

    expect(isCastrSchema(schemaWithoutMetadata)).toBe(false);
  });

  it('should return false when metadata is a plain record rather than a valid CastrSchemaNode', () => {
    const schemaWithPlainMetadata = {
      type: 'string',
      metadata: { foo: 'bar' },
    };

    expect(isCastrSchema(schemaWithPlainMetadata)).toBe(false);
  });

  it('should return false for primitive schemas polluted with additionalProperties', () => {
    const pollutedPrimitive = {
      type: 'integer',
      additionalProperties: false,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(pollutedPrimitive)).toBe(false);
  });

  it('should return false when type is an invalid string', () => {
    const invalidTypeSchema = {
      type: 'wat',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidTypeSchema)).toBe(false);
  });

  it('should return false when type is an array containing an invalid string', () => {
    const invalidTypeArraySchema = {
      type: ['string', 'wat'],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidTypeArraySchema)).toBe(false);
  });

  it('should return false when type is a non-string non-array value', () => {
    const numericTypeSchema = {
      type: 42,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(numericTypeSchema)).toBe(false);
  });

  it.each(['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'] as const)(
    'should return true for valid single type %s',
    (schemaType) => {
      const schema = {
        type: schemaType,
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      };

      expect(isCastrSchema(schema)).toBe(true);
    },
  );

  it('should return true for valid type array (e.g. nullable type)', () => {
    const nullableStringSchema = {
      type: ['string', 'null'],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(nullableStringSchema)).toBe(true);
  });

  it('should return false when items is present on a non-array schema', () => {
    const stringWithItems = {
      type: 'string',
      items: {
        type: 'number',
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(stringWithItems)).toBe(false);
  });

  it('should return false when items is not a valid CastrSchema', () => {
    const arrayWithInvalidItems = {
      type: 'array',
      items: { bogus: true },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(arrayWithInvalidItems)).toBe(false);
  });

  it('should return false when required is present on a non-object schema', () => {
    const stringWithRequired = {
      type: 'string',
      required: ['name'],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(stringWithRequired)).toBe(false);
  });

  it('should return false when required contains non-string values', () => {
    const objectWithBadRequired = {
      type: 'object',
      required: [42],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(objectWithBadRequired)).toBe(false);
  });

  it('should return true for object with valid required array', () => {
    const objectWithRequired: CastrSchema = {
      type: 'object',
      required: ['name', 'id'],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(objectWithRequired)).toBe(true);
  });

  it('should return false when allOf contains non-CastrSchema entries', () => {
    const invalidAllOf = {
      allOf: [{ bogus: true }],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidAllOf)).toBe(false);
  });

  it('should return false when oneOf contains non-CastrSchema entries', () => {
    const invalidOneOf = {
      oneOf: ['not-a-schema'],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidOneOf)).toBe(false);
  });

  it('should return false when anyOf contains non-CastrSchema entries', () => {
    const invalidAnyOf = {
      anyOf: [null],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidAnyOf)).toBe(false);
  });

  it('should return false when not is not a valid CastrSchema', () => {
    const invalidNot = {
      not: { bogus: true },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidNot)).toBe(false);
  });

  it('should return true for schema-valued unevaluatedProperties when the value is a valid CastrSchema', () => {
    const schemaValuedUnevaluated: CastrSchema = {
      type: 'object',
      unevaluatedProperties: {
        type: 'string',
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schemaValuedUnevaluated)).toBe(true);
  });

  it('should return false for schema-valued unevaluatedProperties when the value is not a valid CastrSchema', () => {
    const invalidUnevaluated = {
      type: 'object',
      unevaluatedProperties: { bogus: true },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidUnevaluated)).toBe(false);
  });

  it('should return true for boolean unevaluatedProperties on object schemas', () => {
    const booleanUnevaluated: CastrSchema = {
      type: 'object',
      unevaluatedProperties: false,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(booleanUnevaluated)).toBe(true);
  });
  it('should return true for object schema with valid patternProperties', () => {
    const schema: CastrSchema = {
      type: 'object',
      patternProperties: {
        '^x-': {
          type: 'string',
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      },
      additionalProperties: false,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return false when patternProperties is present on a non-object schema', () => {
    const invalidSchema = {
      type: 'string',
      patternProperties: {
        '^x-': {
          type: 'string',
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidSchema)).toBe(false);
  });

  it('should return false when patternProperties contains non-CastrSchema values', () => {
    const invalidSchema = {
      type: 'object',
      patternProperties: { '^x-': { bogus: true } },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidSchema)).toBe(false);
  });

  it('should return true for object schema with valid propertyNames', () => {
    const schema: CastrSchema = {
      type: 'object',
      propertyNames: {
        type: 'string',
        minLength: 2,
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      additionalProperties: false,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return false when propertyNames is present on a non-object schema', () => {
    const invalidSchema = {
      type: 'array',
      propertyNames: {
        type: 'string',
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidSchema)).toBe(false);
  });

  it('should return false when propertyNames is not a valid CastrSchema', () => {
    const invalidSchema = {
      type: 'object',
      propertyNames: { bogus: true },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(invalidSchema)).toBe(false);
  });
});

describe('isCastrSchemaNode', () => {
  it('should return true for valid schema node', () => {
    const node: CastrSchemaNode = {
      required: true,
      nullable: false,
      zodChain: {
        presence: '.optional()',
        validations: ['.min(1)'],
        defaults: [],
      },
      dependencyGraph: {
        references: [],
        referencedBy: [],
        depth: 0,
      },
      circularReferences: [],
    };

    expect(isCastrSchemaNode(node)).toBe(true);
  });

  it('should return true for schema node with all optional fields', () => {
    const node: CastrSchemaNode = {
      required: false,
      nullable: true,
      description: 'User ID',
      default: 'unknown',
      zodChain: {
        presence: '.optional().nullable()',
        validations: ['.uuid()'],
        defaults: ['.default("unknown")'],
      },
      dependencyGraph: {
        references: ['#/components/schemas/Address'],
        referencedBy: ['#/components/schemas/User'],
        depth: 1,
      },
      inheritance: {
        parent: '#/components/schemas/Base',
        compositionType: 'allOf',
        siblings: ['#/components/schemas/Base', '#/components/schemas/Mixin'],
      },
      circularReferences: ['#/components/schemas/Node'],
    };

    expect(isCastrSchemaNode(node)).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isCastrSchemaNode(null)).toBe(false);
    expect(isCastrSchemaNode(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isCastrSchemaNode('string')).toBe(false);
    expect(isCastrSchemaNode(123)).toBe(false);
    expect(isCastrSchemaNode([])).toBe(false);
  });

  it('should return false for object missing required fields', () => {
    expect(isCastrSchemaNode({})).toBe(false);
    expect(isCastrSchemaNode({ required: true })).toBe(false);
    expect(isCastrSchemaNode({ required: true, nullable: false })).toBe(false);
  });

  it('should return false for object with wrong field types', () => {
    const invalidNode = {
      required: 'yes', // Should be boolean
      nullable: false,
      zodChain: {},
      dependencyGraph: {},
      circularReferences: [],
    };

    expect(isCastrSchemaNode(invalidNode)).toBe(false);
  });
});
