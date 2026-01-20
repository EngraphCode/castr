/**
 * Validation Parity Integration Tests
 *
 * PROVES that generated Zod schemas validate data correctly according to IR
 * constraints. This is the ultimate test of Zod output correctness.
 *
 * The IR is the source of truth. We test that:
 * 1. Valid data (per IR constraints) passes Zod validation
 * 2. Invalid data (per IR constraints) throws on Zod validation
 *
 * Uses `.parse()` (throws on failure) rather than `.safeParse()` to align with
 * our strict, fail-fast principle. If data is valid, parse succeeds. If data
 * is invalid, parse throws—and we expect that.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

// Import generated Zod schemas from fixtures
// Vitest/Vite handles TypeScript imports directly
import {
  Pet as PetSchema,
  Error as ErrorSchema,
  Pets as PetsSchema,
} from '../__fixtures__/normalized/petstore-3.0/zod.js';

// ============================================================================
// Pet Schema Tests (IR: object with required: ["id", "name"], optional: "tag")
// ============================================================================

describe('Pet Schema Validation', () => {
  describe('valid data passes', () => {
    it('accepts object with all required fields', () => {
      const validPet = { id: 1, name: 'Fido' };

      // parse() throws on failure—no throw means success
      expect(() => PetSchema.parse(validPet)).not.toThrow();
    });

    it('accepts object with required and optional fields', () => {
      const validPet = { id: 1, name: 'Fido', tag: 'dog' };

      expect(() => PetSchema.parse(validPet)).not.toThrow();
    });

    it('accepts integer id values', () => {
      const validPet = { id: 42, name: 'Buddy' };

      expect(() => PetSchema.parse(validPet)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for object missing required field: id', () => {
      const invalidPet = { name: 'Fido' };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object missing required field: name', () => {
      const invalidPet = { id: 1 };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object with wrong type for id (string instead of integer)', () => {
      const invalidPet = { id: '1', name: 'Fido' };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object with wrong type for name (number instead of string)', () => {
      const invalidPet = { id: 1, name: 123 };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object with non-integer id (float)', () => {
      const invalidPet = { id: 1.5, name: 'Fido' };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object with wrong type for optional tag (number instead of string)', () => {
      const invalidPet = { id: 1, name: 'Fido', tag: 123 };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object with extra properties (strict mode)', () => {
      const invalidPet = { id: 1, name: 'Fido', extra: 'field' };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });
  });
});

// ============================================================================
// Error Schema Tests (IR: object with required: ["code", "message"])
// ============================================================================

describe('Error Schema Validation', () => {
  describe('valid data passes', () => {
    it('accepts object with all required fields', () => {
      const validError = { code: 404, message: 'Not found' };

      expect(() => ErrorSchema.parse(validError)).not.toThrow();
    });

    it('accepts integer code values', () => {
      const validError = { code: 500, message: 'Internal server error' };

      expect(() => ErrorSchema.parse(validError)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for object missing required field: code', () => {
      const invalidError = { message: 'error' };

      expect(() => ErrorSchema.parse(invalidError)).toThrow();
    });

    it('throws for object missing required field: message', () => {
      const invalidError = { code: 1 };

      expect(() => ErrorSchema.parse(invalidError)).toThrow();
    });

    it('throws for empty object (missing both required fields)', () => {
      const invalidError = {};

      expect(() => ErrorSchema.parse(invalidError)).toThrow();
    });

    it('throws for object with wrong type for code (string instead of integer)', () => {
      const invalidError = { code: 'x', message: 'error' };

      expect(() => ErrorSchema.parse(invalidError)).toThrow();
    });

    it('throws for object with non-integer code (float)', () => {
      const invalidError = { code: 1.5, message: 'error' };

      expect(() => ErrorSchema.parse(invalidError)).toThrow();
    });
  });
});

// ============================================================================
// Pets Schema Tests (IR: array with maxItems: 100, items: $ref Pet)
// ============================================================================

describe('Pets Schema Validation', () => {
  describe('valid data passes', () => {
    it('accepts empty array', () => {
      const validPets: unknown[] = [];

      expect(() => PetsSchema.parse(validPets)).not.toThrow();
    });

    it('accepts array with valid Pet objects', () => {
      const validPets = [
        { id: 1, name: 'Fido' },
        { id: 2, name: 'Buddy', tag: 'dog' },
      ];

      expect(() => PetsSchema.parse(validPets)).not.toThrow();
    });

    it('accepts array at maxItems boundary (100 items)', () => {
      const validPets = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Pet ${i}`,
      }));

      expect(() => PetsSchema.parse(validPets)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for array exceeding maxItems (101 items)', () => {
      const invalidPets = Array.from({ length: 101 }, (_, i) => ({
        id: i,
        name: `Pet ${i}`,
      }));

      expect(() => PetsSchema.parse(invalidPets)).toThrow();
    });

    it('throws for array with invalid Pet object (missing required field)', () => {
      const invalidPets = [{ name: 'Fido' }]; // missing id

      expect(() => PetsSchema.parse(invalidPets)).toThrow();
    });

    it('throws for non-array value', () => {
      const invalidPets = { id: 1, name: 'Fido' };

      expect(() => PetsSchema.parse(invalidPets)).toThrow();
    });
  });
});
