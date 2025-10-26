# Phase 0 Baseline Metrics

**Date:** October 26, 2025  
**Branch:** `feat/rewrite`  
**Commit:** `e1ef1a957167748e4974f2beb3ddc6141a178f24`  
**Purpose:** "Before" snapshot to measure rewrite success

---

## Executive Summary

| Metric                     | Current Value    | Phase 1 Target   | Phase 2 Target  | Phase 3 Target  |
| -------------------------- | ---------------- | ---------------- | --------------- | --------------- |
| **Source Lines of Code**   | 4,599 lines      | ~4,200 lines     | ~4,600 lines    | ~4,600 lines    |
| **Source Files**           | 28 files         | 27 files         | 27 files        | 27 files        |
| **Type Assertions (src/)** | 61 assertions    | ~30 assertions   | 0 assertions ✅ | 0 assertions ✅ |
| **Lint Issues**            | 143 (133 errors) | 145 (expected +) | 10 errors       | <10 errors ✅   |
| **Test Count**             | 468 tests        | 468+ tests       | 468+ tests      | 468+ tests      |
| **Test Pass Rate**         | 100%             | 100%             | 100%            | 100%            |
| **Build Time**             | 2.39s            | <2.5s            | <2.5s           | <2.5s           |
| **Quality Gates**          | 4/5 green        | 4/5 green        | 5/5 green ✅    | 5/5 green ✅    |

**Key Goals:**

- ✅ **Eliminate all type assertions** (61 → 0)
- ✅ **Reduce lint errors** (133 → <10)
- ✅ **Maintain test quality** (100% pass rate)
- ✅ **Improve architecture** (delete 4 flawed files)

---

## Code Metrics

### Lines of Code

**Command:**

```bash
cd lib
find src -name "*.ts" \
  ! -name "*.test.ts" \
  ! -path "*/templates/*" \
  ! -path "*/characterisation/*" \
  ! -path "*/tests-snapshot/*" \
  | xargs wc -l
```

**Result:** **4,599 total lines**

**Breakdown by Component (estimated):**

- `template-context.ts` - ~550 lines (largest file)
- `openApiToTypescript.helpers.ts` - ~450 lines
- `generateZodClientFromOpenAPI.ts` - ~290 lines
- `openApiToZod.ts` - ~280 lines
- `openApiToTypescript.ts` - ~250 lines
- `getZodiosEndpointDefinitionList.ts` - ~250 lines
- `zodiosEndpoint.operation.helpers.ts` - ~300 lines
- `zodiosEndpoint.path.helpers.ts` - ~200 lines
- Other files - ~2,029 lines

**Phase 1 Impact:**

- **Delete:** ~415 lines (resolver, CodeMeta + tests)
- **Create:** ~350 lines (component-access + tests)
- **Net:** ~65 lines fewer
- **Target:** ~4,200 lines

**Phase 2 Impact:**

- **Rewrite:** ~600 lines (ts-morph migration)
- **Net:** Approximately same LOC
- **Target:** ~4,600 lines (similar to current)

---

### File Count

**Command:**

```bash
cd lib
find src -name "*.ts" \
  ! -name "*.test.ts" \
  ! -path "*/templates/*" \
  ! -path "*/characterisation/*" \
  ! -path "*/tests-snapshot/*" \
  | wc -l
```

**Result:** **28 source files**

**Phase 1 Changes:**

- **Delete:** 2 files (`makeSchemaResolver.ts`, `CodeMeta.ts`)
- **Create:** 1 file (`component-access.ts`)
- **Net:** -1 file
- **Target:** 27 files

**Phase 2 Changes:**

- No new files (rewrite existing)
- **Target:** 27 files

**Phase 3 Changes:**

- Possibly remove zodios endpoint helpers
- **Target:** ~25 files

---

## Type Safety Metrics

### Type Assertions (CRITICAL METRIC)

**Command:**

```bash
cd lib
grep -r " as " src \
  --include="*.ts" \
  --exclude="*.test.ts" \
  --exclude-dir=characterisation \
  --exclude-dir=tests-snapshot \
  --exclude-dir=templates \
  | grep -v "as const" \
  | wc -l
```

**Result:** **61 type assertions in src/**

**Note:** Tests have additional assertions (74 total including tests)

**Breakdown by File (source only, estimated from architecture doc):**

1. `openApiToTypescript.helpers.ts` - ~22 assertions ❌
2. `openApiToTypescript.ts` - ~17 assertions ❌
3. `getZodiosEndpointDefinitionList.ts` - ~8 assertions
4. `zodiosEndpoint.operation.helpers.ts` - ~9 assertions
5. `inferRequiredOnly.ts` - ~7 assertions
6. `zodiosEndpoint.path.helpers.ts` - ~2 assertions
7. Other files - ~20 assertions

**Root Causes:**

1. **makeSchemaResolver lies** (causes ~35% of assertions)
   - Claims `SchemaObject`, returns any component type
   - Forces: `as ParameterObject`, `as RequestBodyObject`, `as ResponseObject`

2. **tanu types insufficient** (causes ~50% of assertions)
   - Most assertions are `as t.TypeDefinition[]`
   - Unclear if tanu is misused or insufficient

3. **Missing type guards** (causes ~10% of assertions)
   - Could use predicates instead

4. **Bundling workarounds** (causes ~5% of assertions)
   - Nested $ref checks force assertions

**Phase 1 Target:** ~30 assertions (50% reduction)

- Eliminate resolver-related assertions
- Eliminate CodeMeta-related assertions

**Phase 2 Target:** 0 assertions (100% elimination) ✅

- ts-morph migration eliminates tanu assertions
- Proper type guards for remaining cases

---

### Type Errors

**Command:**

```bash
cd lib
pnpm type-check
```

**Result:** **0 errors** ✅

**Target:** Maintain 0 errors through all phases

---

## Quality Metrics

### Lint Issues

**Command:**

```bash
cd lib
pnpm lint 2>&1 | grep "problems"
```

**Result:** **✖ 143 problems (133 errors, 10 warnings)**

**Breakdown:**

**Errors (133):**

- `@typescript-eslint/consistent-type-assertions` - ~74 warnings (will become errors)
- `sonarjs/cognitive-complexity` - ~20 errors
- `sonarjs/max-statements` - ~3 errors
- `sonarjs/max-lines-per-function` - ~2 errors
- `@typescript-eslint/require-await` - ~2 errors
- Other errors - ~32 errors

**Warnings (10):**

- Unused `eslint-disable` directives - 10 warnings (in new test file)

**Phase 1 Impact:**

- Type assertion rule will be changed to ERROR
- Will ADD ~74 errors initially (expected)
- Then eliminate ~30 assertions
- **Net:** +44 errors initially, then reduce
- **Target:** ~145 issues (temporary increase)

**Phase 2 Impact:**

- Eliminate remaining assertions (~30)
- Fix complexity issues during rewrites
- **Target:** ~10 errors

**Phase 3 Impact:**

- Final cleanup
- **Target:** <10 errors ✅

---

### Test Metrics

#### Unit Tests

**Command:**

```bash
cd lib
pnpm test -- --run
```

**Result:**

```
Test Files  11 passed (11)
     Tests  227 passed (227)
```

**Coverage:**

- Pure function tests
- Helper function tests
- Utility tests
- All passing ✅

**Target:** Maintain 227+ tests, 100% pass rate

---

#### Characterisation Tests

**Command:**

```bash
cd lib
pnpm character
```

**Result:**

```
Test Files  8 passed (8)
     Tests  89 passed (89)
```

**Files:**

- `generation.char.test.ts` - 15 tests
- `schema-dependencies.char.test.ts` - 10 tests
- `options.char.test.ts` - 20 tests
- `cli.char.test.ts` - 11 tests
- `error-handling.char.test.ts` - 10 tests
- `edge-cases.char.test.ts` - 11 tests
- **`bundled-spec-assumptions.char.test.ts` - 12 tests (NEW in Phase 0) ✅**

**Coverage:**

- Full generation pipeline
- CLI behavior (truly exercises system via execSync)
- Configuration options
- Error handling
- Edge cases
- **Bundled vs dereferenced specs (Phase 0 validation) ✅**

**Target:** Maintain 89+ tests, 100% pass rate

---

#### Snapshot Tests

**Command:**

```bash
cd lib
pnpm test:snapshot -- --run
```

**Result:**

```
Test Files  75 passed (75)
     Tests  152 passed (152)
```

**Coverage:**

- Generated code validation
- Regression protection
- All existing OpenAPI specs

**Target:** Maintain 152+ tests, 100% pass rate

---

#### Total Test Count

**Summary:**

| Test Type        | Files  | Tests   | Pass Rate |
| ---------------- | ------ | ------- | --------- |
| Unit             | 11     | 227     | 100%      |
| Characterisation | 8      | 89      | 100%      |
| Snapshot         | 75     | 152     | 100%      |
| **TOTAL**        | **94** | **468** | **100%**  |

**Phase 0 Addition:** +12 tests (bundled-spec-assumptions)

**Target All Phases:** Maintain 468+ tests, 100% pass rate

---

## Build Metrics

### Build Time

**Command:**

```bash
cd lib
time pnpm build
```

**Result:** **2.39 seconds** (total time)

**Breakdown:**

- ESM build: ~300ms
- CJS build: ~300ms
- DTS build (cli): ~1,261ms
- DTS build (main): ~1,596ms
- Overhead: ~200ms

**Target:** <2.5s (maintain current speed)

---

### Bundle Sizes

**Command:**

```bash
cd lib
ls -lh dist/*.{js,cjs}
```

**Result:**

| File                     | Size | Format | Purpose                  |
| ------------------------ | ---- | ------ | ------------------------ |
| `cli.cjs`                | 86K  | CJS    | CLI executable           |
| `openapi-zod-client.cjs` | 79K  | CJS    | CommonJS library export  |
| `openapi-zod-client.js`  | 77K  | ESM    | ES Module library export |

**Target:** Maintain or reduce bundle sizes

**Expected Phase 2 Impact:**

- ts-morph might increase bundle size slightly
- Goal: <100K for main library

---

## Dependency Metrics

### Direct Dependencies

**Command:**

```bash
cd lib
cat package.json | grep -A 20 '"dependencies"'
```

**Count:** **10 direct dependencies**

**List:**

```json
{
  "@apidevtools/swagger-parser": "^12.1.0",
  "@zodios/core": "^10.9.6",
  "commander": "^14.0.2",
  "handlebars": "^4.7.8",
  "lodash-es": "^4.17.21",
  "openapi3-ts": "^4.5.0",
  "prettier": "^3.6.2",
  "tanu": "^0.2.0",
  "ts-pattern": "^5.8.0",
  "zod": "^4.1.12"
}
```

**Phase 2 Changes:**

- Remove: `tanu` (-1)
- Add: `ts-morph` (+1)
- **Net:** 10 dependencies (unchanged)

**Phase 3 Changes:**

- Remove: `@zodios/core` (-1)
- **Net:** 9 dependencies

**Target:** 9 direct dependencies

---

### Dependencies to Remove

| Dependency     | Phase | Reason                         |
| -------------- | ----- | ------------------------------ |
| `tanu`         | 2     | Replace with ts-morph          |
| `@zodios/core` | 3     | Zod 4 incompatible, not needed |

### Dependencies to Add

| Dependency | Phase | Reason                             |
| ---------- | ----- | ---------------------------------- |
| `ts-morph` | 2     | Better TypeScript AST manipulation |

---

## Component Metrics

### Files to Delete (Phase 1)

| File                         | Lines    | Purpose                         |
| ---------------------------- | -------- | ------------------------------- |
| `makeSchemaResolver.ts`      | ~150     | Resolver (lies about types)     |
| `makeSchemaResolver.test.ts` | ~100     | Resolver tests                  |
| `CodeMeta.ts`                | ~85      | CodeMeta class (no clear value) |
| `CodeMeta.test.ts`           | ~80      | CodeMeta tests                  |
| **TOTAL**                    | **~415** | **Will be deleted**             |

---

### Files to Rewrite (Phase 1)

| File                                  | Lines      | Type Assertions | Changes                          |
| ------------------------------------- | ---------- | --------------- | -------------------------------- |
| `cli.ts`                              | ~220       | 2               | Change bundle() to dereference() |
| `template-context.ts`                 | ~550       | 4               | Remove resolver dependency       |
| `getOpenApiDependencyGraph.ts`        | ~85        | 0               | Accept doc directly              |
| `zodiosEndpoint.operation.helpers.ts` | ~300       | 9               | Remove resolver usage            |
| `zodiosEndpoint.path.helpers.ts`      | ~200       | 2               | Remove resolver usage            |
| `openApiToZod.ts`                     | ~280       | 4               | Remove CodeMeta                  |
| `openApiToTypescript.ts`              | ~250       | 17              | Remove CodeMeta usage            |
| `openApiToTypescript.helpers.ts`      | ~450       | 22              | Minor changes                    |
| **TOTAL**                             | **~2,335** | **60**          | **Will be rewritten**            |

---

### Files to Create (Phase 1)

| File                       | Lines    | Purpose                              |
| -------------------------- | -------- | ------------------------------------ |
| `component-access.ts`      | ~150     | Type-safe component access functions |
| `component-access.test.ts` | ~200     | Comprehensive unit tests             |
| **TOTAL**                  | **~350** | **New files**                        |

---

## Quality Gate Status

### Current Status (Phase 0 Complete)

| Gate       | Status  | Details                              |
| ---------- | ------- | ------------------------------------ |
| Format     | ✅ Pass | Prettier formatting enforced         |
| Build      | ✅ Pass | 5 successful builds (ESM, CJS, DTS)  |
| Type-check | ✅ Pass | 0 type errors                        |
| Lint       | ❌ Fail | 143 issues (133 errors, 10 warnings) |
| Test       | ✅ Pass | 468/468 tests passing (100%)         |

**Pass Rate:** 4/5 gates passing (80%)

---

### Phase 1 Expected Status

| Gate       | Status  | Details                                   |
| ---------- | ------- | ----------------------------------------- |
| Format     | ✅ Pass | Maintained                                |
| Build      | ✅ Pass | Maintained                                |
| Type-check | ✅ Pass | Maintained (0 errors)                     |
| Lint       | ❌ Fail | ~145 issues (temporary increase expected) |
| Test       | ✅ Pass | 468+/468+ tests passing (100%)            |

**Pass Rate:** 4/5 gates passing (80%)

**Note:** Lint will temporarily increase as assertion rule becomes ERROR

---

### Phase 2 Expected Status

| Gate       | Status  | Details                           |
| ---------- | ------- | --------------------------------- |
| Format     | ✅ Pass | Maintained                        |
| Build      | ✅ Pass | Maintained                        |
| Type-check | ✅ Pass | Maintained (0 errors)             |
| Lint       | ✅ Pass | ~10 issues (major improvement) ✅ |
| Test       | ✅ Pass | 468+/468+ tests passing (100%)    |

**Pass Rate:** 5/5 gates passing (100%) ✅

---

### Phase 3 Expected Status

| Gate       | Status  | Details                        |
| ---------- | ------- | ------------------------------ |
| Format     | ✅ Pass | Maintained                     |
| Build      | ✅ Pass | Maintained                     |
| Type-check | ✅ Pass | Maintained (0 errors)          |
| Lint       | ✅ Pass | <10 issues (excellent) ✅      |
| Test       | ✅ Pass | 468+/468+ tests passing (100%) |

**Pass Rate:** 5/5 gates passing (100%) ✅

---

## Success Criteria

### Phase 1 Success (8-10 hours)

- ✅ Type assertions: 61 → ~30 (50% reduction)
- ✅ Files deleted: 4 files (~415 lines)
- ✅ Files created: 2 files (~350 lines)
- ✅ CLI uses `dereference()` not `bundle()`
- ✅ Tests passing: Maintain 468+/468+ (100%)
- ✅ Type errors: Maintain 0
- ✅ Build time: <2.5s

**Key Milestone:** Resolver & CodeMeta eliminated

---

### Phase 2 Success (6-8 hours)

- ✅ Type assertions: ~30 → 0 (100% elimination) ⭐
- ✅ tanu dependency removed
- ✅ ts-morph added and working
- ✅ Tests passing: Maintain 468+/468+ (100%)
- ✅ Lint issues: ~145 → ~10 (major improvement)
- ✅ Generated code quality: Same or better
- ✅ Build time: <2.5s

**Key Milestone:** Zero type assertions achieved

---

### Phase 3 Success (4-6 hours)

- ✅ @zodios/core dependency removed
- ✅ Lint issues: ~10 → <10 (excellent)
- ✅ Tests passing: Maintain 468+/468+ (100%)
- ✅ All quality gates: 5/5 passing (100%) ⭐
- ✅ Build time: <2.5s

**Key Milestone:** All quality gates green

---

## Baseline Established

**Date:** October 26, 2025  
**Commit:** `e1ef1a957167748e4974f2beb3ddc6141a178f24`

✅ **Phase 0 COMPLETE** - Baseline metrics established

**Next:** Phase 1 - Eliminate makeSchemaResolver & CodeMeta

**Documentation:**

- Architecture: `.agent/architecture/CURRENT-ARCHITECTURE.md`
- Test suite: 468 tests, all passing
- Critical findings: `dereference()` not `bundle()`

---

**This baseline enables quantifiable measurement of rewrite success.**
