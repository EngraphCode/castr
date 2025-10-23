import type { ReferenceObject, SchemaObject } from "openapi3-ts";
import { t, ts } from "tanu";

import { isReferenceObject } from "./isReferenceObject.js";
import type { DocumentResolver } from "./makeSchemaResolver.js";
import type { TemplateContext } from "./template-context.js";
import { wrapWithQuotesIfNeeded } from "./utils.js";
import { inferRequiredSchema } from "./inferRequiredOnly.js";
import generateJSDocArray from "./generateJSDocArray.js";
import {
    createAdditionalPropertiesSignature,
    handleBasicPrimitive,
    handlePrimitiveEnum,
    handleReferenceObject,
    isPrimitiveType,
    isPropertyRequired,
    maybeWrapReadonly,
    resolveAdditionalPropertiesType,
    wrapTypeIfNeeded,
} from "./openApiToTypescript.helpers.js";

type TsConversionArgs = {
    schema: SchemaObject | ReferenceObject;
    ctx?: TsConversionContext | undefined;
    meta?: { name?: string; $ref?: string; isInline?: boolean } | undefined;
    options?: TemplateContext["options"];
};

export type TsConversionContext = {
    nodeByRef: Record<string, ts.Node>;
    resolver: DocumentResolver;
    rootRef?: string;
    visitedsRefs?: Record<string, boolean>;
};

export const getTypescriptFromOpenApi = ({
    schema,
    meta: inheritedMeta,
    ctx,
    options,
}:
TsConversionArgs): ts.Node | t.TypeDefinitionObject | string => {
    const meta = {} as TsConversionArgs["meta"];
    const isInline = !inheritedMeta?.name;

    if (ctx?.visitedsRefs && inheritedMeta?.$ref) {
        ctx.rootRef = inheritedMeta.$ref;
        ctx.visitedsRefs[inheritedMeta.$ref] = true;
    }

    if (!schema) {
        throw new Error("Schema is required");
    }

    let canBeWrapped = !isInline;
    const getTs = (): ts.Node | t.TypeDefinitionObject | string => {
        if (isReferenceObject(schema)) {
            return handleReferenceObject(schema, ctx, (actualSchema) =>
                getTypescriptFromOpenApi({ schema: actualSchema, meta, ctx, options })
            );
        }

        if (Array.isArray(schema.type)) {
            if (schema.type.length === 1) {
                return getTypescriptFromOpenApi({
                    schema: { ...schema, type: schema.type[0]! },
                    ctx,
                    meta,
                    options,
                });
            }

            const types = schema.type.map(
                (prop) =>
                    getTypescriptFromOpenApi({
                        schema: { ...schema, type: prop },
                        ctx,
                        meta,
                        options,
                    }) as t.TypeDefinition
            );

            return schema.nullable ? t.union([...types, t.reference("null")]) : t.union(types);
        }

        if (schema.type === "null") {
            return t.reference("null");
        }

        if (schema.oneOf) {
            if (schema.oneOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.oneOf[0]!, ctx, meta, options });
            }

            const types = schema.oneOf.map(
                (prop) => getTypescriptFromOpenApi({ schema: prop, ctx, meta, options }) as t.TypeDefinition
            );

            return schema.nullable ? t.union([...types, t.reference("null")]) : t.union(types);
        }

        // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
        if (schema.anyOf) {
            if (schema.anyOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.anyOf[0]!, ctx, meta, options });
            }

            const oneOf = t.union(
                schema.anyOf.map(
                    (prop) => getTypescriptFromOpenApi({ schema: prop, ctx, meta, options }) as t.TypeDefinition
                )
            );

            const arrayOfOneOf = maybeWrapReadonly(t.array(oneOf), options?.allReadonly ?? false);

            return schema.nullable
                ? t.union([oneOf, arrayOfOneOf, t.reference("null")])
                : t.union([oneOf, arrayOfOneOf]);
        }

        if (schema.allOf) {
            if (schema.allOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.allOf[0]!, ctx, meta, options });
            }

            const { patchRequiredSchemaInLoop, noRequiredOnlyAllof, composedRequiredSchema } =
                inferRequiredSchema(schema);

            const types = noRequiredOnlyAllof.map((prop) => {
                const type = getTypescriptFromOpenApi({ schema: prop, ctx, meta, options }) as t.TypeDefinition;
                ctx?.resolver && patchRequiredSchemaInLoop(prop, ctx.resolver);
                return type;
            });

            if (Object.keys(composedRequiredSchema.properties).length > 0) {
                types.push(
                    getTypescriptFromOpenApi({
                        schema: composedRequiredSchema,
                        ctx,
                        meta,
                        options,
                    }) as t.TypeDefinition
                );
            }

            return schema.nullable ? t.union([t.intersection(types), t.reference("null")]) : t.intersection(types);
        }

        const schemaType = schema.type ? (schema.type.toLowerCase() as NonNullable<typeof schema.type>) : undefined;
        if (schemaType && isPrimitiveType(schemaType)) {
            // Try to handle as enum first
            const enumResult = handlePrimitiveEnum(schema, schemaType);
            if (enumResult) return enumResult;

            // Handle basic primitive types
            return handleBasicPrimitive(schemaType, schema.nullable ?? false);
        }

        if (schemaType === "array") {
            let arrayOfType: t.TypeDefinition;

            if (schema.items) {
                arrayOfType = getTypescriptFromOpenApi({
                    schema: schema.items,
                    ctx,
                    meta,
                    options,
                }) as t.TypeDefinition;

                if (typeof arrayOfType === "string") {
                    if (!ctx) throw new Error("Context is required for circular $ref (recursive schemas)");
                    arrayOfType = t.reference(arrayOfType);
                }
            } else {
                arrayOfType = t.any();
            }

            const wrappedArray = maybeWrapReadonly(t.array(arrayOfType), options?.allReadonly ?? false);
            return schema.nullable ? t.union([wrappedArray, t.reference("null")]) : wrappedArray;
        }

        if (schemaType === "object" || schema.properties || schema.additionalProperties) {
            if (!schema.properties) {
                return {};
            }

            canBeWrapped = false;

            const isPartial = !schema.required?.length;
            const shouldWrapReadonly = options?.allReadonly ?? false;

            // Handle additionalProperties
            let additionalProperties;
            const additionalPropertiesType = resolveAdditionalPropertiesType(
                schema.additionalProperties,
                (additionalSchema) => getTypescriptFromOpenApi({ schema: additionalSchema, ctx, meta, options })
            );

            if (additionalPropertiesType) {
                additionalProperties = createAdditionalPropertiesSignature(additionalPropertiesType);
            }

            // Convert properties
            const props = Object.fromEntries(
                Object.entries(schema.properties).map(([prop, propSchema]) => {
                    let propType = getTypescriptFromOpenApi({
                        schema: propSchema,
                        ctx,
                        meta,
                        options,
                    }) as t.TypeDefinition;

                    if (typeof propType === "string") {
                        if (!ctx) throw new Error("Context is required for circular $ref (recursive schemas)");
                        propType = t.reference(propType);
                    }

                    const isRequired = isPropertyRequired(prop, schema, isPartial);
                    return [wrapWithQuotesIfNeeded(prop), isRequired ? propType : t.optional(propType)];
                })
            );

            // Combine props with additionalProperties if present
            const objectType = additionalProperties ? t.intersection([props, additionalProperties]) : props;

            // Wrap with readonly if needed
            const finalType = maybeWrapReadonly(objectType, shouldWrapReadonly);

            // Handle inline vs named types
            if (isInline) {
                return isPartial ? t.reference("Partial", [finalType]) : finalType;
            }

            if (!inheritedMeta?.name) {
                throw new Error("Name is required to convert an object schema to a type reference");
            }

            return isPartial
                ? t.type(inheritedMeta.name, t.reference("Partial", [finalType]))
                : t.type(inheritedMeta.name, finalType);
        }

        if (!schemaType) return t.unknown();
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unsupported schema type: ${schemaType}`);
    };

    let tsResult = getTs();

    // Add JSDoc comments
    if (options?.withDocs && !isReferenceObject(schema)) {
        const jsDocComments = generateJSDocArray(schema);

        if (
            jsDocComments.length > 0 &&
            typeof tsResult === "object" &&
            tsResult.kind !== ts.SyntaxKind.TypeAliasDeclaration
        ) {
            tsResult = t.comment(tsResult, jsDocComments);
        }
    }

    return canBeWrapped ? wrapTypeIfNeeded(isInline, inheritedMeta?.name, tsResult as t.TypeDefinition) : tsResult;
};
