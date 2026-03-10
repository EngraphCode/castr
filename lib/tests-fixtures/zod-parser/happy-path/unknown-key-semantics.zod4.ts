/**
 * Zod 4 Happy Path Fixtures — Unknown-Key Semantics
 *
 * Contains object schemas that exercise strip, passthrough, catchall,
 * and recursive unknown-key behavior.
 *
 * @module tests-fixtures/zod-parser/happy-path/unknown-key-semantics
 */
import { z } from 'zod';

// =============================================================================
// Strip
// =============================================================================

export const StripObjectSchema = z
  .object({
    known: z.string(),
    nested: z
      .object({
        inner: z.string(),
      })
      .strip(),
  })
  .strip();

// =============================================================================
// Passthrough
// =============================================================================

export const PassthroughObjectSchema = z
  .object({
    known: z.string(),
    nested: z
      .object({
        inner: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

// =============================================================================
// Catchall
// =============================================================================

export const CatchallObjectSchema = z
  .object({
    known: z.string(),
    nested: z
      .object({
        inner: z.string(),
      })
      .catchall(z.number()),
  })
  .catchall(z.string());

// =============================================================================
// Recursive Strip
// =============================================================================

export const RecursiveStripCategorySchema = z.object({
  name: z.string(),
  get children() {
    return z.array(RecursiveStripCategorySchema);
  },
});

// =============================================================================
// Recursive Passthrough
// =============================================================================

export const RecursivePassthroughCategorySchema = z
  .object({
    name: z.string(),
    get children() {
      return z.array(RecursivePassthroughCategorySchema);
    },
  })
  .passthrough();

// =============================================================================
// Recursive Catchall
// =============================================================================

export const RecursiveCatchallCategorySchema = z
  .object({
    name: z.string(),
    get children() {
      return z.array(RecursiveCatchallCategorySchema);
    },
  })
  .catchall(z.string());
