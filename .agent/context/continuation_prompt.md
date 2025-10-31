# Phase 1 Part 4 Continuation Prompt

**Purpose:** Use this prompt to spin up a fresh chat and resume **Phase 1 Part 4: Zero Lint Errors (Perfect)** for the `openapi-zod-validation` modernization.

---

## Prompt for AI Assistant

I'm working on the `openapi-zod-validation` modernization project. This is a TypeScript library that generates Zod validation schemas and type-safe API clients from OpenAPI 3.0/3.1 specifications.

**Project Context:**

- **Repository:** Local fork at `/Users/jim/code/personal/openapi-zod-client`
- **Branch:** `feat/rewrite`
- **Goal:** Modernize and extract to Engraph monorepo
- **Tech Stack:** TypeScript, Zod, OpenAPI 3.x, Handlebars (future: ts-morph), Vitest

**Journey So Far:**

- ✅ Phase 1 Part 1: Context types refactored
- ✅ Phase 1 Part 2: Tanu eliminated, string-based TS generation
- ✅ Phase 1 Part 3: Zodios removed, openapi-fetch integration
- 🎯 Phase 1 Part 4: **IN PROGRESS (95% complete - NEARLY DONE!)** - Drive all production lint errors to zero

**Current Objective:**
We are mid-way through **Phase 1 Part 4**, whose goal is to drive **all production lint errors to zero** under Engraph's strict standards while keeping every quality gate green.

### Required Reading (in order)

1. `.agent/context/context.md` – Living status, recent wins, remaining risks (5 min)
2. `.agent/RULES.md` – Coding standards & TDD mandate (10 min, mandatory)
3. `.agent/plans/PHASE-1-PART-4-ZERO-LINT.md` – Active plan with task breakdown (10 min)
4. `.agent/plans/requirements.md` – Project-level constraints (optional refresher)

### Current State (2025-10-31 - LINT RULES UPDATED!)

- ✅ `pnpm format`, `pnpm build`, `pnpm type-check`, `pnpm test:all` (641/641 passing: 489 unit + 152 snapshot)
- ❌ `pnpm lint` → **326 total** (20 production + 19 script + 287 test)
- **🎉 MASSIVE IMPROVEMENT:** 263 → **20 production errors** (-243, **-92.4%** reduction!)
- **Production:** 20 errors (12 files) | **Scripts:** 19 errors | **Tests:** 287 errors (acceptable)

**🏆 MAJOR ACHIEVEMENTS:**

**God Functions Decomposed (7 complete):**

- ✅ **template-context.ts**: 251→47 lines, split into 5 modules, 0 errors in split files
- ✅ **openApiToZod.ts**: 323→18 lines, split into 7 modules, 0 errors in all files
- ✅ **openApiToTypescript.ts**: 157→18 lines, split into 2 files
- ✅ **cli.ts**: 86→23 lines, split into 2 files, 0 errors
- ✅ **schema-complexity.ts**: 116→18 lines, 0 errors
- ✅ **generateZodClientFromOpenAPI.ts**: 146→49 lines (needs file split)

**Files with Zero Errors (16 production files):**

- cli.ts, cli.helpers.ts, openApiToTypescript.ts
- template-context.schemas.ts, template-context.common.ts, template-context.endpoints.ts
- schema-complexity.ts, endpoint-operation/ (5 files)
- getOpenApiDependencyGraph.ts, endpoint.path.helpers.ts

**✅ Lint Rules Updated (2025-10-31):**

- Function line limit: 200 → 500 (pragmatic for comprehensive tests)
- File line limit: 2000 → 1000 (more focused modules)
- ESLint caching enabled (faster linting!)
- New rule: `@typescript-eslint/explicit-function-return-type`
- New rule: `@typescript-eslint/no-deprecated`

**Latest Completions:**

- ✅ File splitting: openApiToZod.ts (7 modules), template-context (5 modules)
- ✅ Seven god functions decomposed: openApiToZod, template-context, openApiToTypescript, cli, schema-complexity, generateZodClientFromOpenAPI
- ✅ 23 production files with ZERO errors
- ✅ All quality gates passing
- ✅ Lint rule changes made testing much more pragmatic

### Immediate Goal

Finish Phase 1 Part 4 by eliminating the remaining production lint violations through TDD-driven refactors (size, complexity, assertions, logging). Test code quality can remain “pragmatic” once critical issues are cleared.

### Remaining Work (20 production errors, 12 files) - FINAL SPRINT!

**Priority 1: Missing Return Types (6 errors, 5 files) - QUICK WIN! <1 hour**

- `getEndpointDefinitionList.ts:89` - missing return type
- `inferRequiredOnly.ts:56` - missing return type
- `template-context.types.ts:14` - missing return type
- `topologicalSort.ts:5` - missing return type
- `openApiToZod.chain.ts:39` - function return type inconsistent
- `openApiToZod.chain.ts:54` - function return type inconsistent

**Priority 2: Complexity Issues (5 errors, 3 files) - MEDIUM: 2-3 hours**

- `endpoint.helpers.ts:208` - complexity 9 (handleSimpleSchemaWithFallback)
- `openApiToTypescript.helpers.ts:72` - complexity 9 (handleReferenceObject)
- `openApiToTypescript.helpers.ts:143` - complexity 9 + cognitive 9 (handlePrimitiveEnum)
- `openApiToZod.chain.ts:88` - cognitive complexity 9

**Priority 3: Type Assertions (3 errors, 2 files) - MEDIUM: 1-2 hours**

- `openApiToTypescript.helpers.ts:310` - type assertion
- `openApiToTypescript.helpers.ts:325` - type assertion
- `template-context.endpoints.ts:159` - type assertion

**Priority 4: Code Quality (2 errors, 2 files) - QUICK WIN: <30 min**

- `openApiToTypescript.string-helpers.ts:137` - selector parameter
- `utils.ts:134` - nested template literals

**Priority 5: Deprecation (4 errors, 2 files) - DEFERRED to Phase 1 Part 5**

- `generateZodClientFromOpenAPI.ts` - 3 validateOpenApiSpec deprecation warnings
- `index.ts` - 1 validateOpenApiSpec deprecation warning

**Script Files (19 errors) - CONFIG FIX: 15 minutes**

- `examples-fetcher.mts`: 19 console statements (need eslint.config.ts update)

**Test Files (287 errors) - ACCEPTABLE with new pragmatic rules**

- ~250 type assertions in test fixtures (needed for OpenAPI test data)
- 13 long test functions 500-2700 lines (comprehensive integration tests)
- 5 large test files 1000-3900 lines (extensive snapshot suites)
- Function limit raised to 500 lines (was 200) - much more pragmatic!

### Non-Negotiables (from `.agent/RULES.md`)

- **TDD only:** RED → GREEN → REFACTOR for every change
- **No type assertions (`as`)** except `as const`
- **No explicit `any`**; prefer `unknown` + type guards
- **Small, pure functions:** target <50 lines, <8 complexity
- **Fail fast with descriptive errors**

### ⚠️ SPECIAL: Template Code Decomposition Principles

For template-related code (template-context.ts, generateZodClientFromOpenAPI.ts):

**Principle: VERY GRANULAR Single-Responsibility Functions**

- Each function does ONE thing only
- Target: <30 lines, <5 complexity per function
- NO multi-step logic in single functions

**Pattern: Separate Concerns**

1. **Data Gathering:** Extract raw data from OpenAPI spec (stays same in ts-morph)
2. **Transformation:** Convert to template shape (will change to AST building)
3. **Validation:** Check references, detect issues (stays same in ts-morph)
4. **Assembly:** Combine into final context (may change in ts-morph)

**Example Decomposition:**

```typescript
// BAD: Does too much
function buildSchemaContext(doc, options) {
  // Extract + transform + validate + assemble all in one
}

// GOOD: Single responsibility each
function extractSchemaNames(doc) {
  /* just extraction */
}
function buildSchemaMetadata(name, schema) {
  /* just one schema */
}
function transformSchemaForTemplate(metadata) {
  /* just transform */
}
function validateSchemaReferences(schema, doc) {
  /* just validate */
}
function assembleSchemaContext(schemas, options) {
  /* just assemble */
}
```

**Migration Benefit:**

- Keep: `extractSchemaNames`, `buildSchemaMetadata`, `validateSchemaReferences`
- Replace: `transformSchemaForTemplate` → `buildSchemaAstNode`
- Incremental, not all-or-nothing rewrite

### Working Loop

1. Read the relevant plan section before touching code
2. Characterise behaviour with tests (unit, snapshot, or integration as appropriate)
3. Implement minimal change
4. Run targeted tests + `pnpm type-check`
5. Once a task cluster is done, run:
   ```bash
   pnpm format && pnpm build && pnpm type-check && pnpm test:all
   pnpm lint
   ```
6. Update plan/context docs with progress and metrics

### Deliverables for Each Task

- Passing tests and type-checks
- Reduced lint count (track totals in plan)
- Updated documentation (`context.md`, `PHASE-1-PART-4-ZERO-LINT.md`)
- Commit message summarising scope + metrics

### 🚀 IMMEDIATE ACTIONS (First 10 Minutes)

**Step 1: Orient Yourself (2 min)**

```bash
cd /Users/jim/code/personal/openapi-zod-client
git status    # Should be on feat/rewrite, clean working tree
pnpm lint 2>&1 | head -50  # Confirm 326 total (20 prod + 19 script + 287 test)
```

**Step 2: Review Documentation (5 min)**

- Read `.agent/context/context.md` - current state shows 95% complete!
- Skim `.agent/plans/PHASE-1-PART-4-ZERO-LINT.md` - focus on 20 remaining production errors
- Glance at `.agent/RULES.md` - TDD mandate, coding standards

**Step 3: Start Working (FINAL SPRINT!)**
Pick highest-impact quick win: Add 6 missing return types (<1 hour), then tackle complexity issues (2-3 hours).

### Key Codebase Structure

```
lib/src/
├── openApiToZod.ts              # ✅ COMPLETE! (0 errors, split into 7 modules) 🎉
├── getEndpointDefinitionList.ts # ✅ Main + processAllEndpoints decomposed! (1 error: file size)
├── schema-complexity.ts          # ✅ COMPLETE! (0 errors) 🎉
├── openApiToTypescript.ts        # ✅ Major progress! (1 error: file size 434 lines) 🎉
├── generateZodClientFromOpenAPI.ts # ✅ Major progress! (3 errors: file size + deprecation)
├── cli.ts                        # ✅ Major progress! (1 error: file size)
├── template-context.ts           # ✅ Major progress! (3 errors: file size + 2 helpers slightly over)
├── endpoint.helpers.ts           # 2 errors (file size + complexity)
├── utils.ts                      # 6 errors (control chars - quick win)
└── endpoint-operation/           # ✅ COMPLETE: ZERO errors!
```

### Starting Point Checklist

- [ ] Run `pnpm lint` to confirm baseline (326 total: 20 prod + 19 script + 287 test)
- [ ] Read remaining tasks section in PHASE-1-PART-4-ZERO-LINT.md
- [ ] Pick the next highest-impact task:
  - **🎯 HIGHEST IMPACT (QUICK WIN):** Missing return types (6 errors, 5 files, <1 hour)
  - **HIGH IMPACT:** Complexity issues (5 errors, 3 files, 2-3 hours)
  - **MEDIUM IMPACT:** Type assertions (3 errors, 2 files, 1-2 hours)
  - **QUICK WIN:** Code quality (2 errors, 2 files, <30 min)
  - **CONFIG FIX:** Script console statements (19 errors, 15 minutes)
- [ ] Follow proven TDD pattern:
  1. **Characterize:** Write tests for current behavior
  2. **Extract/Fix:** Add return types, reduce complexity, replace type assertions
  3. **Refactor:** Simplify logic while maintaining behavior
  4. **Validate:** All tests pass, lint improves, quality gates green

### 🎓 Proven Patterns (From Recent Sessions)

**Pattern 1: God Function Decomposition (WORKS!)**

- Used successfully on openApiToZod (323→<50 lines), getEndpointDefinitionList (127→<50 lines + processAllEndpoints decomposed), schema-complexity.ts (116→18 lines), openApiToTypescript.ts (157→18 lines), generateZodClientFromOpenAPI.ts (146→49 lines), and cli.ts (86→23 lines)
- Process: Characterize → Extract helpers (7-15 functions) → Refactor main → Validate
- Results: Complexity 21-69 → <8, all tests passing, zero regressions
- Key: TDD at every step, one helper at a time

**Pattern 2: Helper Function Extraction**

- Make each helper do ONE thing only
- Keep helpers pure (no side effects)
- Target: <30 lines, <5 complexity for template code
- Test each helper independently

**Pattern 3: Quality Gate Discipline**

- Run tests after EVERY extraction
- Run full quality gates after each task cluster
- Never skip type-check
- Document progress immediately

**Common Pitfall to Avoid:**

- Don't extract helpers without tests first
- Don't combine multiple concerns in one function
- Don't skip characterization tests
- Don't forget to update docs after completing a file

### Success Metrics & Progress Tracking

**Session Progress:**

- Start: 263 production errors | Current: 20 production errors
- Progress: -243 errors (-92.4% reduction!)
- Total now: 326 (20 prod + 19 script + 287 test)
- Commits: 30+ clean TDD commits
- Test errors now ACCEPTABLE with new pragmatic rules (500-line function limit)

**Files with Zero Errors (23 production files):**

- openApiToZod.ts + 6 related modules (NEW!)
- cli.ts, cli.helpers.ts, openApiToTypescript.ts
- template-context.schemas.ts, template-context.common.ts, template-context.endpoints.ts
- schema-complexity.ts, endpoint-operation/ (5 files)
- getOpenApiDependencyGraph.ts, endpoint.path.helpers.ts

**Estimated Remaining:** 3-4 hours (0.5 focused session) - FINAL SPRINT!

- Quick wins (return types + code quality): <1.5 hours
- Complexity reduction: 2-3 hours
- Type assertions: 1-2 hours
- Script config fix: 15 minutes
- Deprecation warnings: DEFERRED to Phase 1 Part 5

### When Declaring Phase 1 Part 4 Complete

All of the following must be true:

- `pnpm lint` → 0 production errors (≤5 acceptable warnings in tests)
- `pnpm format && pnpm build && pnpm type-check && pnpm test:all` all succeed
- No type assertions or console usage remain in production code
- Documentation captures final metrics (type assertion count, lint delta, LOC delta)

### Tools & Commands Reference

**Quality Gates:**

```bash
pnpm format                       # Prettier formatting
pnpm build                        # ESM + CJS + DTS build
pnpm type-check                   # TypeScript type checking
pnpm test:all                     # All tests (638 total: 486 unit + 152 snapshot)
pnpm lint                         # ESLint (target: 0 errors)
```

**Full Quality Sweep:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test:all && pnpm lint
```

**Targeted Testing:**

```bash
pnpm test -- --run template-context.test.ts  # Single test file
pnpm test -- --run lib/src/                  # Directory
```

**Commit Pattern:**

```bash
git add -A
git commit -m "refactor(lint): <file> - <what you did>

<details>
- Main function: X→Y lines
- Helpers: Z new functions extracted
- Lint: A→B errors (-C)
Tests ✅ Build ✅"
```

---

**📋 IMPORTANT: This prompt is self-contained. You have all the information needed to start working immediately. Read the three key docs (context.md, PHASE-1-PART-4-ZERO-LINT.md, RULES.md) for details, then begin with the highest-impact remaining task (file splitting OR remaining complexity issues).**

Use this prompt verbatim to rehydrate any new session. It ensures every new assistant enters with the same mission, constraints, patterns, and current metrics.
