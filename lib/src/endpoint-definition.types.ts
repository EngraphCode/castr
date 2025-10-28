/**
 * Local type definitions for endpoint metadata
 * These types define the structure of API endpoints for code generation
 */

/**
 * HTTP methods supported by OpenAPI 3.0/3.1
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

/**
 * Request format types
 */
export type RequestFormat = 'json' | 'form-data' | 'form-url' | 'binary' | 'text';

/**
 * Parameter location types
 */
export type ParameterType = 'Path' | 'Query' | 'Header' | 'Body';

/**
 * Endpoint parameter with schema as string reference
 */
export type EndpointParameter = {
  /** Parameter name */
  name: string;
  /** Parameter location (Path, Query, Header, Body) */
  type: ParameterType;
  /** Schema reference as string (e.g., 'z.string()', 'UserSchema') */
  schema: string;
  /** Optional description */
  description?: string;
};

/**
 * Endpoint error response with schema as string reference
 */
export type EndpointError = {
  /** HTTP status code or 'default' */
  status: number | 'default';
  /** Schema reference as string (e.g., 'ErrorSchema') */
  schema: string;
  /** Optional description */
  description?: string;
};

/**
 * Endpoint response with schema as string reference
 * Used with --with-all-responses option
 */
export type EndpointResponse = {
  /** HTTP status code as string (e.g., '200', '404') */
  statusCode: string;
  /** Schema reference as string (e.g., 'UserSchema') */
  schema: string;
  /** Optional description */
  description?: string;
};

/**
 * Complete endpoint definition with all metadata
 * Schemas are represented as string references for code generation
 */
export type EndpointDefinition = {
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
  response: string;
  /** Optional array of all responses (when --with-all-responses is enabled) */
  responses?: EndpointResponse[];
};
