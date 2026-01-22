/**
 * Zod 4 Happy Path Fixtures — Intersections
 *
 * Contains valid Zod 4 intersection expressions for parser testing.
 *
 * @module tests-fixtures/zod-parser/happy-path/intersections
 */
import { z } from 'zod';

// =============================================================================
// Basic Intersections (z.intersection)
// =============================================================================

const PersonBase = z.object({
  name: z.string(),
});

const HasEmail = z.object({
  email: z.email(),
});

/** z.intersection(a, b) → allOf in IR */
export const IntersectionSchema = z.intersection(PersonBase, HasEmail);

// =============================================================================
// .and() Method (Alternative Syntax)
// =============================================================================

/** Schema.and(Other) — alternative to z.intersection() */
export const AndMethodSchema = PersonBase.and(HasEmail);

// =============================================================================
// Multiple Intersections
// =============================================================================

const HasTimestamps = z.object({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

/** Chain of .and() calls */
export const TripleIntersectionSchema = PersonBase.and(HasEmail).and(HasTimestamps);

// =============================================================================
// Intersection with Constraints
// =============================================================================

const WithId = z.object({
  id: z.uuid(),
});

const WithVersion = z.object({
  version: z.int32().min(0),
});

export const IntersectionWithConstraintsSchema = z.intersection(WithId, WithVersion);

// =============================================================================
// Real-World Pattern: Base + Extension (like petstore Pet = NewPet & {id})
// =============================================================================

export const NewItemSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
  })
  .strict();

export const ItemSchema = NewItemSchema.and(
  z
    .object({
      id: z.int64(),
    })
    .strict(),
);
