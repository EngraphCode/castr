# Phase 1 Ready to Execute - Fresh Chat Instructions

**Date:** October 26, 2025  
**Status:** Planning complete, ready for implementation in fresh chat  
**Branch:** `feat/rewrite`  
**Commit:** `7f78a99`

---

## Executive Summary

✅ **Successfully completed:**

1. Reverted to working Phase 0 baseline (88/88 char tests passing)
2. Saved valuable test work to `save-phase1-good-work` branch
3. Applied test work back to main branch
4. Analyzed failure modes from first attempt
5. Created comprehensive E2E test matrix (12 scenarios)
6. Revised Phase 1 plan with learnings incorporated
7. Updated all planning documents

🎯 **Ready for:** Phase 1 execution in fresh chat

---

## Current State

### Quality Gates

```
✅ format:      PASSING
✅ build:       PASSING
❌ type-check:  FAILING (expected - component-access.ts doesn't exist yet)
✅ unit tests:  227/227 PASSING (component-access.test.ts fails as expected)
✅ char tests:  88/88 PASSING
⚠️  lint:       143 problems (baseline, not a blocker)
```

### Files Status

```
✅ lib/src/component-access.test.ts - EXISTS (19 tests, 402 lines)
❌ lib/src/component-access.ts      - MISSING (to be created via TDD)
✅ .agent/analysis/E2E-TEST-MATRIX.md - EXISTS (12 scenarios defined)
✅ All analysis docs preserved
```

### Git State

```
Branch: feat/rewrite
Latest: 7f78a99 "docs: comprehensive Phase 1 revision and planning"
Tags:   phase0-complete-working (f2b3ca7)
        phase1-good-work-saved (c1d442d)
```

---

## What We Learned (First Attempt Analysis)

### What Failed

1. Added internal `SwaggerParser.dereference()` in `generateZodClientFromOpenAPI`
2. Used `assertNotReference` everywhere (too aggressive)
3. Lost component schema `$ref`s needed for semantic naming
4. Result: 40/88 characterisation tests failing

### Root Cause

- Internal dereferencing removed `$ref` information for component schemas
- System needs `$ref`s to extract named types (e.g., `export const User = z.object(...)`)
- Without refs, schemas get inlined instead of extracted as named exports
- Didn't distinguish between:
  - **Operation-level refs** (parameters, requestBody, responses) - SHOULD be dereferenced
  - **Component schema refs** (components.schemas) - MUST be preserved for naming

### Key Insights

1. **CLI already dereferences** (see `lib/src/cli.ts` line 65+)
2. **Programmatic usage varies** - some callers dereference, some don't
3. **We must handle both** - dereferenced AND non-dereferenced specs
4. **ComponentsObject is the right type** - from `openapi3-ts/oas31`, don't create ad-hoc
5. **E2E tests define WHAT** (acceptance criteria), **unit tests define HOW** (TDD)

---

## Revised Approach

### Phase 1 Task Order (12-16 hours)

1. **Task 1.0: Create E2E Test Matrix** (2-3 hours)
   - Create `lib/src/characterisation/programmatic-usage.char.test.ts`
   - Implement 12 scenarios from E2E-TEST-MATRIX.md
   - Run against current baseline to establish what works

2. **Task 1.1: Create Component Access with TDD** (3-4 hours)
   - Use existing `component-access.test.ts` (19 tests)
   - Follow RED -> GREEN -> REFACTOR
   - Create minimal `component-access.ts` to pass tests
   - Zero type assertions in implementation

3. **Task 1.2: Understand Current Dereferencing** (1 hour)
   - Investigate CLI and programmatic paths
   - Document when/where dereferencing happens
   - Update E2E-TEST-MATRIX.md with findings

4. **Task 1.3: Update Template Context** (2 hours)
   - Use `ComponentsObject` directly
   - Remove `makeSchemaResolver` dependency
   - Use `component-access` functions

5. **Task 1.4: Update Dependency Graph** (1-2 hours)
   - Remove resolver dependency
   - Use `component-access` functions

6. **Task 1.5: Update OpenAPIToZod** (2 hours)
   - Replace `ctx.resolver` with `ctx.doc`
   - Use `component-access` functions

7. **Task 1.6: Update Zodios Helpers** (2-3 hours)
   - Handle both dereferenced and non-dereferenced
   - Use conditional logic, not assertNotReference everywhere
   - Test after EACH file

8. **Task 1.7: Delete makeSchemaResolver** (15 min)
   - Only after all usage removed

9. **Task 1.8: Validation** (1 hour)
   - Run full quality gate suite
   - Verify all 12 e2e scenarios (minimum 8/12 P0 passing)
   - Verify all 88 char tests passing
   - Verify all 246 unit tests passing (227 + 19)

---

## Success Criteria

Phase 1 complete when:

- ✅ All quality gates green
- ✅ 246/246 unit tests passing (227 + 19 component-access)
- ✅ 88/88 characterisation tests passing
- ✅ 8/12 P0 e2e scenarios passing (minimum)
- ✅ `makeSchemaResolver.ts` deleted
- ✅ Zero type assertions in `component-access.ts`
- ✅ ~20-30 type assertions eliminated overall
- ✅ Using `ComponentsObject` types properly
- ✅ NO internal dereferencing added
- ✅ Supports both dereferenced and non-dereferenced specs

---

## Key Documents for Implementation

### Must Read (in order)

1. **This document** - Overview and current state
2. **`.agent/analysis/E2E-TEST-MATRIX.md`** - 12 acceptance criteria scenarios
3. **`.agent/plans/01-CURRENT-IMPLEMENTATION.md`** - Phase 1 section (revised)
4. **`.agent/analysis/DEREFERENCE-BREAKING-CHANGE-ANALYSIS.md`** - What went wrong
5. **`.agent/context/context.md`** - How to continue section

### Reference

- `lib/src/component-access.test.ts` - Unit tests (already written)
- `.agent/analysis/REVERT-IMPACT-ANALYSIS.md` - Why we reverted

---

## Commands for Fresh Chat

### Verify Current State

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Quality gates
pnpm format       # ✅ Should pass
pnpm build        # ✅ Should pass
pnpm type-check   # ❌ Should fail (component-access.ts missing)

# Tests
cd lib && pnpm test -- --run          # ✅ 227/227 should pass
cd .. && pnpm character               # ✅ 88/88 should pass

# Verify test file exists
ls -lh lib/src/component-access.test.ts  # ✅ Should exist
ls -lh lib/src/component-access.ts       # ❌ Should NOT exist
```

### Start Phase 1, Task 1.0

```bash
cd /Users/jim/code/personal/openapi-zod-client/lib

# Create e2e test file
touch src/characterisation/programmatic-usage.char.test.ts

# Start implementing from E2E-TEST-MATRIX.md scenarios
# Start with P0 scenarios (8 scenarios)
```

---

## Architecture Principles (Critical!)

### DO ✅

- Use `ComponentsObject` from `openapi3-ts/oas31`
- Preserve component schema `$ref`s (needed for naming)
- Handle both dereferenced AND non-dereferenced specs
- Use conditional logic: `if (isReferenceObject(x)) { resolve } else { use }`
- Follow TDD strictly: RED -> GREEN -> REFACTOR
- Test after EVERY change

### DON'T ❌

- Add internal `SwaggerParser.dereference()` call
- Use `assertNotReference` everywhere (too aggressive)
- Create ad-hoc types instead of using `ComponentsObject`
- Remove refs from component schemas
- Use type assertions (`as`) in new code
- Skip tests between changes

---

## Expected Timeline

- **Task 1.0 (E2E tests):** 2-3 hours
- **Task 1.1 (TDD):** 3-4 hours
- **Task 1.2 (Investigation):** 1 hour
- **Tasks 1.3-1.6 (Integration):** 7-9 hours
- **Tasks 1.7-1.8 (Cleanup & Validation):** 1-2 hours

**Total:** 12-16 hours (realistic estimate based on first attempt)

---

## Risk Mitigation

1. **Run tests frequently** - After every file change
2. **Commit often** - Create restore points
3. **Reference e2e tests** - They define what success looks like
4. **Don't rush integration** - One file at a time
5. **Check characterisation tests** - Must stay at 88/88

---

## Next Chat Instructions

1. **Read this document** (5 min)
2. **Read E2E-TEST-MATRIX.md** (10 min)
3. **Verify current state** with commands above (5 min)
4. **Start Task 1.0** - Create e2e test file
5. **Follow TDD strictly** - Write tests, watch them fail, implement

**DO NOT START CODING IN THIS CHAT** - User wants fresh context for implementation.

---

**This planning is complete. Ready for implementation in fresh chat.**
