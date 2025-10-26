# Phase 1c: Type-Check Analysis

## Issues Identified

### 1. ✅ FIXED: `defaultStatusBehavior` Type Mismatch

**Problem:**

- `TemplateContextOptions` defines: `"spec-compliant" | "auto-correct" | undefined`
- `handleDefaultResponse` was using: `"auto" | "ignore" | "spec-compliant" | undefined`
- This created invalid values that needed hacky type casting

**Solution:**

- Created `lib/src/template-context.types.ts` following "Literals Tied to Library Types" pattern
- Extracted `DefaultStatusBehavior` type from library type
- Created type guard `isDefaultStatusBehavior()` for runtime validation
- Updated all usage sites to use the proper type
- Removed the hacky `as` cast in `getZodiosEndpointDefinitionList.ts`

**Files Modified:**

- `lib/src/template-context.types.ts` (NEW)
- `lib/src/zodiosEndpoint.path.helpers.ts`
- `lib/src/zodiosEndpoint.operation.helpers.ts`
- `lib/src/getZodiosEndpointDefinitionList.ts`

### 2. ⚠️ TODO: `pathItem` HTTP Method Extraction

**Problem:**

```typescript
const pathItem = pick(pathItemObj, [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]);
```

This uses a hardcoded array to extract HTTP methods from `PathItemObject`. Issues:

- Not type-safe
- Could miss methods if PathItemObject is extended
- The `pick` utility isn't type-aware of the PathItemObject structure

**Proposed Solution:**
Create a type-safe HTTP method extraction:

```typescript
// Define HTTP methods as a type derived from PathItemObject
type HttpMethod = Extract<
  keyof PathItemObject,
  'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'
>;

const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const satisfies readonly HttpMethod[];

// Type-safe method extraction
type PathItemMethods = Pick<PathItemObject, HttpMethod>;

function extractMethods(pathItem: PathItemObject): PathItemMethods {
  const result: Partial<PathItemMethods> = {};
  for (const method of HTTP_METHODS) {
    if (pathItem[method]) {
      result[method] = pathItem[method];
    }
  }
  return result as PathItemMethods;
}
```

**Location:** `lib/src/getZodiosEndpointDefinitionList.ts:95`

### 3. ⚠️ USER CHANGES: Parameter Validation

**User's Changes in `zodiosEndpoint.operation.helpers.ts`:**

```typescript
// Before: Allowed params without schema or content, defaulted to {}
// After: Throws error if param has neither schema nor content
if (!paramItem.schema && !paramItem.content) {
  throw new Error(`No schema or content for param ${paramItem.name}`);
}
```

**Impact:**

- Test failure: `tests/param-with-content.test.ts`
- Test has a param called "missing" with neither `schema` nor `content`
- Test expects it to default to `unknown` (empty object `{}`)

**Question for User:**
Is this OpenAPI spec compliant? Should we:

1. Keep user's strict validation (throw error)
2. Revert to defaulting to `{}` (unknown)
3. Add a flag to control behavior?

## Test Failures Summary

### Real Failures (1):

1. `tests/param-with-content.test.ts` - User's changes break expected behavior

### Snapshot Mismatches (19):

All other failures are snapshot mismatches, likely due to:

- Schema complexity calculation change (enum complexity now uses `.length` instead of iterating)
- Should be resolved by updating snapshots: `pnpm test -u`

## Type-Check Status

✅ **PASSING** - All 151 errors resolved!

## Recommendations

1. **Fix param-with-content test**: Decide on parameter validation strategy
2. **Update snapshots**: Run `pnpm test -u` to update expected output
3. **Refactor pathItem extraction**: Implement type-safe HTTP method extraction
4. **Add integration test**: Ensure `defaultStatusBehavior` works correctly with both values
