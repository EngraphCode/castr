# Plan 02: openapi3-ts v4 Upgrade

**PR Title:** `feat!: upgrade openapi3-ts to v4 (targeting OAS 3.1)`

**Type:** `major` (breaking change → v2.0.0)  
**Branch:** `feat/openapi3-ts-v4`  
**Depends On:** Plan 01 (developer tooling modernization)  
**Estimated Time:** 2-3 days

---

## Objective

Upgrade `openapi3-ts` from v3.1.0 to v4.x, which explicitly separates OpenAPI 3.0 and 3.1 support. We'll target OAS 3.1 (latest specification) while maintaining runtime support for both OAS 3.0 and 3.1 specs.

## Breaking Change Justification

This **IS** a breaking change because:

1. **TypeScript imports change:**

    ```typescript
    // Before (v1.x)
    import { OpenAPIObject } from "openapi3-ts";

    // After (v2.x)
    import { OpenAPIObject } from "openapi3-ts/oas31";
    ```

2. **Users who programmatically use the library** will need to update their imports

3. **Type incompatibility** prevents backward compatibility - cannot support both v3 and v4 simultaneously

4. **This follows semantic versioning** - breaking change requires major version bump

## User Impact Assessment

### Affected Users

-   ✅ **CLI users:** NOT affected (no code changes needed)
-   ⚠️ **Programmatic users:** Must update imports (1 line per file)
-   ⚠️ **Users importing OpenAPIObject** from openapi3-ts: Must update

### NOT Affected

-   Generated output (no changes)
-   Runtime behavior (still supports both OAS 3.0 and 3.1)
-   CLI usage
-   Configuration
-   Templates

### Migration Effort

**Estimated:** 1-2 minutes per file that imports OpenAPIObject

---

## Scope

### In Scope ✅

-   Update openapi3-ts dependency to v4.x
-   Update all import statements (20+ files)
-   Implement/update utility functions (isSchemaObject, isReferenceObject)
-   Update type usage across codebase
-   Update examples
-   Write migration guide
-   Update documentation

### Out of Scope ❌

-   Zod (Plan 03)
-   @zodios/core (Plan 03)
-   Changes to generated output
-   Runtime behavior changes
-   New features

---

## Current State Analysis

### Dependency Versions (October 2025)

```json
{
    "lib/package.json": {
        "openapi3-ts": "3.1.0" // ❌ Exact version, no caret
    },
    "examples/basic/package.json": {
        "openapi3-ts": "3.0.2" // ❌ Different version!
    },
    "examples/*/package.json": {
        "openapi3-ts": "3.0.2" // ❌ Also old
    }
}
```

### Files Importing from openapi3-ts

**Source files (20):**

1. `lib/src/CodeMeta.ts`
2. `lib/src/makeSchemaResolver.ts`
3. `lib/src/openApiToZod.ts`
4. `lib/src/schema-complexity.ts`
5. `lib/src/utils.ts`
6. `lib/src/template-context.ts`
7. `lib/src/openApiToTypescript.ts`
8. `lib/src/isReferenceObject.ts`
9. `lib/src/inferRequiredOnly.ts`
10. `lib/src/getZodiosEndpointDefinitionList.ts`
11. `lib/src/getOpenApiDependencyGraph.ts`
12. `lib/src/generateZodClientFromOpenAPI.ts`
13. `lib/src/generateJSDocArray.ts`
14. `lib/src/cli.ts`

**Test files (variable):**

-   All `.test.ts` files importing OpenAPIObject types

**Example files:**

-   `examples/basic/petstore-generator.ts`
-   Any other programmatic usage examples

### Types Imported

Most common imports:

-   `OpenAPIObject` - Main document type
-   `SchemaObject` - Schema definitions
-   `ReferenceObject` - $ref objects
-   `OperationObject` - Endpoint operations
-   `PathItemObject` - Path definitions
-   `ParameterObject` - Parameters
-   `RequestBodyObject` - Request bodies
-   `ResponseObject` - Responses

### Utility Functions Used

-   `isSchemaObject` - From openapi3-ts v3 (may not exist in v4)
-   `isReferenceObject` - Custom implementation (already exists)

---

## Detailed Implementation Plan

### Phase 1: Research & Verification (2 hours)

#### Step 1.1: Verify openapi3-ts v4 Available

```bash
npm info openapi3-ts versions
# Should show 4.x versions

npm info openapi3-ts@4 dist-tags
# Check latest 4.x version

npm info openapi3-ts@4
# Review package details
```

#### Step 1.2: Review Breaking Changes

**Research:**

-   Read npm package page: https://www.npmjs.com/package/openapi3-ts
-   Check GitHub releases: https://github.com/metadevpro/openapi3-ts/releases
-   Document all breaking changes
-   Note any new features

**Key Changes in v4:**

1. **Separate OAS 3.0 and 3.1 modules:**

    - `openapi3-ts/oas30` for OpenAPI 3.0
    - `openapi3-ts/oas31` for OpenAPI 3.1

2. **Import changes:**

    - No more `import from "openapi3-ts"`
    - Must specify OAS version

3. **Type definitions:**
    - May have slight differences between oas30 and oas31 types
    - More accurate to spec

#### Step 1.3: Check Utility Functions

```bash
# Install v4 temporarily to check exports
npm install openapi3-ts@4 --prefix /tmp/test
cd /tmp/test
node -e "console.log(Object.keys(require('openapi3-ts/oas31')))"
```

**Questions to answer:**

-   ✅ Does `isSchemaObject` exist in v4?
-   ✅ Does `isReferenceObject` exist in v4?
-   ✅ Are type definitions compatible?
-   ✅ Are there new utilities we should use?

#### Step 1.4: Verify @apidevtools/swagger-parser Compatibility

```typescript
// swagger-parser returns OpenAPIObject
// Will it work with openapi3-ts v4 types?

import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject } from "openapi3-ts/oas31";

const doc = (await SwaggerParser.parse("spec.yaml")) as OpenAPIObject;
// Does this work? Test it!
```

---

### Phase 2: Update Dependencies (30 minutes)

#### Step 2.1: Update lib/package.json

```json
{
  "dependencies": {
-   "openapi3-ts": "3.1.0",
+   "openapi3-ts": "^4.0.0",
  }
}
```

#### Step 2.2: Update Example package.json Files

```bash
# Update all example directories
cd examples/basic
# Update package.json

cd ../schemas-only
# Update package.json

cd ../export-schemas-and-types-directly
# Update package.json
```

```json
{
  "devDependencies": {
-   "openapi3-ts": "3.0.2",
+   "openapi3-ts": "^4.0.0",
  }
}
```

#### Step 2.3: Install Dependencies

```bash
cd /Users/jim/code/personal/openapi-zod-client
pnpm install

# Verify installation
pnpm list openapi3-ts
# Should show 4.x.x
```

---

### Phase 3: Update Import Statements (2 hours)

#### Step 3.1: Create Import Map

Document before/after for each file:

```typescript
// BEFORE (v3)
import type { OpenAPIObject, SchemaObject, ReferenceObject } from "openapi3-ts";
import { isSchemaObject } from "openapi3-ts";

// AFTER (v4)
import type { OpenAPIObject, SchemaObject, ReferenceObject } from "openapi3-ts/oas31";
import { isSchemaObject } from "openapi3-ts/oas31"; // If it exists
// OR
import { isSchemaObject } from "./isSchemaObject"; // If custom needed
```

#### Step 3.2: Update Core Library Files

**Systematic approach - update one file at a time:**

1. **lib/src/CodeMeta.ts:**

    ```typescript
    - import type { ReferenceObject, SchemaObject } from "openapi3-ts";
    + import type { ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
    ```

2. **lib/src/makeSchemaResolver.ts:**

    ```typescript
    - import type { OpenAPIObject, SchemaObject } from "openapi3-ts";
    + import type { OpenAPIObject, SchemaObject } from "openapi3-ts/oas31";
    ```

3. **lib/src/openApiToZod.ts:**

    ```typescript
    - import { isSchemaObject, type ReferenceObject, type SchemaObject } from "openapi3-ts";
    + import type { ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
    + import { isSchemaObject } from "openapi3-ts/oas31"; // Or custom
    ```

4. **lib/src/schema-complexity.ts:**

    ```typescript
    - import type { ReferenceObject, SchemaObject } from "openapi3-ts";
    + import type { ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
    ```

5. **lib/src/utils.ts:**

    ```typescript
    - import type { SchemaObject } from "openapi3-ts";
    + import type { SchemaObject } from "openapi3-ts/oas31";
    ```

6. **Continue for all 20 files...**

**Automated approach (careful!):**

```bash
# Find all imports
cd lib/src
grep -r "from [\"']openapi3-ts[\"']" .

# Could use sed for bulk replace, but review each file manually
# for f in *.ts; do
#   sed -i '' 's/from "openapi3-ts"/from "openapi3-ts\/oas31"/g' "$f"
# done

# Manual review recommended for safety
```

#### Step 3.3: Update Test Files

```bash
cd lib/src
# Find test files with openapi3-ts imports
grep -r "from [\"']openapi3-ts[\"']" *.test.ts

# Update each one
```

```typescript
// Example: lib/src/openApiToZod.test.ts
- import type { SchemaObject } from "openapi3-ts";
+ import type { SchemaObject } from "openapi3-ts/oas31";
```

#### Step 3.4: Update Example Files

```typescript
// examples/basic/petstore-generator.ts
- import type { OpenAPIObject } from "openapi3-ts";
+ import type { OpenAPIObject } from "openapi3-ts/oas31";
```

---

### Phase 4: Handle Utility Functions (1 hour)

#### Step 4.1: Check If isSchemaObject Exists in v4

```bash
# Test in Node REPL
node
> const oas31 = require('openapi3-ts/oas31');
> console.log(oas31.isSchemaObject);
// If undefined, need custom implementation
```

#### Step 4.2: Implement Custom isSchemaObject (If Needed)

**If `isSchemaObject` doesn't exist in v4:**

Create or update `lib/src/isSchemaObject.ts`:

```typescript
import type { SchemaObject } from "openapi3-ts/oas31";

/**
 * Type guard to check if an object is a SchemaObject
 * (as opposed to a ReferenceObject)
 */
export function isSchemaObject(obj: any): obj is SchemaObject {
    return obj && typeof obj === "object" && !("$ref" in obj);
}
```

Then update imports in files that use it:

```typescript
// lib/src/openApiToZod.ts
- import { isSchemaObject } from "openapi3-ts";
+ import { isSchemaObject } from "./isSchemaObject";
```

Also update `lib/src/index.ts` to export it if needed:

```typescript
export { isSchemaObject } from "./isSchemaObject";
```

#### Step 4.3: Verify isReferenceObject

**File: `lib/src/isReferenceObject.ts`** (already exists)

Ensure it imports from correct path:

```typescript
import type { ReferenceObject } from "openapi3-ts/oas31";

export function isReferenceObject(obj: any): obj is ReferenceObject {
    return obj && typeof obj.$ref === "string";
}
```

#### Step 4.4: Update inferRequiredOnly.ts

```typescript
// lib/src/inferRequiredOnly.ts
- import { type SchemaObject, type ReferenceObject, isReferenceObject } from "openapi3-ts";
+ import type { SchemaObject, ReferenceObject } from "openapi3-ts/oas31";
+ import { isReferenceObject } from "./isReferenceObject";
```

---

### Phase 5: Type Checking (1 hour)

#### Step 5.1: Compile TypeScript

```bash
cd lib
pnpm lint:ts

# Fix any type errors that appear
# Most should be resolved by import updates
# Document any remaining issues
```

#### Step 5.2: Common Type Issues

**Issue: Type mismatch with swagger-parser**

```typescript
// If swagger-parser returns incompatible type
const openApiDoc = (await SwaggerParser.parse(input)) as OpenAPIObject;

// May need type assertion or check @apidevtools/swagger-parser version
```

**Issue: Subtle type differences between oas30 and oas31**

```typescript
// Most schemas are compatible
// But OpenAPI 3.1 has some differences (e.g., nullable handling)
// Runtime behavior should handle both
```

#### Step 5.3: Verify No Type Regressions

```bash
# Compile all workspaces
pnpm -r run lint:ts

# Should compile without errors
```

---

### Phase 6: Testing (3 hours)

#### Step 6.1: Run Unit Tests

```bash
cd lib
pnpm test

# Expected: ALL tests pass
# Generated output should NOT change
```

**If tests fail:**

-   Check if it's just types vs actual behavior
-   Verify openapi3-ts v4 didn't change schema structure
-   Check if test expectations need updating

#### Step 6.2: Verify Generated Output Unchanged

```bash
cd examples/basic
pnpm gen:basic

# Compare with previous output
git diff petstore-client.ts

# Should show NO CHANGES (or minimal formatting)
# If changes, investigate why
```

#### Step 6.3: Test with Both OAS 3.0 and 3.1 Specs

```bash
# Test OAS 3.0 spec
pnpm openapi-zod-client samples/v3.0/petstore.yaml -o /tmp/oas30-output.ts

# Test OAS 3.1 spec
pnpm openapi-zod-client samples/v3.1/webhook-example.yaml -o /tmp/oas31-output.ts

# Both should work without errors
```

#### Step 6.4: Test CLI

```bash
# Test basic CLI usage
pnpm openapi-zod-client examples/petstore.yaml -o /tmp/test-output.ts

# Should generate without errors
# Verify output is valid TypeScript
```

#### Step 6.5: Test Programmatic API

```typescript
// Test the exported generateZodClientFromOpenAPI function
import { generateZodClientFromOpenAPI } from "openapi-zod-client";
import type { OpenAPIObject } from "openapi3-ts/oas31";

const doc: OpenAPIObject = {
    openapi: "3.1.0",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
};

const result = await generateZodClientFromOpenAPI({
    openApiDoc: doc,
    disableWriteToFile: true,
});

// Should work without errors
```

#### Step 6.6: Run All Example Scripts

```bash
cd examples/basic && pnpm gen:basic
cd ../schemas-only && pnpm gen:schemas-only
cd ../export-schemas-and-types-directly && pnpm gen:export

# All should succeed
```

---

### Phase 7: Documentation (2 hours)

#### Step 7.1: Write Migration Guide

Create **lib/README.md** section:

````markdown
## v2.0.0 Breaking Changes

### openapi3-ts v4 Update

This version updates `openapi3-ts` from v3 to v4, which introduces
a breaking change in TypeScript import paths.

#### Who Is Affected?

**✅ NOT Affected:**

-   CLI users (no changes needed)
-   Users who only use generated clients
-   Runtime behavior (still supports both OAS 3.0 and 3.1)

**⚠️ Affected:**

-   Users who programmatically import `OpenAPIObject` or other types
    from `openapi3-ts`
-   Users of the programmatic API who pass `OpenAPIObject` types

#### Migration Guide

If you import types from `openapi3-ts`, update your imports:

**Before (v1.x):**

```typescript
import type { OpenAPIObject } from "openapi3-ts";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";

const doc: OpenAPIObject = {
    /* ... */
};
```
````

**After (v2.x):**

```typescript
import type { OpenAPIObject } from "openapi3-ts/oas31";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";

const doc: OpenAPIObject = {
    /* ... */
};
```

**That's it!** Just change the import path from `"openapi3-ts"` to
`"openapi3-ts/oas31"`.

#### Why OAS 3.1?

We target OpenAPI 3.1 as it's the latest specification. However,
**both OAS 3.0 and 3.1 specs continue to work at runtime** - this
is purely a TypeScript type change.

If you specifically need OAS 3.0 types, use:

```typescript
import type { OpenAPIObject } from "openapi3-ts/oas30";
```

#### What Didn't Change

-   ✅ Generated client code (identical output)
-   ✅ CLI usage (no changes)
-   ✅ Runtime behavior
-   ✅ All existing options and features
-   ✅ Template system
-   ✅ Configuration

````

#### Step 7.2: Update Main README

```markdown
# Breaking Changes in v2.0

Version 2.0 includes a breaking change for users who import types
from `openapi3-ts`. See [Migration Guide](./lib/README.md#v200-breaking-changes)
for details.

**TL;DR:** Update import paths from `"openapi3-ts"` to `"openapi3-ts/oas31"`.
````

#### Step 7.3: Update Examples README

````markdown
# Examples

All examples have been updated for openapi-zod-client v2.0.

**Note:** If you're using the programmatic API, update your imports:

```typescript
import type { OpenAPIObject } from "openapi3-ts/oas31";
```
````

See main [README](../../README.md) for full migration guide.

````

#### Step 7.4: Update Example Code Comments

```typescript
// examples/basic/petstore-generator.ts

/**
 * Example: Programmatic generation of Zodios client from OpenAPI spec
 *
 * NOTE: For openapi-zod-client v2.0+, import OpenAPIObject from:
 *   import type { OpenAPIObject } from "openapi3-ts/oas31";
 *
 * For v1.x, use:
 *   import type { OpenAPIObject } from "openapi3-ts";
 */

import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import { resolveConfig } from "prettier";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";
````

---

### Phase 8: Create Changeset (30 minutes)

```bash
pnpm changeset
```

**Changeset content:**

````markdown
---
"openapi-zod-client": major
---

BREAKING CHANGE: Upgrade openapi3-ts to v4

This version updates the `openapi3-ts` dependency from v3 to v4,
which explicitly separates OpenAPI 3.0 and 3.1 support.

## Breaking Change

Type imports now require specifying the OpenAPI version path:

```typescript
// Before (v1.x)
import type { OpenAPIObject } from "openapi3-ts";

// After (v2.x)
import type { OpenAPIObject } from "openapi3-ts/oas31";
```
````

## Who Is Affected?

**CLI Users:** ✅ No changes needed  
**Programmatic Users:** ⚠️ Must update type imports (see above)

## What Changed

-   openapi3-ts dependency: 3.1.0 → 4.0.0
-   Import paths now specify OAS version (oas31 or oas30)
-   Better type safety for OpenAPI 3.1 features
-   Updated all examples and documentation

## What Didn't Change

-   Generated client code (identical output)
-   Runtime behavior (both OAS 3.0 and 3.1 still supported)
-   CLI usage
-   All features and options

## Migration

Simply update import statements in any code that imports types
from `openapi3-ts`. See README for full migration guide.

````

---

### Phase 9: Commit Strategy (30 minutes)

```bash
# Commit 1: Update dependency
git add lib/package.json examples/*/package.json pnpm-lock.yaml
git commit -m "chore: update openapi3-ts to v4.0.0"

# Commit 2: Update imports (core library)
git add lib/src/*.ts
git commit -m "refactor: update openapi3-ts imports to oas31 path"

# Commit 3: Update utility functions (if needed)
git add lib/src/isSchemaObject.ts lib/src/isReferenceObject.ts
git commit -m "refactor: implement custom type guards for openapi3-ts v4"

# Commit 4: Update test files
git add lib/src/*.test.ts lib/tests/
git commit -m "test: update openapi3-ts imports in tests"

# Commit 5: Update examples
git add examples/
git commit -m "refactor: update examples for openapi3-ts v4"

# Commit 6: Documentation
git add README.md lib/README.md examples/README.md
git commit -m "docs: add v2.0.0 migration guide for openapi3-ts v4"

# Commit 7: Changeset
git add .changeset/
git commit -m "chore: add major changeset for openapi3-ts v4"
````

---

## Testing Checklist

Before submitting PR:

### Core Functionality

-   [ ] All unit tests pass: `pnpm test`
-   [ ] Build succeeds: `pnpm build`
-   [ ] Linting passes: `cd lib && pnpm lint`
-   [ ] Type checking passes: `pnpm -r run lint:ts`
-   [ ] No new TypeScript errors

### Generated Output

-   [ ] Output identical to v1.x (no changes)
-   [ ] Examples generate correctly
-   [ ] CLI generates correctly
-   [ ] Programmatic API works

### Spec Compatibility

-   [ ] OAS 3.0 specs work: `samples/v3.0/*.yaml`
-   [ ] OAS 3.1 specs work: `samples/v3.1/*.yaml`
-   [ ] Complex specs tested (recursive, unions, etc.)

### Examples

-   [ ] basic example works
-   [ ] schemas-only example works
-   [ ] export-schemas example works

### Documentation

-   [ ] Migration guide complete
-   [ ] README updated
-   [ ] Examples documented
-   [ ] Changeset created

### CI/CD

-   [ ] GitHub Actions pass
-   [ ] No workflow failures

---

## Success Criteria

✅ **Dependency**

-   openapi3-ts updated to v4.x in all workspaces

✅ **Code**

-   All imports use `openapi3-ts/oas31`
-   Type guards implemented (if needed)
-   No TypeScript errors

✅ **Tests**

-   100% of tests pass
-   No snapshot changes (unless expected)

✅ **Compatibility**

-   Both OAS 3.0 and 3.1 specs work
-   Generated output unchanged

✅ **Documentation**

-   Migration guide published
-   Examples updated
-   Clear commit history

✅ **User Experience**

-   Simple migration path (1 line change)
-   Clear error messages if wrong import used
-   No runtime breaking changes

---

## Risks & Mitigation

| Risk                                     | Probability | Impact   | Mitigation                           |
| ---------------------------------------- | ----------- | -------- | ------------------------------------ |
| Type incompatibility with swagger-parser | Medium      | Medium   | Test thoroughly, use type assertions |
| Utility functions missing in v4          | Medium      | Low      | Implement custom (trivial)           |
| User confusion about breaking change     | Medium      | Medium   | Excellent documentation              |
| Generated output accidentally changes    | Low         | High     | Extensive snapshot testing           |
| OAS 3.0 specs stop working               | Low         | Critical | Test matrix, runtime checks          |

---

## Rollback Plan

If critical issues discovered:

1. **Revert PR:**

    ```bash
    git revert <merge-commit>
    ```

2. **Hot fix if minor:**

    - Create patch PR
    - Fast-track review
    - Document issue

3. **Delay Zod update:**
    - If Plan 03 in progress, pause it
    - Stabilize Plan 02 first

---

## Post-Merge Tasks

1. **Monitor issues:**

    - Watch for user reports
    - Check GitHub issues
    - Monitor Discord/Slack

2. **Update dependent PRs:**

    - Rebase Plan 03 if started
    - Update any other branches

3. **Community communication:**

    - Announce v2.0.0 release
    - Share migration guide
    - Offer support

4. **Prepare for Plan 03:**
    - Stable baseline now exists
    - Can proceed with Zod v4

---

## Notes

-   This is a type-only breaking change
-   No runtime behavior changes
-   Clean migration path (simple import update)
-   Foundation for future OAS 3.1 improvements
-   Can be released independently or combined with Plan 03

---

**Next Steps:** After this merges, proceed to Plan 03 (Zod v4)!
