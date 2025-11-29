/**
 * Centralized OpenAPI type guards and helper types
 *
 * This module provides type guards and helper types for distinguishing between
 * OpenAPI object types (ResponseObject vs ReferenceObject, etc.).
 *
 * Centralized here to avoid circular import issues.
 */

import type { OperationObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

// Re-export isReferenceObject for convenience
export { isReferenceObject };

/**
 * Allowed HTTP methods per OpenAPI 3.0 spec
 * https://spec.openapis.org/oas/v3.0.3#path-item-object
 */
export const ALLOWED_METHODS = [
  'get',
  'head',
  'options',
  'post',
  'put',
  'patch',
  'delete',
] as const;

/**
 * Type representing allowed HTTP methods
 */
export type AllowedMethod = (typeof ALLOWED_METHODS)[number];

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
  if (!maybeMethod || typeof maybeMethod !== 'string') {
    return false;
  }
  // Cast to readonly string[] for .includes() compatibility
  const stringMethods: readonly string[] = ALLOWED_METHODS;
  return stringMethods.includes(maybeMethod);
}

/**
 * PathItem type using Partial because not all HTTP methods are required
 *
 * A path may only implement some HTTP methods (e.g., only GET and POST),
 * not necessarily all of them. This matches the OpenAPI spec behavior.
 */
export type PathItem = Partial<Record<AllowedMethod, OperationObject | undefined>>;
