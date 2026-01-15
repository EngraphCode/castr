import type { ParameterObject, SchemaObject } from 'openapi3-ts/oas31';
import type { CastrSchema } from '../ir/schema.js';

/**
 * Local type definitions for endpoint metadata
 * These types define the structure of API endpoints for code generation
 */

/**
 * HTTP methods supported by OpenAPI 3.0/3.1
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace';

/**
 * Request format types
 */
export type RequestFormat = 'json' | 'form-data' | 'form-url' | 'binary' | 'text';

/**
 * Parameter location types
 */
export type ParameterType = 'Path' | 'Query' | 'Header' | 'Body';

/**
 * Schema constraints subset from OpenAPI SchemaObject.
 * Uses library types directly - no custom types.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#schema-object OpenAPI Schema Object}
 */
export type SchemaConstraints = Pick<
  SchemaObject,
  | 'minimum'
  | 'maximum'
  | 'exclusiveMinimum'
  | 'exclusiveMaximum'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'enum'
  | 'format'
  | 'minItems'
  | 'maxItems'
  | 'uniqueItems'
>;

/**
 * Endpoint parameter with schema as CastrSchema.
 * Uses OpenAPI library types for metadata fields - no custom types.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#parameter-object OpenAPI Parameter Object}
 */
export interface EndpointParameter {
  /** Parameter name */
  name: string;
  /** Parameter location (Path, Query, Header, Body) */
  type: ParameterType;
  /** Schema definition */
  schema: CastrSchema;
  /** Optional description (from ParameterObject) */
  description?: ParameterObject['description'];
  /** Whether parameter is deprecated (from ParameterObject) */
  deprecated?: ParameterObject['deprecated'];
  /** Example value for the parameter (from ParameterObject or SchemaObject) */
  example?: ParameterObject['example'];
  /** Named examples (from ParameterObject.examples, resolved only) */
  examples?: ParameterObject['examples'];
  /** Default value from schema (from SchemaObject) */
  default?: SchemaObject['default'];
  /** Schema validation constraints (from SchemaObject) */
  constraints?: SchemaConstraints;
}

/**
 * Endpoint error response with schema as CastrSchema
 */
export interface EndpointError {
  /** HTTP status code or 'default' */
  status: number | 'default';
  /** Schema definition */
  schema: CastrSchema;
  /** Optional description */
  description?: string;
}

/**
 * Endpoint response with schema as CastrSchema
 * Used with --with-all-responses option
 */
export interface EndpointResponse {
  /** HTTP status code as string (e.g., '200', '404') */
  statusCode: string;
  /** Schema definition */
  schema: CastrSchema;
  /** Optional description */
  description?: string;
}

/**
 * Complete endpoint definition with all metadata
 * Schemas are represented as CastrSchema for code generation
 */
export interface EndpointDefinition {
  /** HTTP method */
  method: HttpMethod;
  /** API path with parameter placeholders (e.g., '/users/:id') */
  path: string;
  /** Optional alias (typically the operationId) */
  alias?: string;
  /** Optional description */
  description?: string;
  /** Request format */
  requestFormat: RequestFormat;
  /** Request parameters (path, query, header, body) */
  parameters: EndpointParameter[];
  /** Error responses */
  errors: EndpointError[];
  /** Main success response schema */
  response: CastrSchema;
  /** Optional array of all responses (when --with-all-responses is enabled) */
  responses?: EndpointResponse[];
  /** Tags for grouping (from OpenAPI operation tags) */
  tags?: string[];
}
