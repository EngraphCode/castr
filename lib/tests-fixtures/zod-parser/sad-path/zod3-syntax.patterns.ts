/**
 * Zod 3 Sad Path Fixtures — Patterns to REJECT
 *
 * Contains INVALID Zod 3 syntax that MUST be rejected by the parser.
 * Each pattern should produce a clear error message with the Zod 4 equivalent.
 *
 * NOTE: This file contains intentionally invalid (Zod 3) syntax.
 * It will NOT compile with Zod 4 — that's the point.
 * Use this as a reference for what the PARSER should reject.
 *
 * @module tests-fixtures/zod-parser/sad-path/zod3-syntax
 */

// =============================================================================
// INVALID: String Format Methods (Zod 3 syntax)
// Parser MUST reject these with: "Use z.email() instead"
// =============================================================================

// ❌ REJECT: z.string().email() → Should use z.email()
// const InvalidEmail = z.string().email();

// ❌ REJECT: z.string().url() → Should use z.url()
// const InvalidUrl = z.string().url();

// ❌ REJECT: z.string().uuid() → Should use z.uuid() or z.uuidv4()
// const InvalidUuid = z.string().uuid();

// ❌ REJECT: z.string().datetime() → Should use z.iso.datetime()
// const InvalidDatetime = z.string().datetime();

// =============================================================================
// INVALID: Number Methods (Zod 3 syntax)
// Parser MUST reject these with clear replacement
// =============================================================================

// ❌ REJECT: z.number().int() → Should use z.int()
// const InvalidInt = z.number().int();

// =============================================================================
// INVALID: Deprecated Methods
// Parser MUST reject these with the Zod 4 equivalent
// =============================================================================

// ❌ REJECT: .nonempty() → Should use .min(1)
// const InvalidNonempty = z.string().nonempty();

// ❌ REJECT: .nonnegative() → Should use .min(0)
// const InvalidNonnegative = z.number().nonnegative();

// ❌ REJECT: .nonpositive() → Should use .max(0)
// const InvalidNonpositive = z.number().nonpositive();

// =============================================================================
// Expected Error Messages (for test assertions)
// =============================================================================

/**
 * Expected rejection patterns and error messages.
 * Use this for test assertions.
 */
export const ZOD3_REJECTION_PATTERNS = [
  {
    pattern: 'z.string().email()',
    errorCode: 'ZOD3_SYNTAX',
    expectedMessage: /Use `z\.email\(\)` instead/,
    zodVersion: 3,
    replacement: 'z.email()',
  },
  {
    pattern: 'z.string().url()',
    errorCode: 'ZOD3_SYNTAX',
    expectedMessage: /Use `z\.url\(\)` instead/,
    zodVersion: 3,
    replacement: 'z.url()',
  },
  {
    pattern: 'z.string().uuid()',
    errorCode: 'ZOD3_SYNTAX',
    expectedMessage: /Use `z\.uuid\(\)` instead/,
    zodVersion: 3,
    replacement: 'z.uuid()',
  },
  {
    pattern: 'z.string().datetime()',
    errorCode: 'ZOD3_SYNTAX',
    expectedMessage: /Use `z\.iso\.datetime\(\)` instead/,
    zodVersion: 3,
    replacement: 'z.iso.datetime()',
  },
  {
    pattern: 'z.number().int()',
    errorCode: 'ZOD3_SYNTAX',
    expectedMessage: /Use `z\.int\(\)` instead/,
    zodVersion: 3,
    replacement: 'z.int()',
  },
  {
    pattern: 'z.string().nonempty()',
    errorCode: 'ZOD3_SYNTAX',
    expectedMessage: /Use `\.min\(1\)` instead/,
    zodVersion: 3,
    replacement: '.min(1)',
  },
  {
    pattern: 'z.number().nonnegative()',
    errorCode: 'ZOD3_SYNTAX',
    expectedMessage: /Use `\.min\(0\)` instead/,
    zodVersion: 3,
    replacement: '.min(0)',
  },
  {
    pattern: 'z.number().nonpositive()',
    errorCode: 'ZOD3_SYNTAX',
    expectedMessage: /Use `\.max\(0\)` instead/,
    zodVersion: 3,
    replacement: '.max(0)',
  },
] as const;
