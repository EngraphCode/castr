# Prompt: Continue Phase 0 Completion

**Context Window Handoff - Current Work Status**  
**Date:** October 26, 2025  
**Branch:** `feat/rewrite`  
**Current Phase:** Phase 0 - System Definition & Preparation

---

## 🎯 Critical Status: What You Need to Know

### Current Situation

**Phase 0 is 70% complete** - Excellent characterisation tests exist (77 tests, all passing), but critical gaps remain before we can safely begin the architecture rewrite.

**Your Mission:** Complete Phase 0 by implementing the 4 missing critical components (5.5 hours estimated).

---

## 📚 Essential Documents to Read (IN ORDER)

### 1. **Context & Status** (READ FIRST - 5 min)

- **`.agent/context/context.md`** - Overall project status, current phase, quality gates
  - Shows Phase 0 is the current priority
  - Lists all completed work (Phase 1 & 2 pre-work)
  - 456 tests passing, all quality gates green

### 2. **Phase 0 Complete Plan** (READ THIS - 15 min) ⭐ **CRITICAL**

- **`.agent/plans/PHASE-0-COMPLETE.md`** - The NEW comprehensive Phase 0 plan
  - **Philosophy:** Right tool for each job (tests for behavior, linter for quality, etc.)
  - **What's Complete:** 77 characterisation tests, 152 snapshot tests, 227 unit tests
  - **What's Missing:** 4 critical items (5.5 hours):
    1. SwaggerParser.bundle() guarantee tests (2h) - **CRITICAL ASSUMPTION**
    2. Architecture documentation (2h)
    3. Baseline metrics (1h)
    4. Lint rule enforcement (0.5h)
  - **Contains:** Complete test implementations ready to copy/paste

### 3. **Architecture Rewrite Plan** (SKIM - 10 min)

- **`.agent/plans/01-CURRENT-IMPLEMENTATION.md`** - Full rewrite plan (Phases 0-3)
  - Phase 0 section superseded by PHASE-0-COMPLETE.md
  - Phase 1-3 provide context on WHY Phase 0 matters
  - Note: Line 187 says "Superseded by .agent/plans/PHASE-0-COMPLETE.md"

### 4. **Coding Standards** (REFERENCE as needed)

- **`.agent/RULES.md`** - Mandatory coding standards
  - **TDD is mandatory** for all implementation
  - No type assertions (`as` casts)
  - Comprehensive TSDoc required
  - Pure functions, fail-fast errors

### 5. **Project Requirements** (REFERENCE as needed)

- **`.agent/plans/requirements.md`** - 8 core requirements
  - Focus: Zod schema generation, SDK quality, type safety

---

## ✅ What's Already Complete

### Tests: 456 tests, all passing, 0 skipped

1. **Unit Tests** (227 tests) - Pure functions, helpers
2. **Characterisation Tests** (77 tests) ⭐ **EXCELLENT WORK**
   - `generation.char.test.ts` (15 tests) - Full pipeline
   - `schema-dependencies.char.test.ts` (10 tests) - Dependency resolution
   - `options.char.test.ts` (20 tests) - Configuration options
   - `cli.char.test.ts` (11 tests) - CLI behavior (truly exercises system via execSync!)
   - `error-handling.char.test.ts` (10 tests) - Error scenarios
   - `edge-cases.char.test.ts` (11 tests) - Edge cases
3. **Snapshot Tests** (152 tests) - Generated output validation

### Quality Gates: All Green ✅

```bash
✅ Build: 5 successful builds (ESM, CJS, DTS)
✅ Type Check: 0 errors
✅ Format: Passing
⚠️ Lint: 125 issues (stable, pre-existing, expected)
✅ Tests: 456/456 passing
```

### Test Principles: 6/6 Compliance ✅

1. ✅ Prove behaviour, not implementation
2. ✅ Prove something useful about system under test
3. ✅ NOT validate test code
4. ✅ NOT validate library code
5. ✅ NEVER be skipped (0 skipped)
6. ✅ NEVER contain conditional logic

---

## ❌ What's Missing (Your Tasks)

### Priority Order - Complete These 4 Items

#### Task 1: Bundled Spec Assumptions Tests (2h) 🔴 **CRITICAL**

**Why Critical:** Phase 1 eliminates `makeSchemaResolver` based on assumption that after bundling, we can access operation properties directly. We need to validate that OUR CODE works correctly with bundled specs.

**What We're Testing:**

- NOT testing SwaggerParser.bundle() itself (that's the library's job)
- Testing that OUR ASSUMPTIONS about bundled output are correct
- Testing that OUR CODE generates correctly from bundled specs
- Proving that resolver is unnecessary with bundled input

**File to Create:** `lib/src/characterisation/bundled-spec-assumptions.char.test.ts`

**Implementation:** See `.agent/plans/PHASE-0-COMPLETE.md` lines 115-437 for COMPLETE test code (ready to copy/paste)

**Tests Required:**

1. Validate bundled structure allows direct access (no $refs in operations)
2. Prove our code generates from bundled specs without assertions
3. Test all sample specs work with bundled input
4. Prove resolver is unnecessary (can access properties directly)

**Validation:**

```bash
pnpm character  # All tests must pass including new ones
```

---

#### Task 2: Architecture Documentation (2h) 🟠 **ESSENTIAL**

**Why Essential:** Complete understanding of current system before rewriting.

**File to Create:** `.agent/architecture/CURRENT-ARCHITECTURE.md`

**Content Required:** See `.agent/plans/PHASE-0-COMPLETE.md` lines 540-727 for COMPLETE outline

**Sections:**

1. High-Level Flow (diagram)
2. Core Components (8 components documented)
3. Data Flow (with current flaws annotated)
4. Type Assertions Breakdown (~74 assertions, locations identified)
5. Dependencies (what to keep, replace, remove)
6. Testing Architecture
7. Known Issues
8. Assumptions to Validate

**Approach:**

- Read the source files to understand current architecture
- Document what EXISTS, not what should exist
- Mark flawed components with ⚠️ warnings
- Be comprehensive - this is THE reference document

---

#### Task 3: Baseline Metrics (1h) 🟡 **TRACKING**

**Why Important:** Quantifiable "before" snapshot to measure rewrite success.

**File to Create:** `.agent/metrics/PHASE-0-BASELINE.md`

**Content Required:** See `.agent/plans/PHASE-0-COMPLETE.md` lines 760-899 for COMPLETE template

**Metrics to Collect:**

```bash
# Run these commands and record results:

# 1. Lines of Code
find lib/src -name "*.ts" ! -name "*.test.ts" ! -path "*/templates/*" | xargs wc -l

# 2. Source files count
find lib/src -name "*.ts" ! -name "*.test.ts" | wc -l

# 3. Type assertions (CRITICAL - this is what we're eliminating)
grep -r " as " lib/src --include="*.ts" --exclude="*.test.ts" | grep -v "as const" | wc -l

# 4. Lint issues
pnpm lint 2>&1 | grep "problems"

# 5. Test metrics
pnpm test -- --run 2>&1 | grep "Tests"
pnpm character 2>&1 | grep "Tests"
pnpm test:snapshot 2>&1 | grep "Tests"

# 6. Build time
time pnpm build

# 7. Bundle sizes
ls -lh lib/dist/*.{js,cjs}
```

**Document:**

- Current state (quantified)
- Phase 1/2/3 success criteria
- Files to delete/rewrite

---

#### Task 4: Lint Rule Enforcement (30 min) 🟢 **QUICK WIN**

**Why Important:** Prevent backsliding - make type assertions ERROR not WARN.

**File to Modify:** `lib/eslint.config.ts`

**Change Required:**

**Current:**

```javascript
'@typescript-eslint/consistent-type-assertions': 'warn'  // ⚠️ Only warns
```

**Should Be:**

```javascript
'@typescript-eslint/consistent-type-assertions': [
  'error',  // ✅ Block commits
  {
    assertionStyle: 'never',
  },
]
```

**Note:** This will cause lint to fail initially (expected - we have ~41 assertions in src/). That's OK - we're establishing the enforcement. The assertions will be eliminated in Phase 1 & 2.

**Document:** Add baseline count to PHASE-0-BASELINE.md before changing rule.

---

## 🎯 Definition of Done: Phase 0 Complete

Phase 0 is COMPLETE when ALL of these are true:

- [ ] ✅ SwaggerParser.bundle() guarantee tests created and passing
- [ ] ✅ Architecture documentation complete and comprehensive
- [ ] ✅ Baseline metrics established and documented
- [ ] ✅ Lint rule changed to ERROR for type assertions
- [ ] ✅ All 456+ tests still passing (including new bundle tests)
- [ ] ✅ All quality gates green (except lint - expected to have assertion errors)
- [ ] ✅ Documentation reviewed for completeness

**Then:** Phase 0 is complete, Phase 1 can begin with confidence.

---

## 🔧 Development Workflow

### Before Starting ANY Task

1. **Verify quality gates:**

```bash
cd /Users/jim/code/personal/openapi-zod-client/lib
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

All must pass ✅ (currently passing)

2. **Verify branch:**

```bash
git status  # Should be on feat/rewrite
```

### For Each Task

#### TDD Workflow (for test tasks):

1. ✍️ Write test file FIRST
2. 🔴 Run tests - confirm they execute (may pass or fail, just need to run)
3. ✅ If testing assumptions, verify they pass
4. 🟢 Run full suite - confirm all tests pass
5. 📝 Document findings in test comments

#### Documentation Workflow (for docs tasks):

1. 📖 Read source code to understand current state
2. ✍️ Document what EXISTS (not ideal state)
3. 🔍 Cross-reference with other files
4. ✅ Validate completeness (all components documented)

### After Each Task

1. **Run quality gate:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run && pnpm character
```

2. **Commit with clear message:**

```bash
git add .
git commit -m "feat(phase-0): [task description]

- What was added/changed
- Why it matters for Phase 0
- Validation performed"
```

---

## 📋 Checklist: Track Your Progress

```markdown
### Phase 0 Completion

#### Critical Tasks

- [ ] Task 1: Bundled spec assumptions tests (2h)
  - [ ] File created: lib/src/characterisation/bundled-spec-assumptions.char.test.ts
  - [ ] Tests pass: pnpm character
  - [ ] Our code's assumptions validated
- [ ] Task 2: Architecture documentation (2h)
  - [ ] File created: .agent/architecture/CURRENT-ARCHITECTURE.md
  - [ ] All 8 components documented
  - [ ] Data flow diagram created
  - [ ] Type assertions breakdown complete
- [ ] Task 3: Baseline metrics (1h)
  - [ ] File created: .agent/metrics/PHASE-0-BASELINE.md
  - [ ] All metrics collected and documented
  - [ ] Success criteria defined
- [ ] Task 4: Lint rule enforcement (30min)
  - [ ] File modified: lib/eslint.config.ts
  - [ ] Baseline assertion count documented
  - [ ] Rule changed to 'error'

#### Validation

- [ ] All tests passing: pnpm test && pnpm character && pnpm test:snapshot
- [ ] Quality gates green (except lint - expected)
- [ ] Documentation complete
- [ ] Committed with clear messages

#### Ready for Phase 1?

- [ ] All 4 tasks complete
- [ ] Our code's bundled spec assumptions validated
- [ ] Architecture fully understood
- [ ] Baseline metrics established
- [ ] All tests passing (456+ tests)
```

---

## 💡 Key Insights to Remember

### Philosophy: Right Tool for Each Job

| Concern          | Correct Tool        | DON'T Use         |
| ---------------- | ------------------- | ----------------- |
| **Behavior**     | Tests               | Manual inspection |
| **Type Safety**  | TypeScript compiler | Tests             |
| **Code Quality** | Linter              | Tests             |
| **Regression**   | Tests (snapshots)   | Hope              |
| **Architecture** | Documentation       | Tribal knowledge  |

### Why Phase 0 Matters

**Phase 1 eliminates `makeSchemaResolver`** based on assumption that after bundling, we can access operation properties directly without needing a resolver. If this assumption is wrong about OUR CODE's usage, Phase 1 fails.

**Phase 0 validates OUR CODE's assumptions** through comprehensive tests. We're not testing SwaggerParser (that's their job) - we're testing that our code uses bundled specs correctly. This is not optional - it's the foundation.

### Current Architecture Issues (Why We're Rewriting)

1. **makeSchemaResolver lies about return types** (claims SchemaObject, returns anything)
2. **CodeMeta is poorly conceived** (no clear value, will be obsolete)
3. **Not leveraging bundle() correctly** (doing redundant work)
4. **74 type assertions** (symptoms of architectural issues)

**Phase 0 documents these issues, Phase 1-3 fix them.**

---

## 🚨 Common Pitfalls to Avoid

### DON'T:

- ❌ Write tests that validate type safety (use TypeScript for that)
- ❌ Write tests that validate code quality (use linter for that)
- ❌ Skip documenting current flaws (document what IS, not what should be)
- ❌ Make assumptions without validation (if Phase 1 depends on it, test it)
- ❌ Change implementation during Phase 0 (only tests & docs)

### DO:

- ✅ Write tests that validate behavior
- ✅ Use tests to validate critical assumptions
- ✅ Document architecture as it currently exists (flaws and all)
- ✅ Establish quantifiable baseline metrics
- ✅ Configure tooling to prevent backsliding

---

## 📞 Getting Help

### If Bundled Spec Assumption Tests Fail

**This is CRITICAL** - Phase 1 plan depends on our code working correctly with bundled specs.

1. Document exactly what failed
2. Investigate if our assumptions about bundled structure are wrong
3. Investigate if our code doesn't handle bundled specs correctly
4. Update Phase 1 plan accordingly (might need different approach or keep resolver)

### If You're Unsure About Architecture

**Don't guess** - read the source:

```bash
# Core files to understand:
lib/src/generateZodClientFromOpenAPI.ts  # Entry point
lib/src/template-context.ts              # Context generation
lib/src/makeSchemaResolver.ts            # Current resolver (flawed)
lib/src/CodeMeta.ts                      # Current CodeMeta (flawed)
lib/src/getOpenApiDependencyGraph.ts     # Dependency tracking (good)
lib/src/openApiToZod.ts                  # Zod conversion
lib/src/openApiToTypescript.ts           # TypeScript conversion
```

---

## 📊 Success Metrics

**You'll know Phase 0 is complete when:**

1. ✅ New bundled spec tests pass, validating our code's assumptions
2. ✅ Architecture doc provides complete understanding
3. ✅ Baseline metrics quantify current state
4. ✅ Lint enforcement prevents future assertions
5. ✅ All quality gates green (456+ tests passing)
6. ✅ Ready to confidently begin Phase 1

**Estimated Time:** 5.5 hours focused work

**Impact:** Enables safe, validated architecture rewrite with zero guesswork

---

## 🎬 Start Here: Your First Steps

1. **Read this prompt completely** (you just did! ✅)

2. **Read Phase 0 plan:**

```bash
cat .agent/plans/PHASE-0-COMPLETE.md
```

3. **Verify quality gates:**

```bash
cd /Users/jim/code/personal/openapi-zod-client/lib
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

4. **Start with Task 1** (Bundled spec assumptions tests - CRITICAL):
   - Copy test template from PHASE-0-COMPLETE.md lines 115-437
   - Create `lib/src/characterisation/bundled-spec-assumptions.char.test.ts`
   - Run `pnpm character` to validate
   - These tests validate OUR CODE's assumptions, not SwaggerParser itself

5. **Continue through Tasks 2-4** in order

6. **Verify completion** using checklist above

---

**Good luck! Phase 0 completion is the foundation for successful rewrite. Take your time, be thorough, and validate everything.**

🎯 **Remember:** Right tool for each job. Tests for behavior, linter for quality, docs for understanding.
