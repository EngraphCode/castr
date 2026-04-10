import { type ReferenceObject, isReferenceObject } from '../../../../shared/openapi-types.js';
import type { JsonSchema2020 } from '../json-schema-parser.types.js';
import type {
  Draft07Input,
  Draft07SchemaMap,
  Draft07SchemaOrRef,
} from './json-schema-parser.normalization.types.js';
import { rewriteRefObject } from './json-schema-parser.normalization.refs.js';

export function stripDraft07Keys(
  input: Draft07Input,
  normalizeDraft07: (input: Draft07Input) => JsonSchema2020,
): JsonSchema2020 {
  const {
    definitions: _definitions,
    dependencies: _dependencies,
    exclusiveMinimum,
    exclusiveMaximum,
    items,
    $defs,
    dependentSchemas,
    properties,
    allOf,
    oneOf,
    anyOf,
    not,
    additionalProperties,
    prefixItems,
    ...clean
  } = input;

  let result: JsonSchema2020 = { ...clean };
  result = applyNumericBounds(result, exclusiveMinimum, exclusiveMaximum);
  result = applyNormalizedItems(result, items, normalizeDraft07);
  result = applyNormalizedMaps(result, { $defs, dependentSchemas, properties }, normalizeDraft07);
  result = applyNormalizedArrays(result, { allOf, oneOf, anyOf, prefixItems }, normalizeDraft07);
  result = applyNormalizedSingles(result, not, additionalProperties, normalizeDraft07);
  return result;
}

function applyNumericBounds(
  result: JsonSchema2020,
  exclusiveMinimum: Draft07Input['exclusiveMinimum'],
  exclusiveMaximum: Draft07Input['exclusiveMaximum'],
): JsonSchema2020 {
  if (typeof exclusiveMinimum === 'number') {
    result.exclusiveMinimum = exclusiveMinimum;
  }
  if (typeof exclusiveMaximum === 'number') {
    result.exclusiveMaximum = exclusiveMaximum;
  }
  return result;
}

function applyNormalizedItems(
  result: JsonSchema2020,
  items: Draft07Input['items'],
  normalizeDraft07: (input: Draft07Input) => JsonSchema2020,
): JsonSchema2020 {
  if (items !== undefined && !Array.isArray(items)) {
    result.items = narrowSchemaOrRef(items, normalizeDraft07);
  }
  return result;
}

function applyNormalizedMaps(
  result: JsonSchema2020,
  maps: {
    $defs: Draft07Input['$defs'] | undefined;
    dependentSchemas: Draft07Input['dependentSchemas'] | undefined;
    properties: Draft07Input['properties'] | undefined;
  },
  normalizeDraft07: (input: Draft07Input) => JsonSchema2020,
): JsonSchema2020 {
  if (maps.$defs !== undefined) {
    result.$defs = narrowSchemaMap(maps.$defs, normalizeDraft07);
  }
  if (maps.dependentSchemas !== undefined) {
    result.dependentSchemas = narrowSchemaMap(maps.dependentSchemas, normalizeDraft07);
  }
  if (maps.properties !== undefined) {
    result.properties = narrowSchemaMap(maps.properties, normalizeDraft07);
  }
  return result;
}

function applyNormalizedArrays(
  result: JsonSchema2020,
  arrays: {
    allOf: Draft07Input['allOf'] | undefined;
    oneOf: Draft07Input['oneOf'] | undefined;
    anyOf: Draft07Input['anyOf'] | undefined;
    prefixItems: Draft07Input['prefixItems'] | undefined;
  },
  normalizeDraft07: (input: Draft07Input) => JsonSchema2020,
): JsonSchema2020 {
  if (arrays.allOf !== undefined) {
    result.allOf = narrowSchemaArray(arrays.allOf, normalizeDraft07);
  }
  if (arrays.oneOf !== undefined) {
    result.oneOf = narrowSchemaArray(arrays.oneOf, normalizeDraft07);
  }
  if (arrays.anyOf !== undefined) {
    result.anyOf = narrowSchemaArray(arrays.anyOf, normalizeDraft07);
  }
  if (arrays.prefixItems !== undefined) {
    result.prefixItems = narrowSchemaArray(arrays.prefixItems, normalizeDraft07);
  }
  return result;
}

function applyNormalizedSingles(
  result: JsonSchema2020,
  not: Draft07Input['not'],
  additionalProperties: Draft07Input['additionalProperties'],
  normalizeDraft07: (input: Draft07Input) => JsonSchema2020,
): JsonSchema2020 {
  if (not !== undefined) {
    result.not = narrowSchemaOrRef(not, normalizeDraft07);
  }
  if (typeof additionalProperties === 'boolean') {
    result.additionalProperties = additionalProperties;
  } else if (additionalProperties !== undefined) {
    result.additionalProperties = narrowSchemaOrRef(additionalProperties, normalizeDraft07);
  }
  return result;
}

function narrowSchemaOrRef(
  value: Draft07SchemaOrRef,
  normalizeDraft07: (input: Draft07Input) => JsonSchema2020,
): JsonSchema2020 | ReferenceObject {
  return isReferenceObject(value) ? rewriteRefObject(value) : normalizeDraft07(value);
}

function narrowSchemaArray(
  value: Draft07SchemaOrRef[],
  normalizeDraft07: (input: Draft07Input) => JsonSchema2020,
): (JsonSchema2020 | ReferenceObject)[] {
  return value.map((item) => narrowSchemaOrRef(item, normalizeDraft07));
}

function narrowSchemaMap(
  value: Draft07SchemaMap,
  normalizeDraft07: (input: Draft07Input) => JsonSchema2020,
): Record<string, JsonSchema2020 | ReferenceObject> {
  const out: Record<string, JsonSchema2020 | ReferenceObject> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = narrowSchemaOrRef(item, normalizeDraft07);
  }
  return out;
}

export function liftDefinitions(input: Draft07Input): Draft07Input {
  if (input.definitions === undefined) {
    return input;
  }
  return { ...input, $defs: { ...(input.$defs ?? {}), ...input.definitions } };
}

export function splitDependencies(input: Draft07Input): Draft07Input {
  if (input.dependencies === undefined) {
    return input;
  }
  const dependentRequired: Record<string, string[]> = {};
  const dependentSchemas: Record<string, Draft07Input | ReferenceObject> = {};

  for (const [key, value] of Object.entries(input.dependencies)) {
    if (Array.isArray(value)) {
      dependentRequired[key] = value;
    } else {
      dependentSchemas[key] = value;
    }
  }

  let result: Draft07Input = { ...input };
  if (Object.keys(dependentRequired).length > 0) {
    result = { ...result, dependentRequired };
  }
  if (Object.keys(dependentSchemas).length > 0) {
    result = { ...result, dependentSchemas };
  }
  return result;
}
