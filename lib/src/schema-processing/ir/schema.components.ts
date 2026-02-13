/**
 * IR Component types for the OpenAPI components section.
 *
 * Discriminated union of all reusable component types that can appear
 * under OpenAPI `components/`.
 *
 * @module ir/schema.components
 */

import type {
  CallbackObject,
  ExampleObject,
  HeaderObject,
  LinkObject,
  PathItemObject,
  ReferenceObject,
  SecuritySchemeObject,
} from 'openapi3-ts/oas31';
import type { CastrSchema, CastrSchemaNode } from './schema.js';
import type { CastrParameter, CastrResponse, IRRequestBody } from './schema.operations.js';

/**
 * Reusable component definition from OpenAPI components section.
 */
export type IRComponent =
  | CastrSchemaComponent
  | IRSecuritySchemeComponent
  | CastrParameterComponent
  | CastrResponseComponent
  | IRRequestBodyComponent
  | IRHeaderComponent
  | IRLinkComponent
  | IRCallbackComponent
  | IRPathItemComponent
  | IRExampleComponent;

export interface CastrSchemaComponent {
  /**
   * Component type discriminator.
   */
  type: 'schema';

  /**
   * Component name from #/components/{type}/{name}.
   */
  name: string;

  /**
   * The actual schema definition.
   */
  schema: CastrSchema;

  /**
   * Rich metadata for code generation.
   */
  metadata: CastrSchemaNode;

  /**
   * Original OpenAPI description.
   */
  description?: string;
}

export interface IRSecuritySchemeComponent {
  type: 'securityScheme';
  name: string;
  scheme: SecuritySchemeObject | ReferenceObject;
}

export interface CastrParameterComponent {
  type: 'parameter';
  name: string;
  parameter: CastrParameter;
}

export interface CastrResponseComponent {
  type: 'response';
  name: string;
  response: CastrResponse;
}

export interface IRRequestBodyComponent {
  type: 'requestBody';
  name: string;
  requestBody: IRRequestBody;
}

/**
 * Header component definition from OpenAPI components/headers section.
 */
export interface IRHeaderComponent {
  type: 'header';
  name: string;
  header: HeaderObject | ReferenceObject;
}

/**
 * Link component definition from OpenAPI components/links section.
 * Links describe the relationship between operations.
 */
export interface IRLinkComponent {
  type: 'link';
  name: string;
  link: LinkObject | ReferenceObject;
}

/**
 * Callback component definition from OpenAPI components/callbacks section.
 * Callbacks are webhook-like patterns triggered by the server.
 */
export interface IRCallbackComponent {
  type: 'callback';
  name: string;
  callback: CallbackObject | ReferenceObject;
}

/**
 * PathItem component definition from OpenAPI components/pathItems section (3.1.x).
 * Reusable path items that can be referenced.
 */
export interface IRPathItemComponent {
  type: 'pathItem';
  name: string;
  pathItem: PathItemObject | ReferenceObject;
}

/**
 * Example component definition from OpenAPI components/examples section.
 * Reusable examples that can be referenced.
 */
export interface IRExampleComponent {
  type: 'example';
  name: string;
  example: ExampleObject | ReferenceObject;
}
