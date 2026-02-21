/**
 * Intermediate Representation (IR) Type Guards and Validators
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

import type { CastrSchema, CastrSchemaNode } from '../models/schema.js';
import { CastrSchemaProperties } from '../models/schema.js';

import { type UnknownRecord, isRecord } from '../../../shared/type-utils/types.js';
import type { CastrDocument } from '../models/schema-document.js';
import type { IRComponent } from '../models/schema.components.js';
import type { CastrOperation } from '../models/schema.operations.js';

const HTTP_METHOD_GET = 'get' as const;
const HTTP_METHOD_POST = 'post' as const;
const HTTP_METHOD_PUT = 'put' as const;
const HTTP_METHOD_PATCH = 'patch' as const;
const HTTP_METHOD_DELETE = 'delete' as const;
const HTTP_METHOD_HEAD = 'head' as const;
const HTTP_METHOD_OPTIONS = 'options' as const;
const VALID_HTTP_METHODS = new Set<string>([
  HTTP_METHOD_GET,
  HTTP_METHOD_POST,
  HTTP_METHOD_PUT,
  HTTP_METHOD_PATCH,
  HTTP_METHOD_DELETE,
  HTTP_METHOD_HEAD,
  HTTP_METHOD_OPTIONS,
]);

function isSupportedHttpMethod(method: unknown): boolean {
  return typeof method === 'string' && VALID_HTTP_METHODS.has(method);
}

/**
 * Type guard for CastrDocument.
 *
 * Validates that a value is a valid CastrDocument by checking for required fields
 * and their types. Performs structural validation without deep checking nested objects.
 *
 * @param value - Value to check
 * @returns True if value is a valid CastrDocument
 *
 * @example
 * ```typescript
 * const data: unknown = await fetchIR();
 * if (isCastrDocument(data)) {
 *   // TypeScript knows data is CastrDocument here
 *   console.log(data.version, data.openApiVersion);
 * }
 * ```
 *
 * @public
 */
export function isCastrDocument(value: unknown): value is CastrDocument {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value['version'] === 'string' &&
    typeof value['openApiVersion'] === 'string' &&
    isRecord(value['info']) &&
    Array.isArray(value['components']) &&
    Array.isArray(value['operations']) &&
    isRecord(value['dependencyGraph'])
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
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value['name'] !== 'string') {
    return false;
  }

  switch (value['type']) {
    case 'schema':
      return isCastrSchemaComponent(value);
    case 'parameter':
      return isRecord(value['parameter']);
    case 'response':
      return isRecord(value['response']);
    case 'requestBody':
      return isRecord(value['requestBody']);
    case 'securityScheme':
      return isRecord(value['scheme']);
    default:
      return false;
  }
}

function isCastrSchemaComponent(value: UnknownRecord): boolean {
  return isRecord(value['schema']) && isRecord(value['metadata']);
}

/**
 * Type guard for CastrOperation.
 *
 * Validates that a value is a valid CastrOperation by checking for required fields
 * including operationId, HTTP method, path, parameters, and responses.
 *
 * @param value - Value to check
 * @returns True if value is a valid CastrOperation
 *
 * @example
 * ```typescript
 * const operation: unknown = getOperation();
 * if (isCastrOperation(operation)) {
 *   // TypeScript knows operation is CastrOperation here
 *   console.log(operation.operationId, operation.method, operation.path);
 * }
 * ```
 *
 * @public
 */
export function isCastrOperation(value: unknown): value is CastrOperation {
  if (!isRecord(value)) {
    return false;
  }

  // Validate HTTP method
  if (!isSupportedHttpMethod(value['method'])) {
    return false;
  }

  // Validate required fields
  return (
    typeof value['operationId'] === 'string' &&
    typeof value['path'] === 'string' &&
    Array.isArray(value['parameters']) &&
    Array.isArray(value['responses'])
  );
}

/**
 * Type guard for CastrSchema.
 *
 * Validates that a value is a valid CastrSchema by checking for the required
 * metadata field. The schema structure itself is flexible (can be primitive,
 * object, array, composition, or reference), but metadata is always required.
 *
 * @param value - Value to check
 * @returns True if value is a valid CastrSchema
 *
 * @example
 * ```typescript
 * const schema: unknown = getSchema();
 * if (isCastrSchema(schema)) {
 *   // TypeScript knows schema is CastrSchema here
 *   console.log(schema.type, schema.metadata.required);
 * }
 * ```
 *
 * @public
 */
export function isCastrSchema(value: unknown): value is CastrSchema {
  if (!isRecord(value)) {
    return false;
  }

  // Validate properties if present
  if ('properties' in value && value['properties'] !== undefined) {
    if (!(value['properties'] instanceof CastrSchemaProperties)) {
      return false;
    }
  }

  // The only required field in CastrSchema is metadata
  // All other fields (type, properties, items, etc.) are optional
  return isRecord(value['metadata']);
}

/**
 * Type guard for CastrSchemaNode.
 *
 * Validates that a value is a valid CastrSchemaNode by checking for all required
 * fields including required, nullable, zodChain, dependencyGraph, and
 * circularReferences.
 *
 * This is the metadata structure that replaces CodeMetaData.
 *
 * @param value - Value to check
 * @returns True if value is a valid CastrSchemaNode
 *
 * @example
 * ```typescript
 * const metadata: unknown = getMetadata();
 * if (isCastrSchemaNode(metadata)) {
 *   // TypeScript knows metadata is CastrSchemaNode here
 *   console.log(metadata.required, metadata.nullable);
 *   console.log(metadata.zodChain.presence);
 * }
 * ```
 *
 * @public
 */
export function isCastrSchemaNode(value: unknown): value is CastrSchemaNode {
  if (!isRecord(value)) {
    return false;
  }

  // Validate required boolean fields
  if (typeof value['required'] !== 'boolean' || typeof value['nullable'] !== 'boolean') {
    return false;
  }

  return (
    isZodChain(value['zodChain']) &&
    isDependencyGraph(value['dependencyGraph']) &&
    Array.isArray(value['circularReferences'])
  );
}

function isZodChain(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value['presence'] === 'string' &&
    Array.isArray(value['validations']) &&
    Array.isArray(value['defaults'])
  );
}

function isDependencyGraph(value: unknown): boolean {
  return (
    isRecord(value) &&
    Array.isArray(value['references']) &&
    Array.isArray(value['referencedBy']) &&
    typeof value['depth'] === 'number'
  );
}
