/**
 * Zod 4 Happy Path Fixtures — Strict Object Semantics
 *
 * Under IDENTITY doctrine, all objects use strict (closed-world) semantics.
 * Non-strict forms (strip, passthrough, catchall) are rejected at parse time.
 * This fixture validates that strict objects with nested structures parse correctly.
 *
 * @module tests-fixtures/zod-parser/happy-path/unknown-key-semantics
 */
import { z } from 'zod';

// =============================================================================
// Strict Object (canonical form)
// =============================================================================

export const StrictObjectSchema = z.strictObject({
  known: z.string(),
  nested: z.strictObject({
    inner: z.string(),
  }),
});

// =============================================================================
// Recursive Strict Object
// =============================================================================

export const RecursiveStrictCategorySchema: z.ZodType<{
  name: string;
  children: { name: string; children: unknown[] }[];
}> = z.strictObject({
  name: z.string(),
  get children() {
    return z.array(RecursiveStrictCategorySchema);
  },
});
