# Task 2.3: Migration Roadmap Analysis

## String-Based TypeScript Generation - Integration Plan

**Date:** 2025-10-27  
**Status:** Planning Phase  
**Goal:** Convert `openApiToTypescript.helpers.ts` from tanu AST nodes → string-based generation

---

## 📊 Function Inventory & Complexity Analysis

### Summary Statistics

```
Total Functions:      19
├─ No Change Needed:   3 (✅ already string-based or pure utilities)
├─ Simple Migration:   8 (🟢 direct mapping to new helpers)
├─ Medium Complexity:  5 (🟡 needs refactoring but straightforward)
└─ High Complexity:    3 (🔴 architectural decisions required)
```

---

## 🔍 Detailed Function Analysis

### Category A: No Changes Required ✅ (3 functions)

**1. `isPrimitiveSchemaType` (line 54)**

- **Status:** ✅ Complete
- **Reason:** Type predicate, returns boolean
- **Action:** None

**2. `isPropertyRequired` (line 160)**

- **Status:** ✅ Complete
- **Reason:** Pure utility, returns boolean
- **Action:** None

**3. `convertSchemasToTypes` (line 245)**

- **Status:** ✅ Complete
- **Reason:** Generic mapper, type-agnostic
- **Action:** None

---

### Category B: Simple Direct Replacements 🟢 (8 functions)

**4. `handleBasicPrimitive` (line 134)**

- **Current Return:** `ts.Node` (via `t.string()`, `t.boolean()`, `t.number()`)
- **New Return:** `string`
- **Replacement:** Use `handleBasicPrimitive()` from string-helpers
- **Dependencies:** None
- **Risk:** ⚠️ **CRITICAL: Function name collision!**
  - Current function has SAME NAME as new helper
  - **Solution:** Rename current to `handleBasicPrimitiveNode` or delete entirely
- **Priority:** 1 (blocking others)
- **Estimated Time:** 10 min

**5. `addNullToUnionIfNeeded` (line 255)**

- **Current Return:** `ts.Node` (via `t.union([type, t.reference('null')])`)
- **New Return:** `string`
- **Replacement:** Use `wrapNullable()` from string-helpers
- **Dependencies:** None
- **Risk:** Low
- **Priority:** 1 (commonly used)
- **Estimated Time:** 10 min

**6. `handleReferenceObject` (line 64, 76, 101)**

- **Current Return:** `ts.Node` (via `t.reference(schemaName)`)
- **New Return:** `string` (just return `schemaName`)
- **Replacement:** Direct - return the schema name as string
- **Dependencies:** Uses `getSchemaNameFromRef` (internal helper)
- **Risk:** Low
- **Note:** Function can already return `string` (line 68 signature)
- **Priority:** 1 (used everywhere)
- **Estimated Time:** 15 min

**7. `convertPropertyType` (line 266)**

- **Current Return:** `ts.Node | t.TypeDefinition` (via `t.reference()`)
- **New Return:** `string`
- **Replacement:** Return string directly instead of `t.reference()`
- **Dependencies:** Used by `convertObjectProperties`, `handleArraySchema`
- **Risk:** Medium (affects object/array handling)
- **Priority:** 2 (after references)
- **Estimated Time:** 10 min

**8. `maybeWrapReadonly` (line 150)**

- **Current Return:** `ts.Node | t.TypeDefinitionObject` (via `t.readonly()`)
- **New Return:** `string`
- **Replacement:** Use `wrapReadonly()` from string-helpers
- **Dependencies:** Used by `handleArraySchema`, `buildObjectType`, `handleAnyOf`
- **Risk:** Low
- **Priority:** 2 (needed for arrays)
- **Estimated Time:** 10 min

**9. `handlePrimitiveEnum` (line 108)**

- **Current Return:** `ts.Node | null` (via `t.union(enumValues)`)
- **New Return:** `string | null`
- **Replacement:** Use `handleStringEnum()`, `handleNumericEnum()`, `handleMixedEnum()`
- **Dependencies:** None
- **Risk:** Low
- **Priority:** 2 (enums are isolated)
- **Estimated Time:** 20 min (needs logic for detecting enum type)

**10. `handleOneOf` (line 377)**

- **Current Return:** `ts.Node` (via `t.union()`)
- **New Return:** `string`
- **Replacement:** Use `handleUnion()` from string-helpers
- **Dependencies:** Calls `convertSchema` recursively
- **Risk:** Medium (recursive conversion)
- **Priority:** 3 (after basics)
- **Estimated Time:** 20 min

**11. `handleTypeArray` (line 438)**

- **Current Return:** `ts.Node` (via `t.union()`)
- **New Return:** `string`
- **Replacement:** Use `handleUnion()` from string-helpers
- **Dependencies:** Calls `convertSchema` recursively
- **Risk:** Medium (recursive conversion)
- **Priority:** 3 (OpenAPI 3.1 feature)
- **Estimated Time:** 20 min

---

### Category C: Medium Complexity 🟡 (5 functions)

**12. `handleArraySchema` (line 305)**

- **Current Return:** `ts.Node | t.TypeDefinitionObject` (via `t.array()`)
- **New Return:** `string`
- **Replacement:** Use `handleArrayType()` or `handleReadonlyArray()`
- **Dependencies:**
  - Calls `convertSchema` (recursive)
  - Calls `convertPropertyType`
  - Calls `maybeWrapReadonly`
  - Adds nullable via `t.union()`
- **Risk:** Medium (multiple dependencies)
- **Priority:** 3 (after convertPropertyType and maybeWrapReadonly)
- **Estimated Time:** 30 min

**13. `handleAnyOf` (line 405)**

- **Current Return:** `ts.Node` (via `t.union()` and `t.array()`)
- **New Return:** `string`
- **Replacement:** Use `handleUnion()` and `handleArrayType()`
- **Dependencies:**
  - Calls `convertSchema` (recursive)
  - Calls `maybeWrapReadonly`
  - Special semantic: `T | T[]`
- **Risk:** Medium (special OpenAPI semantics)
- **Priority:** 4 (after handleArraySchema)
- **Estimated Time:** 30 min

**14. `resolveAdditionalPropertiesType` (line 195)**

- **Current Return:** `ts.Node | t.TypeDefinition | undefined` (via `t.any()`)
- **New Return:** `string | undefined`
- **Replacement:** Use `handleAnyType()` from string-helpers
- **Dependencies:** Calls `convertSchema` (recursive)
- **Risk:** Medium (recursive conversion)
- **Priority:** 3 (needed for objects)
- **Estimated Time:** 15 min

**15. `wrapObjectTypeForOutput` (line 351)**

- **Current Return:** `ts.Node | t.TypeDefinitionObject`
- **New Return:** `string` or keep as wrapper?
- **Replacement:** Use `handlePartialObject()` from string-helpers
- **Dependencies:**
  - Uses `t.reference('Partial', [...])`
  - Uses `t.type(name, ...)` for named types
- **Risk:** High (wraps final output - architectural decision)
- **Priority:** 5 (after object handling)
- **Estimated Time:** 30 min

---

### Category D: High Complexity 🔴 (3 functions)

**16. `createAdditionalPropertiesSignature` (line 171)**

- **Current Return:** `ts.TypeLiteralNode` (raw TypeScript AST via `ts.factory`)
- **New Return:** `string`?
- **Replacement:** Use `handleAdditionalProperties()` from string-helpers?
- **Dependencies:** None (pure ts.factory code)
- **Risk:** ⚠️ **CRITICAL: Uses raw TypeScript AST, not tanu!**
- **Architectural Question:**
  - Can we generate `{ [key: string]: T }` as a string?
  - **Answer: YES!** Our helper already does this.
- **Priority:** 4 (needed for objects)
- **Estimated Time:** 30 min (needs careful testing)

**17. `buildObjectType` (line 332)**

- **Current Return:** `ts.Node | t.TypeDefinitionObject`
- **New Return:** `string`
- **Replacement:** Use object helpers + `handleAdditionalProperties()` + `mergeObjectWithAdditionalProps()`
- **Dependencies:**
  - Calls `createAdditionalPropertiesSignature`
  - Uses `t.intersection()`
  - Calls `maybeWrapReadonly`
- **Risk:** High (core object building logic)
- **Priority:** 5 (after additionalProperties and readonly)
- **Estimated Time:** 45 min

**18. `convertObjectProperties` (line 283)**

- **Current Return:** `Record<string, t.TypeDefinition>`
- **New Return:** `string` (full object type)?
- **Replacement:** Use `handleObjectType()` from string-helpers
- **Dependencies:**
  - Calls `convertSchema` (recursive)
  - Calls `convertPropertyType`
  - Calls `isPropertyRequired`
  - Uses `t.optional()` for optional properties
  - Uses `wrapWithQuotesIfNeeded` for property names
- **Risk:** ⚠️ **CRITICAL: Return type mismatch!**
  - Currently returns `Record<string, t.TypeDefinition>` (object of types)
  - New approach needs full object type string
  - **Architectural Decision Required:**
    - Option A: Return intermediate structure, build string later
    - Option B: Change to return full object string immediately
- **Priority:** 6 (complex refactor, needs architectural decision)
- **Estimated Time:** 60 min

**19. `wrapTypeIfNeeded` (line 221)**

- **Current Return:** `t.TypeDefinitionObject | ts.Node`
- **New Return:** `string` or keep as is?
- **Replacement:** ?
- **Dependencies:**
  - Uses `t.reference()` for string conversion
  - Uses `t.type(name, ...)` for named type creation
- **Risk:** ⚠️ **CRITICAL: Architectural boundary!**
  - This function creates named type aliases: `type User = { ... }`
  - String-based approach generates type _expressions_, not _declarations_
  - **Key Question:** Where does string → declaration conversion happen?
- **Architectural Decision Required:**
  - Keep this function as-is (uses AstBuilder later)?
  - Or refactor the entire output pipeline?
- **Priority:** 7 (final integration, needs architectural clarity)
- **Estimated Time:** TBD (depends on architectural decision)

---

## 🚨 Critical Architectural Questions

### Question 1: Named Type Declarations

**Problem:** String helpers generate type _expressions_ (`string | number`), not _declarations_ (`type User = string | number`).

**Current Approach:**

- `wrapTypeIfNeeded()` uses `t.type(name, typeDef)` to create declarations
- Later, `tanu` prints these to TypeScript code

**New Approach Options:**

**Option A: Hybrid (Recommended)**

```typescript
// Helpers return strings (type expressions)
const userType = handleObjectType({ id: 'number', name: 'string' });
// → "{ id: number; name: string }"

// AstBuilder wraps strings into declarations
astBuilder.addTypeAlias('User', userType);
// → "export type User = { id: number; name: string };"
```

**Option B: Strings End-to-End**

```typescript
// Helpers return full declarations as strings
const userDeclaration = createTypeDeclaration('User', userType);
// → "export type User = { id: number; name: string };"
```

**Recommendation:** **Option A (Hybrid)**

- ✅ Clean separation: helpers = expressions, AstBuilder = declarations
- ✅ Already implemented (AstBuilder exists)
- ✅ Incremental migration path
- ✅ Easier testing (test expressions separately from declarations)

### Question 2: Object Properties Intermediate Representation

**Problem:** `convertObjectProperties()` currently returns `Record<string, t.TypeDefinition>`.

**Options:**

**Option A: Keep Intermediate Structure**

```typescript
// Return structured data
convertObjectProperties() → { id: 'number', name: 'string' }
// Later: handleObjectType({ id: 'number', name: 'string' })
```

**Option B: Return String Immediately**

```typescript
// Return full object string
convertObjectProperties() → "{ id: number; name: string }"
```

**Recommendation:** **Option A (Keep Structure)**

- ✅ More flexible (can add metadata, optional markers, etc.)
- ✅ Matches our `handleObjectType()` API
- ✅ Cleaner separation of concerns

---

## 📅 Recommended Migration Order

### Phase 1: Primitives & References (30 min)

**Goal:** Establish foundation, resolve name collision

1. ✅ Rename `handleBasicPrimitive` → `handleBasicPrimitiveNode` (or delete if unused)
2. 🟢 `handleReferenceObject` → return string
3. 🟢 `convertPropertyType` → return string
4. 🟢 `addNullToUnionIfNeeded` → use `wrapNullable()`

**Test After:** Run unit tests, verify no breaks

### Phase 2: Modifiers & Arrays (30 min)

**Goal:** Handle wrapping and collections

5. 🟢 `maybeWrapReadonly` → use `wrapReadonly()`
6. 🟢 `handlePrimitiveEnum` → use enum helpers
7. 🟢 `handleArraySchema` → use array helpers
8. 🟡 `resolveAdditionalPropertiesType` → use `handleAnyType()`

**Test After:** Run unit tests + array tests

### Phase 3: Compositions (45 min)

**Goal:** Handle unions and complex types

9. 🟢 `handleOneOf` → use `handleUnion()`
10. 🟢 `handleTypeArray` → use `handleUnion()`
11. 🟡 `handleAnyOf` → use union + array helpers

**Test After:** Run unit tests + composition tests

### Phase 4: Objects (90 min)

**Goal:** Handle most complex scenarios

12. 🔴 `createAdditionalPropertiesSignature` → use `handleAdditionalProperties()`
13. 🔴 `buildObjectType` → use object helpers + merge
14. 🔴 `convertObjectProperties` → refactor to structured output
15. 🟡 `wrapObjectTypeForOutput` → use `handlePartialObject()`

**Test After:** Run all tests, verify object generation

### Phase 5: Final Integration (60 min)

**Goal:** Wire everything together

16. 🔴 `wrapTypeIfNeeded` → integrate with AstBuilder
17. Update `openApiToTypescript.ts` to use new helpers
18. Remove `tanu` imports from helpers
19. Run ALL tests (unit, character, snapshot)

**Test After:** Full quality gate check

---

## ⚠️ Risk Mitigation

### High Risk Areas

1. **Object Property Handling** - Most complex, many dependencies
2. **Named Type Declarations** - Architectural boundary between expressions and declarations
3. **Recursive Conversions** - Many functions call `convertSchema` recursively

### Mitigation Strategies

1. **One Function at a Time** - Commit after each successful migration
2. **Test After Every Change** - Run tests immediately, don't accumulate changes
3. **Preserve Existing Tests** - All existing unit tests must pass
4. **Add Integration Tests** - Test helper → tanu → string transitions

### Rollback Plan

- Git commit after each function
- If any function breaks, revert that single commit
- Document reason, adjust approach, try again

---

## 📊 Estimated Timeline

```
Phase 1: Primitives & References     30 min
Phase 2: Modifiers & Arrays          30 min
Phase 3: Compositions                45 min
Phase 4: Objects                     90 min
Phase 5: Final Integration           60 min
─────────────────────────────────────────────
Total Implementation Time:          255 min (4.25 hours)

Testing & Validation:                60 min
Documentation & Cleanup:             30 min
─────────────────────────────────────────────
Total Task 2.3 Time:               ~5-6 hours
```

---

## ✅ Success Criteria

1. ✅ All 19 functions analyzed
2. ✅ All 680 tests still passing
3. ✅ Zero type errors
4. ✅ Zero lint errors added
5. ✅ No `tanu` imports in `openApiToTypescript.helpers.ts`
6. ✅ All string helpers actively used
7. ✅ Commit history shows incremental progress
8. ✅ Documentation updated

---

## 🎯 Next Step

**Decision Point:** Approve this migration plan, or discuss architectural questions first?

**Recommended:** Start Phase 1 immediately - it's low-risk and establishes foundation for architectural decisions in Phase 4.
