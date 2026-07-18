import { type ReferenceObject, isReferenceObject } from '../../../../shared/openapi-types.js';
import type { JsonSchema2020 } from '../json-schema-parser.types.js';
import type {
  Draft07Input,
  Draft07SchemaMap,
  Draft07SchemaOrRef,
  Draft07SchemaOrRefOrBool,
  Draft07SubSchemaKeywords,
} from './json-schema-parser.normalization.types.js';
import { rewriteRefObject } from './json-schema-parser.normalization.refs.js';

type NormalizeFn = (input: Draft07Input) => JsonSchema2020;

/**
 * A destructured keyword group: like `Pick`, but with `undefined` made
 * explicit so destructured-possibly-absent values satisfy
 * `exactOptionalPropertyTypes`.
 */
type KeywordGroup<K extends keyof Draft07SubSchemaKeywords> = {
  [P in K]: Draft07SubSchemaKeywords[P] | undefined;
};

/**
 * The classified sub-schema keyword groups — the runtime shape of the
 * single keyword-classification table on `Draft07SubSchemaKeywords`.
 */
export interface ClassifiedKeywordGroups {
  maps: KeywordGroup<'$defs' | 'dependentSchemas' | 'properties' | 'patternProperties'>;
  arrays: KeywordGroup<'allOf' | 'oneOf' | 'anyOf' | 'prefixItems'>;
  singles: KeywordGroup<'not' | 'propertyNames' | 'contains'>;
  boolOrSchemas: KeywordGroup<
    | 'contentSchema'
    | 'additionalProperties'
    | 'if'
    | 'then'
    | 'else'
    | 'unevaluatedProperties'
    | 'unevaluatedItems'
  >;
}

/**
 * Re-apply every classified sub-schema keyword group with recursive
 * normalization.
 */
export function applyClassifiedKeywords(
  result: JsonSchema2020,
  groups: ClassifiedKeywordGroups,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 {
  let out = applyNormalizedMaps(result, groups.maps, normalizeDraft07);
  out = applyNormalizedArrays(out, groups.arrays, normalizeDraft07);
  out = applyNormalizedSingles(out, groups.singles, normalizeDraft07);
  return applyNormalizedBoolOrSchemas(out, groups.boolOrSchemas, normalizeDraft07);
}

export function applyNumericBounds(
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

export function applyNormalizedItems(
  result: JsonSchema2020,
  items: Draft07Input['items'],
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 {
  if (items !== undefined && !Array.isArray(items)) {
    result.items = narrowSchemaOrRef(items, normalizeDraft07, 'items');
  }
  return result;
}

function applyNormalizedMaps(
  result: JsonSchema2020,
  maps: KeywordGroup<'$defs' | 'dependentSchemas' | 'properties' | 'patternProperties'>,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 {
  if (maps.$defs !== undefined) {
    result.$defs = narrowSchemaMap(maps.$defs, normalizeDraft07, '$defs');
  }
  if (maps.dependentSchemas !== undefined) {
    result.dependentSchemas = narrowSchemaMap(
      maps.dependentSchemas,
      normalizeDraft07,
      'dependentSchemas',
    );
  }
  if (maps.properties !== undefined) {
    result.properties = narrowSchemaMap(maps.properties, normalizeDraft07, 'properties');
  }
  if (maps.patternProperties !== undefined) {
    result.patternProperties = narrowSchemaMap(
      maps.patternProperties,
      normalizeDraft07,
      'patternProperties',
    );
  }
  return result;
}

function applyNormalizedArrays(
  result: JsonSchema2020,
  arrays: KeywordGroup<'allOf' | 'oneOf' | 'anyOf' | 'prefixItems'>,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 {
  if (arrays.allOf !== undefined) {
    result.allOf = narrowSchemaArray(arrays.allOf, normalizeDraft07, 'allOf');
  }
  if (arrays.oneOf !== undefined) {
    result.oneOf = narrowSchemaArray(arrays.oneOf, normalizeDraft07, 'oneOf');
  }
  if (arrays.anyOf !== undefined) {
    result.anyOf = narrowSchemaArray(arrays.anyOf, normalizeDraft07, 'anyOf');
  }
  if (arrays.prefixItems !== undefined) {
    result.prefixItems = narrowSchemaArray(arrays.prefixItems, normalizeDraft07, 'prefixItems');
  }
  return result;
}

function applyNormalizedSingles(
  result: JsonSchema2020,
  singles: KeywordGroup<'not' | 'propertyNames' | 'contains'>,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 {
  if (singles.not !== undefined) {
    result.not = narrowSchemaOrRef(singles.not, normalizeDraft07, 'not');
  }
  if (singles.propertyNames !== undefined) {
    result.propertyNames = narrowSchemaOrRef(
      singles.propertyNames,
      normalizeDraft07,
      'propertyNames',
    );
  }
  if (singles.contains !== undefined) {
    result.contains = narrowSchemaOrRef(singles.contains, normalizeDraft07, 'contains');
  }
  return result;
}

function applyNormalizedBoolOrSchemas(
  result: JsonSchema2020,
  keywords: KeywordGroup<
    | 'contentSchema'
    | 'additionalProperties'
    | 'if'
    | 'then'
    | 'else'
    | 'unevaluatedProperties'
    | 'unevaluatedItems'
  >,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 {
  if (keywords.contentSchema !== undefined) {
    result.contentSchema = narrowBoolOrSchema(keywords.contentSchema, normalizeDraft07);
  }
  if (keywords.additionalProperties !== undefined) {
    result.additionalProperties = narrowBoolOrSchema(
      keywords.additionalProperties,
      normalizeDraft07,
    );
  }
  if (keywords.if !== undefined) {
    result.if = narrowBoolOrSchema(keywords.if, normalizeDraft07);
  }
  if (keywords.then !== undefined) {
    result.then = narrowBoolOrSchema(keywords.then, normalizeDraft07);
  }
  if (keywords.else !== undefined) {
    result.else = narrowBoolOrSchema(keywords.else, normalizeDraft07);
  }
  if (keywords.unevaluatedProperties !== undefined) {
    result.unevaluatedProperties = narrowBoolOrSchema(
      keywords.unevaluatedProperties,
      normalizeDraft07,
    );
  }
  if (keywords.unevaluatedItems !== undefined) {
    result.unevaluatedItems = narrowBoolOrSchema(keywords.unevaluatedItems, normalizeDraft07);
  }
  return result;
}

function narrowBoolOrSchema(
  value: Draft07SchemaOrRefOrBool,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 | ReferenceObject | boolean {
  return typeof value === 'boolean' ? value : narrowSchemaOrRefValue(value, normalizeDraft07);
}

/**
 * Narrow a schema-or-reference value at a keyword position that the typed
 * pipeline models as object-form only.
 *
 * Boolean JSON Schemas are valid at every schema position in Draft 07 and
 * 2020-12, but untyped JSON ingress used to funnel them through
 * `{ ...boolean }`, silently turning reject-all (`false`) into allow-any
 * (`{}`). Until booleans are carried at these positions, they are rejected
 * explicitly — never silently inverted.
 */
function narrowSchemaOrRef(
  value: Draft07SchemaOrRef | boolean,
  normalizeDraft07: NormalizeFn,
  keyword: string,
): JsonSchema2020 | ReferenceObject {
  if (typeof value === 'boolean') {
    throw new Error(buildBooleanSubSchemaRejectionMessage(keyword, value));
  }
  return narrowSchemaOrRefValue(value, normalizeDraft07);
}

function narrowSchemaOrRefValue(
  value: Draft07SchemaOrRef,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 | ReferenceObject {
  return isReferenceObject(value) ? rewriteRefObject(value) : normalizeDraft07(value);
}

/**
 * Build the explicit rejection message for a boolean sub-schema at a
 * position the parser does not yet carry booleans.
 */
function buildBooleanSubSchemaRejectionMessage(keyword: string, value: boolean): string {
  const objectForm = value ? '`{}`' : '`{ "not": {} }`';
  return (
    `Boolean JSON Schema \`${String(value)}\` at '${keyword}' is valid JSON Schema, but the ` +
    `parser does not yet carry boolean schemas at this position and refuses to normalise it ` +
    `silently (\`false\` would invert from reject-all to allow-any). Use the equivalent ` +
    `object form ${objectForm} instead.`
  );
}

function narrowSchemaArray(
  value: (Draft07SchemaOrRef | boolean)[],
  normalizeDraft07: NormalizeFn,
  keyword: string,
): (JsonSchema2020 | ReferenceObject)[] {
  return value.map((item) => narrowSchemaOrRef(item, normalizeDraft07, keyword));
}

function narrowSchemaMap(
  value: Draft07SchemaMap,
  normalizeDraft07: NormalizeFn,
  keyword: string,
): Record<string, JsonSchema2020 | ReferenceObject> {
  const out: Record<string, JsonSchema2020 | ReferenceObject> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = narrowSchemaOrRef(item, normalizeDraft07, `${keyword}.${key}`);
  }
  return out;
}
