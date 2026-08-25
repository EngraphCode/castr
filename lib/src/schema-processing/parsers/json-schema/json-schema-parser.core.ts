/**
 * JSON Schema core parser — converts JSON Schema 2020-12 objects into CastrSchema IR.
 *
 * Accepts normalized 2020-12 schema objects (pre-processed by the Draft 07
 * normalizer) and produces CastrSchema IR nodes.
 *
 * **Library Types:**
 * Works from JsonSchema2020, which extends the shared OpenAPI seam for JSON Schema 2020-12.
 */

import type { CastrSchema } from '../../ir/index.js';
import type { JsonSchema2020 } from './json-schema-parser.types.js';

import { parseObjectFields } from './json-schema-parser.object-fields.js';
import {
  createDefaultMetadata,
  parseType,
  parseFormat,
  parseStringConstraints,
  parseNumberConstraints,
  parseEnumConst,
  parseCoreMetadata,
  parseAccessMetadata,
  parseArrayFields,
  parseComposition,
} from './json-schema-parser.helpers.js';
import { parse2020Keywords } from './json-schema-parser.2020-keywords.js';
import { assertPortableIntegerInputSemanticsSupported } from '../../compatibility/integer-target-capabilities.js';

// Re-export for public API compatibility
export type { JsonSchema2020 } from './json-schema-parser.types.js';

const NULL_TYPE = 'null';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a normalized JSON Schema 2020-12 value into CastrSchema IR.
 *
 * Boolean schemas (`true`/`false`) are accepted and converted to
 * `CastrSchema` nodes with the `booleanSchema` discriminator set — at the
 * root and at every recursive position, since the function is its own
 * recursion callback (one code path for root and nested schemas).
 *
 * @public
 */
export function parseJsonSchemaObject(input: JsonSchema2020 | boolean): CastrSchema {
  if (typeof input === 'boolean') {
    return { booleanSchema: input, metadata: createDefaultMetadata() };
  }

  if (input.$ref !== undefined) {
    assertPortableIntegerInputSemanticsSupported('JSON Schema 2020-12', input.type, input.format);
    return { $ref: input.$ref, metadata: createDefaultMetadata() };
  }

  const nullable = computeNullable(input);
  const result: CastrSchema = { metadata: createDefaultMetadata({ nullable }) };

  parseType(input, result, nullable);
  parseFormat(input, result);
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
