# MCP Enhancement Plan: Phase 2B - Advanced Validation & Protocol Support

**⚠️ PREREQUISITE:** Architecture Rewrite must be complete before starting MCP enhancements.

**See:** `01-CURRENT-IMPLEMENTATION.md` Section 4 (complete Architecture Rewrite plan)

**Timeline:** Start MCP work after:

- Architecture Rewrite Phase 3 complete
- Zod v4 update complete (Task 2.4) ✅
- All quality gates green

**Date:** October 25, 2025  
**Phase:** 2B (After Phase 2 Core Tasks & Architecture Rewrite)  
**Status:** Planning  
**Estimated Duration:** 3-4 weeks  
**Prerequisites:** Architecture Rewrite Phases 0-3 complete, All quality gates green

---

## Overview

This plan adds comprehensive MCP (Model Context Protocol) support while maintaining two distinct use cases:

1. **SDK Generation** - Comprehensive validation for SDK libraries (e.g., Engraph)
2. **MCP Tool Consumption** - MCP-focused validation for AI assistants consuming SDKs

**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run` must pass after every task.

---

## Requirements Alignment

**See:** `.agent/plans/requirements.md` (Requirements 4, 5, 6, 7, 8)

This plan specifically implements:

- **Req 4:** SDK → MCP tools (Use Case 2: MCP Tool Consumption)
- **Req 5:** No validation duplication (MCP tools reference SDK schemas, detailed validation at SDK level)
- **Req 6:** JSON Schema export for MCP protocol compliance (Task 5.3.1: zod-to-json-schema)
- **Req 7:** Fail-fast validation (Task 5.2.1: OpenAPI spec validation with clear errors)
- **Req 8:** TDD for all tasks, comprehensive test coverage

---

## 🎯 MANDATORY: Test-Driven Development (TDD)

**ALL implementation tasks MUST follow TDD workflow:**

1. **✍️ Write failing test(s) FIRST** - Before any implementation code
2. **🔴 Run tests - confirm FAILURE** - Proves tests validate behavior
3. **✅ Write minimal implementation** - Only enough to pass tests
4. **🟢 Run tests - confirm SUCCESS** - Validates implementation works
5. **♻️ Refactor if needed** - Clean up with test protection
6. **🔁 Repeat** - For each piece of functionality

**This is non-negotiable.** See `.agent/RULES.md` for detailed TDD guidelines.

---

## 📚 MANDATORY: Comprehensive TSDoc

**ALL code (new and modified) MUST have comprehensive TSDoc:**

- **Public API** - Full TSDoc with 3+ examples, all tags, professional quality
- **Internal API** - Minimal TSDoc with @param, @returns, @throws
- **Types/Interfaces** - Property-level documentation with examples
- **Constants** - Purpose and usage documentation

**This is non-negotiable.** See `.agent/RULES.md` section "MANDATORY: Comprehensive TSDoc Standards" for:

- Required tags (@param, @returns, @throws, @example)
- Recommended tags (@see, @remarks, @defaultValue)
- Quality examples (EXCELLENT vs POOR)
- Documentation sweep requirements

**Why comprehensive TSDoc?**

- Developer Experience is Priority #1
- Enables TypeDoc generation for professional API docs
- Reduces support burden through self-service
- Validates examples are correct (tested code blocks)
- Improves onboarding for contributors

---

## Use Case Separation

### Use Case 1: SDK Generation (Engraph Pattern)

**Goal:** Generate comprehensive validation schemas and helpers for SDK libraries.

**Output Structure:**

```typescript
// SDK-focused: Full validation for all scenarios
export const schemas = { User, Error, ... };
export const endpoints = [
  {
    method: "post",
    path: "/users",
    operationId: "createUser",
    request: {
      pathParams?: z.ZodSchema,
      queryParams?: z.ZodSchema,
      headers?: z.ZodSchema,
      body?: z.ZodSchema,
    },
    responses: {
      200: { description, schema },
      400: { description, schema },
      404: { description, schema },
      // All status codes
    },
  },
];

// Optional helpers
export function validateRequest(endpoint, input) { ... }
export function validateResponse(endpoint, status, data) { ... }
export function buildSchemaRegistry(schemas, options?) { ... }
```

**Features:**

- ✅ All response status codes (success + errors)
- ✅ Full request parameter validation
- ✅ Type-safe validation helpers
- ✅ Schema registry for dynamic lookup
- ✅ Fail-fast with `.parse()`
- ✅ Strict types (no `any`, use `unknown`)

**Current Status:** ✅ Implemented in Task 1.9 (schemas-with-metadata template)

---

### Use Case 2: MCP Tool Consumption (AI Assistant Pattern)

**Goal:** Generate MCP protocol-compatible tool definitions for AI assistants.

**Output Structure:**

```typescript
// MCP-focused: Protocol compliance for AI tools
export const mcpTools = [
  {
    name: "createUser", // operationId
    description: "Create a new user",

    // Zod schemas for runtime validation
    inputSchema: z.object({
      path?: z.object({ ... }),
      query?: z.object({ ... }),
      headers?: z.object({ ... }),
      body?: z.object({ ... }),
    }),
    outputSchema: User, // Success response (200/201)

    // JSON Schema for MCP protocol (NEW!)
    inputSchemaJson: { type: "object", ... },
    outputSchemaJson: { type: "object", ... },

    // Security metadata (NEW!)
    security: [{ bearerAuth: [] }],
    requiresAuth: true,
    authTypes: ["bearer"],

    // Parameter metadata (NEW!)
    parameters: {
      path: { description, examples, required },
      query: { description, examples, required },
      body: { description, examples, contentType },
    },
  },
];

// Type predicates for fail-fast validation (NEW!)
export function isMcpToolInput(tool, input): input is ValidInput { ... }
export function assertMcpToolInput(tool, input): asserts input { ... }
export function assertMcpToolOutput(tool, output): asserts output { ... }

// Format Zod errors with context (NEW!)
function formatZodErrors(error: z.ZodError): string { ... }
```

**Features:**

- ✅ Consolidated input schema (MCP requirement)
- ✅ Success-focused output (200/201 only)
- ✅ JSON Schema export (MCP protocol requirement)
- ✅ Security metadata extraction
- ✅ Type predicates with fail-fast assertions
- ✅ Rich parameter metadata (descriptions, examples)
- ✅ Formatted error messages

**Current Status:** Partial (basic mcpTools in Task 1.9, needs enhancements)

---

## Task Execution Order

```
Prerequisites (from Phase 2):
├─ 1.9 ✅ schemas-with-metadata template (COMPLETE)
├─ 2.1 ✅ openapi3-ts v4 update (COMPLETE)
├─ 2.4 ✅ zod v4 update (COMPLETE)
├─ 3.1 ✅ pastable replacement (COMPLETE)
└─ Architecture Rewrite ⏳ (Phases 0-3) - See 01-CURRENT-IMPLEMENTATION.md

Phase 2B: MCP Enhancements (this plan)
├─ 5.1 Investigation: MCP Protocol Requirements (Week 1)
│   ├─ 5.1.1 MCP Specification Analysis
│   ├─ 5.1.2 JSON Schema Conversion Strategy
│   └─ 5.1.3 Security Metadata Extraction Design
│
├─ 5.2 SDK Generation Enhancements (Week 2)
│   ├─ 5.2.1 OpenAPI Spec Validation (Fail-Fast)
│   ├─ 5.2.2 Enhanced Parameter Metadata
│   └─ 5.2.3 Rate Limiting & Constraints
│
├─ 5.3 MCP Tool Consumption Enhancements (Week 2-3)
│   ├─ 5.3.1 JSON Schema Export (zod-to-json-schema)
│   ├─ 5.3.2 Security Metadata Extraction
│   ├─ 5.3.3 Type Predicates & Guards
│   └─ 5.3.4 Enhanced Error Formatting
│
└─ 5.4 Documentation & Validation (Week 3-4)
    ├─ 5.4.1 Update README with MCP Section
    ├─ 5.4.2 Create MCP Integration Examples
    ├─ 5.4.3 Add CLI Documentation
    └─ 5.4.4 Full Quality Gate Check
```

---

## 5.1 Investigation: MCP Protocol Requirements

### 5.1.1 MCP Specification Analysis

**Status:** Pending  
**Priority:** HIGH (informs all MCP work)  
**Estimated Time:** 4 hours  
**Dependencies:** None

**Acceptance Criteria:**

- [ ] MCP JSON Schema format documented
- [ ] Tool definition structure documented
- [ ] Security handling documented
- [ ] Error format requirements documented
- [ ] Comparison with current mcpTools output
- [ ] Document created: `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md`

**Implementation Steps:**

1. **Research MCP specification:**
    - Visit: https://anthropic.com/mcp (if available)
    - Read: Tool definition schema
    - Read: Input/output schema requirements
    - Read: Security/authentication handling
    - Read: Error response format

2. **Document JSON Schema requirements:**

    ```markdown
    # MCP Tool Schema Requirements

    ## Input Schema

    - Format: JSON Schema Draft 2020-12
    - Must be: Object type with properties
    - Must include: Required array
    - Must include: Descriptions for all fields
    - $ref handling: Inline all refs (no external refs)

    ## Output Schema

    - Format: JSON Schema Draft 2020-12
    - Must represent: Success response (200/201)
    - Error handling: Via protocol errors, not schema
    ```

3. **Compare with current implementation:**
    - What we have: Zod schemas only
    - What we need: JSON Schema + Zod schemas
    - Gap analysis: Missing features

4. **Document security requirements:**
    - How MCP handles auth
    - What metadata to extract from OpenAPI
    - How to represent in tool definition

5. **Create requirements document:**

    ```bash
    cat > .agent/analysis/MCP_PROTOCOL_ANALYSIS.md << 'EOF'
    # MCP Protocol Analysis

    ## JSON Schema Format
    - Draft version: 2020-12
    - Required fields: [list]
    - Optional fields: [list]

    ## Tool Definition Structure
    {
      "name": string,
      "description": string,
      "inputSchema": JSONSchema,
      "outputSchema": JSONSchema (optional),
      "security": [...] (custom extension)
    }

    ## Conversion Requirements
    - Zod → JSON Schema library: zod-to-json-schema
    - $ref strategy: inline (no external refs)
    - Unknown types: Use { type: "object" }

    ## Security Metadata
    - Extract from: openapi.components.securitySchemes
    - Extract from: operation.security
    - Format as: { scheme: type, scopes: [] }
    EOF
    ```

**Validation Steps:**

- [ ] Document covers all MCP requirements
- [ ] JSON Schema format clearly defined
- [ ] Security handling documented
- [ ] Gaps identified and prioritized

**Output:**

- `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md`
- Clear understanding of what to build

---

### 5.1.2 JSON Schema Conversion Strategy

**Status:** Pending  
**Priority:** HIGH  
**Estimated Time:** 3 hours  
**Dependencies:** Task 5.1.1 complete

**Acceptance Criteria:**

- [ ] `zod-to-json-schema` library evaluated
- [ ] Conversion configuration documented
- [ ] Edge cases identified
- [ ] Test strategy defined
- [ ] Document created: `.agent/analysis/JSON_SCHEMA_CONVERSION.md`

**Implementation Steps:**

1. **Evaluate zod-to-json-schema library:**

    ```bash
    npm info zod-to-json-schema
    # Check: Version, maintenance, GitHub activity
    # Read: Documentation, examples
    ```

2. **Test conversion with sample schemas:**

    ```typescript
    import { zodToJsonSchema } from "zod-to-json-schema";

    // Test with various Zod types
    const schemas = [
      z.string(),
      z.number().int().min(1).max(100),
      z.object({ name: z.string(), age: z.number() }),
      z.array(z.string()),
      z.union([z.string(), z.number()]),
      z.discriminatedUnion("type", [...]),
      z.enum(["a", "b", "c"]),
    ];

    schemas.forEach(schema => {
      const jsonSchema = zodToJsonSchema(schema, {
        $refStrategy: "none", // Inline all refs
        target: "jsonSchema2019-09", // Or 2020-12
      });
      console.log(JSON.stringify(jsonSchema, null, 2));
    });
    ```

3. **Document edge cases:**
    - Recursive schemas
    - Complex unions
    - Custom Zod types (.refine(), .transform())
    - Unknown/any types
    - Branded types

4. **Define test strategy:**
    - Unit tests for conversion
    - Integration tests with real OpenAPI specs
    - Validation against JSON Schema validators

5. **Create strategy document:**

    ````markdown
    # JSON Schema Conversion Strategy

    ## Library Choice

    - Library: zod-to-json-schema@3.x
    - Rationale: Most popular, well-maintained, good Zod support

    ## Configuration

    ```typescript
    const config = {
        $refStrategy: "none", // Inline all refs for MCP
        target: "jsonSchema2019-09", // Or 2020-12
        errorMessages: true, // Include validation messages
        markdownDescription: true, // Use description field
    };
    ```
    ````

    ## Edge Cases
    1. Recursive schemas → Inline with depth limit
    2. .refine() → Custom validation, use description
    3. .transform() → Omit (not JSON-serializable)
    4. z.unknown() → { type: "object" }

    ## Testing Approach
    - Test each Zod primitive type
    - Test complex compositions
    - Test with real OpenAPI schemas

    ```

    ```

**Validation Steps:**

- [ ] Library works with our Zod schemas
- [ ] Configuration tested with samples
- [ ] Edge cases have solutions
- [ ] Test strategy is comprehensive

**Output:**

- `.agent/analysis/JSON_SCHEMA_CONVERSION.md`
- Confidence in zod-to-json-schema library

---

### 5.1.3 Security Metadata Extraction Design

**Status:** Pending  
**Priority:** MEDIUM  
**Estimated Time:** 2 hours  
**Dependencies:** Task 5.1.1 complete

**Acceptance Criteria:**

- [ ] OpenAPI security structure understood
- [ ] Extraction logic designed
- [ ] Output format defined
- [ ] Test cases identified
- [ ] Document created: `.agent/analysis/SECURITY_EXTRACTION.md`

**Implementation Steps:**

1. **Review OpenAPI security structure:**

    ```yaml
    # OpenAPI security definitions
    components:
        securitySchemes:
            bearerAuth:
                type: http
                scheme: bearer
                bearerFormat: JWT
            apiKey:
                type: apiKey
                in: header
                name: X-API-Key
            oauth2:
                type: oauth2
                flows:
                    authorizationCode:
                        authorizationUrl: https://example.com/oauth/authorize
                        tokenUrl: https://example.com/oauth/token
                        scopes:
                            read: Read access
                            write: Write access

    paths:
        /users:
            post:
                security:
                    - bearerAuth: []
                    - apiKey: []
    ```

2. **Design extraction function:**

    ```typescript
    interface SecurityMetadata {
        // From operation.security
        requirements: SecurityRequirementObject[];

        // Resolved from components.securitySchemes
        schemes: Record<string, SecuritySchemeObject>;

        // Computed helpers
        requiresAuth: boolean;
        authTypes: string[]; // ["bearer", "apiKey", "oauth2"]
        scopes: string[]; // For OAuth2
    }

    function extractSecurityMetadata(operation: OperationObject, components?: ComponentsObject): SecurityMetadata {
        // Implementation plan
    }
    ```

3. **Define output format for MCP tools:**

    ```typescript
    // In mcpTools output
    {
      name: "createUser",
      // ... other fields

      security: [
        { bearerAuth: [] },
        { apiKey: [] },
      ],
      requiresAuth: true,
      authTypes: ["bearer", "apiKey"],

      // Full scheme definitions for reference
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
        },
      },
    }
    ```

4. **Identify test cases:**
    - No security
    - Single security scheme
    - Multiple security schemes (OR)
    - Multiple requirements (AND)
    - OAuth2 with scopes
    - Undefined security scheme (error case)

5. **Create design document:**

    ````markdown
    # Security Metadata Extraction Design

    ## Data Sources

    1. `operation.security` - Security requirements
    2. `components.securitySchemes` - Scheme definitions

    ## Extraction Algorithm

    ```typescript
    for each operation:
      if operation.security exists:
        for each requirement in operation.security:
          for each schemeName in requirement:
            resolve scheme from components.securitySchemes
            add to output
      else:
        use global security from openapi.security
    ```
    ````

    ## Output Format

    [Schema definition]

    ## Error Handling (Fail-Fast)
    - Missing security scheme → Throw error
    - Invalid scheme type → Throw error
    - Malformed security object → Throw error

    ```

    ```

**Validation Steps:**

- [ ] Design covers all OpenAPI security types
- [ ] Output format is MCP-compatible
- [ ] Error cases are fail-fast
- [ ] Test cases are comprehensive

**Output:**

- `.agent/analysis/SECURITY_EXTRACTION.md`
- Clear implementation roadmap

---

## 5.2 SDK Generation Enhancements

### 5.2.1 OpenAPI Spec Validation (Fail-Fast MCP Readiness)

**Status:** Pending  
**Priority:** HIGH (Fail-Fast Philosophy)  
**Estimated Time:** 4-6 hours (TDD)  
**Dependencies:** Task 5.1.1 complete

**Acceptance Criteria:**

- [ ] Validation function created: `validateMcpReadiness()`
- [ ] Tests written FIRST (TDD Red)
- [ ] All validations implemented
- [ ] CLI flag added: `--validate-mcp-readiness`
- [ ] CLI flag added: `--skip-mcp-validation`
- [ ] CLI flag added: `--strict-mcp-validation`
- [ ] All tests passing (TDD Green)
- [ ] Quality gates pass

**Implementation Steps:**

**Phase A: Write Failing Tests (TDD Red) - 1.5 hours**

1. **Create test file:**

    ```bash
    touch lib/src/validateMcpReadiness.test.ts
    ```

2. **Write comprehensive test suite:**

    ```typescript
    import { describe, it, expect } from "vitest";
    import { validateMcpReadiness } from "./validateMcpReadiness.js";
    import type { OpenAPIObject } from "openapi3-ts";

    describe("validateMcpReadiness", () => {
        it("should pass validation for MCP-ready spec", () => {
            const spec: OpenAPIObject = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            description: "Create a user",
                            responses: {
                                200: {
                                    description: "Success",
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

            expect(() => validateMcpReadiness(spec)).not.toThrow();
        });

        it("should throw error when operationId is missing", () => {
            const spec: OpenAPIObject = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            // Missing operationId
                            responses: {
                                200: { description: "Success" },
                            },
                        },
                    },
                },
            };

            expect(() => validateMcpReadiness(spec)).toThrow(/Missing required 'operationId'/);
            expect(() => validateMcpReadiness(spec)).toThrow(/POST \/users/);
        });

        it("should throw when success response is missing", () => {
            const spec: OpenAPIObject = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            responses: {
                                // Missing 200/201
                                400: { description: "Error" },
                            },
                        },
                    },
                },
            };

            expect(() => validateMcpReadiness(spec)).toThrow(/Missing success response/);
        });

        it("should throw when security scheme is undefined", () => {
            const spec: OpenAPIObject = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            security: [{ undefinedScheme: [] }],
                            responses: {
                                200: { description: "Success" },
                            },
                        },
                    },
                },
                // No components.securitySchemes
            };

            expect(() => validateMcpReadiness(spec)).toThrow(/undefined security scheme 'undefinedScheme'/);
        });

        it("should warn when description is missing (non-strict)", () => {
            const spec: OpenAPIObject = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            // Missing description
                            responses: {
                                200: { description: "Success" },
                            },
                        },
                    },
                },
            };

            // Should not throw in non-strict mode
            expect(() => validateMcpReadiness(spec)).not.toThrow();

            // Should throw in strict mode
            expect(() => validateMcpReadiness(spec, { strict: true })).toThrow(/Missing 'description'/);
        });

        it("should warn when parameter description is missing", () => {
            const spec: OpenAPIObject = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users/{id}": {
                        get: {
                            operationId: "getUser",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    schema: { type: "string" },
                                    // Missing description
                                },
                            ],
                            responses: {
                                200: { description: "Success" },
                            },
                        },
                    },
                },
            };

            // Should not throw (warning only)
            expect(() => validateMcpReadiness(spec)).not.toThrow();
        });

        it("should provide helpful error messages with location context", () => {
            const spec: OpenAPIObject = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users/{userId}/posts/{postId}": {
                        delete: {
                            // Missing operationId
                            responses: {
                                204: { description: "Deleted" },
                            },
                        },
                    },
                },
            };

            try {
                validateMcpReadiness(spec);
                expect.fail("Should have thrown");
            } catch (error) {
                const message = (error as Error).message;
                expect(message).toContain("DELETE /users/{userId}/posts/{postId}");
                expect(message).toContain("operationId");
                expect(message).toContain("Add: operationId:");
            }
        });

        it("should handle skip validation option", () => {
            const spec: OpenAPIObject = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            // Missing operationId
                            responses: {
                                200: { description: "Success" },
                            },
                        },
                    },
                },
            };

            // Should not throw when skipped
            expect(() => validateMcpReadiness(spec, { skip: true })).not.toThrow();
        });
    });
    ```

3. **Run tests - expect failures:**
    ```bash
    cd lib
    pnpm test -- --run src/validateMcpReadiness.test.ts
    # Expected: 8 FAILING (function doesn't exist yet)
    ```

**Phase B: Implement Validation (TDD Green) - 2.5 hours**

4. **Create implementation file:**

    ````typescript
    // lib/src/validateMcpReadiness.ts
    import type { OpenAPIObject, OperationObject } from "openapi3-ts";

    export interface ValidateMcpReadinessOptions {
        /**
         * Skip validation entirely (for testing or edge cases)
         */
        skip?: boolean;

        /**
         * Treat warnings as errors
         */
        strict?: boolean;
    }

    /**
     * Validates that an OpenAPI spec is suitable for MCP tool generation.
     *
     * Implements fail-fast philosophy: throws on critical errors with helpful context.
     *
     * @throws {Error} If spec has critical MCP issues (missing operationId, responses, etc.)
     *
     * @example
     * ```typescript
     * try {
     *   validateMcpReadiness(openApiDoc);
     *   // Spec is MCP-ready
     * } catch (error) {
     *   console.error("MCP validation failed:", error.message);
     *   // Shows exactly what's wrong and how to fix it
     * }
     * ```
     */
    export function validateMcpReadiness(openApiDoc: OpenAPIObject, options: ValidateMcpReadinessOptions = {}): void {
        if (options.skip) {
            return;
        }

        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate each operation
        for (const [path, pathItem] of Object.entries(openApiDoc.paths || {})) {
            if (!pathItem || typeof pathItem !== "object") continue;

            for (const [method, operation] of Object.entries(pathItem)) {
                if (!isOperationObject(operation)) continue;

                const location = `${method.toUpperCase()} ${path}`;

                // CRITICAL: operationId is required for MCP tool naming
                if (!operation.operationId) {
                    errors.push(
                        `${location}: Missing required 'operationId'. ` +
                            `MCP tools require unique identifiers. ` +
                            `Add: operationId: "myToolName"`
                    );
                }

                // CRITICAL: Must have success response (200 or 201)
                const hasSuccessResponse = operation.responses?.["200"] || operation.responses?.["201"];

                if (!hasSuccessResponse) {
                    errors.push(
                        `${location}: Missing success response (200 or 201). ` +
                            `MCP tools require output schemas. ` +
                            `Add a response definition with a schema.`
                    );
                }

                // WARNING: Description helps AI context
                if (!operation.description && !operation.summary) {
                    warnings.push(
                        `${location}: Missing 'description' or 'summary'. ` +
                            `MCP tools benefit from clear descriptions for AI assistants.`
                    );
                }

                // CRITICAL: Security schemes must be defined
                if (operation.security) {
                    for (const requirement of operation.security) {
                        for (const schemeName of Object.keys(requirement)) {
                            if (!openApiDoc.components?.securitySchemes?.[schemeName]) {
                                errors.push(
                                    `${location}: References undefined security scheme '${schemeName}'. ` +
                                        `Define it in components.securitySchemes.`
                                );
                            }
                        }
                    }
                }

                // WARNING: Parameter descriptions improve error messages
                if (operation.parameters) {
                    for (const param of operation.parameters) {
                        if (!isReferenceObject(param) && !param.description) {
                            warnings.push(
                                `${location}: Parameter '${param.name}' missing description. ` +
                                    `Descriptions improve validation error messages.`
                            );
                        }
                    }
                }
            }
        }

        // Fail-fast on errors
        if (errors.length > 0) {
            throw new Error(
                `OpenAPI spec is not MCP-ready:\n\n` +
                    `ERRORS (must fix):\n${errors.map((e) => `  ❌ ${e}`).join("\n")}\n\n` +
                    `${
                        warnings.length > 0
                            ? `WARNINGS (recommended):\n${warnings.map((w) => `  ⚠️  ${w}`).join("\n")}\n\n`
                            : ""
                    }` +
                    `Fix these issues or use --skip-mcp-validation to bypass (not recommended).`
            );
        }

        // In strict mode, treat warnings as errors
        if (options.strict && warnings.length > 0) {
            throw new Error(`MCP validation warnings (strict mode):\n` + warnings.map((w) => `  ⚠️  ${w}`).join("\n"));
        }

        // Log warnings but don't fail
        if (warnings.length > 0) {
            console.warn(`\n⚠️  MCP Readiness Warnings:\n` + warnings.map((w) => `  ${w}`).join("\n") + `\n`);
        }
    }

    function isOperationObject(obj: unknown): obj is OperationObject {
        return typeof obj === "object" && obj !== null && "responses" in obj;
    }

    function isReferenceObject(obj: unknown): obj is { $ref: string } {
        return typeof obj === "object" && obj !== null && "$ref" in obj;
    }
    ````

5. **Run tests - expect success:**
    ```bash
    pnpm test -- --run src/validateMcpReadiness.test.ts
    # Expected: 8/8 PASSING ✅
    ```

**Phase C: CLI Integration - 1 hour**

6. **Add CLI flags:**

    ```typescript
    // lib/src/cli.ts
    program
        .option("--validate-mcp-readiness", "Validate OpenAPI spec is MCP-ready (auto-enabled with --no-client)")
        .option("--skip-mcp-validation", "Skip MCP readiness validation (not recommended)")
        .option("--strict-mcp-validation", "Treat MCP warnings as errors");
    ```

7. **Integrate into generation:**

    ```typescript
    // lib/src/generateZodClientFromOpenAPI.ts

    // Auto-validate when using schemas-with-metadata template
    if (effectiveTemplate === "schemas-with-metadata" && !options.skipMcpValidation) {
        validateMcpReadiness(openApiDoc, {
            skip: options.skipMcpValidation,
            strict: options.strictMcpValidation,
        });
    }
    ```

**Phase D: Documentation - 30 minutes**

8. **Add JSDoc to validation function** (already done in implementation above)

9. **Update type definitions:**
    ```typescript
    // lib/src/template-context.types.ts
    export interface GenerateZodClientFromOpenAPIOptions {
        // ... existing options
        validateMcpReadiness?: boolean;
        skipMcpValidation?: boolean;
        strictMcpValidation?: boolean;
    }
    ```

**Validation Steps:**

1. **All tests pass:**

    ```bash
    pnpm test -- --run src/validateMcpReadiness.test.ts
    # 8/8 passing
    ```

2. **Full test suite passes:**

    ```bash
    pnpm test -- --run
    # All tests passing
    ```

3. **CLI flags work:**

    ```bash
    # Should fail validation
    pnpm cli samples/bad-spec.yaml -o /tmp/test.ts --no-client

    # Should skip validation
    pnpm cli samples/bad-spec.yaml -o /tmp/test.ts --no-client --skip-mcp-validation
    ```

4. **Quality gates pass:**
    ```bash
    pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
    ```

**Output:**

- `lib/src/validateMcpReadiness.ts` (implementation)
- `lib/src/validateMcpReadiness.test.ts` (8 tests)
- Updated CLI with 3 new flags
- Integration into generateZodClientFromOpenAPI

---

### 5.2.2 Enhanced Parameter Metadata

**Status:** Pending  
**Priority:** MEDIUM  
**Estimated Time:** 4-6 hours (TDD)  
**Dependencies:** Tasks 5.1.1, 5.2.1 complete

**Acceptance Criteria:**

- [ ] Parameter descriptions extracted
- [ ] Parameter examples extracted
- [ ] Required field metadata extracted
- [ ] Content-type metadata extracted (for body)
- [ ] Tests written FIRST (TDD)
- [ ] All tests passing
- [ ] Template updated to output metadata
- [ ] Quality gates pass

**Implementation Steps:**

[Similar TDD structure to 5.2.1, truncated for brevity]

**Output:**

- Enhanced `endpoints` array with parameter metadata
- Helper functions for metadata extraction
- Comprehensive tests

---

### 5.2.3 Rate Limiting & API Constraints

**Status:** Pending  
**Priority:** LOW  
**Estimated Time:** 3-4 hours (TDD)  
**Dependencies:** Task 5.2.1 complete

**Acceptance Criteria:**

- [ ] Rate limit extraction from OpenAPI extensions
- [ ] Deprecation metadata extracted
- [ ] Tags extracted for categorization
- [ ] Tests written FIRST (TDD)
- [ ] All tests passing
- [ ] Quality gates pass

**Implementation Steps:**

[Similar TDD structure, truncated for brevity]

**Output:**

- Rate limit metadata in endpoints
- Deprecation warnings
- Tag categorization

---

## 5.3 MCP Tool Consumption Enhancements

### 5.3.1 JSON Schema Export (MCP Protocol Requirement)

**Status:** Pending  
**Priority:** CRITICAL (MCP protocol compliance)  
**Estimated Time:** 6-8 hours (TDD)  
**Dependencies:** Tasks 5.1.1, 5.1.2 complete

**Acceptance Criteria:**

- [ ] `zod-to-json-schema` dependency added
- [ ] Tests written FIRST (TDD Red)
- [ ] JSON Schema export implemented
- [ ] `inputSchemaJson` generated for all mcpTools
- [ ] `outputSchemaJson` generated for all mcpTools
- [ ] All tests passing (TDD Green)
- [ ] Template updated
- [ ] Quality gates pass

**Implementation Steps:**

**Phase A: Write Failing Tests (TDD Red) - 2 hours**

1. **Create test file:**

    ```typescript
    // lib/src/templates/mcp-json-schema.test.ts
    import { describe, it, expect } from "vitest";
    import { generateZodClientFromOpenAPI } from "../generateZodClientFromOpenAPI.js";

    describe("MCP JSON Schema export", () => {
        it("should generate inputSchemaJson for mcpTools", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users/{id}": {
                        get: {
                            operationId: "getUser",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    schema: { type: "string", format: "uuid" },
                                },
                                {
                                    name: "include",
                                    in: "query",
                                    schema: { type: "string" },
                                },
                            ],
                            responses: {
                                200: {
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    name: { type: "string" },
                                                },
                                                required: ["id", "name"],
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
                disableWriteToFile: true,
            });

            // Should have inputSchemaJson
            expect(result).toContain("inputSchemaJson:");

            // Should be valid JSON Schema
            expect(result).toContain('"type": "object"');
            expect(result).toContain('"properties"');
            expect(result).toContain('"path"');
            expect(result).toContain('"query"');

            // Should include descriptions if available
            // Should inline all $refs (no external refs)
            expect(result).not.toContain('"$ref"');
        });

        it("should generate outputSchemaJson for mcpTools", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
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
                                201: {
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    name: { type: "string" },
                                                },
                                                required: ["id"],
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
                disableWriteToFile: true,
            });

            // Should have outputSchemaJson
            expect(result).toContain("outputSchemaJson:");

            // Should be JSON Schema for 201 response
            expect(result).toContain('"properties"');
            expect(result).toContain('"id"');
            expect(result).toContain('"name"');
            expect(result).toContain('"required": ["id"]');
        });

        it("should handle complex Zod schemas (unions, enums, arrays)", async () => {
            // Test conversion of complex types
            // [Implementation details]
        });

        it("should use z.unknown() JSON Schema when no response defined", async () => {
            // Test fallback behavior
            // [Implementation details]
        });
    });
    ```

2. **Run tests - expect failures:**
    ```bash
    pnpm test -- --run src/templates/mcp-json-schema.test.ts
    # Expected: FAILING (JSON Schema not generated yet)
    ```

**Phase B: Install Dependency - 15 minutes**

3. **Add zod-to-json-schema:**

    ```bash
    cd lib
    pnpm add zod-to-json-schema
    ```

4. **Test library:**

    ```typescript
    // Quick manual test
    import { zodToJsonSchema } from "zod-to-json-schema";
    import { z } from "zod";

    const schema = z.object({
        name: z.string(),
        age: z.number().int().min(0),
    });

    const jsonSchema = zodToJsonSchema(schema, {
        $refStrategy: "none",
    });

    console.log(JSON.stringify(jsonSchema, null, 2));
    ```

**Phase C: Implement Template Changes - 3 hours**

5. **Update template to generate JSON Schema:**

    ```handlebars
    {{!-- lib/src/templates/schemas-with-metadata.hbs --}}

    import { z } from "zod";
    {{#if options.withMcpJsonSchema}}
    import { zodToJsonSchema } from "zod-to-json-schema";
    {{/if}}

    {{!-- ... schemas section ... --}}

    {{!-- MCP Tools with JSON Schema --}}
    export const mcpTools = endpoints.map(endpoint => {
      // Build consolidated params object
      const params: Record<string, z.ZodTypeAny> = {};
      if (endpoint.request?.pathParams) params.path = endpoint.request.pathParams;
      if (endpoint.request?.queryParams) params.query = endpoint.request.queryParams;
      if (endpoint.request?.headers) params.headers = endpoint.request.headers;
      if (endpoint.request?.body) params.body = endpoint.request.body;

      const inputSchema = Object.keys(params).length > 0
        ? z.object(params)
        : z.object({});
      const outputSchema = endpoint.responses[200]?.schema ||
                           endpoint.responses[201]?.schema ||
                           z.unknown();

      return {
        name: endpoint.operationId || `${endpoint.method}_${endpoint.path.replace(/[\/{}]/g, '_')}`,
        description: endpoint.description || `${endpoint.method.toUpperCase()} ${endpoint.path}`,

        // Zod schemas (runtime validation)
        inputSchema,
        outputSchema,

        {{#if options.withMcpJsonSchema}}
        // JSON Schema (MCP protocol)
        inputSchemaJson: zodToJsonSchema(inputSchema, {
          name: (endpoint.operationId || 'input') + 'Input',
          $refStrategy: 'none', // Inline all refs for MCP
          target: 'jsonSchema2019-09',
          errorMessages: true,
        }),
        outputSchemaJson: zodToJsonSchema(outputSchema, {
          name: (endpoint.operationId || 'output') + 'Output',
          $refStrategy: 'none',
          target: 'jsonSchema2019-09',
        }),
        {{/if}}
      };
    }) as const;
    ```

6. **Update options handling:**

    ```typescript
    // lib/src/generateZodClientFromOpenAPI.ts

    // Auto-enable JSON Schema export for schemas-with-metadata
    if (effectiveTemplate === "schemas-with-metadata") {
        options.withMcpJsonSchema = true;
    }
    ```

**Phase D: Run Tests - 30 minutes**

7. **Run tests - expect success:**

    ```bash
    pnpm test -- --run src/templates/mcp-json-schema.test.ts
    # Expected: ALL PASSING ✅
    ```

8. **Run full test suite:**
    ```bash
    pnpm test -- --run
    # All tests passing
    ```

**Validation Steps:**

- [ ] JSON Schema generated for all mcpTools
- [ ] No external $refs (all inlined)
- [ ] Valid JSON Schema format
- [ ] Works with complex Zod types
- [ ] All tests passing
- [ ] Quality gates pass

**Output:**

- Updated template with JSON Schema export
- New tests for JSON Schema generation
- `zod-to-json-schema` dependency added

---

### 5.3.2 Security Metadata Extraction

**Status:** Pending  
**Priority:** HIGH  
**Estimated Time:** 4-6 hours (TDD)  
**Dependencies:** Tasks 5.1.1, 5.1.3 complete

**Acceptance Criteria:**

- [ ] Security requirements extracted
- [ ] Security schemes resolved
- [ ] Helper metadata computed (requiresAuth, authTypes)
- [ ] Tests written FIRST (TDD)
- [ ] All tests passing
- [ ] Template updated
- [ ] Quality gates pass

**Implementation Steps:**

[Similar TDD structure, following same pattern as above]

**Output:**

- Security metadata in mcpTools
- Helper functions for security extraction
- Comprehensive tests

---

### 5.3.3 Type Predicates & Guards

**Status:** Pending  
**Priority:** HIGH (Type Safety)  
**Estimated Time:** 5-7 hours (TDD)  
**Dependencies:** Task 5.3.1 complete

**Acceptance Criteria:**

- [ ] `isMcpToolInput` type predicate created
- [ ] `assertMcpToolInput` assertion created
- [ ] `isMcpToolOutput` type predicate created
- [ ] `assertMcpToolOutput` assertion created
- [ ] Tests written FIRST (TDD)
- [ ] All tests passing
- [ ] CLI flag added: `--with-type-predicates`
- [ ] Template updated
- [ ] Quality gates pass

**Implementation Steps:**

[Similar TDD structure, with special focus on TypeScript type narrowing tests]

**Output:**

- Type predicates for fail-fast validation
- Assertion functions with rich error messages
- Comprehensive tests including TypeScript type tests

---

### 5.3.4 Enhanced Error Formatting

**Status:** Pending  
**Priority:** MEDIUM (Developer Experience)  
**Estimated Time:** 3-4 hours (TDD)  
**Dependencies:** Task 5.3.3 complete

**Acceptance Criteria:**

- [ ] `formatZodErrors` helper function created
- [ ] Includes endpoint context in errors
- [ ] Includes security context in errors
- [ ] Tests written FIRST (TDD)
- [ ] All tests passing
- [ ] Integrated into assertion functions
- [ ] Quality gates pass

**Implementation Steps:**

[Similar TDD structure]

**Output:**

- Enhanced error messages with context
- Helper function for error formatting
- Tests for error message quality

---

## 5.4 Documentation & Validation

### 5.4.1 Update README with MCP Section

**Status:** Pending  
**Priority:** HIGH  
**Estimated Time:** 2-3 hours  
**Dependencies:** All implementation tasks complete

**Acceptance Criteria:**

- [ ] MCP section added to README
- [ ] Use case comparison table created
- [ ] SDK generation examples added
- [ ] MCP tool consumption examples added
- [ ] CLI flags documented
- [ ] Code examples tested and working

**Implementation Steps:**

1. **Add MCP overview section** (already done in previous session!)

2. **Add use case comparison:**

    ```markdown
    ## Use Case: SDK Generation vs MCP Tool Consumption

    | Aspect                 | SDK Generation           | MCP Tool Consumption         |
    | ---------------------- | ------------------------ | ---------------------------- |
    | **Goal**               | Comprehensive validation | AI tool integration          |
    | **Output Focus**       | All status codes         | Success only (200/201)       |
    | **Request Structure**  | Separated by type        | Consolidated                 |
    | **Response Structure** | All responses            | Primary success              |
    | **Format**             | Zod only                 | Zod + JSON Schema            |
    | **Security**           | Full metadata            | Extracted + computed         |
    | **Validation**         | `.parse()` fail-fast     | Type predicates + assertions |
    ```

3. **Add SDK generation example:**

    ````markdown
    ### SDK Generation Example

    ```bash
    pnpx openapi-zod-client ./api.yaml -o ./sdk.ts \
      --no-client \
      --with-validation-helpers \
      --with-schema-registry \
      --validate-mcp-readiness
    ```
    ````

    Generated output includes:
    - All Zod schemas with `.strict()`
    - Endpoints with full request/response validation
    - `validateRequest()` and `validateResponse()` helpers
    - `buildSchemaRegistry()` for dynamic lookup

    ```

    ```

4. **Add MCP tool consumption example:**

    ````markdown
    ### MCP Tool Consumption Example

    ```bash
    pnpx openapi-zod-client ./api.yaml -o ./mcp-tools.ts \
      --no-client \
      --with-type-predicates \
      --validate-mcp-readiness
    ```
    ````

    Generated output includes:
    - Zod schemas for runtime validation
    - JSON Schema for MCP protocol
    - Security metadata extraction
    - Type predicates for fail-fast validation
    - Rich error messages with context

    ```

    ```

**Output:**

- Comprehensive README documentation
- Clear use case separation
- Working code examples

---

### 5.4.2 Create MCP Integration Examples

**Status:** Pending  
**Priority:** MEDIUM  
**Estimated Time:** 2-3 hours  
**Dependencies:** All implementation complete

**Acceptance Criteria:**

- [ ] SDK integration example created
- [ ] MCP server example created
- [ ] Error handling examples added
- [ ] Security handling examples added
- [ ] All examples tested and working

**Implementation Steps:**

1. **Create SDK integration example:**

    ```typescript
    // examples/sdk-integration.ts
    import { endpoints, validateRequest, validateResponse } from "./generated-sdk.js";

    // Find endpoint
    const endpoint = endpoints.find((e) => e.operationId === "createUser");

    // Validate request
    try {
        const validated = validateRequest(endpoint, {
            body: { name: "Alice", email: "alice@example.com" },
        });

        // Make API call with validated data
        const response = await fetch(`https://api.example.com${endpoint.path}`, {
            method: endpoint.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validated.body),
        });

        // Validate response
        const data = await response.json();
        const user = validateResponse(endpoint, response.status, data);

        console.log("Created user:", user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Validation failed:", error.errors);
        } else {
            console.error("Request failed:", error);
        }
    }
    ```

2. **Create MCP server example:**

    ```typescript
    // examples/mcp-server-integration.ts
    import { mcpTools, assertMcpToolInput, assertMcpToolOutput } from "./generated-mcp.js";

    // Register MCP tools with server
    for (const tool of mcpTools) {
        server.registerTool({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchemaJson, // JSON Schema for protocol

            async execute(input: unknown) {
                try {
                    // Validate input (fail-fast)
                    assertMcpToolInput(tool, input);

                    // Check security
                    if (tool.requiresAuth) {
                        await validateAuth(tool.authTypes);
                    }

                    // Execute API call
                    const result = await callApi(tool, input);

                    // Validate output (fail-fast)
                    assertMcpToolOutput(tool, result);

                    return result;
                } catch (error) {
                    // Error includes rich context from assertions
                    throw new McpError(error.message);
                }
            },
        });
    }
    ```

**Output:**

- Working integration examples
- Error handling patterns
- Security handling patterns

---

### 5.4.3 Add CLI Documentation

**Status:** Pending  
**Priority:** MEDIUM  
**Estimated Time:** 1 hour  
**Dependencies:** All CLI flags implemented

**Acceptance Criteria:**

- [ ] All new CLI flags documented in README
- [ ] Flag combinations explained
- [ ] Common use cases documented
- [ ] Troubleshooting section added

**Implementation Steps:**

1. **Document new CLI flags:**

    ````markdown
    ## New CLI Flags for MCP

    ### Validation

    - `--validate-mcp-readiness` - Validate OpenAPI spec is MCP-ready (auto-enabled with --no-client)
    - `--skip-mcp-validation` - Skip MCP readiness validation (not recommended)
    - `--strict-mcp-validation` - Treat warnings as errors

    ### Type Safety

    - `--with-type-predicates` - Generate type predicates and assertion functions

    ### Common Combinations

    ```bash
    # SDK generation (comprehensive)
    --no-client --with-validation-helpers --with-schema-registry

    # MCP tools (protocol-focused)
    --no-client --with-type-predicates --validate-mcp-readiness

    # Strict MCP validation
    --no-client --strict-mcp-validation
    ```
    ````

    ```

    ```

**Output:**

- Complete CLI documentation
- Usage examples
- Troubleshooting guide

---

### 5.4.4 Full Quality Gate Check

**Status:** Pending  
**Priority:** CRITICAL  
**Estimated Time:** 2-3 hours  
**Dependencies:** All tasks complete

**Acceptance Criteria:**

- [ ] All quality gates pass
- [ ] All tests pass (including new tests)
- [ ] No new lint errors introduced
- [ ] Documentation complete
- [ ] Examples working
- [ ] Ready to merge

**Implementation Steps:**

1. **Run full quality gate:**

    ```bash
    pnpm format
    pnpm build
    pnpm type-check
    pnpm test -- --run
    pnpm lint
    ```

2. **Verify all new features:**
    - JSON Schema export works
    - Security metadata extracted
    - Type predicates work
    - Validation functions work
    - CLI flags work
    - Examples run successfully

3. **Create completion summary:**

    ```markdown
    # Phase 2B Complete: MCP Enhancements

    ## Achievements

    - ✅ MCP readiness validation (fail-fast)
    - ✅ JSON Schema export (zod-to-json-schema)
    - ✅ Security metadata extraction
    - ✅ Type predicates and assertions
    - ✅ Enhanced error formatting
    - ✅ Comprehensive documentation

    ## Metrics

    - Tests: X passing (Y new tests added)
    - CLI flags: 6 new flags
    - Examples: 4 working examples
    - Documentation: Complete

    ## Use Cases Supported

    1. SDK Generation (Engraph pattern)
    2. MCP Tool Consumption (AI assistants)
    ```

4. **Commit changes:**

    ```bash
    git add -A
    git commit -m "feat: Add comprehensive MCP support (Phase 2B)

    Implements Phase 2B MCP Enhancements

    SDK Generation Features:
    - OpenAPI spec validation (fail-fast)
    - Enhanced parameter metadata
    - Rate limiting extraction

    MCP Tool Features:
    - JSON Schema export (zod-to-json-schema)
    - Security metadata extraction
    - Type predicates and guards
    - Enhanced error formatting

    CLI Flags Added:
    - --validate-mcp-readiness
    - --skip-mcp-validation
    - --strict-mcp-validation
    - --with-type-predicates

    Documentation:
    - Complete MCP section in README
    - SDK integration examples
    - MCP server integration examples
    - CLI flag documentation

    Tests: X new tests, all passing
    Quality gates: All passing

    Closes Phase 2B"
    ```

**Output:**

- All quality gates passing
- Phase 2B complete
- Ready for Phase 3

---

## Summary

### Total Estimated Time

- **Investigation:** 9 hours (Week 1)
- **SDK Enhancements:** 14-20 hours (Week 2)
- **MCP Enhancements:** 18-25 hours (Week 2-3)
- **Documentation:** 8-10 hours (Week 3-4)
- **Total:** 49-64 hours (3-4 weeks)

### Deliverables

1. **SDK Generation (Use Case 1):**
    - OpenAPI spec validation (fail-fast)
    - Enhanced parameter metadata
    - Rate limiting & constraints
    - Already has: Comprehensive validation, helpers, schema registry

2. **MCP Tool Consumption (Use Case 2):**
    - JSON Schema export (MCP protocol)
    - Security metadata extraction
    - Type predicates & guards
    - Enhanced error formatting
    - Already has: Basic mcpTools structure

3. **Documentation:**
    - Comprehensive README section
    - SDK integration examples
    - MCP server integration examples
    - CLI flag documentation

4. **Quality:**
    - All TDD (tests written first)
    - All quality gates passing
    - No type assertions
    - Comprehensive test coverage

### Benefits

**For SDK Developers (Engraph):**

- Fail-fast validation catches spec issues early
- Rich metadata for better error messages
- Type-safe validation out of the box
- No string manipulation needed

**For MCP Integrators:**

- Protocol-compliant JSON Schema export
- Security metadata for auth handling
- Type predicates for fail-fast validation
- Rich error context for debugging

**For All Users:**

- Clear separation of use cases
- Comprehensive documentation
- Working examples
- Fail-fast philosophy throughout

---

## Next Steps

1. **Complete Phase 2 prerequisites:**
    - Task 2.1: Update openapi3-ts to v4
    - Task 2.2: Update zod to v4
    - Task 3.2: Eliminate type assertions

2. **Begin Phase 2B:**
    - Start with Task 5.1.1 (MCP Specification Analysis)
    - Follow TDD strictly
    - Maintain quality gates

3. **Track progress:**
    - Update this document with completion status
    - Mark tasks as complete
    - Document any deviations or learnings
