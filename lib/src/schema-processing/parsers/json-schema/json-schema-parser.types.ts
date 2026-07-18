/**
 * JSON Schema 2020-12 type definition.
 *
 * Extends the shared OpenAPI seam with 2020-12 applicator and
 * validation keywords that OAS 3.1 does not explicitly surface.
 *
 * Extracted to its own module to avoid circular dependencies: core.ts imports
 * helper functions from helpers.ts and 2020-keywords.ts, which in turn need
 * the JsonSchema2020 type.
 */

import type { SchemaObject, ReferenceObject } from '../../../shared/openapi-types.js';

/** Schema or `$ref`, optionally a boolean (boolean schemas are valid at every position). */
type JsonSchemaOrBool = JsonSchema2020 | ReferenceObject | boolean;

/**
 * Sub-schema positions redeclared from the shared seam.
 *
 * The shared OpenAPI seam keeps `SchemaObject` object-form only (or, at its
 * boolean-capable keywords, object-armed with `SchemaObject`), but JSON
 * Schema 2020-12 permits boolean sub-schemas at every schema position, so
 * {@link JsonSchema2020} redeclares every sub-schema position with
 * boolean-capable, self-referencing values.
 */
type SubSchemaSeamKeys =
  | 'properties'
  | 'patternProperties'
  | 'items'
  | 'prefixItems'
  | 'allOf'
  | 'oneOf'
  | 'anyOf'
  | 'not'
  | 'contains'
  | 'propertyNames'
  | 'dependentSchemas'
  | 'additionalProperties'
  | 'unevaluatedProperties'
  | 'unevaluatedItems'
  | 'if'
  | 'then'
  | 'else';

/**
 * JSON Schema 2020-12 with keywords not modelled directly by the shared seam.
 *
 * Extends the domain expert library type with 2020-12 applicator and
 * validation keywords that OAS 3.1 does not explicitly surface. Every
 * sub-schema position is boolean-capable (JSON Schema 2020-12 core §4.3.2:
 * boolean schemas are valid wherever a schema is expected), so the
 * object-form-only seam positions are redeclared with
 * {@link JsonSchemaOrBool} values.
 *
 * @public
 */
export interface JsonSchema2020 extends Omit<SchemaObject, SubSchemaSeamKeys> {
  $id?: string;
  /**
   * Short reference summary (OAS 3.1+ Reference Object `summary`).
   * Valid beside `$ref`; carried into the IR as an annotation.
   */
  summary?: string;
  $defs?: Record<string, JsonSchemaOrBool>;
  properties?: Record<string, JsonSchemaOrBool>;
  additionalProperties?: JsonSchemaOrBool;
  items?: JsonSchemaOrBool;
  prefixItems?: JsonSchemaOrBool[];
  allOf?: JsonSchemaOrBool[];
  oneOf?: JsonSchemaOrBool[];
  anyOf?: JsonSchemaOrBool[];
  not?: JsonSchemaOrBool;
  unevaluatedProperties?: JsonSchemaOrBool;
  unevaluatedItems?: JsonSchemaOrBool;
  dependentSchemas?: Record<string, JsonSchemaOrBool>;
  dependentRequired?: Record<string, string[]>;
  minContains?: number;
  maxContains?: number;
  contains?: JsonSchemaOrBool;
  patternProperties?: Record<string, JsonSchemaOrBool>;
  propertyNames?: JsonSchemaOrBool;
  contentSchema?: JsonSchemaOrBool;
  if?: JsonSchemaOrBool;
  then?: JsonSchemaOrBool;
  else?: JsonSchemaOrBool;
  $anchor?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
}
