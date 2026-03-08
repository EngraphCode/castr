/**
 * OpenAPI-only extension field writers.
 *
 * Writes keywords that exist in OpenAPI but not in pure JSON Schema:
 *   - xml
 *   - externalDocs
 *   - discriminator
 *
 * JSON Schema 2020-12 keywords live in writers/shared/.
 *
 * @module writers/openapi/schema/extensions
 */

import type { JsonSchemaObject } from '../../shared/json-schema-fields.js';
import type { CastrSchema } from '../../../ir/index.js';

/**
 * Extended SchemaObject — alias kept for external consumers.
 * @internal
 */
export type ExtendedSchemaObject = JsonSchemaObject;

/**
 * Writes OpenAPI-only extension fields.
 * @internal
 */
export function writeOasOnlyExtensions(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.xml !== undefined) {
    result['xml'] = schema.xml;
  }
  if (schema.externalDocs !== undefined) {
    result['externalDocs'] = schema.externalDocs;
  }
  if (schema.discriminator !== undefined) {
    result['discriminator'] = schema.discriminator;
  }
}
