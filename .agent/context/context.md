# Living Context Document

**Last Updated:** October 25, 2025 (Late Night - Task 3.2 IN PROGRESS)  
**Purpose:** Single source of truth for project state, decisions, and next steps

**Recent Progress:**

- ⏳ Task 3.2: Eliminate Type Assertions IN PROGRESS (11/15 files, ~41 remaining, ~5.5 hours invested)
- ✅ Task 3.1: pastable replaced with lodash-es + native + domain utils (3 hours, +55 unit tests)
- ✅ Task 2.4: zod upgraded v3.25.76 → v4.1.12 (30 minutes)
- ✅ Task 2.3: Defer logic analysis complete (2 hours) - No deferral opportunities found
- ✅ Task 2.2: swagger-parser verified at latest v12.1.0 (10 minutes)
- ✅ Prettier 3.x fix + 16 comprehensive tests (1 hour)
- ✅ Task 2.1: openapi3-ts upgraded to v4.5.0 (5 hours)
- ✅ Task 1.10: Critical lint issues fixed (35 minutes)
- ✅ Task 1.9: schemas-with-metadata template complete (all tests passing)

---

## 🎯 MANDATORY: Test-Driven Development (TDD)

**ALL implementation work MUST follow TDD workflow:**

1. ✍️ Write failing tests FIRST (before any implementation code)
2. 🔴 Run tests - confirm FAILURE (proves tests validate behavior)
3. ✅ Write minimal implementation (only enough to pass tests)
4. 🟢 Run tests - confirm SUCCESS (validates implementation works)
5. ♻️ Refactor if needed (with test protection)
6. 🔁 Repeat for each feature

**No exceptions:** "I'll add tests later" is NOT ALLOWED. See `.agent/RULES.md` for detailed TDD guidelines.

---

## 🎯 Project Goal

**Modernize `openapi-zod-client` fork to extract and port to Engraph monorepo**

The extracted components will generate strict Zod schemas and MCP tool validation from OpenAPI 3.0/3.1 specifications for the Engraph SDK.

**Target Repository:** `engraph-monorepo`  
**Use Case:** Auto-generate request/response validators for MCP tools wrapping Engraph API endpoints

---

## 📊 Current Status (October 25, 2025)

### Quality Gates

```bash
✅ format      - Passing
✅ build       - Passing (ESM + CJS + DTS)
✅ type-check  - Passing (0 errors)
⚠️  lint       - 136 issues (down from 147, see below)
✅ test        - Passing (373 tests, up from 318 - added 55 pure function unit tests)
```

**Definition of Done:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

✅ **Currently passing**

### Lint Status (CRITICAL ATTENTION REQUIRED)

- **Total:** 136 issues (down from 147)
- **Fixed:** 11 issues (Task 1.10)

**EXTRACTION BLOCKER:**

- **74 type assertions** (`@typescript-eslint/consistent-type-assertions`) - ALL warnings
- Target repo requires `assertionStyle: "never"` - NO type assertions allowed
- **Must fix before extraction to target monorepo**
- **Detailed breakdown:** `.agent/analysis/LINT_TRIAGE_COMPLETE.md`

**Files with Most Assertions:**

- `openApiToTypescript.helpers.ts` (22 assertions)
- `openApiToTypescript.ts` (17 assertions)
- `getZodiosEndpointDefinitionList.ts` (8 assertions)
- `inferRequiredOnly.ts` (7 assertions)

**Recently Fixed (Task 1.10):**

- ✅ CodeMeta type safety issues (8 instances) - Explicit `.toString()` added
- ✅ Floating promise in samples-generator.ts
- ✅ PATH security warning in samples-generator.ts

**Remaining Critical Issues:**

- 74 type assertions (BLOCKER for extraction)
- 3 `max-statements` violations
- 2 `max-lines-per-function` violations
- 2 `require-await` (dead async functions)
- Other minor issues (see lint triage document)

**Analysis Complete:** All issues categorized by priority with file-by-file elimination plan

---

## 🏗️ Architecture & Decisions

### Key Architectural Decisions

All documented in `.agent/adr/` (12 ADRs):

**Core Philosophy:**

- **ADR-001:** Fail Fast on Spec Violations (strict validation, helpful errors)
- **ADR-002:** Defer Types to openapi3-ts (use library types, no custom duplication)
- **ADR-003:** Type Predicates Over Boolean Filters (proper `is` keyword type guards)

**Code Quality:**

- **ADR-004:** Pure Functions & Single Responsibility (target: <50 lines per function)
- **ADR-005:** Enum Complexity is Constant (always 2, regardless of size)
- **ADR-006:** No Unused Variables (never prefix with `_`)

**Tooling:**

- **ADR-007:** ESM with NodeNext Resolution (`.js` extensions for ESM)
- **ADR-008:** Replace cac with commander (better TypeScript support)
- **ADR-009:** Replace Preconstruct with tsup (modern, fast build)
- **ADR-010:** Use Turborepo (monorepo orchestration, caching)

**Infrastructure:**

- **ADR-011:** AJV for Runtime Validation (against official OpenAPI schemas)
- **ADR-012:** Remove Playground/Examples (focus on core library)

### Coding Standards

**Comprehensive standards in `.agent/RULES.md`:**

- Pure functions where possible
- No type assertions (`as` casts)
- Type safety without `any`
- Explicit over implicit
- Immutability by default
- Clear error handling

---

## 📦 Dependencies

### Current Versions

```json
{
    "openapi3-ts": "^4.5.0", // ✅ UPDATED (was ^3, now using oas30 namespace)
    "zod": "^4.1.12", // ✅ UPDATED (was 3.25.76, backward compatible)
    "@zodios/core": "^10.9.6", // ✅ KEEP (used in templates, peer dep warning expected)
    "openapi-types": "^12.1.3", // ⚠️ REMOVE (redundant with openapi3-ts v4)
    "lodash-es": "^4.17.21", // ✅ ADDED (tree-shakeable, replaced pastable)
    "@apidevtools/swagger-parser": "^12.1.0", // ✅ VERIFIED at latest (Oct 14, 2025)
    "tanu": "^0.2.0", // ✅ KEEP (TypeScript AST manipulation)
    "commander": "^14.0.1", // ✅ KEEP (CLI framework)
    "ts-pattern": "^5.8.0", // ✅ KEEP (pattern matching)
    "handlebars": "^4.7.8" // ✅ KEEP Phase 2, evaluate ts-morph emitter Phase 3/4
}
```

### Dependency Strategy (✅ ANALYSIS COMPLETE, ⏳ IMPLEMENTATION IN PROGRESS)

**Phase 2 Progress:**

1. ✅ **COMPLETE:** `openapi3-ts` (v3 → v4.5.0) - Task 2.1
    - All imports changed to `openapi3-ts/oas30` namespace
    - 30+ files updated
    - All 318 tests passing
    - Full OAS 3.0 & 3.1 runtime support verified

2. ✅ **COMPLETE:** `@apidevtools/swagger-parser` - Task 2.2
    - Already at latest version: 12.1.0 (published Oct 14, 2025)
    - Verified with `pnpm update` - no changes needed
    - All 318 tests passing
    - Duration: 10 minutes (verification only)

3. ✅ **COMPLETE:** Defer Logic Analysis - Task 2.3
    - Analyzed custom code vs openapi3-ts v4 & swagger-parser
    - Finding: No major deferral opportunities - codebase already optimal
    - Document: `.agent/analysis/TASK_2.3_DEFER_LOGIC_ANALYSIS.md`
    - Duration: 2 hours (vs 4-6 estimated)

4. ✅ **COMPLETE:** `zod` (v3.25.76 → v4.1.12) - Task 2.4
    - All 334 tests passing with zod v4
    - No breaking changes detected
    - @zodios/core peer dependency warning (expected, not a blocker)
    - Duration: 30 minutes

5. ✅ **COMPLETE:** `pastable` → `lodash-es` + native + domain utils - Task 3.1
    - Replaced with tree-shakeable lodash-es (get, pick, camelCase, sortBy)
    - Added native implementations (getSum, capitalize, sortBy for simple cases)
    - Created domain-specific schema-sorting.ts with precise types
    - Added 55+ comprehensive unit tests for pure functions (TDD-driven)
    - All 373 tests passing (+55 from 318)
    - Duration: 3 hours

6. ⏳ **LATER:** `openapi-types` → Use `openapi3-ts` v4 types - Task 3.3
    - Only used in 1 test file, redundant

7. ✅ **KEEP:** `@zodios/core`, `@apidevtools/swagger-parser`
    - Evaluations in `.agent/analysis/ZODIOS_CORE_EVALUATION.md` & `SWAGGER_PARSER_INTEGRATION.md`

**Phase 3/4 Consideration:**

5. **Handlebars** → Evaluate ts-morph emitter architecture
    - Analysis in `.agent/analysis/HANDLEBARS_EVALUATION.md`
    - Recommended: AST-based emitter with plugin API (22-32 hours effort)

---

## 📈 Progress Summary

### Phase 1: Developer Tooling (✅ COMPLETE)

**Achievements:**

- Modernized all tooling to latest versions
- Migrated to pure ESM with NodeNext resolution
- Eliminated all cognitive complexity violations (4 files, 104+47+33+31 points over → all <30)
- Fixed all critical type safety errors (10 → 0)
- Established comprehensive testing foundation
- Created 36+ pure helper functions
- Added 47 tests (+19%)

**Quality Improvement:**

- **TypeScript errors:** 151 → 0 ✅
- **Tests:** 250 → 297 ✅
- **Cognitive complexity:** 4 violations → 0 ✅
- **Critical type safety:** 10 errors → 0 ✅

**Documentation:**

- 12 comprehensive ADRs (~2900 lines)
- RULES.md with coding standards
- Definition of Done established

### Phase 2: Type Safety & Dependencies (⏳ IMPLEMENTATION IN PROGRESS - 6/10 tasks complete)

**Status:** Implementation underway - Task 3.1 ✅, Task 2.4 ✅, Task 2.3 ✅, Task 2.2 ✅, Task 2.1 ✅, Task 1.10 ✅, Task 1.9 ✅

**Completed Tasks:**

- ✅ **Task 1.9:** schemas-with-metadata template (Engraph-optimized) - 6 hours
    - All 14 tests passing (318 total tests now)
    - No Zodios dependency, full request/response validation
    - CLI flags added, documentation complete
    - Ready for Engraph extraction

- ✅ **Task 1.10:** Critical lint issues fixed - 35 minutes
    - CodeMeta type safety (8 instances)
    - Floating promise, PATH security warning
    - Lint issues: 147 → 136 (11 fixed)

- ✅ **Task 2.1:** openapi3-ts v4.5.0 upgrade - 5 hours
    - All imports changed to `openapi3-ts/oas30` namespace
    - 30+ files updated with stricter types
    - ResponseObject validations fixed (added required `description` fields)
    - Test fixtures aligned with OAS 3.0 types
    - All 318 tests passing ✅

- ✅ **Task 2.2:** swagger-parser v12.1.0 verification - 10 minutes
    - Already at latest version (published Oct 14, 2025)
    - Ran `pnpm update` - no changes needed
    - All 318 tests passing ✅
    - No commit required (already up-to-date)

**Key Discovery: OAS 3.0 & 3.1 Full Runtime Support Verified**

- ✅ Created comprehensive test suite: `oas-3.0-vs-3.1-feature-parity.test.ts` (7 tests, all passing)
- ✅ **Finding:** Codebase already handles all critical OAS 3.0 AND 3.1 features at runtime
- ✅ **Evidence:** `openApiToZod.ts` correctly handles:
    - Both boolean (3.0) and numeric (3.1) `exclusiveMinimum`/`exclusiveMaximum`
    - Both `nullable: true` (3.0) and `type: ["string", "null"]` (3.1)
    - `type: "null"` (3.1)
- ⚠️ **Type-level:** Uses `oas30` types for simplicity (pragmatic choice for 95% of APIs)
- 📋 **Future:** Multi-version OAS support planned for Phase 3E (after ts-morph emitter)
- 📄 **Documentation:** `.agent/analysis/OAS_RUNTIME_SUPPORT_VERIFICATION.md`

**Analysis Documents Created:**

- ✅ `LINT_TRIAGE_COMPLETE.md` - All 146 issues categorized, type assertions mapped
- ✅ `PASTABLE_REPLACEMENT_PLAN.md` - 8 functions → lodash-es + custom, detailed plan
- ✅ `OPENAPI_TYPES_EVALUATION.md` - REMOVE (redundant with openapi3-ts v4)
- ✅ `ZODIOS_CORE_EVALUATION.md` - KEEP (stable, used in templates)
- ✅ `SWAGGER_PARSER_INTEGRATION.md` - KEEP (actively maintained, good usage)
- ✅ `OPENAPI3_TS_V4_INVESTIGATION.md` - Complete migration checklist, breaking changes
- ✅ `HANDLEBARS_EVALUATION.md` - KEEP Phase 2, ts-morph emitter for Phase 3/4
- ✅ `TASK_1.9_ENGRAPH_ENHANCEMENTS.md` - Zodios-free template with full validation
- ✅ `CODEMETA_ANALYSIS.md` - Analysis of CodeMeta class, ts-morph will render redundant
- ✅ `OAS_VERSION_STRATEGY.md` - Multi-version OAS support options (for Phase 3E)
- ✅ `OAS_RUNTIME_SUPPORT_VERIFICATION.md` - Proof of full 3.0/3.1 runtime support

---

## 🎯 Next Priorities

### ⚡ IMMEDIATE: Task 3.2 - Eliminate Type Assertions (BLOCKER)

**Status:** ⏳ IN PROGRESS (11/15 files complete, ~41 assertions remaining, ~5.5 hours invested)  
**Priority:** P0 BLOCKER (extraction requirement)  
**Estimated Time:** 16-24 hours total (10.5-18.5 hours remaining)  
**TDD Required:** MANDATORY - add tests for any complex replacements

**What:** Eliminate all 71 type assertions (`as` casts) from codebase → ~41 remaining

**⚠️ CRITICAL RULE:** **ONLY `as const` IS ALLOWED** - All other `as` usages must be eliminated!

**Progress:**

- ✅ All "easy" files complete (4 files, 4 assertions)
- ✅ All "medium" files complete (7 files, 24 assertions) ← **zodiosEndpoint.path.helpers.ts added**
- ✅ getZodiosEndpointDefinitionList.ts verified clean (only `as const` usages)
- ⏳ Hard files remaining (3 files, ~41 assertions):
  1. cli.ts (~6 assertions)
  2. openApiToTypescript.ts (~7 assertions)  
  3. openApiToTypescript.helpers.ts (~22+ assertions) - **THE FINAL BOSS**

**Latest Completions:**

- zodiosEndpoint.path.helpers.ts (4 assertions) - Fixed parameter types, fail-fast for default responses
- getZodiosEndpointDefinitionList.ts - Already clean! User improved helpers & fixed PathItem type

**Key Patterns Established:**

1. **Custom Type Guards:** isRequestBodyObject(), isParameterObject(), isResponseObject()
2. **Fail-fast Validation:** Nested $refs in all component types with clear error messages
3. **Honest Return Types:** getSchemaByRef returns SchemaObject | ReferenceObject (not just SchemaObject)
4. **Fix Types at Source:** ProcessOperationParams uses AllowedMethod (not string)
5. **Type Narrowing:** Use openapi3-ts isReferenceObject, isSchemaObject + custom guards
6. **Partial for Optional:** PathItem = Partial<Record<AllowedMethod, ...>> (not all methods required)

**Why:**

- **BLOCKER for Engraph extraction:** Target repo has `@typescript-eslint/consistent-type-assertions: ["error", { assertionStyle: "never" }]`
- Type assertions hide bugs and prevent TypeScript from catching errors
- Proper type guards and generics are safer and more maintainable
- This is the LAST major blocker before extraction readiness

**How (from Task 3.2 plan in 01-CURRENT-IMPLEMENTATION.md):**

1. Run `grep -r " as " lib/src --include="*.ts" | grep -v "test.ts"` to inventory all assertions
2. Categorize by pattern:
    - Type narrowing → proper type guards
    - Generic constraints → fix generic parameters
    - Object literals → proper typing at source
    - Unknown casts → investigate and add proper validation
3. Fix file-by-file with TDD workflow
4. Run quality gates after each file to ensure no regressions
5. Final validation: grep confirms 0 assertions remain

**Validation:**

- Zero `as` casts in production code (tests may keep some)
- All 373+ tests still passing
- Type-check passes with stricter rules
- Quality gate passes

**After Task 3.2:**

- ✅ Move to Task 3.3: Dependency Cleanup (remove openapi-types)

---

### Short Term - Phase 2 Remaining Tasks

**Sequential Order (6/10 tasks complete ✅):**

1. ✅ **Task 3.1:** Replace pastable (3 hours actual) - **COMPLETE**
    - Replaced with lodash-es + native + domain-specific utils
    - Added 55+ comprehensive unit tests for pure functions
    - All 373 tests passing

2. ⏳ **Task 3.2:** Eliminate Type Assertions - **P0 BLOCKER** (16-24 hours) - **NEXT**
    - 74 instances → 0
    - Target repo: `assertionStyle: "never"`
    - File-by-file elimination with TDD

3. ⏳ **Task 3.3:** Dependency Cleanup (1-2 hours)
    - Remove: `openapi-types` (redundant with openapi3-ts v4)

### Short Term (Next 2-3 Weeks) - Phase 3

6. **Mutation Testing**
    - Add Stryker 9.2.0 (October 2025)
    - Integrate with Turbo
    - Establish mutation score threshold

7. **ESLint Target Compliance**
    - Fix remaining lint issues (146 → 0)
    - Gap analysis vs `.agent/reference/reference.eslint.config.ts`
    - Achieve full target repo compliance

8. **Handlebars Evaluation** (Optional)
    - ts-morph emitter architecture (22-32 hours)
    - Or defer to Phase 4+

### Medium Term (Next Month) - Phase 4

9. **Final Cleanup**
    - All quality gates green (including lint)
    - Zero dependencies with security issues
    - Ready for extraction

---

## 🔗 Key Documents

### Plans & Context

- **This file:** Living context
- **Strategic Plan:** `.agent/plans/00-STRATEGIC-PLAN.md`
- **Current Implementation:** `.agent/plans/01-CURRENT-IMPLEMENTATION.md`
- **Definition of Done:** `.agent/DEFINITION_OF_DONE.md`

### Analysis (✅ Phase 2 Investigation Complete + Implementation Insights)

**Initial Analysis Documents:**

- **Lint Triage:** `.agent/analysis/LINT_TRIAGE_COMPLETE.md` (146 issues categorized)
- **pastable Plan:** `.agent/analysis/PASTABLE_REPLACEMENT_PLAN.md` (8 functions → replacements)
- **openapi-types:** `.agent/analysis/OPENAPI_TYPES_EVALUATION.md` (REMOVE - redundant)
- **@zodios/core:** `.agent/analysis/ZODIOS_CORE_EVALUATION.md` (KEEP - stable)
- **swagger-parser:** `.agent/analysis/SWAGGER_PARSER_INTEGRATION.md` (KEEP - good usage)
- **openapi3-ts v4:** `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md` (Migration checklist)
- **Handlebars:** `.agent/analysis/HANDLEBARS_EVALUATION.md` (ts-morph emitter recommended)
- **Task 1.9 Engraph:** `.agent/analysis/TASK_1.9_ENGRAPH_ENHANCEMENTS.md` (Zodios-free template, 724 lines)

**Implementation Insights (NEW):**

- **CodeMeta:** `.agent/analysis/CODEMETA_ANALYSIS.md` (ts-morph will render redundant)
- **OAS Version Strategy:** `.agent/analysis/OAS_VERSION_STRATEGY.md` (Multi-version options for Phase 3E)
- **OAS Runtime Verification:** `.agent/analysis/OAS_RUNTIME_SUPPORT_VERIFICATION.md` (Proof of 3.0/3.1 support)

### Reference

- **Coding Standards:** `.agent/RULES.md` (includes TDD requirements)
- **ADRs:** `.agent/adr/` (12 decision records)
- **Target ESLint Config:** `.agent/reference/reference.eslint.config.ts`
- **Emitter Architecture:** `.agent/reference/openapi-zod-client-emitter-migration.md`
- **Engraph Usage Examples:** `.agent/reference/engraph_usage/` (zodgen-core.ts, typegen-core.ts)

### History

- **Session Status:** `.agent/context/SESSION_STATUS_OCT_24.md`
- **Phase 1 Complete:** `.agent/context/PHASE1_COMPLETE.md`
- **Previous Plans:** `.agent/plans/archive/`

---

## 💡 Key Decisions & Constraints

### Hard Requirements

1. **No type assertions** - Target repo forbids them (`assertionStyle: "never"`)
2. **OpenAPI 3.1+ support** - Must handle latest spec versions
3. **Latest dependencies** - All packages must be current
4. **Zero security issues** - `pnpm audit` must be clean
5. **All quality gates green** - format, build, type-check, lint, test

### Strategic Decisions

1. **Not creating PRs** - Extracting to Engraph monorepo instead
2. **Update dependencies first** - Before deferring to libraries
3. **Type safety paramount** - Follow all RULES.md standards
4. **Comprehensive testing** - Mutation testing with Stryker
5. **Documentation-first** - Every decision recorded, every task detailed

---

## 📝 Working Philosophy

### From RULES.md

1. **🎯 Test-Driven Development (TDD) - MANDATORY FOR ALL WORK**
2. **Test behavior, not implementation**
3. **Pure functions when possible**
4. **Defer types to source libraries**
5. **Type predicates over boolean filters**
6. **No unused variables** (never prefix with `_`)
7. **Explicit over implicit**
8. **Fail fast with helpful errors**

### Quality Standards

- **Functions:** <50 lines ideal, <100 max
- **Cognitive complexity:** <30 (target: <10)
- **Type safety:** No `any`, minimize assertions
- **Test coverage:** Unit tests for all pure functions
- **Mutation score:** TBD (will set after Stryker setup)

---

## 📝 Recent Commits (October 25, 2025)

**Work completed in current session:**

1. ✅ **fix: resolve critical lint issues before dependency updates**
    - Fixed CodeMeta type safety (8 instances)
    - Fixed floating promise in samples-generator.ts
    - Fixed PATH security warning
    - Lint errors: 147 → 136

2. ✅ **feat: update openapi3-ts to v4.5.0**
    - Updated all imports to `openapi3-ts/oas30` (30+ files)
    - Fixed ResponseObject validations (added required `description` fields)
    - Fixed test fixtures for stricter OAS 3.0 types
    - All 311 tests passing

3. ✅ **test: verify OAS 3.0 and 3.1 runtime support**
    - Created comprehensive test suite
    - Verified full 3.0 & 3.1 feature support at runtime
    - Documented pragmatic type-level approach

4. 📋 **docs: plan multi-version OAS support for Phase 3E**
    - Added detailed section to `.agent/plans/03-FURTHER-ENHANCEMENTS.md`
    - High-level planning for post-ts-morph implementation
    - Estimated 22-31 hours when ready

5. 📋 **docs: update plans with task restructuring**
    - Moved Task 1.8 to Task 2.3 (defer logic analysis)
    - Added Task 2.2 (swagger-parser update)
    - Renumbered Task 2.2 → 2.4 (zod update)
    - Updated all references and TODO lists

6. ✅ **Task 2.2: verify swagger-parser at latest version**
    - Verified already at v12.1.0 (latest, published Oct 14, 2025)
    - Ran `pnpm update` - no changes needed
    - All 318 tests passing (7 new tests since last count)
    - No commit needed (already up-to-date)

7. ✅ **feat(Task 3.1): replace pastable with lodash-es + native + domain-specific utils**
    - Removed unmaintained pastable dependency (5+ years old)
    - Replaced with tree-shakeable lodash-es (get, pick, camelCase, sortBy)
    - Added native implementations (getSum, capitalize, sortBy) for zero-dep cases
    - Created domain-specific schema-sorting.ts with precise types
    - Added 55+ comprehensive unit tests for pure functions (TDD-driven)
    - All 373 tests passing (+55 from 318)
    - Duration: 3 hours

8. ✅ **fix: resolve Prettier 3.x formatting issue + comprehensive tests**
    - Upgraded Prettier v2 → v3.4.2 (latest)
    - Fixed maybePretty implementation (config loading + error handling)
    - Added 16 comprehensive tests for all formatting scenarios
    - All 318 tests passing

9. ✅ **docs: complete Task 2.3 defer logic analysis**
    - 3-phase analysis: openapi3-ts v4 + swagger-parser + refactoring plan
    - Finding: No major deferral opportunities - codebase already optimal
    - Custom code serves specific purposes not covered by libraries
    - Prioritized Phase 3 work (type assertions P0, pastable P1)
    - Duration: 2 hours (vs 4-6 estimated)

10. ✅ **feat: update zod to v4.1.12**
    - Upgraded zod v3.25.76 → v4.1.12 (latest stable)
    - All 334 tests passing (no breaking changes)
    - @zodios/core peer dependency warning expected (not a blocker)
    - Generated code works correctly with zod v4
    - Duration: 30 minutes

11. ⏳ **refactor(Task 3.2): eliminate type assertions - IN PROGRESS**
    - ✅ 11/15 files complete
    - Files: schema-sorting, generateJSDocArray, makeSchemaResolver, zodiosEndpoint.helpers, schema-complexity, inferRequiredOnly, template-context, openApiToZod, schema-complexity.helpers, zodiosEndpoint.operation.helpers, zodiosEndpoint.path.helpers
    - Verified clean: getZodiosEndpointDefinitionList.ts (only `as const` usages)
    - Patterns: type guards, honest types, narrowing, function simplification, fail-fast validation
    - Custom type guards: isRequestBodyObject, isParameterObject, isResponseObject
    - User improvements: AllowedMethod type, isAllowedMethod guard, PathItem = Partial<Record<...>>
    - ~41 assertions remaining (down from 71 → 65 → 55 → 51 → 47 → 43 → ~41)
    - All 373 tests passing after each fix
    - ~5.5 hours invested

12. 📋 **docs: nested $ref analysis and validation philosophy**
    - Analyzed OpenAPI 3.0/3.1/3.2 schemas
    - Finding: Nested $refs ARE valid per spec, but we require preprocessing
    - Decision: Fail-fast with clear error (intentional design choice)
    - Created: .agent/analysis/NESTED_REFS_ANALYSIS.md (344 lines)
    - Created: .agent/analysis/VALIDATION_AUDIT.md (205 lines)
    - Philosophy: Defer validation to swagger-parser, fail fast on preprocessing issues

**Branch:** `feat/rewrite`  
**Status:** Task 3.2 in progress (10/15 files, 47 assertions remaining, ~4.5 hours invested)

---

## 🚀 How to Continue

### For a Fresh Context

**Quick Start for Task 3.2 (P0 BLOCKER):**

1. ✅ Read this section (you are here) - Current state overview
2. 📋 Read "IMMEDIATE: Task 3.2" section above - What to do next
3. 📋 Read `.agent/plans/01-CURRENT-IMPLEMENTATION.md` Task 3.2 section - Detailed steps
4. ✅ Run Definition of Done - Should pass (currently passing with 373 tests)
5. 🚀 Execute Task 3.2 - Eliminate Type Assertions (16-24 hours, BLOCKER for extraction)

**Full Context for Planning:**

1. Read this file (context.md) for current state
2. Read `.agent/plans/00-STRATEGIC-PLAN.md` for overall strategy
3. Read `.agent/plans/01-CURRENT-IMPLEMENTATION.md` for all detailed tasks
4. Read `.agent/plans/02-MCP-ENHANCEMENTS.md` for Phase 2B (optional, after Phase 2)
5. Read `.agent/plans/03-FURTHER-ENHANCEMENTS.md` for Phase 3 (DX improvements + OAS multi-version)
6. Review `.agent/RULES.md` for coding standards (includes TDD mandate)
7. Check Definition of Done (should pass before starting work)

### Before Any Commit

Run Definition of Done:

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

All must pass (currently: ✅ passing)

---

**This is a living document. Update as decisions are made and work progresses.**
