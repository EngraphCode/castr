/**
 * Centralized OpenAPI type guards and helper types
 *
 * This module provides type guards and helper types for distinguishing between
 * OpenAPI object types (ResponseObject vs ReferenceObject, etc.).
 *
 * Centralized here to avoid circular import issues.
 */

import type { OperationObject, ParameterObject, RequestBodyObject, ResponseObject } from "openapi3-ts/oas30";

/**
 * Allowed HTTP methods per OpenAPI 3.0 spec
 * https://spec.openapis.org/oas/v3.0.3#path-item-object
 */
export const ALLOWED_METHODS = ["get", "head", "options", "post", "put", "patch", "delete"] as const;

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
    if (!maybeMethod || typeof maybeMethod !== "string") {
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

/**
 * Type guard to check if an object is a RequestBodyObject (not a ReferenceObject)
 *
 * Per OpenAPI 3.0 spec, RequestBodyObject has "content" as a required property.
 * openapi3-ts doesn't provide this guard, so we implement it ourselves.
 *
 * @param obj - Object to check
 * @returns True if the object is a RequestBodyObject
 */
export function isRequestBodyObject(obj: unknown): obj is RequestBodyObject {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    // RequestBodyObject has "content" property, ReferenceObject has "$ref"
    return "content" in obj && !("$ref" in obj);
}

/**
 * Type guard to check if an object is a ParameterObject (not a ReferenceObject)
 *
 * Per OpenAPI 3.0 spec, ParameterObject has "name" and "in" as required properties.
 * openapi3-ts doesn't provide this guard, so we implement it ourselves.
 *
 * @param obj - Object to check
 * @returns True if the object is a ParameterObject
 */
export function isParameterObject(obj: unknown): obj is ParameterObject {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    // ParameterObject has "in" and "name" properties, ReferenceObject has "$ref"
    return "in" in obj && "name" in obj && !("$ref" in obj);
}

/**
 * Type guard to check if an object is a ResponseObject (not a ReferenceObject)
 *
 * Per OpenAPI 3.0 spec, ResponseObject can have description, headers, content, links.
 * We use a simple check: if it doesn't have $ref, it's a ResponseObject.
 * Full validation is deferred to openapi3-ts.
 *
 * openapi3-ts doesn't provide this guard, so we implement it ourselves.
 *
 * @param obj - Object to check
 * @returns True if the object is a ResponseObject
 *
 * @example
 * ```typescript
 * if (isResponseObject(response)) {
 *   // TypeScript knows it's ResponseObject, not ReferenceObject
 *   console.log(response.description);
 * }
 * ```
 */
export function isResponseObject(obj: unknown): obj is ResponseObject {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    // Per OpenAPI 3.0 spec: ResponseObject can have description, headers, content, links
    // We need a simple check that distinguishes it from ReferenceObject
    // ReferenceObject has $ref, ResponseObject does not
    // For now, we'll check it's an object and NOT a reference
    // openapi3-ts will handle full validation
    return !("$ref" in obj);
}

