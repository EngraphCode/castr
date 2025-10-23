# Phase 1: Developer Tooling Modernization + ESM Migration

**Focus:** Infrastructure and tooling modernization  
**Type:** Foundation work  
**Estimated Time:** 3-4 days

---

## Objective

Modernize development environment by updating all tooling to latest stable versions, fixing ESM/module resolution issues, removing deprecated dependencies, eliminating security vulnerabilities, and cleaning up unnecessary type packages. This establishes a working, modern foundation before updating runtime dependencies.

## Scope

### In Scope ✅

- Update TypeScript, Prettier, Vitest, ESLint
- Migrate to ESM with proper module resolution
- Add `.js` extensions to all relative imports
- Fix `prettier.format()` async calls (Prettier 3.x)
- Fix `cac` import issues
- Fix `tanu` module path issues
- Remove unused variables
- Update GitHub Actions workflows (if needed)
- Update Node.js version requirements
- Remove @types packages where types are now built-in
- Replace deprecated dependencies
- Fix all security vulnerabilities

### Out of Scope ❌

- openapi3-ts (Phase 2)
- Zod (Phase 3)
- @zodios/core (Phase 3)
- Changes to library public API
- Changes to generated output (functionality must remain the same)

---

## Current State Analysis (October 2025)

### Outdated Dependencies (npm outdated output)

```
Package                       Current  Wanted  Latest
@changesets/changelog-github    0.4.8   0.4.8   0.5.1
conventional-changelog-cli      2.2.2   2.2.2   5.0.0
prettier                        2.8.8   2.8.8   3.6.2  ⚠️ BREAKING
typescript                      5.1.6   5.x     5.7.x
vitest                         0.22.1   0.x     2.1.x  ⚠️ BREAKING
eslint                         8.26.0   8.x     9.18.x ⚠️ BREAKING
```

### Security Vulnerabilities

Run audit to identify:

```bash
pnpm audit
# Document any HIGH or CRITICAL vulnerabilities found
```

### @types Packages to Review

Check which packages now have built-in types:

- `@types/node` - Still needed
- `@types/prettier` - May have built-in types in v3
- `@types/fs-extra` - Check if needed
- `@types/js-yaml` - Check if needed

### Node.js Version

- **Current:** `>=18.16.0`
- **Proposed:** `>=18.20.0` (LTS with security fixes)
- **Rationale:** 18.20.0 has important security and stability patches

---

## Detailed Implementation Plan

### Phase 1: Preparation & Research (2 hours)

#### Step 1.1: Audit Current State

```bash
cd /Users/jim/code/personal/openapi-zod-client

# Check all outdated dependencies
pnpm outdated --recursive

# Check for security vulnerabilities
pnpm audit

# Check dependency tree
pnpm list --depth=0

# Document findings in this plan
```

#### Step 1.2: Research Breaking Changes

Document breaking changes for:

- **Prettier 2 → 3:** [Migration guide](https://prettier.io/blog/2023/07/05/3.0.0.html)
    - Default formatting changes
    - Plugin API changes
    - Node.js 14+ required

- **Vitest 0.x → 2.x:** [Migration guide](https://vitest.dev/guide/migration.html)
    - Config API changes
    - Snapshot format updates
    - New test APIs

- **ESLint 8 → 9:** [Migration guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
    - Flat config (optional but recommended)
    - Rule updates
    - Plugin compatibility

- **TypeScript 5.1 → 5.7:**
    - Check for new strict checks
    - Performance improvements
    - New language features

#### Step 1.3: Check Built-in Types

```bash
# For each @types package, check if types are now built-in
npm info prettier types
npm info fs-extra types
npm info js-yaml types
```

**Decision Matrix:**

- If types are built-in → Remove @types package
- If @types is official → Keep it
- If unclear → Keep for safety, document for future

---

### Phase 2: Update Node.js Requirements (1 hour)

#### Step 2.1: Update Version Files

**Files to update:**

1. `.node-version`

    ```
    - 18.16.0
    + 18.20.0
    ```

2. `package.json` (root)

    ```json
    "engines": {
    -  "node": ">=18.16.0"
    +  "node": ">=18.20.0"
    }
    ```

3. `.github/workflows/ci.yml`

    ```yaml
    strategy:
      matrix:
    -   node-version: [16.x, 18.x, 20.x]
    +   node-version: [18.x, 20.x, 22.x]  # Remove 16, add 22
    ```

4. `.github/workflows/publish.yml`

    ```yaml
    - name: Setup Node.js 16.x
    + name: Setup Node.js 18.x
      uses: actions/setup-node@v4
      with:
    -   node-version: 16.x
    +   node-version: 18.x
    ```

5. `README.md` (Contributing section)
    - Update Node.js version requirement
    - Update any version-specific instructions

#### Step 2.2: Test Node Compatibility

```bash
# Test with Node 18.20
nvm use 18.20.0
pnpm install
pnpm test
pnpm build

# Test with Node 20
nvm use 20
pnpm install
pnpm test
pnpm build

# Test with Node 22 (latest LTS)
nvm use 22
pnpm install
pnpm test
pnpm build
```

---

### Phase 3: Update TypeScript (2 hours)

#### Step 3.1: Update Dependency

**Update in all package.json files:**

- `/package.json`
- `/lib/package.json`
- `/playground/package.json`
- `/examples/basic/package.json`
- `/examples/schemas-only/package.json`
- `/examples/export-schemas-and-types-directly/package.json`

```json
{
  "devDependencies": {
-   "typescript": "^5.1.6"
+   "typescript": "^5.7.2"
  }
}
```

#### Step 3.2: Update tsconfig.json

Review and update compiler options if beneficial:

```json
{
    "compilerOptions": {
        // Consider adding new TS 5.7 features
        "verbatimModuleSyntax": true // Better ES module support
        // Review if any new strict checks are useful
    }
}
```

**Files to update:**

- `/tsconfig.json`
- `/lib/tsconfig.json`
- `/playground/tsconfig.json`

#### Step 3.3: Test TypeScript

```bash
# Check types across all workspaces
pnpm -r run lint:ts

# If errors, fix them incrementally
cd lib && pnpm lint:ts
# Fix errors
cd ../playground && pnpm lint:ts
# Fix errors
```

#### Step 3.4: Update @types/node if Needed

```json
// lib/package.json
"devDependencies": {
  "@types/node": "^18.11.4"  // Update to match Node 18.20
}
```

---

### Phase 4: Update Prettier (2 hours)

⚠️ **This is a BREAKING change for Prettier itself but NOT for our library API**

#### Step 4.1: Update Dependency

**Update in all package.json files:**

- `/package.json`
- `/lib/package.json`
- `/playground/package.json`

```json
{
  "devDependencies": {
-   "prettier": "^2.7.1"
+   "prettier": "^3.6.2"
  }
}
```

#### Step 4.2: Check @types/prettier

```bash
npm info prettier types
# If prettier v3 has built-in types, remove @types/prettier
```

**If built-in types exist:**

```json
// lib/package.json
"devDependencies": {
- "@types/prettier": "^2.7.1"  // Remove if built-in
}
```

#### Step 4.3: Update .prettierrc

Review and update config for Prettier 3:

```json
{
    // Prettier 3 may have new defaults
    // Review: https://prettier.io/blog/2023/07/05/3.0.0.html
    // Update any plugin references if needed
}
```

#### Step 4.4: Run Prettier

```bash
# Install new version
pnpm install

# Format entire codebase
pnpm prettier --write "**/*.{ts,tsx,js,jsx,json,md,yaml,yml}"

# This will show formatting changes - review them!
git diff
```

#### Step 4.5: Commit Formatting Changes

**Separate commit for formatting:**

```bash
git add -A
git commit -m "style: reformat codebase with prettier 3.6"
```

This makes it easy to review the functional changes separately from formatting.

---

### Phase 5: Update Vitest (3 hours)

⚠️ **Major version update with breaking changes**

#### Step 5.1: Update Dependency

```json
// lib/package.json
{
  "devDependencies": {
-   "vitest": "^0.22.1"
+   "vitest": "^2.1.8"
  }
}
```

#### Step 5.2: Update vitest.config.ts

```typescript
// lib/vitest.config.ts
/// <reference types="vitest" />

import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        include: ["src/*.test.ts", "tests/*.test.ts"],
        snapshotFormat: {
            indent: 4,
            escapeString: false,
        },
        // Vitest 2.x may have new config options
        // Review: https://vitest.dev/guide/migration.html
    },
});
```

#### Step 5.3: Update Test Scripts

Check if test scripts need updates:

```json
// lib/package.json
{
    "scripts": {
        "test": "vitest",
        "test:ci": "vitest run"
        // These should still work, but verify
    }
}
```

#### Step 5.4: Run Tests

```bash
cd lib

# Run tests
pnpm test

# Expected outcomes:
# - Tests should pass
# - Snapshots may need updating (review carefully!)
# - Check for deprecation warnings
```

#### Step 5.5: Update Snapshots (If Needed)

```bash
# ONLY after manually reviewing changes
pnpm test -u

# Review each snapshot change
git diff

# If snapshot format changed, this is expected
# If test logic changed, investigate why
```

---

### Phase 6: Update ESLint (3 hours)

⚠️ **Major version update with breaking changes**

#### Step 6.1: Research Plugin Compatibility

Check if current plugins support ESLint 9:

- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`
- Any custom ESLint plugins

#### Step 6.2: Update Dependencies

```json
// lib/package.json
{
  "devDependencies": {
-   "eslint": "^8.26.0",
+   "eslint": "^9.18.0",
-   "@typescript-eslint/eslint-plugin": "^5.40.1",
+   "@typescript-eslint/eslint-plugin": "^8.15.0",
-   "@typescript-eslint/parser": "^5.40.1"
+   "@typescript-eslint/parser": "^8.15.0"
  }
}
```

#### Step 6.3: Update ESLint Config

**Option A: Keep existing config (easier)**

```javascript
// .eslintrc.build.js (if exists)
// Update rules for ESLint 9 compatibility
// Fix any deprecated rules
```

**Option B: Migrate to Flat Config (optional, future-proof)**

```javascript
// eslint.config.js
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsparser,
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            // Migrate rules
        },
    },
];
```

**Recommendation:** Start with Option A, document Option B for future

#### Step 6.4: Run ESLint

```bash
cd lib

# Run linter
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Review and fix remaining issues
```

#### Step 6.5: Fix Lint Errors

Common ESLint 9 changes:

- Some rules renamed
- Some rules deprecated
- New recommended rules

**Strategy:**

1. Fix critical errors first
2. Update/disable deprecated rules
3. Address new warnings
4. Document any intentional eslint-disable comments

---

### Phase 7: Update Build Tools (2 hours)

#### Step 7.1: Update Preconstruct

```json
// package.json (root)
{
  "devDependencies": {
-   "@preconstruct/cli": "^2.2.1"
+   "@preconstruct/cli": "^2.8.9"  // Check latest
  }
}
```

Test build:

```bash
pnpm build

# Verify output in lib/dist
ls -la lib/dist
```

#### Step 7.2: Update tsx

```json
// package.json (root)
{
  "devDependencies": {
-   "tsx": "^3.11.0"
+   "tsx": "^4.19.2"  // Already at ^4, just update minor
  }
}
```

Test:

```bash
tsx ./lib/samples-generator.ts
```

#### Step 7.3: Update pnpm

```json
// package.json (root)
{
    "packageManager": "pnpm@10.19.0" // Already latest
}
```

#### Step 7.4: Update Babel (if needed)

```json
// package.json (root)
{
    "dependencies": {
        "@babel/core": "^7.26.0",
        "@babel/preset-env": "^7.26.0",
        "@babel/preset-typescript": "^7.26.0"
    }
}
```

---

### Phase 8: Update Changesets (1 hour)

#### Step 8.1: Update Dependencies

```json
// package.json (root)
{
  "devDependencies": {
-   "@changesets/changelog-github": "^0.4.8",
+   "@changesets/changelog-github": "^0.5.1",
-   "@changesets/cli": "^2.26.0"
+   "@changesets/cli": "^2.27.11"  // Check latest
  }
}
```

#### Step 8.2: Update conventional-changelog (Optional)

```json
{
  "devDependencies": {
-   "conventional-changelog-cli": "^2.2.2",
+   "conventional-changelog-cli": "^5.0.0"
  }
}
```

⚠️ **Note:** This is a major version bump. Check if script needs updates:

```json
"scripts": {
  "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
  // May need parameter changes for v5
}
```

#### Step 8.3: Test Changesets

```bash
# Create a test changeset
pnpm changeset

# Verify it works
# Delete the test changeset
rm .changeset/<test-changeset-file>.md
```

---

### Phase 9: Update GitHub Actions (1 hour)

#### Step 9.1: Update Action Versions

**File:** `.github/workflows/ci.yml`

```yaml
- name: Checkout repository
- uses: actions/checkout@v3
+ uses: actions/checkout@v4

- name: Install pnpm
- uses: pnpm/action-setup@v2
+ uses: pnpm/action-setup@v4
  with:
-   version: 8
+   version: 10

- name: Use Node.js ${{ matrix.node-version }}
- uses: actions/setup-node@v3
+ uses: actions/setup-node@v4
```

**File:** `.github/workflows/publish.yml`

```yaml
- uses: actions/checkout@v3
+ uses: actions/checkout@v4

- uses: actions/setup-node@v3
+ uses: actions/setup-node@v4

- uses: pnpm/action-setup@v2
+ uses: pnpm/action-setup@v4

- uses: changesets/action@v1
+ uses: changesets/action@v2  # If available, check compatibility
```

#### Step 9.2: Update Node Matrix

```yaml
# .github/workflows/ci.yml
strategy:
  matrix:
-   node-version: [16.x, 18.x, 20.x]
+   node-version: [18.x, 20.x, 22.x]
```

#### Step 9.3: Test Workflows Locally

```bash
# Install act (if not installed)
# brew install act

# Test CI workflow
act -j build

# Or just push to a test branch and watch GitHub Actions
```

---

### Phase 10: Remove Unnecessary @types Packages (1 hour)

#### Step 10.1: Check Each @types Package

```bash
# For each @types package, determine if still needed

# @types/node - KEEP (always needed for Node APIs)
# @types/prettier - CHECK if prettier v3 has built-in types
# @types/fs-extra - CHECK
# @types/js-yaml - CHECK
# @types/react - KEEP (needed by playground)
# @types/react-dom - KEEP
# @types/degit - KEEP or CHECK
```

#### Step 10.2: Test Removal

For each package you want to remove:

```bash
# Remove from package.json
# Run TypeScript compilation
pnpm -r run lint:ts

# If no errors, package can be removed
# If errors, keep the package
```

#### Step 10.3: Document Decisions

Create a table in commit message:

```
@types Package Status:
- @types/node: KEPT (required for Node.js APIs)
- @types/prettier: REMOVED (built-in types in v3)
- @types/fs-extra: KEPT (no built-in types)
- @types/js-yaml: KEPT (no built-in types)
```

---

### Phase 11: Security Fixes (2 hours)

#### Step 11.1: Run Security Audit

```bash
pnpm audit

# Document all vulnerabilities
# Create list of packages to update
```

#### Step 11.2: Fix Vulnerabilities

**Strategy:**

1. **Automatic fixes:**

    ```bash
    pnpm audit --fix
    ```

2. **Manual updates for remaining issues:**
    - Update vulnerable packages to safe versions
    - If no safe version, consider alternatives
    - Document any unfixable vulnerabilities

#### Step 11.3: Verify Fixes

```bash
# Run audit again
pnpm audit

# Should show 0 vulnerabilities (or only low/moderate)

# Run tests
pnpm test

# Build project
pnpm build
```

---

### Phase 12: Comprehensive Testing (3 hours)

#### Step 12.1: Unit Tests

```bash
cd lib

# Run all tests
pnpm test

# Should see:
# ✓ All tests pass
# ✓ No deprecation warnings
# ✓ No unexpected snapshot changes
```

#### Step 12.2: Build Test

```bash
# Root directory
pnpm build

# Verify build outputs
ls -la lib/dist

# Check for:
# ✓ .cjs.js files
# ✓ .esm.js files
# ✓ .d.ts files
```

#### Step 12.3: Example Tests

```bash
cd examples/basic
pnpm install
pnpm gen:basic

# Verify petstore-client.ts generated correctly
# Compare with previous version (should be identical)

cd ../schemas-only
pnpm gen:schemas-only

# Verify output matches expected
```

#### Step 12.4: Playground Test

```bash
cd playground
pnpm install
pnpm build

# Should build without errors

# Optional: Test dev server
pnpm dev
# Open browser, test functionality
```

#### Step 12.5: Linting Test

```bash
cd lib
pnpm lint

# Should pass with no errors
```

#### Step 12.6: Type Checking

```bash
pnpm -r run lint:ts

# All workspaces should have no type errors
```

---

### Phase 13: Documentation (2 hours)

#### Step 13.1: Update README.md

**Contributing Section:**

````markdown
## Contributing:

- A `.node-version` file has been provided in the repository root,
- use your preferred Node.js manager which supports the standard
- to manage the development Node.js environment
- **Required:** Node.js 18.20.0 or later
- The monorepo supports corepack, follow the linked instructions
  to locally install the development package manager (i.e. pnpm)

```bash
> pnpm install
> pnpm test
```
````

**Development:**

- TypeScript 5.7+
- Prettier 3.6+
- ESLint 9.x
- Vitest 2.x

Assuming no issues were raised by the tests, you may use `pnpm dev`
to watch for code changes during development.

````

#### Step 13.2: Update CHANGELOG.md (via changeset)

This will be automated by changesets, but prepare content.

#### Step 13.3: Create Changeset

```bash
pnpm changeset

# Select: openapi-zod-client
# Type: patch
# Summary:
````

**Changeset content:**

```markdown
---
"openapi-zod-client": patch
---

Modernize developer tooling and fix security vulnerabilities

**Updated Dependencies:**

- TypeScript: 5.1 → 5.7
- Prettier: 2.7 → 3.6 (formatting changes)
- Vitest: 0.22 → 2.1
- ESLint: 8.26 → 9.18
- @changesets/changelog-github: 0.4.8 → 0.5.1
- conventional-changelog-cli: 2.2.2 → 5.0.0
- Node.js requirement: 18.16+ → 18.20+

**Improvements:**

- Updated GitHub Actions to latest versions
- Removed unnecessary @types packages
- Fixed all security vulnerabilities
- Improved CI/CD performance
- Better TypeScript type checking

**Note:** No changes to library API or generated output.
This is purely internal tooling improvements.
```

---

### Phase 14: Commit Strategy

Create focused, atomic commits after each logical group of changes is complete and tested:

```bash
# Commit 1: Node.js version
git add .node-version package.json .github/ README.md
git commit -m "chore: update Node.js requirement to 18.20+"

# Commit 2: TypeScript
git add package.json lib/package.json playground/package.json examples/
git commit -m "chore: update TypeScript to 5.7"

# Commit 3: Prettier (separate from formatting)
git add package.json lib/package.json playground/package.json
git commit -m "chore: update Prettier to 3.6"

# Commit 4: Prettier formatting
git add -A
git commit -m "style: reformat codebase with Prettier 3.6"

# Commit 5: Vitest
git add lib/package.json lib/vitest.config.ts
git commit -m "chore: update Vitest to 2.1"

# Commit 6: ESLint
git add lib/package.json .eslintrc* eslint.config.js
git commit -m "chore: update ESLint to 9.18"

# Commit 7: Build tools
git add package.json
git commit -m "chore: update build tools (preconstruct, babel)"

# Commit 8: Changesets
git add package.json
git commit -m "chore: update changesets tooling"

# Commit 9: GitHub Actions
git add .github/workflows/
git commit -m "ci: update GitHub Actions to latest versions"

# Commit 10: Remove @types
git add package.json lib/package.json
git commit -m "chore: remove unnecessary @types packages"

# Commit 11: Security fixes
git add package.json lib/package.json pnpm-lock.yaml
git commit -m "fix: resolve security vulnerabilities"

# Commit 12: Documentation
git add README.md
git commit -m "docs: update Node.js and tooling requirements"

```

**Note:** We're not creating changesets since this is not going to upstream. Focus on clean, logical commits that document the changes clearly.

---

## Testing Checklist

Before considering Phase 1 complete:

- [ ] All tests pass: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] Linting passes: `cd lib && pnpm lint`
- [ ] Type checking passes: `cd lib && pnpm lint:ts`
- [ ] Examples generate: `cd examples/basic && pnpm gen:basic`
- [ ] Playground builds: `cd playground && pnpm build`
- [ ] No security vulnerabilities: `pnpm audit`
- [ ] Generated output works correctly
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All files properly formatted

---

## Success Criteria

✅ **Dependencies**

- All dev dependencies updated to latest stable
- No security vulnerabilities
- Unnecessary @types removed

✅ **Code Quality**

- All tests pass
- ESLint passes with no errors
- TypeScript compiles with no errors
- Prettier formatted
- No unused variables or imports

✅ **Functionality**

- Generated output works correctly
- Examples work
- Playground works
- CLI works
- Build produces valid output

✅ **ESM/Module Resolution**

- All relative imports have `.js` extensions
- Module resolution works with NodeNext
- No module resolution errors
- Proper ESM/CJS interop

✅ **Code Fixes**

- `prettier.format()` async calls fixed
- `cac` import issues resolved
- `tanu` module path issues resolved
- All implicit `any` types fixed

---

## Risks & Mitigation

| Risk                                  | Probability | Impact | Mitigation                            |
| ------------------------------------- | ----------- | ------ | ------------------------------------- |
| Prettier formatting causes large diff | High        | Low    | Separate commit, easy to review       |
| Vitest snapshots need updates         | Medium      | Low    | Careful review before updating        |
| ESLint new rules cause errors         | Medium      | Medium | Incremental fixes, document decisions |
| Breaking change in tool APIs          | Low         | High   | Comprehensive testing                 |
| Security fix breaks functionality     | Low         | High   | Test thoroughly                       |

---

## Rollback Plan

If issues are discovered after merge:

1. **Revert the entire PR:**

    ```bash
    git revert <merge-commit-sha>
    ```

2. **Fix specific issue:**
    - Identify problematic commit
    - Revert just that commit
    - Fix and re-apply

3. **Hot fix:**
    - Create patch PR with fix
    - Fast-track review and merge

---

## Post-Phase Tasks

After Phase 1 is complete:

1. **Verify Everything Works:**
    - Run full test suite
    - Generate examples
    - Build playground
    - Test CLI

2. **Prepare for Phase 2:**
    - Document any issues found
    - Clean working directory
    - Commit all changes

3. **Begin Phase 2:**
    - Start openapi3-ts v4 update

---

## Timeline

| Phase          | Duration | Cumulative |
| -------------- | -------- | ---------- |
| Preparation    | 2h       | 2h         |
| Node.js        | 1h       | 3h         |
| TypeScript     | 2h       | 5h         |
| Prettier       | 2h       | 7h         |
| Vitest         | 3h       | 10h        |
| ESLint         | 3h       | 13h        |
| Build Tools    | 2h       | 15h        |
| Changesets     | 1h       | 16h        |
| GitHub Actions | 1h       | 17h        |
| @types Removal | 1h       | 18h        |
| Security Fixes | 2h       | 20h        |
| Testing        | 3h       | 23h        |
| Documentation  | 2h       | 25h        |
| Commits        | 1h       | 26h        |
| ESM Extensions | 3h       | 29h        |

**Total:** ~29 hours = 3-4 days

---

### Phase 15: Add `.js` Extensions to ESM Imports (3 hours)

⚠️ **Required for ESM compliance with `moduleResolution: "NodeNext"`**

#### Background

With `module: "NodeNext"` and `moduleResolution: "NodeNext"`, TypeScript enforces ESM standards which require explicit file extensions for relative imports. All relative imports must use `.js` extensions (even though the source files are `.ts`) because the extensions refer to the compiled output files.

#### Step 15.1: Update `tsconfig.json`

Verify the configuration that requires explicit extensions:

```json
// lib/tsconfig.json
{
    "compilerOptions": {
        "module": "NodeNext",
        "moduleResolution": "NodeNext"
        // These settings require .js extensions on relative imports
    }
}
```

#### Step 15.2: Update Source Files

Update all relative imports to include `.js` extensions. Below is the complete list of every line that needs to be changed:

---

**File: `lib/src/template-context.ts`**

Line 6:

```typescript
- import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
+ import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph.js";
```

Line 8:

```typescript
- import { getZodiosEndpointDefinitionList } from "./getZodiosEndpointDefinitionList";
+ import { getZodiosEndpointDefinitionList } from "./getZodiosEndpointDefinitionList.js";
```

Line 10:

```typescript
- import { getTypescriptFromOpenApi } from "./openApiToTypescript";
+ import { getTypescriptFromOpenApi } from "./openApiToTypescript.js";
```

Line 11:

```typescript
- import { getZodSchema } from "./openApiToZod";
+ import { getZodSchema } from "./openApiToZod.js";
```

Line 12:

```typescript
- import { topologicalSort } from "./topologicalSort";
+ import { topologicalSort } from "./topologicalSort.js";
```

Line 13:

```typescript
- import { asComponentSchema, normalizeString } from "./utils";
+ import { asComponentSchema, normalizeString } from "./utils.js";
```

---

**File: `lib/src/CodeMeta.ts`**

Line 3:

```typescript
- import { isReferenceObject } from "./isReferenceObject";
+ import { isReferenceObject } from "./isReferenceObject.js";
```

Line 5:

```typescript
- import { getSchemaComplexity } from "./schema-complexity";
+ import { getSchemaComplexity } from "./schema-complexity.js";
```

---

**File: `lib/src/makeSchemaResolver.ts`**

Line 4:

```typescript
- import { normalizeString } from "./utils";
+ import { normalizeString } from "./utils.js";
```

---

**File: `lib/src/openApiToZod.ts`**

Line 5:

```typescript
- import { CodeMeta } from "./CodeMeta";
+ import { CodeMeta } from "./CodeMeta.js";
```

Line 6:

```typescript
- import { isReferenceObject } from "./isReferenceObject";
+ import { isReferenceObject } from "./isReferenceObject.js";
```

Line 8:

```typescript
- import { escapeControlCharacters, isPrimitiveType, wrapWithQuotesIfNeeded } from "./utils";
+ import { escapeControlCharacters, isPrimitiveType, wrapWithQuotesIfNeeded } from "./utils.js";
```

Line 9:

```typescript
- import { inferRequiredSchema } from "./inferRequiredOnly";
+ import { inferRequiredSchema } from "./inferRequiredOnly.js";
```

---

**File: `lib/src/schema-complexity.ts`**

Line 5:

```typescript
- import { isReferenceObject } from "./isReferenceObject";
+ import { isReferenceObject } from "./isReferenceObject.js";
```

Line 7:

```typescript
- import { isPrimitiveType } from "./utils";
+ import { isPrimitiveType } from "./utils.js";
```

---

**File: `lib/src/schema-complexity.test.ts`**

Line 4:

```typescript
- import { getSchemaComplexity } from "./schema-complexity";
+ import { getSchemaComplexity } from "./schema-complexity.js";
```

---

**File: `lib/src/openApiToZod.test.ts`**

Line 3:

```typescript
- import { getZodSchema } from "./openApiToZod";
+ import { getZodSchema } from "./openApiToZod.js";
```

Line 5:

```typescript
- import { makeSchemaResolver } from "./makeSchemaResolver";
+ import { makeSchemaResolver } from "./makeSchemaResolver.js";
```

Line 6:

```typescript
- import { asComponentSchema } from "./utils";
+ import { asComponentSchema } from "./utils.js";
```

---

**File: `lib/src/openApiToTypescript.ts`**

Line 5:

```typescript
- import { isReferenceObject } from "./isReferenceObject";
+ import { isReferenceObject } from "./isReferenceObject.js";
```

Line 8:

```typescript
- import { wrapWithQuotesIfNeeded } from "./utils";
+ import { wrapWithQuotesIfNeeded } from "./utils.js";
```

Line 9:

```typescript
- import { inferRequiredSchema } from "./inferRequiredOnly";
+ import { inferRequiredSchema } from "./inferRequiredOnly.js";
```

Line 10:

```typescript
- import generateJSDocArray from "./generateJSDocArray";
+ import generateJSDocArray from "./generateJSDocArray.js";
```

---

**File: `lib/src/openApiToTypescript.test.ts`**

Line 1:

```typescript
- import {getTypescriptFromOpenApi, TsConversionContext} from "./openApiToTypescript";
+ import {getTypescriptFromOpenApi, TsConversionContext} from "./openApiToTypescript.js";
```

Line 6:

```typescript
- import {makeSchemaResolver} from "./makeSchemaResolver";
+ import {makeSchemaResolver} from "./makeSchemaResolver.js";
```

Line 7:

```typescript
- import {asComponentSchema} from "./utils";
+ import {asComponentSchema} from "./utils.js";
```

---

**File: `lib/src/inferRequiredOnly.ts`**

Line 2:

```typescript
- import type { DocumentResolver } from "./makeSchemaResolver";
+ import type { DocumentResolver } from "./makeSchemaResolver.js";
```

---

**File: `lib/src/getZodiosEndpointDefinitionList.ts`**

Line 17:

```typescript
- import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
+ import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph.js";
```

Line 18:

```typescript
- import { isReferenceObject } from "./isReferenceObject";
+ import { isReferenceObject } from "./isReferenceObject.js";
```

Line 19:

```typescript
- import { makeSchemaResolver } from "./makeSchemaResolver";
+ import { makeSchemaResolver } from "./makeSchemaResolver.js";
```

Line 20:

```typescript
- import { getZodChain, getZodSchema } from "./openApiToZod";
+ import { getZodChain, getZodSchema } from "./openApiToZod.js";
```

Line 21:

```typescript
- import { getSchemaComplexity } from "./schema-complexity";
+ import { getSchemaComplexity } from "./schema-complexity.js";
```

---

**File: `lib/src/getZodiosEndpointDefinitionList.test.ts`**

Line 4:

```typescript
- import { getZodiosEndpointDefinitionList } from "./getZodiosEndpointDefinitionList";
+ import { getZodiosEndpointDefinitionList } from "./getZodiosEndpointDefinitionList.js";
```

---

**File: `lib/src/getOpenApiDependencyGraph.ts`**

Line 3:

```typescript
- import { isReferenceObject } from "./isReferenceObject";
+ import { isReferenceObject } from "./isReferenceObject.js";
```

---

**File: `lib/src/getOpenApiDependencyGraph.test.ts`**

Line 5:

```typescript
- import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
+ import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph.js";
```

Line 6:

```typescript
- import { topologicalSort } from "./topologicalSort";
+ import { topologicalSort } from "./topologicalSort.js";
```

Line 7:

```typescript
- import { asComponentSchema } from "./utils";
+ import { asComponentSchema } from "./utils.js";
```

---

**File: `lib/src/generateZodClientFromOpenAPI.ts`**

Line 8:

```typescript
- import { getHandlebars } from "./getHandlebars";
+ import { getHandlebars } from "./getHandlebars.js";
```

Line 9:

```typescript
- import { maybePretty } from "./maybePretty";
+ import { maybePretty } from "./maybePretty.js";
```

Line 11:

```typescript
- import { getZodClientTemplateContext } from "./template-context";
+ import { getZodClientTemplateContext } from "./template-context.js";
```

---

**File: `lib/src/generateZodClientFromOpenAPI.test.ts`**

Line 4:

```typescript
- import { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI";
+ import { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI.js";
```

Line 5:

```typescript
- import { getZodClientTemplateContext } from "./template-context";
+ import { getZodClientTemplateContext } from "./template-context.js";
```

Line 6:

```typescript
- import { pathToVariableName } from "./utils";
+ import { pathToVariableName } from "./utils.js";
```

---

**File: `lib/src/cli.ts`**

Line 10:

```typescript
- import { toBoolean } from "./utils";
+ import { toBoolean } from "./utils.js";
```

Line 11:

```typescript
- import { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI";
+ import { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI.js";
```

---

**File: `lib/src/index.ts`**

Line 1:

```typescript
- export { type CodeMeta, type CodeMetaData, type ConversionTypeContext } from "./CodeMeta";
+ export { type CodeMeta, type CodeMetaData, type ConversionTypeContext } from "./CodeMeta.js";
```

Line 2:

```typescript
- export { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI";
+ export { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI.js";
```

Line 3:

```typescript
- export { getHandlebars } from "./getHandlebars";
+ export { getHandlebars } from "./getHandlebars.js";
```

Line 4:

```typescript
- export { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
+ export { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph.js";
```

Line 5:

```typescript
- export { type EndpointDefinitionWithRefs, getZodiosEndpointDefinitionList } from "./getZodiosEndpointDefinitionList";
+ export { type EndpointDefinitionWithRefs, getZodiosEndpointDefinitionList } from "./getZodiosEndpointDefinitionList.js";
```

Line 6:

```typescript
- export { maybePretty } from "./maybePretty";
+ export { maybePretty } from "./maybePretty.js";
```

Line 7:

```typescript
- export { getZodSchema } from "./openApiToZod";
+ export { getZodSchema } from "./openApiToZod.js";
```

Line 8:

```typescript
- export { type TemplateContext, type TemplateContextOptions, getZodClientTemplateContext } from "./template-context";
+ export { type TemplateContext, type TemplateContextOptions, getZodClientTemplateContext } from "./template-context.js";
```

---

**File: `lib/src/templates/default.hbs`**

Line 6:

```handlebars
- import { {{{@key}}} } from "./{{{this}}}" + import { {{{@key}}} } from "./{{{this}}}.js"
```

---

**File: `lib/src/templates/grouped-index.hbs`**

Line 2:

```handlebars
- export { {{{@key}}} } from "./{{{this}}}"; + export { {{{@key}}} } from "./{{{this}}}.js";
```

---

#### Step 15.3: Type-Only Imports

Note that type-only imports (`import type`) also need `.js` extensions because TypeScript doesn't distinguish between type and value imports when resolving module paths.

All `import type` statements with relative paths have been included in the changes above.

---

#### Step 15.4: Verify Changes

```bash
cd lib

# Run TypeScript compiler - should have no module resolution errors
pnpm lint:ts

# Should output:
# No errors
```

---

#### Step 15.5: Test the Changes

```bash
# Run all tests
pnpm test

# Run linter
pnpm lint

# Build the project
pnpm build

# Verify the built output works
cd ../examples/basic
pnpm gen:basic
```

---

#### Step 15.6: Commit Changes

```bash
git add lib/src/
git commit -m "refactor: add .js extensions to ESM imports for NodeNext module resolution

- Add .js extensions to all relative imports in lib/src
- Required for ESM compliance with moduleResolution: NodeNext
- Update Handlebars templates to generate .js extensions
- No functional changes, purely module resolution compliance

This ensures TypeScript can resolve modules correctly with the
NodeNext module resolution strategy, which enforces ESM standards
requiring explicit file extensions for relative imports."
```

---

#### Summary

**Total Files Modified:** 19 files  
**Total Lines Modified:** 47 import/export statements

**Files:**

- `lib/src/template-context.ts` (7 imports)
- `lib/src/CodeMeta.ts` (2 imports)
- `lib/src/makeSchemaResolver.ts` (1 import)
- `lib/src/openApiToZod.ts` (4 imports)
- `lib/src/schema-complexity.ts` (2 imports)
- `lib/src/schema-complexity.test.ts` (1 import)
- `lib/src/openApiToZod.test.ts` (3 imports)
- `lib/src/openApiToTypescript.ts` (4 imports)
- `lib/src/openApiToTypescript.test.ts` (3 imports)
- `lib/src/inferRequiredOnly.ts` (1 import)
- `lib/src/getZodiosEndpointDefinitionList.ts` (5 imports)
- `lib/src/getZodiosEndpointDefinitionList.test.ts` (1 import)
- `lib/src/getOpenApiDependencyGraph.ts` (1 import)
- `lib/src/getOpenApiDependencyGraph.test.ts` (3 imports)
- `lib/src/generateZodClientFromOpenAPI.ts` (3 imports)
- `lib/src/generateZodClientFromOpenAPI.test.ts` (3 imports)
- `lib/src/cli.ts` (2 imports)
- `lib/src/index.ts` (8 exports)
- `lib/src/templates/default.hbs` (1 import)
- `lib/src/templates/grouped-index.hbs` (1 export)

**External imports (no changes needed):**

- `node:*` imports - built-in Node.js modules
- `openapi3-ts` - npm package
- `pastable` - npm package
- `tanu` - npm package
- `ts-pattern` - npm package
- `whence` - npm package
- `@zodios/core` - npm package
- `zod` - npm package
- `vitest` - npm package
- `prettier` - npm package
- `handlebars` - npm package
- `@apidevtools/swagger-parser` - npm package
- `cac` - npm package
- `openapi-types` - npm package

---

## Notes

- This phase establishes a clean baseline for Phases 2 and 3
- No changes to library API or generated output functionality
- All changes are internal improvements and fixes
- Heavy focus on fixing all errors and warnings
- All code must work before moving to next phase

---

## Current Status

**Phase 1a: COMPLETED** ✅  
**Phase 1b: IN PROGRESS** 🔧

### Phase 1a: Tooling & Type Safety ✅

**Completed Tasks:**

- ✅ Turborepo v2.5.8 configured with task pipeline
- ✅ tsup v8.5.0 installed (replaced preconstruct)
- ✅ TypeScript updated to NodeNext module resolution
- ✅ ESLint v9 flat config implemented (lib)
- ✅ All ESLint plugins updated to latest versions
- ✅ Prettier v3.6.2 (async format() calls fixed)
- ✅ Vitest v3.2.4
- ✅ `.js` extensions added to all 18 files in `lib/src/`
- ✅ `lib/package.json` configured as ESM (`"type": "module"`)
- ✅ `bin.cjs` created for CLI entry point (CJS shim)
- ✅ `cli.ts` cac import fixed (`import { cac }`)
- ✅ `maybePretty.ts` made async (Prettier 3.x requirement)
- ✅ `openApiToTypescript.ts` tanu imports fixed (use `t.TypeDefinition`)
- ✅ `openApiToZod.ts` unused variable removed
- ✅ `samples-generator.ts` unused code removed
- ✅ All TypeScript errors fixed (type-check passes with 0 errors)
- ✅ Build succeeds (CJS + ESM + DTS with tsup)
- ✅ Workspace scripts standardized (lib, 3 examples)
- ✅ Playground removed (not core functionality)
- ✅ `.agent/RULES.md` created with comprehensive standards

**Build System Changes:**

- ✅ Replaced `preconstruct` with `tsup`
- ✅ Dual ESM/CJS output working
- ✅ DTS generation working
- ✅ Proper `exports` field in package.json
- ✅ CLI entry point via `bin.cjs`

---

### Phase 1b: Test Suite & Verification 🔧

**CRITICAL BLOCKERS before Phase 2:**

#### 1. Test Suite Validation ⚠️ HIGH PRIORITY

**Current State:** Unknown - tests not yet run after ESM migration

**Required Actions:**

```bash
# Run in lib workspace
pnpm test

# Expected issues:
# - Import path errors (.js extensions)
# - ESM/CJS compatibility issues
# - Snapshot mismatches
# - Async/await issues from prettier changes
# - Type assertion issues from tanu changes
```

**Must achieve:**

- [ ] All 68 test files pass
- [ ] No skipped tests
- [ ] No test errors
- [ ] Snapshots valid and up-to-date
- [ ] Tests prove functionality (per RULES.md)

---

#### 2. Example Validation ⚠️ HIGH PRIORITY

**Current State:** Examples have standardized scripts but not verified

**Required Actions:**

```bash
# Test each example
cd examples/basic && pnpm gen:basic
cd examples/schemas-only && pnpm gen:schemas-only
cd examples/export-schemas-and-types-directly && pnpm gen:schemas-directly

# Verify:
# 1. Generation completes without errors
# 2. Output files are created
# 3. Generated code passes type-check
# 4. Generated schemas are valid Zod
```

**Must achieve:**

- [ ] All 3 examples generate successfully
- [ ] Generated code is syntactically valid
- [ ] Generated TypeScript compiles
- [ ] No runtime errors in generated code

---

#### 3. Dependency Audit ⚠️ REQUIRED

**Current State:** Some deps updated, full audit not run

**Required Actions:**

```bash
# Check for outdated dependencies
pnpm -r outdated

# Check for security vulnerabilities
pnpm audit

# Update any outdated dependencies
# Fix any security issues
```

**Must achieve:**

- [ ] `pnpm -r outdated` shows no updates available
- [ ] `pnpm audit` shows 0 vulnerabilities
- [ ] No deprecated packages in use
- [ ] All dev dependencies at latest stable

---

#### 4. Functional Verification ⚠️ REQUIRED

**Current State:** Build works, but end-to-end not tested

**Required Actions:**

```bash
# Build and test CLI
pnpm --filter lib build
./lib/bin.cjs --help

# Test with sample OpenAPI spec
./lib/bin.cjs examples/petstore.yaml -o /tmp/test-output.ts

# Verify:
# 1. CLI runs without errors
# 2. Output is valid TypeScript
# 3. Generated schemas validate correctly
# 4. No runtime errors
```

**Must achieve:**

- [ ] CLI executable works
- [ ] Can process OpenAPI 3.0 specs
- [ ] Generated output is valid and usable
- [ ] No runtime errors or crashes

---

### Turbo Issue (Known, Non-Blocking)

- ⚠️ `pnpm turbo build` has spawn error
- ✅ Direct commands work: `pnpm --filter lib build`
- ✅ Workaround: Use direct workspace commands
- 📝 Can be investigated after Phase 1b complete

---

### Phase 1b Success Criteria

**Phase 1b is complete when:**

1. ✅ All tests pass (`pnpm test` in lib workspace)
2. ✅ All examples generate correctly
3. ✅ `pnpm audit` shows 0 vulnerabilities
4. ✅ `pnpm -r outdated` shows no updates (or only minor/patch)
5. ✅ CLI works end-to-end with sample specs
6. ✅ Generated code validates runtime data correctly
7. ✅ No TypeScript errors
8. ✅ No ESLint errors
9. ✅ All code formatted with Prettier

**Only then** can we safely proceed to Phase 2 (openapi3-ts v4)

---

**Next Steps:** Complete remaining fixes in Phase 1, then move to Phase 2 (openapi3-ts v4)
