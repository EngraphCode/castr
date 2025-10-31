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
- 🎯 Phase 1 Part 4: **IN PROGRESS (70% complete)** - Drive all production lint errors to zero

**Current Objective:**
We are mid-way through **Phase 1 Part 4**, whose goal is to drive **all production lint errors to zero** under Engraph's strict standards while keeping every quality gate green.

### Required Reading (in order)

1. `.agent/context/context.md` – Living status, recent wins, remaining risks (5 min)
2. `.agent/RULES.md` – Coding standards & TDD mandate (10 min, mandatory)
3. `.agent/plans/PHASE-1-PART-4-ZERO-LINT.md` – Active plan with task breakdown (10 min)
4. `.agent/plans/requirements.md` – Project-level constraints (optional refresher)

### Current State (2025-10-30)

- ✅ `pnpm format`, `pnpm build`, `pnpm type-check`, `pnpm test:all` (641/641 passing: 489 unit + 152 snapshot)
- ❌ `pnpm lint` → **169 errors** (strict Engraph rules; 263 at session start)
- **Session Progress:** 263 → 169 (-94 errors, **-35.7%** reduction)
- **Production:** 29 errors (11 files) | **Tests:** 140 errors (acceptable)

**🏆 MAJOR ACHIEVEMENTS:**

**God Functions Decomposed (6 complete):**
- ✅ **template-context.ts**: 251→47 lines, split into 5 modules, 0 errors in split files
- ✅ **openApiToZod.ts**: 323→<50 lines (main decomposed, helpers need work)
- ✅ **openApiToTypescript.ts**: 157→18 lines, split into 2 files
- ✅ **cli.ts**: 86→23 lines, split into 2 files, 0 errors
- ✅ **schema-complexity.ts**: 116→18 lines, 0 errors
- ✅ **generateZodClientFromOpenAPI.ts**: 146→49 lines (needs file split)

**Files with Zero Errors (16 production files):**
- cli.ts, cli.helpers.ts, openApiToTypescript.ts
- template-context.schemas.ts, template-context.common.ts, template-context.endpoints.ts
- schema-complexity.ts, endpoint-operation/ (5 files)
- getOpenApiDependencyGraph.ts, endpoint.path.helpers.ts

**Latest Completions:**
- ✅ File splitting: openApiToTypescript.ts (435→79 lines), cli.ts (301→124 lines)
- ✅ Template-context: Complete decomposition + file splitting (13→0 errors)
- ✅ Control chars fix: utils.ts (-6 errors)
- ✅ All quality gates passing

### Immediate Goal

Finish Phase 1 Part 4 by eliminating the remaining production lint violations through TDD-driven refactors (size, complexity, assertions, logging). Test code quality can remain “pragmatic” once critical issues are cleared.

### Remaining Work (29 production errors, 11 files)

**Priority 1: File Splitting (9 errors, 8 files) - 6-8 hours**
1. `openApiToZod.ts` (803 lines) → 3 modules
2. `openApiToTypescript.core.ts` (428 lines) → 2 modules
3. `generateZodClientFromOpenAPI.ts` (435 lines) → 2 modules
4. `openApiToTypescript.helpers.ts` (325 lines) → refine
5. `openApiToTypescript.string-helpers.ts` (375 lines) → refine
6. `getEndpointDefinitionList.ts` (408 lines) → refine
7. `template-context.endpoints.helpers.ts` (270 lines) → refine
8. `endpoint.helpers.ts` (274 lines) → refine

**Priority 2: Complexity Reduction (15 errors) - 4-6 hours**
- `openApiToZod.ts`: 6 functions (complexity 9-19, cognitive 9-13)
- `openApiToTypescript.helpers.ts`: 2 functions (complexity 9)
- `endpoint.helpers.ts`: 1 function (complexity 9)
- `template-context.ts`: 1 helper (78 lines→<50)

**Priority 3: Type Safety (5 errors) - 2-3 hours**
- Type assertions: 3 errors
- Type issues: 2 errors

**Test Files:** 140 errors (acceptable - pragmatic approach)
- 6 massive files >1000 lines (split if time allows)
- Long functions 200-1000 lines: ACCEPTABLE
- 36 deprecation warnings: will fix with production code

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

**Step 1: Orient Yourself (5 min)**

```bash
cd /Users/jim/code/personal/openapi-zod-client
git status    # Should be on feat/rewrite, clean working tree
pnpm lint 2>&1 | head -50  # Confirm ~178 errors baseline
```

**Step 2: Review Documentation (5 min)**

- Read `.agent/context/context.md` - current state, recent wins
- Skim `.agent/plans/PHASE-1-PART-4-ZERO-LINT.md` - focus on remaining tasks
- Glance at `.agent/RULES.md` - TDD mandate, coding standards

**Step 3: Start Working**
Pick the highest-impact task (file splitting OR remaining complexity issues) and begin TDD decomposition.

### Key Codebase Structure

```
lib/src/
├── openApiToZod.ts              # ✅ Main decomposed! (16 errors remain: file size)
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

- [ ] Run `pnpm lint` to confirm baseline (~178 errors)
- [ ] Read remaining tasks section in PHASE-1-PART-4-ZERO-LINT.md
- [ ] Pick the next highest-impact task:
  - **🎯 HIGHEST IMPACT:** File splitting (Task 4.3) - 7 production files >250 lines need splitting
  - **HIGH IMPACT:** template-context.ts (3 errors - file size + minor refinements)
  - **MEDIUM IMPACT:** Remaining complexity issues in helpers
  - **QUICK WIN:** utils.ts (6 errors - just needs eslint-disable comments)
- [ ] Follow proven TDD pattern:
  1. **Characterize:** Write tests for current behavior
  2. **Extract:** Create pure helper functions (RED → GREEN → REFACTOR)
  3. **Refactor:** Main function becomes coordinator (<30 lines for template code)
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
- Start: 263 errors | Current: 169 errors
- Progress: -94 errors (-35.7%)
- Commits: 24+ clean TDD commits
- Production: 29 errors (11 files)
- Tests: 140 errors (acceptable)

**Files with Zero Errors (16 production files):**
- cli.ts, cli.helpers.ts, openApiToTypescript.ts
- template-context.schemas.ts, template-context.common.ts, template-context.endpoints.ts
- schema-complexity.ts, endpoint-operation/ (5 files)
- getOpenApiDependencyGraph.ts, endpoint.path.helpers.ts

**Estimated Remaining:** 12-17 hours (1.5-2 focused sessions)
- File splitting: 6-8 hours
- Complexity reduction: 4-6 hours
- Type safety: 2-3 hours

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
