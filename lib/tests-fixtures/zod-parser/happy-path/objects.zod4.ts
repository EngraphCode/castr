/**
 * Zod 4 Happy Path Fixtures — Objects
 *
 * Contains valid Zod 4 object expressions for parser testing.
 *
 * @module tests-fixtures/zod-parser/happy-path/objects
 */
import { z } from 'zod';

// =============================================================================
// Basic Object
// =============================================================================

export const BasicObjectSchema = z.strictObject({
  name: z.string(),
  age: z.number(),
  active: z.boolean(),
});

// =============================================================================
// Object with Strict Mode (additionalProperties: false)
// =============================================================================

export const StrictObjectSchema = z
  .object({
    id: z.string(),
    value: z.number(),
  })
  .strict();

// =============================================================================
// Object with Passthrough (additionalProperties: true)
// =============================================================================

export const SecondaryStrictObjectSchema = z.strictObject({
  known: z.string(),
});

// =============================================================================
// Object with Optional/Nullable Properties
// =============================================================================

export const ObjectWithOptionalSchema = z.strictObject({
  required: z.string(),
  optional: z.string().optional(),
  nullable: z.string().nullable(),
  nullish: z.string().nullish(),
});

// =============================================================================
// Nested Objects
// =============================================================================

export const NestedObjectSchema = z.strictObject({
  user: z.strictObject({
    name: z.string(),
    email: z.email(),
  }),
  metadata: z.strictObject({
    createdAt: z.iso.datetime(),
    version: z.int(),
  }),
});

// =============================================================================
// Object with Top-Level Format Functions as Properties
// =============================================================================

export const ObjectWithFormatsSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    website: z.url(),
    createdAt: z.iso.datetime(),
    count: z.int32(),
  })
  .strict();
