/**
 * JSON Schema object-field parsing helpers.
 *
 * Extracted from the core helpers module to keep each helper focused and within
 * the repo's file-size limits.
 *
 * @module parsers/json-schema/json-schema-parser.object-fields
 * @internal
 */

import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import {
  CastrSchemaProperties,
  UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY,
  ensureObjectTypeForObjectKeywords,
  resolvePortableUnknownKeyBehavior,
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
    hasUnknownKeyBehaviorExtension: input[UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY] !== undefined,
  });

  if (input.properties !== undefined) {
    parseProperties(input, result, parseSchema);
  }
  if (input.required !== undefined && input.required.length > 0) {
    result.required = input.required;
  }
  parseAdditionalProps(input, result, parseSchema);
  parseUnknownKeyBehavior(input, result);
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
  if (additionalProperties === undefined) {
    return;
  }

  if (typeof additionalProperties === 'boolean') {
    result.additionalProperties = additionalProperties;
    return;
  }

  result.additionalProperties = parseSingleSchemaOrRef(additionalProperties, parseSchema);
}

function parseUnknownKeyBehavior(input: JsonSchema2020, result: CastrSchema): void {
  const unknownKeyBehavior = resolvePortableUnknownKeyBehavior(
    result.additionalProperties,
    input[UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY],
  );

  if (unknownKeyBehavior !== undefined) {
    result.unknownKeyBehavior = unknownKeyBehavior;
  }
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
