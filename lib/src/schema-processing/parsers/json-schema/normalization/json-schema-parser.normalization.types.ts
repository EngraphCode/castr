import type { ReferenceObject } from '../../../../shared/openapi-types.js';
import type { JsonSchema2020 } from '../json-schema-parser.types.js';

export type Draft07SchemaOrRef = Draft07Input | ReferenceObject | boolean;

/**
 * A normalized 2020-12 child value: a schema object, a `$ref`, or a boolean
 * schema (booleans are complete schemas and normalize to themselves).
 */
export type NormalizedSchemaOrRef = JsonSchema2020 | ReferenceObject | boolean;
export type Draft07SchemaMap = Record<string, Draft07SchemaOrRef>;

export type Draft07Input = Omit<
  JsonSchema2020,
  | 'exclusiveMinimum'
  | 'exclusiveMaximum'
  | 'items'
  | '$defs'
  | 'dependentSchemas'
  | 'properties'
  | 'allOf'
  | 'oneOf'
  | 'anyOf'
  | 'not'
  | 'additionalProperties'
  | 'prefixItems'
> & {
  definitions?: Draft07SchemaMap;
  dependencies?: Record<string, string[] | Draft07SchemaOrRef>;
  exclusiveMinimum?: boolean | number;
  exclusiveMaximum?: boolean | number;
  items?: Draft07SchemaOrRef | Draft07SchemaOrRef[];
  $defs?: Draft07SchemaMap;
  dependentSchemas?: Draft07SchemaMap;
  properties?: Draft07SchemaMap;
  allOf?: Draft07SchemaOrRef[];
  oneOf?: Draft07SchemaOrRef[];
  anyOf?: Draft07SchemaOrRef[];
  not?: Draft07SchemaOrRef;
  additionalProperties?: Draft07SchemaOrRef;
  prefixItems?: Draft07SchemaOrRef[];
};
