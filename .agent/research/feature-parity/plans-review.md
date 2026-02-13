# Existing Plans Review (Deep)

This review covers all active plans under `.agent/plans` plus archival plans in `.agent/plans/archive`. It focuses on overlap with the new **enablement** goals (Oak use cases + openapi-ts best practices + oak-openapi dependency replacement).

> [!IMPORTANT]
> Canonical execution is tracked in `.agent/plans/roadmap.md` plus atomic steps under `.agent/plans/current/`.
> This document is advisory only and may lag behind the current roadmap.

## 1) Active Plans Summary

### `roadmap.md`

- **Primary focus:** OpenAPI ↔ Zod core path + round-trip validation.
- **Current milestone:** Session 3.3 (3.3a strictness remediation + 3.3b strict Zod-layer round-trip proofs). Session 3.2 is complete.
- **Core principles:** strict-by-default, fail-fast, deterministic output, AST-only generation.
- **Relevance:** aligns with Oak strictness/determinism; does not explicitly cover metadata maps or bundle manifests required by Oak.

### Session 3.3a (Roadmap)

- **Primary focus:** ADR-026 enforcement + repo-wide strictness remediation (no escape hatches, no fallbacks).
- **Relevance:** unblocks strict round-trip proofs by removing heuristic parsing and permissive behavior.

### Session 3.3b (Roadmap)

- **Primary focus:** strict, lossless Zod-layer round-trip proofs (Scenario 3 is the remaining blocker).
- **Relevance:** this is the proof that the Zod layer participates in strict transforms (or rejects with helpful errors).

### `castr-strict-test-plan-INTEGRATED.md` (archive)

- **Primary focus:** strict-only, fail-fast tests keyed to Oak contract + OpenAPI-TS-inspired fixture categories.
- **Includes:** determinism, strict validation, IR completeness, and Oak harness integration.
- **Relevance:** directly aligns with Oak Phase 1 criteria and fixture validation pipeline. Mentions `castr-bundle` as temporary but required when harness expects it.

### `zod4-parser-plan-3.2-complete.md` (archive)

- **Primary focus:** Zod 4 → IR parsing to enable true round-trip.
- **Includes:** reject Zod 3 syntax, parse `.meta()`, `.strict()`, getter recursion, constraints, etc.
- **Relevance:** foundational for Zod → IR; partially overlaps with Zod-OpenAPI replacement (but does **not** cover `.openapi()`/`.meta()` as full OpenAPI doc metadata for endpoints).

### `zod4-advanced-features-research.md` (reference)

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

## 3) Alignment vs New Enablement Goals

### Already Planned (Strong Alignment)

- **Strict-by-default + fail-fast** (roadmap + strict test plan)
- **Determinism** (strict test plan + round-trip validation plan)
- **Metadata maps + JSON Schema output** (future-artefact-expansion)
- **Writer registry + manifest** (future-artefact-expansion)

### Partially Planned

- **Zod → IR parsing** (Session 3.2, archived). This enables Zod-based workflows but not full Zod-OpenAPI parity yet.
- **MCP output** (already present) but needs JSON Schema alignment for Oak response maps.

### Not Planned (Gaps to Add)

- **Path format configuration** (default **curly**, boolean switch for colon) for endpoints and maps.
- **Explicit `operationId` field in endpoint output** (currently `alias`).
- **Metadata output options** (Option A: metadata TS emitter, Option B: Zod-first enablement).
- **Bundle manifest output** is **TBD** and should be validated with Oak before committing to a shape.
- **tRPC → IR parser / adapters** (needed to replace `trpc-to-openapi`).
- **Zod-OpenAPI metadata ingestion** (`.openapi()` / `.meta()` mapping to OpenAPI fields).
- **Watch mode / plugin surface** (openapi-ts best-practice alignment; not in roadmap).

## 4) Potential Plan Conflicts / Risks

1. **ADR-026 scope vs legitimate string operations**
   - ADR-026 forbids string/regex heuristics used to infer semantics from TypeScript source text when AST + semantic APIs exist.
   - Data-string parsing (OpenAPI `$ref`, media types, URL templates) is allowed but must be centralized, validated, tested, and fail-fast.
   - Mitigation: enforce ADR-026 only in TS-source parsing modules; centralize data-string parsing utilities; continue to avoid string templates for code generation (use ts-morph printers).

2. **Strict-by-default in plans vs writer default behavior**
   - Plans emphasize strict-by-default, but current Zod writer defaults to `.passthrough()` unless `strictObjects` is set.
   - Mitigation: introduce a strict profile (or default true) for Oak outputs; ensure tests enforce it.

3. **Zod parser accept/reject patterns**
   - Parser plan has a strict accept list that must match the current Zod writer output.
   - Mitigation: align parser acceptance with writer output and update the Zod 4 pattern table as needed.

## 5) Concrete Recommendations to Incorporate into Plans

- Extend `future-artefact-expansion.md` with **Oak enablement outputs** explicitly:
  - operationId maps, path format switch, metadata output options (A/B), bundle manifest **TBD**.
- Add a short **tRPC → IR plan** (parser + security mapping) to the roadmap.
- Add **Zod-OpenAPI metadata ingestion** as a Session in the roadmap (post-3.3 parity track; likely Roadmap Phase 4).
- Add a **strict profile** concept to the roadmap to enforce Oak defaults.

**Update given Oak flexibility:** prefer IR-first outputs and helper APIs over prescriptive string-based public APIs. Output artifacts must be rule-compliant (no `as` except `as const`, no `Object.*`, no stringified schema APIs).

## 6) Key Takeaway

The existing plan set is strong on IR correctness, strict validation, and determinism, and already anticipates multi-artefact output (including metadata maps and JSON Schema). The main missing pieces are integration-specific: path formatting, operationId maps, metadata output options (A/B), tRPC and Zod-OpenAPI ingestion, and a concrete bundle manifest **if** Oak validates the need.
