# Living Context Document

**Last Updated:** November 5, 2025  
**Purpose:** Single source of truth for the modernization programme – current status, key decisions, and next actions.

---

> **Intended Impact**  
> Every consumer—CLI, programmatic API, or downstream MCP tooling—must experience the same predictable, spec‑compliant behaviour whenever they hand us an OpenAPI document. Valid specs sail straight through and produce deterministic artefacts; invalid specs fail fast with actionable guidance direct from the official schemas. Comprehensive tests and documentation make that contract boringly reliable, unlocking MCP automation and future extraction to Engraph.

---

## 🎉 Phase 2 Part 1: COMPLETE! 

**Phase 2 Part 1** (Scalar Pipeline Re-architecture) is **COMPLETE** with all 4 sessions delivered successfully. The legacy `SwaggerParser.bundle()` path has been fully replaced with a deterministic Scalar-driven pipeline. All quality gates are green (0 type errors, 0 lint errors, 0 skipped tests), and comprehensive documentation is in place.

## 🚨 Current Focus – Phase 2 Part 2: MCP Enhancements

We are now ready to begin **Phase 2 Part 2** (see `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`) which builds MCP-specific features on top of the Scalar pipeline foundation.

**Key Architectural Decision:** All OpenAPI documents are normalized to 3.1 after bundling via `@scalar/openapi-parser/upgrade`. The codebase uses `openapi3-ts/oas31` types exclusively, with an intersection type strategy (`OpenAPIV3_1.Document & OpenAPIObject`) that preserves Scalar's extensions while providing strict typing. Legacy `openapi-types@12.1.3` and `@apidevtools/swagger-parser` have been removed from dependencies.

**Type System Architecture:**

```
Input (3.0 or 3.1 spec: file, URL, or object)
    ↓
bundle() via @scalar/json-magic
    ↓ (resolves $refs, adds x-ext metadata)
upgrade() via @scalar/openapi-parser
    ↓ (normalizes to OpenAPI 3.1)
Validate & type as intersection
    ↓ (runtime boundary: loose → strict types)
BundledOpenApiDocument
    ↓ (strict openapi3-ts/oas31 + Scalar extensions)
Downstream code (conversion, templates, etc.)
```

**Key Principles:**

- Single internal type system: Always OpenAPI 3.1 after bundling
- Automatic upgrades: 3.0 specs transparently upgraded to 3.1
- Strict typing: All code uses `openapi3-ts/oas31` types
- No casting: Type guards provide narrowing at boundaries
- Extensions preserved: Scalar's `x-ext`, `x-ext-urls` available for debugging
- Boundary validation: Scalar uses `Record<string, unknown>` (their escape hatch), we validate at the boundary with type guards

### Phase 2 Part 1 Completed Objectives

1. **Session 1: Foundation & Guardrails (✅ Complete)**
   - ✅ Audited every `prepareOpenApiDocument` caller (CLI + programmatic) and documented expectations around `$ref`s and error surfaces.
   - ✅ Added `@scalar/json-magic@0.7.0`, `@scalar/openapi-parser@0.23.0`, and `@scalar/openapi-types@0.5.1` with pinned versions.
   - ✅ Introduced lint/test guard (`lib/src/validation/scalar-guard.test.ts`) that flags any residual SwaggerParser usage.
   - ✅ Type system migrated: All imports changed from `openapi3-ts/oas30` to `openapi3-ts/oas31` throughout the codebase.
   - ✅ Legacy dependencies removed: `openapi-types@12.1.3` and `@apidevtools/swagger-parser` removed from `lib/package.json` and lockfile cleaned.

2. **Session 2: Loading & Bundling (✅ Complete)**
   - ✅ Implemented `loadOpenApiDocument` using `@scalar/json-magic/bundle` with `readFiles()`/`fetchUrls()` plugins.
   - ✅ Configured lifecycle hooks that preserve internal `$ref`s while consolidating externals under `x-ext`.
   - ✅ Store bundle metadata (filesystem entries, bundle warnings, entrypoint filename) for downstream consumers.
   - ✅ Added characterisation tests for single-file and multi-file specs.
   - ✅ Integrated `@scalar/openapi-parser/upgrade` to normalize all specs to OpenAPI 3.1.
   - ✅ Refined types to use intersection pattern (`BundledOpenApiDocument = OpenAPIV3_1.Document & OpenAPIObject`).
   - ✅ Implemented type guard `isBundledOpenApiDocument` for boundary validation.
   - ✅ Exported new API surface with comprehensive TSDoc.
   - ✅ Updated `prepareOpenApiDocument` to use new Scalar pipeline internally.

3. **Session 3: Complete Technical Resolution (✅ Complete)**
   - ✅ Created `isNullableType()` helper function (16 errors resolved)
   - ✅ Modernized all test fixtures from OpenAPI 3.0 to 3.1 syntax (47 errors resolved)
   - ✅ Fixed Vitest v4 mock typing in loader tests (16 errors resolved)
   - ✅ Migrated ALL tests to use Scalar pipeline (18 errors resolved)
   - ✅ Unskipped all tests (4 tests fixed, 0 skipped tests remaining)
   - ✅ Updated JSDoc examples to use `prepareOpenApiDocument`
   - ✅ **Result:** 0 type errors, 0 lint errors, ALL tests passing

4. **Session 4: Documentation & Final Cleanup (✅ Complete)**
   - ✅ Created comprehensive architecture documentation:
     - `.agent/architecture/SCALAR-PIPELINE.md` (~3,000 words)
     - `.agent/architecture/OPENAPI-3.1-MIGRATION.md`
     - `docs/DEFAULT-RESPONSE-BEHAVIOR.md`
   - ✅ Enhanced TSDoc for all public APIs (`generateZodClientFromOpenAPI`, `getZodClientTemplateContext`, `getOpenApiDependencyGraph`)
   - ✅ Added 15+ inline architectural comments across critical files
   - ✅ Updated `lib/README.md` to remove SwaggerParser references
   - ✅ Verified all quality gates green (0 errors, 0 warnings)

**Phase 2 Part 1 Status:** ✅ **COMPLETE** - Production-ready codebase with comprehensive documentation

---

## ✅ Foundations Already in Place

- Phase 1 tooling modernization complete (ESM, commander CLI, tsup build pipeline, Turborepo orchestration).
- Dependency updates delivered:
  - `openapi3-ts` → v4.5.0 (using `oas31` imports)
  - `zod` → v4.1.12
  - `pastable` removed in favour of lodash-es + targeted utilities
- `schemas-with-metadata` template (Task 1.9) provides SDK-grade output and underpins MCP tooling.
- Characterisation suite covers CLI + programmatic behaviour; public API stability enforced via `public-api-preservation.test.ts`.
- **Type System:** All code migrated to `openapi3-ts/oas31`, intersection type strategy established for Scalar integration.

---

## 📌 Immediate Next Actions

**Phase 2 Part 2 - Session 5: MCP Investigation** is ready to begin.

**Goal:** Produce analysis artefacts that drive MCP implementation

**Tasks:**

1. **MCP Protocol Analysis** - Create `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md`
   - Document MCP tool structure
   - Define JSON Schema constraints
   - Outline security expectations
   - Define error format guidance

2. **JSON Schema Conversion Analysis** - Create `.agent/analysis/JSON_SCHEMA_CONVERSION.md`
   - Record `zod-to-json-schema` configuration
   - Document edge cases
   - Define testing strategy

3. **Security Extraction Analysis** - Create `.agent/analysis/SECURITY_EXTRACTION.md`
   - Outline security metadata extraction algorithm
   - Document operation-level resolution
   - Document component-level resolution

**Deliverable:** Three comprehensive analysis documents that guide Sessions 6-8 implementation

**Detailed plan in:** `PHASE-2-MCP-ENHANCEMENTS.md` Session 5

**Estimated Effort:** 3-4 hours (research and documentation)

All implementation must follow TDD (write failing test → confirm failure → implement → confirm success → refactor) and comprehensive TSDoc standards (`.agent/RULES.md`).

---

## 🧭 Phase Overview

| Phase              | Purpose                                                  | Status                      | Reference                                      |
| ------------------ | -------------------------------------------------------- | --------------------------- | ---------------------------------------------- |
| **Phase 1**        | Tooling & architecture foundations                       | ✅ Complete                 | `.agent/plans/01-CURRENT-IMPLEMENTATION.md`    |
| **Phase 2 Part 1** | Scalar pipeline (bundling + validation + 3.1 upgrade)    | ✅ Complete (Nov 5, 2025)   | `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`     |
| **Phase 2 Part 2** | MCP outputs (JSON Schema, security metadata, predicates) | 🟡 Ready to start           | `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`     |
| **Phase 3**        | DX & quality enhancements                                | ⚪ Planned (post Phase 2)   | `.agent/plans/PHASE-3-FURTHER-ENHANCEMENTS.md` |

---

## 📚 Key Documents

- **Phase Plan:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`
- **Strategic Overview:** `.agent/plans/00-STRATEGIC-OVERVIEW.md`
- **Requirements:** `.agent/plans/requirements.md` (see Phase Alignment snapshot)
- **Standards:** `.agent/RULES.md` (TDD, TSDoc, fail-fast principles, type system discipline)
- **Definition of Done:** `.agent/DEFINITION_OF_DONE.md`

---

## 🧪 Quality Gate Status

| Gate                 | Status | Notes                                                    |
| -------------------- | ------ | -------------------------------------------------------- |
| `pnpm format`        | ✅     | Passing                                                  |
| `pnpm build`         | ✅     | Produces ESM & CJS bundles + DTS                         |
| `pnpm type-check`    | ✅     | **0 errors** - All type issues resolved                  |
| `pnpm lint`          | ✅     | **0 errors** - All lint issues resolved                  |
| `pnpm test:all`      | ✅     | All tests passing, **0 skipped tests**                   |

**Phase 2 Part 1 Complete:** All 4 sessions delivered. Production-ready codebase with comprehensive documentation.

---

## 📝 Working Agreements (RULES.md Highlights)

- TDD is mandatory – no implementation without failing tests first.
- Public APIs require full TSDoc with examples; internal helpers need `@param/@returns/@throws`.
- No defensive programming – rely on the validated pipeline, and fail loud with actionable messages.
- **NEVER use type escape hatches** – no `as` (except `as const`), no `any`, no `Record<string, unknown>` in our code.
- Prefer type predicates over assertions; validate at boundaries.
- Keep quality gates green at all times.

---

Use this context together with the Phase 2 plan to resume work quickly in any new session. **Phase 2 Part 1 is complete** - pivot to Part 2 (MCP enhancements) starting with Session 5.
