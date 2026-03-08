/**
 * JSON Schema document writer — standalone and bundled modes.
 *
 * Provides two entry points for generating JSON Schema 2020-12 documents:
 *
 * - {@link writeJsonSchemaDocument} — wraps a single schema with `$schema`
 * - {@link writeJsonSchemaBundle} — collects all schema components under `$defs`
 *
 * @module writers/json-schema/json-schema-writer.document
 */

import type { CastrSchema, CastrSchemaComponent } from '../../ir/index.js';
import type { JsonSchemaObject } from '../shared/json-schema-fields.js';
import { writeJsonSchema } from './json-schema-writer.schema.js';

/**
 * JSON Schema 2020-12 dialect URI.
 * @internal
 */
const JSON_SCHEMA_2020_12_DIALECT = 'https://json-schema.org/draft/2020-12/schema';

/**
 * Converts an IR schema to a standalone JSON Schema 2020-12 document.
 *
 * Adds the `$schema` dialect URI to the output. Use this when emitting
 * a single, self-contained JSON Schema document.
 *
 * @param schema - The IR schema to convert
 * @returns A valid JSON Schema 2020-12 document with `$schema` set
 *
 * @example
 * ```typescript
 * const irSchema: CastrSchema = {
 *   type: 'object',
 *   properties: new CastrSchemaProperties({
 *     name: { type: 'string', metadata: { ... } },
 *   }),
 *   metadata: { ... },
 * };
 *
 * const doc = writeJsonSchemaDocument(irSchema);
 * // { $schema: 'https://json-schema.org/draft/2020-12/schema', type: 'object', ... }
 * ```
 *
 * @public
 */
export function writeJsonSchemaDocument(schema: CastrSchema): JsonSchemaObject {
  const result = writeJsonSchema(schema);
  result.$schema = JSON_SCHEMA_2020_12_DIALECT;
  return result;
}

/**
 * Converts IR schema components into a bundled JSON Schema 2020-12 document.
 *
 * Collects all schema components under a root-level `$defs` object with
 * sorted keys for deterministic output. The root document includes `$schema`
 * but no root-level type (it is a definitions-only container).
 *
 * @param components - The schema components to bundle
 * @returns A JSON Schema 2020-12 document with `$defs` containing all schemas
 *
 * @example
 * ```typescript
 * const components: CastrSchemaComponent[] = [
 *   { type: 'schema', name: 'User', schema: userSchema, metadata: { ... } },
 *   { type: 'schema', name: 'Address', schema: addressSchema, metadata: { ... } },
 * ];
 *
 * const bundle = writeJsonSchemaBundle(components);
 * // {
 * //   $schema: 'https://json-schema.org/draft/2020-12/schema',
 * //   $defs: { Address: { ... }, User: { ... } }
 * // }
 * ```
 *
 * @public
 */
export function writeJsonSchemaBundle(components: CastrSchemaComponent[]): JsonSchemaObject {
  const result: JsonSchemaObject = {
    $schema: JSON_SCHEMA_2020_12_DIALECT,
  };

  if (components.length === 0) {
    return result;
  }

  const sorted = [...components].sort((left, right) => left.name.localeCompare(right.name));
  const defs: Record<string, JsonSchemaObject> = {};

  for (const component of sorted) {
    defs[component.name] = writeJsonSchema(component.schema);
  }

  result.$defs = defs;

  return result;
}
