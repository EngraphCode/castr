# Remaining Lint Issues - Triage and Action Plan

**Status**: 121 problems (64 errors, 57 warnings)

## CRITICAL Issues (24 errors) - Type Safety

### enumHelpers.ts (3 errors)

- ❌ Line 37: `sonarjs/function-return-type`
- ❌ Line 83: `@typescript-eslint/no-base-to-string` - Object stringification
- ❌ Line 83: `@typescript-eslint/restrict-template-expressions` - Invalid type

### utils.ts (4 errors)

- ❌ Line 64: `@typescript-eslint/no-explicit-any` × 2
- ❌ Line 65: `@typescript-eslint/no-unsafe-argument`
- ❌ Line 65: `@typescript-eslint/no-explicit-any`

### openApiToTypescript.ts (13 errors)

- ❌ Line 88: `sonarjs/no-dead-store`
- ❌ Line 101, 127, 140, 156: `@typescript-eslint/no-non-null-assertion` × 4
- ❌ Line 164: `@typescript-eslint/no-unused-expressions`
- ❌ Line 192-193: `@typescript-eslint/no-unsafe-argument` × 2, `@typescript-eslint/no-unsafe-assignment`
- ❌ Line 331-332: `@typescript-eslint/no-explicit-any` × 2, `@typescript-eslint/no-unsafe-argument`

### schema-complexity.ts (1 error)

- ❌ Line 114: `@typescript-eslint/no-unsafe-assignment`

### CodeMeta.test.ts (1 error)

- ❌ Line 249: `@typescript-eslint/restrict-template-expressions` - Invalid type

## HIGH Issues (25 errors) - Code Quality

### Cognitive Complexity (4 errors)

- openApiToTypescript.ts line 71: 104/30
- getZodiosEndpointDefinitionList.ts line 110: 37/30
- getOpenApiDependencyGraph.ts line 12: 31/30
- schema-complexity.ts line 38: 33/30

### Function Return Type (5 errors)

- openApiToTypescript.ts: lines 55, 71, 162
- openApiToZod.ts: line 361
- enumHelpers.ts: line 37

### Test Files require-await (4 errors)

- generateZodClientFromOpenAPI.test.ts: lines 13, 4006
- openApiToTypescript.test.ts: lines 413, 458
- schema-complexity.test.ts: line 8

### Other (3 errors)

- inferRequiredOnly.ts line 5: `sonarjs/prefer-single-boolean-return`
- getZodiosEndpointDefinitionList.ts line 305: `sonarjs/no-nested-conditional`
- openApiToTypescript.ts line 280: `sonarjs/todo-tag`

## MEDIUM/LOW Issues (15 errors + 57 warnings)

### Code Cleanup

- 2× `sonarjs/no-commented-code` (openApiToZod.test.ts, topologicalSort.ts)
- 2× `sonarjs/no-clear-text-protocols` (test files - OK for tests)
- 1× `sonarjs/no-undefined-argument` (CodeMeta.test.ts)
- 1× `sonarjs/no-os-command-from-path` (samples-generator.ts)
- 1× `@typescript-eslint/no-floating-promises` (samples-generator.ts)

### Warnings (57 total)

- 44× `@typescript-eslint/consistent-type-assertions` - acceptable in many cases
- Various other style warnings

## Action Plan

### Phase 1: Fix CRITICAL issues (24 errors)

1. ✅ enumHelpers.ts - Fix type safety in new code
2. ✅ utils.ts - Fix explicit any usages
3. ✅ schema-complexity.ts - Fix unsafe assignment
4. ⏳ openApiToTypescript.ts - Fix critical type issues (13 errors)

### Phase 2: Fix HIGH issues (25 errors)

1. Simplify cognitive complexity where possible
2. Add explicit return types
3. Fix test async functions
4. Clean up misc issues

### Phase 3: Clean up MEDIUM/LOW

1. Remove commented code
2. Complete TODOs
3. Review warnings for easy wins
