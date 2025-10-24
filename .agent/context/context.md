# Living Context Document

**Last Updated:** October 24, 2025  
**Purpose:** Single source of truth for project state, decisions, and next steps

---

## 🎯 Project Goal

**Modernize `openapi-zod-client` fork to extract and port to Oak National Academy monorepo**

The extracted components will generate strict Zod schemas and MCP tool validation from OpenAPI 3.0/3.1 specifications for the Oak Curriculum SDK.

**Target Repository:** `oak-national-academy-monorepo`  
**Use Case:** Auto-generate request/response validators for MCP tools wrapping Oak API endpoints  
**Source API:** https://open-api.thenational.academy/api/v0/swagger.json

---

## 📊 Current Status (October 24, 2025)

### Quality Gates

```bash
✅ format      - Passing
✅ build       - Passing (ESM + CJS + DTS)
✅ type-check  - Passing (0 errors)
⚠️  lint       - 146 issues (see below)
✅ test        - Passing (297 tests)
```

**Definition of Done:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

✅ **Currently passing**

### Lint Status (CRITICAL ATTENTION REQUIRED)

- **Total:** 146 issues
- **Errors:** 72
- **Warnings:** 74

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

**Other Critical Issues:**

- 3 `max-statements` violations (down from 10)
- 2 `max-lines-per-function` violations
- 2 `require-await` (dead async functions)
- 2 `no-clear-text-protocols` (http in tests)
- 2 `no-os-command-from-path` (security)
- 1 `restrict-template-expressions`
- 1 `different-types-comparison`
- 1 `no-floating-promises`
- 1 `todo-tag`

**Analysis Complete:** All 146 issues categorized by priority with file-by-file elimination plan

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
    "openapi3-ts": "^3", // Target: 4.5.0 (June 2025) - ✅ Migration plan ready
    "zod": "^3", // Target: 4.1.12 (Oct 2025) - ✅ Update ready
    "@zodios/core": "^10.9.6", // ✅ KEEP (used in templates, maintenance mode but stable)
    "openapi-types": "^12.1.3", // ⚠️ REMOVE (redundant with openapi3-ts v4)
    "pastable": "^2.2.1", // ⚠️ REMOVE (replace with lodash-es + custom)
    "@apidevtools/swagger-parser": "^12.1.0", // ✅ KEEP (actively maintained, used appropriately)
    "tanu": "^0.2.0", // ✅ KEEP (TypeScript AST manipulation)
    "commander": "^14.0.1", // ✅ KEEP (CLI framework)
    "ts-pattern": "^5.8.0", // ✅ KEEP (pattern matching)
    "handlebars": "^4.7.8" // ✅ KEEP Phase 2, evaluate ts-morph emitter Phase 3/4
}
```

### Dependency Strategy (✅ ANALYSIS COMPLETE)

**Phase 2 Actions:**

1. **Update FIRST:** `openapi3-ts` (v3 → v4.5.0), `zod` (v3 → v4.1.12)
   - Migration checklist ready in `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md`
2. **REMOVE:** `pastable` → Replace with `lodash-es` + custom utilities
   - Detailed plan in `.agent/analysis/PASTABLE_REPLACEMENT_PLAN.md`
3. **REMOVE:** `openapi-types` → Use `openapi3-ts` v4 types
   - Only used in 1 test file, redundant
4. **KEEP:** `@zodios/core`, `@apidevtools/swagger-parser`
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

### Phase 2: Type Safety & Dependencies (✅ ANALYSIS COMPLETE, READY FOR IMPLEMENTATION)

**Status:** All 7 investigation tasks complete, ready to execute implementation

**Analysis Documents Created:**
- ✅ `LINT_TRIAGE_COMPLETE.md` - All 146 issues categorized, type assertions mapped
- ✅ `PASTABLE_REPLACEMENT_PLAN.md` - 8 functions → lodash-es + custom, detailed plan
- ✅ `OPENAPI_TYPES_EVALUATION.md` - REMOVE (redundant with openapi3-ts v4)
- ✅ `ZODIOS_CORE_EVALUATION.md` - KEEP (stable, used in templates)
- ✅ `SWAGGER_PARSER_INTEGRATION.md` - KEEP (actively maintained, good usage)
- ✅ `OPENAPI3_TS_V4_INVESTIGATION.md` - Complete migration checklist, breaking changes
- ✅ `HANDLEBARS_EVALUATION.md` - KEEP Phase 2, ts-morph emitter for Phase 3/4

**Key Insights:**
- Must update `openapi3-ts` and `zod` **BEFORE** deferring logic to libraries
- Type assertions concentrated in 4 files (can be systematically eliminated)
- All dependency decisions made with clear rationale

---

## 🎯 Next Priorities

### Immediate (This Week) - Phase 2 Implementation

**✅ ANALYSIS COMPLETE - Ready to execute:**

1. **Dependency Updates** (MUST DO FIRST - Task 2.1, 2.2)
    - openapi3-ts: v3 → v4.5.0 (migration checklist ready)
    - zod: v3 → v4.1.12 (update plan ready)
    - **Estimated:** 8-12 hours

2. **pastable Replacement** (Task 3.1)
    - 7 files, 8 functions → `lodash-es` + custom utilities
    - Detailed plan in PASTABLE_REPLACEMENT_PLAN.md
    - **Estimated:** 6-8 hours

3. **Type Assertion Elimination** (BLOCKER - Task 3.2)
    - 74 instances across 11 files must → 0
    - Target repo: `assertionStyle: "never"`
    - File-by-file elimination plan ready
    - **Estimated:** 16-24 hours

4. **Dependency Cleanup** (Task 3.3)
    - Remove: `openapi-types` (redundant)
    - Remove: `pastable` (after replacement)
    - Keep: `@zodios/core`, `@apidevtools/swagger-parser` (justified)
    - **Estimated:** 2-4 hours

5. **Defer Logic to openapi3-ts v4** (Task 1.8)
    - Analyze what custom code can be replaced
    - Leverage new v4 capabilities
    - After Task 2.1 complete
    - **Estimated:** 3-4 hours

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

### Analysis (✅ Phase 2 Investigation Complete)

- **Lint Triage:** `.agent/analysis/LINT_TRIAGE_COMPLETE.md` (146 issues categorized)
- **pastable Plan:** `.agent/analysis/PASTABLE_REPLACEMENT_PLAN.md` (8 functions → replacements)
- **openapi-types:** `.agent/analysis/OPENAPI_TYPES_EVALUATION.md` (REMOVE - redundant)
- **@zodios/core:** `.agent/analysis/ZODIOS_CORE_EVALUATION.md` (KEEP - stable)
- **swagger-parser:** `.agent/analysis/SWAGGER_PARSER_INTEGRATION.md` (KEEP - good usage)
- **openapi3-ts v4:** `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md` (Migration checklist)
- **Handlebars:** `.agent/analysis/HANDLEBARS_EVALUATION.md` (ts-morph emitter recommended)

### Reference

- **Coding Standards:** `.agent/RULES.md`
- **ADRs:** `.agent/adr/` (12 decision records)
- **Target ESLint Config:** `.agent/reference/reference.eslint.config.ts`
- **Emitter Architecture:** `.agent/reference/openapi-zod-client-emitter-migration.md`

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

1. **Not creating PRs** - Extracting to Oak National Academy monorepo instead
2. **Update dependencies first** - Before deferring to libraries
3. **Type safety paramount** - Follow all RULES.md standards
4. **Comprehensive testing** - Mutation testing with Stryker
5. **Documentation-first** - Every decision recorded, every task detailed

---

## 📝 Working Philosophy

### From RULES.md

1. **Test behavior, not implementation**
2. **Pure functions when possible**
3. **Defer types to source libraries**
4. **Type predicates over boolean filters**
5. **No unused variables** (never prefix with `_`)
6. **Explicit over implicit**
7. **Fail fast with helpful errors**

### Quality Standards

- **Functions:** <50 lines ideal, <100 max
- **Cognitive complexity:** <30 (target: <10)
- **Type safety:** No `any`, minimize assertions
- **Test coverage:** Unit tests for all pure functions
- **Mutation score:** TBD (will set after Stryker setup)

---

## 🚀 How to Continue

### For a Fresh Context

1. Read this file (context.md) for current state
2. Read `.agent/plans/00-STRATEGIC-PLAN.md` for overall strategy
3. Read `.agent/plans/01-CURRENT-IMPLEMENTATION.md` for detailed next steps
4. Review `.agent/RULES.md` for standards
5. Check Definition of Done (should pass before starting work)
6. Follow the implementation plan tasks in order

### Before Any Commit

Run Definition of Done:

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

All must pass (currently: ✅ passing)

---

**This is a living document. Update as decisions are made and work progresses.**
