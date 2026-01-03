/**
 * Tests for centralized $ref resolution utilities.
 * Validates both standard OpenAPI refs and Scalar's x-ext vendor extension format.
 */

import { describe, it, expect } from 'vitest';
import { parseComponentRef, getSchemaNameFromRef } from './ref-resolution.js';
import type { ParsedRef } from './ref-resolution.js';

describe('parseComponentRef', () => {
  describe('standard refs', () => {
    it('parses standard schema ref', () => {
      const ref = '#/components/schemas/Pet';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'schemas',
        componentName: 'Pet',
        isExternal: false,
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });

    it('parses standard parameter ref', () => {
      const ref = '#/components/parameters/UserId';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'parameters',
        componentName: 'UserId',
        isExternal: false,
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });

    it('parses standard response ref', () => {
      const ref = '#/components/responses/NotFound';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'responses',
        componentName: 'NotFound',
        isExternal: false,
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });

    it('parses standard requestBody ref', () => {
      const ref = '#/components/requestBodies/UserBody';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'requestBodies',
        componentName: 'UserBody',
        isExternal: false,
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });

    it('parses schema with nested path separators', () => {
      const ref =
        '#/components/schemas/paths·~1users·~1{id}·get·responses·200·content·application~1json·schema';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'schemas',
        componentName: 'paths·~1users·~1{id}·get·responses·200·content·application~1json·schema',
        isExternal: false,
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });
  });

  describe('x-ext refs (Scalar vendor extension)', () => {
    it('parses x-ext schema ref', () => {
      const ref = '#/x-ext/425563c/components/schemas/Pet';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'schemas',
        componentName: 'Pet',
        isExternal: true,
        xExtKey: '425563c',
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });

    it('parses x-ext parameter ref', () => {
      const ref = '#/x-ext/abc123/components/parameters/UserId';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'parameters',
        componentName: 'UserId',
        isExternal: true,
        xExtKey: 'abc123',
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });

    it('parses x-ext response ref', () => {
      const ref = '#/x-ext/def456/components/responses/Success';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'responses',
        componentName: 'Success',
        isExternal: true,
        xExtKey: 'def456',
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });

    it('parses x-ext requestBody ref', () => {
      const ref = '#/x-ext/xyz789/components/requestBodies/CreateUser';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'requestBodies',
        componentName: 'CreateUser',
        isExternal: true,
        xExtKey: 'xyz789',
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });

    it('parses x-ext schema with nested path separators', () => {
      const ref =
        '#/x-ext/425563c/components/schemas/paths·~1users·~1{id}·get·responses·200·content·application~1json·schema';
      const result = parseComponentRef(ref);

      const expected: ParsedRef = {
        componentType: 'schemas',
        componentName: 'paths·~1users·~1{id}·get·responses·200·content·application~1json·schema',
        isExternal: true,
        xExtKey: '425563c',
        originalRef: ref,
      };
      expect(result).toEqual(expected);
    });
  });

  describe('backward compatibility', () => {
    it('treats bare names as schema refs', () => {
      const result = parseComponentRef('Pet');
      expect(result).toEqual({
        componentType: 'schemas',
        componentName: 'Pet',
        isExternal: false,
        originalRef: 'Pet',
      });
    });

    it('treats bare names with special characters as schema refs', () => {
      const result = parseComponentRef('UserWithFriends');
      expect(result).toEqual({
        componentType: 'schemas',
        componentName: 'UserWithFriends',
        isExternal: false,
        originalRef: 'UserWithFriends',
      });
    });
  });

  describe('error cases', () => {
    it('throws on ref missing components prefix', () => {
      expect(() => parseComponentRef('#/schemas/Pet')).toThrow(
        'Invalid component $ref: #/schemas/Pet',
      );
    });

    it('throws on ref missing component type', () => {
      expect(() => parseComponentRef('#/components/')).toThrow(
        'Invalid component $ref: #/components/',
      );
    });

    it('throws on ref missing component name', () => {
      expect(() => parseComponentRef('#/components/schemas/')).toThrow(
        'Invalid component $ref: #/components/schemas/',
      );
    });

    it('throws on x-ext ref with missing hash', () => {
      expect(() => parseComponentRef('#/x-ext//components/schemas/Pet')).toThrow(
        'Invalid component $ref: #/x-ext//components/schemas/Pet',
      );
    });

    it('throws on x-ext ref with missing component type', () => {
      expect(() => parseComponentRef('#/x-ext/abc123/components/')).toThrow(
        'Invalid component $ref: #/x-ext/abc123/components/',
      );
    });

    it('throws on malformed x-ext ref', () => {
      expect(() => parseComponentRef('#/x-ext/abc123/Pet')).toThrow(
        'Invalid component $ref: #/x-ext/abc123/Pet',
      );
    });

    it('includes expected format in error message', () => {
      expect(() => parseComponentRef('#malformed')).toThrow(
        'Expected format: #/components/{type}/{name} or #/x-ext/{hash}/components/{type}/{name}',
      );
    });
  });
});

describe('getSchemaNameFromRef', () => {
  it('extracts name from standard schema ref', () => {
    const ref = '#/components/schemas/Pet';
    expect(getSchemaNameFromRef(ref)).toBe('Pet');
  });

  it('extracts name from x-ext schema ref', () => {
    const ref = '#/x-ext/425563c/components/schemas/Pet';
    expect(getSchemaNameFromRef(ref)).toBe('Pet');
  });

  it('extracts name from standard parameter ref', () => {
    const ref = '#/components/parameters/UserId';
    expect(getSchemaNameFromRef(ref)).toBe('UserId');
  });

  it('extracts name from x-ext parameter ref', () => {
    const ref = '#/x-ext/abc123/components/parameters/UserId';
    expect(getSchemaNameFromRef(ref)).toBe('UserId');
  });

  it('extracts complex name with path separators', () => {
    const ref =
      '#/components/schemas/paths·~1users·~1{id}·get·responses·200·content·application~1json·schema';
    expect(getSchemaNameFromRef(ref)).toBe(
      'paths·~1users·~1{id}·get·responses·200·content·application~1json·schema',
    );
  });

  it('handles bare schema names (backward compatibility)', () => {
    expect(getSchemaNameFromRef('Pet')).toBe('Pet');
  });

  it('throws on malformed ref format', () => {
    expect(() => getSchemaNameFromRef('#malformed')).toThrow('Invalid component $ref');
  });
});
