/**
 * Pure helper functions for converting OpenAPI schemas to TypeScript types
 * Extracted from openApiToTypescript.ts to reduce cognitive complexity
 * 
 * Each function has a single responsibility and is < 50 lines
 */

import type { ReferenceObject, SchemaObject } from "openapi3-ts";
import { t, ts } from "tanu";

import { isReferenceObject } from "./isReferenceObject.js";
import type { TsConversionContext } from "./openApiToTypescript.js";
import { wrapWithQuotesIfNeeded } from "./utils.js";

type PrimitiveType = "string" | "number" | "integer" | "boolean" | "null";

const primitiveTypeList: readonly PrimitiveType[] = ["string", "number", "integer", "boolean", "null"];

type SingleType = Exclude<SchemaObject["type"], unknown[] | undefined>;

export function isPrimitiveType(type: SingleType): type is PrimitiveType {
    return primitiveTypeList.includes(type as PrimitiveType);
}

/**
 * Handles reference objects ($ref) by resolving them to schema names
 * Returns a type reference to the resolved schema name
 */
export function handleReferenceObject(
    schema: ReferenceObject,
    ctx: TsConversionContext | undefined,
    resolveRecursively: (schema: SchemaObject) => unknown
): t.TypeDefinitionObject | string {
    if (!ctx?.visitedsRefs || !ctx?.resolver) {
        throw new Error("Context is required for OpenAPI $ref");
    }

    // Check if we're in a circular reference
    const schemaName = ctx.resolver.resolveRef(schema.$ref)?.normalized;
    if (ctx.visitedsRefs[schema.$ref]) {
        return t.reference(schemaName);
    }

    // Resolve the actual schema if not yet resolved
    let result = ctx.nodeByRef[schema.$ref];
    if (!result) {
        const actualSchema = ctx.resolver.getSchemaByRef(schema.$ref);
        if (!actualSchema) {
            throw new Error(`Schema ${schema.$ref} not found`);
        }

        ctx.visitedsRefs[schema.$ref] = true;
        resolveRecursively(actualSchema);
    }

    return t.reference(schemaName);
}

/**
 * Handles primitive type enums, returning union types
 * Rejects invalid enums (non-string type with string values)
 */
export function handlePrimitiveEnum(
    schema: SchemaObject,
    schemaType: PrimitiveType
): t.TypeDefinitionObject | null {
    if (!schema.enum) return null;

    // Invalid: non-string type with string enum values
    if (schemaType !== "string" && schema.enum.some((e) => typeof e === "string")) {
        return schema.nullable ? t.union([t.never(), t.reference("null")]) : t.never();
    }

    // Separate null values from other values
    const hasNull = schema.enum.includes(null);
    const withoutNull = schema.enum.filter((f) => f !== null);

    return schema.nullable || hasNull ? t.union([...withoutNull, t.reference("null")]) : t.union(withoutNull);
}

/**
 * Handles basic primitive types (string, number, boolean)
 * Returns the appropriate TypeScript type, with null union if nullable
 */
export function handleBasicPrimitive(
    schemaType: PrimitiveType,
    isNullable: boolean
): t.TypeDefinitionObject {
    let baseType: t.TypeDefinitionObject;

    if (schemaType === "string") baseType = t.string();
    else if (schemaType === "boolean") baseType = t.boolean();
    else baseType = t.number(); // number or integer

    return isNullable ? t.union([baseType, t.reference("null")]) : baseType;
}

/**
 * Wraps a type in readonly if the option is enabled
 */
export function maybeWrapReadonly(
    type: t.TypeDefinitionObject,
    shouldBeReadonly: boolean
): t.TypeDefinitionObject {
    return shouldBeReadonly ? t.readonly(type) : type;
}

/**
 * Determines if a property is required in an object schema
 */
export function isPropertyRequired(
    propName: string,
    schema: SchemaObject,
    isPartial: boolean
): boolean {
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
    convertSchema: (schema: SchemaObject) => unknown
): t.TypeDefinition | undefined {
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
        return convertSchema(additionalProperties) as t.TypeDefinition;
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

