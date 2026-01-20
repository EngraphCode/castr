/**
 * Zod 4 Metadata Writer
 *
 * Writes .meta() calls for Zod 4 schemas with metadata from the IR.
 * Implements ZERO INFORMATION LOSS for schema metadata.
 *
 * @module writers/zod/metadata
 * @internal
 */

import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema } from '../../ir/schema.js';

/**
 * Metadata object structure for Zod 4 .meta() calls.
 *
 * @internal
 */
interface ZodMetadata {
  title?: string;
  description?: string;
  deprecated?: boolean;
  examples?: unknown[];
  externalDocs?: { url: string; description?: string };
  xml?: unknown;
}

/**
 * Writes .meta() call if the schema has metadata fields.
 *
 * Collects all metadata from the IR schema and writes a single .meta() call
 * with all fields. Does nothing if no metadata is present.
 *
 * @param schema - The IR schema to extract metadata from
 * @param writer - The ts-morph writer to output to
 *
 * @example
 * ```typescript
 * // Schema with description
 * writeMetadata(schema, writer);
 * // Output: .meta({ "description": "User email address" })
 * ```
 *
 * @internal
 */
export function writeMetadata(schema: CastrSchema, writer: CodeBlockWriter): void {
  const meta = collectMetadata(schema);

  if (Object.keys(meta).length === 0) {
    return;
  }

  writer.write('.meta(');
  writer.write(JSON.stringify(meta));
  writer.write(')');
}

/**
 * Collects metadata fields from the schema into a ZodMetadata object.
 *
 * @param schema - The IR schema to extract metadata from
 * @returns ZodMetadata object with populated fields
 *
 * @internal
 */
function collectMetadata(schema: CastrSchema): ZodMetadata {
  const meta: ZodMetadata = {};

  if (schema.title !== undefined) {
    meta.title = schema.title;
  }

  if (schema.description !== undefined) {
    meta.description = schema.description;
  }

  if (schema.deprecated === true) {
    meta.deprecated = true;
  }

  // Single example → examples array
  if (schema.example !== undefined) {
    meta.examples = [schema.example];
  }

  // Examples array (overwrites single example if both present)
  if (schema.examples !== undefined && schema.examples.length > 0) {
    meta.examples = schema.examples;
  }

  if (schema.externalDocs !== undefined) {
    meta.externalDocs = schema.externalDocs;
  }

  if (schema.xml !== undefined) {
    meta.xml = schema.xml;
  }

  return meta;
}
