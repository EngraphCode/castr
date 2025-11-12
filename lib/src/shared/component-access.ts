/**
 * Type-safe access to OpenAPI component definitions.
 * Handles both dereferenced and non-dereferenced specs with zero type assertions.
 *
 * Architecture Note:
 * These utilities work with Scalar's bundled specs, which preserve internal $refs.
 * Preserving $refs is essential for:
 * 1. Dependency tracking (getOpenApiDependencyGraph relies on $ref strings)
 * 2. Circular reference detection (z.lazy() generation)
 * 3. Semantic naming (generated code uses meaningful variable names)
 *
 * See: .agent/architecture/SCALAR-PIPELINE.md (Bundling vs Dereferencing)
 */

import type {
  OpenAPIObject,
  SchemaObject,
  ReferenceObject,
  ParameterObject,
  ResponseObject,
  RequestBodyObject,
} from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import { parseComponentRef } from './ref-resolution.js';

/**
 * Get a schema from components.schemas by name.
 * Preserves $refs if present (needed for dependency tracking and semantic naming).
 *
 * Supports both standard OpenAPI location and Scalar's x-ext vendor extension
 * for multi-file specifications. When xExtKey is provided, checks x-ext location
 * first, then falls back to standard location.
 *
 * @param doc - The OpenAPI document
 * @param name - Schema name to look up
 * @param xExtKey - Optional x-ext hash key for multi-file spec external refs
 * @returns SchemaObject | ReferenceObject
 * @throws {Error} If schema not found in either location
 *
 * @example Standard single-file spec
 * ```typescript
 * const schema = getSchemaFromComponents(doc, 'Pet');
 * // Looks in: doc.components.schemas['Pet']
 * ```
 *
 * @example Multi-file spec with x-ext
 * ```typescript
 * const schema = getSchemaFromComponents(doc, 'Pet', '425563c');
 * // Looks in: doc['x-ext']['425563c'].components.schemas['Pet']
 * // Falls back to: doc.components.schemas['Pet']
 * ```
 */
// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
export function getSchemaFromComponents(
  doc: OpenAPIObject,
  name: string,
  xExtKey?: string,
): SchemaObject | ReferenceObject {
  // Try x-ext location first (if xExtKey provided)
  if (xExtKey) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-restricted-types
    const xExt = doc['x-ext'] as Record<string, unknown> | undefined;
    if (xExt) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-restricted-types
      const xExtEntry = xExt[xExtKey] as Record<string, unknown> | undefined;
      if (xExtEntry?.['components']) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-restricted-types
        const components = xExtEntry['components'] as Record<string, unknown>;
        // eslint-disable-next-line max-depth
        if (components['schemas']) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-restricted-types
          const schemas = components['schemas'] as Record<string, unknown>;
          const schema = schemas[name];
          // eslint-disable-next-line max-depth
          if (schema) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return schema as SchemaObject | ReferenceObject;
          }
        }
      }
    }
  }

  // Try standard location (or only location if xExtKey not provided)
  const standardSchema = doc.components?.schemas?.[name];
  if (standardSchema) {
    return standardSchema;
  }

  // Not found in either location - provide helpful error message
  const locations = xExtKey
    ? `x-ext.${xExtKey}.components.schemas or components.schemas`
    : 'components.schemas';
  throw new Error(`Schema '${name}' not found in ${locations}`);
}

/**
 * Resolve a schema $ref to its definition.
 * Returns schema unchanged if not a ReferenceObject.
 * Supports both standard refs and x-ext vendor extension refs.
 * @param doc - The OpenAPI document
 * @param schema - Schema to resolve
 * @returns Resolved SchemaObject
 * @throws {Error} If $ref is invalid or nested
 */
export function resolveSchemaRef(
  doc: OpenAPIObject,
  schema: SchemaObject | ReferenceObject,
): SchemaObject {
  if (!isReferenceObject(schema)) {
    return schema;
  }

  const ref = schema.$ref;
  const parsedRef = parseComponentRef(ref);

  // Only support schema refs (not parameters, responses, etc.)
  if (parsedRef.componentType !== 'schemas') {
    throw new Error(
      `Invalid schema $ref: ${ref}. Expected schema reference, got ${parsedRef.componentType}`,
    );
  }

  const resolvedSchema = getSchemaFromComponents(doc, parsedRef.componentName, parsedRef.xExtKey);
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
 * Use ONLY where refs should be impossible (after proper dereferencing).
 * @param value - Value to check
 * @param context - Context for error message
 * @throws {Error} If value is a ReferenceObject
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
    throw new Error(
      `Parameter '${componentName}' not found: doc.components.parameters is undefined`,
    );
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
