# Lint Triage - Type Safety Focused

## Current Status: 234 Problems (178 errors, 56 warnings)

**After removing unicorn rules, adding no-unsafe-argument to test rules, and fixing 26 critical issues in extracted files**

---

## 🔴 CRITICAL - Type Safety Destroyers (127 issues)

**MUST FIX** - These actively destroy type information and hide bugs:

| Rule                                               | Count | Type  | Impact                                        |
| -------------------------------------------------- | ----- | ----- | --------------------------------------------- |
| `@typescript-eslint/no-unsafe-assignment`          | 31    | error | Assigning `any` destroys downstream type info |
| `@typescript-eslint/no-unsafe-member-access`       | 24    | error | Accessing `any` members destroys type info    |
| `@typescript-eslint/no-unsafe-argument`            | 20    | error | Passing `any` to functions destroys type info |
| `@typescript-eslint/no-explicit-any`               | 19    | error | Explicit `any` annotations                    |
| `@typescript-eslint/no-non-null-assertion`         | 38    | warn  | `!` operator bypasses null/undefined checks   |
| `@typescript-eslint/consistent-type-assertions`    | 57    | warn  | Unnecessary `as` casts hide type issues       |
| `@typescript-eslint/no-unsafe-return`              | 2     | error | Returning `any` destroys type info            |
| `@typescript-eslint/no-unsafe-call`                | 1     | error | Calling `any` destroys type info              |
| `@typescript-eslint/restrict-plus-operands`        | 2     | error | Type coercion bugs                            |
| `@typescript-eslint/restrict-template-expressions` | 1     | error | Type coercion bugs                            |
| `@typescript-eslint/no-implied-eval`               | 1     | error | Runtime eval from strings                     |
| `@typescript-eslint/no-floating-promises`          | 1     | error | Unhandled async promises                      |

**Total Critical: ~197 issues**

### Where Are They?

**Files we ARE extracting:**

- `src/getZodiosEndpointDefinitionList.ts` - ⚠️ HIGH IMPACT (main extraction target)
- `src/makeSchemaResolver.ts` - ⚠️ MEDIUM IMPACT (used by extraction)
- `src/getOpenApiDependencyGraph.ts` - ⚠️ MEDIUM IMPACT (used by extraction)
- `src/isReferenceObject.ts` - ⚠️ LOW IMPACT (utility)

**Files we are NOT extracting:**

- `src/cli.ts` - ~52 issues (cac library has poor types, CLI not extracted)
- `src/generateZodClientFromOpenAPI.ts` - Template generation (not extracted)
- `src/openApiToTypescript.ts` - TS generation (not extracted, using tanu)
- `src/openApiToZod.ts` - Zod string generation (will rebuild with `.strict()`)
- `src/template-context.ts` - Template support (not extracted)
- `src/generateJSDocArray.ts` - JSDoc generation (not extracted)

---

## 🟡 HIGH PRIORITY - Dead Code (9 issues)

**SHOULD FIX** - Could hide bugs:

| Rule                                | Count | Type  | Impact           |
| ----------------------------------- | ----- | ----- | ---------------- |
| `@typescript-eslint/no-unused-vars` | 5     | error | Unused variables |
| `sonarjs/unused-import`             | 4     | error | Unused imports   |

**Total High Priority: 9 issues**

---

## 🟢 MEDIUM PRIORITY - Code Quality (26 issues)

**NICE TO FIX** - Improves maintainability:

| Rule                                       | Count | Type  | Impact                               |
| ------------------------------------------ | ----- | ----- | ------------------------------------ |
| `no-console`                               | 10    | warn  | Debug statements                     |
| `sonarjs/todo-tag`                         | 8     | error | TODO comments                        |
| `@typescript-eslint/ban-ts-comment`        | 7     | error | @ts-expect-error without explanation |
| `@typescript-eslint/no-unused-expressions` | 2     | error | Statements with no effect            |

**Total Medium Priority: 27 issues**

---

## 🔵 LOW PRIORITY - Style & Complexity (38 issues)

**CAN IGNORE** - Doesn't affect correctness:

| Rule                               | Count | Type  | Impact                        |
| ---------------------------------- | ----- | ----- | ----------------------------- |
| `@typescript-eslint/require-await` | 8     | error | async without await           |
| `sonarjs/no-control-regex`         | 6     | error | Control chars in regex        |
| `sonarjs/function-return-type`     | 4     | error | Missing explicit return types |
| `sonarjs/cognitive-complexity`     | 2     | warn  | Complex functions             |
| `sonarjs/no-nested-conditional`    | 2     | error | Nested ternaries              |
| `sonarjs/no-commented-code`        | 2     | error | Commented out code            |
| `sonarjs/no-clear-text-protocols`  | 2     | error | http:// in tests              |
| `no-useless-escape`                | 2     | error | Unnecessary escapes           |
| Other sonarjs rules                | 8     | error | Various code smells           |

**Total Low Priority: 38 issues**

---

## 📋 Action Plan

### Phase 1b Final Cleanup (BEFORE Phase 2)

**Step 1: Fix Critical Issues in Extracted Code** ⚠️ **REQUIRED**

Target files (in priority order):

1. ✅ `src/getZodiosEndpointDefinitionList.ts` - Main extraction target
2. ✅ `src/makeSchemaResolver.ts` - Used by extraction
3. ✅ `src/getOpenApiDependencyGraph.ts` - Used by extraction
4. ✅ `src/isReferenceObject.ts` - Utility

**Estimated effort**: 2-3 hours  
**Impact**: Clean type safety in extracted code

**Step 2: Fix Dead Code** ⚠️ **SHOULD DO**

- Remove 5 unused variables
- Remove 4 unused imports

**Estimated effort**: 15 minutes  
**Impact**: Cleaner code, no hiding bugs

**Step 3: Verify Test-Specific Rules** ✅ **DONE**

The ESLint config already has relaxed rules for tests (lines 66-81).

**Current test rules already disabled:**

- ✅ `@typescript-eslint/consistent-type-assertions` - Off
- ✅ `@typescript-eslint/no-explicit-any` - Off
- ✅ `@typescript-eslint/no-non-null-assertion` - Off
- ✅ `@typescript-eslint/no-unsafe-assignment` - Off
- ✅ `@typescript-eslint/no-unsafe-member-access` - Off
- ✅ `@typescript-eslint/no-unsafe-call` - Off
- ✅ `@typescript-eslint/no-unsafe-return` - Off

**Additional rule to add:**

- ❌ `@typescript-eslint/no-unsafe-argument` - Add to test section

**Estimated effort**: 1 minute  
**Impact**: Tests remain linted with appropriate relaxed rules

### NOT Fixing (Documented as Tech Debt)

**Files not extracted:**

- `src/cli.ts` - 52 issues (cac library limitation)
- `src/generateZodClientFromOpenAPI.ts` - Template generation
- `src/openApiToTypescript.ts` - TS generation (using tanu)
- `src/openApiToZod.ts` - Zod string generation (will rebuild)
- `src/template-context.ts` - Template support
- Various helper/generation files

**Rationale:**

- Not extracting these files
- Will rebuild schema generation with `.strict()`
- Fixing doesn't add value to extraction goals
- ~140 issues remain as documented tech debt

---

## Summary

| Priority                  | Count   | Action                                          |
| ------------------------- | ------- | ----------------------------------------------- |
| 🔴 Critical (Type Safety) | 161     | **✅ Fixed 26 in extracted files, ~135 remain** |
| 🟡 High (Dead Code)       | 9       | **Fix all**                                     |
| 🟢 Medium (Code Quality)  | 27      | Baseline as tech debt                           |
| 🔵 Low (Style)            | 38      | Baseline as tech debt                           |
| **TOTAL**                 | **234** | **Fix dead code (~9), baseline ~225**           |

---

## Acceptance Criteria for Phase 1 Completion

**Lint must pass with:**

- [x] Test-specific rules configured (appropriate relaxed rules for tests)
- [x] Critical type safety issues fixed in extracted files:
    - [x] `getZodiosEndpointDefinitionList.ts` - Fixed 15 critical issues
    - [x] `makeSchemaResolver.ts` - Fixed 7 critical issues
    - [x] `getOpenApiDependencyGraph.ts` - Fixed 3 critical issues
    - [x] `isReferenceObject.ts` - Fixed 1 critical issue
- [ ] All unused vars/imports removed (9 remaining in test files)
- [x] Remaining ~225 issues documented as tech debt (not blocking)

**Then proceed to Phase 2** (openapi3-ts v4)

---

## Files by Extraction Status

### ✅ EXTRACTING (Fix critical issues)

- `getZodiosEndpointDefinitionList.ts` - Runtime schema extraction
- `makeSchemaResolver.ts` - $ref resolution
- `getOpenApiDependencyGraph.ts` - Dependency analysis
- `isReferenceObject.ts` - Type guard
- Various type utilities

### 🔄 REBUILDING (Don't fix)

- `openApiToZod.ts` - Will rebuild with `.strict()`
- Template system - Not extracting

### ❌ NOT USING (Don't fix)

- `cli.ts` - CLI entry (not extracted)
- `generateZodClientFromOpenAPI.ts` - Code generation
- `openApiToTypescript.ts` - TS generation
- `template-context.ts` - Template support
- `getHandlebars.ts` - Template support
