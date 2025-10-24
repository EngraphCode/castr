import type { ReferenceObject, SchemaObject } from "openapi3-ts";
import { getSum } from "pastable";
import { match } from "ts-pattern";

import { isReferenceObject } from "./isReferenceObject.js";
import type { PrimitiveSchemaType } from "./utils.js";
import { isPrimitiveSchemaType } from "./utils.js";
import {
    calculateCompositionComplexity,
    calculatePropertiesComplexity,
    calculateTypeArrayComplexity,
} from "./schema-complexity.helpers.js";

type CompositeType = "oneOf" | "anyOf" | "allOf" | "enum" | "array" | "empty-object" | "object" | "record";
const complexityByType = (schema: SchemaObject & { type: PrimitiveSchemaType }) => {
    const type = schema.type;
    if (!type) return 0;

    return match(type)
        .with("string", () => 1)
        .with("number", () => 1)
        .with("integer", () => 1)
        .with("boolean", () => 1)
        .with("null", () => 1)
        .otherwise(() => 0);
};

const complexityByComposite = (from?: CompositeType) => {
    if (!from) return 0;

    return match(from)
        .with("oneOf", () => 2)
        .with("anyOf", () => 3)
        .with("allOf", () => 2)
        .with("enum", () => 1)
        .with("array", () => 1)
        .with("record", () => 1)
        .with("empty-object", () => 1)
        .with("object", () => 2)
        .otherwise(() => 0);
};

export function getSchemaComplexity({
    current,
    schema,
}: {
    current: number;
    schema: SchemaObject | ReferenceObject | undefined;
}): number {
    if (!schema) return current;
    if (isReferenceObject(schema)) return current + 2;

    if (Array.isArray(schema.type)) {
        return calculateTypeArrayComplexity(schema.type, schema, current, complexityByComposite, getSchemaComplexity);
    }

    if (schema.type === "null") {
        return current + complexityByType({ ...schema, type: "null" });
    }

    if (schema.oneOf) {
        return calculateCompositionComplexity(
            schema.oneOf,
            "oneOf",
            current,
            complexityByComposite,
            getSchemaComplexity
        );
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
        return calculateCompositionComplexity(
            schema.anyOf,
            "anyOf",
            current,
            complexityByComposite,
            getSchemaComplexity
        );
    }

    if (schema.allOf) {
        return calculateCompositionComplexity(
            schema.allOf,
            "allOf",
            current,
            complexityByComposite,
            getSchemaComplexity
        );
    }

    if (!schema.type) return current;

    if (isPrimitiveSchemaType(schema.type)) {
        if (schema.enum) {
            return (
                current +
                complexityByType(schema as SchemaObject & { type: PrimitiveSchemaType }) +
                complexityByComposite("enum") +
                getSum(schema.enum.map((prop: unknown) => getSchemaComplexity({ current: 0, schema: prop })))
            );
        }

        return current + complexityByType(schema as SchemaObject & { type: PrimitiveSchemaType });
    }

    if (schema.type === "array") {
        if (schema.items) {
            return complexityByComposite("array") + getSchemaComplexity({ current, schema: schema.items });
        }

        return complexityByComposite("array") + getSchemaComplexity({ current, schema: undefined });
    }

    if (schema.type === "object" || schema.properties || schema.additionalProperties) {
        if (schema.additionalProperties) {
            if (schema.additionalProperties === true) {
                return complexityByComposite("record") + getSchemaComplexity({ current, schema: undefined });
            }

            return (
                complexityByComposite("record") + getSchemaComplexity({ current, schema: schema.additionalProperties })
            );
        }

        if (schema.properties) {
            return calculatePropertiesComplexity(
                schema.properties,
                current,
                complexityByComposite,
                getSchemaComplexity
            );
        }

        return complexityByComposite("empty-object") + getSchemaComplexity({ current, schema: undefined });
    }

    return current;
}
