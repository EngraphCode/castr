# Roadmap: @engraph/castr

**Date:** January 24, 2026 (Updated April 11, 2026)  
**Status:** Active  
**Quality Gates:** Must be green at all times (see `.agent/directives/DEFINITION_OF_DONE.md`)

---

## Executive Summary

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```text
Any Input Format → Parser → IR (CastrDocument) → Writers → Any Output Format
```

**Key Principle:** IR is the canonical model. ts-morph is used for TypeScript parsing and TS/Zod code generation. OpenAPI output is produced as typed objects. Zod parser and writer must remain in lockstep: the parser MUST accept all writer output patterns, and unsupported patterns MUST fail fast with helpful errors.

---

## Nomenclature (Phase vs Session)

- **Phase**: A major milestone on this roadmap (high-level product capability).
- **Session X.Y**: A unit of execution within a phase (work tracking). Historical sessions are archived under `./archive/`.
- **Session 3.3a / 3.3b**: Two parallel sub-tracks within Session 3.3 (strictness remediation vs strict Zod-layer transform validation with sample input).
- **Atomic plans**: Small, linear steps stored under `./current/` and linked below.
- **Primary active atomic plan**: The primary next atomic plan lives under `./active/`.
- **Parked-in-place exception**: A user may explicitly keep non-primary unfinished plans physically in `./active/`; if so, they must be labelled as parked-in-place context rather than companions.
- **Paused workstreams**: Incomplete but non-primary workstreams live under `./current/paused/` until they become the next atomic slice again.
- **Completed atomic plans (staged)**: Completed atomic plans are moved to `./current/complete/` and only archived in batches when a group of work is complete.

---

## Current Active Workstream

The Practice integration slice, core agent-system installation slice, type-safety remediation workstream, strict object semantics enforcement slice, `int64` / `bigint` remediation closure slice, doctor runtime-characterisation slice, doctor rescue-loop runtime redesign slice, architecture review remediation arc, JSON Schema parser expansion, Schema Completeness Arc, and OAS 3.2 version plumbing slice are complete.

The primary active plan is [oas-3.2-full-feature-support.md](./active/oas-3.2-full-feature-support.md) — OAS 3.2-only feature expansion across the IR, parsers, and writers. The Phase A₂ closure record now lives at [phase-a2-type-migration.md](./current/complete/phase-a2-type-migration.md).

Current product truth:

- the shared preparation boundary now accepts native `{ openapi: '3.2.0' }` input and canonicalises accepted 3.0/3.1/3.2 documents to `3.2.0`
- `pnpm test:gen` now includes representative native OAS 3.2 fixture coverage alongside the existing 3.0/3.1 fixtures
- OpenAPI 3.1.x remains a documented Scalar bridge input, not a peer output target
- `schemas-only` now genuinely suppresses endpoint metadata, MCP tool exports, and helper exports
- MCP tool schemas are normalised to a governed Draft 07 allowlist before AJV validation
- Phase A₂ (type migration from `openapi3-ts` to `@scalar/openapi-types`) completed on Friday, 10 April 2026. The close-out resolved A1 and A2-A6, introduced a genuinely nested raw OpenAPI input seam, restored lossless `components.mediaTypes` and ref-bearing `components.pathItems` handling through IR, removed the verified IR media-type barrel cycle, cleared the duplicate CLI guard export plus stale `knip` ignore, strengthened dependency-exit guards, and closed the reviewer loop with no open findings.
- the full repo-root gate chain, `pnpm madge:circular`, `pnpm knip`, and the targeted active-surface `openapi3-ts` greps were green on Friday, 10 April 2026. The MCP no-params tool-input-schema follow-up then closed on Saturday, 11 April 2026 with targeted MCP/schema proofs, affected snapshot proofs, and repo-root `pnpm type-check` green. Phase B and Phase C also closed on Saturday, 11 April 2026 with repo-root `pnpm check` green on the final Phase C close-out sweep. For aggregate verification, use `pnpm check` locally or `pnpm check:ci` for non-mutating reruns; do not invoke `pnpm qg` directly.
- Husky is now the live repo-local hook runner: `pre-commit` formats staged files with Prettier, `pre-push` runs `pnpm check:ci`, and the first post-install full non-mutating repo-root sweep completed green on Saturday, 11 April 2026
- A fresh generated-code validation gate issue was reproduced and fixed on Saturday, 11 April 2026: the generated-suite temp harness now allocates isolated per-suite directories under `lib/tests-generated/.tmp`, `test:gen` is green again at `5` files / `26` tests, and repo-root `pnpm check` is green again
- Phase B is now honestly closed: native OpenAPI 3.2 `query` survives parser -> IR -> writer and downstream endpoint/MCP consumers, duplicated raw PathItem visitors no longer skip it, MCP treats `query` as read-only/non-destructive, and hierarchical tags (`summary`, `parent`, `kind`) have explicit parser/writer proof
- Phase C is now honestly closed: `oauth2.flows.deviceAuthorization` and XML `nodeType` have explicit parser/writer proof, valid templated paths survive the shared load boundary -> IR -> writer -> endpoint/MCP consumers unchanged, malformed top-level `paths` templates fail fast before upgrade/canonicalisation, and the `code-reviewer` / `test-reviewer` / `openapi-expert` loop is closed with no open findings
- the immediate next slice is therefore Phase D on the parent OAS 3.2 plan (Example Object `dataValue` / `serializedValue` semantics) unless a user reports a fresh gate or runtime issue first
- if a user says there are gate or runtime issues, that report is active session truth and must be reproduced immediately
- `lib` / `@engraph/castr` remains the core compiler boundary; typed fetch, runtime handler, framework, and code-first integration work belongs in companion workspaces

Recent staged completion records:

- [discovery-and-prioritisation.md](./current/complete/discovery-and-prioritisation.md) — executed metaplan that selected the schema-completeness slices
- [anchor-and-dynamic-references.md](./current/complete/anchor-and-dynamic-references.md) — Schema Completeness Arc Phase 2 close-out
- [core-vs-companion-workspaces-plan-alignment.md](./current/complete/core-vs-companion-workspaces-plan-alignment.md) — repo-wide plan-surface alignment to ADR-043
- [feature-parity-planning-input-alignment.md](./current/complete/feature-parity-planning-input-alignment.md) — residual feature-parity planning-input wording gap closed
- [oas-3.2-version-plumbing.md](./current/complete/oas-3.2-version-plumbing.md) — canonical target version migration is implemented and verified through the full repo-root sweep; shared-boundary, writer, generated-suite, and doctor-preflight coverage now target 3.2.0

Architecture-review provenance:

- Packs 1 through 7 closed on Sunday, 22 March 2026 with point-in-time `yellow` / `red` verdicts
- current resolved state lives in [cross-pack-triage.md](../research/architecture-review-packs/cross-pack-triage.md)
- sweep record: [architecture-review-packs.md](./current/complete/architecture-review-packs.md) — staged completion record

Supporting rules that remain locked in:

- doctrinal alignment remains locked in
- `as const` remains allowed literal-preservation infrastructure
- `unknown` is valid only at incoming external boundaries and must be validated immediately
- after validation, all types remain strict and no type information may be discarded or widened away
- strict and complete everywhere, all the time: claimed supported surfaces must align across parser, IR, runtime validation, writers, proofs, and live docs
- all quality-gate issues, including warning-producing gate noise, are blocking at all times
- custom portable types remain deliberately unsupported for now and are not currently planned work

Current sweep record:

- [architecture-review-packs.md](./current/complete/architecture-review-packs.md) — completed post-IDENTITY architecture review sweep (staged completion record)

**JSON Schema parser expansion** completed Tuesday, 25 March 2026:

- `parseJsonSchemaDocument()` expanded from `$defs`-only extractor to full document parser
- Supports standalone schemas, `$defs` bundles, and mixed documents
- Root schema naming: `title` > `$id` > `"Root"`
- `$anchor`/`$dynamicRef`/`$dynamicAnchor` now supported: parsed into IR, lossless round-trip, Zod/TS fail-fast for dynamic keywords
- 13 new unit tests, all quality gates green
- Historical remediation record ([json-schema-parser.md](./current/complete/json-schema-parser.md)) captures the parser-contract review context and what remained deferred

**`patternProperties`/`propertyNames` implementation** completed Wednesday, 26 March 2026:

- Full-stack: IR model, JSON Schema parser/writer, OpenAPI parser, Zod/TS fail-fast
- Round-trip proofs in Scenario 5 (losslessness, idempotency, schema-count, $defs-key preservation)
- Plan: [pattern-properties-and-property-names.md](./current/complete/pattern-properties-and-property-names.md) (✅ complete)

**`prefixItems` tuple writer fix + `contains` keyword support** completed Wednesday, 26 March 2026:

- Part A: Zod writer emits `z.tuple([...])`, TypeScript writer emits `[A, B]` tuple types for `prefixItems`
- Part B: `contains` added to IR, JSON Schema parser (types + 2020-keywords), JSON Schema writer, OpenAPI builder, Zod/TS fail-fast
- Round-trip proofs: `ContainsSchema` in `2020-12-keywords.json` fixture
- Plan: [prefixitems-tuple-and-contains.md](./current/complete/prefixitems-tuple-and-contains.md) (✅ complete)

**Silent keyword drop fix + Boolean schema support** completed Thursday, 27 March 2026:

- All 2020-12 IR keywords now either emit losslessly or fail-fast in Zod/TS writers
- `booleanSchema` added to IR model (`CastrSchema.booleanSchema?: boolean`)
- JSON Schema parser accepts boolean input, JSON Schema writer emits `true`/`false` directly
- Zod writer: `false` → `z.never()`, `true` → `z.any()` (semantic completeness)
- TypeScript writer: `false` → `never`, `true` → `unknown` (semantic completeness)
- OpenAPI writer: fail-fast (boolean schemas are a pure JSON Schema 2020-12 concept)
- Format tensions table updated with `booleanSchema` row

**`if`/`then`/`else` conditional applicator support** completed Thursday, 27 March 2026:

- IR model extended with `if`, `then`, `else` fields + runtime validator updated
- JSON Schema parser: `parseConditionalApplicators()` with boolean schema support
- JSON Schema writer: `writeConditionalApplicators()` for lossless round-trip
- Zod + TypeScript writers: fail-fast with actionable error messages (3 new tests)
- Round-trip proof: `ConditionalApplicatorSchema` in `2020-12-keywords.json`
- Plan: [if-then-else-conditional-applicators.md](./current/complete/if-then-else-conditional-applicators.md) (✅ complete)

**Canonical egress normal form alignment** completed Friday, 28 March 2026:

- Audit confirmed nullability (`[type, "null"]`) and `$ref` sibling policy (bare `$ref`) were already canonical
- `example`/`examples` emission fixed: JSON Schema writer now suppresses OAS-only `example` and folds into `examples`
- ADR-042 documents the canonical normal form
- All quality gates green (historical aggregate gate chain exit 0)

**Input-Output Pair Compatibility Model** established Friday, 28 March 2026:

- New governing doctrine: feature support is defined by input-output pairs, constrained by the output format
- The IR is the format-independent superset — capable of carrying features from ANY supported format
- "Supported" means semantic preservation through a round-trip, not necessarily 1:1 keyword mapping
- Fail-fast is reserved for genuinely impossible output mappings, not implementation gaps
- Enshrined in: `principles.md`, `requirements.md`, `AGENT.md`, `.agent/rules/input-output-pair-compatibility.md`, acceptance criteria

**Schema Completeness Arc** — Phase 2 complete, Sunday 30 March 2026:

- **Phase 1: Close existing semantic gaps** ✅ — All 9 Zod fail-fast guards that were implementation gaps upgraded to semantic `.refine()` runtime validation closures. TS `booleanSchema: true` upgraded to `unknown`. All TS genuinely impossible fail-fast error messages audited and improved with "Genuinely impossible" prefix and detailed explanations.
  - New `refinements/` subdirectory: `object.ts` (patternProperties, propertyNames, dependentSchemas, dependentRequired, unevaluatedProperties, if/then/else) and `array.ts` (contains/minContains/maxContains, unevaluatedItems)
  - All quality gates green, 41/41 Zod tests + 14/14 TS tests passing
- **Phase 1.5: TS ❓ resolution** ✅ — completed Saturday, 29 March 2026. `dependentRequired` and `dependentSchemas` implemented as discriminated union types. `unevaluatedProperties` (schema-valued) and `if/then/else` confirmed genuinely impossible (❌). Format tensions table resolved: zero ❓ markers.
- **Phase 2: IR expansion for $anchor/$dynamicRef/$dynamicAnchor** ✅ COMPLETE — All three keywords added to IR model, JSON Schema parser, JSON Schema writer, OpenAPI parser, IR validator. Zod/TS fail-fast wired for `$dynamicRef`/`$dynamicAnchor` (genuinely impossible). `$anchor` preserved in round-trip (reference marker, no code-gen impact). Full test coverage, round-trip proofs in `2020-12-keywords.json` fixture. Plan: [anchor-and-dynamic-references.md](current/complete/anchor-and-dynamic-references.md) (✅ complete).

**Primary Active Plan: OAS 3.2 Full Feature Support**

Tracked in [oas-3.2-full-feature-support.md](./active/oas-3.2-full-feature-support.md):

- Phase B is complete: `QUERY` HTTP method is landed end to end and hierarchical tags (`parent`, `kind`, `summary`) now have explicit proof
- Phase C is complete: OAuth 2.0 Device Authorization flow, XML `nodeType`, and strict top-level path-templating validation/proof are landed honestly
- Example Object `dataValue`/`serializedValue` semantics are the next active slice
- `itemSchema` streaming support on Media Type
- `additionalOperations` for custom HTTP methods (later slice per ADR-046)

**Deferred: Reference Resolution Enhancements** (separate future arc):

- External `$ref` resolution (cross-document references — separate infrastructure arc)
- `$anchor`-based reference resolution (`$ref: "#myAnchor"` — the IR carries `$anchor` after Phase 2, but resolving anchor-based references to their target schemas is not implemented)
- `$dynamicRef`/`$dynamicAnchor` runtime resolution semantics (the IR carries the markers after Phase 2; Zod/TS writers fail-fast; JSON Schema/OAS writers round-trip the values; but actual dynamic scope resolution is not implemented)

Historical supporting context that remains important:

- [json-schema-parser.md](./current/complete/json-schema-parser.md) — historical parser-remediation context only; do not treat it as a resumable paused workstream

Parked research note:

- [multiformat-target-support.md](../research/multiformat-target-support.md)

Recently completed adjacent remediation:

- [doctor-runtime-characterisation-and-transform-proof-budget-decision.md](./current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md)
- [identity-doctrine-alignment.md](./current/complete/identity-doctrine-alignment.md)
- [int64-bigint-semantics-investigation.md](./current/complete/int64-bigint-semantics-investigation.md)
- [ir-and-runtime-validator-remediation.md](./current/complete/ir-and-runtime-validator-remediation.md)
- [format-specific-drift-remediation.md](./current/complete/format-specific-drift-remediation.md)
- [downstream-surface-drift-remediation — RC-5 completed in-session 2026-03-24]
- [proof-system-and-doctrine-remediation.md](./current/complete/proof-system-and-doctrine-remediation.md)
- [strict-object-semantics-enforcement.md](./current/complete/strict-object-semantics-enforcement.md)
- [type-safety-remediation.md](./current/complete/type-safety-remediation.md)
- [type-safety-remediation-follow-up.md](./current/complete/type-safety-remediation-follow-up.md)
- [recursive-unknown-key-semantics-remediation.md](./current/complete/recursive-unknown-key-semantics-remediation.md)

## Operational Practice Integration (Complete)

Completed plan:

- [practice-core-integration-and-practice-restructuring.md](./current/complete/practice-core-integration-and-practice-restructuring.md)

This completed slice integrated the portable Practice Core into Castr's local Practice, renamed the legacy doctrine file to `.agent/directives/principles.md`, installed the canonical-first command / skill / rule model, and documented future Gemini / Antigravity platform support.

## Core Agent System And Codex Adapters (Complete)

Completed plan:

- [core-agent-system-and-codex-agent-adapters.md](./current/complete/core-agent-system-and-codex-agent-adapters.md)

This completed slice installed the canonical reviewer/domain-expert layer under `.agent/sub-agents/`, added the reviewer invocation contract in `.agent/rules/invoke-reviewers.md`, and registered the first Codex reviewer/domain-expert project agents under `.codex/config.toml` and `.codex/agents/`.

---

## Historical Milestones

The completion sections below record what closed at the time.

Packs 4-7 later found that the repo's current support and proof posture is narrower than some of the historical "complete" language below implies, especially for JSON Schema, Zod parity, generated output, and transform proof breadth. Use **Current Active Workstream** above plus the pack notes for current truth.

## Priority: Production-Ready Core Path

OpenAPI ↔ OpenAPI transform proof is validated. OpenAPI → Zod generation is proven. Session 3.3b achieved strict Zod-layer transform validation with sample input.

```text
OpenAPI → IR → OpenAPI (transform validation, incl. strict round-trip/idempotence assertions) ✅
OpenAPI → IR → Zod (proven) ✅
Zod → IR (Session 3.2) ✅ COMPLETE
Full Transform Validation (Session 3.3) ✅ COMPLETE
```

---

## Phase 2: Core Path to Production (COMPLETE)

| Session | Focus                         | Status      |
| ------- | ----------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer   | ✅ Complete |
| 2.6     | OpenAPI Compliance            | ✅ Complete |
| 2.7     | OpenAPI Transform Validation  | ✅ Complete |
| 2.8     | Zod 4 Output Compliance       | ✅ Complete |
| 2.9     | OpenAPI → Zod Pipeline Polish | ✅ Complete |

---

## Phase 3: Zod Transform Validation (COMPLETE)

| Session  | Focus                                                                        | Status      |
| -------- | ---------------------------------------------------------------------------- | ----------- |
| 3.1a     | IR Semantic Audit                                                            | ✅ Complete |
|          | └ Archive: [3.1a](./archive/ir-semantic-audit-plan-3.1a-complete.md)         | ✅          |
| 3.1b     | Zod 4 IR→Zod Improvements                                                    | ✅ Complete |
|          | └ Native recursion (getter syntax)                                           | ✅ Complete |
|          | └ Codecs (deferred — not first-class APIs)                                   | ⚪ Deferred |
|          | └ .overwrite() (deferred — no real-world usage)                              | ⚪ Deferred |
|          | └ Archive: [3.1b](./archive/zod4-ir-improvements-plan-3.1b-complete.md)      | ✅          |
| **3.2**  | **Zod → IR Parser**                                                          | ✅ Complete |
|          | └ Parse Zod 4 output, reconstruct IR                                         | ✅ Complete |
|          | └ Zod 4 only (reject Zod 3 syntax)                                           | ✅ Complete |
|          | └ Documentation updated for bidirectional pipeline                           | ✅ Complete |
|          | └ Archive: [zod4-parser-plan.md](./archive/zod4-parser-plan-3.2-complete.md) |             |
| **3.3a** | **ADR-026 Enforcement + Strictness Remediation**                             | ✅ Complete |
|          | └ No string/regex heuristics for TS-source parsing; use semantic analysis    | ✅          |
|          | └ No escape hatches: remove `as`/`any`/`!`/`eslint-disable` in product code  | ✅          |
|          | └ Eliminate fallbacks; fail fast and hard with helpful errors                | ✅          |
| **3.3b** | **Strict Zod-Layer Transform Validation** (Strict, no weak assertions)       | ✅ Complete |
|          | └ Structural strictness closure for Scenarios 2-4                            | ✅ Complete |
|          | └ Remaining strictness/parity blockers (formats, validation parity matrix)   | ✅ Complete |

---

## Session 3.3a — ADR-026 Enforcement + Strictness Remediation

Bring the repository into strict alignment by completing two things in lockstep:

- **ADR-026 correctness:** TS-source parsing must not use string/regex heuristics. Use ts-morph AST + semantic APIs (symbol resolution) to derive meaning.
- **Repo-wide strictness:** no permissive fallbacks, no swallowed errors, no escape hatches, deterministic output proven by tests.

**Repo truth (as of 2026-02-13):**

- ESLint config is `lib/eslint.config.ts` (no repo-root `eslint.config.ts`).
- ADR-026 enforcement exists but is disabled by a schema-processing override that turns `no-restricted-syntax` off (`lib/eslint.config.ts:249`).
- ADR-026 is scoped: TS-source parsing heuristics are forbidden; data-string parsing (OpenAPI `$ref`, media types) is allowed only when centralized + validated + tested + fail-fast.
- **Scope defined (3.3a.01 complete), absolute strictness enforced:** No grey areas, no "partially enforced" tiers. TS-source heuristics banned in ALL `src/`. Data-string methods banned everywhere except designated centralized utilities. Audit found **31 violations**: 22 TS-source heuristics (Zod parser), 7 centralization violations (ad-hoc `$ref` parsing), 2 IR text-heuristic violations. See ADR-026 § "Scope Definition".

**Definition of Done (3.3a):**

- ADR-026 lint enforcement is enabled in the correct scopes and cannot be bypassed by moving files.
- TS-source parsers do not use string/regex heuristics to infer meaning (no `getText()`-driven semantics).
- Data-string parsing is centralized and strictly validated (no scattered ad-hoc `$ref` parsing).
- No permissive fallbacks exist anywhere in product code.
- No swallowed errors exist in strict pipeline code paths.
- No product-code escape hatches exist (non-const type assertions, `any`, `!`, `eslint-disable`). `as const` remains governed literal-preservation infrastructure.
- Determinism is proven by tests (stable ordering, byte-identical outputs where required).
- TDD is mandatory for all work (see `principles.md` § Testing Standards).
- Quality gates pass (canonical: `.agent/directives/DEFINITION_OF_DONE.md`).

**Governing docs:** `.agent/directives/VISION.md`, `.agent/directives/principles.md`, `.agent/directives/testing-strategy.md`, `.agent/directives/requirements.md`, `.agent/directives/DEFINITION_OF_DONE.md`.

**References:** `docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md`, `lib/eslint.config.ts`.

**Progress update (2026-02-19):**

- [3.3a.04 — Repo-Wide ADR-026 Remediation](./current/complete/3.3a-04-centralize-data-string-parsing.md) remains complete (lint debt reduced from 272 to 0).
- [3.3a.05 — Remove Permissive Fallback Outputs](./current/complete/3.3a-05-remove-permissive-fallbacks.md) is complete and moved to `./current/complete/`.
- [3.3a.06 — Remove Swallowed Errors](./current/complete/3.3a-06-remove-swallowed-errors.md) is complete and moved to `./current/complete/`.
- [3.3a.07 — Remove Escape Hatches](./current/complete/3.3a-07-remove-escape-hatches.md) is complete and moved to `./current/complete/`.
- [3.3a.08 — Prove Determinism](./current/complete/3.3a-08-prove-determinism.md) is complete and moved to `./current/complete/` after TDD closure of Tranches A-D and full gate verification.
- Plan 05 established a centralized strict component-ref helper at `lib/src/schema-processing/parsers/openapi/builder.component-ref-resolution.ts` and removed permissive output degradation paths.
- Plan 06 removed swallowed-error paths in dependency extraction, Zod declaration parsing, and circular ref extraction; component-ref validation remains centralized.
- Plan 07 removed non-governed check-disabling directives and replaced escape-hatch usage with typed, rule-compliant implementations.
- [3.3b.01 — Transform Sample Suite Strictness](./current/complete/3.3b-01-transform-sample-suite-strictness.md) is complete and moved to `./current/complete/`.
- [3.3b.02 — Scenario 3 Reference Composition](./current/complete/3.3b-02-scenario3-reference-composition.md) is complete and moved to `./current/complete/`.
- [3.3b.03 — Reject `z.undefined()`](./current/complete/3.3b-03-reject-z-undefined.md) is complete and moved to `./current/complete/`.
- Subsequent active work moved on from the historical 3.3b sequence; see **Current Active Workstream** above for the live active plan and follow-up handoff.

---

## Session 3.3b — Strict Zod-Layer Transform Validation

Prove that the Zod layer participates in strict, lossless transform validation with sample input:

- Scenarios 2–4 are strict proofs (no `<=`, no “skip on errors”).
- Writer and parser remain in lockstep: writer output must be parseable; parseable constructs must transform losslessly or be rejected upstream.

**Scenarios (target state):**

| #   | Scenario                          | Lossless | Idempotent | Status                                                  |
| --- | --------------------------------- | -------- | ---------- | ------------------------------------------------------- |
| 1   | OpenAPI → IR → OpenAPI            | ✅       | ✅         | ✅ Complete                                             |
| 2   | Zod → IR → Zod                    | ✅       | ✅         | ✅ Structural strictness and functional parity complete |
| 3   | OpenAPI → IR → Zod → IR → OpenAPI | ✅       | —          | ✅ Structural strictness and functional parity complete |
| 4   | Zod → IR → OpenAPI → IR → Zod     | ✅       | —          | ✅ Structural strictness and functional parity complete |

> **Note:** Scenario strictness checks are sample-input transform proofs, and some assertions are explicit round-trip/idempotence proofs. Functional validation-parity (data validates identically before/after transform execution) complete in [3.3b.05 — Validation-Parity Scenarios 2–4](./current/complete/3.3b-05-validation-parity-scenarios-2-4.md).

**Success criteria (3.3b):**

- `z.undefined()` strict rejection and no-degradation contract are complete (3.3b.03).
- Writer format parity for hostname/float32/float64 is lossless or fail-fast with context (3.3b.04).
- Validation-parity tests cover Scenarios 2–4 (data validates the same before/after transform execution).
- Idempotency holds where required (byte-identical normalized outputs on second pass).
- Quality gates pass (canonical: `.agent/directives/DEFINITION_OF_DONE.md`).

**Governing docs:** `.agent/directives/VISION.md`, `.agent/directives/requirements.md`, `docs/architectural_decision_records/ADR-027-round-trip-validation.md`, `docs/architectural_decision_records/ADR-031-zod-output-strategy.md`, `docs/architectural_decision_records/ADR-032-zod-input-strategy.md`.

**References:** `lib/tests-transforms/__tests__/transform-samples.integration.test.ts`, `lib/tests-transforms/__tests__/validation-parity*.integration.test.ts`, `lib/src/schema-processing/parsers/zod/zod-parser.detection.ts`.

---

## Session 3.3 Execution Flow (Atomic Plans)

Session 3.3 was executed as a linear sequence of smaller atomic plans. The canonical completed records now live under `./current/complete/`, and the old queue-mirror stubs have been moved to archive.

| Step | Plan                                                                                                           | Status      |
| ---- | -------------------------------------------------------------------------------------------------------------- | ----------- |
| 1    | [3.3a.01 — ADR-026 Scope Definition](./current/complete/3.3a-01-adr026-scope.md)                               | ✅ Complete |
| 2    | [3.3a.02 — ESLint Enforcement Redesign](./current/complete/3.3a-02-eslint-enforcement-redesign.md)             | ✅ Complete |
| 3    | [3.3a.03 — Zod Parser Semantic Parsing](./current/complete/3.3a-03-zod-parser-semantic-parsing.md)             | ✅ Complete |
| 4    | [3.3a.04 — Repo-Wide ADR-026 Remediation](./current/complete/3.3a-04-centralize-data-string-parsing.md)        | ✅ Complete |
| 5    | [3.3a.05 — Remove Permissive Fallback Outputs](./current/complete/3.3a-05-remove-permissive-fallbacks.md)      | ✅ Complete |
| 6    | [3.3a.06 — Remove Swallowed Errors](./current/complete/3.3a-06-remove-swallowed-errors.md)                     | ✅ Complete |
| 7    | [3.3a.07 — Remove Escape Hatches](./current/complete/3.3a-07-remove-escape-hatches.md)                         | ✅ Complete |
| 8    | [3.3a.08 — Prove Determinism](./current/complete/3.3a-08-prove-determinism.md)                                 | ✅ Complete |
| 9    | [3.3b.01 — Transform Sample Suite Strictness](./current/complete/3.3b-01-transform-sample-suite-strictness.md) | ✅ Complete |
| 10   | [3.3b.02 — Scenario 3 Reference Composition](./current/complete/3.3b-02-scenario3-reference-composition.md)    | ✅ Complete |
| 11   | [3.3b.03 — Reject `z.undefined()`](./current/complete/3.3b-03-reject-z-undefined.md)                           | ✅ Complete |
| 12   | [3.3b.04 — Format Parity (hostname, float32/64)](./current/complete/3.3b-04-format-parity-hostname-float.md)   | ✅ Complete |
| 13   | [3.3b.05 — Validation-Parity Scenarios 2–4](./current/complete/3.3b-05-validation-parity-scenarios-2-4.md)     | ✅ Complete |
| 14   | [3.3b.06 — Expand Zod Fixtures](./current/complete/3.3b-06-expand-zod-fixtures.md)                             | ✅ Complete |
| 15   | [3.3b.07 — Nullability Chain Normalization](./current/complete/3.3b-07-nullability-chain-normalization.md)     | ✅ Complete |

---

## Phase 4: JSON Schema + Parity Track (Active)

Session 3.3 is complete. Phase 4 focuses on JSON Schema support and post-3.3 parity work.

- JSON Schema outputs where required (Draft 2020-12 semantics, strict, deterministic)
- JSON Schema input support (Draft 2020-12)
- Feature-parity alignment (tracked under `.agent/research/feature-parity/*`)
- Multi-artefact output separation where it improves strict transform validation paths (Zod schema output vs metadata outputs)
- Investigation of the remaining Zod round-trip limitations before further remediation work

**Progress:**

- ✅ Component 1: Shared JSON Schema field logic extracted from OpenAPI writer into `writers/shared/`
- ✅ Component 2: JSON Schema Writer (`writers/json-schema/`) — standalone, document, and bundled modes
- ✅ **IDENTITY Alignment: Strict-Only Object Semantics** — [complete plan](./current/complete/identity-doctrine-alignment.md)
- ✅ Component 3: JSON Schema Parser — complete; historical remediation context recorded in [json-schema-parser.md](./current/complete/json-schema-parser.md)
- ✅ Component 4: Multi-Cast Parity Rig — complete; see [phase-4-json-schema-and-parity.md](./current/complete/phase-4-json-schema-and-parity.md)

Strategic phase plan: [phase-4-json-schema-and-parity.md](./current/complete/phase-4-json-schema-and-parity.md)

- [doctor-rescue-loop-runtime-redesign.md](./current/complete/doctor-rescue-loop-runtime-redesign.md)
- [doctor-runtime-characterisation-and-transform-proof-budget-decision.md](./current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md)
- [strict-object-semantics-enforcement.md](./current/complete/strict-object-semantics-enforcement.md)
- [int64-bigint-semantics-investigation.md](./current/complete/int64-bigint-semantics-investigation.md)
- [recursive-unknown-key-semantics-remediation.md](./current/complete/recursive-unknown-key-semantics-remediation.md)
- Older exploratory Zod-limitation context now lives in archive:
  - [zod-limitations-architecture-investigation.md](./archive/zod-limitations-historical-cluster/zod-limitations-architecture-investigation.md)
  - [recursive-unknown-key-preserving-zod-emission-investigation.md](./archive/zod-limitations-historical-cluster/recursive-unknown-key-preserving-zod-emission-investigation.md)
  - [transform-proof-budgeting-and-runtime-architecture-investigation.md](./archive/zod-limitations-historical-cluster/transform-proof-budgeting-and-runtime-architecture-investigation.md)

Residual research threads: [zod-and-transform-future-investigations.md](../research/zod-and-transform-future-investigations.md)

## Phase 5: Companion Workspace Expansion (Planned)

- Companion code-first integrations
  - tRPC or equivalent authored-operation ingestion for OpenAPI generation
  - Zod metadata ingestion for code-first publishing flows
- Companion transport/runtime workspaces
  - typed fetch harnesses
  - framework handlers / middleware adapters
  - lightweight runtime exposure packages
- Reference implementations and adoption proofs
  - replace Oak's `openapi-zod-client` adapter boundary
  - replace Oak's wider OpenAPI third-party stack
  - replace Oak's `oak-openapi` generation stack

Plan: [phase-5-ecosystem-expansion.md](./future/phase-5-ecosystem-expansion.md)

Oak proving ladder (explicit future plan homes):

- [oak-adapter-boundary-replacement.md](./future/oak-adapter-boundary-replacement.md) — Use Case 1 high-level plan for the first concrete Oak adoption wedge
- [oak-wider-openapi-stack-replacement.md](./future/oak-wider-openapi-stack-replacement.md) — Use Case 2 high-level plan for the broader `oak-mcp-ecosystem` replacement arc, including the `openapi-fetch` decision gate
- [oak-code-first-openapi-generation-replacement.md](./future/oak-code-first-openapi-generation-replacement.md) — Use Case 3 high-level plan for the `oak-openapi` replacement programme

Agentic infrastructure platform expansion is tracked separately in:

- [gemini-antigravity-agentic-platform-support.md](./future/gemini-antigravity-agentic-platform-support.md)

Strictness note: any "best-effort" or "permissive fallback" behavior is a doctrine violation. If a feature cannot be represented losslessly, it must be rejected with a helpful error (or the IR/writers must be extended).

---

## Architectural Notes

The following architectural notes from Phase 3.3 have been formalized into ADRs:

- **Separate Writer Concerns**: Formally decoupled the generation of pure schemas from runtime metadata. See `ADR-034-writer-separation.md`.
- **Two-Pass Semantic Parsing**: Moving from single-pass regex string parsing to two-pass AST symbol-table resolution. See `ADR-033-two-pass-semantic-parsing.md`.

---

## Post‑3.3 Feature‑Parity Track (Alignment Only)

After Session 3.3 transform-validation closure, prioritize the parity workstream documented in
`.agent/research/feature-parity/*`. This is **alignment**, not a prescriptive API commitment:

- IR‑first metadata outputs (maps/helpers), optional path formatting, and bundle manifest
- JSON Schema outputs for response/parameter validation where needed
- Zod metadata ingestion for OpenAPI generation
- companion code-first ingestion for OpenAPI emission (Oak integration target)

---

## Supported Formats (Current)

| Format          | Input | Output | Status / Notes                                                                                                                     |
| --------------- | :---: | :----: | ---------------------------------------------------------------------------------------------------------------------------------- |
| **OpenAPI**     |  ✅   |   ✅   | 2.0 input-only; 3.x input → 3.2.0 output; `components.requestBodies` egress implemented in RC-4.1                                  |
| **Zod**         |  ✅   |   ✅   | Input: Session 3.2 complete; output is Zod 4                                                                                       |
| **TypeScript**  |   —   |   ✅   | Writer available (types + helpers)                                                                                                 |
| **JSON Schema** |  ✅   |   ✅   | Full Draft 07 / 2020-12 document parser, writer, and standalone round-trip proofs; `$dynamicRef`/`$dynamicAnchor` Zod/TS fail-fast |

Companion-workspace directions such as tRPC ingestion or runtime handler generation may consume or emit these core surfaces, but they are not part of the current `lib` format-support table.

---

## Engineering Standards

- **Zod 4 Only:** No Zod 3 support — reject with clear errors
- **Strict-by-Default:** `.strict()`, throw on unknown
- **Complete-by-Default:** a claimed supported surface is end to end or not yet supported
- **Fail-Fast:** Informative errors, never silent fallbacks
- **No Escape Hatches:** No non-const type assertions, `any`, `!`, or `eslint-disable` workarounds in product code. `as const` remains allowed infrastructure.
- **TDD:** Failing tests first
- **Quality Gates:** Canonical definition is `.agent/directives/DEFINITION_OF_DONE.md`

```bash
pnpm check:ci
```

Local convenience (may auto-fix formatting/lint where safe):

```bash
pnpm check
```

---

## Key Documents

| Category    | Document                                                                    | Purpose           |
| ----------- | --------------------------------------------------------------------------- | ----------------- |
| **Entry**   | [session-continuation.prompt.md](../prompts/session-continuation.prompt.md) | Session start     |
| **Plan**    | [roadmap.md](./roadmap.md)                                                  | Single plan truth |
| **Archive** | [archive/](./archive/)                                                      | Completed plans   |

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
