# IR Builder Linting Issues - Refactoring Plan

**Created:** November 13, 2025
**Status:** Ready for implementation
**Estimated Effort:** 2-3 hours
**Goal:** Resolve 33 linting errors in ir-builder.ts without bypassing any checks

---

## Current State Analysis

### Linting Errors (33 total)

1. **File length violation**: 458 lines (max 220) - BLOCKER
2. **Function complexity violations**:
   - `buildIRParameters`: Too complex, too many nested blocks, too many statements
   - `buildIRRequestBody`: Too complex, too many nested blocks
   - `buildIRResponses`: Too complex, too many nested blocks, too many statements
3. **Type safety violations**:
   - Type assertions (`as`) used
   - Non-null assertions (`!`) used
   - Deprecated property access
4. **Code quality issues**:
   - High cognitive complexity
   - Deep nesting

### Root Causes

1. **Architectural**: Operations building added to same file as schema building (doubled file size)
2. **Circular Dependencies**: Previous extraction attempt failed because:
   - Helper files tried to import `buildIRSchema` from main file
   - Main file tried to import helpers from helper files
   - Created circular dependency loop
3. **Type Safety**: Widening then narrowing pattern (OpenAPI library types → loose → narrow again)
4. **Complexity**: Helper functions doing too much (parameter mapping, schema building, conditionals all in one)

---

## Solution Architecture

### Module Hierarchy (Bottom-Up)

```
Layer 1: Core Primitives (no dependencies on other IR modules)
├── ir-builder.types.ts          [NEW] - Shared types (IRBuildContext)
└── ir-builder.core.ts            [NEW] - Schema primitives (buildIRSchema, buildIRSchemaNode)

Layer 2: Specialized Builders (depend only on Layer 1)
├── ir-builder.schemas.ts         [NEW] - Component schema extraction (buildIRSchemas)
├── ir-builder.parameters.ts      [NEW] - Parameter building (buildIRParameters)
├── ir-builder.request-body.ts    [NEW] - Request body building (buildIRRequestBody)
└── ir-builder.responses.ts       [NEW] - Response building (buildIRResponses)

Layer 3: Orchestration (depends on Layer 1 & 2)
├── ir-builder.operations.ts      [NEW] - Operation building (buildIROperations, buildIROperation)
└── ir-builder.ts                 [REFACTOR] - Main entry (buildIR) - orchestrates everything
```

### Key Principles

1. **No Circular Dependencies**: Layer N only imports from Layer N-1
2. **Library Types Only**: Trace type issues to source, preserve OpenAPI library types
3. **Single Responsibility**: Each function does ONE thing
4. **Complexity Limits**: Break complex functions into focused helpers
5. **No Type Escape Hatches**: Remove all `as`, `!`, `any` uses

---

## Implementation Steps

### Step 1: Create Core Primitives Layer (~20 min)

**Goal**: Extract shared schema building logic to bottom layer

**Actions**:

1. Create `lib/src/context/ir-builder.types.ts`:
   - Move `IRBuildContext` interface
   - Add TSDoc explaining usage
   - Export only types (no functions)

2. Create `lib/src/context/ir-builder.core.ts`:
   - Extract `buildIRSchema()` function
   - Extract `buildIRSchemaNode()` function
   - Extract all helper functions used by these two
   - Import types from `ir-builder.types.ts`
   - Use library types exclusively from `openapi3-ts/oas31`
   - Add comprehensive TSDoc

**Validation**:

```bash
# Should compile without errors
pnpm build 2>&1 | grep -E "(error|✓)"

# Should have no circular dependencies
grep -r "from './ir-builder" lib/src/context/ir-builder.core.ts
# Should only show imports from ir-builder.types.ts

# File size check
wc -l lib/src/context/ir-builder.core.ts
# Should be < 220 lines (aim for 150-180)

# Type check
pnpm type-check 2>&1 | tail -10
```

**Acceptance Criteria**:

- [x] `ir-builder.types.ts` created with IRBuildContext
- [x] `ir-builder.core.ts` created with buildIRSchema, buildIRSchemaNode
- [x] No imports from other ir-builder modules (except .types)
- [x] File < 220 lines
- [x] Builds successfully
- [x] Zero type errors

---

### Step 2: Create Specialized Builder Modules (~40 min)

**Goal**: Extract complex functions into focused, single-responsibility modules

**2A: Create `lib/src/context/ir-builder.schemas.ts`**

**Actions**:

- Extract `buildIRSchemas()` function
- Import `buildIRSchema` from `ir-builder.core.ts`
- Import types from `ir-builder.types.ts` and `ir-schema.ts`
- Keep focused on component schema extraction only
- Add comprehensive TSDoc

**Validation**:

```bash
# File size check
wc -l lib/src/context/ir-builder.schemas.ts
# Should be < 100 lines

# Dependency check
grep "from './ir-builder" lib/src/context/ir-builder.schemas.ts
# Should only import from .core and .types

pnpm build && pnpm type-check
```

**Acceptance Criteria**:

- [x] File < 100 lines
- [x] Only imports from .core and .types
- [x] Builds successfully
- [x] Zero type errors

**2B: Create `lib/src/context/ir-builder.parameters.ts`**

**Actions**:

- Extract `buildIRParameters()` function
- Import `buildIRSchema` from `ir-builder.core.ts`
- Break into focused helper functions:
  - `buildSingleParameter()` - process one parameter
  - `buildParameterSchema()` - extract schema from parameter
  - `buildParameterMetadata()` - extract metadata (description, examples, etc)
- Use library types: `ParameterObject`, `ReferenceObject` from `openapi3-ts/oas31`
- Remove type assertions - use proper type guards
- Add comprehensive TSDoc

**Validation**:

```bash
# File size check
wc -l lib/src/context/ir-builder.parameters.ts
# Should be < 150 lines

# Complexity check (after implementation)
pnpm lint lib/src/context/ir-builder.parameters.ts 2>&1 | grep -E "(complexity|error)"
# Should have 0 errors

# Type assertions check
grep " as " lib/src/context/ir-builder.parameters.ts
# Should return nothing (no type assertions)

grep "!" lib/src/context/ir-builder.parameters.ts | grep -v "!=="
# Should return nothing (no non-null assertions)

pnpm build && pnpm type-check
```

**Acceptance Criteria**:

- [x] File < 150 lines
- [x] No complexity violations
- [x] No type assertions (as)
- [x] No non-null assertions (!)
- [x] Only imports from .core and .types
- [x] Helper functions for single responsibility
- [x] Builds successfully
- [x] Zero type errors

**2C: Create `lib/src/context/ir-builder.request-body.ts`**

**Actions**:

- Extract `buildIRRequestBody()` function
- Import `buildIRSchema` from `ir-builder.core.ts`
- Break into focused helper functions:
  - `buildRequestBodyContent()` - process content type mappings
  - `buildMediaTypeSchema()` - extract schema for media type
- Use library types: `RequestBodyObject`, `ReferenceObject`, `MediaTypeObject`
- Remove type assertions
- Add comprehensive TSDoc

**Validation**:

```bash
wc -l lib/src/context/ir-builder.request-body.ts
# Should be < 120 lines

pnpm lint lib/src/context/ir-builder.request-body.ts 2>&1 | grep -E "(complexity|error)"
# Should have 0 errors

grep " as " lib/src/context/ir-builder.request-body.ts | grep -v "as const"
# Should return nothing

pnpm build && pnpm type-check
```

**Acceptance Criteria**:

- [x] File < 120 lines
- [x] No complexity violations
- [x] No type assertions
- [x] Only imports from .core and .types
- [x] Helper functions for single responsibility
- [x] Builds successfully
- [x] Zero type errors

**2D: Create `lib/src/context/ir-builder.responses.ts`**

**Actions**:

- Extract `buildIRResponses()` function
- Import `buildIRSchema` from `ir-builder.core.ts`
- Break into focused helper functions:
  - `buildSingleResponse()` - process one response
  - `buildResponseContent()` - process content mappings
  - `buildResponseHeaders()` - process headers
- Use library types: `ResponsesObject`, `ResponseObject`, `ReferenceObject`, `HeaderObject`, `MediaTypeObject`
- Remove type assertions
- Add comprehensive TSDoc

**Validation**:

```bash
wc -l lib/src/context/ir-builder.responses.ts
# Should be < 180 lines

pnpm lint lib/src/context/ir-builder.responses.ts 2>&1 | grep -E "(complexity|error)"
# Should have 0 errors

grep " as " lib/src/context/ir-builder.responses.ts | grep -v "as const"
# Should return nothing

pnpm build && pnpm type-check
```

**Acceptance Criteria**:

- [x] File < 180 lines
- [x] No complexity violations
- [x] No type assertions
- [x] Only imports from .core and .types
- [x] Helper functions for single responsibility
- [x] Builds successfully
- [x] Zero type errors

---

### Step 3: Create Operations Orchestration Layer (~20 min)

**Goal**: Create focused operations module that uses Layer 1 & 2

**Actions**:

1. Create `lib/src/context/ir-builder.operations.ts`:
   - Extract `buildIROperations()` function
   - Extract `buildIROperation()` function
   - Extract `buildIRSecurity()` function
   - Import helpers from Layer 2 (parameters, request-body, responses)
   - Import core from Layer 1 (for types)
   - Keep focused on operation orchestration only
   - Add comprehensive TSDoc

**Validation**:

```bash
# File size check
wc -l lib/src/context/ir-builder.operations.ts
# Should be < 180 lines

# Dependency check - should import from Layer 1 & 2
grep "from './ir-builder" lib/src/context/ir-builder.operations.ts
# Should show .core, .types, .parameters, .request-body, .responses

# No circular dependencies
grep "ir-builder.operations" lib/src/context/ir-builder.*.ts | grep -v "ir-builder.operations.ts:"
# Should return nothing (no other files import operations)

pnpm lint lib/src/context/ir-builder.operations.ts 2>&1 | grep -E "(complexity|error)"
# Should have 0 errors

pnpm build && pnpm type-check
```

**Acceptance Criteria**:

- [x] File < 180 lines
- [x] No complexity violations
- [x] Imports from .core, .types, .parameters, .request-body, .responses
- [x] No circular dependencies
- [x] Builds successfully
- [x] Zero type errors

---

### Step 4: Refactor Main Entry File (~15 min)

**Goal**: Reduce main file to orchestration only

**Actions**:

1. Refactor `lib/src/context/ir-builder.ts`:
   - Keep only `buildIR()` function
   - Keep `buildDependencyGraph()` stub
   - Import `buildIRSchemas` from `.schemas`
   - Import `buildIROperations` from `.operations`
   - Remove all other functions (now in specialized modules)
   - Add comprehensive TSDoc
   - Keep exports clean

**Validation**:

```bash
# File size check
wc -l lib/src/context/ir-builder.ts
# Should be < 100 lines

# Should only have buildIR and buildDependencyGraph
grep "^export function\|^function" lib/src/context/ir-builder.ts
# Should show only 2 functions

# Check imports
grep "from './ir-builder" lib/src/context/ir-builder.ts
# Should import from .schemas and .operations

pnpm lint lib/src/context/ir-builder.ts 2>&1 | grep -E "(error|✓)"
# Should have 0 errors

pnpm build && pnpm type-check
```

**Acceptance Criteria**:

- [x] File < 100 lines
- [x] Only 2 functions: buildIR, buildDependencyGraph
- [x] Imports from .schemas and .operations
- [x] All exports working correctly
- [x] Builds successfully
- [x] Zero type errors
- [x] Zero lint errors

---

### Step 5: Run Full Test Suite (~10 min)

**Goal**: Ensure zero behavioral changes

**Actions**:

1. Run all tests
2. Verify 770 tests still passing
3. Check for any test failures
4. If failures, trace to refactoring issues and fix

**Validation**:

```bash
# Run all tests
pnpm test 2>&1 | tee test-output.log

# Count test results
grep "Test Files" test-output.log
grep "Tests" test-output.log

# Should show:
# Test Files: X passed
# Tests: 770 passed

# Verify no failures
grep "FAIL" test-output.log
# Should return nothing

# Verify no skipped
grep "skipped" test-output.log
# Should return nothing
```

**Acceptance Criteria**:

- [x] All 770 tests passing
- [x] Zero test failures
- [x] Zero skipped tests
- [x] Zero behavioral changes (outputs identical)

---

### Step 6: Run Full Quality Gate Suite (~10 min)

**Goal**: Verify all quality gates pass

**Actions**:

1. Run format
2. Run build
3. Run type-check
4. Run lint (critical - must pass)
5. Run test:all
6. Run test:gen
7. Run test:snapshot
8. Run character

**Validation**:

```bash
# Full quality gate
echo "=== QUALITY GATE SUITE ==="

echo "1/8: Format"
pnpm format 2>&1 | tail -3

echo "2/8: Build"
pnpm build 2>&1 | tail -5

echo "3/8: Type Check"
pnpm type-check 2>&1 | tail -5

echo "4/8: Lint (CRITICAL)"
pnpm lint 2>&1 | tee lint-output.log | tail -20

# Count lint errors
LINT_ERRORS=$(grep " error " lint-output.log | wc -l | tr -d ' ')
echo "Lint errors: $LINT_ERRORS (must be 0)"

echo "5/8: Test All"
pnpm test 2>&1 | tail -10

echo "6/8: Test Gen"
pnpm test:gen 2>&1 | tail -5

echo "7/8: Test Snapshot"
pnpm test:snapshot 2>&1 | tail -5

echo "8/8: Character Tests"
pnpm character 2>&1 | tail -5

# Summary
echo ""
echo "=== QUALITY GATE SUMMARY ==="
[ "$LINT_ERRORS" -eq 0 ] && echo "✅ PASS: All quality gates GREEN" || echo "❌ FAIL: $LINT_ERRORS lint errors remain"
```

**Acceptance Criteria**:

- [x] Format: Passes
- [x] Build: Successful (0 errors)
- [x] Type Check: 0 errors
- [x] Lint: **0 errors** (critical)
- [x] Test: 770 passing
- [x] Test Gen: 20 passing
- [x] Test Snapshot: 158 passing
- [x] Character: 148 passing

---

### Step 7: Verify File Structure (~5 min)

**Goal**: Ensure proper module organization

**Actions**:

1. List all IR builder files
2. Check line counts
3. Verify no circular dependencies
4. Check imports/exports are clean

**Validation**:

```bash
# List files and line counts
echo "=== IR Builder Module Structure ==="
wc -l lib/src/context/ir-builder*.ts | sort -n

# Should show:
# ~30-50   ir-builder.types.ts
# ~150-180 ir-builder.core.ts
# ~80-100  ir-builder.schemas.ts
# ~120-150 ir-builder.parameters.ts
# ~100-120 ir-builder.request-body.ts
# ~150-180 ir-builder.responses.ts
# ~150-180 ir-builder.operations.ts
# ~60-80   ir-builder.ts (main)
# ~XXX     ir-builder.test.ts (tests)

# Verify no file exceeds limit
for file in lib/src/context/ir-builder*.ts; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 220 ]; then
    echo "❌ FAIL: $file has $lines lines (max 220)"
  else
    echo "✅ PASS: $file has $lines lines"
  fi
done

# Check for circular dependencies
echo ""
echo "=== Circular Dependency Check ==="
# Core should not import from other ir-builder modules
grep "from './ir-builder" lib/src/context/ir-builder.core.ts | grep -v "\.types" && echo "❌ FAIL: Core imports from other modules" || echo "✅ PASS: Core only imports .types"

# Layer 2 should only import from core/types
for file in lib/src/context/ir-builder.{schemas,parameters,request-body,responses}.ts; do
  invalid=$(grep "from './ir-builder" "$file" | grep -v -E "(\.core|\.types)")
  [ -n "$invalid" ] && echo "❌ FAIL: $file has invalid imports: $invalid" || echo "✅ PASS: $(basename $file)"
done

# Operations should only import from core/types/layer2
invalid=$(grep "from './ir-builder" lib/src/context/ir-builder.operations.ts | grep -v -E "(\.core|\.types|\.parameters|\.request-body|\.responses)")
[ -n "$invalid" ] && echo "❌ FAIL: operations has invalid imports: $invalid" || echo "✅ PASS: operations imports are correct"

# Main should only import from schemas/operations
invalid=$(grep "from './ir-builder" lib/src/context/ir-builder.ts | grep -v -E "(\.schemas|\.operations)")
[ -n "$invalid" ] && echo "❌ FAIL: main has invalid imports: $invalid" || echo "✅ PASS: main imports are correct"
```

**Acceptance Criteria**:

- [x] All files < 220 lines
- [x] No circular dependencies
- [x] Clean import hierarchy (Layer 1 → Layer 2 → Layer 3)
- [x] No files import from higher layers

---

### Step 8: Document and Commit (~10 min)

**Goal**: Document changes and create clean commit

**Actions**:

1. Update documentation
2. Create commit message
3. Verify everything is ready

**Validation**:

```bash
# Final verification
echo "=== FINAL VERIFICATION ==="

# All quality gates green?
pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test
EXIT_CODE=$?
[ "$EXIT_CODE" -eq 0 ] && echo "✅ All quality gates pass" || echo "❌ Quality gates failed"

# Lint specifically
LINT_COUNT=$(pnpm lint 2>&1 | grep " error " | wc -l | tr -d ' ')
[ "$LINT_COUNT" -eq 0 ] && echo "✅ Zero lint errors" || echo "❌ $LINT_COUNT lint errors remain"

# Test count
TEST_COUNT=$(pnpm test 2>&1 | grep "Tests" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
[ "$TEST_COUNT" -eq 770 ] && echo "✅ All 770 tests passing" || echo "⚠️  Test count: $TEST_COUNT"

echo ""
echo "Ready to commit: $([ "$EXIT_CODE" -eq 0 ] && [ "$LINT_COUNT" -eq 0 ] && [ "$TEST_COUNT" -eq 770 ] && echo "YES ✅" || echo "NO ❌")"
```

**Commit Message**:

```
refactor(ir-builder): resolve linting issues with proper module architecture

Resolved 33 linting errors by extracting ir-builder.ts into focused,
single-responsibility modules with clear dependency hierarchy.

Module Structure (bottom-up):
- ir-builder.types.ts: Shared types (IRBuildContext)
- ir-builder.core.ts: Schema primitives (buildIRSchema, buildIRSchemaNode)
- ir-builder.schemas.ts: Component extraction (buildIRSchemas)
- ir-builder.parameters.ts: Parameter building (buildIRParameters)
- ir-builder.request-body.ts: Request body building (buildIRRequestBody)
- ir-builder.responses.ts: Response building (buildIRResponses)
- ir-builder.operations.ts: Operation orchestration (buildIROperations)
- ir-builder.ts: Main entry (buildIR) - orchestrates everything

Changes:
- Extracted buildIRSchema/buildIRSchemaNode to core module (primitives layer)
- Split operations building into focused modules (< 220 lines each)
- Removed all type assertions and non-null assertions
- Eliminated circular dependencies through layered architecture
- Reduced function complexity through focused helper functions
- All files now < 220 lines (largest: 180 lines)

Quality:
- Zero lint errors (was 33)
- Zero type errors
- All 770 tests passing
- Zero behavioral changes
- No circular dependencies

Refs: PHASE-3-SESSION-2-IR-SCHEMA-FOUNDATIONS.md Section B2
```

**Acceptance Criteria**:

- [x] All quality gates pass
- [x] Documentation updated
- [x] Commit message prepared
- [x] Ready for Section B2 completion

---

## Definition of Done

**CRITICAL: ALL Must Pass**

- [ ] All 7 new modules created (types, core, schemas, parameters, request-body, responses, operations)
- [ ] Main ir-builder.ts refactored to orchestration only
- [ ] Every file < 220 lines
- [ ] Zero lint errors (was 33)
- [ ] Zero type errors
- [ ] Zero test failures (770 passing)
- [ ] Zero behavioral changes
- [ ] No circular dependencies
- [ ] No type assertions (except `as const`)
- [ ] No non-null assertions
- [ ] All quality gates pass (format, build, type-check, lint, test, test:gen, snapshot, character)
- [ ] Clean module hierarchy validated
- [ ] Documentation updated
- [ ] Commit message ready

---

## Risk Mitigation

**Risk**: Breaking tests during refactoring
**Mitigation**: Run tests after each module creation, fix immediately

**Risk**: Introducing type errors
**Mitigation**: Run type-check after each file, validate library types preserved

**Risk**: Creating new circular dependencies
**Mitigation**: Validate import hierarchy after each module, use dependency check script

**Risk**: Missing lint violations
**Mitigation**: Run lint on each new file as it's created, not just at end

---

## Execution Strategy

1. **Work Layer by Layer**: Complete Layer 1 (types, core) before starting Layer 2
2. **Validate After Each File**: Don't move to next file until current one passes all checks
3. **Keep Tests Running**: Run relevant tests after each extraction
4. **Preserve Exports**: Ensure main ir-builder.ts still exports buildIR properly
5. **Document As You Go**: Add TSDoc to each function as it's extracted

---

**Ready for implementation.** Follow TDD and RULES.md strictly. No shortcuts, no bypasses.
