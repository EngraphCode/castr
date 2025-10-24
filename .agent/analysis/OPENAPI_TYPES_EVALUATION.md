# openapi-types Evaluation

**Date:** October 24, 2025  
**Current Version:** openapi-types@12.1.3  
**Status:** Analysis Complete  
**Recommendation:** **REMOVE** ❌

---

## Executive Summary

**Package:** `openapi-types` v12.1.3  
**Purpose:** TypeScript types for OpenAPI 2.0 (Swagger) and 3.x specifications  
**Usage in Codebase:** **1 file (test only)**  
**Production Usage:** **NONE**  
**Recommendation:** **REMOVE** - Redundant with openapi3-ts

---

## Usage Analysis

### Complete Usage Inventory

**Total Files Using openapi-types:** 1  
**Total Imports:** 1  
**Production Code:** 0  
**Test Code:** 1

### Detailed Usage

**File:** `lib/src/openApiToTypescript.test.ts` (TEST ONLY)

```typescript
// Line 9:
import type { OpenAPIV3 } from "openapi-types";

// Line 11:
const makeSchema = (schema: SchemaObject | OpenAPIV3.SchemaObject) => schema as SchemaObject;
```

**Analysis:**

- Only used in a test helper function
- Provides `OpenAPIV3.SchemaObject` type
- Used to accept both openapi3-ts SchemaObject and openapi-types SchemaObject
- **This is unnecessary** - we can use openapi3-ts types directly

---

## Maintenance Status

### Release History

| Version              | Date         | Age               |
| -------------------- | ------------ | ----------------- |
| **12.1.3** (current) | May 24, 2023 | **2.5 years ago** |
| 12.1.2               | May 24, 2023 | 2.5 years ago     |
| 12.1.1               | May 20, 2023 | 2.5 years ago     |
| 12.1.0               | Dec 9, 2022  | 3 years ago       |
| 12.0.2               | Aug 31, 2022 | 3+ years ago      |

**Observations:**

- ⚠️ **Last release: May 24, 2023** (2.5 years ago)
- ⚠️ Not actively maintained
- ⚠️ No updates for OpenAPI 3.1.x improvements
- ⚠️ Security patch history unknown

### Package Metadata

```
Package: openapi-types
Latest Version: 12.1.3
Last Modified: May 24, 2023
Weekly Downloads: ~500,000
GitHub: https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-types
```

**Status:** 🟡 **Maintenance Mode** (infrequent updates, community-maintained)

---

## Dependency Analysis

### Current Dependencies

**lib/package.json:**

```json
{
    "dependencies": {
        "openapi-types": "^12.1.3",
        "openapi3-ts": "^3"
    }
}
```

### openapi3-ts v4 Dependencies

**openapi3-ts@4.5.0 depends on:**

```json
{
    "yaml": "^2.8.0"
}
```

**Key Finding:** openapi3-ts v4 does **NOT** depend on openapi-types!

### Type Overlap Analysis

Both packages provide TypeScript types for OpenAPI schemas:

| Type              | openapi-types                  | openapi3-ts          | Source       |
| ----------------- | ------------------------------ | -------------------- | ------------ |
| `SchemaObject`    | ✅ `OpenAPIV3.SchemaObject`    | ✅ `SchemaObject`    | OpenAPI Spec |
| `ParameterObject` | ✅ `OpenAPIV3.ParameterObject` | ✅ `ParameterObject` | OpenAPI Spec |
| `OperationObject` | ✅ `OpenAPIV3.OperationObject` | ✅ `OperationObject` | OpenAPI Spec |
| `PathItemObject`  | ✅ `OpenAPIV3.PathItemObject`  | ✅ `PathItemObject`  | OpenAPI Spec |
| `ReferenceObject` | ✅ `OpenAPIV3.ReferenceObject` | ✅ `ReferenceObject` | OpenAPI Spec |
| `OpenAPIObject`   | ✅ `OpenAPIV3.Document`        | ✅ `OpenAPIObject`   | OpenAPI Spec |

**Conclusion:** Complete overlap - openapi3-ts provides all types we need

---

## Impact Assessment

### If We Remove openapi-types

**Files to Update:** 1 (test file only)

**Changes Required:**

```typescript
// BEFORE (openApiToTypescript.test.ts):
import type { OpenAPIV3 } from "openapi-types";

const makeSchema = (schema: SchemaObject | OpenAPIV3.SchemaObject) => schema as SchemaObject;

// AFTER:
// Remove import - not needed

// Option A: Just use SchemaObject
const makeSchema = (schema: SchemaObject) => schema;

// Option B: If we need to be explicit about accepting different types
import type { SchemaObject as OpenAPISchemaObject } from "openapi3-ts";
const makeSchema = (schema: SchemaObject | OpenAPISchemaObject) => schema as SchemaObject;
```

**Better yet:** The test helper is probably unnecessary since `SchemaObject` from openapi3-ts IS the type we want. Just remove the helper entirely.

---

## Recommendation: REMOVE ❌

### Rationale

1. **Redundant** ✅
    - openapi3-ts provides all types we need
    - 100% overlap for our use cases
    - No unique functionality

2. **Minimal Usage** ✅
    - Only 1 file (test helper)
    - No production code usage
    - Easy to replace

3. **Maintenance Concerns** ⚠️
    - Last updated 2.5 years ago
    - Not actively maintained
    - May become outdated

4. **Dependency Reduction** ✅
    - Fewer dependencies = smaller attack surface
    - Simpler dependency tree
    - Faster installs

5. **Target Repo Compliance** ✅
    - Prefer minimal dependencies
    - Use authoritative sources (openapi3-ts)
    - Remove unnecessary packages

---

## Implementation Plan

### Step 1: Analyze Test Helper

**File:** `lib/src/openApiToTypescript.test.ts`

**Current:**

```typescript
import type { OpenAPIV3 } from "openapi-types";

const makeSchema = (schema: SchemaObject | OpenAPIV3.SchemaObject) => schema as SchemaObject;
```

**Question:** Why is this helper needed?

- Accepts both `SchemaObject` (openapi3-ts) and `OpenAPIV3.SchemaObject` (openapi-types)
- Casts to `SchemaObject`
- Likely from migration or test data construction

**Best Fix:** Remove the helper entirely and use `SchemaObject` directly.

### Step 2: Update Test File

```typescript
// REMOVE:
import type { OpenAPIV3 } from "openapi-types";
const makeSchema = (schema: SchemaObject | OpenAPIV3.SchemaObject) => schema as SchemaObject;

// REPLACE WITH: (if helper still needed)
const makeSchema = (schema: SchemaObject): SchemaObject => schema;

// OR: Just remove and use SchemaObject directly in tests
```

### Step 3: Remove Dependency

```bash
cd lib
pnpm remove openapi-types
```

### Step 4: Verify

```bash
# Type-check passes
pnpm type-check

# Tests pass
pnpm test -- openApiToTypescript

# No imports remain
grep -r "openapi-types" src/
```

---

## Execution Checklist

- [ ] **Review test helper usage**
    - Understand why `makeSchema` exists
    - Determine if it can be simplified or removed

- [ ] **Update openApiToTypescript.test.ts**
    - Remove `import type { OpenAPIV3 } from "openapi-types";`
    - Simplify or remove `makeSchema` helper
    - Use `SchemaObject` from openapi3-ts directly

- [ ] **Run tests**

    ```bash
    pnpm test -- openApiToTypescript
    ```

- [ ] **Remove dependency**

    ```bash
    pnpm remove openapi-types
    ```

- [ ] **Verify removal**

    ```bash
    # Should return nothing:
    grep -r "openapi-types" lib/src/

    # Should not be in package.json:
    cat lib/package.json | grep openapi-types
    ```

- [ ] **Type-check**

    ```bash
    pnpm type-check
    ```

- [ ] **Full test suite**
    ```bash
    pnpm test -- --run
    ```

---

## Risk Assessment

### LOW RISK ✅

- Only test file affected
- No production code impact
- Easy to revert if needed
- Simple type replacement

### Mitigation

- Test before removing
- Verify type compatibility
- Keep git history for easy rollback

---

## Rollback Plan

If issues arise:

```bash
# Revert changes
git checkout main lib/src/openApiToTypescript.test.ts

# Reinstall package
cd lib && pnpm add openapi-types@12.1.3
```

---

## Success Criteria

- ✅ openapi-types removed from package.json
- ✅ No imports of openapi-types in codebase
- ✅ All tests passing (297+)
- ✅ Type-check passing (0 errors)
- ✅ No functionality changes

---

## Estimated Effort

| Task               | Time           |
| ------------------ | -------------- |
| Review test helper | 10 minutes     |
| Update test file   | 5 minutes      |
| Remove dependency  | 1 minute       |
| Test & verify      | 5 minutes      |
| **Total**          | **20 minutes** |

---

## Alternatives Considered

### Option A: Keep openapi-types

**Pros:**

- No changes needed
- Keeps existing API

**Cons:**

- Redundant dependency
- Not actively maintained
- Increases attack surface
- Unnecessary complexity

**Verdict:** ❌ Not recommended

### Option B: Wait for openapi3-ts v4 update first

**Pros:**

- See if openapi3-ts v4 types differ
- Make decision with latest types

**Cons:**

- Delay removal
- Still redundant even with v4

**Verdict:** ⚠️ Acceptable but unnecessary - we can remove now

### Option C: Remove immediately (CHOSEN)

**Pros:**

- Removes redundancy
- Simplifies dependency tree
- Easy to implement
- Low risk

**Cons:**

- None significant

**Verdict:** ✅ **RECOMMENDED**

---

## Related Tasks

- **Task 1.3:** ✅ This evaluation
- **Task 2.1:** Update openapi3-ts to v4.5.0 (may simplify types further)
- **Task 3.3:** Execute removal (after openapi3-ts v4 update)

---

## Final Recommendation

**REMOVE openapi-types immediately or after openapi3-ts v4 update**

**Justification:**

1. Only used in 1 test file
2. openapi3-ts provides all needed types
3. Not actively maintained (2.5 years since last release)
4. Easy to remove (20 minutes effort)
5. Reduces dependency count
6. No production code impact

**When to Execute:**

- **Option A:** Now (safe, low risk)
- **Option B:** After Task 2.1 (openapi3-ts v4 update) - **RECOMMENDED**

**Recommendation:** Execute as part of Task 3.3 after openapi3-ts v4 update is complete.

---

**Next Steps:**

1. ✅ **Task 1.3 COMPLETE** - openapi-types evaluation
2. ⏳ **Task 1.4** - @zodios/core evaluation
3. ⏳ **Task 3.3** - Remove openapi-types (after Task 2.1)
