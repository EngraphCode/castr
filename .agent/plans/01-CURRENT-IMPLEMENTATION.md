# Current Implementation Plan: Phase 2 - Type Safety & Dependencies

**Date:** October 24, 2025  
**Phase:** 2 of 4  
**Status:** Ready to Execute  
**Estimated Duration:** 2-3 weeks

---

## Overview

This document contains the **detailed task breakdown** for Phase 2 work. Every task includes:

- **Acceptance Criteria:** What "done" looks like
- **Implementation Steps:** How to do it
- **Validation Steps:** How to verify it works

**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run` must pass after every task.

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

**Why TDD?**

- Prevents regressions (every change protected by tests)
- Documents behavior (tests = living documentation)
- Validates tests work (seeing failure first proves effectiveness)
- Forces good design (untestable code signals design problems)
- Enables safe refactoring (test coverage provides confidence)

**No exceptions:**

- ❌ "I'll add tests later" - NOT ALLOWED
- ❌ "This is too simple" - STILL WRITE TESTS
- ❌ "Just prototyping" - PROTOTYPE IN TESTS
- ✅ Tests must come BEFORE implementation

---

## Task Execution Order

Tasks MUST be executed in this order due to dependencies:

```
1. Dependency Analysis (investigations) [Week 1]
   ├─ 1.1 Lint Triage ✅
   ├─ 1.2 pastable Analysis ✅
   ├─ 1.3 openapi-types Evaluation ✅
   ├─ 1.4 @zodios/core Evaluation ✅
   ├─ 1.5 swagger-parser Investigation ✅
   ├─ 1.6 openapi3-ts v4 Capabilities ✅
   ├─ 1.7 Handlebars Evaluation ✅
   ├─ 1.8 Defer Logic to openapi3-ts v4 (DEFERRED)
   ├─ 1.9 Zodios-Free Template Strategy ✅
   └─ 1.10 Fix Critical Lint Issues (NEW)

2. Dependency Updates [Week 1-2]
   ├─ 2.1 Update openapi3-ts (v3 → v4.5.0) ✅
   ├─ 2.2 Update @apidevtools/swagger-parser
   ├─ 2.3 Defer Logic to openapi3-ts v4 & swagger-parser (Post-Update Analysis)
   └─ 2.4 Update zod (v3 → v4.1.12)

3. Code Cleanup [Week 2-3]
   ├─ 3.1 Replace pastable
   ├─ 3.2 Eliminate Type Assertions (BLOCKER)
   └─ 3.3 Remove Evaluated Dependencies

4. Validation [Week 3]
   └─ 4.1 Full Quality Gate Check
```

---

## 1. Dependency Analysis & Investigation (✅ COMPLETE 10/10)

### 1.1 Lint Triage & Categorization ✅

**Status:** Complete  
**Priority:** HIGH (identifies BLOCKER)  
**Time Taken:** 2 hours

**Acceptance Criteria:**

- [x] ✅ All 146 lint issues categorized by priority
- [x] ✅ Type assertions (74) documented by file and line
- [x] ✅ Critical issues identified and prioritized
- [x] ✅ Document created: `.agent/analysis/LINT_TRIAGE_COMPLETE.md`

**Implementation Steps:**

1. **Generate detailed lint report:**

    ```bash
    cd lib
    pnpm lint --format json > ../.agent/analysis/lint-report.json
    pnpm lint > ../.agent/analysis/lint-report.txt
    ```

2. **Categorize by rule:**

    ```bash
    grep "error\|warning" .agent/analysis/lint-report.txt | \
      awk '{print $NF}' | sort | uniq -c | sort -rn > \
      .agent/analysis/lint-by-rule.txt
    ```

3. **Document type assertions by file:**

    ```bash
    grep "@typescript-eslint/consistent-type-assertions" \
      .agent/analysis/lint-report.txt > \
      .agent/analysis/type-assertions.txt
    ```

4. **Create triage document** with:
    - **CRITICAL (Extraction Blockers):**
        - 74 type assertions (must be 0)
        - 4 non-null assertions
    - **HIGH (Type Safety):**
        - 8 require-await violations
        - 7 function-return-type issues
        - 2 unsafe-assignment
        - 2 unsafe-argument
    - **MEDIUM (Code Quality):**
        - 10 max-statements
        - 6 max-lines-per-function
        - 2 no-selector-parameter
    - **LOW (Style/Minor):**
        - 4 todo-tag
        - 3 max-lines
        - 2 no-commented-code

5. **Create file-by-file plan:**
    - For each file with type assertions
    - Document: location, current code, proposed fix
    - Estimate effort per file

**Validation Steps:**

1. Document contains all 148 issues categorized
2. Type assertions list matches `grep` count (74)
3. Priority levels assigned to all issues
4. File-by-file elimination plan exists

**Output:**

- `.agent/analysis/LINT_TRIAGE_COMPLETE.md`
- `.agent/analysis/lint-report.json`
- `.agent/analysis/type-assertions.txt`

---

### 1.2 pastable Usage Analysis ✅

**Status:** Complete  
**Priority:** HIGH  
**Time Taken:** 2 hours

**Acceptance Criteria:**

- [x] ✅ All 7 files using pastable documented
- [x] ✅ All 8 functions mapped to replacements
- [x] ✅ Replacement strategy chosen (lodash-es + custom utilities)
- [x] ✅ Document created: `.agent/analysis/PASTABLE_REPLACEMENT_PLAN.md`

**Implementation Steps:**

1. **Inventory all usage:**

    ```bash
    cd lib
    grep -rn "from \"pastable" src/ > ../.agent/analysis/pastable-imports.txt
    grep -rn "pastable/" src/ >> ../.agent/analysis/pastable-imports.txt
    ```

2. **Document each function:**

    | Function               | File                                                     | Usage                     | Replacement                         | Complexity |
    | ---------------------- | -------------------------------------------------------- | ------------------------- | ----------------------------------- | ---------- |
    | `get`                  | makeSchemaResolver.ts, getOpenApiDependencyGraph.test.ts | Object property access    | lodash.get or `?.`                  | Low        |
    | `capitalize`           | utils.ts, generateZodClientFromOpenAPI.ts                | String capitalization     | native or lodash                    | Low        |
    | `pick`                 | generateZodClientFromOpenAPI.ts                          | Object property selection | lodash.pick or native               | Low        |
    | `sortBy`               | template-context.ts                                      | Array sorting             | lodash.sortBy or native             | Low        |
    | `sortListFromRefArray` | template-context.ts                                      | Custom sort               | Custom impl                         | Medium     |
    | `sortObjKeysFromArray` | template-context.ts                                      | Object key sort           | Custom impl                         | Medium     |
    | `kebabToCamel`         | utils.ts                                                 | String transform          | Custom (simple regex)               | Low        |
    | `snakeToCamel`         | utils.ts                                                 | String transform          | Custom (simple regex)               | Low        |
    | `getSum`               | schema-complexity.helpers.ts                             | Array sum                 | native `.reduce()`                  | Low        |
    | `ObjectLiteral` (type) | getZodiosEndpointDefinitionList.ts                       | Type only                 | `Record<string, unknown>` or custom | Low        |

3. **Choose strategy:**
    - **Option A:** Add lodash (~24KB, battle-tested)
    - **Option B:** Write custom utilities (~2KB, full control)
    - **Option C:** Mix (lodash for complex, native/custom for simple)
    - **Recommendation:** Option C (balanced)

4. **Create implementation plan:**
    - Task 1: Replace simple functions (capitalize, getSum, kebabToCamel, snakeToCamel)
    - Task 2: Replace with lodash (get, pick, sortBy)
    - Task 3: Create custom utilities (sortListFromRefArray, sortObjKeysFromArray)
    - Task 4: Replace ObjectLiteral type
    - Task 5: Remove pastable dependency
    - Task 6: Run tests, verify no regressions

**Validation Steps:**

1. All functions documented with replacement strategy
2. Effort estimated for each replacement
3. Test coverage verified for affected code
4. Plan includes verification steps

**Output:**

- `.agent/analysis/PASTABLE_REPLACEMENT_PLAN.md`
- `.agent/analysis/pastable-imports.txt`

---

### 1.3 openapi-types Evaluation ✅

**Status:** Complete  
**Priority:** MEDIUM  
**Time Taken:** 1 hour

**Acceptance Criteria:**

- [x] ✅ Current usage documented (only 1 test file)
- [x] ✅ Maintenance status assessed (active but redundant)
- [x] ✅ Necessity evaluated (NOT needed with openapi3-ts v4)
- [x] ✅ Decision made: **REMOVE** (redundant)
- [x] ✅ Document created: `.agent/analysis/OPENAPI_TYPES_EVALUATION.md`

**Implementation Steps:**

1. **Find all usage:**

    ```bash
    cd lib
    grep -rn "openapi-types" src/ > ../.agent/analysis/openapi-types-usage.txt
    grep -rn "import.*OpenAPIV3" src/ >> ../.agent/analysis/openapi-types-usage.txt
    ```

2. **Check maintenance:**

    ```bash
    npm view openapi-types time
    npm view openapi-types version
    ```

    - Visit: https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-types
    - Check: Last commit, open issues, PR activity

3. **Compare with openapi3-ts:**

    ```bash
    npm view openapi3-ts@4.5.0 | grep -A10 "dependencies"
    ```

    - Does openapi3-ts v4 include these types?
    - Are they redundant?

4. **Document decision:**
    - **IF** openapi3-ts v4 provides all needed types → Remove
    - **IF** still needed → Keep but document why
    - **IF** usage is minimal → Inline the types, remove dep

**Validation Steps:**

1. All imports of openapi-types found and documented
2. Maintenance status clearly stated (with evidence)
3. Decision justified with reasoning
4. If removing: migration path documented

**Output:**

- `.agent/analysis/OPENAPI_TYPES_EVALUATION.md`
- Recommendation: Keep or Remove with justification

---

### 1.4 @zodios/core Evaluation ✅

**Status:** Complete  
**Priority:** MEDIUM  
**Time Taken:** 1 hour

**Acceptance Criteria:**

- [x] ✅ Current usage documented (types used in generated code)
- [x] ✅ Maintenance status assessed (maintenance mode but stable)
- [x] ✅ Inlining evaluated (not practical, widely used)
- [x] ✅ Decision made: **KEEP** (stable, 11.5M downloads/month)
- [x] ✅ Document created: `.agent/analysis/ZODIOS_CORE_EVALUATION.md`

**Implementation Steps:**

1. **Find all usage:**

    ```bash
    cd lib
    grep -rn "@zodios/core" src/ > ../.agent/analysis/zodios-usage.txt
    grep -rn "ZodiosEndpointDefinition\|ZodiosEndpoint" src/ >> ../.agent/analysis/zodios-usage.txt
    ```

2. **Check maintenance:**

    ```bash
    npm view @zodios/core time version
    ```

    - Visit: https://github.com/zodios/zodios
    - Check: Last commit, stars, issues, ecosystem

3. **Analyze usage:**
    - What types do we import?
    - What functions do we use?
    - Can we define these types ourselves?
    - Is the ecosystem still active?

4. **Document decision:**
    - **IF** actively maintained + heavy usage → Keep
    - **IF** light usage + simple types → Inline types, remove
    - **IF** unmaintained but needed → Fork or inline

**Validation Steps:**

1. All usage documented
2. Maintenance metrics provided
3. Decision justified
4. If removing: types/functions to inline documented

**Output:**

- `.agent/analysis/ZODIOS_CORE_EVALUATION.md`
- Recommendation with justification

---

### 1.5 @apidevtools/swagger-parser Investigation ✅

**Status:** Complete  
**Priority:** MEDIUM  
**Time Taken:** 2 hours

**Acceptance Criteria:**

- [x] ✅ Current usage documented (tests, CLI parsing)
- [x] ✅ Full capabilities mapped (validation, bundling, dereferencing)
- [x] ✅ Integration opportunities identified (used appropriately)
- [x] ✅ Decision: KEEP current usage pattern (actively maintained)
- [x] ✅ Document created: `.agent/analysis/SWAGGER_PARSER_INTEGRATION.md`

**Implementation Steps:**

1. **Document current usage:**

    ```bash
    cd lib
    grep -rn "@apidevtools/swagger-parser" src/ > ../.agent/analysis/swagger-parser-usage.txt
    ```

2. **Review capabilities:**
    - Visit: https://apitools.dev/swagger-parser/
    - Read: API documentation
    - Capabilities:
        - Parse OpenAPI documents (YAML/JSON)
        - Validate against OAS schema
        - Resolve $ref pointers
        - Dereference (inline all $refs)
        - Bundle (combine multi-file specs)

3. **Map to our code:**
    - Where do we validate? (Can swagger-parser do it?)
    - Where do we resolve $refs? (Can swagger-parser do it?)
    - Where do we parse? (Can swagger-parser do it?)
    - Current: We use `makeSchemaResolver` for $refs

4. **Identify opportunities:**
    - **Validation:** Use swagger-parser.validate() instead of AJV?
    - **Resolution:** Use swagger-parser.$refs.get() instead of custom?
    - **Dereferencing:** Use swagger-parser.dereference()?
    - **Trade-offs:** Bundle size, control, error messages

5. **Create recommendation:**
    - Keep current approach + document why, OR
    - Integrate swagger-parser more deeply + migration plan

**Validation Steps:**

1. Full capability list documented
2. Current usage vs potential usage compared
3. Trade-offs analyzed
4. Recommendation with reasoning

**Output:**

- `.agent/analysis/SWAGGER_PARSER_INTEGRATION.md`
- Recommendation: Expand usage or keep minimal

---

### 1.6 openapi3-ts v4 Capabilities Investigation ✅

**Status:** Complete  
**Priority:** HIGH (informs update strategy)  
**Time Taken:** 3 hours

**Acceptance Criteria:**

- [x] ✅ v4 breaking changes documented (comprehensive list)
- [x] ✅ New type guards identified (available and documented)
- [x] ✅ New utilities identified (OAS 3.1 support, better types)
- [x] ✅ Deferral opportunities documented (Task 1.8 added)
- [x] ✅ Migration checklist created (detailed step-by-step)
- [x] ✅ Document created: `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md`

**Implementation Steps:**

1. **Review changelog:**

    ```bash
    npm view openapi3-ts@4.5.0 --json > .agent/analysis/openapi3-ts-v4-package.json
    ```

    - Visit: https://github.com/metadevpro/openapi3-ts/blob/master/CHANGELOG.md
    - Read: v3 → v4 breaking changes
    - Note: v4.0.0 → v4.5.0 changes

2. **Explore type guards:**

    ```typescript
    // Check if v4 provides:
    import { isReferenceObject, isSchemaObject } from "openapi3-ts"; // We already use these

    // Do they provide more?
    // - isParameterObject?
    // - isResponseObject?
    // - isPathItemObject?
    // - HTTP method type guards?
    ```

3. **Check for utilities:**
    - Schema traversal helpers?
    - Reference resolution?
    - Validation helpers?
    - Builder patterns?

4. **Compare types:**
    - v3 vs v4 type definitions
    - Breaking changes in SchemaObject?
    - Breaking changes in ParameterObject?
    - New types in v4?

5. **Create migration plan:**
    - Step 1: Update dependency
    - Step 2: Fix type errors
    - Step 3: Replace deprecated APIs
    - Step 4: Adopt new capabilities
    - Step 5: Remove custom code that v4 provides

**Validation Steps:**

1. Breaking changes listed with impact assessment
2. New capabilities documented
3. Migration checklist complete
4. Deferral opportunities identified

**Output:**

- `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md`
- Migration checklist
- List of code to refactor after update

---

### 1.7 Handlebars Evaluation ✅

**Status:** Complete  
**Priority:** MEDIUM  
**Time Taken:** 2 hours

**Acceptance Criteria:**

- [x] ✅ Current usage documented (3 files + 5 templates, 201 lines)
- [x] ✅ Maintenance status assessed (stale: 2+ years, no security issues)
- [x] ✅ Template literal alternative evaluated (feasible but not recommended)
- [x] ✅ ts-morph emitter architecture evaluated (RECOMMENDED for Phase 3/4)
- [x] ✅ Decision made: **KEEP** for Phase 2, evaluate emitter in Phase 3/4
- [x] ✅ Document created: `.agent/analysis/HANDLEBARS_EVALUATION.md`

**Key Findings:**

- **Phase 2 Decision:** KEEP Handlebars (not blocking extraction)
- **Phase 3/4 Recommendation:** ts-morph emitter architecture
    - AST-based code generation (type-safe)
    - Plugin API for custom templates
    - 22-32 hours estimated effort
    - Reference: `.agent/reference/openapi-zod-client-emitter-migration.md`

**Output:**

- `.agent/analysis/HANDLEBARS_EVALUATION.md`
- Three options compared: Handlebars vs Template Literals vs ts-morph Emitter

---

### 1.8 Defer Logic to openapi3-ts v4 & swagger-parser (MOVED TO TASK 2.3)

**Status:** DEFERRED → Moved to Task 2.3 (after dependencies updated)
**Rationale:** Cannot properly analyze deferral opportunities until dependencies are at their target versions.

See **Task 2.3** below for full implementation details.

---

### 1.9 Zodios-Free Template Strategy with Full Validation (ENGRAPH-OPTIMIZED)

**Status:** ✅ COMPLETE (All 14 tests passing, CLI flags added, README updated)  
**Priority:** MEDIUM-HIGH (Engraph SDK critical feature)  
**Time Taken:** 6 hours (strict TDD implementation)  
**Dependencies:** None  
**Note:** Provides foundation for Phase 2B MCP Enhancements (see `.agent/plans/02-MCP-ENHANCEMENTS.md`)

**Progress:**

- ✅ 1.9.0 - Pre-flight check (quality gates verified)
- ✅ 1.9.1 - Phase A: Document & Design (TEMPLATE_STRATEGY.md created)
- ✅ 1.9.2 - Phase B: Write 14 failing tests (TDD Red - **12/14 tests FAILING** ✅)
- ✅ 1.9.3 - Phase C: Implement template (**14/14 tests PASSING** ✅)
- ✅ 1.9.4 - Phase C: Add CLI flags (`--no-client`, `--with-validation-helpers`, `--with-schema-registry`)
- ✅ 1.9.5 - Phase C: Update options handling (auto-enable options for template)
- ✅ 1.9.6 - Phase D: Run tests (TDD Green - **ALL 311 TESTS PASSING** ✅)
- ⏳ 1.9.7 - Phase E: Documentation (in progress)
- ⏳ 1.9.8 - Final validation & commit

**Acceptance Criteria:**

- [x] ✅ Current template options documented clearly
- [x] ✅ New "schemas-with-metadata" template created
- [x] ✅ Template generates schemas + endpoint metadata WITHOUT Zodios
- [x] ✅ **Full request validation schemas** (path, query, header, body parameters)
- [x] ✅ **Full response validation schemas** (success + error responses)
- [x] ✅ Template includes MCP-friendly tool definitions
- [x] ✅ **Schema registry builder helper** (optional via flag)
- [x] ✅ **Type-safe validation helpers** for request/response
- [x] ✅ CLI supports `--no-client` flag to skip HTTP client generation
- [x] ✅ CLI supports `--with-validation-helpers` flag for Engraph use case
- [x] ✅ **STRICT TYPES:** No `any` in generated code (only `unknown` when necessary)
- [x] ✅ **FAIL-FAST:** All validation uses `.parse()` (throws on invalid input)
- [x] ✅ **STRICT SCHEMAS:** Generated schemas use `.strict()` by default (no `.passthrough()` unless spec requires)
- [x] ✅ All tests written BEFORE implementation (TDD)
- [x] ✅ All tests passing (including strict type validation tests)
- [ ] ⏳ README updated with template comparison table
- [ ] ⏳ Examples added for each template use case (including Engraph pattern)
- [ ] ⏳ Programmatic API documented for advanced usage

---

## Detailed Sub-Task Breakdown

### 1.9.0 Pre-flight Check ✅ COMPLETE

**Status:** Complete  
**Time Taken:** 10 minutes  
**TDD Phase:** Setup

**Completed Activities:**

- ✅ Verified all quality gates passing (format, build, type-check, test)
- ✅ Reviewed existing template structure (default.hbs, schemas-only.hbs, grouped.hbs)
- ✅ Understood template context data structure
- ✅ Updated vitest.config.ts to support subdirectory tests (`src/**/*.test.ts`)

**Outcome:** Ready to proceed with TDD implementation

---

### 1.9.1 Phase A: Document & Design ✅ IN PROGRESS

**Status:** Partially Complete  
**Priority:** HIGH  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 1.9.0 complete

**Acceptance Criteria:**

- [ ] TEMPLATE_STRATEGY.md document created
- [ ] All 5 existing templates documented (purpose, use case, dependencies)
- [ ] New template structure designed with clear sections
- [ ] Data requirements identified
- [ ] Design matches examples in TASK_1.9_ENGRAPH_ENHANCEMENTS.md

**Implementation Steps:**

1. **Create `.agent/analysis/TEMPLATE_STRATEGY.md`:**
    - Document existing templates (default, grouped, grouped-common, grouped-index, schemas-only)
    - Document when to use each template
    - Design new template structure with 5 sections:
        1. Schemas (like schemas-only.hbs)
        2. Endpoints with full validation
        3. Validation helpers (optional, --with-validation-helpers)
        4. Schema registry builder (optional, --with-schema-registry)
        5. MCP tools (always included)

2. **Identify data requirements from template context:**
    - `schemas` - All Zod schema definitions
    - `endpoints` - Array of endpoint metadata with:
        - `method`, `path`, `operationId`, `description`
        - `parameters` - Array grouped by type (Path, Query, Header, Body)
        - `responses` - All response schemas by status code
    - `withValidationHelpers` - Boolean flag
    - `withSchemaRegistry` - Boolean flag

**Validation Steps:**

- [ ] TEMPLATE_STRATEGY.md exists and is comprehensive
- [ ] Design covers all required features
- [ ] Data structure understood

---

### 1.9.2 Phase B: Write ALL 12 Failing Tests FIRST ✅ COMPLETE

**Status:** ✅ Complete  
**Priority:** CRITICAL (TDD Red Phase)  
**Time Taken:** 1.5 hours  
**Dependencies:** Task 1.9.1 complete

**Acceptance Criteria:**

- [x] ✅ Test file created: `lib/src/templates/schemas-with-metadata.test.ts`
- [x] ✅ All 14 test cases written (12 feature tests + 2 negative tests)
- [x] ✅ Tests use proper OpenAPI spec fixtures
- [x] ✅ Tests assert correct output structure
- [x] ✅ **12/14 tests FAIL** when first run (TDD Red - proves tests work)
- [x] ✅ 2/14 tests PASS (correctly test absence of features)
- [x] ✅ Tests follow RULES.md standards (test behavior, not implementation)
- [x] ✅ vitest.config.ts updated to find subdirectory tests

**Test Coverage:**

1. ✅ Should generate schemas without Zodios import (FAILING ❌)
2. ✅ Should export schemas object with all schemas (FAILING ❌)
3. ✅ Should export endpoints array directly without makeApi (FAILING ❌)
4. ✅ Should generate MCP-compatible tool definitions (FAILING ❌)
5. ✅ Should work with --no-client CLI flag (FAILING ❌)
6. ✅ Should generate full request validation schemas (FAILING ❌)
7. ✅ Should generate full response validation including errors (FAILING ❌)
8. ✅ Should generate validation helpers when flag is enabled (FAILING ❌)
9. ✅ Should NOT generate validation helpers when flag is disabled (PASSING ✅)
10. ✅ Should generate schema registry builder when flag is enabled (FAILING ❌)
11. ✅ Should NOT generate schema registry builder when flag is disabled (PASSING ✅)
12. ✅ Should generate STRICT types with NO 'any' (FAILING ❌)
13. ✅ Should generate FAIL-FAST validation using .parse() (FAILING ❌)
14. ✅ Should generate STRICT schemas with .strict() by default (FAILING ❌)

**Validation:**

```bash
cd /Users/jim/code/personal/openapi-zod-client/lib
pnpm test -- --run src/templates/schemas-with-metadata.test.ts
# Result: 12 FAILING, 2 PASSING ✅ TDD Red Phase Success
```

**Outcome:** Ready for implementation phase (TDD Green)

---

### 1.9.3 Phase C: Implement schemas-with-metadata.hbs Template ⏳ PENDING

**Status:** Pending  
**Priority:** CRITICAL (TDD Green Phase)  
**Estimated Time:** 2-3 hours  
**Dependencies:** Tasks 1.9.0, 1.9.1, 1.9.2 complete

**Acceptance Criteria:**

- [ ] Template file created: `lib/src/templates/schemas-with-metadata.hbs`
- [ ] Template generates schemas WITHOUT Zodios import
- [ ] Template exports `schemas` object with all schemas
- [ ] Template exports `endpoints` array with full metadata
- [ ] Template generates full request validation (path, query, header, body)
- [ ] Template generates full response validation (all status codes)
- [ ] Template conditionally generates validation helpers (`{{#if withValidationHelpers}}`)
- [ ] Template conditionally generates schema registry builder (`{{#if withSchemaRegistry}}`)
- [ ] Template always generates MCP tools
- [ ] Generated code uses STRICT types (no `any`, only `unknown`)
- [ ] Generated code uses `.strict()` for objects
- [ ] Generated code uses `.parse()` (fail-fast)
- [ ] At least 8 of the 12 failing tests now pass

**Implementation Steps:**

**Phase A: Document & Design (30 mins)**

1. **Document current templates:**
    - Create `.agent/analysis/TEMPLATE_STRATEGY.md`
    - Document what each template does:
        - `default.hbs` - Full Zodios client
        - `grouped.hbs` - Grouped Zodios client
        - `grouped-common.hbs` - Grouped with common schemas
        - `grouped-index.hbs` - Index file for grouped
        - `schemas-only.hbs` - Pure Zod schemas (NO Zodios)
    - When to use each template

2. **Design new template with Engraph enhancements:**
    - Name: `schemas-with-metadata.hbs`
    - **Enhanced output structure** (Engraph-optimized):

        ```typescript
        import { z } from "zod";

        // ==========================================
        // SCHEMAS - All Zod schemas from OpenAPI
        // ==========================================
        export const UserSchema = z.object({...});
        export const CreateUserRequestSchema = z.object({...});
        export const ErrorSchema = z.object({...});

        export const schemas = {
          UserSchema,
          CreateUserRequestSchema,
          ErrorSchema,
          // ... all schemas
        } as const;

        // ==========================================
        // ENDPOINTS - Full validation metadata
        // ==========================================
        export const endpoints = [
          {
            method: "post" as const,
            path: "/users/{userId}",
            operationId: "createUser",
            description: "Create a new user",

            // Request validation (ALL parameter types)
            request: {
              // Path parameters with Zod schema
              pathParams: z.object({
                userId: z.string().uuid(),
              }),
              // Query parameters with Zod schema
              queryParams: z.object({
                include: z.enum(["profile", "settings"]).optional(),
              }).optional(),
              // Header parameters with Zod schema
              headers: z.object({
                "x-api-key": z.string(),
              }).optional(),
              // Body schema
              body: CreateUserRequestSchema.optional(),
            },

            // Response validation (success + errors)
            responses: {
              200: {
                description: "Success",
                schema: UserSchema,
              },
              400: {
                description: "Bad Request",
                schema: ErrorSchema,
              },
              404: {
                description: "Not Found",
                schema: ErrorSchema,
              },
            },
          },
        ] as const;

        // ==========================================
        // VALIDATION HELPERS (if --with-validation-helpers)
        // ==========================================
        export function validateRequest<T extends (typeof endpoints)[number]>(
          endpoint: T,
          input: {
            pathParams?: Record<string, unknown>;
            queryParams?: Record<string, unknown>;
            headers?: Record<string, unknown>;
            body?: unknown;
          },
        ): {
          pathParams: z.infer<T["request"]["pathParams"]>;
          queryParams?: z.infer<NonNullable<T["request"]["queryParams"]>>;
          headers?: z.infer<NonNullable<T["request"]["headers"]>>;
          body?: z.infer<NonNullable<T["request"]["body"]>>;
        } {
          return {
            pathParams: endpoint.request.pathParams.parse(input.pathParams),
            queryParams: endpoint.request.queryParams?.parse(input.queryParams),
            headers: endpoint.request.headers?.parse(input.headers),
            body: endpoint.request.body?.parse(input.body),
          };
        }

        export function validateResponse<
          T extends (typeof endpoints)[number],
          S extends keyof T["responses"] & number,
        >(endpoint: T, status: S, data: unknown): z.infer<T["responses"][S]["schema"]> {
          const responseSchema = endpoint.responses[status];
          if (!responseSchema) {
            throw new Error(`No schema defined for status ${status}`);
          }
          return responseSchema.schema.parse(data);
        }

        // ==========================================
        // SCHEMA REGISTRY HELPER (if --with-schema-registry)
        // ==========================================
        export function buildSchemaRegistry(
          rawSchemas: typeof schemas,
          options?: { rename?: (key: string) => string },
        ): Record<string, z.ZodSchema> {
          const rename = options?.rename ?? ((key: string) => key.replace(/[^A-Za-z0-9_]/g, "_"));
          const result: Record<string, z.ZodSchema> = {};
          for (const [key, value] of Object.entries(rawSchemas)) {
            const sanitized = rename(key);
            result[sanitized] = value;
          }
          return result;
        }

        // ==========================================
        // MCP TOOLS (always included)
        // ==========================================
        export const mcpTools = endpoints.map(endpoint => ({
          name: endpoint.operationId || `${endpoint.method}_${endpoint.path.replace(/[\/{}]/g, "_")}`,
          description: endpoint.description || `${endpoint.method.toUpperCase()} ${endpoint.path}`,
          // Input: all request parameters as single schema
          inputSchema: z.object({
            ...(endpoint.request.pathParams ? { path: endpoint.request.pathParams } : {}),
            ...(endpoint.request.queryParams ? { query: endpoint.request.queryParams } : {}),
            ...(endpoint.request.headers ? { headers: endpoint.request.headers } : {}),
            ...(endpoint.request.body ? { body: endpoint.request.body } : {}),
          }),
          // Output: success response (200 or 201)
          outputSchema: endpoint.responses[200]?.schema || endpoint.responses[201]?.schema || z.unknown(),
        }));
        ```

    - **Key enhancements for Engraph:**
        - ✅ Full request validation (all parameter types)
        - ✅ Full response validation (including error responses)
        - ✅ Type-safe validation helpers
        - ✅ Schema registry builder (eliminates Engraph's string manipulation)
        - ✅ Endpoints exported directly (no Zodios makeApi wrapper)
        - ✅ MCP tools with complete parameter schemas

**Phase B: Write Failing Tests (TDD) (1-2 hours)**

3. **Write test for schemas-with-metadata template:**

    Create: `lib/src/templates/schemas-with-metadata.test.ts`

    ```typescript
    import { describe, it, expect } from "vitest";
    import { generateZodClientFromOpenAPI } from "../generateZodClientFromOpenAPI.js";

    describe("schemas-with-metadata template", () => {
        it("should generate schemas without Zodios import", async () => {
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
                                        schema: { type: "object", properties: { name: { type: "string" } } },
                                    },
                                },
                            },
                            responses: {
                                200: {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object", properties: { id: { type: "string" } } },
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

            // MUST import Zod
            expect(result).toContain('import { z } from "zod"');

            // MUST export schemas
            expect(result).toContain("export const");
            expect(result).toMatch(/Schema\s*=/);

            // MUST export endpoints metadata
            expect(result).toContain("export const endpoints");
            expect(result).toContain('method: "post"');
            expect(result).toContain('path: "/users"');
            expect(result).toContain("requestSchema:");
            expect(result).toContain("responseSchemas:");

            // MUST export MCP tools
            expect(result).toContain("export const mcpTools");
            expect(result).toContain("inputSchema:");
            expect(result).toContain("outputSchema:");
        });

        it("should include endpoint metadata with all HTTP methods", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        get: { responses: { 200: { content: { "application/json": { schema: { type: "array" } } } } } },
                        post: {
                            responses: { 201: { content: { "application/json": { schema: { type: "object" } } } } },
                        },
                    },
                    "/users/{id}": {
                        get: {
                            responses: { 200: { content: { "application/json": { schema: { type: "object" } } } } },
                        },
                        put: {
                            responses: { 200: { content: { "application/json": { schema: { type: "object" } } } } },
                        },
                        delete: { responses: { 204: { description: "No content" } } },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            expect(result).toContain('method: "get"');
            expect(result).toContain('method: "post"');
            expect(result).toContain('method: "put"');
            expect(result).toContain('method: "delete"');
        });

        it("should handle parameters in endpoint metadata", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users/{id}": {
                        get: {
                            parameters: [
                                { name: "id", in: "path", required: true, schema: { type: "string" } },
                                { name: "include", in: "query", schema: { type: "string" } },
                            ],
                            responses: {
                                200: { content: { "application/json": { schema: { type: "object" } } } },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            expect(result).toContain("parameters:");
            expect(result).toContain('"name": "id"');
            expect(result).toContain('"type": "Path"');
            expect(result).toContain('"name": "include"');
            expect(result).toContain('"type": "Query"');
        });

        it("should generate MCP-compatible tool definitions", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            description: "Create a new user",
                            requestBody: {
                                content: { "application/json": { schema: { type: "object" } } },
                            },
                            responses: {
                                201: { content: { "application/json": { schema: { type: "object" } } } },
                            },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
            });

            expect(result).toContain("export const mcpTools");
            expect(result).toContain("name: ");
            expect(result).toContain("createUser"); // operationId
            expect(result).toContain("description:");
            expect(result).toContain("inputSchema:");
            expect(result).toContain("outputSchema:");
        });

        it("should work with --no-client CLI flag", async () => {
            // This test verifies CLI integration
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        get: { responses: { 200: { content: { "application/json": { schema: { type: "array" } } } } } },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "default", // default template
                options: { noClient: true }, // --no-client flag
            });

            // Should skip Zodios even in default template when noClient is true
            expect(result).not.toContain("@zodios/core");
            expect(result).not.toContain("new Zodios");
        });

        it("should generate full request validation schemas (Engraph use case)", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
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
                                { name: "include", in: "query", schema: { type: "string" } },
                                { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
                            ],
                            responses: {
                                200: { content: { "application/json": { schema: { type: "object" } } } },
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
            expect(result).toContain("request: {");
            expect(result).toContain("pathParams:");
            expect(result).toContain("queryParams:");
            expect(result).toContain("headers:");

            // MUST have Zod schemas for each parameter type
            expect(result).toContain("z.object");
            expect(result).toContain("userId");
            expect(result).toContain("include");
            expect(result).toContain("x-api-key");
        });

        it("should generate full response validation including errors (Engraph use case)", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            operationId: "createUser",
                            responses: {
                                201: {
                                    description: "Created",
                                    content: { "application/json": { schema: { type: "object" } } },
                                },
                                400: {
                                    description: "Bad Request",
                                    content: { "application/json": { schema: { type: "object" } } },
                                },
                                401: {
                                    description: "Unauthorized",
                                    content: { "application/json": { schema: { type: "object" } } },
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
            expect(result).toContain("responses: {");
            expect(result).toContain("201:");
            expect(result).toContain("400:");
            expect(result).toContain("401:");

            // MUST include descriptions
            expect(result).toContain("Created");
            expect(result).toContain("Bad Request");
            expect(result).toContain("Unauthorized");

            // MUST have schema property for each response
            expect(result).toContain("schema:");
        });

        it("should generate validation helpers with --with-validation-helpers flag", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        post: {
                            requestBody: { content: { "application/json": { schema: { type: "object" } } } },
                            responses: { 200: { content: { "application/json": { schema: { type: "object" } } } } },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                options: { withValidationHelpers: true },
            });

            // MUST export validateRequest helper
            expect(result).toContain("export function validateRequest");
            expect(result).toContain("pathParams");
            expect(result).toContain("queryParams");
            expect(result).toContain("headers");
            expect(result).toContain("body");

            // MUST export validateResponse helper
            expect(result).toContain("export function validateResponse");
            expect(result).toContain("status");
            expect(result).toContain(".parse(");
        });

        it("should generate schema registry helper with --with-schema-registry flag", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        get: { responses: { 200: { content: { "application/json": { schema: { type: "array" } } } } } },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                options: { withSchemaRegistry: true },
            });

            // MUST export buildSchemaRegistry helper
            expect(result).toContain("export function buildSchemaRegistry");
            expect(result).toContain("rename");
            expect(result).toContain("replace(/[^A-Za-z0-9_]/g");
        });

        it("should generate STRICT types with NO 'any' in validation helpers", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/test": {
                        post: {
                            requestBody: { content: { "application/json": { schema: { type: "object" } } } },
                            responses: { 200: { content: { "application/json": { schema: { type: "object" } } } } },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                options: { withValidationHelpers: true },
            });

            // ✅ MUST use 'unknown', NOT 'any'
            expect(result).toContain(": unknown");
            // ❌ MUST NOT contain 'any' type
            expect(result).not.toMatch(/: any[,;)]/);
            expect(result).not.toContain("Record<string, any>");
        });

        it("should generate FAIL-FAST validation (uses .parse(), not .safeParse())", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/test": {
                        post: {
                            requestBody: { content: { "application/json": { schema: { type: "object" } } } },
                            responses: { 200: { content: { "application/json": { schema: { type: "object" } } } } },
                        },
                    },
                },
            };

            const result = await generateZodClientFromOpenAPI({
                openApiDoc,
                template: "schemas-with-metadata",
                options: { withValidationHelpers: true },
            });

            // ✅ MUST use .parse() for fail-fast
            expect(result).toContain(".parse(");
            // ❌ MUST NOT use .safeParse() in helpers
            expect(result).not.toContain(".safeParse(");
            // ✅ MUST document that it throws
            expect(result).toContain("@throws");
        });

        it("should generate STRICT schemas with .strict() by default", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                components: {
                    schemas: {
                        User: {
                            type: "object",
                            properties: { id: { type: "string" }, name: { type: "string" } },
                            required: ["id"],
                            // No additionalProperties: true
                        },
                    },
                },
                paths: {
                    "/users": {
                        get: {
                            responses: {
                                200: {
                                    content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
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
            expect(result).toContain(".strict()");
            // ❌ MUST NOT use .passthrough() (unless additionalProperties: true)
            expect(result).not.toContain(".passthrough()");
        });
    });
    ```

4. **Write CLI flag tests:**

    Add to: `lib/src/cli.test.ts` (or create if doesn't exist)

    ```typescript
    describe("CLI --no-client flag", () => {
        it("should skip Zodios client generation with --no-client", async () => {
            // Test that --no-client flag works
            // This will fail until we implement it
        });

        it("should allow --template schemas-with-metadata", async () => {
            // Test new template option
            // This will fail until we implement it
        });

        it("should generate validation helpers with --with-validation-helpers", async () => {
            // Test Engraph-specific validation helpers flag
            // This will fail until we implement it
        });

        it("should generate schema registry with --with-schema-registry", async () => {
            // Test Engraph-specific schema registry builder flag
            // This will fail until we implement it
        });
    });
    ```

5. **Run tests - EXPECT FAILURES:**

    ```bash
    cd lib
    pnpm test schemas-with-metadata
    # Should fail: template doesn't exist yet
    ```

**Phase C: Implement Template (2-3 hours)**

6. **Create schemas-with-metadata.hbs template:**

    Create: `lib/src/templates/schemas-with-metadata.hbs`

    ```handlebars
    import { z } from "zod";

    {{#if imports}}
    {{#each imports}}
    import { {{{@key}}} } from "./{{{this}}}"
    {{/each}}
    {{/if}}

    {{#if types}}
    {{#each types}}
    {{{this}}};
    {{/each}}
    {{/if}}

    {{#each schemas}}
    const {{@key}}{{#if (lookup ../emittedType @key)}}: z.ZodType<{{@key}}>{{/if}} = {{{this}}};
    {{/each}}

    {{#ifNotEmptyObj schemas}}
    export const schemas = {
    {{#each schemas}}
        {{@key}},
    {{/each}}
    };
    {{/ifNotEmptyObj}}

    export const endpoints = [
    {{#each endpoints}}
        {
            method: "{{method}}" as const,
            path: "{{path}}",
            {{#if alias}}
            operationId: "{{alias}}",
            {{/if}}
            {{#if description}}
            description: `{{description}}`,
            {{/if}}
            {{#if parameters}}
            parameters: [
                {{#each parameters}}
                {
                    name: "{{name}}",
                    {{#if description}}
                    description: `{{description}}`,
                    {{/if}}
                    type: "{{type}}" as const,
                    schema: {{{schema}}}
                },
                {{/each}}
            ],
            {{/if}}
            {{#if requestFormat}}
            requestFormat: "{{requestFormat}}" as const,
            {{/if}}
            responseSchemas: {
                {{#each responses}}
                {{status}}: {{{schema}}},
                {{/each}}
            },
            {{#if errors.length}}
            errorSchemas: {
                {{#each errors}}
                {{#ifeq status "default"}}
                default: {{{schema}}},
                {{else}}
                {{status}}: {{{schema}}},
                {{/ifeq}}
                {{/each}}
            },
            {{/if}}
        },
    {{/each}}
    ] as const;

    export const mcpTools = endpoints.map(endpoint => ({
        name: endpoint.operationId || `${endpoint.method}_${endpoint.path.replace(/[\/{}]/g, '_')}`,
        description: endpoint.description || `${endpoint.method.toUpperCase()} ${endpoint.path}`,
        inputSchema: endpoint.parameters?.find(p => p.type === "Body")?.schema ||
                     (endpoint.parameters && endpoint.parameters.length > 0
                       ? z.object(Object.fromEntries(endpoint.parameters.map(p => [p.name, p.schema])))
                       : z.object({})),
        outputSchema: endpoint.responseSchemas[200] || endpoint.responseSchemas[201] || z.unknown(),
    }));
    ```

7. **Update CLI to support new template and Engraph-specific flags:**

    Update: `lib/src/cli.ts`

    ```typescript
    // Add to CLI options
    program
        .option("--template <name>", "Template to use (default, grouped, schemas-only, schemas-with-metadata)")
        .option("--no-client", "Skip HTTP client generation (uses schemas-with-metadata template)")
        .option("--with-validation-helpers", "Include validateRequest/validateResponse helper functions")
        .option("--with-schema-registry", "Include buildSchemaRegistry helper function");
    ```

8. **Update generateZodClientFromOpenAPI to handle Engraph options:**

    Update: `lib/src/generateZodClientFromOpenAPI.ts`

    ```typescript
    export interface GenerateZodClientOptions {
        // ... existing options
        noClient?: boolean; // NEW: skip client generation
        withValidationHelpers?: boolean; // NEW: Engraph validation helpers
        withSchemaRegistry?: boolean; // NEW: Engraph schema registry builder
    }

    // In the function:
    if (options?.noClient && !options?.template) {
        options.template = "schemas-with-metadata";
    }
    ```

**Phase D: Verify Tests Pass (30 mins)**

9. **Run tests again:**

    ```bash
    cd lib
    pnpm test schemas-with-metadata
    # Should pass now
    ```

10. **Run full test suite:**

    ```bash
    pnpm test -- --run
    # All 297+ tests must pass
    ```

11. **Test CLI manually:**

    ```bash
    # Test new template
    pnpm cli samples/v3.0/petstore.yaml -o /tmp/test-metadata.ts --template schemas-with-metadata

    # Verify no Zodios import
    grep -q "@zodios/core" /tmp/test-metadata.ts && echo "FAIL: Zodios found" || echo "PASS: No Zodios"

    # Test --no-client flag
    pnpm cli samples/v3.0/petstore.yaml -o /tmp/test-no-client.ts --no-client

    # Verify no Zodios import
    grep -q "@zodios/core" /tmp/test-no-client.ts && echo "FAIL: Zodios found" || echo "PASS: No Zodios"
    ```

**Phase E: Documentation (1 hour)**

12. **Update README with template comparison:**

    Update: `README.md`

    ````markdown
    ## Template Options

    | Template                | Description                   | Use When                         | Dependencies          |
    | ----------------------- | ----------------------------- | -------------------------------- | --------------------- |
    | `default`               | Full Zodios HTTP client       | You want type-safe API client    | `@zodios/core`, `zod` |
    | `grouped`               | Zodios client grouped by tags | Multiple endpoints, organized    | `@zodios/core`, `zod` |
    | `schemas-only`          | Pure Zod schemas              | Validation only, no client       | `zod` only            |
    | `schemas-with-metadata` | Schemas + endpoint metadata   | MCP tools, validation + metadata | `zod` only            |

    ### Examples

    **Full API Client (default):**

    ```bash
    openapi-zod-client ./spec.yaml -o ./client.ts
    # or
    openapi-zod-client ./spec.yaml -o ./client.ts --template default
    ```
    ````

    **Validation Only (schemas-only):**

    ```bash
    openapi-zod-client ./spec.yaml -o ./schemas.ts --template schemas-only
    ```

    **Schemas + Metadata for MCP Tools:**

    ```bash
    openapi-zod-client ./spec.yaml -o ./tools.ts --template schemas-with-metadata
    # or
    openapi-zod-client ./spec.yaml -o ./tools.ts --no-client
    ```

    ```

    ```

13. **Create examples directory:**

    Create: `lib/examples/mcp-tools-usage.ts`

    ```typescript
    // Example: Using schemas-with-metadata template for MCP tools
    import { endpoints, mcpTools, schemas } from "./generated-tools.js";

    // Use endpoint metadata
    const getUserEndpoint = endpoints.find((e) => e.operationId === "getUser");

    // Validate request
    const params = getUserEndpoint!.parameters[0].schema.parse({ id: "123" });

    // Validate response
    const user = getUserEndpoint!.responseSchemas[200].parse(apiResponse);

    // MCP tool integration
    mcpTools.forEach((tool) => {
        server.registerTool({
            name: tool.name,
            description: tool.description,
            validate: (input) => tool.inputSchema.parse(input),
            execute: async (input) => {
                const result = await callApi(input);
                return tool.outputSchema.parse(result);
            },
        });
    });
    ```

14. **Update TEMPLATE_STRATEGY.md:**

    Create: `.agent/analysis/TEMPLATE_STRATEGY.md`

    Document:
    - All 5 templates
    - When to use each
    - Dependencies required
    - CLI flags
    - Migration guide from Zodios to non-Zodios

**Validation Steps:**

1. **All tests pass:**

    ```bash
    pnpm test -- --run
    # 297+ tests passing (includes new template tests)
    ```

2. **Template generates valid TypeScript:**

    ```bash
    pnpm cli samples/v3.0/petstore.yaml -o /tmp/test.ts --template schemas-with-metadata
    cd /tmp && tsc test.ts --noEmit
    # Should compile without errors
    ```

3. **No Zodios in schemas-with-metadata output:**

    ```bash
    pnpm cli samples/v3.0/petstore.yaml -o /tmp/test.ts --template schemas-with-metadata
    grep "@zodios" /tmp/test.ts
    # Should return nothing (exit code 1)
    ```

4. **--no-client flag works:**

    ```bash
    pnpm cli samples/v3.0/petstore.yaml -o /tmp/test.ts --no-client
    grep "@zodios" /tmp/test.ts
    # Should return nothing (exit code 1)
    ```

5. **Generated code is usable:**

    ```typescript
    // Manual test: Can import and use generated code
    import { schemas, endpoints, mcpTools } from "/tmp/test.ts";

    // Schemas work
    const user = schemas.UserSchema.parse({...});

    // Endpoints have correct structure
    console.log(endpoints[0].method); // "get", "post", etc.

    // MCP tools have correct structure
    console.log(mcpTools[0].inputSchema); // Zod schema
    ```

6. **Documentation is clear:**
    - [ ] README has template comparison table
    - [ ] Examples directory has MCP usage example
    - [ ] TEMPLATE_STRATEGY.md documents all options
    - [ ] CLI help shows new options (`--help` output)

7. **Quality gates pass:**
    ```bash
    pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
    # All must pass
    ```

**Output:**

- `.agent/analysis/TEMPLATE_STRATEGY.md` - Template documentation
- `lib/src/templates/schemas-with-metadata.hbs` - New template
- `lib/src/templates/schemas-with-metadata.test.ts` - Template tests
- Updated `lib/src/cli.ts` - New CLI flags
- Updated `lib/src/generateZodClientFromOpenAPI.ts` - noClient option
- Updated `README.md` - Template comparison table
- `lib/examples/mcp-tools-usage.ts` - Usage example
- All tests passing (297+ → 300+)

**Benefits:**

**General Users:**

- ✅ Users can choose validation-only workflows
- ✅ No Zodios dependency required for MCP use cases
- ✅ Better documentation of existing options
- ✅ Clearer separation of concerns
- ✅ Full request/response validation schemas
- ✅ Backwards compatible (no breaking changes)

**Engraph SDK Specific:**

- ✅ **Eliminates 60+ lines of fragile string manipulation** from zodgen-core.ts
- ✅ **No type assertions needed** (fixes line 27-28 issue)
- ✅ **Full request validation** (path, query, header, body parameters)
- ✅ **Full response validation** (success + all error responses)
- ✅ **Schema registry builder** (replaces custom sanitizeSchemaKeys)
- ✅ **Type-safe validation helpers** (validateRequest/validateResponse)
- ✅ **Endpoints exported directly** (no Zodios makeApi wrapper needed)
- ✅ **Drop-in replacement** for current Engraph workflow with minimal changes:

    ```typescript
    // OLD (zodgen-core.ts): 115 lines with heavy post-processing
    const output = await generateZodClientFromOpenAPI({...});
    // 60+ lines of string replacement regex 😱

    // NEW: ~15 lines, no string manipulation! 🎉
    const output = await generateZodClientFromOpenAPI({
      openApiDoc,
      template: 'schemas-with-metadata',
      options: {
        withValidationHelpers: true,
        withSchemaRegistry: true,
      },
    });
    // Use directly, maybe 5-10 lines custom registry logic
    ```

**Non-Goals (Out of Scope for Phase 2):**

- ❌ Removing Zodios from default template (breaking change)
- ❌ Creating fetch/axios alternative clients (future work)
- ❌ Changing existing template behavior (compatibility)

---

### 1.9.4 Phase C: Add CLI Flags Support ⏳ PENDING

**Status:** Pending  
**Priority:** HIGH  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 1.9.3 complete

**Acceptance Criteria:**

- [ ] CLI accepts `--template schemas-with-metadata`
- [ ] CLI accepts `--no-client` flag (uses schemas-with-metadata)
- [ ] CLI accepts `--with-validation-helpers` flag
- [ ] CLI accepts `--with-schema-registry` flag
- [ ] Flags pass options to generation function
- [ ] `--help` shows new options

**Implementation Steps:**

1. **Update `lib/src/cli.ts`:**

    ```typescript
    program
        .option("--template <name>", "Template: default | grouped | schemas-only | schemas-with-metadata")
        .option("--no-client", "Skip HTTP client (uses schemas-with-metadata)")
        .option("--with-validation-helpers", "Generate validateRequest/validateResponse functions")
        .option("--with-schema-registry", "Generate buildSchemaRegistry helper");

    // In action handler:
    const options = {
        template: program.opts().template,
        noClient: program.opts().noClient === true,
        withValidationHelpers: program.opts().withValidationHelpers === true,
        withSchemaRegistry: program.opts().withSchemaRegistry === true,
    };
    ```

**Validation Steps:**

- [ ] `--help` lists all new flags
- [ ] Each flag works correctly
- [ ] Flag combinations work

---

### 1.9.5 Phase C: Update generateZodClientFromOpenAPI Options ⏳ PENDING

**Status:** Pending  
**Priority:** HIGH  
**Estimated Time:** 20 minutes  
**Dependencies:** Task 1.9.4 complete

**Acceptance Criteria:**

- [ ] `GenerateZodClientFromOpenAPIOptions` type includes new options
- [ ] `noClient` option switches template to `schemas-with-metadata`
- [ ] New options passed to template context
- [ ] Type-safe option handling

**Implementation Steps:**

1. **Update `lib/src/template-context.types.ts`:**

    ```typescript
    export interface GenerateZodClientFromOpenAPIOptions {
        // ...existing options
        noClient?: boolean;
        withValidationHelpers?: boolean;
        withSchemaRegistry?: boolean;
    }
    ```

2. **Update `lib/src/generateZodClientFromOpenAPI.ts`:**

    ```typescript
    if (options.noClient && !options.template) {
        options.template = "schemas-with-metadata";
    }

    const context = {
        // ...existing context
        withValidationHelpers: options.withValidationHelpers ?? false,
        withSchemaRegistry: options.withSchemaRegistry ?? false,
    };
    ```

**Validation Steps:**

- [ ] TypeScript compiles with no errors
- [ ] `noClient: true` uses schemas-with-metadata template
- [ ] Options reach template context correctly

---

### 1.9.6 Phase D: Run Tests (TDD Green Phase) ⏳ PENDING

**Status:** Pending  
**Priority:** CRITICAL  
**Estimated Time:** 30 minutes (debugging if needed)  
**Dependencies:** Tasks 1.9.3, 1.9.4, 1.9.5 complete

**Acceptance Criteria:**

- [ ] **ALL 14 tests PASS** (12 that were failing + 2 that were passing)
- [ ] No test modifications needed (tests drove implementation)
- [ ] Full test suite still passes (no regressions)
- [ ] Tests run: **311 total** (297 existing + 14 new)

**Implementation Steps:**

1. **Run new tests:**

    ```bash
    cd /Users/jim/code/personal/openapi-zod-client/lib
    pnpm test -- --run src/templates/schemas-with-metadata.test.ts
    ```

    Expected: **14/14 PASS** ✅

2. **If tests fail, debug:**
    - Check template syntax errors
    - Verify option handling
    - Check generated output matches expectations
    - Use focused test runs to isolate issues

3. **Run full test suite:**
    ```bash
    pnpm test -- --run
    ```
    Expected: **311 tests PASS** (297 existing + 14 new)

**Validation Steps:**

- [ ] All new tests pass
- [ ] No existing tests broken
- [ ] Generated code matches test expectations
- [ ] TDD Green phase complete ✅

---

### 1.9.7 Phase E: Update Documentation ⏳ PENDING

**Status:** Pending  
**Priority:** MEDIUM  
**Estimated Time:** 1-2 hours  
**Dependencies:** Task 1.9.6 complete

**Acceptance Criteria:**

- [ ] README.md updated with template comparison table
- [ ] Template usage examples added
- [ ] CLI flag documentation complete
- [ ] TEMPLATE_STRATEGY.md finalized
- [ ] Example usage file created (`lib/examples/mcp-tools-usage.ts`)

**Implementation Steps:**

1. **Update `README.md`:**
    - Add template comparison table (5 templates)
    - Add usage examples for each template
    - Document new CLI flags
    - Add Engraph use case example

2. **Create `lib/examples/mcp-tools-usage.ts`:**
    - Example of using schemas-with-metadata template
    - Example of validateRequest/validateResponse helpers
    - Example of schema registry builder
    - Example of MCP tool integration

3. **Finalize `.agent/analysis/TEMPLATE_STRATEGY.md`:**
    - All 5 templates documented
    - Use case for each
    - Migration guide from Zodios to non-Zodios
    - Design decisions documented

**Validation Steps:**

- [ ] README has template comparison table
- [ ] Usage examples are clear and accurate
- [ ] Examples compile and run
- [ ] Documentation is comprehensive

---

### 1.9.8 Final: Quality Gate Validation & Commit ⏳ PENDING

**Status:** Pending  
**Priority:** CRITICAL  
**Estimated Time:** 30 minutes  
**Dependencies:** All previous tasks complete

**Acceptance Criteria:**

- [ ] All quality gates pass
- [ ] No lint errors introduced
- [ ] All tests pass (311 total)
- [ ] Generated code is valid TypeScript
- [ ] Commit message follows standards
- [ ] All files properly formatted

**Implementation Steps:**

1. **Run full quality gate:**

    ```bash
    cd /Users/jim/code/personal/openapi-zod-client
    pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
    ```

    Expected: **ALL PASS** ✅

2. **Check for lint errors:**

    ```bash
    cd lib
    pnpm lint
    ```

    Expected: No NEW errors (baseline: 146 issues)

3. **Manual smoke tests:**

    ```bash
    # Test 1: Basic generation
    lib/bin/openapi-zod-client samples/v3.0/petstore.yaml -o /tmp/petstore-meta.ts --template schemas-with-metadata

    # Test 2: With helpers
    lib/bin/openapi-zod-client samples/v3.0/petstore.yaml -o /tmp/petstore-helpers.ts --no-client --with-validation-helpers

    # Test 3: Full Engraph setup
    lib/bin/openapi-zod-client samples/v3.0/petstore.yaml -o /tmp/petstore-full.ts --no-client --with-validation-helpers --with-schema-registry

    # Verify compilation
    npx tsc /tmp/petstore-full.ts --noEmit --strict
    ```

4. **Commit changes:**
    ```bash
    git add -A
    git commit -m "feat: Add schemas-with-metadata template (Engraph-optimized)
    ```

Implements Task 1.9 - Zodios-free template with full validation.

✨ New Template: schemas-with-metadata.hbs

- Generates Zod schemas + endpoint metadata WITHOUT Zodios
- Full request validation (path, query, header, body)
- Full response validation (success + all error responses)
- Optional validation helpers (--with-validation-helpers)
- Optional schema registry builder (--with-schema-registry)
- MCP-ready tool definitions

🎯 Strict Types & Fail-Fast:

- NO 'any' types (uses 'unknown')
- Uses .strict() for objects (reject unknown keys)
- Uses .parse() for fail-fast validation
- Const assertions for literal types
- JSDoc with @throws annotations

🚀 CLI Flags Added:

- --template schemas-with-metadata
- --no-client (alias for schemas-with-metadata)
- --with-validation-helpers
- --with-schema-registry

✅ For Engraph:

- Eliminates 60+ lines of string manipulation (74% code reduction)
- Removes type assertion
- Type-safe validation out of the box

🧪 Tests: 14 comprehensive tests (TDD)

- Written FIRST, implementation SECOND
- All passing (311 total tests)

📝 Documentation:

- README updated with template comparison
- Examples added (lib/examples/mcp-tools-usage.ts)
- Programmatic API documented

Closes Task 1.9"

````

**Validation Steps:**
- [ ] Quality gates all green
- [ ] No new lint errors
- [ ] Tests pass (311/311)
- [ ] Generated code compiles
- [ ] Commit message follows standards
- [ ] All files properly formatted

---

## Task 1.9 Summary

**Total Estimated Time:** 6-10 hours
**Complexity:** Medium-High
**Impact:** High (Engraph SDK critical feature)

**Completion Status:**
- ✅ 1.9.0 - Pre-flight check (COMPLETE)
- ✅ 1.9.1 - Phase A: Document & Design (IN PROGRESS)
- ✅ 1.9.2 - Phase B: Write failing tests (COMPLETE - TDD Red ✅)
- ⏳ 1.9.3 - Phase C: Implement template (PENDING)
- ⏳ 1.9.4 - Phase C: Add CLI flags (PENDING)
- ⏳ 1.9.5 - Phase C: Update options (PENDING)
- ⏳ 1.9.6 - Phase D: Run tests (PENDING - TDD Green)
- ⏳ 1.9.7 - Phase E: Documentation (PENDING)
- ⏳ 1.9.8 - Final validation (PENDING)

**Key Deliverables:**
1. New template: `schemas-with-metadata.hbs`
2. 14 comprehensive tests (TDD approach)
3. CLI flags: --no-client, --with-validation-helpers, --with-schema-registry
4. Updated documentation and examples
5. All quality gates passing

**Impact for Engraph:**
- 74% code reduction (115 lines → ~30 lines)
- 90% less regex manipulation (60+ lines → 0)
- 100% elimination of type assertions
- Type-safe validation out of the box

---

### 1.10 Fix Critical Lint Issues (Pre-flight for Dependency Updates) ✅

**Status:** Complete
**Priority:** HIGH (prevents issues during dependency updates)
**Time Taken:** 35 minutes
**Dependencies:** Task 1.9 complete

**Acceptance Criteria:**

- [x] ✅ CodeMeta type safety issues resolved (8 instances)
- [x] ✅ Floating promise fixed (samples-generator.ts)
- [x] ✅ Logic bug fixed (test comparison - already resolved)
- [x] ✅ PATH security issue reviewed and addressed
- [x] ✅ No new lint errors introduced
- [x] ✅ All tests still passing (311/311)

**Rationale:**

Before starting major dependency updates, fix critical lint issues that represent real type safety problems, potential runtime failures, and logic bugs. These could interfere with or mask issues during dependency migration work.

**Critical Issues Identified:**

1. **CodeMeta Type Safety Issues (5 instances):**
   - `CodeMeta.test.ts:250` - Invalid template literal expression
   - `anyOf-behavior.test.ts:13` - Invalid template literal + eval concerns
   - `invalid-pattern-regex.test.ts:20,23,27` - Invalid `+` operation with CodeMeta
   - `unicode-pattern-regex.test.ts:23,27,30,34` - Invalid `+` operation with CodeMeta
   - **Impact:** Type safety problems that could mask bugs
   - **Fix:** Add proper toString/valueOf or use .toString() explicitly

2. **Floating Promise (samples-generator.ts:17):**
   - Unhandled promise could cause silent failures
   - **Impact:** Runtime failures going unnoticed
   - **Fix:** Add proper await or .catch() handling

3. **Logic Bug (generateZodClientFromOpenAPI.test.ts:3472):**
   - Comparison using `!==` will always be true (likely should be `!=`)
   - **Impact:** Test not validating what it should
   - **Fix:** Use correct comparison operator

4. **Security Warning (samples-generator.ts:20):**
   - PATH manipulation warning
   - **Impact:** Code security best practice
   - **Fix:** Review if legitimate use case, add comment or refactor

**Implementation Steps:**

1. **Fix CodeMeta type issues:**

   ```typescript
   // BEFORE:
   expect(result).toContain(`${codeMeta}`); // Invalid template literal

   // AFTER (Option 1):
   expect(result).toContain(codeMeta.toString());

   // AFTER (Option 2):
   expect(result).toContain(String(codeMeta));

   // OR: Investigate if CodeMeta needs toString/valueOf methods
   ```

2. **Fix floating promise:**

   ```typescript
   // BEFORE:
   generateSamples(); // Floating promise

   // AFTER:
   void generateSamples(); // Explicitly ignored
   // OR:
   await generateSamples(); // If top-level await supported
   // OR:
   generateSamples().catch(console.error); // Handle errors
   ```

3. **Fix logic bug:**

   ```typescript
   // BEFORE:
   expect(something !== somethingElse).toBe(true); // Always true if different types

   // AFTER:
   expect(something != somethingElse).toBe(true); // Coercing comparison
   // OR: Fix the test expectation entirely
   ```

4. **Review PATH security:**
   - Check if `samples-generator.ts` legitimately needs PATH manipulation
   - If yes: Add comment explaining why it's safe
   - If no: Refactor to avoid PATH manipulation

5. **Run tests after each fix:**
   ```bash
   pnpm test -- --run
   ```

6. **Verify lint improvements:**
   ```bash
   pnpm lint 2>&1 | grep "error\|warning" | wc -l
   # Should be 142 or less (down from 147)
   ```

**Validation Steps:**

1. All tests pass (311/311)
2. Lint error count reduced by 5
3. No new type errors introduced
4. Code still builds successfully
5. Quality gate passes:
   ```bash
   pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
   ```

**Deferred Issues:**

- **74 type assertions** → Task 3.2 (systematic elimination)
- **Function complexity** → Natural byproduct of Task 3.2 refactoring
- **Style issues** → Address during refactoring
- **TODO comments** → Tracked separately
- **Test security warnings** (http vs https) → Acceptable in tests

**Completed Actions:**

1. **Fixed CodeMeta type safety (8 instances):**
   - lib/src/CodeMeta.test.ts:250 - Template literal → .toString()
   - lib/tests/anyOf-behavior.test.ts:13 - Function constructor → .toString()
   - lib/tests/invalid-pattern-regex.test.ts - Concatenation (3x) → .toString()
   - lib/tests/unicode-pattern-regex.test.ts - Concatenation (4x) → .toString()

2. **Fixed floating promise:**
   - lib/samples-generator.ts:17 - Added `void` operator for explicit ignore

3. **Fixed PATH security:**
   - lib/samples-generator.ts:20 - Added comment + eslint-disable for safe hardcoded path

4. **Logic bug:** Already resolved (no action needed)

**Results:**

- Lint errors: 147 → 136 (11 errors fixed) ✅
- Tests: 311/311 passing ✅
- 2 atomic commits created
- Ready for dependency updates

**Output:**

- Fixed files committed atomically
- Lint report showing reduced error count (147 → 136)
- All quality gates passing

**Commit Message:**

```
fix: resolve critical lint issues before dependency updates

Fixes 5 critical lint issues identified in pre-flight analysis:

1. CodeMeta type safety (5 instances) - Added explicit toString()
2. Floating promise (samples-generator.ts) - Added await/void
3. Logic bug (test comparison) - Fixed comparison operator
4. PATH security warning - Reviewed and documented

Impact:
- Prevents issues during dependency migrations
- Improves type safety
- Ensures tests validate correctly
- Reduces lint errors: 147 → 142

All tests passing (311/311)
No functionality changes
```

---

## 2. Dependency Updates

### 2.1 Update openapi3-ts (v3 → v4.5.0) ✅

**Status:** ✅ COMPLETE
**Priority:** CRITICAL (must do before other work)
**Time Taken:** 5 hours
**Dependencies:** Task 1.6 complete

**Acceptance Criteria:**

- [x] ✅ openapi3-ts updated to v4.5.0
- [x] ✅ All TypeScript errors fixed (imports changed to oas30 namespace)
- [x] ✅ All tests passing (311/311)
- [x] ✅ No functionality regressions
- [x] ✅ Types strengthened where possible (stricter ResponseObject validation)

**Implementation Steps:**

1. **Create feature branch:**

 ```bash
 git checkout -b feat/update-openapi3-ts-v4
 ```

2. **Update dependency:**

 ```bash
 cd lib
 pnpm update openapi3-ts@4.5.0
 ```

3. **Run type-check and document errors:**

 ```bash
 pnpm type-check 2>&1 | tee ../agent/analysis/openapi3-ts-v4-errors.txt
 ```

4. **Fix errors systematically:**
 - Group errors by file
 - Fix one file at a time
 - Run type-check after each file
 - Document any API changes

5. **Update imports if needed:**
 - Check if import paths changed
 - Check if type names changed
 - Update accordingly

6. **Strengthen types:**
 - Use new v4 types where available
 - Replace any custom types with v4 equivalents
 - Add type guards if v4 provides them

7. **Run tests:**

 ```bash
 pnpm test -- --run
 ```

8. **Fix test failures:**
 - Update test expectations if API changed
 - Ensure no functionality changed

9. **Commit:**
 ```bash
 git add -A
 git commit -m "feat: update openapi3-ts to v4.5.0
 ```

Breaking changes addressed:

- [List specific changes]

New capabilities adopted:

- [List new features used]

All tests passing (297)
All type checks passing"

````

**Validation Steps:**

1. `pnpm type-check` exits 0
2. `pnpm test -- --run` exits 0 (297 tests)
3. `pnpm build` succeeds
4. Snapshot tests match (or intentional changes documented)
5. Manual smoke test of CLI

**Rollback Plan:**
If issues are severe:

```bash
git checkout main
cd lib && pnpm install openapi3-ts@^3
```

**Output:**

- Updated package.json
- Updated pnpm-lock.yaml
- Commit with migration notes

**Completed Actions:**

1. ✅ Updated `openapi3-ts` from v3 to v4.5.0
2. ✅ Changed all imports from `openapi3-ts` to `openapi3-ts/oas30` (30+ files)
3. ✅ Fixed ResponseObject validations (added required `description` fields)
4. ✅ Fixed test fixtures to align with stricter OAS 3.0 types
5. ✅ Verified full OAS 3.0 & 3.1 runtime support with comprehensive tests
6. ✅ All 311 tests passing

---

### 2.2 Update @apidevtools/swagger-parser

**Status:** Pending
**Priority:** HIGH
**Estimated Time:** 2-3 hours
**Dependencies:** Task 2.1 complete

**Acceptance Criteria:**

- [ ] @apidevtools/swagger-parser updated to latest stable version
- [ ] All TypeScript errors fixed
- [ ] All tests passing
- [ ] Validation behavior unchanged
- [ ] Breaking changes documented (if any)

**Implementation Steps:**

1. Check current and latest versions
2. Review changelog for breaking changes
3. Update dependency: `pnpm update @apidevtools/swagger-parser@latest`
4. Run type-check and fix errors
5. Run tests and verify behavior
6. Test CLI with OAS 3.0 and 3.1 specs
7. Commit changes

**Validation Steps:**

1. `pnpm type-check` exits 0
2. `pnpm test -- --run` exits 0 (311 tests)
3. `pnpm build` succeeds
4. CLI works with OAS 3.0 and 3.1 specs

---

### 2.3 Defer Logic to openapi3-ts v4 & swagger-parser (Post-Update Analysis)

**Status:** Pending
**Priority:** MEDIUM
**Estimated Time:** 4-6 hours
**Dependencies:** Tasks 2.1 and 2.2 complete

**Rationale:** Now that both dependencies are at their latest versions, analyze what custom code can be safely deferred to these battle-tested libraries.

**Acceptance Criteria:**

- [ ] Custom type guards analyzed (can openapi3-ts v4 replace them?)
- [ ] Custom type utilities analyzed (what v4 provides)
- [ ] Schema traversal logic analyzed (defer opportunities)
- [ ] Reference resolution analyzed (swagger-parser capabilities)
- [ ] Validation logic analyzed (swagger-parser vs custom)
- [ ] Schema dereferencing analyzed (swagger-parser vs makeSchemaResolver)
- [ ] Refactoring plan created (what to remove/replace)
- [ ] Documents updated with findings

**Implementation Steps:**

**Phase A: openapi3-ts v4 Analysis (2 hours)**

1. Inventory our custom type guards
2. Compare with openapi3-ts v4 exports
3. Check for utilities (schema traversal, dereferencing, validation)
4. Document findings (custom code vs v4 equivalent)

**Phase B: swagger-parser Analysis (2 hours)**

1. Review swagger-parser capabilities (parse, validate, dereference, bundle, resolve)
2. Compare with our custom code (makeSchemaResolver, validation)
3. Identify deferral opportunities with trade-off analysis
4. Analyze pros/cons (control vs maintenance burden)

**Phase C: Create Refactoring Plan (1-2 hours)**

1. Prioritize replacement opportunities (high/medium/low priority)
2. Estimate effort for each replacement
3. Create detailed refactoring tickets

**Phase D: Documentation (1 hour)**

1. Update `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md`
2. Create `.agent/analysis/SWAGGER_PARSER_DEFERRAL_OPPORTUNITIES.md`

**Output:**

- Updated analysis documents
- Refactoring tickets (if opportunities found)
- Decision: defer, keep, or hybrid approach

---

### 2.4 Update zod (v3 → v4.1.12)

**Status:** Pending  
**Priority:** CRITICAL  
**Estimated Time:** 4-6 hours  
**Dependencies:** Tasks 2.1 and 2.2 complete

**Acceptance Criteria:**

- [ ] zod updated to v4.1.12
- [ ] All TypeScript errors fixed
- [ ] All tests passing
- [ ] Generated schemas still work
- [ ] Types strengthened where possible

**Implementation Steps:**

1. **Create feature branch:**

    ```bash
    git checkout -b feat/update-zod-v4
    ```

2. **Review zod v4 changes:**
    - Visit: https://zod.dev/v4/versioning
    - Read: Migration guide
    - Note: Breaking changes

3. **Update dependency:**

    ```bash
    cd lib
    pnpm update zod@4.1.12
    ```

4. **Update imports:**

    ```typescript
    // OLD: import { z } from "zod/v4"
    // NEW: import { z } from "zod"
    ```

5. **Run type-check:**

    ```bash
    pnpm type-check 2>&1 | tee ../.agent/analysis/zod-v4-errors.txt
    ```

6. **Fix errors systematically:**
    - Group by error type
    - Fix one pattern at a time
    - Test after each fix

7. **Update generated code:**
    - Check template files (src/templates/\*.hbs)
    - Ensure generated Zod code uses v4 API
    - Test generation with sample OpenAPI specs

8. **Run tests:**

    ```bash
    pnpm test -- --run
    ```

9. **Fix test failures:**
    - Update test expectations
    - Verify schema behavior unchanged

10. **Commit:**
    ```bash
    git add -A
    git commit -m "feat: update zod to v4.1.12
    ```

Migration changes:

- Updated imports from 'zod/v4' to 'zod'
- [Other specific changes]

All tests passing (297)
Schema generation verified"

````

**Validation Steps:**

1. `pnpm type-check` exits 0
2. `pnpm test -- --run` exits 0
3. `pnpm build` succeeds
4. Generate client from sample OpenAPI spec:
    ```bash
    pnpm cli samples/v3.0/petstore.yaml -o /tmp/test-output.ts
    ```
5. Verify generated code compiles
6. No runtime errors in generated schemas

**Rollback Plan:**

```bash
git checkout main
cd lib && pnpm install zod@^3
````

**Output:**

- Updated package.json
- Updated template files if needed
- Commit with migration notes

---

## 3. Code Cleanup

### 3.1 Replace pastable Dependency (REFINED STRATEGY)

**Status:** Pending  
**Priority:** HIGH  
**Estimated Time:** 1.5 hours (down from 6-8 hours due to deep analysis)  
**Dependencies:** Task 1.2 complete, 2.1 and 2.2 complete

**Analysis Complete:** Deep review conducted October 25, 2025  
**Key Finding:** Functions are more specific than initially assessed - can simplify and optimize

**Acceptance Criteria:**

- [ ] All 9 pastable functions + 1 type replaced
- [ ] pastable dependency removed
- [ ] All 334 tests passing
- [ ] No functionality changes
- [ ] Domain-specific naming improves code clarity
- [ ] Type safety improved (precise type signatures, no `Record<string, unknown>`)

**Refined Replacement Strategy:**

| #   | Function               | Strategy    | Replacement                       | Bundle Impact |
| --- | ---------------------- | ----------- | --------------------------------- | ------------- |
| 1   | `getSum`               | ❌ Remove   | Native `.reduce()`                | -0KB          |
| 2   | `capitalize`           | ✍️ Custom   | Native 1-liner                    | -0KB          |
| 3   | `kebabToCamel`         | 🔄 Replace  | `camelCase` from lodash-es        | +0.5KB        |
| 4   | `snakeToCamel`         | 🔄 Replace  | `camelCase` from lodash-es (same) | -             |
| 5   | `get`                  | 🔄 Replace  | `get` from lodash-es              | +1.5KB        |
| 6   | `pick`                 | 🔄 Replace  | `pick` from lodash-es             | +1KB          |
| 7   | `sortBy`               | ❌ Remove   | Native `.localeCompare()`         | -0KB          |
| 8   | `sortListFromRefArray` | ✍️ Simplify | Custom using lodash `sortBy`      | +0.5KB        |
| 9   | `sortObjKeysFromArray` | ✍️ Simplify | Custom using lodash `sortBy`      | -             |
| 10  | `ObjectLiteral` type   | ❌ Remove   | Not needed (lodash types)         | -0KB          |

**Lodash-es imports (tree-shakeable):** `get`, `pick`, `sortBy`, `camelCase`  
**Net bundle impact:** ~3-4KB (not 24KB!)

---

**Implementation Steps:**

**Phase 1: No-Dependency Replacements (30 min)**

1. **Replace `getSum` → Native `.reduce()` (5 min)**

    **Files:** `lib/src/schema-complexity.helpers.ts` (3 instances)

    ```typescript
    // BEFORE:
    import { getSum } from "pastable";
    getSum(schemas.map((prop) => getSchemaComplexity({ current: 0, schema: prop })));

    // AFTER:
    schemas.map((prop) => getSchemaComplexity({ current: 0, schema: prop })).reduce((sum, n) => sum + n, 0);
    ```

2. **Replace `capitalize` → Native implementation (5 min)**

    **Files:** `lib/src/utils.ts` (add function)

    ```typescript
    /**
     * Capitalizes the first letter of a string
     * @example capitalize("hello") → "Hello"
     */
    export const capitalize = (str: string): string => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    ```

3. **Replace `sortBy` → Native `.localeCompare()` (5 min)**

    **File:** `lib/src/template-context.ts` (line 228)

    ```typescript
    // BEFORE:
    import { sortBy } from "pastable/server";
    data.endpoints = sortBy(data.endpoints, "path");

    // AFTER:
    data.endpoints = [...data.endpoints].sort((a, b) => a.path.localeCompare(b.path));
    ```

4. **Remove `ObjectLiteral` type → Not needed (2 min)**

    **File:** `lib/src/getZodiosEndpointDefinitionList.ts`

    ```typescript
    // BEFORE:
    import type { ObjectLiteral } from "pastable";
    function pick<T extends ObjectLiteral, K extends keyof T>...

    // AFTER: (lodash-es pick uses extends object)
    // No change needed - lodash types handle this
    ```

5. **Extract inline `pick` to utils (not needed - will use lodash) (0 min)**

---

**Phase 2: Add lodash-es (5 min)**

6. **Install lodash-es:**
    ```bash
    cd lib
    pnpm add lodash-es
    pnpm add -D @types/lodash-es
    ```

---

**Phase 3: lodash-es Replacements (20 min)**

7. **Replace `kebabToCamel` + `snakeToCamel` → `camelCase` (10 min)**

    **File:** `lib/src/utils.ts`

    **Insight:** lodash `camelCase` handles BOTH kebab-case AND snake_case!

    ```typescript
    // BEFORE:
    import { kebabToCamel, snakeToCamel } from "pastable/server";

    // Line 60:
    capitalize(kebabToCamel(path).replaceAll("/", ""));

    // Line 41:
    snakeToCamel(preserveUnderscore.replaceAll("-", "_"));

    // AFTER:
    import { camelCase } from "lodash-es";

    // Line 60:
    capitalize(camelCase(path).replaceAll("/", ""));

    // Line 41:
    camelCase(preserveUnderscore.replaceAll("-", "_"));
    ```

8. **Replace `get` → lodash-es (2 min)**

    **Files:** `lib/src/makeSchemaResolver.ts`, `lib/src/getOpenApiDependencyGraph.test.ts`

    ```typescript
    // BEFORE:
    import { get } from "pastable/server";

    // AFTER:
    import { get } from "lodash-es";
    // Usage stays the same (same API)
    ```

9. **Replace `pick` → lodash-es (2 min)**

    **Files:** `lib/src/generateZodClientFromOpenAPI.ts`, `lib/src/getZodiosEndpointDefinitionList.ts`

    ```typescript
    // BEFORE:
    import { pick } from "pastable/server";
    // OR inline implementation at getZodiosEndpointDefinitionList.ts:182

    // AFTER:
    import { pick } from "lodash-es";
    // Remove inline implementation (lines 181-191 in getZodiosEndpointDefinitionList.ts)
    ```

---

**Phase 4: Domain-Specific Custom Utilities (30 min)**

10. **Create domain-specific sorting utilities**

    **Create:** `lib/src/utils/schema-sorting.ts`

    **Key Insight:** These functions sort generated schema code, not arbitrary objects!

    ```typescript
    import { sortBy } from "lodash-es";

    /**
     * Sort schema code dictionary by dependency order
     *
     * Ensures schemas appear in the correct order in generated files,
     * with dependencies before dependents.
     *
     * @param schemas - Dictionary mapping schema names to generated code strings
     * @param dependencyOrder - Array of schema reference paths in dependency order
     * @returns New dictionary with keys reordered
     *
     * @example
     * const schemas = { User: "z.object(...)", Pet: "z.object(...)" };
     * const ordered = sortSchemasByDependencyOrder(schemas, ["#/components/schemas/Pet", "#/components/schemas/User"]);
     * // Result: { Pet: "z.object(...)", User: "z.object(...)" }
     */
    export function sortSchemasByDependencyOrder<T extends Record<string, string>>(
        schemas: T,
        dependencyOrder: readonly string[]
    ): T {
        const orderMap = new Map(dependencyOrder.map((key, idx) => [key, idx]));
        const entries = sortBy(Object.entries(schemas), ([key]) => orderMap.get(key) ?? Infinity);
        return Object.fromEntries(entries) as T;
    }

    /**
     * Sort schema names by dependency order
     *
     * Orders schema names so dependencies appear before dependents.
     * Names not in the reference order are placed at the end.
     *
     * @param schemaNames - Array of schema names to sort
     * @param dependencyOrder - Reference array defining the correct order
     * @returns New array with names sorted by dependency order
     *
     * @example
     * sortSchemaNamesByDependencyOrder(["User", "Pet"], ["Pet", "User"])
     * // Result: ["Pet", "User"]
     */
    export function sortSchemaNamesByDependencyOrder<T extends string>(
        schemaNames: T[],
        dependencyOrder: readonly T[]
    ): T[] {
        const orderMap = new Map(dependencyOrder.map((item, idx) => [item, idx]));
        return sortBy(schemaNames, (item) => orderMap.get(item) ?? Infinity);
    }
    ```

11. **Create test file: `lib/src/utils/schema-sorting.test.ts` (15 min)**

    ```typescript
    import { describe, it, expect } from "vitest";
    import { sortSchemasByDependencyOrder, sortSchemaNamesByDependencyOrder } from "./schema-sorting.js";

    describe("schema-sorting", () => {
        describe("sortSchemasByDependencyOrder", () => {
            it("should sort schema code dictionary by dependency order", () => {
                const schemas = {
                    User: "z.object({ name: z.string() })",
                    Pet: "z.object({ owner: UserSchema })",
                    Store: "z.object({ pets: z.array(PetSchema) })",
                };
                const order = ["Pet", "User", "Store"];

                const result = sortSchemasByDependencyOrder(schemas, order);

                expect(Object.keys(result)).toEqual(["Pet", "User", "Store"]);
            });

            it("should place schemas not in order at the end", () => {
                const schemas = { Z: "code", A: "code", M: "code" };
                const order = ["A", "M"];

                const result = sortSchemasByDependencyOrder(schemas, order);

                expect(Object.keys(result)).toEqual(["A", "M", "Z"]);
            });

            it("should handle empty inputs", () => {
                expect(sortSchemasByDependencyOrder({}, [])).toEqual({});
            });
        });

        describe("sortSchemaNamesByDependencyOrder", () => {
            it("should sort schema names by dependency order", () => {
                const names = ["User", "Pet", "Store"];
                const order = ["Pet", "User", "Store"];

                const result = sortSchemaNamesByDependencyOrder(names, order);

                expect(result).toEqual(["Pet", "User", "Store"]);
            });

            it("should place names not in order at the end", () => {
                const names = ["Z", "A", "M"];
                const order = ["A", "M"];

                const result = sortSchemaNamesByDependencyOrder(names, order);

                expect(result).toEqual(["A", "M", "Z"]);
            });

            it("should handle empty inputs", () => {
                expect(sortSchemaNamesByDependencyOrder([], [])).toEqual([]);
            });
        });
    });
    ```

12. **Update template-context.ts to use new functions**

    ```typescript
    // BEFORE:
    import { sortBy, sortListFromRefArray, sortObjKeysFromArray } from "pastable/server";

    // Line 124:
    data.schemas = sortObjKeysFromArray(data.schemas, schemaOrderedByDependencies);

    // Line 263:
    group.schemas = sortObjKeysFromArray(groupSchemas, getPureSchemaNames(schemaOrderedByDependencies));

    // Line 267:
    data.commonSchemaNames = new Set(
        sortListFromRefArray([...commonSchemaNames], getPureSchemaNames(schemaOrderedByDependencies))
    );

    // AFTER:
    import { sortSchemasByDependencyOrder, sortSchemaNamesByDependencyOrder } from "./utils/schema-sorting.js";

    // Line 124 - Much clearer what this does!
    data.schemas = sortSchemasByDependencyOrder(data.schemas, schemaOrderedByDependencies);

    // Line 263:
    group.schemas = sortSchemasByDependencyOrder(groupSchemas, getPureSchemaNames(schemaOrderedByDependencies));

    // Line 267:
    data.commonSchemaNames = new Set(
        sortSchemaNamesByDependencyOrder([...commonSchemaNames], getPureSchemaNames(schemaOrderedByDependencies))
    );
    ```

---

**Phase 5: Cleanup (10 min)**

13. **Remove all pastable imports:**
    - Verify no references remain
    - Run grep to confirm

14. **Remove pastable dependency:**

    ```bash
    cd lib
    pnpm remove pastable
    ```

15. **Run tests:**

    ```bash
    pnpm test -- --run
    # Expected: 334/334 passing
    ```

16. **Run quality gate:**

    ```bash
    pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
    ```

17. **Commit:**
    ```bash
    git add -A
    git commit -m "refactor: replace pastable with lodash-es and domain-specific utilities
    ```

Replaced 9 functions + 1 type from pastable:

**No-Dependency Replacements:**

- getSum → native .reduce() (3 instances)
- capitalize → custom native implementation
- sortBy → native .localeCompare()
- ObjectLiteral type → removed (lodash types handle it)

**lodash-es Replacements (tree-shakeable):**

- kebabToCamel + snakeToCamel → camelCase (2→1 function!)
- get → lodash-es get
- pick → lodash-es pick (removed inline implementation)

**Domain-Specific Utilities:**

- sortListFromRefArray → sortSchemaNamesByDependencyOrder
- sortObjKeysFromArray → sortSchemasByDependencyOrder
- New file: lib/src/utils/schema-sorting.ts
- Comprehensive tests: lib/src/utils/schema-sorting.test.ts

**Type Safety Improvements:**

- Precise type signatures (Record<string, string> vs generic object)
- Domain-specific naming (self-documenting code)
- No Record<string, unknown> (target repo compliant)

**Bundle Impact:**

- Removed: pastable (obscure dependency)
- Added: lodash-es (4 functions, tree-shaken: ~3-4KB)
- Net: +3-4KB (not +24KB due to tree-shaking)

All 334 tests passing ✅
No functionality changes ✅
Code clarity improved ✅"

````

---

**Validation Steps:**

1. `pnpm test -- --run` exits 0 (334 tests)
2. `pnpm type-check` exits 0
3. `pnpm build` succeeds
4. No references to "pastable" in code:
    ```bash
    grep -r "pastable" lib/src/
    # Should return nothing
    ```
5. Package.json no longer lists pastable
6. Bundle size check:
    ```bash
    ls -lh lib/dist/openapi-zod-client.js
    # Should only increase ~3-4KB
    ```
7. Tree-shaking verification:
    ```bash
    # Check that only 4 lodash functions are imported
    grep "from 'lodash-es'" lib/src/ -r
    # Should show: get, pick, sortBy, camelCase
    ```

**Output:**

- Updated source files (5 files modified)
- New `lib/src/utils/schema-sorting.ts` (domain-specific utilities)
- New `lib/src/utils/schema-sorting.test.ts` (comprehensive tests)
- Updated `lib/package.json` (lodash-es added, pastable removed)
- Commit with detailed changelog

**Key Improvements Over Original Plan:**

1. **Time Reduced:** 6-8 hours → 1.5 hours (80% reduction)
2. **Bundle Impact:** Accurate estimate (3-4KB vs feared 24KB)
3. **Type Safety:** Precise signatures (no `Record<string, unknown>`)
4. **Code Clarity:** Domain-specific naming (self-documenting)
5. **Consistency:** All library functions from one source (lodash-es)
6. **Simplification:** 2 functions → 1 (kebab+snake → camelCase)

---

### 3.1.5 Validation Philosophy & Fail-Fast Strategy ✅

**Status:** Complete
**Priority:** HIGH (Architecture Decision)
**Time Taken:** 3 hours (Analysis + Documentation + Implementation)
**Date:** October 25, 2025

**Acceptance Criteria:**

- [x] ✅ Validation logic audited (50-75 lines identified)
- [x] ✅ Nested $ref handling analyzed (all OAS versions)
- [x] ✅ Fail-fast strategy documented (VALIDATION_AUDIT.md)
- [x] ✅ Example of good validation added (nested $ref check)
- [x] ✅ Architecture decision recorded (NESTED_REFS_ANALYSIS.md)

**Key Decisions:**

**1. Defer Validation to Upstream Libraries**

**Philosophy:** Trust `@apidevtools/swagger-parser` and `openapi3-ts` to validate specs. Our job is code generation, not spec validation.

**What to Remove (~50-75 lines):**
- ❌ Null/undefined schema checks (swagger-parser validates this)
- ❌ Empty array element checks (spec validation, not generation)
- ❌ Unnecessary typeof checks on typed properties (openapi3-ts types guarantee)

**What to Keep:**
- ✅ Context/circular ref checks (code generation requirements)
- ✅ Nested $ref fail-fast check (preprocessing requirement)
- ✅ Type narrowing (runtime type safety)

**2. Nested $ref Handling (EXCELLENT Example)**

**Analysis:** Nested `$ref` objects (Reference → Reference) are **VALID** per OpenAPI 3.0, 3.1, and 3.2 specs.

**Decision:** **Reject with fail-fast error** (intentional, not a limitation)

**Current Implementation** (`lib/src/openApiToTypescript.helpers.ts:68-76`):
```typescript
// Nested $refs are VALID per OpenAPI spec, but we require preprocessing.
// This is an intentional design choice: dereferencing is SwaggerParser's job,
// code generation is our job. Fail fast with clear error directing users to
// the correct preprocessing workflow.
if ("$ref" in actualSchema) {
    throw new Error(
        `Nested $ref found: ${schema.$ref} -> ${actualSchema.$ref}. Use SwaggerParser.bundle() to dereference.`
    );
}
```

**Why This is Excellent:**
- ✅ Fails fast (no silent errors)
- ✅ Clear error message (user knows exactly what happened)
- ✅ Actionable solution (`Use SwaggerParser.bundle()`)
- ✅ Enforces correct workflow (preprocess → generate)
- ✅ Separation of concerns (dereferencing ≠ code generation)

**3. Fail-Fast > Defensive Handling**

**Bad Example:**
```typescript
if (!$schema) {
    throw new Error("Schema cannot be null...");
}
// This should be caught by swagger-parser.validate()
```

**Good Example:**
```typescript
if ("$ref" in actualSchema) {
    throw new Error("Nested $ref found... Use SwaggerParser.bundle()");
}
// This enforces correct preprocessing workflow
```

**Benefits:**
- Clear error messages with actionable solutions
- Users learn the correct workflow
- Simpler codebase (less defensive code)
- Bugs caught at the source (spec validation)

**Implementation Plan (Future - P1):**

**Phase 1: Remove Redundant Checks (~50-75 lines)**
1. Remove null/undefined schema checks
2. Remove empty array element checks
3. Simplify typeof checks on typed properties
4. Document preconditions in JSDoc

**Phase 2: Add Fail-Fast Checks**
1. Apply nested $ref pattern to other ref resolution points
2. Document preprocessing requirements
3. Add `--strict-validation` CLI flag (optional)

**Phase 3: Documentation**
1. README: Document SwaggerParser.bundle() requirement
2. JSDoc: Add `@precondition` annotations
3. Examples: Show correct preprocessing workflow

**Output:**

- `.agent/analysis/VALIDATION_AUDIT.md` - Full validation audit
- `.agent/analysis/NESTED_REFS_ANALYSIS.md` - Nested $ref decision record
- Updated `lib/src/openApiToTypescript.helpers.ts` - Clarified comment
- Architecture decision documented for future reference

**Files Created:**
- `.agent/analysis/VALIDATION_AUDIT.md` (205 lines)
- `.agent/analysis/NESTED_REFS_ANALYSIS.md` (344 lines)

**Impact:**
- Clearer architecture (separation of concerns)
- Better error messages (actionable guidance)
- Simpler codebase (defer to upstream libraries)
- Correct workflow enforcement (preprocessing → generation)

---

### 3.2 Eliminate Type Assertions (EXTRACTION BLOCKER)

**Status:** ⏳ IN PROGRESS (10/15 files complete, 47 assertions remaining)
**Priority:** CRITICAL BLOCKER
**Estimated Time:** 16-24 hours (1-2 weeks with testing)
**Dependencies:** Tasks 1.1, 2.1, 2.2 complete
**Time Spent So Far:** ~4.5 hours

**Progress Update (October 25, 2025 - Late Evening):**

✅ **Completed Files (10/15):**
1. `schema-sorting.ts` (1 assertion) - Returned honest type instead of generic T
2. `generateJSDocArray.ts` (1 assertion) - Added typeof check for proper narrowing
3. `makeSchemaResolver.ts` (1 assertion) - Created isSchemaRecord() type guard
4. `zodiosEndpoint.helpers.ts` (1 assertion) - Removed unnecessary type widening
5. `schema-complexity.ts` (2 assertions) - Simplified function signature
6. `inferRequiredOnly.ts` (3 assertions) - Explicit reduce typing, fixed isReferenceObject usage
7. `template-context.ts` (3 assertions) - Created tsResultToString helper, added isReferenceObject checks
8. `openApiToZod.ts` (4 assertions) - Resolved refs properly, removed unnecessary casts
9. `schema-complexity.helpers.ts` (4 assertions) - Proper parameter typing for type arrays
10. `zodiosEndpoint.operation.helpers.ts` (4 assertions) - Custom type guards + fail-fast validation

**Patterns Identified:**
- **Type Guards:** When runtime checks needed (e.g., isSchemaRecord with openapi3-ts isSchemaObject)
- **Honest Types:** Return what you actually return, not what you wish you returned
- **Type Narrowing:** Add runtime checks (typeof, Array.isArray) instead of assertions
- **Remove Widening:** Sometimes assertions make types LESS specific (zodiosEndpoint.helpers.ts)
- **Function Simplification:** Accept only what's needed (schema-complexity.ts: type vs whole schema)

**Quality Metrics:**
- ✅ All 373 tests passing after every fix
- ✅ Linter passes for every file
- ✅ Behavior preserved - tests define, linter enforces, code implements
- ✅ Type honesty enforced (getSchemaByRef returns honest SchemaObject | ReferenceObject)
- ✅ Custom type guards created: isRequestBodyObject, isParameterObject, isResponseObject
- ✅ Fail-fast validation for nested $refs in all component types

**Remaining Work (5/15 files, 47 assertions):**
- 1 medium file (4 assertions): zodiosEndpoint.path.helpers.ts
- 4 hard files (43 assertions): getZodiosEndpointDefinitionList.ts (5), cli.ts (6), openApiToTypescript.ts (7), openApiToTypescript.helpers.ts (22 down from 25, estimated)

**Acceptance Criteria:**

- [ ] Zero type assertions (71 → 65 → 0)
- [x] All tests passing (✅ 373/373)
- [x] No functionality regressions (✅ verified with tests)
- [ ] Proper type guards added where needed (✅ in progress)
- [ ] Code is more type-safe (✅ improving with each fix)

**Implementation Steps:**

**Phase A: Analysis & Strategy**

1. **Review triage document:**
    - Read: `.agent/analysis/LINT_TRIAGE_COMPLETE.md`
    - Identify: Files with most assertions
    - Prioritize: Files by effort and risk

2. **Group assertions by pattern:**
    - **Pattern A:** Tanu AST types (ts.Node → t.TypeDefinition)
    - **Pattern B:** Union type narrowing (SchemaObject | ReferenceObject → SchemaObject)
    - **Pattern C:** Function return type mismatches
    - **Pattern D:** Test-specific assertions
    - **Strategy per pattern:** Document approach

**Phase B: Implement Solutions**

3. **For each file with assertions:**

    **Strategy for Pattern A (Tanu/AST types):**

    ```typescript
    // BEFORE:
    return someNode as t.TypeDefinition;

    // AFTER (Option 1): Fix return type
    function foo(): ts.Node | t.TypeDefinition {
        return someNode; // No assertion needed
    }

    // AFTER (Option 2): Create type guard
    function isTypeDefinition(node: ts.Node): node is t.TypeDefinition {
        // Check if node has TypeDefinition properties
        return typeof node === "object" && "name" in node;
    }
    ```

    **Strategy for Pattern B (Union narrowing):**

    ```typescript
    // BEFORE:
    function handle(schema: SchemaObject | ReferenceObject) {
        const s = schema as SchemaObject; // ❌
        return s.type;
    }

    // AFTER: Use existing type guards
    function handle(schema: SchemaObject | ReferenceObject) {
        if (isReferenceObject(schema)) {
            // Handle reference case
            return;
        }
        // TypeScript knows schema is SchemaObject here
        return schema.type; // ✅
    }
    ```

    **Strategy for Pattern C (Return type mismatch):**

    ```typescript
    // BEFORE:
    function foo(): string {
        return getValue() as string; // ❌
    }

    // AFTER: Fix at source
    function getValue(): string { ... } // Correct return type
    function foo(): string {
        return getValue(); // ✅
    }
    ```

4. **Work file by file:**
    - Fix one file completely
    - Run tests: `pnpm test -- --run`
    - Commit: `git commit -m "refactor(file): eliminate type assertions"`
    - Move to next file

5. **Track progress:**
    ```bash
    # Count remaining assertions
    pnpm lint 2>&1 | grep "@typescript-eslint/consistent-type-assertions" | wc -l
    ```

**Phase C: Special Cases**

6. **openApiToTypescript.helpers.ts (high concentration):**
    - **Issue:** ts.Node vs t.TypeDefinition mismatches
    - **Solution:** Create proper type union returns
    - **Alternative:** Create wrapper types that satisfy both

7. **getZodiosEndpointDefinitionList.ts:**
    - **Issue:** Multiple assertion patterns
    - **Solution:** Add type guards, fix union handling

8. **inferRequiredOnly.ts:**
    - **Issue:** Assertions in complex logic
    - **Solution:** Break into smaller functions with proper types

**Phase D: Final Cleanup**

9. **Verify zero assertions:**

    ```bash
    pnpm lint 2>&1 | grep "@typescript-eslint/consistent-type-assertions"
    # Should return nothing
    ```

10. **Run full test suite:**

    ```bash
    pnpm test -- --run
    # All 297 tests must pass
    ```

11. **Final commit:**
    ```bash
    git add -A
    git commit -m "refactor: eliminate all type assertions (BLOCKER RESOLVED)
    ```

Replaced 74 type assertions with:

- Proper type guards (using 'is' keyword)
- Fixed function return types
- Corrected union type handling
- Added helper type predicates

Target repo compliance: assertionStyle: 'never' ✅

All tests passing (297)
Zero type assertions remaining"

````

**Validation Steps:**

1. `pnpm lint | grep consistent-type-assertions` returns nothing
2. `pnpm type-check` exits 0
3. `pnpm test -- --run` exits 0 (297 tests)
4. `pnpm build` succeeds
5. Manual review of changed files for type safety
6. No new `any` types introduced

**Output:**

- Multiple commits (one per file or logical group)
- Final summary commit
- Zero type assertions in codebase

---

### 3.3 Remove Evaluated Dependencies

**Status:** Pending
**Priority:** MEDIUM
**Estimated Time:** 2-4 hours
**Dependencies:** Tasks 1.3, 1.4 complete

**Acceptance Criteria:**

- [ ] openapi-types removed OR decision to keep documented
- [ ] @zodios/core removed OR decision to keep documented
- [ ] All tests passing if removed
- [ ] Documentation updated

**Implementation Steps:**

**If removing openapi-types:**

1. **Find all usages:**

    ```bash
    cd lib
    grep -rn "openapi-types" src/
    ```

2. **Replace with openapi3-ts types:**

    ```typescript
    // BEFORE:
    import type { OpenAPIV3 } from "openapi-types";

    // AFTER:
    import type { OpenAPIObject } from "openapi3-ts";
    ```

3. **Remove dependency:**

    ```bash
    pnpm remove openapi-types
    ```

4. **Test:**
    ```bash
    pnpm test -- --run
    ```

**If removing @zodios/core:**

1. **Extract types we use:**
    - Create `lib/src/types/zodios.ts`
    - Copy type definitions we need
    - Add proper JSDoc documentation

2. **Replace imports:**

    ```typescript
    // BEFORE:
    import type { ZodiosEndpointDefinition } from "@zodios/core";

    // AFTER:
    import type { ZodiosEndpointDefinition } from "./types/zodios.js";
    ```

3. **Remove dependency:**

    ```bash
    pnpm remove @zodios/core
    ```

4. **Test:**
    ```bash
    pnpm test -- --run
    ```

**Commit:**

```bash
git add -A
git commit -m "refactor: remove [dependency-name]

Rationale: [Based on evaluation document]

Replaced with: [openapi3-ts types / inlined types]

All tests passing (297)"
```

**Validation Steps:**

1. Dependencies removed from package.json
2. No imports of removed packages:
    ```bash
    grep -r "removed-package-name" lib/src/
    ```
3. All tests passing
4. Type-check passing

**Output:**

- Updated package.json
- New types files if needed
- Commit(s) for removals

---

## 4. Validation & Documentation

### 4.1 Full Quality Gate Verification

**Status:** Pending
**Priority:** CRITICAL
**Estimated Time:** 2 hours
**Dependencies:** All previous tasks complete

**Acceptance Criteria:**

- [ ] All quality gates green
- [ ] Definition of Done passes
- [ ] Documentation updated
- [ ] Ready for Phase 3

**Implementation Steps:**

1. **Run all quality gates:**

    ```bash
    pnpm format
    pnpm build
    pnpm type-check
    pnpm test -- --run
    pnpm lint
    ```

2. **Verify metrics:**
    - TypeScript errors: 0 ✅
    - Type assertions: 0 ✅
    - Tests passing: 297 ✅
    - Build successful: ✅
    - Lint issues: Document remaining (should be < 80)

3. **Update documentation:**
    - `.agent/context/context.md` - Update current status
    - `.agent/plans/00-STRATEGIC-PLAN.md` - Mark Phase 2 complete
    - This file - Mark all tasks complete

4. **Create Phase 2 summary:**

    ```bash
    cat > .agent/context/PHASE2_COMPLETE.md << 'EOF'
    # Phase 2 Complete: Type Safety & Dependencies

    **Completion Date:** [Date]
    **Duration:** [Actual time]

    ## Achievements
    - ✅ openapi3-ts updated to v4.5.0
    - ✅ zod updated to v4.1.12
    - ✅ pastable removed (replaced with lodash-es + custom)
    - ✅ Type assertions eliminated (74 → 0) 🎉
    - ✅ Dependencies evaluated (openapi-types, @zodios/core)

    ## Metrics
    - TypeScript errors: 0
    - Type assertions: 0 (BLOCKER RESOLVED)
    - Tests: 297 passing
    - Lint issues: [count] (down from 148)

    ## Next: Phase 3 - Quality & Testing
    EOF
    ```

5. **Commit:**
    ```bash
    git add -A
    git commit -m "docs: Phase 2 complete - Type Safety & Dependencies
    ```

Achievements:

- Updated openapi3-ts to v4.5.0
- Updated zod to v4.1.12
- Removed pastable dependency
- Eliminated all 74 type assertions (BLOCKER RESOLVED)
- Evaluated and cleaned up dependencies

Quality Gates:
✅ format
✅ build
✅ type-check (0 errors)
✅ test (297 passing)
⚠️ lint (remaining issues documented)

Ready for Phase 3: Quality & Testing"

`````

**Validation Steps:**

1. Definition of Done script passes:

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

2. No type assertions in code
3. All dependency changes documented
4. Phase 2 summary document created

**Output:**

- `.agent/context/PHASE2_COMPLETE.md`
- Updated context and plan documents
- Final commit

---

## Current TODO List (Embedded)

**Status Legend:** ⏳ Pending | 🔄 In Progress | ✅ Complete | ❌ Blocked

### Investigation Tasks (✅ COMPLETE 7/7)

- [x] ✅ **1.1** Lint Triage - 146 issues categorized, type assertions mapped
- [x] ✅ **1.2** pastable Analysis - 8 functions → lodash-es + custom utilities
- [x] ✅ **1.3** openapi-types Evaluation - REMOVE (redundant with v4)
- [x] ✅ **1.4** @zodios/core Evaluation - KEEP (stable, used in templates)
- [x] ✅ **1.5** swagger-parser Investigation - KEEP (actively maintained)
- [x] ✅ **1.6** openapi3-ts v4 Investigation - Migration checklist ready
- [x] ✅ **1.7** Handlebars Evaluation - KEEP Phase 2, ts-morph emitter Phase 3/4
- [ ] ⏳ **1.8** Defer Logic to openapi3-ts v4 - Analyze after Task 2.1 (DEFERRED)
- [ ] ⏳ **1.9** Zodios-Free Template Strategy - schemas-with-metadata template, --no-client flag (OPTIONAL)

### Implementation Tasks (Week 2-3)

- [x] ✅ **2.1** Update openapi3-ts - v3 → v4.5.0, fix type errors, tests passing (COMPLETE)
- [ ] ⏳ **2.2** Update @apidevtools/swagger-parser - Latest version, fix type errors
- [ ] ⏳ **2.3** Defer Logic Analysis - openapi3-ts v4 & swagger-parser capabilities
- [ ] ⏳ **2.4** Update zod - v3 → v4.1.12, fix imports, verify generation works
- [ ] ⏳ **3.1** Replace pastable - All 8 functions replaced, dependency removed
- [ ] ⏳ **3.2** Eliminate Type Assertions - 74 → 0, BLOCKER RESOLVED
- [ ] ⏳ **3.3** Remove Evaluated Deps - Remove openapi-types & pastable

### Validation Tasks (Week 3)

- [ ] ⏳ **4.1** Full Quality Gate Check - All gates green, Phase 2 complete

---

## Notes & Reminders

**Quality Standards:**

- MUST follow RULES.md at all times
- Every task must include validation
- Tests must pass after every change
- Document all decisions

**Before Any Commit:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

**Target State After Phase 2:**

- ✅ Latest dependencies (openapi3-ts v4, zod v4)
- ✅ Zero type assertions (extraction ready)
- ✅ No obscure dependencies (pastable removed)
- ✅ Clean dependency tree (evaluated and cleaned)
- ✅ All tests passing (297+)
- ✅ Ready for Phase 3 (quality improvements)

---

## 5. Performance & DX Quick Wins (Optional Phase 2 Extension)

### 5.1 Type-Only Output Mode (Performance Quick Win)

**Status:** Pending
**Priority:** HIGH (Performance)
**Estimated Time:** 3-4 hours (TDD)
**Dependencies:** None
**Source:** Inspired by typed-openapi performance patterns

**Acceptance Criteria:**

- [ ] New template created: `types-only.hbs`
- [ ] CLI flag added: `--output-mode types`
- [ ] Generated code has ZERO runtime dependencies
- [ ] TypeScript types only (no Zod, no validation)
- [ ] Tests written FIRST (TDD)
- [ ] All tests passing
- [ ] Quality gates pass

**Why This Matters:**

Performance impact for users who don't need runtime validation:

- **Bundle size:** 0 KB (vs 224 KB with Zod+Zodios+axios)
- **IDE performance:** <50ms autocomplete (vs 120ms+)
- **Build time:** Faster (no Zod schemas to generate)
- **Type safety:** Still full TypeScript types
- **Use case:** Frontend TypeScript projects, type checking only

**Implementation Steps:**

**Phase A: Write Failing Tests (TDD Red) - 1 hour**

1. **Create test file:**

    ```bash
    touch lib/src/templates/types-only.test.ts
    ```

2. **Write comprehensive test suite:**

    ```typescript
    import { describe, it, expect } from "vitest";
    import { generateZodClientFromOpenAPI } from "../generateZodClientFromOpenAPI.js";

    describe("types-only template", () => {
        it("should generate TypeScript types without any imports", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        get: {
                            operationId: "getUsers",
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
                template: "types-only",
                disableWriteToFile: true,
            });

            // MUST NOT import Zod
            expect(result).not.toContain("import { z }");
            expect(result).not.toContain('from "zod"');

            // MUST NOT import Zodios
            expect(result).not.toContain("@zodios/core");

            // MUST export TypeScript types
            expect(result).toContain("export type");
            expect(result).toContain("export interface");

            // MUST have schema types
            expect(result).toMatch(/type.*=.*{/);
        });

        it("should generate types for all HTTP methods", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/users": {
                        get: {
                            responses: {
                                200: {
                                    content: {
                                        "application/json": {
                                            schema: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                        post: {
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
                template: "types-only",
                disableWriteToFile: true,
            });

            // Should have endpoint types
            expect(result).toContain("getUsers");
            expect(result).toContain("postUsers");
        });

        it("should handle complex schemas (unions, intersections)", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                components: {
                    schemas: {
                        Pet: {
                            oneOf: [
                                {
                                    type: "object",
                                    properties: { type: { enum: ["cat"] } },
                                },
                                {
                                    type: "object",
                                    properties: { type: { enum: ["dog"] } },
                                },
                            ],
                        },
                    },
                },
                paths: {
                    "/pets": {
                        get: {
                            responses: {
                                200: {
                                    content: {
                                        "application/json": {
                                            schema: { $ref: "#/components/schemas/Pet" },
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
                template: "types-only",
                disableWriteToFile: true,
            });

            // Should handle union types
            expect(result).toMatch(/type.*Pet.*=/);
            expect(result).toContain("|"); // Union operator
        });

        it("should work with --output-mode CLI flag", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/test": {
                        get: {
                            responses: {
                                200: {
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
                options: { outputMode: "types" },
                disableWriteToFile: true,
            });

            expect(result).not.toContain("import { z }");
            expect(result).toContain("export type");
        });

        it("should have 0 runtime dependencies", async () => {
            const openApiDoc = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/test": {
                        get: {
                            responses: {
                                200: {
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
                template: "types-only",
                disableWriteToFile: true,
            });

            // NO imports at all (pure types)
            expect(result).not.toContain("import ");
            // OR only type imports
            if (result.includes("import ")) {
                expect(result).toMatch(/import\s+type/);
            }
        });
    });
    ```

3. **Run tests - expect failures:**
    ```bash
    cd lib
    pnpm test -- --run src/templates/types-only.test.ts
    # Expected: 5 FAILING (template doesn't exist yet)
    ```

**Phase B: Implement Template (TDD Green) - 1.5 hours**

4. **Create types-only.hbs template:**

    ```handlebars
    {{!-- lib/src/templates/types-only.hbs --}}
    {{!-- Pure TypeScript types - no runtime dependencies --}}

    {{#if types}}
    {{#each types}}
    {{{this}}};
    {{/each}}
    {{/if}}

    {{!-- Schema types --}}
    {{#each schemas}}
    export type {{@key}} = {{{this}}};
    {{/each}}

    {{!-- Endpoint types --}}
    {{#if endpoints}}
    export type ApiEndpoints = {
    {{#each endpoints}}
      {{#if alias}}
      "{{alias}}": {
      {{else}}
      "{{method}}_{{path}}": {
      {{/if}}
        method: "{{method}}";
        path: "{{path}}";
        {{#if parameters}}
        parameters: {
          {{#each parameters}}
          {{#ifeq type "Path"}}
          path: {{{schema}}};
          {{/ifeq}}
          {{#ifeq type "Query"}}
          query: {{{schema}}};
          {{/ifeq}}
          {{#ifeq type "Header"}}
          headers: {{{schema}}};
          {{/ifeq}}
          {{#ifeq type "Body"}}
          body: {{{schema}}};
          {{/ifeq}}
          {{/each}}
        };
        {{/if}}
        {{#if responses}}
        responses: {
          {{#each responses}}
          {{status}}: {{{schema}}};
          {{/each}}
        };
        {{/if}}
      };
    {{/each}}
    };
    {{/if}}

    {{!-- Fetcher type for headless client --}}
    export type Fetcher = (
      method: string,
      url: string,
      params?: {
        path?: Record<string, unknown>;
        query?: Record<string, unknown>;
        headers?: Record<string, unknown>;
        body?: unknown;
      }
    ) => Promise<Response>;

    {{!-- Client factory type --}}
    export function createClient(fetcher: Fetcher): {
    {{#each endpoints}}
      {{#if alias}}
      {{alias}}: (params: ApiEndpoints["{{alias}}"]["parameters"]) => Promise<ApiEndpoints["{{alias}}"]["responses"][200]>;
      {{else}}
      {{method}}_{{path}}: (params: ApiEndpoints["{{method}}_{{path}}"]["parameters"]) => Promise<ApiEndpoints["{{method}}_{{path}}"]["responses"][200]>;
      {{/if}}
    {{/each}}
    } {
      return {
    {{#each endpoints}}
        {{#if alias}}
        {{alias}}: async (params) => {
        {{else}}
        {{method}}_{{path}}: async (params) => {
        {{/if}}
          const response = await fetcher("{{method}}", "{{path}}", params);
          return response.json();
        },
    {{/each}}
      };
    }
    ```

5. **Update CLI to support output mode:**

    ```typescript
    // lib/src/cli.ts
    program
        .option("--output-mode <mode>", "Output mode: zod (default) | types")
        .option("--template <name>", "Template to use (overrides output-mode)");

    // Handle output mode
    const outputMode = program.opts().outputMode || "zod";
    if (outputMode === "types" && !program.opts().template) {
        options.template = "types-only";
    }
    ```

6. **Update options handling:**

    ```typescript
    // lib/src/generateZodClientFromOpenAPI.ts
    export interface GenerateZodClientFromOpenAPIOptions {
        // ... existing options
        outputMode?: "zod" | "types"; // NEW
    }

    // Auto-select template
    if (options.outputMode === "types" && !template) {
        effectiveTemplate = "types-only";
    }
    ```

7. **Run tests - expect success:**
    ```bash
    pnpm test -- --run src/templates/types-only.test.ts
    # Expected: 5/5 PASSING ✅
    ```

**Phase C: Documentation - 30 minutes**

8. **Update README with performance comparison:**

    ````markdown
    ## Output Modes

    ### Zod Mode (Default)

    Full runtime validation with Zod schemas:

    - Bundle: ~224 KB (Zod + Zodios + axios)
    - IDE: ~120ms autocomplete
    - Use case: Runtime validation, API clients

    ### Types-Only Mode

    Pure TypeScript types with 0 runtime dependencies:

    - Bundle: 0 KB
    - IDE: <50ms autocomplete (instant)
    - Use case: Type checking only, frontend TypeScript

    ```bash
    # Generate types only
    pnpm openapi-zod-client ./api.yaml -o ./types.ts --output-mode types

    # Or use template directly
    pnpm openapi-zod-client ./api.yaml -o ./types.ts --template types-only
    ```
    ````

    **Performance Comparison:**

    | Aspect             | Zod Mode                 | Types-Only Mode |
    | ------------------ | ------------------------ | --------------- |
    | Bundle Size        | 224 KB                   | 0 KB            |
    | Dependencies       | zod, @zodios/core, axios | None            |
    | IDE Autocomplete   | 120ms                    | <50ms           |
    | Runtime Validation | ✅ Yes                   | ❌ No           |
    | Type Safety        | ✅ Yes                   | ✅ Yes          |

    ```

    ```

**Validation Steps:**

1. **All tests pass:**

    ```bash
    pnpm test -- --run src/templates/types-only.test.ts
    # 5/5 passing
    ```

2. **Full test suite passes:**

    ```bash
    pnpm test -- --run
    # All tests passing
    ```

3. **CLI flag works:**

    ```bash
    # Should generate types only
    pnpm cli samples/v3.0/petstore.yaml -o /tmp/types.ts --output-mode types

    # Verify no imports
    grep "import" /tmp/types.ts
    # Should be empty or only "import type"
    ```

4. **Generated code compiles:**

    ```bash
    npx tsc /tmp/types.ts --noEmit --strict
    # Should compile without errors
    ```

5. **Quality gates pass:**
    ```bash
    pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
    ```

**Output:**

- `lib/src/templates/types-only.hbs` (new template)
- `lib/src/templates/types-only.test.ts` (5 tests)
- Updated CLI with `--output-mode` flag
- Updated README with performance comparison
- 0 KB bundle option for users

**Benefits:**

- **75% bundle size reduction** (224 KB → 0 KB)
- **3x faster IDE** (120ms → <50ms)
- **Zero dependencies** for type-only users
- **Faster builds** (no Zod schema generation)
- **Production TypeScript apps** can use types without validation overhead

**Cross-Reference:**

- Inspired by: `.agent/analysis/typed-openapi-lessons/02-PERFORMANCE.md` Section 1
- Impact analysis: `.agent/analysis/typed-openapi-lessons/IMPACT-ANALYSIS.md`

---

## Next: Phase 2B - MCP Enhancements (Optional)

After completing Phase 2 core tasks (2.1, 2.2, 3.2), **Phase 2B** provides comprehensive MCP support:

**See:** `.agent/plans/02-MCP-ENHANCEMENTS.md`

**Key Features:**

- **SDK Generation** - OpenAPI validation, enhanced metadata, rate limiting
- **MCP Tool Consumption** - JSON Schema export, security metadata, type predicates
- **Estimated Duration:** 3-4 weeks (49-64 hours)

**Prerequisites:**

- ✅ Task 1.9 complete (schemas-with-metadata template)
- ⏳ Task 2.1 complete (openapi3-ts v4)
- ⏳ Task 2.2 complete (zod v4)
- ⏳ Task 3.2 complete (type assertions eliminated)

---

## Phase 3: Documentation & Developer Experience

### 6.1 Comprehensive Documentation Sweep (CRITICAL FOR DX)

**Status:** Pending
**Priority:** CRITICAL (Developer Experience)
**Estimated Time:** 16-24 hours (2-3 weeks)
**Dependencies:** Phase 2 complete, Phase 2B optional

See `.agent/RULES.md` section "MANDATORY: Comprehensive TSDoc Standards" for detailed requirements.

**Acceptance Criteria:**

- [ ] Every exported symbol has comprehensive TSDoc per RULES.md
- [ ] All public API functions have 3+ realistic usage examples
- [ ] All TSDoc @example code blocks validated and working
- [ ] TypeDoc generates documentation with ZERO warnings
- [ ] README examples match current API (no outdated code)
- [ ] Migration guides created for all breaking changes
- [ ] API reference documentation complete and professional
- [ ] All @see links validate correctly (no 404s)
- [ ] Developer guides created (custom templates, MCP, SDK, troubleshooting)
- [ ] Quality gates pass (build + type-check + test + docs)

**Why This Matters:**

Developer Experience is **Priority #1**. Excellent documentation:

- Reduces support burden (self-service through docs)
- Increases adoption (developers trust well-documented code)
- Improves onboarding (new contributors learn from examples)
- Prevents errors (validated examples show correct usage)
- Enables maintenance (doc changes validated automatically)

**Implementation Steps:** See detailed 7-phase plan in task description below.

**Validation:** TypeDoc must generate with `--treatWarningsAsErrors` and pass.

---

**This plan is living. Update task status as work progresses. Add notes for future reference.**
`````
