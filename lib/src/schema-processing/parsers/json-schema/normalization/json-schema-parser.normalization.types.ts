import type { ReferenceObject } from '../../../../shared/openapi-types.js';
import type { JsonSchema2020 } from '../json-schema-parser.types.js';

export type Draft07SchemaOrRef = Draft07Input | ReferenceObject;
export type Draft07SchemaOrRefOrBool = Draft07SchemaOrRef | boolean;

/**
 * Map of named sub-schemas.
 *
 * Boolean entries are valid JSON Schema at every map position; positions
 * the pipeline cannot carry them at are rejected explicitly during
 * normalization (never silently normalised to `{}`).
 */
export type Draft07SchemaMap = Record<string, Draft07SchemaOrRefOrBool>;

/**
 * Sub-schema-bearing keywords, classified by value shape.
 *
 * This is the single keyword-classification source for Draft 07
 * normalization. Every keyword listed here is widened on
 * {@link Draft07Input} (so nested Draft 07 constructs type-check) and
 * recursively normalized by `stripDraft07Keys` — the compiler rejects any
 * widened keyword the rebuild step fails to narrow back to
 * {@link JsonSchema2020}.
 *
 * Boolean sub-schemas are accepted by the input types everywhere (they
 * are valid JSON Schema at every schema position); keywords outside the
 * boolean-capable group reject them explicitly during normalization.
 */
export interface Draft07SubSchemaKeywords {
  /** Map-valued: each entry is a sub-schema. */
  $defs?: Draft07SchemaMap;
  dependentSchemas?: Draft07SchemaMap;
  properties?: Draft07SchemaMap;
  patternProperties?: Draft07SchemaMap;

  /** Array-valued: each element is a sub-schema. */
  allOf?: Draft07SchemaOrRefOrBool[];
  oneOf?: Draft07SchemaOrRefOrBool[];
  anyOf?: Draft07SchemaOrRefOrBool[];
  prefixItems?: Draft07SchemaOrRefOrBool[];

  /** Single-schema-valued. */
  not?: Draft07SchemaOrRefOrBool;
  propertyNames?: Draft07SchemaOrRefOrBool;
  contains?: Draft07SchemaOrRefOrBool;

  /** Single-schema-valued, or boolean (boolean-capable downstream). */
  contentSchema?: Draft07SchemaOrRefOrBool;
  additionalProperties?: Draft07SchemaOrRefOrBool;
  if?: Draft07SchemaOrRefOrBool;
  then?: Draft07SchemaOrRefOrBool;
  else?: Draft07SchemaOrRefOrBool;
  unevaluatedProperties?: Draft07SchemaOrRefOrBool;
  unevaluatedItems?: Draft07SchemaOrRefOrBool;
}

export type Draft07Input = Omit<
  JsonSchema2020,
  'exclusiveMinimum' | 'exclusiveMaximum' | 'items' | keyof Draft07SubSchemaKeywords
> &
  Draft07SubSchemaKeywords & {
    definitions?: Draft07SchemaMap;
    dependencies?: Record<string, string[] | Draft07SchemaOrRefOrBool>;
    exclusiveMinimum?: boolean | number;
    exclusiveMaximum?: boolean | number;
    items?: Draft07SchemaOrRefOrBool | Draft07SchemaOrRefOrBool[];
  };
