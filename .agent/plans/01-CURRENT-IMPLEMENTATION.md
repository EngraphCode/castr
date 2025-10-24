# Current Implementation Plan: Phase 2 - Type Safety & Dependencies

**Date:** October 24, 2025  
**Phase:** 2 of 4  
**Status:** Ready to Execute  
**Estimated Duration:** 2-3 weeks

---

## Overview

This document contains the **detailed task breakdown** for Phase 2 work. Every task includes:

- **Acceptance Criteria:** What "done" looks like
- **Implementation Steps:** How to do it
- **Validation Steps:** How to verify it works

**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run` must pass after every task.

---

## Task Execution Order

Tasks MUST be executed in this order due to dependencies:

```
1. Dependency Analysis (investigations) [Week 1]
   ├─ 1.1 Lint Triage
   ├─ 1.2 pastable Analysis
   ├─ 1.3 openapi-types Evaluation
   ├─ 1.4 @zodios/core Evaluation
   ├─ 1.5 swagger-parser Investigation
   └─ 1.6 openapi3-ts v4 Capabilities

2. Dependency Updates [Week 1-2]
   ├─ 2.1 Update openapi3-ts (v3 → v4.5.0)
   └─ 2.2 Update zod (v3 → v4.1.12)

3. Code Cleanup [Week 2-3]
   ├─ 3.1 Replace pastable
   ├─ 3.2 Eliminate Type Assertions (BLOCKER)
   └─ 3.3 Remove Evaluated Dependencies

4. Validation [Week 3]
   └─ 4.1 Full Quality Gate Check
```

---

## 1. Dependency Analysis & Investigation (✅ COMPLETE 7/7)

### 1.1 Lint Triage & Categorization ✅

**Status:** Complete  
**Priority:** HIGH (identifies BLOCKER)  
**Time Taken:** 2 hours

**Acceptance Criteria:**

- [x] ✅ All 146 lint issues categorized by priority
- [x] ✅ Type assertions (74) documented by file and line
- [x] ✅ Critical issues identified and prioritized
- [x] ✅ Document created: `.agent/analysis/LINT_TRIAGE_COMPLETE.md`

**Implementation Steps:**

1. **Generate detailed lint report:**

    ```bash
    cd lib
    pnpm lint --format json > ../.agent/analysis/lint-report.json
    pnpm lint > ../.agent/analysis/lint-report.txt
    ```

2. **Categorize by rule:**

    ```bash
    grep "error\|warning" .agent/analysis/lint-report.txt | \
      awk '{print $NF}' | sort | uniq -c | sort -rn > \
      .agent/analysis/lint-by-rule.txt
    ```

3. **Document type assertions by file:**

    ```bash
    grep "@typescript-eslint/consistent-type-assertions" \
      .agent/analysis/lint-report.txt > \
      .agent/analysis/type-assertions.txt
    ```

4. **Create triage document** with:
    - **CRITICAL (Extraction Blockers):**
        - 74 type assertions (must be 0)
        - 4 non-null assertions
    - **HIGH (Type Safety):**
        - 8 require-await violations
        - 7 function-return-type issues
        - 2 unsafe-assignment
        - 2 unsafe-argument
    - **MEDIUM (Code Quality):**
        - 10 max-statements
        - 6 max-lines-per-function
        - 2 no-selector-parameter
    - **LOW (Style/Minor):**
        - 4 todo-tag
        - 3 max-lines
        - 2 no-commented-code

5. **Create file-by-file plan:**
    - For each file with type assertions
    - Document: location, current code, proposed fix
    - Estimate effort per file

**Validation Steps:**

1. Document contains all 148 issues categorized
2. Type assertions list matches `grep` count (74)
3. Priority levels assigned to all issues
4. File-by-file elimination plan exists

**Output:**

- `.agent/analysis/LINT_TRIAGE_COMPLETE.md`
- `.agent/analysis/lint-report.json`
- `.agent/analysis/type-assertions.txt`

---

### 1.2 pastable Usage Analysis ✅

**Status:** Complete  
**Priority:** HIGH  
**Time Taken:** 2 hours

**Acceptance Criteria:**

- [x] ✅ All 7 files using pastable documented
- [x] ✅ All 8 functions mapped to replacements
- [x] ✅ Replacement strategy chosen (lodash-es + custom utilities)
- [x] ✅ Document created: `.agent/analysis/PASTABLE_REPLACEMENT_PLAN.md`

**Implementation Steps:**

1. **Inventory all usage:**

    ```bash
    cd lib
    grep -rn "from \"pastable" src/ > ../.agent/analysis/pastable-imports.txt
    grep -rn "pastable/" src/ >> ../.agent/analysis/pastable-imports.txt
    ```

2. **Document each function:**

    | Function               | File                                                     | Usage                     | Replacement                         | Complexity |
    | ---------------------- | -------------------------------------------------------- | ------------------------- | ----------------------------------- | ---------- |
    | `get`                  | makeSchemaResolver.ts, getOpenApiDependencyGraph.test.ts | Object property access    | lodash.get or `?.`                  | Low        |
    | `capitalize`           | utils.ts, generateZodClientFromOpenAPI.ts                | String capitalization     | native or lodash                    | Low        |
    | `pick`                 | generateZodClientFromOpenAPI.ts                          | Object property selection | lodash.pick or native               | Low        |
    | `sortBy`               | template-context.ts                                      | Array sorting             | lodash.sortBy or native             | Low        |
    | `sortListFromRefArray` | template-context.ts                                      | Custom sort               | Custom impl                         | Medium     |
    | `sortObjKeysFromArray` | template-context.ts                                      | Object key sort           | Custom impl                         | Medium     |
    | `kebabToCamel`         | utils.ts                                                 | String transform          | Custom (simple regex)               | Low        |
    | `snakeToCamel`         | utils.ts                                                 | String transform          | Custom (simple regex)               | Low        |
    | `getSum`               | schema-complexity.helpers.ts                             | Array sum                 | native `.reduce()`                  | Low        |
    | `ObjectLiteral` (type) | getZodiosEndpointDefinitionList.ts                       | Type only                 | `Record<string, unknown>` or custom | Low        |

3. **Choose strategy:**
    - **Option A:** Add lodash (~24KB, battle-tested)
    - **Option B:** Write custom utilities (~2KB, full control)
    - **Option C:** Mix (lodash for complex, native/custom for simple)
    - **Recommendation:** Option C (balanced)

4. **Create implementation plan:**
    - Task 1: Replace simple functions (capitalize, getSum, kebabToCamel, snakeToCamel)
    - Task 2: Replace with lodash (get, pick, sortBy)
    - Task 3: Create custom utilities (sortListFromRefArray, sortObjKeysFromArray)
    - Task 4: Replace ObjectLiteral type
    - Task 5: Remove pastable dependency
    - Task 6: Run tests, verify no regressions

**Validation Steps:**

1. All functions documented with replacement strategy
2. Effort estimated for each replacement
3. Test coverage verified for affected code
4. Plan includes verification steps

**Output:**

- `.agent/analysis/PASTABLE_REPLACEMENT_PLAN.md`
- `.agent/analysis/pastable-imports.txt`

---

### 1.3 openapi-types Evaluation ✅

**Status:** Complete  
**Priority:** MEDIUM  
**Time Taken:** 1 hour

**Acceptance Criteria:**

- [x] ✅ Current usage documented (only 1 test file)
- [x] ✅ Maintenance status assessed (active but redundant)
- [x] ✅ Necessity evaluated (NOT needed with openapi3-ts v4)
- [x] ✅ Decision made: **REMOVE** (redundant)
- [x] ✅ Document created: `.agent/analysis/OPENAPI_TYPES_EVALUATION.md`

**Implementation Steps:**

1. **Find all usage:**

    ```bash
    cd lib
    grep -rn "openapi-types" src/ > ../.agent/analysis/openapi-types-usage.txt
    grep -rn "import.*OpenAPIV3" src/ >> ../.agent/analysis/openapi-types-usage.txt
    ```

2. **Check maintenance:**

    ```bash
    npm view openapi-types time
    npm view openapi-types version
    ```

    - Visit: https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-types
    - Check: Last commit, open issues, PR activity

3. **Compare with openapi3-ts:**

    ```bash
    npm view openapi3-ts@4.5.0 | grep -A10 "dependencies"
    ```

    - Does openapi3-ts v4 include these types?
    - Are they redundant?

4. **Document decision:**
    - **IF** openapi3-ts v4 provides all needed types → Remove
    - **IF** still needed → Keep but document why
    - **IF** usage is minimal → Inline the types, remove dep

**Validation Steps:**

1. All imports of openapi-types found and documented
2. Maintenance status clearly stated (with evidence)
3. Decision justified with reasoning
4. If removing: migration path documented

**Output:**

- `.agent/analysis/OPENAPI_TYPES_EVALUATION.md`
- Recommendation: Keep or Remove with justification

---

### 1.4 @zodios/core Evaluation ✅

**Status:** Complete  
**Priority:** MEDIUM  
**Time Taken:** 1 hour

**Acceptance Criteria:**

- [x] ✅ Current usage documented (types used in generated code)
- [x] ✅ Maintenance status assessed (maintenance mode but stable)
- [x] ✅ Inlining evaluated (not practical, widely used)
- [x] ✅ Decision made: **KEEP** (stable, 11.5M downloads/month)
- [x] ✅ Document created: `.agent/analysis/ZODIOS_CORE_EVALUATION.md`

**Implementation Steps:**

1. **Find all usage:**

    ```bash
    cd lib
    grep -rn "@zodios/core" src/ > ../.agent/analysis/zodios-usage.txt
    grep -rn "ZodiosEndpointDefinition\|ZodiosEndpoint" src/ >> ../.agent/analysis/zodios-usage.txt
    ```

2. **Check maintenance:**

    ```bash
    npm view @zodios/core time version
    ```

    - Visit: https://github.com/zodios/zodios
    - Check: Last commit, stars, issues, ecosystem

3. **Analyze usage:**
    - What types do we import?
    - What functions do we use?
    - Can we define these types ourselves?
    - Is the ecosystem still active?

4. **Document decision:**
    - **IF** actively maintained + heavy usage → Keep
    - **IF** light usage + simple types → Inline types, remove
    - **IF** unmaintained but needed → Fork or inline

**Validation Steps:**

1. All usage documented
2. Maintenance metrics provided
3. Decision justified
4. If removing: types/functions to inline documented

**Output:**

- `.agent/analysis/ZODIOS_CORE_EVALUATION.md`
- Recommendation with justification

---

### 1.5 @apidevtools/swagger-parser Investigation ✅

**Status:** Complete  
**Priority:** MEDIUM  
**Time Taken:** 2 hours

**Acceptance Criteria:**

- [x] ✅ Current usage documented (tests, CLI parsing)
- [x] ✅ Full capabilities mapped (validation, bundling, dereferencing)
- [x] ✅ Integration opportunities identified (used appropriately)
- [x] ✅ Decision: KEEP current usage pattern (actively maintained)
- [x] ✅ Document created: `.agent/analysis/SWAGGER_PARSER_INTEGRATION.md`

**Implementation Steps:**

1. **Document current usage:**

    ```bash
    cd lib
    grep -rn "@apidevtools/swagger-parser" src/ > ../.agent/analysis/swagger-parser-usage.txt
    ```

2. **Review capabilities:**
    - Visit: https://apitools.dev/swagger-parser/
    - Read: API documentation
    - Capabilities:
        - Parse OpenAPI documents (YAML/JSON)
        - Validate against OAS schema
        - Resolve $ref pointers
        - Dereference (inline all $refs)
        - Bundle (combine multi-file specs)

3. **Map to our code:**
    - Where do we validate? (Can swagger-parser do it?)
    - Where do we resolve $refs? (Can swagger-parser do it?)
    - Where do we parse? (Can swagger-parser do it?)
    - Current: We use `makeSchemaResolver` for $refs

4. **Identify opportunities:**
    - **Validation:** Use swagger-parser.validate() instead of AJV?
    - **Resolution:** Use swagger-parser.$refs.get() instead of custom?
    - **Dereferencing:** Use swagger-parser.dereference()?
    - **Trade-offs:** Bundle size, control, error messages

5. **Create recommendation:**
    - Keep current approach + document why, OR
    - Integrate swagger-parser more deeply + migration plan

**Validation Steps:**

1. Full capability list documented
2. Current usage vs potential usage compared
3. Trade-offs analyzed
4. Recommendation with reasoning

**Output:**

- `.agent/analysis/SWAGGER_PARSER_INTEGRATION.md`
- Recommendation: Expand usage or keep minimal

---

### 1.6 openapi3-ts v4 Capabilities Investigation ✅

**Status:** Complete  
**Priority:** HIGH (informs update strategy)  
**Time Taken:** 3 hours

**Acceptance Criteria:**

- [x] ✅ v4 breaking changes documented (comprehensive list)
- [x] ✅ New type guards identified (available and documented)
- [x] ✅ New utilities identified (OAS 3.1 support, better types)
- [x] ✅ Deferral opportunities documented (Task 1.8 added)
- [x] ✅ Migration checklist created (detailed step-by-step)
- [x] ✅ Document created: `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md`

**Implementation Steps:**

1. **Review changelog:**

    ```bash
    npm view openapi3-ts@4.5.0 --json > .agent/analysis/openapi3-ts-v4-package.json
    ```

    - Visit: https://github.com/metadevpro/openapi3-ts/blob/master/CHANGELOG.md
    - Read: v3 → v4 breaking changes
    - Note: v4.0.0 → v4.5.0 changes

2. **Explore type guards:**

    ```typescript
    // Check if v4 provides:
    import { isReferenceObject, isSchemaObject } from "openapi3-ts"; // We already use these

    // Do they provide more?
    // - isParameterObject?
    // - isResponseObject?
    // - isPathItemObject?
    // - HTTP method type guards?
    ```

3. **Check for utilities:**
    - Schema traversal helpers?
    - Reference resolution?
    - Validation helpers?
    - Builder patterns?

4. **Compare types:**
    - v3 vs v4 type definitions
    - Breaking changes in SchemaObject?
    - Breaking changes in ParameterObject?
    - New types in v4?

5. **Create migration plan:**
    - Step 1: Update dependency
    - Step 2: Fix type errors
    - Step 3: Replace deprecated APIs
    - Step 4: Adopt new capabilities
    - Step 5: Remove custom code that v4 provides

**Validation Steps:**

1. Breaking changes listed with impact assessment
2. New capabilities documented
3. Migration checklist complete
4. Deferral opportunities identified

**Output:**

- `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md`
- Migration checklist
- List of code to refactor after update

---

### 1.7 Handlebars Evaluation ✅

**Status:** Complete  
**Priority:** MEDIUM  
**Time Taken:** 2 hours

**Acceptance Criteria:**

- [x] ✅ Current usage documented (3 files + 5 templates, 201 lines)
- [x] ✅ Maintenance status assessed (stale: 2+ years, no security issues)
- [x] ✅ Template literal alternative evaluated (feasible but not recommended)
- [x] ✅ ts-morph emitter architecture evaluated (RECOMMENDED for Phase 3/4)
- [x] ✅ Decision made: **KEEP** for Phase 2, evaluate emitter in Phase 3/4
- [x] ✅ Document created: `.agent/analysis/HANDLEBARS_EVALUATION.md`

**Key Findings:**

- **Phase 2 Decision:** KEEP Handlebars (not blocking extraction)
- **Phase 3/4 Recommendation:** ts-morph emitter architecture
  - AST-based code generation (type-safe)
  - Plugin API for custom templates
  - 22-32 hours estimated effort
  - Reference: `.agent/reference/openapi-zod-client-emitter-migration.md`

**Output:**

- `.agent/analysis/HANDLEBARS_EVALUATION.md`
- Three options compared: Handlebars vs Template Literals vs ts-morph Emitter

---

### 1.8 Defer Logic to openapi3-ts v4 (AFTER Task 2.1)

**Status:** Pending  
**Priority:** MEDIUM  
**Estimated Time:** 3-4 hours  
**Dependencies:** Task 2.1 complete (openapi3-ts updated to v4)

**Acceptance Criteria:**

- [ ] Custom type guards analyzed (can v4 replace them?)
- [ ] Custom type utilities analyzed (what v4 provides)
- [ ] Schema traversal logic analyzed (defer opportunities)
- [ ] Reference resolution analyzed (v4 capabilities)
- [ ] Refactoring plan created (what to remove/replace)
- [ ] Document updated: Add findings to OPENAPI3_TS_V4_INVESTIGATION.md

**Implementation Steps:**

1. **After openapi3-ts v4 update complete:**
   - Review what type guards v4 actually provides
   - Review what utilities v4 actually provides

2. **Analyze our custom implementations:**
   - `lib/src/` - Find custom type guards
   - Compare with v4 equivalents
   - Identify redundant code

3. **Create refactoring plan:**
   - List custom code that can be removed
   - List imports to change
   - Estimate effort

4. **Document findings:**
   - Update OPENAPI3_TS_V4_INVESTIGATION.md
   - Add section: "Custom Code Replaced by v4"

**Validation Steps:**

1. Analysis covers all major custom implementations
2. Refactoring plan has effort estimates
3. Benefits vs effort documented

**Output:**

- Updated `.agent/analysis/OPENAPI3_TS_V4_INVESTIGATION.md`
- Refactoring plan (if opportunities found)

---

## 2. Dependency Updates

### 2.1 Update openapi3-ts (v3 → v4.5.0)

**Status:** Pending  
**Priority:** CRITICAL (must do before other work)  
**Estimated Time:** 4-6 hours  
**Dependencies:** Task 1.6 complete

**Acceptance Criteria:**

- [ ] openapi3-ts updated to v4.5.0
- [ ] All TypeScript errors fixed
- [ ] All tests passing
- [ ] No functionality regressions
- [ ] Types strengthened where possible

**Implementation Steps:**

1. **Create feature branch:**

    ```bash
    git checkout -b feat/update-openapi3-ts-v4
    ```

2. **Update dependency:**

    ```bash
    cd lib
    pnpm update openapi3-ts@4.5.0
    ```

3. **Run type-check and document errors:**

    ```bash
    pnpm type-check 2>&1 | tee ../agent/analysis/openapi3-ts-v4-errors.txt
    ```

4. **Fix errors systematically:**
    - Group errors by file
    - Fix one file at a time
    - Run type-check after each file
    - Document any API changes

5. **Update imports if needed:**
    - Check if import paths changed
    - Check if type names changed
    - Update accordingly

6. **Strengthen types:**
    - Use new v4 types where available
    - Replace any custom types with v4 equivalents
    - Add type guards if v4 provides them

7. **Run tests:**

    ```bash
    pnpm test -- --run
    ```

8. **Fix test failures:**
    - Update test expectations if API changed
    - Ensure no functionality changed

9. **Commit:**
    ```bash
    git add -A
    git commit -m "feat: update openapi3-ts to v4.5.0
    ```

Breaking changes addressed:

- [List specific changes]

New capabilities adopted:

- [List new features used]

All tests passing (297)
All type checks passing"

````

**Validation Steps:**
1. `pnpm type-check` exits 0
2. `pnpm test -- --run` exits 0 (297 tests)
3. `pnpm build` succeeds
4. Snapshot tests match (or intentional changes documented)
5. Manual smoke test of CLI

**Rollback Plan:**
If issues are severe:
```bash
git checkout main
cd lib && pnpm install openapi3-ts@^3
````

**Output:**

- Updated package.json
- Updated pnpm-lock.yaml
- Commit with migration notes

---

### 2.2 Update zod (v3 → v4.1.12)

**Status:** Pending  
**Priority:** CRITICAL  
**Estimated Time:** 4-6 hours  
**Dependencies:** Task 2.1 complete

**Acceptance Criteria:**

- [ ] zod updated to v4.1.12
- [ ] All TypeScript errors fixed
- [ ] All tests passing
- [ ] Generated schemas still work
- [ ] Types strengthened where possible

**Implementation Steps:**

1. **Create feature branch:**

    ```bash
    git checkout -b feat/update-zod-v4
    ```

2. **Review zod v4 changes:**
    - Visit: https://zod.dev/v4/versioning
    - Read: Migration guide
    - Note: Breaking changes

3. **Update dependency:**

    ```bash
    cd lib
    pnpm update zod@4.1.12
    ```

4. **Update imports:**

    ```typescript
    // OLD: import { z } from "zod/v4"
    // NEW: import { z } from "zod"
    ```

5. **Run type-check:**

    ```bash
    pnpm type-check 2>&1 | tee ../.agent/analysis/zod-v4-errors.txt
    ```

6. **Fix errors systematically:**
    - Group by error type
    - Fix one pattern at a time
    - Test after each fix

7. **Update generated code:**
    - Check template files (src/templates/\*.hbs)
    - Ensure generated Zod code uses v4 API
    - Test generation with sample OpenAPI specs

8. **Run tests:**

    ```bash
    pnpm test -- --run
    ```

9. **Fix test failures:**
    - Update test expectations
    - Verify schema behavior unchanged

10. **Commit:**
    ```bash
    git add -A
    git commit -m "feat: update zod to v4.1.12
    ```

Migration changes:

- Updated imports from 'zod/v4' to 'zod'
- [Other specific changes]

All tests passing (297)
Schema generation verified"
```

**Validation Steps:**

1. `pnpm type-check` exits 0
2. `pnpm test -- --run` exits 0
3. `pnpm build` succeeds
4. Generate client from sample OpenAPI spec:
    ```bash
    pnpm cli samples/v3.0/petstore.yaml -o /tmp/test-output.ts
    ```
5. Verify generated code compiles
6. No runtime errors in generated schemas

**Rollback Plan:**

```bash
git checkout main
cd lib && pnpm install zod@^3
```

**Output:**

- Updated package.json
- Updated template files if needed
- Commit with migration notes

---

## 3. Code Cleanup

### 3.1 Replace pastable Dependency

**Status:** Pending  
**Priority:** HIGH  
**Estimated Time:** 6-8 hours  
**Dependencies:** Task 1.2 complete, 2.1 and 2.2 complete

**Acceptance Criteria:**

- [ ] All 8 pastable functions replaced
- [ ] pastable dependency removed
- [ ] All tests passing
- [ ] No functionality changes
- [ ] Code is cleaner/more maintainable

**Implementation Steps:**

**Phase A: Add lodash utilities (if using Option C)**

1. **Install lodash:**
    ```bash
    cd lib
    pnpm add lodash-es
    pnpm add -D @types/lodash-es
    ```

**Phase B: Replace simple functions**

2. **Replace `getSum` (schema-complexity.helpers.ts):**

    ```typescript
    // BEFORE:
    import { getSum } from "pastable";
    const total = getSum(array);

    // AFTER:
    const total = array.reduce((sum, n) => sum + n, 0);
    ```

3. **Replace `capitalize` (utils.ts, generateZodClientFromOpenAPI.ts):**

    ```typescript
    // OPTION A: Native
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    // OPTION B: lodash
    import { capitalize } from "lodash-es";
    ```

4. **Replace `kebabToCamel` and `snakeToCamel` (utils.ts):**

    ```typescript
    // Simple regex implementations
    const kebabToCamel = (str: string): string => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    const snakeToCamel = (str: string): string => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    ```

**Phase C: Replace with lodash**

5. **Replace `get` (makeSchemaResolver.ts, getOpenApiDependencyGraph.test.ts):**

    ```typescript
    // OPTION A: lodash
    import { get } from "lodash-es";

    // OPTION B: Optional chaining (if simple paths)
    const value = obj?.prop?.nested?.value;
    ```

6. **Replace `pick` (generateZodClientFromOpenAPI.ts):**

    ```typescript
    import { pick } from "lodash-es";
    // Usage stays the same
    ```

7. **Replace `sortBy` (template-context.ts):**
    ```typescript
    import { sortBy } from "lodash-es";
    // Usage stays the same
    ```

**Phase D: Create custom utilities**

8. **Replace `sortListFromRefArray` and `sortObjKeysFromArray` (template-context.ts):**

    ```typescript
    // Create lib/src/utils/sorting.ts
    export function sortListFromRefArray<T>(list: T[], refArray: string[], keyFn: (item: T) => string): T[] {
        const order = new Map(refArray.map((key, idx) => [key, idx]));
        return [...list].sort((a, b) => {
            const aKey = keyFn(a);
            const bKey = keyFn(b);
            const aIdx = order.get(aKey) ?? Infinity;
            const bIdx = order.get(bKey) ?? Infinity;
            return aIdx - bIdx;
        });
    }

    export function sortObjKeysFromArray<T extends Record<string, unknown>>(obj: T, keyOrder: string[]): T {
        const order = new Map(keyOrder.map((key, idx) => [key, idx]));
        const entries = Object.entries(obj);
        entries.sort(([keyA], [keyB]) => {
            const idxA = order.get(keyA) ?? Infinity;
            const idxB = order.get(keyB) ?? Infinity;
            return idxA - idxB;
        });
        return Object.fromEntries(entries) as T;
    }
    ```

**Phase E: Replace type**

9. **Replace `ObjectLiteral` type (getZodiosEndpointDefinitionList.ts):**

    ```typescript
    // BEFORE:
    import type { ObjectLiteral } from "pastable";

    // AFTER: (if we need it at all)
    type ObjectLiteral = Record<string, unknown>;
    // OR just use Record<string, unknown> inline
    // OR use a more specific type if possible
    ```

**Phase F: Remove dependency**

10. **Remove pastable:**

    ```bash
    cd lib
    pnpm remove pastable
    ```

11. **Run tests:**

    ```bash
    pnpm test -- --run
    ```

12. **Commit:**
    ```bash
    git add -A
    git commit -m "refactor: replace pastable with lodash-es and native code
    ```

Replaced functions:

- getSum → native reduce
- capitalize → lodash-es
- kebabToCamel, snakeToCamel → custom implementations
- get, pick, sortBy → lodash-es
- sortListFromRefArray, sortObjKeysFromArray → custom utils
- ObjectLiteral type → Record<string, unknown>

Removed dependency: pastable@2.2.1
Added dependency: lodash-es (tree-shakeable, well-maintained)

All tests passing (297)
No functionality changes"
```

**Validation Steps:**

1. `pnpm test -- --run` exits 0 (297 tests)
2. `pnpm type-check` exits 0
3. `pnpm build` succeeds
4. No references to "pastable" in code:
    ```bash
    grep -r "pastable" lib/src/
    ```
5. Package.json no longer lists pastable
6. Bundle size acceptable (check dist size)

**Output:**

- Updated source files
- New lib/src/utils/sorting.ts (if needed)
- Updated package.json
- Commit

---

### 3.2 Eliminate Type Assertions (EXTRACTION BLOCKER)

**Status:** Pending  
**Priority:** CRITICAL BLOCKER  
**Estimated Time:** 16-24 hours (1-2 weeks with testing)  
**Dependencies:** Tasks 1.1, 2.1, 2.2 complete

**Acceptance Criteria:**

- [ ] Zero type assertions (74 → 0)
- [ ] All tests passing
- [ ] No functionality regressions
- [ ] Proper type guards added where needed
- [ ] Code is more type-safe

**Implementation Steps:**

**Phase A: Analysis & Strategy**

1. **Review triage document:**
    - Read: `.agent/analysis/LINT_TRIAGE_COMPLETE.md`
    - Identify: Files with most assertions
    - Prioritize: Files by effort and risk

2. **Group assertions by pattern:**
    - **Pattern A:** Tanu AST types (ts.Node → t.TypeDefinition)
    - **Pattern B:** Union type narrowing (SchemaObject | ReferenceObject → SchemaObject)
    - **Pattern C:** Function return type mismatches
    - **Pattern D:** Test-specific assertions
    - **Strategy per pattern:** Document approach

**Phase B: Implement Solutions**

3. **For each file with assertions:**

    **Strategy for Pattern A (Tanu/AST types):**

    ```typescript
    // BEFORE:
    return someNode as t.TypeDefinition;

    // AFTER (Option 1): Fix return type
    function foo(): ts.Node | t.TypeDefinition {
        return someNode; // No assertion needed
    }

    // AFTER (Option 2): Create type guard
    function isTypeDefinition(node: ts.Node): node is t.TypeDefinition {
        // Check if node has TypeDefinition properties
        return typeof node === "object" && "name" in node;
    }
    ```

    **Strategy for Pattern B (Union narrowing):**

    ```typescript
    // BEFORE:
    function handle(schema: SchemaObject | ReferenceObject) {
        const s = schema as SchemaObject; // ❌
        return s.type;
    }

    // AFTER: Use existing type guards
    function handle(schema: SchemaObject | ReferenceObject) {
        if (isReferenceObject(schema)) {
            // Handle reference case
            return;
        }
        // TypeScript knows schema is SchemaObject here
        return schema.type; // ✅
    }
    ```

    **Strategy for Pattern C (Return type mismatch):**

    ```typescript
    // BEFORE:
    function foo(): string {
        return getValue() as string; // ❌
    }

    // AFTER: Fix at source
    function getValue(): string { ... } // Correct return type
    function foo(): string {
        return getValue(); // ✅
    }
    ```

4. **Work file by file:**
    - Fix one file completely
    - Run tests: `pnpm test -- --run`
    - Commit: `git commit -m "refactor(file): eliminate type assertions"`
    - Move to next file

5. **Track progress:**
    ```bash
    # Count remaining assertions
    pnpm lint 2>&1 | grep "@typescript-eslint/consistent-type-assertions" | wc -l
    ```

**Phase C: Special Cases**

6. **openApiToTypescript.helpers.ts (high concentration):**
    - **Issue:** ts.Node vs t.TypeDefinition mismatches
    - **Solution:** Create proper type union returns
    - **Alternative:** Create wrapper types that satisfy both

7. **getZodiosEndpointDefinitionList.ts:**
    - **Issue:** Multiple assertion patterns
    - **Solution:** Add type guards, fix union handling

8. **inferRequiredOnly.ts:**
    - **Issue:** Assertions in complex logic
    - **Solution:** Break into smaller functions with proper types

**Phase D: Final Cleanup**

9. **Verify zero assertions:**

    ```bash
    pnpm lint 2>&1 | grep "@typescript-eslint/consistent-type-assertions"
    # Should return nothing
    ```

10. **Run full test suite:**

    ```bash
    pnpm test -- --run
    # All 297 tests must pass
    ```

11. **Final commit:**
    ```bash
    git add -A
    git commit -m "refactor: eliminate all type assertions (BLOCKER RESOLVED)
    ```

Replaced 74 type assertions with:

- Proper type guards (using 'is' keyword)
- Fixed function return types
- Corrected union type handling
- Added helper type predicates

Target repo compliance: assertionStyle: 'never' ✅

All tests passing (297)
Zero type assertions remaining"
```

**Validation Steps:**

1. `pnpm lint | grep consistent-type-assertions` returns nothing
2. `pnpm type-check` exits 0
3. `pnpm test -- --run` exits 0 (297 tests)
4. `pnpm build` succeeds
5. Manual review of changed files for type safety
6. No new `any` types introduced

**Output:**

- Multiple commits (one per file or logical group)
- Final summary commit
- Zero type assertions in codebase

---

### 3.3 Remove Evaluated Dependencies

**Status:** Pending  
**Priority:** MEDIUM  
**Estimated Time:** 2-4 hours  
**Dependencies:** Tasks 1.3, 1.4 complete

**Acceptance Criteria:**

- [ ] openapi-types removed OR decision to keep documented
- [ ] @zodios/core removed OR decision to keep documented
- [ ] All tests passing if removed
- [ ] Documentation updated

**Implementation Steps:**

**If removing openapi-types:**

1. **Find all usages:**

    ```bash
    cd lib
    grep -rn "openapi-types" src/
    ```

2. **Replace with openapi3-ts types:**

    ```typescript
    // BEFORE:
    import type { OpenAPIV3 } from "openapi-types";

    // AFTER:
    import type { OpenAPIObject } from "openapi3-ts";
    ```

3. **Remove dependency:**

    ```bash
    pnpm remove openapi-types
    ```

4. **Test:**
    ```bash
    pnpm test -- --run
    ```

**If removing @zodios/core:**

1. **Extract types we use:**
    - Create `lib/src/types/zodios.ts`
    - Copy type definitions we need
    - Add proper JSDoc documentation

2. **Replace imports:**

    ```typescript
    // BEFORE:
    import type { ZodiosEndpointDefinition } from "@zodios/core";

    // AFTER:
    import type { ZodiosEndpointDefinition } from "./types/zodios.js";
    ```

3. **Remove dependency:**

    ```bash
    pnpm remove @zodios/core
    ```

4. **Test:**
    ```bash
    pnpm test -- --run
    ```

**Commit:**

```bash
git add -A
git commit -m "refactor: remove [dependency-name]

Rationale: [Based on evaluation document]

Replaced with: [openapi3-ts types / inlined types]

All tests passing (297)"
```

**Validation Steps:**

1. Dependencies removed from package.json
2. No imports of removed packages:
    ```bash
    grep -r "removed-package-name" lib/src/
    ```
3. All tests passing
4. Type-check passing

**Output:**

- Updated package.json
- New types files if needed
- Commit(s) for removals

---

## 4. Validation & Documentation

### 4.1 Full Quality Gate Verification

**Status:** Pending  
**Priority:** CRITICAL  
**Estimated Time:** 2 hours  
**Dependencies:** All previous tasks complete

**Acceptance Criteria:**

- [ ] All quality gates green
- [ ] Definition of Done passes
- [ ] Documentation updated
- [ ] Ready for Phase 3

**Implementation Steps:**

1. **Run all quality gates:**

    ```bash
    pnpm format
    pnpm build
    pnpm type-check
    pnpm test -- --run
    pnpm lint
    ```

2. **Verify metrics:**
    - TypeScript errors: 0 ✅
    - Type assertions: 0 ✅
    - Tests passing: 297 ✅
    - Build successful: ✅
    - Lint issues: Document remaining (should be < 80)

3. **Update documentation:**
    - `.agent/context/context.md` - Update current status
    - `.agent/plans/00-STRATEGIC-PLAN.md` - Mark Phase 2 complete
    - This file - Mark all tasks complete

4. **Create Phase 2 summary:**

    ```bash
    cat > .agent/context/PHASE2_COMPLETE.md << 'EOF'
    # Phase 2 Complete: Type Safety & Dependencies

    **Completion Date:** [Date]
    **Duration:** [Actual time]

    ## Achievements
    - ✅ openapi3-ts updated to v4.5.0
    - ✅ zod updated to v4.1.12
    - ✅ pastable removed (replaced with lodash-es + custom)
    - ✅ Type assertions eliminated (74 → 0) 🎉
    - ✅ Dependencies evaluated (openapi-types, @zodios/core)

    ## Metrics
    - TypeScript errors: 0
    - Type assertions: 0 (BLOCKER RESOLVED)
    - Tests: 297 passing
    - Lint issues: [count] (down from 148)

    ## Next: Phase 3 - Quality & Testing
    EOF
    ```

5. **Commit:**
    ```bash
    git add -A
    git commit -m "docs: Phase 2 complete - Type Safety & Dependencies
    ```

Achievements:

- Updated openapi3-ts to v4.5.0
- Updated zod to v4.1.12
- Removed pastable dependency
- Eliminated all 74 type assertions (BLOCKER RESOLVED)
- Evaluated and cleaned up dependencies

Quality Gates:
✅ format
✅ build
✅ type-check (0 errors)
✅ test (297 passing)
⚠️ lint (remaining issues documented)

Ready for Phase 3: Quality & Testing"

````

**Validation Steps:**
1. Definition of Done script passes:
```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
````

2. No type assertions in code
3. All dependency changes documented
4. Phase 2 summary document created

**Output:**

- `.agent/context/PHASE2_COMPLETE.md`
- Updated context and plan documents
- Final commit

---

## Current TODO List (Embedded)

**Status Legend:** ⏳ Pending | 🔄 In Progress | ✅ Complete | ❌ Blocked

### Investigation Tasks (✅ COMPLETE 7/7)

- [x] ✅ **1.1** Lint Triage - 146 issues categorized, type assertions mapped
- [x] ✅ **1.2** pastable Analysis - 8 functions → lodash-es + custom utilities
- [x] ✅ **1.3** openapi-types Evaluation - REMOVE (redundant with v4)
- [x] ✅ **1.4** @zodios/core Evaluation - KEEP (stable, used in templates)
- [x] ✅ **1.5** swagger-parser Investigation - KEEP (actively maintained)
- [x] ✅ **1.6** openapi3-ts v4 Investigation - Migration checklist ready
- [x] ✅ **1.7** Handlebars Evaluation - KEEP Phase 2, ts-morph emitter Phase 3/4
- [ ] ⏳ **1.8** Defer Logic to openapi3-ts v4 - Analyze after Task 2.1 (DEFERRED)

### Implementation Tasks (Week 2-3)

- [ ] ⏳ **2.1** Update openapi3-ts - v3 → v4.5.0, fix type errors, tests passing
- [ ] ⏳ **2.2** Update zod - v3 → v4.1.12, fix imports, verify generation works
- [ ] ⏳ **3.1** Replace pastable - All 8 functions replaced, dependency removed
- [ ] ⏳ **3.2** Eliminate Type Assertions - 74 → 0, BLOCKER RESOLVED
- [ ] ⏳ **3.3** Remove Evaluated Deps - Remove openapi-types & pastable

### Validation Tasks (Week 3)

- [ ] ⏳ **4.1** Full Quality Gate Check - All gates green, Phase 2 complete

---

## Notes & Reminders

**Quality Standards:**

- MUST follow RULES.md at all times
- Every task must include validation
- Tests must pass after every change
- Document all decisions

**Before Any Commit:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

**Target State After Phase 2:**

- ✅ Latest dependencies (openapi3-ts v4, zod v4)
- ✅ Zero type assertions (extraction ready)
- ✅ No obscure dependencies (pastable removed)
- ✅ Clean dependency tree (evaluated and cleaned)
- ✅ All tests passing (297+)
- ✅ Ready for Phase 3 (quality improvements)

---

**This plan is living. Update task status as work progresses. Add notes for future reference.**
