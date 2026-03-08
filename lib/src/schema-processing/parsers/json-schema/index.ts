/**
 * JSON Schema parser module — parses JSON Schema (Draft 07 + 2020-12) into IR.
 *
 * @example
 * ```typescript
 * import { parseJsonSchema, parseJsonSchemaDocument } from '@engraph/castr';
 *
 * const irSchema = parseJsonSchema({ type: 'object', properties: { ... } });
 * const components = parseJsonSchemaDocument({
 *   $defs: { Address: { type: 'object', ... } },
 * });
 * ```
 *
 * @module parsers/json-schema
 */

export type { JsonSchema2020 } from './json-schema-parser.core.js';
export { parseJsonSchemaObject } from './json-schema-parser.core.js';
export { normalizeDraft07 } from './json-schema-parser.normalization.js';
export type { Draft07Input } from './json-schema-parser.normalization.js';

import type { CastrSchema, CastrSchemaComponent } from '../../ir/index.js';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type { JsonSchema2020 } from './json-schema-parser.core.js';
import { parseJsonSchemaObject, createDefaultMetadata } from './json-schema-parser.core.js';
import { normalizeDraft07 } from './json-schema-parser.normalization.js';
import type { Draft07Input } from './json-schema-parser.normalization.js';

/**
 * Parse a JSON Schema (Draft 07 or 2020-12) into CastrSchema IR.
 *
 * Automatically normalizes Draft 07 constructs to 2020-12 before parsing.
 *
 * @param input - A JSON Schema 2020-12 object (possibly with Draft 07 constructs)
 * @returns CastrSchema IR node
 * @public
 */
export function parseJsonSchema(input: Draft07Input): CastrSchema {
  const normalized = normalizeDraft07(input);
  return parseJsonSchemaObject(normalized);
}

/**
 * Parse a JSON Schema document with `$defs` into IR components.
 *
 * @param input - A JSON Schema document with $defs
 * @returns Array of IR schema components
 * @public
 */
export function parseJsonSchemaDocument(input: Draft07Input): CastrSchemaComponent[] {
  const normalized = normalizeDraft07(input);
  return extractDefsAsComponents(normalized);
}

function extractDefsAsComponents(normalized: JsonSchema2020): CastrSchemaComponent[] {
  const components: CastrSchemaComponent[] = [];
  const defs = normalized.$defs;
  if (defs === undefined) {
    return components;
  }

  for (const [name, defSchema] of Object.entries(defs)) {
    if (isReferenceObject(defSchema)) {
      continue;
    }
    const schema = parseJsonSchemaObject(defSchema);
    components.push(buildComponent(name, schema));
  }

  return components;
}

function buildComponent(name: string, schema: CastrSchema): CastrSchemaComponent {
  return {
    type: 'schema',
    name,
    schema,
    metadata: createDefaultMetadata(),
    description: schema.description ?? '',
  };
}
