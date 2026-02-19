/**
 * Validation Parity Integration Tests - Petstore Expanded (allOf Composition)
 *
 * PROVES that generated Zod schemas for allOf composition validate data correctly.
 * The Pet schema uses allOf composition: NewPet.and(z.object({ id }))
 *
 * Key tests:
 * - Intersection types require ALL properties from ALL schemas
 * - NewPet (name required, tag optional) + { id required }
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

// Import generated Zod schemas from petstore-expanded fixture
import {
  NewPet as NewPetSchema,
  Pet as PetSchema,
  Error as ErrorSchema,
} from '../__fixtures__/normalized/petstore-expanded-3.0/zod.js';

// ============================================================================
// NewPet Schema Tests (IR: object with required: ["name"], optional: "tag")
// ============================================================================

describe('NewPet Schema Validation (petstore-expanded)', () => {
  describe('valid data passes', () => {
    it('accepts object with only required field: name', () => {
      const validNewPet = { name: 'Fido' };

      expect(() => NewPetSchema.parse(validNewPet)).not.toThrow();
    });

    it('accepts object with required and optional fields', () => {
      const validNewPet = { name: 'Fido', tag: 'dog' };

      expect(() => NewPetSchema.parse(validNewPet)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for object missing required field: name', () => {
      const invalidNewPet = { tag: 'dog' };

      expect(() => NewPetSchema.parse(invalidNewPet)).toThrow();
    });

    it('throws for object with wrong type for name (number instead of string)', () => {
      const invalidNewPet = { name: 123 };

      expect(() => NewPetSchema.parse(invalidNewPet)).toThrow();
    });

    it('throws for object with extra properties (strict mode)', () => {
      const invalidNewPet = { name: 'Fido', extra: 'field' };

      expect(() => NewPetSchema.parse(invalidNewPet)).toThrow();
    });
  });
});

// ============================================================================
// Pet Schema Tests (allOf composition: NewPet & { id: integer })
// This tests z.and() intersection behavior
// ============================================================================

describe('Pet Schema Validation (allOf composition)', () => {
  describe('valid data passes', () => {
    it('accepts object with all required fields from both schemas', () => {
      // Pet = NewPet & { id } = { name, id } with optional tag
      const validPet = { id: 1, name: 'Fido' };

      expect(() => PetSchema.parse(validPet)).not.toThrow();
    });

    it('accepts object with required fields and optional tag', () => {
      const validPet = { id: 1, name: 'Fido', tag: 'dog' };

      expect(() => PetSchema.parse(validPet)).not.toThrow();
    });

    it('accepts integer id values', () => {
      const validPet = { id: 42, name: 'Buddy' };

      expect(() => PetSchema.parse(validPet)).not.toThrow();
    });
  });

  describe('invalid data throws (intersection requires ALL properties)', () => {
    it('throws for object missing id (from second schema)', () => {
      const invalidPet = { name: 'Fido' };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object missing name (from NewPet)', () => {
      const invalidPet = { id: 1 };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object with wrong type for id (string instead of integer)', () => {
      const invalidPet = { id: '1', name: 'Fido' };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for object with non-integer id (float)', () => {
      const invalidPet = { id: 1.5, name: 'Fido' };

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });

    it('throws for empty object (missing both required fields)', () => {
      const invalidPet = {};

      expect(() => PetSchema.parse(invalidPet)).toThrow();
    });
  });
});

// ============================================================================
// Error Schema Tests (same as petstore-3.0, validates consistency)
// ============================================================================

describe('Error Schema Validation (petstore-expanded)', () => {
  describe('valid data passes', () => {
    it('accepts object with all required fields', () => {
      const validError = { code: 404, message: 'Not found' };

      expect(() => ErrorSchema.parse(validError)).not.toThrow();
    });
  });

  describe('invalid data throws', () => {
    it('throws for object missing required field: code', () => {
      const invalidError = { message: 'error' };

      expect(() => ErrorSchema.parse(invalidError)).toThrow();
    });

    it('throws for object with non-integer code (float)', () => {
      const invalidError = { code: 1.5, message: 'error' };

      expect(() => ErrorSchema.parse(invalidError)).toThrow();
    });
  });
});
