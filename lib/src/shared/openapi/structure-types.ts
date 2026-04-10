import type { OpenAPIV3_2 as OAS } from '@scalar/openapi-types';
import type {
  DiscriminatorObject,
  ExternalDocumentationObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
  ServerObject,
  XMLObject,
} from './metadata-types.js';

export interface ReferenceObject {
  $ref: string;
  summary?: string;
  description?: string;
}

type SchemaOrReferenceObject = ReferenceObject | SchemaObject;
type SchemaOrReferenceOrBoolean = SchemaOrReferenceObject | boolean;
type LinkParameterValue =
  | boolean
  | LinkParametersObject
  | LinkParameterValue[]
  | null
  | number
  | string;
interface LinkParametersObject {
  [key: string]: LinkParameterValue;
}

export type SchemaObjectType = OAS.NonArraySchemaObjectType | OAS.ArraySchemaObjectType;

export interface SchemaObject {
  title?: string;
  description?: string;
  format?: string;
  default?: unknown;
  multipleOf?: number;
  maximum?: number;
  minimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: unknown[];
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: unknown;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  contentMediaType?: string;
  $schema?: string;
  const?: unknown;
  additionalProperties?: SchemaOrReferenceOrBoolean;
  properties?: Record<string, SchemaOrReferenceObject>;
  patternProperties?: Record<string, SchemaOrReferenceObject>;
  allOf?: SchemaOrReferenceObject[];
  oneOf?: SchemaOrReferenceObject[];
  anyOf?: SchemaOrReferenceObject[];
  not?: SchemaOrReferenceObject;
  examples?: unknown[];
  discriminator?: DiscriminatorObject;
  xml?: XMLObject;
  externalDocs?: ExternalDocumentationObject;
  type?: SchemaObjectType | SchemaObjectType[];
  items?: SchemaOrReferenceObject;
  $ref?: string;
  prefixItems?: SchemaOrReferenceObject[];
  $vocabulary?: Record<string, boolean>;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
  $anchor?: string;
  unevaluatedItems?: SchemaOrReferenceOrBoolean;
  unevaluatedProperties?: SchemaOrReferenceOrBoolean;
  dependentSchemas?: Record<string, SchemaOrReferenceObject>;
  dependentRequired?: Record<string, string[]>;
  contentEncoding?: string;
  if?: SchemaOrReferenceOrBoolean;
  then?: SchemaOrReferenceOrBoolean;
  else?: SchemaOrReferenceOrBoolean;
  contains?: SchemaOrReferenceObject;
  minContains?: number;
  maxContains?: number;
  propertyNames?: SchemaOrReferenceObject;
}

export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
  dataValue?: unknown;
  serializedValue?: string;
}

export interface MediaTypeObject {
  schema?: ReferenceObject | SchemaObject;
  example?: unknown;
  examples?: Record<string, ReferenceObject | ExampleObject>;
  encoding?: Record<string, EncodingObject>;
  itemSchema?: ReferenceObject | SchemaObject;
  itemEncoding?: EncodingObject;
  prefixEncoding?: EncodingObject[];
}

export interface EncodingObject {
  contentType?: string;
  headers?: Record<string, ReferenceObject | HeaderObject>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  encoding?: Record<string, EncodingObject>;
  prefixEncoding?: EncodingObject[];
  itemEncoding?: EncodingObject;
}

export interface HeaderObject {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: OAS.ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: ReferenceObject | SchemaObject;
  example?: unknown;
  examples?: Record<string, ReferenceObject | ExampleObject>;
  content?: Record<string, ReferenceObject | MediaTypeObject>;
}

export interface LinkObject {
  operationRef?: string;
  operationId?: string;
  parameters?: LinkParametersObject;
  requestBody?: unknown;
  description?: string;
  server?: ServerObject;
}

export interface ResponseObject {
  description?: string;
  headers?: Record<string, ReferenceObject | HeaderObject>;
  content?: Record<string, ReferenceObject | MediaTypeObject>;
  links?: Record<string, ReferenceObject | LinkObject>;
  summary?: string;
}

export type ResponsesObject = Record<string, ReferenceObject | ResponseObject>;

export interface RequestBodyObject {
  description?: string;
  content: Record<string, ReferenceObject | MediaTypeObject>;
  required?: boolean;
}

export interface ParameterObject {
  name: string;
  in: OAS.ParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: OAS.ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: ReferenceObject | SchemaObject;
  example?: unknown;
  examples?: Record<string, ReferenceObject | ExampleObject>;
  content?: Record<string, ReferenceObject | MediaTypeObject>;
}

export interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: (ReferenceObject | ParameterObject)[];
  requestBody?: ReferenceObject | RequestBodyObject;
  responses?: ResponsesObject;
  callbacks?: Record<string, ReferenceObject | CallbackObject>;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}

export interface PathItemObject {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  query?: OperationObject;
  additionalOperations?: Record<string, OperationObject>;
  parameters?: (ReferenceObject | ParameterObject)[];
  servers?: ServerObject[];
}

export type PathsObject = Record<string, PathItemObject | undefined>;
export type CallbackObject = Record<string, PathItemObject | ReferenceObject>;
export type SchemasObject = Record<string, SchemaObject>;

export interface ComponentsObject {
  schemas?: SchemasObject;
  responses?: Record<string, ReferenceObject | ResponseObject>;
  parameters?: Record<string, ReferenceObject | ParameterObject>;
  examples?: Record<string, ReferenceObject | ExampleObject>;
  requestBodies?: Record<string, ReferenceObject | RequestBodyObject>;
  headers?: Record<string, ReferenceObject | HeaderObject>;
  securitySchemes?: Record<string, ReferenceObject | SecuritySchemeObject>;
  links?: Record<string, ReferenceObject | LinkObject>;
  callbacks?: Record<string, ReferenceObject | CallbackObject>;
  pathItems?: Record<string, ReferenceObject | PathItemObject>;
  mediaTypes?: Record<string, MediaTypeObject | ReferenceObject>;
}
