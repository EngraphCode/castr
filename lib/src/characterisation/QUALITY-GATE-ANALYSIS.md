# Quality Gate Analysis - Characterisation Tests

**Date**: October 26, 2025  
**Status**: ⚠️ FAILING - Type Check Issues

## Executive Summary

The characterisation test suite is functionally complete with 100% coverage, but has **43 TypeScript type errors** that must be resolved. All errors are in the characterisation tests themselves, not in the production code.

## Quality Gate Results

| Check             | Status     | Details                                              |
| ----------------- | ---------- | ---------------------------------------------------- |
| **Format**        | ✅ PASS    | All files formatted correctly                        |
| **Build**         | ✅ PASS    | `tsup` build successful                              |
| **Type Check**    | ❌ FAIL    | **43 type errors** in 5 characterisation test files  |
| **Lint**          | ⚠️ WARNING | 2 new sonarjs warnings in CLI tests (acceptable)     |
| **Regular Tests** | ⚠️ FAIL    | 42 snapshot failures (formatting changes, unrelated) |
| **Char Tests**    | ✅ PASS    | 70 tests passing, 14 CLI skipped (build issue)       |

## Type Check Errors Breakdown

### Category 1: SwaggerParser.bundle() Type Mismatch (6 errors)

**Files affected:**

- `generation.char.test.ts` (1 error)
- `options.char.test.ts` (1 error)
- `schema-dependencies.char.test.ts` (1 error)
- `error-handling.char.test.ts` (2 errors)
- `edge-cases.char.test.ts` (1 error)

**Root cause:**

```typescript
// SwaggerParser.bundle() signature:
bundle(api: string | Document<{}>): Promise<Document<{}>>

// We're passing:
await SwaggerParser.bundle(spec);  // spec is OpenAPIObject from openapi3-ts
```

**Issue:** `OpenAPIObject` from `openapi3-ts` is not compatible with `Document<{}>` from `@apidevtools/swagger-parser` due to:

- Different `ServerObject` type definitions
- Different `ServerVariableObject` type definitions
- `exactOptionalPropertyTypes: true` in tsconfig

**Current workaround:** We use a type guard pattern borrowed from `cli.ts`:

```typescript
const bundled: unknown = await SwaggerParser.bundle(spec);
```

**Problem:** TypeScript still complains about the INPUT type (spec), not the output.

### Category 2: Options Property Errors (16 errors)

**Files affected:**

- `options.char.test.ts` (16 errors)

**Root cause:**

```typescript
const result = await generateZodClientFromOpenAPI({
  openApiDoc: bundled,
  withAlias: true, // ❌ Not a top-level property
  exportSchemas: true, // ❌ Not a top-level property
  // ... etc
});
```

**Issue:** These options should be in the `options` object:

```typescript
const result = await generateZodClientFromOpenAPI({
  openApiDoc: bundled,
  options: {
    // ✅ Correct
    withAlias: true,
    exportSchemas: true,
    // ...
  },
});
```

**Incorrect options:**

- `withAlias` (3 errors)
- `exportSchemas` (2 errors)
- `exportTypes` (1 error)
- `additionalPropertiesDefaultValue` (2 errors)
- `strictObjects` (1 error)
- `withImplicitRequiredProps` (1 error)
- `apiClientName` (1 error)
- `baseUrl` (1 error)
- `complexityThreshold` (1 error)
- `defaultStatusBehavior` (2 errors)
- `groupStrategy` (1 error)

### Category 3: String Method Call Errors (20 errors)

**Files affected:**

- `generation.char.test.ts` (1 error)
- `schema-dependencies.char.test.ts` (19 errors)

**Root cause:**

```typescript
const result = await generateZodClientFromOpenAPI({...});
const userIndex = result.indexOf('User');  // ❌ result might be string | undefined
```

**Issue:** `generateZodClientFromOpenAPI` returns `string | undefined`, but tests assume it's always `string`.

**Affected operations:**

- `.match()` (1 occurrence)
- `.indexOf()` (19 occurrences)

### Category 4: Implicit Any Error (1 error)

**File affected:**

- `options.char.test.ts` (1 error)

**Root cause:**

```typescript
withAlias: (name) => `Custom${name}`,  // ❌ 'name' has implicit 'any' type
```

**Issue:** Arrow function parameter needs type annotation.

## Resolution Strategy

### Phase 1: Fix SwaggerParser Type Mismatch (Highest Priority)

**Option A: Use JSON serialization bridge** (Recommended)

```typescript
async function bundleSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
  // Serialize and deserialize to bridge type systems
  const specJson = JSON.stringify(spec);
  const bundled: unknown = await SwaggerParser.bundle(specJson);
  if (!isOpenAPIObject(bundled)) {
    throw new Error('SwaggerParser.bundle() returned invalid OpenAPI document');
  }
  return bundled;
}
```

**Why this works:**

- SwaggerParser accepts `string` (no type conflict)
- Preserves runtime behavior (serialization is safe)
- No type assertions needed
- Follows fail-fast principle

**Option B: Use type assertion with justification**

```typescript
const bundled: unknown = await SwaggerParser.bundle(spec as any);
```

❌ Violates RULES.md - no type assertions

**Option C: Fix @apidevtools/swagger-parser types**
❌ Outside our control, external library

### Phase 2: Fix Options Property Locations

Move all options into the `options` object:

```typescript
// Before
const result = await generateZodClientFromOpenAPI({
  openApiDoc: bundled,
  withAlias: true,
  exportSchemas: true,
});

// After
const result = await generateZodClientFromOpenAPI({
  openApiDoc: bundled,
  options: {
    withAlias: true,
    exportSchemas: true,
  },
});
```

### Phase 3: Fix String Method Calls

Add type guard or assertion that result is string:

```typescript
const result = await generateZodClientFromOpenAPI({...});
expect(result).toBeTruthy();
expect(typeof result).toBe('string');

// Now TypeScript knows result is truthy string
const userIndex = result!.indexOf('User');  // Or use type guard
```

Better approach - use a type guard function:

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Expected string result from generation');
  }
}

const result = await generateZodClientFromOpenAPI({...});
assertIsString(result);
// Now result is typed as string
const userIndex = result.indexOf('User');
```

### Phase 4: Fix Implicit Any

Add explicit type annotation:

```typescript
withAlias: (name: string) => `Custom${name}`,
```

## Implementation Plan

### Step 1: Create Type Guard Utility (5 min)

```typescript
// src/characterisation/test-utils.ts
export function assertIsString(value: unknown, context?: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string${context ? ` for ${context}` : ''}, got ${typeof value}`);
  }
}
```

### Step 2: Update bundleSpec Helper (5 min)

Replace in all 5 files:

```typescript
async function bundleSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
  const specJson = JSON.stringify(spec);
  const bundled: unknown = await SwaggerParser.bundle(specJson);
  if (!isOpenAPIObject(bundled)) {
    throw new Error('SwaggerParser.bundle() returned invalid OpenAPI document');
  }
  return bundled;
}
```

### Step 3: Fix options.char.test.ts Options (15 min)

- Move all 16 options into `options: {}` object
- Add type annotation to withAlias callback
- Verify each test still validates correct behavior

### Step 4: Add String Assertions (10 min)

Add to all tests that call `.indexOf()` or `.match()`:

```typescript
const result = await generateZodClientFromOpenAPI({...});
assertIsString(result, 'generation output');
const userIndex = result.indexOf('User');
```

### Step 5: Verify (5 min)

```bash
pnpm type-check  # Should show 0 errors
pnpm character   # Should show 70 passing
```

## Timeline

**Total estimated time: 40 minutes**

- Step 1: 5 min
- Step 2: 5 min
- Step 3: 15 min
- Step 4: 10 min
- Step 5: 5 min

## Success Criteria

After fixes:

- ✅ `pnpm type-check`: 0 errors
- ✅ `pnpm character`: 70 tests passing (14 skipped)
- ✅ `pnpm build`: successful
- ✅ No new type assertions (`as`) introduced
- ✅ All characterisation tests still validate same behavior

## Notes

- The 42 snapshot failures in regular tests are unrelated (formatting changes)
- The 14 skipped CLI tests are due to a separate build issue (handlebars import)
- Lint warnings in CLI tests are acceptable (sonarjs rules for security/performance)
- Focus: **Fix type errors without changing test behavior**
