import type { ReferenceObject, SchemaObject, SchemaObjectType } from '../structure-types.js';
import type { RawSchemaFields } from './core-types.js';

type OpenAPIInputSchemaOrReferenceObject<TSchemaObject> = ReferenceObject | TSchemaObject;
type OpenAPIInputSchemaOrReferenceOrBoolean<TSchemaObject> =
  | OpenAPIInputSchemaOrReferenceObject<TSchemaObject>
  | boolean;

export type OpenAPI30InputSchemaOrReferenceObject =
  OpenAPIInputSchemaOrReferenceObject<OpenAPI30InputSchemaObject>;
export type OpenAPI30InputSchemaOrReferenceOrBoolean =
  OpenAPIInputSchemaOrReferenceOrBoolean<OpenAPI30InputSchemaObject>;
export type OpenAPI31InputSchemaOrReferenceObject =
  OpenAPIInputSchemaOrReferenceObject<OpenAPI31InputSchemaObject>;
export type OpenAPI31InputSchemaOrReferenceOrBoolean =
  OpenAPIInputSchemaOrReferenceOrBoolean<OpenAPI31InputSchemaObject>;
export type OpenAPI32InputSchemaOrReferenceObject =
  OpenAPIInputSchemaOrReferenceObject<OpenAPI32InputSchemaObject>;
export type OpenAPI32InputSchemaOrReferenceOrBoolean =
  OpenAPIInputSchemaOrReferenceOrBoolean<OpenAPI32InputSchemaObject>;

export interface OpenAPI30InputSchemaObject extends Omit<SchemaObject, RawSchemaFields> {
  type?: SchemaObjectType;
  nullable?: boolean;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  additionalProperties?: OpenAPI30InputSchemaOrReferenceOrBoolean;
  properties?: Record<string, OpenAPI30InputSchemaOrReferenceObject>;
  patternProperties?: Record<string, OpenAPI30InputSchemaOrReferenceObject>;
  allOf?: OpenAPI30InputSchemaOrReferenceObject[];
  oneOf?: OpenAPI30InputSchemaOrReferenceObject[];
  anyOf?: OpenAPI30InputSchemaOrReferenceObject[];
  not?: OpenAPI30InputSchemaOrReferenceObject;
  items?: OpenAPI30InputSchemaOrReferenceObject;
  prefixItems?: OpenAPI30InputSchemaOrReferenceObject[];
  unevaluatedItems?: OpenAPI30InputSchemaOrReferenceOrBoolean;
  unevaluatedProperties?: OpenAPI30InputSchemaOrReferenceOrBoolean;
  dependentSchemas?: Record<string, OpenAPI30InputSchemaOrReferenceObject>;
  if?: OpenAPI30InputSchemaOrReferenceOrBoolean;
  then?: OpenAPI30InputSchemaOrReferenceOrBoolean;
  else?: OpenAPI30InputSchemaOrReferenceOrBoolean;
  contains?: OpenAPI30InputSchemaOrReferenceObject;
  propertyNames?: OpenAPI30InputSchemaOrReferenceObject;
}

interface OpenAPI31PlusInputSchemaObject<
  TSchemaOrReferenceObject,
  TSchemaOrReferenceOrBoolean,
> extends Omit<SchemaObject, RawSchemaFields> {
  type?: SchemaObjectType | SchemaObjectType[];
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  additionalProperties?: TSchemaOrReferenceOrBoolean;
  properties?: Record<string, TSchemaOrReferenceObject>;
  patternProperties?: Record<string, TSchemaOrReferenceObject>;
  allOf?: TSchemaOrReferenceObject[];
  oneOf?: TSchemaOrReferenceObject[];
  anyOf?: TSchemaOrReferenceObject[];
  not?: TSchemaOrReferenceObject;
  items?: TSchemaOrReferenceObject;
  prefixItems?: TSchemaOrReferenceObject[];
  unevaluatedItems?: TSchemaOrReferenceOrBoolean;
  unevaluatedProperties?: TSchemaOrReferenceOrBoolean;
  dependentSchemas?: Record<string, TSchemaOrReferenceObject>;
  if?: TSchemaOrReferenceOrBoolean;
  then?: TSchemaOrReferenceOrBoolean;
  else?: TSchemaOrReferenceOrBoolean;
  contains?: TSchemaOrReferenceObject;
  propertyNames?: TSchemaOrReferenceObject;
}

export type OpenAPI31InputSchemaObject = OpenAPI31PlusInputSchemaObject<
  OpenAPI31InputSchemaOrReferenceObject,
  OpenAPI31InputSchemaOrReferenceOrBoolean
>;

export type OpenAPI32InputSchemaObject = OpenAPI31PlusInputSchemaObject<
  OpenAPI32InputSchemaOrReferenceObject,
  OpenAPI32InputSchemaOrReferenceOrBoolean
>;
