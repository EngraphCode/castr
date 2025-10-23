import type { SchemaObject } from "openapi3-ts";

type MappingValue = string | string[] | undefined;

export default function generateJSDocArray(schema: SchemaObject, withTypesAndFormat = false): string[] {
    const comments: string[] = [];

    // Helper to safely add a comment from a schema property
    const addComment = (key: keyof SchemaObject, formatter: (value: unknown) => MappingValue): void => {
        const value: unknown = schema[key];
        if (value !== undefined) {
            const result = formatter(value);
            if (Array.isArray(result)) {
                result.forEach((subResult) => comments.push(subResult));
            } else if (result) {
                comments.push(result);
            }
        }
    };

    // Process each schema property
    addComment("description", (value) => String(value));
    addComment("example", (value) => `@example ${JSON.stringify(value)}`);
    addComment("examples", (value) => {
        if (Array.isArray(value)) {
            return value.map((example, index) => `@example Example ${index + 1}: ${JSON.stringify(example)}`);
        }
        return undefined;
    });
    addComment("deprecated", (value) => (value ? "@deprecated" : ""));
    addComment("default", (value) => `@default ${JSON.stringify(value)}`);
    addComment("externalDocs", (value) => {
        if (value && typeof value === "object" && "url" in value) {
            return `@see ${(value as { url: string }).url}`;
        }
        return undefined;
    });

    if (withTypesAndFormat) {
        addComment("type", (value) => {
            if (typeof value === "string") {
                return `@type {${value}}`;
            }
            if (Array.isArray(value)) {
                return `@type {${value.join("|")}}`;
            }
            return undefined;
        });
        addComment("format", (value) => (typeof value === "string" ? `@format ${value}` : undefined));
    }

    addComment("minimum", (value) => `@minimum ${String(value)}`);
    addComment("maximum", (value) => `@maximum ${String(value)}`);
    addComment("minLength", (value) => `@minLength ${String(value)}`);
    addComment("maxLength", (value) => `@maxLength ${String(value)}`);
    addComment("pattern", (value) => `@pattern ${String(value)}`);
    addComment("enum", (value) => {
        if (Array.isArray(value)) {
            return `@enum ${value.join(", ")}`;
        }
        return undefined;
    });

    // Add a space line after description if there are other comments
    if (comments.length > 1 && !!schema.description) {
        comments.splice(1, 0, "");
    }

    return comments;
}
