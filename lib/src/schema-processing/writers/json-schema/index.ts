/**
 * JSON Schema writer module — generates JSON Schema 2020-12 from IR.
 *
 * This module provides functions for converting CastrSchema (IR) to valid
 * JSON Schema 2020-12 output. Supports both standalone single-schema mode
 * and bundled multi-schema mode using `$defs`.
 *
 * @example
 * ```typescript
 * import {
 *   writeJsonSchema,
 *   writeJsonSchemaDocument,
 *   writeJsonSchemaBundle,
 * } from '@engraph/castr/writers/json-schema';
 *
 * // Single schema (no $schema header)
 * const schema = writeJsonSchema(irSchema);
 *
 * // Standalone document (with $schema)
 * const doc = writeJsonSchemaDocument(irSchema);
 *
 * // Bundled document (all components under $defs)
 * const bundle = writeJsonSchemaBundle(components);
 * ```
 *
 * @module writers/json-schema
 */

export { writeJsonSchema } from './json-schema-writer.schema.js';
export { writeJsonSchemaDocument, writeJsonSchemaBundle } from './json-schema-writer.document.js';
