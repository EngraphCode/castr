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
⚠️  lint       - 148 issues (see below)
✅ test        - Passing (297 tests)
```

**Definition of Done:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

✅ **Currently passing**

### Lint Status (CRITICAL ATTENTION REQUIRED)

- **Total:** 148 issues
- **Errors:** 74
- **Warnings:** 74

**EXTRACTION BLOCKER:**

- **74 type assertions** (`@typescript-eslint/consistent-type-assertions`)
- Target repo requires `assertionStyle: "never"` - NO type assertions allowed
- **Must fix before extraction to target monorepo**

**Other Critical Issues:**

- 10 `max-statements` violations
- 8 `@typescript-eslint/require-await` (dead async functions)
- 7 `sonarjs/function-return-type` (inconsistent return types)
- 4 `@typescript-eslint/no-non-null-assertion` (forbidden `!` operator)

Full breakdown: `.agent/context/CURRENT_LINT_OUTPUT.txt`

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
    "openapi3-ts": "^3", // Target: 4.5.0 (June 2025)
    "zod": "^3", // Target: 4.1.12 (Oct 2025)
    "@zodios/core": "^10.9.6", // Keep or replace?
    "openapi-types": "^12.1.3", // Keep or replace?
    "pastable": "^2.2.1", // REMOVE: replace with lodash/native
    "@apidevtools/swagger-parser": "^12.1.0", // Investigate integration
    "tanu": "^0.2.0", // TypeScript AST (keep)
    "commander": "^14.0.1", // CLI (keep)
    "ts-pattern": "^5.8.0", // Pattern matching (keep)
    "handlebars": "^4.7.8" // Templates (keep)
}
```

### Dependency Strategy

1. **Update FIRST:** `openapi3-ts` (v3 → v4.5.0), `zod` (v3 → v4.1.12)
2. **Remove:** `pastable` (replace with lodash or native code)
3. **Evaluate:** `openapi-types`, `@zodios/core` (maintenance status)
4. **Investigate:** What can we defer to `@apidevtools/swagger-parser`?

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

### Current Phase: Planning & Investigation

**Status:** Creating comprehensive task breakdown and investigation

**Key Insight:** Must update `openapi3-ts` and `zod` **BEFORE** deferring logic to libraries

---

## 🎯 Next Priorities

### Immediate (This Week)

1. **Type Assertion Elimination** (BLOCKER)
    - 74 instances must be resolved before extraction
    - Target repo: `assertionStyle: "never"`
    - Files: See `.agent/analysis/LINT_TRIAGE_CRITICAL.md`

2. **pastable Replacement**
    - 7 files use it: `get`, `capitalize`, `pick`, `sortBy`, `sortListFromRefArray`, `sortObjKeysFromArray`, `kebabToCamel`, `snakeToCamel`, `getSum`
    - Replace with lodash or native implementations
    - Remove dependency

3. **Dependency Updates**
    - openapi3-ts: v3 → v4.5.0
    - zod: v3 → v4.1.12
    - Document breaking changes, migration steps

### Short Term (Next 2 Weeks)

4. **openapi3-ts Investigation**
    - What type guards/utilities does it provide?
    - What can we defer instead of custom implementations?
    - Schema traversal, reference resolution, validation

5. **Dependency Evaluation**
    - `openapi-types`: Still needed with openapi3-ts v4?
    - `@zodios/core`: What do we use? Active maintenance?
    - `@apidevtools/swagger-parser`: Integration opportunities?

6. **Mutation Testing**
    - Add Stryker 9.2.0 (October 2025)
    - Integrate with Turbo
    - Establish mutation score threshold

### Medium Term (Next Month)

7. **ESLint Target Compliance**
    - Gap analysis vs `.agent/reference/reference.eslint.config.ts`
    - Prioritize remaining lint issues
    - Achieve full target repo compliance

8. **Final Cleanup**
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

### Reference

- **Coding Standards:** `.agent/RULES.md`
- **ADRs:** `.agent/adr/` (12 decision records)
- **Target ESLint Config:** `.agent/reference/reference.eslint.config.ts`
- **Lint Output:** `.agent/context/CURRENT_LINT_OUTPUT.txt`

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
