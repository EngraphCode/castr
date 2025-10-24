# pastable Replacement Plan

**Date:** October 24, 2025  
**Current Version:** pastable@2.2.1  
**Status:** Analysis Complete  
**Priority:** HIGH

---

## Executive Summary

**Dependency:** `pastable` v2.2.1  
**Reason for Removal:** Obscure, unmaintained "collection of pastable code"  
**Files Affected:** 7 files  
**Functions Used:** 8 functions + 1 type  
**Strategy:** Hybrid approach (lodash-es for complex, native for simple, custom for specialized)

---

## Usage Inventory

### Complete Usage Map

| Function               | Files                                                    | Usage Count | Complexity | Replacement Strategy      |
| ---------------------- | -------------------------------------------------------- | ----------- | ---------- | ------------------------- |
| `getSum`               | schema-complexity.helpers.ts                             | 3           | LOW        | Native `.reduce()`        |
| `capitalize`           | utils.ts, generateZodClientFromOpenAPI.ts                | 2+          | LOW        | lodash-es OR native       |
| `kebabToCamel`         | utils.ts                                                 | 1           | LOW        | Custom (simple regex)     |
| `snakeToCamel`         | utils.ts                                                 | 1           | LOW        | Custom (simple regex)     |
| `get`                  | makeSchemaResolver.ts, getOpenApiDependencyGraph.test.ts | 2           | MEDIUM     | lodash-es                 |
| `pick`                 | getZodiosEndpointDefinitionList.ts                       | 1           | MEDIUM     | lodash-es OR native       |
| `sortBy`               | template-context.ts                                      | 1           | MEDIUM     | lodash-es OR native       |
| `sortListFromRefArray` | template-context.ts                                      | 1           | HIGH       | Custom implementation     |
| `sortObjKeysFromArray` | template-context.ts                                      | 2           | HIGH       | Custom implementation     |
| `ObjectLiteral` (type) | getZodiosEndpointDefinitionList.ts                       | 1           | LOW        | `Record<string, unknown>` |

### Files Affected

1. **schema-complexity.helpers.ts**
    - `getSum` (lines 30, 60, 85)
    - Sums array of complexity numbers

2. **utils.ts**
    - `capitalize` (used for string capitalization)
    - `kebabToCamel` (line 41)
    - `snakeToCamel` (line 41)

3. **generateZodClientFromOpenAPI.ts**
    - `capitalize` (various uses)
    - `pick` (not shown in snippet, but imported)

4. **makeSchemaResolver.ts**
    - `get` (line 31) - Deep object property access
    - Path: `"#/components/schemas"` → `doc.components.schemas`

5. **getOpenApiDependencyGraph.test.ts**
    - `get` (lines 12, 93, 173, 269) - Deep object access in tests

6. **template-context.ts**
    - `sortBy` (line 228) - Sort endpoints by path
    - `sortListFromRefArray` (line 267) - Sort schemas by dependency order
    - `sortObjKeysFromArray` (lines 124, 263) - Reorder schema keys

7. **getZodiosEndpointDefinitionList.ts**
    - `ObjectLiteral` (type only) - Generic object type
    - Also has inline `pick` function implementation

---

## Replacement Strategy

### Strategy: **Option C - Hybrid Approach**

**Rationale:**

- **Simple functions** → Native/Custom (no dependencies)
- **Complex but common** → lodash-es (battle-tested, tree-shakeable)
- **Specialized logic** → Custom implementations (full control)

**Trade-offs:**

| Aspect       | Native/Custom | Full lodash-es | Hybrid (Chosen)    |
| ------------ | ------------- | -------------- | ------------------ |
| Bundle Size  | ~1KB          | ~24KB          | ~8KB (tree-shaken) |
| Maintenance  | Medium        | Low            | Medium-Low         |
| Performance  | High          | High           | High               |
| Reliability  | Custom code   | Battle-tested  | Mixed              |
| Dependencies | 0             | 1              | 1                  |

**Decision:** Hybrid - lodash-es for complex utilities, native/custom for simple

---

## Implementation Plan

### Phase A: Add lodash-es (if hybrid approach)

```bash
cd lib
pnpm add lodash-es
pnpm add -D @types/lodash-es
```

**Justification:**

- Tree-shakeable (only import what we use)
- Battle-tested (millions of downloads/week)
- TypeScript support excellent
- Well-maintained

---

### Phase B: Replace Simple Functions (Native/Custom)

#### 1. Replace `getSum` → Native `.reduce()`

**File:** `lib/src/schema-complexity.helpers.ts`

**Current (3 instances):**

```typescript
import { getSum } from "pastable";

// Line 30:
getSum(schemas.map((prop) => getSchemaComplexity({ current: 0, schema: prop })));

// Line 60:
getSum(types.map((prop) => getSchemaComplexity({ current: 0, schema: prop })));

// Line 85:
getSum(props.map((prop) => getSchemaComplexity({ current: 0, schema: prop })));
```

**Replacement:**

```typescript
// Remove import, use native reduce

// Line 30:
schemas.map((prop) => getSchemaComplexity({ current: 0, schema: prop })).reduce((sum, n) => sum + n, 0);

// Line 60:
types.map((prop) => getSchemaComplexity({ current: 0, schema: prop })).reduce((sum, n) => sum + n, 0);

// Line 85:
props.map((prop) => getSchemaComplexity({ current: 0, schema: prop })).reduce((sum, n) => sum + n, 0);
```

**Effort:** LOW (10 minutes)  
**Risk:** NONE (identical behavior)

---

#### 2. Replace `capitalize` → lodash-es OR Native

**Files:** `utils.ts`, `generateZodClientFromOpenAPI.ts`

**Option A: lodash-es (Recommended)**

```typescript
// Add to imports
import { capitalize } from "lodash-es";

// Usage stays the same
const capitalized = capitalize(str);
```

**Option B: Native**

```typescript
// Add helper in utils.ts
export const capitalize = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};
```

**Recommendation:** lodash-es (we're adding it anyway for `get`, `sortBy`)  
**Effort:** LOW (5 minutes)  
**Risk:** NONE

---

#### 3. Replace `kebabToCamel` & `snakeToCamel` → Custom

**File:** `utils.ts`

**Current:**

```typescript
import { kebabToCamel, snakeToCamel } from "pastable/server";

// Line 41:
snakeToCamel(preserveUnderscore.replaceAll("-", "_")).replaceAll("#", "_");
```

**Replacement:**

```typescript
// Add these functions to utils.ts:

/**
 * Converts kebab-case to camelCase
 * @example "foo-bar-baz" → "fooBarBaz"
 */
export const kebabToCamel = (str: string): string => {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Converts snake_case to camelCase
 * @example "foo_bar_baz" → "fooBarBaz"
 */
export const snakeToCamel = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};
```

**Effort:** LOW (10 minutes)  
**Risk:** NONE (simple regex)

**Tests:**

```typescript
// Add to utils.test.ts
test("kebabToCamel", () => {
    expect(kebabToCamel("foo-bar")).toBe("fooBar");
    expect(kebabToCamel("foo-bar-baz")).toBe("fooBarBaz");
    expect(kebabToCamel("foo")).toBe("foo");
});

test("snakeToCamel", () => {
    expect(snakeToCamel("foo_bar")).toBe("fooBar");
    expect(snakeToCamel("foo_bar_baz")).toBe("fooBarBaz");
    expect(snakeToCamel("foo")).toBe("foo");
});
```

---

### Phase C: Replace with lodash-es

#### 4. Replace `get` → lodash-es

**Files:** `makeSchemaResolver.ts`, `getOpenApiDependencyGraph.test.ts`

**Current:**

```typescript
import { get } from "pastable/server";

// makeSchemaResolver.ts line 31:
const retrieved = get(doc, path.replace("#/", "").replace("#", "").replaceAll("/", "."));

// getOpenApiDependencyGraph.test.ts:
const getSchemaByRef = (ref: string): SchemaObject | ReferenceObject =>
    get(openApiDoc, ref.replace("#/", "").replaceAll("/", "."));
```

**Replacement:**

```typescript
import { get } from "lodash-es";

// Usage stays the same - lodash.get has same API
```

**Effort:** LOW (5 minutes)  
**Risk:** NONE (API-compatible)

---

#### 5. Replace `pick` → lodash-es OR Native

**File:** `getZodiosEndpointDefinitionList.ts`

**Current:**

```typescript
// NOTE: File already has an inline pick implementation at line 182!
function pick<T extends ObjectLiteral, K extends keyof T>(obj: T, paths: K[]): Pick<T, K> {
    // ... existing implementation
}

// Line 95:
const pathItem = pick(pathItemObj, ["get", "put", "post", "delete", "options", "head", "patch", "trace"]);
```

**Analysis:** **File already has a `pick` implementation!** No need to replace.

**Action:** Remove pastable import for `pick`, keep the inline implementation OR replace with lodash-es

**Option A: Keep inline implementation (Recommended)**

```typescript
// Remove from import: import { pick } from "pastable/server";
// Keep the existing inline function at line 182
```

**Option B: Use lodash-es**

```typescript
import { pick } from "lodash-es";
// Remove the inline implementation
```

**Recommendation:** Option A (already implemented, no work needed)  
**Effort:** NONE (already done)  
**Risk:** NONE

---

#### 6. Replace `sortBy` → lodash-es OR Native

**File:** `template-context.ts`

**Current:**

```typescript
import { sortBy } from "pastable/server";

// Line 228:
data.endpoints = sortBy(data.endpoints, "path");
```

**Option A: lodash-es (Recommended)**

```typescript
import { sortBy } from "lodash-es";
// Usage stays the same
```

**Option B: Native**

```typescript
// Sort by object key
data.endpoints = [...data.endpoints].sort((a, b) => {
    const aPath = a.path;
    const bPath = b.path;
    if (aPath < bPath) return -1;
    if (aPath > bPath) return 1;
    return 0;
});
```

**Recommendation:** lodash-es (cleaner, we're adding it anyway)  
**Effort:** LOW (5 minutes)  
**Risk:** NONE

---

### Phase D: Create Custom Utilities

#### 7. Replace `sortListFromRefArray` → Custom Implementation

**File:** `template-context.ts`

**Current:**

```typescript
import { sortListFromRefArray } from "pastable/server";

// Line 267:
data.commonSchemaNames = new Set(
    sortListFromRefArray([...commonSchemaNames], getPureSchemaNames(schemaOrderedByDependencies))
);
```

**Purpose:** Sort array based on order defined in reference array

**Custom Implementation:**

Create `lib/src/utils/sorting.ts`:

```typescript
/**
 * Sort a list based on the order defined in a reference array
 *
 * Items not in reference array are placed at the end
 *
 * @example
 * sortListFromRefArray(['c', 'a', 'b'], ['a', 'b', 'c'])
 * // => ['a', 'b', 'c']
 */
export function sortListFromRefArray<T>(list: T[], refArray: readonly T[]): T[] {
    const orderMap = new Map(refArray.map((item, idx) => [item, idx]));

    return [...list].sort((a, b) => {
        const aIdx = orderMap.get(a) ?? Infinity;
        const bIdx = orderMap.get(b) ?? Infinity;
        return aIdx - bIdx;
    });
}
```

**Usage:**

```typescript
import { sortListFromRefArray } from "./utils/sorting.js";

data.commonSchemaNames = new Set(
    sortListFromRefArray([...commonSchemaNames], getPureSchemaNames(schemaOrderedByDependencies))
);
```

**Effort:** MEDIUM (20 minutes including tests)  
**Risk:** LOW (straightforward logic)

**Tests:**

```typescript
// utils/sorting.test.ts
test("sortListFromRefArray", () => {
    expect(sortListFromRefArray(["c", "a", "b"], ["a", "b", "c"])).toEqual(["a", "b", "c"]);

    expect(sortListFromRefArray(["x", "a", "y"], ["a", "b", "c"])).toEqual(["a", "x", "y"]); // x, y not in ref, so at end

    expect(sortListFromRefArray([], ["a"])).toEqual([]);
});
```

---

#### 8. Replace `sortObjKeysFromArray` → Custom Implementation

**File:** `template-context.ts`

**Current:**

```typescript
import { sortObjKeysFromArray } from "pastable/server";

// Line 124:
data.schemas = sortObjKeysFromArray(data.schemas, schemaOrderedByDependencies);

// Line 263:
group.schemas = sortObjKeysFromArray(groupSchemas, getPureSchemaNames(schemaOrderedByDependencies));
```

**Purpose:** Reorder object keys based on array order

**Custom Implementation:**

Add to `lib/src/utils/sorting.ts`:

```typescript
/**
 * Sort object keys based on the order defined in an array
 *
 * Keys not in order array are placed at the end in their original order
 *
 * @example
 * sortObjKeysFromArray({ c: 3, a: 1, b: 2 }, ['a', 'b', 'c'])
 * // => { a: 1, b: 2, c: 3 }
 */
export function sortObjKeysFromArray<T extends Record<string, unknown>>(obj: T, keyOrder: readonly string[]): T {
    const orderMap = new Map(keyOrder.map((key, idx) => [key, idx]));

    const entries = Object.entries(obj);
    entries.sort(([keyA], [keyB]) => {
        const idxA = orderMap.get(keyA) ?? Infinity;
        const idxB = orderMap.get(keyB) ?? Infinity;
        return idxA - idxB;
    });

    return Object.fromEntries(entries) as T;
}
```

**Effort:** MEDIUM (20 minutes including tests)  
**Risk:** LOW (straightforward logic)

**Tests:**

```typescript
test("sortObjKeysFromArray", () => {
    const obj = { c: 3, a: 1, b: 2 };
    const sorted = sortObjKeysFromArray(obj, ["a", "b", "c"]);
    expect(Object.keys(sorted)).toEqual(["a", "b", "c"]);

    const obj2 = { z: 26, a: 1, y: 25 };
    const sorted2 = sortObjKeysFromArray(obj2, ["a", "b"]);
    expect(Object.keys(sorted2)).toEqual(["a", "z", "y"]);
});
```

---

### Phase E: Replace Type

#### 9. Replace `ObjectLiteral` type → Native

**File:** `getZodiosEndpointDefinitionList.ts`

**Current:**

```typescript
import type { ObjectLiteral } from "pastable";

function pick<T extends ObjectLiteral, K extends keyof T>(obj: T, paths: K[]): Pick<T, K> {
    // ...
}
```

**Option A: Use Record (Recommended)**

```typescript
// Remove import

function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, paths: K[]): Pick<T, K> {
    // ...
}
```

**Option B: Define locally if needed elsewhere**

```typescript
type ObjectLiteral = Record<string, unknown>;
```

**Recommendation:** Option A - use `Record<string, unknown>` directly  
**Effort:** TRIVIAL (2 minutes)  
**Risk:** NONE

---

### Phase F: Remove pastable Dependency

**After all replacements are complete and tests pass:**

```bash
cd lib
pnpm remove pastable
```

**Verification:**

```bash
# Should return nothing
grep -r "pastable" src/

# Should not be in package.json
cat package.json | grep pastable
```

---

## Execution Checklist

### Pre-Implementation

- [x] Document all usage (this document)
- [x] Choose replacement strategy (Hybrid)
- [ ] Review existing tests for affected functions

### Implementation Order

#### Week 1: Simple Replacements

- [ ] **1. Add lodash-es dependency**
    - Add `lodash-es` and `@types/lodash-es`
    - Verify tree-shaking works

- [ ] **2. Replace `getSum` with native reduce**
    - File: schema-complexity.helpers.ts (3 instances)
    - Run tests: `pnpm test -- schema-complexity`

- [ ] **3. Replace `capitalize` with lodash-es**
    - Files: utils.ts, generateZodClientFromOpenAPI.ts
    - Run tests: `pnpm test -- utils`

- [ ] **4. Replace `kebabToCamel` & `snakeToCamel` with custom**
    - File: utils.ts
    - Add tests to utils.test.ts
    - Run tests: `pnpm test -- utils`

#### Week 1-2: lodash-es Replacements

- [ ] **5. Replace `get` with lodash-es**
    - Files: makeSchemaResolver.ts, getOpenApiDependencyGraph.test.ts
    - Run tests: `pnpm test -- makeSchemaResolver getOpenApiDependencyGraph`

- [ ] **6. Handle `pick` (already implemented inline)**
    - Remove from pastable import
    - Keep inline implementation
    - Run tests: `pnpm test -- getZodiosEndpointDefinitionList`

- [ ] **7. Replace `sortBy` with lodash-es**
    - File: template-context.ts
    - Run tests: `pnpm test -- template-context`

#### Week 2: Custom Implementations

- [ ] **8. Create sorting utilities file**
    - Create `lib/src/utils/sorting.ts`
    - Create `lib/src/utils/sorting.test.ts`
    - Implement `sortListFromRefArray`
    - Implement `sortObjKeysFromArray`
    - Write comprehensive tests

- [ ] **9. Replace sorting functions in template-context.ts**
    - Import from `./utils/sorting.js`
    - Update 3 call sites
    - Run tests: `pnpm test -- template-context`

#### Week 2: Type & Cleanup

- [ ] **10. Replace `ObjectLiteral` type**
    - File: getZodiosEndpointDefinitionList.ts
    - Use `Record<string, unknown>`
    - Run tests: `pnpm test -- getZodiosEndpointDefinitionList`

- [ ] **11. Remove pastable dependency**
    - Run: `pnpm remove pastable`
    - Verify: `grep -r "pastable" src/` returns nothing

### Validation

- [ ] **All tests passing**

    ```bash
    pnpm test -- --run
    ```

- [ ] **Type-check passing**

    ```bash
    pnpm type-check
    ```

- [ ] **Build succeeds**

    ```bash
    pnpm build
    ```

- [ ] **No pastable references**

    ```bash
    grep -r "pastable" lib/src/
    # Should return: (no output)
    ```

- [ ] **Bundle size check**
    ```bash
    ls -lh lib/dist/openapi-zod-client.js
    # Compare before/after
    ```

---

## Risk Assessment

### LOW RISK ✅

- `getSum` → reduce (identical behavior)
- `capitalize` → lodash-es (same API)
- `get` → lodash-es (same API)
- `sortBy` → lodash-es (same API)
- `ObjectLiteral` → Record (same thing)

### MEDIUM RISK ⚠️

- `kebabToCamel`, `snakeToCamel` → Custom (need tests) use lodash-es functions if possible, else wrap lodash-es functions in custom functions.
- `sortListFromRefArray` → Custom (need tests, verify edge cases) use lodash-es functions if possible, else wrap lodash-es functions in custom functions. Evaluate type information preservation, it is unacceptable to lose type information.
- `sortObjKeysFromArray` → Custom (need tests, verify key order) use lodash-es functions if possible, else wrap lodash-es functions in custom functions. Evaluate type information preservation, it is unacceptable to lose type information.

### Mitigation Strategies

1. **Comprehensive Tests:** Add tests for all custom implementations
2. **Incremental Approach:** Replace one function at a time
3. **Test After Each:** Run full test suite after each replacement
4. **Snapshot Tests:** Existing snapshot tests will catch regressions
5. **Manual Testing:** Test CLI with sample OpenAPI specs

---

## Success Criteria

- ✅ Zero references to `pastable` in source code
- ✅ `pastable` removed from package.json
- ✅ All 297+ tests passing
- ✅ Type-check passing (0 errors)
- ✅ Build succeeds (ESM + CJS + DTS)
- ✅ Bundle size acceptable (<10KB increase)
- ✅ No functionality changes (snapshot tests match)

---

## Rollback Plan

If issues arise:

```bash
# Revert all changes
git checkout main

# Reinstall pastable
cd lib && pnpm add pastable@2.2.1
```

Alternatively, revert specific commits one by one.

---

## Estimated Effort

| Phase                  | Tasks        | Time Estimate |
| ---------------------- | ------------ | ------------- |
| Simple replacements    | 1-4          | 1-2 hours     |
| lodash-es replacements | 5-7          | 1 hour        |
| Custom implementations | 8-9          | 2-3 hours     |
| Type & cleanup         | 10-11        | 30 minutes    |
| **Total**              | **11 tasks** | **4-6 hours** |

---

## Next Steps

1. ✅ **Task 1.2 COMPLETE** - pastable analysis
2. ⏳ **Task 1.3** - openapi-types evaluation
3. ⏳ **Task 3.1** - Execute this plan (after dependency updates)

---

**This plan provides a complete roadmap for removing the pastable dependency with minimal risk and maximum confidence.**
