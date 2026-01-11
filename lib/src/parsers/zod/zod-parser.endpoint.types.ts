/**
 * Zod Endpoint Definition Types
 *
 * Type definitions for declarative endpoint definitions used with
 * the `defineEndpoint()` pattern for Zod → OpenAPI transformation.
 *
 * @module parsers/zod/endpoint.types
 *
 * @example
 * ```typescript
 * import { defineEndpoint } from '@engraph/castr';
 * import { z } from 'zod';
 *
 * export const getUserById = defineEndpoint({
 *   method: 'get',
 *   path: '/users/{userId}',
 *   parameters: {
 *     path: { userId: z.string().uuid() },
 *   },
 *   response: {
 *     200: UserSchema,
 *     404: NotFoundSchema,
 *   },
 * });
 * ```
 */

/**
 * HTTP methods supported for endpoint definitions.
 * @public
 */
export type EndpointMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

/**
 * Parameter location types matching OpenAPI spec.
 * @public
 */
export type ParameterLocation = 'path' | 'query' | 'header' | 'cookie';

/**
 * Parameters grouped by location.
 *
 * Each key maps a parameter name to its Zod schema expression (as string for parsing).
 * Path parameters are always required; query/header/cookie may be optional.
 *
 * @example
 * ```typescript
 * {
 *   path: { userId: 'z.string().uuid()' },
 *   query: { include: 'z.enum(["profile"]).optional()' },
 * }
 * ```
 *
 * @public
 */
export interface EndpointParameters {
  /** Path parameters (always required) */
  path?: Record<string, string>;
  /** Query string parameters */
  query?: Record<string, string>;
  /** Header parameters */
  header?: Record<string, string>;
  /** Cookie parameters */
  cookie?: Record<string, string>;
}

/**
 * Response definitions by status code.
 *
 * Maps HTTP status codes to their response schema expressions.
 *
 * @example
 * ```typescript
 * {
 *   '200': 'z.object({ id: z.string() })',
 *   '404': 'z.object({ error: z.literal("not_found") })',
 * }
 * ```
 *
 * @public
 */
export type EndpointResponses = Record<string, string>;

/**
 * A parsed endpoint definition.
 *
 * Represents the structure extracted from a `defineEndpoint({...})` call.
 * Contains all metadata needed to build a `CastrOperation`.
 *
 * @example
 * ```typescript
 * const definition: EndpointDefinition = {
 *   method: 'get',
 *   path: '/users/{userId}',
 *   summary: 'Get user by ID',
 *   parameters: {
 *     path: { userId: 'z.string().uuid()' },
 *   },
 *   responses: {
 *     '200': 'UserSchema',
 *   },
 * };
 * ```
 *
 * @public
 */
export interface EndpointDefinition {
  /**
   * HTTP method for this endpoint.
   */
  method: EndpointMethod;

  /**
   * API path with parameter placeholders in OpenAPI format.
   * @example '/users/{userId}', '/products/{id}/reviews'
   */
  path: string;

  /**
   * Short summary of the endpoint.
   */
  summary?: string;

  /**
   * Detailed description of the endpoint.
   */
  description?: string;

  /**
   * Tags for grouping endpoints.
   */
  tags?: string[];

  /**
   * Whether this endpoint is deprecated.
   */
  deprecated?: boolean;

  /**
   * Operation ID for unique identification.
   * If not provided, derived from the variable name.
   */
  operationId?: string;

  /**
   * Parameters grouped by location.
   */
  parameters?: EndpointParameters;

  /**
   * Request body schema expression (for POST/PUT/PATCH).
   */
  body?: string;

  /**
   * Response schemas by status code.
   */
  responses: EndpointResponses;
}

/**
 * Result of parsing endpoint definitions from source code.
 *
 * @public
 */
export interface EndpointParseResult {
  /**
   * Successfully parsed endpoint definitions.
   */
  endpoints: EndpointDefinition[];

  /**
   * Errors encountered during parsing.
   */
  errors: EndpointParseError[];
}

/**
 * Error encountered while parsing endpoint definitions.
 *
 * @public
 */
export interface EndpointParseError {
  /**
   * Human-readable error message.
   */
  message: string;

  /**
   * Source location if available.
   */
  location?: {
    line: number;
    column: number;
  };
}
