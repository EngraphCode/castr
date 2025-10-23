# Plan 03: Zod v4 Upgrade

**PR Title:** `feat!: upgrade to Zod v4`

**Type:** `major` (breaking change → v2.0.0 or v3.0.0)  
**Branch:** `feat/zod-v4`  
**Depends On:** Plans 01 and 02 (developer tooling and openapi3-ts v4)  
**Estimated Time:** 4-6 days

---

## Objective

Upgrade Zod from v3.x to v4.x, updating all schema generation logic and generated output. This is the most impactful change as it affects ALL users - everyone must update to Zod v4 to use the generated clients.

## Breaking Change Justification

This **IS** a breaking change because:

1. **Generated code changes:**

    - Generated clients will use Zod v4 API
    - All users must have Zod v4 installed
    - May have different validation behavior

2. **@zodios/core dependency:**

    - Must update to Zod v4 compatible version
    - May have its own breaking changes

3. **User action required:**

    - Update Zod dependency in their projects
    - Regenerate all API clients
    - Test with new Zod v4 API

4. **Semantic versioning:**
    - This requires a major version bump
    - Clear signal of breaking changes

## User Impact Assessment

### Affected Users

⚠️ **ALL USERS** are affected:

-   CLI users must regenerate clients
-   Programmatic users must regenerate clients
-   All users must install Zod v4
-   Generated code will use different Zod API

### Migration Effort

**Estimated per user:**

1. Update Zod dependency: 1 minute
2. Update @zodios/core (if used): 1 minute
3. Regenerate client: 1 minute per spec
4. Test and validate: Variable

**Total:** 5-30 minutes depending on number of specs

---

## Scope

### In Scope ✅

-   Update Zod dependency to v4.x
-   Update @zodios/core to Zod v4 compatible version
-   Refactor schema generation logic (`openApiToZod.ts`)
-   Update ALL test snapshots (68 test files)
-   Update all examples
-   Update playground
-   Write comprehensive migration guide
-   Test with real-world specs

### Out of Scope ❌

-   Changes to OpenAPI spec support
-   New features (focus on compatibility)
-   Template changes (unless required)

---

## Current State Analysis (October 2025)

### Dependency Versions

```json
{
    "lib/package.json": {
        "zod": "^3.19.1",
        "@zodios/core": "^10.3.1"
    },
    "playground/package.json": {
        "zod": "^3.20.0", // Different!
        "@zodios/core": "^10.3.1"
    },
    "examples/*/package.json": {
        "zod": "^3.19.1",
        "@zodios/core": "^10.3.1"
    }
}
```

### Files Requiring Updates

**Core Schema Generation:**

-   `lib/src/openApiToZod.ts` (463 lines - COMPLEX!)
    -   Main schema conversion logic
    -   Handles all OpenAPI → Zod mappings
    -   Will require significant updates

**Chain Generation:**

-   `lib/src/openApiToZod.ts` function `getZodChain`
    -   Builds validation chains (.min(), .max(), etc.)
    -   May need updates for Zod v4 API

**Type Generation:**

-   `lib/src/openApiToTypescript.ts`
    -   Generates TypeScript types
    -   May need updates for Zod v4 type inference

**Template Context:**

-   `lib/src/template-context.ts`
    -   Manages schema wrapping (z.lazy for circular refs)
    -   May need updates

**Tests:**

-   All 68 test files with inline snapshots
-   Expected output will change for Zod v4

**Examples:**

-   `examples/basic/petstore-client.ts` (generated)
-   `examples/schemas-only/petstore-schemas.ts` (generated)
-   All example outputs need regeneration

**Playground:**

-   Real-time generation must work with Zod v4
-   May need UI updates

---

## Detailed Implementation Plan

### Phase 1: Research & Preparation (1 day)

#### Step 1.1: Research Zod v4 Breaking Changes

**PRIMARY TASK: Read official migration guide**

```bash
# Check Zod v4 changelog and migration docs
open https://github.com/colinhacks/zod/releases
open https://zod.dev/

# Document ALL breaking changes
# Create a checklist of items to update
```

**Key areas to research:**

1. **Schema creation API changes**

    - `z.string()`, `z.number()`, `z.object()`, etc.
    - Any method renames or removals

2. **Refinement API**

    - `.refine()` signature changes
    - `.superRefine()` changes
    - Custom validation

3. **Transform API**

    - `.transform()` changes
    - `.preprocess()` changes

4. **Optional/Nullable handling**

    - `.optional()` behavior
    - `.nullable()` behavior
    - Union with null

5. **Default values**

    - `.default()` API
    - Lazy defaults

6. **Array handling**

    - `z.array()` API
    - `.min()`, `.max()`, `.length()`
    - `.nonempty()`

7. **Object handling**

    - `.passthrough()`, `.strict()`, `.strip()`
    - `.partial()`, `.required()`, `.pick()`, `.omit()`
    - `.extend()`, `.merge()`

8. **Union/Discriminated Union**

    - `z.union()` API
    - `z.discriminatedUnion()` API
    - Discriminator property

9. **Enum handling**

    - `z.enum()` API
    - `z.nativeEnum()` API

10. **Lazy schemas (critical for recursion)**

    - `z.lazy()` API
    - Performance implications

11. **Error handling**

    - `ZodError` structure
    - Error messages
    - Custom error maps

12. **Type inference**
    - `z.infer<>` changes
    - `.parse()` return types

#### Step 1.2: Check @zodios/core Compatibility

```bash
# Check @zodios/core versions
npm info @zodios/core versions | tail -20

# Find version compatible with Zod v4
npm info @zodios/core peerDependencies

# Read changelog for breaking changes
open https://github.com/ecyrbe/zodios/releases
```

**Questions to answer:**

-   ✅ Which @zodios/core version supports Zod v4?
-   ✅ Does @zodios/core have breaking changes?
-   ✅ Are there any API changes in makeApi()?
-   ✅ Do we need to update template code?

**If @zodios/core doesn't support Zod v4 yet:**

-   STOP and wait for compatibility
-   OR contribute to @zodios/core
-   OR consider alternative approach

#### Step 1.3: Create Breaking Changes Checklist

Document every Zod v3 → v4 change that affects our code:

```markdown
# Zod v4 Breaking Changes Checklist

## Schema Creation

-   [ ] z.string() - any changes?
-   [ ] z.number() - any changes?
-   [ ] z.object() - any changes?
-   [ ] z.array() - any changes?
-   [ ] z.union() - any changes?
-   [ ] z.discriminatedUnion() - any changes?
-   [ ] z.enum() - any changes?
-   [ ] z.lazy() - CRITICAL - any changes?

## Validation Chains

-   [ ] .min() / .max() - any changes?
-   [ ] .email() / .url() / .uuid() - any changes?
-   [ ] .regex() - any changes?
-   [ ] .refine() - any changes?

## Optional/Nullable

-   [ ] .optional() - any changes?
-   [ ] .nullable() - any changes?
-   [ ] Union with z.null() - any changes?

## Object Operations

-   [ ] .passthrough() - any changes?
-   [ ] .strict() - any changes?
-   [ ] .partial() - any changes?
-   [ ] .required() - any changes?

## Default Values

-   [ ] .default() - any changes?

## Error Handling

-   [ ] ZodError structure - any changes?
-   [ ] Error messages - any changes?

## Type Inference

-   [ ] z.infer<> - any changes?
-   [ ] .parse() - any changes?

## Performance

-   [ ] Any known performance regressions?
-   [ ] Any optimization opportunities?
```

#### Step 1.4: Analyze Impact on openApiToZod.ts

```bash
cd lib/src

# Review the entire file
wc -l openApiToZod.ts
# 463 lines

# Identify all Zod API usage
grep "z\." openApiToZod.ts | sort | uniq

# Create list of patterns to update
```

**Expected patterns to find:**

-   `z.string()`
-   `z.number()`
-   `z.object()`
-   `z.array()`
-   `z.union()`
-   `z.discriminatedUnion()`
-   `z.enum()`
-   `z.lazy()`
-   `.optional()`
-   `.nullable()`
-   `.default()`
-   `.min()`, `.max()`, `.length()`
-   `.passthrough()`, `.strict()`
-   `.refine()`

---

### Phase 2: Update Dependencies (30 minutes)

#### Step 2.1: Update Zod

**Update in ALL package.json files:**

```json
// lib/package.json
{
  "dependencies": {
-   "zod": "^3.19.1"
+   "zod": "^4.0.0"  // Update to actual v4 version
  }
}

// playground/package.json
{
  "dependencies": {
-   "zod": "^3.20.0"
+   "zod": "^4.0.0"
  }
}

// examples/basic/package.json
// examples/schemas-only/package.json
// examples/export-schemas-and-types-directly/package.json
{
  "dependencies": {
-   "zod": "^3.19.1"
+   "zod": "^4.0.0"
  }
}
```

#### Step 2.2: Update @zodios/core

```json
// lib/package.json
{
  "dependencies": {
-   "@zodios/core": "^10.3.1"
+   "@zodios/core": "^11.0.0"  // Or whatever version supports Zod v4
  }
}

// Update in all other package.json files as well
```

#### Step 2.3: Install Dependencies

```bash
cd /Users/jim/code/personal/openapi-zod-client
pnpm install

# Verify versions
pnpm list zod
pnpm list @zodios/core

# Check for peer dependency warnings
```

---

### Phase 3: Update openApiToZod.ts (2-3 days)

⚠️ **This is the most critical and time-consuming phase**

#### Step 3.1: Back Up Current State

```bash
cd lib/src
cp openApiToZod.ts openApiToZod.ts.backup

# Can compare later to see all changes
```

#### Step 3.2: Update Schema Creation (Systematic Approach)

**For EACH Zod schema type, update according to v4 API:**

**1. String Schemas:**

```typescript
// Current (v3)
code.assign("z.string()");

// Check v4 API - likely unchanged but verify:
code.assign("z.string()");

// String chains
.min(n) → Verify API
.max(n) → Verify API
.email() → Verify API
.url() → Verify API
.uuid() → Verify API
.regex(pattern) → Verify API
```

**2. Number Schemas:**

```typescript
// Current (v3)
code.assign("z.number()");

// Check v4 API:
code.assign("z.number()");

// Number chains
.int() → Verify API
.min(n) → Verify API
.max(n) → Verify API
```

**3. Object Schemas:**

```typescript
// Current (v3)
code.assign(`z.object({ ${props} })`);

// Check v4 API:
code.assign(`z.object({ ${props} })`);

// Object chains
.passthrough() → Verify API (likely changed for strict mode)
.strict() → Verify API
.partial() → Verify API
.required() → Verify API
```

**4. Array Schemas:**

```typescript
// Current (v3)
code.assign(`z.array(${itemSchema})`);

// Check v4 API:
code.assign(`z.array(${itemSchema})`);

// Array chains
.min(n) → Verify API
.max(n) → Verify API
.length(n) → Verify API
.nonempty() → Check if deprecated
```

**5. Union Schemas:**

```typescript
// Current (v3)
code.assign(`z.union([${schemas}])`);

// Check v4 API:
code.assign(`z.union([${schemas}])`);
```

**6. Discriminated Union:**

```typescript
// Current (v3)
code.assign(`z.discriminatedUnion("${prop}", [${schemas}])`);

// Check v4 API:
code.assign(`z.discriminatedUnion("${prop}", [${schemas}])`);
```

**7. Enum Schemas:**

```typescript
// Current (v3)
code.assign(`z.enum([${values}])`);

// Check v4 API:
code.assign(`z.enum([${values}])`);
```

**8. Lazy Schemas (CRITICAL for recursion):**

```typescript
// Current (v3)
return isCircular ? `z.lazy(() => ${code})` : code;

// Check v4 API:
// Verify z.lazy() still works the same way
// This is critical for circular references!
return isCircular ? `z.lazy(() => ${code})` : code;
```

#### Step 3.3: Update Optional/Nullable Handling

```typescript
// Current (v3) - various patterns:
schema.optional();
schema.nullable();
z.union([schema, z.null()]);

// Check v4 API - may have changed:
// - Is .optional() still the same?
// - Is .nullable() still the same?
// - Is null union still the same?
// - Any new recommended patterns?

// Update accordingly
```

#### Step 3.4: Update Default Values

```typescript
// Current (v3)
.default(value)

// Check v4 API:
// - Same signature?
// - Lazy defaults changed?
.default(value)
```

#### Step 3.5: Update Refinements

```typescript
// Current (v3)
.refine(fn, { message: "..." })

// Check v4 API:
// - Signature changed?
// - Message handling changed?
.refine(fn, { message: "..." })
```

#### Step 3.6: Update getZodChain Function

The `getZodChain` function builds validation chains.

```typescript
// Example current chain:
z.string().min(1).max(100).email().optional();

// For EACH chain method, verify v4 API:
// - Is the method still named the same?
// - Are parameters the same?
// - Is the order the same?
```

#### Step 3.7: Test Incrementally

```bash
# After each major update, test
cd lib
pnpm test

# Fix errors before moving to next update
# This prevents compound errors
```

---

### Phase 4: Update Type Generation (1 day)

#### Step 4.1: Review openApiToTypescript.ts

```bash
cd lib/src
# Check if any Zod-related type generation needs updates
grep -i "zod" openApiToTypescript.ts

# Usually minimal changes needed here
# Types are mostly separate from Zod runtime
```

#### Step 4.2: Update Type Inference (If Needed)

If Zod v4 changed `z.infer<>`:

```typescript
// Check template-context.ts
// Look for any type inference usage
```

---

### Phase 5: Update Templates (1 hour)

#### Step 5.1: Review Template Files

```bash
cd lib/src/templates

# Check each template
cat default.hbs
cat grouped.hbs
cat grouped-common.hbs
cat schemas-only.hbs
```

#### Step 5.2: Update Template Code (If Needed)

**Most templates should not need changes unless:**

-   Zod import statement changed
-   Type annotation changed (e.g., `z.ZodType<T>` → something else)

```handlebars
{{!-- default.hbs --}}
import { z } from "zod";

{{!-- Check if this needs updates --}}
const {{@key}}{{#if (lookup ../emittedType @key)}}: z.ZodType<{{@key}}>{{/if}} = {{{this}}};

{{!-- Verify z.ZodType still correct in v4 --}}
```

---

### Phase 6: Update All Tests (2-3 days)

⚠️ **Most time-consuming phase - 68 test files!**

#### Step 6.1: Run Tests to See Failures

```bash
cd lib
pnpm test

# Expect MANY failures
# This is normal - output changed for Zod v4

# Review failures systematically:
# 1. Are they expected (Zod v4 API)?
# 2. Are they unexpected (bugs)?
```

#### Step 6.2: Categorize Test Failures

Create a list:

```markdown
# Test Failure Categories

## Category A: Expected Zod v4 API Changes

-   Tests failing because generated output uses new Zod v4 API
-   These are GOOD - update snapshots after verification

## Category B: Unexpected Errors

-   Tests failing for unknown reasons
-   Need investigation and fixes

## Category C: Type Errors

-   TypeScript compilation errors
-   Need code updates

## Category D: Runtime Errors

-   Tests throwing exceptions
-   Need debugging
```

#### Step 6.3: Update Snapshots Systematically

**DO NOT blindly update all snapshots!**

```bash
# Review ONE test at a time
pnpm test openApiToZod.test.ts

# Read the diff carefully
# Understand WHY the output changed

# If change is correct (Zod v4 API), update:
pnpm test openApiToZod.test.ts -u

# If change is WRONG, fix the code first!
```

#### Step 6.4: Test Files to Update

**Core tests:**

-   `lib/src/generateZodClientFromOpenAPI.test.ts`
-   `lib/src/openApiToZod.test.ts`
-   `lib/src/getZodiosEndpointDefinitionList.test.ts`
-   `lib/src/schema-complexity.test.ts`
-   `lib/src/openApiToTypescript.test.ts`

**Integration tests (68 files):**

-   `lib/tests/*.test.ts` (all of them)
-   Each tests a specific scenario
-   Each has inline snapshots
-   Each needs manual review

#### Step 6.5: Testing Strategy

```bash
# Day 1: Core tests
pnpm test src/openApiToZod.test.ts -u
pnpm test src/generateZodClientFromOpenAPI.test.ts -u
# etc.

# Day 2: Integration tests (part 1)
pnpm test tests/additionalProperties*.test.ts -u
pnpm test tests/allOf*.test.ts -u
pnpm test tests/anyOf*.test.ts -u
# etc.

# Day 3: Integration tests (part 2)
# Continue with remaining tests
pnpm test tests/*.test.ts -u

# Day 4: Verification
pnpm test
# All should pass
```

---

### Phase 7: Update Examples (1 day)

#### Step 7.1: Regenerate Example Outputs

```bash
cd examples/basic
pnpm install  # Gets new Zod v4
pnpm gen:basic

# Review petstore-client.ts
# Should use Zod v4 API
git diff petstore-client.ts

cd ../schemas-only
pnpm gen:schemas-only
git diff petstore-schemas.ts

cd ../export-schemas-and-types-directly
pnpm gen:export
git diff petstore-schemas.ts
```

#### Step 7.2: Verify Generated Code

**Check that generated clients:**

-   Use Zod v4 API
-   Are syntactically valid
-   Type check correctly
-   Work at runtime

```bash
cd examples/basic

# Type check
npx tsc --noEmit petstore-client.ts

# Runtime test (if possible)
node -e "const api = require('./petstore-client.ts'); console.log('OK')"
```

#### Step 7.3: Update Example Documentation

```typescript
// examples/basic/petstore-generator.ts
/**
 * Example: Programmatic generation with Zod v4
 *
 * NOTE: Requires Zod v4.0.0 or later
 *
 * Install dependencies:
 *   npm install zod@^4 @zodios/core@^11
 *
 * For older Zod v3, use openapi-zod-client v1.x
 */
```

---

### Phase 8: Update Playground (1 day)

#### Step 8.1: Update Playground Dependencies

```bash
cd playground
pnpm install

# Verify Zod v4 installed
pnpm list zod
```

#### Step 8.2: Test Real-time Generation

```bash
pnpm dev

# Open browser to localhost
# Test the playground:
# 1. Load example spec
# 2. Generate client
# 3. Verify output uses Zod v4
# 4. Test all options
# 5. Test all presets
```

#### Step 8.3: Update Playground UI (If Needed)

```typescript
// playground/src/Playground/Playground.tsx
// Check if any UI elements need updates
// - Version display?
// - Help text?
// - Examples?
```

#### Step 8.4: Build Playground

```bash
pnpm build

# Should build without errors
# Deploy/test built version
```

---

### Phase 9: Comprehensive Integration Testing (1 day)

#### Step 9.1: Test with Real-World Specs

```bash
# Test with official OpenAPI samples
cd samples/v3.0
for spec in *.yaml; do
  pnpm openapi-zod-client "$spec" -o "/tmp/${spec%.yaml}.ts"
  echo "Generated: $spec"
done

cd ../v3.1
for spec in *.yaml; do
  pnpm openapi-zod-client "$spec" -o "/tmp/${spec%.yaml}.ts"
  echo "Generated: $spec"
done

# Verify all generate successfully
```

#### Step 9.2: Test Complex Scenarios

**Test these specific scenarios:**

-   ✅ Recursive schemas (uses z.lazy)
-   ✅ Circular references (uses z.lazy)
-   ✅ Discriminated unions
-   ✅ oneOf / anyOf / allOf
-   ✅ Nested objects
-   ✅ Arrays of objects
-   ✅ Enums (string and number)
-   ✅ Optional fields
-   ✅ Nullable fields
-   ✅ Default values
-   ✅ Validation constraints (min, max, regex, etc.)

```bash
# These test files should cover it:
pnpm test tests/recursive-schema.test.ts
pnpm test tests/array-oneOf-discriminated-union.test.ts
pnpm test tests/allOf*.test.ts
pnpm test tests/anyOf*.test.ts
# etc.
```

#### Step 9.3: Performance Testing

```bash
# Test with large OpenAPI specs
# Measure generation time
time pnpm openapi-zod-client large-spec.yaml -o /tmp/output.ts

# Compare with v1.x (Zod v3) if possible
# Document any performance differences
```

#### Step 9.4: Runtime Validation Testing

Create test files to verify generated schemas work:

```typescript
// test-runtime-validation.ts
import { z } from "zod";
// Import generated schemas

const TestSchema = z.object({
    name: z.string(),
    age: z.number().min(0),
});

// Valid data
const valid = { name: "John", age: 30 };
console.log(TestSchema.parse(valid)); // Should succeed

// Invalid data
const invalid = { name: "John", age: -5 };
try {
    TestSchema.parse(invalid);
} catch (e) {
    console.log("Validation failed as expected:", e);
}
```

---

### Phase 10: Documentation (1 day)

#### Step 10.1: Write Comprehensive Migration Guide

Create **MIGRATION.md** in lib/:

````markdown
# Migration Guide: v1.x → v2.x

## Zod v4 Update

Version 2.0.0 of openapi-zod-client generates API clients using Zod v4,
which introduces breaking changes from Zod v3.

### Who Is Affected?

⚠️ **ALL USERS** are affected by this update.

### Prerequisites

-   Zod v4.0.0 or later
-   @zodios/core v11.0.0 or later (if using Zodios)
-   Node.js 18.20.0 or later

### Step-by-Step Migration

#### 1. Update Dependencies

```bash
npm install zod@^4.0.0 @zodios/core@^11.0.0
# or
pnpm add zod@^4.0.0 @zodios/core@^11.0.0
# or
yarn add zod@^4.0.0 @zodios/core@^11.0.0
```
````

#### 2. Update openapi-zod-client

```bash
npm install openapi-zod-client@^2.0.0
# or
pnpm add openapi-zod-client@^2.0.0
# or
yarn add openapi-zod-client@^2.0.0
```

#### 3. Regenerate API Clients

```bash
# Regenerate each of your API clients
npx openapi-zod-client your-spec.yaml -o client.ts

# Or if using programmatically:
# Just run your generation script again
```

#### 4. Test Your Application

```bash
# Run your test suite
npm test

# Test API calls
# Verify validation works as expected
```

### What Changed?

#### Generated Code Uses Zod v4 API

Your generated client code will now use Zod v4 API. Most Zod v4
changes are backward compatible, but there are some differences:

**Example Generated Code:**

```typescript
// Zod v3 (old)
const User = z
    .object({
        name: z.string(),
        age: z.number().int().min(0),
    })
    .passthrough();

// Zod v4 (new)
// [API changes will be documented here based on actual Zod v4 changes]
const User = z
    .object({
        name: z.string(),
        age: z.number().int().min(0),
    })
    .passthrough();
```

#### Validation Behavior

[Document any validation behavior changes in Zod v4]

#### Error Messages

[Document any error message changes in Zod v4]

### Breaking Changes

[List all breaking changes from Zod v3 → v4 that affect generated code]

1. **[Breaking Change 1]**

    - Description
    - How to fix

2. **[Breaking Change 2]**
    - Description
    - How to fix

### Troubleshooting

#### Error: "Cannot find module 'zod'"

Make sure you've installed Zod v4:

```bash
npm install zod@^4.0.0
```

#### Error: "@zodios/core peer dependency"

Make sure you've updated @zodios/core:

```bash
npm install @zodios/core@^11.0.0
```

#### Validation Errors After Upgrade

If you see unexpected validation errors:

1. Check if Zod v4 changed validation behavior
2. Review the Zod v4 changelog
3. Update your data to match new validation rules

### Compatibility

**If you need Zod v3:**
Use openapi-zod-client v1.x which generates Zod v3 schemas.

```bash
npm install openapi-zod-client@^1.18.0 zod@^3.19.0
```

### Need Help?

-   [GitHub Issues](https://github.com/astahmer/openapi-zod-client/issues)
-   [Zod v4 Documentation](https://zod.dev/)
-   [Zodios Documentation](https://www.zodios.org/)

````

#### Step 10.2: Update Main README

```markdown
# openapi-zod-client

[![npm version](https://img.shields.io/npm/v/openapi-zod-client.svg)](https://www.npmjs.com/package/openapi-zod-client)

## ⚠️ Version 2.0 Breaking Changes

Version 2.0 generates clients using **Zod v4** and requires **OpenAPI 3.x**.

**Requirements:**
- Zod v4.0.0 or later
- @zodios/core v11.0.0 or later
- Node.js 18.20.0 or later

**Migrating from v1.x?** See [Migration Guide](./lib/MIGRATION.md)

**Need Zod v3?** Use [v1.x](https://github.com/astahmer/openapi-zod-client/tree/v1.18.0)

[Rest of README...]
````

#### Step 10.3: Update lib/README.md

Add v2.0.0 section with key changes and migration steps.

#### Step 10.4: Update Examples README

```markdown
# Examples

All examples have been updated for openapi-zod-client v2.0 (Zod v4).

**Requirements:**

-   Zod v4.0.0+
-   @zodios/core v11.0.0+

**For Zod v3 examples**, see the [v1.x branch](https://github.com/astahmer/openapi-zod-client/tree/v1.18.0/examples).
```

---

### Phase 11: Create Changeset (30 minutes)

```bash
pnpm changeset
```

**Changeset content:**

````markdown
---
"openapi-zod-client": major
---

BREAKING CHANGE: Upgrade to Zod v4

This version generates API clients using Zod v4, which introduces
breaking changes from Zod v3.

## Requirements

Your project must have:

-   Zod v4.0.0 or later
-   @zodios/core v11.0.0 or later (if using Zodios)
-   Node.js 18.20.0 or later

## Migration Steps

1. Update dependencies:
    ```bash
    npm install zod@^4 @zodios/core@^11 openapi-zod-client@^2
    ```
````

2. Regenerate your API client:

    ```bash
    npx openapi-zod-client your-spec.yaml -o client.ts
    ```

3. Test your application

## What Changed

-   Generated schemas use Zod v4 API
-   [List specific Zod v4 API changes]
-   Updated all examples and documentation
-   Improved [specific improvements if any]

## What Didn't Change

-   OpenAPI spec compatibility (still supports 3.0 and 3.1)
-   CLI usage and options
-   Template system
-   Programmatic API signatures
-   Generated TypeScript types (mostly unchanged)

## Compatibility

For Zod v3 support, use openapi-zod-client v1.x.

## Documentation

See [MIGRATION.md](./lib/MIGRATION.md) for detailed migration guide.

````

---

### Phase 12: Commit Strategy (1 hour)

```bash
# Commit 1: Update dependencies
git add package.json lib/package.json playground/package.json examples/*/package.json pnpm-lock.yaml
git commit -m "chore: update zod to v4 and @zodios/core to v11"

# Commit 2: Update schema generation (core changes)
git add lib/src/openApiToZod.ts
git commit -m "refactor: update schema generation for Zod v4 API

- Update string schema generation
- Update number schema generation
- Update object schema generation
- Update array schema generation
- Update union schema generation
- Update lazy schema handling
- Update optional/nullable handling
- Update validation chains"

# Commit 3: Update type generation (if needed)
git add lib/src/openApiToTypescript.ts lib/src/template-context.ts
git commit -m "refactor: update type generation for Zod v4"

# Commit 4: Update templates (if needed)
git add lib/src/templates/
git commit -m "refactor: update templates for Zod v4"

# Commit 5: Update tests (large commit)
git add lib/src/*.test.ts lib/tests/
git commit -m "test: update all test snapshots for Zod v4 output

- Updated 68 test files
- Verified all snapshot changes
- All tests pass with Zod v4"

# Commit 6: Update examples
git add examples/
git commit -m "refactor: regenerate examples with Zod v4"

# Commit 7: Update playground
git add playground/
git commit -m "refactor: update playground for Zod v4"

# Commit 8: Documentation
git add README.md lib/README.md lib/MIGRATION.md examples/README.md
git commit -m "docs: add comprehensive v2.0 migration guide for Zod v4"

# Commit 9: Changeset
git add .changeset/
git commit -m "chore: add major changeset for Zod v4 upgrade"
````

---

## Testing Checklist

### Core Functionality

-   [ ] All 68 tests pass
-   [ ] Build succeeds
-   [ ] Linting passes
-   [ ] Type checking passes
-   [ ] No TypeScript errors

### Generated Output

-   [ ] Uses Zod v4 API correctly
-   [ ] Schemas are syntactically valid
-   [ ] Types are correct
-   [ ] Validation works at runtime

### Examples

-   [ ] basic example works
-   [ ] schemas-only example works
-   [ ] export-schemas example works
-   [ ] All examples type check
-   [ ] All examples run

### Playground

-   [ ] Builds successfully
-   [ ] Real-time generation works
-   [ ] All options work
-   [ ] All presets work

### Spec Compatibility

-   [ ] OAS 3.0 specs work
-   [ ] OAS 3.1 specs work
-   [ ] Complex specs tested
-   [ ] Recursive schemas work
-   [ ] Circular refs work

### Integration

-   [ ] @zodios/core integration works
-   [ ] Validation at runtime works
-   [ ] Error messages are helpful
-   [ ] Type inference works

### Documentation

-   [ ] Migration guide complete
-   [ ] README updated
-   [ ] Examples documented
-   [ ] Changeset created

### Performance

-   [ ] No significant slowdown
-   [ ] Large specs tested
-   [ ] Memory usage reasonable

---

## Success Criteria

✅ **Dependencies**

-   Zod updated to v4.x
-   @zodios/core updated to compatible version

✅ **Code**

-   Schema generation updated for Zod v4
-   All tests pass
-   No TypeScript errors

✅ **Output**

-   Generated code uses Zod v4 API
-   Valid TypeScript
-   Runtime validation works

✅ **Examples**

-   All examples updated
-   All examples work

✅ **Documentation**

-   Migration guide published
-   Clear breaking changes documented
-   User support prepared

✅ **Quality**

-   No regressions
-   Performance acceptable
-   Error handling improved (if applicable)

---

## Risks & Mitigation

| Risk                               | Probability | Impact   | Mitigation                |
| ---------------------------------- | ----------- | -------- | ------------------------- |
| Zod v4 API significantly different | High        | Critical | Thorough research phase   |
| @zodios/core not Zod v4 compatible | Medium      | Critical | Check before starting     |
| Generated code breaks user apps    | High        | Critical | Excellent migration guide |
| Test snapshots hard to verify      | High        | Medium   | Systematic review         |
| Performance regression             | Medium      | Medium   | Benchmark and optimize    |
| Missing edge cases                 | Medium      | High     | Comprehensive testing     |
| User confusion                     | High        | Medium   | Clear documentation       |

---

## Rollback Plan

If critical issues discovered:

1. **Immediate rollback:**

    ```bash
    git revert <merge-commit>
    # Release v2.0.1 with rollback
    ```

2. **Partial rollback:**

    - Identify specific problematic change
    - Revert just that commit
    - Release patch

3. **Forward fix:**
    - If issue is fixable quickly
    - Create hot fix PR
    - Fast-track review
    - Release patch

---

## Post-Merge Tasks

### Immediate (Day 1)

-   [ ] Monitor GitHub issues
-   [ ] Check CI/CD status
-   [ ] Verify npm publish
-   [ ] Test published package

### Short-term (Week 1)

-   [ ] Respond to user issues
-   [ ] Collect feedback
-   [ ] Create FAQ if needed
-   [ ] Consider beta releases for testing

### Medium-term (Month 1)

-   [ ] Analyze adoption
-   [ ] Document common issues
-   [ ] Consider patches if needed
-   [ ] Plan for v2.1 improvements

---

## Community Communication

### Pre-Release

-   [ ] Announce breaking change coming
-   [ ] Create GitHub discussion
-   [ ] Ask for beta testers
-   [ ] Gather feedback

### At Release

-   [ ] Publish v2.0.0
-   [ ] Tweet/announce release
-   [ ] Post in Discord/Slack
-   [ ] Update website

### Post-Release

-   [ ] Monitor feedback
-   [ ] Answer questions
-   [ ] Create issues for bugs
-   [ ] Thank contributors

---

## Timeline

| Phase               | Duration | Cumulative |
| ------------------- | -------- | ---------- |
| Research            | 1 day    | 1 day      |
| Update deps         | 0.5 day  | 1.5 days   |
| Update openApiToZod | 2 days   | 3.5 days   |
| Update types        | 1 day    | 4.5 days   |
| Update tests        | 2 days   | 6.5 days   |
| Update examples     | 1 day    | 7.5 days   |
| Update playground   | 1 day    | 8.5 days   |
| Integration testing | 1 day    | 9.5 days   |
| Documentation       | 1 day    | 10.5 days  |
| Final review        | 0.5 day  | 11 days    |

**Total:** ~11 days = 2-3 weeks

**Aggressive:** 1.5 weeks with full focus  
**Realistic:** 2-3 weeks with other work  
**Conservative:** 3-4 weeks with thorough testing

---

## Notes

-   This is the most impactful of all three PRs
-   Affects ALL users (not just programmatic users)
-   Requires excellent documentation and support
-   Consider beta releases for community testing
-   May want to release as v2.0.0 (combining with Plan 02)
    or as v3.0.0 (if Plan 02 already released as v2.0.0)

**Recommendation:**

-   Execute Plan 02 first (less risky)
-   Release v2.0.0
-   Then execute Plan 03
-   Release v3.0.0

OR

-   Execute both Plans 02 and 03
-   Release single v2.0.0 with both changes
-   Users migrate once

---

**This is the final and most critical upgrade. Take time to do it right!**
