# Zodios Usage Audit - Phase 1 Part 3

**Date:** October 28, 2025  
**Purpose:** Document all @zodios/core usage for complete removal

---

## 📊 Summary

**Total References:** 76 matches across 16 files

**Breakdown:**

- **Type imports:** 1 file (`ZodiosEndpointDefinition`)
- **Templates:** 2 files (Zodios client generation)
- **Tests:** 5 files (testing Zodios behavior/output)
- **Helper files:** 3 files (named with "zodios" prefix)
- **Main files:** 5 files (using Zodios types/functions)

---

## 🎯 Migration Strategy

### Phase 1: Type Replacement (Easy)

**File:** `getZodiosEndpointDefinitionList.ts`

- **Current:** `import type { ZodiosEndpointDefinition } from '@zodios/core'`
- **Replace with:** Local `EndpointDefinition` type
- **Impact:** Type-only, no runtime changes

**Type structure to replicate:**

```typescript
export interface EndpointDefinition {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
  path: string;
  alias?: string;
  description?: string;
  requestFormat?: 'json' | 'form-data' | 'form-url' | 'binary' | 'text';
  response: string; // Zod schema as string
  errors?: Array<{
    status: number | 'default';
    description?: string;
    schema: string;
  }>;
  parameters?: Array<{
    name: string;
    type: 'Query' | 'Body' | 'Header' | 'Path';
    schema: string;
    description?: string;
  }>;
  responses?: Array<{
    statusCode: string;
    schema: string;
    description?: string;
  }>;
}
```

### Phase 2: Delete Zodios Templates (Easy)

**Files to delete:**

- `lib/src/templates/default.hbs` - Zodios client template
- `lib/src/templates/grouped.hbs` - Zodios grouped template

**Impact:** Breaking change for users using these templates

- Users must switch to `schemas-with-metadata` or new `schemas-with-client` template

### Phase 3: Rename Files (Easy)

**Files to rename:**

- `getZodiosEndpointDefinitionList.ts` → `getEndpointDefinitionList.ts`
- `zodiosEndpoint.helpers.ts` → `endpoint.helpers.ts`
- `zodiosEndpoint.operation.helpers.ts` → `endpoint.operation.helpers.ts`
- `zodiosEndpoint.path.helpers.ts` → `endpoint.path.helpers.ts`
- `zodiosEndpoint.*.test.ts` → `endpoint.*.test.ts`

**Reason:** Remove "Zodios" naming now that we're framework-agnostic

### Phase 4: Update Tests (Medium)

**Files requiring test updates:**

- `characterisation/programmatic-usage.char.test.ts`
- `characterisation/generation.char.test.ts`
- `templates/schemas-with-metadata.test.ts` - Already has "no Zodios" assertions!
- All renamed test files

**Changes:**

- Remove Zodios import expectations
- Update snapshots for new template output
- Keep behavior tests (endpoints, schemas, validation)

### Phase 5: Create Simple Client Template (Complex, New)

**New file:** `lib/src/templates/schemas-with-client.hbs`

**Generate:**

```typescript
import { z } from "zod";

// Schemas
export const UserSchema = z.object({...});

// Endpoint metadata
export const endpoints = [...];

// Simple fetch-based client
export class ApiClient {
  constructor(private baseUrl: string, private config?: RequestInit) {}

  async getUser(params: { id: string }): Promise<User> {
    // Path param substitution
    // Request validation
    // Fetch call
    // Response validation
    // Return typed result
  }

  // ... more methods
}

export const createClient = (baseUrl: string, config?: RequestInit) =>
  new ApiClient(baseUrl, config);
```

---

## 📋 Detailed File Inventory

### Production Code (Type Imports)

**`lib/src/getZodiosEndpointDefinitionList.ts`**

- Line 1: `import type { ZodiosEndpointDefinition } from '@zodios/core'`
- Line 203-220: `EndpointDefinitionWithRefs` extends `ZodiosEndpointDefinition`
- **Action:** Replace with local `EndpointDefinition` type
- **Effort:** 30-60 min (TDD required)

---

### Templates (Generate Zodios Code)

**`lib/src/templates/default.hbs`**

- Line 1: Imports `makeApi, Zodios, ZodiosOptions` from @zodios/core
- Generates: `const endpoints = makeApi([...])`
- Generates: `export const api = new Zodios(endpoints)`
- **Action:** DELETE (replace with schemas-with-client)
- **Effort:** 5 min

**`lib/src/templates/grouped.hbs`**

- Line 1: Imports `makeApi, Zodios` from @zodios/core
- Similar Zodios client generation
- **Action:** DELETE
- **Effort:** 5 min

---

### Helper Files (Named "Zodios")

**`lib/src/zodiosEndpoint.helpers.ts`**

- No @zodios/core imports!
- Just named "zodios" for historical reasons
- **Action:** RENAME to `endpoint.helpers.ts`
- **Effort:** 5 min + update imports

**`lib/src/zodiosEndpoint.operation.helpers.ts`**

- No @zodios/core imports!
- **Action:** RENAME to `endpoint.operation.helpers.ts`
- **Effort:** 5 min + update imports

**`lib/src/zodiosEndpoint.path.helpers.ts`**

- No @zodios/core imports!
- References `EndpointDefinitionWithRefs` type
- **Action:** RENAME to `endpoint.path.helpers.ts`
- **Effort:** 5 min + update imports

---

### Main Files (Using Zodios Types)

**`lib/src/template-context.ts`**

- Line 17-18: Imports `EndpointDefinitionWithRefs`, `getZodiosEndpointDefinitionList`
- Line 77: Calls `getZodiosEndpointDefinitionList()`
- Comments reference `ZodiosEndpointDefinition`
- **Action:** Update imports after rename
- **Effort:** 5 min

**`lib/src/index.ts`**

- Line 8-9: Exports `EndpointDefinitionWithRefs`, `getZodiosEndpointDefinitionList`
- **Action:** Update exports after rename
- **Effort:** 2 min

**`lib/src/generateZodClientFromOpenAPI.ts`**

- Likely references the endpoint function
- **Action:** Update imports after rename
- **Effort:** 5 min

**`lib/src/cli.ts`**

- Likely references the endpoint function
- **Action:** Update imports after rename
- **Effort:** 5 min

---

### Test Files

**`lib/src/characterisation/programmatic-usage.char.test.ts`**

- Tests programmatic API usage
- **Action:** Update for new names, verify behavior unchanged
- **Effort:** 15 min

**`lib/src/characterisation/generation.char.test.ts`**

- Tests code generation output
- **Action:** Update snapshots for new template output
- **Effort:** 30 min

**`lib/src/templates/schemas-with-metadata.test.ts`**

- Line 60: Asserts NO @zodios/core import (already passing!)
- Line 304: Asserts NO Zodios client
- **Action:** Keep as-is, already validates Zodios-free output!
- **Effort:** 0 min (already correct!)

**`lib/src/zodiosEndpoint.*.test.ts`** (3 files)

- Test endpoint processing logic
- **Action:** RENAME, update to use new type names
- **Effort:** 30 min total

---

## 🎯 Dependency Removal

**After all code changes:**

```bash
cd lib
pnpm remove @zodios/core
```

**Expected result:**

- Zero peer dependency warnings (Zod 4 compatible!)
- Package size reduced
- Cleaner dependency tree

---

## ⚠️ Breaking Changes

**For library users:**

1. **Template deprecation:**
   - `default` template → Use `schemas-with-client` (new simple client)
   - `grouped` template → No direct replacement

2. **API renames:**
   - `getZodiosEndpointDefinitionList` → `getEndpointDefinitionList`
   - `EndpointDefinitionWithRefs` → `EndpointDefinition`

3. **Generated code:**
   - No more Zodios client imports
   - Must use simple fetch client or bring your own

**Migration guide needed:** YES

---

## ✅ Success Criteria

**Code:**

- ✅ Zero `@zodios/core` imports
- ✅ Zero "Zodios" in type/function names (except deprecated markers)
- ✅ All tests passing (669/669)

**Dependencies:**

- ✅ `@zodios/core` removed from package.json
- ✅ No peer dependency warnings

**Quality:**

- ✅ Type-check: 0 errors
- ✅ Lint: ≤99 issues (no regression)
- ✅ All quality gates GREEN

**Generated output:**

- ✅ Simple fetch client working
- ✅ No Zodios imports in generated code
- ✅ Full type safety maintained

---

## 🕐 Time Estimates

**Task 3.1: Audit** ✅ COMPLETE (30 min actual)
**Task 3.2: Type replacement** (1 hour)
**Task 3.3: Delete templates** (30 min)
**Task 3.4: Simple client template** (2-3 hours) ⭐ Main work
**Task 3.5: File renames & imports** (30 min)
**Task 3.6: Test updates** (1 hour)
**Task 3.7: Remove dependency** (15 min)
**Task 3.8: Final validation** (1 hour)

**Total:** 6-8 hours (slightly revised from 4-6, more thorough)

---

**Next:** Begin Task 3.2 - Define local `EndpointDefinition` type (TDD)
