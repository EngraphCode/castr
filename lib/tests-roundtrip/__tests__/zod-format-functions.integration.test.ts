/**
 * Format-Specific Function Tests - Zod 4 Features
 *
 * PROVES that Zod 4 format-specific functions validate data correctly.
 * These tests validate the actual validation behavior of:
 *
 * - Integer formats: z.int(), z.int32(), z.int64()
 * - String formats: z.email(), z.url(), z.iso.datetime()
 *
 * Uses pure Zod schemas (not imported from fixtures) to test format
 * function behavior directly.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ============================================================================
// Integer Format Tests
// ============================================================================

describe('Integer Format Validation (z.int(), z.int32(), z.int64())', () => {
  describe('z.int() - safe integer range', () => {
    const schema = z.int();

    it('accepts positive integers', () => {
      expect(() => schema.parse(1)).not.toThrow();
      expect(() => schema.parse(42)).not.toThrow();
      expect(() => schema.parse(1000000)).not.toThrow();
    });

    it('accepts negative integers', () => {
      expect(() => schema.parse(-1)).not.toThrow();
      expect(() => schema.parse(-42)).not.toThrow();
    });

    it('accepts zero', () => {
      expect(() => schema.parse(0)).not.toThrow();
    });

    it('throws for floats', () => {
      expect(() => schema.parse(1.5)).toThrow();
      expect(() => schema.parse(0.1)).toThrow();
      expect(() => schema.parse(-2.5)).toThrow();
    });

    it('throws for non-numbers', () => {
      expect(() => schema.parse('1')).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
    });

    it('throws for NaN', () => {
      expect(() => schema.parse(NaN)).toThrow();
    });

    it('throws for Infinity', () => {
      expect(() => schema.parse(Infinity)).toThrow();
      expect(() => schema.parse(-Infinity)).toThrow();
    });
  });

  describe('z.int32() - 32-bit signed integer range', () => {
    const schema = z.int32();
    const INT32_MAX = 2147483647;
    const INT32_MIN = -2147483648;

    it('accepts values within int32 range', () => {
      expect(() => schema.parse(0)).not.toThrow();
      expect(() => schema.parse(INT32_MAX)).not.toThrow();
      expect(() => schema.parse(INT32_MIN)).not.toThrow();
      expect(() => schema.parse(1000000)).not.toThrow();
    });

    it('throws for values exceeding int32 max', () => {
      expect(() => schema.parse(INT32_MAX + 1)).toThrow();
    });

    it('throws for values below int32 min', () => {
      expect(() => schema.parse(INT32_MIN - 1)).toThrow();
    });

    it('throws for floats', () => {
      expect(() => schema.parse(1.5)).toThrow();
    });
  });

  describe('z.int64() - 64-bit signed integer (bigint)', () => {
    const schema = z.int64();

    it('accepts bigint values', () => {
      expect(() => schema.parse(BigInt(0))).not.toThrow();
      expect(() => schema.parse(BigInt(9007199254740991))).not.toThrow();
      expect(() => schema.parse(BigInt(-9007199254740991))).not.toThrow();
    });

    it('accepts very large bigint values beyond JS safe integer', () => {
      const largeBigInt = BigInt('9223372036854775807'); // INT64_MAX
      expect(() => schema.parse(largeBigInt)).not.toThrow();
    });

    it('throws for regular numbers (expects bigint)', () => {
      // z.int64() is designed for bigint type
      expect(() => schema.parse(123)).toThrow();
    });
  });
});

// ============================================================================
// String Format Tests
// ============================================================================

describe('String Format Validation (z.email(), z.url(), z.iso.datetime())', () => {
  describe('z.email() - email format', () => {
    const schema = z.email();

    it('accepts valid email addresses', () => {
      expect(() => schema.parse('test@example.com')).not.toThrow();
      expect(() => schema.parse('user.name@domain.co.uk')).not.toThrow();
      expect(() => schema.parse('user+tag@example.org')).not.toThrow();
    });

    it('throws for invalid email formats', () => {
      expect(() => schema.parse('notanemail')).toThrow();
      expect(() => schema.parse('missing@')).toThrow();
      expect(() => schema.parse('@nodomain.com')).toThrow();
      expect(() => schema.parse('spaces in@email.com')).toThrow();
    });

    it('throws for non-strings', () => {
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });
  });

  describe('z.url() - URL format', () => {
    const schema = z.url();

    it('accepts valid HTTP/HTTPS URLs', () => {
      expect(() => schema.parse('https://example.com')).not.toThrow();
      expect(() => schema.parse('http://example.com')).not.toThrow();
      expect(() => schema.parse('https://example.com/path')).not.toThrow();
      expect(() => schema.parse('https://example.com:8080/path?query=value')).not.toThrow();
    });

    it('accepts other valid URL protocols', () => {
      expect(() => schema.parse('ftp://ftp.example.com')).not.toThrow();
    });

    it('throws for invalid URL formats', () => {
      expect(() => schema.parse('not-a-url')).toThrow();
      expect(() => schema.parse('example.com')).toThrow(); // missing protocol
      expect(() => schema.parse('://example.com')).toThrow();
    });

    it('throws for non-strings', () => {
      expect(() => schema.parse(123)).toThrow();
    });
  });

  describe('z.iso.datetime() - ISO 8601 datetime format', () => {
    const schema = z.iso.datetime();

    it('accepts valid ISO 8601 datetime strings with Z suffix', () => {
      expect(() => schema.parse('2024-01-15T10:30:00Z')).not.toThrow();
      expect(() => schema.parse('2024-01-15T10:30:00.000Z')).not.toThrow();
      expect(() => schema.parse('2024-12-31T23:59:59.999Z')).not.toThrow();
    });

    it('throws for datetime with timezone offset (Zod 4 requires Z suffix)', () => {
      // Zod 4 z.iso.datetime() only accepts UTC (Z suffix), not timezone offsets
      expect(() => schema.parse('2024-01-15T10:30:00+05:00')).toThrow();
      expect(() => schema.parse('2024-01-15T10:30:00-08:00')).toThrow();
    });

    it('throws for invalid datetime formats', () => {
      expect(() => schema.parse('not-a-datetime')).toThrow();
      expect(() => schema.parse('2024-01-15')).toThrow(); // date only, no time
      expect(() => schema.parse('10:30:00')).toThrow(); // time only
    });

    it('throws for non-strings', () => {
      expect(() => schema.parse(new Date())).toThrow(); // Date object, not string
    });
  });

  describe('z.iso.date() - ISO 8601 date format', () => {
    const schema = z.iso.date();

    it('accepts valid ISO 8601 date strings', () => {
      expect(() => schema.parse('2024-01-15')).not.toThrow();
      expect(() => schema.parse('2024-12-31')).not.toThrow();
    });

    it('throws for datetime strings', () => {
      expect(() => schema.parse('2024-01-15T10:30:00Z')).toThrow();
    });

    it('throws for invalid date formats', () => {
      expect(() => schema.parse('01/15/2024')).toThrow();
      expect(() => schema.parse('Jan 15, 2024')).toThrow();
    });
  });

  describe('z.uuidv4() - UUID v4 format', () => {
    const schema = z.uuidv4();

    it('accepts valid UUID v4 strings', () => {
      expect(() => schema.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
      expect(() => schema.parse('2531329f-fb09-4ef7-887e-84e648214436')).not.toThrow();
    });

    it('throws for invalid UUID formats', () => {
      expect(() => schema.parse('not-a-uuid')).toThrow();
      expect(() => schema.parse('550e8400-e29b-41d4-a716')).toThrow(); // incomplete
    });
  });

  describe('z.ipv4() - IPv4 format', () => {
    const schema = z.ipv4();

    it('accepts valid IPv4 addresses', () => {
      // eslint-disable-next-line sonarjs/no-hardcoded-ip -- Testing IP format validation
      const testIPs = ['192.168.1.1', '10.0.0.1', '255.255.255.255', '0.0.0.0'];
      for (const ip of testIPs) {
        expect(() => schema.parse(ip)).not.toThrow();
      }
    });

    it('throws for invalid IPv4 addresses', () => {
      expect(() => schema.parse('256.0.0.1')).toThrow(); // out of range
      expect(() => schema.parse('192.168.1')).toThrow(); // incomplete
      expect(() => schema.parse('192.168.1.1.1')).toThrow(); // too many octets
    });

    it('throws for IPv6 addresses', () => {
      expect(() => schema.parse('::1')).toThrow();
    });
  });
});

// ============================================================================
// Composition Format Tests (z.xor, z.union, z.discriminatedUnion)
// ============================================================================

describe('Composition Schema Validation', () => {
  describe('z.xor() - exclusive union (exactly one matches)', () => {
    // z.xor() enforces that EXACTLY ONE schema matches
    const catSchema = z.object({ type: z.literal('cat'), meow: z.boolean() }).strict();
    const dogSchema = z.object({ type: z.literal('dog'), bark: z.boolean() }).strict();
    const xorSchema = z.xor([catSchema, dogSchema]);

    it('accepts data matching exactly one schema (cat)', () => {
      const cat = { type: 'cat', meow: true };
      expect(() => xorSchema.parse(cat)).not.toThrow();
    });

    it('accepts data matching exactly one schema (dog)', () => {
      const dog = { type: 'dog', bark: true };
      expect(() => xorSchema.parse(dog)).not.toThrow();
    });

    it('throws for data matching neither schema', () => {
      const bird = { type: 'bird', chirp: true };
      expect(() => xorSchema.parse(bird)).toThrow();
    });
  });

  describe('z.union() - inclusive union (at least one matches)', () => {
    const stringSchema = z.string();
    const numberSchema = z.number();
    const unionSchema = z.union([stringSchema, numberSchema]);

    it('accepts data matching first schema', () => {
      expect(() => unionSchema.parse('hello')).not.toThrow();
    });

    it('accepts data matching second schema', () => {
      expect(() => unionSchema.parse(42)).not.toThrow();
    });

    it('throws for data matching neither schema', () => {
      expect(() => unionSchema.parse(true)).toThrow();
      expect(() => unionSchema.parse(null)).toThrow();
    });
  });

  describe('z.discriminatedUnion() - optimized union by discriminator', () => {
    const catSchema = z.object({ pet: z.literal('cat'), meow: z.boolean() });
    const dogSchema = z.object({ pet: z.literal('dog'), bark: z.boolean() });
    const discriminatedSchema = z.discriminatedUnion('pet', [catSchema, dogSchema]);

    it('accepts data with valid discriminator value (cat)', () => {
      const cat = { pet: 'cat', meow: true };
      expect(() => discriminatedSchema.parse(cat)).not.toThrow();
    });

    it('accepts data with valid discriminator value (dog)', () => {
      const dog = { pet: 'dog', bark: true };
      expect(() => discriminatedSchema.parse(dog)).not.toThrow();
    });

    it('throws for data with invalid discriminator value', () => {
      const bird = { pet: 'bird', chirp: true };
      expect(() => discriminatedSchema.parse(bird)).toThrow();
    });

    it('throws for data with valid discriminator but wrong properties', () => {
      const invalidCat = { pet: 'cat', bark: true }; // cat should have meow, not bark
      expect(() => discriminatedSchema.parse(invalidCat)).toThrow();
    });
  });
});
