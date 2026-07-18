/**
 * JSON Schema 2020-12 keyword parsing helpers.
 *
 * Extracted from json-schema-parser.helpers.ts to comply with ADR-036
 * max-lines constraint. Handles 2020-12 applicator and validation keywords
 * (unevaluatedProperties, unevaluatedItems, dependentSchemas,
 * dependentRequired, minContains, maxContains, if/then/else) plus the
 * content keywords (contentEncoding, contentMediaType, contentSchema).
 *
 * **Library Types:**
 * Uses JsonSchema2020 (extends the shared OpenAPI seam).
 *
 * @internal
 */

import type { SchemaObject, ReferenceObject } from '../../../shared/openapi-types.js';
import type { CastrSchema } from '../../ir/index.js';
import { parseBoolOrSchemaOrRef, parseSingleSchemaOrRef } from './json-schema-parser.helpers.js';
import type { JsonSchema2020 } from './json-schema-parser.types.js';

type ParseSchemaFn = (input: JsonSchema2020) => CastrSchema;

// ── content keywords ──────────────────────────────────────────────────────

/**
 * Parse content keywords (contentEncoding, contentMediaType, contentSchema).
 *
 * All three are valid JSON Schema keywords (contentSchema is 2020-12 only)
 * and are carried into the IR verbatim; `contentSchema` recurses and is
 * boolean-capable (boolean schemas become `booleanSchema` IR nodes).
 *
 * @internal
 */
export function parseContentKeywords(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  if (input.contentEncoding !== undefined) {
    result.contentEncoding = input.contentEncoding;
  }
  if (input.contentMediaType !== undefined) {
    result.contentMediaType = input.contentMediaType;
  }
  if (input.contentSchema !== undefined) {
    result.contentSchema = parseBoolOrSchemaOrRef(input.contentSchema, parseSchema);
  }
}

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
