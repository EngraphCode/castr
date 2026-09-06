# Plan-estate history conserved on 2026-09-06

These verbatim pre-refresh records are historical evidence, not execution
instructions. Paths and statuses inside fences describe the original context.

## .agent/plans/roadmap.md

````markdown
# Roadmap: @engraph/castr

**Date:** January 24, 2026 (Updated April 16, 2026)
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
- **No parking (owner, 2026-06-09)**: nothing is ever "parked" to an undefined later — **all issues MUST be fixed, mostly now; sequencing with a named position in the current plan is acceptable**. Non-primary unfinished work moves to `./current/paused/` carrying its named sequence position. (A former "parked-in-place exception" entry here was applied on 2026-06-05 with a claimed user instruction the owner never gave; the owner repudiated the parking framing outright.)
- **Paused workstreams**: Incomplete but non-primary workstreams live under `./current/paused/` until they become the next atomic slice again.
- **Completed atomic plans (staged)**: Completed atomic plans are moved to `./current/complete/` and only archived in batches when a group of work is complete.

---

## Current Workstream Status

> **🔬 OVERHAUL PENDING (2026-07-04): this roadmap's transplant-era frame ("one deep
> enhancement", Axis A/B/C) is scheduled for replacement by an impact-organised roadmap** under
> [`future/strategy-vision-estate-overhaul.md`](./future/strategy-vision-estate-overhaul.md)
> (strategic brief; promotes to `current/` when the W0 owner walk completes)
> §W2 (owner directive, following the
> [wide+deep review](../report/wide-deep-review-2026-07-04.md) — which re-proved Criticals
> C2–C6 live on `main`, added findings R1–R6, and named the repo's two products under the
> verified-claims thesis). Until W2 lands, this file remains the durable milestone frame and the
> block below remains true: **remediation-02 is ungated and is the recommended next product
> slice.**

> **🟢 UNGATED (2026-07-03 evening, PR #7 merged `6b6642a`) — supersedes the "(B) dormant" and
> "Q-011 open" lines in the frontier block below.** The pre-castr doctrine-sync slice is live on
> `main`; **Axis B (product-correctness remediation 02–07) is no longer dormant** — remediation-02
> or a feature slice may open on a fresh branch off `main` immediately, with the substrate backlog
> parallel-safe. **Q-011 is DECIDED and drained** (Axis A first; Tier-1 discharged 2026-06-28 —
> home: the gap-rescan doc + `repo-continuity.md`). The live next-step pointer remains
> `repo-continuity.md §Next Safe Steps`.

> **🛑 SUPERSEDED 2026-08-26 (owner ruling QD-2): "The old effort is stopped, parity
> remains a goal, we will address it in time."** The frontier block below is era
> history — axis A is STOPPED, its gap-rescan backlog is not a live next step, and the
> Q-011 sequencing question is moot; the plan-of-record is the proof-programme queue
> (B-11), and parity's living frame is the 2026-08-24 bidirectional-equality directive.
>
> **🧭 CURRENT FRONTIER (2026-06-28, era history — see the supersession above) — supersedes the "Phase 7 in progress" bullets below.** Transplant Phases 0–8 are
> ✅ done + tagged. The work is now the **Oak Parity-or-Better Program** under the governing **bring-everything**
> disposition (PDR-005 §Default disposition: bring unless utterly irrelevant). The **single authoritative Axis-A bring
> backlog** is [`transplant/oak-castr-gap-rescan-2026-06-28.md`](./transplant/oak-castr-gap-rescan-2026-06-28.md)
> (a two-pass firsthand-validated rescan; it folds the LC/TC/parity-tranche next-steps into one ordered spine). The
> **live next-step pointer is [`repo-continuity.md` Next Safe Steps](../memory/operational/repo-continuity.md#next-safe-steps)**;
> this roadmap is the durable product-milestone frame, not the daily next-step source. **Three axes** make up the "one
> deep enhancement": **(A)** transplant/parity (active — the gap-rescan backlog), **(B)** product-correctness
> remediation [`remediation/`](./remediation/) 02–07 (the 6 reproduced Criticals — currently dormant), **(C)** delivery
> ([`delivery-ledger.md`](./delivery-ledger.md) — deprioritised). The A/B/C sequencing is an open owner decision
> (`open-questions.md` Q-011): does B stay parked behind a now-much-larger A, given the no-undefined-later doctrine
> below? The doctrine block below stays authoritative on the "one deep enhancement = both, nothing parked to an
> undefined later" principle.

> **ONE DEEP ENHANCEMENT (owner): bring over the ENTIRE Practice / agentic-engineering framework / agent-tools /
> skill+rule+subagent+hook definitions AND fix castr's known issues — the same goal, not competing priorities.** Owner
> doctrine (2026-06-09): "all issues MUST be fixed, mostly now; sequencing with a named position is acceptable; an
> undefined 'later' is never." ~~All components live on the single branch `feat/transplant-engraph-practice`~~
> **(branch model superseded 2026-07-03: the transplant branch merged to `main` in PR #3; work proceeds on feature
> branches off `main`, one PR per slice — see the [delivery ledger](./delivery-ledger.md) current-model banner)**,
> none parked, and the owner names the next slice:
>
> - **Practice transplant** ([`current/paused/oak-practice-transplant.md`](./current/paused/oak-practice-transplant.md), tracker
>   [`transplant/README.md`](./transplant/README.md)) — Phases 0–6 complete and tagged; **Phase 7 is in progress**
>   (sub-plan [`transplant/07-adapters-and-gate-flips.md`](./transplant/07-adapters-and-gate-flips.md)).
> - **Engineering-infrastructure arc D1–D4** (tracker §Deep-enhancement arc).
> - **Deep-review remediation backlog** ([`remediation/`](./remediation/) 02–07; 01 complete + merged in) — the 6
>   shipped Criticals must be fixed; a required component, not a gate that blocks the transplant.
> - **Product feature slice** [`current/paused/explicit-additional-properties-support.md`](./current/paused/explicit-additional-properties-support.md).
>
> A 2026-06-05 record framed the feature slice as "parked-in-place per a user instruction" — **the owner never gave
> that instruction and repudiated the framing on 2026-06-09**. The 2026-06-09 "sequence positions 1/2/3" were an
> ordering guide, not a gate; advancing the transplant does not demote remediation.
>
> **Branches/PRs per plan live in the [delivery ledger](./delivery-ledger.md)** (single DRY home; a plan's
> _delivery_ = the branches, PRs, and release acts that carry its outcome to a beneficiary, per PDR-085). PR
> comment/CI monitoring discipline is defined there.

> **Deep Review (2026-06-04; report + ADR-047 now on `feat/transplant-engraph-practice`):** a first-hand-verified review found **46 issues
> (6 Critical)** the green gates do not catch — see [`.agent/report/initial-review/`](../report/initial-review/) and
> [ADR-047](../../docs/architectural_decision_records/ADR-047-zod-2020-12-keyword-emission-strategy.md). Remediation
> backlog: [`.agent/plans/remediation/`](./remediation/) (promote one into `active/` at a time; `01-packaging` fixes the
> shipped C1 types/`./parsers/zod` break). Nine completed plans + this roadmap carry dated ⚠️ correction banners (P1-P9).
> The link-aware bulk-archive of settled completions is **sequenced into transplant Phase 9** (named slot, owner
> 2026-06-09; disposition history in report §11). "Complete" labels below predate the review — treat the review
> report as current truth where they disagree.

The Practice integration slice, core agent-system installation slice, type-safety remediation workstream, strict object semantics enforcement slice, `int64` / `bigint` remediation closure slice, doctor runtime-characterisation slice, doctor rescue-loop runtime redesign slice, architecture review remediation arc, JSON Schema parser expansion, Schema Completeness Arc, and OAS 3.2 version plumbing slice are complete.

The OAS 3.2 parent workstream is now also complete. Its staged closure record lives at [oas-3.2-full-feature-support.md](./current/complete/oas-3.2-full-feature-support.md), and the Phase A₂ closure record lives at [phase-a2-type-migration.md](./current/complete/phase-a2-type-migration.md). The ePerusteet real-spec validation slice is complete at [eperusteet-real-spec-validation.md](./current/complete/eperusteet-real-spec-validation.md), and its directly related successor [explicit-additional-properties-support.md](./current/paused/explicit-additional-properties-support.md) holds position 3 in the plan-of-record sequence.

Current product truth:

- the shared preparation boundary now accepts native `{ openapi: '3.2.0' }` input and canonicalises accepted 3.0/3.1/3.2 documents to `3.2.0`
- `pnpm test:gen` now includes representative native OAS 3.2 fixture coverage alongside the existing 3.0/3.1 fixtures
- OpenAPI 3.1.x remains a documented Scalar bridge input, not a peer output target
- `schemas-only` now genuinely suppresses endpoint metadata, MCP tool exports, and helper exports
- MCP tool schemas are normalised to a governed Draft 07 allowlist before AJV validation
- Phase A₂ (type migration from `openapi3-ts` to `@scalar/openapi-types`) completed on Friday, 10 April 2026. The close-out resolved A1 and A2-A6, introduced a genuinely nested raw OpenAPI input seam, restored lossless `components.mediaTypes` and ref-bearing `components.pathItems` handling through IR, removed the verified IR media-type barrel cycle, cleared the duplicate CLI guard export plus stale `knip` ignore, strengthened dependency-exit guards, and closed the reviewer loop with no open findings.
- the full repo-root gate chain, `pnpm madge:circular`, `pnpm knip`, and the targeted active-surface `openapi3-ts` greps were green on Friday, 10 April 2026. The MCP no-params tool-input-schema follow-up then closed on Saturday, 11 April 2026 with targeted MCP/schema proofs and repo-root `pnpm type-check` green. Phases B, C, D, and E also closed on Saturday, 11 April 2026, and repo-root `pnpm check` is green on the final Phase E close-out rerun. For aggregate verification, use `pnpm check` locally or `pnpm check:ci` for non-mutating reruns; do not invoke `pnpm qg` directly.
- Husky is now the live repo-local hook runner: `pre-commit` formats staged files with Prettier, `pre-push` runs `pnpm check:ci`, and the first post-install full non-mutating repo-root sweep completed green on Saturday, 11 April 2026
- A fresh generated-code validation gate issue was reproduced and fixed on Saturday, 11 April 2026: the generated-suite temp harness now allocates isolated per-suite directories under `lib/tests-generated/.tmp`, `test:gen` is green again at `5` files / `26` tests, and repo-root `pnpm check` is green again
- Phase B is now honestly closed: native OpenAPI 3.2 `query` survives parser -> IR -> writer and downstream endpoint/MCP consumers, duplicated raw PathItem visitors no longer skip it, MCP treats `query` as read-only/non-destructive, and hierarchical tags (`summary`, `parent`, `kind`) have explicit parser/writer proof
- Phase C is now honestly closed: `oauth2.flows.deviceAuthorization` and XML `nodeType` have explicit parser/writer proof, valid templated paths survive the shared load boundary -> IR -> writer -> endpoint/MCP consumers unchanged, malformed top-level `paths` templates fail fast before upgrade/canonicalisation, and the `code-reviewer` / `test-reviewer` / `openapi-expert` loop is closed with no open findings
- Phase D is now honestly closed: Example Object `dataValue` / `serializedValue` survive parser -> IR -> writer across component, parameter, response-header, and media-type carriers; `CastrParameter.examples` now preserves full Example Object/ref shapes honestly; singular parameter example derivation now falls back to `examples.default.dataValue` but never `serializedValue` alone; the repaired parameter writer now prefers canonical `examples` output and revalidates cleanly at the shared load boundary; the reviewer loop is closed with no open findings; and repo-root `pnpm check` is green on the close-out sweep
- Phase E is now honestly closed: native OpenAPI 3.2 `itemSchema` and `additionalOperations` survive parser -> IR -> OpenAPI writer -> shared load boundary reparse; custom verbs from `additionalOperations` now flow through endpoint/MCP/TypeScript surfaces; endpoint/MCP/TypeScript fail fast on reachable `itemSchema`; the reviewer loop is closed with no open findings; and repo-root `pnpm check` is green on the final close-out rerun
- the ePerusteet real-spec validation slice closed on Thursday, 16 April 2026 as the reproduction/predecessor slice: `lib/tests-fixtures/openapi-samples/real-world/eperusteet-ext.json` is committed, the shared load boundary accepts and canonicalises it, and the reproduced rejection at IR-build / generated seams exposed a policy mismatch around explicit `additionalProperties`
- user clarification on Thursday, 16 April 2026 established the intended boundary: Castr accepts and emits explicit `additionalProperties`, but never invents them from input that did not declare them
- **the plan-of-record sequence was RE-ORDERED by the owner (2026-06-19):** finish the FULL Practice transplant first, then remediation. New sequence (SUPERSEDED — see the B-11 entry below and the 2026-08-26 QD-2 STOPPED ruling on the transplant): (1) [Oak → castr Practice transplant](./current/paused/oak-practice-transplant.md) Phases 7–9 + arc D2/D4 (parity = part of "the full Practice"; Phase 7 in progress); (2) [remediation backlog](./remediation/) 02–07 (a **named position after the transplant**, not parked — `no-manufactured-permission` holds; 01 done); (3) [explicit-additional-properties-support.md](./current/paused/explicit-additional-properties-support.md). "Not in a rush to merge" → delivery (D3-as-merge-gate + the merge act) is deprioritised. _Supersedes the 2026-06-09 "(1) remediation; (2) transplant" order._ If a user reports a fresh product gate/runtime issue, reproduce it first (it pre-empts the sequence)
- **the proof-programme parent plan IS the plan-of-record (W-0 walked and CLOSED, 2026-08-22):** the owner walked the [W-0 ballot](./proof-programme/ballot-2026-08-owner-walk.md) interactively — all ten decisions carry success verdicts, and **ballot item B-11 RATIFY supersedes the 2026-06-19 sequence above with [`proof-programme/parent-plan.md`](./proof-programme/parent-plan.md)'s queue** (the transplant's pause-as-named-position was SUPERSEDED 2026-08-26 by the owner's QD-2 ruling — "The old effort is stopped, parity remains a goal, we will address it in time" — the plan file carries a STOPPED banner and parity's living frame is the 2026-08-24 bidirectional-equality directive; both former active-lane plans sit in `current/paused/` with disposition banners, status lines authoritative over directory). [ADR-051](../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md) is Accepted (amended: three firings/day). Q-01..Q-04, Q-21, and Q-23 are completed; the Routine is a scheduled task the owner creates and schedules at will (parent plan §Operating protocol step 1) — the pending queue order lives in the parent-plan frontmatter (the single authority — this roadmap keeps no mirror of it) per the parent plan's operating protocol
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
  - ⚠️ **Correction (2026-06-04, ADR-047):** these closures are NOT all "semantic". Verified by executing the built `dist`: `dependentSchemas` and `if/then/else` emit `.refine(… return true)` no-ops, and `contains`/`patternProperties`/`unevaluated*` use `typeof x === '<jsonSchemaType>'` checks that reject valid data (review finding **C6**). Only `dependentRequired` is correct. This also contradicts Phase 1.5 below, which marks `if/then/else` "genuinely impossible (❌)" = fail-fast. Resolution: **ADR-047** + `.agent/plans/remediation/03-zod-2020-12-keyword-semantics.md`.
  - All quality gates green, 41/41 Zod tests + 14/14 TS tests passing
- **Phase 1.5: TS ❓ resolution** ✅ — completed Saturday, 29 March 2026. `dependentRequired` and `dependentSchemas` implemented as discriminated union types. `unevaluatedProperties` (schema-valued) and `if/then/else` confirmed genuinely impossible (❌). Format tensions table resolved: zero ❓ markers.
- **Phase 2: IR expansion for $anchor/$dynamicRef/$dynamicAnchor** ✅ COMPLETE — All three keywords added to IR model, JSON Schema parser, JSON Schema writer, OpenAPI parser, IR validator. Zod/TS fail-fast wired for `$dynamicRef`/`$dynamicAnchor` (genuinely impossible). `$anchor`preserved in round-trip (reference marker, no code-gen impact). Full test coverage, round-trip proofs in`2020-12-keywords.json` fixture. Plan: [anchor-and-dynamic-references.md](current/complete/anchor-and-dynamic-references.md) (✅ complete).

**Completed Workstream: OAS 3.2 Full Feature Support**

Closure record: [oas-3.2-full-feature-support.md](./current/complete/oas-3.2-full-feature-support.md)

- Phase B is complete: `QUERY` HTTP method is landed end to end and hierarchical tags (`parent`, `kind`, `summary`) now have explicit proof
- Phase C is complete: OAuth 2.0 Device Authorization flow, XML `nodeType`, and strict top-level path-templating validation/proof are landed honestly
- Phase D is complete: Example Object `dataValue` / `serializedValue` semantics are landed honestly across the native 3.2 seam
- Phase E is complete: `itemSchema` streaming is preserved through the OpenAPI parser/IR/writer path, `additionalOperations` is stored separately per ADR-046 and exposed end to end downstream, and non-OpenAPI downstreams fail fast on reachable `itemSchema`
- The direct successor primary active plan is [explicit-additional-properties-support.md](./current/paused/explicit-additional-properties-support.md)

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

Packs 4-7 later found that the repo's current support and proof posture is narrower than some of the historical "complete" language below implies, especially for JSON Schema, Zod parity, generated output, and transform proof breadth. Use **Current Workstream Status** above plus the pack notes for current truth.

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
- Subsequent work moved on from the historical 3.3b sequence; see **Current Workstream Status** above for the live closure state and follow-up handoff.

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
````

## .agent/plans/practice-alignment-brief.md

```markdown
# Brief: Full Transplant of Oak's Agentic Estate into castr

**Status:** Brief for a fresh session (promote to `active/` as a planned workstream before executing)
**Created:** 2026-06-04
**Author:** prior session (initial-review + tri-repo scan)

---

## Mission

**Wholesale-transplant the _entire_ Oak agentic estate into castr** — Practice Core, `agent-tools`, **all** skills,
rules, hooks, directives, sub-agents (templates + components), PDRs, patterns, executive-memory, the knowledge flow, the
collaboration machinery, and every platform adapter — **bringing everything over, not just updating the surfaces castr
already has** — leaving out **only** what the next session determines is genuinely not relevant to a headless schema
library (see "Relevance determination"). Then **preserve castr's own content where appropriate** (reconcile, never
clobber), and **localise all
`oak-*` / `@oaknational/` naming to `engraph-*` / `@engraph/`**. Use **PEEN's transplant field report** as the operating
manual so castr does not re-discover the friction.

## The three repos

| Role                         | Path                                | What it is                                                                                                                                      |
| ---------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source** (transplant FROM) | `<oak>`                             | The Practice origin; the full, current generation — bring all of it                                                                             |
| **Guide** (field report)     | `project-explorer-especially-names` | Already wholesale-transplanted oak's full Practice + `agent-tools`; report at `.agent/reports/practice-integration-feedback.md` — read it FIRST |
| **Target** (transplant INTO) | `<repo>` (this repo)                | A lighter ≈March snapshot carrying castr's own deep product doctrine                                                                            |

> ⚠️ This is a **wholesale Practice transplant** (oak PDR-005). PEEN already paid the friction bill once. Read its
> report before touching files.

## Governing model: bring everything, reconcile, don't discard

| Bucket                                              | Action                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The whole Oak agentic estate**                    | **TRANSPLANT IN FULL** — including everything castr has no equivalent of (PDRs, patterns, executive-memory, sub-agent template bodies, the full skills/rules estate, collaboration machinery, hook policy, `agent-tools`). Default = bring it.                                                                                        |
| **Castr's own product content**                     | **PRESERVE / RECONCILE as appropriate** — additive merge; on castr-specific product files, **castr wins**; never clobber (see Must-not-lose).                                                                                                                                                                                         |
| **Oak content whose relevance to castr is unclear** | **The next session decides** (see "Relevance determination"). Genuine non-relevance is a legitimate, expected outcome — some oak content **should not be brought over at all**. Do **not** pre-decide it in this brief; determine it from castr's actual surfaces using questions designed from PEEN's report, then confirm with Jim. |
| **Naming**                                          | **LOCALISE** `oak-*`→`engraph-*`, `@oaknational/`→`@engraph/`; reconcile oak agent/state naming to castr's.                                                                                                                                                                                                                           |

**PDR vs ADR (important):** oak's `decision-records/` are **PDRs = portable _Practice_ governance** → **transplant all of
them** (castr currently has none). Oak's product **ADRs are repo-specific** → **do NOT bring them**; **castr keeps its own
ADRs** (`001–047`). Any transplanted rule that cites an oak ADR number must be **reconciled** to castr's ADR estate, or
re-pointed to the relevant PDR, or marked placeholder (this is exactly PEEN's dangling-ADR-cite class).

## Must-not-lose (castr content to PRESERVE / reconcile — never overwrite)

- `.agent/directives/principles.md`, `IDENTITY.md`, `requirements.md` — castr's authoritative doctrine. **principles.md
  must not be edited without Jim's explicit approval.** (Layer oak's generic engineering directives _additively_; on
  conflict, castr's product doctrine wins.)
- All ADRs `001–047` (incl. **ADR-047**) and `docs/architecture/*` (OAS-3.2 / IR / strict-object / Zod round-trip).
- Schema-domain reviewers `openapi-expert`, `zod-expert`, `json-schema-expert` (keep; localise naming only — these are
  castr's analogue of oak's domain experts).
- Castr-specific rules/strategy: `input-output-pair-compatibility.md`, `testing-strategy.md`, the strict-object /
  additionalProperties doctrine.
- The just-committed **`.agent/report/initial-review/`** (14 docs), the **`.agent/plans/remediation/`** backlog, the
  **`docs/initial-deep-review`** branch, the active **`explicit-additional-properties-support.md`** plan, this brief,
  and the corrected roadmap/handoff state.

## Bring over from Oak (the full estate — including what castr lacks entirely)

1. **Practice Core → oak's 7-file generation, in full:** `practice.md`, `practice-lineage.md`, `practice-bootstrap.md`,
   `index.md`, `README.md`, `CHANGELOG.md`, **`practice-verification.md`**, **`decision-records/` (all PDRs)**,
   **`provenance.yml`**, and oak's **multi-dimensional fitness model** (line target/limit + char + line-length).
   **Retire `.agent/practice-context/`** (oak dropped it 2026-04-29). Reconcile castr's at-ceiling `practice.md`.
2. **`agent-tools` → create `@engraph/agent-tools`** from `@oaknational/agent-tools`, all modules: `hook-policy`,
   `skills-adapter-generate` (+`skills-lock.json`), `practice-fitness`, `practice-substrate`, `repo-check`,
   `validators`, `version-guard`, `branch-touched-files`, `collaboration-state`, `commit-queue`, `commit-advisories`,
   `context-cost`, `core`/`bin`, `claude`/`codex`/`cursor` adapter generators. Wire into castr's gates.
3. **All skills** (oak's ~20, `SKILL-CANONICAL.md` + generated adapters): knowledge-flow (`napkin`, `distillation`,
   `curator-pass`, `consolidate-docs`, `consolidate-until-done`, `metacognition`, `session-handoff`, `tsdoc`),
   workflow (`go`, `plan`, `gates`, `commit`, `complex-merge`, `undo-change`, `start-right-*`, `codex-helper`),
   evaluation (`ground-truth-design`/`-evaluation`), etc. **Migrate castr's `jc-*` commands → skills** (oak phased
   commands out). Lock with `skills-lock.json`.
4. **All rules + `RULES_INDEX.md`** (oak's full set, three-form canonical + thin platform forwarders) — relevance pass
   per below (KEEP / AMEND / don't-bring / dormant — see Relevance determination; nothing pre-filtered out of scope).
5. **Hooks:** `.agent/hooks/policy.json` (declarative guardrail — block `git push --force`/`reset --hard`/`--no-verify`/
   `git add -A`/`clean -fd`/`restore`/`stash drop`…), enforced by `agent-tools` hook-policy, wired per platform incl.
   **native `.cursor/hooks.json`** (PEEN finding) and Claude `PreToolUse`/`SessionStart`/`UserPromptSubmit`.
6. **All directives** oak carries: `agent-collaboration`, `continuity-practice`, `definition-of-delivery`,
   `operationalisation-contract`, `orientation`, `schema-first-execution`, `tdd-as-design`, `user-collaboration` —
   merged with (not duplicating) castr's existing set.
7. **Sub-agents:** oak's `templates/` (canonical bodies) + `components/` architecture — bring in full; reconcile with
   castr's existing reviewer roster (keep castr's schema experts; bring oak's generic reviewer templates).
8. **Memory / state / roles / evaluations / milestones / proposals:** bring oak's structures (`.agent/memory/active/
patterns/`, executive-memory, `.agent/state/collaboration/*`, `roles/`, etc.) — including the patterns estate and
   executive catalogues castr has no equivalent of.
9. **Platform adapters:** align `.claude`/`.codex`/`.cursor`/`.gemini`/`.agents` to canonical-first generation; add
   `.windsurf` (oak has it).
10. **Agent-collaboration tooling — explicitly wanted, first-class, and ACTIVE (Jim's directive 2026-06-04).** Bring the
    **complete** collaboration surface — tooling, workflows, logic, **and documentation** — fully active (never dormant
    or deferred):
    - **`agent-tools` modules:** `collaboration-state` (comms / claims / presence / coordinator), `commit-queue`,
      `commit-advisories`, `context-cost`.
    - **Directive:** `agent-collaboration.md` (+ `continuity-practice.md`, `user-collaboration.md`).
    - **Rules cluster (all of it):** `follow-agent-collaboration-practice`, `follow-collaboration-practice`,
      `agent-state-observable`, `comms-all-channels-watcher`, `respect-active-agent-claims`,
      `register-identity-on-thread-join`, `register-active-areas-at-session-open`, `use-agent-comms-log`,
      `use-built-agent-tools-cli`, `handoff-messages-self-contained`, `liveness-heartbeat-cron`, `ping-before-escalate`,
      `sha-prefix-in-collaboration-content`, `check-singleton-per-window`, `owner-attention-at-action-moments`,
      `respect-active-agent-claims`, `use-monitor-for-event-driven-wake`, `comms-all-channels-watcher`.
    - **State surfaces:** `.agent/state/collaboration/*` (active-claims, sessions/presence, coordinator.current,
      comms log).
    - **Skills/workflows:** `start-right-team`, `session-handoff`, and the session-open write choreography.
    - **PEEN-hardened forms (adopt these, not the pre-fix versions):** structured **coordinator-state** (not prose),
      the TTL'd **presence registry** (presence ≠ claim), the unified **comms attention pass**, and the **plan-mode
      identity carveout**.
      This is a first-class deliverable on equal footing with the Core and `agent-tools` — it does **not** go in the PARK
      set.

## PEEN-guided method (apply its four named transplant steps + inherit its fixes)

PEEN's headline lesson: the Core is portable, **but the estate is not self-contained** — rules/skills/templates travel
while the patterns/templates/memory/ADRs they cite do not → "**dependency cliffs**." A _full_ transplant reduces this
(bring everything), but the discipline still applies:

1. **Reference-closure classification** — scan `.agent/rules/`, `.agent/skills/**`, `.agent/sub-agents/templates/` for
   every internal/PDR/ADR cite; classify unresolved ones **resolve / rewrite / placeholder**. Use the
   `host-shape:check` scanner (extended to walk those surfaces — PEEN's "scanner blind spot" fix).
2. **Content-sync (backfill)** — _auditing absence is not enough_ (PEEN: "closure-audit detects but does not backfill").
   For every `resolve`, actually copy/adapt the referenced pattern/template/memory across before completion.
3. **Derived-index regeneration** — regenerate inherited indexes (e.g. patterns `README`) **from frontmatter**; never
   inherit a hand-maintained index verbatim.
4. **Relevance pass = KEEP / AMEND / DON'T-BRING / dormant** (delegate to specialist sub-agents per category, as PEEN
   did with five parallel specialists). **AMEND** = localise stale `oak`/`@oaknational` labels + reconcile dead ADR
   cites. **DON'T-BRING** = genuinely not relevant to a headless schema library (a legitimate, expected outcome).
   **dormant** = relevant-if-castr-grows but not yet (a scale call, not structural). The KEEP/don't-bring boundary is
   **the next session's determination — see "Relevance determination" — not pre-decided here.**

**Inherit PEEN's already-fixed hardening (start from the fixed state):** coordinator/identity in **structured state, not
rule prose**; **presence registry** (presence ≠ claim) for bootstrap false-negatives; a **comms attention pass** (not
directed-inbox-only); a **plan-mode identity carveout**; **skills-adapter orphan pruning** on `--check`;
**`resolveRepoRoot`** over `../` hop-counting; **`markdownlint-cli2`** per-dir config; **eslint** ignoring agent-plugin
tmp dirs + configs as `.ts`; the **cooperative working-tree inclusion** positive pattern.

## Relevance determination — the next session's call, with questions designed from PEEN

Some Oak content is genuinely **not relevant** to a headless schema-transform library and **must not be brought over**.
This brief deliberately does **not** pre-decide what — fresh eyes against castr's actual surfaces will. The method:

1. **Read PEEN's report first** — especially its **WS2 Rule Disposition Ledger** (per-item KEEP/AMEND reasoning) and its
   dependency-cliff findings. PEEN judged relevance by asking, per item, "does _this_ repo have the surface this
   assumes?" Use that experience to **design castr's own relevance questions**, then apply them per surface.
2. **Seed questions to refine (starting points, not verdicts):**
   - **Substrate or product-domain?** Practice substrate (knowledge flow, doctrine, gates, **agent collaboration**,
     tooling, provenance, continuity) is always relevant. Product-domain content assumes a specific surface — ask on.
   - **Does castr actually have that surface?** castr is a headless TypeScript IR/schema library: no browser UI, no
     React, no auth, no search index, no design system, no curriculum/data domain. Content assuming one of those is a
     **don't-bring** candidate.
   - **Structural or scale?** Will castr never have it (structural → don't bring) or could it grow into it (scale →
     bring dormant)?
   - **Castr equivalent already?** (its schema-domain experts, its product doctrine) → keep castr's, don't duplicate.
   - **Dependency cliff?** Does it cite patterns/ADRs/experts that also wouldn't come? → resolve or don't bring.
3. **Present reasoned verdicts to Jim** before finalising the not-bring set (`present-verdicts-not-menus`). Genuine
   non-relevance is an **expected** outcome, not a failure.

"Bring everything" means **bring the whole _relevant_ estate, deciding relevance deliberately** — not bring every file
regardless of fit, and not pre-filter or guess. (Agent collaboration is substrate → always in.)

## Sequencing & safety

- **Plan first.** Write a decision-complete plan before touching files. Do **not** disrupt the `docs/initial-deep-review`
  branch or the active additionalProperties plan.
- **Branch + phase + gate.** New branch. Suggested order: (1) Core (all 7 files + PDRs + patterns + `provenance.yml` +
  fitness) + retire practice-context → (2) `@engraph/agent-tools` + hook policy → (3) skills + commands→skills →
  (4) rules + `RULES_INDEX` + relevance pass (KEEP/AMEND/don't-bring) → (5) directives → (6) sub-agents/memory/state → (7) adapters
  (+`.windsurf`) → (8) collaboration machinery → (9) `practice-verification` pass. Run `pnpm check` **and** a
  reference-closure scan after each phase.
- **Provenance honesty.** Append a new castr `provenance.yml` entry for this transplant; never fabricate the chain.
  Respect `subagent-practice-core-protection` (sub-agents must not mutate the portable Core).
- **Record the not-brought + dormant sets.** Whatever is deliberately not brought over (or brought-but-dormant) gets an
  explicit, discoverable record with rationale (not silent) — so castr is honest about what was excluded and why.
- **Close the loop.** Add a napkin entry, update `session-continuation.prompt.md` + `roadmap.md`, and create castr's own
  **`.agent/report/practice-integration-feedback.md`** (PEEN's invented feedback channel) — the portable fixes hand
  back to oak.

## Definition of done

1. castr carries the **full Oak generation**: 7-file Core + **all PDRs** + `provenance.yml` + `practice-verification.md`
   - new fitness model (practice-context retired); `@engraph/agent-tools` builds + gated; `.agent/hooks/policy.json`
     enforced cross-platform (incl. native Cursor hooks); all skills (commands migrated, `skills-lock.json` clean); all
     rules + `RULES_INDEX`; all directives; sub-agents/memory/state/patterns; all adapters.
2. **Nothing in Must-not-lose is lost** — gates green; castr's ADRs/doctrine/report/remediation backlog/branch intact;
   castr's product ADRs preserved, oak's product ADRs not imported.
3. All `oak`/`@oaknational` naming localised to `engraph`/`@engraph`; transplanted rules reference-closure-clean (no
   dangling cites); the **relevance ledger** (KEEP/AMEND/don't-bring/dormant) committed, and the not-brought + dormant
   sets explicitly recorded with rationale.
4. `practice-verification.md` checklist/health-check/estate audit passes; castr feedback report written; handoff stack
   updated.

## Read first (orientation)

- PEEN report: `project-explorer-especially-names/.agent/reports/practice-integration-feedback.md`
- Oak source: `…/oak-open-curriculum-ecosystem/.agent/` (Core incl. `decision-records/`, `provenance.yml`,
  `practice-verification.md`; `skills/`, `rules/`, `hooks/`, `directives/`, `sub-agents/`, `memory/`, `state/`),
  `…/agent-tools/`, `…/RULES_INDEX.md`.
- castr current: this repo's `.agent/` + `docs/architectural_decision_records/` + `.agent/report/initial-review/`.
```

## .agent/plans/remediation/README.md

```markdown
# Remediation Plans — Initial-Review Backlog

**Created:** 2026-06-04
**Source:** [`.agent/report/initial-review/`](../../report/initial-review/) (first-hand verified findings) and
[ADR-047](../../../docs/architectural_decision_records/ADR-047-zod-2020-12-keyword-emission-strategy.md).

---

## Purpose

A **prioritised backlog** of atomic, finding-driven remediation plans derived from the initial deep review. These are
parked here (not in `active/`) so the `active/README.md` contract — _one primary active plan_ — is preserved. Promote
**one** of these into `active/` at a time, in the order below, following the normal activation lifecycle.

Each plan is an execution contract per the `plan` skill (`.agent/skills/plan/SKILL-CANONICAL.md`): it references permanent docs/ADRs first and states
its own scope, success criteria, and TDD order. The _why_ lives in the report; these plans hold the _what_ and _how_.

## Governing rules

- **Strictest-of-three** (user directive 2026-06-04): where code, proofs, and docs disagree, normalise to the strictest.
- **Proof-first:** install the failing test before the fix (the repo's TDD mandate); a finding is "done" only when a
  behavioural/round-trip proof turns it green and stays green.

## Sequence (highest leverage first; mirrors report §09)

| #   | Plan                                  | Findings                            | Risk                                       |
| --- | ------------------------------------- | ----------------------------------- | ------------------------------------------ |
| 01  | `01-packaging-and-types-integrity.md` | C1                                  | Low                                        |
| 02  | `02-ir-fidelity-proof-harness.md`     | H7, C2, C3, C4, H1, H2, H3, H4, M10 | Low (tests) → Med (fixes)                  |
| 03  | `03-zod-2020-12-keyword-semantics.md` | C6 (executes ADR-047)               | Med                                        |
| 04  | `04-zod-parser-strict-whitelist.md`   | C5                                  | Med                                        |
| 05  | `05-single-source-type-guards.md`     | M3, C4                              | Low-Med                                    |
| 06  | `06-doctrine-enforcement-truthing.md` | M1, M2, M12, L1-L5                  | Low (⚠️ doctrine edits need user approval) |
| 07  | `07-test-hygiene.md`                  | M4, M5, H7                          | Low                                        |

Genuine _future_ (not remediation) scope — capability deferrals consolidated from the paused/archived investigations —
belongs in `future/` (external `$ref` / `$anchor` / `$dynamicRef` runtime resolution), not here.
```

## .agent/plans/current/archive-pii-scrub.md

```markdown
# Archive PII scrub — mechanise the pre-publish precondition (Q-008)

**Status:** ACTIVE (owner-decided 2026-07-03: "mechanise scrub now"; supersedes Q-008's
open/publish-gated framing). **Tool shape DECIDED (owner, same day): FULL TOOL** — both
`--check` and `--write` land as slice 1, TDD, in the next implementation session (this plan is
the controlling artefact; the 2026-07-03 consolidation session landed the plan and records).

## Context

The `no-machine-local-paths` rule deliberately exempts `archive/` (frozen historical records),
so archived napkins retain real user-home path segments — a username (PII) leak if the repo is
ever made public. Q-008 captured this at the LC3a landing; the owner chose to mechanise the
cure now rather than hold it publish-gated.

**The honest engineering constraint this plan must name:** a working-tree scrub does NOT remove
PII from git HISTORY. Making the repo public exposes every historical blob regardless of the
working tree's cleanliness. The full pre-publish precondition is therefore two-layer:

1. **Working-tree layer (this plan's tool):** archives carry no machine-local PII at HEAD.
2. **History layer (publish-time, owner-invoked):** a history-level scrub (`git filter-repo`
   class) or an explicit owner acceptance of history exposure. This layer is destructive and
   owner-only; the tool below makes layer 1 true and REPORTS that layer 2 remains.

## Tool design (slice 1)

`agent-tools` module `archive-pii-scrub` (unified CLI topic), reusing the machine-local-paths
pattern set that `policy.json` single-sources (the validator and the write-time guard already
share it — one pattern set, three consumers, no drift):

- `--check`: scan `**/archive/**` markdown for machine-local-path hits; report file/line/kind;
  exit 1 on hits (report-only mode for a publish-preflight gate), exit 0 clean.
- `--write`: rewrite hits to the rule's sanctioned placeholder forms (`<user>`, `<oak>`,
  repo-relative), category-aware exactly like the LC3a cure (user-home → `<user>`; Oak-checkout
  → `<oak>`; stale self-links → repo-relative). Idempotent; second run reports clean.
- Fail-loud on unreadable files (LC3a validator precedent); TDD with the blocking contract
  proven (exit 0/1/2), pure helpers + injected reader, no real FS in unit tests.
- **Frozen-record honesty:** `--write` alters archived records. Each rewritten file gains a
  one-line top annotation (`> PII-scrubbed <date>; original in git history`) so the record
  never silently pretends to be verbatim. (The history layer still holds the original — which
  is exactly why layer 2 exists.)

## Acceptance

- Slice 1: tool lands TDD-green; `--check` wired as a non-blocking report initially (blocking
  at publish-preflight, not in the daily gate — archives are exempt from the daily invariant by
  rule design).
- Slice 2 (publish-time, owner-invoked): run `--write`, commit; then the owner decides the
  history layer (filter-repo vs accept-exposure). This plan is DONE when slice 1 lands and the
  two-layer precondition is recorded in the publish path; slice 2 fires only on a real publish
  intent.

## Cross-references

- Q-008 in `.agent/memory/operational/open-questions.md` (decided → this plan owns the work).
- `no-machine-local-paths` rule (pattern set + archive exemption rationale).
- LC3a as-built in `practice-loop-closure-remediation.md` (the validator/cure machinery reused).
```

## .agent/plans/current/zod-truth-surface-and-dependency-currency.md

```markdown
---
title: Zod truth surface & dependency currency — two-part plan
status: current
lane: current
created: 2026-08-31
last_updated: 2026-08-31
owner_directive: >-
  "explore and answer the unknowns, then draft a two part plan, part 1 a
  simple dependency currency pass, part two everything else above and your
  recommendation post uncertainty exploration. There is a fairly large and
  current plan for fixing Castr in scheduled task slices, so please read
  that as well, it must be kept up to date." (owner, 2026-08-31,
  in-conversation; "everything above" = the hand-authored-Zod-surface
  exploration recorded in the napkin, 2026-08-31 entry)
todos:
  - id: DC-1
    content: 'Part 1: whole-estate dependency-currency pass (zod 4.5.4 cycle headline) — parent-plan row Q-23'
    status: completed
  - id: TS-1
    content: 'Part 2a: Scenario 8 vendor-conformance oracle + corpus extension — parent-plan row Q-24'
    status: pending
    depends_on: [DC-1]
  - id: TS-1b
    content: 'Part 2a-ii: z.toJSONSchema differential cross-check (split from TS-1 at review) — parent-plan row Q-27'
    status: pending
    depends_on: [TS-1]
  - id: TS-2
    content: 'Part 2b: Zod dialect manifest + unsupported-surface diagnostics — parent-plan row Q-25'
    status: pending
    depends_on: [DC-1]
  - id: TS-4
    content: 'Part 2a-iii: base64/base64url writer-emission fidelity (contentEncoding → z.base64()/z.base64url()) — parent-plan row Q-28'
    status: pending
    depends_on: [DC-1]
  - id: TS-3
    content: 'Part 2c: ADR ratifying static parsing + vendor-oracle complement + dialect versioning — parent-plan row Q-26'
    status: pending
    depends_on: [TS-1, TS-2]
  - id: TS-5
    content: 'Part 2d: zod runtime performance guidance — real-generated-module benchmark + consumer docs (compile/validate), emission-option decision to owner — parent-plan row Q-29'
    status: pending
    depends_on: [TS-2]
---

# Zod truth surface & dependency currency

The execution queue for this plan lives in the
[proof-programme parent plan](../proof-programme/parent-plan.md) as rows
Q-23..Q-29 (QD-6: queue briefs ARE the per-slice plans). This document is the
evidence base and design detail those briefs cite; where a brief and this
document disagree, the brief governs and this document is corrected.

## Goal

Part 1: the dependency estate is at latest under the skill's holds, with the
Zod 4.5 behaviour deltas taken deliberately and on record rather than by
range drift. Part 2: Castr's knowledge of Zod stops being three unverified
hand-copies — it becomes one intra-repo authority (a dialect manifest)
whose agreement with the installed Zod is recomputed by an executable
oracle on every version bump, the static-parsing architecture choice
that makes the model necessary is ratified in an ADR instead of inherited,
and the measured 4.5 runtime wins (compile/validate) reach consumers as
evidence-backed guidance (TS-5).

## Evidence base (all measured firsthand, 2026-08-31)

Probe: side-by-side zod 4.3.6 / 4.4.3 / 4.5.4, 20-construct representative
set — script and raw outputs committed at
`.agent/research/zod/zod-version-probe.mjs` /
`zod-version-probe-2026-08-31.out.jsonl` (re-runnable by any future firing;
the TS-3 revisit trigger depends on it):

| Measurement                                                             | 4.3.6  | 4.4.3              | 4.5.4              |
| ----------------------------------------------------------------------- | ------ | ------------------ | ------------------ |
| `z.iso.datetime()` accepts `2026-08-31T12:00Z` (no secs)                | yes    | yes                | **no**             |
| `z.string().length(1)` accepts `"\u{1F4A9}"` (1 cp, 2 UTF-16)           | no     | no                 | **yes**            |
| `z.string().min(2)` accepts `"\u{1F4A9}"` (rejecting direction)         | yes    | yes                | **no**             |
| `z.creditCard/properties/deepPartial/validate/compile`, `.exactPartial` | absent | absent             | present            |
| Shallow `_zod.def` shape (type/format/keys/checks), 20 constructs       | —      | identical to 4.3.6 | identical to 4.4.3 |
| `z.toJSONSchema(z.string().min(2)).minLength`                           | 2      | 2                  | 2                  |

The length change is two-sided: code-point counting newly ACCEPTS input
4.4 rejected (`length(1)`) and newly REJECTS input 4.4 accepted (`min(2)`)
— both directions belong in any behaviour-delta record. The def-stability
row measures SHALLOW shape only (type, format, sorted def keys, one level
of check descriptors); the 4.5 behaviour changes moved none of it, which
means shallow def shape is measurably blind to exactly this class of
semantic drift — a limit TS-3's ADR must carry alongside the stability
claim.

Corpus audit (`lib/tests-fixtures/zod-parser/happy-path/payloads.ts`): all
five datetime payloads carry seconds; zero astral/code-point length-boundary
payloads; `IsoDatetimeSchema` (string-formats fixture) has **no parity
payload entry at all**. Consequence, and the structural point beneath it:
the ADR-035 parity harness runs original and transformed schema under the
SAME installed Zod, so a vendor semantic change moves both sides together
and parity stays green — the 4.5 datetime change passes the whole suite
while changing what every generated validator accepts. Parity proves the
transform; nothing proves the model.

Survey (`pnpm -r outdated` / `pnpm audit`, 2026-08-31): tsx 4.23.12→4.23.13
(dev patch), knip 6.32.2→6.33.0 (dev minor), **zod 4.4.3→4.5.4**,
@scalar/json-magic 0.13.2→0.13.3 + @scalar/openapi-parser 0.28.16→0.29.0
(coupled data-pipeline pair; json-magic is exact-pinned), @types/node
24.13.3→26.4.0 (**hold**: engines.node 24.x, ADR-049), typescript
6.0.3→7.0.2 (**hold**: ts-morph 28 vendors TS 6.0.2 in `@ts-morph/common` —
a workspace TS 7 reintroduces dual-compiler skew on the emission path;
reopen when a ts-morph release vendors 7.x). Audit: zero findings already.

Table-layer read: the parser's Zod-name knowledge is already table-shaped
(`ZOD_PRIMITIVES` + `ZOD_COMPOSITIONS`, `ZOD_PRIMITIVE_TYPES`, and TWO
format maps — `types/zod-parser.zod4-formats.ts` for Zod-4 primitive names
and `modifiers/zod-parser.constraints.ts` for chained-method names) and
the writer's tables (`STRING_FORMAT_TO_ZOD`, `formatToValidation`, numeric
switches) are their near-inverse — hand-maintained in separate modules,
with a third prose copy in ADR-031 §2. NOT a true inverse (measured): the
chained-method map yields `cuid`, `cuid2`, `ulid`, `emoji`, and `ip`
formats the writer cannot emit (`writeStringSchema` throws on all five),
so the table layer carries a real parse-only/emit-only asymmetry any
manifest must express rather than erase. The chain/AST machinery is
structural and generic over the name constants; it does not need
manifest-driving. The parser already derives a synthetic zod declaration
at runtime from `ZOD_PRIMITIVES` + `ZOD_COMPOSITIONS`
(`registry/zod-decl-builder.ts`, consumed at `ast/zod-ast.ts` — the
in-tree precedent for table-driven runtime derivation, and a third
consumer any manifest must feed).

Opportunity probes (owner-commissioned, run 2026-08-31 post-Q-23 on the
shipped zod 4.5.4; scripts + raw outputs committed beside the version
probe: `zod-compile-validate-bench.mjs` / `zod-exact-optional-probe.mjs`
with dated, run-numbered `.out` files — every range below re-derivable
from the committed runs):

- **`z.compile()` / `z.validate()` — measured complementary wins.** On a
  castr-shaped strict object (8 fields, formats, nested object) and a
  discriminated union, across the two committed runs: compiled
  `safeParse` is **4.7–8.1× faster on VALID data** (~0.9× on invalid);
  `z.validate()` is **2.1–7.0× faster on INVALID data** (union highest;
  ~1.1× on valid). Compile is a one-time ~3–4.5 ms per
  schema — negligible in a long-lived MCP server, real at one-shot CLI
  start for a module with hundreds of schemas (`zod/compile` auto-compile
  is lazy-on-first-use, which softens the CLI case). Microbenchmark
  caveats apply (constant payloads, single Node 22 container); ratios,
  not absolutes, are the finding — and compiled mode uses `new Function`,
  so it does not apply to jitless/CSP no-eval runtimes (zod core config
  `jitless`). Routed to row Q-29.
- **`exactOptional` and `.exactPartial()` (both probed directly) — the
  pre-probe fidelity claim is FALSIFIED for castr's wire path.** The
  behavioural divergence from `.optional()`/`.partial()` exists only for
  in-memory `{a: undefined}` (the exact forms reject, the classic forms
  accept — measured for the wrapper AND the method); JSON-borne data can
  never carry an own undefined-valued key, and `z.toJSONSchema` projects
  each pair BYTE-IDENTICALLY. For a compiler whose truth is JSON Schema and whose
  payloads are parsed JSON, switching emission to `exactOptional` changes
  nothing observable on the wire or in projection while costing new
  dialect surface (parser + writer + manifest lockstep). **Disposition:
  measured and declined for emission** — revisit only if an in-memory
  consumer with `exactOptionalPropertyTypes` raises a TS-type-honesty
  requirement (the one axis the probe cannot measure at runtime).

Doctrine finding (napkin 2026-08-31, feeds TS-3): ADR-032 §Context says
"ADR-026 requires ts-morph; no regex or runtime execution", but ADR-026's
ratified decision is AST-over-string-heuristics — it argues nowhere against
runtime introspection, and ADR-032's Alternatives never weighed it, while
`.agent/research/zod/notes.md` sketches exactly that integration surface.
The static choice has real warrants (no execution of user code,
source-located diagnostics, writer/parser symmetry over source text); they
are currently folklore, not doctrine.

## Part 1 — dependency-currency pass (row Q-23)

Executes the `dependency-currency` skill in full (survey → holds → tiers →
one proof-gated cycle per type-affecting bump → audit-to-zero → Actions
pins → close). Prior art:
[`current/complete/dependency-currency.md`](./complete/dependency-currency.md)
closed at audit-zero on 2026-08-26 (DC0–DC8, per-cycle SHAs), so this pass
starts five days off a clean baseline — its substance is the zod cycle
plus a small dev sweep, and the 2026-08-26 landings are verified, not
re-authored (the `pnpm-workspace.yaml` `typescript: '^6.0.3'` override cap
already exists with the vendored-compiler rationale). The skill's §7
close-the-lane record lands in THIS document's Part 1 plus the Q-23 row;
the completed DC plan stays closed. Premises to re-verify at claim time:
the survey above, and the measured environment skew — this authoring
container runs Node 22 against `engines.node: 24.x` (cloud-image
artifact); a firing inheriting that skew names its disposition (proceed
with the engine warning, or defer to a Node-24 environment) before the
install-heavy steps. Per-slice proof shape: a currency pass has no failing
test to author first — its proof is the skill's capture-before-mutate
baseline plus suites staying green; QD-14 (open) is the governing ruling
on non-code/gate-shaped acceptance vs the red-first non-negotiable, and
this row operates under its recommended reading. Expected shape:

- **Type-neutral dev sweep**: tsx, knip — one commit, gates firsthand.
- **Data-pipeline cycle**: @scalar/json-magic + @scalar/openapi-parser
  together (coupled trio rule; check `@scalar/openapi-types` alignment;
  respect the exact pin's intent — read its history before widening).
  Proof: pipeline/fixture/drift suites green.
- **Zod cycle (the headline, its own commit)**: bump `zod` to `^4.5.4` in
  `lib` and `agent-tools`. Baseline is the committed fixture estate plus a
  pre-bump full-suite run captured to scratch BEFORE `package.json` is
  touched (PDR-097 capture-before-mutate). The bump re-resolves
  `@modelcontextprotocol/sdk`'s zod peer (lockfile today:
  `1.30.0(zod@4.4.3)` with `zod-to-json-schema` beneath it) — a
  peer-range refusal is an install-time failure the green prediction does
  not cover, so verify the resolution before running suites. Measured
  prediction to verify, not assume: the suite stays green because the
  corpus never exercises the changed acceptance regions (probe + corpus
  audit above). The cycle's PR body records both behaviour deltas
  TWO-SIDED (datetime seconds now required — RFC 3339/OpenAPI-faithful
  strictening; length now counts code points — newly accepting astral
  strings under `length`/`max` AND newly rejecting them under `min`,
  Zod moving TOWARD JSON Schema's minLength/maxLength semantics) as the
  release-notes fact that rides the QD-10 residue (any future publish
  prices in accumulated behaviour changes). A red result is
  STOP-and-understand, never regenerate-to-green.
- **Holds recorded, not bumped**: typescript 7 (vendored-compiler
  alignment, reopen condition named), @types/node 26 (ADR-049 Node-major
  coupling; in-range 24.x refresh only). Cap any override per the skill.
- **Actions pins**: refresh SHA pins against verified stable tags.

Acceptance (`integration` + `non-code`, QD-14 reading): `pnpm audit` zero;
`pnpm -r outdated` empty modulo recorded holds and cooldown; one commit per
type-affecting cycle with its proof stated in the body; GitHub Actions SHA
pins verified against dereferenced stable tags; the workspace `overrides`
TS cap re-verified against the vendored major; full `pnpm check:ci` green;
the zod cycle's two-sided behaviour-delta record present in its PR body.

**Part 1 close record (executed 2026-08-31, Dolphin binds Trench,
owner-directed interactive session under the session-scoped HUSKY=0
grant with GitHub CI as the aggregate detection surface).** Cycle 1
(`8ba53b2`): tsx 4.23.13 + knip 6.33.0 in-range sweep; type-check, lint,
knip, agent-tools suite (147/1627) green firsthand. Cycle 2 (`514f956`):
the coupled Scalar set — parser 0.29.0 + json-magic 0.13.3, types
staying 0.9.5 (exactly what parser 0.29.0 pins) — whose first proof run
went RED: parser 0.29.0 extracted its bundled OpenAPI JSON Schemas to a
new `@scalar/openapi-validator` dependency, breaking the doctor
preflight-validator's deep schema path (10 failures, one root); fixed at
source by declaring openapi-validator 0.1.0 as a direct exact member of
the coupled set (trio → quartet) and repointing the resolver;
re-proof green (132/1715). Cycle 3 (`ebd3813`): zod ^4.5.4 in lib +
agent-tools; pre-bump baselines captured from the committed tree, both
suites baseline-identical post-bump; MCP SDK peer re-resolved cleanly to
`1.30.0(zod@4.5.4)`; the two-sided behaviour-delta record lives in the
commit body and the PR (QD-10 residue). Actions pins: all five verified
current at their claimed tags' commit SHAs (checkout v7.0.1,
pnpm/action-setup v6.0.9, setup-node v7.0.0, cache v6.1.0,
upload-code-coverage v1.4.2) — no changes. Close survey: `pnpm audit`
zero; `pnpm -r outdated` shows only the two documented holds
(typescript 7 vs ts-morph-vendored TS 6; @types/node 26 vs ADR-049
Node-24 coupling). Cooldown honoured (zod 4.5.4 published
2026-08-29T17:55Z, ~41 h before install). Environment disposition:
container Node 22 vs `engines.node: 24.x` — proceeded with the engine
warning named; GitHub CI runs the aggregate on Node 24.

## Part 2 — Zod truth-surface programme

### TS-1 / row Q-24 — Scenario 8: vendor-conformance oracle

Extends the ADR-035 scenario matrix with the cross-truth check the parity
harness cannot perform: for each covered IR construct and payload, compare
**(a)** the installed Zod's verdict on the emitted schema (executed via the
existing transpile-and-run harness), **(b)** AJV's verdict on the same IR
node's JSON-Schema projection (ajv + ajv-formats are already runtime
deps), and **(c)** the corpus's declared expectation. Disagreement fails
with the drift DIRECTION named (toward or away from IR/JSON-Schema
semantics). Owner ruling 2026-08-31 (napkin part-6 entry, verbatim there)
simplifies the expectation frame: castr has zero external consumers, the
Zod INPUT contract is **>=4.5 <5** (`^4.5`; a new major is its own
ratification — PR #75 review bound, keeping the Zod-4 dialect and the
shipped `^4.5.4` manifests honest), and OUTPUT tracks the **latest**
release within that ratified major —
so corpus expectations are authored to the current vendor's semantics
outright (seconds-required datetimes, code-point lengths ARE the
contract), with no compatibility bookkeeping against older 4.x
behaviour. Includes:

- **Corpus extension lands first, as the oracle's input**: seconds-less
  datetimes, astral length boundaries, and a parity-payload entry for
  every string-formats fixture schema (the `IsoDatetimeSchema` gap — a
  fixture with no payload entry is silently skipped by
  `assertValidationParity` today) — EXCEPT `Base64Schema` and
  `Base64UrlSchema`, which are excluded here and routed to TS-4/Q-28: the
  parser records them as `contentEncoding` while the writer dispatches on
  `format` only and emits bare `z.string()` (measured), so their invalid
  payloads would fail EXISTING parity before any oracle exists; their
  entries land red-first inside Q-28's writer-fidelity fix. This step
  alone cannot go red — the parity harness moves both sides together,
  which is the finding — so the RED-FIRST proof for this slice is the
  oracle failing on the seeded vendor-drift and projection mutants below,
  with the corpus extension in place before it.
- **ADR-035 amendment** adding Scenario 8 with its blind-spot rationale.

Acceptance (`integration`): oracle red on a seeded vendor-drift mutant
(e.g. a corpus expectation contradicting the installed Zod) and on a seeded
projection mutant; green on the real estate; wired into `pnpm check`; ADR
amendment landed. Runs on the pinned lockfile version — the oracle is what
makes every FUTURE zod bump a measured event instead of a silent shift.

### TS-1b / row Q-27 — `z.toJSONSchema` differential cross-check

Split from TS-1 at review (separate oracle, separate allowlist, separate
failure semantics; nothing in the three-way differential depends on it):
castr's IR→JSON-Schema output diffed against Zod's own `z.toJSONSchema()`
for the shared subset — two independent implementations of the same
mapping as a cheap second oracle. Documented divergences (uuidVersion,
int64/bigint carriers) form a reasoned allowlist; an unlisted divergence
fails.

Acceptance (`integration`): differential red on a seeded writer mutant and
on an unlisted divergence, green on the real estate with the allowlist
populated and each entry reasoned; wired into `pnpm check`; gates green.

### TS-4 / row Q-28 — base64 writer-emission fidelity

Measured gap (surfaced by PR #73 review, verified firsthand): the parser's
`ENCODING_MAP` records `z.base64()`/`z.base64url()` as
`contentEncoding: 'base64' | 'base64url'` on a string schema, but the Zod
writer's `writeStringSchema` dispatches on `schema.format` only and emits
bare `z.string()` when no format exists — the encoding constraint is
silently dropped on emission (no `base64`/`contentEncoding` handling
exists anywhere in `writers/zod/generators/`). This is silent content
loss on the Zod→IR→Zod path, invisible today only because the fixtures
carry no parity payloads. Fix: the writer emits `z.base64()` /
`z.base64url()` from `contentEncoding` (the inverse of the parser's
`ENCODING_MAP`, honouring the redundant-validation filter), red-first via
the `Base64Schema`/`Base64UrlSchema` parity-payload entries TS-1 excludes
and routes here — invalid-base64 payloads prove the loss on the pre-fix
tree, then the emission fix turns them green.

Acceptance (`integration`): the two fixtures' parity payloads (valid and
invalid) red on the pre-fix tree and green post-fix; round-trip
(Scenario 2/4/6) preserves `contentEncoding` through emission; `pnpm
check` green.

### TS-2 / row Q-25 — dialect manifest + unsupported-surface diagnostics

One typed data module (the "Castr Zod-4 dialect") holding, per construct:
Zod name, IR type, format/encoding, canonical emission, a
parse-only/emit-only capability field (the measured cuid/cuid2/ulid/
emoji/ip asymmetry must be EXPRESSED, not erased — closing it is a
behaviour change and out of scope), redundant-validation marker, and
conformance-vector references. **Mechanism: runtime derivation** — the
consuming modules import the manifest and build their tables at module
initialisation, the same shape as the in-tree precedent
(`zod-decl-builder.ts` deriving the synthetic zod declaration). No
generated source files are produced, so `never-edit-generated-files` and
regeneration gates are not in play; this is a pure refactor of where the
tables come from. Consumers, all named: parser
`ZOD_PRIMITIVES`/`ZOD_COMPOSITIONS` (including the synthetic-declaration
builder), `ZOD_PRIMITIVE_TYPES`, both parser format maps
(`types/zod-parser.zod4-formats.ts` and
`modifiers/zod-parser.constraints.ts`); writer `STRING_FORMAT_TO_ZOD`,
`formatToValidation`, numeric dispatch. Parser/writer lockstep for the
name/format layer becomes true by construction; ADR-031 §2's prose table
gains a derived-from pointer instead of a third hand copy. Scope
discipline: the manifest drives the TABLE layer only — chain/AST
machinery, objects, composition semantics, and recursion stay code
(measured feasibility read above; forcing them into data would create the
fourth copy the falsifier names). Adds the known-unsupported enumeration:
4.5 surface (`z.creditCard`, `z.properties`, `z.deepPartial`,
`.exactPartial`, `z.validate`, `z.compile`) and other
recognised-but-out-of-dialect constructs get actionable "not in the Castr
Zod dialect" diagnostics with the reason (e.g. creditCard: no faithful
JSON-Schema/OpenAPI carrier) instead of the generic
unsupported-expression error.

Acceptance (`unit` + `integration`): tables byte-identical to today's
behaviour on the existing suite (pure refactor proof); a manifest entry
added in a test drives both parser and writer without further edits;
diagnostics for the enumerated 4.5 surface name the construct and reason;
gates green.

### TS-3 / row Q-26 — ADR: static parsing ratified, with its complement

A new ADR that (1) ratifies static ts-morph parsing from first principles
— naming the real warrants and weighing the runtime-introspection
alternative ADR-032 never recorded (the probe's def-stability evidence and
its limits go in the ADR body); (2) mandates the vendor-conformance oracle
(TS-1) as the standing complement — the model is permitted BECAUSE its
agreement with the vendor is recomputed; (3) defines the dialect as the
versioned declaration of supported Zod surface (TS-2) and the diagnostic
contract for out-of-dialect input; (4) encodes the owner's 2026-08-31
version contract — Zod input **>=4.5 <5** (`^4.5`), output tracks the
**latest** release within the ratified major, and widening to a new
major (Zod 5) is a separate ratification (zero external consumers;
napkin part-6 verbatim; the <5 bound is the PR #75 review refinement,
confirmed by the owner's follow-up ruling: "latest here means latest 4,
with a tripwire to examine Zod 5 if and when it is released"; the
tripwire's sensor is the owner — ruling 2026-08-31, history in the
napkin's dated record). The ADR encodes the EXAMINATION PROCEDURE, run
at owner word when Zod 5 ships: probe re-run with 5.x via
`zod-version-probe.mjs`, dialect impact analysis, owner decision
recorded in the proof-programme's `queued-decisions.md`, never a
bump — amending
ADR-031/ADR-032/requirements.md §9's generic "Zod 4" wording, and
adjudicates the dependency shape that follows (direct `zod` dependency
vs `peerDependencies: ">=4.5 <5"`). Supersession notes on ADR-026/ADR-032
where their wording conflates the two decisions.

Acceptance (`non-code`): ADR accepted per the estate's ADR lifecycle,
indexes reconciled, `docs-adr-expert` review recorded; gates green.

### TS-5 / row Q-29 — zod runtime performance guidance

Consumes the opportunity-probe evidence (above): compile and validate
are measured, complementary wins for consumers of generated code —
compile for valid-path throughput (long-lived MCP servers), validate
for reject-only gates on hostile input; neither applies to jitless/CSP
no-eval runtimes (compile generates code via `new Function` — the
guidance MUST carry that constraint). Scope, docs-first: (1) extend
`zod-compile-validate-bench.mjs` (or a sibling committed beside it) to
load the schemas of
`lib/tests-fixtures/zod-parser/happy-path/generated-petstore-expanded.zod4.ts`
(the one real generated module in the fixture estate) and measure
BOTH candidates on its payload fixtures — `safeParse` vs `z.compile()`
on VALID payloads (compile's claimed branch) and `safeParse` vs
`z.validate()` on INVALID payloads (validate's claimed branch) — plus
whole-module cold-start under eager `z.compile()`-per-schema vs lazy
`zod/compile` auto-compilation; run twice; commit run-numbered dated
outputs beside the existing probe outputs (regeneration pipeline: node
script > out, then prettier --write for .json). (2) Result criterion,
applied PER GUIDANCE LINE on that line's own claimed branch only —
never aggregated across branches, so the two lines land or fall
independently: real-module ratio ≥2× → that line's guidance lands
(compile line: `import 'zod/compile'` for long-lived non-CSP servers;
validate line: `z.validate()` for reject-only gates; each carrying the
jitless caveat verbatim); ratio ≥1.5× and <2× → INCONCLUSIVE: no
guidance for that line, the measurement recorded in this section and
carried on the decision card for owner adjudication; ratio <1.5× →
that line's premise is FALSIFIED — record the outcome in this section,
land no guidance for it. The three bands are exhaustive and exclusive
over each line's ratio. (3) Either way,
route any EMISSION change (a generated `zod/compile` preamble option,
`z.validate` in generated MCP gates) to the owner as a decision card
carrying the real-module measurements — never adopted inside this row.
Non-goals: no emission changes; no new dialect surface. Acceptance
(`integration` + `non-code`, QD-14 reading): benchmark + two
run-numbered dated outputs committed; the criterion applied with its
outcome recorded here; docs landed (or the falsification recorded);
the decision card queued; gates green.

## Recommendation (post uncertainty exploration)

The probes strengthened the pre-probe synthesis on every axis: the shallow
def contract is empirically stable across 4.3→4.5 (the runtime oracle is
cheap and durable — with the measured limit that shallow def shape did not
move for the 4.5 behaviour changes, so it detects representation drift,
never semantic drift; the oracle covers the latter), the corpus blind spot
is real and total for the 4.5-changed regions (the oracle is necessary,
not hypothetical), and the table layer is already half-manifest on both
sides (TS-2 is a consolidation, not an invention). Recommended order:
**Q-23 → Q-28 → Q-24 → Q-25 → Q-26**, with Q-27 (the split `toJSONSchema`
differential) after Q-24 — currency first so the oracle pins the vendor
castr actually ships against; the small Q-28 fidelity fix next so the
corpus can cover the whole string-formats estate; oracle before manifest
so manifest refactoring lands under cross-truth proof; ADR
last-but-referencing-both so doctrine records what exists; Q-29 (runtime-performance guidance)
follows Q-25 by `depends_on`, in the tail with Q-26/Q-27. Sequencing relative to the existing
queue: after the safety instruments (Q-18/Q-20/Q-22/Q-19), ahead of
Q-05..Q-09 — owner-adjustable; the rows carry no gates beyond `depends_on`
within this plan.

Runtime introspection (`_zod.def` walking) is deliberately NOT adopted as
the parser: its costs (executing user code, expression-level diagnostics
lost) stand, and the oracle takes its value (test-time execution) without
them. Revisit trigger, recorded in TS-3's ADR: a Zod 4.x release whose def
shapes drift (the probe method is the detector) or a user need for
ingesting schemas castr cannot statically analyse.

## Risks

- **Zod 4.5 regression outside the corpus**: the prediction "suite green"
  is measured but the corpus is (by finding) incomplete — the pre-bump
  captured baseline plus STOP-on-red is the mitigation; TS-1 closes the
  class.
- **Manifest refactor drifts behaviour**: mitigated by pure-refactor proof
  (existing suite byte-identical) landing BEFORE any manifest-driven
  change, and by TS-1's oracle if sequenced first (recommended).
- **Oracle flakiness via AJV/Zod format disagreement**: known-divergence
  allowlist with reasons is part of TS-1's acceptance, not a follow-up.
- **Queue interference**: rows ride the proof-programme protocol (WIP=1,
  ADR-051); Q-23 touches `package.json`/lockfile which any open slice PR
  also carries — the standard contested-ref deferral applies.

## Non-goals

- No Zod-3 support, no zod-mini, no runtime-introspection parser.
- No adoption of new 4.5 APIs into the dialect (creditCard etc. get
  diagnostics, not mappings) — each adoption is its own future decision
  with a carrier-fidelity analysis.
- No TypeScript 7 or Node-major work (holds recorded in Part 1).
- No package release/version decision (constitutively the owner's; QD-10).

## Foundation alignment & lifecycle

Aligned to `principles.md` (strict everywhere — the oracle extends
strictness to the vendor boundary), `testing-strategy.md` (red-first
cycles named per slice), `requirements.md` (its generic "Zod 4" input
doctrine remains in force until TS-3 ratifies the `^4.5` floor — TS-2's
diagnostics narrow error text only, never acceptance, and own no part of
the contract transition). The
`plan-body-first-principles-check` fires at each executing firing: re-derive
each slice's shape from live code and this plan's evidence, not its
summaries; vendor call shapes (zod probe results, AJV options, ts-morph)
re-verified at slice execution per
`verify-vendor-call-shapes-at-plan-author-time`. Reviewers: this plan took
`assumptions-expert` at authoring (2026-08-31, 17 findings — one blocking,
ten material, six minor — all applied in the authoring landing, including
the Q-27 split and the Q-25 mechanism decision); per-slice reviewer
moments follow the parent plan's protocol step 4. Lifecycle: rows complete →
parent-plan frontmatter + this doc's todos updated in the same landings;
plan completion runs `engraph-consolidate-docs` and stages this doc to
`current/complete/` per the active-plans contract.
```

## .agent/plans/future/strategy-vision-estate-overhaul.md

```markdown
---
todos:
  - id: W0-frame
    content: 'Owner walk: ratify the two-product frame, the verified-claims principle, and naming'
    status: completed
  - id: W1-vision
    content: 'Rebuild the vision layer around impacts (product A vision; product B vision surface)'
    status: pending
  - id: W2-strategy
    content: 'Rebuild roadmap + continuity current-truth layer; archive the superseded-block stratigraphy'
    status: pending
  - id: W3-claims-truthing
    content: 'Fix R4 doctrine contradictions and build + wire the doctrine-claims validator (TDD)'
    status: pending
  - id: W4-plans-tree
    content: 'Reorganise the plans tree into impact-aligned collections; land plan-templates (TC2)'
    status: pending
  - id: W5-measurement
    content: 'Define the preservation-coverage metric surface and the product-B fitness frame'
    status: pending
---

# Plan: Strategy, Vision & Planning Estate Overhaul

> **📋 W0 WALKED (2026-08-23, interactive):** the three genuine forks are DECIDED — the
> second product is named **"the Practice"** (Q-012), **preservation-coverage % adopted**
> as product A's headline metric with no percentage published before the proof estate
> computes it (Q-014), and the `Object.*`/`Reflect.*` doctrine is **lint-enforced**, not
> amended (Q-015); Q-013's topology determination is acknowledged. Verdicts and consuming
> homes: `.agent/memory/operational/open-questions.md`. **This plan does NOT promote to
> `current/`**: B-11 (2026-08-22) made the proof-programme queue the plan-of-record, which
> absorbs this brief's work — W1/W3/W5 substance executes via queue row Q-14 and the Q-12
> split; W2/W4 enter via the Q-12 split or on owner ask. This brief stays in `future/` as
> the reference for those slices; do not re-walk W0.

**Status:** STRATEGIC BRIEF (`future/` lane) — authored 2026-07-04 on owner directive ("start
planning a total overhaul of the current planning, strategy and vision estate so it is organised
around the appropriate impacts and principles"). Readiness reviews run and folded same day
(assumptions-expert + docs-adr-expert; lane placement, W3 scope widening, owner-walk
minimisation, and the acceptance-determinism fixes below all originate there).
**Promotion trigger → `current/`:** the W0 owner walk completes (the three genuine forks below
decided). Promotion mines the workstreams into cycle-level executable todos with `depends_on`
fields and the quality-gates / lifecycle-triggers component references; execution decisions are
finalised only at that promotion, per the plan skill's strategic-plan contract. W3's validator
cycle and W2's mechanical archaeology are parallel-safe from the moment W0 ratifies the frame.
**Source findings:** [`wide-deep-review-2026-07-04.md`](../../report/wide-deep-review-2026-07-04.md)
(esp. §1 two products, §2.4 R1–R6, §6 emergent patterns, §7 small-changes-big-impacts) building
on [`initial-review/`](../../report/initial-review/).

## Problem

The strategy estate describes one product and the repo contains two; its claims drift from
reality faster than review cadence catches them (a principles.md claim went stale within one
day of the change that falsified it); its current-truth surfaces have grown by superseded-block
accretion (repo-continuity §Next Safe Steps is a palimpsest of nested CURRENT TRUTH banners);
and its organising frame is still the discharged transplant era ("one deep enhancement", Axis
A/B/C) rather than the impacts the work now serves. Who it harms: the owner (misallocated
attention), agents (inherited false claims — the repo's own named failure family), and
consumers (support claims that are asserted, not computed).

## End goal (user impact)

A strategy estate where **every layer is organised by the impact it serves and every claim is
verifiable**:

- **I1 — schema-tooling consumers:** provably faithful transformation; support claims computed
  (preservation coverage per input→output pair), never asserted.
- **I2 — engineering organisations:** the agentic-engineering kernel (agent-tools + Practice)
  named, bounded, and steerable as a product in its own right.
- **I3 — the agents themselves:** doctrine an agent can trust — contradictions structurally
  detected, current-truth surfaces single-voiced ("excellent agent experience" is already a
  standing concern in principles.md §Decision Lenses; this makes it real at the estate level).

## Mechanism

Impact-first organisation makes stale framing visible (a surface that serves no named impact is
archaeology); verified-claims enforcement (the same loop-closure pattern already proven on pnpm
scripts and references) makes drift a gate failure instead of a review finding. Together they
convert the estate from narrative-that-decays to structure-that-self-corrects.

## Governing principles (the "appropriate principles")

1. **Verified claims** — a claim is only as good as its machine-checkable proof (the unifying
   thesis of both products; CANDIDATE, ratified at W0 — pending-graduations carries the PDR
   candidate; do not treat as settled doctrine until the walk).
2. **Impact before activity** — every strategy surface names the impact (I1/I2/I3) it serves.
3. **Single source, referenced everywhere** — one authoritative home per fact (per the
   no-moving-targets rule and the document-hierarchy discipline in the plan skill; Oak's
   ADR-117 is the origin record, **pending bring via W4/TC2** — castr's ADRs top out at
   ADR-050, so cite it as pending, never as a resolvable local authority);
   current-truth is one block, history is archived, never layered.
4. **No moving targets in permanent docs**; computed tables over hand-maintained ✅ marks.
5. **First Question** — at every step: could it be simpler without compromising quality?

## Workstreams

### W0 — Ratify the frame (owner walk; blocking for W1/W2 shape)

Per the Four-Lens Dissolution Test (PDR-057; assumptions-expert fold), the walk is minimised to
its irreducible core — the **three genuine forks** only the owner can decide:

| Genuine fork                                                                                    | Recommendation                                                 |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **The second product's NAME** (Q-012, naming part)                                              | Name it now (the review deliberately leaves the name to you)   |
| **Preservation coverage % as product A's headline PUBLIC metric** (Q-014)                       | Adopt (it is also the honest cure for asserted support claims) |
| **M1/R5 resolution: enforce the `Object.*`/`Reflect.*` ban via lint, or amend it** (Q-015 fork) | Enforce via lint per the strictest-of-three rule               |

The remaining items are **determinations executed under approval**, not forks (the lenses
settle them; outcomes do not diverge): Q-013 vision topology → umbrella + one vision surface
per product (follows from single-source + impact-before-activity); Q-012 non-naming parts →
keep in-repo, ADR-048-style value-gated extraction criteria (decision, not extraction); Q-015
staleness edits (the falsified TSDoc claim etc.) → forced by strictest-of-three, executed under
the standing principles.md protected-file approval that the walk grants in one batch.

Registered as Q-012..Q-015 in `open-questions.md` (with the fork/determination split mirrored
there). Exit: the three forks decided and recorded; the determinations acknowledged in the same
walk.

### W1 — Vision layer rebuild

Rewrite `VISION.md` (umbrella + product A) around I1; author the product-B vision surface
(location per W0 naming) around I2; state the verified-claims principle once (umbrella) and
reference it from both. Fold the multi-verb fidelity-compiler model (doctor / upgrade /
transform / validate / check) into product A's vision as the surface architecture direction,
referencing `plans/future/castr-surface-architecture-and-verb-model.md` rather than duplicating
it. Acceptance: both products have a named impact, consumer, and headline metric; and the W3
validator (whose scope EXPLICITLY includes cross-surface contradiction pairs — see W3) passes
green over the rebuilt vision layer. If W1 lands before the W3 validator, the contradiction
check is a named non-code reviewer pass (docs-adr-expert) recorded in the plan's as-built, and
the validator re-proves it when it lands.

### W2 — Strategy + continuity layer rebuild

- Replace `plans/roadmap.md`'s transplant-era frame with an impact-organised roadmap: product A
  (remediation 02–07 → verb model → conformance/corpus → release), product B (kernel roadmap:
  loop-closure completion, coordination hardening, Oak back-flow), Practice/meta.
- Collapse `repo-continuity.md` §Next Safe Steps to ONE current-truth block; move the
  superseded dated blocks to `memory/operational/archive/` (conserved verbatim, per
  never-trim-always-curate).
- Reconcile `delivery-ledger.md` and the session-continuation prompt to the same single frame.
  Acceptance (mechanical): the continuity spine is at most three linked surfaces
  (repo-continuity, session-continuation prompt, roadmap), each carrying EXACTLY ONE
  current-truth block — verified by grep for the CURRENT-TRUTH banner marker returning one hit
  per surface and zero "supersedes" qualifiers on the read path; all moved content
  byte-conserved in archive (diff of moved blocks against their archive copies is empty). A
  fresh-agent comprehension trial is a useful non-code review, not an acceptance gate.

### W3 — Claims truthing + the doctrine-claims validator (TDD; parallel-safe after W0)

- Fix the R4 contradictions across ALL THREE claim-bearing surfaces: requirements.md §Current
  Focus ("JSON Schema: Deferred") vs VISION progress table vs **`plans/roadmap.md` §Supported
  Formats (its "JSON Schema Input ✅ Output ✅ … full parser, writer" row is the same
  R1-falsified claim on a third surface — docs-adr fold)**; principles.md §Tooling Integration
  (TSDoc claim); requirements §6 ✅ table entries whose end-to-end claims are falsified by the
  review (mark honestly per the strictest-of-three rule — raise code to doc via remediation
  plans, never silently relax).
- **Build `validate-doctrine-claims`** (agent-tools validator, TDD), with TWO capabilities:
  (a) **proof-anchor resolution** — every ✅ / "MUST … with tests proving" row in
  requirements.md, every VISION progress-table cell, and every roadmap §Supported Formats cell
  must cite a resolvable proof anchor (test file / validator / report section); unresolvable
  claim = gate failure; (b) **cross-surface contradiction pairs** — the named claim tables are
  checked pairwise for contradicting support statuses (the R4 instances are the red-first
  fixture set; this is the capability W1's acceptance consumes). Extends the proven
  loop-closure-references pattern. Wire into
  `repo-validators:check` blocking once the estate is truthed (red-first against today's known
  contradictions — the falsifying fixture set already exists in the review).
  Acceptance: validator red on today's estate for exactly the known contradictions, green after
  the truthing edits; wired blocking; `pnpm check` green.

### W4 — Plans-tree reorganisation

Reorganise `.agent/plans/` into impact-aligned collections (product-a/, product-b-kernel/,
practice/, plus the lifecycle lanes within each — the `<collection>` shape the plan skill
already names); archive transplant-era organisation (tracker, folded plans) with provenance
banners; land the plan-templates estate (TC2 graft from Oak/resonance) so the plan skill's
live-inventory reference stops dangling. Acceptance: every live plan reachable from the roadmap
by impact; `plans/templates/README.md` exists and the plan-skill self-check commands run
against it; no dangling plan links (markdown-links validator scope).

### W5 — Measurement layer

Define the preservation-coverage metric surface (per input→output pair; fed by the
remediation-02 harness and, later, the representability matrix — reference those plans, do not
duplicate their scope) and the product-B fitness frame (what "kernel health" means: gate
latency, coordination-collision rate, drift-detection coverage). Acceptance: metric definitions
have a computing owner (script/harness) named, even where the first computation is deferred to
the referenced plan.

## Prerequisites

- **Blocking:** W0 owner walk (for W1/W2/W4 shape). W3's contradiction list is already known —
  its validator cycle may start immediately (the fixes to principles.md still gate on W0's
  approval row).
- **Beneficial:** remediation-02 landing first (gives W5 its first computed metric). Minimum
  shippable without it: metric defined, computation deferred with a named owner.

## Non-goals

- Executing product remediation (02–07 own it) or the verb-model implementation (its future
  plan owns it).
- Extracting agent-tools to a separate repo (W0 decides criteria only).
- Rewriting the Practice Core / PDR layer (genotype is Oak-shared; this plan touches castr's
  phenotype surfaces).
- Trimming or rewriting history (archival moves are conservation, not curation-by-deletion).

## Risks

- **Frame churn**: rewriting vision while remediation runs risks divergence — mitigated by W3's
  validator landing early (drift becomes a gate failure during the overhaul itself).
- **Owner-gating stall**: W0 needs a walk; W3-validator and W2 archaeology are deliberately
  parallel-safe so the plan cannot stall whole.
- **Estate-wide link breakage** from W4 moves — mitigated: markdown-links validator runs in the
  same cycles as the moves.

## Foundation alignment & first-principles check

principles.md §Decision Lenses (long-term excellence → strict-everywhere → simpler → change-the-
system → user value) is the resolution order for every W-decision; testing-strategy.md governs
the W3 validator's TDD cycle; requirements.md remains the source of truth its own §Acceptance
names — this plan edits it only under the strictest-of-three rule. Plan-body first-principles
clauses fire at: the W3 validator's fixture design (shape clause — fixtures must be the real
contradiction instances, not synthetic lookalikes), the W2 archive moves (landing-path clause —
stage renames with the moves), and the W1 vision rewrite (vendor-literal clause — quote
requirements/VISION text exactly when citing contradictions).

## Proof contract

Completion claims: W0 `non-code` (open-questions Q-012..Q-015 decided rows); W1/W2/W4
`non-code` + deterministic validator runs (doctrine-claims, markdown-links, portability,
repo-validators all green); W3 `unit` + `integration` (validator TDD suite red→green +
blocking-wire proof — the gate fails on a seeded contradiction); W5 `non-code` (definitions) +
`value-proxy` (first computed coverage number when remediation-02 feeds it). The plan is
complete only when all workstream acceptance rows above are proven; a landed slice is not
completion.

## Readiness reviewers

Before execution starts: `assumptions-expert` (proportionality — is a "total overhaul" the
simplest sufficient move?) and `docs-adr-expert` (estate-move completeness + ADR-117
compliance). Their findings fold into this plan before W1 begins.

## Learning loop & lifecycle

Each workstream close routes capture through the napkin; plan completion runs
`consolidate-docs`; the verified-claims principle and the audit-harness lessons graduate per
their pending-graduations entries when their triggers fire. Lifecycle touch points (claims,
comms, commit ceremony, session close) apply per the standing rules; no exceptions needed.
```
