/**
 * Zod 4 Happy Path Fixtures — Recursion
 *
 * Contains valid Zod 4 recursive type expressions using getter syntax.
 * This is the Zod 4 native recursion pattern (no z.lazy required).
 *
 * @module tests-fixtures/zod-parser/happy-path/recursion
 */
import { z } from 'zod';

// =============================================================================
// Self-Referential Object (Getter Syntax)
// =============================================================================

/**
 * Category with subcategories (self-referential).
 *
 * Uses Zod 4 getter syntax for native recursion.
 */
export const CategorySchema = z.strictObject({
  name: z.string(),
  get subcategories() {
    return z.array(CategorySchema);
  },
});

// =============================================================================
// Mutually Recursive Types
// =============================================================================

/**
 * User references Post, Post references User.
 */
export const UserSchema = z.strictObject({
  id: z.uuid(),
  email: z.email(),
  get posts() {
    return z.array(PostSchema);
  },
});

export const PostSchema = z.strictObject({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  get author() {
    return UserSchema;
  },
});

// =============================================================================
// Tree Structure
// =============================================================================

export const TreeNodeSchema = z.strictObject({
  value: z.number(),
  get left() {
    return TreeNodeSchema.optional();
  },
  get right() {
    return TreeNodeSchema.optional();
  },
});

// =============================================================================
// Linked List
// =============================================================================

export const LinkedListNodeSchema = z.strictObject({
  data: z.string(),
  get next() {
    return LinkedListNodeSchema.nullable();
  },
});
