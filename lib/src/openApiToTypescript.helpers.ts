/**
 * Pure helper functions for converting OpenAPI schemas to TypeScript types
 * Extracted from openApiToTypescript.ts to reduce cognitive complexity
 *
 * Each function has a single responsibility and is < 50 lines
 */

import { type ReferenceObject, type SchemaObject } from 'openapi3-ts/oas30';

import type { TsConversionContext } from './openApiToTypescript.js';
import { getSchemaFromComponents } from './component-access.js';
import {
  handleBasicPrimitive as handleBasicPrimitiveString,
  wrapNullable,
  handleStringEnum,
  handleNumericEnum,
  handleMixedEnum,
  handleUnion,
} from './openApiToTypescript.string-helpers.js';

/**
 * Extract schema name from a component schema $ref
 */
const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Invalid schema $ref: ${ref}`);
  }
  return name;
};

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

type PrimitiveSchemaType = (typeof PRIMITIVE_SCHEMA_TYPES)[number];

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
 * Handles OpenAPI $ref objects, returning the referenced schema name
 * MIGRATED: Now returns string (schema name) instead of tanu reference node
 */
export function handleReferenceObject(
  schema: ReferenceObject,
  ctx: TsConversionContext | undefined,
  resolveRecursively: (schema: SchemaObject) => unknown,
): string {
  if (!ctx?.visitedRefs || !ctx?.doc) {
    throw new Error('Context is required for OpenAPI $ref');
  }

  // Check if we're in a circular reference
  const schemaName = getSchemaNameFromRef(schema.$ref);
  if (ctx.visitedRefs[schema.$ref]) {
    return schemaName; // Return name directly, not t.reference
  }

  // Resolve the actual schema if not yet resolved
  const result = ctx.nodeByRef[schema.$ref];
  if (!result) {
    const actualSchema = getSchemaFromComponents(ctx.doc, schemaName);
    if (!actualSchema) {
      throw new Error(`Schema ${schema.$ref} not found`);
    }

    // Nested $refs are VALID per OpenAPI spec, but we require preprocessing.
    // This is an intentional design choice: dereferencing is SwaggerParser's job,
    // code generation is our job. Fail fast with clear error directing users to
    // the correct preprocessing workflow. See: .agent/analysis/NESTED_REFS_ANALYSIS.md
    if ('$ref' in actualSchema) {
      throw new Error(
        `Nested $ref found: ${schema.$ref} -> ${actualSchema.$ref}. Use SwaggerParser.bundle() to dereference before passing the spec to this library.`,
      );
    }

    ctx.visitedRefs[schema.$ref] = true;
    resolveRecursively(actualSchema);
  }

  return schemaName; // Return name directly, not t.reference
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
    return schema.nullable ? 'never | null' : 'never';
  }

  const enumValues = schema.enum;
  const hasNull = enumValues.includes(null);
  const isNullable = schema.nullable || hasNull;

  // Filter out null values for processing
  const withoutNull = enumValues.filter((e) => e !== null);

  // Determine enum type using type guards and call appropriate helper
  let enumType: string;
  if (isStringArray(withoutNull)) {
    enumType = handleStringEnum(withoutNull);
  } else if (isNumberArray(withoutNull)) {
    enumType = handleNumericEnum(withoutNull);
  } else if (isMixedEnumArray(withoutNull)) {
    enumType = handleMixedEnum(withoutNull);
  } else {
    // Fallback: should not happen with valid OpenAPI specs
    throw new Error(`Unexpected enum values: ${JSON.stringify(withoutNull)}`);
  }

  return wrapNullable(enumType, isNullable);
}

/**
 * Handles basic primitive types (string, number, boolean)
 * Returns string-based TypeScript type expression
 */
export function handleBasicPrimitive(schemaType: PrimitiveSchemaType, isNullable: boolean): string {
  return handleBasicPrimitiveString(schemaType, isNullable);
}

/**
 * Determines if a property is required in an object schema
 */
export function isPropertyRequired(
  propName: string,
  schema: SchemaObject,
  isPartial: boolean,
): boolean {
  return Boolean(isPartial ? true : schema.required?.includes(propName));
}

/**
 * Determines the type for additionalProperties
 * Returns string-based TypeScript type expression
 */
export function resolveAdditionalPropertiesType(
  additionalProperties: SchemaObject['additionalProperties'],
  convertSchema: (schema: SchemaObject | ReferenceObject) => string,
): string | undefined {
  if (!additionalProperties) {
    return undefined;
  }

  // Boolean true or empty object means any type
  if (
    (typeof additionalProperties === 'boolean' && additionalProperties) ||
    (typeof additionalProperties === 'object' && Object.keys(additionalProperties).length === 0)
  ) {
    return 'any';
  }

  // Specific schema for additional properties
  if (typeof additionalProperties === 'object') {
    return convertSchema(additionalProperties);
  }

  return undefined;
}

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

/**
 * Creates a new schema with a specific type value
 * We're overwriting the type property, so the result has the specific type we provide
 */
function createSchemaWithType(baseSchema: SchemaObject, type: SchemaObjectType): SchemaObject {
  // Spread operator + explicit type override
  // Result: all properties from baseSchema, but type is the provided value
  return { ...baseSchema, type } as SchemaObject;
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
  // Types array comes from schema.type (validated SchemaObjectType[])
  // Type assertion is safe: openapi3-ts guarantees schema.type elements are SchemaObjectType
  const typeSchemas = types.map((type) => createSchemaWithType(schema, type as SchemaObjectType));

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
