/**
 * Core Type Guards
 *
 * Type-safe predicates for runtime type checking.
 * All guards use the `value is Type` syntax for proper type narrowing.
 *
 * @module type-guards
 * @public
 */

import type { CastrSchema } from '../../schema-processing/ir/index.js';
import { CastrSchemaProperties } from '../../schema-processing/ir/index.js';

/**
 * Type guard for string values.
 *
 * @param value - Value to check
 * @returns True if value is a string
 *
 * @example
 * ```typescript
 * const data: unknown = getValue();
 * if (isString(data)) {
 *   console.log(data.toUpperCase()); // Type-safe: string methods available
 * }
 * ```
 *
 * @public
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for Record values.
 *
 * Checks if value is a plain object (not null, not array).
 *
 * @param value - Value to check
 * @returns True if value is a record object
 *
 * @example
 * ```typescript
 * const data: unknown = JSON.parse(input);
 * if (isRecord(data)) {
 *   // Safe to access properties
 *   console.log(data['key']);
 * }
 * ```
 *
 * @public
 */
export function isRecord(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for CastrSchema.
 *
 * Checks if value is a valid CastrSchema by verifying required metadata field.
 *
 * @param value - Value to check
 * @returns True if value is an CastrSchema
 *
 * @example
 * ```typescript
 * const data: unknown = deserialize(json);
 * if (isCastrSchema(data)) {
 *   console.log(data.metadata.required); // Type-safe: CastrSchema fields available
 * }
 * ```
 *
 * @public
 */
export function isCastrSchema(value: unknown): value is CastrSchema {
  return isRecord(value) && 'metadata' in value;
}

/**
 * Type guard for CastrSchemaProperties.
 *
 * Checks if value is an instance of CastrSchemaProperties wrapper class.
 *
 * @param value - Value to check
 * @returns True if value is CastrSchemaProperties
 *
 * @example
 * ```typescript
 * const props: unknown = getProperties();
 * if (isCastrSchemaProperties(props)) {
 *   const nameSchema = props.get('name'); // Type-safe: wrapper methods available
 * }
 * ```
 *
 * @public
 */
export function isCastrSchemaProperties(value: unknown): value is CastrSchemaProperties {
  return value instanceof CastrSchemaProperties;
}
