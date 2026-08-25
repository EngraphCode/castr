/**
 * JSON Schema 2020-12 type definition.
 *
 * Built on the shared OpenAPI seam, adding the 2020-12 applicator and
 * validation keywords that OAS 3.1 does not explicitly surface. Because
 * every recursive position admits boolean schemas, this type is
 * deliberately NOT a `SchemaObject` subtype.
 *
 * Extracted to its own module to avoid circular dependencies: core.ts imports
 * helper functions from helpers.ts and 2020-keywords.ts, which in turn need
 * the JsonSchema2020 type.
 */

import type { SchemaObject, ReferenceObject } from '../../../shared/openapi-types.js';

/**
 * Schema, `$ref`, or boolean schema — 2020-12 admits `true`/`false` at every
 * schema position, so every recursive keyword below accepts this union.
 */
type JsonSchemaOrBool = JsonSchema2020 | ReferenceObject | boolean;

/**
 * Shared-seam keys re-declared below so their child positions admit boolean
 * schemas. An `interface extends` override cannot widen an inherited member
 * (TS2430), so the type is built as `Omit` + re-declaration instead — the
 * same pattern `Draft07Input` uses.
 */
type ReDeclaredSchemaKeys =
  | 'properties'
  | 'patternProperties'
  | 'propertyNames'
  | 'items'
  | 'prefixItems'
  | 'allOf'
  | 'oneOf'
  | 'anyOf'
  | 'not'
  | 'contains'
  | 'additionalProperties'
  | 'unevaluatedProperties'
  | 'unevaluatedItems'
  | 'dependentSchemas'
  | 'if'
  | 'then'
  | 'else';

/**
 * JSON Schema 2020-12 with keywords not modelled directly by the shared seam.
 *
 * Builds on the domain expert library type with 2020-12 applicator and
 * validation keywords that OAS 3.1 does not explicitly surface. Every
 * recursive schema position admits a boolean schema (`true`/`false`),
 * per the 2020-12 specification — which is why this is an Omit-based
 * alias rather than a `SchemaObject` subtype.
 *
 * @public
 */
export type JsonSchema2020 = Omit<SchemaObject, ReDeclaredSchemaKeys> & {
  $id?: string;
  $defs?: Record<string, JsonSchemaOrBool>;
  properties?: Record<string, JsonSchemaOrBool>;
  patternProperties?: Record<string, JsonSchemaOrBool>;
  propertyNames?: JsonSchemaOrBool;
  items?: JsonSchemaOrBool;
  prefixItems?: JsonSchemaOrBool[];
  allOf?: JsonSchemaOrBool[];
  oneOf?: JsonSchemaOrBool[];
  anyOf?: JsonSchemaOrBool[];
  not?: JsonSchemaOrBool;
  contains?: JsonSchemaOrBool;
  additionalProperties?: JsonSchemaOrBool;
  unevaluatedProperties?: JsonSchemaOrBool;
  unevaluatedItems?: JsonSchemaOrBool;
  dependentSchemas?: Record<string, JsonSchemaOrBool>;
  dependentRequired?: Record<string, string[]>;
  minContains?: number;
  maxContains?: number;
  if?: JsonSchemaOrBool;
  then?: JsonSchemaOrBool;
  else?: JsonSchemaOrBool;
  $anchor?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
};
