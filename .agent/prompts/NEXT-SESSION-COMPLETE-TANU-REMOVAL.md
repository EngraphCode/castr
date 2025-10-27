# 🎯 Next Session Prompt: Complete Tanu Removal (Final 15%)

**Session Goal:** Remove ALL remaining tanu references and complete Phase 1 Part 2

**Current Status:** 85% COMPLETE - Major milestone achieved!

---

## 📋 READ THESE DOCS IN ORDER (15-20 minutes)

### 1. **Current State** (5 min)
   - **`.agent/context/context.md`** - Current accurate state (85% complete!)
   - Focus on: "Current Status" and "What's Next" sections
   - Key metric: 6 tanu references remaining, down from 20+

### 2. **Coding Standards** (5 min) ⭐ MANDATORY
   - **`.agent/RULES.md`** - TDD requirement, coding conventions
   - Critical: ALL work must follow TDD (write tests FIRST)
   - Key principle: Type safety without assertions

### 3. **Current Task Details** (5 min)
   - **`.agent/plans/PHASE-1-PART-2-TS-MORPH.md`**
   - Section: "📊 Current Progress" - See what's done and what's left
   - Section: "🎯 Remaining Work" - Your roadmap (1-2 hours)
   - Section: "Task 2.5" and "Task 2.6" - Specific steps

### 4. **Project Requirements** (5 min)
   - **`.agent/plans/requirements.md`** - Core requirements
   - Key: Requirement 7 (Zero type assertions)

---

## 🎉 WHAT'S BEEN ACHIEVED (Context)

**Major Milestone: `openApiToTypescript.ts` is now 100% tanu-free!**

- ✅ **ALL tanu eliminated** from main TypeScript generation file
- ✅ **String-based generation** fully operational and tested
- ✅ **All quality gates GREEN** throughout entire migration
- ✅ **Type errors:** 0 (was 8)
- ✅ **Tests:** 552/552 passing (151 snapshots, 406 unit, 115 char)
- ✅ **Lint:** 122 issues (improved from 126, from 136)
- ✅ **Net code reduction:** 404 insertions, 722 deletions (-318 lines!)

**Architecture Success:**
- String-based type generation: PROVEN
- All-in non-incremental strategy: VINDICATED
- TDD throughout: Zero regressions
- No technical debt

---

## 🎯 CURRENT STATE: What Remains

**Tanu References Remaining: 6 files**

From `grep -r "tanu" lib/src --include="*.ts"`:

```
lib/src/openApiToTypescript.helpers.test.ts:  import { t } from 'tanu';          (1 reference - test file)
lib/src/openApiToTypescript.helpers.ts:      import { t, ts } from 'tanu';      (6 references)
lib/src/template-context.ts:                  import { ts } from 'tanu';         (1 reference)
```

**Why they still exist:**
- `openApiToTypescript.helpers.ts` contains "hybrid" functions
- These accept/return both strings AND tanu nodes
- Created during migration for backward compatibility
- Now that main file is clean, these can be removed!

**Package dependency:**
- `lib/package.json` - tanu still listed in dependencies

---

## 🚀 YOUR MISSION: Complete Tasks 2.3, 2.5, 2.6

### **VERIFY CURRENT STATE FIRST**

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Should all be GREEN and passing
pnpm test:all       # 552/552 tests
pnpm type-check     # 0 errors
pnpm lint           # 122 issues (baseline)
pnpm build          # Should pass
pnpm format         # Should pass
```

---

### **Task 2.3 Final Cleanup (30-45 minutes)**

**Goal:** Remove ALL tanu from `openApiToTypescript.helpers.ts`

**Current Situation:**
The file has 6 tanu references and several "hybrid" functions that accept/return both strings and tanu nodes. These were temporary bridges during migration.

**Specific Changes Needed:**

1. **Remove tanu imports** (line ~3)
   ```typescript
   // DELETE:
   import { t, ts } from 'tanu';
   ```

2. **Clean up hybrid functions** - Convert these to pure string functions:
   - `addNullToUnionIfNeeded` - Remove tanu node handling, strings only
   - `maybeWrapReadonly` - Remove tanu node handling, strings only  
   - `handlePrimitiveEnum` - Already returns strings, clean up any tanu refs
   - `handleOneOf` - Already returns strings, clean up any tanu refs
   - `handleAnyOf` - Already returns strings, clean up any tanu refs
   - `handleTypeArray` - Already returns strings, clean up any tanu refs
   - `resolveAdditionalPropertiesType` - Return strings only
   - `buildObjectType` - Accept strings only for additionalPropertiesType
   - `wrapObjectTypeForOutput` - Accept strings only

3. **Delete tanu conversion logic:**
   - Any `t.reference(string)` conversions
   - Any checks like `typeof X === 'string' ? t.reference(X) : X`
   - Any type narrowing for tanu nodes

4. **Update type signatures:**
   - Change from: `ts.Node | t.TypeDefinition | string`
   - Change to: `string` (clean, simple!)

5. **Clean up test file:**
   - `openApiToTypescript.helpers.test.ts` imports tanu
   - Update any tests that create tanu nodes
   - Use string helpers instead

**TDD Approach:**
```bash
# Run tests frequently as you clean up
pnpm test -- openApiToTypescript.helpers.test.ts --run
pnpm type-check  # After each change
```

**Expected Impact:**
- Type errors: Should stay 0
- Lint errors: Should IMPROVE (reduce type assertions)
- Tests: All 409 unit tests should keep passing
- Code: Net reduction (removing bridge code)

---

### **Task 2.5: Remove tanu Dependency (15 minutes)**

**Steps:**

1. **Verify no usage:**
   ```bash
   cd /Users/jim/code/personal/openapi-zod-client/lib
   
   # Should find NOTHING:
   grep -r "from 'tanu'" src --include="*.ts"
   grep -r "import.*tanu" src --include="*.ts"
   grep -r "tanu" src --include="*.ts"
   
   # If any found, go back and clean them up first!
   ```

2. **Remove from package.json:**
   ```bash
   cd /Users/jim/code/personal/openapi-zod-client/lib
   pnpm remove tanu
   ```

3. **Validate:**
   ```bash
   pnpm install       # Clean install
   pnpm build         # Should pass
   pnpm type-check    # Should pass (0 errors)
   pnpm test:all      # Should pass (552/552)
   pnpm lint          # Should IMPROVE (<122 issues)
   ```

4. **Commit:**
   ```bash
   git add -A
   git commit -m "feat: Remove tanu dependency completely

   - Removed tanu from package.json
   - All TypeScript generation now string-based
   - Zero tanu references remaining
   
   Quality Gates:
   ✅ Type-check: 0 errors
   ✅ Tests: 552/552 passing
   ✅ Lint: <122 issues (improved)
   ✅ Build: Passing
   
   Impact:
   - Type assertions eliminated: ~30 (all TS generation)
   - Code simpler, more maintainable
   - Ready for ts-morph integration"
   ```

---

### **Task 2.6: Final Validation (30 minutes)**

**Full Quality Gate Suite:**

```bash
cd /Users/jim/code/personal/openapi-zod-client

echo "=== 1. FORMAT ==="
pnpm format

echo "=== 2. BUILD ==="
pnpm build

echo "=== 3. TYPE-CHECK ==="
pnpm type-check
# MUST show 0 errors

echo "=== 4. LINT ==="
pnpm lint | grep "problems"
# Should show <100 issues (target achieved!)

echo "=== 5. UNIT TESTS ==="
cd lib && pnpm test -- --run
# All tests must pass

echo "=== 6. CHARACTER TESTS ==="
cd .. && pnpm character
# All 115 tests must pass

echo "=== 7. SNAPSHOT TESTS ==="
cd lib && pnpm test:snapshot
# All 151 tests must pass
```

**Count Type Assertions:**

```bash
cd /Users/jim/code/personal/openapi-zod-client/lib/src

# Total type assertions (exclude "as const"):
grep -r " as " --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l
# Target: ~32 (down from 62)

# Specific files (should be ZERO):
grep -c " as " openApiToTypescript.ts || echo "0"          # Should be: 0
grep -c " as " openApiToTypescript.helpers.ts || echo "0"  # Should be: 0

# Other files (acceptable):
grep -c " as " getZodiosEndpointDefinitionList.ts || echo "0"  # ~8
grep -c " as " inferRequiredOnly.ts || echo "0"                # ~7
```

**Document Final Metrics:**

Create summary in commit message:

```bash
git commit -m "feat: Complete Phase 1 Part 2 - ts-morph migration

🎉 PHASE 1 PART 2: COMPLETE (100%)

Achievements:
- ✅ Eliminated ALL tanu usage (was 20+ files)
- ✅ String-based TypeScript generation fully operational
- ✅ Zero type assertions in TS generation (was 30)
- ✅ All quality gates GREEN throughout migration
- ✅ Net code reduction: -318 lines

Quality Gates (Final):
✅ Type-check: 0 errors
✅ Build: Passing
✅ Unit Tests: 409/409 (100%)
✅ Character Tests: 115/115 (100%)
✅ Snapshot Tests: 151/151 (100%)
✅ Lint: [ACTUAL NUMBER] (target: <100, was 122)

Type Assertions Progress:
- Before Part 2: 62 total (30 in TS generation)
- After Part 2: ~32 total (0 in TS generation)
- Reduction: -30 assertions (-48%)

Architecture Success:
- String-based generation: PROVEN and maintainable
- All-in non-incremental: VINDICATED (no tech debt)
- TDD throughout: Zero regressions
- Ready for Phase 1 Part 3 (Zodios removal)

Duration: [ACTUAL TIME] (estimated: 6-8 hours)
Strategy: Non-incremental all-in migration

Tasks Completed:
✅ 2.0: Install ts-morph
✅ 2.1: Research & Design (TDD spike)
✅ 2.2: Create AstBuilder
✅ 2.3: Migrate all helpers to strings
✅ 2.5: Remove tanu dependency
✅ 2.6: Final validation

Next: Phase 1 Part 3 - Zodios removal (4-6 hours)"
```

---

## ✅ ACCEPTANCE CRITERIA

**Before declaring COMPLETE, verify:**

1. **Zero tanu references:**
   ```bash
   grep -r "tanu" lib/src --include="*.ts" --exclude="*.test.ts"
   # Should return: NO RESULTS
   ```

2. **Package clean:**
   ```bash
   cat lib/package.json | grep tanu
   # Should return: NO RESULTS
   ```

3. **All quality gates GREEN:**
   - ✅ format: Passing
   - ✅ build: Passing  
   - ✅ type-check: 0 errors
   - ✅ lint: <100 issues (stretch: <90)
   - ✅ test: 409/409 unit tests
   - ✅ character: 115/115 tests
   - ✅ snapshot: 151/151 tests

4. **Type assertions reduced:**
   - `openApiToTypescript.ts`: 0 (was 17)
   - `openApiToTypescript.helpers.ts`: 0 (was 28)
   - Total: ~32 (was 62)

5. **Code quality:**
   - No TODO comments about tanu
   - No commented-out tanu code
   - No unused imports
   - Clean git status

---

## 🎓 TDD PRINCIPLES (MANDATORY)

**From `.agent/RULES.md`:**

Every change must follow:

1. **Write test first** (RED) - or verify existing test covers it
2. **Run test** - confirm failure or coverage
3. **Implement minimal code** (GREEN)
4. **Run test** - confirm success
5. **Refactor while green**
6. **Run all tests** - ensure no regression

**For this cleanup work:**
- Existing tests should cover the behavior
- Run tests after EVERY file change
- If tests fail, fix the code (not the tests!)
- Add tests if you find gaps

---

## 🚦 VALIDATION GATES

**After EVERY file modified:**
```bash
pnpm type-check && pnpm test -- --run <test-file>
```

**After each task complete:**
```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

**Before final commit:**
```bash
pnpm test:all && pnpm type-check && pnpm lint
# ALL must pass
```

---

## 🎯 KEY DECISIONS & CONSTRAINTS

**From requirements.md:**
1. **No type assertions** - Eliminate all from TS generation (Req 7)
2. **Type safety** - Use proper TypeScript types (Req 2)
3. **All quality gates green** - No regressions allowed (Req 8)

**From RULES.md:**
1. **TDD mandatory** - No exceptions
2. **Pure functions** - Where possible
3. **Explicit > Implicit** - Clear intent
4. **Fail fast** - With helpful errors

**From ADRs:**
- **ADR-014:** Migrate from tanu to ts-morph (the ADR for this work!)
- **ADR-004:** Pure functions <50 lines where possible

---

## 🎉 SUCCESS LOOKS LIKE

When you're done, you should be able to say:

✅ "I searched the entire codebase and found ZERO references to tanu"  
✅ "All 552+ tests are passing"  
✅ "Type-check shows 0 errors"  
✅ "Lint shows <100 issues (was 122)"  
✅ "Type assertions in TS generation: ZERO (was 30)"  
✅ "The code is cleaner, simpler, and more maintainable"  
✅ "We're ready for Phase 1 Part 3 (Zodios removal)"

---

## 📝 QUICK START CHECKLIST

When you start the next session:

- [ ] Read context.md (5 min)
- [ ] Read RULES.md TDD section (5 min)  
- [ ] Read PHASE-1-PART-2-TS-MORPH.md "Current Progress" (5 min)
- [ ] Verify current state (`pnpm test:all`) (2 min)
- [ ] Search for tanu refs (`grep -r "tanu" lib/src`) (1 min)
- [ ] Start Task 2.3 cleanup (30-45 min)
- [ ] Complete Task 2.5 removal (15 min)
- [ ] Execute Task 2.6 validation (30 min)
- [ ] Celebrate! 🎉

**Total estimated time: 1-2 hours**

---

## 💡 PRO TIPS

1. **Work incrementally** - Clean one function at a time, test after each
2. **Keep tests green** - If they fail, you broke something, fix it
3. **Use git** - Commit after each successful cleanup
4. **Reference existing work** - Look at openApiToTypescript.ts to see how it's done
5. **Trust the types** - TypeScript will guide you to what needs fixing

---

**This is the final push! You've got this! 🚀**

