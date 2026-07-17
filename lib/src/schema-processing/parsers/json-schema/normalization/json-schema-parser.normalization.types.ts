import type { ReferenceObject } from '../../../../shared/openapi-types.js';
import type { JsonSchema2020 } from '../json-schema-parser.types.js';

export type Draft07SchemaOrRef = Draft07Input | ReferenceObject;
export type Draft07SchemaMap = Record<string, Draft07SchemaOrRef>;
export type Draft07SchemaOrRefOrBool = Draft07SchemaOrRef | boolean;

/**
 * Sub-schema-bearing keywords, classified by value shape.
 *
 * This is the single keyword-classification source for Draft 07
 * normalization. Every keyword listed here is widened on
 * {@link Draft07Input} (so nested Draft 07 constructs type-check) and
 * recursively normalized by `stripDraft07Keys` — the compiler rejects any
 * widened keyword the rebuild step fails to narrow back to
 * {@link JsonSchema2020}.
 */
export interface Draft07SubSchemaKeywords {
  /** Map-valued: each entry is a sub-schema. */
  $defs?: Draft07SchemaMap;
  dependentSchemas?: Draft07SchemaMap;
  properties?: Draft07SchemaMap;
  patternProperties?: Draft07SchemaMap;

  /** Array-valued: each element is a sub-schema. */
  allOf?: Draft07SchemaOrRef[];
  oneOf?: Draft07SchemaOrRef[];
  anyOf?: Draft07SchemaOrRef[];
  prefixItems?: Draft07SchemaOrRef[];

  /** Single-schema-valued. */
  not?: Draft07SchemaOrRef;
  propertyNames?: Draft07SchemaOrRef;
  contains?: Draft07SchemaOrRef;
  contentSchema?: Draft07SchemaOrRef;

  /** Single-schema-valued, or boolean. */
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
    dependencies?: Record<string, string[] | Draft07SchemaOrRef>;
    exclusiveMinimum?: boolean | number;
    exclusiveMaximum?: boolean | number;
    items?: Draft07SchemaOrRef | Draft07SchemaOrRef[];
  };
