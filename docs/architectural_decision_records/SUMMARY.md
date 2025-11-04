# Phase 2 Part 1 Architectural Decisions Summary

**Date:** November 4, 2025  
**Phase:** Phase 2 Part 1 - Scalar Pipeline Re-architecture  
**Status:** Sessions 1 & 2 Complete, Session 3 Ready

---

## Executive Summary

Phase 2 Part 1 introduces a fundamental re-architecture of how `openapi-zod-validation` processes OpenAPI specifications. The changes establish a **3.1-first internal type system** powered by the **Scalar ecosystem**, replacing the legacy SwaggerParser-based pipeline.

### Key Outcomes

✅ **Single Type System:** All code uses OpenAPI 3.1 types exclusively  
✅ **Rich Metadata:** Full visibility into bundling process (files, URLs, warnings)  
✅ **Type Safety:** Intersection types + type guards eliminate casting  
✅ **Future-Proof:** Ready for 3.1 features and JSON Schema alignment  
✅ **Cleaner Code:** Eliminated version branching and conditional logic

---

## The Four Pillars

### 1. OpenAPI 3.1-First Architecture ([ADR-018](./ADR-018-openapi-3.1-first-architecture.md))

**Decision:** Normalize all OpenAPI documents to version 3.1 immediately after bundling.

**Impact:**
- Single internal type system (no version branching)
- Automatic 3.0 → 3.1 upgrades via `@scalar/openapi-parser/upgrade`
- All conversion/template code assumes 3.1 semantics
- Simplified nullable checks: `type: ['string', 'null']`
- Simplified exclusive bounds: `exclusiveMinimum: 5` (number, not boolean)

**Migration:**
- 50+ files updated from `openapi3-ts/oas30` to `openapi3-ts/oas31`
- Test fixtures modernized to 3.1 syntax
- Conversion logic updated for 3.1 patterns

### 2. Scalar Pipeline Adoption ([ADR-019](./ADR-019-scalar-pipeline-adoption.md))

**Decision:** Replace `@apidevtools/swagger-parser` with Scalar ecosystem.

**New Stack:**
- `@scalar/json-magic@0.7.0` - Bundling with lifecycle hooks
- `@scalar/openapi-parser@0.23.0` - Upgrade, validate, sanitize
- `@scalar/openapi-types@0.5.1` - Extension-friendly types

**Impact:**
- Rich metadata tracking (files, URLs, warnings, external refs)
- Deterministic bundling with `$ref` resolution control
- Built-in 3.0 → 3.1 upgrade mechanism
- AJV-backed validation with detailed errors
- Preserved vendor extensions (`x-ext`, `x-ext-urls`)

**New API:**
```typescript
const result = await loadOpenApiDocument(input);
// result.document: BundledOpenApiDocument (strict types + extensions)
// result.metadata: BundleMetadata (files, URLs, warnings)
```

### 3. Intersection Type Strategy ([ADR-020](./ADR-020-intersection-type-strategy.md))

**Decision:** Use intersection types to combine Scalar's loose types with strict `openapi3-ts` types.

**Core Type:**
```typescript
type BundledOpenApiDocument = OpenAPIV3_1.Document & OpenAPIObject;
```

**Impact:**
- Best of both worlds: strict typing + extension access
- No casting required (type guards provide narrowing)
- Full IntelliSense for both type systems
- Validated at runtime boundaries
- Compliant with `.agent/RULES.md` (no type escape hatches)

**Pattern:**
```typescript
const { specification } = upgrade(bundled);
if (!isBundledOpenApiDocument(specification)) {
  throw new Error('Invalid OpenAPI 3.1 document');
}
// Now TypeScript knows it's BundledOpenApiDocument
```

### 4. Legacy Dependency Removal ([ADR-021](./ADR-021-legacy-dependency-removal.md))

**Decision:** Remove `openapi-types@12.1.3` and `@apidevtools/swagger-parser@10.1.0`.

**Impact:**
- Single type system (no conflicts)
- No type casting at boundaries
- Clearer intent and reduced confusion
- Smaller bundle (~200KB removed)
- Active maintenance (Scalar ecosystem)

**Guard:**
```bash
pnpm test:scalar-guard  # Fails if legacy imports detected
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Input: string | URL | OpenAPIObject (3.0 or 3.1)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ ADR-002: Scalar Pipeline                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ @scalar/json-magic/bundle()                             │ │
│ │ - readFiles() plugin → track filesystem                 │ │
│ │ - fetchUrls() plugin → track HTTP                       │ │
│ │ - Lifecycle hooks → preserve internal $refs             │ │
│ └─────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ ADR-001: OpenAPI 3.1-First                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ @scalar/openapi-parser/upgrade()                        │ │
│ │ - Convert 3.0 → 3.1 (nullable, exclusiveMin/Max, etc.) │ │
│ │ - Align with JSON Schema Draft 2020-12                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ ADR-003: Intersection Type Strategy                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Type Guard: isBundledOpenApiDocument()                  │ │
│ │ - Runtime validation (no casting)                       │ │
│ │ - Narrows to BundledOpenApiDocument                     │ │
│ │   (OpenAPIV3_1.Document & OpenAPIObject)                │ │
│ └─────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Output: LoadedOpenApiDocument                               │
│ - document: BundledOpenApiDocument (strict + extensions)    │
│ - metadata: BundleMetadata (files, URLs, warnings)          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Downstream: Conversion, Templates, Dependency Graph         │
│ - All code uses openapi3-ts/oas31 types                     │
│ - No version branching                                       │
│ - Access to Scalar metadata for debugging                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Status

### ✅ Session 1: Foundation & Guards (Complete)

**Deliverables:**
- [x] Scalar dependencies added (`@scalar/json-magic`, `@scalar/openapi-parser`, `@scalar/openapi-types`)
- [x] Type system migrated (all imports changed to `openapi3-ts/oas31`)
- [x] Legacy dependencies removed (`openapi-types`, `@apidevtools/swagger-parser`)
- [x] Guard test created (`lib/src/validation/scalar-guard.test.ts`)
- [x] Usage inventory documented in plan

**Files Changed:** 50+ files across conversion, context, shared, rendering layers

### ✅ Session 2: Loading & Bundling (Complete)

**Deliverables:**
- [x] `loadOpenApiDocument` implemented with Scalar pipeline
- [x] `BundledOpenApiDocument` intersection type defined
- [x] `isBundledOpenApiDocument` type guard implemented
- [x] Bundle metadata types and tracking implemented
- [x] Characterisation tests added (single-file and multi-file specs)
- [x] API surface exported with comprehensive TSDoc
- [x] `prepareOpenApiDocument` updated to use Scalar internally

**New Files:**
- `lib/src/shared/load-openapi-document.ts` (251 lines)
- `lib/src/shared/load-openapi-document.test.ts` (241 lines)
- `lib/src/shared/bundle-metadata.types.ts` (types)
- `lib/examples/openapi/multi-file/` (test fixtures)

### ⚠️ Session 3: Type System Cleanup (Ready to Start)

**Current State:**
- 77 type errors across 21 files
- 18 lint errors across 10 files

**Remediation Plan:**
1. Create `isNullableType()` helper for 3.1 nullable checks → fixes 16 errors
2. Modernize test fixtures from 3.0 to 3.1 syntax → fixes 47 errors
3. Fix Vitest v4 mock typing → fixes 16 errors
4. Skip/rewrite SwaggerParser tests → fixes 18 errors
5. Add undefined guards for optional properties → fixes 5 errors

**Target:** 0 type errors, 0 lint errors, 0 `@ts-expect-error` pragmas

**Detailed plan:** See `PHASE-2-MCP-ENHANCEMENTS.md` Session 3

### ⚪ Session 4+: Integration & Cleanup (Planned)

**Objectives:**
- Remove SwaggerParser guard (all tests passing)
- Update README/API docs
- Document follow-up opportunities

---

## Code Examples

### Before (Legacy Pipeline)

```typescript
import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI } from 'openapi-types';
import type { OpenAPIObject } from 'openapi3-ts/oas30';

async function prepareOpenApiDocument(input: string | OpenAPIObject) {
  // Limited metadata, no upgrade, type casting required
  const bundled = await SwaggerParser.bundle(input);
  return bundled as OpenAPIObject; // ❌ Type escape hatch
}

// Conversion logic with version branching
function handleNullable(schema: SchemaObject) {
  // ❌ Need to handle both 3.0 and 3.1
  if (schema.nullable) {
    // 3.0 style
  } else if (Array.isArray(schema.type) && schema.type.includes('null')) {
    // 3.1 style
  }
}
```

### After (Scalar Pipeline)

```typescript
import { bundle } from '@scalar/json-magic/bundle';
import { upgrade } from '@scalar/openapi-parser/upgrade';
import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

async function loadOpenApiDocument(
  input: string | URL | OpenAPIObject
): Promise<LoadedOpenApiDocument> {
  // Rich metadata, automatic upgrade, no casting
  const bundled = await bundle(input, config);
  const { specification } = upgrade(bundled);
  
  if (!isBundledOpenApiDocument(specification)) {
    throw new Error('Invalid OpenAPI 3.1 document');
  }
  
  return {
    document: specification, // ✅ Type: BundledOpenApiDocument
    metadata: createMetadata(...) // ✅ Files, URLs, warnings
  };
}

// Conversion logic simplified (3.1 only)
function handleNullable(schema: SchemaObject) {
  // ✅ Only need to handle 3.1 style
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  return types.includes('null');
}
```

---

## Benefits Realized

### For Developers

✅ **Simpler Code:** No version branching, single type system  
✅ **Better IntelliSense:** Full autocomplete for OpenAPI properties  
✅ **Type Safety:** No casting, runtime validation at boundaries  
✅ **Easier Testing:** Single set of 3.1 fixtures  
✅ **Clear Patterns:** Intersection types + type guards

### For Users

✅ **Transparent:** Both 3.0 and 3.1 inputs still accepted  
✅ **Automatic Upgrades:** 3.0 specs normalized to 3.1  
✅ **Better Errors:** Detailed validation messages from AJV  
✅ **Richer Output:** Access to bundle metadata if needed  
✅ **Future-Proof:** Ready for 3.1 features (webhooks, etc.)

### For Maintenance

✅ **Active Ecosystem:** Scalar actively developed  
✅ **Fewer Dependencies:** Removed competing type systems  
✅ **Better Tests:** Characterisation suite ensures parity  
✅ **Guard Protection:** Prevents regression to legacy imports  
✅ **Clear Documentation:** ADRs capture decisions and rationale

---

## Next Steps

### Immediate (Session 3)

1. **Run diagnostics:**
   ```bash
   pnpm type-check  # See all 77 errors
   pnpm lint        # See all 18 errors
   ```

2. **Follow Session 3 plan** in `PHASE-2-MCP-ENHANCEMENTS.md`:
   - Create `isNullableType()` helper
   - Modernize test fixtures
   - Fix Vitest mocks
   - Skip/rewrite SwaggerParser tests
   - Add undefined guards

3. **Verify quality gates:**
   ```bash
   pnpm type-check  # Target: 0 errors
   pnpm lint        # Target: 0 errors
   pnpm test        # Target: all passing
   ```

### Future (Session 4+)

1. **Complete integration:**
   - Remove SwaggerParser guard
   - Update documentation
   - Document follow-up opportunities

2. **Enable Part 2:**
   - MCP enhancements
   - JSON Schema export
   - Security metadata

---

## References

### ADRs
- [ADR-018: OpenAPI 3.1-First Architecture](./ADR-018-openapi-3.1-first-architecture.md)
- [ADR-019: Scalar Pipeline Adoption](./ADR-019-scalar-pipeline-adoption.md)
- [ADR-020: Intersection Type Strategy](./ADR-020-intersection-type-strategy.md)
- [ADR-021: Legacy Dependency Removal](./ADR-021-legacy-dependency-removal.md)

### Planning Documents
- `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` - Detailed session plan
- `.agent/context/context.md` - Current status
- `.agent/context/continuation_prompt.md` - Rehydration prompt
- `.agent/RULES.md` - Development standards

### External Resources
- [OpenAPI 3.1.0 Specification](https://spec.openapis.org/oas/v3.1.0)
- [Scalar GitHub Repository](https://github.com/scalar/scalar)
- [openapi3-ts Library](https://github.com/metadevpro/openapi3-ts)
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)

---

**Last Updated:** November 4, 2025  
**Phase:** Phase 2 Part 1 - Sessions 1 & 2 Complete, Session 3 Ready  
**Next Milestone:** Session 3 - Type System Cleanup (0 type errors, 0 lint errors)

