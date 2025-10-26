# Detailed TODOs - Phase 1 Type Safety Completion

**Status:** 167 violations remaining (109 errors, 58 warnings)  
**Target:** Fix ~69 critical type safety issues in 8 files  
**Estimated Time:** 3-4 hours  
**Last Updated:** October 2025

---

## TODO 1: Fix utils.ts (~9 critical issues) ⭐ PRIORITY 1

**Why:** Used by extraction targets, foundational utility functions

**Acceptance Criteria:**

- [ ] All `@typescript-eslint/no-explicit-any` errors eliminated (3)
- [ ] All `@typescript-eslint/no-unsafe-*` errors eliminated (3)
- [ ] Control regex issues resolved (6) - can be documented if unavoidable
- [ ] Zero critical type safety errors remain
- [ ] All tests still pass

**Implementation Steps:**

1. **Identify issues:**

   ```bash
   cd lib && pnpm eslint src/utils.ts 2>&1 | grep -E "no-unsafe-|no-explicit-any|no-control-regex"
   ```

2. **Fix explicit any (lines ~64-65):**
   - Replace `any` with specific types (likely `SchemaObject['type']`)
   - Use union types or type guards as needed

3. **Fix unsafe assignments/calls (lines ~76):**
   - Add type guards before unsafe operations
   - Use proper type narrowing with `typeof` checks
   - Replace any string coercion with explicit `String()`

4. **Document control regex (line ~75):**
   - These are intentional for normalizeString
   - Add comments explaining regex patterns
   - Consider eslint-disable-next-line with justification

**Validation Steps:**

```bash
cd lib

# Verify no critical errors
pnpm eslint src/utils.ts 2>&1 | grep -E "no-unsafe-|no-explicit-any"
# Should return nothing

# Run tests
pnpm test src/utils.test.ts

# Full build
pnpm build

# Lint count check (should decrease)
pnpm lint 2>&1 | tail -3
```

**Estimated Time:** 30 minutes

---

## TODO 2: Fix schema-complexity.ts (~3 critical issues) ⭐ PRIORITY 1

**Why:** Used by extraction targets for schema analysis

**Acceptance Criteria:**

- [ ] Non-null assertion eliminated (line ~52)
- [ ] Unsafe assignments eliminated (line ~112)
- [ ] Zero critical type safety errors remain
- [ ] Complexity calculation still accurate

**Implementation Steps:**

1. **Identify issues:**

   ```bash
   cd lib && pnpm eslint src/schema-complexity.ts 2>&1 | grep -E "no-unsafe-|no-non-null-assertion"
   ```

2. **Fix non-null assertion (line ~52):**
   - Add null check before access
   - Use optional chaining or guard clause
   - Example: `schema.properties?.[property] ?? defaultValue`

3. **Fix unsafe assignment (line ~112):**
   - Type the intermediate variables properly
   - Use type guards for unknown values
   - Ensure return type matches expectations

**Validation Steps:**

```bash
cd lib

# Verify no critical errors
pnpm eslint src/schema-complexity.ts 2>&1 | grep -E "no-unsafe-|no-non-null-assertion"
# Should return nothing

# Run tests
pnpm test schema-complexity

# Verify complexity calculation
pnpm test | grep -A 20 "complexity"
```

**Estimated Time:** 15 minutes

---

## TODO 3: Fix openApiToZod.ts (~13 critical issues) ⭐ PRIORITY 2

**Why:** Currently used for Zod generation, will be rebuilt in Phase 3

**Acceptance Criteria:**

- [ ] Most egregious non-null assertions eliminated (~5 of 10)
- [ ] Unsafe assignments fixed where simple (~1 of 2)
- [ ] Plus operand issues documented with comments
- [ ] File is functional and tests pass
- [ ] **Note:** Remaining issues documented as "Phase 3 rebuild"

**Implementation Steps:**

1. **Audit all issues:**

   ```bash
   cd lib && pnpm eslint src/openApiToZod.ts 2>&1 | grep -E "no-unsafe-|no-non-null-assertion|restrict-plus-operands" > /tmp/openApiToZod-issues.txt
   cat /tmp/openApiToZod-issues.txt
   ```

2. **Fix high-impact non-null assertions:**
   - Target lines: 37, 46, 70, 86, 111 (from earlier audit)
   - Replace `!` with null checks and proper defaults
   - Use optional chaining where appropriate

3. **Document remaining issues:**
   - Add comment at top of file:
     ```typescript
     // NOTE: This file will be rebuilt in Phase 3 (Zod v4 upgrade)
     // Remaining type safety issues are acceptable as this is temporary code
     ```
   - Add inline comments for complex type casts

4. **Fix simple unsafe assignments:**
   - Line 160, 176: Add type guards or use proper narrowing

5. **Document plus operand issues:**
   - Lines 227, 263: These are CodeMeta + string operations
   - Add comment explaining why cast is needed
   - Or refactor to use `.toString()` method

**Validation Steps:**

```bash
cd lib

# Count remaining critical issues
pnpm eslint src/openApiToZod.ts 2>&1 | grep -cE "no-unsafe-|no-non-null-assertion"
# Target: <8 (down from 13)

# Run all Zod-related tests
pnpm test openApiToZod

# Verify generated schemas
pnpm test | grep -A 30 "zod schema"

# Full test suite
pnpm test
```

**Estimated Time:** 45 minutes

---

## TODO 4: Fix openApiToTypescript.ts (~15 critical issues) ⭐ PRIORITY 2

**Why:** TypeScript type generation (not extracted, but actively used)

**Acceptance Criteria:**

- [ ] Non-null assertions reduced by ~50% (fix 2 of 4)
- [ ] Most egregious unsafe assignments fixed (~4 of 8)
- [ ] Tanu type issues documented
- [ ] TypeScript generation still works correctly
- [ ] Remaining issues documented as "template generation tech debt"

**Implementation Steps:**

1. **Audit issues:**

   ```bash
   cd lib && pnpm eslint src/openApiToTypescript.ts 2>&1 | grep -E "no-unsafe-|no-non-null-assertion" > /tmp/ts-issues.txt
   ```

2. **Fix high-impact non-null assertions:**
   - Lines 101, 127, 140, 156
   - Replace with null checks and defaults
   - Focus on property access chains

3. **Fix critical unsafe assignments:**
   - Lines 192-193: Unsafe spread operations
   - Add type guards or proper casting with comments
   - Lines 332: Unsafe argument passing
   - Type the intermediate values properly

4. **Document tanu type issues:**
   - Lines with tanu type casts are unavoidable
   - Add comments explaining tanu's type limitations
   - Reference tanu documentation

5. **Add tech debt comment:**
   ```typescript
   // NOTE: This file is for template generation (not part of extraction)
   // Remaining type safety issues are acceptable as template generation
   // is isolated from runtime code
   ```

**Validation Steps:**

```bash
cd lib

# Count remaining issues
pnpm eslint src/openApiToTypescript.ts 2>&1 | grep -cE "no-unsafe-|no-non-null-assertion"
# Target: <10 (down from 15)

# Run TypeScript generation tests
pnpm test openApiToTypescript

# Verify generated types
pnpm test | grep -A 20 "typescript"

# Full test suite
pnpm test
```

**Estimated Time:** 45 minutes

---

## TODO 5: Fix template-context.ts (~15 critical issues) ⭐ PRIORITY 2

**Why:** Template rendering (not extracted, but used by generation)

**Acceptance Criteria:**

- [ ] Non-null assertions reduced by ~50% (fix 7-8 of 15)
- [ ] Unsafe assignments fixed where simple (~2 of 3)
- [ ] File remains functional for template generation
- [ ] Remaining issues documented as template tech debt

**Implementation Steps:**

1. **Audit issues:**

   ```bash
   cd lib && pnpm eslint src/template-context.ts 2>&1 | grep -E "no-unsafe-|no-non-null-assertion" > /tmp/template-issues.txt
   ```

2. **Fix non-null assertion chains:**
   - Lines with multiple `!`: 43, 119, 137, 144, 150, 156, 159, 165, 166, 186, 194, 200, 239
   - Strategy: Add null checks at chain start
   - Use optional chaining where possible
   - Provide sensible defaults

3. **Fix unsafe assignments:**
   - Line 113: Type the assignment properly
   - Add type guards before unsafe operations

4. **Prioritize high-traffic code paths:**
   - Focus on functions called frequently
   - Skip one-time initialization code if needed

**Validation Steps:**

```bash
cd lib

# Count remaining issues
pnpm eslint src/template-context.ts 2>&1 | grep -cE "no-unsafe-|no-non-null-assertion"
# Target: <8 (down from 15)

# Run template tests
pnpm test template-context
pnpm test generateZodClient

# Verify template rendering
pnpm test | grep -A 30 "template"

# Full test suite
pnpm test
```

**Estimated Time:** 45 minutes

---

## TODO 6: Fix generateZodClientFromOpenAPI.ts (~6 critical issues) ⭐ PRIORITY 2

**Why:** Main orchestrator (not extracted, but critical functionality)

**Acceptance Criteria:**

- [ ] TODO comments addressed or removed (1)
- [ ] Console.log statements remain (intentional user feedback)
- [ ] Unsafe returns fixed (2)
- [ ] Explicit any replaced with proper types (2)
- [ ] Generation pipeline still works end-to-end

**Implementation Steps:**

1. **Audit issues:**

   ```bash
   cd lib && pnpm eslint src/generateZodClientFromOpenAPI.ts 2>&1 | grep -E "no-unsafe-|no-explicit-any|todo-tag|no-console"
   ```

2. **Address TODO (line ~104):**
   - Read the TODO comment
   - Either: Fix the issue, or document why it's deferred
   - Remove TODO if no longer relevant

3. **Keep console.log (lines ~159, etc):**
   - These are intentional CLI feedback
   - Add `eslint-disable-next-line no-console` with justification:
     ```typescript
     // eslint-disable-next-line no-console -- User feedback in CLI context
     console.log('Generating client...');
     ```

4. **Fix unsafe returns (lines ~164, 174):**
   - Type the return values properly
   - Remove unnecessary type assertions
   - Use proper function signatures

5. **Fix explicit any (lines ~164, 174):**
   - Replace with specific types from handlebars/template system
   - Use `unknown` if truly dynamic, with runtime checks

**Validation Steps:**

```bash
cd lib

# Verify fixes
pnpm eslint src/generateZodClientFromOpenAPI.ts 2>&1 | grep -E "no-unsafe-|no-explicit-any"
# Should be minimal

# Run generation tests
pnpm test generateZodClient

# End-to-end test
pnpm build
./bin.cjs examples/petstore.yaml -o /tmp/test.ts
cat /tmp/test.ts | head -50

# Full test suite
pnpm test
```

**Estimated Time:** 30 minutes

---

## TODO 7: Fix CodeMeta.ts (~3 critical issues) ⭐ PRIORITY 3

**Why:** Quick wins, internal utility class

**Acceptance Criteria:**

- [ ] Non-null assertions fixed (2)
- [ ] ts-expect-error has description
- [ ] Zero critical errors remain

**Implementation Steps:**

1. **Audit:**

   ```bash
   cd lib && pnpm eslint src/CodeMeta.ts 2>&1 | grep -E "no-non-null-assertion|ban-ts-comment"
   ```

2. **Fix non-null assertions (lines ~53):**
   - Add null checks or use optional chaining
   - Provide default values
   - Likely in CodeMeta class methods

3. **Add ts-expect-error description (line ~41):**
   - Replace:
     ```typescript
     // @ts-expect-error
     ```
   - With:
     ```typescript
     // @ts-expect-error - [Explanation of why type assertion is needed]
     ```

**Validation Steps:**

```bash
cd lib
pnpm eslint src/CodeMeta.ts 2>&1
# Should show 0 errors

pnpm test
```

**Estimated Time:** 15 minutes

---

## TODO 8: Fix getHandlebars.ts (~5 critical issues) ⭐ PRIORITY 3

**Why:** Template setup (not extracted, quick documentation fixes)

**Acceptance Criteria:**

- [ ] All ts-expect-error directives have descriptions (4)
- [ ] Explicit any documented or replaced (1)
- [ ] Zero critical errors remain

**Implementation Steps:**

1. **Audit:**

   ```bash
   cd lib && pnpm eslint src/getHandlebars.ts 2>&1 | grep -E "no-explicit-any|ban-ts-comment"
   ```

2. **Add descriptions to ts-expect-error (lines ~8, 12, 17, 21):**
   - Read the context for each
   - Add meaningful descriptions:
     ```typescript
     // @ts-expect-error - Handlebars types don't include this helper signature
     ```

3. **Fix explicit any (line ~15):**
   - Type it as `unknown` or specific handlebars type
   - Or document why any is needed

**Validation Steps:**

```bash
cd lib
pnpm eslint src/getHandlebars.ts 2>&1
# Should show 0 critical errors

pnpm test | grep -i handlebars
pnpm test
```

**Estimated Time:** 10 minutes

---

## TODO 9: Update Documentation & Finalize

**Acceptance Criteria:**

- [ ] `.agent/LINT_TRIAGE.md` updated with final counts
- [ ] `.agent/plans/01-dev-tooling.md` marked complete
- [ ] `00-OVERVIEW.md` updated with Phase 1 completion
- [ ] Remaining ~98 issues documented as acceptable tech debt
- [ ] All commits atomic and well-described

**Implementation Steps:**

1. **Final lint count:**

   ```bash
   cd lib && pnpm lint 2>&1 | tail -3
   # Record final numbers
   ```

2. **Update LINT_TRIAGE.md:**
   - Update "Current Status" header
   - Mark all extraction files as ✅ complete
   - Update summary table with final counts
   - Add "Acceptable Tech Debt" section listing remaining issues

3. **Update 01-dev-tooling.md:**
   - Mark status as "✅ COMPLETED"
   - Add final metrics
   - Update "Phase 1b Success Criteria" to all checked

4. **Update 00-OVERVIEW.md:**
   - Mark Phase 0 as ✅ COMPLETED
   - Mark Phase 1 as ✅ COMPLETED
   - Update "Current State" section
   - Add completion date

5. **Create comprehensive commit:**

   ```bash
   git add -A
   git commit -m "docs: mark Phase 1 complete - all critical type safety issues resolved

   Final metrics:
   - Started: 270 violations (213 errors, 57 warnings)
   - Completed: [X] violations ([Y] errors, [Z] warnings)
   - Fixed: [270-X] issues ([38+]% reduction)

   All extraction-target files are fully type-safe.
   Remaining issues documented as acceptable tech debt in:
   - Template generation code (not extracted)
   - Code to be rebuilt in Phase 3 (openApiToZod.ts)

   Ready to proceed with Phase 2 (openapi3-ts v4 upgrade)."
   ```

**Validation Steps:**

```bash
# Verify all quality gates
cd /Users/jim/code/personal/openapi-zod-client

# Build
pnpm turbo build
# Should succeed

# Format check
pnpm turbo format:check
# Should pass

# Type check
pnpm turbo type-check
# Should pass

# Tests
pnpm turbo test
# Should pass

# Lint (acceptable failures documented)
pnpm turbo lint
# Should have ~100 or fewer issues, all documented

# End-to-end CLI test
./lib/bin.cjs examples/petstore.yaml -o /tmp/final-test.ts
cat /tmp/final-test.ts | head -100
# Should generate valid TypeScript
```

**Estimated Time:** 30 minutes

---

## Summary & Execution Order

### Recommended Execution Order:

1. ⭐ **HIGH PRIORITY** (45 min):
   - TODO 1: utils.ts (30 min)
   - TODO 2: schema-complexity.ts (15 min)

2. ⭐ **MEDIUM PRIORITY** (2.5 hours):
   - TODO 3: openApiToZod.ts (45 min)
   - TODO 4: openApiToTypescript.ts (45 min)
   - TODO 5: template-context.ts (45 min)
   - TODO 6: generateZodClientFromOpenAPI.ts (30 min)

3. ⭐ **LOW PRIORITY** (25 min):
   - TODO 7: CodeMeta.ts (15 min)
   - TODO 8: getHandlebars.ts (10 min)

4. ⭐ **FINALIZE** (30 min):
   - TODO 9: Update documentation

**Total Estimated Time: 3.5-4 hours**

### Success Metrics:

- **Type Safety:** ~69 critical issues resolved
- **Final Lint Count:** Target <100 total issues
- **Test Pass Rate:** 100%
- **Build Success:** Clean build with no errors
- **Documentation:** All changes documented

### Phase 1 Completion Criteria:

✅ Phase 1 is complete when:

- [ ] All 9 TODOs marked complete
- [ ] Critical type safety issues in extraction targets = 0
- [ ] All tests passing
- [ ] Final lint count documented
- [ ] Documentation updated
- [ ] Ready to begin Phase 2 (openapi3-ts v4)

---

## Notes for Next Session

**Context to Preserve:**

- Commander migration successful (52 issues fixed)
- Extraction files fully type-safe (4 files, 26 issues)
- 103 total issues fixed (38% reduction)
- pastable, tanu, degit dependencies evaluated - ALL ACCEPTABLE
- bin.cjs verified necessary - KEEP

**Key Files for Extraction:**

- ✅ getZodiosEndpointDefinitionList.ts - READY
- ✅ makeSchemaResolver.ts - READY
- ✅ getOpenApiDependencyGraph.ts - READY
- ✅ isReferenceObject.ts - READY

**Remaining Work:**

- 8 files, ~69 critical issues, ~4 hours estimated
- Focus on utils.ts and schema-complexity.ts first (used by extraction)
- Other files can have remaining issues documented as tech debt

**After Phase 1:**

- Phase 2: openapi3-ts v4 upgrade
- Phase 3: Zod v4 upgrade
- Then: Extract to target monorepo
