# Lint Triage: Complete Analysis

**Date:** October 24, 2025  
**Total Issues:** 146 (72 errors, 74 warnings)  
**Critical Blocker:** 74 type assertions (ALL warnings)  
**Status:** Analysis Complete

---

## Executive Summary

### Issues by Priority

| Priority     | Count | Category        | Impact                       |
| ------------ | ----- | --------------- | ---------------------------- |
| **CRITICAL** | 74    | Type assertions | ❌ **EXTRACTION BLOCKER**    |
| **HIGH**     | 32    | Code complexity | Maintainability, readability |
| **MEDIUM**   | 20    | Type safety     | Runtime errors, bugs         |
| **LOW**      | 20    | Code quality    | Minor issues, style          |

### By Rule Type (Top 10)

```
74  @typescript-eslint/consistent-type-assertions  [BLOCKER]
10  max-statements
 8  @typescript-eslint/require-await
 7  sonarjs/function-return-type
 7  @typescript-eslint/restrict-plus-operands
 6  max-lines-per-function
 4  sonarjs/todo-tag
 4  @typescript-eslint/no-non-null-assertion
 3  max-lines
 2  sonarjs/no-selector-parameter
```

---

## 🚨 CRITICAL: Type Assertions (EXTRACTION BLOCKER)

**Count:** 74 warnings  
**Rule:** `@typescript-eslint/consistent-type-assertions`  
**Target Repo Requirement:** `assertionStyle: "never"` - **ZERO type assertions allowed**  
**Status:** Must be 0 before extraction

### Type Assertions by File

| File                                  | Count | Lines                                                                                                                    | Effort |
| ------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| `openApiToTypescript.helpers.ts`      | 23    | 119, 147, 172, 193, 214, 231, 251, 252, 275, 276, 289, 293, 305, 315, 328, 333, 335, 349, 353, 356, 374×2, 377, 381, 383 | HIGH   |
| `getZodiosEndpointDefinitionList.ts`  | 9     | 90, 91, 94, 99, 152, 183, 186, 187×2                                                                                     | MEDIUM |
| `openApiToTypescript.ts`              | 7     | 46, 71, 83, 93, 106, 113, 194                                                                                            | MEDIUM |
| `cli.ts`                              | 6     | 39, 104×2, 111, 120, 157                                                                                                 | MEDIUM |
| `schema-complexity.helpers.ts`        | 4     | 52×2, 64×2                                                                                                               | LOW    |
| `openApiToZod.ts`                     | 4     | 187, 222, 243, 286                                                                                                       | MEDIUM |
| `zodiosEndpoint.operation.helpers.ts` | 4     | 76, 132, 203, 233                                                                                                        | LOW    |
| `zodiosEndpoint.path.helpers.ts`      | 4     | 36, 72, 128, 145                                                                                                         | LOW    |
| `inferRequiredOnly.ts`                | 3     | 35, 41, 46                                                                                                               | LOW    |
| `template-context.ts`                 | 3     | 83, 99, 142                                                                                                              | LOW    |
| `schema-complexity.ts`                | 2     | 104, 112                                                                                                                 | LOW    |
| `generateJSDocArray.ts`               | 1     | 34                                                                                                                       | LOW    |
| `makeSchemaResolver.ts`               | 1     | 33                                                                                                                       | LOW    |
| `zodiosEndpoint.helpers.ts`           | 1     | 140                                                                                                                      | LOW    |

### Common Patterns

#### Pattern A: Tanu/AST Type Assertions (~23 instances in openApiToTypescript.helpers.ts)

```typescript
// CURRENT:
return someNode as t.TypeDefinition;

// SOLUTION: Fix return type union
function foo(): ts.Node | t.TypeDefinition {
    return someNode; // No assertion needed
}
```

#### Pattern B: Union Type Narrowing (~15 instances)

```typescript
// CURRENT:
const schema = obj as SchemaObject; // ❌

// SOLUTION: Use existing type guards
if (isReferenceObject(obj)) {
    return; // Handle reference
}
// TypeScript knows obj is SchemaObject here ✅
```

#### Pattern C: Function Return Type Mismatch (~10 instances)

```typescript
// CURRENT:
function foo(): string {
    return getValue() as string;  // ❌
}

// SOLUTION: Fix at source
function getValue(): string { ... }
function foo(): string {
    return getValue();  // ✅
}
```

#### Pattern D: Array/Object Type Widening (~5 instances)

```typescript
// CURRENT:
const arr = [...items] as SomeType[]; // ❌

// SOLUTION: Proper generic typing
function processItems<T extends SomeType>(items: T[]): T[] {
    return [...items]; // ✅
}
```

### Elimination Strategy

1. **Week 1: High-effort files**
    - `openApiToTypescript.helpers.ts` (23 assertions)
    - Create proper type guards
    - Fix union type handling

2. **Week 2: Medium-effort files**
    - `getZodiosEndpointDefinitionList.ts` (9)
    - `openApiToTypescript.ts` (7)
    - `cli.ts` (6)
    - `openApiToZod.ts` (4)

3. **Week 2-3: Low-effort files**
    - All remaining files (4 or fewer each)
    - Should be straightforward after patterns established

---

## 🔴 HIGH PRIORITY: Code Complexity

### Max Statements (10 errors)

Functions with too many statements (>30):

| File                                 | Function              | Line    | Statements | Complexity  |
| ------------------------------------ | --------------------- | ------- | ---------- | ----------- |
| `openApiToZod.ts`                    | `getZodSchema`        | 29      | 95         | **EXTREME** |
| `openApiToTypescript.ts`             | nested arrow          | 59      | 38         | High        |
| `template-context.ts`                | arrow                 | 20      | 41         | High        |
| `schema-complexity.ts`               | `getSchemaComplexity` | 43      | 32         | Medium      |
| `getZodiosEndpointDefinitionList.ts` | arrow                 | 53      | 34         | Medium      |
| `generateZodClientFromOpenAPI.ts`    | arrow                 | 73      | 40         | High        |
| `cli.ts`                             | arrow                 | 101     | 31         | Medium      |
| `openApiToTypescript.test.ts`        | arrow × 2             | 19, 599 | 43-44      | N/A (test)  |
| `schema-complexity.test.ts`          | arrow                 | 8       | 34         | N/A (test)  |

**Strategy:**

- Extract sub-functions
- Break into logical units
- Target: <30 statements per function

### Max Lines Per Function (6 errors)

| File                             | Function                   | Lines    | Target |
| -------------------------------- | -------------------------- | -------- | ------ |
| `openApiToZod.ts`                | `getZodSchema`             | 285      | <100   |
| `template-context.ts`            | arrow                      | 253      | <100   |
| `openApiToTypescript.ts`         | arrow × 2                  | 156, 119 | <100   |
| `openApiToTypescript.helpers.ts` | `getTypescriptFromOpenApi` | **384**  | <100   |
| `schema-complexity.ts`           | `getSchemaComplexity`      | 105      | <100   |

**Strategy:**

- Refactor into smaller functions
- Extract helper utilities
- Improve code organization

### Cognitive Complexity (1 error)

| File              | Function       | Complexity | Allowed |
| ----------------- | -------------- | ---------- | ------- |
| `openApiToZod.ts` | `getZodSchema` | **83**     | 29      |

**Strategy:**

- This will be addressed by breaking down the function
- Use early returns
- Extract nested conditionals
- Consider pattern matching (ts-pattern)

### Cyclomatic Complexity (2 errors)

| File                     | Function       | Complexity | Allowed |
| ------------------------ | -------------- | ---------- | ------- |
| `openApiToZod.ts`        | `getZodSchema` | 62         | 29      |
| `openApiToTypescript.ts` | arrow          | 31         | 29      |

**Strategy:**

- Reduce branching logic
- Extract decision functions
- Use lookup tables where applicable

### Max Lines (3 errors)

| File                             | Lines | Allowed |
| -------------------------------- | ----- | ------- |
| `template-context.ts`            | 481   | 350     |
| `openApiToZod.ts`                | 481   | 350     |
| `openApiToTypescript.helpers.ts` | 384   | 350     |

**Strategy:**

- Split into multiple files
- Extract utilities
- Better separation of concerns

---

## 🟡 MEDIUM PRIORITY: Type Safety Issues

### Require Await (8 errors)

Dead async functions that don't await anything:

| File                                                                | Line     | Function       |
| ------------------------------------------------------------------- | -------- | -------------- |
| `generateZodClientFromOpenAPI.test.ts`                              | 13, 4008 | Test functions |
| `openApiToTypescript.test.ts`                                       | 413, 458 | Test functions |
| `schema-complexity.test.ts`                                         | 8        | Test function  |
| `deps-graph-with-additionalProperties.test.ts`                      | 21       | Test function  |
| `group-strategy-file-multi-props-object-as-query-parameter.test.ts` | 7        | Test function  |
| `samples.test.ts`                                                   | 21       | Test function  |

**Strategy:**

- Remove `async` keyword (tests don't need it)
- Or add actual async operations if needed

### Function Return Type (7 errors)

Functions that sometimes return different types:

| File                             | Line         | Function           | Issue                |
| -------------------------------- | ------------ | ------------------ | -------------------- |
| `openApiToTypescript.helpers.ts` | 45, 156, 221 | Multiple functions | Inconsistent returns |
| `openApiToTypescript.ts`         | 45, 59, 105  | Multiple functions | Inconsistent returns |
| `openApiToZod.ts`                | 374          | Helper function    | Inconsistent returns |

**Strategy:**

- Define proper union return types
- Or ensure consistent return type
- Add type guards if needed

### No Non-Null Assertion (4 errors)

Forbidden `!` assertions:

| File                             | Line          | Usage       |
| -------------------------------- | ------------- | ----------- |
| `openApiToTypescript.helpers.ts` | 328, 349, 374 | `someProp!` |
| `openApiToTypescript.ts`         | 99            | `value!`    |

**Strategy:**

- Replace with proper null checks
- Use optional chaining (`?.`)
- Add type guards

### Unsafe Assignment/Argument (4 errors)

| File                             | Line   | Issue                   |
| -------------------------------- | ------ | ----------------------- |
| `openApiToTypescript.helpers.ts` | 93, 95 | Unsafe `any[]` usage    |
| `zodiosEndpoint.path.helpers.ts` | 33     | Unsafe `any` assignment |

**Strategy:**

- Add proper type constraints
- Use generics
- Avoid `any`

### Restrict Plus Operands (7 errors)

Invalid `CodeMeta + string` operations:

| File                            | Count | Lines          |
| ------------------------------- | ----- | -------------- |
| `invalid-pattern-regex.test.ts` | 3     | 20, 23, 27     |
| `unicode-pattern-regex.test.ts` | 4     | 23, 27, 30, 34 |

**Strategy:**

- Convert `CodeMeta` to string first: `codeMeta.toString()`
- Or use template literals: `` `${codeMeta}...` ``

### Restrict Template Expressions (2 errors)

| File                     | Line | Issue                  |
| ------------------------ | ---- | ---------------------- |
| `CodeMeta.test.ts`       | 250  | `CodeMeta` in template |
| `anyOf-behavior.test.ts` | 13   | `CodeMeta` in template |

**Strategy:**

- Add `.toString()` method to CodeMeta
- Or explicitly convert to string

---

## 🟢 LOW PRIORITY: Code Quality

### TODO Tags (4 errors)

| File                                | Line   | Comment       |
| ----------------------------------- | ------ | ------------- |
| `name-starting-with-number.test.ts` | 42     | TODO comment  |
| `recursive-schema.test.ts`          | 15     | TODO comment  |
| `validations.test.ts`               | 40, 45 | TODO comments |

**Strategy:**

- Address TODOs or move to issues
- Add context if keeping

### No Commented Code (2 errors)

| File                   | Line |
| ---------------------- | ---- |
| `openApiToZod.test.ts` | 19   |
| `topologicalSort.ts`   | 16   |

**Strategy:**

- Remove dead code
- Or add explanation if keeping for reference

### No Clear Text Protocols (2 errors)

HTTP URLs in tests:

| File                                      | Line   | URL       |
| ----------------------------------------- | ------ | --------- |
| `getZodiosEndpointDefinitionList.test.ts` | 12, 18 | `http://` |

**Strategy:**

- Change to `https://` in tests
- Or add eslint-disable comment with justification

### No Selector Parameter (2 errors)

Boolean parameters that control function behavior:

| File                             | Line     | Parameter                        | Function |
| -------------------------------- | -------- | -------------------------------- | -------- |
| `openApiToTypescript.helpers.ts` | 119, 214 | `shouldBeReadonly`, `isNullable` | Multiple |

**Strategy:**

- Split into separate functions
- Or use discriminated union parameter

### Other Minor Issues

**Prefer Single Boolean Return (1):**

- `inferRequiredOnly.ts:5` - Can simplify if-else to single return

**No Invariant Returns (1):**

- `schema-refiner.test.ts:19` - Test helper always returns same value

**Different Types Comparison (1):**

- `generateZodClientFromOpenAPI.test.ts:3472` - `!==` will always be true

**No Floating Promises (1):**

- `samples-generator.ts:17` - Promise not awaited

**No OS Command From Path (1):**

- `samples-generator.ts:20` - PATH variable security issue

**No Unused Expressions (1):**

- `openApiToTypescript.ts:107` - Expression with no effect

**Code Eval (1):**

- `anyOf-behavior.test.ts:13` - Dynamic code execution (test only)

**No Implied Eval (1):**

- `anyOf-behavior.test.ts:13` - Function constructor (test only)

---

## Implementation Plan

### Phase 1: Type Assertion Elimination (BLOCKER)

**Duration:** 2-3 weeks  
**Priority:** CRITICAL

1. **Week 1:** High-effort files
    - `openApiToTypescript.helpers.ts` (23 assertions)
    - Establish patterns for common cases

2. **Week 2:** Medium-effort files
    - `getZodiosEndpointDefinitionList.ts` (9)
    - `openApiToTypescript.ts` (7)
    - `cli.ts` (6)
    - `openApiToZod.ts` (4)

3. **Week 2-3:** Low-effort files
    - All remaining 10 files (≤4 each)

**Success Criteria:**

- ✅ Zero type assertions
- ✅ All tests passing
- ✅ No functionality changes
- ✅ Proper type guards added

### Phase 2: High-Priority Fixes

**Duration:** 1-2 weeks  
**Priority:** HIGH

1. **Code Complexity**
    - Refactor `getZodSchema` (openApiToZod.ts)
    - Break down large functions
    - Extract utilities

2. **Large Files**
    - Split `template-context.ts` (481 lines)
    - Split `openApiToZod.ts` (481 lines)
    - Split `openApiToTypescript.helpers.ts` (384 lines)

### Phase 3: Type Safety Improvements

**Duration:** 1 week  
**Priority:** MEDIUM

1. Remove `async` from test functions (8 instances)
2. Fix function return types (7 instances)
3. Remove non-null assertions (4 instances)
4. Fix `any` usage (4 instances)
5. Fix `CodeMeta` string operations (9 instances)

### Phase 4: Low-Priority Cleanup

**Duration:** 2-3 days  
**Priority:** LOW

1. Address or document TODOs (4)
2. Remove commented code (2)
3. Fix HTTP URLs in tests (2)
4. Refactor selector parameters (2)
5. Clean up minor issues (7)

---

## Tracking Progress

### Metrics

**Initial State (Oct 24, 2025):**

- Total Issues: 146 (72 errors, 74 warnings)
- Type Assertions: 74 ⚠️ **BLOCKER**
- Tests: 297 passing ✅
- TypeScript Errors: 0 ✅

**Target State:**

- Total Issues: 0 (all resolved)
- Type Assertions: 0 ✅ **EXTRACTION READY**
- Tests: 297+ passing ✅
- TypeScript Errors: 0 ✅

### Verification Command

```bash
# Count remaining type assertions
pnpm lint 2>&1 | grep "@typescript-eslint/consistent-type-assertions" | wc -l

# Full lint report
pnpm lint

# Must be zero before extraction
```

---

## Next Steps

1. ✅ **Task 1.1 COMPLETE** - Lint triage and categorization
2. ⏳ **Task 1.2** - pastable analysis
3. ⏳ **Task 1.3** - openapi-types evaluation
4. ⏳ **Task 1.4** - @zodios/core evaluation
5. ⏳ **Task 1.5** - swagger-parser investigation
6. ⏳ **Task 1.6** - openapi3-ts v4 investigation
7. ⏳ **Task 2.1-2.2** - Dependency updates
8. ⏳ **Task 3.2** - Type assertion elimination (uses this document)

---

**This analysis provides a complete roadmap for eliminating all lint issues and achieving extraction-ready state.**
