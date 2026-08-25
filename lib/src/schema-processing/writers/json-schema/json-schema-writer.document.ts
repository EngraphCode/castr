/**
 * JSON Schema document writer — standalone and bundled modes.
 *
 * Provides two entry points for generating JSON Schema 2020-12 documents:
 *
 * - {@link writeJsonSchemaDocument} — wraps a single schema with `$schema`
 * - {@link writeJsonSchemaBundle} — collects all schema components under `$defs`
 */

import type { CastrSchema, CastrSchemaComponent } from '../../ir/index.js';
import { assertSchemaComponentsSupportIntegerTargetCapabilities } from '../../compatibility/integer-target-capabilities.js';
import type { JsonSchemaNode } from '../shared/json-schema-fields.js';
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
 * A boolean schema (`booleanSchema` IR node) is emitted as the bare boolean:
 * `true`/`false` are complete JSON Schema 2020-12 documents in themselves,
 * and wrapping one in an object would fabricate structure the input never
 * had. The `$schema` dialect URI is writer-added metadata, so dropping it
 * for a boolean root loses nothing the input supplied.
 *
 * @param schema - The IR schema to convert
 * @returns A valid JSON Schema 2020-12 document (with `$schema` set on
 *   object documents; bare `true`/`false` for boolean schemas)
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
export function writeJsonSchemaDocument(schema: CastrSchema): JsonSchemaNode | boolean {
  const result = writeJsonSchema(schema);
  if (typeof result === 'boolean') {
    return result;
  }
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
export function writeJsonSchemaBundle(components: CastrSchemaComponent[]): JsonSchemaNode {
  assertSchemaComponentsSupportIntegerTargetCapabilities(components, 'JSON Schema 2020-12');

  const result: JsonSchemaNode = {
    $schema: JSON_SCHEMA_2020_12_DIALECT,
  };

  if (components.length === 0) {
    return result;
  }

  const sorted = [...components].sort((left, right) => left.name.localeCompare(right.name));
  const defs: Record<string, JsonSchemaNode | boolean> = {};

  for (const component of sorted) {
    // Boolean schemas are valid `$defs` members in JSON Schema 2020-12 and
    // are emitted as bare `true`/`false`, exactly as authored.
    defs[component.name] = writeJsonSchema(component.schema);
  }

  result.$defs = defs;

  return result;
}
