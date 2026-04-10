import type { ComponentsObject } from '../structure-types.js';
import type {
  OpenAPIInputCallbackObject,
  OpenAPIInputComponentMap,
  OpenAPIInputComponentsOmittedFields,
  OpenAPIInputDocumentBase,
  OpenAPIInputHeaderObject,
  OpenAPIInputMediaTypeObject,
  OpenAPIInputOperationObject,
  OpenAPIInputParameterObject,
  OpenAPIInputPathItemObject,
  OpenAPIInputRequestBodyObject,
  OpenAPIInputResponseObject,
  OpenAPIVersion30,
  OpenAPIVersion31,
  OpenAPIVersion32,
} from './core-types.js';
import type {
  OpenAPI30InputSchemaObject,
  OpenAPI30InputSchemaOrReferenceObject,
  OpenAPI31InputSchemaObject,
  OpenAPI31InputSchemaOrReferenceObject,
  OpenAPI32InputSchemaObject,
  OpenAPI32InputSchemaOrReferenceObject,
} from './schema-types.js';

type OpenAPIInputComponentsObject<
  TSchemaObject,
  TResponseObject,
  TParameterObject,
  TRequestBodyObject,
  THeaderObject,
  TCallbackObject,
  TPathItemObject,
  TMediaTypeObject,
> = Omit<ComponentsObject, OpenAPIInputComponentsOmittedFields> & {
  schemas?: Record<string, TSchemaObject>;
  responses?: OpenAPIInputComponentMap<TResponseObject>;
  parameters?: OpenAPIInputComponentMap<TParameterObject>;
  requestBodies?: OpenAPIInputComponentMap<TRequestBodyObject>;
  headers?: OpenAPIInputComponentMap<THeaderObject>;
  callbacks?: OpenAPIInputComponentMap<TCallbackObject>;
  pathItems?: OpenAPIInputComponentMap<TPathItemObject>;
  mediaTypes?: OpenAPIInputComponentMap<TMediaTypeObject>;
};

type OpenAPIInputVersionedDocument<
  TVersion extends string,
  TComponentsObject,
  TPathItemObject,
> = OpenAPIInputDocumentBase<TComponentsObject, TPathItemObject> & { openapi: TVersion };

export type OpenAPI30InputMediaTypeObject =
  OpenAPIInputMediaTypeObject<OpenAPI30InputSchemaOrReferenceObject>;
export type OpenAPI31InputMediaTypeObject =
  OpenAPIInputMediaTypeObject<OpenAPI31InputSchemaOrReferenceObject>;
export type OpenAPI32InputMediaTypeObject =
  OpenAPIInputMediaTypeObject<OpenAPI32InputSchemaOrReferenceObject>;

export type OpenAPI30InputHeaderObject = OpenAPIInputHeaderObject<
  OpenAPI30InputSchemaOrReferenceObject,
  OpenAPI30InputMediaTypeObject
>;
export type OpenAPI31InputHeaderObject = OpenAPIInputHeaderObject<
  OpenAPI31InputSchemaOrReferenceObject,
  OpenAPI31InputMediaTypeObject
>;
export type OpenAPI32InputHeaderObject = OpenAPIInputHeaderObject<
  OpenAPI32InputSchemaOrReferenceObject,
  OpenAPI32InputMediaTypeObject
>;

export type OpenAPI30InputRequestBodyObject =
  OpenAPIInputRequestBodyObject<OpenAPI30InputMediaTypeObject>;
export type OpenAPI31InputRequestBodyObject =
  OpenAPIInputRequestBodyObject<OpenAPI31InputMediaTypeObject>;
export type OpenAPI32InputRequestBodyObject =
  OpenAPIInputRequestBodyObject<OpenAPI32InputMediaTypeObject>;

export type OpenAPI30InputParameterObject = OpenAPIInputParameterObject<
  OpenAPI30InputSchemaOrReferenceObject,
  OpenAPI30InputMediaTypeObject
>;
export type OpenAPI31InputParameterObject = OpenAPIInputParameterObject<
  OpenAPI31InputSchemaOrReferenceObject,
  OpenAPI31InputMediaTypeObject
>;
export type OpenAPI32InputParameterObject = OpenAPIInputParameterObject<
  OpenAPI32InputSchemaOrReferenceObject,
  OpenAPI32InputMediaTypeObject
>;

export type OpenAPI30InputResponseObject = OpenAPIInputResponseObject<
  OpenAPI30InputMediaTypeObject,
  OpenAPI30InputHeaderObject
>;
export type OpenAPI31InputResponseObject = OpenAPIInputResponseObject<
  OpenAPI31InputMediaTypeObject,
  OpenAPI31InputHeaderObject
>;
export type OpenAPI32InputResponseObject = OpenAPIInputResponseObject<
  OpenAPI32InputMediaTypeObject,
  OpenAPI32InputHeaderObject
>;

export type OpenAPI30InputOperationObject = OpenAPIInputOperationObject<
  OpenAPI30InputParameterObject,
  OpenAPI30InputRequestBodyObject,
  OpenAPI30InputResponseObject,
  OpenAPI30InputCallbackObject
>;
export type OpenAPI31InputOperationObject = OpenAPIInputOperationObject<
  OpenAPI31InputParameterObject,
  OpenAPI31InputRequestBodyObject,
  OpenAPI31InputResponseObject,
  OpenAPI31InputCallbackObject
>;
export type OpenAPI32InputOperationObject = OpenAPIInputOperationObject<
  OpenAPI32InputParameterObject,
  OpenAPI32InputRequestBodyObject,
  OpenAPI32InputResponseObject,
  OpenAPI32InputCallbackObject
>;

export type OpenAPI30InputPathItemObject = OpenAPIInputPathItemObject<
  OpenAPI30InputOperationObject,
  OpenAPI30InputParameterObject
>;
export type OpenAPI31InputPathItemObject = OpenAPIInputPathItemObject<
  OpenAPI31InputOperationObject,
  OpenAPI31InputParameterObject
>;
export type OpenAPI32InputPathItemObject = OpenAPIInputPathItemObject<
  OpenAPI32InputOperationObject,
  OpenAPI32InputParameterObject
>;

export type OpenAPI30InputCallbackObject = OpenAPIInputCallbackObject<OpenAPI30InputPathItemObject>;
export type OpenAPI31InputCallbackObject = OpenAPIInputCallbackObject<OpenAPI31InputPathItemObject>;
export type OpenAPI32InputCallbackObject = OpenAPIInputCallbackObject<OpenAPI32InputPathItemObject>;

export type OpenAPI30InputComponentsObject = OpenAPIInputComponentsObject<
  OpenAPI30InputSchemaObject,
  OpenAPI30InputResponseObject,
  OpenAPI30InputParameterObject,
  OpenAPI30InputRequestBodyObject,
  OpenAPI30InputHeaderObject,
  OpenAPI30InputCallbackObject,
  OpenAPI30InputPathItemObject,
  OpenAPI30InputMediaTypeObject
>;
export type OpenAPI31InputComponentsObject = OpenAPIInputComponentsObject<
  OpenAPI31InputSchemaObject,
  OpenAPI31InputResponseObject,
  OpenAPI31InputParameterObject,
  OpenAPI31InputRequestBodyObject,
  OpenAPI31InputHeaderObject,
  OpenAPI31InputCallbackObject,
  OpenAPI31InputPathItemObject,
  OpenAPI31InputMediaTypeObject
>;
export type OpenAPI32InputComponentsObject = OpenAPIInputComponentsObject<
  OpenAPI32InputSchemaObject,
  OpenAPI32InputResponseObject,
  OpenAPI32InputParameterObject,
  OpenAPI32InputRequestBodyObject,
  OpenAPI32InputHeaderObject,
  OpenAPI32InputCallbackObject,
  OpenAPI32InputPathItemObject,
  OpenAPI32InputMediaTypeObject
>;

export type OpenAPI30InputDocument = OpenAPIInputVersionedDocument<
  OpenAPIVersion30,
  OpenAPI30InputComponentsObject,
  OpenAPI30InputPathItemObject
>;
export type OpenAPI31InputDocument = OpenAPIInputVersionedDocument<
  OpenAPIVersion31,
  OpenAPI31InputComponentsObject,
  OpenAPI31InputPathItemObject
>;
export type OpenAPI32InputDocument = OpenAPIInputVersionedDocument<
  OpenAPIVersion32,
  OpenAPI32InputComponentsObject,
  OpenAPI32InputPathItemObject
>;

export type OpenAPIInputDocument =
  | OpenAPI30InputDocument
  | OpenAPI31InputDocument
  | OpenAPI32InputDocument;
