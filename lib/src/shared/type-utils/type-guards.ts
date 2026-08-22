/**
 * Core Type Guards
 *
 * Type-safe predicates for runtime type checking.
 * All guards use the `value is Type` syntax for proper type narrowing.
 *
 * @public
 */

import type { CastrSchemaPropertiesLike } from './castr-schema-properties.js';
import { hasCastrSchemaPropertiesBrand } from './castr-schema-properties.js';
import type { UnknownRecord } from './types.js';

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
 * Checks if value is a plain object (not null, not an array). An empty object
 * (`{}`) is a record. This is the single canonical `isRecord` — do not add
 * per-file copies.
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
export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
export function isCastrSchemaProperties(value: unknown): value is CastrSchemaPropertiesLike {
  return hasCastrSchemaPropertiesBrand(value);
}
