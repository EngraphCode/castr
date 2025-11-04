# Living Context Document

**Last Updated:** November 4, 2025  
**Purpose:** Single source of truth for the modernization programme – current status, key decisions, and next actions.

---

> **Intended Impact**  
> Every consumer—CLI, programmatic API, or downstream MCP tooling—must experience the same predictable, spec‑compliant behaviour whenever they hand us an OpenAPI document. Valid specs sail straight through and produce deterministic artefacts; invalid specs fail fast with actionable guidance direct from the official schemas. Comprehensive tests and documentation make that contract boringly reliable, unlocking MCP automation and future extraction to Engraph.

---

## 🚨 Current Focus – Phase 2 Part 1: Scalar Pipeline Re‑architecture

We are executing **Phase 2 Part 1** (see `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`) to replace the legacy `SwaggerParser.bundle()` path with a deterministic Scalar-driven pipeline. Session 1 groundwork is complete: all `prepareOpenApiDocument` callers are catalogued, Scalar dependencies are pinned in `lib/package.json`, and a dedicated guard (`pnpm --filter openapi-zod-validation test:scalar-guard`) now flags any production imports of `@apidevtools/swagger-parser` or legacy `openapi-types`.

### Objectives for Part 1

1. **Foundation & Guardrails**
   - Audit every `prepareOpenApiDocument` caller (CLI + programmatic) and document expectations around `$ref`s and error surfaces.
   - Add `@scalar/json-magic`, `@scalar/openapi-parser`, and `@scalar/openapi-types` with pinned versions (Node ≥ 20 requirement).
   - Introduce a lint/test guard that flags any residual SwaggerParser usage.

2. **Loading & Bundling**
   - Implement `loadOpenApiDocument` using `@scalar/json-magic/bundle` with `readFiles()`/`fetchUrls()` plugins.
   - Configure lifecycle hooks that preserve internal `$ref`s while consolidating externals under `x-ext`.
   - Store bundle metadata (filesystem entries, bundle warnings, entrypoint filename) for downstream consumers.

3. **Validation & Transformation**
   - Wrap `@scalar/openapi-parser.validate/sanitize/upgrade` into `validateOpenApiWithScalar`, translating AJV errors into our existing CLI/programmatic messaging pattern.
   - Add characterisation tests comparing SwaggerParser vs Scalar error surfaces.

4. **Normalization & Types**
   - Define `PreparedOpenApiDocument` (Scalar `OpenAPI.Document` + `openapi3-ts` `OpenAPIObject` + bundle metadata).
   - Update dependency-graph, conversion, and templating modules to accept the new wrapper without consuming `x-ext` by default.

5. **Integration & Cleanup**
   - Replace the existing `prepareOpenApiDocument` implementation with the orchestrated pipeline; keep a feature flag for the legacy path during rollout.
   - Update README/API docs to describe new pipeline options (`--sanitize`, `--upgrade`) and error semantics.
   - Remove SwaggerParser dependency once parity is confirmed and document follow-up opportunities (partial bundling, `@scalar/openapi-types/schemas`, incremental fetch).

Quality gates (`pnpm format`, `build`, `type-check`, `lint`, `test -- --run`) must remain green after every milestone.

---

## ✅ Foundations Already in Place

- Phase 1 tooling modernization complete (ESM, commander CLI, tsup build pipeline, Turborepo orchestration).
- Dependency updates delivered:
  - `openapi3-ts` → v4.5.0
  - `zod` → v4.1.12
  - `pastable` removed in favour of lodash-es + targeted utilities
- `schemas-with-metadata` template (Task 1.9) provides SDK-grade output and underpins MCP tooling.
- Characterisation suite covers CLI + programmatic behaviour; public API stability enforced via `public-api-preservation.test.ts`.

---

## 📌 Immediate Next Actions

1. **Session 2 prep:** design `loadOpenApiDocument` around `@scalar/json-magic` (TDD: author failing unit tests for local + remote refs before implementation).
2. **Guard monitoring:** keep `pnpm --filter openapi-zod-validation test:scalar-guard` red until legacy imports are removed in Session 4; re-run after major refactors to ensure no new violations appear.
3. **Documentation sync:** continue updating plan/context entries as Session 2 work begins (json-magic lifecycle hooks, metadata structure, test strategy).

All implementation must follow TDD (write failing test → confirm failure → implement → confirm success → refactor) and comprehensive TSDoc standards (`.agent/RULES.md`).

---

## 🧭 Phase Overview

| Phase | Purpose | Status | Reference |
| --- | --- | --- | --- |
| **Phase 1** | Tooling & architecture foundations | ✅ Complete (Part 4 delivered) | `.agent/plans/01-CURRENT-IMPLEMENTATION.md` |
| **Phase 2 Part 1** | Scalar pipeline (bundling + validation) | 🟡 In progress | `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` |
| **Phase 2 Part 2** | MCP outputs (JSON Schema, security metadata, predicates) | ⚪ Planned (starts after Part 1) | `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` |
| **Phase 3** | DX & quality enhancements | ⚪ Planned (post Phase 2) | `.agent/plans/PHASE-3-FURTHER-ENHANCEMENTS.md` |

---

## 📚 Key Documents

- **Phase Plan:** `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md`
- **Strategic Overview:** `.agent/plans/00-STRATEGIC-OVERVIEW.md`
- **Requirements:** `.agent/plans/requirements.md` (see Phase Alignment snapshot)
- **Standards:** `.agent/RULES.md` (TDD, TSDoc, fail-fast principles)
- **Definition of Done:** `.agent/DEFINITION_OF_DONE.md`

---

## 🧪 Quality Gate Status

| Gate | Status | Notes |
| --- | --- | --- |
| `pnpm format` | ✅ | Must stay green |
| `pnpm build` | ✅ | Produces ESM & CJS bundles + DTS |
| `pnpm type-check` | ✅ | Zero TypeScript errors |
| `pnpm lint` | ⚠️ | Remaining lint debt (type assertions elimination continues in parallel with Phase 2) |
| `pnpm test -- --run` | ✅ | Unit, characterisation, snapshot suites all passing |

Lint/type assertion backlog remains the extraction blocker; Phase 2 Part 1 eliminates the largest remaining risk by removing direct SwaggerParser usage ahead of lint clean-up.

---

## 📝 Working Agreements (RULES.md Highlights)

- TDD is mandatory – no implementation without failing tests first.
- Public APIs require full TSDoc with examples; internal helpers need `@param/@returns/@throws`.
- No defensive programming – rely on the validated pipeline, and fail loud with actionable messages.
- Prefer type predicates over assertions; annotate and document any unavoidable `as`.
- Keep quality gates green at all times.

---

Use this context together with the Phase 2 plan to resume work quickly in any new session. When Part 1 lands, update this document to pivot focus to Part 2 (MCP enhancements).
