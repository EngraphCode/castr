/**
 * JSON Schema 2020-12 type definition.
 *
 * Extends the shared OpenAPI seam with 2020-12 applicator and
 * validation keywords that OAS 3.1 does not explicitly surface.
 *
 * Extracted to its own module to avoid circular dependencies: core.ts imports
 * helper functions from helpers.ts and 2020-keywords.ts, which in turn need
 * the JsonSchema2020 type.
 *
 * @module parsers/json-schema/json-schema-parser.types
 */

import type { SchemaObject, ReferenceObject } from '../../../shared/openapi-types.js';

/** Schema or `$ref`, optionally a boolean (for unevaluated / conditional forms). */
type JsonSchemaOrBool = JsonSchema2020 | ReferenceObject | boolean;

/**
 * JSON Schema 2020-12 with keywords not modelled directly by the shared seam.
 *
 * Extends the domain expert library type with 2020-12 applicator and
 * validation keywords that OAS 3.1 does not explicitly surface.
 *
 * @public
 */
export interface JsonSchema2020 extends SchemaObject {
  $id?: string;
  $defs?: Record<string, JsonSchema2020 | ReferenceObject>;
  unevaluatedProperties?: JsonSchemaOrBool;
  unevaluatedItems?: JsonSchemaOrBool;
  dependentSchemas?: Record<string, JsonSchema2020 | ReferenceObject>;
  dependentRequired?: Record<string, string[]>;
  minContains?: number;
  maxContains?: number;
  contains?: JsonSchema2020 | ReferenceObject;
  patternProperties?: Record<string, JsonSchema2020 | ReferenceObject>;
  propertyNames?: JsonSchema2020 | ReferenceObject;
  if?: JsonSchemaOrBool;
  then?: JsonSchemaOrBool;
  else?: JsonSchemaOrBool;
  $anchor?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
}
