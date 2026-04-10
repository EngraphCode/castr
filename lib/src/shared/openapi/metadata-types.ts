import type { OpenAPIV3_1, OpenAPIV3_2 } from '@scalar/openapi-types';

export interface InfoObject {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
  summary?: string;
}

export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
  identifier?: string;
}

export interface ServerObject {
  url: string;
  description?: string;
  variables?: Record<string, OpenAPIV3_1.ServerVariableObject>;
  name?: string;
}

export interface ExternalDocumentationObject {
  url: string;
  description?: string;
}

export interface TagObject {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  summary?: string;
  parent?: string;
  kind?: string;
}

export type SecuritySchemeObject = OpenAPIV3_2.SecuritySchemeObject;
export type SecurityRequirementObject = OpenAPIV3_1.SecurityRequirementObject;
export type DiscriminatorObject = OpenAPIV3_2.DiscriminatorObject;
export type OAuthFlows = OpenAPIV3_2.OAuthFlows;
export type XMLObject = OpenAPIV3_2.XMLObject;
export type ParameterLocation = OpenAPIV3_2.ParameterLocation;
export type HttpMethods = OpenAPIV3_2.HttpMethods;
