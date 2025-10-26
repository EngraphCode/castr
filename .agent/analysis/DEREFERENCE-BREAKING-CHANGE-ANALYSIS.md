# Breaking Change Analysis: Internal Dereference Call

**Date:** October 26, 2025  
**Tags:**

- `phase0-complete-working` (f2b3ca7) - 86/88 tests passing
- `phase1-wip-investigation` (3029405) - 48/88 tests passing

---

## Executive Summary

### The Breaking Change

I added `SwaggerParser.dereference()` inside `generateZodClientFromOpenAPI` at line 160 during Phase 1 work. This broke 40 characterisation tests (86/88 → 48/88).

### Root Cause

`dereference()` resolves **ALL** `$ref`s in the entire OpenAPI spec, including `$ref`s to component schemas in response objects. After dereferencing:

**Before dereference:**

```json
{
  "paths": {
    "/test": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/SpecialProps" }
              }
            }
          }
        }
      }
    }
  }
}
```

**After dereference:**

```json
{
  "paths": {
    "/test": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "kebab-case": { "type": "string" },
                    "dot.notation": { "type": "number" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

The code no longer knows this schema should be extracted as a named type `SpecialProps`.

---

## Impact Analysis

### What Broke

1. **Named Schema Extraction**: Schemas that should be exported as named types (e.g., `const SpecialProps = z.object(...)`) are now inlined
2. **Code Quality**: Generated code has duplicated inline schemas instead of reusable named schemas
3. **Code Size**: Larger generated output due to duplication
4. **Circular References**: May fail to detect circular dependencies without `$ref`s

### Evidence

**At Phase 0 (f2b3ca7):**

```
Test Files: 6 passed | 1 failed (7)
Tests: 86 passed | 2 failed (88)
```

- Only CLI tests failed (environment setup issues)
- All schema generation tests passed

**At Current Phase 1 (3029405):**

```
Test Files: 1 passed | 6 failed (7)
Tests: 48 passed | 40 failed (88)
```

- Schema generation tests failing
- Test expects `SpecialProps` in output, but it's not generated

---

## Why I Made This Change

### My (Incorrect) Reasoning

I read the comment in `cli.ts` (lines 146-149):

```typescript
// NOTE: generateZodClientFromOpenAPI also dereferences internally, but we do it here for:
//   1. Clear intent at CLI boundary (file -> dereferenced object)
//   2. Fail-fast on invalid specs before invoking code generation
//   3. Historical consistency (dereference has always happened here)
```

I misinterpreted this comment to mean `generateZodClientFromOpenAPI` **should** dereference internally, so I added it.

### The Truth

The comment is **aspirational** or **outdated** - it describes what the CLI _wants_ to happen, not what actually happens. The code at Phase 0 completion did NOT have internal dereferencing.

---

## The Real Architecture (How It Actually Works)

### Component Schema Preservation

`SwaggerParser.dereference()` has special behavior:

1. **Operation-level refs** (parameters, requestBody, responses): RESOLVED to actual objects
2. **Component schema refs** (inside schemas): MAY BE PRESERVED (implementation-dependent)

Example after `dereference()`:

```typescript
{
  components: {
    schemas: {
      Address: {
        type: 'object',
        properties: { street: { type: 'string' } }
      },
      User: {
        type: 'object',
        properties: {
          address: { $ref: '#/components/schemas/Address' }  // ← Ref preserved!
        }
      }
    }
  }
}
```

This allows dependency tracking while still resolving operation-level refs.

### Why This Matters

**Value of Component Schema `$ref` Preservation:**

1. **Named Type Extraction**: When we see `{ $ref: '#/components/schemas/User' }` in a response, we know to export `const User = z.object(...)`
2. **Dependency Ordering**: `User → Address` relationship tells us to define `Address` before `User`
3. **Circular Detection**: `Node → Node` refs indicate we need `z.lazy()`
4. **Code Reuse**: Multiple endpoints can reference `User` schema by name instead of duplicating

---

## Solution Options

### Option 1: Remove Internal Dereference (RECOMMENDED)

**Change:**

```typescript
// Remove lines 157-162 from generateZodClientFromOpenAPI
const data = getZodClientTemplateContext(openApiDoc, effectiveOptions);
```

**Pros:**

- Restores working behavior
- Callers control when/if to dereference
- CLI already dereferences (one clear location)
- Programmatic users can dereference if needed

**Cons:**

- Callers must handle `$ref`s (but this was always the case)
- Requires updating documentation

**User Impact:**

```typescript
// Programmatic usage with refs
import SwaggerParser from '@apidevtools/swagger-parser';

const spec = await SwaggerParser.dereference('./api.yaml'); // User dereferences
const result = await generateZodClientFromOpenAPI({
  openApiDoc: spec,
  disableWriteToFile: true,
});
```

### Option 2: Conditional Dereferencing

**Change:**

```typescript
// Add option to control dereferencing
export type GenerateZodClientFromOpenApiArgs = {
  openApiDoc: OpenAPIObject;
  shouldDereference?: boolean; // Default: false
  // ... other options
};

const doc = shouldDereference ? await SwaggerParser.dereference(openApiDoc) : openApiDoc;
```

**Pros:**

- Explicit control
- Backward compatible (default: false)

**Cons:**

- Adds API surface complexity
- Users must understand the implications

### Option 3: Smart Schema Tracking

**Change:**
Track which schemas came from components before dereferencing:

```typescript
const componentSchemaNames = new Set(Object.keys(openApiDoc.components?.schemas ?? {}));
const dereferencedDoc = await SwaggerParser.dereference(openApiDoc);

// Pass metadata about which schemas should be named
const data = getZodClientTemplateContext(dereferencedDoc, {
  ...effectiveOptions,
  namedSchemas: componentSchemaNames,
});
```

**Pros:**

- Maintains convenience of internal dereferencing
- Preserves schema naming information

**Cons:**

- Complex to implement correctly
- Requires structural comparison to match inline schemas to component schemas
- Fragile (what if schema is modified slightly during dereference?)

---

## Recommended Action

**Remove the internal `dereference()` call** (Option 1).

### Rationale

1. **Simplicity**: One clear dereferencing location (CLI)
2. **Explicitness**: Caller controls when dereferencing happens
3. **Working Code**: Restores Phase 0 behavior (86/88 tests passing)
4. **Value Preservation**: Maintains `$ref`s needed for proper schema extraction

### User Experience

**CLI users:** No change (CLI already dereferences)

**Programmatic users with external refs:**

```typescript
// Before (won't work with external refs)
const result = await generateZodClientFromOpenAPI({
  openApiDoc: rawSpec, // May have external refs
  disableWriteToFile: true,
});

// After (explicit dereferencing)
const spec = await SwaggerParser.dereference('./api.yaml');
const result = await generateZodClientFromOpenAPI({
  openApiDoc: spec, // All refs resolved
  disableWriteToFile: true,
});
```

**Programmatic users with internal refs only:**

```typescript
// Works both before and after (no change needed)
const spec = {
  openapi: '3.0.0',
  components: { schemas: { User: {...} } },
  paths: {
    '/users': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      }
    }
  }
};

const result = await generateZodClientFromOpenAPI({
  openApiDoc: spec,
  disableWriteToFile: true,
});
```

---

## Key Insights

### What `$ref` Preservation Provides (The "Why")

**Not about passing tests** - it's about **code quality and maintainability**:

1. **Named Types = Reusability**
   - `const User = z.object(...)` can be imported and reused
   - Inline schemas cannot be extracted or reused

2. **Dependency Ordering = Correct Topological Sort**
   - Know that `Address` must be defined before `User`
   - Prevents "ReferenceError: Address is not defined"

3. **Circular Detection = Proper `z.lazy()` Usage**
   - `Node → Node` means we need `z.lazy(() => Node)`
   - Without refs, we can't detect this

4. **Code Size = Performance**
   - Named schema used 10 times = 1 definition
   - Inline schema used 10 times = 10 duplications

### The Fundamental Pattern

OpenAPI specs use `$ref`s as a **semantic signal**:

- "This schema is important enough to be named"
- "This schema might be used in multiple places"
- "This schema is part of the API's core domain model"

When we dereference everything, we lose this semantic signal and treat all schemas as equivalent inline definitions.

---

## Next Steps

1. ✅ Commit and tag current state (`phase1-wip-investigation`)
2. ✅ Tag working Phase 0 state (`phase0-complete-working`)
3. ⏭️ Remove internal `dereference()` call
4. ⏭️ Update documentation to clarify programmatic usage
5. ⏭️ Verify all tests pass
6. ⏭️ Complete Phase 1 with this lesson learned

---

## Lessons Learned

1. **Read code, not comments**: The comment in `cli.ts` was aspirational/outdated
2. **Test before changing**: Should have run tests before committing
3. **Understand the "why"**: `$ref` preservation isn't arbitrary - it serves real value
4. **Small steps**: Adding internal dereferencing was a large behavioral change
5. **Question assumptions**: "The CLI does X, so the library should too" was wrong

---

## Documentation Updates Needed

### README.md

Add section on programmatic usage:

```markdown
### Programmatic Usage

If your OpenAPI spec contains external `$ref`s (e.g., `$ref: './schemas/user.yaml'`),
you must dereference it before passing to `generateZodClientFromOpenAPI`:

\`\`\`typescript
import SwaggerParser from '@apidevtools/swagger-parser';
import { generateZodClientFromOpenAPI } from 'openapi-zod-client';

// Dereference external refs
const spec = await SwaggerParser.dereference('./openapi.yaml');

const result = await generateZodClientFromOpenAPI({
openApiDoc: spec,
disableWriteToFile: true,
});
\`\`\`

Specs with only internal refs (`#/components/schemas/...`) work without dereferencing.
```

### API Documentation

Update JSDoc for `generateZodClientFromOpenAPI`:

```typescript
/**
 * @param openApiDoc - OpenAPI 3.0 document. If it contains external `$ref`s,
 *   dereference it first using `SwaggerParser.dereference()`.
 */
```
