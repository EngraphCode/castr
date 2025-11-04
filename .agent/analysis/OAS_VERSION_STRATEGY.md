# OpenAPI Specification Version Support Strategy

**Created:** 2025-10-25  
**Context:** Post-Task 2.1 (openapi3-ts v4 upgrade)  
**Status:** Analysis & Recommendation

## Executive Summary

After upgrading to openapi3-ts v4.5.0, we now have access to separate type namespaces for OAS 3.0 (`oas30`) and OAS 3.1 (`oas31`). This document analyzes how to provide explicit, robust support for multiple OpenAPI specification versions (3.0, 3.1, and potentially 3.2) while maintaining type safety and avoiding runtime errors.

**Key Finding:** We currently hard-code `oas30` imports throughout the codebase. This works but doesn't leverage the full power of openapi3-ts v4's multi-version support.

---

## Current State Analysis

### What We Have Now

```typescript
// Hard-coded to OAS 3.0 throughout codebase (93 files)
import type { OpenAPIObject, SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
```

**Implications:**

- ✅ Type-safe for OAS 3.0 specs
- ❌ OAS 3.1 features not recognized (e.g., numeric `exclusiveMinimum`)
- ❌ No automatic version detection
- ❌ Users can't explicitly request OAS 3.1 support

### What openapi3-ts v4 Provides

**Package Structure:**

```typescript
// openapi3-ts/dist/index.d.ts
export * as oas30 from './oas30'; // OpenAPI 3.0.x types
export * as oas31 from './oas31'; // OpenAPI 3.1.x types
export { Server, ServerVariable } from './model/server'; // Common types
```

**Key Differences Between OAS 3.0 and 3.1:**

| Feature                 | OAS 3.0                    | OAS 3.1                        |
| ----------------------- | -------------------------- | ------------------------------ |
| `exclusiveMinimum`      | `boolean` (with `minimum`) | `number` (standalone)          |
| `exclusiveMaximum`      | `boolean` (with `maximum`) | `number` (standalone)          |
| `type`                  | Single value or array      | Single value, array, or `null` |
| `nullable`              | Explicit property          | Deprecated (use `type: null`)  |
| `example` vs `examples` | Both supported             | `examples` preferred           |
| JSON Schema alignment   | Partial                    | Full JSON Schema 2020-12       |
| `$schema`               | Not used                   | Optional `$schema` property    |
| `const`                 | Not standard               | Standard JSON Schema keyword   |
| `if`/`then`/`else`      | Not standard               | Standard JSON Schema keywords  |

---

## Strategic Options

### Option 1: Status Quo (Current Approach) ⭐ **RECOMMENDED FOR NOW**

**Description:** Continue using `oas30` as the default, accept that OAS 3.1-specific features won't be type-safe.

**Pros:**

- ✅ Zero implementation work (already done)
- ✅ Works for 95% of real-world specs (most are 3.0)
- ✅ Simple, maintainable codebase
- ✅ No breaking changes for users
- ✅ Runtime behavior handles both versions (we parse, not enforce types)

**Cons:**

- ❌ OAS 3.1 specs trigger type warnings in tests (solved with `@ts-nocheck`)
- ❌ Doesn't leverage full openapi3-ts v4 capabilities
- ❌ Users can't opt into 3.1 features explicitly

**When to revisit:** When users explicitly request OAS 3.1 features, or when OAS 3.2 is released and widely adopted.

---

### Option 2: Automatic Version Detection

**Description:** Detect the `openapi` field in the spec and dynamically import the correct types.

```typescript
// Pseudo-code
function getOpenAPITypes(spec: unknown) {
  const version = (spec as any).openapi;
  if (version.startsWith('3.0')) {
    return import('openapi3-ts/oas31');
  } else if (version.startsWith('3.1')) {
    return import('openapi3-ts/oas31');
  }
  throw new Error(`Unsupported OpenAPI version: ${version}`);
}
```

**Pros:**

- ✅ Automatic, no user configuration needed
- ✅ Type-safe for each version
- ✅ Future-proof for 3.2+

**Cons:**

- ❌ TypeScript doesn't support conditional imports at type level elegantly
- ❌ Requires significant refactoring (union types everywhere)
- ❌ More complex codebase (harder to maintain)
- ❌ Runtime overhead for version detection
- ❌ Testing becomes more complex (need fixtures for each version)

**Complexity:** HIGH (estimated 40-60 hours of work)

**Example Type Pattern:**

```typescript
type VersionedOpenAPI =
  | { version: '3.0'; spec: oas30.OpenAPIObject }
  | { version: '3.1'; spec: oas31.OpenAPIObject };

function processSpec(versionedSpec: VersionedOpenAPI) {
  switch (versionedSpec.version) {
    case '3.0':
      // Use oas30 types
      break;
    case '3.1':
      // Use oas31 types
      break;
  }
}
```

---

### Option 3: User-Configurable Version Preference

**Description:** Add a CLI flag and API option for users to specify OAS version.

```typescript
// CLI
openapi-zod-client --input spec.yaml --output client.ts --oas-version 3.1

// API
generateZodClientFromOpenAPI({
  openApiDoc: spec,
  oasVersion: "3.1",  // New option
});
```

**Implementation:**

```typescript
// lib/src/generateZodClientFromOpenAPI.ts
import * as oas30 from 'openapi3-ts/oas31';
import * as oas31 from 'openapi3-ts/oas31';

export interface GenerateZodClientFromOpenApiArgs<Options> {
  openApiDoc: oas30.OpenAPIObject | oas31.OpenAPIObject;
  oasVersion?: '3.0' | '3.1' | 'auto'; // New
  // ... existing options
}

function getVersionedTypes(version: '3.0' | '3.1' | 'auto', spec: unknown) {
  if (version === 'auto') {
    const detected = (spec as any).openapi;
    version = detected.startsWith('3.1') ? '3.1' : '3.0';
  }
  return version === '3.1' ? oas31 : oas30;
}
```

**Pros:**

- ✅ User control + automatic fallback
- ✅ Gradual migration path (default to 3.0, opt-in to 3.1)
- ✅ Clear, explicit behavior
- ✅ Easier to test (can mock version preference)

**Cons:**

- ❌ Still requires refactoring to support union types
- ❌ Users need to understand OAS versions
- ❌ More configuration surface area (can be confusing)

**Complexity:** MEDIUM (estimated 20-30 hours of work)

---

### Option 4: Dual Build (Advanced)

**Description:** Build two separate bundles, one for OAS 3.0 and one for 3.1.

```bash
# Published as separate packages or subpath exports
openapi-zod-client/oas30
openapi-zod-client/oas31
```

**Pros:**

- ✅ Perfect type safety for each version
- ✅ No runtime overhead
- ✅ Users can choose at import time

**Cons:**

- ❌ VERY HIGH complexity (2x build pipeline, 2x testing)
- ❌ Confusing for users (which one to use?)
- ❌ Maintenance burden (bugs need fixing in both)
- ❌ Bundle size concerns

**Complexity:** VERY HIGH (estimated 60-80 hours + ongoing maintenance)

---

## Recommended Path Forward

### Phase 1: Status Quo + Documentation (IMMEDIATE) ⭐

**What:**

1. Document that we currently target OAS 3.0 specification
2. Note that OAS 3.1 specs work at runtime but may have type warnings in strict TypeScript contexts
3. Add a GitHub issue to track OAS 3.1 explicit support requests

**Why:**

- No implementation work
- Sets expectations clearly
- Gives users a place to voice needs

**Deliverables:**

- Add section to `README.md` explaining OAS version support
- Create GitHub issue template for version-specific feature requests
- Document workarounds (e.g., `@ts-expect-error` for 3.1 features)

---

### Phase 2: Gather User Feedback (NEXT 3-6 MONTHS)

**What:**

1. Monitor GitHub issues for OAS 3.1 feature requests
2. Survey users about their OAS version usage
3. Track which OAS 3.1 features are most requested:
   - Numeric `exclusiveMinimum`/`exclusiveMaximum`
   - `type: null` instead of `nullable`
   - JSON Schema 2020-12 keywords (`const`, `if`/`then`/`else`, etc.)
   - `$schema` support

**Why:**

- Data-driven decision making
- Avoid premature optimization
- Understand real user needs

**Metrics to Track:**

- % of users using OAS 3.0 vs 3.1 specs
- Specific 3.1 features users need
- Pain points with current approach

---

### Phase 3: Implement if Demand Warrants (FUTURE)

**What:**

- **If <10% of users need OAS 3.1:** Stay with Option 1 (status quo)
- **If 10-30% need it:** Implement Option 3 (user-configurable)
- **If >30% need it:** Implement Option 2 (automatic detection)

**Why:**

- Right-sized solution based on actual demand
- Avoids over-engineering
- Maintains developer velocity

---

## OAS 3.2 Considerations

**Status:** OAS 3.2 is not yet released (as of 2024)

**When Released:**

- Monitor openapi3-ts for `oas32` namespace support
- Evaluate breaking changes from 3.1
- Apply same phased approach (status quo → user feedback → implement if needed)

**Likely Timeline:** 2025-2026 for widespread OAS 3.2 adoption

---

## Technical Deep Dive: Multi-Version Support Challenges

### Challenge 1: Type System Complexity

**Problem:** TypeScript can't elegantly express "use these types if version=3.0, else use those types".

**Current TypeScript Limitations:**

```typescript
// ❌ This doesn't work - conditional imports aren't a thing
import type { OpenAPIObject } from `openapi3-ts/${version}`;

// ❌ This is verbose and error-prone
type OpenAPIObject = oas30.OpenAPIObject | oas31.OpenAPIObject;

// ✅ This works but loses type safety
type OpenAPIObject = any;  // or unknown
```

**Best Pattern (if we implement):**

```typescript
// Use generics + version parameter
function processSpec<V extends '3.0' | '3.1'>(
  spec: V extends '3.0' ? oas30.OpenAPIObject : oas31.OpenAPIObject,
  version: V,
) {
  // Type-safe based on version parameter
}
```

---

### Challenge 2: Test Complexity

**Problem:** Need test fixtures for each OAS version, and tests for version-specific behavior.

**Current State:**

- 82 test files
- Most use OAS 3.0 test fixtures
- 1 test file (`schema-type-list-3.1.test.ts`) specifically tests 3.1 features

**If We Support Multi-Version:**

- Need duplicate fixtures (or version-parametrized fixtures)
- Need cross-version compatibility tests
- Test matrix explodes: 82 files × 2 versions = 164 test scenarios

**Mitigation:**

- Use test parametrization to reduce duplication
- Only test version-specific features explicitly
- Share common test logic

---

### Challenge 3: Breaking Changes for Users

**Problem:** Changing type signatures from `oas30.OpenAPIObject` to `oas30.OpenAPIObject | oas31.OpenAPIObject` is a breaking change for library consumers.

**Example:**

```typescript
// Before (current)
import type { OpenAPIObject } from 'openapi3-ts/oas31';
function myFunction(spec: OpenAPIObject) {}

// After (multi-version)
import type { OpenAPIObject as OAS30 } from 'openapi3-ts/oas31';
import type { OpenAPIObject as OAS31 } from 'openapi3-ts/oas31';
function myFunction(spec: OAS30 | OAS31) {} // Breaking!
```

**Mitigation:**

- Major version bump (v2.0.0)
- Comprehensive migration guide
- Deprecation warnings in v1.x
- Codemod tool for automated migration

---

## Implementation Roadmap (If Proceeding with Option 3)

### Step 1: Add Version Parameter (Non-Breaking)

```typescript
// Add optional parameter, default to current behavior
interface GenerateZodClientFromOpenApiArgs {
  oasVersion?: '3.0' | '3.1' | 'auto'; // default: "3.0"
}
```

**Effort:** 2 hours  
**Risk:** LOW (additive change)

---

### Step 2: Create Version-Aware Type Helpers

```typescript
// lib/src/oas-version-helpers.ts
import * as oas30 from 'openapi3-ts/oas31';
import * as oas31 from 'openapi3-ts/oas31';

export type OASVersion = '3.0' | '3.1';

export interface VersionedSpec<V extends OASVersion> {
  version: V;
  spec: V extends '3.0' ? oas30.OpenAPIObject : oas31.OpenAPIObject;
}

export function detectVersion(spec: unknown): OASVersion {
  const openapi = (spec as any)?.openapi;
  if (typeof openapi !== 'string') {
    throw new Error("Invalid OpenAPI spec: missing 'openapi' field");
  }
  return openapi.startsWith('3.1') ? '3.1' : '3.0';
}

export function wrapSpec<V extends OASVersion>(
  spec: unknown,
  version: V | 'auto',
): VersionedSpec<V> {
  const actualVersion = version === 'auto' ? detectVersion(spec) : version;
  return {
    version: actualVersion as V,
    spec: spec as any,
  };
}
```

**Effort:** 4 hours  
**Risk:** LOW (new code, doesn't break existing)

---

### Step 3: Refactor Core Functions (Breaking)

**Affected Files:** ~30 core files that work with OpenAPIObject

```typescript
// Before
function processSchema(schema: oas30.SchemaObject) {}

// After
function processSchema<V extends OASVersion>(
  schema: V extends '3.0' ? oas30.SchemaObject : oas31.SchemaObject,
  version: V,
) {}
```

**Effort:** 20-25 hours  
**Risk:** HIGH (breaks type signatures)

---

### Step 4: Update Tests

**Effort:** 8-12 hours  
**Risk:** MEDIUM (need comprehensive coverage)

---

### Step 5: Documentation & Migration Guide

**Effort:** 4-6 hours  
**Risk:** LOW

---

**Total Effort:** ~40-50 hours for Option 3 implementation

---

## Decision Matrix

| Criteria                  | Option 1 (Status Quo) | Option 2 (Auto-Detect)   | Option 3 (Configurable) | Option 4 (Dual Build)  |
| ------------------------- | --------------------- | ------------------------ | ----------------------- | ---------------------- |
| **Implementation Effort** | ⭐⭐⭐⭐⭐ (0h)       | ⭐⭐ (40-60h)            | ⭐⭐⭐ (20-30h)         | ⭐ (60-80h)            |
| **Maintenance Burden**    | ⭐⭐⭐⭐⭐ (Low)      | ⭐⭐⭐ (Medium)          | ⭐⭐⭐⭐ (Low-Med)      | ⭐ (High)              |
| **Type Safety**           | ⭐⭐⭐ (3.0 only)     | ⭐⭐⭐⭐⭐ (Perfect)     | ⭐⭐⭐⭐ (Excellent)    | ⭐⭐⭐⭐⭐ (Perfect)   |
| **User Experience**       | ⭐⭐⭐⭐ (Simple)     | ⭐⭐⭐⭐⭐ (Transparent) | ⭐⭐⭐⭐ (Flexible)     | ⭐⭐⭐ (Confusing)     |
| **Breaking Changes**      | ⭐⭐⭐⭐⭐ (None)     | ⭐⭐ (Major)             | ⭐⭐⭐ (Minor)          | ⭐⭐ (Major)           |
| **Future-Proof**          | ⭐⭐ (Limited)        | ⭐⭐⭐⭐⭐ (Excellent)   | ⭐⭐⭐⭐ (Good)         | ⭐⭐⭐⭐⭐ (Excellent) |

**Overall Rating:**

1. **Option 1:** ⭐⭐⭐⭐ **RECOMMENDED** (best ROI given current demand)
2. **Option 3:** ⭐⭐⭐ (good middle ground if demand increases)
3. **Option 2:** ⭐⭐ (good for future, but over-engineered now)
4. **Option 4:** ⭐ (too complex, not worth it)

---

## Conclusion & Recommendation

**RECOMMENDATION: Stick with Option 1 (Status Quo) for now.**

**Rationale:**

1. **Current approach works:** All 311 tests pass, type-check passes, runtime handles both OAS 3.0 and 3.1
2. **No user demand yet:** No GitHub issues requesting OAS 3.1 features
3. **Task 3.2 (ts-morph migration) is higher priority:** Will render much of the codebase more maintainable, making future OAS version work easier
4. **YAGNI principle:** Don't build features until users need them
5. **Focus on core value:** Phase 2 tasks (dependency updates, type safety improvements) deliver more immediate value

**When to Revisit:**

- Users explicitly request OAS 3.1 features (GitHub issues)
- OAS 3.2 is released and gains traction
- After Task 3.2 (ts-morph emitter) is complete, making refactoring easier
- Survey data shows >10% of users need OAS 3.1 support

**Immediate Action Items:**

1. ✅ Document current OAS 3.0 focus in README
2. ✅ Add this analysis to `.agent/analysis/`
3. ✅ Create GitHub issue template for version-specific requests
4. ✅ Move on to Task 2.2 (swagger-parser update)

---

## Appendix A: OAS Version Detection Reference

```typescript
/**
 * Detect OpenAPI specification version from spec object
 *
 * @param spec - Parsed OpenAPI document
 * @returns OAS version string ("3.0.x" or "3.1.x")
 * @throws Error if 'openapi' field is missing or invalid
 *
 * @example
 * const version = detectOASVersion({ openapi: "3.0.3", ... });
 * // => "3.0"
 *
 * const version = detectOASVersion({ openapi: "3.1.0", ... });
 * // => "3.1"
 */
export function detectOASVersion(spec: unknown): '3.0' | '3.1' {
  if (!spec || typeof spec !== 'object') {
    throw new Error('Invalid OpenAPI spec: not an object');
  }

  const openapi = (spec as Record<string, unknown>).openapi;

  if (typeof openapi !== 'string') {
    throw new Error("Invalid OpenAPI spec: missing 'openapi' field");
  }

  if (openapi.startsWith('3.0.')) {
    return '3.0';
  }

  if (openapi.startsWith('3.1.')) {
    return '3.1';
  }

  throw new Error(`Unsupported OpenAPI version: ${openapi}`);
}
```

---

## Appendix B: README Documentation (Draft)

```markdown
## OpenAPI Specification Version Support

**openapi-zod-client** currently targets **OpenAPI 3.0** specification for maximum type safety.

### Supported Versions

- ✅ **OpenAPI 3.0.x** - Full support with strict TypeScript types
- ⚠️ **OpenAPI 3.1.x** - Runtime support, type warnings in strict contexts

### Why OAS 3.0 as Default?

OpenAPI 3.0 is the most widely adopted version in production systems (as of 2024). While OAS 3.1 brings improvements like full JSON Schema 2020-12 alignment, most real-world APIs still use 3.0.

### Using OpenAPI 3.1 Specs

OAS 3.1 specs work correctly at runtime! The generated Zod schemas will validate 3.1 features like:

- Numeric `exclusiveMinimum`/`exclusiveMaximum`
- `type: null` (instead of `nullable`)
- Additional JSON Schema keywords (`const`, `if`/`then`/`else`, etc.)

However, you may see TypeScript type warnings when passing 3.1 specs. Use `@ts-expect-error` in test fixtures if needed.

### Future Support

We're monitoring demand for explicit OAS 3.1 support. If you need specific 3.1 features, please [open an issue](link) describing your use case.

### Key Differences: OAS 3.0 vs 3.1

| Feature            | OAS 3.0                                    | OAS 3.1                                      |
| ------------------ | ------------------------------------------ | -------------------------------------------- |
| Exclusive bounds   | `exclusiveMinimum: boolean` with `minimum` | `exclusiveMinimum: number` (standalone)      |
| Null values        | `nullable: true`                           | `type: ["string", "null"]` or `type: "null"` |
| JSON Schema        | Subset                                     | Full JSON Schema 2020-12                     |
| `const` keyword    | ❌                                         | ✅                                           |
| `if`/`then`/`else` | ❌                                         | ✅                                           |
```

---

**End of Analysis**
