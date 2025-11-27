# Test Helpers

Reusable test utilities for working with `openapi-zod-client` types in test code.

## Generation Result Assertions

The `generation-result-assertions.ts` module provides helpers for working with `GenerationResult` discriminated unions.

### Why These Helpers Exist

`GenerationResult` is a **discriminated union** with two variants:

```typescript
type GenerationResult =
  | { type: 'single'; content: string; path?: string }
  | { type: 'grouped'; files: Record<string, string>; paths: string[] };
```

**The Problem:** Without type narrowing, you can't access variant-specific fields:

```typescript
// ❌ BROKEN: Calling string method on union type
const result = await generateZodClientFromOpenAPI({...});
expect(result).toMatch(/import/);
// TypeError: result.toMatch is not a function
// (result is a union, not a string)
```

**The Solution:** Use type guards to narrow the union before accessing fields:

```typescript
// ✅ FIXED: Proper type narrowing
import { assertSingleFileResult } from '../tests-helpers/generation-result-assertions.js';

const result = await generateZodClientFromOpenAPI({...});
assertSingleFileResult(result); // Type guard + assertion
expect(result.content).toMatch(/import/); // Type-safe access to content
```

### Available Helpers

#### `assertSingleFileResult(result)`

**Purpose:** Assert that result is a single file result, narrow type

**Usage:**

```typescript
import { assertSingleFileResult } from '../tests-helpers/generation-result-assertions.js';

const result = await generateZodClientFromOpenAPI({...});
assertSingleFileResult(result);

// Now TypeScript knows result.content exists
expect(result.content).toContain('import { z } from "zod"');
expect(result.content).toMatch(/export const.*Schema/);
```

**What it does:**

- Checks `result.type === 'single'`
- Throws descriptive error if grouped
- Narrows TypeScript type to single file variant

#### `assertGroupedFileResult(result)`

**Purpose:** Assert that result is a grouped file result, narrow type

**Usage:**

```typescript
import { assertGroupedFileResult } from '../tests-helpers/generation-result-assertions.js';

const result = await generateZodClientFromOpenAPI({
  groupStrategy: { type: 'tag' },
});
assertGroupedFileResult(result);

// Now TypeScript knows result.files exists
expect(result.files['users']).toBeDefined();
expect(Object.keys(result.files)).toHaveLength(3);
```

**What it does:**

- Checks `result.type === 'grouped'`
- Throws descriptive error if single file
- Narrows TypeScript type to grouped file variant

#### `extractContent(result)`

**Purpose:** Safely extract content string from single file result

**Usage:**

```typescript
import { extractContent } from '../tests-helpers/generation-result-assertions.js';

const result = await generateZodClientFromOpenAPI({...});
const content = extractContent(result); // Throws if grouped

expect(content).toContain('export');
```

**What it does:**

- Calls `assertSingleFileResult()` internally
- Returns `result.content` if single file
- Throws if grouped (explicit error vs. undefined)

#### `extractFiles(result)`

**Purpose:** Safely extract files record from grouped file result

**Usage:**

```typescript
import { extractFiles } from '../tests-helpers/generation-result-assertions.js';

const result = await generateZodClientFromOpenAPI({
  groupStrategy: { type: 'tag' },
});
const files = extractFiles(result); // Throws if single file

expect(files['users']).toContain('UserSchema');
expect(files['posts']).toContain('PostSchema');
```

**What it does:**

- Calls `assertGroupedFileResult()` internally
- Returns `result.files` if grouped
- Throws if single file (explicit error vs. undefined)

## Common Patterns

### Pattern 1: Single File Test

```typescript
import { assertSingleFileResult } from '../tests-helpers/generation-result-assertions.js';

test('generates zod schema', async () => {
  const result = await generateZodClientFromOpenAPI({
    openApiDoc: petstore,
  });

  assertSingleFileResult(result);
  expect(result.content).toMatch(/import.*from ['"]zod['"]/);
  expect(result.content).toContain('export const PetSchema');
});
```

### Pattern 2: Grouped File Test

```typescript
import { assertGroupedFileResult } from '../tests-helpers/generation-result-assertions.js';

test('generates grouped files by tag', async () => {
  const result = await generateZodClientFromOpenAPI({
    openApiDoc: petstore,
    groupStrategy: { type: 'tag' },
  });

  assertGroupedFileResult(result);
  expect(result.paths).toContain('pets.ts');
  expect(result.files['pets']).toContain('PetSchema');
});
```

### Pattern 3: Inline Snapshot with Content

```typescript
import { extractContent } from '../tests-helpers/generation-result-assertions.js';

test('generates expected output', async () => {
  const result = await generateZodClientFromOpenAPI({...});
  const content = extractContent(result);

  expect(content).toMatchInlineSnapshot(`...`);
});
```

### Pattern 4: Multiple Assertions on Content

```typescript
import { assertSingleFileResult } from '../tests-helpers/generation-result-assertions.js';

test('includes all expected elements', async () => {
  const result = await generateZodClientFromOpenAPI({...});
  assertSingleFileResult(result);

  const { content } = result; // Destructure after narrowing

  expect(content).toContain('import { z }');
  expect(content).toContain('export const UserSchema');
  expect(content).toContain('export const PostSchema');
  expect(content).toMatch(/z\.string\(\)\.describe\(/);
});
```

## Why Not Use Type Guards Directly?

You _can_ use the type guards from `generation-result.ts` directly:

```typescript
import { isSingleFileResult } from '../rendering/generation-result.js';

const result = await generateZodClientFromOpenAPI({...});
if (!isSingleFileResult(result)) {
  throw new Error('Expected single file result');
}
expect(result.content).toMatch(/import/);
```

However, the assertion helpers are better because:

1. **Consistent error messages** - All tests use same descriptive errors
2. **Less boilerplate** - One line instead of 3-4
3. **Descriptive failures** - Shows what was received (file count, paths)
4. **Extraction helpers** - `extractContent()` / `extractFiles()` for terseness

## Migration Guide

### Before (Broken)

```typescript
const result = await generateZodClientFromOpenAPI({...});
expect(result).toMatch(/import/); // ❌ TypeError
```

### After (Fixed)

```typescript
import { assertSingleFileResult } from '../tests-helpers/generation-result-assertions.js';

const result = await generateZodClientFromOpenAPI({...});
assertSingleFileResult(result);
expect(result.content).toMatch(/import/); // ✅ Works
```

### Complex Before (Verbose)

```typescript
import { isSingleFileResult } from '../rendering/generation-result.js';

const result = await generateZodClientFromOpenAPI({...});
if (!isSingleFileResult(result)) {
  throw new Error('Expected single file');
}
const content = result.content;
expect(content).toContain('import');
expect(content).toContain('export');
```

### Complex After (Terse)

```typescript
import { extractContent } from '../tests-helpers/generation-result-assertions.js';

const result = await generateZodClientFromOpenAPI({...});
const content = extractContent(result);
expect(content).toContain('import');
expect(content).toContain('export');
```

## TypeScript Benefits

These helpers provide **type narrowing** through TypeScript assertion functions:

```typescript
function assertSingleFileResult(
  result: GenerationResult,
): asserts result is Extract<GenerationResult, { type: 'single' }> {
  // ...
}
```

The `asserts` keyword tells TypeScript that after this function returns,
the `result` parameter is guaranteed to be a single file result. This enables:

1. **Compile-time safety** - Can't access `.files` after `assertSingleFileResult()`
2. **IntelliSense** - IDE shows only valid fields after assertion
3. **Refactoring safety** - Type errors if union structure changes

## See Also

- `lib/src/rendering/generation-result.ts` - Type definitions and type guards
- TypeScript Handbook § Discriminated Unions - Official pattern documentation
- `.agent/RULES.md` § Type Safety - Project type discipline standards
