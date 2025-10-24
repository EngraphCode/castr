# Enhancements Backlog

This document tracks future enhancements, refactoring opportunities, and technical debt that would improve the codebase quality and maintainability.

---

## 🎯 High Priority

### 1. Defer Logic to `openapi3-ts` Library

**Status:** 🔴 Not Started  
**Effort:** Large (2-3 weeks)  
**Impact:** High (reduces maintenance burden, improves type safety)

**Goal:** Identify and eliminate custom logic that duplicates or reimplements functionality available in `openapi3-ts`.

**Investigation Areas:**

#### A. Type Guards and Predicates

**Current State:**

- We have `isReferenceObject()` - now using from `openapi3-ts` ✅
- We have `isSchemaObject()` - now using from `openapi3-ts` ✅

**Action Items:**

- [ ] Audit all custom type guards in codebase
- [ ] Check if `openapi3-ts` provides equivalents
- [ ] Replace custom implementations with library versions
- [ ] Document why any custom guards are necessary

**Files to Review:**

- `lib/src/utils.ts` - utility type guards
- `lib/src/template-context.types.ts` - custom type definitions
- All files with `is*()` functions

#### B. Schema Traversal and Utilities

**Current State:**

- Custom schema resolution logic
- Custom reference resolution
- Schema property extraction

**Questions to Answer:**

1. Does `openapi3-ts` provide schema traversal utilities?
2. Does `openapi3-ts` provide reference resolution helpers?
3. Can we use `OpenApiBuilder` DSL for any of our operations?

**Investigation Steps:**

```typescript
// Check what utilities openapi3-ts provides
import * as OpenAPI from "openapi3-ts";

// Review:
// - OpenApiBuilder methods
// - Helper functions exported
// - Extension utilities (getExtension, addExtension)
```

**Files to Review:**

- `lib/src/getOpenApiDependencyGraph.ts` - schema graph traversal
- `lib/src/CodeMeta.ts` - schema metadata extraction
- Any custom schema walking/visiting logic

#### C. Validation and Compliance

**Current State:**

- We validate against official JSON schemas using AJV
- `openapi3-ts` provides types but not runtime validation

**Investigation:**

- [ ] Check if `openapi3-ts` has added validation in newer versions
- [ ] Review if there's an official OpenAPI validation library we should use
- [ ] Consider if our AJV approach is optimal

**Related Libraries to Investigate:**

- `@apidevtools/openapi-parser` - validates and dereferences
- `@apidevtools/swagger-parser` - validates OpenAPI/Swagger
- `openapi-types` - alternative type definitions

#### D. HTTP Method Extraction

**Current State:**

```typescript
// In zodiosEndpoint.path.helpers.ts
const method = pathItem as string; // Treating pathItem as method name
```

**Questions:**

1. Does `openapi3-ts` provide HTTP method constants?
2. Is there a proper type for extracting operation methods from PathItemObject?
3. Should we use a library-provided list of valid HTTP methods?

**Action Items:**

- [ ] Review `PathItemObject` interface in `openapi3-ts`
- [ ] Check if there's a `HttpMethod` type we should use
- [ ] Investigate if method extraction can be type-safe

#### E. Default Values and Spec Behaviors

**Current State:**

```typescript
const defaultStatusBehavior = options?.defaultStatusBehavior ?? "spec-compliant";
```

**Questions:**

1. Does the spec define standard default behaviors?
2. Should we defer to spec-defined defaults from `openapi3-ts`?
3. Are there other spec defaults we're hardcoding?

**Action Items:**

- [ ] Audit all hardcoded defaults
- [ ] Cross-reference with OAS spec
- [ ] Check if `openapi3-ts` exposes spec defaults

---

## 🧪 Testing & Validation Enhancements

### 2. OpenAPI 3.1.x Compliance Tests

**Status:** 🟡 Planned  
**Effort:** Medium (1 week)  
**Impact:** High (supports newer OAS version)

**Background:**

- OAS 3.1.x aligns with JSON Schema 2020-12
- Significant differences from 3.0.x:
    - `nullable` removed (use `type: ["string", "null"]`)
    - Full JSON Schema compatibility
    - `$schema` keyword support
    - `webhooks` top-level property

**Implementation Steps:**

1. **Setup JSON Schema 2020-12 Validation:**

```typescript
import Ajv2020 from "ajv/dist/2020.js";

const ajv = new Ajv2020({
    strict: true,
    validateFormats: true,
});

const oas31Schema = JSON.parse(readFileSync("openapi_3_1_x_schema_without_validation.json"));
const validate = ajv.compile(oas31Schema);
```

2. **Test Key OAS 3.1 Features:**
    - [ ] Nullable as union type: `type: ["string", "null"]`
    - [ ] `webhooks` property
    - [ ] `jsonSchemaDialect` property
    - [ ] Full JSON Schema features (if/then/else, etc.)
    - [ ] `summary` on `Reference` objects

3. **Update Code to Handle 3.1:**
    - [ ] Detect OAS version from `openapi` field
    - [ ] Handle nullable differences between 3.0 and 3.1
    - [ ] Support webhooks if present

**Files to Create:**

- `lib/tests/openapi-3.1-compliance.test.ts`

**Files to Update:**

- `lib/src/openApiToZod.ts` - handle nullable differences
- Documentation on 3.0 vs 3.1 support

---

### 3. OpenAPI 3.2.x Compliance Tests

**Status:** 🟡 Planned  
**Effort:** Small (2-3 days)  
**Impact:** Medium (future-proofing)

**Background:**

- OAS 3.2.x is the latest (as of 2025)
- New features to test:
    - `additionalOperations` in PathItemObject
    - `query` HTTP method (QUERY per RFC 9110)
    - Enhanced `discriminator` with `defaultMapping`
    - `querystring` parameter location
    - Enhanced XML support (`nodeType` vs deprecated `attribute`/`wrapped`)

**Implementation Steps:**

1. **Load 3.2.x Schema:**

```typescript
const oas32Schema = JSON.parse(readFileSync("openapi_3_2_x_schema_without_validation.json"));
```

2. **Test 3.2-Specific Features:**
    - [ ] `query` HTTP method support
    - [ ] `querystring` parameter location
    - [ ] `additionalOperations` property
    - [ ] Enhanced discriminator
    - [ ] Server `name` property
    - [ ] Response `summary` property

**Files to Create:**

- `lib/tests/openapi-3.2-compliance.test.ts`

---

### 4. Property-Based Testing for OpenAPI Documents

**Status:** 🟡 Planned  
**Effort:** Large (2-3 weeks)  
**Impact:** High (finds edge cases automatically)

**Goal:** Generate random valid OpenAPI documents and verify our code handles them correctly.

**Implementation:**

1. **Use `fast-check` for Property-Based Testing:**

```typescript
import fc from "fast-check";

// Generate arbitrary valid OpenAPI documents
const arbOpenAPIDoc = fc.record({
    openapi: fc.constant("3.0.3"),
    info: fc.record({
        title: fc.string(),
        version: fc.string(),
    }),
    paths: arbPaths, // Recursive arbitrary
});

fc.assert(
    fc.property(arbOpenAPIDoc, async (doc) => {
        const valid = validateOAS30(doc);
        expect(valid).toBe(true);

        await expect(
            generateZodClientFromOpenAPI({
                disableWriteToFile: true,
                openApiDoc: doc,
            })
        ).resolves.not.toThrow();
    })
);
```

2. **Benefits:**
    - Discovers edge cases we haven't thought of
    - Validates assumptions about spec
    - Ensures robustness across all valid inputs

3. **Challenges:**
    - Generating valid recursive schemas (paths, components, refs)
    - Ensuring generated docs are semantically meaningful
    - Performance (may need to limit generation depth)

**Files to Create:**

- `lib/tests/property-based-compliance.test.ts`

**Dependencies:**

- `fast-check` - property-based testing library

---

### 5. Edge Case Test Suite

**Status:** 🟡 Planned  
**Effort:** Medium (1 week)  
**Impact:** Medium (improves robustness)

**Goal:** Systematically test edge cases and boundary conditions.

**Test Categories:**

#### A. Deeply Nested Schemas

```typescript
test("schema with 10+ levels of nesting", async () => {
    // Test recursion limits, stack overflow prevention
});
```

#### B. Circular References

```typescript
test("schema with circular $ref", async () => {
    // Test cycle detection
});
```

#### C. Large Documents

```typescript
test("document with 1000+ paths", async () => {
    // Test performance, memory usage
});

test("schema with 100+ properties", async () => {
    // Test code generation limits
});
```

#### D. Special Characters

```typescript
test("path with special characters: /user/{id}/items/{item-id}", async () => {
    // Test URL encoding, parameter extraction
});

test("schema name with dots: My.Nested.Schema", async () => {
    // Test identifier generation
});
```

#### E. Empty/Minimal Cases

```typescript
test("path with no parameters", async () => {});
test("operation with no responses", async () => {});
test("schema with no properties", async () => {});
```

#### F. maxLength, minLength, pattern Constraints

```typescript
test("string with complex regex pattern", async () => {
    // Test pattern escaping, validation
});

test("array with minItems/maxItems", async () => {
    // Test Zod constraint translation
});
```

**Files to Create:**

- `lib/tests/edge-cases/` directory with organized test files

---

## 🏗️ Architecture & Code Quality

### 6. Extract Pure Functions from Complex Files

**Status:** 🟡 Planned  
**Effort:** Medium (1 week)  
**Impact:** High (improves testability, reduces complexity)

**Problem:**
Several files exceed complexity thresholds:

- `lib/src/template-context.ts` (481 lines, 41 statements)
- `lib/src/openApiToTypescript.helpers.ts` (471 lines)
- `lib/src/schema-complexity.ts` (105 lines per function)

**Strategy:**

1. Extract pure helper functions
2. Group by domain/responsibility
3. Keep each function < 50 lines
4. Target cyclomatic complexity < 10

**Example Refactor:**

```typescript
// BEFORE: In template-context.ts (line 20-273)
const generateCode = () => {
    // 250+ lines of mixed concerns
};

// AFTER: Extracted pure functions
import { buildEndpoints } from "./template/endpoints.js";
import { buildSchemas } from "./template/schemas.js";
import { buildTypes } from "./template/types.js";

const generateCode = () => {
    const endpoints = buildEndpoints(ctx);
    const schemas = buildSchemas(ctx);
    const types = buildTypes(ctx);
    return combineTemplates({ endpoints, schemas, types });
};
```

**Files to Refactor:**

- [ ] `lib/src/template-context.ts` → Extract to `lib/src/template/`
- [ ] `lib/src/openApiToTypescript.helpers.ts` → Split by domain
- [ ] `lib/src/schema-complexity.ts` → Extract calculation helpers

---

### 7. Reduce Type Assertions

**Status:** 🟡 Planned  
**Effort:** Medium (1 week)  
**Impact:** High (improves type safety)

**Problem:**
75 type assertion warnings in lint output:

```
@typescript-eslint/consistent-type-assertions
```

**Strategy:**

1. Audit each `as` assertion
2. Replace with proper type guards where possible
3. Fix function signatures to avoid assertions
4. Document remaining assertions with JSDoc explaining necessity

**Categories:**

- [ ] AST type assertions (`as t.TypeDefinition`) - can we improve `tanu` types?
- [ ] Schema type assertions (`as SchemaObject`) - can we add proper guards?
- [ ] Any type assertions - should all be eliminated

---

### 8. TODO Comment Resolution

**Status:** 🟡 Planned  
**Effort:** Small (2 days)  
**Impact:** Low (cleanup)

**Current TODOs:**

- `lib/tests/name-starting-with-number.test.ts:42` - Task associated
- `lib/tests/recursive-schema.test.ts:15` - Task associated
- `lib/tests/validations.test.ts:40,45` - 2 tasks associated

**Action:**

- [ ] Review each TODO
- [ ] Complete the task or document why it's blocked
- [ ] Remove completed TODOs
- [ ] Convert blocked TODOs to tracked issues

---

## 📚 Documentation

### 9. Architecture Decision Records (ADRs)

**Status:** 🟡 Planned  
**Effort:** Small (1 week)  
**Impact:** High (knowledge preservation)

**Goal:** Document key architectural decisions for future maintainers.

**ADRs to Create:**

1. **ADR-001: Fail Fast on Spec Violations**
    - Context: Why we don't tolerate malformed specs
    - Decision: Throw errors instead of workarounds
    - Consequences: Better error messages, clearer boundaries

2. **ADR-002: Defer Types to openapi3-ts**
    - Context: Duplication vs library usage
    - Decision: Use openapi3-ts types exclusively
    - Consequences: Less maintenance, better compatibility

3. **ADR-003: Enum Complexity Calculation**
    - Context: Should enum size affect complexity?
    - Decision: No, enum complexity is constant
    - Consequences: Consistent inlining behavior

4. **ADR-004: Type Predicates Over Boolean Filters**
    - Context: Runtime type narrowing patterns
    - Decision: Use `is` keyword with `unknown` input
    - Consequences: Better type safety, clearer intent

**Format:**

```markdown
# ADR-XXX: Title

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

What is the issue we're addressing?

## Decision

What did we decide?

## Consequences

What are the implications?
```

**Location:** `.agent/adr/`

---

### 10. API Usage Examples

**Status:** 🟡 Planned  
**Effort:** Medium (3-4 days)  
**Impact:** Medium (developer experience)

**Goal:** Comprehensive examples for all major use cases.

**Examples to Create:**

1. **Basic Usage:**

```typescript
// Simple client generation
const result = await generateZodClientFromOpenAPI({
    openApiDoc: "./swagger.json",
    outputPath: "./src/api/client.ts",
});
```

2. **Advanced Options:**

```typescript
// With all options explained
const result = await generateZodClientFromOpenAPI({
    openApiDoc: "./swagger.json",
    outputPath: "./src/api/client.ts",
    groupStrategy: "tag",
    complexityThreshold: 10,
    defaultStatusBehavior: "spec-compliant",
    withAlias: true,
    // ... document each option
});
```

3. **Programmatic Usage:**

```typescript
// Use in build pipeline
import { generateZodClientFromOpenAPI } from "openapi-zod-client";

// Fetch remote spec
const response = await fetch("https://api.example.com/openapi.json");
const spec = await response.json();

// Generate and process
const { output } = await generateZodClientFromOpenAPI({
    openApiDoc: spec,
    disableWriteToFile: true,
});

// Post-process output
const enhanced = addCustomHelpers(output);
```

4. **Schema Refiner:**

```typescript
// Custom schema transformations
const result = await generateZodClientFromOpenAPI({
    openApiDoc: "./swagger.json",
    schemaRefiner: (schema, meta) => {
        // Add custom validation
        if (schema.format === "email") {
            return {
                ...schema,
                pattern: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
            };
        }
        return schema;
    },
});
```

**Location:** `docs/examples/` or enhanced README

---

## 🔬 Research & Exploration

### 11. Alternative AST Libraries

**Status:** 🟢 Research Only  
**Effort:** Small (2-3 days)  
**Impact:** TBD

**Current:** `tanu` for TypeScript AST generation

**Questions:**

1. Is `tanu` still actively maintained?
2. Are there better alternatives?
3. Can we use TypeScript's own API?

**Alternatives to Investigate:**

- `ts-morph` - TypeScript compiler API wrapper
- `@typescript/vfs` - Virtual FS for TS
- Direct TypeScript compiler API
- `@babel/types` + `@babel/generator` (if we don't need full TS)

**Evaluation Criteria:**

- Type safety
- Maintenance status
- Performance
- API ergonomics
- Bundle size impact

---

### 12. Zod v4 Compatibility Analysis

**Status:** 🔴 Blocked (Zod v4 not released)  
**Effort:** Medium (1 week once available)  
**Impact:** Critical (requirement)

**Goal:** Ensure compatibility with Zod v4 when released.

**Action Items:**

- [ ] Monitor Zod v4 release
- [ ] Review breaking changes
- [ ] Test our generated code with Zod v4
- [ ] Update code generation for new Zod features
- [ ] Update plan `03-zod-v4.md` when ready

---

### 13. openapi3-ts v4 Upgrade Path

**Status:** 🟡 Planned  
**Effort:** Medium (1 week)  
**Impact:** High (OAS 3.1+ support)

**Current:** openapi3-ts v3.1.0  
**Target:** openapi3-ts v4.x

**Benefits of v4:**

- Native OAS 3.1 support
- Better type discriminants
- Improved type safety

**Steps:**

1. [ ] Review openapi3-ts v4 changelog
2. [ ] Identify breaking changes
3. [ ] Update type imports
4. [ ] Update tests
5. [ ] Verify all quality gates pass

**Related:** Plan `02-openapi3-ts-v4.md`

---

## 🎨 Developer Experience

### 14. Better Error Messages

**Status:** 🟡 Planned  
**Effort:** Small (3-4 days)  
**Impact:** High (developer experience)

**Goal:** Every error should clearly explain:

1. What went wrong
2. Why it's a problem
3. How to fix it
4. Link to relevant spec/docs

**Current Good Example:**

```typescript
throw new Error(
    `Invalid OpenAPI specification: Parameter "${paramItem.name}" ` +
        `(in: ${paramItem.in}) must have either 'schema' or 'content' property. ` +
        `See: https://spec.openapis.org/oas/v3.0.3#parameter-object`
);
```

**Areas to Improve:**

- [ ] Audit all `throw new Error()` statements
- [ ] Add spec references where missing
- [ ] Include suggested fixes
- [ ] Color-code errors in CLI output

---

### 15. CLI Improvements

**Status:** 🟡 Planned  
**Effort:** Small (2-3 days)  
**Impact:** Medium (developer experience)

**Current:** Basic CLI with `commander`

**Enhancements:**

1. **Interactive Mode:**

```bash
$ openapi-zod-client init
? OpenAPI spec location: ./swagger.json
? Output path: ./src/api/client.ts
? Group strategy: [tag, path, none]
```

2. **Validation Mode:**

```bash
$ openapi-zod-client validate ./swagger.json
✅ Valid OpenAPI 3.0.3 document
✅ All $refs resolve
⚠️  Warning: 3 endpoints have only 'default' response
```

3. **Watch Mode:**

```bash
$ openapi-zod-client watch ./swagger.json
👁️  Watching for changes...
```

4. **Better Progress Output:**

```bash
Generating client...
✅ Parsed OpenAPI spec
✅ Resolved 42 schemas
✅ Generated 15 endpoints
✅ Wrote client to ./src/api/client.ts
```

---

## 📊 Metrics & Monitoring

### 16. Code Generation Metrics

**Status:** 🟡 Planned  
**Effort:** Small (2-3 days)  
**Impact:** Low (nice to have)

**Goal:** Provide insights into generated code.

**Metrics to Track:**

```typescript
interface GenerationMetrics {
    inputStats: {
        pathCount: number;
        operationCount: number;
        schemaCount: number;
        refCount: number;
    };
    outputStats: {
        endpointCount: number;
        schemaCount: number;
        typeCount: number;
        lineCount: number;
    };
    performance: {
        parseTime: number;
        generateTime: number;
        writeTime: number;
        totalTime: number;
    };
}
```

**Output:**

```bash
Generation complete!

Input:  42 schemas, 15 paths, 18 operations
Output: 18 endpoints, 35 Zod schemas, 42 TypeScript types
Stats:  Generated 1,234 lines in 234ms
```

---

## 🔄 Continuous Improvement

### 17. Automated Dependency Updates

**Status:** 🟡 Planned  
**Effort:** Small (1 day)  
**Impact:** Medium (maintenance)

**Setup:**

1. Configure Renovate or Dependabot
2. Auto-merge non-breaking updates
3. Weekly dependency review

**Configuration:**

```json
{
    "extends": ["config:base"],
    "automerge": true,
    "major": {
        "automerge": false
    },
    "schedule": ["every weekend"]
}
```

---

### 18. Performance Benchmarks

**Status:** 🟡 Planned  
**Effort:** Medium (3-4 days)  
**Impact:** Medium (performance tracking)

**Goal:** Track performance over time, prevent regressions.

**Benchmarks:**

```typescript
benchmark("small spec (10 paths)", async () => {
    await generateZodClientFromOpenAPI({
        openApiDoc: smallSpec,
        disableWriteToFile: true,
    });
});

benchmark("large spec (1000 paths)", async () => {
    await generateZodClientFromOpenAPI({
        openApiDoc: largeSpec,
        disableWriteToFile: true,
    });
});
```

**Tools:**

- `vitest bench` - built-in benchmarking
- Track results over time
- CI integration to catch regressions

---

## 🎓 Learning & Research

### 19. Comparative Analysis with Similar Tools

**Status:** 🟢 Research Only  
**Effort:** Medium (1 week)  
**Impact:** High (strategic direction)

**Tools to Compare:**

- `openapi-typescript` - TypeScript types from OpenAPI
- `orval` - OpenAPI to client generator
- `swagger-typescript-api` - Another generator
- `@hey-api/openapi-ts` - Modern alternative

**Comparison Matrix:**
| Feature | openapi-zod-client | openapi-typescript | orval |
|---------|-------------------|-------------------|-------|
| Runtime validation | ✅ Zod | ❌ | ✅ Zod |
| Type safety | ✅ | ✅ | ✅ |
| OAS 3.1 support | ❌ (planned) | ✅ | ✅ |
| Client generation | ✅ | ❌ | ✅ |

**Goal:** Identify unique value propositions and gaps.

---

## 📝 Summary

**Total Enhancements:** 19

**By Priority:**

- 🔴 High (3): Defer to openapi3-ts, OAS 3.1 tests, Extract pure functions
- 🟡 Medium (14): Most enhancements
- 🟢 Low (2): Research only

**By Effort:**

- Small (9): < 1 week each
- Medium (8): 1-2 weeks each
- Large (2): 2-3 weeks each

**By Status:**

- 🔴 Not Started: 15
- 🟡 Planned: 3
- 🟢 Research Only: 2
- ✅ Completed: 0

---

## 🚀 Recommended Prioritization

**Phase 1 (Next Sprint):**

1. Investigation: Defer logic to openapi3-ts (#1)
2. OAS 3.1.x compliance tests (#2)
3. ADRs for recent decisions (#9)

**Phase 2:**

1. Extract pure functions (#6)
2. Reduce type assertions (#7)
3. openapi3-ts v4 upgrade (#13)

**Phase 3:**

1. OAS 3.2.x tests (#3)
2. Edge case suite (#5)
3. CLI improvements (#15)

**Ongoing:**

- Automated dependency updates (#17)
- Better error messages (#14)
- Documentation improvements (#10)
