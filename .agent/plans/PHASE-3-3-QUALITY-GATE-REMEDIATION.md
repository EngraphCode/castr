# Phase 3.3: Quality Gate Remediation Plan

**Date:** November 2025  
**Status:** Ready for Implementation  
**Priority:** HIGH - Blocking quality gates  
**Prerequisites:** Read and internalize `.agent/RULES.md`, `.agent/testing-strategy.md`, `.agent/requirements.md`

---

## 🎯 Mission Statement

Restore all quality gates to GREEN status by addressing pre-existing lint violations and network-dependent test failures, following the engineering excellence principles in RULES.md.

---

## 📋 Current Quality Gate Status

| Gate | Status | Notes |
|------|--------|-------|
| `pnpm build` | ✅ GREEN | Passes |
| `pnpm type-check` | ✅ GREEN | Passes |
| `pnpm format` | ✅ GREEN | Passes |
| `pnpm lint` | ❌ RED | 20 pre-existing errors in test files |
| `pnpm test:all` | ⚠️ PARTIAL | 4 network-related failures |

**Target:** 8/8 quality gates GREEN

---

## 🔍 Issue Analysis

### Issue 1: Lint Violations (20 errors)

All lint errors are in **test files** and are pre-existing issues, not introduced by recent changes.

#### Affected Files:

| File | Error Type | Count | Details |
|------|-----------|-------|---------|
| `lib/src/characterisation/ir-real-world.char.test.ts` | max-lines-per-function | 1 | 503 lines (max: 500) |
| `lib/src/context/ir-validation.test.ts` | max-lines + complexity | 10 | 687 lines, multiple functions >8 complexity |
| `lib/tests-snapshot/ir/ir-circular-refs-integration.test.ts` | complexity | 2 | Functions with 12-17 complexity |
| `lib/tests-snapshot/ir/ir-parameter-integration.test.ts` | complexity | 6 | Functions with 11-18 complexity |
| `lib/tests-snapshot/schemas/complexity/same-schema-different-name.test.ts` | max-lines-per-function | 1 | 613 lines (max: 500) |

#### Root Cause Analysis:

The lint errors stem from test files that contain large, complex test scenarios. These violate ESLint's `max-lines-per-function` (500) and `complexity` (8) rules, but the tests themselves are valid and necessary for coverage.

### Issue 2: Characterisation Test Failures (4 tests)

All 4 failures are in `lib/src/characterisation/ir-real-world.char.test.ts`.

#### Failed Tests:
1. `IR captures all petstore schemas`
2. `petstore schemas have correct metadata`
3. `petstore operations have correct structure`
4. `petstore generates valid Zod code`

#### Root Cause:
Tests fetch from a remote URL that returns HTTP 404:
```
https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore-expanded.yaml
```

The OpenAPI Specification repository has restructured - the file path changed.

#### Solution Available:
A local copy exists at:
```
lib/examples/openapi/v3.0/petstore-expanded.yaml
```

---

## 📐 Fix Strategy

### Strategy 1: Lint Error Resolution

Per RULES.md principles:
- **"Fix Root Causes, Not Symptoms"** - Don't just disable rules
- **"Test behavior, not implementation"** - Ensure refactoring preserves test coverage
- **"Clean Breaks Over Hacks"** - No `eslint-disable` comments as permanent solutions

#### Approach A: Refactor Large Test Files (PREFERRED)

Break large test files into smaller, focused test modules:

```
ir-validation.test.ts (687 lines)
  → ir-validation.schema.test.ts
  → ir-validation.operations.test.ts  
  → ir-validation.metadata.test.ts

same-schema-different-name.test.ts (613 lines)
  → Extract shared fixtures to separate file
  → Split tests by scenario
```

#### Approach B: Reduce Test Complexity

For functions exceeding complexity threshold:
- Extract helper functions for repeated patterns
- Use parameterized tests with `test.each()` for similar scenarios
- Move complex setup to `beforeAll`/`beforeEach` hooks

### Strategy 2: Network Dependency Resolution

Per RULES.md:
- **"No tests may trigger filesystem or network I/O"** (for unit/integration tests)
- Characterisation tests CAN use filesystem but network I/O creates flaky tests

#### Approach: Use Local Fixtures

Replace remote URLs with local file paths:

```typescript
// BEFORE (network-dependent, flaky)
input: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore-expanded.yaml'

// AFTER (local, deterministic)
input: './examples/openapi/v3.0/petstore-expanded.yaml'
```

---

## 📝 Implementation Tasks

### Task 1: Fix Network-Dependent Tests
**Priority:** HIGH (quick fix, high impact)
**Effort:** 15 minutes

1. Open `lib/src/characterisation/ir-real-world.char.test.ts`
2. Replace all occurrences of the remote URL with local path
3. Run tests to verify fix
4. Commit with message: `fix(test): use local fixtures for ir-real-world tests`

### Task 2: Refactor ir-validation.test.ts
**Priority:** MEDIUM
**Effort:** 1-2 hours

1. Analyze test structure and identify logical groupings
2. Create new test files for each group
3. Extract shared fixtures/helpers to `__fixtures__` directory
4. Move tests to new files, preserving all assertions
5. Delete original file once all tests pass
6. Run full test suite to verify no regressions

### Task 3: Refactor ir-real-world.char.test.ts
**Priority:** MEDIUM
**Effort:** 30 minutes

1. Extract the describe block callback to reduce line count below 500
2. Consider splitting into multiple describe blocks in separate files
3. Run tests to verify fix

### Task 4: Reduce Complexity in Integration Tests
**Priority:** MEDIUM
**Effort:** 1-2 hours

Affected files:
- `ir-circular-refs-integration.test.ts`
- `ir-parameter-integration.test.ts`

For each file:
1. Identify functions exceeding complexity threshold
2. Extract repeated assertion patterns to helper functions
3. Use `test.each()` for parameterized test cases
4. Refactor complex conditional logic

### Task 5: Refactor same-schema-different-name.test.ts
**Priority:** MEDIUM
**Effort:** 30 minutes

1. Extract the large inline OpenAPI document to a fixture file
2. Split test into smaller focused tests if possible
3. Verify snapshot still matches after refactor

---

## ✅ Acceptance Criteria

1. All lint errors resolved (0 errors)
2. All characterisation tests pass (155/155 + 4 fixed = 159/159)
3. No `eslint-disable` comments added as permanent solutions
4. All existing test coverage preserved
5. Quality gates status:
   - `pnpm build` ✅
   - `pnpm type-check` ✅
   - `pnpm format` ✅
   - `pnpm lint` ✅
   - `pnpm test:all` ✅

---

## 🔗 Reference Documents

Before starting work, read and internalize:

1. **`.agent/RULES.md`** - Engineering excellence principles, especially:
   - "Quality Gates Are Absolute" section
   - "Fix Root Causes, Not Symptoms"
   - Testing Standards (TDD, behavior testing)

2. **`.agent/testing-strategy.md`** - Testing philosophy, especially:
   - Test file naming conventions
   - Test isolation requirements
   - "ALL IO MUST BE MOCKED" principle

3. **`.agent/requirements.md`** - Project requirements context

4. **Current test structure:**
   - `lib/src/characterisation/` - Characterisation tests
   - `lib/tests-snapshot/` - Snapshot tests
   - `lib/src/context/` - Context/IR tests

---

## 🚨 Constraints

1. **No Coverage Regression** - All existing tests must continue to pass
2. **No Behavior Changes** - Refactoring only, no functional changes
3. **TDD Compliance** - If adding new tests, write them first
4. **Atomic Commits** - One logical change per commit
5. **Quality Gates** - All 8 gates must be GREEN before completion

---

## 📊 Progress Tracking

Use the following checklist:

- [ ] Task 1: Fix network-dependent tests
- [ ] Task 2: Refactor ir-validation.test.ts
- [ ] Task 3: Refactor ir-real-world.char.test.ts  
- [ ] Task 4: Reduce complexity in integration tests
- [ ] Task 5: Refactor same-schema-different-name.test.ts
- [ ] Final verification: All 8 quality gates GREEN

---

## 🔄 Recommended Execution Order

1. **Start with Task 1** - Quick win, fixes 4 test failures immediately
2. **Then Task 3** - Reduces ir-real-world line count (depends on Task 1)
3. **Then Task 5** - Relatively isolated, clear fix
4. **Then Tasks 2 & 4** - Largest effort, do last

---

## 📝 Notes for Implementation

### Re-reading Foundation Documents

At the start of each work session, re-read:
- `.agent/RULES.md` - Core philosophy sections
- `.agent/testing-strategy.md` - TDD rules

This ensures alignment with project standards.

### Git Workflow

```bash
# Before starting
git status  # Check for uncommitted changes
git stash   # Stash if needed

# After each task
pnpm lint && pnpm test:all  # Verify quality gates
git add -p  # Stage changes interactively
git commit -m "type(scope): description"
```

### Commit Message Format

```
fix(test): use local fixtures for ir-real-world characterisation tests
refactor(test): split ir-validation.test.ts into focused modules
refactor(test): reduce complexity in ir-parameter-integration tests
```

