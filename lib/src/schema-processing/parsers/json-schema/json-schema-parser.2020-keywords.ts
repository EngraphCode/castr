/**
 * JSON Schema 2020-12 keyword parsing helpers.
 *
 * Extracted from json-schema-parser.helpers.ts to comply with ADR-036
 * max-lines constraint. Handles 2020-12 applicator and validation keywords
 * (unevaluatedProperties, unevaluatedItems, dependentSchemas,
 * dependentRequired, minContains, maxContains, if/then/else).
 *
 * **Library Types:**
 * Uses JsonSchema2020 (extends the shared OpenAPI seam).
 *
 * @module parsers/json-schema/json-schema-parser.2020-keywords
 * @internal
 */

import {
  type SchemaObject,
  type ReferenceObject,
  isReferenceObject,
} from '../../../shared/openapi-types.js';
import type { CastrSchema } from '../../ir/index.js';
import type { JsonSchema2020 } from './json-schema-parser.types.js';

type ParseSchemaFn = (input: JsonSchema2020) => CastrSchema;

// ── 2020-12 keywords ──────────────────────────────────────────────────────

/** @internal */
export function parse2020Keywords(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  parseBoolOrSchema(input.unevaluatedProperties, 'unevaluatedProperties', result, parseSchema);
  parseBoolOrSchema(input.unevaluatedItems, 'unevaluatedItems', result, parseSchema);
  if (input.dependentSchemas !== undefined) {
    parseDependentSchemas(input, result, parseSchema);
  }
  if (input.dependentRequired !== undefined) {
    result.dependentRequired = input.dependentRequired;
  }
  if (input.minContains !== undefined) {
    result.minContains = input.minContains;
  }
  if (input.maxContains !== undefined) {
    result.maxContains = input.maxContains;
  }
  if (input.contains !== undefined) {
    result.contains = parseSingleSchemaOrRef(input.contains, parseSchema);
  }
  parseConditionalApplicators(input, result, parseSchema);
  parseAnchorKeywords(input, result);
}

function parseBoolOrSchema(
  value: SchemaObject | ReferenceObject | boolean | undefined,
  field: 'unevaluatedProperties' | 'unevaluatedItems',
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  if (value === undefined) {
    return;
  }
  if (typeof value === 'boolean') {
    result[field] = value;
    return;
  }
  result[field] = parseSingleSchemaOrRef(value, parseSchema);
}

function parseDependentSchemas(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  const ds = input.dependentSchemas;
  if (ds === undefined) {
    return;
  }
  const parsed: Record<string, CastrSchema> = {};
  for (const [k, v] of Object.entries(ds)) {
    parsed[k] = parseSingleSchemaOrRef(v, parseSchema);
  }
  result.dependentSchemas = parsed;
}

// ── if / then / else conditional applicators ──────────────────────────────

function parseConditionalApplicators(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  if (input.if !== undefined) {
    result.if = parseBoolOrSchemaOrRef(input.if, parseSchema);
  }
  if (input.then !== undefined) {
    result.then = parseBoolOrSchemaOrRef(input.then, parseSchema);
  }
  if (input.else !== undefined) {
    result.else = parseBoolOrSchemaOrRef(input.else, parseSchema);
  }
}

/**
 * Parse a value that may be a boolean schema, a schema object, or a $ref.
 * Boolean schemas are converted to `{ booleanSchema, metadata }` IR nodes.
 * Metadata is constructed inline to avoid circular dependency with core.ts.
 */
function parseBoolOrSchemaOrRef(
  value: SchemaObject | ReferenceObject | boolean,
  parseSchema: ParseSchemaFn,
): CastrSchema {
  if (typeof value === 'boolean') {
    return {
      booleanSchema: value,
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };
  }
  return parseSingleSchemaOrRef(value, parseSchema);
}

function parseSingleSchemaOrRef(
  value: SchemaObject | ReferenceObject,
  parseSchema: ParseSchemaFn,
): CastrSchema {
  if (isReferenceObject(value)) {
    return parseSchema({ $ref: value.$ref });
  }
  return parseSchema(value);
}

// ── $anchor / $dynamicRef / $dynamicAnchor ────────────────────────────────

function parseAnchorKeywords(input: JsonSchema2020, result: CastrSchema): void {
  if (input.$anchor !== undefined) {
    result.$anchor = input.$anchor;
  }
  if (input.$dynamicRef !== undefined) {
    result.$dynamicRef = input.$dynamicRef;
  }
  if (input.$dynamicAnchor !== undefined) {
    result.$dynamicAnchor = input.$dynamicAnchor;
  }
}
