/**
 * Core Type Guards
 *
 * Type-safe predicates for runtime type checking.
 * All guards use the `value is Type` syntax for proper type narrowing.
 *
 * @module type-guards
 * @public
 */

import type { IRSchema } from '../context/ir-schema.js';
import { IRSchemaProperties } from '../context/ir-schema.js';

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
 * Type guard for IRSchema.
 *
 * Checks if value is a valid IRSchema by verifying required metadata field.
 *
 * @param value - Value to check
 * @returns True if value is an IRSchema
 *
 * @example
 * ```typescript
 * const data: unknown = deserialize(json);
 * if (isIRSchema(data)) {
 *   console.log(data.metadata.required); // Type-safe: IRSchema fields available
 * }
 * ```
 *
 * @public
 */
export function isIRSchema(value: unknown): value is IRSchema {
  return isRecord(value) && 'metadata' in value;
}

/**
 * Type guard for IRSchemaProperties.
 *
 * Checks if value is an instance of IRSchemaProperties wrapper class.
 *
 * @param value - Value to check
 * @returns True if value is IRSchemaProperties
 *
 * @example
 * ```typescript
 * const props: unknown = getProperties();
 * if (isIRSchemaProperties(props)) {
 *   const nameSchema = props.get('name'); // Type-safe: wrapper methods available
 * }
 * ```
 *
 * @public
 */
export function isIRSchemaProperties(value: unknown): value is IRSchemaProperties {
  return value instanceof IRSchemaProperties;
}
