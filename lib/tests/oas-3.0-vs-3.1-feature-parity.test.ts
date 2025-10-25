// @ts-nocheck - Testing runtime behavior across OAS versions, type warnings expected
import { expect, test, describe } from "vitest";
import { generateZodClientFromOpenAPI } from "../src/index.js";

/**
 * OAS 3.0 vs 3.1 Feature Parity Test
 * 
 * Purpose: Verify that the codebase correctly handles BOTH OpenAPI 3.0 and 3.1 specs
 * at runtime, despite using oas30 types throughout the codebase.
 * 
 * Key Differences Tested:
 * 1. exclusiveMinimum/Maximum: boolean (3.0) vs number (3.1)
 * 2. nullable: explicit property (3.0) vs type array with "null" (3.1)
 * 3. type: single value (3.0) vs array of types (3.1)
 */

describe("OAS 3.0 vs 3.1 Feature Parity", () => {
    test("OAS 3.0: exclusiveMinimum as boolean + minimum", async () => {
        const openApiDoc = {
            openapi: "3.0.3",
            info: { title: "Test", version: "1.0" },
            paths: {
                "/test": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/NumericConstraints" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    NumericConstraints: {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                                minimum: 18,
                                exclusiveMinimum: true, // OAS 3.0 style
                            },
                            score: {
                                type: "number",
                                maximum: 100,
                                exclusiveMaximum: true, // OAS 3.0 style
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        
        // Should generate gt() for exclusive minimum with boolean
        expect(output).toContain("gt(18)");
        // Should generate lt() for exclusive maximum with boolean
        expect(output).toContain("lt(100)");
    });

    test("OAS 3.1: exclusiveMinimum as number (standalone)", async () => {
        const openApiDoc = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0" },
            paths: {
                "/test": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/NumericConstraints" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    NumericConstraints: {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                                exclusiveMinimum: 18, // OAS 3.1 style - no separate minimum
                            },
                            score: {
                                type: "number",
                                exclusiveMaximum: 100, // OAS 3.1 style - no separate maximum
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        
        // Should generate gt() for numeric exclusive minimum
        expect(output).toContain("gt(18)");
        // Should generate lt() for numeric exclusive maximum
        expect(output).toContain("lt(100)");
    });

    test("OAS 3.0: nullable property", async () => {
        const openApiDoc = {
            openapi: "3.0.3",
            info: { title: "Test", version: "1.0" },
            paths: {
                "/test": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/User" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                nullable: true, // OAS 3.0 style
                            },
                        },
                        required: ["name"],
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        
        // Should generate .nullable() for nullable property
        expect(output).toContain("nullable()");
    });

    test("OAS 3.1: type array with null", async () => {
        const openApiDoc = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0" },
            paths: {
                "/test": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/User" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: {
                                type: ["string", "null"], // OAS 3.1 style
                            },
                        },
                        required: ["name"],
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        
        // Should generate union with z.null()
        expect(output).toContain("z.union([z.string(), z.null()])");
    });

    test("OAS 3.1: standalone type null", async () => {
        const openApiDoc = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0" },
            paths: {
                "/test": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/NullValue" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    NullValue: {
                        type: "null", // OAS 3.1 feature
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        
        // Should generate z.null()
        expect(output).toContain("z.null()");
    });

    test("OAS 3.1: multiple types in array", async () => {
        const openApiDoc = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0" },
            paths: {
                "/test": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/FlexibleValue" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    FlexibleValue: {
                        type: ["string", "number", "boolean"], // OAS 3.1 feature
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        
        // Should generate union of all types
        expect(output).toContain("z.union([z.string(), z.number(), z.boolean()])");
    });

    test("Mixed: Both OAS 3.0 and 3.1 features in same spec", async () => {
        // This is a realistic scenario - specs often mix features
        const openApiDoc = {
            openapi: "3.1.0", // Declared as 3.1
            info: { title: "Test", version: "1.0" },
            paths: {
                "/test": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/MixedFeatures" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    MixedFeatures: {
                        type: "object",
                        properties: {
                            // OAS 3.0 style nullable
                            legacyField: {
                                type: "string",
                                nullable: true,
                            },
                            // OAS 3.1 style type array
                            modernField: {
                                type: ["string", "null"],
                            },
                            // OAS 3.1 numeric exclusive bounds
                            age: {
                                type: "integer",
                                exclusiveMinimum: 0,
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        
        // Both styles should work
        expect(output).toContain("nullable()"); // OAS 3.0 style
        expect(output).toContain("z.union([z.string(), z.null()])"); // OAS 3.1 style
        expect(output).toContain("gt(0)"); // OAS 3.1 numeric exclusive
    });
});

