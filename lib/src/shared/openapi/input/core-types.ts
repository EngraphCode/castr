import type {
  HeaderObject,
  MediaTypeObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
} from '../structure-types.js';
import type {
  ExternalDocumentationObject,
  InfoObject,
  SecurityRequirementObject,
  ServerObject,
  TagObject,
} from '../metadata-types.js';

export type OpenAPIVersion30 = `3.0.${string}`;
export type OpenAPIVersion31 = `3.1.${string}`;
export type OpenAPIVersion32 = `3.2.${string}`;

export type RawSchemaFields =
  | 'additionalProperties'
  | 'allOf'
  | 'anyOf'
  | 'contains'
  | 'dependentSchemas'
  | 'else'
  | 'exclusiveMaximum'
  | 'exclusiveMinimum'
  | 'if'
  | 'items'
  | 'not'
  | 'oneOf'
  | 'patternProperties'
  | 'prefixItems'
  | 'properties'
  | 'propertyNames'
  | 'then'
  | 'type'
  | 'unevaluatedItems'
  | 'unevaluatedProperties';

export type OpenAPIInputComponentsOmittedFields =
  | 'callbacks'
  | 'headers'
  | 'mediaTypes'
  | 'parameters'
  | 'pathItems'
  | 'requestBodies'
  | 'responses'
  | 'schemas';

export interface OpenAPIInputInfoObject extends Omit<InfoObject, 'title' | 'version'> {
  title?: string;
  version?: string;
}

export interface OpenAPIInputServerObject extends Omit<ServerObject, 'url'> {
  url?: string;
}

export type OpenAPIInputComponentEntry<T> = ReferenceObject | T;
export type OpenAPIInputComponentMap<T> = Record<string, OpenAPIInputComponentEntry<T>>;

export interface OpenAPIInputMediaTypeObject<TSchemaOrReferenceObject> extends Omit<
  MediaTypeObject,
  'schema'
> {
  schema?: TSchemaOrReferenceObject;
}

export interface OpenAPIInputHeaderObject<TSchemaOrReferenceObject, TMediaTypeObject> extends Omit<
  HeaderObject,
  'schema' | 'content'
> {
  schema?: TSchemaOrReferenceObject;
  content?: OpenAPIInputComponentMap<TMediaTypeObject>;
}

export interface OpenAPIInputRequestBodyObject<TMediaTypeObject> extends Omit<
  RequestBodyObject,
  'content'
> {
  content: OpenAPIInputComponentMap<TMediaTypeObject>;
}

export interface OpenAPIInputParameterObject<
  TSchemaOrReferenceObject,
  TMediaTypeObject,
> extends Omit<ParameterObject, 'schema' | 'content'> {
  schema?: TSchemaOrReferenceObject;
  content?: OpenAPIInputComponentMap<TMediaTypeObject>;
}

export interface OpenAPIInputResponseObject<TMediaTypeObject, THeaderObject> extends Omit<
  ResponseObject,
  'content' | 'headers'
> {
  content?: OpenAPIInputComponentMap<TMediaTypeObject>;
  headers?: OpenAPIInputComponentMap<THeaderObject>;
}

export interface OpenAPIInputOperationObject<
  TParameterObject,
  TRequestBodyObject,
  TResponseObject,
  TCallbackObject,
> extends Omit<OperationObject, 'parameters' | 'requestBody' | 'responses' | 'callbacks'> {
  parameters?: OpenAPIInputComponentEntry<TParameterObject>[];
  requestBody?: OpenAPIInputComponentEntry<TRequestBodyObject>;
  responses?: OpenAPIInputComponentMap<TResponseObject>;
  callbacks?: OpenAPIInputComponentMap<TCallbackObject>;
}

export interface OpenAPIInputPathItemObject<TOperationObject, TParameterObject> extends Omit<
  PathItemObject,
  | 'additionalOperations'
  | 'delete'
  | 'get'
  | 'head'
  | 'options'
  | 'parameters'
  | 'patch'
  | 'post'
  | 'put'
  | 'query'
  | 'trace'
> {
  get?: TOperationObject;
  put?: TOperationObject;
  post?: TOperationObject;
  delete?: TOperationObject;
  options?: TOperationObject;
  head?: TOperationObject;
  patch?: TOperationObject;
  trace?: TOperationObject;
  query?: TOperationObject;
  additionalOperations?: Record<string, TOperationObject>;
  parameters?: OpenAPIInputComponentEntry<TParameterObject>[];
}

export type OpenAPIInputCallbackObject<TPathItemObject> = OpenAPIInputComponentMap<TPathItemObject>;

export interface OpenAPIInputDocumentBase<TComponentsObject, TPathItemObject> {
  openapi: string;
  info: OpenAPIInputInfoObject;
  paths?: Record<string, TPathItemObject | undefined>;
  webhooks?: OpenAPIInputComponentMap<TPathItemObject>;
  components?: TComponentsObject;
  servers?: OpenAPIInputServerObject[];
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
  jsonSchemaDialect?: string;
  $self?: string;
  [ext: `x-${string}`]: unknown;
}
