/**
 * JSON Schema writer — converts CastrSchema (IR) to pure JSON Schema 2020-12.
 *
 * Core JSON Schema field logic is delegated to the shared json-schema-fields
 * module.  Unlike the OpenAPI writer, this module does NOT add OAS-specific
 * extensions (xml, externalDocs, discriminator).
 */

import type { CastrSchema } from '../../ir/index.js';
import { assertSchemaSupportsIntegerTargetCapabilities } from '../../compatibility/integer-target-capabilities.js';
import type { JsonSchemaNode } from '../shared/json-schema-fields.js';
import { writeAllJsonSchemaFields } from '../shared/json-schema-fields.js';

/**
 * Converts an IR schema to a pure JSON Schema 2020-12 value.
 *
 * Handles all schema types (primitives, objects, arrays, composition) and
 * preserves constraints, formats, and metadata. Nullable schemas are converted
 * to JSON Schema type arrays (e.g., `['string', 'null']`). Boolean schemas
 * (`booleanSchema` IR nodes) are emitted as bare `true`/`false` — at the root
 * and at every recursive position, since 2020-12 admits boolean schemas
 * everywhere a schema may appear. The function is its own recursion callback,
 * so root and nested schemas take one code path.
 *
 * Unlike the OpenAPI writer, this does NOT write OAS-only extension fields
 * (xml, externalDocs, discriminator).
 *
 * @param schema - The IR schema to convert
 * @returns A valid JSON Schema 2020-12 value (object or boolean schema)
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
export function writeJsonSchema(schema: CastrSchema): JsonSchemaNode | boolean {
  if (schema.booleanSchema !== undefined) {
    return schema.booleanSchema;
  }

  assertSchemaSupportsIntegerTargetCapabilities(schema, 'JSON Schema 2020-12');

  const result: JsonSchemaNode = {};

  if (schema.$ref !== undefined) {
    result.$ref = schema.$ref;
    return result;
  }

  writeAllJsonSchemaFields(schema, result, writeJsonSchema);
  normaliseExampleForJsonSchema(result);

  return result;
}

/**
 * Normalise `example`/`examples` for pure JSON Schema 2020-12 output.
 *
 * JSON Schema 2020-12 defines `examples` (array) as the standard keyword.
 * The singular `example` keyword is an OAS extension and must not appear in
 * pure JSON Schema output. If only `example` is present, fold it into
 * `examples`. If both are present, `examples` takes precedence and `example`
 * is suppressed.
 *
 * @internal
 */
function normaliseExampleForJsonSchema(result: JsonSchemaNode): void {
  if (result.example === undefined) {
    return;
  }

  if (result.examples === undefined) {
    result.examples = [result.example];
  }

  delete result.example;
}
