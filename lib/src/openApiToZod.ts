import { isSchemaObject, isReferenceObject, type ReferenceObject, type SchemaObject } from "openapi3-ts";

import { match } from "ts-pattern";

import type { CodeMetaData, ConversionTypeContext } from "./CodeMeta.js";
import { CodeMeta } from "./CodeMeta.js";
import { generateNonStringEnumZodCode, generateStringEnumZodCode, shouldEnumBeNever } from "./enumHelpers.js";
import type { TemplateContext } from "./template-context.js";
import { escapeControlCharacters, isPrimitiveSchemaType, wrapWithQuotesIfNeeded } from "./utils.js";
import { inferRequiredSchema } from "./inferRequiredOnly.js";

type ConversionArgs = {
    schema: SchemaObject | ReferenceObject;
    ctx?: ConversionTypeContext | undefined;
    meta?: CodeMetaData | undefined;
    options?: TemplateContext["options"] | undefined;
};

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schemaObject
 * @see https://github.com/colinhacks/zod
 */
// At this point have we narrowed schema to be a valid schema object and non-null, or could it be null, or could it be a reference object?
export function getZodSchema({ schema: $schema, ctx, meta: inheritedMeta, options }: ConversionArgs): CodeMeta {
    // Can't a schema object legitimately be null in the OpenAPI spec
    if (!$schema) {
        throw new Error($schema === null ? "Schema is null (not sure this is wrong)" : "Schema is required");
    }

    const schema = options?.schemaRefiner?.($schema, inheritedMeta) ?? $schema;
    const code = new CodeMeta(schema, ctx, inheritedMeta);
    const meta = {
        parent: code.inherit(inheritedMeta?.parent),
        referencedBy: [...code.meta.referencedBy],
    };

    const refsPath = code.meta.referencedBy
        .slice(0, -1)
        .map((prev) => {
            if (!prev.ref) return "";
            if (!ctx) return prev.ref;
            const resolved = ctx.resolver.resolveRef(prev.ref);
            return resolved?.normalized ?? prev.ref;
        })
        .filter(Boolean);

    if (isReferenceObject(schema)) {
        if (!ctx) throw new Error("Context is required");

        const schemaName = ctx.resolver.resolveRef(schema.$ref)?.normalized;

        // circular(=recursive) reference
        if (refsPath.length > 1 && refsPath.includes(schemaName)) {
            // In circular references, code.ref and the schema must exist
            // The non-null assertions are safe here because we're inside a reference object check
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return code.assign(ctx.zodSchemaByName[code.ref!]!);
        }

        let result = ctx.zodSchemaByName[schema.$ref];
        if (!result) {
            const actualSchema = ctx.resolver.getSchemaByRef(schema.$ref);
            if (!actualSchema) {
                throw new Error(`Schema ${schema.$ref} not found`);
            }

            result = getZodSchema({ schema: actualSchema, ctx, meta, options }).toString();
        }

        if (ctx.zodSchemaByName[schemaName]) {
            return code;
        }

        ctx.zodSchemaByName[schemaName] = result;

        return code;
    }

    if (Array.isArray(schema.type)) {
        if (schema.type.length === 1) {
            const firstType = schema.type[0];
            if (!firstType) throw new Error("Schema type array has invalid first element");
            return getZodSchema({ schema: { ...schema, type: firstType }, ctx, meta, options });
        }

        return code.assign(
            `z.union([${schema.type
                .map((prop) => getZodSchema({ schema: { ...schema, type: prop }, ctx, meta, options }))
                .join(", ")}])`
        );
    }

    if (schema.type === "null") {
        return code.assign("z.null()");
    }

    if (schema.oneOf) {
        if (schema.oneOf.length === 1) {
            const firstSchema = schema.oneOf[0];
            if (!firstSchema) throw new Error("oneOf array has invalid first element");
            const type = getZodSchema({ schema: firstSchema, ctx, meta, options });
            return code.assign(type.toString());
        }

        /* when there are multiple allOf we are unable to use a discriminatedUnion as this library adds an
         *   'z.and' to the schema that it creates which breaks type inference */
        const hasMultipleAllOf = schema.oneOf?.some((obj) => isSchemaObject(obj) && (obj?.allOf || []).length > 1);
        if (schema.discriminator && !hasMultipleAllOf) {
            const propertyName = schema.discriminator.propertyName;

            return code.assign(`
                z.discriminatedUnion("${propertyName}", [${schema.oneOf
                    .map((prop) => getZodSchema({ schema: prop, ctx, meta, options }))
                    .join(", ")}])
            `);
        }

        return code.assign(
            `z.union([${schema.oneOf.map((prop) => getZodSchema({ schema: prop, ctx, meta, options })).join(", ")}])`
        );
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
        if (schema.anyOf.length === 1) {
            const firstSchema = schema.anyOf[0];
            if (!firstSchema) throw new Error("anyOf array has invalid first element");
            const type = getZodSchema({ schema: firstSchema, ctx, meta, options });
            return code.assign(type.toString());
        }

        const types = schema.anyOf
            .map((prop) => getZodSchema({ schema: prop, ctx, meta, options }))
            .map((type) => type.toString())
            .join(", ");

        return code.assign(`z.union([${types}])`);
    }

    if (schema.allOf) {
        if (schema.allOf.length === 1) {
            const firstSchema = schema.allOf[0];
            if (!firstSchema) throw new Error("allOf array has invalid first element");
            const type = getZodSchema({ schema: firstSchema, ctx, meta, options });
            return code.assign(type.toString());
        }
        const { patchRequiredSchemaInLoop, noRequiredOnlyAllof, composedRequiredSchema } = inferRequiredSchema(schema);

        const types = noRequiredOnlyAllof.map((prop) => {
            const zodSchema = getZodSchema({ schema: prop, ctx, meta, options });
            if (ctx?.resolver) {
                patchRequiredSchemaInLoop(prop, ctx.resolver);
            }
            return zodSchema;
        });

        if (composedRequiredSchema.required.length > 0) {
            types.push(
                getZodSchema({
                    schema: composedRequiredSchema,
                    ctx,
                    meta,
                    options,
                })
            );
        }
        const first = types.at(0);
        if (!first) throw new Error("allOf schemas list is empty");
        const rest = types
            .slice(1)
            .map((type) => `and(${type.toString()})`)
            .join(".");

        return code.assign(`${first.toString()}.${rest}`);
    }

    const schemaType = schema.type ? (schema.type.toLowerCase() as NonNullable<typeof schema.type>) : undefined;
    if (schemaType && isPrimitiveSchemaType(schemaType)) {
        if (schema.enum) {
            // Handle string enums
            if (schemaType === "string") {
                return code.assign(generateStringEnumZodCode(schema.enum));
            }

            // Non-string enums with string values are invalid
            if (shouldEnumBeNever(schemaType, schema.enum)) {
                return code.assign("z.never()");
            }

            // Handle number/integer enums
            return code.assign(generateNonStringEnumZodCode(schema.enum));
        }

        return code.assign(
            match(schemaType)
                .with("integer", () => "z.number()")
                .with("string", () =>
                    match(schema.format)
                        .with("binary", () => "z.instanceof(File)")
                        .otherwise(() => "z.string()")
                )
                .otherwise((type) => `z.${type}()`)
        );
    }

    const readonly = options?.allReadonly ? ".readonly()" : "";

    if (schemaType === "array") {
        if (schema.items) {
            return code.assign(
                `z.array(${getZodSchema({ schema: schema.items, ctx, meta, options }).toString()}${getZodChain({
                    schema: schema.items as SchemaObject,
                    meta: { ...meta, isRequired: true },
                    options,
                })})${readonly}`
            );
        }

        return code.assign(`z.array(z.any())${readonly}`);
    }

    if (schemaType === "object" || schema.properties || schema.additionalProperties) {
        // additional properties default to true if additionalPropertiesDefaultValue not provided
        const additionalPropsDefaultValue =
            options?.additionalPropertiesDefaultValue === undefined ? true : options?.additionalPropertiesDefaultValue;
        const additionalProps =
            schema.additionalProperties == null ? additionalPropsDefaultValue : schema.additionalProperties;
        const additionalPropsSchema = additionalProps === false ? "" : ".passthrough()";

        if (typeof schema.additionalProperties === "object" && Object.keys(schema.additionalProperties).length > 0) {
            const additionalPropsZod = getZodSchema({ schema: schema.additionalProperties, ctx, meta, options });
            const additionalPropsChain = getZodChain({
                schema: schema.additionalProperties as SchemaObject,
                meta: { ...meta, isRequired: true },
                options,
            });
            return code.assign(`z.record(${additionalPropsZod.toString()}${additionalPropsChain})`);
        }

        const hasRequiredArray = schema.required && schema.required.length > 0;
        const isPartial = options?.withImplicitRequiredProps ? false : !schema.required?.length;
        let properties = "{}";

        if (schema.properties) {
            const propsMap = Object.entries(schema.properties).map(([prop, propSchema]) => {
                // Determine if this property is required
                let propIsRequired: boolean | undefined;
                if (isPartial) {
                    propIsRequired = true;
                } else if (hasRequiredArray) {
                    propIsRequired = schema.required?.includes(prop);
                } else {
                    propIsRequired = options?.withImplicitRequiredProps;
                }

                // Build metadata, only including isRequired if defined (exactOptionalPropertyTypes)
                const propMetadata: CodeMetaData = {
                    ...meta,
                    name: prop,
                };
                if (propIsRequired !== undefined) {
                    propMetadata.isRequired = propIsRequired;
                }

                let propActualSchema = propSchema;

                if (isReferenceObject(propSchema) && ctx?.resolver) {
                    propActualSchema = ctx.resolver.getSchemaByRef(propSchema.$ref);
                    if (!propActualSchema) {
                        throw new Error(`Schema ${propSchema.$ref} not found`);
                    }
                }

                const propZodSchema = getZodSchema({ schema: propSchema, ctx, meta: propMetadata, options });
                const propChain = getZodChain({
                    schema: propActualSchema as SchemaObject,
                    meta: propMetadata,
                    options,
                });
                const propCode = `${propZodSchema.toString()}${propChain}`;

                return [prop, propCode];
            });

            properties =
                "{ " +
                propsMap
                    .filter((entry): entry is [string, string] => entry[0] !== undefined)
                    .map(([prop, propSchema]) => `${wrapWithQuotesIfNeeded(prop)}: ${propSchema}`)
                    .join(", ") +
                " }";
        }

        const partial = isPartial ? ".partial()" : "";
        const strict = options?.strictObjects ? ".strict()" : "";
        return code.assign(`z.object(${properties})${partial}${strict}${additionalPropsSchema}${readonly}`);
    }

    if (!schemaType) return code.assign("z.unknown()");

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported schema type: ${schemaType}`);
}

type ZodChainArgs = { schema: SchemaObject; meta?: CodeMetaData; options?: TemplateContext["options"] };

export const getZodChain = ({ schema, meta, options }: ZodChainArgs) => {
    const chains: string[] = [];

    match(schema.type)
        .with("string", () => chains.push(getZodChainableStringValidations(schema)))
        .with("number", "integer", () => chains.push(getZodChainableNumberValidations(schema)))
        .with("array", () => chains.push(getZodChainableArrayValidations(schema)))
        .otherwise(() => void 0);

    if (typeof schema.description === "string" && schema.description !== "" && options?.withDescription) {
        if (["\n", "\r", "\r\n"].some((c) => String.prototype.includes.call(schema.description, c))) {
            chains.push(`describe(\`${schema.description}\`)`);
        } else {
            chains.push(`describe("${schema.description}")`);
        }
    }

    const output = chains
        .concat(
            getZodChainablePresence(schema, meta),
            options?.withDefaultValues === false ? [] : getZodChainableDefault(schema)
        )
        .filter(Boolean)
        .join(".");
    return output ? `.${output}` : "";
};

const getZodChainablePresence = (schema: SchemaObject, meta?: CodeMetaData) => {
    if (schema.nullable && !meta?.isRequired) {
        return "nullish()";
    }

    if (schema.nullable) {
        return "nullable()";
    }

    if (!meta?.isRequired) {
        return "optional()";
    }

    return "";
};

// NOTE: OpenAPI prefixItems support (z.tuple) is not yet implemented
// eslint-disable-next-line sonarjs/function-return-type
const unwrapQuotesIfNeeded = (value: string | number): string | number => {
    if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }

    return value;
};

const getZodChainableDefault = (schema: SchemaObject): string => {
    if (schema.default !== undefined) {
        const defaultValue: unknown = schema.default;
        const value: string | number = match(schema.type)
            .with("number", "integer", (): string | number => {
                if (typeof defaultValue === "number") return defaultValue;
                if (typeof defaultValue === "string") return unwrapQuotesIfNeeded(defaultValue);
                return JSON.stringify(defaultValue);
            })
            .otherwise(() => JSON.stringify(defaultValue));
        return `default(${String(value)})`;
    }

    return "";
};

const formatPatternIfNeeded = (pattern: string) => {
    if (pattern.startsWith("/") && pattern.endsWith("/")) {
        pattern = pattern.slice(1, -1);
    }

    pattern = escapeControlCharacters(pattern);

    return pattern.includes(String.raw`\u`) || pattern.includes(String.raw`\p`) ? `/${pattern}/u` : `/${pattern}/`;
};

const getZodChainableStringValidations = (schema: SchemaObject) => {
    const validations: string[] = [];

    if (!schema.enum) {
        if (schema.minLength !== undefined) {
            validations.push(`min(${schema.minLength})`);
        }

        if (schema.maxLength !== undefined) {
            validations.push(`max(${schema.maxLength})`);
        }
    }

    if (schema.pattern) {
        validations.push(`regex(${formatPatternIfNeeded(schema.pattern)})`);
    }

    if (schema.format) {
        const chain = match(schema.format)
            .with("email", () => "email()")
            .with("hostname", () => "url()")
            .with("uri", () => "url()")
            .with("uuid", () => "uuid()")
            .with("date-time", () => "datetime({ offset: true })")
            .otherwise(() => "");

        if (chain) {
            validations.push(chain);
        }
    }

    return validations.join(".");
};

const getZodChainableNumberValidations = (schema: SchemaObject) => {
    const validations: string[] = [];

    // none of the chains are valid for enums
    if (schema.enum) {
        return "";
    }

    if (schema.type === "integer") {
        validations.push("int()");
    }

    if (schema.minimum !== undefined) {
        if (schema.exclusiveMinimum === true) {
            validations.push(`gt(${schema.minimum})`);
        } else {
            validations.push(`gte(${schema.minimum})`);
        }
    } else if (typeof schema.exclusiveMinimum === "number") {
        validations.push(`gt(${schema.exclusiveMinimum})`);
    }

    if (schema.maximum !== undefined) {
        if (schema.exclusiveMaximum === true) {
            validations.push(`lt(${schema.maximum})`);
        } else {
            validations.push(`lte(${schema.maximum})`);
        }
    } else if (typeof schema.exclusiveMaximum === "number") {
        validations.push(`lt(${schema.exclusiveMaximum})`);
    }

    if (schema.multipleOf) {
        validations.push(`multipleOf(${schema.multipleOf})`);
    }

    return validations.join(".");
};

const getZodChainableArrayValidations = (schema: SchemaObject) => {
    const validations: string[] = [];

    if (schema.minItems) {
        validations.push(`min(${schema.minItems})`);
    }

    if (schema.maxItems) {
        validations.push(`max(${schema.maxItems})`);
    }

    return validations.join(".");
};
