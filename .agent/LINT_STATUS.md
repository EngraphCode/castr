# Lint Status - Post Complexity Refactoring

**Date**: October 23, 2025  
**Total Issues**: 139 (82 errors, 57 warnings)  
**Threshold**: Cognitive Complexity: 29 (adjusted from 30)

---

## 🎯 Critical Issues Summary

### Type Safety Issues (5 critical errors)

#### getZodiosEndpointDefinitionList.ts (1 error)

- **Line 147:21**: `@typescript-eslint/no-unsafe-argument`
    - Issue: `any` type passed as `ReferenceObject | ResponseObject`
    - Context: `operation.responses[statusCode]`
    - Fix: Add explicit type guard or assertion

#### openApiToTypescript.helpers.ts (3 errors)

- **Line 75:49**: `@typescript-eslint/no-unsafe-argument`
    - Issue: `any[]` passed as `TypeDefinition[]`
- **Line 75:50**: `@typescript-eslint/no-unsafe-assignment`
    - Issue: Unsafe spread of `any` value in array
- **Line 75:98**: `@typescript-eslint/no-unsafe-argument`
    - Issue: `any[]` passed as `TypeDefinition[]`
    - Context: All in `addNullToUnionIfNeeded` function dealing with composition

#### schema-complexity.ts (1 error)

- **Line 114:84**: `@typescript-eslint/no-unsafe-assignment`
    - Issue: Unsafe assignment of `any` value
    - Context: Schema property access

---

## 🔄 Cognitive Complexity Issues (3 files)

### 1. getOpenApiDependencyGraph.ts

- **Line 12**: Complexity **31/29** (need -2 points)
- **Status**: Just slightly over threshold
- **Effort**: Low - minimal refactoring needed

### 2. schema-complexity.ts

- **Line 38**: Complexity **33/29** (need -4 points)
- **Also has**:
    - max-lines-per-function: 117/100 lines
    - max-statements: 41/30 statements
- **Status**: Needs moderate refactoring
- **Effort**: Medium

### 3. getZodiosEndpointDefinitionList.ts

- **Line 67**: Complexity **47/29** (need -18 points!)
- **Also has**:
    - max-lines-per-function: 175/100 lines
    - max-statements: 66/30 statements
    - cyclomatic complexity: 47/29
- **Status**: Main function, already extracted 289 lines, still complex
- **Effort**: High - needs further helper extraction

---

## 📊 Progress Summary

### ✅ Completed

- openApiToTypescript.ts: 104 → <30 ✅ BELOW THRESHOLD
- Extracted getZodVarName: 82 lines → 3 lines
- Extracted operation processing: 207 lines → 48 lines
- Created 3 helper files with 29 pure functions
- Added 47 unit tests
- All 254 tests passing

### 🔨 Remaining Work

#### High Priority (Blocks completion)

1. **Fix 5 type safety errors** (no-unsafe-\*)
    - getZodiosEndpointDefinitionList.ts (1)
    - openApiToTypescript.helpers.ts (3)
    - schema-complexity.ts (1)

2. **Reduce cognitive complexity** (3 files)
    - getOpenApiDependencyGraph.ts: 31 → 29 (-2 points)
    - schema-complexity.ts: 33 → 29 (-4 points)
    - getZodiosEndpointDefinitionList.ts: 47 → 29 (-18 points)

#### Medium Priority

- Remove unused imports (5 occurrences)
- Fix function-return-type issues (3 occurrences)
- max-statements violations (5 functions)
- max-lines-per-function violations (4 functions)

#### Low Priority (Style/Best Practice)

- 57 warnings (mostly type assertions)
- no-selector-parameter suggestions
- HTTP protocol warnings in tests

---

## 🎯 Next Steps

### Immediate (Phase 1a Completion)

1. Fix 5 type safety errors
2. Extract helpers to reduce getZodiosEndpointDefinitionList from 47 → 29
3. Quick refactor for getOpenApiDependencyGraph (31 → 29)
4. Moderate refactor for schema-complexity (33 → 29)

### Short Term

- Address max-statements and max-lines-per-function violations
- Clean up unused imports

### Optional (If time permits)

- Reduce type assertions (57 warnings)
- Consider no-selector-parameter refactoring

---

## 📈 Metrics

### Before Session

- openApiToTypescript.ts: Complexity 104
- getZodiosEndpointDefinitionList.ts: Complexity 37 + 82-line function
- Tests: 207
- Lint errors: 213

### Current

- openApiToTypescript.ts: Complexity <30 ✅
- getZodiosEndpointDefinitionList.ts: Complexity 47 (from 37 + embedded 82-line function)
- Tests: 254 (+47)
- Lint errors: 82 (down from 213!)
- **61% reduction in errors!**

### Target

- All cognitive complexity ≤29
- Zero type safety errors
- All tests passing ✅
- Build successful ✅
