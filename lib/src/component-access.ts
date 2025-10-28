/**
 * Component Access Functions
 *
 * Provides type-safe access to OpenAPI component definitions without type assertions.
 * Replaces makeSchemaResolver with honest types that handle both dereferenced and
 * non-dereferenced specs correctly.
 *
 * Key principles:
 * - Use ComponentsObject from openapi3-ts/oas30 (no ad-hoc types)
 * - Preserve component schema $refs (needed for semantic naming)
 * - Handle both dereferenced AND non-dereferenced specs
 * - Fail-fast with helpful error messages
 * - Zero type assertions
 *
 * @see .agent/plans/01-CURRENT-IMPLEMENTATION.md Task 1.1
 * @see .agent/analysis/E2E-TEST-MATRIX.md
 */

import type {
  OpenAPIObject,
  SchemaObject,
  ReferenceObject,
  ParameterObject,
  ResponseObject,
  RequestBodyObject,
} from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

/**
 * Get a schema from components.schemas by name.
 *
 * This function preserves $refs if present (needed for dependency tracking
 * and semantic naming). It returns either a SchemaObject or a ReferenceObject,
 * allowing the caller to handle refs appropriately.
 *
 * @param doc - The OpenAPI document
 * @param name - The schema name to look up
 * @returns The schema (may be a SchemaObject or ReferenceObject)
 * @throws {Error} If schema not found in components.schemas
 *
 * @example
 * ```typescript
 * const userSchema = getSchemaFromComponents(doc, 'User');
 * // Returns: SchemaObject | ReferenceObject
 * ```
 */
export function getSchemaFromComponents(
  doc: OpenAPIObject,
  name: string,
): SchemaObject | ReferenceObject {
  // Check if components and components.schemas exist
  if (!doc.components?.schemas) {
    throw new Error(`Schema '${name}' not found in components.schemas`);
  }

  const schema = doc.components.schemas[name];

  if (!schema) {
    throw new Error(`Schema '${name}' not found in components.schemas`);
  }

  return schema;
}

/**
 * Resolve a schema $ref to its definition.
 *
 * If the schema is not a ReferenceObject, returns it unchanged.
 * If it is a ReferenceObject, resolves the $ref to the actual schema definition.
 *
 * This function is used for dependency graph building and schema traversal.
 * It validates that refs point to schemas (not parameters, responses, etc.)
 * and that the spec is properly dereferenced (no nested $refs).
 *
 * @param doc - The OpenAPI document
 * @param schema - The schema to resolve (SchemaObject or ReferenceObject)
 * @returns The resolved SchemaObject (never a ReferenceObject)
 * @throws {Error} If $ref is invalid or points to non-schema component
 * @throws {Error} If nested $ref detected (spec not fully dereferenced)
 *
 * @example
 * ```typescript
 * const ref = { $ref: '#/components/schemas/User' };
 * const schema = resolveSchemaRef(doc, ref);
 * // Returns: SchemaObject (the actual User schema)
 * ```
 */
export function resolveSchemaRef(
  doc: OpenAPIObject,
  schema: SchemaObject | ReferenceObject,
): SchemaObject {
  // If not a reference, return as-is
  if (!isReferenceObject(schema)) {
    return schema;
  }

  // Extract schema name from $ref
  const ref = schema.$ref;

  // Validate $ref format: must be #/components/schemas/{name}
  const schemaRefPattern = /^#\/components\/schemas\/(.+)$/;
  const match = schemaRefPattern.exec(ref);

  if (!match || !match[1]) {
    throw new Error(`Invalid schema $ref: ${ref}`);
  }

  const schemaName = match[1];

  // Get the schema from components
  const resolvedSchema = getSchemaFromComponents(doc, schemaName);

  // Check if the resolved schema is itself a $ref (nested ref)
  if (isReferenceObject(resolvedSchema)) {
    throw new Error(
      `Nested $ref in schema: ${ref} -> ${resolvedSchema.$ref}. ` +
        `Use SwaggerParser.dereference() to fully dereference the spec`,
    );
  }

  return resolvedSchema;
}

/**
 * Type guard assertion that value is not a ReferenceObject.
 *
 * Use this ONLY where refs should be impossible (after proper dereferencing).
 * This should be used sparingly - prefer conditional logic with isReferenceObject.
 *
 * After SwaggerParser.dereference(), operation-level properties (parameters,
 * requestBody, responses) should NEVER be ReferenceObjects. If they are,
 * it means the spec wasn't properly dereferenced.
 *
 * @param value - The value to check
 * @param context - Context string for error message (e.g., "operation.parameters[0]")
 * @throws {Error} If value is a ReferenceObject (with helpful message)
 *
 * @example
 * ```typescript
 * // After dereference, parameters should not have $refs
 * const param = operation.parameters[0];
 * assertNotReference(param, 'operation.parameters[0]');
 * // If this doesn't throw, param is definitely not a ReferenceObject
 * ```
 */
export function assertNotReference<T>(
  value: T | ReferenceObject,
  context: string,
): asserts value is T {
  if (isReferenceObject(value)) {
    throw new Error(
      `Unexpected $ref in ${context}: ${value.$ref}. ` +
        `Ensure you called SwaggerParser.dereference() before code generation`,
    );
  }
}

/**
 * Parse a component $ref into its type and name.
 *
 * @param ref - The $ref string (e.g., "#/components/schemas/User")
 * @returns Object with componentType and componentName
 * @throws {Error} If $ref format is invalid
 *
 * @internal
 */
function parseComponentRef(ref: string): { componentType: string; componentName: string } {
  const refPattern = /^#\/components\/([^/]+)\/(.+)$/;
  const match = refPattern.exec(ref);

  if (!match || !match[1] || !match[2]) {
    throw new Error(`Invalid component $ref: ${ref}. Expected format: #/components/{type}/{name}`);
  }

  return {
    componentType: match[1],
    componentName: match[2],
  };
}

/**
 * Get a parameter from components.parameters by $ref.
 * Preserves exact type information - returns ParameterObject | ReferenceObject.
 *
 * @param doc - The OpenAPI document
 * @param ref - The $ref string (e.g., "#/components/parameters/UserId")
 * @returns The parameter definition
 * @throws {Error} If $ref is invalid or parameter not found
 *
 * @example
 * ```typescript
 * const param = getParameterByRef(doc, '#/components/parameters/UserId');
 * // Type: ParameterObject | ReferenceObject (exact types from openapi3-ts)
 * ```
 */
export function getParameterByRef(
  doc: OpenAPIObject,
  ref: string,
): ParameterObject | ReferenceObject {
  const { componentType, componentName } = parseComponentRef(ref);

  if (componentType !== 'parameters') {
    throw new Error(`Expected parameter $ref, got: ${ref}`);
  }

  if (!doc.components?.parameters) {
    throw new Error(`Parameter '${componentName}' not found: doc.components.parameters is undefined`);
  }

  const parameter = doc.components.parameters[componentName];

  if (!parameter) {
    throw new Error(`Parameter '${componentName}' not found in doc.components.parameters`);
  }

  return parameter;
}

/**
 * Get a response from components.responses by $ref.
 * Preserves exact type information - returns ResponseObject | ReferenceObject.
 *
 * @param doc - The OpenAPI document
 * @param ref - The $ref string (e.g., "#/components/responses/Success")
 * @returns The response definition
 * @throws {Error} If $ref is invalid or response not found
 *
 * @example
 * ```typescript
 * const response = getResponseByRef(doc, '#/components/responses/Success');
 * // Type: ResponseObject | ReferenceObject (exact types from openapi3-ts)
 * ```
 */
export function getResponseByRef(
  doc: OpenAPIObject,
  ref: string,
): ResponseObject | ReferenceObject {
  const { componentType, componentName } = parseComponentRef(ref);

  if (componentType !== 'responses') {
    throw new Error(`Expected response $ref, got: ${ref}`);
  }

  if (!doc.components?.responses) {
    throw new Error(`Response '${componentName}' not found: doc.components.responses is undefined`);
  }

  const response = doc.components.responses[componentName];

  if (!response) {
    throw new Error(`Response '${componentName}' not found in doc.components.responses`);
  }

  return response;
}

/**
 * Get a request body from components.requestBodies by $ref.
 * Preserves exact type information - returns RequestBodyObject | ReferenceObject.
 *
 * @param doc - The OpenAPI document
 * @param ref - The $ref string (e.g., "#/components/requestBodies/UserBody")
 * @returns The request body definition
 * @throws {Error} If $ref is invalid or request body not found
 *
 * @example
 * ```typescript
 * const body = getRequestBodyByRef(doc, '#/components/requestBodies/UserBody');
 * // Type: RequestBodyObject | ReferenceObject (exact types from openapi3-ts)
 * ```
 */
export function getRequestBodyByRef(
  doc: OpenAPIObject,
  ref: string,
): RequestBodyObject | ReferenceObject {
  const { componentType, componentName } = parseComponentRef(ref);

  if (componentType !== 'requestBodies') {
    throw new Error(`Expected requestBody $ref, got: ${ref}`);
  }

  if (!doc.components?.requestBodies) {
    throw new Error(
      `RequestBody '${componentName}' not found: doc.components.requestBodies is undefined`,
    );
  }

  const requestBody = doc.components.requestBodies[componentName];

  if (!requestBody) {
    throw new Error(`RequestBody '${componentName}' not found in doc.components.requestBodies`);
  }

  return requestBody;
}
