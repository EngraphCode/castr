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
- 🎯 Phase 1 Part 4: **IN PROGRESS (55% complete)** - Drive all production lint errors to zero

**Current Objective:**
We are mid-way through **Phase 1 Part 4**, whose goal is to drive **all production lint errors to zero** under Engraph's strict standards while keeping every quality gate green.

### Required Reading (in order)

1. `.agent/context/context.md` – Living status, recent wins, remaining risks (5 min)
2. `.agent/RULES.md` – Coding standards & TDD mandate (10 min, mandatory)
3. `.agent/plans/PHASE-1-PART-4-ZERO-LINT.md` – Active plan with task breakdown (10 min)
4. `.agent/plans/requirements.md` – Project-level constraints (optional refresher)

### Current State (2025-10-29 Night)

- ✅ `pnpm format`, `pnpm build`, `pnpm type-check`, `pnpm test:all` (744/744 passing)
- ❌ `pnpm lint` → **207 errors** (strict Engraph rules; 263 at session start)
- **Session Progress:** 263 → 215 → 209 → 207 (-56 errors, **-21.3%**)
- **🏆 MAJOR BREAKTHROUGH: TWO GOD FUNCTIONS COMPLETELY DECOMPOSED!**
  - ✅ **openApiToZod.ts**: Main function 323→<50 lines (-85%!) via 12 TDD phases, 13 pure helpers extracted
  - ✅ **getEndpointDefinitionList.ts**: Main function 127→<50 lines (-60%!) **ZERO ERRORS**, 3 helpers extracted
  - ✅ **getOpenApiDependencyGraph.ts**: ZERO lint errors (from previous session)
- **Pattern Proven:** Systematic TDD decomposition works for god functions
- **Latest Completions:**
  - ✅ Task 4.2 (partial): openApiToZod + getEndpointDefinitionList decomposed
  - ✅ Task 4.5: Deprecated types (-14 errors)
  - ✅ Task 4.4: Explicit return types (-10 errors)
  - ✅ Task 4.6: Critical test issues (-14 errors)
  - ✅ Task 4.8: Sorting & safety (-10 errors)

### Immediate Goal

Finish Phase 1 Part 4 by eliminating the remaining production lint violations through TDD-driven refactors (size, complexity, assertions, logging). Test code quality can remain “pragmatic” once critical issues are cleared.

### High-Priority Targets (11 production files, ~73 errors)

**Remaining God Functions (Priority Order):**

1. **`template-context.ts`: 13 errors** 🎯 **NEXT TARGET - STRATEGIC PRIORITY**
   - 251-line function, complexity 28, 543-line file
   - ⚠️ **SPECIAL CONSTRAINT: Future Handlebars → ts-morph Migration**
   - **Must decompose into VERY GRANULAR single-responsibility functions**
   - Target: 15-20 small pure functions (<30 lines, <5 complexity each)
   - Separate: data gathering, transformation, validation, assembly
   - Goal: Easy to replace transformation layer without rewriting data layer
2. `generateZodClientFromOpenAPI.ts`: 7 errors (146-line function, complexity 23)
   - Also template-related, same granular decomposition approach
3. `schema-complexity.ts`: 4 errors (116-line function, complexity 21)
4. `openApiToTypescript.ts`: 8 errors (157+126-line functions, complexity 35)
5. `cli.ts`: 6 errors (86-line function, complexity 30)

**File Size + Minor Issues:** 6. `openApiToZod.ts`: 16 errors (803-line file - needs splitting into focused modules) 7. `openApiToTypescript.helpers.ts`: 6 errors (325-line file, complexity 9, 2 assertions) 8. `openApiToTypescript.string-helpers.ts`: 2 errors (375-line file, selector parameter) 9. `getEndpointDefinitionList.ts`: 6 errors (processAllEndpoints: 75 lines, complexity 13, 1 assertion) 10. `endpoint.helpers.ts`: 2 errors (274-line file, handleSimpleSchemaWithFallback: complexity 9) 11. `utils.ts`: 6 errors (control character regex - needs eslint-disable comments with justification)

**Test Files:** ~134 errors (acceptable in pragmatic approach)

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
pnpm lint 2>&1 | head -50  # Confirm 207 errors baseline
```

**Step 2: Review Documentation (5 min)**

- Read `.agent/context/context.md` - current state, recent wins
- Skim `.agent/plans/PHASE-1-PART-4-ZERO-LINT.md` - focus on template-context.ts section
- Glance at `.agent/RULES.md` - TDD mandate, coding standards

**Step 3: Start Working**
Pick the highest-impact task (template-context.ts) and begin TDD decomposition.

### Key Codebase Structure

```
lib/src/
├── openApiToZod.ts              # ✅ Main decomposed! (16 errors remain: file size)
├── getEndpointDefinitionList.ts # ✅ Main decomposed! (6 errors in helper)
├── template-context.ts          # 🎯 NEXT: 13 errors, 251-line function
├── generateZodClientFromOpenAPI.ts # 7 errors (template-related)
├── openApiToTypescript.ts       # 8 errors (2 god functions)
├── schema-complexity.ts         # 4 errors (116-line function)
├── cli.ts                       # 6 errors (86-line function, complexity 30)
├── endpoint.helpers.ts          # 2 errors (file size + complexity)
├── utils.ts                     # 6 errors (control chars - quick win)
└── endpoint-operation/          # ✅ COMPLETE: ZERO errors!
```

### Starting Point Checklist

- [ ] Run `pnpm lint` to confirm baseline (207 errors)
- [ ] Read template-context.ts section in PHASE-1-PART-4-ZERO-LINT.md
- [ ] Pick the next highest-impact task:
  - **🎯 HIGHEST IMPACT:** template-context.ts (13 errors, strategic priority)
  - **HIGH IMPACT:** generateZodClientFromOpenAPI.ts (7 errors, also template-related)
  - **MEDIUM IMPACT:** schema-complexity.ts (4 errors), openApiToTypescript.ts (8 errors)
  - **QUICK WIN:** utils.ts (6 errors - just needs eslint-disable comments)
- [ ] Follow proven TDD pattern:
  1. **Characterize:** Write tests for current behavior
  2. **Extract:** Create pure helper functions (RED → GREEN → REFACTOR)
  3. **Refactor:** Main function becomes coordinator (<30 lines for template code)
  4. **Validate:** All tests pass, lint improves, quality gates green

### 🎓 Proven Patterns (From Recent Sessions)

**Pattern 1: God Function Decomposition (WORKS!)**

- Used successfully on openApiToZod (323→<50 lines) and getEndpointDefinitionList (127→<50 lines)
- Process: Characterize → Extract helpers (10-15 functions) → Refactor main → Validate
- Results: Complexity 28-69 → <8, all tests passing, zero regressions
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

**Current Session:**

- Start: 263 errors
- Current: 207 errors
- Progress: -56 (-21.3%)
- Commits: 18 clean TDD commits

**Files Completed (Zero Errors):**

1. ✅ getOpenApiDependencyGraph.ts
2. ✅ endpoint-operation/ (5 files)
3. ✅ getEndpointDefinitionList.ts main function

**Estimated Remaining:** 26-37 hours (2-3 focused sessions)

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
pnpm test:all                     # All tests (744 total)
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

**📋 IMPORTANT: This prompt is self-contained. You have all the information needed to start working immediately. Read the three key docs (context.md, PHASE-1-PART-4-ZERO-LINT.md, RULES.md) for details, then begin with template-context.ts decomposition.**

Use this prompt verbatim to rehydrate any new session. It ensures every new assistant enters with the same mission, constraints, patterns, and current metrics.
