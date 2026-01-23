/**
 * Zod 4 Happy Path Fixtures — Constraints
 *
 * Contains valid Zod 4 constraint expressions for parser testing.
 *
 * @module tests-fixtures/zod-parser/happy-path/constraints
 */
import { z } from 'zod';

// =============================================================================
// String Constraints
// =============================================================================

export const StringMinSchema = z.string().min(1);
export const StringMaxSchema = z.string().max(100);
export const StringLengthSchema = z.string().length(10);
export const StringMinMaxSchema = z.string().min(1).max(255);
export const StringRegexSchema = z.string().regex(/^[a-z]+$/);
export const StringStartsWithSchema = z.string().startsWith('prefix_');
export const StringEndsWithSchema = z.string().endsWith('_suffix');
export const StringIncludesSchema = z.string().includes('middle');

// =============================================================================
// Number Constraints
// =============================================================================

export const NumberMinSchema = z.number().min(0);
export const NumberMaxSchema = z.number().max(100);
export const NumberMinMaxSchema = z.number().min(0).max(100);

/** .gt() - greater than (exclusive minimum) */
export const NumberGtSchema = z.number().gt(0);

/** .gte() - greater than or equal (inclusive minimum) */
export const NumberGteSchema = z.number().gte(0);

/** .lt() - less than (exclusive maximum) */
export const NumberLtSchema = z.number().lt(100);

/** .lte() - less than or equal (inclusive maximum) */
export const NumberLteSchema = z.number().lte(100);

/** .positive() - > 0 */
export const NumberPositiveSchema = z.number().positive();

/** .negative() - < 0 */
export const NumberNegativeSchema = z.number().negative();

/** .nonnegative() - >= 0 */
export const NumberNonnegativeSchema = z.number().min(0);

/** .nonpositive() - <= 0 */
export const NumberNonpositiveSchema = z.number().max(0);

/** .multipleOf() - must be multiple of N */
export const NumberMultipleOfSchema = z.number().multipleOf(5);

// =============================================================================
// Integer Constraints (on Zod 4 format functions)
// =============================================================================

export const IntMinSchema = z.int().min(0);
export const IntMaxSchema = z.int().max(1000);
export const Int32MinMaxSchema = z.int32().min(-100).max(100);

// =============================================================================
// Array Constraints (on arrays, not strings)
// =============================================================================

export const ArrayMinSchema = z.array(z.string()).min(1);
export const ArrayMaxSchema = z.array(z.string()).max(10);
export const ArrayLengthSchema = z.array(z.number()).length(3);

// =============================================================================
// Combined Constraints
// =============================================================================

export const FullyConstrainedStringSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[A-Za-z ]+$/);

export const FullyConstrainedNumberSchema = z.number().min(0).max(100).multipleOf(5);

// =============================================================================
// Default Values
// =============================================================================

export const StringWithDefaultSchema = z.string().default('default_value');
export const NumberWithDefaultSchema = z.number().default(42);
export const BooleanWithDefaultSchema = z.boolean().default(false);
export const ArrayWithDefaultSchema = z.array(z.string()).default([]);

// =============================================================================
// Combined with Optionality
// =============================================================================

export const OptionalWithMinSchema = z.string().min(1).optional();
export const NullableWithMaxSchema = z.number().max(100).nullable();
export const NullishWithDefaultSchema = z.string().nullish().default('fallback');
