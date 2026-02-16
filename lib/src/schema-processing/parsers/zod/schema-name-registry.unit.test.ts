import { describe, expect, it } from 'vitest';
import { deriveComponentName } from './schema-name-registry.js';

describe('schema-name-registry', () => {
  describe('deriveComponentName', () => {
    it('strips Schema suffix for PascalCase declarations', () => {
      expect(deriveComponentName('UserSchema')).toBe('User');
    });

    it('strips schema suffix for lower camel declarations', () => {
      expect(deriveComponentName('userSchema')).toBe('user');
    });

    it('keeps full name when no known suffix is present', () => {
      expect(deriveComponentName('InventoryItem')).toBe('InventoryItem');
    });

    it('does not strip when name exactly equals a suffix token', () => {
      expect(deriveComponentName('Schema')).toBe('Schema');
      expect(deriveComponentName('schema')).toBe('schema');
    });
  });
});
