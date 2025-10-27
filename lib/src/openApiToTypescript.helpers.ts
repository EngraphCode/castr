/**
 * Pure helper functions for converting OpenAPI schemas to TypeScript types
 * Extracted from openApiToTypescript.ts to reduce cognitive complexity
 *
 * Each function has a single responsibility and is < 50 lines
 */

import { type ReferenceObject, type SchemaObject } from 'openapi3-ts/oas30';
import { t, ts } from 'tanu';

import type { TsConversionContext, TsConversionOutput } from './openApiToTypescript.js';
import { wrapWithQuotesIfNeeded } from './utils.js';
import { getSchemaFromComponents } from './component-access.js';
import {
  handleBasicPrimitive as handleBasicPrimitiveString,
  wrapNullable,
  wrapReadonly,
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
  if (typeof value !== 'string') return false;
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
 * Handles primitive type enums, returning union types
 * MIGRATED: Now returns strings using string-helpers
 */
export function handlePrimitiveEnum(
  schema: SchemaObject,
  schemaType: PrimitiveSchemaType,
): string | null {
  if (!schema.enum) return null;

  // Invalid: non-string type with string enum values
  if (schemaType !== 'string' && schema.enum.some((e) => typeof e === 'string')) {
    return schema.nullable ? 'never | null' : 'never';
  }

  const enumValues = schema.enum;
  const hasNull = enumValues.includes(null);
  const isNullable = schema.nullable || hasNull;

  // Filter out null values for processing
  const withoutNull = enumValues.filter((e) => e !== null);

  // Determine enum type and call appropriate helper
  const allStrings = withoutNull.every((e) => typeof e === 'string');
  const allNumbers = withoutNull.every((e) => typeof e === 'number' || typeof e === 'boolean');

  let enumType: string;
  if (allStrings) {
    enumType = handleStringEnum(withoutNull);
  } else if (allNumbers) {
    enumType = handleNumericEnum(withoutNull as number[]);
  } else {
    enumType = handleMixedEnum(withoutNull as Array<string | number | boolean | null>);
  }

  return wrapNullable(enumType, isNullable);
}

/**
 * Handles basic primitive types (string, number, boolean)
 * Returns string-based TypeScript type expression
 * MIGRATED: Now returns strings instead of tanu nodes
 */
export function handleBasicPrimitive(schemaType: PrimitiveSchemaType, isNullable: boolean): string {
  return handleBasicPrimitiveString(schemaType, isNullable);
}

/**
 * Wraps a type in readonly if the option is enabled
 * MIGRATED: Now works with both strings and nodes during transition
 */
export function maybeWrapReadonly(
  type: ts.Node | t.TypeDefinitionObject | string,
  shouldBeReadonly: boolean,
): ts.Node | t.TypeDefinitionObject | string {
  if (typeof type === 'string') {
    return wrapReadonly(type, shouldBeReadonly);
  }
  return shouldBeReadonly ? t.readonly(type as t.TypeDefinition) : type;
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
 * Creates an additionalProperties index signature for TypeScript
 */
export function createAdditionalPropertiesSignature(
  additionalPropertiesType: t.TypeDefinition | ts.TypeNode,
): ts.TypeLiteralNode {
  return ts.factory.createTypeLiteralNode([
    ts.factory.createIndexSignature(
      undefined,
      [
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          ts.factory.createIdentifier('key'),
          undefined,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ),
      ],
      additionalPropertiesType as ts.TypeNode,
    ),
  ]);
}

/**
 * Determines the type for additionalProperties
 * MIGRATED: Hybrid - returns strings or nodes during transition
 */
export function resolveAdditionalPropertiesType(
  additionalProperties: SchemaObject['additionalProperties'],
  convertSchema: (schema: SchemaObject | ReferenceObject) => unknown,
): ts.Node | t.TypeDefinition | string | undefined {
  if (!additionalProperties) return undefined;

  // Boolean true or empty object means any type
  if (
    (typeof additionalProperties === 'boolean' && additionalProperties) ||
    (typeof additionalProperties === 'object' && Object.keys(additionalProperties).length === 0)
  ) {
    return 'any'; // Return string 'any' instead of t.any()
  }

  // Specific schema for additional properties
  if (typeof additionalProperties === 'object') {
    const result = convertSchema(additionalProperties);
    // Accept both strings and nodes during migration
    return result as ts.Node | t.TypeDefinition | string;
  }

  return undefined;
}

/**
 * Converts an array of schemas to TypeScript types
 * Used by oneOf, anyOf, allOf composition handlers
 */
export function convertSchemasToTypes<T>(
  schemas: ReadonlyArray<SchemaObject | ReferenceObject>,
  convertFn: (schema: SchemaObject | ReferenceObject) => T,
): T[] {
  return schemas.map((schema) => convertFn(schema));
}

/**
 * Adds null to a type if nullable
 * MIGRATED: Now works with both strings and nodes during transition
 */
export function addNullToUnionIfNeeded(
  type: ts.Node | t.TypeDefinitionObject | string,
  isNullable: boolean,
): ts.Node | t.TypeDefinitionObject | string {
  if (typeof type === 'string') {
    return wrapNullable(type, isNullable);
  }
  return isNullable ? t.union([type as t.TypeDefinition, t.reference('null')]) : type;
}

/**
 * Converts a single property schema to a TypeScript type
 * MIGRATED: Now passes strings through directly
 */
export function convertPropertyType(
  propType: unknown,
  _ctx: TsConversionContext | undefined,
): ts.Node | t.TypeDefinition | string {
  if (typeof propType === 'string') {
    // Strings are now type references, just pass through
    return propType;
  }
  return propType as ts.Node | t.TypeDefinition;
}

/**
 * Converts object properties to TypeScript property definitions
 * MIGRATED: Hybrid - converts strings to nodes for tanu processing
 */
export function convertObjectProperties(
  properties: Record<string, SchemaObject | ReferenceObject>,
  schema: SchemaObject,
  isPartial: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => unknown,
  ctx: TsConversionContext | undefined,
): Record<string, t.TypeDefinition> {
  return Object.fromEntries(
    Object.entries(properties).map(([prop, propSchema]) => {
      const rawPropType = convertSchema(propSchema);
      let propType = convertPropertyType(rawPropType, ctx);

      // Convert string to node if needed for tanu processing
      if (typeof propType === 'string') {
        propType = t.reference(propType);
      }

      const isRequired = isPropertyRequired(prop, schema, isPartial);
      const finalType = isRequired ? propType : t.optional(propType as t.TypeDefinition);
      return [wrapWithQuotesIfNeeded(prop), finalType as t.TypeDefinition];
    }),
  );
}

/**
 * Handles array schema conversion with proper readonly wrapping
 * MIGRATED: Now returns strings
 */
export function handleArraySchema(
  schema: SchemaObject,
  shouldWrapReadonly: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => unknown,
  _ctx: TsConversionContext | undefined,
): string {
  const rawType = schema.items ? convertSchema(schema.items) : 'any';
  const itemType = typeof rawType === 'string' ? rawType : String(rawType);

  const arrayType = shouldWrapReadonly ? `readonly ${itemType}[]` : `Array<${itemType}>`;

  return wrapNullable(arrayType, schema.nullable ?? false);
}

/**
 * Builds the final object type by combining properties and additional properties
 */
export function buildObjectType(
  props: Record<string, t.TypeDefinition>,
  additionalPropertiesType: ts.Node | t.TypeDefinition | string | undefined,
  shouldWrapReadonly: boolean,
): ts.Node | t.TypeDefinitionObject | string {
  let additionalProperties;
  if (additionalPropertiesType) {
    // Convert string to node if needed for tanu processing
    const nodeType =
      typeof additionalPropertiesType === 'string'
        ? t.reference(additionalPropertiesType)
        : additionalPropertiesType;
    additionalProperties = createAdditionalPropertiesSignature(nodeType as t.TypeDefinition);
  }

  const objectType = additionalProperties ? t.intersection([props, additionalProperties]) : props;
  const result = maybeWrapReadonly(objectType as t.TypeDefinitionObject, shouldWrapReadonly);
  // If maybeWrapReadonly returns a string, convert back to node for now
  return typeof result === 'string' ? t.reference(result) : result;
}

/**
 * Wraps an object type as Partial if needed, handling both inline and named types
 * MIGRATED: Now accepts strings during transition
 */
export function wrapObjectTypeForOutput(
  finalType: ts.Node | t.TypeDefinitionObject | string,
  isPartial: boolean,
  isInline: boolean,
  name: string | undefined,
): ts.Node | t.TypeDefinitionObject {
  // Convert string to node if needed
  const nodeType = typeof finalType === 'string' ? t.reference(finalType) : finalType;

  const wrappedType = isPartial ? t.reference('Partial', [nodeType as t.TypeDefinition]) : nodeType;

  if (isInline) {
    return wrappedType;
  }

  if (!name) {
    throw new Error('Name is required to convert an object schema to a type reference');
  }

  return t.type(name, wrappedType as t.TypeDefinition);
}

/**
 * Handles oneOf composition by creating a union type
 * MIGRATED: Now returns strings using handleUnion helper
 */
export function handleOneOf(
  schemas: ReadonlyArray<SchemaObject | ReferenceObject>,
  isNullable: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => TsConversionOutput,
): string {
  const results = convertSchemasToTypes(schemas, (schema) => {
    const result = convertSchema(schema);
    // Convert to string if needed
    if (typeof result === 'string') return result;
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
  schemas: ReadonlyArray<SchemaObject | ReferenceObject>,
  isNullable: boolean,
  shouldWrapReadonly: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => TsConversionOutput,
): string {
  const results = convertSchemasToTypes(schemas, (schema) => {
    const result = convertSchema(schema);
    if (typeof result === 'string') return result;
    throw new Error('handleAnyOf: Expected string from convertSchema during migration');
  });

  const oneOfType = handleUnion(results);
  const arrayOfOneOf = shouldWrapReadonly ? `readonly (${oneOfType})[]` : `Array<${oneOfType}>`;

  const unionParts: string[] = [oneOfType, arrayOfOneOf];
  const unionType = handleUnion(unionParts);
  return wrapNullable(unionType, isNullable);
}

/**
 * Handles array of types (OpenAPI 3.1 feature) by creating a union
 * MIGRATED: Now returns strings using handleUnion
 */
export function handleTypeArray(
  types: ReadonlyArray<string>,
  schema: SchemaObject,
  isNullable: boolean,
  convertSchema: (schema: SchemaObject | ReferenceObject) => TsConversionOutput,
): string {
  const typeSchemas = types.map((type) => ({ ...schema, type }) as SchemaObject);
  const results = convertSchemasToTypes(typeSchemas, (schema) => {
    const result = convertSchema(schema);
    if (typeof result === 'string') return result;
    throw new Error('handleTypeArray: Expected string from convertSchema during migration');
  });

  const unionType = handleUnion(results);
  return wrapNullable(unionType, isNullable);
}
