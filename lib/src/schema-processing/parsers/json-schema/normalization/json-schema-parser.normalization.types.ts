import type { ReferenceObject } from 'openapi3-ts/oas31';
import type { JsonSchema2020 } from '../json-schema-parser.types.js';

export type Draft07SchemaOrRef = Draft07Input | ReferenceObject;
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
  additionalProperties?: Draft07SchemaOrRef | boolean;
  prefixItems?: Draft07SchemaOrRef[];
};
