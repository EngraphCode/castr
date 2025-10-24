import { describe, it, expect } from "vitest";
import { generateZodClientFromOpenAPI } from "../generateZodClientFromOpenAPI.js";

describe("schemas-with-metadata template", () => {
    describe("Core Template Functionality", () => {
        it("should generate schemas without Zodios import", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            requestBody: {
                                required: true,
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                name: { type: "string" },
                                                email: { type: "string", format: "email" },
                                            },
                                            required: ["name", "email"],
                                        },
                                    },
                                },
                            },
                            responses: {
                                "201": {
                                    description: "User created",
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    name: { type: "string" },
                                                    email: { type: "string" },
                                                },
                                                required: ["id", "name", "email"],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            // MUST NOT import Zodios
            expect(result).not.toContain("@zodios/core");
            expect(result).not.toContain("import { Zodios");
            expect(result).not.toContain("makeApi");
            expect(result).not.toContain("new Zodios");

            // MUST import Zod
            expect(result).toContain('import { z } from "zod"');

            // MUST export schemas
            expect(result).toContain("export const");
            expect(result).toMatch(/Schema\s*=/);

            // MUST export schemas object
            expect(result).toContain("export const schemas =");

            // MUST export endpoints metadata
            expect(result).toContain("export const endpoints");

            // MUST export MCP tools
            expect(result).toContain("export const mcpTools");
        });

        it("should export schemas object with all schemas", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                components: {
                    schemas: {
                        User: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                            },
                            required: ["id", "name"],
                        },
                        Error: {
                            type: "object",
                            properties: {
                                message: { type: "string" },
                                code: { type: "number" },
                            },
                            required: ["message"],
                        },
                    },
                },
                paths: {
                    "/users": {
                        get: {
                            responses: {
                                "200": {
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
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            // MUST have schemas object export
            expect(result).toContain("export const schemas = {");

            // MUST include all schema names
            expect(result).toMatch(/User.*Schema/);
            expect(result).toMatch(/Error.*Schema/);

            // MUST use 'as const' for schemas object
            expect(result).toMatch(/export const schemas = \{[^}]*\} as const/s);
        });

        it("should export endpoints array directly without makeApi", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/users": {
                        get: {
                            operationId: "listUsers",
                            description: "Get all users",
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "array", items: { type: "object" } },
                                        },
                                    },
                                },
                            },
                        },
                        post: {
                            operationId: "createUser",
                            responses: {
                                "201": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "/users/{id}": {
                        get: {
                            operationId: "getUser",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    schema: { type: "string" },
                                },
                            ],
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            // MUST export endpoints directly
            expect(result).toContain("export const endpoints = [");

            // MUST NOT use makeApi
            expect(result).not.toContain("makeApi");

            // MUST include endpoint metadata
            expect(result).toContain("method:");
            expect(result).toContain("path:");
            expect(result).toContain("operationId:");

            // MUST use 'as const' for endpoints
            expect(result).toMatch(/export const endpoints = \[[\s\S]*\] as const/);
        });

        it("should generate MCP-compatible tool definitions", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            description: "Create a new user",
                            requestBody: {
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: { name: { type: "string" } },
                                        },
                                    },
                                },
                            },
                            responses: {
                                "201": {
                                    description: "Created",
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: { id: { type: "string" } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            // MUST export mcpTools
            expect(result).toContain("export const mcpTools");

            // MUST be derived from endpoints
            expect(result).toMatch(/mcpTools.*endpoints\.map/s);

            // MUST include required MCP fields
            expect(result).toContain("name:");
            expect(result).toContain("description:");
            expect(result).toContain("inputSchema:");
            expect(result).toContain("outputSchema:");
        });
    });

    describe("CLI Flag Integration", () => {
        it("should work with --no-client CLI flag", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/users": {
                        get: {
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "array" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            // Test that noClient option uses schemas-with-metadata template
            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "default",
                noClient: true,
            });

            // When noClient is true, should NOT have Zodios even with default template
            expect(result).not.toContain("@zodios/core");
            expect(result).not.toContain("new Zodios");

            // Should have schemas and endpoints
            expect(result).toContain("export const schemas");
            expect(result).toContain("export const endpoints");
        });
    });

    describe("Engraph Use Case: Full Request Validation", () => {
        it("should generate full request validation schemas for all parameter types", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/users/{userId}": {
                        get: {
                            operationId: "getUser",
                            parameters: [
                                {
                                    name: "userId",
                                    in: "path",
                                    required: true,
                                    schema: { type: "string", format: "uuid" },
                                },
                                {
                                    name: "include",
                                    in: "query",
                                    schema: { type: "string", enum: ["profile", "settings"] },
                                },
                                {
                                    name: "x-api-key",
                                    in: "header",
                                    required: true,
                                    schema: { type: "string" },
                                },
                            ],
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            // MUST have request validation structure
            expect(result).toContain("request:");

            // MUST have separate schemas for each parameter type
            expect(result).toMatch(/pathParams.*z\.object/s);
            expect(result).toMatch(/queryParams.*z\.object/s);
            expect(result).toMatch(/headers.*z\.object/s);

            // MUST include parameter names
            expect(result).toContain("userId");
            expect(result).toContain("include");
            expect(result).toContain("x-api-key");
        });

        it("should generate full response validation including all error responses", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            requestBody: {
                                content: {
                                    "application/json": {
                                        schema: { type: "object" },
                                    },
                                },
                            },
                            responses: {
                                "201": {
                                    description: "Created",
                                    content: {
                                        "application/json": {
                                            schema: { type: "object", properties: { id: { type: "string" } } },
                                        },
                                    },
                                },
                                "400": {
                                    description: "Bad Request",
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: { error: { type: "string" } },
                                            },
                                        },
                                    },
                                },
                                "401": {
                                    description: "Unauthorized",
                                    content: {
                                        "application/json": {
                                            schema: { type: "object", properties: { error: { type: "string" } } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            // MUST have responses structure
            expect(result).toContain("responses:");

            // MUST include ALL status codes
            expect(result).toMatch(/201.*:/);
            expect(result).toMatch(/400.*:/);
            expect(result).toMatch(/401.*:/);

            // MUST include descriptions
            expect(result).toContain("Created");
            expect(result).toContain("Bad Request");
            expect(result).toContain("Unauthorized");

            // MUST have schema property for each response
            expect(result).toMatch(/schema.*:/);
        });
    });

    describe("Optional Validation Helpers (--with-validation-helpers)", () => {
        it("should generate validation helpers when flag is enabled", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/test": {
                        post: {
                            requestBody: {
                                content: {
                                    "application/json": {
                                        schema: { type: "object" },
                                    },
                                },
                            },
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                withValidationHelpers: true,
            });

            // MUST export validateRequest helper
            expect(result).toContain("export function validateRequest");

            // MUST have all parameter types in signature
            expect(result).toMatch(/pathParams.*:/);
            expect(result).toMatch(/queryParams.*:/);
            expect(result).toMatch(/headers.*:/);
            expect(result).toMatch(/body.*:/);

            // MUST export validateResponse helper
            expect(result).toContain("export function validateResponse");

            // MUST use .parse() for validation
            expect(result).toMatch(/\.parse\(/);
        });

        it("should NOT generate validation helpers when flag is disabled", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/test": {
                        get: {
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                withValidationHelpers: false,
            });

            // MUST NOT have validation helpers
            expect(result).not.toContain("export function validateRequest");
            expect(result).not.toContain("export function validateResponse");
        });
    });

    describe("Optional Schema Registry (--with-schema-registry)", () => {
        it("should generate schema registry builder when flag is enabled", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/test": {
                        get: {
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                withSchemaRegistry: true,
            });

            // MUST export buildSchemaRegistry helper
            expect(result).toContain("export function buildSchemaRegistry");

            // MUST have rename option
            expect(result).toMatch(/rename.*:/);

            // MUST sanitize keys by default
            expect(result).toMatch(/replace\(\/\[.*\]\/g/);
        });

        it("should NOT generate schema registry builder when flag is disabled", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/test": {
                        get: {
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                withSchemaRegistry: false,
            });

            // MUST NOT have schema registry builder
            expect(result).not.toContain("export function buildSchemaRegistry");
        });
    });

    describe("Strict Types & Fail-Fast Validation", () => {
        it("should generate STRICT types with NO 'any' in validation helpers", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/test": {
                        post: {
                            requestBody: {
                                content: {
                                    "application/json": {
                                        schema: { type: "object" },
                                    },
                                },
                            },
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                withValidationHelpers: true,
            });

            // ✅ MUST use 'unknown', NOT 'any'
            expect(result).toMatch(/:\s*unknown/);

            // ❌ MUST NOT contain 'any' type
            expect(result).not.toMatch(/:\s*any[,;)\s]/);
            expect(result).not.toContain("Record<string, any>");
            expect(result).not.toMatch(/\)\s*:\s*any/);
        });

        it("should generate FAIL-FAST validation using .parse() not .safeParse()", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/test": {
                        post: {
                            requestBody: {
                                content: {
                                    "application/json": {
                                        schema: { type: "object" },
                                    },
                                },
                            },
                            responses: {
                                "200": {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                withValidationHelpers: true,
            });

            // ✅ MUST use .parse() for fail-fast
            expect(result).toMatch(/\.parse\(/);

            // ❌ MUST NOT use .safeParse() in helpers
            expect(result).not.toContain(".safeParse(");

            // ✅ MUST document that it throws
            expect(result).toMatch(/@throws/i);
        });

        it("should generate STRICT schemas with .strict() by default", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                components: {
                    schemas: {
                        User: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                            },
                            required: ["id"],
                            // No additionalProperties: true
                        },
                    },
                },
                paths: {
                    "/users": {
                        get: {
                            responses: {
                                "200": {
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
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            // ✅ MUST use .strict() for objects (reject unknown keys)
            expect(result).toMatch(/\.strict\(\)/);

            // ❌ MUST NOT use .passthrough() by default (unless additionalProperties: true)
            // Note: This test assumes default behavior; passthrough is valid if spec says so
            if (!result.includes("additionalProperties")) {
                expect(result).not.toMatch(/\.passthrough\(\)/);
            }
        });
    });
});
