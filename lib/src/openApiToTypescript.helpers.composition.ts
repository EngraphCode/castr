/**
 * Schema composition helpers for OpenAPI oneOf, anyOf, and array schemas
 * Extracted from openApiToTypescript.helpers.ts to reduce file size
 *
 * Handles OpenAPI composition features (oneOf, anyOf) and array schema conversion
 */

import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';

import { wrapNullable, handleUnion } from './openApiToTypescript.string-helpers.js';

/**
 * Converts an array of schemas to TypeScript types
 * Used by oneOf, anyOf, allOf composition handlers
 */
export function convertSchemasToTypes<T>(
  schemas: readonly (SchemaObject | ReferenceObject)[],
  convertFn: (schema: SchemaObject | ReferenceObject) => T,
): T[] {
  return schemas.map((schema) => convertFn(schema));
}

/**
 * Handles array schema conversion with proper readonly wrapping
 */
export function handleArraySchema(
  schema: SchemaObject,
  shouldWrapReadonly: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => unknown,
): string {
  const rawType = schema.items ? convertSchema(schema.items) : 'any';
  const itemType = typeof rawType === 'string' ? rawType : String(rawType);

  const arrayType = shouldWrapReadonly ? `readonly ${itemType}[]` : `Array<${itemType}>`;

  return wrapNullable(arrayType, schema.nullable ?? false);
}

/**
 * Handles oneOf composition by creating a union type
 */
export function handleOneOf(
  schemas: readonly (SchemaObject | ReferenceObject)[],
  isNullable: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => string,
): string {
  const results = convertSchemasToTypes(schemas, (schema) => {
    const result = convertSchema(schema);
    // Convert to string if needed
    if (typeof result === 'string') {
      return result;
    }
    // For now, can't convert nodes to strings - this path should not be hit
    // once all helpers return strings
    throw new Error('handleOneOf: Expected string from convertSchema during migration');
  });

  const unionType = handleUnion(results);
  return wrapNullable(unionType, isNullable);
}

/**
 * Handles anyOf composition by creating union of value OR array
 * Special OpenAPI semantic: T | T[]
 * MIGRATED: Now returns strings
 */
export function handleAnyOf(
  schemas: readonly (SchemaObject | ReferenceObject)[],
  isNullable: boolean,
  shouldWrapReadonly: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => string,
): string {
  const results = convertSchemasToTypes(schemas, (schema) => {
    const result = convertSchema(schema);
    if (typeof result === 'string') {
      return result;
    }
    throw new Error('handleAnyOf: Expected string from convertSchema during migration');
  });

  const oneOfType = handleUnion(results);
  const arrayOfOneOf = shouldWrapReadonly ? `readonly (${oneOfType})[]` : `Array<${oneOfType}>`;

  const unionParts: string[] = [oneOfType, arrayOfOneOf];
  const unionType = handleUnion(unionParts);
  return wrapNullable(unionType, isNullable);
}
