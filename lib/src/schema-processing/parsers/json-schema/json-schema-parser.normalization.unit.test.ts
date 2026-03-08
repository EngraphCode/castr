/**
 * Unit tests for JSON Schema Draft 07 → 2020-12 normalization.
 *
 * TDD: These tests are written FIRST, before the implementation.
 *
 * @module parsers/json-schema/json-schema-parser.normalization.unit.test
 */

import { describe, it, expect } from 'vitest';

import { normalizeDraft07 } from './json-schema-parser.normalization.js';
import type { Draft07Input } from './json-schema-parser.normalization.js';
import type { JsonSchema2020 } from './json-schema-parser.core.js';

describe('normalizeDraft07', () => {
  describe('definitions → $defs', () => {
    it('converts top-level definitions to $defs', () => {
      const input = {
        type: 'object',
        definitions: {
          Address: { type: 'object' },
        },
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['$defs']).toEqual({ Address: { type: 'object' } });
      expect(result).not.toHaveProperty('definitions');
    });

    it('converts $ref paths from #/definitions/ to #/$defs/', () => {
      const input = {
        type: 'object',
        properties: {
          address: { $ref: '#/definitions/Address' },
        },
        definitions: {
          Address: { type: 'object' },
        },
      } as Draft07Input;

      const result = normalizeDraft07(input);

      const address = result.properties?.['address'] as JsonSchema2020 | undefined;
      expect(address?.$ref).toBe('#/$defs/Address');
    });

    it('preserves existing $defs (already 2020-12)', () => {
      const input = {
        type: 'object',
        $defs: {
          Address: { type: 'object' },
        },
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['$defs']).toEqual({ Address: { type: 'object' } });
    });
  });

  describe('dependencies → dependentRequired / dependentSchemas', () => {
    it('converts array dependencies to dependentRequired', () => {
      const input = {
        type: 'object',
        dependencies: {
          email: ['emailVerified'],
        },
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['dependentRequired']).toEqual({ email: ['emailVerified'] });
      expect(result).not.toHaveProperty('dependencies');
    });

    it('converts schema dependencies to dependentSchemas', () => {
      const input = {
        type: 'object',
        dependencies: {
          creditCard: {
            type: 'object',
            properties: { billing: { type: 'string' } },
          },
        },
      } as Draft07Input;

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
      const input = {
        type: 'object',
        dependencies: {
          email: ['emailVerified'],
          creditCard: { type: 'object' },
        },
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['dependentRequired']).toEqual({ email: ['emailVerified'] });
      expect(result['dependentSchemas']).toEqual({ creditCard: { type: 'object' } });
      expect(result).not.toHaveProperty('dependencies');
    });
  });

  describe('tuple items → prefixItems', () => {
    it('converts array items to prefixItems', () => {
      const input = {
        type: 'array',
        items: [{ type: 'string' }, { type: 'number' }],
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['prefixItems']).toEqual([{ type: 'string' }, { type: 'number' }]);
      expect(result['items']).toBeUndefined();
    });

    it('preserves single-schema items', () => {
      const input = {
        type: 'array',
        items: { type: 'string' },
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['items']).toEqual({ type: 'string' });
      expect(result['prefixItems']).toBeUndefined();
    });
  });

  describe('boolean exclusiveMinimum/exclusiveMaximum → numeric', () => {
    it('converts boolean exclusiveMinimum with minimum to numeric', () => {
      const input = {
        type: 'number',
        minimum: 10,
        exclusiveMinimum: true,
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['exclusiveMinimum']).toBe(10);
      expect(result['minimum']).toBeUndefined();
    });

    it('converts boolean exclusiveMaximum with maximum to numeric', () => {
      const input = {
        type: 'number',
        maximum: 100,
        exclusiveMaximum: true,
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['exclusiveMaximum']).toBe(100);
      expect(result['maximum']).toBeUndefined();
    });

    it('keeps minimum when exclusiveMinimum is false', () => {
      const input = {
        type: 'number',
        minimum: 10,
        exclusiveMinimum: false,
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['minimum']).toBe(10);
      expect(result['exclusiveMinimum']).toBeUndefined();
    });

    it('keeps maximum when exclusiveMaximum is false', () => {
      const input = {
        type: 'number',
        maximum: 100,
        exclusiveMaximum: false,
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['maximum']).toBe(100);
      expect(result['exclusiveMaximum']).toBeUndefined();
    });

    it('preserves numeric exclusiveMinimum (already 2020-12)', () => {
      const input = {
        type: 'number',
        exclusiveMinimum: 10,
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result['exclusiveMinimum']).toBe(10);
    });
  });

  describe('recursive normalization', () => {
    it('normalizes nested properties', () => {
      const input = {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            definitions: {
              Inner: { type: 'string' },
            },
          },
        },
      } as Draft07Input;

      const result = normalizeDraft07(input);

      const nested = result.properties?.['nested'] as JsonSchema2020 | undefined;
      expect(nested).toBeDefined();
      expect(nested?.$defs).toEqual({ Inner: { type: 'string' } });
      expect(nested?.['definitions' as keyof typeof nested]).toBeUndefined();
    });

    it('normalizes allOf/oneOf/anyOf members', () => {
      const member = {
        type: 'number',
        minimum: 0,
        exclusiveMinimum: true,
      } as Draft07Input;
      const input = { allOf: [member] } as Draft07Input;

      const result = normalizeDraft07(input);

      const members = result.allOf as JsonSchema2020[] | undefined;
      const firstMember = members?.[0];
      expect(firstMember).toBeDefined();
      expect(firstMember?.exclusiveMinimum).toBe(0);
      expect(firstMember?.minimum).toBeUndefined();
    });
  });

  describe('passthrough for already-2020-12 schemas', () => {
    it('returns equivalent schema when no Draft 07 constructs present', () => {
      const input = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
        },
        required: ['name'],
      } as Draft07Input;

      const result = normalizeDraft07(input);

      expect(result).toEqual(input);
    });
  });

  describe('does not mutate input', () => {
    it('returns a new object, not the original', () => {
      const input = {
        type: 'object',
        definitions: { A: { type: 'string' } },
      } as Draft07Input;
      const originalInput = JSON.parse(JSON.stringify(input)) as Draft07Input;

      normalizeDraft07(input);

      expect(input).toEqual(originalInput);
    });
  });
});
