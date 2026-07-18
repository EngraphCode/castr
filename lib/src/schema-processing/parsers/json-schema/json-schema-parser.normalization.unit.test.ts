/**
 * Unit tests for JSON Schema Draft 07 → 2020-12 normalization.
 *
 * TDD: These tests are written FIRST, before the implementation.
 */

import { isReferenceObject } from '../../../shared/openapi-types.js';
import { describe, it, expect } from 'vitest';

import { normalizeDraft07 } from './normalization/index.js';
import type { Draft07Input } from './normalization/index.js';
import type { JsonSchema2020 } from './json-schema-parser.core.js';

function draft07<T extends Draft07Input>(input: T): T {
  return input;
}

function isJsonSchemaObject(value: unknown): value is JsonSchema2020 {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !isReferenceObject(value)
  );
}

function getSchemaObject(value: unknown, context: string): JsonSchema2020 | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isJsonSchemaObject(value)) {
    throw new Error(`Expected schema object in ${context}`);
  }
  return value;
}

function getSchemaObjects(value: unknown, context: string): JsonSchema2020[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new Error(`Expected schema array in ${context}`);
  }
  return value.map((item, index) => {
    const schema = getSchemaObject(item, `${context}[${index}]`);
    if (!schema) {
      throw new Error(`Expected schema object in ${context}[${index}]`);
    }
    return schema;
  });
}

function getSchemaRef(value: unknown, context: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isReferenceObject(value)) {
    throw new Error(`Expected schema reference in ${context}`);
  }
  return value.$ref;
}

describe('normalizeDraft07', () => {
  describe('definitions → $defs', () => {
    it('converts top-level definitions to $defs', () => {
      const input = draft07({
        type: 'object',
        definitions: {
          Address: { type: 'object' },
        },
      });

      const result = normalizeDraft07(input);

      expect(result['$defs']).toEqual({ Address: { type: 'object' } });
      expect(result).not.toHaveProperty('definitions');
    });

    it('converts $ref paths from #/definitions/ to #/$defs/', () => {
      const input = draft07({
        type: 'object',
        properties: {
          address: { $ref: '#/definitions/Address' },
        },
        definitions: {
          Address: { type: 'object' },
        },
      });

      const result = normalizeDraft07(input);

      expect(getSchemaRef(result.properties?.['address'], 'properties.address')).toBe(
        '#/$defs/Address',
      );
    });

    it('preserves existing $defs (already 2020-12)', () => {
      const input = draft07({
        type: 'object',
        $defs: {
          Address: { type: 'object' },
        },
      });

      const result = normalizeDraft07(input);

      expect(result['$defs']).toEqual({ Address: { type: 'object' } });
    });
  });

  describe('dependencies → dependentRequired / dependentSchemas', () => {
    it('converts array dependencies to dependentRequired', () => {
      const input = draft07({
        type: 'object',
        dependencies: {
          email: ['emailVerified'],
        },
      });

      const result = normalizeDraft07(input);

      expect(result['dependentRequired']).toEqual({ email: ['emailVerified'] });
      expect(result).not.toHaveProperty('dependencies');
    });

    it('converts schema dependencies to dependentSchemas', () => {
      const input = draft07({
        type: 'object',
        dependencies: {
          creditCard: {
            type: 'object',
            properties: { billing: { type: 'string' } },
          },
        },
      });

      const result = normalizeDraft07(input);

      expect(result['dependentSchemas']).toEqual({
        creditCard: {
          type: 'object',
          properties: { billing: { type: 'string' } },
        },
      });
      expect(result).not.toHaveProperty('dependencies');
    });

    it('splits mixed dependencies correctly', () => {
      const input = draft07({
        type: 'object',
        dependencies: {
          email: ['emailVerified'],
          creditCard: { type: 'object' },
        },
      });

      const result = normalizeDraft07(input);

      expect(result['dependentRequired']).toEqual({ email: ['emailVerified'] });
      expect(result['dependentSchemas']).toEqual({ creditCard: { type: 'object' } });
      expect(result).not.toHaveProperty('dependencies');
    });
  });

  describe('tuple items → prefixItems', () => {
    it('converts array items to prefixItems', () => {
      const input = draft07({
        type: 'array',
        items: [{ type: 'string' }, { type: 'number' }],
      });

      const result = normalizeDraft07(input);

      expect(result['prefixItems']).toEqual([{ type: 'string' }, { type: 'number' }]);
      expect(result['items']).toBeUndefined();
    });

    it('preserves single-schema items', () => {
      const input = draft07({
        type: 'array',
        items: { type: 'string' },
      });

      const result = normalizeDraft07(input);

      expect(result['items']).toEqual({ type: 'string' });
      expect(result['prefixItems']).toBeUndefined();
    });
  });

  describe('boolean exclusiveMinimum/exclusiveMaximum → numeric', () => {
    it('converts boolean exclusiveMinimum with minimum to numeric', () => {
      const input = draft07({
        type: 'number',
        minimum: 10,
        exclusiveMinimum: true,
      });

      const result = normalizeDraft07(input);

      expect(result['exclusiveMinimum']).toBe(10);
      expect(result['minimum']).toBeUndefined();
    });

    it('converts boolean exclusiveMaximum with maximum to numeric', () => {
      const input = draft07({
        type: 'number',
        maximum: 100,
        exclusiveMaximum: true,
      });

      const result = normalizeDraft07(input);

      expect(result['exclusiveMaximum']).toBe(100);
      expect(result['maximum']).toBeUndefined();
    });

    it('keeps minimum when exclusiveMinimum is false', () => {
      const input = draft07({
        type: 'number',
        minimum: 10,
        exclusiveMinimum: false,
      });

      const result = normalizeDraft07(input);

      expect(result['minimum']).toBe(10);
      expect(result['exclusiveMinimum']).toBeUndefined();
    });

    it('keeps maximum when exclusiveMaximum is false', () => {
      const input = draft07({
        type: 'number',
        maximum: 100,
        exclusiveMaximum: false,
      });

      const result = normalizeDraft07(input);

      expect(result['maximum']).toBe(100);
      expect(result['exclusiveMaximum']).toBeUndefined();
    });

    it('preserves numeric exclusiveMinimum (already 2020-12)', () => {
      const input = draft07({
        type: 'number',
        exclusiveMinimum: 10,
      });

      const result = normalizeDraft07(input);

      expect(result['exclusiveMinimum']).toBe(10);
    });
  });

  describe('recursive normalization', () => {
    it('normalizes nested properties', () => {
      const input = draft07({
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            definitions: {
              Inner: { type: 'string' },
            },
          },
        },
      });

      const result = normalizeDraft07(input);

      const nested = getSchemaObject(result.properties?.['nested'], 'properties.nested');
      expect(nested).toBeDefined();
      expect(nested?.$defs).toEqual({ Inner: { type: 'string' } });
      expect(nested && 'definitions' in nested).toBe(false);
    });

    it('normalizes allOf/oneOf/anyOf members', () => {
      const member = draft07({
        type: 'number',
        minimum: 0,
        exclusiveMinimum: true,
      });
      const input = draft07({ allOf: [member] });

      const result = normalizeDraft07(input);

      const members = getSchemaObjects(result.allOf, 'allOf');
      const firstMember = members?.[0];
      expect(firstMember).toBeDefined();
      expect(firstMember?.exclusiveMinimum).toBe(0);
      expect(firstMember?.minimum).toBeUndefined();
    });
  });

  describe('passthrough for already-2020-12 schemas', () => {
    it('returns equivalent schema when no Draft 07 constructs present', () => {
      const input = draft07({
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
        },
        required: ['name'],
      });

      const result = normalizeDraft07(input);

      expect(result).toEqual(input);
    });
  });

  describe('does not mutate input', () => {
    it('returns a new object, not the original', () => {
      const input = draft07({
        type: 'object',
        definitions: { A: { type: 'string' } },
      });
      const originalInput: Draft07Input = JSON.parse(JSON.stringify(input));

      normalizeDraft07(input);

      expect(input).toEqual(originalInput);
    });
  });

  describe('$ref rewriting in nested schemas', () => {
    it('rewrites $ref inside $defs values', () => {
      const input = draft07({
        type: 'object',
        definitions: {
          Container: {
            type: 'object',
            properties: {
              child: { $ref: '#/definitions/Child' },
            },
          },
          Child: { type: 'string' },
        },
      });

      const result = normalizeDraft07(input);

      const container = getSchemaObject(result.$defs?.['Container'], '$defs.Container');
      expect(
        getSchemaRef(container?.properties?.['child'], '$defs.Container.properties.child'),
      ).toBe('#/$defs/Child');
    });

    it('rewrites $ref inside allOf members', () => {
      const member = draft07({
        type: 'object',
        properties: {
          ref: { $ref: '#/definitions/Shared' },
        },
      });
      const input = draft07({ allOf: [member] });

      const result = normalizeDraft07(input);

      const firstMember = getSchemaObjects(result.allOf, 'allOf')?.[0];
      expect(getSchemaRef(firstMember?.properties?.['ref'], 'allOf[0].properties.ref')).toBe(
        '#/$defs/Shared',
      );
    });

    it('rewrites $ref inside dependentSchemas', () => {
      const input = draft07({
        type: 'object',
        dependencies: {
          email: {
            type: 'object',
            properties: {
              verification: { $ref: '#/definitions/VerifyEmail' },
            },
          },
        },
      });

      const result = normalizeDraft07(input);

      const emailSchema = getSchemaObject(
        result.dependentSchemas?.['email'],
        'dependentSchemas.email',
      );
      expect(
        getSchemaRef(
          emailSchema?.properties?.['verification'],
          'dependentSchemas.email.properties.verification',
        ),
      ).toBe('#/$defs/VerifyEmail');
    });

    it('rewrites $ref inside additionalProperties schema', () => {
      const input = draft07({
        type: 'object',
        additionalProperties: { $ref: '#/definitions/Extra' },
      });

      const result = normalizeDraft07(input);

      expect(getSchemaRef(result.additionalProperties, 'additionalProperties')).toBe(
        '#/$defs/Extra',
      );
    });

    it('rewrites $ref inside not schema', () => {
      const input = draft07({
        not: { $ref: '#/definitions/Forbidden' },
      });

      const result = normalizeDraft07(input);

      expect(getSchemaRef(result.not, 'not')).toBe('#/$defs/Forbidden');
    });

    it('preserves non-definitions $ref paths unchanged', () => {
      const input = draft07({
        type: 'object',
        properties: {
          external: { $ref: 'https://example.com/schema.json' },
          local: { $ref: '#/$defs/AlreadyCorrect' },
        },
      });

      const result = normalizeDraft07(input);

      expect(getSchemaRef(result.properties?.['external'], 'properties.external')).toBe(
        'https://example.com/schema.json',
      );
      expect(getSchemaRef(result.properties?.['local'], 'properties.local')).toBe(
        '#/$defs/AlreadyCorrect',
      );
    });
  });

  describe('definitions + $defs coexistence', () => {
    it('merges definitions into existing $defs', () => {
      const input = draft07({
        type: 'object',
        $defs: {
          Existing: { type: 'string' },
        },
        definitions: {
          FromDraft07: { type: 'number' },
        },
      });

      const result = normalizeDraft07(input);

      expect(result.$defs?.['Existing']).toEqual({ type: 'string' });
      expect(result.$defs?.['FromDraft07']).toEqual({ type: 'number' });
      expect(result).not.toHaveProperty('definitions');
    });

    it('definitions override $defs on name collision', () => {
      const input = draft07({
        type: 'object',
        $defs: {
          Shared: { type: 'string' },
        },
        definitions: {
          Shared: { type: 'number' },
        },
      });

      const result = normalizeDraft07(input);

      expect(result.$defs?.['Shared']).toEqual({ type: 'number' });
    });
  });

  describe('boolean exclusive bounds edge cases', () => {
    it('ignores boolean exclusiveMinimum when no minimum is present', () => {
      const input = draft07({
        type: 'number',
        exclusiveMinimum: true,
      });

      const result = normalizeDraft07(input);

      // No minimum to promote — exclusive flag is inert
      expect(result.exclusiveMinimum).toBeUndefined();
      expect(result.minimum).toBeUndefined();
    });

    it('ignores boolean exclusiveMaximum when no maximum is present', () => {
      const input = draft07({
        type: 'number',
        exclusiveMaximum: true,
      });

      const result = normalizeDraft07(input);

      expect(result.exclusiveMaximum).toBeUndefined();
      expect(result.maximum).toBeUndefined();
    });

    it('preserves numeric exclusiveMaximum (already 2020-12)', () => {
      const input = draft07({
        type: 'number',
        exclusiveMaximum: 100,
      });

      const result = normalizeDraft07(input);

      expect(result.exclusiveMaximum).toBe(100);
    });
  });
});

describe('normalizeDraft07 — Draft 07 additionalItems → 2020-12 items', () => {
  it('maps additionalItems beside tuple items to 2020-12 items', () => {
    const input = draft07({
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }],
      additionalItems: { type: 'boolean' },
    });

    const result = normalizeDraft07(input);

    expect(result['prefixItems']).toEqual([{ type: 'string' }, { type: 'number' }]);
    expect(result['items']).toEqual({ type: 'boolean' });
    expect(result).not.toHaveProperty('additionalItems');
  });

  it('rewrites a definitions $ref inside additionalItems while mapping', () => {
    const input = draft07({
      type: 'array',
      items: [{ type: 'string' }],
      additionalItems: { $ref: '#/definitions/Tail' },
      definitions: { Tail: { type: 'number' } },
    });

    const result = normalizeDraft07(input);

    expect(getSchemaRef(result['items'], 'items')).toBe('#/$defs/Tail');
    expect(result).not.toHaveProperty('additionalItems');
  });

  it('normalizes Draft 07 constructs inside a mapped additionalItems schema', () => {
    const input = draft07({
      type: 'array',
      items: [{ type: 'string' }],
      additionalItems: { type: 'number', minimum: 0, exclusiveMinimum: true },
    });

    const result = normalizeDraft07(input);

    const items = getSchemaObject(result['items'], 'items');
    expect(items?.exclusiveMinimum).toBe(0);
    expect(items?.minimum).toBeUndefined();
  });

  it('drops additionalItems when items is a single schema (dead per Draft 07)', () => {
    const input = draft07({
      type: 'array',
      items: { type: 'string' },
      additionalItems: { type: 'number' },
    });

    const result = normalizeDraft07(input);

    expect(result['items']).toEqual({ type: 'string' });
    expect(result).not.toHaveProperty('additionalItems');
  });

  it('drops additionalItems when items is absent (dead per Draft 07)', () => {
    const input = draft07({
      type: 'array',
      additionalItems: { type: 'number' },
    });

    const result = normalizeDraft07(input);

    expect(result['items']).toBeUndefined();
    expect(result).not.toHaveProperty('additionalItems');
  });
});

describe('normalizeDraft07 — recursion into conditional and 2020-12 applicator keywords (H1)', () => {
  it('normalizes boolean exclusiveMinimum nested inside then', () => {
    const input = draft07({
      type: 'object',
      if: { properties: { kind: { const: 'bounded' } } },
      then: { type: 'number', minimum: 10, exclusiveMinimum: true },
    });

    const result = normalizeDraft07(input);

    const thenSchema = getSchemaObject(result.then, 'then');
    expect(thenSchema?.exclusiveMinimum).toBe(10);
    expect(thenSchema?.minimum).toBeUndefined();
  });

  it('normalizes boolean exclusiveMaximum nested inside else', () => {
    const input = draft07({
      type: 'object',
      if: { properties: { kind: { const: 'bounded' } } },
      else: { type: 'number', maximum: 99, exclusiveMaximum: true },
    });

    const result = normalizeDraft07(input);

    const elseSchema = getSchemaObject(result.else, 'else');
    expect(elseSchema?.exclusiveMaximum).toBe(99);
    expect(elseSchema?.maximum).toBeUndefined();
  });

  it('lifts definitions nested inside if', () => {
    const input = draft07({
      type: 'object',
      if: {
        type: 'object',
        definitions: { Inner: { type: 'string' } },
      },
      then: { type: 'object' },
    });

    const result = normalizeDraft07(input);

    const ifSchema = getSchemaObject(result.if, 'if');
    expect(ifSchema?.$defs).toEqual({ Inner: { type: 'string' } });
    expect(ifSchema !== undefined && 'definitions' in ifSchema).toBe(false);
  });

  it('normalizes patternProperties values', () => {
    const input = draft07({
      type: 'object',
      patternProperties: {
        '^x-': { type: 'number', minimum: 1, exclusiveMinimum: true },
      },
    });

    const result = normalizeDraft07(input);

    const patternSchema = getSchemaObject(
      result.patternProperties?.['^x-'],
      'patternProperties.^x-',
    );
    expect(patternSchema?.exclusiveMinimum).toBe(1);
    expect(patternSchema?.minimum).toBeUndefined();
  });

  it('normalizes propertyNames sub-schema', () => {
    const input = draft07({
      type: 'object',
      propertyNames: { type: 'string', definitions: { NamePattern: { type: 'string' } } },
    });

    const result = normalizeDraft07(input);

    const propertyNames = getSchemaObject(result.propertyNames, 'propertyNames');
    expect(propertyNames?.$defs).toEqual({ NamePattern: { type: 'string' } });
    expect(propertyNames !== undefined && 'definitions' in propertyNames).toBe(false);
  });

  it('normalizes contains sub-schema', () => {
    const input = draft07({
      type: 'array',
      contains: { type: 'number', minimum: 0, exclusiveMinimum: true },
    });

    const result = normalizeDraft07(input);

    const contains = getSchemaObject(result.contains, 'contains');
    expect(contains?.exclusiveMinimum).toBe(0);
    expect(contains?.minimum).toBeUndefined();
  });

  it('normalizes schema-valued unevaluatedProperties and unevaluatedItems', () => {
    const input = draft07({
      type: 'object',
      unevaluatedProperties: { type: 'number', minimum: 5, exclusiveMinimum: true },
      unevaluatedItems: { type: 'number', maximum: 9, exclusiveMaximum: true },
    });

    const result = normalizeDraft07(input);

    const unevaluatedProperties = getSchemaObject(
      result.unevaluatedProperties,
      'unevaluatedProperties',
    );
    expect(unevaluatedProperties?.exclusiveMinimum).toBe(5);
    expect(unevaluatedProperties?.minimum).toBeUndefined();
    const unevaluatedItems = getSchemaObject(result.unevaluatedItems, 'unevaluatedItems');
    expect(unevaluatedItems?.exclusiveMaximum).toBe(9);
    expect(unevaluatedItems?.maximum).toBeUndefined();
  });

  it('preserves boolean-valued conditional and unevaluated keywords', () => {
    const input = draft07({
      type: 'object',
      if: { type: 'object' },
      then: true,
      else: false,
      unevaluatedProperties: false,
    });

    const result = normalizeDraft07(input);

    expect(result.then).toBe(true);
    expect(result.else).toBe(false);
    expect(result.unevaluatedProperties).toBe(false);
  });

  it('rewrites $ref inside then at depth', () => {
    const input = draft07({
      type: 'object',
      if: { properties: { kind: { const: 'linked' } } },
      then: {
        type: 'object',
        properties: {
          link: { $ref: '#/definitions/Link' },
        },
      },
      definitions: { Link: { type: 'string' } },
    });

    const result = normalizeDraft07(input);

    const thenSchema = getSchemaObject(result.then, 'then');
    expect(getSchemaRef(thenSchema?.properties?.['link'], 'then.properties.link')).toBe(
      '#/$defs/Link',
    );
  });
});

describe('normalizeDraft07 — deep $ref rewriting (H1)', () => {
  it('rewrites deep $ref pointers below a definitions entry', () => {
    const input = draft07({
      type: 'object',
      properties: {
        inner: { $ref: '#/definitions/Outer/properties/inner' },
      },
      definitions: {
        Outer: {
          type: 'object',
          properties: { inner: { type: 'string' } },
        },
      },
    });

    const result = normalizeDraft07(input);

    expect(getSchemaRef(result.properties?.['inner'], 'properties.inner')).toBe(
      '#/$defs/Outer/properties/inner',
    );
  });

  it('leaves non-leading definitions segments unchanged', () => {
    const input = draft07({
      type: 'object',
      properties: {
        other: { $ref: '#/$defs/Outer/definitions/inner' },
      },
    });

    const result = normalizeDraft07(input);

    expect(getSchemaRef(result.properties?.['other'], 'properties.other')).toBe(
      '#/$defs/Outer/definitions/inner',
    );
  });
});

describe('boolean sub-schema honesty', () => {
  it('rejects boolean root input with guidance (the public parsers accept boolean roots)', () => {
    expect(() => normalizeDraft07(false)).toThrow(/parseJsonSchema/);
    expect(() => normalizeDraft07(true)).toThrow(/parseJsonSchema/);
  });

  it('preserves contentSchema: false as a boolean', () => {
    const input = draft07({
      type: 'string',
      contentMediaType: 'application/json',
      contentSchema: false,
    });

    const result = normalizeDraft07(input);

    expect(result.contentSchema).toBe(false);
  });

  it('preserves contentSchema: true as a boolean', () => {
    const input = draft07({
      type: 'string',
      contentMediaType: 'application/json',
      contentSchema: true,
    });

    const result = normalizeDraft07(input);

    expect(result.contentSchema).toBe(true);
  });

  it('preserves a boolean schema under properties (never silently inverted)', () => {
    const input = draft07({
      type: 'object',
      properties: { a: false },
      additionalProperties: false,
    });

    const result = normalizeDraft07(input);

    expect(result.properties?.['a']).toBe(false);
  });

  it('preserves a boolean schema under $defs (never silently inverted)', () => {
    const input = draft07({ $defs: { Nope: false } });

    const result = normalizeDraft07(input);

    expect(result.$defs?.['Nope']).toBe(false);
  });

  it('preserves a boolean schema in allOf (never silently inverted)', () => {
    const input = draft07({ allOf: [false] });

    const result = normalizeDraft07(input);

    expect(result.allOf).toEqual([false]);
  });

  it('preserves a boolean items schema (never silently inverted)', () => {
    const input = draft07({ type: 'array', items: false });

    const result = normalizeDraft07(input);

    expect(result.items).toBe(false);
  });

  it('preserves a boolean not schema (never silently inverted)', () => {
    const input = draft07({ not: false });

    const result = normalizeDraft07(input);

    expect(result.not).toBe(false);
  });

  it('maps a boolean additionalItems beside tuple items to 2020-12 items', () => {
    const input = draft07({
      type: 'array',
      items: [{ type: 'string' }],
      additionalItems: false,
    });

    const result = normalizeDraft07(input);

    expect(result.prefixItems).toEqual([{ type: 'string' }]);
    expect(result.items).toBe(false);
  });

  it('still preserves booleans at the boolean-capable keywords', () => {
    const input = draft07({
      type: 'object',
      properties: { a: { type: 'string' } },
      additionalProperties: false,
      if: false,
      unevaluatedProperties: false,
    });

    const result = normalizeDraft07(input);

    expect(result.if).toBe(false);
    expect(result.unevaluatedProperties).toBe(false);
  });
});
