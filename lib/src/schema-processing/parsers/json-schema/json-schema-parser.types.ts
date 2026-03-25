/**
 * JSON Schema 2020-12 type definition.
 *
 * Extends SchemaObject from openapi3-ts/oas31 with 2020-12 applicator and
 * validation keywords that OAS 3.1 does not explicitly surface.
 *
 * Extracted to its own module to avoid circular dependencies: core.ts imports
 * helper functions from helpers.ts and 2020-keywords.ts, which in turn need
 * the JsonSchema2020 type.
 *
 * @module parsers/json-schema/json-schema-parser.types
 */

import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';

/**
 * JSON Schema 2020-12 with keywords not modelled by openapi3-ts.
 *
 * Extends the domain expert library type with 2020-12 applicator and
 * validation keywords that OAS 3.1 does not explicitly surface.
 *
 * @public
 */
export interface JsonSchema2020 extends SchemaObject {
  $id?: string;
  $defs?: Record<string, JsonSchema2020 | ReferenceObject>;
  unevaluatedProperties?: JsonSchema2020 | ReferenceObject | boolean;
  unevaluatedItems?: JsonSchema2020 | ReferenceObject | boolean;
  dependentSchemas?: Record<string, JsonSchema2020 | ReferenceObject>;
  dependentRequired?: Record<string, string[]>;
  minContains?: number;
  maxContains?: number;
}
