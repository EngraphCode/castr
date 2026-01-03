import { describe, expect, it } from 'vitest';

import { capitalize, sanitizeIdentifier } from './string-utils.js';

describe('string-utils', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter of a lowercase string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should preserve remaining characters (not lowercase them)', () => {
      expect(capitalize('WORLD')).toBe('WORLD');
      expect(capitalize('hELLO')).toBe('HELLO');
      expect(capitalize('mediaObjects')).toBe('MediaObjects');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('Z')).toBe('Z');
    });

    it('should handle strings with numbers', () => {
      expect(capitalize('test123')).toBe('Test123');
    });

    it('should work with camelCase input', () => {
      // This is the critical use case for pathToVariableName
      expect(capitalize('mediaObjects')).toBe('MediaObjects');
      expect(capitalize('userProfiles')).toBe('UserProfiles');
    });
  });

  describe('sanitizeIdentifier', () => {
    it('should sanitize reserved words', () => {
      expect(sanitizeIdentifier('class')).toBe('class_');
      expect(sanitizeIdentifier('return')).toBe('return_');
    });

    it('should sanitize identifiers with hyphens', () => {
      expect(sanitizeIdentifier('perform-search_Body')).toBe('perform_search_Body');
      expect(sanitizeIdentifier('my-variable')).toBe('my_variable');
    });

    it('should sanitize identifiers with spaces', () => {
      expect(sanitizeIdentifier('my variable')).toBe('my_variable');
    });

    it('should sanitize identifiers starting with numbers', () => {
      expect(sanitizeIdentifier('123test')).toBe('_123test');
    });

    it('should preserve valid identifiers', () => {
      expect(sanitizeIdentifier('validIdentifier')).toBe('validIdentifier');
      expect(sanitizeIdentifier('Valid_Identifier')).toBe('Valid_Identifier');
    });
  });
});
