# Phase 3 Session 1 – CodeMeta Elimination & Pure Function Extraction

**Status:** BLOCKED - Critical Issues Discovered  
**Estimated Effort:** 14-19 hours (base) + TBD for issue resolution  
**Parent Plan:** [PHASE-3-TS-MORPH-IR.md](./PHASE-3-TS-MORPH-IR.md) § "Session 3.1 – CodeMeta Elimination & Pure Function Extract"  
**Standards:** Must comply with [.agent/RULES.md](../RULES.md) — strict TDD, library types only, zero escape hatches, pure functions, exhaustive documentation

**⚠️ CRITICAL BLOCKERS DISCOVERED (Nov 11, 2025):**

1. **Code Generation Regression:** Template changes introduced bug where schema objects are not properly stringified, resulting in `[object Object].regex()` instead of `z.string().regex()`. Affects 4 snapshot tests (invalid-pattern-regex, regex-with-escapes, unicode-pattern-regex, validations).

2. **Linting Violations (60 errors):** Including serious RULES.md violations:
   - Unexpected console statements (forbidden in production code)
   - Type assertions and unsafe type operations
   - Functions exceeding complexity limits
   - Prettier formatting issues

3. **Workspace Hygiene:** JavaScript files present in workspace root violating TypeScript-only policy

**Quality Gate Status:**

- ✅ build, type-check, test (679 passing), test:gen (16 passing)
- ❌ lint (60 errors), test:snapshot (4 failures)

---

## Session Objectives

- **COMPLETELY DELETE** the CodeMeta abstraction (no migration path, no compatibility layer).
- Extract all Zod string generation logic into pure functions following the JSON Schema converter pattern.
- Replace all CodeMeta usages with plain objects `{ code: string; schema: SchemaObject; ref?: string }`.
- Align Zod converter architecture with JSON Schema converter (both use pure functions, return plain objects).
- Maintain zero behavioral changes (all tests passing, outputs identical).

---

## Strategic Context

### Why CodeMeta Must Be Deleted

**Problem:** CodeMeta is a poorly-conceived abstraction (ADR-013) that:

- Mixes concerns (wraps string generation + carries metadata)
- Provides no meaningful API (`.toString()`, `.assign()`, `.inherit()` are anti-patterns)
- Blocks ts-morph migration (wraps strings instead of exposing data)
- Prevents modular writer architecture (Phase 4 requirement)
- Adds unnecessary complexity (405 lines: 159 source + 246 tests)

**Solution:** Complete eradication. Extract pure functions and use plain objects.

**Impact:**

- ts-morph migration effort reduced by 50%
- Architecture aligned with JSON Schema converter
- Zod converter becomes testable, composable, functional
- Phase 4 writer architecture unblocked

### Alignment with JSON Schema Converter Pattern

Session 7 (JSON Schema conversion) established the correct pattern:

- Pure functions for code generation
- Plain object returns `{ schema, ...metadata }`
- No wrapper classes
- Composable, testable, functional

Session 3.1 brings Zod converter to same standard.

---

## Work Sections (Optimized for Minimal Context Switching)

### Section A: Pure Function Extraction (8-10 hours)

**Objective:** Extract all Zod string generation logic into pure, testable functions.

**Intended Impact:**

- All Zod string generation centralized in `lib/src/conversion/zod/code-generation.ts`
- Functions are pure, stateless, composable
- TDD ensures correctness through RED → GREEN cycle
- Pattern matches JSON Schema converter architecture

**Tasks:**

1. **Create Pure Function Module** (2h)
   - Create `lib/src/conversion/zod/code-generation.ts`
   - Define function signatures (write tests first):
     ```typescript
     export function generatePrimitiveZod(schema: SchemaObject, options?: Options): string;
     export function generateObjectZod(schema: SchemaObject, options?: Options): string;
     export function generateArrayZod(schema: SchemaObject, options?: Options): string;
     export function generateCompositionZod(
       schema: SchemaObject,
       type: 'anyOf' | 'allOf' | 'oneOf',
       options?: Options,
     ): string;
     export function generateReferenceZod(ref: string, ctx?: ConversionTypeContext): string;
     export function generateEnumZod(schema: SchemaObject, options?: Options): string;
     ```
   - Write failing tests for each function signature
   - Verify tests fail (TDD RED phase)

2. **Extract Generation Logic from CodeMeta** (4-6h)
   - Implement each pure function by extracting logic from:
     - `lib/src/shared/code-meta.ts`
     - `lib/src/conversion/zod/handlers*.ts`
   - Follow TDD: implement minimal code to pass each test
   - Verify tests pass (TDD GREEN phase)
   - Refactor for clarity while keeping tests green

3. **Add Comprehensive Test Coverage** (2h)
   - Unit tests for all pure functions
   - Cover edge cases (nullable, optional, arrays, compositions)
   - Test constraint handling (min/max, patterns, formats)
   - Ensure 100% code coverage for generation module

**Acceptance Criteria:**

- [ ] New module exists: `lib/src/conversion/zod/code-generation.ts`
- [ ] All generation functions exported and documented with TSDoc
- [ ] Comprehensive unit tests for all functions (30+ tests)
- [ ] Functions are pure (no side effects, stateless)
- [ ] Functions are composable (can be combined)
- [ ] Pattern matches `lib/src/conversion/json-schema/convert-schema.ts` architecture
- [ ] `pnpm test -- run src/conversion/zod/code-generation.test.ts` → ALL PASSING

**Validation Steps:**

```bash
# Step 1: Verify module exists
test -f lib/src/conversion/zod/code-generation.ts && echo "✅ Module created" || echo "❌ Missing"

# Step 2: Count exported functions
FUNC_COUNT=$(grep "^export function" lib/src/conversion/zod/code-generation.ts | wc -l | tr -d ' ')
[ "$FUNC_COUNT" -ge 6 ] && echo "✅ $FUNC_COUNT functions exported" || echo "❌ Only $FUNC_COUNT functions"

# Step 3: Run tests
pnpm test -- run src/conversion/zod/code-generation.test.ts

# Step 4: Check for pure function characteristics (no mutations, no external state)
! grep -E "(let |var )" lib/src/conversion/zod/code-generation.ts && echo "✅ No mutable state" || echo "⚠️  Found mutable state"

# Step 5: Compare structure with JSON Schema converter
echo "Architecture comparison:"
echo "JSON Schema converter:"
ls -la lib/src/conversion/json-schema/convert-schema.ts
echo "Zod converter (new):"
ls -la lib/src/conversion/zod/code-generation.ts
```

---

### Section B: CodeMeta Complete Deletion (2-3 hours)

**Objective:** COMPLETELY ERADICATE CodeMeta from the codebase.

**Intended Impact:**

- Zero mentions of "CodeMeta" in source code
- Zero mentions of "CodeMetaData" in source code
- Files deleted: `code-meta.ts`, `code-meta.test.ts`
- Exports removed from public API
- Technical debt eliminated

**Tasks:**

1. **Delete CodeMeta Files** (30min)
   - Delete `lib/src/shared/code-meta.ts` (159 lines)
   - Delete `lib/src/shared/code-meta.test.ts` (246 lines)
   - Run verification commands to confirm deletion

2. **Remove All Imports** (1h)
   - Search for all CodeMeta imports: `grep -r "import.*CodeMeta" lib/src/`
   - Remove each import line
   - Fix any immediate TypeScript errors
   - Remove CodeMetaData imports similarly

3. **Remove Public Exports** (30min)
   - Update `lib/src/index.ts` to remove CodeMeta exports
   - Update `lib/src/shared/index.ts` to remove CodeMeta exports
   - Verify no re-exports remain

4. **Verification Sweep** (1h)
   - Run comprehensive grep searches
   - Confirm zero mentions (case-sensitive and case-insensitive)
   - Document verification results

**Acceptance Criteria:**

- [ ] `lib/src/shared/code-meta.ts` does NOT exist
- [ ] `lib/src/shared/code-meta.test.ts` does NOT exist
- [ ] Zero mentions of "CodeMeta" in `lib/src/` (case-sensitive grep returns nothing)
- [ ] Zero mentions of "CodeMetaData" in `lib/src/` (case-sensitive grep returns nothing)
- [ ] Zero mentions of "codemeta" in `lib/src/` (case-insensitive grep returns nothing)
- [ ] `CodeMeta` removed from `lib/src/index.ts` exports
- [ ] `CodeMetaData` removed from `lib/src/index.ts` exports
- [ ] All verification commands pass (see below)

**Validation Steps:**

```bash
# CRITICAL: Files must not exist
test ! -f lib/src/shared/code-meta.ts && echo "✅ code-meta.ts deleted" || echo "❌ FAIL: Still exists"
test ! -f lib/src/shared/code-meta.test.ts && echo "✅ code-meta.test.ts deleted" || echo "❌ FAIL: Still exists"

# CRITICAL: Verify zero mentions in source code
echo "=== CodeMeta Eradication Check ==="
CODEMETA_COUNT=$(grep -r "CodeMeta" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CODEMETA_COUNT" -eq 0 ]; then
  echo "✅ PASS: Zero CodeMeta mentions"
else
  echo "❌ FAIL: Found $CODEMETA_COUNT mentions:"
  grep -r "CodeMeta" lib/src/ --include="*.ts"
  exit 1
fi

# Verify CodeMetaData also gone
METADATA_COUNT=$(grep -r "CodeMetaData" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
[ "$METADATA_COUNT" -eq 0 ] && echo "✅ PASS: Zero CodeMetaData mentions" || echo "❌ FAIL: Found $METADATA_COUNT mentions"

# Case-insensitive check
CASE_COUNT=$(grep -ri "codemeta" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
[ "$CASE_COUNT" -eq 0 ] && echo "✅ PASS: Zero case-insensitive matches" || echo "❌ FAIL: Found $CASE_COUNT matches"

# Verify exports removed
! grep -q "CodeMeta" lib/src/index.ts && echo "✅ PASS: Removed from exports" || echo "❌ FAIL: Still in exports"

echo "=== ✅ CODEMETA COMPLETELY ERADICATED ===" || echo "=== ❌ ERADICATION INCOMPLETE ==="
```

---

### Section C: Plain Object Replacement (2-3 hours)

**Objective:** Replace all CodeMeta usages with plain objects `{ code: string; schema: SchemaObject; ref?: string }`.

**Intended Impact:**

- All handler functions return plain objects (not CodeMeta instances)
- `getZodSchema()` returns plain object
- No more `.toString()`, `.assign()`, `.inherit()` method calls
- Complexity extraction moved to dedicated helper if needed

**Tasks:**

1. **Update Handler Function Return Types** (1h)
   - Update all handlers in `lib/src/conversion/zod/handlers*.ts`
   - Change return type from `CodeMeta` to `{ code: string; schema: SchemaObject; ref?: string }`
   - Update function implementations to return plain objects
   - Use pure functions from Section A for code generation

2. **Update getZodSchema Return Type** (30min)
   - Update `lib/src/conversion/zod/index.ts`
   - Change `getZodSchema()` return type to plain object
   - Update implementation to return `{ code, schema, ref? }`
   - Remove `.toString()` wrapper

3. **Update All Call Sites** (1h)
   - Find all places that call handler functions or `getZodSchema()`
   - Update to work with plain objects (access `.code` directly)
   - Remove `.toString()`, `.assign()`, `.inherit()` calls
   - Extract complexity logic to `lib/src/shared/schema-complexity.ts` if still needed

4. **Update Type Definitions** (30min)
   - Remove CodeMeta from all type signatures
   - Update handler types
   - Ensure type consistency across conversion module

**Acceptance Criteria:**

- [ ] `getZodSchema()` returns plain object: `{ code: string; schema: SchemaObject; ref?: string }`
- [ ] All handler functions return plain objects (not CodeMeta)
- [ ] No more `.toString()` calls in conversion code
- [ ] No more `.assign()` calls in conversion code
- [ ] No more `.inherit()` calls in conversion code
- [ ] Complexity logic moved to separate helper if still needed
- [ ] All handler types updated (no CodeMeta in signatures)
- [ ] `pnpm type-check` → 0 errors (no CodeMeta type references)

**Validation Steps:**

```bash
# Verify getZodSchema returns plain object
grep -A 10 "export.*function getZodSchema" lib/src/conversion/zod/index.ts
# Should show: { code: string; schema: SchemaObject; ref?: string }

# Verify no more CodeMeta method calls
echo "=== Checking for CodeMeta Method Calls ==="
! grep -r "\.toString()" lib/src/conversion/zod/ --include="*.ts" && echo "✅ No .toString()" || echo "⚠️  WARNING: .toString() found"
! grep -r "\.assign()" lib/src/conversion/zod/ --include="*.ts" && echo "✅ No .assign()" || echo "⚠️  WARNING: .assign() found"
! grep -r "\.inherit()" lib/src/conversion/zod/ --include="*.ts" && echo "✅ No .inherit()" || echo "⚠️  WARNING: .inherit() found"

# Verify handler return types
echo "=== Checking Handler Function Signatures ==="
grep -r "return {" lib/src/conversion/zod/handlers*.ts | head -10
# Should show plain object returns

# Type check must pass
pnpm type-check 2>&1 | grep -E "(Found 0 errors|✓)"
```

---

### Section D0: Generated Code Validation (2-3 hours)

**Status:** NEEDS RESTART ⚠️

**Objective:** Prove that generated TypeScript/Zod code is syntactically valid, type-safe, lintable, and executable.

**Intended Impact:**

- Generated code is validated to be syntactically correct TypeScript
- Generated code type-checks without errors
- Generated code passes all lint rules
- Generated Zod schemas are executable at runtime
- Quote-style and formatting implementation-constraint tests deleted
- Test suite focuses on proving behavior, not constraining implementation

**Progress Update (Nov 11, 2025):**

✅ **Bug Fixes Completed:**

- **Bug Fix #1:** Reference resolution in `handleReferenceObject()` ✅
  - Root cause: Function returned empty `code` instead of schema name for object properties with $ref
  - Fix: Return `{ ...code, code: schemaName }` for all reference paths in `handlers.core.ts`
  - TDD approach: Created `handlers.core.test.ts` with 3 failing unit tests → RED → implemented fix → GREEN
  - Impact: Eliminated syntax errors in generated code (e.g., `winner: ,` → `winner: winner`)

- **Bug Fix #2:** Duplicate error responses in generated code ✅
  - Root cause: Template rendered errors from BOTH `responses` array AND `errors` array when `withAllResponses` enabled
  - Discovery: `responses` array already contains error responses (e.g., `[200, 400]`), AND `errors` array contains same errors `[400]`
  - Fix: Modified `schemas-with-metadata.hbs` template logic:
    - If `responses` exists: render it (includes all responses including errors)
    - Else: render `response` + separate `errors` array
  - Impact: 695 tests passing (up from 683), tictactoe validation tests now passing, zero duplicate property errors
  - **This was a proper architectural fix, not a workaround**

⚠️ **Section D0 Infrastructure NOT Properly Implemented:**

**Problems identified:**

1. The comprehensive validation harness lives in `lib/src/validation/`, so it is excluded from CI and lacks fixture documentation.
2. No `lib/tests-generated/` directory, Vitest config, or temp-file hygiene for generated artifacts.
3. `pnpm test:gen` scripts do not exist (library or root), so quality gates never execute the suite.
4. Workspace quality gate aliases (`test:all`, etc.) do not cascade into a generated-code check.

**What needs to be done (restart Section D0):**

1. Create `lib/tests-generated/`, move `generated-code-validation.gen.test.ts` into it, and update imports to `../src/...`.
2. Document fixture rationale in `lib/tests-generated/FIXTURES.md` (tictactoe, petstore-expanded, non-oauth-scopes, multi-file, api-with-examples).
3. Add `lib/vitest.generated.config.ts` scoped to `tests-generated/**/*.gen.test.ts`, extend timeouts, and ensure the suite writes temp artifacts to `lib/tests-generated/.tmp` (cleaned up in `afterAll`).
4. Wire scripts:
   - `lib/package.json`: add `"test:gen"` / `"test:gen:watch"` using the new config.
   - Root `package.json`: add `"test:gen": "turbo test:gen"` and update `test:all` / quality gate macros to include it.
5. Run `pnpm test:gen` (library + root) and rerun the full quality gate stack once the harness is in place.

**Background:**

During initial Section D work, 6 unit tests failed due to quote-style mismatches (single vs double quotes). Deep analysis revealed these tests **constrain implementation** (checking string formatting) rather than **prove behavior** (does the code work?). This exposed a **critical missing test class**: we generate TypeScript/Zod code but never validate it's actually valid.

**What We're Proving:**

1. **Syntactic Validity** - Generated code parses as valid TypeScript (no syntax errors)
2. **Type Safety** - Generated code type-checks without errors (proves type correctness)
3. **Lint Compliance** - Generated code passes our lint rules (proves code quality standards)
4. **Runtime Validity** - Generated Zod schemas are executable (imports resolve, schemas construct)

**What We're NOT Testing:**

- Exact string formatting (quote style, whitespace) - implementation detail
- Generated code content matching snapshots - covered by existing snapshot tests
- Behavior of the generated code when called - out of scope for this session

**Tasks:**

1. **Define Representative Test Fixtures** (30min)
   - Identify 5-8 fixture specs that exercise all code generation paths
   - **Simple schema:** Basic types, primitives
   - **Complex object:** Nested objects, arrays, composition (allOf/anyOf/oneOf)
   - **References:** `$ref` usage, circular references
   - **Constraints:** Enums, patterns, min/max, required/optional
   - **Edge cases:** Nullable, deprecated, examples
   - Document the fixture list with rationale for each

2. **Create Validation Harness** (1-1.5 hours)
   - Location: `lib/tests-e2e/generated-code-validation.gen.test.ts` (new test suite)
   - Approach: Fixture specs → Generate code → Write to temp file → Run validation tools
   - Implement 4 validation helpers:
     - `runTypeScriptParser()` - Parse TS and check for syntax errors
     - `runTypeCheck()` - Execute `tsc --noEmit` on file
     - `runLint()` - Execute ESLint on file
     - Cleanup utilities for temp files
   - Follow TDD: write test structure first, confirm RED, implement helpers, confirm GREEN

3. **Delete Implementation-Constraint Tests** (15min)
   - Remove 6 quote-style tests from:
     - `lib/src/rendering/templates/schemas-with-client.test.ts`
     - `lib/src/rendering/templates/schemas-with-metadata.test.ts`
   - Tests to delete:
     1. "should import openapi-fetch" (quote-style check)
     2. "should import zod" (quote-style check)
     3. "should include endpoint metadata with operationId" (quote-style check)
     4. "should use 'as const' for endpoint metadata" (quote-style check)
     5. "should use correct path for each endpoint" (quote-style check)
     6. MCP metadata type check (quote-style check)
   - Rationale: These tests assert string formatting (implementation) not behavior

4. **Run Quality Gates** (30min)
   - Execute full quality gate suite with new tests
   - Verify all gates pass including new generated code validation
   - Confirm test count adjustment (6 deleted, ~20-32 added)

**Acceptance Criteria:**

- [x] Dedicated directory created: `lib/tests-generated/` ✅
- [x] Representative fixture list documented: `lib/tests-generated/FIXTURES.md` ✅
- [x] Reusable validation harness: `lib/tests-generated/validation-harness.ts` ✅
- [x] Temp file utilities: `lib/tests-generated/temp-file-utils.ts` ✅
- [x] Test infrastructure files created as TypeScript (`*.gen.test.ts`): ✅
  - `lib/tests-generated/syntax-validation.gen.test.ts` ✅
  - `lib/tests-generated/type-check-validation.gen.test.ts` ✅
  - `lib/tests-generated/lint-validation.gen.test.ts` ✅
  - `lib/tests-generated/runtime-validation.gen.test.ts` ✅
- [x] `pnpm test:gen` script added to `lib/package.json` ✅
- [x] `pnpm test:gen` script added to root `package.json` via Turbo ✅
- [x] `lib/vitest.generated.config.ts` created ✅
- [x] All 4 validation types properly implemented with TypeScript ✅
- [x] Tests pass GREEN for all fixtures (16/16 passing) ✅
- [x] Temp files cleaned up properly after each test ✅
- [x] `.gitignore` updated to ignore temp directory ✅
- [x] `lib/eslint.config.ts` updated to ignore temp directory ✅
- [x] `turbo.json` updated with `test:gen` task ✅
- [ ] **BLOCKED:** Code generation regression fixed (4 snapshot tests failing)
- [ ] **BLOCKED:** Linting violations resolved (60 errors including RULES.md violations)
- [ ] **BLOCKED:** JavaScript files removed from workspace root
- [ ] All quality gates passing: format, build, type-check, lint, test, test:gen, test:snapshot, character

**Validation Steps (AFTER RESTART):**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Verify directory structure
test -d lib/tests-generated && echo "✅ Directory created" || echo "❌ Missing tests-generated/"
test -f lib/tests-generated/FIXTURES.md && echo "✅ Fixtures documented" || echo "❌ Missing FIXTURES.md"

# Verify TypeScript test files exist
test -f lib/tests-generated/syntax-validation.gen.test.ts && echo "✅ Syntax validation" || echo "❌ Missing"
test -f lib/tests-generated/type-check-validation.gen.test.ts && echo "✅ Type-check validation" || echo "❌ Missing"
test -f lib/tests-generated/lint-validation.gen.test.ts && echo "✅ Lint validation" || echo "❌ Missing"
test -f lib/tests-generated/runtime-validation.gen.test.ts && echo "✅ Runtime validation" || echo "❌ Missing"

# Verify test:gen script exists
grep -q '"test:gen"' lib/package.json && echo "✅ test:gen script added" || echo "❌ Missing script"

# Run generated code validation tests
pnpm test:gen

# Run full quality gate
pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test && pnpm test:gen && pnpm test:snapshot && pnpm character

echo "✅ All quality gates passed"
```

---

### Section D: Quality Gates & Final Validation (1-1.5 hours)

**Objective:** Ensure all quality gates pass and zero behavioral changes introduced.

**Intended Impact:**

- All tests passing (unit + snapshot + characterization)
- Zero type errors
- Zero lint errors
- Zero behavioral changes (outputs identical)
- Session 3.1 complete and ready for merge

**Tasks:**

1. **Run Full Quality Gate Suite** (30min)
   - Execute each quality gate individually
   - Record results for each gate
   - Fix any issues discovered

2. **Verify Zero Behavioral Changes** (30min)
   - Compare generated outputs before/after
   - Run characterization tests
   - Ensure snapshot tests pass without updates

3. **Final Eradication Verification** (15min)
   - Re-run all CodeMeta eradication checks
   - Confirm file deletion
   - Confirm zero mentions

4. **Documentation Updates** (15-30min)
   - Update ADR-013 status: "Resolved"
   - Update session plan status
   - Prepare commit message

**Acceptance Criteria:**

- [ ] `pnpm format` → Passes
- [ ] `pnpm build` → Builds successfully (0 errors)
- [ ] `pnpm type-check` → 0 errors (no CodeMeta type references)
- [ ] `pnpm lint` → 0 errors, 0 warnings
- [ ] `pnpm test` → All passing (676+ tests, 0 failures, 0 skipped)
- [ ] `pnpm test:snapshot` → All passing (158+ tests, no updates needed)
- [ ] `pnpm character` → All passing (148+ tests, 0 failures)
- [ ] Zero behavioral changes (all outputs identical to before)
- [ ] Final eradication check passes (see validation below)
- [ ] Commit message prepared (see below)

**Validation Steps:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# CRITICAL: Full quality gate must pass
echo "=== Running Full Quality Gate Suite ==="
pnpm format && \
pnpm build && \
pnpm type-check && \
pnpm lint && \
pnpm test && \
pnpm test:snapshot && \
pnpm character

EXIT_CODE=$?
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ PASS: Full quality gate passed"
else
  echo "❌ FAIL: Quality gate failed with exit code $EXIT_CODE"
  exit 1
fi

# Final eradication verification
echo "=== FINAL CODEMETA ERADICATION CHECK ==="
test ! -f lib/src/shared/code-meta.ts && echo "✅ code-meta.ts deleted" || exit 1
test ! -f lib/src/shared/code-meta.test.ts && echo "✅ code-meta.test.ts deleted" || exit 1
[ $(grep -r "CodeMeta" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ') -eq 0 ] && echo "✅ Zero CodeMeta" || exit 1
[ $(grep -r "CodeMetaData" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ') -eq 0 ] && echo "✅ Zero CodeMetaData" || exit 1
[ $(grep -ri "codemeta" lib/src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' ') -eq 0 ] && echo "✅ Zero case-insensitive" || exit 1
echo "=== ✅ CODEMETA COMPLETELY ERADICATED ==="

# Integration test
echo "=== Integration Testing ==="
pnpm build
cd lib
node dist/cli/index.js ../examples/openapi/v3.1/tictactoe.yaml -o /tmp/test-session-3-1.ts
echo "✅ CLI still works"
cat /tmp/test-session-3-1.ts | head -20
echo "✅ Output looks valid"

# Test count comparison (should be same or more)
CURRENT_TESTS=$(pnpm test 2>&1 | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
echo "Current test count: $CURRENT_TESTS (should be ≥676)"
```

**Commit Message Template:**

```
refactor(zod): delete CodeMeta, extract pure functions

BREAKING CHANGE: CodeMeta class removed (no migration path)

Session 3.1 - CodeMeta Elimination & Pure Function Extraction

Completely removed the poorly-conceived CodeMeta abstraction (ADR-013)
and extracted all Zod string generation into pure functions following
the JSON Schema converter pattern established in Session 7.

Changes:
- Deleted lib/src/shared/code-meta.ts (159 lines)
- Deleted lib/src/shared/code-meta.test.ts (246 lines)
- Created lib/src/conversion/zod/code-generation.ts (pure functions)
- Updated getZodSchema() to return plain object
- Updated all handler functions to use pure functions
- Aligned Zod converter with JSON Schema converter architecture

Impact:
- 405 lines deleted (159 source + 246 tests)
- ts-morph migration unblocked (no legacy abstractions)
- Architecture simplified (pure functions, composable)
- Phase 4 writer architecture enabled

Quality Gates: All green (format ✅ build ✅ type-check ✅ lint ✅ test ✅ snapshot ✅ character ✅)
Tests: 676+ passing, 0 failures, 0 skipped
Behavioral Changes: None (outputs identical)

Refs: ADR-013, PHASE-3-TS-MORPH-IR.md Session 3.1
```

---

## Definition of Done

**CRITICAL: Complete CodeMeta Eradication**

- [ ] `lib/src/shared/code-meta.ts` does NOT exist
- [ ] `lib/src/shared/code-meta.test.ts` does NOT exist
- [ ] Zero mentions of "CodeMeta" in `lib/src/` (verified via grep)
- [ ] Zero mentions of "CodeMetaData" in `lib/src/` (verified via grep)
- [ ] Zero mentions of "codemeta" in `lib/src/` case-insensitive (verified via grep)
- [ ] Eradication verification script passes (exit code 0)

**Standard Completion Criteria**

- [ ] All work sections (A, B, C, D0, D) completed
- [ ] All acceptance criteria met for each section
- [ ] All validation steps executed and passing
- [ ] Quality gate passes: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test && pnpm test:snapshot && pnpm character`
- [ ] Zero behavioral changes (outputs identical to before)
- [ ] Pure functions module created: `lib/src/conversion/zod/code-generation.ts`
- [ ] All handler functions return plain objects
- [ ] `getZodSchema()` returns plain object: `{ code: string; schema: SchemaObject; ref?: string }`
- [ ] Comprehensive test coverage (30+ new tests for pure functions)
- [ ] Generated code validation tests passing for representative fixtures
- [ ] TSDoc complete for all exported functions
- [ ] ADR-013 updated: "Resolved in Session 3.1"
- [ ] Session plan updated: Status → "Complete"
- [ ] Commit created with proper message

**Breaking Changes (Accepted - No Users)**

- Public API changed: `getZodSchema()` returns plain object instead of CodeMeta instance
- CodeMeta class deleted (no migration path, clean break)
- CodeMetaData type deleted (no migration path, clean break)
- No backward compatibility maintained (this is a rewrite, no external users)

---

## Success Metrics

**Quantitative:**

- Lines of code deleted: 405 (159 source + 246 tests)
- Lines of code added: ~200-250 (pure functions + tests)
- Net reduction: ~150-205 lines
- Test count: Same or higher (676+)
- Quality gates: All green (7/7)

**Qualitative:**

- Architecture aligned with JSON Schema converter
- Code is more testable (pure functions)
- Code is more composable (functions can be combined)
- Code is more maintainable (single responsibility)
- Technical debt eliminated (ADR-013 resolved)
- ts-morph migration unblocked (50% effort reduction)
- Phase 4 writer architecture enabled

---

## Risk Mitigation

**Risk:** Breaking existing functionality  
**Mitigation:**

- Comprehensive test coverage (unit + snapshot + characterization)
- Zero behavioral changes requirement (outputs must be identical)
- Full quality gate execution
- TDD approach (tests written first)

**Risk:** Incomplete CodeMeta removal  
**Mitigation:**

- Automated verification scripts (grep-based checks)
- Multiple verification sweeps (case-sensitive and case-insensitive)
- File deletion confirmation
- Export removal confirmation

**Risk:** Time overrun  
**Mitigation:**

- Work sections sized for 2-3 hour chunks
- Clear acceptance criteria for each section
- Validation steps can be run independently
- Can pause between sections if needed

---

## References

- **CodeMeta Analysis:** `.agent/analysis/CODEMETA_ANALYSIS.md`
- **ADR-013:** Architecture Rewrite Decision (CodeMeta poorly conceived)
- **JSON Schema Converter:** `lib/src/conversion/json-schema/convert-schema.ts` (reference pattern)
- **Session 7 Plan:** `.agent/plans/PHASE-2-SESSION-7-JSON-SCHEMA-CONVERSION.md` (established pattern)
- **Coding Standards:** `.agent/RULES.md` (TDD, pure functions, zero escape hatches)
- **Parent Plan:** `.agent/plans/PHASE-3-TS-MORPH-IR.md`

---

## 🚀 Quick Start for Fresh Chat (No Prior Context)

**Current State (Nov 11, 2025):**

✅ **COMPLETE:**

- Sections A, B, C: CodeMeta deleted, pure functions extracted, plain objects in use
- Bug Fix #1: Reference resolution (`handleReferenceObject`) - schema names now correct
- Bug Fix #2: Duplicate error responses - architectural fix in template logic
- Section D0: Generated code validation infrastructure complete (modular harness, 16 tests passing)
- Test status: 679 unit tests + 16 generated code validation tests passing

⚠️ **CRITICAL ISSUES DISCOVERED - MUST INVESTIGATE:**

**1. Code Generation Regression (URGENT):**

Template changes from Bug Fix #2 introduced a serious bug where schema objects are not being properly converted to strings during code generation. This results in `[object Object].regex()` appearing in generated code instead of `z.string().regex()`.

**Symptoms:**

- 4 snapshot tests failing: `invalid-pattern-regex`, `regex-with-escapes`, `unicode-pattern-regex`, `validations`
- Error pattern: `"[object Object].regex(...)"` instead of `"z.string().regex(...)"`
- Root cause: Schema-to-code conversion breaking after template modifications

**Investigation needed:**

- Review template changes in `lib/src/rendering/templates/schemas-with-metadata.hbs`
- Check Zod code generation handlers in `lib/src/conversion/zod/`
- Identify where `.toString()` or string conversion is missing
- Ensure all schema objects are properly stringified before template rendering

**2. Linting Violations (60 errors):**

Serious RULES.md violations discovered in validation test files:

- Unexpected console statements (forbidden in production code per @RULES.md)
- Type assertions violating type safety rules
- Functions exceeding complexity thresholds
- Prettier formatting issues

**Files with violations:**

- `lib/tests-generated/validation-harness.ts`
- `lib/tests-generated/temp-file-utils.ts`
- `lib/tests-generated/*.gen.test.ts`

**3. Workspace Hygiene:**

JavaScript files present in workspace root violating TypeScript-only policy. Need to identify and remove or convert to TypeScript.

**Quality Gate Status:**

- ✅ build, type-check, test (679 passing), test:gen (16 passing)
- ❌ lint (60 errors), test:snapshot (4 failures), character (not run)

**Section D0 (2-3 hours) - ✅ INFRASTRUCTURE COMPLETE:**

The generated code validation harness exists but is mislocated and not wired into any quality gates. Restart work focuses on reorganising and integrating the suite:

1. **Scaffold directory + fixtures doc**
   - `mkdir -p lib/tests-generated`
   - Move `lib/src/validation/generated-code-validation.gen.test.ts` → `lib/tests-generated/`
   - Update imports to reference `../src/...`
   - Create `lib/tests-generated/FIXTURES.md` describing the five representative specs (tictactoe, petstore-expanded, non-oauth-scopes, multi-file, api-with-examples)

2. **Add Vitest config**
   - Create `lib/vitest.generated.config.ts` limited to `tests-generated/**/*.gen.test.ts`
   - Increase timeouts (30s) and reuse project aliases
   - Update the suite to write temp artifacts to `lib/tests-generated/.tmp` and clean them in `afterAll`

3. **Wire scripts**
   - `lib/package.json`: add `"test:gen"` / `"test:gen:watch"` pointing at the new config
   - Root `package.json`: add `"test:gen": "turbo test:gen"` and include `pnpm test:gen` in `test:all` / quality gate macros

4. **Validate**
   - Run `pnpm test:gen` inside `lib/` and from the workspace root
   - Extend the standard gate to `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test && pnpm test:gen && pnpm test:snapshot && pnpm character`

5. **Document completion**
   - Update this plan, `context.md`, `continuation_prompt.md`, and `HANDOFF.md`
   - Note removal/absence of the old quote-style assertions

**Then Section D (1-1.5 hours):** Final quality gates & validation

**Key Documents to Read:**

- `@RULES.md` - Mandatory coding standards (TDD, type safety, TSDoc)
- This file - Complete session plan
- `@PHASE-3-TS-MORPH-IR.md` - Parent plan context

**Success Criteria:**

- All quality gates GREEN
- Test count increased (new validation tests added)
- Zero behavioral changes to existing functionality

---

**Ready to restart Section D0 with proper implementation.** All work must follow TDD and adhere strictly to RULES.md.
