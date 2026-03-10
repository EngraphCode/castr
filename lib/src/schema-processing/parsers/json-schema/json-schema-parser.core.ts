/**
 * JSON Schema core parser — converts JSON Schema 2020-12 objects into CastrSchema IR.
 *
 * Accepts normalized 2020-12 schema objects (pre-processed by the Draft 07
 * normalizer) and produces CastrSchema IR nodes.
 *
 * **Library Types:**
 * Extends SchemaObject from openapi3-ts/oas31 (JSON Schema 2020-12).
 *
 * @module parsers/json-schema/json-schema-parser.core
 */

import type { CastrSchema, CastrSchemaNode } from '../../ir/index.js';
import type { JsonSchema2020 } from './json-schema-parser.types.js';
import { parseObjectFields } from './json-schema-parser.object-fields.js';
import {
  parseType,
  parseStringConstraints,
  parseNumberConstraints,
  parseEnumConst,
  parseCoreMetadata,
  parseAccessMetadata,
  parseArrayFields,
  parseComposition,
} from './json-schema-parser.helpers.js';
import { parse2020Keywords } from './json-schema-parser.2020-keywords.js';

// Re-export for public API compatibility
export type { JsonSchema2020 } from './json-schema-parser.types.js';

const NULL_TYPE = 'null';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a normalized JSON Schema 2020-12 object into CastrSchema IR.
 * @public
 */
export function parseJsonSchemaObject(input: JsonSchema2020): CastrSchema {
  if (input.$ref !== undefined) {
    return { $ref: input.$ref, metadata: createDefaultMetadata() };
  }

  const nullable = computeNullable(input);
  const result: CastrSchema = { metadata: createDefaultMetadata({ nullable }) };

  parseType(input, result, nullable);
  parseStringConstraints(input, result);
  parseNumberConstraints(input, result);
  parseEnumConst(input, result);
  parseObjectFields(input, result, parseJsonSchemaObject);
  parseArrayFields(input, result, parseJsonSchemaObject);
  parseComposition(input, result, parseJsonSchemaObject);
  parseCoreMetadata(input, result);
  parseAccessMetadata(input, result);
  parse2020Keywords(input, result, parseJsonSchemaObject);

  return result;
}

/**
 * Create a default CastrSchemaNode.
 * @internal
 */
export function createDefaultMetadata(overrides?: { nullable?: boolean }): CastrSchemaNode {
  return {
    required: false,
    nullable: overrides?.nullable ?? false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
  };
}

// ---------------------------------------------------------------------------
// Private
// ---------------------------------------------------------------------------

function computeNullable(input: JsonSchema2020): boolean {
  const type = input.type;
  if (!Array.isArray(type)) {
    return false;
  }
  let hasNull = false;
  let nonNullCount = 0;
  for (const t of type) {
    if (t === NULL_TYPE) {
      hasNull = true;
    } else {
      nonNullCount += 1;
    }
  }
  return hasNull && nonNullCount > 0;
}
