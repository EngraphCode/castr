# Revert Impact Analysis: phase1-wip-investigation → phase0-complete-working

**Date:** October 26, 2025  
**Decision:** Considering reverting to working state before Phase 1 changes

---

## Summary of Changes (844 additions, 534 deletions)

### New Files Created (595 lines)

- `lib/src/component-access.ts` (193 lines) - **SALVAGEABLE**
- `lib/src/component-access.test.ts` (402 lines) - **SALVAGEABLE**

### Files Deleted (304 lines)

- `lib/src/makeSchemaResolver.ts` (90 lines) - **GOOD TO DELETE** (lying types)
- `lib/src/makeSchemaResolver.test.ts` (214 lines) - **GOOD TO DELETE**

### Modified Files (17 files, net 249 lines added)

- Updated all resolver usage → component-access functions
- Added internal `dereference()` call in `generateZodClientFromOpenAPI.ts` - **PROBLEMATIC**
- Removed resolver from context types - **INCOMPLETE**
- Updated CLI comment about dereferencing - **DOCUMENTATION ONLY**

---

## What's Valuable to Save

### 1. The `component-access.test.ts` File (KEEP)

**Value:** 19 comprehensive tests following TDD, covering:

- Schema lookups from components
- Ref resolution
- Error cases
- Edge cases

**Why Keep:**

- Well-written characterisation tests
- Document expected behavior
- Will be useful even with redesigned implementation

**Action:** Save this file before reverting

### 2. The Core Insight (DOCUMENT)

**Insight:** `makeSchemaResolver` has lying types and should be eliminated.

**Why Keep:**

- Correct architectural decision
- Well-documented in analysis files

**Action:** Already documented in:

- `.agent/architecture/CURRENT-ARCHITECTURE.md`
- `.agent/analysis/DEREFERENCE-BREAKING-CHANGE-ANALYSIS.md`

### 3. The TDD Methodology (KEEP)

**Value:** All changes followed strict TDD (tests first, then implementation)

**Why Keep:**

- Good practice to continue
- Tests prove behavior

**Action:** Continue TDD in redesigned Phase 1

---

## What's Problematic to Lose (But Necessary)

### 1. The `component-access.ts` Implementation (REDO)

**Current approach:** Creates custom functions to replace resolver

**Problems:**

- Not using `ComponentsObject` type properly
- `assertNotReference` creates coupling to dereferencing
- Assumes operation-level properties are always dereferenced

**Better approach:**

- Use `ComponentsObject` type directly from `openapi3-ts/oas30`
- Don't make assumptions about dereferencing
- Handle both dereferenced and non-dereferenced specs

**Action:** Rewrite based on e2e tests and proper use cases

### 2. All the Modified Files (REDO)

**What changed:** 17 files updated to use component-access functions instead of resolver

**Problems:**

- Changes based on flawed architecture
- Broke 40 characterisation tests
- Added `assertNotReference` calls that require dereferencing

**Better approach:**

- Write e2e tests FIRST to understand actual use cases
- Design for both dereferenced and non-dereferenced specs
- Use proper `ComponentsObject` types

**Action:** Revert and redo properly

---

## What We Lose That's Just Documentation (OK)

### Updated Documentation (~700 lines)

- `.agent/architecture/CURRENT-ARCHITECTURE.md` - some updates
- `.agent/context/context.md` - progress tracking
- `.agent/plans/01-CURRENT-IMPLEMENTATION.md` - task breakdown updates
- Various prompts and summaries

**Value:** Tracking progress and decisions

**Loss:** Minimal - we can recreate with better understanding

**Action:** Keep the analysis documents, regenerate the rest

---

## Net Assessment

### Valuable Work to Save (MUST PRESERVE)

1. ✅ `component-access.test.ts` (402 lines) - **Save to a safe location**
2. ✅ Analysis documents (already committed)
3. ✅ Insight that `makeSchemaResolver` needs elimination (documented)

### Work to Redo (BETTER THE SECOND TIME)

1. 🔄 `component-access.ts` - Rewrite using `ComponentsObject` properly
2. 🔄 All 17 modified files - Update based on proper e2e tests
3. 🔄 Documentation - Regenerate with correct architecture

### Work to Abandon (GOOD RIDDANCE)

1. ❌ Internal `dereference()` call - Wrong approach
2. ❌ `assertNotReference` everywhere - Creates coupling
3. ❌ Deleted `makeSchemaResolver` - Correct to delete

---

## Recommended Action Plan

### Step 1: Save Valuable Work

```bash
# Create a branch to preserve ALL Phase 1 work
git checkout -b save-phase1-work phase1-wip-investigation

# This branch preserves:
# - lib/src/component-access.test.ts (402 lines of tests)
# - lib/src/component-access.ts (implementation - for reference)
# - All analysis documents
# - The entire investigation state

# Tag it for easy reference
git tag phase1-work-saved

# Go back to main work branch
git checkout feat/rewrite
```

### Step 2: Revert to Working State

```bash
# Hard reset to Phase 0 completion
git reset --hard phase0-complete-working

# Re-tag as starting point
git tag -f phase1-restart-from-working
```

### Step 3: Write E2E Tests FIRST

Create `lib/src/e2e-usage.char.test.ts`:

```typescript
describe('E2E: Programmatic Usage', () => {
  it('should work with spec containing only internal refs', async () => {
    // Spec with #/components/schemas/User refs
    // No dereferencing needed
    // Expect: Named schemas exported
  });

  it('should work with spec after SwaggerParser.dereference()', async () => {
    // Spec with external refs
    // Caller dereferences first
    // Expect: Named schemas still exported (refs preserved in components)
  });

  it('should preserve component schema names for named exports', async () => {
    // Verify that schemas in components.schemas become named exports
    // Even after dereferencing
  });
});

describe('E2E: CLI Usage', () => {
  it('should work with spec file containing external refs', async () => {
    // CLI invokes SwaggerParser.dereference()
    // Expect: Everything works, named schemas exported
  });
});
```

### Step 4: Understand Current Working Code

- Run e2e tests against `phase0-complete-working` code
- Document what actually works
- Understand how `makeSchemaResolver` is used (even if types lie)

### Step 5: Design Phase 1 Properly

Based on e2e tests:

- Use `ComponentsObject` type from `openapi3-ts/oas30`
- Don't add internal dereferencing
- Support both dereferenced and non-dereferenced specs
- Focus on eliminating lying types, not changing behavior

### Step 6: Re-apply Saved Test Work

```bash
# After redesigning the architecture, cherry-pick the test file
git checkout save-phase1-work -- lib/src/component-access.test.ts

# Or if the API has changed significantly, use it as a reference:
# 1. Review the tests on the save-phase1-work branch:
#    git diff phase0-complete-working..save-phase1-work lib/src/component-access.test.ts
# 2. Adapt them to the new design
# 3. Keep the good test cases, update the API calls

# The saved branch (save-phase1-work) preserves:
# - Test patterns and cases (19 good test scenarios)
# - Edge cases we discovered
# - Error handling expectations
# - Implementation approach (for reference)

# We can selectively adopt/adapt:
# - Keep test scenarios that still apply
# - Update function signatures if API changed
# - Add new tests for additional use cases from e2e work
# - Reference the implementation for good ideas (even if not using directly)
```

### Step 7: Complete Implementation

Following TDD with the combined test suite:

- E2E tests (use cases and requirements)
- Adapted component-access tests (unit tests for helpers)
- All existing characterisation tests (regression protection)

**Key**: The saved work isn't wasted - we preserved the valuable test insights and can re-apply them after proper design.

---

## Time Investment Analysis

### Time Already Spent

- Phase 1 implementation: ~6-8 hours
- Analysis and debugging: ~3-4 hours
- **Total: ~10-12 hours**

### Time to Recover (Revert + Redo)

- Save work: 15 minutes
- Revert: 5 minutes
- Write e2e tests: 2-3 hours
- Understand current code: 1-2 hours
- Redesign Phase 1: 2-3 hours
- Implement properly: 4-6 hours
- **Total: ~10-15 hours**

### Net Time Impact

- **Cost: 0-3 hours net** (same or slightly more)
- **Benefit: Correct architecture** (priceless)
- **Risk Reduction: High** (avoid building on broken foundation)

---

## Decision Factors

### Arguments FOR Reverting

1. ✅ Gets us back to 86/88 passing tests
2. ✅ Forces us to write e2e tests (should have done this first)
3. ✅ Allows proper design based on actual use cases
4. ✅ Prevents building more broken code on broken foundation
5. ✅ Aligns with user requirements (programmatic usage, refs handling)
6. ✅ Salvages the valuable test work

### Arguments AGAINST Reverting

1. ❌ Loses ~10 hours of work (but most needs redoing anyway)
2. ❌ Psychological cost of "going backwards" (but it's actually forward)
3. ❌ Need to rewrite documentation (but it'll be better)

### Conclusion

**REVERT IS THE RIGHT CHOICE**

The work we lose either:

- Needs to be redone anyway (implementation)
- Can be salvaged (tests)
- Is just documentation (regeneratable)

The work we gain:

- Proper e2e tests (prevents future issues)
- Correct architecture (using ComponentsObject)
- Understanding of actual requirements
- Confidence in the solution

---

## Next Steps (If We Revert)

1. ✅ Save `component-access.test.ts` to safe branch
2. ✅ Revert to `phase0-complete-working`
3. ✅ Write e2e characterisation tests for actual use cases
4. ✅ Run tests against current working code
5. ✅ Document what works and why
6. ✅ Design Phase 1 properly (use ComponentsObject, no internal dereference)
7. ✅ Implement with TDD
8. ✅ Verify all e2e tests pass

**Estimated time to get back to "done right": 10-15 hours**
**Risk of continuing on current path: Building broken architecture, more debugging, potential need to revert later anyway**

---

## User's Concerns Addressed

> "not all use is via the cli"

✅ E2E tests will cover programmatic usage

> "we want refs properly handled when the library is invoked not via the cli"

✅ New design will handle both dereferenced and non-dereferenced specs

> "`ComponentsObject` is exactly the type that describes the fundamental unit"

✅ New design will use ComponentsObject properly, not create ad-hoc versions

> "ground yourself in what we are trying to achieve"

✅ E2E tests will force us to define and test actual use cases
