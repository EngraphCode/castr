/**
 * Pure helper functions for converting OpenAPI schemas to TypeScript types
 * Extracted from openApiToTypescript.ts to reduce cognitive complexity
 *
 * Each function has a single responsibility and is < 50 lines
 */

import { type ReferenceObject, type SchemaObject } from "openapi3-ts";
import { t, ts } from "tanu";

import type { TsConversionContext } from "./openApiToTypescript.js";
import { wrapWithQuotesIfNeeded } from "./utils.js";

/**
 * Primitive schema types (subset of SchemaObjectType from openapi3-ts)
 * Domain concept: types that map to simple TypeScript primitives
 *
 * Tied to library type per RULES.md §5: Defer Type Definitions to Source Libraries
 */
type SchemaObjectType = SchemaObject["type"];

/**
 * Literal array tied to library type - compiler enforces correctness
 */
const PRIMITIVE_SCHEMA_TYPES = ["string", "number", "integer", "boolean", "null"] as const satisfies SchemaObjectType[];

type PrimitiveSchemaType = (typeof PRIMITIVE_SCHEMA_TYPES)[number];

/**
 * Type predicate to narrow unknown values to primitive schema types
 * Useful for runtime validation and public API
 *
 * Pattern: literals tied to library types per RULES.md §5
 */
export function isPrimitiveSchemaType(value: unknown): value is PrimitiveSchemaType {
    if (typeof value !== "string") return false;
    const typeStrings: readonly string[] = PRIMITIVE_SCHEMA_TYPES;
    return typeStrings.includes(value);
}

/**
 * Handles reference objects ($ref) by resolving them to schema names
 * Returns a type reference to the resolved schema name
 */
export function handleReferenceObject(
    schema: ReferenceObject,
    ctx: TsConversionContext | undefined,
    resolveRecursively: (schema: SchemaObject) => unknown
): ts.Node | string {
    if (!ctx?.visitedRefs || !ctx?.resolver) {
        throw new Error("Context is required for OpenAPI $ref");
    }

    // Check if we're in a circular reference
    const schemaName = ctx.resolver.resolveRef(schema.$ref)?.normalized;
    if (ctx.visitedRefs[schema.$ref]) {
        return t.reference(schemaName);
    }

    // Resolve the actual schema if not yet resolved
    const result = ctx.nodeByRef[schema.$ref];
    if (!result) {
        const actualSchema = ctx.resolver.getSchemaByRef(schema.$ref);
        if (!actualSchema) {
            throw new Error(`Schema ${schema.$ref} not found`);
        }

        ctx.visitedRefs[schema.$ref] = true;
        resolveRecursively(actualSchema);
    }

    return t.reference(schemaName);
}

/**
 * Handles primitive type enums, returning union types
 * Rejects invalid enums (non-string type with string values)
 */
export function handlePrimitiveEnum(schema: SchemaObject, schemaType: PrimitiveSchemaType): ts.Node | null {
    if (!schema.enum) return null;

    // Invalid: non-string type with string enum values
    if (schemaType !== "string" && schema.enum.some((e) => typeof e === "string")) {
        return schema.nullable ? t.union([t.never(), t.reference("null")]) : t.never();
    }

    // Separate null values from other values
    const enumValues = schema?.enum;
    const hasNull = enumValues?.includes(null);
    const withoutNull = enumValues?.filter((f) => f !== null);

    if (schema.nullable || hasNull) {
        return t.union([...withoutNull, t.reference("null")]);
    }
    return t.union(withoutNull);
}

/**
 * Handles basic primitive types (string, number, boolean)
 * Returns the appropriate TypeScript type, with null union if nullable
 */
export function handleBasicPrimitive(schemaType: PrimitiveSchemaType, isNullable: boolean): ts.Node {
    let baseType: t.TypeDefinition;

    if (schemaType === "string") baseType = t.string();
    else if (schemaType === "boolean") baseType = t.boolean();
    else baseType = t.number(); // number or integer

    return isNullable ? t.union([baseType, t.reference("null")]) : baseType;
}

/**
 * Wraps a type in readonly if the option is enabled
 */
export function maybeWrapReadonly(
    type: ts.Node | t.TypeDefinitionObject,
    shouldBeReadonly: boolean
): ts.Node | t.TypeDefinitionObject {
    return shouldBeReadonly ? t.readonly(type as t.TypeDefinition) : type;
}

/**
 * Determines if a property is required in an object schema
 */
export function isPropertyRequired(propName: string, schema: SchemaObject, isPartial: boolean): boolean {
    return Boolean(isPartial ? true : schema.required?.includes(propName));
}

/**
 * Creates an additionalProperties index signature for TypeScript
 */
export function createAdditionalPropertiesSignature(
    additionalPropertiesType: t.TypeDefinition | ts.TypeNode
): ts.TypeLiteralNode {
    return ts.factory.createTypeLiteralNode([
        ts.factory.createIndexSignature(
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier("key"),
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                ),
            ],
            additionalPropertiesType as ts.TypeNode
        ),
    ]);
}

/**
 * Determines the type for additionalProperties
 * Returns undefined if no additional properties are allowed
 */
export function resolveAdditionalPropertiesType(
    additionalProperties: SchemaObject["additionalProperties"],
    convertSchema: (schema: SchemaObject | ReferenceObject) => unknown
): ts.Node | t.TypeDefinition | undefined {
    if (!additionalProperties) return undefined;

    // Boolean true or empty object means any type
    if (
        (typeof additionalProperties === "boolean" && additionalProperties) ||
        (typeof additionalProperties === "object" && Object.keys(additionalProperties).length === 0)
    ) {
        return t.any();
    }

    // Specific schema for additional properties
    if (typeof additionalProperties === "object") {
        return convertSchema(additionalProperties) as ts.Node | t.TypeDefinition;
    }

    return undefined;
}

/**
 * Wraps a type definition as a type alias or returns inline
 */
export function wrapTypeIfNeeded(
    isInline: boolean,
    name: string | undefined,
    typeDef: t.TypeDefinition
): t.TypeDefinitionObject | ts.Node {
    if (!isInline) {
        if (!name) {
            throw new Error("Name is required to convert a schema to a type reference");
        }
        return t.type(name, typeDef);
    }

    return typeDef as ts.Node;
}

/**
 * Converts an array of schemas to TypeScript types
 * Used by oneOf, anyOf, allOf composition handlers
 */
export function convertSchemasToTypes<T>(
    schemas: ReadonlyArray<SchemaObject | ReferenceObject>,
    convertFn: (schema: SchemaObject | ReferenceObject) => T
): T[] {
    return schemas.map((schema) => convertFn(schema));
}

/**
 * Adds null to a union type if nullable flag is true
 */
export function addNullToUnionIfNeeded(
    type: ts.Node | t.TypeDefinitionObject,
    isNullable: boolean
): ts.Node | t.TypeDefinitionObject {
    return isNullable ? t.union([type as t.TypeDefinition, t.reference("null")]) : type;
}

/**
 * Converts a single property schema to a TypeScript type
 * Handles circular references by converting string types to references
 */
export function convertPropertyType(
    propType: unknown,
    ctx: { resolver?: unknown } | undefined
): ts.Node | t.TypeDefinition {
    if (typeof propType === "string") {
        if (!ctx) {
            throw new Error("Context is required for circular $ref (recursive schemas)");
        }
        return t.reference(propType);
    }
    return propType as ts.Node | t.TypeDefinition;
}

/**
 * Converts object properties to TypeScript property definitions
 * Returns an object mapping property names to their types
 */
export function convertObjectProperties(
    properties: Record<string, SchemaObject | ReferenceObject>,
    schema: SchemaObject,
    isPartial: boolean,
    convertSchema: (schema: SchemaObject | ReferenceObject) => unknown,
    ctx: { resolver?: unknown } | undefined
): Record<string, t.TypeDefinition> {
    return Object.fromEntries(
        Object.entries(properties).map(([prop, propSchema]) => {
            const rawPropType = convertSchema(propSchema);
            const propType = convertPropertyType(rawPropType, ctx);
            const isRequired = isPropertyRequired(prop, schema, isPartial);
            // Cast to t.TypeDefinition since t.optional requires it
            const finalType = isRequired ? propType : t.optional(propType as t.TypeDefinition);
            return [wrapWithQuotesIfNeeded(prop), finalType as t.TypeDefinition];
        })
    );
}

/**
 * Handles array schema conversion with proper readonly wrapping
 */
export function handleArraySchema(
    schema: SchemaObject,
    shouldWrapReadonly: boolean,
    convertSchema: (schema: SchemaObject | ReferenceObject) => unknown,
    ctx: { resolver?: unknown } | undefined
): ts.Node | t.TypeDefinitionObject {
    let arrayOfType: ts.Node | t.TypeDefinition;

    if (schema.items) {
        const rawType = convertSchema(schema.items);
        arrayOfType = convertPropertyType(rawType, ctx);
    } else {
        arrayOfType = t.any();
    }

    const wrappedArray = maybeWrapReadonly(t.array(arrayOfType as t.TypeDefinition), shouldWrapReadonly);
    return schema.nullable ? t.union([wrappedArray as t.TypeDefinition, t.reference("null")]) : wrappedArray;
}

/**
 * Builds the final object type by combining properties and additional properties
 */
export function buildObjectType(
    props: Record<string, t.TypeDefinition>,
    additionalPropertiesType: ts.Node | t.TypeDefinition | undefined,
    shouldWrapReadonly: boolean
): ts.Node | t.TypeDefinitionObject {
    let additionalProperties;
    if (additionalPropertiesType) {
        additionalProperties = createAdditionalPropertiesSignature(additionalPropertiesType as t.TypeDefinition);
    }

    const objectType = additionalProperties ? t.intersection([props, additionalProperties]) : props;
    return maybeWrapReadonly(objectType as t.TypeDefinitionObject, shouldWrapReadonly);
}

/**
 * Wraps an object type as Partial if needed, handling both inline and named types
 */
export function wrapObjectTypeForOutput(
    finalType: ts.Node | t.TypeDefinitionObject,
    isPartial: boolean,
    isInline: boolean,
    name: string | undefined
): ts.Node | t.TypeDefinitionObject {
    const wrappedType = isPartial ? t.reference("Partial", [finalType as t.TypeDefinition]) : finalType;

    if (isInline) {
        return wrappedType;
    }

    if (!name) {
        throw new Error("Name is required to convert an object schema to a type reference");
    }

    return t.type(name, wrappedType as t.TypeDefinition);
}

/**
 * Handles oneOf composition by creating a union type
 * Returns single schema directly if only one item
 */
export function handleOneOf(
    schemas: ReadonlyArray<SchemaObject | ReferenceObject>,
    isNullable: boolean,
    convertSchema: (schema: SchemaObject | ReferenceObject) => ts.Node | t.TypeDefinition
): ts.Node {
    if (schemas.length === 1) {
        return convertSchema(schemas[0]!) as ts.Node;
    }

    const types: (ts.Node | t.TypeDefinition)[] = convertSchemasToTypes(schemas, convertSchema);
    if (isNullable) {
        return t.union([...types, t.reference("null")] as t.TypeDefinition[]);
    }
    return t.union(types as t.TypeDefinition[]);
}

/**
 * Handles anyOf composition by creating union of value OR array
 * Special OpenAPI semantic: T | T[]
 */
export function handleAnyOf(
    schemas: ReadonlyArray<SchemaObject | ReferenceObject>,
    isNullable: boolean,
    shouldWrapReadonly: boolean,
    convertSchema: (schema: SchemaObject | ReferenceObject) => ts.Node | t.TypeDefinition
): ts.Node {
    if (schemas.length === 1) {
        return convertSchema(schemas[0]!) as ts.Node;
    }

    const types: (ts.Node | t.TypeDefinition)[] = convertSchemasToTypes(schemas, convertSchema);
    const oneOf = t.union(types as t.TypeDefinition[]);
    const arrayOfOneOf = maybeWrapReadonly(t.array(oneOf), shouldWrapReadonly);

    const unionParts: t.TypeDefinition[] = [oneOf, arrayOfOneOf as t.TypeDefinition];
    if (isNullable) {
        unionParts.push(t.reference("null"));
    }

    return t.union(unionParts);
}

/**
 * Handles array of types (OpenAPI 3.1 feature) by creating a union
 */
export function handleTypeArray(
    types: ReadonlyArray<string>,
    schema: SchemaObject,
    isNullable: boolean,
    convertSchema: (schema: SchemaObject | ReferenceObject) => ts.Node | t.TypeDefinition
): ts.Node {
    if (types.length === 1) {
        return convertSchema({ ...schema, type: types[0]! } as SchemaObject) as ts.Node;
    }

    const typeSchemas = types.map((type) => ({ ...schema, type }) as SchemaObject);
    const typeDefs: (ts.Node | t.TypeDefinition)[] = convertSchemasToTypes(typeSchemas, convertSchema);

    if (isNullable) {
        return t.union([...typeDefs, t.reference("null")] as t.TypeDefinition[]);
    }
    return t.union(typeDefs as t.TypeDefinition[]);
}
