# Phase 0 Start Prompt - Fresh Context

**Purpose:** Use this prompt to begin Phase 0 of the Architecture Rewrite in a fresh chat session

---

## Prompt for AI Assistant

I'm working on the `openapi-zod-client` project and need to execute **Phase 0 of the Architecture Rewrite**.

### Project Context

**Project:** openapi-zod-client fork modernization  
**Goal:** Generate strict Zod schemas and MCP tool validation from OpenAPI specifications  
**Target:** Extract to Engraph monorepo for SDK generation  
**Current Branch:** `feat/rewrite`

### Current Status

- ✅ All 373 tests passing
- ✅ Quality gates green (format, build, type-check, test)
- ✅ Phase 1 & 2 pre-work complete (dependencies updated, templates ready)
- ✅ Architecture Rewrite Plan documented and approved
- 🎯 **Ready to start Phase 0**

### What I Need You To Do

**Execute Phase 0: Comprehensive Public API Test Suite**

**Objective:** Create 50-60 comprehensive end-to-end tests that validate the entire public API before we begin any architectural changes. These tests serve as a safety net to ensure no behavioral regressions during the rewrite.

**Estimated Time:** 8-12 hours

### Critical Documents You Must Read

**Before starting, please read these documents in order:**

1. **`.agent/plans/requirements.md`** (2 min) ⭐
    - 8 core project requirements
    - High-level goals and constraints

2. **`.agent/RULES.md`** (10 min) ⭐ **MANDATORY**
    - Test-Driven Development (TDD) methodology - **STRICTLY REQUIRED**
    - Comprehensive TSDoc standards
    - Coding standards (pure functions, fail-fast, no type assertions)
    - This defines HOW we write code

3. **`.agent/plans/01-CURRENT-IMPLEMENTATION.md`** (15 min) ⭐ **THE PLAN**
    - Complete Architecture Rewrite plan
    - **Section: "Phase 0: Comprehensive Public API Test Suite"** - Read this section carefully
    - Detailed task breakdown with test examples
    - This is THE single source of truth for what to implement

4. **`.agent/context/context.md`** (5 min)
    - Current project state
    - Quick reference for dependencies and tools

### Phase 0 Detailed Instructions

**Location in Plan:** `.agent/plans/01-CURRENT-IMPLEMENTATION.md` → Section "Phase 0: Comprehensive Public API Test Suite"

**What Phase 0 Includes:**

1. **Task 0.1: End-to-End Generation Tests** (3-4 hours)
    - Test complete OpenAPI → TypeScript generation flow
    - Multiple OpenAPI specs (simple, complex, real-world)
    - All templates: `default`, `schemas-with-metadata`
    - All output modes: `zod`, `types`

2. **Task 0.2: Schema Dependencies Tests** (2-3 hours)
    - Test dependency graph generation
    - Test topological sorting
    - Test circular dependency detection
    - Test schema ordering

3. **Task 0.3: Type Safety Tests** (2-3 hours)
    - Test generated code type-checks
    - Test schema composition
    - Test discriminated unions
    - Test nested schemas

4. **Task 0.4: Swagger Parser Integration Tests** (1-2 hours)
    - Test `SwaggerParser.bundle()` guarantees
    - Test $ref resolution expectations
    - Test error handling

5. **Task 0.5: Regression Prevention Tests** (1-2 hours)
    - Test known edge cases
    - Test GitHub issues scenarios
    - Test breaking changes from previous versions

**Each test file has detailed examples and structure in the plan document.**

### Mandatory TDD Workflow

**YOU MUST FOLLOW THIS PROCESS - NO EXCEPTIONS:**

1. **✍️ Write failing test(s) FIRST** - Before any implementation code
2. **🔴 Run tests - confirm FAILURE** - Proves tests validate behavior
3. **✅ Write minimal implementation** - Only enough to pass tests
4. **🟢 Run tests - confirm SUCCESS** - Validates implementation works
5. **♻️ Refactor if needed** - Clean up with test protection
6. **🔁 Repeat** - For each piece of functionality

**Why this matters:** We're about to make major architectural changes. These tests protect us from breaking the public API.

### Quality Gates (Must Pass After Each Task)

```bash
cd lib
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

All must pass ✅ before moving to next task.

### Project Structure

```
/workspace/
  lib/                          # Main package
    src/                        # Source code
      generateZodClientFromOpenAPI.ts  # Main entry point
      openApiToTypescript.ts    # Code generation
      openApiToZod.ts          # Schema generation
      templates/               # Handlebars templates
      __tests__/              # Test files (add Phase 0 tests here)
    package.json
  .agent/
    plans/                     # Planning documents
    RULES.md                   # Coding standards (READ THIS)
    adr/                       # Architecture decision records
```

### Key Commands

```bash
# Run all tests
cd lib && pnpm test -- --run

# Run specific test file
cd lib && pnpm test -- --run src/__tests__/e2e-generation.test.ts

# Run with coverage
cd lib && pnpm test -- --run --coverage

# Type check
cd lib && pnpm type-check

# Build
cd lib && pnpm build

# Format
cd lib && pnpm format
```

### What Success Looks Like

After Phase 0 is complete:

- ✅ 50-60 new comprehensive tests added
- ✅ All tests passing (current 373 + new ~50-60 = ~430 total)
- ✅ Public API behavior fully documented by tests
- ✅ Quality gates passing
- ✅ Ready to begin Phase 1 with confidence

### Important Context About the Rewrite

**Why we're doing this:**

During Phase 2 pre-work, we discovered that 74 type assertions were symptoms of deeper architectural problems:

1. **`makeSchemaResolver` lies about return types** - Claims to return `SchemaObject`, actually returns any component type
2. **Not leveraging `SwaggerParser.bundle()`** - We're not using this correctly; it already resolves operation-level $refs
3. **`CodeMeta` is poorly conceived** - Abstraction with no clear value, adds complexity
4. **Type assertions mask bugs** - 74 instances hiding architectural dishonesty

**The fix:** Comprehensive 4-phase rewrite (Phase 0-3) rather than incremental patches.

**Your role in Phase 0:** Build comprehensive test coverage so we can refactor with confidence.

### Key Principles (From RULES.md)

1. **TDD is mandatory** - Tests first, always
2. **Fail fast with helpful errors** - No defensive programming
3. **Pure functions when possible** - Easier to test, easier to reason about
4. **Comprehensive TSDoc** - Public API needs 3+ examples
5. **No type assertions** - Target repo forbids them (`assertionStyle: "never"`)
6. **Explicit over implicit** - Code should be obvious
7. **Quality gates must pass** - After every change

### Dependencies You'll Work With

- **Zod v4.1.12** - Schema validation library
- **openapi3-ts v4.5.0** - OpenAPI type definitions (using `oas30` namespace)
- **@apidevtools/swagger-parser v12.1.0** - OpenAPI parsing and bundling
- **vitest** - Test framework
- **TypeScript** - Language

### Red Flags / Things to Avoid

❌ **Don't write implementation code before tests** - TDD is mandatory  
❌ **Don't skip quality gates** - They must pass after every task  
❌ **Don't use type assertions (`as`)** - Target repo forbids them  
❌ **Don't add `any` types** - Use `unknown` if necessary  
❌ **Don't modify architecture yet** - Phase 0 is ONLY tests, no refactoring

### Getting Started Checklist

Before you begin coding:

- [ ] Read `requirements.md` (8 requirements)
- [ ] Read `RULES.md` (TDD methodology, coding standards)
- [ ] Read `01-CURRENT-IMPLEMENTATION.md` Phase 0 section
- [ ] Understand TDD workflow (Red → Green → Refactor)
- [ ] Verify current tests pass: `cd lib && pnpm test -- --run`
- [ ] Understand quality gate: `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run`

### First Action

**Start with Task 0.1: End-to-End Generation Tests**

1. Read the detailed task breakdown in `01-CURRENT-IMPLEMENTATION.md`
2. Create test file: `lib/src/__tests__/e2e-generation.test.ts`
3. Write your first failing test (following the examples in the plan)
4. Run it, confirm it fails
5. Make it pass
6. Continue with TDD cycle

### Questions?

If you need clarification:

- **About requirements:** Check `requirements.md`
- **About coding standards:** Check `RULES.md`
- **About the plan:** Check `01-CURRENT-IMPLEMENTATION.md`
- **About project history:** Check `.agent/plans/archive/COMPLETED_WORK.md`
- **About current state:** Check `.agent/context/context.md`

### Summary

**What:** Create comprehensive public API test suite (50-60 tests)  
**Why:** Safety net for architectural rewrite  
**How:** Strict TDD (tests first, always)  
**Time:** 8-12 hours  
**Success:** All quality gates pass, ready for Phase 1

---

## Reference Documents Summary

| Document                       | Purpose                            | Time to Read      |
| ------------------------------ | ---------------------------------- | ----------------- |
| `requirements.md`              | High-level project goals           | 2 min             |
| `RULES.md`                     | How we write code (TDD, standards) | 10 min ⭐         |
| `01-CURRENT-IMPLEMENTATION.md` | Complete rewrite plan              | 15 min ⭐         |
| `context.md`                   | Current project state              | 5 min             |
| `00-STRATEGIC-PLAN.md`         | Strategic overview                 | 10 min (optional) |
| `archive/COMPLETED_WORK.md`    | Historical context                 | Browse as needed  |

---

## Ready to Start?

Once you've read the critical documents (requirements.md, RULES.md, and 01-CURRENT-IMPLEMENTATION.md Phase 0 section), you're ready to begin!

**First command:**

```bash
cd lib && pnpm test -- --run
```

Verify all 373 tests pass, then start creating your Phase 0 test files.

Good luck! 🚀

