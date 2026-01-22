# Existing Plans Review (Deep)

This review covers all active plans under `.agent/plans` plus archival plans in `.agent/plans/archive`. It focuses on overlap with the new parity goals (Oak contract + openapi-ts best practices + oak-openapi dependency replacement).

## 1) Active Plans Summary

### `roadmap.md`

- **Primary focus:** OpenAPI ↔ Zod core path + round-trip validation.
- **Next milestone:** Session 3.2 (Zod → IR parser) then 3.3 (true round-trip).
- **Core principles:** strict-by-default, fail-fast, deterministic output, AST-only generation.
- **Relevance:** aligns with Oak strictness/determinism; does not explicitly cover metadata maps or bundle manifests required by Oak.

### `castr-strict-test-plan.md`

- **Primary focus:** strict-only, fail-fast tests keyed to Oak contract + OpenAPI-TS-inspired fixture categories.
- **Includes:** determinism, strict validation, IR completeness, and Oak harness integration.
- **Relevance:** directly aligns with Oak Phase 1 criteria and fixture validation pipeline. Mentions `castr-bundle` as temporary but required when harness expects it.

### `zod4-parser-plan.md`

- **Primary focus:** Zod 4 → IR parsing to enable true round-trip.
- **Includes:** reject Zod 3 syntax, parse `.meta()`, `.strict()`, getter recursion, constraints, etc.
- **Relevance:** foundational for Zod → IR; partially overlaps with Zod-OpenAPI replacement (but does **not** cover `.openapi()`/`.meta()` as full OpenAPI doc metadata for endpoints).

### `zod4-advanced-features-research.md`

- **Primary focus:** research-only on Zod 4 capabilities and future enhancements (codecs, prefaults, zod mini).
- **Relevance:** informs long-term enhancements; not required for immediate Oak parity.

### `eslint-plugin-standards-plan.md`

- **Primary focus:** separate linting plugin project.
- **Relevance:** not directly tied to schema transformation parity; helpful for org-wide lint consistency.

## 2) Archive Plans Summary (Still Relevant)

### `future-artefact-expansion.md`

- **Core idea:** multi-artefact generation from a single IR with a writer registry + manifest.
- **Notable artefacts planned:**
  - **2.11 Metadata maps** (operation metadata, parameter schema maps)
  - **2.12 JSON Schema output** (request/response schemas)
  - **2.14 MCP tooling** (tool summaries, naming utilities)
- **Relevance:** directly overlaps with Oak contract requirements (maps, JSON Schema, manifest). This plan already outlines most of the missing outputs in the current gap matrix.

### `openapi-compliance-plan-2.6-2.7-complete.md`

- **Scope:** OpenAPI 3.0/3.1 input/output completeness, strict validation, round-trip prep.
- **Relevance:** foundational; enables lossless OpenAPI output. No explicit OpenAPI 2.0 mention (input-only support exists in code but not in the plan).

### `phase-1-completion-plan.md`

- **Scope:** enforce IR as sole source of truth + MCP IR-only path.
- **Relevance:** already implemented; underpins strictness and IR integrity.

### `session-2.9-polish-plan.md`

- **Scope:** harden OpenAPI → Zod output tests (format functions, fail-fast coverage, fixtures).
- **Relevance:** aligns with strict output goals and deterministic behavior.

### `ir-semantic-audit-plan-3.1a-complete.md`

- **Scope:** format-agnostic IR docs.
- **Relevance:** ensures IR remains neutral and extensible for Zod/OpenAPI/JSON Schema parity.

## 3) Alignment vs New Parity Goals

### Already Planned (Strong Alignment)

- **Strict-by-default + fail-fast** (roadmap + strict test plan)
- **Determinism** (strict test plan + round-trip validation plan)
- **Metadata maps + JSON Schema output** (future-artefact-expansion)
- **Writer registry + manifest** (future-artefact-expansion)

### Partially Planned

- **Zod → IR parsing** (zod4-parser plan). This enables Zod-based workflows but not full Zod-OpenAPI parity yet.
- **MCP output** (already present) but needs JSON Schema alignment for Oak response maps.

### Not Planned (Gaps to Add)

- **Path format configuration** (colon vs curly) for endpoints and maps.
- **Explicit `operationId` field in endpoint output** (currently `alias`).
- **Public schema-to-code serializer** (Oak needs stringified schemas for request maps).
- **Bundle manifest output** compatible with Oak harness (plan mentions manifest but not a concrete shape).
- **tRPC → IR parser / adapters** (needed to replace `trpc-to-openapi`).
- **Zod-OpenAPI metadata ingestion** (`.openapi()` / `.meta()` mapping to OpenAPI fields).
- **Watch mode / plugin surface** (openapi-ts best-practice alignment; not in roadmap).

## 4) Potential Plan Conflicts / Risks

1. **AST-only generation vs schema-string outputs**
   - Roadmap states "no string manipulation"; Oak requires schema code strings for some maps.
   - Mitigation: generate strings from AST (ts-morph writer → string) to maintain AST purity.

2. **Strict-by-default in plans vs writer default behavior**
   - Plans emphasize strict-by-default, but current Zod writer defaults to `.passthrough()` unless `strictObjects` is set.
   - Mitigation: introduce a strict profile (or default true) for Oak outputs; ensure tests enforce it.

3. **Zod parser accept/reject patterns**
   - Parser plan has a strict accept list that must match the current Zod writer output.
   - Mitigation: align parser acceptance with writer output and update the Zod 4 pattern table as needed.

## 5) Concrete Recommendations to Incorporate into Plans

- Extend `future-artefact-expansion.md` with **Oak parity outputs** explicitly:
  - operationId maps, colon path format, request-parameter schema strings, bundle manifest shape.
- Add a short **tRPC → IR plan** (parser + security mapping) to the roadmap.
- Add **Zod-OpenAPI metadata ingestion** as a Session in Phase 3 or Phase 4.
- Add a **strict profile** concept to the roadmap to enforce Oak defaults.

**Update given Oak flexibility:** prefer IR-first outputs and helper APIs over prescriptive string-based public APIs; when emitting TypeScript, use ts-morph AST (separate from IR) and its printers if strings are ever required.

## 6) Key Takeaway

The existing plan set is strong on IR correctness, strict validation, and determinism, and already anticipates multi-artefact output (including metadata maps and JSON Schema). The main missing pieces are integration-specific: path formatting, operationId maps, schema-string outputs, tRPC and Zod-OpenAPI ingestion, and a concrete bundle manifest for the Oak harness.
