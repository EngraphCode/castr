# Living Context Document

**Last Updated:** November 4, 2025  
**Purpose:** Single source of truth for the modernization programme – current status, key decisions, and next actions.

---

> **Intended Impact**  
> Every consumer—CLI, programmatic API, or downstream MCP tooling—must experience the same predictable, spec‑compliant behaviour whenever they hand us an OpenAPI document. Valid specs sail straight through and produce deterministic artefacts; invalid specs fail fast with actionable guidance direct from the official schemas. Comprehensive tests and documentation make that contract boringly reliable, unlocking MCP automation and future extraction to Engraph.

---

## 🚨 Current Focus – Phase 2 Part 1: Scalar Pipeline Re‑architecture

We are executing **Phase 2 Part 1** (see `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`) to replace the legacy `SwaggerParser.bundle()` path with a deterministic Scalar-driven pipeline. **Sessions 1 & 2 are complete**: type system migrated to OpenAPI 3.1, legacy dependencies removed, Scalar-based `loadOpenApiDocument` implemented with upgrade pipeline and intersection types. **Session 3 is ready to start**: 77 type errors and 18 lint errors documented with detailed remediation strategies in the plan.

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

### Objectives for Part 1

1. **Foundation & Guardrails (✅ Complete)**
   - ✅ Audited every `prepareOpenApiDocument` caller (CLI + programmatic) and documented expectations around `$ref`s and error surfaces.
   - ✅ Added `@scalar/json-magic@0.7.0`, `@scalar/openapi-parser@0.23.0`, and `@scalar/openapi-types@0.5.1` with pinned versions.
   - ✅ Introduced lint/test guard (`lib/src/validation/scalar-guard.test.ts`) that flags any residual SwaggerParser usage.
   - ✅ Type system migrated: All imports changed from `openapi3-ts/oas30` to `openapi3-ts/oas31` throughout the codebase.
   - ✅ Legacy dependencies removed: `openapi-types@12.1.3` and `@apidevtools/swagger-parser` removed from `lib/package.json` and lockfile cleaned.

2. **Loading & Bundling (✅ Complete)**
   - ✅ Implemented `loadOpenApiDocument` using `@scalar/json-magic/bundle` with `readFiles()`/`fetchUrls()` plugins.
   - ✅ Configured lifecycle hooks that preserve internal `$ref`s while consolidating externals under `x-ext`.
   - ✅ Store bundle metadata (filesystem entries, bundle warnings, entrypoint filename) for downstream consumers.
   - ✅ Added characterisation tests for single-file and multi-file specs.
   - ✅ Integrated `@scalar/openapi-parser/upgrade` to normalize all specs to OpenAPI 3.1.
   - ✅ Refined types to use intersection pattern (`BundledOpenApiDocument = OpenAPIV3_1.Document & OpenAPIObject`).
   - ✅ Implemented type guard `isBundledOpenApiDocument` for boundary validation.
   - ✅ Exported new API surface with comprehensive TSDoc.
   - ✅ Updated `prepareOpenApiDocument` to use new Scalar pipeline internally.

3. **Complete Technical Resolution (⚠️ Ready to Start - Session 3 - Reorganized)**
   - **Current State:** 77 type errors across 21 files, 18 lint errors across 10 files
   - **Target State:** 0 type errors, 0 lint errors, ALL tests passing with working code
   - **Strategy:** Complete all technical fixes in one comprehensive session (5-7 hours estimated)
   - Create helper function for 3.1 nullable checks (fixes 16 errors)
   - Modernize test fixtures from 3.0 to 3.1 syntax (fixes 47 type errors)
   - Fix Vitest v4 mock typing in loader tests (fixes 16 type errors)
   - Migrate ALL SwaggerParser tests to use Scalar pipeline (fixes 18 errors)
   - Add undefined guards for optional 3.1 properties (fixes 5 type errors)
   - Update JSDoc examples to use `prepareOpenApiDocument`
   - **Zero tolerance:** NO `@ts-expect-error` pragmas allowed in source code
   - **Deliverable:** Fully green codebase with all tests migrated to Scalar pipeline

4. **Documentation & Final Cleanup (⚪ Planned - Session 4)**
   - Remove SwaggerParser guard test (no longer needed)
   - Update README/API docs to describe new pipeline and 3.1-first architecture
   - Update examples to use `prepareOpenApiDocument`
   - Document follow-up opportunities (partial bundling, incremental fetch, enhanced validation)
   - **Estimated Effort:** 2-3 hours

Quality gates (`pnpm format`, `build`, `type-check`, `lint`, `test -- --run`) must remain green after every milestone.

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

**Session 3 (Reorganized) is ready to start** - comprehensive technical resolution in one session:

**Goal:** Achieve fully green codebase - 0 type errors, 0 lint errors, ALL tests passing

**Implementation Order:**
1. **A. Create nullable helper** (`isNullableType`) in TypeScript conversion layer → fixes 16 errors
2. **B. Modernize test fixtures** from OpenAPI 3.0 to 3.1 syntax → fixes 47 errors
3. **C. Fix Vitest v4 mocks** in loader tests → fixes 16 errors
4. **D. Migrate SwaggerParser tests** to Scalar pipeline (all 9 files) → fixes 18 errors
5. **E. Add undefined guards** for optional 3.1 properties → fixes 5 errors

**Deliverable:** Fully working codebase with all tests migrated to Scalar pipeline

**Detailed implementation plan in:** `PHASE-2-MCP-ENHANCEMENTS.md` Session 3

**Estimated Effort:** 5-7 hours (systematic work with clear patterns)

Run `pnpm type-check` and `pnpm lint` to verify current state before starting.

All implementation must follow TDD (write failing test → confirm failure → implement → confirm success → refactor) and comprehensive TSDoc standards (`.agent/RULES.md`).

---

## 🧭 Phase Overview

| Phase              | Purpose                                                  | Status                           | Reference                                      |
| ------------------ | -------------------------------------------------------- | -------------------------------- | ---------------------------------------------- |
| **Phase 1**        | Tooling & architecture foundations                       | ✅ Complete (Part 4 delivered)   | `.agent/plans/01-CURRENT-IMPLEMENTATION.md`    |
| **Phase 2 Part 1** | Scalar pipeline (bundling + validation + 3.1 upgrade)    | 🟡 In progress                   | `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`     |
| **Phase 2 Part 2** | MCP outputs (JSON Schema, security metadata, predicates) | ⚪ Planned (starts after Part 1) | `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`     |
| **Phase 3**        | DX & quality enhancements                                | ⚪ Planned (post Phase 2)        | `.agent/plans/PHASE-3-FURTHER-ENHANCEMENTS.md` |

---

## 📚 Key Documents

- **Phase Plan:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`
- **Strategic Overview:** `.agent/plans/00-STRATEGIC-OVERVIEW.md`
- **Requirements:** `.agent/plans/requirements.md` (see Phase Alignment snapshot)
- **Standards:** `.agent/RULES.md` (TDD, TSDoc, fail-fast principles, type system discipline)
- **Definition of Done:** `.agent/DEFINITION_OF_DONE.md`

---

## 🧪 Quality Gate Status

| Gate                 | Status | Notes                                               |
| -------------------- | ------ | --------------------------------------------------- |
| `pnpm format`        | ✅     | Must stay green                                     |
| `pnpm build`         | ✅     | Produces ESM & CJS bundles + DTS                    |
| `pnpm type-check`    | ⚠️     | 77 errors - Session 3 (reorganized) ready           |
| `pnpm lint`          | ⚠️     | 18 errors - Session 3 (reorganized) ready           |
| `pnpm test -- --run` | ✅     | Unit, characterisation, snapshot suites all passing |

Sessions 1 & 2 complete. Session 3 reorganized to achieve complete technical resolution (all green) in one comprehensive session. Detailed plan in `PHASE-2-MCP-ENHANCEMENTS.md`.

---

## 📝 Working Agreements (RULES.md Highlights)

- TDD is mandatory – no implementation without failing tests first.
- Public APIs require full TSDoc with examples; internal helpers need `@param/@returns/@throws`.
- No defensive programming – rely on the validated pipeline, and fail loud with actionable messages.
- **NEVER use type escape hatches** – no `as` (except `as const`), no `any`, no `Record<string, unknown>` in our code.
- Prefer type predicates over assertions; validate at boundaries.
- Keep quality gates green at all times.

---

Use this context together with the Phase 2 plan to resume work quickly in any new session. When Part 1 lands, update this document to pivot focus to Part 2 (MCP enhancements).
