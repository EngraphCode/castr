import type { SchemaObject } from 'openapi3-ts/oas31';

/**
 * Primitive schema types (subset of SchemaObjectType from openapi3-ts)
 * Domain concept: types that map to simple primitives
 *
 * Pattern per RULES.md §5: Literals tied to library types
 */
export type PrimitiveSchemaType = Extract<
  NonNullable<SchemaObject['type']>,
  'string' | 'number' | 'integer' | 'boolean' | 'null'
>;

const PRIMITIVE_SCHEMA_TYPES: readonly PrimitiveSchemaType[] = [
  'string',
  'number',
  'integer',
  'boolean',
  'null',
] as const;

/**
 * Type predicate to narrow unknown values to primitive schema types
 * Pattern: literals tied to library types per RULES.md §5
 */
export const isPrimitiveSchemaType = (value: unknown): value is PrimitiveSchemaType => {
  if (typeof value !== 'string') {
    return false;
  }
  const typeStrings: readonly string[] = PRIMITIVE_SCHEMA_TYPES;
  return typeStrings.includes(value);
};
