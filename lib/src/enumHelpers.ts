/**
 * Pure functions for handling OpenAPI enum value conversions to Zod
 * These functions are extracted for testability and clarity
 */

/**
 * Safely converts an enum value to a string representation for code generation
 * Handles null, strings, numbers, and complex objects
 */
export function safeStringifyEnumValue(value: unknown): string {
    if (value === null) {
        return "null";
    }
    if (typeof value === "string") {
        return value;
    }
    // For numbers, booleans, or complex objects, use JSON.stringify
    return JSON.stringify(value);
}

/**
 * Converts a string enum value to a Zod literal or enum member string
 * Used for generating z.enum([...]) or z.literal(...) code
 */
export function stringEnumValueToZodCode(value: unknown): string {
    if (value === null) {
        return "null";
    }
    const safeValue = safeStringifyEnumValue(value);
    return `"${safeValue}"`;
}

/**
 * Converts a non-string enum value to a Zod literal value
 * Handles null, numbers, and complex values
 */
export function nonStringEnumValueToZodLiteral(value: unknown): string | number {
    if (value === null) {
        return "null";
    }
    if (typeof value === "number") {
        return value;
    }
    return JSON.stringify(value);
}

/**
 * Determines if an enum array should be treated as z.never()
 * This happens when a non-string type has string values mixed in
 */
export function shouldEnumBeNever(schemaType: string, enumValues: unknown[]): boolean {
    if (schemaType === "string") {
        return false;
    }
    return enumValues.some((e) => typeof e === "string");
}

/**
 * Generates Zod code for a string enum
 * Returns either z.literal(...) for single values or z.enum([...]) for multiple
 */
export function generateStringEnumZodCode(enumValues: unknown[]): string {
    if (enumValues.length === 1) {
        const value = enumValues[0];
        const valueString = stringEnumValueToZodCode(value);
        return `z.literal(${valueString})`;
    }

    const enumMembers = enumValues.map((value) => stringEnumValueToZodCode(value)).join(", ");
    return `z.enum([${enumMembers}])`;
}

/**
 * Generates Zod code for a non-string enum (number, integer, etc.)
 * Returns either z.literal(...) for single values or z.union([...]) for multiple
 */
export function generateNonStringEnumZodCode(enumValues: unknown[]): string {
    if (enumValues.length === 1) {
        const safeValue = nonStringEnumValueToZodLiteral(enumValues[0]);
        return `z.literal(${safeValue})`;
    }

    const literals = enumValues.map((value) => `z.literal(${value === null ? "null" : value})`).join(", ");
    return `z.union([${literals}])`;
}

