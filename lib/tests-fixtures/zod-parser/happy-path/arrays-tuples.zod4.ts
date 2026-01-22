/**
 * Zod 4 Happy Path Fixtures — Arrays and Tuples
 *
 * Contains valid Zod 4 array and tuple expressions for parser testing.
 *
 * @module tests-fixtures/zod-parser/happy-path/arrays-tuples
 */
import { z } from 'zod';

// =============================================================================
// Basic Arrays
// =============================================================================

export const StringArraySchema = z.array(z.string());

export const NumberArraySchema = z.array(z.number());

/** Array with Zod 4 format function items */
export const EmailArraySchema = z.array(z.email());

/** Nested arrays */
export const NestedArraySchema = z.array(z.array(z.string()));

// =============================================================================
// Array Constraints
// =============================================================================

export const MinArraySchema = z.array(z.string()).min(1);

export const MaxArraySchema = z.array(z.string()).max(10);

export const ExactLengthArraySchema = z.array(z.string()).length(5);

export const MinMaxArraySchema = z.array(z.number()).min(1).max(100);

// =============================================================================
// Tuples
// =============================================================================

export const BasicTupleSchema = z.tuple([z.string(), z.number(), z.boolean()]);

export const HomogeneousTupleSchema = z.tuple([z.string(), z.string(), z.string()]);

/** Tuple with Zod 4 format functions */
export const FormatTupleSchema = z.tuple([z.email(), z.uuid(), z.iso.datetime()]);

// =============================================================================
// Variadic Tuples (Zod 4)
// =============================================================================

/** Tuple with rest element */
export const VariadicTupleSchema = z.tuple([z.string()], z.number());

export const VariadicMixedTupleSchema = z.tuple([z.string(), z.boolean()], z.int32());

// =============================================================================
// Array of Objects
// =============================================================================

export const ObjectArraySchema = z.array(
  z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .strict(),
);
