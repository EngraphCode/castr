/**
 * JSON Schema writer module — generates JSON Schema 2020-12 from IR.
 *
 * This module provides functions for converting CastrSchema (IR) to valid
 * JSON Schema 2020-12 output. Supports both standalone single-schema mode
 * and bundled multi-schema mode using `$defs`.
 *
 * This is currently a repository-internal module. The package does not yet
 * export a standalone JSON Schema writer entry point; that public surface is
 * an explicit future delivery obligation.
 *
 * @example Repository-internal use
 * ```typescript
 * // Functions exported by this internal module:
 * // Single schema (no $schema header)
 * const schema = writeJsonSchema(irSchema);
 *
 * // Standalone document (with $schema)
 * const doc = writeJsonSchemaDocument(irSchema);
 *
 * // Bundled document (all components under $defs)
 * const bundle = writeJsonSchemaBundle(components);
 * ```
 * @internal
 */

export { writeJsonSchema } from './json-schema-writer.schema.js';
export { writeJsonSchemaDocument, writeJsonSchemaBundle } from './json-schema-writer.document.js';
