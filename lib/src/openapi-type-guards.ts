/**
 * Centralized OpenAPI type guards and helper types
 *
 * This module provides type guards and helper types for distinguishing between
 * OpenAPI object types (ResponseObject vs ReferenceObject, etc.).
 *
 * Centralized here to avoid circular import issues.
 */

import type {
    OperationObject,
    ParameterObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject,
} from "openapi3-ts/oas30";

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
 * Type guard to check if an object is a ReferenceObject
 *
 * Per OpenAPI 3.0 spec, ReferenceObject MUST have "$ref".
 * This is the definitive way to distinguish ReferenceObject from other OpenAPI objects.
 *
 * @param obj - Unknown object to check
 * @returns True if the object is a ReferenceObject
 *
 * @example
 * ```typescript
 * if (isReferenceObject(maybeRef)) {
 *   console.log(maybeRef.$ref); // TypeScript knows it has $ref
 * }
 * ```
 */
export function isReferenceObject(obj: unknown): obj is ReferenceObject {
    return typeof obj === "object" && obj !== null && "$ref" in obj && typeof obj.$ref === "string";
}

/**
 * Type guard to distinguish RequestBodyObject from ReferenceObject
 *
 * Uses lenient checking: only verifies absence of "$ref" to distinguish from ReferenceObject.
 * Does not enforce full OpenAPI spec compliance (e.g., required properties).
 * This allows the library to be tolerant of slightly malformed specs.
 *
 * @param obj - Unknown object to narrow
 * @returns True if the object is NOT a ReferenceObject (lenient narrowing)
 *
 * @example
 * ```typescript
 * const maybeBody: unknown = operation.requestBody;
 * if (isRequestBodyObject(maybeBody)) {
 *   // TypeScript knows it's RequestBodyObject, not ReferenceObject
 *   console.log(maybeBody.content);
 * }
 * ```
 */
export function isRequestBodyObject(obj: unknown): obj is RequestBodyObject {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    // Lenient: just check it's NOT a ReferenceObject (no $ref property)
    // openapi3-ts and swagger-parser handle full spec validation
    return !("$ref" in obj);
}

/**
 * Type guard to distinguish ParameterObject from ReferenceObject
 *
 * Uses lenient checking: only verifies absence of "$ref" to distinguish from ReferenceObject.
 * Does not enforce full OpenAPI spec compliance (e.g., required properties).
 * This allows the library to be tolerant of slightly malformed specs.
 *
 * @param obj - Unknown object to narrow
 * @returns True if the object is NOT a ReferenceObject (lenient narrowing)
 *
 * @example
 * ```typescript
 * const maybeParam: unknown = parameters[0];
 * if (isParameterObject(maybeParam)) {
 *   // TypeScript knows it's ParameterObject, not ReferenceObject
 *   console.log(maybeParam.name, maybeParam.in);
 * }
 * ```
 */
export function isParameterObject(obj: unknown): obj is ParameterObject {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    // Lenient: just check it's NOT a ReferenceObject (no $ref property)
    // openapi3-ts and swagger-parser handle full spec validation
    return !("$ref" in obj);
}

/**
 * Type guard to distinguish ResponseObject from ReferenceObject
 *
 * Uses lenient checking: only verifies absence of "$ref" to distinguish from ReferenceObject.
 * Does not enforce full OpenAPI spec compliance (e.g., required "description" property).
 * This allows the library to be tolerant of slightly malformed specs.
 *
 * @param obj - Unknown object to narrow
 * @returns True if the object is NOT a ReferenceObject (lenient narrowing)
 *
 * @example
 * ```typescript
 * const maybeResponse: unknown = responses["200"];
 * if (isResponseObject(maybeResponse)) {
 *   // TypeScript knows it's ResponseObject, not ReferenceObject
 *   console.log(maybeResponse.description);
 * }
 * ```
 */
export function isResponseObject(obj: unknown): obj is ResponseObject {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    // Lenient: just check it's NOT a ReferenceObject (no $ref property)
    // openapi3-ts and swagger-parser handle full spec validation
    // NOTE: Per OpenAPI 3.0 spec, "description" is required, but many real-world
    // specs omit it, so we don't enforce it here to be tolerant
    return !("$ref" in obj);
}
