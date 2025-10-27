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

import type { OpenAPIObject, SchemaObject, ReferenceObject } from 'openapi3-ts/oas30';

/**
 * Type guard to check if a value is a ReferenceObject.
 *
 * @param obj - Value to check
 * @returns True if the value has a $ref property
 */
function isReferenceObject(obj: unknown): obj is ReferenceObject {
  return (
    obj != null &&
    typeof obj === 'object' &&
    '$ref' in obj &&
    typeof (obj as ReferenceObject).$ref === 'string'
  );
}

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
  const match = ref.match(schemaRefPattern);

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
