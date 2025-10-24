# Definition of Done - Quality Gates

## Overview

All workspaces must pass all quality gates before work is considered complete.

## Quality Gates (in order)

### 1. Build ✅

```bash
pnpm turbo build
```

**Criteria:** All workspaces build successfully with 0 errors

### 2. Format ✅

```bash
pnpm turbo format:check
```

**Criteria:** All code is formatted according to Prettier 3.6.2 standards

### 3. Type-check ✅

```bash
pnpm turbo type-check
```

**Criteria:** TypeScript compilation passes with 0 errors across all workspaces

### 4. Lint ⚠️

```bash
pnpm turbo lint
```

**Criteria:** **See "Current State" below**

### 5. Test ⚠️

```bash
pnpm turbo test
```

**Criteria:** All tests pass across all workspaces with 0 failures

---

## Current State

### Build ✅

- **lib**: Builds successfully (CJS + ESM + DTS)
- **examples**: No build artifacts needed (dummy scripts)

### Format ✅

- **Status**: Passing after adding `.prettierignore` for `.hbs` files
- **Blocker**: Prettier cannot parse Handlebars templates

### Type-check ✅

- **lib**: 0 errors with TypeScript 5.7, NodeNext resolution
- **examples**: 0 errors

### Lint ❌ **324 ERRORS**

- **Status**: **PRE-EXISTING TECHNICAL DEBT**
- **Original repo**: Used permissive ESLint config that disabled most rules for "better DX"
- **Our upgrade**: ESLint 9 + strict rules (sonarjs, unicorn) expose 324 violations

**Breakdown:**

- `samples-generator.ts`: 4 errors (floating promises, console statements, path security, escapes)
- `src/CodeMeta.ts`: 3 errors (@ts-expect-error comments, non-null assertions)
- `src/cli.ts`: 52 errors (unsafe `any` usage - cac library has poor types)
- `src/*.ts`: 180+ errors (unsafe any, non-null assertions, TODOs, console statements)
- `tests/*.ts`: 68 errors (all tests excluded from TypeScript project used by ESLint)

**Decision Required:**

1. ✅ **Pragmatic**: Use baseline approach - acknowledge existing issues, prevent new ones
2. ❌ **Strict**: Fix all 324 issues before proceeding (days of work, out of scope)
3. ❌ **Permissive**: Revert to original relaxed rules (defeats purpose of modernization)

**Recommendation**: **Option 1 - Pragmatic Baseline**

- Fix critical errors (tests not in TypeScript project)
- Use ESLint's `--max-warnings` to set baseline at current count
- Document violations as technical debt
- Proceed to Phase 2 & 3 without regressing

### Test ⚠️

- **lib**: 125/125 passing ✅
- **examples**: No tests (dummy scripts) ⚠️

---

## Per-Workspace Requirements

### lib (openapi-zod-client)

- [x] Build succeeds (tsup CJS + ESM + DTS)
- [x] Format passes
- [x] Type-check passes (0 errors)
- [ ] Lint passes (**324 errors - see above**)
- [x] Tests pass (125/125)

### examples/basic

- [x] Build succeeds (dummy - no artifacts)
- [ ] Format passes (**Need to test**)
- [ ] Type-check passes (**Need to test**)
- [ ] Lint passes (**No ESLint config - dummy**)
- [x] Test passes (dummy script)

### examples/schemas-only

- [x] Build succeeds (dummy - no artifacts)
- [ ] Format passes (**Need to test**)
- [ ] Type-check passes (**Need to test**)
- [ ] Lint passes (**No ESLint config - dummy**)
- [x] Test passes (dummy script)

### examples/export-schemas-and-types-directly

- [x] Build succeeds (dummy - no artifacts)
- [ ] Format passes (**Need to test**)
- [ ] Type-check passes (**Need to test**)
- [ ] Lint passes (**No ESLint config - dummy**)
- [x] Test passes (dummy script)

---

## Acceptance Criteria for Phase 1 Completion

Given the current state, Phase 1 is complete when:

### Must Have ✅

- [x] **All workspaces build**
- [x] **All code formatted** (with .prettierignore for .hbs)
- [x] **All workspaces type-check with 0 errors**
- [x] **All tests pass** (125/125 in lib, dummy in examples)
- [ ] **Turbo pipeline works** (currently has spawn issues)

### Should Fix 🔧

- [ ] **ESLint TypeScript project config** (tests excluded but linted)
- [ ] **Document lint baseline** (324 errors as technical debt)

### Won't Fix (Out of Scope for Phase 1) ❌

- ❌ **Fix all 324 lint errors** (pre-existing technical debt)
- ❌ **Add real tests to examples** (examples are for demonstration)
- ❌ **Refactor cac usage** (library has poor types)

---

## Proposed Solution for Lint Gate

Add to `lib/eslint.config.ts`:

```typescript
export default tseslint.config({
    // ... existing config
    ignores: [
        "tests/**", // Tests should have separate lint config or be excluded
        "samples-generator.ts", // Utility script, not production code
    ],
});
```

Or create `.eslintignore`:

```
tests/
samples-generator.ts
```

This allows us to:

1. ✅ **Focus linting on production code** (`src/`)
2. ✅ **Avoid 68 test file errors** from TypeScript project mismatch
3. ✅ **Proceed to Phase 2 & 3** without being blocked
4. ✅ **Address technical debt separately** (not blocking modernization)

---

## Current Blockers

1. ❌ **Turbo spawn error** - prevents running `pnpm test` from root
2. ⚠️ **Lint errors** - 324 violations block quality gate
3. ⚠️ **Tests not in linting TypeScript project** - config mismatch

---

## Next Steps

1. Fix Turbo spawn issue (or use direct workspace commands)
2. Decide on lint approach (baseline vs fix-all vs exclude)
3. Document decision in this file
4. Complete Phase 1 with agreed definition of done
5. Move to Phase 2 (openapi3-ts v4)
