# MCP Enhancement Plan – Phase 2 (Restructured)

**Date:** October 25, 2025  
**Phase:** 2 (split into Part 1 and Part 2)  
**Status:** Planning  
**Estimated Duration:** 4–6 weeks (Part 1 ~2 weeks, Part 2 ~2–3 weeks)  
**Prerequisites:** Architecture Rewrite Phases 0–3 complete, All quality gates green, Zod v4 update complete ✅

---

## Why the Split?

Phase 2 now ships in two consecutive parts:

- **Phase 2 – Part 1: Scalar Pipeline Re-architecture**  
  Replace `SwaggerParser.bundle()` with a Scalar-based pipeline (`@scalar/json-magic`, `@scalar/openapi-parser`, `@scalar/openapi-types`) to unlock richer validation, multi-file handling, and deterministic bundling. This is the foundation every MCP feature depends on.

- **Phase 2 – Part 2: MCP Enhancements**  
  Build the MCP-specific outputs (JSON Schema export, security metadata, predicates, documentation) on top of the new pipeline. Tasks map to the previous “Phase 2B” work but now assume the Scalar pipeline is in place.

The restructure keeps deliverables chronological: Part 1 provides the plumbing, Part 2 delivers the high-level MCP features.

---

## Quality Gates & Standards

- **Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run`
- **TDD (Mandatory):** Write failing tests first, confirm failure, implement minimal code, confirm success, refactor.
- **Comprehensive TSDoc (Mandatory):**
  - Public APIs: full TSDoc with 3+ examples
  - Internal APIs: succinct TSDoc with `@param`, `@returns`, `@throws`
  - Types/constants: documented purpose and usage
- **References:** `.agent/RULES.md`

---

## Prerequisite Check

```
Prerequisites (Phase 2 Core & Architecture Rewrite)
├─ 1.9 ✅ schemas-with-metadata template
├─ 2.1 ✅ openapi3-ts v4 update
├─ 2.4 ✅ zod v4 update
├─ 3.1 ✅ pastable replacement
└─ Architecture Rewrite (Phases 0–3) ⏳ – See 01-CURRENT-IMPLEMENTATION.md
```

---

## Phase 2 – Part 1: Scalar Pipeline Re-architecture

### Overview

Deliver a staged pipeline that:

1. Loads/bundles specs (filesystem & HTTP) via `@scalar/json-magic`
2. Validates & sanitizes via `@scalar/openapi-parser`
3. Normalizes output while preserving internal `$ref`s for dependency graphs
4. Exposes metadata (bundle info, warnings, version) to downstream consumers

### Session Plan (Part 1)

Each session is designed to be self-contained, follow TDD, and minimise context switching. Complete sessions sequentially.

#### **Session 1 – Foundation & Guards**

- **Focus:** Establish Scalar dependencies and enforce the “no SwaggerParser / legacy openapi-types” rule.
- **Acceptance Criteria**
  - Scalar packages (`@scalar/openapi-parser`, `@scalar/json-magic`, `@scalar/openapi-types`) added with pinned versions.
  - Inventory of every `prepareOpenApiDocument`/SwaggerParser usage documented (CLI, programmatic API, tests, fixtures).
  - Guard (Vitest or ESLint) fails if any production file imports `@apidevtools/swagger-parser` or legacy `openapi-types`.
  - Guard is red until both dependencies are removed from `package.json` and the source tree.
- **Validation Steps**
  1. `pnpm test:scalar-guard` → expect failure while legacy imports remain.
  2. `pnpm lint` → ensure guard integrates with lint pipeline (if implemented as ESLint rule).
  3. Document inventory results in `.agent/plans/PHASE-2-MCP-ENHANCEMENTS.md` notes section or commit message.

##### Session 1 Inventory Notes (2025-11-04)

- **CLI entrypoint (`lib/src/cli/index.ts`):** `prepareOpenApiDocument` receives the CLI argument string verbatim (file path or URL). Errors bubble directly to the CLI; output feeds `generateZodClientFromOpenAPI` and must preserve internal `$ref`s for downstream dependency tracking. Default output path relies on the same string input, so Scalar loader must keep path semantics unchanged.
- **Programmatic API (`lib/src/rendering/generate-from-context.ts`):** `generateZodClientFromOpenAPI` forwards either `input` (string | `URL`) or an in-memory `OpenAPIObject`. It expects `prepareOpenApiDocument` to normalise URLs, handle local filesystem paths, accept already-parsed docs, and always return an `openapi3-ts` `OpenAPIObject`. The returned document feeds template context builders that depend on preserved `$ref`s and AJV-compatible structure.
- **Shared exports (`lib/src/shared/index.ts`):** re-exports `prepareOpenApiDocument` for consumers; documentation emphasises a single bundling point. Any guard must accommodate this public surface while preventing new SwaggerParser imports elsewhere.
- **Characterisation suite (`lib/src/characterisation/input-pipeline.char.test.ts`):** codifies required behaviours—success for local file paths and in-memory specs, rejection when both `input` and `openApiDoc` provided, explicit support for OpenAPI 3.0.x and 3.1.x, and documented failure expectations for unreachable URLs or malformed specs. These tests will remain the regression harness during Scalar migration.
- **Current implementation (`lib/src/shared/prepare-openapi-document.ts`):** Only production import of `@apidevtools/swagger-parser` and `openapi-types`. Performs the `openapi-types` → `openapi3-ts` boundary assertion (`as OpenAPI.Document`) and relies on `SwaggerParser.bundle()` for validation + external `$ref` resolution.

##### Session 1 Dependency Pins (2025-11-04)

- Added Scalar stack to `lib/package.json` with exact versions: `@scalar/json-magic@0.7.0`, `@scalar/openapi-parser@0.23.0`, `@scalar/openapi-types@0.5.1`. Pinned to satisfy deterministic bundling, AJV-backed validation, and shared type contracts.
- `pnpm install` executed to refresh `pnpm-lock.yaml`; lockfile now records the Scalar packages for the `lib` workspace. No additional build tooling changes required; existing Node ≥20 engine requirement remains valid for Scalar packages.

##### Session 1 Guard Implementation (2025-11-04)

- Added `lib/src/validation/scalar-guard.test.ts` which scans all production `.ts` sources (excluding tests/fixtures) for banned imports of `@apidevtools/swagger-parser` or `openapi-types`, reporting file + line context.
- Introduced dedicated Vitest config `vitest.scalar-guard.config.ts` and npm script `pnpm test:scalar-guard` so the guard runs outside the default unit suite; the guard currently fails as expected while legacy imports remain.
- Default Vitest config now excludes the guard file, preventing false negatives in routine test runs while still enabling targeted enforcement.

#### **Session 2 – Loading & Bundling**

- **Focus:** Implement `loadOpenApiDocument` via json-magic with deterministic behaviour.
- **Acceptance Criteria**
  - `loadOpenApiDocument` wraps `@scalar/json-magic/bundle` with `readFiles()` and `fetchUrls()` plugins.
  - Lifecycle hooks preserve internal `$ref`s, consolidate externals under `x-ext`, and emit warning metadata.
  - Bundle metadata (filesystem entries, entrypoint filename, warnings) stored in a typed structure.
  - Unit tests cover local refs, remote refs (mocked), circular refs, and conflicting component names.
- **Validation Steps**
  1. `pnpm test -- run src/shared/load-openapi-document.test.ts`
  2. `pnpm test --filter characterisation -- load` (targeted characterisation that exercises new loader)
  3. Manual smoke: run CLI against a multi-file spec (`pnpm openapi-zod-validation tests/petstore.yaml -o /tmp/out.ts`) and inspect bundle metadata logs.

#### **Session 3 – Validation, Normalisation & Types**

- **Focus:** Add Scalar validation + `PreparedOpenApiDocument`.
- **Acceptance Criteria**
  - `validateOpenApiWithScalar` wraps `openapi-parser.validate/sanitize/upgrade` with configurable toggles.
  - AJV errors re-mapped into existing CLI/programmatic error format (method/path context, status hints).
  - `PreparedOpenApiDocument` combines Scalar `OpenAPI.Document`, `openapi3-ts` `OpenAPIObject`, and bundle metadata.
  - Dependency graph builder, schema conversion, and template context accept the new wrapper (no legacy types remain).
  - Guard still failing (SwaggerParser references remain) but limited to modules scheduled for Session 4 cleanup.
- **Validation Steps**
  1. `pnpm test -- run src/shared/validate-openapi-with-scalar.test.ts`
  2. `pnpm test --filter characterisation -- validation`
  3. `pnpm type-check`
  4. Spot-check CLI output for improved error messages on malformed specs.

#### **Session 4 – Integration & Cleanup**

- **Focus:** Remove legacy pipeline, satisfy guard, and update documentation.
- **Acceptance Criteria**
  - `prepareOpenApiDocument` replaced entirely by the new pipeline (no feature flags, no compatibility layer).
  - Guard passes: no source imports of `@apidevtools/swagger-parser` or legacy `openapi-types`; dependencies removed from `lib/package.json`.
  - Full characterisation and unit suite green.
  - README/API docs updated to explain new options (`--sanitize`, `--upgrade`) and pipeline behaviour.
  - Follow-up items (e.g., future json-magic enhancements) captured in TODO/backlog.
- **Validation Steps**
  1. `pnpm test -- --run` (full suite)
  2. `pnpm lint`
  3. `pnpm type-check`
  4. Verify guard (`pnpm test:scalar-guard`) now passes.
  5. Manual CLI smoke tests (local file, remote URL, pre-parsed object) documented in release notes.

### Deliverables

- New loader/validator modules with test coverage
- Updated `prepareOpenApiDocument`
- Documentation (README, `.agent` context) reflecting Scalar pipeline
- Lint/test guard ensuring no `@apidevtools/swagger-parser` or legacy `openapi-types` remain (guard passing is a Phase 1 exit criterion)

---

## Phase 2 – Part 2: MCP Enhancements (Built on Scalar Pipeline)

### Overview

Implements MCP-specific features assuming Part 1 is complete:

1. Define MCP requirements & readiness checks
2. Export JSON Schema from Zod outputs
3. Surface security metadata
4. Provide type guards, error formatting, and documentation for MCP consumers

### Session Plan (Part 2)

> **Note:** Task 5.2.1 (“OpenAPI Spec Validation, Fail-Fast”) is delivered by Part 1. Sessions below build on the Scalar pipeline output.

#### **Session 5 – MCP Investigation**

- **Focus:** Produce the analysis artefacts that drive implementation.
- **Acceptance Criteria**
  - `.agent/analysis/MCP_PROTOCOL_ANALYSIS.md` documents MCP tool structure, JSON Schema constraints, security expectations, and error format guidance.
  - `.agent/analysis/JSON_SCHEMA_CONVERSION.md` records the `zod-to-json-schema` configuration, edge cases, and testing strategy.
  - `.agent/analysis/SECURITY_EXTRACTION.md` outlines the security metadata extraction algorithm (operation-level + component-level resolution).
- **Validation Steps**
  1. Peer-check documents for completeness against MCP spec (link references).
  2. `pnpm lint` (markdown/docs) if applicable.
  3. Summarise key decisions in commit message or plan notes.

#### **Session 6 – SDK Enhancements**

- **Focus:** Enrich SDK-facing artefacts with metadata unlocked by the Scalar pipeline.
- **Acceptance Criteria**
  - Enhanced parameter metadata (descriptions, examples, constraints) emitted by generation templates; accompanying tests cover representative specs.
  - Rate-limiting/constraint metadata extracted when present and surfaced in template context.
  - No regression in existing SDK outputs (schemas-with-metadata template stays stable aside from intentional additions).
- **Validation Steps**
  1. `pnpm test -- run src/context/template-context.test.ts`
  2. Regenerate characterisation fixtures: `pnpm test --filter characterisation -- sdk`
  3. Manual diff of generated Engraph fixture to ensure metadata additions are correct.

#### **Session 7 – MCP Tool Enhancements**

- **Focus:** Deliver MCP-ready outputs (JSON Schema, security metadata, predicates, error formatting).
- **Acceptance Criteria**
  - Zod → JSON Schema conversion integrated via `zod-to-json-schema` (refs inlined, conforms to MCP requirements).
  - Security metadata (auth schemes, scopes) attached to MCP tool definitions.
  - Type predicates / assertion helpers (`isMcpToolInput`, `assertMcpToolInput`, `assertMcpToolOutput`) implemented with tests.
  - Enhanced error formatting converts Zod/JSON Schema failures into MCP-friendly messages with context.
- **Validation Steps**
  1. `pnpm test -- run src/mcp/*.test.ts`
  2. `pnpm test --filter characterisation -- mcp`
  3. Validate JSON Schema output using a Draft 2020-12 validator (document command/output in commit notes).

#### **Session 8 – Documentation & Final Validation**

- **Focus:** Update outward-facing docs and ensure everything ships cleanly.
- **Acceptance Criteria**
  - README/CLI documentation expanded with MCP sections, CLI flags, SDK & MCP examples.
  - TypeDoc (or documented API surface) reflects new exports and helpers.
  - Release notes / changelog entry summarises Phase 2 deliverables.
  - Full quality gate passes from a clean tree.
- **Validation Steps**
  1. `pnpm format && pnpm lint && pnpm build && pnpm type-check && pnpm test -- --run`
  2. Manual CLI smoke tests covering new flags (`--with-type-predicates`, `--validate-mcp-readiness`, etc.) with results recorded.
  3. Optional: run `pnpm docs`/TypeDoc build to ensure documentation compiles.

---

## Alignment with Phase 2 Goals

- **5.2.1 OpenAPI Spec Validation (Fail-Fast)** – Achieved via Scalar’s AJV-backed `validate()` pipeline and the structured error wrappers introduced in Part 1.
- **5.1 Investigation Tasks** – Analysis documents (JSON Schema conversion, MCP spec, security metadata) directly inform configuration and metadata emitted by the Scalar loader.
- **5.2.2 Enhanced Parameter Metadata / 5.3.x MCP Enhancements** – Bundle metadata (normalized specs, `x-ext`, version info) enables richer MCP outputs while ensuring templates operate on validated documents.
- **5.3.1 JSON Schema Export** – Part 2’s `zod-to-json-schema` integration sits atop the validated Zod graphs created with the new pipeline.
- **5.3.2 Security Metadata Extraction** – Filesystem context and version information from Part 1 simplify resolving security schemes, including external references.
- **5.3.3 / 5.3.4 Type Guards & Error Formatting** – Improved validation detail feeds MCP readiness checks and user-facing error messaging.
- **5.4 Documentation & Quality Gates** – Documentation updates and quality gates continue to apply across Parts 1 and 2, with the characterisation suite ensuring regressions are caught.

---

## Deliverable Summary

| Part   | Focus                           | Key Deliverables                                                                        |
| ------ | ------------------------------- | --------------------------------------------------------------------------------------- |
| Part 1 | Scalar Pipeline Re-architecture | New loader/validator, `PreparedOpenApiDocument`, removal of SwaggerParser, updated docs |
| Part 2 | MCP Enhancements                | JSON Schema export, security metadata, MCP readiness checks, TypeDoc/README updates     |

---

## Next Steps

1. Confirm prerequisites are complete (Architecture Rewrite ✓, Zod v4 ✓).
2. Start Phase 2 Part 1 milestones in order (foundation → integration).
3. Once Part 1 is merged, kick off Part 2 tasks using the investigation documents as guides.
4. Update roadmap/changelog to reflect two-part delivery.

All contributors should reference this document, `.agent/RULES.md`, and `.agent/plans/01-CURRENT-IMPLEMENTATION.md` to ensure consistency, especially around TDD and TSDoc expectations.
