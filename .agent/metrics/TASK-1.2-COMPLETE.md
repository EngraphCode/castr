# Task 1.2 Complete: Current Dereferencing Strategy Understood

**Date:** October 26, 2025  
**Duration:** ~15 minutes  
**Status:** Investigation complete

---

## Summary

✅ **Task 1.2 COMPLETE** - Thoroughly investigated and documented current dereferencing strategy

---

## Key Findings

### 1. CLI Uses `SwaggerParser.bundle()` (NOT dereference!)

**Location:** `lib/src/cli.ts:146`

```typescript
const bundled: unknown = await SwaggerParser.bundle(input);
```

**Critical Discovery:**

- CLI uses **`bundle()`** NOT **`dereference()`**
- This is KEY to understanding the architecture!

**What `bundle()` Does:**

- ✅ Resolves **external** `$ref`s (refs to other files)
- ✅ Keeps **internal** `$ref`s (refs within the document)
- ✅ Validates the spec structure
- ✅ Returns a single-file spec

**Why This Matters:**

- Component schemas **DO** retain their `$ref`s after bundling
- This allows semantic naming (extract schema names from refs)
- This is why the first Phase 1 attempt failed - we added `dereference()` which removed ALL refs

---

### 2. `generateZodClientFromOpenAPI` Does NOT Dereference

**Location:** `lib/src/generateZodClientFromOpenAPI.ts`

**Findings:**

- ❌ No `SwaggerParser.bundle()` call
- ❌ No `SwaggerParser.dereference()` call
- ✅ Just accepts `OpenAPIObject` as-is
- ✅ Caller is responsible for bundling/dereferencing

**Documentation Example (line 65-69):**

```typescript
import SwaggerParser from '@apidevtools/swagger-parser';

const openApiDoc = await SwaggerParser.parse('./openapi.yaml');
// Caller can choose to bundle/dereference or not
```

**Design Decision:**

- Library is **spec-agnostic** - works with bundled OR dereferenced specs
- Flexibility for programmatic usage

---

### 3. `makeSchemaResolver` - The Type Lie

**Location:** `lib/src/makeSchemaResolver.ts:36-68`

**Interface:**

```typescript
getSchemaByRef(ref: string): SchemaObject | ReferenceObject
```

**What It Claims:**

- Returns `SchemaObject | ReferenceObject`
- Looks like it's for schemas only

**What It Actually Does:**

```typescript
const path = split.slice(1, -1).join('/');
const retrieved: unknown = get(doc, path.replace(...));
const map: Record<string, SchemaObject> = isSchemaRecord(retrieved) ? retrieved : {};
const schema = map[name];
return schema;
```

**The Lie:**

- Can accept **ANY** component ref (parameters, responses, requestBodies, schemas)
- Uses `lodash.get()` to navigate to ANY path in document
- Type guard `isSchemaRecord()` tries to validate but can be bypassed
- Return type claims `SchemaObject` but could be any component type

**Why This is Problematic:**

- ❌ Type lie forces downstream type assertions
- ❌ No distinction between schema refs and operation refs
- ❌ Caller can't know if ref is valid for schemas
- ❌ Creates architecture debt

---

## Architectural Insights

### Current Flow

```
CLI Input (file path)
  ↓
SwaggerParser.bundle()
  ↓ (resolves external refs, keeps internal refs)
Bundled OpenAPIObject
  ↓
generateZodClientFromOpenAPI()
  ↓
getZodClientTemplateContext()
  ↓
makeSchemaResolver(doc) ← Creates resolver
  ↓
Template uses ctx.resolver.getSchemaByRef()
```

### Why Component Schema Refs Are Preserved

1. **CLI uses `bundle()` not `dereference()`**
   - External refs resolved (files merged)
   - Internal refs preserved
2. **Component schemas need refs for naming**
   - `#/components/schemas/User` → extracts "User" as name
   - Without ref, schema is inline/anonymous
   - Semantic naming requires ref preservation

3. **Operation-level refs are resolved by bundle()**
   - Parameters, requestBody, responses dereferenced
   - Only schema refs in properties remain

---

## Why First Phase 1 Attempt Failed

### What We Did Wrong

Added internal `SwaggerParser.dereference()` call in `generateZodClientFromOpenAPI`:

```typescript
// ❌ WRONG - This was added in first attempt
const dereferenced = await SwaggerParser.dereference(openApiDoc);
```

**Result:**

- ALL refs removed (including component schema refs)
- Lost semantic information for named type extraction
- `User` schema became anonymous inline object
- 40/88 characterisation tests failed

### What We Should Do Instead

1. **NO internal dereferencing** - let callers control it
2. **Preserve component schema refs** - needed for naming
3. **Handle both bundled AND dereferenced specs** - be flexible
4. **Use conditional logic** - not `assertNotReference` everywhere

---

## Integration Strategy

### For Each File Update (Tasks 1.3-1.6)

**Pattern to follow:**

```typescript
// BEFORE (with makeSchemaResolver)
const schema = ctx.resolver.getSchemaByRef('#/components/schemas/User');

// AFTER (with component-access)
import { getSchemaFromComponents, resolveSchemaRef } from './component-access.js';

// Get schema (may be ref or resolved)
const schema = getSchemaFromComponents(ctx.doc, 'User');

// If you need the resolved schema (not ref)
const resolved = resolveSchemaRef(ctx.doc, schema);
```

**Key Differences:**

- Direct access to `doc.components.schemas`
- No type lies
- Explicit ref handling
- Type-safe throughout

---

## Verification

### CLI Behavior

```bash
# CLI uses bundle() automatically
pnpx openapi-zod-client ./spec.yaml -o output.ts

# Equivalent to:
const bundled = await SwaggerParser.bundle('./spec.yaml');
await generateZodClientFromOpenAPI({ openApiDoc: bundled, ... });
```

### Programmatic Usage

```typescript
// Option 1: Let caller bundle (current pattern)
const bundled = await SwaggerParser.bundle('./spec.yaml');
await generateZodClientFromOpenAPI({ openApiDoc: bundled, ... });

// Option 2: Let caller dereference
const dereferenced = await SwaggerParser.dereference('./spec.yaml');
await generateZodClientFromOpenAPI({ openApiDoc: dereferenced, ... });

// Option 3: Use raw spec (with internal refs only)
const spec = await SwaggerParser.parse('./spec.yaml');
await generateZodClientFromOpenAPI({ openApiDoc: spec, ... });
```

---

## Next Steps

**Current:** Ready for Task 1.3 - Update Template Context

**Approach:**

1. Remove `makeSchemaResolver` dependency from template-context.ts
2. Use `doc.components.schemas` directly
3. Use component-access functions where needed
4. Test after each change

---

**Investigation complete - ready to proceed with refactoring!**
