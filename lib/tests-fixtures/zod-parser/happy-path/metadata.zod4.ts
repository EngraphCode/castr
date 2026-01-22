/**
 * Zod 4 Happy Path Fixtures — Metadata
 *
 * Contains valid Zod 4 metadata expressions for parser testing.
 * Uses Zod 4 .meta() API and .describe().
 *
 * @module tests-fixtures/zod-parser/happy-path/metadata
 */
import { z } from 'zod';

// =============================================================================
// Basic .describe() (Zod 3/4 compatible)
// =============================================================================

export const DescribedStringSchema = z.string().describe('A user description');

export const DescribedNumberSchema = z.number().describe('Age in years');

// =============================================================================
// Zod 4 .meta() API
// =============================================================================

export const MetaWithTitleSchema = z.string().meta({
  title: 'User Name',
});

export const MetaWithDescriptionSchema = z.email().meta({
  description: 'User email address',
});

export const MetaWithExamplesSchema = z.string().meta({
  examples: ['example1', 'example2'],
});

export const MetaWithDeprecatedSchema = z.string().meta({
  deprecated: true,
});

// =============================================================================
// Combined Metadata
// =============================================================================

export const FullMetadataSchema = z.email().meta({
  title: 'Email Address',
  description: 'Primary email for the user account',
  examples: ['user@example.com', 'admin@company.org'],
  deprecated: false,
});

// =============================================================================
// Object with Property-Level Metadata
// =============================================================================

export const ObjectWithMetadataSchema = z
  .object({
    id: z.uuid().meta({ title: 'User ID', description: 'Unique identifier' }),
    email: z.email().meta({ examples: ['test@example.com'] }),
    createdAt: z.iso.datetime().meta({ title: 'Creation Timestamp' }),
  })
  .meta({
    title: 'User Object',
    description: 'Represents a user in the system',
  });
