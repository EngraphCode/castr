# Snapshot Test Analysis

**Date**: October 26, 2025  
**Status**: ✅ FIXED (see SNAPSHOT-FIX-SUMMARY.md)

## Current State

```
Test Files: 4 failed | 71 passed (75)
Tests: 3 failed | 139 passed | 10 skipped (152)
```

## Problem Identification

### Root Cause

When tests were moved from `lib/tests/` to `lib/tests-snapshot/`, the YAML fixture files moved too, but test code still references the old path.

**Old path**: `./tests/petstore.yaml`  
**New path**: `./tests-snapshot/petstore.yaml`

### Affected Files

1. **tests-snapshot/generateZodClientFromOpenAPI.test.ts**
   - Status: ❌ FAIL (10 tests skipped due to beforeAll failure)
   - Issue: `beforeAll` tries to load `./tests/petstore.yaml`
   - Impact: All tests in file skipped

2. **tests-snapshot/getOpenApiDependencyGraph.test.ts**
   - Status: ❌ FAIL
   - Issue: Test tries to load `./tests/petstore.yaml`
   - Impact: 1 test fails

3. **tests-snapshot/getEndpointDefinitionList.test.ts**
   - Status: ❌ FAIL
   - Issue: Test tries to load `./tests/petstore.yaml`
   - Impact: 1 test fails

4. **tests-snapshot/group-strategy.test.ts**
   - Status: ❌ FAIL
   - Issue: Test tries to load `./tests/petstore.yaml`
   - Impact: 1 test fails

## Solution Strategy

### Option 1: Update Test References ✅ RECOMMENDED

**Action**: Change `./tests/petstore.yaml` → `./tests-snapshot/petstore.yaml`  
**Impact**: Minimal, correct, follows test relocation  
**Files to modify**: 4 test files

**Pros**:

- Accurate reflection of current file structure
- Minimal changes (4 string replacements)
- No file moves required

**Cons**:

- None

### Option 2: Move YAML Files Back

**Action**: Move YAML fixtures back to `lib/tests/`  
**Impact**: Larger, creates empty directory just for fixtures

**Pros**:

- Keeps fixture data separate from tests

**Cons**:

- Creates unnecessary directory structure
- YAML fixtures are test data, belong with tests
- More file operations

## Decision

**CHOOSE OPTION 1**: Update test references

**Rationale**:

- Snapshot tests and their fixtures belong together
- Simpler directory structure
- Less disruptive
- Follows principle of co-location

## Implementation Plan

1. ✅ Analyze failures (this document)
2. Update path references in 4 files
3. Run `pnpm test:snapshot`
4. Verify all tests pass
5. Run full quality gate

## Expected Outcome

```
Test Files: 75 passed (75)
Tests: 152 passed (152)
Skipped: 0
```
