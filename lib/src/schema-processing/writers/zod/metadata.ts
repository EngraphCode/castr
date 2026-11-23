/**
 * Zod 4 Metadata Writer
 *
 * Writes .meta() calls for Zod 4 schemas with metadata from the IR.
 * Implements ZERO INFORMATION LOSS for schema metadata.
 *
 * @internal
 */

import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema } from '../../ir/index.js';

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
  default?: unknown;
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

  rejectAPropertyNamedProto(meta);
  writer.write('.meta(');
  writer.write(JSON.stringify(meta));
  writer.write(')');
}

/**
 * A source `default` is an annotation: it is written into the metadata and inserts
 * nothing (SPEC-P-6, Appendix B.3). A Zod `.default`, which inserts, is carried by the
 * chain and is not written a second time here.
 * @internal
 */
function collectSourceDefault(schema: CastrSchema, meta: ZodMetadata): void {
  if (schema.default !== undefined && schema.metadata.zodChain.defaults.length === 0) {
    meta.default = schema.default;
  }
}

/**
 * Collects core metadata fields (title, description, deprecated, examples).
 * @internal
 */
function collectCoreMetadata(schema: CastrSchema, meta: ZodMetadata): void {
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
  collectSourceDefault(schema, meta);
}

/**
 * Collects extended metadata fields (externalDocs, xml).
 * @internal
 */
function collectExtendedMetadata(schema: CastrSchema, meta: ZodMetadata): void {
  if (schema.externalDocs !== undefined) {
    meta.externalDocs = schema.externalDocs;
  }
  if (schema.xml !== undefined) {
    meta.xml = schema.xml;
  }
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
  collectCoreMetadata(schema, meta);
  collectExtendedMetadata(schema, meta);
  return meta;
}

const PROTO = '__proto__';

/**
 * The metadata is written as an object literal, and in a literal a property named
 * `__proto__` sets the prototype and makes no property. A value that holds one, at any
 * depth, would be written as a different value, so it is refused.
 * @internal
 */
function rejectAPropertyNamedProto(value: unknown): void {
  if (typeof value !== 'object' || value === null) {
    return;
  }
  if (Object.hasOwn(value, PROTO)) {
    throw new Error(
      `A schema annotation that holds a property named ${PROTO} is rejected: written as ` +
        'an object literal in .meta(), it would set a prototype and the property would be lost.',
    );
  }
  Object.values(value).forEach(rejectAPropertyNamedProto);
}
