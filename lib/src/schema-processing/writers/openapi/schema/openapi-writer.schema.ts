/**
 * OpenAPI schema writer — converts CastrSchema (IR) to OpenAPI SchemaObject.
 *
 * Core JSON Schema field logic is delegated to the shared json-schema-fields
 * module.  This module adds only OAS-specific extras (discriminator, xml,
 * externalDocs) on top of that shared foundation.
 */

import type { CastrSchema } from '../../../ir/index.js';
import { assertSchemaSupportsIntegerTargetCapabilities } from '../../../compatibility/integer-target-capabilities.js';
import { CANONICAL_OPENAPI_TARGET_LABEL } from '../../../../shared/openapi/version.js';
import type { JsonSchemaObject } from '../../shared/json-schema-fields.js';
import { writeAllJsonSchemaFields } from '../../shared/json-schema-fields.js';
import { writeOasOnlyExtensions } from './openapi-writer.schema.extensions.js';

// Re-export the type alias used by consumers of this module
export type { ExtendedSchemaObject } from './openapi-writer.schema.extensions.js';

/**
 * Writes all field groups for a non-ref schema.
 * @internal
 */
function writeSchemaFields(schema: CastrSchema, result: JsonSchemaObject): void {
  writeAllJsonSchemaFields(schema, result, writeOpenApiSchema);
  writeOasOnlyExtensions(schema, result);
}

/**
 * Converts an IR schema to an OpenAPI SchemaObject.
 *
 * Handles all schema types (primitives, objects, arrays, composition) and
 * preserves constraints, formats, and metadata. Nullable schemas are converted
 * to OAS 3.1 type arrays (e.g., `['string', 'null']`).
 *
 * @param schema - The IR schema to convert
 * @returns A valid canonical OpenAPI 3.2 SchemaObject
 *
 * @example
 * ```typescript
 * const irSchema: CastrSchema = {
 *   type: 'string',
 *   format: 'email',
 *   metadata: { nullable: true, ... },
 * };
 *
 * const oasSchema = writeOpenApiSchema(irSchema);
 * // { type: ['string', 'null'], format: 'email' }
 * ```
 *
 * @public
 */
export function writeOpenApiSchema(schema: CastrSchema): JsonSchemaObject {
  if (schema.booleanSchema !== undefined) {
    throw new Error(
      `Boolean schema \`${String(schema.booleanSchema)}\` is rejected by the OpenAPI writer ` +
        'as a matter of closed-world policy: canonical OpenAPI 3.2 output is restricted to ' +
        'object-form schemas, even though its JSON Schema 2020-12 dialect permits boolean ' +
        'schemas. Use an explicit object-form schema instead.',
    );
  }

  assertSchemaSupportsIntegerTargetCapabilities(schema, CANONICAL_OPENAPI_TARGET_LABEL);

  const result: JsonSchemaObject = {};

  if (schema.$ref !== undefined) {
    // 2020-12 applies $ref siblings, so sibling fields are written too.
    result.$ref = schema.$ref;
  }

  writeSchemaFields(schema, result);

  return result;
}
