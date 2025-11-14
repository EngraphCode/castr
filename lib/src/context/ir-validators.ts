/**
 * Information Retrieval (IR) Type Guards and Validators
 *
 * Provides runtime type checking for IR structures using TypeScript type predicates.
 * These guards enable safe narrowing from `unknown` to specific IR types for
 * validating retrieved OpenAPI information.
 *
 * **Type Safety:**
 * - All guards use `value is Type` syntax for proper type narrowing
 * - Record<string, unknown> is necessary for validating unknown values
 * - Type assertions are carefully controlled and necessary for runtime validation
 * - Validates required fields and their types
 *
 * **ESLint Exceptions:**
 * Type guards require patterns that ESLint normally forbids:
 * - Record<string, unknown> for validating unknown object shapes
 * - Type assertions for narrowing to Record for property access
 * - Higher complexity for thorough validation logic
 *
 * @module ir-validators
 * @since 1.0.0
 * @public
 */

/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-restricted-types */
/* eslint-disable complexity */

import type { IRComponent, IRDocument, IROperation, IRSchema, IRSchemaNode } from './ir-schema.js';
import { IRSchemaProperties } from './ir-schema-properties.js';

/**
 * Type guard for IRDocument.
 *
 * Validates that a value is a valid IRDocument by checking for required fields
 * and their types. Performs structural validation without deep checking nested objects.
 *
 * @param value - Value to check
 * @returns True if value is a valid IRDocument
 *
 * @example
 * ```typescript
 * const data: unknown = await fetchIR();
 * if (isIRDocument(data)) {
 *   // TypeScript knows data is IRDocument here
 *   console.log(data.version, data.openApiVersion);
 * }
 * ```
 *
 * @public
 */
export function isIRDocument(value: unknown): value is IRDocument {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj['version'] === 'string' &&
    typeof obj['openApiVersion'] === 'string' &&
    obj['info'] != null &&
    typeof obj['info'] === 'object' &&
    Array.isArray(obj['components']) &&
    Array.isArray(obj['operations']) &&
    obj['dependencyGraph'] != null &&
    typeof obj['dependencyGraph'] === 'object'
  );
}

/**
 * Type guard for IRComponent.
 *
 * Validates that a value is a valid IRComponent by checking for required fields
 * including type discriminator, name, schema, and metadata.
 *
 * @param value - Value to check
 * @returns True if value is a valid IRComponent
 *
 * @example
 * ```typescript
 * const component: unknown = getComponent();
 * if (isIRComponent(component)) {
 *   // TypeScript knows component is IRComponent here
 *   console.log(component.type, component.name);
 * }
 * ```
 *
 * @public
 */
export function isIRComponent(value: unknown): value is IRComponent {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Validate type discriminator
  const validTypes = ['schema', 'response', 'parameter', 'requestBody'];
  if (typeof obj['type'] !== 'string' || !validTypes.includes(obj['type'])) {
    return false;
  }

  // Validate required fields
  return (
    typeof obj['name'] === 'string' &&
    obj['schema'] != null &&
    typeof obj['schema'] === 'object' &&
    obj['metadata'] != null &&
    typeof obj['metadata'] === 'object'
  );
}

/**
 * Type guard for IROperation.
 *
 * Validates that a value is a valid IROperation by checking for required fields
 * including operationId, HTTP method, path, parameters, and responses.
 *
 * @param value - Value to check
 * @returns True if value is a valid IROperation
 *
 * @example
 * ```typescript
 * const operation: unknown = getOperation();
 * if (isIROperation(operation)) {
 *   // TypeScript knows operation is IROperation here
 *   console.log(operation.operationId, operation.method, operation.path);
 * }
 * ```
 *
 * @public
 */
export function isIROperation(value: unknown): value is IROperation {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Validate HTTP method
  const validMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
  if (typeof obj['method'] !== 'string' || !validMethods.includes(obj['method'])) {
    return false;
  }

  // Validate required fields
  return (
    typeof obj['operationId'] === 'string' &&
    typeof obj['path'] === 'string' &&
    Array.isArray(obj['parameters']) &&
    Array.isArray(obj['responses'])
  );
}

/**
 * Type guard for IRSchema.
 *
 * Validates that a value is a valid IRSchema by checking for the required
 * metadata field. The schema structure itself is flexible (can be primitive,
 * object, array, composition, or reference), but metadata is always required.
 *
 * @param value - Value to check
 * @returns True if value is a valid IRSchema
 *
 * @example
 * ```typescript
 * const schema: unknown = getSchema();
 * if (isIRSchema(schema)) {
 *   // TypeScript knows schema is IRSchema here
 *   console.log(schema.type, schema.metadata.required);
 * }
 * ```
 *
 * @public
 */
export function isIRSchema(value: unknown): value is IRSchema {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Validate properties if present
  if ('properties' in obj && obj['properties'] !== undefined) {
    if (!(obj['properties'] instanceof IRSchemaProperties)) {
      return false;
    }
  }

  // The only required field in IRSchema is metadata
  // All other fields (type, properties, items, etc.) are optional
  return obj['metadata'] != null && typeof obj['metadata'] === 'object';
}

/**
 * Type guard for IRSchemaNode.
 *
 * Validates that a value is a valid IRSchemaNode by checking for all required
 * fields including required, nullable, zodChain, dependencyGraph, and
 * circularReferences.
 *
 * This is the metadata structure that replaces CodeMetaData.
 *
 * @param value - Value to check
 * @returns True if value is a valid IRSchemaNode
 *
 * @example
 * ```typescript
 * const metadata: unknown = getMetadata();
 * if (isIRSchemaNode(metadata)) {
 *   // TypeScript knows metadata is IRSchemaNode here
 *   console.log(metadata.required, metadata.nullable);
 *   console.log(metadata.zodChain.presence);
 * }
 * ```
 *
 * @public
 */
export function isIRSchemaNode(value: unknown): value is IRSchemaNode {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Validate required boolean fields
  if (typeof obj['required'] !== 'boolean' || typeof obj['nullable'] !== 'boolean') {
    return false;
  }

  // Validate zodChain structure
  if (
    obj['zodChain'] == null ||
    typeof obj['zodChain'] !== 'object' ||
    typeof (obj['zodChain'] as Record<string, unknown>)['presence'] !== 'string' ||
    !Array.isArray((obj['zodChain'] as Record<string, unknown>)['validations']) ||
    !Array.isArray((obj['zodChain'] as Record<string, unknown>)['defaults'])
  ) {
    return false;
  }

  // Validate dependencyGraph structure
  if (
    obj['dependencyGraph'] == null ||
    typeof obj['dependencyGraph'] !== 'object' ||
    !Array.isArray((obj['dependencyGraph'] as Record<string, unknown>)['references']) ||
    !Array.isArray((obj['dependencyGraph'] as Record<string, unknown>)['referencedBy']) ||
    typeof (obj['dependencyGraph'] as Record<string, unknown>)['depth'] !== 'number'
  ) {
    return false;
  }

  // Validate circularReferences array
  if (!Array.isArray(obj['circularReferences'])) {
    return false;
  }

  return true;
}
