/**
 * JSON Schema 2020-12 keyword parsing helpers.
 *
 * Extracted from json-schema-parser.helpers.ts to comply with ADR-036
 * max-lines constraint. Handles 2020-12 applicator and validation keywords
 * (unevaluatedProperties, unevaluatedItems, dependentSchemas,
 * dependentRequired, minContains, maxContains).
 *
 * **Library Types:**
 * Uses JsonSchema2020 (extends SchemaObject from openapi3-ts/oas31).
 *
 * @module parsers/json-schema/json-schema-parser.2020-keywords
 * @internal
 */

import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
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

function parseSingleSchemaOrRef(
  value: SchemaObject | ReferenceObject,
  parseSchema: ParseSchemaFn,
): CastrSchema {
  if (isReferenceObject(value)) {
    return parseSchema({ $ref: value.$ref });
  }
  return parseSchema(value);
}
