/**
 * Centralized OpenAPI type guards and helper types
 *
 * This module provides type guards and helper types for distinguishing between
 * OpenAPI object types (ResponseObject vs ReferenceObject, etc.).
 *
 * Centralized here to avoid circular import issues.
 */

import { type OperationObject, isReferenceObject } from '../shared/openapi-types.js';
import {
  STANDARD_HTTP_METHODS,
  type StandardHttpMethod,
  isStandardHttpMethod,
} from '../shared/openapi/http-methods.js';

// Re-export isReferenceObject for convenience
export { isReferenceObject };

/**
 * Allowed standard HTTP methods per OpenAPI 3.2 Path Item Object.
 */
export const ALLOWED_METHODS = STANDARD_HTTP_METHODS;

/**
 * Type representing allowed HTTP methods
 */
export type AllowedMethod = StandardHttpMethod;

/**
 * Type guard to check if a string is an allowed HTTP method
 *
 * @param maybeMethod - Value to check
 * @returns True if the value is a valid HTTP method string
 *
 * @example
 * ```typescript
 * if (isAllowedMethod("get")) {
 *   // TypeScript knows it's "get" | "post" | etc.
 * }
 * ```
 */
export function isAllowedMethod(maybeMethod: unknown): maybeMethod is AllowedMethod {
  return isStandardHttpMethod(maybeMethod);
}

/**
 * PathItem type using Partial because not all HTTP methods are required
 *
 * A path may only implement some HTTP methods (e.g., only GET and POST),
 * not necessarily all of them. This matches the OpenAPI spec behavior.
 */
export type PathItem = Partial<Record<AllowedMethod, OperationObject | undefined>>;
