import { describe, expect, it } from "vitest";
import type { SchemaObject } from "openapi3-ts/oas30";

import { CodeMeta } from "./CodeMeta.js";
import {
    findExistingSchemaVar,
    generateUniqueVarName,
    handleInlineEverything,
    handleRefSchema,
    registerSchemaName,
    shouldInlineSchema,
} from "./zodiosEndpoint.helpers.js";

describe("zodiosEndpoint.helpers", () => {
    describe("shouldInlineSchema", () => {
        it("should return true when threshold is -1 (inline everything)", () => {
            expect(shouldInlineSchema(10, -1)).toBe(true);
            expect(shouldInlineSchema(100, -1)).toBe(true);
        });

        it("should return true when complexity is below threshold", () => {
            expect(shouldInlineSchema(2, 4)).toBe(true);
            expect(shouldInlineSchema(3, 10)).toBe(true);
        });

        it("should return false when complexity meets or exceeds threshold", () => {
            expect(shouldInlineSchema(4, 4)).toBe(false);
            expect(shouldInlineSchema(5, 4)).toBe(false);
            expect(shouldInlineSchema(10, 5)).toBe(false);
        });
    });

    describe("generateUniqueVarName", () => {
        it("should return base name if not used", () => {
            const existingNames = {};
            expect(generateUniqueVarName("Pet", existingNames)).toBe("Pet");
        });

        it("should add suffix if name is taken", () => {
            const existingNames = { Pet: "z.object(...)" };
            expect(generateUniqueVarName("Pet", existingNames)).toBe("Pet__2");
        });

        it("should increment suffix until unique", () => {
            const existingNames = {
                Pet: "z.object(...)",
                Pet__2: "z.object(...)",
                Pet__3: "z.object(...)",
            };
            expect(generateUniqueVarName("Pet", existingNames)).toBe("Pet__4");
        });

        it("should reuse name if it maps to the same base", () => {
            const existingNames = { Pet: "Pet" };
            expect(generateUniqueVarName("Pet", existingNames)).toBe("Pet");
        });

        it("should handle exportAllNamedSchemas option", () => {
            const existingNames = { Pet: "z.object(...)" };
            const schemasByName = { "#/components/schemas/Pet": ["Pet"] };

            const result = generateUniqueVarName("Pet", existingNames, {
                exportAllNamedSchemas: true,
                schemasByName,
                schemaKey: "#/components/schemas/Pet",
            });

            expect(result).toBe("Pet");
        });
    });

    describe("registerSchemaName", () => {
        it("should register schema in context", () => {
            const ctx: {
                zodSchemaByName: Record<string, string>;
                schemaByName: Record<string, string>;
                resolver: never;
            } = {
                zodSchemaByName: {},
                schemaByName: {},
                resolver: {} as never,
            };

            registerSchemaName(ctx, "Pet", "z.object({ id: z.number() })", false);

            expect(ctx.zodSchemaByName["Pet"]).toBe("z.object({ id: z.number() })");
            expect(ctx.schemaByName["z.object({ id: z.number() })"]).toBe("Pet");
        });

        it("should register in schemasByName when exportAllNamedSchemas is true", () => {
            const ctx = {
                zodSchemaByName: {} as Record<string, string>,
                schemaByName: {} as Record<string, string>,
                schemasByName: {} as Record<string, string[]>,
                resolver: {} as never,
            };

            registerSchemaName(ctx, "Pet", "z.object(...)", true);

            expect(ctx.schemasByName["z.object(...)"]).toEqual(["Pet"]);
        });

        it("should append to existing schemasByName array", () => {
            const ctx = {
                zodSchemaByName: {} as Record<string, string>,
                schemaByName: {} as Record<string, string>,
                schemasByName: { "z.object(...)": ["Pet"] } as Record<string, string[]>,
                resolver: {} as never,
            };

            registerSchemaName(ctx, "Pet2", "z.object(...)", true);

            expect(ctx.schemasByName["z.object(...)"]).toEqual(["Pet", "Pet2"]);
        });
    });

    describe("handleInlineEverything", () => {
        it("should return result if no ref", () => {
            const schema: SchemaObject = { type: "string" };
            const input = new CodeMeta(schema);
            const ctx = {
                zodSchemaByName: {},
                schemaByName: {},
                resolver: {} as never,
            };

            const result = handleInlineEverything(input, "z.string()", ctx);
            expect(result).toBe("z.string()");
        });

        it("should return zodSchema if ref exists", () => {
            const schema = { $ref: "#/components/schemas/Pet" };
            const input = new CodeMeta(schema);
            const ctx = {
                zodSchemaByName: { Pet: "z.object({ id: z.number() })" },
                schemaByName: {},
                resolver: {} as never,
            };

            const result = handleInlineEverything(input, "Pet", ctx);
            expect(result).toBe("z.object({ id: z.number() })");
        });

        it("should throw if ref exists but schema not found", () => {
            const schema = { $ref: "#/components/schemas/Pet" };
            const input = new CodeMeta(schema);
            const ctx = {
                zodSchemaByName: {},
                schemaByName: {},
                resolver: {} as never,
            };

            expect(() => handleInlineEverything(input, "Pet", ctx)).toThrow("Zod schema not found for ref: Pet");
        });
    });

    describe("findExistingSchemaVar", () => {
        it("should return undefined if exportAllNamedSchemas is true", () => {
            const ctx = {
                zodSchemaByName: {},
                schemaByName: { "z.object(...)": "Pet" },
                resolver: {} as never,
            };

            const result = findExistingSchemaVar("z.object(...)", ctx, true);
            expect(result).toBeUndefined();
        });

        it("should return existing var if exportAllNamedSchemas is false", () => {
            const ctx = {
                zodSchemaByName: {},
                schemaByName: { "z.object(...)": "Pet" },
                resolver: {} as never,
            };

            const result = findExistingSchemaVar("z.object(...)", ctx, false);
            expect(result).toBe("Pet");
        });

        it("should return undefined if schema not found", () => {
            const ctx = {
                zodSchemaByName: {},
                schemaByName: {},
                resolver: {} as never,
            };

            const result = findExistingSchemaVar("z.object(...)", ctx, false);
            expect(result).toBeUndefined();
        });
    });

    describe("handleRefSchema", () => {
        it("should return result if complexity is below threshold", () => {
            const schema = { $ref: "#/components/schemas/Pet" };
            const input = new CodeMeta(schema);
            const ctx = {
                zodSchemaByName: { Pet: "z.string()" },
                schemaByName: {},
                resolver: {
                    resolveRef: () => ({ name: "Pet" }),
                    getSchemaByRef: () => ({ type: "string" }),
                },
            };

            const result = handleRefSchema(input, "Pet", ctx, 5);
            expect(result).toBe("z.string()");
        });

        it("should return result unchanged if complexity exceeds threshold", () => {
            const schema = { $ref: "#/components/schemas/Pet" };
            const input = new CodeMeta(schema);
            const ctx = {
                zodSchemaByName: { Pet: "z.object({ id: z.number(), name: z.string() })" },
                schemaByName: {},
                resolver: {
                    resolveRef: () => ({ name: "Pet" }),
                    getSchemaByRef: () => ({
                        type: "object",
                        properties: { id: { type: "integer" }, name: { type: "string" } },
                    }),
                },
            };

            const result = handleRefSchema(input, "Pet", ctx, 2);
            expect(result).toBe("Pet");
        });

        it("should throw for invalid ref", () => {
            const schema = { $ref: "#/components/schemas/Invalid" };
            const input = new CodeMeta(schema);
            const ctx = {
                zodSchemaByName: {},
                schemaByName: {},
                resolver: {
                    resolveRef: () => ({ name: "Invalid" }),
                    getSchemaByRef: () => undefined,
                },
            };

            expect(() => handleRefSchema(input, "Invalid", ctx, 5)).toThrow("Invalid ref:");
        });
    });
});
