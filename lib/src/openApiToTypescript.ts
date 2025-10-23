import type { ReferenceObject, SchemaObject } from "openapi3-ts";
import { t, ts } from "tanu";

import { isReferenceObject } from "./isReferenceObject.js";
import type { DocumentResolver } from "./makeSchemaResolver.js";
import type { TemplateContext } from "./template-context.js";
import { wrapWithQuotesIfNeeded } from "./utils.js";
import { inferRequiredSchema } from "./inferRequiredOnly.js";
import generateJSDocArray from "./generateJSDocArray.js";
import {
    addNullToUnionIfNeeded,
    convertObjectProperties,
    convertSchemasToTypes,
    createAdditionalPropertiesSignature,
    handleArraySchema,
    handleBasicPrimitive,
    handlePrimitiveEnum,
    handleReferenceObject,
    isPrimitiveType,
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

            const types = convertSchemasToTypes(
                schema.type.map((type) => ({ ...schema, type })),
                (s) => getTypescriptFromOpenApi({ schema: s, ctx, meta, options }) as t.TypeDefinition
            );

            if (schema.nullable) {
                return t.union([...types, t.reference("null")]);
            }

            return t.union(types);
        }

        if (schema.type === "null") {
            return t.reference("null");
        }

        if (schema.oneOf) {
            if (schema.oneOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.oneOf[0]!, ctx, meta, options });
            }

            const types = convertSchemasToTypes(schema.oneOf, (s) =>
                getTypescriptFromOpenApi({ schema: s, ctx, meta, options }) as t.TypeDefinition
            );

            if (schema.nullable) {
                return t.union([...types, t.reference("null")]);
            }

            return t.union(types);
        }

        // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
        if (schema.anyOf) {
            if (schema.anyOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.anyOf[0]!, ctx, meta, options });
            }

            const types = convertSchemasToTypes(schema.anyOf, (s) =>
                getTypescriptFromOpenApi({ schema: s, ctx, meta, options }) as t.TypeDefinition
            );

            const oneOf = t.union(types);
            const arrayOfOneOf = maybeWrapReadonly(t.array(oneOf), options?.allReadonly ?? false);

            const unionParts = [oneOf, arrayOfOneOf];
            if (schema.nullable) {
                unionParts.push(t.reference("null"));
            }

            return t.union(unionParts);
        }

        if (schema.allOf) {
            if (schema.allOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.allOf[0]!, ctx, meta, options });
            }

            const { patchRequiredSchemaInLoop, noRequiredOnlyAllof, composedRequiredSchema } =
                inferRequiredSchema(schema);

            const types = convertSchemasToTypes(noRequiredOnlyAllof, (prop) => {
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

            const intersection = t.intersection(types);
            return schema.nullable ? t.union([intersection, t.reference("null")]) : intersection;
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
            return handleArraySchema(
                schema,
                options?.allReadonly ?? false,
                (items) => getTypescriptFromOpenApi({ schema: items, ctx, meta, options }),
                ctx
            );
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
            const props = convertObjectProperties(
                schema.properties,
                schema,
                isPartial,
                (propSchema) => getTypescriptFromOpenApi({ schema: propSchema, ctx, meta, options }),
                ctx
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
