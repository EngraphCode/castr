# Phase 1 Part 4 Continuation Prompt

**Purpose:** Use this prompt to spin up a fresh chat and resume **Phase 1 Part 4: Zero Lint Errors (Perfect)** for the `openapi-zod-client` modernization.

---

## Prompt for AI Assistant

I'm working on the `openapi-zod-client` modernization (branch `feat/rewrite`). We are mid-way through **Phase 1 Part 4**, whose objective is to drive **all production lint errors to zero** under Engraph's strict standards while keeping every quality gate green.

### Required Reading (in order)
1. `.agent/context/context.md` – Living status, recent wins, remaining risks (5 min)
2. `.agent/RULES.md` – Coding standards & TDD mandate (10 min, mandatory)
3. `.agent/plans/PHASE-1-PART-4-ZERO-LINT.md` – Active plan with task breakdown (10 min)
4. `.agent/plans/requirements.md` – Project-level constraints (optional refresher)

### Current State (2025-10-29)
- ✅ `pnpm format`, `pnpm build`, `pnpm type-check`, `pnpm test:all` (605/605 passing)
- ❌ `pnpm lint` → **259 errors** (strict Engraph rules; 271 at session start)
- Production subset: ~38 errors across 19 files (was 52/21)
- Latest improvements: `endpoint.path.helpers.ts`, `CodeMeta.ts`, `cli-type-guards.ts`, `maybePretty.ts`, partial fix in `inferRequiredOnly.ts`

### Immediate Goal
Finish Phase 1 Part 4 by eliminating the remaining production lint violations through TDD-driven refactors (size, complexity, assertions, logging). Test code quality can remain “pragmatic” once critical issues are cleared.

### High-Priority Targets
1. `generateZodClientFromOpenAPI.ts` – size, complexity, logging
2. `openApiToTypescript.helpers.ts` – enum assertions, function length
3. `template-context.ts` – nested logic, file size
4. `openApiToZod.ts` – god function (core of Task 4.2.1)

Secondary focus: `openApiToTypescript.ts`, `getEndpointDefinitionList.ts`, `getOpenApiDependencyGraph.ts`, `endpoint.helpers.ts`, plus residual quick wins (`generateJSDocArray.ts`, `inferRequiredOnly.ts`).

### Non-Negotiables (from `.agent/RULES.md`)
- **TDD only:** RED → GREEN → REFACTOR for every change
- **No type assertions (`as`)** except `as const`
- **No explicit `any`**; prefer `unknown` + type guards
- **Small, pure functions:** target <50 lines, <8 complexity
- **Fail fast with descriptive errors**

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

### Starting Point Checklist
- [ ] Review latest context + plan
- [ ] Re-run `pnpm lint` to confirm baseline (259 errors)
- [ ] Pick the next highest-impact file (see High-Priority Targets)
- [ ] Follow TDD to decompose/refactor until lint passes for that file

### When Declaring Phase 1 Part 4 Complete
All of the following must be true:
- `pnpm lint` → 0 production errors (≤5 acceptable warnings in tests)
- `pnpm format && pnpm build && pnpm type-check && pnpm test:all` all succeed
- No type assertions or console usage remain in production code
- Documentation captures final metrics (type assertion count, lint delta, LOC delta)

---

Use this prompt verbatim to rehydrate the next session. It ensures every new assistant enters with the same mission, constraints, and current metrics.
