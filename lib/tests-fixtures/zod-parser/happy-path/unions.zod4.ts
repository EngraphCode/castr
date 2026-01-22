/**
 * Zod 4 Happy Path Fixtures — Unions
 *
 * Contains valid Zod 4 union expressions for parser testing.
 *
 * @module tests-fixtures/zod-parser/happy-path/unions
 */
import { z } from 'zod';

// =============================================================================
// Basic Union (z.union) → anyOf
// =============================================================================

export const BasicUnionSchema = z.union([z.string(), z.number()]);

export const MultiTypeUnionSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

// =============================================================================
// Exclusive Union (z.xor) → oneOf (Zod 4)
// =============================================================================

export const ExclusiveUnionSchema = z.xor([z.string(), z.number()]);

export const ObjectXorSchema = z.xor([
  z.object({ type: z.literal('card'), cardNumber: z.string() }),
  z.object({ type: z.literal('bank'), accountNumber: z.string() }),
]);

// =============================================================================
// Discriminated Union → oneOf with discriminator
// =============================================================================

export const DiscriminatedUnionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('success'), data: z.string() }),
  z.object({ type: z.literal('error'), message: z.string() }),
]);

export const MultiOptionDiscriminatedSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('a'), valueA: z.number() }),
  z.object({ kind: z.literal('b'), valueB: z.boolean() }),
  z.object({ kind: z.literal('c'), valueC: z.string() }),
]);

// =============================================================================
// Literal Unions
// =============================================================================

/** z.literal([...]) - Multiple literal values (Zod 4 feature) */
export const LiteralArraySchema = z.literal(['red', 'green', 'blue']);

export const NumericLiteralSchema = z.literal([200, 201, 204, 404, 500]);
