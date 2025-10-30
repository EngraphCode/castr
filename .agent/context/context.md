# Living Context Document

**Last Updated:** October 29, 2025  
**Purpose:** Single source of truth for project state, decisions, and next steps

## 🚨 CRITICAL STATUS FOR FRESH CHAT

**Current Phase:** **PHASE 1 PART 4 - IN PROGRESS (50% complete) 🚀**

**Previous Completions:**

- Phase 1 Part 1: ✅ COMPLETE (100%)
- Phase 1 Part 2: ✅ COMPLETE (100%)
- Phase 1 Part 3: ✅ COMPLETE (100%)

**Current Task:** Zero Lint Errors - Systematic Refactoring

**🎯 PART 4 PROGRESS (55% COMPLETE - Latest: 2025-10-29 Night - MAJOR BREAKTHROUGH!):**

**🏆 MAJOR ACHIEVEMENT: TWO GOD FUNCTIONS COMPLETELY DECOMPOSED!**

- **✅ openApiToZod.ts** - COMPLETE DECOMPOSITION (12 TDD Phases, 15 commits):
  - Main `getZodSchema`: 323→<50 lines (-85%!) 🎉
  - `handleObjectSchema`: 108→<50 lines 🎉
  - `buildObjectPropertiesString`: 60→<50 lines 🎉
  - 13 pure helper functions extracted (reference, composition, array, primitive, object, etc.)
  - Pattern proven: Systematic TDD - RED → GREEN → REFACTOR
  - All 744 tests passing, build ✅, strict type safety maintained
  - Remaining: 16 errors (file size 803 lines, helper complexity issues)

- **✅ getEndpointDefinitionList.ts** - COMPLETE DECOMPOSITION (3 TDD Phases, 2 commits):
  - Main function: 127→<50 lines (-60%!) **ZERO ERRORS!** 🎉
  - 3 pure helpers: `prepareEndpointContext`, `processAllEndpoints`, `emitResponseWarnings`
  - Remaining: 6 errors in `processAllEndpoints` helper (75 lines, complexity 13)

- **✅ getOpenApiDependencyGraph.ts** - ZERO lint errors (from previous session)

**Completed Foundation Work:**

- ✅ endpoint-operation/ directory: ZERO errors (5 focused modules from 385-line monolith)
- ✅ `endpoint.path.helpers.ts`: 245 lines (was 303), no assertions
- ✅ `generateJSDocArray.ts`: 74→18 lines, 15 new tests
- ✅ `endpoint.helpers.ts`: Complexity fixes (3 functions, 2 errors remain)
- ✅ Quick wins: CodeMeta, cli-type-guards, maybePretty, sorting, TODOs, @ts-nocheck
- ✅ **Task 4.5:** Deprecated types (-14 errors)
- ✅ **Task 4.4:** Explicit return types (-10 errors)
- ✅ **Task 4.6:** Critical test issues (-14 errors)
- ✅ **Task 4.8:** Sorting & safety (-10 errors)

**📊 LINT PROGRESS:** 263 → 215 → 209 → **207 errors** (-56 total, **-21.3%** reduction)

**Production Status (11 files, ~73 errors):**

**Remaining God Functions (Priority Order):**
1. `template-context.ts`: 13 errors (251-line function, complexity 28) 🎯 **NEXT TARGET - STRATEGIC PRIORITY**
   - ⚠️ **Special Constraint:** Decompose into VERY GRANULAR single-responsibility functions
   - Reason: Future Handlebars → ts-morph migration
   - Target: 15-20 small pure functions (<30 lines, <5 complexity each)
   - Strategy: Separate data gathering, transformation, validation, assembly
2. `generateZodClientFromOpenAPI.ts`: 7 errors (146-line function, complexity 23)
3. `schema-complexity.ts`: 4 errors (116-line function, complexity 21)
4. `openApiToTypescript.ts`: 8 errors (157+126-line functions, complexity 35)
5. `cli.ts`: 6 errors (86-line function, complexity 30)

**File Size + Minor Issues:**
6. `openApiToZod.ts`: 16 errors (803-line file - needs splitting)
7. `openApiToTypescript.helpers.ts`: 6 errors (325-line file, 2 assertions)
8. `openApiToTypescript.string-helpers.ts`: 2 errors (375-line file)
9. `getEndpointDefinitionList.ts`: 6 errors (processAllEndpoints helper)
10. `endpoint.helpers.ts`: 2 errors (274-line file)
11. `utils.ts`: 6 errors (control chars - needs eslint-disable)

**Test Files:** ~134 errors (acceptable - pragmatic approach)

**✅ All Quality Gates:** format ✅, build ✅, type-check ✅, test (744/744) ✅
**📝 Session Commits:** 17 clean TDD commits
**🎯 Next Target:** template-context.ts (biggest remaining god function)

**Strategy Working:**

- Systematic decomposition of God functions
- TDD approach: all tests green at each step
- Focus on production code first (tests later)
- Zero tolerance for type assertions and complexity

**⚠️ STRATEGIC CONSTRAINT: Template Code Decomposition**

All template-related code (template-context.ts, generateZodClientFromOpenAPI.ts) must be decomposed into **VERY GRANULAR** single-responsibility functions:
- **Reason:** Future Handlebars → ts-morph migration (Phase 2)
- **Target:** Each function <30 lines, <5 complexity, ONE responsibility
- **Pattern:** Separate data gathering, transformation, validation, assembly
- **Benefit:** Easy to replace transformation functions while keeping data gathering
- **Example:** `transformSchemaForTemplate` → `buildSchemaAstNode` (ts-morph)
- **Goal:** Enable incremental migration without rewriting everything

**🎉 PART 3 COMPLETE - ZODIOS REMOVED:**

- **✅ COMPLETED:** Zodios completely removed, openapi-fetch integration
- **✅ RESULT:** Clean, documented, type-safe client generation
- **✅ QUALITY:** 605/605 tests passing

**🎉 PART 2 COMPLETE - MAJOR SUCCESS:**

- **✅ COMPLETED:** ALL tanu eliminated from entire codebase!
- **✅ RESULT:** String-based type generation fully operational
- **✅ QUALITY:** 669/669 tests ALL PASSING (403 unit + 115 char + 151 snapshot)
- **✅ IMPROVEMENT:** 0 type errors, lint 126→99 (-18.8%), net -179 lines
- **✅ SPEED:** Completed in 1.5 hours (estimated 6-8 hours!)

**Phase 1 Part 3 (Historical Summary):**

- ✅ Zodios fully removed and replaced with `openapi-fetch` + Zod validation
- ✅ Templates, CLI flags, and docs updated to match new client strategy
- ✅ Library now fails fast with descriptive errors for malformed schemas
- ✅ Zero Zodios references remain in source, tests, or docs

**Phase 1 Part 4 (Active):**

- 🎯 Goal: Drive production lint errors to zero under Engraph standards
- 🧭 Approach: Systematic decomposition + TDD-driven type guard coverage
- 📉 Remaining: ~38 production lint violations, 259 total (down from 271)

**Current Status (Ready for Part 3):**

- ✅ Part 1: Context types refactored, makeSchemaResolver removed
- ✅ Part 2: Tanu completely removed, string-based generation proven
- 🎯 Part 3: Remove Zodios, create simple fetch-based client (4-6 hours)

**Key Architecture Success:**

- String-based generation: PROVEN and working perfectly!
- All-in non-incremental strategy: VINDICATED - no tech debt
- TDD throughout: All tests green, zero regressions
- Zero tanu references: Completely eliminated

**Timeline Update:**

- Phase 1 Part 1: ✅ COMPLETE
- Phase 1 Part 2: ✅ COMPLETE (ahead of schedule!)
- Phase 1 Part 3: 🎯 4-6 hours (Zodios removal + simple client)
- **Total Remaining:** ~4-6 hours

---

## What's Been Done (Phase 1 Journey)

**Phase 0 (COMPLETE)** ✅

- 88/88 characterisation tests passing
- System fully documented and understood

**Phase 1 First Attempt (FAILED)** ❌

- Added internal dereferencing - broke semantic naming
- 40/88 tests failed
- Root cause: removed `$ref`s needed for component schema naming

**Revert & Redesign (COMPLETE)** ✅

- Identified root cause
- Created E2E test matrix (12 scenarios)
- Revised approach with proper principles

**Phase 1 Part 1 (100% COMPLETE)** ✅

- ✅ Core type system refactored: `resolver` → `doc`
- ✅ 11 files updated with new context types
- ✅ 2 helper files completed (13 locations fixed)
- ✅ All test files updated (unit + snapshot)
- ✅ `makeSchemaResolver` deleted (zero uses)
- ✅ **BONUS:** Unified validation architecture implemented
- ✅ **TDD followed** - recovered from violation with comprehensive tests

**Final Quality Gates (ALL GREEN):**

```
✅ format:      PASSING
✅ build:       PASSING
✅ type-check:  0 errors (down from 46)
✅ unit tests:  286/286 (up from 243, +43 tests)
✅ char tests:  115/115 (up from 40, +75 tests)
✅ snapshot:    151/151 (33 snapshots updated)
✅ total tests: 552/552 (100%)
```

---

## Architecture Principles (Critical!)

**DO ✅**

- Use `ComponentsObject` from `openapi3-ts/oas30`
- Preserve component schema `$ref`s (needed for naming)
- Handle both dereferenced AND non-dereferenced specs
- Follow TDD: Write tests FIRST, then implement
- Test after EVERY change

**DON'T ❌**

- Add internal `SwaggerParser.dereference()` calls
- Use `assertNotReference` everywhere (too aggressive)
- Create ad-hoc types instead of `ComponentsObject`
- Change APIs without writing tests first
- Skip running tests between changes

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

## 📊 Current Status (October 29, 2025)

### Quality Gates (Daily Baseline)

```
✅ format      - Passing
✅ build       - Passing (ESM + CJS + DTS)
✅ type-check  - Passing (0 errors)
✅ test        - 729/729 passing (453 unit + 124 char + 152 snapshot across 104 files)
❌ lint        - 239 errors (strict Engraph rules, down from 263)
```

- Latest runs: `pnpm type-check`, `pnpm test:all` executed 2025-10-29 PM
- Lint remains intentionally failing until Phase 1 Part 4 completes (target = 0)

### Lint Status (Strict Rules)

- **Total:** 207 errors (263 → 207, net -56 this session, **-21.3%**)
- **Production:** ~73 errors across 11 files
- **Tests:** ~134 errors (acceptable in pragmatic approach)
- **Session wins:** 
  - Task 4.2: openApiToZod (-6), getEndpointDefinitionList (-1)
  - Task 4.5: deprecated types (-14)
  - Task 4.4: return types (-10)
  - Task 4.6: test issues (-14)
  - Task 4.8: sorting/safety (-10)
- **Top remaining hotspots:** 
  1. `template-context.ts` (13 errors) 🎯 **NEXT**
  2. `openApiToZod.ts` (16 errors - file size)
  3. `generateZodClientFromOpenAPI.ts` (7 errors)
  4. `openApiToTypescript.ts` (8 errors)
  5. Other files (29 errors combined)

### Type Assertions & Unsafe Patterns

- **Type assertions (`as`):** trending downward (eliminated in `endpoint.path.helpers.ts` and quick-win files)
- **Explicit `any` / unsafe casts:** none introduced
- **Deprecated types:** `EndpointDefinitionWithRefs` now isolated with TODO for replacement

**EXTRACTION BLOCKER STATUS - MAJOR IMPROVEMENT:**

- **Type assertions:** 44 remaining (down from 62, from 74!)
- **Part 2 Impact:** Eliminated 26 type assertions from TS generation (-86.7%)
- **Current distribution:**
  - `openApiToTypescript.ts` - 0 (was 17!)
  - `openApiToTypescript.helpers.ts` - 4 (was 28!, legitimate narrowing only)
  - `getZodiosEndpointDefinitionList.ts` - 8 assertions
  - `inferRequiredOnly.ts` - 7 assertions
  - Other files - 25 (scattered)

**Recent Progress (Part 2):**

- ✅ ALL tanu removed from codebase
- ✅ TS generation: 4 assertions (down from 30, -86.7%)
- ✅ Code quality: net -179 lines
- ✅ Type safety: eliminated tanu type lies
- ✅ Lint: 99 issues (target <100 achieved!)

**Target After Part 3:**

- Type assertions: ~35-40 (may reduce a few more in Zodios removal)
- Lint total: Maintain <100 issues
- Ready for extraction to target monorepo

**Remaining Critical Issues:**

- ~50 type assertions (down from 74, target: 32)
- 3 `max-statements` violations
- 2 `max-lines-per-function` violations
- 2 `require-await` (dead async functions)
- Other minor issues

**Analysis:** Detailed breakdown in `.agent/analysis/LINT_TRIAGE_COMPLETE.md`

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

## 📦 Key Dependencies

```json
{
  "openapi3-ts": "^4.5.0", // Updated from v3
  "zod": "^4.1.12", // Updated from v3
  "@zodios/core": "^10.9.6", // To be removed in Part 3
  "typescript": "^5.x", // Native TS compiler API (replaced tanu)
  "handlebars": "^4.7.8" // Template engine
}
```

**Note:** All major dependency updates complete. See archived docs for migration details.

---

## 🎯 What's Next

**Immediate (Next 4-6 hours): Part 3 - Zodios Removal**

- **Task 3.1:** Audit Zodios usage (30 min)
  - Find all @zodios/core references
  - Document replacement strategy
- **Task 3.2:** Define local types (1 hour, TDD)
  - Create `EndpointDefinition` type
  - Replace `ZodiosEndpointDefinition` imports
  - Update all type references
- **Task 3.3:** Delete Zodios templates (30 min)
  - Remove `default.hbs` and `grouped.hbs`
  - Update template registry
- **Task 3.4:** Create simple client template (2-3 hours, TDD)
  - Design fetch-based client API
  - Generate type-safe methods
  - Request/response validation
- **Task 3.5:** Update CLI & defaults (30 min)
  - Default: `schemas-with-client`
  - `--no-client`: `schemas-with-metadata`
- **Task 3.6:** Remove dependency & validate (1 hour)
  - Remove @zodios/core
  - Full quality gates
  - Zero peer dependency warnings

**Future Work:**

- Phase 2: MCP Enhancements
- Phase 3: DX Improvements

**🎉 Achievement:** Part 2 complete ahead of schedule! (1.5 hours vs 6-8 estimated)

---

## 🔗 Key Documents

### Essential Reading

**Requirements & Standards:**

- **`requirements.md`** - 8 core project requirements
- **`.agent/RULES.md`** ⭐ - Coding standards, TDD mandate (MANDATORY)

**Current Work (Phase 1 - Split into 3 Parts):**

- **`PHASE-1-PART-1-CONTEXT-TYPES.md`** - ✅ COMPLETE - Eliminated makeSchemaResolver, unified validation
- **`PHASE-1-PART-2-TS-MORPH.md`** - ✅ COMPLETE - Tanu eliminated, string-based generation proven
- **`PHASE-1-PART-3-ZODIOS-REMOVAL.md`** ⭐ - **NEXT** - Zodios removal + simple client (ready to start)

**Reference:**

- **`.agent/analysis/E2E-TEST-MATRIX.md`** - 12 acceptance criteria scenarios
- **`00-STRATEGIC-OVERVIEW.md`** - Overall phases, timeline
- **`PHASE-2-MCP-ENHANCEMENTS.md`** - Future work
- **`.agent/adr/`** - 12 architectural decision records

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

## 🚀 How to Continue (Fresh Chat)

**🎯 Quick Start (10-15 minutes):**

1. **Read context.md** (THIS FILE) - Current status and principles (5 min)

2. **Read RULES.md** - TDD mandate and coding standards (5 min)

3. **Read PHASE-1-PART-2-TS-MORPH.md** ⭐ - Next task details (5 min)
   - See "WHY: Impact & Purpose" for motivation
   - See "Implementation Steps" for detailed TDD workflow
   - See "Acceptance Criteria" for done definition

4. **Optional: Read requirements.md** - Project goals and constraints (5 min)

**Then verify current state:**

```bash
cd /Users/jim/code/personal/openapi-zod-client
pnpm test:all  # Should be: 552/552 (100%)
pnpm type-check  # Should be: 0 errors
pnpm lint  # Should be: 124 issues (baseline)
```

**Goal:** Migrate from `tanu` to `ts-morph` to eliminate type assertions in TypeScript generation

### Definition of Done (Before Any Commit)

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test:all
```

All must pass. Currently: ✅ PASSING (ready for Part 2!)

---

**This is a living document. Update as decisions are made and work progresses.**

> **Historical Snapshot (Phase 1 Parts 2 & 3)** – retained for reference when comparing long-term progress.
>
> - Type assertions dropped from 74 → 44 during Part 2 (TS generation cleanup)
> - Zodios removal (Part 3) eliminated the client dependency and aligned templates/CLI
> - Lint count previously held at 99 issues under pre-Engraph rules (now superseded by strict 259 baseline)
> - Historical distribution (now stale):
>   - `openApiToTypescript.ts` 17 → 0 assertions
>   - `openApiToTypescript.helpers.ts` 28 → 4 assertions
>   - `getZodiosEndpointDefinitionList.ts` 8 assertions (awaiting rewrite)
>   - `inferRequiredOnly.ts` 7 assertions (currently being refactored)
> - Legacy targets post-Part 3: maintain <100 lint issues, ~35 assertions (superseded by Part 4 plan)
>
> Detailed archives live in `.agent/analysis/LINT_TRIAGE_COMPLETE.md` and `.agent/plans/PHASE-1-PART-3-ZODIOS-REMOVAL.md`.
