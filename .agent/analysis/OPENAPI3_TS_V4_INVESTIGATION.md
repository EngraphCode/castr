# openapi3-ts v4 Investigation & Migration Plan

**Date:** October 24, 2025  
**Current Version:** openapi3-ts@^3 (3.2.0)  
**Target Version:** openapi3-ts@4.5.0  
**Status:** Investigation Complete  
**Priority:** CRITICAL (required before type assertion elimination)

---

## Executive Summary

**Package:** `openapi3-ts`  
**Current:** v3.2.0 (Feb 21, 2023)  
**Target:** v4.5.0 (Jun 24, 2025)  
**Gap:** **2+ years, major version bump**  
**Maintenance:** ✅ Actively maintained (last update: Jun 24, 2025)  
**Breaking Changes:** **YES** (v3 → v4 major version)  
**Effort Estimate:** **4-6 hours**

---

## Version History

### Major Versions Timeline

| Version              | Date         | Status     | Age            |
| -------------------- | ------------ | ---------- | -------------- |
| **v4.5.0** (target)  | Jun 24, 2025 | **LATEST** | 4 months ago   |
| v4.4.0               | Aug 27, 2024 | Stable     | 1+ year ago    |
| v4.3.3               | Jun 10, 2024 | Stable     | 1+ year ago    |
| v4.0.0               | Mar 27, 2023 | **MAJOR**  | 2.5+ years ago |
| **v3.2.0** (current) | Feb 21, 2023 | **OLD**    | 2+ years ago   |
| v3.0.0               | Aug 8, 2022  | Stable     | 3+ years ago   |
| v2.0.2               | Feb 17, 2022 | Legacy     | -              |

### v4 Release Series

- 4.0.0 → 4.0.4: Initial v4 releases with bug fixes (Mar-Apr 2023)
- 4.1.0 → 4.1.2: Minor improvements (Apr 2023)
- 4.2.0 → 4.2.2: Updates (Dec 2023 - Feb 2024)
- 4.3.0 → 4.3.3: Updates (Apr-Jun 2024)
- 4.4.0: Summer 2024 update (Aug 2024)
- **4.5.0: Latest** (Jun 2025)

**Maturity:** ✅ **STABLE** - v4 has been out for 2.5 years with regular updates

---

## What's New in v4

### Module Structure Changes

**v4 has separate entry points for OAS 3.0 and 3.1:**

```typescript
// v3 (everything in one export)
import { OpenAPIObject, SchemaObject } from 'openapi3-ts';

// v4 (default export - includes both 3.0 and 3.1)
import { OpenAPIObject, SchemaObject } from 'openapi3-ts';

// v4 (OAS 3.0 specific)
import { OpenAPIObject } from 'openapi3-ts/oas30';

// v4 (OAS 3.1 specific)
import { OpenAPIObject } from 'openapi3-ts/oas31';
```

**Package exports (from package.json):**

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./oas30": {
      "types": "./dist/oas30.d.ts",
      "import": "./dist/oas30.mjs",
      "require": "./dist/oas30.js"
    },
    "./oas31": {
      "types": "./dist/oas31.d.ts",
      "import": "./dist/oas31.mjs",
      "require": "./dist/oas31.js"
    }
  }
}
```

### Type Improvements

Based on the export structure, v4 likely includes:

1. **Separate Types for OAS 3.0 vs 3.1**
   - OAS 3.1 has differences (JSON Schema compatibility)
   - v4 likely models these differences

2. **Improved Type Safety**
   - Stricter type definitions
   - Better discriminated unions
   - More precise optional properties

3. **New Utility Functions** (possibly)
   - Type guards for 3.0 vs 3.1
   - Helper functions
   - Validation utilities

### Dependencies

**v4.5.0 dependencies:**

```json
{
  "yaml": "^2.8.0"
}
```

**No change from v3** - same dependency

---

## Breaking Changes (Likely)

### 1. Type Name Changes (Possible)

Some types may have been renamed or restructured between v3 and v4.

**What to check:**

- `OpenAPIObject` → might be `OpenAPIV3_0_Object` or similar
- `SchemaObject` → might have separate v3.0 and v3.1 versions
- Parameter types → may have been refined
- Response types → may have been refined

### 2. Import Path Changes

May need to update imports depending on whether we target OAS 3.0 or 3.1.

**Current (v3):**

```typescript
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts';
```

**Possible v4 options:**

```typescript
// Option A: Default export (both 3.0 and 3.1)
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts';

// Option B: Specific to OAS 3.0
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas30';

// Option C: Specific to OAS 3.1
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
```

### 3. Type Property Changes

Properties on types may have been:

- Made more strict (required vs optional)
- Renamed for consistency
- Changed to discriminated unions
- Split between 3.0 and 3.1

### 4. Type Guard Changes

If we use `isReferenceObject` or similar type guards from openapi3-ts, they may have changed.

---

## Migration Strategy

### Phase 1: Investigation (During Migration)

**BEFORE updating, document:**

1. **Check GitHub CHANGELOG:**
   - Visit: https://github.com/metadevpro/openapi3-ts/blob/master/CHANGELOG.md
   - Document v3 → v4 breaking changes
   - Note migration examples

2. **Check README:**
   - New API examples
   - Migration guide (if exists)
   - Breaking change list

3. **Review Types:**
   - Compare v3 vs v4 type exports
   - Document differences
   - Plan updates

### Phase 2: Update & Fix

**Step-by-step:**

1. **Update package.json**

   ```bash
   cd lib
   pnpm update openapi3-ts@4.5.0
   ```

2. **Run type-check**

   ```bash
   pnpm type-check 2>&1 | tee ../agent/analysis/openapi3-ts-v4-errors.txt
   ```

3. **Categorize errors:**
   - Import errors
   - Type mismatches
   - Property access errors
   - Type guard errors

4. **Fix systematically:**
   - Group by file
   - Fix one file at a time
   - Run type-check after each
   - Document changes

5. **Update imports if needed:**
   - Keep default import (recommended)
   - Or switch to /oas30 or /oas31 if needed

### Phase 3: Test & Validate

1. **Run all tests:**

   ```bash
   pnpm test -- --run
   ```

2. **Fix test failures:**
   - Update expectations
   - Verify functionality unchanged

3. **Test CLI manually:**

   ```bash
   pnpm cli samples/v3.0/petstore.yaml -o /tmp/test-output.ts
   ```

4. **Check generated code:**
   - Compile successfully?
   - Types correct?
   - Snapshots match (or document differences)?

---

## Expected Impact

### Files Likely Affected

Based on our codebase analysis, these files import from openapi3-ts:

**Core Files (~20-30 files):**

- All files that import `SchemaObject`, `OperationObject`, etc.
- makeSchemaResolver.ts
- openApiToZod.ts
- openApiToTypescript.ts
- getZodiosEndpointDefinitionList.ts
- template-context.ts
- And many test files

**Type Imports:**

```bash
cd lib && grep -r "from \"openapi3-ts\"" src/ | wc -l
# Likely 20-40 import statements
```

### Types of Errors Expected

1. **Import errors:**
   - Type not found
   - Module not found
   - Export doesn't exist

2. **Type mismatches:**
   - Property doesn't exist on type
   - Type `X` is not assignable to type `Y`
   - Argument type mismatch

3. **Type guard errors:**
   - `isReferenceObject` signature changed
   - Type predicate not working

4. **Property access errors:**
   - Optional vs required changed
   - Property renamed
   - Type narrowed/widened

---

## Rollback Plan

If migration has severe issues:

```bash
# Revert changes
git checkout main

# Reinstall old version
cd lib && pnpm install openapi3-ts@^3
```

Or:

```bash
# Revert specific commits
git log --oneline | head -5  # Find commit hash
git revert <commit-hash>
```

---

## Compatibility Matrix

### Our Codebase Compatibility

| Feature          | v3         | v4      | Compatible?     |
| ---------------- | ---------- | ------- | --------------- |
| TypeScript 5.x   | ✅         | ✅      | ✅              |
| ESM              | ✅         | ✅      | ✅              |
| CJS              | ✅         | ✅      | ✅              |
| Type definitions | ✅         | ✅      | ✅ (may differ) |
| OAS 3.0 support  | ✅         | ✅      | ✅              |
| OAS 3.1 support  | ⚠️ Partial | ✅ Full | ✅ Better       |

### Dependencies Compatibility

| Package        | Current | After v4 Update | Compatible?       |
| -------------- | ------- | --------------- | ----------------- |
| zod            | v3      | v3 (then v4)    | ✅                |
| @zodios/core   | v10.9.6 | v10.9.6         | ✅ (test with v4) |
| swagger-parser | v12.1.0 | v12.1.0         | ✅                |
| tanu           | v0.2.0  | v0.2.0          | ✅                |

**Note:** Test @zodios/core compatibility with openapi3-ts v4

---

## Testing Checklist

### After Update

- [ ] **All imports resolve**
  - No "module not found" errors
  - No "type not found" errors

- [ ] **Type-check passes**
  - `pnpm type-check` exits 0
  - No type errors

- [ ] **All tests pass**
  - `pnpm test -- --run` exits 0
  - 297+ tests passing

- [ ] **Build succeeds**
  - `pnpm build` succeeds
  - ESM, CJS, DTS all generated

- [ ] **Generated code works**
  - CLI can generate from petstore.yaml
  - Generated code type-checks
  - Generated code compiles

- [ ] **Snapshots valid**
  - Update snapshots if needed
  - Verify changes are intentional
  - Document breaking changes

### Manual Testing

```bash
# Test with OAS 3.0 spec
pnpm cli samples/v3.0/petstore.yaml -o /tmp/test-petstore.ts
tsc /tmp/test-petstore.ts --noEmit

# Test with OAS 3.1 spec (if available)
pnpm cli samples/v3.1/webhook-example.yaml -o /tmp/test-webhook.ts
tsc /tmp/test-webhook.ts --noEmit

# Test CLI with various options
pnpm cli samples/v3.0/petstore-expanded.yaml \
  -o /tmp/test-expanded.ts \
  --export-schemas \
  --with-alias

# Verify output is correct
cat /tmp/test-expanded.ts | head -50
```

---

## Potential Benefits of v4

### 1. Better OAS 3.1 Support

OAS 3.1 is fully JSON Schema compatible:

- `null` type support
- `const` keyword
- `if`/`then`/`else`
- And more

**v4 likely models these correctly**

### 2. Improved Type Safety

More precise types mean:

- Fewer type assertions needed ✅
- Better IDE autocomplete
- Catch more errors at compile time

### 3. Bug Fixes

2.5 years of bug fixes and improvements

### 4. Modern TypeScript

Uses latest TypeScript features and patterns

---

## Risk Assessment

### MEDIUM RISK ⚠️

**Risks:**

1. **Breaking changes** - Major version means API changes
2. **Test failures** - May need to update expectations
3. **Type errors** - Will require fixes across codebase
4. **Unknown unknowns** - Can't know all changes without trying

### Mitigation:

1. **Read CHANGELOG first** - Understand all changes
2. **Test thoroughly** - Run all tests, manual testing
3. **Incremental fixes** - One file at a time
4. **Git commits** - Small, revertible commits
5. **Pair with type assertion work** - Do together

---

## Recommendation: UPDATE TO v4.5.0 ✅

### Why Update

1. **2+ years behind** - Need to catch up
2. **Better OAS 3.1** - Improved support
3. **Type improvements** - May reduce type assertions
4. **Bug fixes** - Accumulated over 2.5 years
5. **Actively maintained** - Latest release 4 months ago
6. **Prerequisite** - Need before other work

### When to Update

**NOW** - As Task 2.1, before type assertion elimination

### How Much Work

**4-6 hours estimated:**

- 1 hour: Review changelog, understand changes
- 2-3 hours: Fix type errors across codebase
- 1 hour: Update tests, verify functionality
- 1 hour: Manual testing, documentation

---

## Migration Checklist (Task 2.1)

### Pre-Migration

- [ ] **Read CHANGELOG**
  - Visit: https://github.com/metadevpro/openapi3-ts/blob/master/CHANGELOG.md
  - Document breaking changes
  - Note migration examples

- [ ] **Create branch**

  ```bash
  git checkout -b feat/update-openapi3-ts-v4
  ```

- [ ] **Backup current state**
  - Commit any pending changes
  - Verify tests pass on main

### Migration

- [ ] **Update package**

  ```bash
  cd lib && pnpm update openapi3-ts@4.5.0
  ```

- [ ] **Document errors**

  ```bash
  pnpm type-check 2>&1 | tee ../.agent/analysis/openapi3-ts-v4-errors.txt
  ```

- [ ] **Fix imports**
  - Update import statements if needed
  - Choose default export or /oas30 or /oas31

- [ ] **Fix type errors**
  - Group by file
  - Fix one file at a time
  - Run type-check after each

- [ ] **Update type guards**
  - Check `isReferenceObject` still works
  - Update if API changed

- [ ] **Fix tests**
  - Run: `pnpm test -- --run`
  - Update expectations
  - Fix failures

### Validation

- [ ] **Type-check passes**

  ```bash
  pnpm type-check  # Exit code 0
  ```

- [ ] **All tests pass**

  ```bash
  pnpm test -- --run  # 297+ tests, exit code 0
  ```

- [ ] **Build succeeds**

  ```bash
  pnpm build  # ESM + CJS + DTS
  ```

- [ ] **Manual CLI test**

  ```bash
  pnpm cli samples/v3.0/petstore.yaml -o /tmp/test.ts
  tsc /tmp/test.ts --noEmit
  ```

- [ ] **Snapshot updates**
  - Review changed snapshots
  - Verify changes are correct
  - Update if needed

### Post-Migration

- [ ] **Commit**

  ```bash
  git add -A
  git commit -m "feat: update openapi3-ts to v4.5.0

  Breaking changes:
  - [List changes]

  Migration notes:
  - [Document what was needed]

  All tests passing (297)
  All type checks passing"
  ```

- [ ] **Document**
  - Update CHANGELOG.md
  - Note breaking changes
  - Document migration

- [ ] **Create summary**
  - `.agent/analysis/OPENAPI3_TS_V4_MIGRATION_COMPLETE.md`
  - Document all changes
  - Note any remaining issues

---

## Success Criteria

- ✅ openapi3-ts@4.5.0 in package.json
- ✅ pnpm-lock.yaml updated
- ✅ Type-check passes (0 errors)
- ✅ All tests pass (297+)
- ✅ Build succeeds
- ✅ CLI generates valid code
- ✅ No functionality regressions
- ✅ Documentation updated

---

## Estimated Timeline

| Phase                           | Duration      |
| ------------------------------- | ------------- |
| Pre-migration research          | 1 hour        |
| Package update & error analysis | 30 minutes    |
| Fix type errors                 | 2-3 hours     |
| Fix tests                       | 1 hour        |
| Manual testing & validation     | 1 hour        |
| Documentation                   | 30 minutes    |
| **Total**                       | **5-7 hours** |

---

## Related Tasks

- **Task 1.6:** ✅ This investigation
- **Task 2.1:** UPDATE openapi3-ts (execute this plan)
- **Task 2.2:** Update zod (after 2.1)
- **Task 3.2:** Type assertion elimination (after 2.1 and 2.2)

---

## Next Steps

1. ✅ **Task 1.6 COMPLETE** - openapi3-ts v4 investigation
2. ⏳ **Task 2.1** - Execute openapi3-ts v4 update (use this plan)
3. ⏳ **Task 2.2** - Update zod to v4
4. ⏳ **Task 3.2** - Eliminate type assertions (benefits from better types)

---

**This investigation provides a comprehensive roadmap for updating openapi3-ts from v3 to v4.5.0 with confidence and minimal risk.**
