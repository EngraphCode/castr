<!-- 0157bd7c-12ea-46ba-8d14-74019a55ad46 9c5eb3f3-8451-4d47-9c66-be41c01e952f -->

# Plan Reconciliation: Numbered Plans ↔ Architecture Rewrite

## Overview

Reconcile five planning documents to reflect discovered architectural issues and establish correct execution order. Key insight: several Phase 2 tasks are superseded by the Architecture Rewrite Plan which addresses root causes rather than symptoms.

---

## Changes Required

### 1. Update ARCHITECTURE_REWRITE_PLAN.md

**File:** `.agent/plans/ARCHITECTURE_REWRITE_PLAN.md`

**Section: Pre-requisites**

- Add Task 2.2 (swagger-parser update) as mandatory pre-requisite
- Reason: Phase 1 relies on `SwaggerParser.bundle()` correctly resolving all operation-level `$ref`s

**Section: Phase 1, Task 1.2**

- Update status from "Pending" to "COMPLETE"
- Note: Committed in previous session with comprehensive TDD approach

**Section: Phase 2 Introduction**

- Add clarification: "Replaces tanu only, not Handlebars"
- Add note: "Handlebars replacement deferred to future phase (see Task 1.7 analysis)"
- Reason: Maintain clean separation (ts-morph = type generation, Handlebars = template assembly)

**Section: Phase 3**

- Add note: "Enables Zod v4 update (Task 2.4 from 01-CURRENT-IMPLEMENTATION)"
- Reason: `@zodios/core` incompatible with Zod 4, must be removed first

**New Section: Superseded Tasks**

Add after Pre-requisites:

```markdown
## Tasks Superseded by This Plan

The following tasks from 01-CURRENT-IMPLEMENTATION.md are superseded:

- **Task 3.2 (Type Assertion Elimination):** ~35 remaining assertions eliminated by Phase 1 (resolver/CodeMeta removal) and Phase 2 (ts-morph migration)
- **Task 2.3 (Defer Logic Analysis):** Replaced by Phase 1 Task 1.1 (component-access.ts)
- **Partial Task 2.4 (Zod v4):** Templates must be updated after Phase 3 (Zodios removal)
```

---

### 2. Update 01-CURRENT-IMPLEMENTATION.md

**File:** `.agent/plans/01-CURRENT-IMPLEMENTATION.md`

**Line 52: Task Execution Order**

Replace entire execution order diagram with:

```markdown
## Task Execution Order (REVISED)

**⚠️ ARCHITECTURE REWRITE SUPERSEDES SEVERAL TASKS**

See: `.agent/plans/ARCHITECTURE_REWRITE_PLAN.md`
```

1. Remaining Phase 2 Pre-work

├─ 2.2 swagger-parser update (ACTIVE - pre-req for Architecture Rewrite)

└─ Any remaining cleanup

2. ARCHITECTURE REWRITE (20-28 hours)

├─ Phase 0: Comprehensive test suite (8-12 hours)

├─ Phase 1: Eliminate resolver + CodeMeta (8-10 hours)

├─ Phase 2: Migrate tanu → ts-morph (6-8 hours)

└─ Phase 3: Remove Zodios dependencies (4-6 hours)

3. Post-Rewrite Tasks

├─ 2.4 Update zod (v3 → v4.1.12) - NOW SAFE

└─ 4.1 Full quality gate validation

4. Phase 3: Quality & Testing (PLANNED)

```

**Superseded Tasks:**
- ❌ Task 2.3: Defer Logic Analysis → Architecture Rewrite Phase 1
- ❌ Task 3.2: Type Assertion Elimination → Architecture Rewrite Phase 1 & 2
```

**Task 3.1 (Line ~2519)**

Update status from "Pending" to:

```markdown
### 3.1 Replace pastable Dependency

**Status:** ✅ COMPLETE
**Priority:** HIGH
**Time Taken:** 1.5 hours
**Completed:** October 25, 2025

**Summary:**

- All 9 functions + 1 type replaced
- pastable dependency removed
- lodash-es added (tree-shaken: ~3-4KB)
- Domain-specific utilities created (schema-sorting.ts)
- All 334 tests passing

**See commit:** [reference commit hash if available]
```

**Task 2.3 (Line ~2350)**

Update status:

```markdown
### 2.3 Defer Logic to openapi3-ts v4 & swagger-parser

**Status:** ❌ SUPERSEDED by Architecture Rewrite Phase 1
**Original Priority:** MEDIUM
**Resolution:** Architecture Rewrite Task 1.1 creates `component-access.ts` which properly leverages `SwaggerParser.bundle()` and `ComponentsObject` from openapi3-ts v4.

**See:** `.agent/plans/ARCHITECTURE_REWRITE_PLAN.md` Phase 1, Task 1.1
```

**Task 3.2 (Line ~3073)**

Update status header:

```markdown
### 3.2 Eliminate Type Assertions (EXTRACTION BLOCKER)

**Status:** ❌ SUPERSEDED by Architecture Rewrite
**Original Priority:** P0 CRITICAL BLOCKER
**Progress:** 11/15 files complete (~30 assertions eliminated)
**Remaining:** ~41 assertions (mostly at tanu/resolver boundary)

**Resolution:**

- Resolver/CodeMeta architectural flaws identified as root cause
- Architecture Rewrite Phase 1: Eliminates resolver/CodeMeta (removes ~20-25 assertions)
- Architecture Rewrite Phase 2: ts-morph migration (removes ~15-20 tanu assertions)
- Remaining ~6 assertions in cli.ts: Can be fixed independently

**See:** `.agent/plans/ARCHITECTURE_REWRITE_PLAN.md`

**Work Completed (Valuable patterns established):**
[Keep existing 11/15 files documentation - these patterns are still valid]
```

**Task 2.4 (Line ~2404)**

Update dependencies and status:

```markdown
### 2.4 Update zod (v3 → v4.1.12)

**Status:** ⏳ DEFERRED until after Architecture Rewrite Phase 3
**Original Priority:** CRITICAL
**New Priority:** HIGH (blocked by Zodios removal)
**Estimated Time:** 4-6 hours
**Dependencies:** Architecture Rewrite Phase 3 complete

**⚠️ CRITICAL DEPENDENCY:**
`@zodios/core` is incompatible with Zod 4. Must complete Architecture Rewrite Phase 3 (Remove Zodios) before updating Zod.

**New Execution Order:**

1. Architecture Rewrite Phase 3: Remove Zodios dependencies
2. Task 2.4: Update Zod v3 → v4.1.12
3. Update templates to use Zod v4 imports

[Keep existing implementation steps - still valid]
```

**Task 2.2 (Line ~2316)**

Update status to emphasize importance:

```markdown
### 2.2 Update @apidevtools/swagger-parser

**Status:** ⏳ ACTIVE - PRE-REQUISITE FOR ARCHITECTURE REWRITE
**Priority:** CRITICAL
**Estimated Time:** 2-3 hours
**Dependencies:** Task 2.1 complete ✅

**⚠️ ARCHITECTURE REWRITE DEPENDENCY:**
Architecture Rewrite Phase 1 relies on `SwaggerParser.bundle()` correctly resolving all operation-level `$ref`s. Must update to latest version and verify behavior before starting rewrite.

[Keep existing implementation steps]
```

---

### 3. Update 00-STRATEGIC-PLAN.md

**File:** `.agent/plans/00-STRATEGIC-PLAN.md`

**Section: Phase 2 Status (Line ~101)**

Update entire section:

```markdown
### Phase 2: Type Safety & Dependencies (🔄 IN PROGRESS - ARCHITECTURE REWRITE)

**Status:** Partially complete, Architecture Rewrite in progress
**Duration:** Revised 3-4 weeks (analysis: 1 week ✅, rewrite: 2-3 weeks)

**Analysis Phase Complete (✅ 7/7 tasks):**

- ✅ Lint Triage
- ✅ pastable Analysis → COMPLETE (removed)
- ✅ openapi-types Evaluation (removed)
- ✅ @zodios/core Evaluation (will be removed in Architecture Rewrite Phase 3)
- ✅ swagger-parser Investigation (updating now)
- ✅ openapi3-ts v4 Investigation → COMPLETE (updated)
- ✅ Handlebars Evaluation (keep, ts-morph for tanu only)

**Implementation Status:**

**Completed:**

1. ✅ Task 2.1: openapi3-ts v3 → v4.5.0
2. ✅ Task 3.1: pastable removed, lodash-es added

**In Progress:** 3. 🔄 Task 2.2: swagger-parser update (PRE-REQ for rewrite)

**Architecture Rewrite (Supersedes 3.2, 2.3, partial 2.4):**

- Phase 0: Comprehensive test suite (8-12 hours)
- Phase 1: Eliminate resolver + CodeMeta (8-10 hours)
- Phase 2: Migrate tanu → ts-morph (6-8 hours)
- Phase 3: Remove Zodios dependencies (4-6 hours)

**Post-Rewrite:** 4. Task 2.4: Zod v3 → v4.1.12 (after Zodios removed) 5. Task 4.1: Full quality gate validation

**See:** `.agent/plans/ARCHITECTURE_REWRITE_PLAN.md`
```

**Section: Dependencies (Line ~254)**

Update Zod entry:

```markdown
**zod v4.1.12** ⏳ DEFERRED

- **Why:** Runtime validation library
- **Update:** v3 → v4.1.12
- **Breaking changes:** Import paths, API refinements
- **Blocker:** @zodios/core incompatible with Zod 4
- **Timeline:** After Architecture Rewrite Phase 3 (Zodios removal)
- **Priority:** HIGH (after blocker removed)
```

Update @zodios/core entry:

```markdown
**@zodios/core v10.9.6** ❌ REMOVING

- **Why:** Type definitions used in generated code templates
- **Status:** Maintenance mode, incompatible with Zod 4
- **Decision:** REMOVE (Architecture Rewrite Phase 3)
- **Replacement:** schemas-with-metadata template (already implemented)
- **Timeline:** Architecture Rewrite Phase 3 (4-6 hours)
```

Update pastable entry:

```markdown
**pastable v2.2.1** ✅ REMOVED

- **Status:** COMPLETE (October 25, 2025)
- **Replaced with:** lodash-es (4 functions, ~3-4KB) + domain utilities
- **Files changed:** 5 files
- **New utilities:** schema-sorting.ts with comprehensive tests
- **Impact:** Code clarity improved, type safety enhanced
```

**Section: Success Criteria (Line ~372)**

Update Phase 2 checklist:

```markdown
### Phase 2 Complete When:

- [x] ✅ **Analysis Complete (7/7 tasks)** - ALL DONE
- [ ] 🔄 **Pre-Rewrite Tasks (2/2):**
- [x] openapi3-ts updated to v4.5.0 ✅
- [ ] swagger-parser updated to latest
- [ ] ⏳ **Architecture Rewrite (0/4 phases):**
- [ ] Phase 0: Comprehensive test suite
- [ ] Phase 1: Resolver + CodeMeta eliminated
- [ ] Phase 2: ts-morph migration complete
- [ ] Phase 3: Zodios dependencies removed
- [ ] ⏳ **Post-Rewrite Tasks:**
- [x] pastable removed ✅
- [ ] Zod updated to v4.1.12
- [ ] openapi-types removed (if still present)
- [ ] All quality gates green
```

---

### 4. Add Cross-References to 02-MCP-ENHANCEMENTS.md

**File:** `.agent/plans/02-MCP-ENHANCEMENTS.md`

**At the beginning (after title), add warning:**

```markdown
**⚠️ PREREQUISITE:** Architecture Rewrite must be complete before starting MCP enhancements.

**See:** `.agent/plans/ARCHITECTURE_REWRITE_PLAN.md`

**Timeline:** Start MCP work after:

- Architecture Rewrite Phase 3 complete
- Zod v4 update complete (Task 2.4)
- All quality gates green
```

---

### 5. Add Cross-References to 03-FURTHER-ENHANCEMENTS.md

**File:** `.agent/plans/03-FURTHER-ENHANCEMENTS.md`

**At the beginning (after title), add warning:**

```markdown
**⚠️ PREREQUISITE:** Architecture Rewrite and Phase 2 completion required.

**See:**

- `.agent/plans/ARCHITECTURE_REWRITE_PLAN.md` - Core architecture must be complete
- `.agent/plans/00-STRATEGIC-PLAN.md` - Phase 2 must be marked complete

**Timeline:** Start Phase 3 enhancements after:

- Architecture Rewrite Phases 0-3 complete
- Zod v4 updated
- All Phase 2 quality gates green
```

---

## Execution Order Summary

**Correct execution order:**

1.  **Pre-Rewrite Cleanup** (now)

                                                                                                                                                                                                - Task 2.2: swagger-parser update

2.  **Architecture Rewrite** (2-3 weeks)

                                                                                                                                                                                                - Phase 0: Test suite
                                                                                                                                                                                                - Phase 1: Resolver/CodeMeta elimination
                                                                                                                                                                                                - Phase 2: ts-morph migration
                                                                                                                                                                                                - Phase 3: Zodios removal

3.  **Post-Rewrite** (1 week)

                                                                                                                                                                                                - Task 2.4: Zod v4 update
                                                                                                                                                                                                - Task 4.1: Quality gates
                                                                                                                                                                                                - Phase 2 marked complete

4.  **Phase 3: Quality & Testing** (3-4 weeks)

                                                                                                                                                                                                - Stryker, lint fixes, DX enhancements

5.  **Optional Extensions**

                                                                                                                                                                                                - 02-MCP-ENHANCEMENTS.md
                                                                                                                                                                                                - Handlebars → ts-morph migration
                                                                                                                                                                                                - Additional features

---

## Key Insights Documented

**Architectural Understanding:**

- Type assertions were symptoms, not root problems
- Resolver's dishonest types caused cascading assertions
- CodeMeta provided no value, just complexity
- SwaggerParser.bundle() already does what resolver tried to do

**Phased Approach Benefits:**

- ts-morph for types (Phase 2) keeps Handlebars for templates (clean separation)
- Zodios removal before Zod v4 (compatibility requirement)
- Comprehensive tests before any changes (safety net)

**Work Preserved:**

- 11/15 files of type assertion work established valuable patterns
- pastable removal completed (one less dependency)
- Custom type guards created (reusable across codebase)
