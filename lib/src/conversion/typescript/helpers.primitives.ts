/**
 * Primitive schema type helpers and enum handlers
 * Extracted from openApiToTypescript.helpers.ts to reduce file size
 *
 * Handles primitive types (string, number, integer, boolean, null) and their enums
 */

import type { SchemaObject } from 'openapi3-ts/oas31';

import {
  handleBasicPrimitive as handleBasicPrimitiveString,
  wrapNullable,
} from './string-helpers.js';
import { handleMixedEnum, handleNumericEnum, handleStringEnum } from './type-formatters.js';

/**
 * Primitive schema types (subset of SchemaObjectType from openapi3-ts)
 * Domain concept: types that map to simple TypeScript primitives
 *
 * Tied to library type per RULES.md §5: Defer Type Definitions to Source Libraries
 */
type SchemaObjectType = SchemaObject['type'];

/**
 * Literal array tied to library type - compiler enforces correctness
 */
const PRIMITIVE_SCHEMA_TYPES = [
  'string',
  'number',
  'integer',
  'boolean',
  'null',
] as const satisfies SchemaObjectType[];

/**
 * Primitive schema type (string, number, integer, boolean, null)
 */
export type PrimitiveSchemaType = (typeof PRIMITIVE_SCHEMA_TYPES)[number];

/**
 * Type predicate to narrow unknown values to primitive schema types
 * Useful for runtime validation and public API
 *
 * Pattern: literals tied to library types per RULES.md §5
 */
export function isPrimitiveSchemaType(value: unknown): value is PrimitiveSchemaType {
  if (typeof value !== 'string') {
    return false;
  }
  const typeStrings: readonly string[] = PRIMITIVE_SCHEMA_TYPES;
  return typeStrings.includes(value);
}

/**
 * Type guard to check if array contains only strings
 */
function isStringArray(arr: readonly unknown[]): arr is string[] {
  return arr.every((item) => typeof item === 'string');
}

/**
 * Type guard to check if array contains only numbers (including booleans for numeric enum)
 */
function isNumberArray(arr: readonly unknown[]): arr is number[] {
  return arr.every((item) => typeof item === 'number' || typeof item === 'boolean');
}

/**
 * Type guard to check if array contains mixed enum values
 */
function isMixedEnumArray(arr: readonly unknown[]): arr is (string | number | boolean | null)[] {
  return arr.every(
    (item) =>
      typeof item === 'string' ||
      typeof item === 'number' ||
      typeof item === 'boolean' ||
      item === null,
  );
}

/**
 * Checks if a schema allows null values (OpenAPI 3.1 style).
 *
 * In OpenAPI 3.1, nullable is expressed as `type: ['string', 'null']`
 * rather than the OpenAPI 3.0 `nullable: true` property.
 *
 * @param schema - The schema object to check
 * @returns true if the schema's type array includes 'null'
 *
 * @example
 * ```typescript
 * isNullableType({ type: ['string', 'null'] }) // true
 * isNullableType({ type: 'string' }) // false
 * isNullableType({ type: ['number', 'null'] }) // true
 * ```
 *
 * @public
 */
export function isNullableType(schema: SchemaObject): boolean {
  if (Array.isArray(schema.type)) {
    return schema.type.includes('null');
  }
  return schema.type === 'null';
}

/**
 * Determine enum type and generate TypeScript union string
 * @internal
 */
function determineEnumType(withoutNull: unknown[]): string {
  if (isStringArray(withoutNull)) {
    return handleStringEnum(withoutNull);
  }
  if (isNumberArray(withoutNull)) {
    return handleNumericEnum(withoutNull);
  }
  if (isMixedEnumArray(withoutNull)) {
    return handleMixedEnum(withoutNull);
  }
  // Fallback: should not happen with valid OpenAPI specs
  throw new Error(`Unexpected enum values: ${JSON.stringify(withoutNull)}`);
}

/**
 * Handles primitive type enums, returning union types
 * MIGRATED: Now returns strings using string-helpers
 */
export function handlePrimitiveEnum(
  schema: SchemaObject,
  schemaType: PrimitiveSchemaType,
): string | null {
  if (!schema.enum) {
    return null;
  }

  // Invalid: non-string type with string enum values
  if (schemaType !== 'string' && schema.enum.some((e) => typeof e === 'string')) {
    return isNullableType(schema) ? 'never | null' : 'never';
  }

  const enumValues = schema.enum;
  const hasNull = enumValues.includes(null);
  const isNullable = isNullableType(schema) || hasNull;

  // Filter out null values for processing
  const withoutNull = enumValues.filter((e) => e !== null);

  // Determine enum type using type guards and call appropriate helper
  const enumType = determineEnumType(withoutNull);

  return wrapNullable(enumType, isNullable);
}

/**
 * Handles basic primitive types (string, number, boolean)
 * Returns string-based TypeScript type expression
 */
export function handleBasicPrimitive(schemaType: PrimitiveSchemaType, isNullable: boolean): string {
  return handleBasicPrimitiveString(schemaType, isNullable);
}
