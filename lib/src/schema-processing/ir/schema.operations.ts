/**
 * Operation-related IR types.
 *
 * Types for endpoint operations, parameters, request bodies,
 * responses, and security requirements.
 *
 * @module ir/schema.operations
 */

import type {
  CallbackObject,
  EncodingObject,
  ExampleObject,
  ExternalDocumentationObject,
  LinkObject,
  ParameterObject,
  ReferenceObject,
  ServerObject,
} from 'openapi3-ts/oas31';
import type { CastrSchema, CastrSchemaNode, IRHttpMethod } from './schema.js';

/**
 * Endpoint operation metadata extracted from OpenAPI paths.
 *
 * Represents a single HTTP operation (method + path combination) with all
 * associated metadata including parameters, request body, responses, and
 * security requirements. Used for endpoint definition generation.
 *
 * @example
 * ```typescript
 * const operation: CastrOperation = {
 *   operationId: 'getPetById',
 *   method: 'get',
 *   path: '/pets/{petId}',
 *   description: 'Returns a single pet',
 *   parameters: [
 *     {
 *       name: 'petId',
 *       in: 'path',
 *       required: true,
 *       schema: { type: 'string', metadata: { ... } },
 *     },
 *   ],
 *   responses: [
 *     {
 *       statusCode: '200',
 *       description: 'Successful response',
 *       schema: { $ref: '#/components/schemas/Pet', metadata: { ... } },
 *     },
 *   ],
 *   tags: ['pets'],
 * };
 * ```
 *
 * @see {@link CastrParameter} for parameter definitions
 * @see {@link CastrResponse} for response definitions
 *
 * @public
 */

export interface CastrOperation {
  /**
   * Unique operation identifier from OpenAPI operationId.
   * Used for function naming and MCP tool identification.
   * Optional - not all OpenAPI operations have operationId defined.
   *
   * @example 'getUserById', 'createPet', 'listProducts'
   */
  operationId?: string;

  /**
   * HTTP method for this operation.
   * One of: get, post, put, patch, delete, head, options.
   */
  method: IRHttpMethod;

  /**
   * API path with parameter placeholders.
   *
   * @example '/users/{userId}', '/pets', '/api/v1/products/{id}'
   */
  path: string;

  /**
   * Human-readable description of the operation.
   * Used for code comments and documentation.
   */
  description?: string;

  /**
   * Operation summary (shorter than description).
   * Used for inline comments and function JSDoc.
   */
  summary?: string;

  /**
   * Path, query, header, and cookie parameters.
   * Ordered as they appear in the OpenAPI spec.
   */
  parameters: CastrParameter[];

  /**
   * Parameters grouped by location for easier access by writers.
   *
   * @example
   * ```typescript
   * {
   *   query: [pageParam, limitParam],
   *   path: [idParam],
   *   header: [authParam],
   *   cookie: []
   * }
   * ```
   */
  parametersByLocation: Record<'query' | 'path' | 'header' | 'cookie', CastrParameter[]>;

  /**
   * Optional request body definition.
   * Only present for POST, PUT, PATCH operations.
   */
  requestBody?: IRRequestBody;

  /**
   * Response definitions by status code.
   * Includes success responses (2xx) and error responses (4xx, 5xx).
   */
  responses: CastrResponse[];

  /**
   * Security requirements for this operation.
   * If empty, operation has no security constraints.
   */
  security?: IRSecurityRequirement[];

  /**
   * Tags for grouping operations.
   * Used for code organization and file grouping strategies.
   */
  tags?: string[];

  /**
   * Whether this operation is deprecated.
   * Used for JSDoc deprecation annotations.
   */
  deprecated?: boolean;

  /**
   * External documentation for this operation.
   * @see {@link https://spec.openapis.org/oas/v3.1.0#external-documentation-object}
   */
  externalDocs?: ExternalDocumentationObject;

  /**
   * Callbacks for this operation.
   * @see {@link https://spec.openapis.org/oas/v3.1.0#callback-object}
   */
  callbacks?: Record<string, CallbackObject | ReferenceObject>;

  /**
   * Servers for this operation (overrides document-level servers).
   * @see {@link https://spec.openapis.org/oas/v3.1.0#server-object}
   */
  servers?: ServerObject[];

  /**
   * PathItem-level summary (applies to all operations in this path).
   * @see {@link https://spec.openapis.org/oas/v3.1.0#path-item-object}
   */
  pathItemSummary?: string;

  /**
   * PathItem-level description (applies to all operations in this path).
   * @see {@link https://spec.openapis.org/oas/v3.1.0#path-item-object}
   */
  pathItemDescription?: string;

  /**
   * PathItem-level servers (applies to all operations in this path).
   * @see {@link https://spec.openapis.org/oas/v3.1.0#path-item-object}
   */
  pathItemServers?: ServerObject[];

  /**
   * PathItem-level parameter references.
   * Stores $ref strings for parameters defined at the path level.
   * These are preserved as refs in output instead of being expanded.
   *
   * @example ['#/components/parameters/rowParam', '#/components/parameters/columnParam']
   * @see {@link https://spec.openapis.org/oas/v3.1.0#path-item-object}
   */
  pathItemParameterRefs?: string[];
}

/**
 * Parameter definition for operations.
 *
 * Represents path, query, header, or cookie parameters with their schema
 * and validation metadata. Preserves all OpenAPI parameter properties.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#parameter-object OpenAPI Parameter Object}
 * @public
 */
export interface CastrParameter {
  /**
   * Parameter name as it appears in the operation.
   *
   * @example 'userId', 'pageSize', 'Authorization'
   */
  name: string;

  /**
   * Parameter location discriminator.
   */
  in: 'path' | 'query' | 'header' | 'cookie';

  /**
   * Whether the parameter is required.
   * Path parameters are always required.
   */
  required: boolean;

  /**
   * Parameter schema definition.
   * Can be a primitive, object, array, or reference.
   */
  schema: CastrSchema;

  /**
   * Rich metadata for code generation.
   * Includes validation constraints, nullable status, dependencies, etc.
   * Extracted from the parameter's schema.
   */
  metadata?: CastrSchemaNode;

  /**
   * Parameter description for documentation.
   */
  description?: string;

  /**
   * Whether the parameter is deprecated.
   */
  deprecated?: boolean;

  /**
   * Example value for the parameter.
   * OpenAPI spec allows any JSON value.
   */
  example?: unknown;

  /**
   * Multiple named examples.
   * OpenAPI spec allows any structure for examples.
   */
  examples?: Record<string, { value?: unknown; summary?: string; description?: string }>;

  /**
   * Style of parameter serialization.
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#style-values OpenAPI Style Values}
   */
  style?: ParameterObject['style'];

  /**
   * Whether arrays/objects should be exploded.
   */
  explode?: boolean;

  /**
   * Whether parameter allows reserved characters.
   */
  allowReserved?: boolean;
}

/**
 * Request body definition for operations.
 *
 * Represents the request payload for POST, PUT, PATCH operations.
 * Includes content type and schema information.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#request-body-object OpenAPI RequestBody Object}
 * @public
 */
export interface IRRequestBody {
  /**
   * Whether the request body is required.
   */
  required: boolean;

  /**
   * Request body description for documentation.
   */
  description?: string;

  /**
   * Content type to schema mapping.
   * Key is media type (e.g., 'application/json').
   */
  content: Record<string, IRMediaType>;
}

/**
 * Media type definition with schema.
 *
 * Represents a content type and its associated schema for request/response bodies.
 *
 * @public
 */
export interface IRMediaType {
  /**
   * Schema for this media type.
   */
  schema: CastrSchema;

  /**
   * Example value for this media type.
   */
  example?: unknown;

  /**
   * Multiple named examples.
   */
  examples?: Record<string, ReferenceObject | ExampleObject>;

  /**
   * Encoding information for multipart/form-data request bodies.
   * Map of property name to encoding configuration.
   *
   * @example
   * ```typescript
   * {
   *   'profileImage': {
   *     contentType: 'image/png',
   *     headers: { ... }
   *   }
   * }
   * ```
   *
   * @see {@link https://spec.openapis.org/oas/v3.1.0#encoding-object OpenAPI Encoding Object}
   */
  encoding?: Record<string, EncodingObject>;
}

/**
 * Response definition for operations.
 *
 * Represents an HTTP response with status code, description, and schema.
 * Includes both success responses (2xx) and error responses (4xx, 5xx).
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#response-object OpenAPI Response Object}
 * @public
 */
export interface CastrResponse {
  /**
   * HTTP status code or 'default'.
   *
   * @example '200', '404', '500', 'default'
   */
  statusCode: string;

  /**
   * Response description for documentation.
   */
  description?: string;

  /**
   * Response schema (optional for 204 No Content).
   */
  schema?: CastrSchema;

  /**
   * Content type to schema mapping (if multiple content types).
   */
  content?: Record<string, IRMediaType>;

  /**
   * Response headers.
   * Preserves all HeaderObject fields including description, required, deprecated.
   */
  headers?: Record<string, IRResponseHeader>;

  /**
   * Links for response.
   * @see {@link https://spec.openapis.org/oas/v3.1.0#link-object}
   */
  links?: Record<string, LinkObject | ReferenceObject>;
}

/**
 * Response header definition.
 *
 * Preserves all HeaderObject fields from OpenAPI for round-trip fidelity.
 * Unlike the previous implementation that only stored the schema,
 * this captures description, required, deprecated, example, etc.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#header-object OpenAPI Header Object}
 * @public
 */
export interface IRResponseHeader {
  /**
   * Header schema definition.
   */
  schema: CastrSchema;

  /**
   * Header description for documentation.
   * This field was previously lost during round-trip — now preserved.
   */
  description?: string;

  /**
   * Whether the header is required.
   */
  required?: boolean;

  /**
   * Whether the header is deprecated.
   */
  deprecated?: boolean;

  /**
   * Example value for the header.
   */
  example?: unknown;

  /**
   * Multiple named examples.
   */
  examples?: Record<string, ReferenceObject | ExampleObject>;
}

/**
 * Security requirement for operations.
 *
 * Represents OAuth2 scopes or API key requirements for an operation.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#security-requirement-object OpenAPI Security Requirement Object}
 * @public
 */
export interface IRSecurityRequirement {
  /**
   * Security scheme name from components/securitySchemes.
   */
  schemeName: string;

  /**
   * OAuth2 scopes required (empty for API keys).
   */
  scopes: string[];
}
