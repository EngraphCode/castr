import { describe, expect, it } from "vitest";
import type { ReferenceObject, SchemaObject } from "openapi3-ts";

import { CodeMeta, type ConversionTypeContext } from "./CodeMeta.js";
import { makeSchemaResolver } from "./makeSchemaResolver.js";

describe("CodeMeta", () => {
    const mockDoc = {
        openapi: "3.0.0" as const,
        info: { title: "Test", version: "1.0.0" },
        paths: {},
        components: {
            schemas: {
                Pet: {
                    type: "object" as const,
                    properties: {
                        id: { type: "integer" as const },
                        name: { type: "string" as const },
                    },
                },
            },
        },
    };

    describe("constructor", () => {
        it("should initialize with schema", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema);

            expect(meta.schema).toBe(schema);
            expect(meta.ref).toBeUndefined();
            expect(meta.meta.referencedBy).toEqual([]);
        });

        it("should extract $ref from ReferenceObject", () => {
            const refSchema: ReferenceObject = { $ref: "#/components/schemas/Pet" };
            const meta = new CodeMeta(refSchema);

            expect(meta.ref).toBe("#/components/schemas/Pet");
            expect(meta.meta.referencedBy).toHaveLength(1);
            expect(meta.meta.referencedBy[0]).toBe(meta);
        });

        it("should initialize referencedBy array from metadata", () => {
            const schema: SchemaObject = { type: "string" };
            const parentMeta = new CodeMeta(schema);
            const childMeta = new CodeMeta(schema, undefined, {
                referencedBy: [parentMeta],
            });

            expect(childMeta.meta.referencedBy).toHaveLength(1);
            expect(childMeta.meta.referencedBy[0]).toBe(parentMeta);
        });

        it("should preserve other metadata fields", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema, undefined, {
                name: "testField",
                isRequired: true,
            });

            expect(meta.meta.name).toBe("testField");
            expect(meta.meta.isRequired).toBe(true);
        });
    });

    describe("codeString getter", () => {
        it("should return assigned code when explicitly set", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema).assign("z.string()");

            expect(meta.codeString).toBe("z.string()");
        });

        it("should return empty string when ref is undefined", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema);

            expect(meta.codeString).toBe("");
        });

        it("should return ref when no code assigned and no ctx", () => {
            const refSchema: ReferenceObject = { $ref: "#/components/schemas/Pet" };
            const meta = new CodeMeta(refSchema);

            expect(meta.codeString).toBe("#/components/schemas/Pet");
        });

        it("should resolve ref through ctx resolver when provided", () => {
            const resolver = makeSchemaResolver(mockDoc);
            resolver.getSchemaByRef("#/components/schemas/Pet");

            const ctx: ConversionTypeContext = {
                resolver,
                zodSchemaByName: {},
                schemaByName: {},
            };

            const refSchema: ReferenceObject = { $ref: "#/components/schemas/Pet" };
            const meta = new CodeMeta(refSchema, ctx);

            expect(meta.codeString).toBe("Pet");
        });

        it("should prefer assigned code over ref resolution", () => {
            const resolver = makeSchemaResolver(mockDoc);
            resolver.getSchemaByRef("#/components/schemas/Pet");

            const ctx: ConversionTypeContext = {
                resolver,
                zodSchemaByName: {},
                schemaByName: {},
            };

            const refSchema: ReferenceObject = { $ref: "#/components/schemas/Pet" };
            const meta = new CodeMeta(refSchema, ctx).assign("z.object({ custom: true })");

            expect(meta.codeString).toBe("z.object({ custom: true })");
        });
    });

    describe("complexity getter", () => {
        it("should calculate complexity for primitive schemas", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema);

            expect(meta.complexity).toBe(1);
        });

        it("should calculate complexity for object schemas", () => {
            const schema: SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" },
                    age: { type: "integer" },
                },
            };
            const meta = new CodeMeta(schema);

            // Object complexity: 2 (object) + 1 (string) + 1 (integer) = 4
            expect(meta.complexity).toBeGreaterThan(1);
        });

        it("should handle reference objects in complexity calculation", () => {
            const refSchema: ReferenceObject = { $ref: "#/components/schemas/Pet" };
            const meta = new CodeMeta(refSchema);

            // Reference adds complexity of 2
            expect(meta.complexity).toBe(2);
        });
    });

    describe("assign method", () => {
        it("should set code and return self for chaining", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema);

            const result = meta.assign("z.string()");

            expect(result).toBe(meta);
            expect(meta.codeString).toBe("z.string()");
        });

        it("should overwrite existing code", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema);

            meta.assign("z.string()");
            meta.assign("z.string().min(1)");

            expect(meta.codeString).toBe("z.string().min(1)");
        });

        it("should allow chaining with inherit", () => {
            const schema: SchemaObject = { type: "string" };
            const parent = new CodeMeta(schema);
            const child = new CodeMeta(schema);

            child.assign("z.string()").inherit(parent);

            expect(child.codeString).toBe("z.string()");
            expect(parent.children).toContain(child);
        });
    });

    describe("inherit method", () => {
        it("should add self to parent's children array", () => {
            const schema: SchemaObject = { type: "string" };
            const parent = new CodeMeta(schema);
            const child = new CodeMeta(schema);

            child.inherit(parent);

            expect(parent.children).toContain(child);
            expect(parent.children).toHaveLength(1);
        });

        it("should handle undefined parent gracefully", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema);

            // inherit() accepts optional parent parameter
            expect(() => meta.inherit()).not.toThrow();
        });

        it("should return self for chaining", () => {
            const schema: SchemaObject = { type: "string" };
            const parent = new CodeMeta(schema);
            const child = new CodeMeta(schema);

            const result = child.inherit(parent);

            expect(result).toBe(child);
        });

        it("should allow multiple children on same parent", () => {
            const schema: SchemaObject = { type: "string" };
            const parent = new CodeMeta(schema);
            const child1 = new CodeMeta(schema);
            const child2 = new CodeMeta(schema);

            child1.inherit(parent);
            child2.inherit(parent);

            expect(parent.children).toHaveLength(2);
            expect(parent.children).toContain(child1);
            expect(parent.children).toContain(child2);
        });
    });

    describe("toString and toJSON methods", () => {
        it("should return codeString from toString", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema).assign("z.string()");

            expect(meta.toString()).toBe("z.string()");
        });

        it("should return codeString from toJSON", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema).assign("z.string()");

            expect(meta.toJSON()).toBe("z.string()");
        });

        it("should allow implicit string conversion", () => {
            const schema: SchemaObject = { type: "string" };
            const meta = new CodeMeta(schema).assign("z.string()");

            const result = `Code: ${meta}`;
            expect(result).toBe("Code: z.string()");
        });
    });

    describe("reference tracking", () => {
        it("should track references through referencedBy array", () => {
            const refSchema: ReferenceObject = { $ref: "#/components/schemas/Pet" };
            const meta = new CodeMeta(refSchema);

            // Reference objects add themselves to referencedBy
            expect(meta.meta.referencedBy).toHaveLength(1);
            expect(meta.meta.referencedBy[0].ref).toBe("#/components/schemas/Pet");
        });

        it("should preserve reference chain through nested metadata", () => {
            const refSchema: ReferenceObject = { $ref: "#/components/schemas/Pet" };
            const parent = new CodeMeta(refSchema);

            const childRefSchema: ReferenceObject = { $ref: "#/components/schemas/Owner" };
            const child = new CodeMeta(childRefSchema, undefined, {
                referencedBy: [...parent.meta.referencedBy],
            });

            expect(child.meta.referencedBy.length).toBeGreaterThan(0);
        });
    });
});
