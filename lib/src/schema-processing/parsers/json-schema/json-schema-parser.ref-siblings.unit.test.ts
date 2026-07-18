/**
 * Unit tests for JSON-Schema-side nested $ref sibling carrying (H4 follow-up).
 *
 * JSON Schema 2020-12 applies keywords that appear next to `$ref`, so
 * siblings (description, title, constraints, …) must be carried at EVERY
 * position a `$ref` can appear — not only at the document top level. These
 * tests pin the nested positions: properties, patternProperties,
 * propertyNames, contentSchema, items, prefixItems, composition members,
 * 2020-12 applicators, and `$defs` entries.
 */

import { describe, expect, it } from 'vitest';

import { parseJsonSchemaObject } from './json-schema-parser.core.js';
import { parseJsonSchema, parseJsonSchemaDocument } from './index.js';

describe('parseJsonSchemaObject — nested $ref sibling carrying (H4)', () => {
  it('carries $ref siblings under properties', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      properties: {
        home: { $ref: '#/$defs/Address', description: 'Home address', title: 'Home' },
      },
      additionalProperties: false,
    });

    const property = result.properties?.get('home');
    expect(property?.$ref).toBe('#/$defs/Address');
    expect(property?.description).toBe('Home address');
    expect(property?.title).toBe('Home');
  });

  it('carries $ref siblings under patternProperties', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      patternProperties: {
        '^x-': { $ref: '#/$defs/Extension', description: 'Vendor extension' },
      },
      additionalProperties: false,
    });

    const pattern = result.patternProperties?.['^x-'];
    expect(pattern?.$ref).toBe('#/$defs/Extension');
    expect(pattern?.description).toBe('Vendor extension');
  });

  it('carries $ref siblings under propertyNames', () => {
    const result = parseJsonSchemaObject({
      type: 'object',
      propertyNames: { $ref: '#/$defs/NamePattern', description: 'Key shape' },
      additionalProperties: false,
    });

    expect(result.propertyNames?.$ref).toBe('#/$defs/NamePattern');
    expect(result.propertyNames?.description).toBe('Key shape');
  });

  it('carries $ref siblings under contentSchema', () => {
    const result = parseJsonSchemaObject({
      type: 'string',
      contentMediaType: 'application/json',
      contentSchema: { $ref: '#/$defs/Payload', description: 'Decoded payload' },
    });

    expect(result.contentSchema?.$ref).toBe('#/$defs/Payload');
    expect(result.contentSchema?.description).toBe('Decoded payload');
  });

  it('carries $ref siblings under items', () => {
    const result = parseJsonSchemaObject({
      type: 'array',
      items: { $ref: '#/$defs/Item', description: 'One entry' },
    });

    const items = result.items;
    if (items === undefined || Array.isArray(items)) {
      throw new Error('Expected a single items schema');
    }
    expect(items.$ref).toBe('#/$defs/Item');
    expect(items.description).toBe('One entry');
  });

  it('carries $ref siblings under prefixItems', () => {
    const result = parseJsonSchemaObject({
      type: 'array',
      prefixItems: [{ $ref: '#/$defs/First', title: 'First slot' }],
    });

    expect(result.prefixItems?.[0]?.$ref).toBe('#/$defs/First');
    expect(result.prefixItems?.[0]?.title).toBe('First slot');
  });

  it('carries $ref siblings under allOf members', () => {
    const result = parseJsonSchemaObject({
      allOf: [{ $ref: '#/$defs/Base', description: 'Base shape' }],
    });

    expect(result.allOf?.[0]?.$ref).toBe('#/$defs/Base');
    expect(result.allOf?.[0]?.description).toBe('Base shape');
  });

  it('carries $ref siblings under not', () => {
    const result = parseJsonSchemaObject({
      not: { $ref: '#/$defs/Forbidden', description: 'Must not match' },
    });

    expect(result.not?.$ref).toBe('#/$defs/Forbidden');
    expect(result.not?.description).toBe('Must not match');
  });

  it('carries $ref siblings under contains', () => {
    const result = parseJsonSchemaObject({
      type: 'array',
      contains: { $ref: '#/$defs/Needle', description: 'At least one' },
    });

    expect(result.contains?.$ref).toBe('#/$defs/Needle');
    expect(result.contains?.description).toBe('At least one');
  });

  it('carries $ref siblings under then', () => {
    const result = parseJsonSchemaObject({
      if: { type: 'object' },
      then: { $ref: '#/$defs/Branch', description: 'Conditional shape' },
    });

    expect(result.then?.$ref).toBe('#/$defs/Branch');
    expect(result.then?.description).toBe('Conditional shape');
  });

  it('carries $ref siblings under dependentSchemas', () => {
    const result = parseJsonSchemaObject({
      dependentSchemas: {
        billing: { $ref: '#/$defs/Billing', description: 'Required with billing' },
      },
    });

    expect(result.dependentSchemas?.['billing']?.$ref).toBe('#/$defs/Billing');
    expect(result.dependentSchemas?.['billing']?.description).toBe('Required with billing');
  });

  it('keeps pure nested $ref nodes minimal (no sibling fields invented)', () => {
    const result = parseJsonSchemaObject({
      type: 'array',
      items: { $ref: '#/$defs/Item' },
    });

    expect(result.items).toBeDefined();
    if (result.items === undefined) {
      throw new Error('Expected items to be parsed');
    }
    expect(Object.keys(result.items).sort()).toEqual(['$ref', 'metadata']);
  });
});

describe('parseJsonSchemaDocument — $defs nested $ref sibling carrying (H4)', () => {
  it('carries $ref siblings nested inside a $defs entry', () => {
    const components = parseJsonSchemaDocument({
      $defs: {
        Wrapper: {
          type: 'object',
          properties: {
            inner: { $ref: '#/$defs/Inner', description: 'Wrapped inner' },
          },
          additionalProperties: false,
        },
        Inner: { type: 'string' },
      },
    });

    const wrapper = components.find((component) => component.name === 'Wrapper');
    expect(wrapper).toBeDefined();
    if (wrapper === undefined) {
      throw new Error('Expected Wrapper component');
    }
    const inner = wrapper.schema.properties?.get('inner');
    expect(inner?.$ref).toBe('#/$defs/Inner');
    expect(inner?.description).toBe('Wrapped inner');
  });

  it('carries siblings on a ref-valued $defs entry', () => {
    const components = parseJsonSchemaDocument({
      $defs: {
        Base: { type: 'string' },
        Alias: { $ref: '#/$defs/Base', description: 'Alias of Base' },
      },
    });

    const alias = components.find((component) => component.name === 'Alias');
    expect(alias).toBeDefined();
    if (alias === undefined) {
      throw new Error('Expected Alias component');
    }
    expect(alias.schema.$ref).toBe('#/$defs/Base');
    expect(alias.schema.description).toBe('Alias of Base');
  });
});

describe('Draft 07 dialect guard — $ref siblings are non-applicative in Draft 07', () => {
  const DRAFT_07 = 'http://json-schema.org/draft-07/schema#';

  it('rejects a declared Draft 07 document with root-level $ref siblings', () => {
    expect(() =>
      parseJsonSchema({
        $schema: DRAFT_07,
        $ref: '#/definitions/Base',
        minLength: 5,
        definitions: { Base: { type: 'string' } },
      }),
    ).toThrow(/Draft 07/);
  });

  it('rejects a declared Draft 07 document with nested $ref siblings', () => {
    expect(() =>
      parseJsonSchemaDocument({
        $schema: DRAFT_07,
        type: 'object',
        properties: {
          name: { $ref: '#/definitions/Base', description: 'carried?' },
        },
        additionalProperties: false,
        definitions: { Base: { type: 'string' } },
      }),
    ).toThrow(/Draft 07/);
  });

  it('accepts a declared Draft 07 document whose references are pure', () => {
    const result = parseJsonSchemaDocument({
      $schema: DRAFT_07,
      type: 'object',
      properties: {
        name: { $ref: '#/definitions/Base' },
      },
      additionalProperties: false,
      definitions: { Base: { type: 'string' } },
    });

    expect(result.length).toBeGreaterThan(0);
  });

  it('accepts a declared Draft 07 document whose default value merely contains a $ref-shaped object', () => {
    const result = parseJsonSchemaDocument({
      $schema: DRAFT_07,
      type: 'object',
      properties: {
        link: { type: 'object' },
      },
      additionalProperties: false,
      default: { $ref: '#/definitions/Base', description: 'instance data, not a schema' },
      definitions: { Base: { type: 'string' } },
    });

    expect(result.length).toBeGreaterThan(0);
  });

  it('accepts $ref-shaped instance data under const, enum, and examples', () => {
    const constValue = { $ref: '#/x', title: 'just data' };

    const result = parseJsonSchema({
      $schema: DRAFT_07,
      type: 'object',
      const: constValue,
      enum: [constValue],
      examples: [{ $ref: '#/x', description: 'sample instance' }],
    });

    expect(result.const).toEqual(constValue);
  });

  it('accepts a declared Draft 07 document whose nested property default contains a $ref-shaped object', () => {
    const result = parseJsonSchemaDocument({
      $schema: DRAFT_07,
      type: 'object',
      properties: {
        link: {
          type: 'object',
          default: { $ref: '#/definitions/Base', description: 'instance data' },
        },
      },
      additionalProperties: false,
      definitions: { Base: { type: 'string' } },
    });

    expect(result.length).toBeGreaterThan(0);
  });

  it('rejects a declared Draft 07 document with $ref siblings under items', () => {
    expect(() =>
      parseJsonSchemaDocument({
        $schema: DRAFT_07,
        type: 'array',
        items: { $ref: '#/definitions/Base', minLength: 5 },
        definitions: { Base: { type: 'string' } },
      }),
    ).toThrow(/Draft 07/);
  });

  it('rejects a declared Draft 07 document with $ref siblings under then', () => {
    expect(() =>
      parseJsonSchemaDocument({
        $schema: DRAFT_07,
        type: 'object',
        if: { type: 'object' },
        then: { $ref: '#/definitions/Base', description: 'carried?' },
        definitions: { Base: { type: 'string' } },
      }),
    ).toThrow(/Draft 07/);
  });

  it('rejects a declared Draft 07 document with $ref siblings inside a definitions entry', () => {
    expect(() =>
      parseJsonSchemaDocument({
        $schema: DRAFT_07,
        type: 'object',
        properties: {
          name: { $ref: '#/definitions/Alias' },
        },
        additionalProperties: false,
        definitions: {
          Base: { type: 'string' },
          Alias: { $ref: '#/definitions/Base', minLength: 5 },
        },
      }),
    ).toThrow(/Draft 07/);
  });

  it('carries $ref siblings for declared 2020-12 documents', () => {
    const result = parseJsonSchema({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $ref: '#/$defs/Base',
      minLength: 5,
      $defs: { Base: { type: 'string' } },
    });

    expect(result.$ref).toBe('#/$defs/Base');
    expect(result.minLength).toBe(5);
  });

  it('carries $ref siblings for undeclared documents (2020-12 is the canonical ingress dialect)', () => {
    const result = parseJsonSchema({
      $ref: '#/$defs/Base',
      minLength: 5,
      $defs: { Base: { type: 'string' } },
    });

    expect(result.$ref).toBe('#/$defs/Base');
    expect(result.minLength).toBe(5);
  });
});

describe('reference summary carrying', () => {
  it('carries the OAS reference summary on a $defs entry into the IR', () => {
    const components = parseJsonSchemaDocument({
      $defs: {
        Base: { type: 'string' },
        Alias: { $ref: '#/$defs/Base', summary: 'Short alias summary' },
      },
    });

    const alias = components.find((component) => component.name === 'Alias');
    expect(alias?.schema.$ref).toBe('#/$defs/Base');
    expect(alias?.schema.summary).toBe('Short alias summary');
  });
});

describe('boolean root schemas', () => {
  it('parses a boolean root schema into a booleanSchema IR node', () => {
    expect(parseJsonSchema(false).booleanSchema).toBe(false);
    expect(parseJsonSchema(true).booleanSchema).toBe(true);
  });

  it('parses a boolean document into a single Root booleanSchema component', () => {
    const components = parseJsonSchemaDocument(false);

    expect(components).toHaveLength(1);
    expect(components[0]?.name).toBe('Root');
    expect(components[0]?.schema.booleanSchema).toBe(false);
  });
});
