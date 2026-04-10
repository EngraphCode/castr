import type { SchemaObject } from '../../openapi-types.js';

/**
 * Primitive schema types (subset of SchemaObjectType from the shared OpenAPI seam)
 * Domain concept: types that map to simple primitives
 *
 * Pattern per principles.md §5: Literals tied to library types
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
 * Pattern: literals tied to library types per principles.md §5
 */
export const isPrimitiveSchemaType = (value: unknown): value is PrimitiveSchemaType => {
  if (typeof value !== 'string') {
    return false;
  }
  for (const schemaType of PRIMITIVE_SCHEMA_TYPES) {
    if (value === schemaType) {
      return true;
    }
  }
  return false;
};
