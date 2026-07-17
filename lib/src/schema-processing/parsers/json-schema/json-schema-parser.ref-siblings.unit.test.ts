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
import { parseJsonSchemaDocument } from './index.js';

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
