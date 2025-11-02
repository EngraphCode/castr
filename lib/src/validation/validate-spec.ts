/* eslint-disable */
// this file will be deleted

import type { OpenAPIObject } from 'openapi3-ts/oas30';

/**
 * Custom error class for OpenAPI validation failures.
 * Extends Error to provide better stack traces and type checking.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Validates an OpenAPI specification object for structural correctness.
 *
 * This is a **pure function** that:
 * - Does not modify the input
 * - Returns the same input object (identity function when valid)
 * - Is deterministic (same input always produces same result)
 * - Has no side effects
 *
 * **Design Philosophy:**
 * - Fail fast at the boundary (before domain logic)
 * - Fail loud with helpful, actionable error messages
 * - Only validate structure, not semantics (that's SwaggerParser's job)
 * - Single source of truth for validation across CLI and programmatic APIs
 *
 * **What it validates:**
 * - Spec is an object (not null, undefined, string, etc.)
 * - Required properties exist: openapi, info, paths
 * - Required properties have correct types
 * - OpenAPI version is 3.0.x (not 2.0/Swagger or 3.1.x)
 *
 * **What it does NOT validate:**
 * - Schema correctness (use SwaggerParser.validate() for that)
 * - $ref resolution (use SwaggerParser.bundle() for that)
 * - Business rules or semantic validation
 *
 * @example
 * ```typescript
 * import { validateOpenApiSpec, ValidationError } from './validateOpenApiSpec';
 *
 * try {
 *   const validatedSpec = validateOpenApiSpec(userProvidedSpec);
 *   // Safe to use validatedSpec in domain logic
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('Invalid OpenAPI spec:', error.message);
 *   }
 * }
 * ```
 *
 * @param spec - The OpenAPI specification object to validate
 * @returns The same spec object (identity) if validation passes
 * @throws {ValidationError} If the spec is structurally invalid
 * @note This function will be replaced in Phase 1 Part 5 with a unified input handling system.
 *      The code will be rewritten to use SwaggerParser.bundle for all code paths, and this function
 *      will be replaced with a simple type assertion helper (`assertOpenApiType`).
 */

export function validateOpenApiSpec(spec: unknown): OpenAPIObject {
  // Check 1: Spec must be an object
  if (spec === null) {
    throw new ValidationError('Invalid OpenAPI document: expected an object, received null');
  }

  if (spec === undefined) {
    throw new ValidationError('Invalid OpenAPI document: expected an object, received undefined');
  }

  if (typeof spec !== 'object') {
    throw new ValidationError(
      `Invalid OpenAPI document: expected an object, received ${typeof spec}`,
    );
  }

  if (Array.isArray(spec)) {
    throw new ValidationError('Invalid OpenAPI document: expected an object, received array');
  }

  // Type assertion is safe here because we've validated it's a non-null object
  const doc = spec as Record<string, unknown>;

  // Check 2: Detect OpenAPI 2.0 (Swagger) and provide helpful error
  if ('swagger' in doc) {
    throw new ValidationError(
      'Unsupported OpenAPI version: found swagger property. This library only supports OpenAPI 3.0.x',
    );
  }

  // Check 3: Required property 'openapi' exists
  if (!('openapi' in doc)) {
    throw new ValidationError("Invalid OpenAPI document: missing required property 'openapi'");
  }

  // Check 4: Property 'openapi' must be a string
  if (typeof doc['openapi'] !== 'string') {
    throw new ValidationError(
      `Invalid OpenAPI document: property 'openapi' must be a string, received ${typeof doc['openapi']}`,
    );
  }

  // Check 5: Validate OpenAPI version format and support
  const version = doc['openapi'];
  const versionPattern = /^3\.0\.\d+$/;

  if (!versionPattern.test(version)) {
    // Check if it's 3.1.x
    if (version.startsWith('3.1.')) {
      throw new ValidationError(
        `Unsupported OpenAPI version: ${version}. This library only supports OpenAPI 3.0.x (3.0.0 - 3.0.3)`,
      );
    }

    // Invalid format
    throw new ValidationError(
      `Invalid OpenAPI version format: '${version}'. Expected format: 3.0.x`,
    );
  }

  // Check 6: Required property 'info' exists
  if (!('info' in doc)) {
    throw new ValidationError("Invalid OpenAPI document: missing required property 'info'");
  }

  // Check 7: Property 'info' must be an object
  if (typeof doc['info'] !== 'object' || doc['info'] === null || Array.isArray(doc['info'])) {
    const receivedType =
      doc['info'] === null ? 'null' : Array.isArray(doc['info']) ? 'array' : typeof doc['info'];
    throw new ValidationError(
      `Invalid OpenAPI document: property 'info' must be an object, received ${receivedType}`,
    );
  }

  // Check 8: Required property 'paths' exists
  if (!('paths' in doc)) {
    throw new ValidationError("Invalid OpenAPI document: missing required property 'paths'");
  }

  // Check 9: Property 'paths' must be an object
  if (typeof doc['paths'] !== 'object' || doc['paths'] === null || Array.isArray(doc['paths'])) {
    const receivedType =
      doc['paths'] === null ? 'null' : Array.isArray(doc['paths']) ? 'array' : typeof doc['paths'];
    throw new ValidationError(
      `Invalid OpenAPI document: property 'paths' must be an object, received ${receivedType}`,
    );
  }

  // All validations passed - return the spec (identity function)
  // Type assertion is safe here because we've validated the structure
  return spec as OpenAPIObject;
}
