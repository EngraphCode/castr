# Living Context Document

**Last Updated:** November 4, 2025  
**Purpose:** Single source of truth for the modernization programme – current status, key decisions, and next actions.

---

> **Intended Impact**  
> Every consumer—CLI, programmatic API, or downstream MCP tooling—must experience the same predictable, spec‑compliant behaviour whenever they hand us an OpenAPI document. Valid specs sail straight through and produce deterministic artefacts; invalid specs fail fast with actionable guidance direct from the official schemas. Comprehensive tests and documentation make that contract boringly reliable, unlocking MCP automation and future extraction to Engraph.

---

## 🚨 Current Focus – Phase 2 Part 1: Scalar Pipeline Re‑architecture

We are executing **Phase 2 Part 1** (see `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`) to replace the legacy `SwaggerParser.bundle()` path with a deterministic Scalar-driven pipeline. Session 1 is complete, including migration to OpenAPI 3.1 internal types and removal of legacy dependencies. Session 2 loader implementation is underway: the Scalar-based `loadOpenApiDocument` now bundles specs with rich metadata, and characterisation coverage validates parity against the legacy pipeline.

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

2. **Loading & Bundling (🟡 In Progress)**
   - ✅ Implemented `loadOpenApiDocument` using `@scalar/json-magic/bundle` with `readFiles()`/`fetchUrls()` plugins.
   - ✅ Configured lifecycle hooks that preserve internal `$ref`s while consolidating externals under `x-ext`.
   - ✅ Store bundle metadata (filesystem entries, bundle warnings, entrypoint filename) for downstream consumers.
   - ✅ Added characterisation tests for single-file and multi-file specs.
   - ⚠️ **Next:** Integrate `@scalar/openapi-parser/upgrade` to normalize all specs to OpenAPI 3.1.
   - ⚠️ **Next:** Refine types to use intersection pattern (`BundledOpenApiDocument = OpenAPIV3_1.Document & OpenAPIObject`).
   - ⚠️ **Next:** Remove type casts, use type guards at boundaries.
   - ⚠️ **Next:** Export new API surface with comprehensive TSDoc.

3. **Validation & Transformation**
   - Wrap `@scalar/openapi-parser.validate/sanitize/upgrade` into `validateOpenApiWithScalar`, translating AJV errors into our existing CLI/programmatic messaging pattern.
   - Add characterisation tests comparing SwaggerParser vs Scalar error surfaces.

4. **Normalization & Types**
   - Define `PreparedOpenApiDocument` combining `BundledOpenApiDocument` (already 3.1) and bundle metadata.
   - Update dependency-graph, conversion, and templating modules to accept the new wrapper without consuming `x-ext` by default.

5. **Integration & Cleanup**
   - Replace the existing `prepareOpenApiDocument` implementation with the orchestrated pipeline; keep a feature flag for the legacy path during rollout.
   - Update README/API docs to describe new pipeline options (`--sanitize`, `--upgrade`) and error semantics.
   - Remove SwaggerParser dependency once parity is confirmed and document follow-up opportunities (partial bundling, `@scalar/openapi-types/schemas`, incremental fetch).

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

1. **Session 2 refinement:** Integrate `@scalar/openapi-parser/upgrade` to normalize specs to 3.1, refine types to use intersection pattern, remove all type casts.
2. **Type-check and lint:** Address current type errors in loader implementation (remove casts, use type guards, import library types directly from Scalar).
3. **Export and document:** Export new API surface (`BundledOpenApiDocument`, `LoadedOpenApiDocument`, `loadOpenApiDocument`) with comprehensive TSDoc.
4. **Validation:** Run full quality gates and prepare for Session 3 validation work.

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
| `pnpm type-check`    | ⚠️     | Current type errors in loader (being addressed)     |
| `pnpm lint`          | ✅     | Clean after recent refactors                        |
| `pnpm test -- --run` | ✅     | Unit, characterisation, snapshot suites all passing |

Type errors in Session 2 loader implementation are being addressed as part of the architectural refinement (removing casts, using intersection types, importing library types directly).

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
