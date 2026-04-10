/**
 * Strict OpenAPI type seam.
 *
 * All repo imports of OpenAPI types route through this module so we can strip
 * vendor index-signature pollution, keep `SchemaObject` object-form only, and
 * restore canonical requiredness after boundary validation.
 */

import type {
  ComponentsObject,
  PathItemObject,
  ReferenceObject,
} from './openapi/structure-types.js';
import type {
  ExternalDocumentationObject,
  InfoObject,
  SecurityRequirementObject,
  ServerObject,
  TagObject,
} from './openapi/metadata-types.js';

export type {
  OpenAPIInputInfoObject,
  OpenAPIInputServerObject,
} from './openapi/input/core-types.js';
export type {
  OpenAPI30InputSchemaObject,
  OpenAPI31InputSchemaObject,
  OpenAPI32InputSchemaObject,
} from './openapi/input/schema-types.js';
export type {
  OpenAPIInputDocument,
  OpenAPI30InputCallbackObject,
  OpenAPI30InputComponentsObject,
  OpenAPI30InputDocument,
  OpenAPI30InputHeaderObject,
  OpenAPI30InputMediaTypeObject,
  OpenAPI30InputOperationObject,
  OpenAPI30InputParameterObject,
  OpenAPI30InputPathItemObject,
  OpenAPI30InputRequestBodyObject,
  OpenAPI30InputResponseObject,
  OpenAPI31InputCallbackObject,
  OpenAPI31InputComponentsObject,
  OpenAPI31InputDocument,
  OpenAPI31InputHeaderObject,
  OpenAPI31InputMediaTypeObject,
  OpenAPI31InputOperationObject,
  OpenAPI31InputParameterObject,
  OpenAPI31InputPathItemObject,
  OpenAPI31InputRequestBodyObject,
  OpenAPI31InputResponseObject,
  OpenAPI32InputCallbackObject,
  OpenAPI32InputComponentsObject,
  OpenAPI32InputDocument,
  OpenAPI32InputHeaderObject,
  OpenAPI32InputMediaTypeObject,
  OpenAPI32InputOperationObject,
  OpenAPI32InputParameterObject,
  OpenAPI32InputPathItemObject,
  OpenAPI32InputRequestBodyObject,
  OpenAPI32InputResponseObject,
} from './openapi/input/document-types.js';
export type {
  CallbackObject,
  ComponentsObject,
  EncodingObject,
  ExampleObject,
  HeaderObject,
  LinkObject,
  MediaTypeObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  PathsObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  SchemaObjectType,
  SchemasObject,
} from './openapi/structure-types.js';
export type {
  ContactObject,
  DiscriminatorObject,
  ExternalDocumentationObject,
  HttpMethods,
  InfoObject,
  LicenseObject,
  OAuthFlows,
  ParameterLocation,
  SecurityRequirementObject,
  SecuritySchemeObject,
  ServerObject,
  TagObject,
  XMLObject,
} from './openapi/metadata-types.js';

export interface OpenAPIDocument {
  openapi: string;
  info: InfoObject;
  paths?: Record<string, PathItemObject | undefined>;
  webhooks?: Record<string, PathItemObject | ReferenceObject>;
  components?: ComponentsObject;
  servers?: ServerObject[];
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
  jsonSchemaDialect?: string;
  $self?: string;
  [ext: `x-${string}`]: unknown;
}

export type OpenAPIObject = OpenAPIDocument;

export function isReferenceObject(obj: unknown): obj is ReferenceObject {
  return obj != null && Object.prototype.hasOwnProperty.call(obj, '$ref');
}
