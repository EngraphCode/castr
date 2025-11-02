import { describe, expect, it } from 'vitest';

import { capitalize } from './string-utils.js';

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
});
