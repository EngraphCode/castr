/**
 * Zod 4 Happy Path Fixtures — Primitives
 *
 * Contains valid Zod 4 primitive type expressions for parser testing.
 * All expressions are VALID Zod 4 syntax that MUST be parsed successfully.
 *
 * @module tests-fixtures/zod-parser/happy-path/primitives
 */
import { z } from 'zod';

// =============================================================================
// Basic Primitives
// =============================================================================

export const StringSchema = z.string();
export const NumberSchema = z.number();
export const BooleanSchema = z.boolean();
export const NullSchema = z.null();
export const BigIntSchema = z.bigint();

// =============================================================================
// Integer Formats (Zod 4 top-level functions)
// =============================================================================

/** z.int() - safe integer range */
export const IntSchema = z.int();

/** z.int32() - 32-bit signed integer range */
export const Int32Schema = z.int32();

/** z.int64() - 64-bit integer (returns bigint) */
export const Int64Schema = z.int64();

// =============================================================================
// Float Formats
// =============================================================================

/** z.float32() - 32-bit float range */
export const Float32Schema = z.float32();

/** z.float64() - 64-bit float range */
export const Float64Schema = z.float64();
