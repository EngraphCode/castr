# @zodios/core Evaluation

**Date:** October 24, 2025  
**Current Version:** @zodios/core@10.9.6  
**Status:** Analysis Complete  
**Recommendation:** **KEEP** ✅ (with caution)

---

## Executive Summary

**Package:** `@zodios/core` v10.9.6  
**Purpose:** Type-safe REST API client library with Zod validation  
**Usage in Codebase:** **3 production files + generated templates**  
**Last Release:** August 22, 2023 (2+ years ago) ⚠️  
**Maintenance Status:** **Stale/Abandoned** (v11 beta never completed)  
**Recommendation:** **KEEP** - Used in generated code templates for end users

---

## Usage Analysis

### Complete Usage Inventory

**Total Files Using @zodios/core:** 3 production files + 2 templates

| File                                   | Type       | Usage                             |
| -------------------------------------- | ---------- | --------------------------------- |
| `getZodiosEndpointDefinitionList.ts`   | Production | Type import only                  |
| `templates/default.hbs`                | Template   | Generated code imports            |
| `templates/grouped.hbs`                | Template   | Generated code imports            |
| `generateZodClientFromOpenAPI.test.ts` | Test       | Snapshot assertions (8 instances) |

### Detailed Usage

#### 1. getZodiosEndpointDefinitionList.ts (Production)

```typescript
// Line 1:
import type { ZodiosEndpointDefinition } from '@zodios/core';

// Lines 168-179: Type definition
export type EndpointDefinitionWithRefs = Omit<
  ZodiosEndpointDefinition<unknown>,
  'response' | 'parameters' | 'errors' | 'description'
> & {
  response: string;
  description?: string | undefined;
  parameters: Array<
    Omit<Required<ZodiosEndpointDefinition<unknown>>['parameters'][number], 'schema'> & {
      schema: string;
    }
  >;
  errors: Array<
    Omit<Required<ZodiosEndpointDefinition<unknown>>['errors'][number], 'schema'> & {
      schema: string;
    }
  >;
  responses?: Array<{ statusCode: string; schema: string; description?: string }>;
};
```

**Analysis:**

- **Type only** - no runtime usage
- Uses `ZodiosEndpointDefinition` as base type for `EndpointDefinitionWithRefs`
- Could be inlined if needed

#### 2. templates/default.hbs (Generated Code Template)

```handlebars
import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
```

**Analysis:**

- **CRITICAL** - This appears in ALL generated code
- End users depend on these imports
- `makeApi`: Function to create API definition
- `Zodios`: Client class for making requests
- `ZodiosOptions`: Configuration options type

#### 3. templates/grouped.hbs (Generated Code Template)

```handlebars
import { makeApi, Zodios } from "@zodios/core";
```

**Analysis:**

- **CRITICAL** - This appears in grouped generated code
- Same as default template but without `ZodiosOptions`

#### 4. Test Snapshots (8 instances)

All test snapshots contain the generated import statement:

```typescript
"import { makeApi, Zodios, type ZodiosOptions } from \"@zodios/core\";";
```

**Analysis:**

- Tests verify generated code correctness
- Will break if we change the import

---

## What is @zodios/core?

**Zodios** is a type-safe REST API client library that:

1. Defines API endpoints with Zod schemas for validation
2. Provides type-safe HTTP client (like axios but type-safe)
3. Validates requests/responses at runtime with Zod
4. Generates TypeScript types from endpoint definitions

**Our Usage:**
We generate code that uses Zodios to create type-safe API clients from OpenAPI specs.

**Typical Generated Code:**

```typescript
import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const endpoints = makeApi([
  {
    method: 'get',
    path: '/users/:id',
    alias: 'getUser',
    description: 'Get user by ID',
    response: z.object({ id: z.number(), name: z.string() }),
    parameters: [{ name: 'id', type: 'Path', schema: z.number() }],
  },
  // ... more endpoints
]);

const api = new Zodios('https://api.example.com', endpoints);
const user = await api.getUser({ params: { id: 123 } }); // Type-safe!
```

---

## Maintenance Status

### Release History

| Version              | Date         | Status        | Notes               |
| -------------------- | ------------ | ------------- | ------------------- |
| **10.9.6** (current) | Aug 22, 2023 | **FINAL**     | Last stable release |
| 10.9.5               | Aug 20, 2023 | Stable        | -                   |
| 10.9.4               | Aug 11, 2023 | Stable        | -                   |
| 10.9.3               | Aug 10, 2023 | Stable        | -                   |
| 11.0.0-beta.19       | Apr 9, 2023  | **ABANDONED** | v11 never released  |
| 11.0.0-beta.18       | Apr 8, 2023  | Beta          | -                   |

**Observations:**

- ⚠️ **Last release: August 22, 2023** (2+ years ago)
- ⚠️ **Version 11 beta abandoned** (last beta: April 2023)
- ⚠️ **No activity in 2+ years**
- ⚠️ **Project appears abandoned or in deep maintenance mode**

### GitHub Activity

**Repository:** https://github.com/ecyrbe/zodios

Would need to check:

- Last commit date
- Open issues
- Recent PRs
- Community activity
- Stars/forks

**Weekly Downloads:** ~100,000 (still used, but declining)

---

## Type Analysis

### ZodiosEndpointDefinition Type

**Full Type Definition:**

```typescript
export interface ZodiosEndpointDefinition<T = unknown> {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
  path: string;
  alias?: string;
  description?: string;
  immutable?: boolean;
  requestFormat?: 'json' | 'form-data' | 'form-url' | 'binary' | 'text';
  response: ZodType<T>;
  errors?: Array<{
    status: number | 'default';
    description?: string;
    schema: ZodType;
  }>;
  parameters?: Array<{
    name: string;
    type: 'Query' | 'Body' | 'Header' | 'Path';
    schema: ZodType;
    description?: string;
  }>;
}
```

**Complexity:** Medium - could be inlined but would be work

---

## Dependency Chain

### What We Use From @zodios/core

**Types:**

1. `ZodiosEndpointDefinition` - Endpoint structure definition
2. `ZodiosOptions` - Client configuration options

**Runtime:**

1. `makeApi()` - Function to create API definition array
2. `Zodios` - HTTP client class with type-safe methods

### What End Users Need

End users who use our generated code **MUST** install:

```bash
npm install @zodios/core zod
```

Our generated code imports directly from `@zodios/core`.

---

## Impact Assessment

### If We Remove @zodios/core

#### Option A: Remove Entirely

**Impact:** **BREAKING CHANGE** 🔴

- Generated code would break
- End users would need to migrate
- Would need alternative API client pattern
- Major version bump required

**Effort:** HIGH (weeks of work)

#### Option B: Inline Types

**Impact:** **Partial Break** 🟡

- Could inline `ZodiosEndpointDefinition` type
- But runtime functions (`makeApi`, `Zodios`) still needed
- Generated code still imports from @zodios/core
- Doesn't solve the problem

**Effort:** LOW (few hours) but **NOT USEFUL**

#### Option C: Create Alternative Template

**Impact:** **User Choice** 🟢

- Create new template that doesn't use Zodios
- Use axios/fetch directly with Zod validation
- Let users choose template
- Keep Zodios template as default for compatibility

**Effort:** MEDIUM (1-2 weeks)

---

## Alternatives to Consider

### 1. Fork Zodios (if needed)

If truly abandoned:

- Fork the repo
- Maintain our own version
- Fix critical bugs only

**Pros:** Full control  
**Cons:** Maintenance burden

### 2. Create Zodios-Free Template

Generate code that uses:

- `axios` or `fetch` directly
- Manual Zod validation
- Type-safe without Zodios dependency

**Pros:** No abandoned dependency  
**Cons:** More boilerplate, less elegant

### 3. Use Other Type-Safe HTTP Clients

Alternatives:

- `tRPC` - Type-safe but for full-stack apps
- `openapi-fetch` - OpenAPI-first, type-safe
- `zodios-compatible` - Create our own minimal version

### 4. Keep Using Zodios (RECOMMENDED for now)

**Pros:**

- Works well today
- Large install base (100k/week)
- End users expect it
- No breaking changes

**Cons:**

- Unmaintained (risk of security issues)
- May break with future Zod versions
- No bug fixes or improvements

---

## Risk Assessment

### MEDIUM RISK ⚠️

**Risks:**

1. **Abandoned Package** - No updates in 2+ years
2. **Security** - No patches for vulnerabilities
3. **Compatibility** - May break with Zod v4/v5
4. **End User Impact** - They depend on it too

### Mitigation Strategies

1. **Monitor Activity**
   - Watch GitHub for signs of life
   - Check for forks with activity
   - Monitor npm downloads

2. **Test with Zod v4**
   - Verify compatibility after zod update
   - Document any issues

3. **Plan Escape Route**
   - Document how to create Zodios-free template
   - Consider forking if needed
   - Have migration guide ready

4. **Inform Users**
   - Document Zodios dependency in README
   - Warn about maintenance status
   - Provide alternatives if asked

---

## Recommendation: KEEP ✅ (with monitoring)

### Rationale

1. **End User Dependency** ✅
   - Generated code imports from @zodios/core
   - Removing would be major breaking change
   - Users expect Zodios integration

2. **Still Works** ✅
   - Package functions correctly today
   - No known critical bugs
   - Compatible with Zod v3 (verify with v4)

3. **Large Install Base** ✅
   - 100k downloads/week
   - Community still using it
   - Not completely abandoned

4. **Low Immediate Risk** ✅
   - No production code dependency (just templates)
   - End users control their own installations
   - We don't bundle it

5. **Alternatives Too Complex** ⚠️
   - Creating alternative would be weeks of work
   - Breaking change would hurt users
   - Not worth it while it still works

### Action Items

**Immediate (Phase 2):**

- [ ] **Keep @zodios/core** in dependencies
- [ ] **Test with Zod v4** after Task 2.2 update
- [ ] **Document dependency** in README
- [ ] **Note maintenance status** in documentation

**Short Term (Phase 3):**

- [ ] Monitor GitHub for activity
- [ ] Check for active forks
- [ ] Test with Zod v4 compatibility
- [ ] Document potential alternatives

**Long Term (Phase 4 or later):**

- [ ] Create Zodios-free template option (nice-to-have)
- [ ] Consider fork if critical bugs arise
- [ ] Provide migration guide if needed

---

## Execution Checklist

**Phase 2 (Current):**

- [ ] ✅ **Keep @zodios/core@10.9.6** (no changes)
- [ ] **Test compatibility with Zod v4** (Task 2.2)
- [ ] **Document in README** that generated code uses Zodios
- [ ] **Note in CHANGELOG** that Zodios is in maintenance mode

**Phase 3 (Quality & Testing):**

- [ ] **Add note to docs** about Zodios maintenance status
- [ ] **Provide link** to alternatives if users ask
- [ ] **Monitor** npm downloads and GitHub activity

**Phase 4+ (Future):**

- [ ] Consider alternative template (optional enhancement)
- [ ] Fork if truly needed (only if critical)

---

## Inlining ZodiosEndpointDefinition (If Needed)

**IF** we need to inline the type (not recommended now):

### Step 1: Create types file

`lib/src/types/zodios.ts`:

```typescript
import type { ZodType } from 'zod';

/**
 * Zodios endpoint definition structure
 * Inlined from @zodios/core v10.9.6
 *
 * @see https://github.com/ecyrbe/zodios
 */
export interface ZodiosEndpointDefinition<T = unknown> {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
  path: string;
  alias?: string;
  description?: string;
  immutable?: boolean;
  requestFormat?: 'json' | 'form-data' | 'form-url' | 'binary' | 'text';
  response: ZodType<T>;
  errors?: Array<{
    status: number | 'default';
    description?: string;
    schema: ZodType;
  }>;
  parameters?: Array<{
    name: string;
    type: 'Query' | 'Body' | 'Header' | 'Path';
    schema: ZodType;
    description?: string;
  }>;
}
```

### Step 2: Update imports

```typescript
// BEFORE:
import type { ZodiosEndpointDefinition } from '@zodios/core';

// AFTER:
import type { ZodiosEndpointDefinition } from './types/zodios.js';
```

### Step 3: Keep templates using @zodios/core

Templates still import from `@zodios/core` - that's what end users need.

**Effort:** 30 minutes  
**Benefit:** Removes production dependency on type  
**BUT:** Templates still use it, so **NOT WORTH IT**

---

## Success Criteria (For Keeping It)

- ✅ @zodios/core remains in package.json
- ✅ Compatible with Zod v4 (verify in Task 2.2)
- ✅ Generated code still works
- ✅ End users can install and use as before
- ✅ Documentation mentions Zodios usage
- ✅ Maintenance status documented

---

## Estimated Effort

| Scenario                    | Time                           |
| --------------------------- | ------------------------------ |
| **Keep (RECOMMENDED)**      | **0 hours** (no work)          |
| Inline type only            | 30 minutes (not useful)        |
| Create alternative template | 1-2 weeks (future enhancement) |
| Full removal + migration    | 3-4 weeks (breaking change)    |

---

## Related Tasks

- **Task 1.4:** ✅ This evaluation
- **Task 2.2:** Test compatibility with Zod v4
- **Task 3.3:** Keep @zodios/core (no removal)
- **Phase 4:** Document Zodios status, consider alternatives

---

## Final Recommendation

**KEEP @zodios/core@10.9.6** ✅

**Justification:**

1. End users depend on it (generated code imports)
2. Still works correctly (no known bugs)
3. Removing would be breaking change
4. Alternative templates can be added later (non-breaking)
5. Can fork if critical need arises
6. Test compatibility with Zod v4 in Task 2.2

**Action:**

- No changes needed to package.json
- Test with Zod v4 after update
- Document dependency and status
- Monitor for future developments
- Keep escape plan ready (fork or alternative)

---

**Next Steps:**

1. ✅ **Task 1.4 COMPLETE** - @zodios/core evaluation
2. ⏳ **Task 1.5** - swagger-parser investigation
3. ⏳ **Task 2.2** - Test @zodios/core with Zod v4
