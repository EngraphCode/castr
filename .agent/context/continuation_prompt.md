# Folder Reorganisation Continuation Prompt

**Purpose:** Use this prompt to spin up a fresh chat and resume **lib/src Folder Reorganisation** for the `openapi-zod-validation` modernization.

---

## Prompt for AI Assistant

I'm working on the `openapi-zod-validation` modernization project. This is a TypeScript library that generates Zod validation schemas and type-safe API clients from OpenAPI 3.0/3.1 specifications.

**Project Context:**

- **Repository:** Local fork at `/Users/jim/code/personal/openapi-zod-client`
- **Branch:** `feat/rewrite`
- **Goal:** Modernize and extract to Engraph monorepo
- **Tech Stack:** TypeScript, Zod, OpenAPI 3.x, Handlebars (future: ts-morph), Vitest

**Journey So Far:**

- ✅ Phase 1 Part 1: Context types refactored
- ✅ Phase 1 Part 2: Tanu eliminated, string-based TS generation
- ✅ Phase 1 Part 3: Zodios removed, openapi-fetch integration
- ⏸️ Phase 1 Part 4: **PAUSED (95% complete)** - Will resume after folder reorganisation
- 🎯 Folder Reorganisation: **IN PROGRESS (Tasks 1-6 of 8 complete)**

**Current Objective:**
We are completing a **critical folder reorganisation** to establish a clean, layered architecture in `lib/src/`. This is strictly organizational - **no changes to public API or behavior**. All 799 tests must continue passing.

### Required Reading (in order)

1. `.agent/plans/LIB-SRC-FOLDER-REORGANISATION.md` – **PRIMARY** - Full reorganisation plan (15 min)
2. `.agent/RULES.md` – Coding standards & TDD mandate (10 min, mandatory)
3. `.agent/context/context.md` – Living status, recent wins (5 min)
4. `.agent/plans/requirements.md` – Project-level constraints (optional refresher)

### Current State (2025-11-02 - Task 6 Complete!)

- ✅ `pnpm format`, `pnpm build`, `pnpm type-check`, `pnpm lint`, `pnpm test:all` (799/799 passing)
- ✅ **Tasks 1-6 Complete:** 70+ files migrated to new structure
- 🔲 **Tasks 7-8 Remaining:** Rendering, CLI, AST, final cleanup (~3-4 hours)
- **Latest Achievement:** Task 6 complete - 29 files (endpoints + context) successfully migrated!

**🏆 FOLDER REORGANISATION ACHIEVEMENTS:**

**Completed Tasks (6 of 8):**

- ✅ **Task 1:** Architecture defined (detailed plan created)
- ✅ **Task 2:** Infrastructure verified (all configs compatible)
- ✅ **Task 3:** `validation/` & `shared/` created (21 files migrated)
- ✅ **Task 4:** `shared/utils/` split into focused files (5 new modules)
- ✅ **Task 5:** Conversion layers migrated (21 files: TypeScript + Zod)
- ✅ **Task 6:** Endpoints & context migrated (29 files: 20 + 9)

**New Directory Structure:**

```
lib/src/
├── validation/         ✅ (5 files)
├── shared/             ✅ (17 files + utils/ subdir)
├── conversion/         ✅ (21 files: typescript/ + zod/)
├── endpoints/          ✅ (20 files + operation/ subdir)
├── context/            ✅ (9 files)
├── rendering/          🔲 (Task 7)
├── cli/                🔲 (Task 7)
└── ast/                🔲 (Task 8)
```

**Quality Gates:**

- ✅ All 799 tests passing (523 unit + 124 char + 152 snapshot)
- ✅ Type-check: 0 errors
- ✅ Lint: 0 errors
- ✅ Build: Successful
- ✅ Public API: Preserved

### Quality Gate Policy

- All quality gate failures (`pnpm format`, `pnpm build`, `pnpm type-check`, `pnpm test:all`, `pnpm lint`) are blocking with no exceptions
- All tests must pass (unit, characterization, snapshot)
- Public API must remain unchanged (verified by preservation tests)
- Git history must be preserved (use `git mv` for file moves)
- Zero regressions tolerance

### Immediate Goal

Complete the folder reorganisation (Tasks 7-8) to establish a clean, layered architecture. This is **strictly organizational** - no changes to public API or behavior. Focus: rendering, CLI, and AST files, then final cleanup.

### Remaining Work (Tasks 7-8: ~3-4 Hours)

**Task 7: Rendering & CLI Migration (~2-3 hours)**

**Part A: Rendering (5 files)**

- Create `lib/src/rendering/` directory
- Move `generateZodClientFromOpenAPI.ts` → `rendering/generate-from-context.ts`
- Move `generateZodClient.templating.ts` → `rendering/templating.ts`
- Move `getHandlebars.ts` + test → `rendering/handlebars.ts` + test
- Move `templates/` directory → `rendering/templates/`
- Create `rendering/index.ts` barrel export
- Update internal imports (context, validation, shared)
- Update external imports (cli, index, tests)

**Part B: CLI (3 files)**

- Create `lib/src/cli/` directory
- Move `cli.ts` → `cli/index.ts`
- Move `cli.helpers.ts` → `cli/helpers.ts`
- Move `cli.helpers.options.ts` → `cli/helpers.options.ts`
- Update imports within CLI files
- Update `tsup.config.ts` entry point to `src/cli/index.ts`
- Verify CLI builds correctly

**Validation:**

- `pnpm build` - CLI and library build
- `pnpm test -- characterisation/cli.char.test.ts` - CLI tests pass
- `pnpm test:all` - all tests pass

**Task 8: AST & Final Cleanup (~1 hour)**

**Part A: AST Migration (3 files)**

- Create `lib/src/ast/` directory
- Move `AstBuilder.ts` → `ast/builder.ts`
- Move `AstBuilder.test.ts` → `ast/builder.test.ts`
- Move `ast-builder.test.ts` → `ast/ast-builder.test.ts`
- Update any imports (likely none, AST is unused)

**Part B: Final Cleanup**

- Verify `lib/src/*.ts` contains only `index.ts` and `public-api-preservation.test.ts`
- Search for orphaned imports (should find none)
- Update documentation
- Clean build verification

**Final Validation:**

- All quality gates pass from clean state
- Public API verification test passes
- Characterisation tests unchanged
- Bundle sizes within 5% of baseline

### Non-Negotiables (from `.agent/RULES.md`)

- **Use `git mv`** for all file moves (preserves history)
- **No API changes:** Public API must remain identical
- **All tests pass:** 799 tests (523 unit + 124 char + 152 snapshot)
- **Barrel exports:** Create `index.ts` for each new directory
- **Update all imports:** Internal and external references
- **Quality gates:** All must pass before proceeding

### File Movement Checklist (Per File)

For each file being moved:

1. **Create target directory** (if needed)

   ```bash
   mkdir -p lib/src/<target-dir>
   ```

2. **Move with git mv** (preserves history)

   ```bash
   git mv lib/src/<old-path> lib/src/<target-dir>/<new-name>
   ```

3. **Update internal imports** (within moved file)
   - Adjust relative paths for new location
   - Example: `'./utils.js'` → `'../../shared/utils/index.js'`
   - Example: `'./openApiToZod.js'` → `'../conversion/zod/index.js'`

4. **Find external references**

   ```bash
   grep -r "from.*<filename>" lib/src lib/tests-snapshot
   ```

5. **Update all external imports**
   - Update import paths in all referencing files
   - Update public API exports in `lib/src/index.ts`

6. **Create/update barrel exports**
   - Create `index.ts` in new directory
   - Export public API from new location

7. **Validate**
   ```bash
   pnpm type-check  # Should have 0 errors
   pnpm test:all    # All tests should pass
   pnpm build       # Should build successfully
   ```

**Common Pitfalls to Avoid:**

- ❌ Don't use regular `mv` - use `git mv` to preserve history
- ❌ Don't forget to update test imports in `tests-snapshot/`
- ❌ Don't skip type-check between file moves
- ❌ Don't leave orphaned files after `git mv`
- ❌ Don't forget to create barrel exports

### Working Loop (For Folder Reorganisation)

1. Read the task section in LIB-SRC-FOLDER-REORGANISATION.md
2. Create target directory structure
3. Move files with `git mv` (one logical group at a time)
4. Update internal imports within moved files
5. Find and update all external references
6. Create/update barrel exports
7. Run quality gates after each logical group:
   ```bash
   pnpm type-check  # Must be 0 errors
   pnpm test:all    # All 799 tests must pass
   pnpm build       # Must build successfully
   ```
8. Update plan docs with completion status

### Deliverables for Each Task

- All files moved with `git mv` (history preserved)
- All imports updated (internal and external)
- Barrel exports created for new directories
- Quality gates passing (type-check, test, build, lint)
- Documentation updated with completion summary

### 🚀 IMMEDIATE ACTIONS (First 10 Minutes)

**Step 1: Orient Yourself (2 min)**

```bash
cd /Users/jim/code/personal/openapi-zod-client
git status    # Should be on feat/rewrite
pnpm test:all  # Confirm 799 tests passing
```

**Step 2: Review Documentation (5 min)**

- Read `.agent/plans/LIB-SRC-FOLDER-REORGANISATION.md` - Task 6 complete, Task 7 next!
- Skim Task 7 section - rendering & CLI files to move
- Note the file mappings and import patterns

**Step 3: Start Task 7 Part A (Rendering)**
Begin moving rendering files following the checklist in the plan.

### Key Codebase Structure (After Tasks 1-6)

```
lib/src/
├── index.ts                      # Public API (updated with barrel exports)
├── public-api-preservation.test.ts
│
├── validation/                   # ✅ Task 3 (5 files)
├── shared/                       # ✅ Tasks 3-4 (17 files + utils/ subdir)
├── conversion/                   # ✅ Task 5
│   ├── typescript/              # (12 files)
│   └── zod/                     # (9 files)
├── endpoints/                    # ✅ Task 6
│   ├── index.ts                # Barrel export
│   ├── operation/              # (5 files)
│   └── [15 other files]
├── context/                      # ✅ Task 6
│   ├── index.ts                # Barrel export
│   └── [8 other files]
│
├── generateZodClientFromOpenAPI.ts  # 🔲 Task 7 → rendering/generate-from-context.ts
├── generateZodClient.templating.ts  # 🔲 Task 7 → rendering/templating.ts
├── getHandlebars.ts                 # 🔲 Task 7 → rendering/handlebars.ts
├── getHandlebars.test.ts            # 🔲 Task 7 → rendering/handlebars.test.ts
├── templates/                       # 🔲 Task 7 → rendering/templates/
├── cli.ts                           # 🔲 Task 7 → cli/index.ts
├── cli.helpers.ts                   # 🔲 Task 7 → cli/helpers.ts
├── cli.helpers.options.ts           # 🔲 Task 7 → cli/helpers.options.ts
├── AstBuilder.ts                    # 🔲 Task 8 → ast/builder.ts
├── AstBuilder.test.ts               # 🔲 Task 8 → ast/builder.test.ts
└── ast-builder.test.ts              # 🔲 Task 8 → ast/ast-builder.test.ts
```

### Starting Point Checklist

- [ ] Run `pnpm test:all` to confirm all 799 tests passing
- [ ] Run `git status` to verify clean working tree
- [ ] Read Task 7 section in LIB-SRC-FOLDER-REORGANISATION.md
- [ ] Identify files to move for Task 7:
  - **Part A (Rendering):** 5 items (4 files + templates/ directory)
  - **Part B (CLI):** 3 files
- [ ] Follow file movement checklist:
  1. **Create directory:** `mkdir -p lib/src/<target-dir>`
  2. **Move files:** `git mv lib/src/<old> lib/src/<new>`
  3. **Update internal imports:** Adjust relative paths in moved files
  4. **Find references:** `grep -r "from.*<filename>"`
  5. **Update external imports:** All referencing files
  6. **Create barrel exports:** `index.ts` in new directories
  7. **Validate:** `pnpm type-check && pnpm test:all && pnpm build`

### 🎓 Proven Patterns (From Tasks 1-6)

**Pattern 1: Incremental File Migration (WORKS!)**

- Move files in logical groups (e.g., all TypeScript conversion files together)
- Used successfully for validation (5), shared (21), conversion (21), endpoints (20), context (9)
- Process: Create dir → Move with `git mv` → Update imports → Validate
- Key: Validate after each group, don't move everything at once

**Pattern 2: Import Update Strategy**

- Use `grep -r` to find all references before updating
- Update internal imports first (within moved files)
- Then update external imports (referencing files)
- Finally update public API exports
- Triple-check: type-check, tests, build

**Pattern 3: Barrel Export Pattern**

- Create `index.ts` in each new directory
- Export only what's needed publicly
- Keeps internal implementation details private
- Makes future refactoring easier

**Pattern 4: Quality Gate Discipline**

- Run `pnpm type-check` after updating imports
- Run `pnpm test:all` after each file group
- Run `pnpm build` to verify CLI/library builds
- Never skip validation steps

**Common Pitfalls to Avoid:**

- ❌ Don't use regular `mv` - always use `git mv`
- ❌ Don't forget test files in `tests-snapshot/`
- ❌ Don't leave orphaned files after `git mv`
- ❌ Don't skip creating barrel exports
- ❌ Don't move on if any test fails

### Success Metrics & Progress Tracking

**Reorganisation Progress:**

- **Tasks Complete:** 6 of 8 (75%)
- **Files Migrated:** 70+ files into new structure
- **Directories Created:** 5 (validation, shared, conversion, endpoints, context)
- **Barrel Exports:** 5 created (endpoints/, context/, conversion/zod/, conversion/typescript/, shared/utils/)
- **Import Updates:** 100+ relative paths adjusted
- **Git History:** Preserved with `git mv` for all moves
- **Tests:** 799/799 passing (100%)

**Task Completion Status:**

- ✅ Task 1: Architecture (planning)
- ✅ Task 2: Infrastructure verification
- ✅ Task 3: Validation & shared migration (21 files)
- ✅ Task 4: Shared/utils split (5 new modules)
- ✅ Task 5: Conversion layers (21 files)
- ✅ Task 6: Endpoints & context (29 files)
- 🔲 Task 7: Rendering & CLI (8 files)
- 🔲 Task 8: AST & final cleanup (3 files)

**Estimated Remaining:** 3-4 hours (Tasks 7-8)

- Task 7 Part A (Rendering): 1-1.5 hours
- Task 7 Part B (CLI): 1 hour
- Task 8 (AST & cleanup): 1 hour
- Final validation: 30 minutes

### When Declaring Folder Reorganisation Complete

All of the following must be true:

- All 8 tasks marked complete in LIB-SRC-FOLDER-REORGANISATION.md
- `lib/src/` contains only: `index.ts`, `public-api-preservation.test.ts`, and 8 directories
- All quality gates pass: `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all`
- All 799 tests passing (523 unit + 124 char + 152 snapshot)
- Public API preservation test passes
- No orphaned imports found in codebase
- Bundle sizes within 5% of baseline
- Documentation updated with completion summary

### Tools & Commands Reference

**Quality Gates:**

```bash
pnpm format                       # Prettier formatting
pnpm build                        # ESM + CJS + DTS build (includes CLI)
pnpm type-check                   # TypeScript type checking
pnpm test:all                     # All tests (799 total: 523 unit + 124 char + 152 snapshot)
pnpm lint                         # ESLint (target: 0 errors)
```

**Full Quality Sweep:**

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test:all && pnpm lint
```

**File Movement:**

```bash
git mv lib/src/<old-path> lib/src/<new-path>  # Preserves history
git status                                      # Check what's staged
```

**Finding References:**

```bash
grep -r "from.*<filename>" lib/src lib/tests-snapshot  # Find all imports
grep -r "from '\./openApiTo" lib/src/                  # Find old-style imports
```

**Commit Pattern:**

```bash
git add -A
git commit -m "refactor(structure): migrate <component> to <new-dir>

- Files moved: X files
- Imports updated: Y locations
- Barrel exports: created/updated
- Tests: 799/799 passing ✅
- Build: successful ✅"
```

---

**📋 IMPORTANT: This prompt is self-contained. You have all the information needed to start working immediately.**

**Next Steps:**

1. Read `LIB-SRC-FOLDER-REORGANISATION.md` (Task 7 section) - 10 min
2. Verify current state: `pnpm test:all` - 2 min
3. Begin Task 7 Part A (Rendering files) - follow the checklist

**Key Success Factors:**

- Use `git mv` for all file moves (preserves history)
- Update imports incrementally (internal first, then external)
- Validate after each logical group (type-check, test, build)
- Create barrel exports for clean public APIs
- Document progress in plan docs

Use this prompt verbatim to rehydrate any new session. It ensures every new assistant enters with the same mission, constraints, patterns, and current metrics.
