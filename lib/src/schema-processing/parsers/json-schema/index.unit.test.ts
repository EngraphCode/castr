/**
 * Unit tests for JSON Schema parser public API.
 *
 * Tests the composed pipeline: Draft 07 normalization → core parsing → IR.
 * Also tests document-level parsing (extracting $defs as components).
 *
 * @module parsers/json-schema/index.unit.test
 */

import { describe, it, expect } from 'vitest';

import {
  parseJsonSchema,
  parseJsonSchemaDocument,
  UnsupportedJsonSchemaKeywordError,
} from './index.js';
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

  it('returns empty array when only meta keywords present', () => {
    const components = parseJsonSchemaDocument({
      title: 'Empty Document',
      description: 'A document with no $defs',
    });

    expect(components).toEqual([]);
  });

  it('now parses documents with schema keywords as root components', () => {
    const components = parseJsonSchemaDocument({
      type: 'object',
      additionalProperties: false,
    });

    expect(components).toHaveLength(1);
    expect(components[0]?.name).toBe('Root');
    expect(components[0]?.schema.type).toBe('object');
  });

  it('still rejects truly unsupported keywords', () => {
    const unsupportedInput = {
      if: { type: 'string' },
      then: { minLength: 1 },
    };
    expect(() => parseJsonSchemaDocument(unsupportedInput)).toThrow(
      UnsupportedJsonSchemaKeywordError,
    );
  });

  it('allows title and description alongside $defs', () => {
    const components = parseJsonSchemaDocument({
      title: 'My Schema',
      description: 'A document',
      $defs: {
        Simple: { type: 'string' },
      },
    });

    expect(components).toHaveLength(1);
    expect(components[0]?.name).toBe('Simple');
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

  // ── Phase 1: Standalone document parsing ──────────────────────────

  describe('standalone document parsing (root schema)', () => {
    it('parses a standalone object schema as a root component', () => {
      const components = parseJsonSchemaDocument({
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
        },
      });

      expect(components).toHaveLength(1);
      expect(components[0]?.name).toBe('Root');
      expect(components[0]?.schema.type).toBe('object');
      expect(components[0]?.schema.properties).toBeInstanceOf(CastrSchemaProperties);
    });

    it('uses title as component name when present', () => {
      const components = parseJsonSchemaDocument({
        title: 'UserProfile',
        type: 'object',
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email' },
        },
      });

      expect(components).toHaveLength(1);
      expect(components[0]?.name).toBe('UserProfile');
    });

    it('uses $id as component name when title is absent', () => {
      const input = {
        $id: 'https://example.com/schemas/Status',
        enum: ['active', 'inactive'],
      };
      const components = parseJsonSchemaDocument(input);

      expect(components).toHaveLength(1);
      expect(components[0]?.name).toBe('https://example.com/schemas/Status');
    });

    it('parses mixed document: root schema + $defs', () => {
      const components = parseJsonSchemaDocument({
        title: 'Order',
        type: 'object',
        additionalProperties: false,
        properties: {
          item: { $ref: '#/$defs/Item' },
        },
        $defs: {
          Item: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
            },
          },
        },
      });

      expect(components).toHaveLength(2);
      expect(components[0]?.name).toBe('Order');
      expect(components[1]?.name).toBe('Item');
    });

    it('parses standalone composition schema', () => {
      const components = parseJsonSchemaDocument({
        oneOf: [{ type: 'string' }, { type: 'number' }],
      });

      expect(components).toHaveLength(1);
      expect(components[0]?.name).toBe('Root');
      expect(components[0]?.schema.oneOf).toHaveLength(2);
    });

    it('parses standalone string schema', () => {
      const components = parseJsonSchemaDocument({
        type: 'string',
        minLength: 1,
        format: 'email',
      });

      expect(components).toHaveLength(1);
      expect(components[0]?.name).toBe('Root');
      expect(components[0]?.schema.type).toBe('string');
      expect(components[0]?.schema.format).toBe('email');
    });

    it('parses standalone enum schema', () => {
      const components = parseJsonSchemaDocument({
        enum: ['active', 'inactive', 'pending'],
      });

      expect(components).toHaveLength(1);
      expect(components[0]?.schema.enum).toEqual(['active', 'inactive', 'pending']);
    });

    it('parses patternProperties with multiple patterns', () => {
      const components = parseJsonSchemaDocument({
        type: 'object',
        additionalProperties: false,
        patternProperties: {
          '^x-': { type: 'string' },
          '^i-': { type: 'integer' },
        },
      });

      expect(components).toHaveLength(1);
      const schema = components[0]?.schema;
      expect(schema?.patternProperties).toBeDefined();
      expect(Object.keys(schema?.patternProperties ?? {})).toHaveLength(2);
      expect(schema?.patternProperties?.['^x-']?.type).toBe('string');
      expect(schema?.patternProperties?.['^i-']?.type).toBe('integer');
    });

    it('parses patternProperties alongside regular properties', () => {
      const components = parseJsonSchemaDocument({
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
        },
        patternProperties: {
          '^meta_': { type: 'string' },
        },
      });

      expect(components).toHaveLength(1);
      const schema = components[0]?.schema;
      expect(schema?.properties?.get('name')?.type).toBe('string');
      expect(schema?.patternProperties?.['^meta_']?.type).toBe('string');
    });

    it('parses propertyNames with string constraints', () => {
      const components = parseJsonSchemaDocument({
        type: 'object',
        additionalProperties: false,
        propertyNames: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          pattern: '^[a-z]',
        },
      });

      expect(components).toHaveLength(1);
      const propNames = components[0]?.schema.propertyNames;
      expect(propNames).toBeDefined();
      expect(propNames?.type).toBe('string');
      expect(propNames?.minLength).toBe(2);
      expect(propNames?.maxLength).toBe(50);
      expect(propNames?.pattern).toBe('^[a-z]');
    });

    it('parses propertyNames as a $ref', () => {
      const components = parseJsonSchemaDocument({
        type: 'object',
        additionalProperties: false,
        propertyNames: { $ref: '#/$defs/NamePattern' },
        $defs: {
          NamePattern: { type: 'string', pattern: '^[a-z]' },
        },
      });

      expect(components).toHaveLength(2);
      const root = components[0];
      expect(root?.schema.propertyNames?.$ref).toBe('#/$defs/NamePattern');
    });
  });

  // ── Phase 3: Unsupported keyword rejection ────────────────────────

  describe('unsupported keyword rejection', () => {
    it('rejects if/then/else conditional applicators', () => {
      const input = {
        if: { type: 'string' },
        then: { minLength: 1 },
        else: { type: 'number' },
      };
      expect(() => parseJsonSchemaDocument(input)).toThrow(UnsupportedJsonSchemaKeywordError);
    });

    it('rejects $dynamicRef', () => {
      const input = {
        $dynamicRef: '#meta',
      };
      expect(() => parseJsonSchemaDocument(input)).toThrow(UnsupportedJsonSchemaKeywordError);
    });

    it('accepts patternProperties (now supported)', () => {
      const components = parseJsonSchemaDocument({
        type: 'object',
        additionalProperties: false,
        patternProperties: {
          '^S_': { type: 'string' },
        },
      });
      expect(components).toHaveLength(1);
      expect(components[0]?.schema.patternProperties).toBeDefined();
      expect(components[0]?.schema.patternProperties?.['^S_']?.type).toBe('string');
    });

    it('accepts propertyNames (now supported)', () => {
      const components = parseJsonSchemaDocument({
        type: 'object',
        additionalProperties: false,
        propertyNames: { type: 'string', minLength: 1 },
      });
      expect(components).toHaveLength(1);
      expect(components[0]?.schema.propertyNames).toBeDefined();
      expect(components[0]?.schema.propertyNames?.type).toBe('string');
      expect(components[0]?.schema.propertyNames?.minLength).toBe(1);
    });

    it('accepts contains (now supported)', () => {
      const components = parseJsonSchemaDocument({
        type: 'array',
        contains: { type: 'number' },
      });
      expect(components).toHaveLength(1);
      expect(components[0]?.schema.contains).toBeDefined();
      expect(components[0]?.schema.contains?.type).toBe('number');
    });

    it('includes unsupported keyword names in error message', () => {
      const input = {
        if: { type: 'string' },
        then: { minLength: 1 },
      };
      try {
        parseJsonSchemaDocument(input);
        expect.fail('Expected UnsupportedJsonSchemaKeywordError');
      } catch (error) {
        expect(error).toBeInstanceOf(UnsupportedJsonSchemaKeywordError);
        if (error instanceof UnsupportedJsonSchemaKeywordError) {
          expect(error.unsupportedKeywords).toContain('if');
          expect(error.unsupportedKeywords).toContain('then');
        }
      }
    });
  });
});
