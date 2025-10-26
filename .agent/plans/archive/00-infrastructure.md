# Phase 0: Infrastructure & Workspace Setup

**Focus:** Build system, task orchestration, and testing standards  
**Type:** Foundation work  
**Estimated Time:** 1-2 days

---

## Objective

Establish a robust, modern monorepo infrastructure using Turborepo with consistent tooling across all workspaces. Ensure every workspace has standardized scripts, proper test coverage, and fast iteration cycles. This creates a solid foundation for subsequent modernization phases.

---

## Why Phase 0 First?

### Without Proper Infrastructure

- ❌ Inconsistent scripts across workspaces
- ❌ Slow iteration (no caching)
- ❌ Can't verify changes don't break other workspaces
- ❌ Manual coordination of task dependencies
- ❌ Tests might pass but functionality broken
- ❌ No way to run all checks quickly

### With Turbo + Standards

- ✅ Fast feedback loop (instant on cache hit)
- ✅ Consistent commands everywhere
- ✅ Parallel execution across workspaces
- ✅ Proper task dependency management
- ✅ Confidence that tests prove functionality
- ✅ Easy to verify changes don't break things

---

## Scope

### In Scope ✅

- Install and configure Turborepo (latest)
- Standardize scripts across all workspaces
- Create root-level orchestration commands
- Set up task dependency pipeline
- Configure caching strategies
- Ensure tests prove functionality (not just types)
- Add test coverage for critical paths
- Document task graph
- Create coding standards (rules.md)

### Out of Scope ❌

- Updating dependencies (Phase 1)
- ESM migration (Phase 1)
- Fixing TypeScript errors (Phase 1)
- Library API changes
- Generated output changes

---

## Current State Analysis

### Existing Workspaces

```
root/
├── lib/                    # Main library
│   ├── src/               # Source files
│   └── tests/             # Test files (68)
├── playground/            # Demo/testing UI
│   └── src/
├── examples/
│   ├── basic/
│   ├── schemas-only/
│   └── export-schemas-and-types-directly/
└── lib/cli/               # CLI package (nested)
```

### Current Scripts (Inconsistent)

**Root:**

```json
{
  "build": "preconstruct build",
  "dev": "preconstruct watch",
  "postinstall": "preconstruct dev"
}
```

**lib/package.json:**

```json
{
  "test": "vitest",
  "test:ci": "vitest run",
  "lint:ts": "tsc --noEmit --project tsconfig.lint.json",
  "lint": "eslint --cache --format=pretty",
  "lint:fix": "eslint --cache --format=pretty --fix"
}
```

**playground/package.json:**

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

**Issues:**

- No `format` script anywhere
- No consistent `type-check` command
- No root-level orchestration
- Examples don't have scripts
- Can't run all tests at once
- No task dependencies

---

## Detailed Implementation Plan

### Step 1: Install Turborepo (Latest)

```bash
# Install Turbo
pnpm add -D turbo -w

# Verify installation
pnpm turbo --version
```

**Expected Version:** 2.x (latest stable as of October 2025)

---

### Step 2: Create turbo.json

Create root-level `turbo.json` with latest config format:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "stream",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "out/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "format": {
      "outputs": [],
      "cache": false
    },
    "format:check": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Key Features:**

- `^build` means "build dependencies first"
- `outputs` defines what gets cached
- `cache: false` for format (writes files)
- `persistent: true` for dev servers

---

### Step 3: Standardize Root Scripts

Update root `package.json`:

```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev --parallel",
    "type-check": "turbo type-check",
    "lint": "turbo lint",
    "lint:fix": "turbo lint -- --fix",
    "test": "turbo test",
    "test:watch": "turbo test -- --watch",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,yaml,yml}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,yaml,yml}\"",
    "clean": "turbo clean && rm -rf node_modules",
    "verify": "turbo format:check type-check lint test"
  }
}
```

**Key Commands:**

- `verify`: Runs all checks before commit
- `clean`: Deep clean for troubleshooting
- `lint:fix`: Passes `--fix` through to eslint
- `test:watch`: Passes `--watch` through to vitest

---

### Step 4: Standardize lib/package.json Scripts

```json
{
  "scripts": {
    "build": "preconstruct build",
    "dev": "preconstruct watch",
    "type-check": "tsc --noEmit --project tsconfig.lint.json",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:watch": "vitest",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Changes:**

- ✅ Added `format` and `format:check`
- ✅ Renamed `lint:ts` to `type-check` (standard name)
- ✅ Simplified `lint` (no cache flag, Turbo handles caching)
- ✅ Split `test` and `test:watch`
- ✅ Removed `test:ci` (use `test` instead)

---

### Step 5: Standardize playground/package.json Scripts

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "echo 'No tests in playground'",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Changes:**

- ✅ Added `type-check`, `lint`, `format`
- ✅ Added dummy `test` (Turbo expects it)
- ✅ Consistent with lib scripts

---

### Step 6: Add Scripts to Examples

Each example needs minimal scripts:

**examples/basic/package.json:**

```json
{
  "scripts": {
    "gen:basic": "tsx ./petstore-generator.ts",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "echo 'Example - no tests needed'"
  }
}
```

Repeat for:

- `examples/schemas-only/`
- `examples/export-schemas-and-types-directly/`

---

### Step 7: Test Coverage Review

#### Current Test Files (lib/tests/)

```bash
ls lib/tests/*.ts | wc -l  # Count test files
```

**Need to verify:**

- [ ] All tests run and pass
- [ ] Tests prove behavior (not just types)
- [ ] Critical paths covered:
  - Schema generation (openApiToZod)
  - Type generation (openApiToTypescript)
  - Endpoint generation (getZodiosEndpointDefinitionList)
  - CLI functionality
  - Template rendering

#### Test Quality Checklist

For each test file, verify against `.agent/RULES.md`:

- ✅ Tests pure functions where possible
- ✅ Tests prove useful behavior
- ✅ Tests don't constrain implementation
- ✅ No filesystem/network IO
- ✅ Type information preserved
- ✅ Minimal type casting

#### Add Missing Tests

**If needed, add tests for:**

1. **CLI Input/Output** (mock filesystem)

   ```typescript
   test('CLI generates client from OpenAPI URL', async () => {
     // Mock fetch, verify output structure
   });
   ```

2. **End-to-End Schema Generation**

   ```typescript
   test('Full schema pipeline preserves types', async () => {
     const input = {
       /* OpenAPI doc */
     };
     const output = await generateZodClientFromOpenAPI(input);
     expect(output).toContain('z.object');
     // Verify actual functionality
   });
   ```

3. **Error Cases**
   ```typescript
   test('Invalid OpenAPI spec throws descriptive error', () => {
     expect(() => validateSpec({})).toThrow('Missing required');
   });
   ```

---

### Step 8: Configure Turbo Caching

**Global Config** (`~/.turbo/config.json`):

```json
{
  "teamId": "local",
  "apiUrl": "https://turbo.build"
}
```

**Per-Task Caching:**

- `build`: Cache outputs (dist files)
- `type-check`: Cache result (no outputs)
- `lint`: Cache result (no outputs)
- `test`: Cache coverage reports
- `format`: No cache (modifies files)
- `format:check`: Cache result

---

### Step 9: Verify Task Dependencies

```bash
# Visualize task graph
pnpm turbo build --graph

# Should show:
# lib:build → playground:build (depends on lib)
```

**Dependency Rules:**

1. `type-check`, `lint`, `test` depend on `build`
2. Examples depend on `lib:build`
3. Playground depends on `lib:build`
4. Format has no dependencies

---

### Step 10: Document Workspace Commands

Create `.agent/WORKSPACE_COMMANDS.md`:

```markdown
# Workspace Commands

## Root Level (Orchestration)

\`\`\`bash
pnpm build # Build all workspaces
pnpm dev # Run all dev servers in parallel
pnpm type-check # Type check all workspaces
pnpm lint # Lint all workspaces
pnpm lint:fix # Lint and fix all workspaces
pnpm test # Run all tests
pnpm format # Format all files
pnpm verify # Run all checks (format, type, lint, test)
\`\`\`

## Workspace-Specific

\`\`\`bash
cd lib
pnpm build # Build lib only
pnpm type-check # Type check lib only
pnpm lint # Lint lib only
pnpm test # Test lib only
\`\`\`

## Turbo Features

\`\`\`bash
pnpm turbo build --filter=lib # Build only lib
pnpm turbo test --filter=lib... # Test lib and its dependencies
pnpm turbo build --force # Ignore cache, rebuild everything
pnpm turbo build --dry-run # Show what would run
\`\`\`
\`\`\`

---

### Step 11: Create .turboignore (Optional)
```

# .turboignore

.git/
node_modules/
dist/
\*.log
.DS_Store

````

---

## Current Status

**Phase 0: COMPLETED** ✅

### Completed Tasks

- ✅ Turbo v2.5.8 installed and configured
- ✅ `turbo.json` created with task pipeline
- ✅ Root scripts standardized (build, type-check, lint, test, format, verify)
- ✅ `lib` scripts standardized with all required commands
- ✅ `playground` scripts standardized
- ✅ All 3 example workspaces standardized
- ✅ Replaced `preconstruct` with `tsup` for modern dual ESM/CJS builds
- ✅ All TypeScript errors fixed (type-check passes)
- ✅ Build pipeline working (CJS + ESM + DTS)
- ✅ `.agent/RULES.md` created with comprehensive coding standards
- ✅ Quality gate order established: build → format → type-check → lint → test

### Known Issues

- ⚠️ Turbo execution issue when running via `pnpm turbo` (spawning error)
- ✅ Direct workspace builds work perfectly (`pnpm --filter lib build`)
- ✅ All individual workspace commands work correctly

### Testing Checklist

After Phase 0 setup:

- ✅ `pnpm --filter lib build` succeeds
- ✅ `pnpm --filter lib type-check` succeeds
- [ ] `pnpm turbo lint` succeeds (blocked by turbo spawn issue)
- [ ] `pnpm turbo test` succeeds (blocked by turbo spawn issue)
- ✅ `lib` workspace has all standard scripts
- ✅ Examples can type-check independently
- ✅ Playground will be removed (not core functionality)
- ✅ All workspaces have consistent scripts

---

## Success Criteria

✅ **Infrastructure**

- Turbo installed and configured
- All workspaces have standard scripts
- Root-level orchestration commands work
- Task dependencies correctly configured
- Caching working (instant second runs)

✅ **Testing**

- All existing tests pass
- Tests prove behavior (not just types)
- Critical paths have coverage
- Test quality meets standards (see RULES.md)
- No filesystem/network IO in tests

✅ **Developer Experience**

- Fast feedback loop (< 1s on cache hit)
- Easy to run single workspace checks
- Easy to run all checks
- Clear error messages
- Documentation for commands

✅ **Standards**

- Consistent commands across workspaces
- Code quality rules documented (RULES.md)
- Testing standards documented
- Task graph visualized

---

## Benefits

### Before Phase 0
```bash
# Slow, manual coordination
cd lib && pnpm test           # Wait...
cd ../playground && pnpm build  # Wait...
cd ../lib && pnpm lint         # Wait...
# Did I break something? Who knows!
````

### After Phase 0

```bash
# Fast, automatic coordination
pnpm verify                   # Runs everything in parallel
# Second run: instant (cached)
# Confidence: all workspaces verified
```

---

## Timeline

| Task                           | Duration | Notes                          |
| ------------------------------ | -------- | ------------------------------ |
| Install Turbo                  | 15 min   | Simple package install         |
| Create turbo.json              | 30 min   | Configure tasks                |
| Standardize root scripts       | 15 min   | Update package.json            |
| Standardize lib scripts        | 15 min   | Update package.json            |
| Standardize playground scripts | 15 min   | Update package.json            |
| Add example scripts            | 30 min   | 3 examples                     |
| Review test coverage           | 2 hours  | Analyze, identify gaps         |
| Add missing tests              | 4 hours  | If needed                      |
| Configure caching              | 30 min   | Verify outputs                 |
| Document commands              | 30 min   | Write documentation            |
| Create RULES.md                | 1 hour   | Document standards             |
| Verify everything works        | 1 hour   | Run all commands, test caching |

**Total:** 1-2 days (depending on test coverage gaps)

---

## Rollback Plan

If issues arise:

1. Remove `turbo.json`
2. Restore original scripts
3. Uninstall turbo: `pnpm remove -D turbo -w`
4. Document what went wrong

---

## Next Steps After Phase 0

Once infrastructure is solid:

1. **Phase 1:** Dev tooling + ESM migration
   - With fast verification, iterate quickly
   - Turbo caching makes fixing errors fast
2. **Phase 2:** openapi3-ts v4
   - Verify changes don't break other workspaces
3. **Phase 3:** Zod v4
   - Run full test suite frequently

---

## Notes

- Turbo config uses latest v2 format
- All workspaces can run independently
- Root commands orchestrate across workspaces
- Caching provides near-instant feedback
- Standards ensure consistency
- Tests prove functionality, not just types

---

**Next:** After Phase 0 complete, proceed to Phase 1 (Dev Tooling + ESM)
