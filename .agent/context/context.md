# Living Context Document

**Last Updated:** October 27, 2025  
**Purpose:** Single source of truth for project state, decisions, and next steps

## 🚨 CRITICAL STATUS FOR FRESH CHAT

**Current Phase:** **PHASE 1 PART 1 - IN PROGRESS (60% COMPLETE)**

**Current State:** Core types refactored but helpers/tests incomplete. Quality gates failing.

**Next Priority:** Fix helper files and tests following TDD to restore green quality gates

**Timeline Remaining:**
- Phase 1 Part 1: 4-6 hours (context types & `makeSchemaResolver` elimination)
- Phase 1 Part 2: 6-8 hours (ts-morph migration)
- Phase 1 Part 3: 4-6 hours (Zodios removal)
- **Total:** ~14-20 hours over 1-2 weeks

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

**Phase 1 Part 1 (60% COMPLETE)** 🔧
- ✅ Core type system refactored: `resolver` → `doc`
- ✅ 11 files updated with new context types
- ❌ 2 helper files incomplete (13 locations)
- ❌ 3 test files need updates
- ⚠️ **Violated TDD** - changed API before writing tests

**Current Quality Gates (FAILING):**
```
✅ format:      PASSING
✅ build:       PASSING
❌ type-check:  46 errors (8 files)
❌ unit tests:  243/246 (3 failures)
❌ char tests:  40/100 (60 failures - cascade)
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

## 📦 Key Dependencies

```json
{
  "openapi3-ts": "^4.5.0",    // Updated from v3
  "zod": "^4.1.12",            // Updated from v3
  "@zodios/core": "^10.9.6",  // To be removed in Part 3
  "tanu": "^0.2.0",            // To be replaced with ts-morph in Part 2
  "handlebars": "^4.7.8"       // Template engine
}
```

**Note:** All major dependency updates complete. See archived docs for migration details.

---

## 🎯 What's Next

**Immediate (Next 4-6 hours):**
- Fix helper files following TDD (write tests first!)
- Update test files to use new context types
- Restore green quality gates (100/100 char tests, 246/246 unit tests)
- Complete Phase 1 Part 1

**After Part 1 Complete:**
- Part 2: ts-morph migration (6-8 hours)
- Part 3: Zodios removal (4-6 hours)

**Future Work:**
- Phase 2: MCP Enhancements (see `PHASE-2-MCP-ENHANCEMENTS.md`)
- Phase 3: DX Improvements (see `PHASE-3-FURTHER-ENHANCEMENTS.md`)

---

## 🔗 Key Documents

### Essential Reading

**Requirements & Standards:**
- **`requirements.md`** - 8 core project requirements
- **`.agent/RULES.md`** ⭐ - Coding standards, TDD mandate (MANDATORY)

**Current Work (Phase 1 - Split into 3 Parts):**
- **`PHASE-1-PART-1-CONTEXT-TYPES.md`** ⭐ - **IN PROGRESS (60%)** - Eliminate makeSchemaResolver
- **`PHASE-1-PART-2-TS-MORPH.md`** - ts-morph migration (blocked)
- **`PHASE-1-PART-3-ZODIOS-REMOVAL.md`** - Zodios removal (blocked)

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

3. **Read PHASE-1-PART-1-CONTEXT-TYPES.md** ⭐ - Current task details (5 min)
   - See "Current State" section for exact progress
   - See "Next Tasks" for what needs doing
   - See "Acceptance Criteria" for done definition

4. **Optional: Read requirements.md** - Project goals and constraints (5 min)

**Then verify current state:**
```bash
cd /Users/jim/code/personal/openapi-zod-client
pnpm character  # Currently: 40/100 (60 failures)
cd lib && pnpm test -- --run  # Currently: 243/246 (3 failures)
pnpm type-check  # Currently: 46 errors (8 files)
```

**Goal:** Fix helpers and tests following TDD to restore 100/100 baseline

### Definition of Done (Before Any Commit)

```bash
pnpm format && pnpm build && pnpm type-check && cd lib && pnpm test -- --run && cd .. && pnpm character
```

All must pass. Currently: ❌ FAILING (tech debt from API changes without tests)

---

**This is a living document. Update as decisions are made and work progresses.**
