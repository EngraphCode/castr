/**
 * Helper functions for schema complexity calculation
 * Extracted to reduce cognitive complexity in schema-complexity.ts
 */

import type { ReferenceObject, SchemaObject } from "openapi3-ts";
import { getSum } from "pastable";

type ComplexityFn = (args: { current: number; schema: SchemaObject | ReferenceObject | undefined }) => number;
type CompositeType = "oneOf" | "anyOf" | "allOf" | "enum" | "array";

/**
 * Calculates complexity for a composition schema (oneOf, anyOf, allOf)
 * Handles both single-item and multi-item compositions
 */
export function calculateCompositionComplexity(
    schemas: ReadonlyArray<SchemaObject | ReferenceObject>,
    compositeType: CompositeType,
    current: number,
    complexityByComposite: (type: CompositeType) => number,
    getSchemaComplexity: ComplexityFn
): number {
    if (schemas.length === 1) {
        return complexityByComposite(compositeType) + getSchemaComplexity({ current, schema: schemas[0] });
    }

    return (
        current +
        complexityByComposite(compositeType) +
        getSum(schemas.map((prop) => getSchemaComplexity({ current: 0, schema: prop })))
    );
}

/**
 * Calculates complexity for a type array (OpenAPI 3.1 feature)
 * Handles both single-type and multi-type arrays
 */
export function calculateTypeArrayComplexity(
    types: string[],
    schema: SchemaObject,
    current: number,
    complexityByComposite: (type: CompositeType) => number,
    getSchemaComplexity: ComplexityFn
): number {
    if (types.length === 1) {
        const firstType = types[0];
        if (!firstType) return current;
        return (
            complexityByComposite("oneOf") + getSchemaComplexity({ current, schema: { ...schema, type: firstType } })
        );
    }

    return (
        current +
        complexityByComposite("oneOf") +
        getSum(types.map((prop) => getSchemaComplexity({ current: 0, schema: { ...schema, type: prop } })))
    );
}

/**
 * Calculates complexity for object properties
 * Sums complexity of all properties
 */
export function calculatePropertiesComplexity(
    properties: Record<string, SchemaObject | ReferenceObject>,
    current: number,
    complexityByComposite: (type: CompositeType) => number,
    getSchemaComplexity: ComplexityFn
): number {
    const props = Object.values(properties);
    return (
        current +
        complexityByComposite("object") +
        getSum(props.map((prop) => getSchemaComplexity({ current: 0, schema: prop })))
    );
}
