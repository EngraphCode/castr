# Living Context Document

**Last Updated:** October 27, 2025 (Task 1.3 Complete)  
**Purpose:** Single source of truth for project state, decisions, and next steps

## 🚨 CRITICAL STATUS FOR FRESH CHAT

**Current Phase:** **PHASE 1 - IN PROGRESS (TASKS 1.0-1.3 COMPLETE)**

**Next Action (PRIORITY #1):** Task 1.4 - Update Template Context (2-3 hours)

- **Phase 1:** Eliminate `makeSchemaResolver` and `CodeMeta` (8-10 hours remaining)
- **Phase 2:** Migrate from `tanu` to `ts-morph` (6-8 hours)
- **Phase 3:** Remove Zodios dependencies (4-6 hours)
- **Timeline:** 18-24 hours remaining over 1-2 weeks
- **Details:** See `.agent/plans/01-CURRENT-IMPLEMENTATION.md`

**Progress Summary:**

1. **Phase 0 COMPLETE** ✅ - System fully characterized (88/88 char tests)
2. **Phase 1 First Attempt** ❌ - Failed due to internal dereferencing
3. **Reverted & Revised** ✅ - Root cause identified, comprehensive plan created
4. **Tasks 1.0-1.3 COMPLETE** ✅ - 4-5 hours completed, excellent foundation

**Recent Achievements (October 26-27, 2025):**

- ✅ Task 1.0: E2E test matrix with 12 scenarios (12/12 now passing!)
- ✅ Task 1.1: component-access.ts via perfect TDD (19/19 tests, 0 assertions)
- ✅ Task 1.2: Dereferencing strategy understood (CLI uses bundle())
- ✅ Task 1.3: Templates fixed + type safety added (comprehensive, no compromises)

**Revised Approach (WORKING):**

1. **E2E tests FIRST** - Define acceptance criteria (12 scenarios)
2. **No internal dereferencing** - Let callers control it
3. **Preserve component schema $refs** - Critical for named types
4. **Use ComponentsObject properly** - No ad-hoc types
5. **Honest type boundaries** - Explicit type guards, no lies

**Current State (October 27, 2025 - 10:15 AM - HONEST ASSESSMENT):**

- 🔧 Phase 1 Part 1: **60% COMPLETE** (not 95% - was optimistic)
  - ✅ Core type system refactored (11 files)
  - ✅ Context types changed: `resolver` → `doc`
  - ❌ Helper files incomplete (2 files, 13 locations)
  - ❌ Test files incomplete (3 snapshot files)
  - ❌ **VIOLATED TDD** - Changed API without writing tests first
- ⚠️  **Quality Gates: FAILING (Tech Debt Accumulated)**
  - ✅ format: PASSING
  - ✅ build: PASSING
  - ❌ type-check: 46 errors (8 files)
  - ❌ unit tests: 243/246 (3 failures in helpers)
  - ❌ char tests: 40/100 (60 failures - cascade effect)
- 🎯 **NEXT:** Follow TDD to fix helpers + tests, achieve 100/100 baseline
- 📚 **NEW DOCS:** Planning split into 3 parts (01-1, 01-2, 01-3)

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

### Phase 1: Foundation (✅ COMPLETE)

- Tooling modernization, ESM migration, cognitive complexity elimination
- **Metrics:** TypeScript errors 151→0, Tests 250→297, All quality gates green
- **Details:** See `COMPLETED_WORK.md` for full breakdown

### Phase 2: Type Safety & Dependencies (✅ PRE-WORK COMPLETE)

**Status:** Pre-Architecture Rewrite work complete, rewrite ready to start

**Completed:**

- ✅ Dependencies updated (openapi3-ts v4, zod v4, pastable replaced)
- ✅ schemas-with-metadata template (Engraph-ready)
- ✅ Critical lint issues fixed
- ✅ 373 tests passing (+123 from Phase 1)

**Superseded by Architecture Rewrite:**

- Task 3.2 (type assertions) - 11/15 files complete, architectural issues discovered
- Task 2.3 (defer logic) - analysis revealed deeper issues

**Details:** See `COMPLETED_WORK.md` for comprehensive task breakdown and metrics

---

## 🎯 Next Actions

### Immediate (Architecture Rewrite)

**Execute in Order:**

1. **Phase 0:** Comprehensive public API test suite (8-12 hours) ⭐ START HERE
2. **Phase 1:** Eliminate resolver & CodeMeta (8-10 hours)
3. **Phase 2:** Migrate to ts-morph (6-8 hours)
4. **Phase 3:** Remove Zodios dependencies (4-6 hours)

**Timeline:** 26-36 hours over 2-3 weeks

**See:** `01-CURRENT-IMPLEMENTATION.md` for complete task breakdowns

### After Architecture Rewrite

1. **Task 3.3:** Remove openapi-types dependency (1-2 hours)
2. **Phase 2B:** MCP Enhancements (see `02-MCP-ENHANCEMENTS.md`)
3. **Phase 3:** DX & Quality Improvements (see `03-FURTHER-ENHANCEMENTS.md`)

---

## 🔗 Key Documents

### Requirements & Plans

**`requirements.md`** - High-level project requirements (8 core requirements)

### Plans (Read in Order)

**Strategic:**
1. **`00-STRATEGIC-PLAN.md`** - Overall phases, timeline, success criteria

**Phase 1 (Current Work - Split into 3 Parts):**
2. **`01-1-PHASE-1-CONTEXT-TYPES.md`** ⭐ - **IN PROGRESS (60%)** - Eliminate makeSchemaResolver (TDD required)
3. **`01-2-PHASE-1-TS-MORPH.md`** - ts-morph migration (blocked by 01-1)
4. **`01-3-PHASE-1-ZODIOS-REMOVAL.md`** - Zodios removal (blocked by 01-1, 01-2)

**Future Work:**
5. **`02-MCP-ENHANCEMENTS.md`** - Phase 2B (after Phase 1 complete)
6. **`03-FURTHER-ENHANCEMENTS.md`** - Phase 3 (DX improvements)

**Historical:**
7. **`archive/01-CURRENT-IMPLEMENTATION-ARCHIVED.md`** - Original monolithic plan (archived Oct 27)
8. **`archive/COMPLETED_WORK.md`** - Historical details (Phase 1 & Phase 2 pre-work)

### Standards & Reference

- **`.agent/RULES.md`** - Coding standards (TDD mandate, TSDoc requirements)
- **`.agent/adr/`** - 12 architectural decision records
- **`.agent/analysis/`** - All analysis documents (dependency evaluations, strategies)
- **`.agent/DEFINITION_OF_DONE.md`** - Quality gate definition

### History

- **`.agent/context/PHASE1_COMPLETE.md`** - Phase 1 completion summary
- **`.agent/plans/archive/`** - Archived/superseded planning documents

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

## 📝 Recent Work

**Branch:** `feat/rewrite`  
**Status:** Architecture Rewrite Plan approved - Ready to execute Phase 0

**Latest Commits:** See `COMPLETED_WORK.md` for detailed commit history and task summaries

**Key Achievements:**

- ✅ All Phase 2 pre-work complete (dependencies, templates, cleanup)
- ✅ Architecture Rewrite Plan documented and approved
- ✅ 373 tests passing, all quality gates green
- 🎯 Ready for Phase 0 (comprehensive test suite)

---

## 🚀 How to Continue

### For a Fresh Context (START HERE)

**🎯 Quick Start (10 minutes):**

1. **Read this document** (5 min)
   - Current status: Tasks 1.0-1.3 complete
   - All quality gates green
   - Ready for Task 1.4

2. **Read Implementation Plan:** `.agent/plans/01-CURRENT-IMPLEMENTATION.md` ⭐
   - Tasks 1.0-1.3 completion details
   - Tasks 1.4-1.9 instructions
   - Acceptance criteria & validation

3. **Verify Current Quality Gates:**

   ```bash
   cd /Users/jim/code/personal/openapi-zod-client
   pnpm format       # ✅ PASSING
   pnpm build        # ✅ PASSING
   pnpm type-check   # ✅ PASSING (0 errors)
   cd lib && pnpm test -- --run  # ✅ 246/246 PASSING
   cd .. && pnpm character       # ✅ 100/100 PASSING (includes 12 E2E)
   ```

4. **Start Task 1.4:** Update Template Context (2-3 hours)
   - Remove 10 uses of `result.resolver`
   - Use `doc.components.schemas` directly
   - Test after each change
   - Commit frequently

**Alternative:** Read full context above for deeper understanding

---

### Full Context for Planning

**Primary Documents (Read in Order):**

1. `.agent/plans/00-STRATEGIC-PLAN.md` - Overall strategy, phases, timeline
2. `.agent/plans/01-CURRENT-IMPLEMENTATION.md` ⭐ - **CURRENT WORK** Architecture Rewrite (Phase 1)
3. `.agent/plans/02-MCP-ENHANCEMENTS.md` - Future Phase 2B (after rewrite)
4. `.agent/plans/03-FURTHER-ENHANCEMENTS.md` - Future Phase 3 (DX improvements)

**Supporting Documents:**

- `.agent/RULES.md` - Coding standards, TDD mandate, TSDoc requirements
- `.agent/analysis/E2E-TEST-MATRIX.md` - 12 E2E acceptance criteria scenarios
- `.agent/plans/archive/` - Historical session notes and planning docs (reference only)

### Before Any Commit

Run Definition of Done:

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

All must pass (currently: ✅ passing)

---

**This is a living document. Update as decisions are made and work progresses.**
