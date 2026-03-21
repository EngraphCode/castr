/**
 * Unit tests for JSON Schema parser public API.
 *
 * Tests the composed pipeline: Draft 07 normalization → core parsing → IR.
 * Also tests document-level parsing (extracting $defs as components).
 *
 * @module parsers/json-schema/index.unit.test
 */

import { describe, it, expect } from 'vitest';

import { parseJsonSchema, parseJsonSchemaDocument } from './index.js';
import { CastrSchemaProperties } from '../../ir/index.js';

describe('parseJsonSchema', () => {
  it('normalizes Draft 07 and parses to IR in one call', () => {
    const result = parseJsonSchema({
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
      },
      definitions: {
        Tag: { type: 'string' },
      },
    });

    expect(result.type).toBe('object');
    expect(result.properties).toBeInstanceOf(CastrSchemaProperties);
    expect(result.properties?.get('name')?.type).toBe('string');
  });

  it('converts Draft 07 boolean exclusiveMinimum to numeric', () => {
    const result = parseJsonSchema({
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true,
    });

    expect(result.exclusiveMinimum).toBe(0);
    expect(result.minimum).toBeUndefined();
  });

  it('rewrites nested $ref from #/definitions/ to #/$defs/', () => {
    const result = parseJsonSchema({
      type: 'object',
      additionalProperties: false,
      properties: {
        address: { $ref: '#/definitions/Address' },
      },
      definitions: {
        Address: { type: 'object', additionalProperties: false },
      },
    });

    const address = result.properties?.get('address');
    expect(address?.$ref).toBe('#/$defs/Address');
  });

  it('passes through 2020-12 schemas unchanged', () => {
    const result = parseJsonSchema({
      type: 'string',
      minLength: 1,
      format: 'email',
    });

    expect(result.type).toBe('string');
    expect(result.minLength).toBe(1);
    expect(result.format).toBe('email');
  });

  it('rejects non-strict object schemas with additionalProperties: true', () => {
    expect(() =>
      parseJsonSchema({
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: true,
      }),
    ).toThrow(/additionalProperties: true.*rejected/);
  });

  it('sets additionalProperties: false when omitted on object schemas', () => {
    const result = parseJsonSchema({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    });

    expect(result.additionalProperties).toBe(false);
  });
});

describe('parseJsonSchemaDocument', () => {
  it('extracts $defs as components', () => {
    const components = parseJsonSchemaDocument({
      $defs: {
        Address: {
          type: 'object',
          additionalProperties: false,
          properties: {
            street: { type: 'string' },
          },
        },
        Tag: {
          type: 'string',
          minLength: 1,
        },
      },
    });

    expect(components).toHaveLength(2);

    const address = components.find((c) => c.name === 'Address');
    expect(address).toBeDefined();
    expect(address?.type).toBe('schema');
    expect(address?.schema.type).toBe('object');
    expect(address?.schema.properties).toBeInstanceOf(CastrSchemaProperties);

    const tag = components.find((c) => c.name === 'Tag');
    expect(tag).toBeDefined();
    expect(tag?.schema.type).toBe('string');
    expect(tag?.schema.minLength).toBe(1);
  });

  it('returns empty array when no $defs present', () => {
    const components = parseJsonSchemaDocument({
      type: 'object',
      additionalProperties: false,
    });

    expect(components).toEqual([]);
  });

  it('skips $ref entries in $defs', () => {
    const components = parseJsonSchemaDocument({
      $defs: {
        Address: { type: 'object', additionalProperties: false },
        AliasedAddress: { $ref: '#/$defs/Address' },
      },
    });

    expect(components).toHaveLength(1);
    expect(components[0]?.name).toBe('Address');
  });

  it('normalizes Draft 07 definitions before extracting', () => {
    const components = parseJsonSchemaDocument({
      definitions: {
        Email: { type: 'string', format: 'email' },
      },
    });

    expect(components).toHaveLength(1);
    expect(components[0]?.name).toBe('Email');
    expect(components[0]?.schema.type).toBe('string');
    expect(components[0]?.schema.format).toBe('email');
  });

  it('provides default metadata on each component', () => {
    const components = parseJsonSchemaDocument({
      $defs: {
        Simple: { type: 'string' },
      },
    });

    expect(components).toHaveLength(1);
    const comp = components[0];
    expect(comp?.metadata.required).toBe(false);
    expect(comp?.metadata.nullable).toBe(false);
  });

  it('copies schema description to component description', () => {
    const components = parseJsonSchemaDocument({
      $defs: {
        Described: { type: 'string', description: 'A described schema' },
      },
    });

    expect(components).toHaveLength(1);
    expect(components[0]?.description).toBe('A described schema');
  });

  it('rejects non-strict $defs object schemas', () => {
    expect(() =>
      parseJsonSchemaDocument({
        $defs: {
          LooseObject: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            additionalProperties: true,
          },
        },
      }),
    ).toThrow(/additionalProperties: true.*rejected/);
  });
});
