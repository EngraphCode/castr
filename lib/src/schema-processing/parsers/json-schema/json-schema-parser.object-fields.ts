/**
 * JSON Schema object-field parsing helpers.
 *
 * Preserves explicit source `additionalProperties` honestly while leaving
 * omitted portable input untouched.
 *
 * @module parsers/json-schema/json-schema-parser.object-fields
 * @internal
 */

import {
  type ReferenceObject,
  type SchemaObject,
  isReferenceObject,
} from '../../../shared/openapi-types.js';
import {
  CastrSchemaProperties,
  ensureObjectTypeForObjectKeywords,
  isObjectSchemaType,
} from '../../ir/index.js';
import type { CastrSchema } from '../../ir/index.js';
import type { JsonSchema2020 } from './json-schema-parser.types.js';

type ParseSchemaFn = (input: JsonSchema2020) => CastrSchema;

/** @internal */
export function parseObjectFields(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  result.type = ensureObjectTypeForObjectKeywords(result.type, {
    hasProperties: input.properties !== undefined,
    hasRequired: input.required !== undefined && input.required.length > 0,
    hasAdditionalProperties: input.additionalProperties !== undefined,
  });

  if (input.properties !== undefined) {
    parseProperties(input, result, parseSchema);
  }
  if (input.required !== undefined && input.required.length > 0) {
    result.required = input.required;
  }
  parseAdditionalProps(input, result, parseSchema);
  parsePatternProperties(input, result, parseSchema);
  parsePropertyNames(input, result, parseSchema);
}

function parsePatternProperties(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  const patternProps = input.patternProperties;
  if (patternProps === undefined) {
    return;
  }

  const parsed: Record<string, CastrSchema> = {};
  for (const [pattern, value] of Object.entries(patternProps)) {
    parsed[pattern] = parseSingleSchemaOrRef(value, parseSchema);
  }

  result.patternProperties = parsed;
}

function parsePropertyNames(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  const propNames = input.propertyNames;
  if (propNames === undefined) {
    return;
  }

  result.propertyNames = parseSingleSchemaOrRef(propNames, parseSchema);
}

function parseProperties(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  const props = input.properties;
  if (props === undefined) {
    return;
  }

  const required = input.required ?? [];
  const parsed: Record<string, CastrSchema> = {};
  for (const [key, value] of Object.entries(props)) {
    const schema = parseSingleSchemaOrRef(value, parseSchema);
    schema.metadata.required = arrayContains(required, key);
    parsed[key] = schema;
  }

  result.properties = new CastrSchemaProperties(parsed);
}

function parseAdditionalProps(
  input: JsonSchema2020,
  result: CastrSchema,
  parseSchema: ParseSchemaFn,
): void {
  const additionalProperties = input.additionalProperties;

  if (!isObjectKeywordCandidate(input, result)) {
    return;
  }

  if (additionalProperties === undefined) {
    return;
  }

  if (typeof additionalProperties === 'boolean') {
    result.additionalProperties = additionalProperties;
    return;
  }

  result.additionalProperties = parseSingleSchemaOrRef(additionalProperties, parseSchema);
}

function isObjectKeywordCandidate(input: JsonSchema2020, result: CastrSchema): boolean {
  return (
    isObjectSchemaType(result.type) ||
    input.properties !== undefined ||
    (Array.isArray(input.required) && input.required.length > 0) ||
    input.additionalProperties !== undefined
  );
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

function arrayContains(values: readonly string[], expectedValue: string): boolean {
  for (const value of values) {
    if (value === expectedValue) {
      return true;
    }
  }

  return false;
}
