/**
 * JSON Schema writer — converts CastrSchema (IR) to pure JSON Schema 2020-12.
 *
 * Core JSON Schema field logic is delegated to the shared json-schema-fields
 * module.  Unlike the OpenAPI writer, this module does NOT add OAS-specific
 * extensions (xml, externalDocs, discriminator).
 *
 * @module writers/json-schema/json-schema-writer.schema
 */

import type { CastrSchema } from '../../ir/index.js';
import type { JsonSchemaObject } from '../shared/json-schema-fields.js';
import { writeAllJsonSchemaFields } from '../shared/json-schema-fields.js';

/**
 * Converts an IR schema to a pure JSON Schema 2020-12 object.
 *
 * Handles all schema types (primitives, objects, arrays, composition) and
 * preserves constraints, formats, and metadata. Nullable schemas are converted
 * to JSON Schema type arrays (e.g., `['string', 'null']`).
 *
 * Unlike the OpenAPI writer, this does NOT write OAS-only extension fields
 * (xml, externalDocs, discriminator).
 *
 * @param schema - The IR schema to convert
 * @returns A valid JSON Schema 2020-12 object
 *
 * @example
 * ```typescript
 * const irSchema: CastrSchema = {
 *   type: 'string',
 *   format: 'email',
 *   metadata: { nullable: true, ... },
 * };
 *
 * const jsonSchema = writeJsonSchema(irSchema);
 * // { type: ['string', 'null'], format: 'email' }
 * ```
 *
 * @public
 */
export function writeJsonSchema(schema: CastrSchema): JsonSchemaObject {
  const result: JsonSchemaObject = {};

  if (schema.$ref !== undefined) {
    result.$ref = schema.$ref;
    return result;
  }

  writeAllJsonSchemaFields(schema, result, writeJsonSchema);

  return result;
}
