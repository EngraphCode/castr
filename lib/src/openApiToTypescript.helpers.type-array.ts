/**
 * Type array helpers for OpenAPI 3.1 type arrays
 * Extracted from openApiToTypescript.helpers.ts to reduce file size
 *
 * Handles validation and creation of schemas with type arrays (OpenAPI 3.1 feature)
 */

import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';

import { convertSchemasToTypes } from './openApiToTypescript.helpers.composition.js';
import { wrapNullable, handleUnion } from './openApiToTypescript.string-helpers.js';

/**
 * Single schema type (not array, not undefined)
 * Used for type guards that verify a string is a valid single schema type
 * @internal
 */
type SchemaObjectType = SchemaObject['type'];
export type SingleSchemaObjectType = Exclude<NonNullable<SchemaObjectType>, readonly unknown[]>;

/**
 * Check if object has at least one schema-defining property
 * @internal
 */
function hasSchemaProperties(obj: object): boolean {
  return (
    'type' in obj ||
    'properties' in obj ||
    'allOf' in obj ||
    'oneOf' in obj ||
    'anyOf' in obj ||
    'enum' in obj
  );
}

/**
 * Type guard to verify object is a valid SchemaObject
 * @internal
 */
function isValidSchemaObject(obj: unknown): obj is SchemaObject {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  // SchemaObject cannot have $ref (that's ReferenceObject)
  if ('$ref' in obj) {
    return false;
  }
  // Must have at least one schema property
  return hasSchemaProperties(obj);
}

/**
 * Type guard to verify value is valid single SchemaObjectType (not array)
 * @internal
 */
function isValidSchemaObjectType(value: string): value is SingleSchemaObjectType {
  const validTypes: readonly SingleSchemaObjectType[] = [
    'string',
    'number',
    'integer',
    'boolean',
    'null',
    'object',
    'array',
  ];
  // TypeScript ensures validTypes contains only valid SingleSchemaObjectType values
  // Cast array to string[] for includes check, then TypeScript narrows correctly
  const validTypeStrings: readonly string[] = validTypes;
  return validTypeStrings.includes(value);
}

/**
 * Creates a new schema with a specific type value
 * We're overwriting the type property, so the result has the specific type we provide
 * @internal
 */
function createSchemaWithType(
  baseSchema: SchemaObject,
  type: SingleSchemaObjectType,
): SchemaObject {
  const result = { ...baseSchema, type };
  if (!isValidSchemaObject(result)) {
    throw new Error(`Invalid schema created with type ${type}`);
  }
  return result;
}

/**
 * Handles array of types (OpenAPI 3.1 feature) by creating a union
 * MIGRATED: Now returns strings using handleUnion
 */
export function handleTypeArray(
  types: readonly string[],
  schema: SchemaObject,
  isNullable: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => string,
): string {
  // Validate types array contains valid SchemaObjectType values
  const validatedTypes = types.filter(isValidSchemaObjectType);
  if (validatedTypes.length !== types.length) {
    throw new Error('Invalid schema types in type array');
  }

  const typeSchemas = validatedTypes.map((type) => createSchemaWithType(schema, type));

  const results = convertSchemasToTypes(typeSchemas, (schema) => {
    const result = convertSchema(schema);
    if (typeof result === 'string') {
      return result;
    }
    throw new Error('handleTypeArray: Expected string from convertSchema during migration');
  });

  const unionType = handleUnion(results);
  return wrapNullable(unionType, isNullable);
}
