# Phase 1 E2E Test Baseline

**Date:** October 26, 2025  
**Test File:** `lib/src/characterisation/programmatic-usage.char.test.ts`  
**Phase 0 Commit:** 7f78a99  
**Status:** Baseline established

---

## Test Results: 5/12 Passing (42%)

### ✅ Passing Tests (5/12)

**Category 2: After Dereferencing**

- ✅ **2.2** (P0): External refs after dereferencing

**Category 3: CLI Usage**

- ✅ **3.1** (P0): CLI with external refs

**Category 4: Operation-Level Refs** (ALL PASSING)

- ✅ **4.1** (P0): Refs in operation.parameters
- ✅ **4.2** (P0): Refs in operation.requestBody
- ✅ **4.3** (P0): Refs in operation.responses

### ❌ Failing Tests (7/12)

**Category 1: Internal Refs Only**

- ❌ **1.1** (P0): Named schemas from components.schemas
- ❌ **1.2** (P0): Schema dependencies (Address before User)
- ❌ **1.3** (P1): Circular references with z.lazy()

**Category 2: After Dereferencing**

- ❌ **2.1** (P0): Named schemas after dereference

**Category 3: CLI Usage**

- ❌ **3.2** (P1): Inline specs via CLI

**Category 5: Edge Cases**

- ❌ **5.1** (P1): Special characters in schema names

**Category 6: Templates**

- ❌ **6.1** (P1): schemas-with-metadata template

---

## Root Cause Analysis

### Primary Issue: Schema Export Pattern

**Current Behavior:**

```typescript
// Schemas defined as const
const User = z.object({ name: z.string() }).partial().passthrough();

// Exported via schemas object
export const schemas = {
  User,
};
```

**Expected Behavior:**

```typescript
// Schemas exported directly as named exports
export const User = z.object({ name: z.string() }).partial().passthrough();

// Also available via schemas object
export const schemas = {
  User,
};
```

### Secondary Issues

1. **Circular References (1.3)**: Not using `z.lazy()` - generates TypeScript types instead
2. **Dependency Ordering (1.2)**: Works but schemas not exported properly

---

## P0 vs P1 Breakdown

### P0 Tests (8 total)

- ✅ Passing: 5/8 (62.5%)
  - 2.2, 3.1, 4.1, 4.2, 4.3
- ❌ Failing: 3/8 (37.5%)
  - 1.1, 1.2, 2.1

### P1 Tests (4 total)

- ✅ Passing: 0/4 (0%)
- ❌ Failing: 4/4 (100%)
  - 1.3, 3.2, 5.1, 6.1

---

## Key Insights

### What Works ✅

1. **Operation-level refs handled correctly** - After dereferencing, refs in parameters/requestBody/responses work perfectly
2. **External file refs work** - SwaggerParser.dereference() integrates well
3. **No type assertions in passing tests** - Good baseline

### What Needs Fixing ❌

1. **Named export pattern** - Core architectural issue that Phase 1 will address
2. **Circular reference handling** - Need z.lazy() support
3. **Template consistency** - schemas-with-metadata has same issue

---

## Success Criteria for Phase 1

**Minimum (Phase 1 Complete):**

- ✅ All 8 P0 tests passing (currently 5/8)
- ✅ At least 10/12 total tests passing (currently 5/12)

**Ideal (Phase 1 Excellence):**

- ✅ All 12 tests passing
- ✅ 88/88 characterisation tests still passing
- ✅ Zero type assertions in generated code

---

## Next Steps

1. ✅ **Task 1.0 COMPLETE** - E2E test matrix created and baseline established
2. ⏳ **Task 1.1 START** - Create `component-access.ts` with TDD (19 tests)
3. Then Tasks 1.2-1.8 as per revised plan

---

## Verification Commands

```bash
# Run e2e tests
cd /Users/jim/code/personal/openapi-zod-client
pnpm character -- programmatic-usage

# Expected Phase 0 baseline: 5/12 passing

# Run all char tests (should stay at 88/88)
pnpm character

# Run unit tests (should stay at 227/227 with component-access.test failing)
cd lib && pnpm test -- --run
```

---

**This baseline proves the e2e tests are working and clearly define what Phase 1 must achieve.**
