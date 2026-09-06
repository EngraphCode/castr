# Entry-path history conserved on 6 September 2026

These are verbatim pre-correction files from main `e025d233`. They are historical
source records, not current instructions. Relative paths inside each fenced
record are interpreted from its named original location. Current routing lives
in the correction delivery plan and proof-programme parent.

## .agent/plans/roadmap.md

````text
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

## .agent/memory/operational/repo-continuity.md

```markdown
# Repo Continuity

Canonical repo-level continuity contract — the operational answer to _"where
are we right now, what's live, what's next."_ Refreshed by `session-handoff`.
It is **subordinate to active plans for scope**: this file indexes threads,
states the continuity invariants, and points at the authoritative scope homes;
it does not restate plan scope. See
[`README.md`](README.md) for the operational-memory authority order and
[PDR-011](../../practice-core/decision-records/PDR-011-continuity-surfaces-and-surprise-pipeline.md)
for the portable doctrine.

## Current State

> **🔭 SCOPE EXPANDED (owner, 2026-06-20) → the [Oak Parity-or-Better Program](../../plans/transplant/oak-parity-program.md).**
> The deep enhancement now explicitly includes **upgrading every castr agentic system that is simpler than Oak's to
> parity-or-better** ("castr is not meant to stay simple"; ArcAngel named + "not the only thing missing"). The transplant
> manifest was proven incomplete; a firsthand 5-subagent gap audit (all claims re-verified firsthand) produced the
> authoritative verified gap map (4 Tier-A + 6 Tier-B + 8 Tier-C) in `oak-parity-program.md` — now the active deep-enhancement
> executable plan. **transplant Phase 9 is reframed as the closure gate that runs AFTER parity.** Standing directive:
> user-memory `castr-parity-or-better-with-oak` (deliberate-localisation → preserve; unbuilt-gap → upgrade). The branch is
> **pushed to origin** (owner, through `f8b4910`). Landed 2026-06-20: Q-003 statusline (`ebf08b5`), PDR-currency sync
> complete (`5c40adb`/`3787928`), metacognition directive B2 (`fcda10a`).

castr is executing **one deep enhancement** (owner): bring over the entire
Practice / agentic-engineering framework / agent-tools / skill+rule+subagent+hook
definitions **and** fix castr's known issues — the same goal, not competing
priorities. **The transplant branch merged to `main` in PR #3 (`5529436`,
2026-07-03); work now proceeds on FEATURE BRANCHES off `main`, one PR per slice,
merges condition-based (green and clean merges: all CI passing on the current head, every review thread properly resolved — fixed or rejected with evidence; owner ruling 2026-08-22, reaffirmed 2026-08-26 — no per-PR owner invocation)** (see §Repo-Wide Invariants). Nothing is parked; the owner
names the next slice.

This block is a pointer, not a second narrative. The authoritative homes:

- **Session-start narrative + current truth:** [`session-continuation.prompt.md`](../../prompts/session-continuation.prompt.md) §Current state.
- **Branch / PR / delivery state (DRY):** [`delivery-ledger.md`](../../plans/delivery-ledger.md).
- **Transplant scope + per-phase status:** [`oak-practice-transplant.md`](../../plans/current/paused/oak-practice-transplant.md) (contract) and the [transplant tracker](../../plans/transplant/README.md).

## Active Threads

castr's multi-agent collaboration framework is **built and live** as of Phase 8
(2026-06-20) — see the supersession note below. The earlier single-stream operation
was a **constraint of the then-unbuilt framework, not a fit** (owner, 2026-06-18):
multi-agent concurrency is the **goal** of this branch (primary plan's user-impact
line: "active multi-agent collaboration so multiple agents can work on castr
coherently"), so the `.agent/state/collaboration/` substrate, the blocking-green
`collaboration-state`/`subagents` validators, the SessionStart identity hook
(auto-derives the PDR-027 identity into `$CLAUDE_ENV_FILE`), and the
`claims open → heartbeat → close` lifecycle (task 3b: **10 concurrent
separate-process sessions demonstrated collision-safe**, no lost write, encoded as
`claims-concurrency.integration.test.ts`) were enabling infrastructure on the path
to it — now delivered and exercised end-to-end by the first director-led concurrent
stream (2026-06-20). Remaining coordination gap: comms/presence are not yet standing
practice across every session (CI now runs `check:ci` — arc D3 landed).

**The single-stream simplification is now superseded (2026-06-20).** Its trigger —
"building the Phase-8 framework that supports concurrency" (PDR-027 §Amendment Log
2026-04-21 Session 5) — has fired: task 3b proved a second stream collision-safe, so
per-thread records went live. The row below is the **index**; the thread's lane
state + additive PDR-027 identity table live in the activated record (see the
ACTIVE note under the table). A second session joining the thread takes a lane and
adds its identity row there.

| Thread                                                | Branch                                      | Controlling plan                                                                                                                                                    | Current slice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Latest identity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Next safe step                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Practice transplant + deep enhancement**            | `feat/transplant-engraph-practice`          | [oak-practice-transplant.md](../../plans/current/paused/oak-practice-transplant.md) + [transplant tracker](../../plans/transplant/README.md)                        | **STOPPED (owner ruling QD-2, 2026-08-26) — this cell is history; nothing in it is a next step; parity's living frame is the 2026-08-24 bidirectional-equality directive.** Phase 6 ✅ + Phase 7 ✅ COMPLETE + tagged. **Phase 7 (`transplant/phase-7`, 2026-06-20):** native adapter generator built (`agent-tools/src/agent-adapter-generate/`, TDD); `.cursor/agents`+`.claude/agents` (18 each) + `.cursor/rules/*.mdc` (87) generated; 174 `.claude`/`.agents` rule wrappers via `validate-portability --fix`; `portability`+`subagents` gates flipped blocking-green; bespoke `scripts/validate-portability.mjs` retired. **Phase 8 ✅ COMPLETE + TAGGED** (`transplant/phase-8` @ `8d62197`, 2026-06-20): substrate skeleton + `collaboration-state` gate flip (`059dcf5`) + SessionStart identity hook (`ace99de`) + task 3b claims lifecycle/collision-safety (`0086090`) + task 4b agent-tools-suite-gates (`fd0ffec`) + task 6 generic-surface triage (clean) + task 5 per-thread records ACTIVE done. The tag was cut by the **first director-led concurrent stream** (Director fdb75b + 2 implementers 4aeee2/328f4f exercised the now-active records end-to-end — claims/heartbeats/comms/Director-serialised review), which ALSO landed arc **D3 (`c7f819e`) + D2 (`41b24f8`) + D4 archive/provenance (`0a75231`)** on pushed branches (all on origin). Owner steer 2026-06-19: full Practice transplant first, remediation after (§Next Safe Steps). **Oak Parity-or-Better Program: Tranche 1 ✅ (C1/C2/C6/C4/C5/C7/C8) + Tranche 2 ✅ (A2+A3 hook-policy concept/reappraisal unit — `511326f`/`abe580f`/`31caf78`, `check:ci` green).** Owner inserted the **dependency-currency lane** next (~~IN PROGRESS~~ era record, 2026-06-21: DC0/DC0b/DC6/DC7/DC8 + **DC1 ts-morph `c8c0a9a` + DC2 @scalar trio `43419d0`** done + Q-006/ADR-049 `00750da`; **DC3 prettier next**, then DC4 ink, DC5 commander, then lane-close PDR), THEN Tranche 3 (A4 statusline → A1 ArcAngel).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | claude-code / claude-fable-5 / Cirrus Spiralling Airstream (executor — pre-castr doctrine sync RS-1..RS-4, PR #7 merged, product work ungated) `2026-07-03`; claude-code / opus-4-8 / Open Lofting Feather (executor — loop-closure LC3a machine-local-paths validator + cure + closeout) `2026-06-28`; claude-code / opus-4-8 / Hidden Veiling Mirror (executor — loop-closure LC0 meta-validator + LC1 F-95 gate + LC2 semantic-merge skill+tripwire) `2026-06-27`; claude-code / opus-4-8 / Eclipsed Lurking Moth (consolidator — dedicated curation: napkin rotation + both registers drained empty, PDR-096/097 + PDR-057 amendment) `2026-06-26`; claude-code / opus-4-8 / Stratospheric Kiting Breeze (executor — reason-skill bring R1/R2 + session-completion close) `2026-06-26`; claude-code / opus-4-8 / Coppery Warming Magma (executor — Oak read-model flip to live main + transplant-completeness TC1/TC3a + reason-skill plan) `2026-06-26`; claude-code / opus-4-8 / Soaring Lifting Current (executor — dependency-currency DC1+DC2 emission tier + Q-006/ADR-049) `2026-06-21`; Woodland Bending Glade (executor — dependency-currency dev-tooling + low-risk tiers) `2026-06-21`; Volcanic Charring Hearth (consolidator) `2026-06-21`; Igneous Flaring Hearth (executor — parity Tranche 2) `2026-06-21`; Stormy Sailing Archipelago + Briny Cresting Sextant + Stratospheric Wheeling Horizon + Secret Watching Candle / `2026-06-20` | **SUPERSEDED (owner ruling QD-2, 2026-08-26): "The old effort is stopped, parity remains a goal, we will address it in time" — this row is historical record, not a resumable next step; parity's living frame is the 2026-08-24 bidirectional-equality directive.** See [thread record](threads/practice-transplant.next-session.md) |
| **Proof-programme loop review (EXECUTED 2026-08-24)** | `claude/funny-wright-9wfdnx` off `main`     | [plans/active/proof-programme-loop-review.md](../../plans/active/proof-programme-loop-review.md) (legs R1–R6 all completed; promoted current/ → active/ 2026-08-24) | EXECUTED in one session 2026-08-24 (legs R1–R6 + two-reviewer pass + wrap): report at [analysis-and-reports/proof-programme-loop-review-2026-08-24.md](../../analysis-and-reports/proof-programme-loop-review-2026-08-24.md) — verdict: the loop converges on the evidence, with two measured caveats (it cannot see its own absence; its review bound has no counting instrument) and one surfaced livelock risk; opportunities OP-1..OP-8 routed (two ballot items + one owner action + queue/practice slices). Owner next: read §R6, decide OP-3 / OP-4 / OP-1(b). Sibling: the Slack Watcher estate review runs in OCE in parallel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | claude-code / claude-fable-5 / Flamebright Burning Caldera (reviewer — R1–R6 executed, report landed, wrap run) `2026-08-24`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | See [thread record](threads/proof-programme-review.next-session.md) — closeout entry inside                                                                                                                                                                                                                                           |
| **Proof programme (autonomous loop)**                 | per-slice branches off `main`               | [proof-programme/parent-plan.md](../../plans/proof-programme/parent-plan.md) (queue + operating contract; routine-prompt.md is the firing brief)                    | **CURRENT (2026-08-31): the arming ceremony is RETIRED (owner rulings in-session — the thread record's 2026-08-31 addendum carries the supersession). The Routine is a scheduled task the owner creates with the repo attached, stored prompt a thin pointer to `routine-prompt.md`, cron `3 */8 * * *` (parent plan §Operating protocol step 1); the owner schedules, pauses, and deletes it at will; when none is scheduled no background work advances. Brakes: STOP file, owner pause, ADR-051 clause 6 three-idle self-disable; every firing's PR faces CI, the branch ruleset, review bots, and clause 3's condition-based merge. Queue head Q-18 (safety instruments first, then Q-05.. and the zod rows Q-24..Q-29; Q-23 ✅ COMPLETE 2026-08-31 — dependency-currency pass, PRs #73–#77). Everything after this marker is history.** 2026-08-26 evening → 2026-08-27 UTC routine-configuration session: aligned the stored trigger prompt, ratified a channel-calibration trust reframing, promoted a cloud-autonomy-trust frame node and pre-registered an attended-firing honesty probe (all three arming-apparatus files — arming runbook, honesty probe, trust node — removed 2026-08-31 with the ceremony); five pre-firing owner decisions ruled by cards 2026-08-27; PR #67 MERGED at `05060a95`, compaction close rode PR #68. Q-00 ✅ + Q-01 ✅ (the Q-01-era arming since retired); Q-02 ✅ COMPLETE (evidence record in the parent plan; PR #35 carries the landing — base merged, all 30 review threads disposed per ADR-051 clause 4 with round-17 residuals queued as Q-17, merged at CI green 2026-08-23); Q-03 ✅ COMPLETE (F-01 security AND→OR flattening fixed as an IR-model change, 2026-08-24 firing on `claude/dazzling-cannon-hix55y` — evidence record + routed findings in the parent plan); Q-04 ✅ COMPLETE (F-03 nested boolean schemas fixed as root-and-recursion unification across all three json-schema-lane layers, 2026-08-25 firing on `claude/dazzling-cannon-1do9ve` — PR #55 merged at `2066a142` under ADR-051 clause 3, 14/14 checks green, three Copilot threads dispositioned incl. QD-12 queued; evidence record + routed findings in the parent plan); QD-5 reporting design MERGED (PR #38) + QD-6 playbook/ballot + QD-8 mobile-alert amendment MERGED (PR #39, `68a2e2c`) 2026-08-23; QD-7 DIRECTED (Slack connector + The Watcher advisory/relay tier, ADR-051 clause 7 carve-out, 2026-08-23 — capability probe queued to Q-15); queue state lives in the parent-plan frontmatter; **2026-08-25 owner-redirected firing: ACCOUNT-PORTABILITY estate landed** (`arming-runbook.md` + `account-portability-register.md` + `account-access.md` + the full environment definition in `cloud-environment.md`; commit `01787aa0` on `claude/dazzling-cannon-78571f`) — the repo alone now carries Routine + session-machinery restart on an unrelated account; owner ruling same session: single-agent cloud sessions skip commit-queue/comms ceremony; **2026-08-26 owner-attended ARMING WALK (Breeze weaves Contrail): PR #60 merged, dry-run proven read-only, notification path repaired live (first-traversal incident), eight QD rulings landed verbatim, queue reordered Q-18/20/21/22 first, cloud sessions ground start-right-thorough + plan/metacognition/proportionality (owner ruling), strategic node plans/future/cloud-autonomy-trust.md — walk HOLDS before the attended first live firing; see the thread record's walk addendum**; **2026-08-25 commissioned fresh-session ARMING REVIEW COMPLETE (SUPERSEDED on walk state by the 2026-08-26 ARMING WALK clause later in this cell — the reorder and QD decisions below are DONE, only the attended firing + enable remain): verdict sound-to-arm — walk script in [`routine-arming-review-2026-08-25.md`](../../analysis-and-reports/routine-arming-review-2026-08-25.md) §6, refinements landed (canonical DRY-RUN text, disable method, programme-PR definition, Q-16 re-adjudication, QD-11 id fix), two owner decisions pending (queue reorder; attended first firing); the Routine stays frozen poke-only until the owner walks §6** | claude-code / claude-fable-5 / Fruited Swaying Leaf (scheduled firing — PR #35 drive to merge, Q-17 carry-forward) `2026-08-23`; claude-code / claude-fable-5 / Luminous Waning Orbit (scheduled firing — Q-03 slice) `2026-08-24`; claude-code / claude-fable-5 / Stratospheric Hovering Thermal (scheduled firing — Q-04 slice) `2026-08-25`; claude-code / claude-fable-5 / Sardine turns Coral (owner-redirected firing — account-portability landing) `2026-08-25`; claude-code / claude-fable-5 / Cindery Kindling Lava (executor — QD-5/QD-6 landings) `2026-08-23`; claude-code / claude-fable-5 / Nettle wakes Topsoil (commissioned arming reviewer) `2026-08-25`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | See [thread record](threads/proof-programme.next-session.md)                                                                                                                                                                                                                                                                          |
| **Consolidation Routine + Slack Watcher estate**      | `claude/slack-watcher-notes-c395cb` (notes) | Routine stored prompt (mirror: [dedicated-consolidation-session.md](../../prompts/agentic-engineering/dedicated-consolidation-session.md) §Routine)                 | **LIVE (2026-08-27): standing Routine "Castr Dedicated consolidation — every three days" ENABLED (fresh session/firing, repo+Slack attached, push notifications; first firing 2026-08-28 ~06:08 UTC); prompt hardened through five verified bot rounds (PR #69 merged `df734b4d`). Watcher mantle VACANT (owner stand-down; vacancy ts `1787843381.527589`, sweep boundary `1787834305.944669`). Standing permissions for canvas + trigger tools in `.claude/settings.json`.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | claude-code / claude-fable-5 / Moon guards Solstice (watcher + routine author) `2026-08-27`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | See [thread record](threads/consolidation-routine-and-watcher.next-session.md) — Routine self-manages; no step required                                                                                                                                                                                                               |
| **Initial castr review + strategy-estate overhaul**   | `feat/initial-castr-review`                 | [strategy-vision-estate-overhaul.md](../../plans/future/strategy-vision-estate-overhaul.md)                                                                         | Review ✅ COMPLETE (`b313479`, [report](../../report/wide-deep-review-2026-07-04.md)); overhaul plan authored; **W0 owner walk COMPLETE (2026-08-23 interactive walk — Q-012..Q-015 verdicts in the plan preamble; register drained 2026-08-27)**; W1..W5 execution pending (verified-claims PDR rides W1 — owner ruling 2026-08-27)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | claude-code / claude-fable-5 / Fragrant Twining Glade (reviewer + recorder) `2026-07-04`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | See [thread record](threads/initial-castr-review.next-session.md)                                                                                                                                                                                                                                                                     |

**Per-thread records are now ACTIVE (2026-06-20, Phase 8 task 5).** The enabling
trigger fired: task 3b proved a second concurrent stream is collision-safe, lifting
the single-stream _constraint_ (it was never a fit). The thread's lane state +
identity history now live in
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
with a `## Lanes` block (one thread, multiple independently-takeable arcs) per
`threads/README.md`. The row above stays the **index** (status at a glance); the
thread record is the source of truth for lanes and the additive PDR-027 identity
table. A second session joining adds its identity row there (additive, never
overwrite).

## Paused Threads

None. The product feature slice
([explicit-additional-properties-support.md](../../plans/current/paused/explicit-additional-properties-support.md))
is **sequenced, not parked** — a required component of the one deep enhancement
with a named position, not a paused continuity thread (owner, 2026-06-09; see
[`no-manufactured-permission`](../../rules/no-manufactured-permission.md)).

## Deep Consolidation Status

**Status (2026-08-27, Limpet guards Moorings / 01T962): not due — dedicated pass complete,
buffers at rest.** Live state: napkin fresh (rotated; archive + permanent homes carry the
record — PR #70 and its commits are the pass record per
`permanent-doc-is-the-consolidation-record`); open-questions holds only Q-016 (owner-gated
architecture fork); pending-graduations holds four trigger-gated items (verified-claims
rides the W1 vision rewrite — owner ruling 2026-08-27; loop-closure; autonomous-programme;
IR-versioning) plus the owner-gated PDR-056 cloud-channel extension offer. Next dedicated
pass: not due until a fresh trigger.

**Standing cadence (2026-08-27, Moon guards Solstice / c395cb): future dedicated passes are
owned by the owner-commissioned standing consolidation Routine (every-three-days cron, fresh
session per firing, first firing 2026-08-28 ~06:08 UTC) — fresh `due` triggers accumulate
into its next firing rather than needing hand scheduling; see the
[consolidation-routine-and-watcher thread record](threads/consolidation-routine-and-watcher.next-session.md).

**Session-completion consolidation completed this handoff — 2026-07-06 (Fragrant Twining Glade /
5367e2, n=2 closeout owner).** Scope: the review-session capture batch routed to permanent homes
(report → `.agent/report/`; overhaul brief → `plans/future/`; Q-012..Q-015 with
fork/determination splits; verified-claims PDR candidate → pending-graduations; two distilled
entries; napkin capture incl. two tagged candidates from the peer's context scan — the
closeout-narrative-stales sub-shape and the watcher arm-time drain gap); Mistbound's pre-flight
brief conserved to the tracked plan estate (`plans/remediation/02-preflight-scouting-2026-07-06.md`);
entry-point drift sweep clean; buffers healthy (napkin below rotation threshold; registers
curated, nothing trimmed). **Next dedicated pass: not due** until a fresh trigger; the
owner-walk venue for the open register items IS the overhaul plan's W0 walk (Q-012..Q-015).

**Prior: dedicated knowledge-curation pass — 2026-07-03 (Fiery Flaring Bellows / bafbac).** Owner-invoked
`consolidate-until-done` in an n=2 window (Windswept Winging Cliff on CI watch; boundaries
coordinated live). Knowledge homed: **PDR-124** (multi-agent audit-harness pattern, `pdr_kind:
pattern`, **Proposed** — owner walk in the closeout) authored from its two worked instances (the
2026-06-28 gap rescan + the 2026-07-03 delta review), numbered above Oak main's highest to honour
the Q-009 mapping-table decision; the **gate-collision coordination discipline** graduated into
`check-singleton-per-window` §Peer-In-Flight Collisions (owner ruling + three worked instances
across two windows, the third firing live inside this pass); the commit skill gained the two
measured staging gotchas (already-staged deletion aborts `git add`; enqueue from `git diff HEAD`
after a formatter) + the repo `type-enum` override note (no `ci` type); `testing-strategy.md`
gained the coverage-is-a-signal corollary (higher-level suites deliberately not coverage-fed);
`distilled.md` gained the tsx-enclave and scanning-settings-can-disable-a-workflow lessons + the
zsh-arrays refinement; the oak-backflow ledger gained three measured rows (statusline WS4.1 seam,
absent-registry solo-floor fix, coverage wiring). Buffers at rest (post-walk): `open-questions`
EMPTY — Q-009/Q-011 drained (homes verified); Q-008 DECIDED mechanise-now → the
`archive-pii-scrub` plan (full `--check`/`--write` tool = next implementation slice; two-layer
publish precondition incl. the git-history layer); **Q-010 RULED (owner): Result and fail-fast
COMPOSE — `Result<T,E>` is the correct pattern AND fail-fast is required everywhere; the
fail-fast-therefore-no-Result framing is RETIRED, FULL reach** (use-result-pattern becomes a
bring; a D4-seam Result-migration slice is named — both in the gap-rescan backlog §Owner-ruling
additions). `pending-graduations` holds only the trigger-gated loop-closure item (LC3b/3d/4/5
outstanding; owner-walked, confirmed genuinely event-gated). Fitness at rest: nothing worse
than soft. Napkin NOT rotated (below threshold).
Experience audit clean — the emergent cross-read (a confident frame invalidated by a default that
should load earlier) is already captured as `passive-guidance-loses-to-artefact-gravity`. Queue
residue: four self-documenting abandoned intents left in place (no sanctioned CLI cleanup; work
demonstrably landed). **Named follow-up (pre-merge work, NOT curation): merge-event continuity
reconciliation** — the single-branch-invariant text and branch-scoped continuity blocks need a
supersession pass when PR #3 merges (flagged by Cliff 2026-07-03, held as a named position).
**Owner-walk residue:** PDR-124 status flip; a proposed PDR-097 amendment (audit-to-zero via
annotated workspace overrides carrying explicit removal conditions). **Next deep consolidation:
due — the napkin is at ~950 lines (rotation-cadence trigger; its growth was also flagged by
the PR #55 review bot), recorded by the 2026-08-25 Q-04 firing per the QD-6 firing-scoped
handoff profile (a firing records `due`, never escalates into consolidate-docs).** Prior
status: not due until a fresh trigger (napkin rotation cadence, a fresh capture batch, or the
loop-closure lane completing → the PDR-096 amendment + the register's last item). A bounded
`session-completion` consolidation ran at the 2026-07-03-evening PR-#7 close (plan archived to
`complete/`, capture routed; the commits are the record) — it does not discharge or advance the
dedicated-curation trigger above.

**Prior: deep handoff + consolidation — 2026-06-28 (Open Lofting Feather).** Owner-invoked deep-deep handoff
(`session-handoff`/`consolidate-docs`) + a recursive "what would be lost?" scan, after a generative session: LC3a
machine-local-paths validator; the bring-everything disposition (PDR-005 §Default amendment + user-memory + thread
standing-decision); the husky commit-msg guardrail (LC4-1); and a two-pass Oak→castr gap rescan (the authoritative
bring backlog, `oak-castr-gap-rescan-2026-06-28.md`). Captured this pass (durable, in-repo): workflow-design
meta-lessons (napkin + a `distilled.md` entry — completeness-critic + 2nd-pass audit harness, critic-presence-rechecks-
unreliable, firsthand-ground-truth-arms-verification); Oak-backflow ledger extended (loop-closure-references,
agent-adapter-generate, semantic-merge module, schema reviewers, bring-by-default §Default disposition, the audit
harness); open decisions Q-009 (PDR 096/097 numbering-collision scheme) + Q-010 (principles.md Result-vs-fail-fast
tension); pending-graduations multi-agent-audit-harness pattern candidate. Buffers healthy: napkin ~290 (<500, no
rotation); `distilled.md` ~54 (<200); `pending-graduations.md` 2 items (PDR-096-amendment + audit-harness, both
trigger-NOT-fired); `open-questions.md` 3 open (Q-008/009/010, all owner-facing); incoming box empty; entry points
thin pointers, no drift; no track cards / open conversations / escalations; all session claims closed. No Practice-Core
amendment beyond the owner-directed PDR-005 §Default. **Follow-on (2026-06-28, same session): plan-system coherence
review + consolidation** — de-staled the 3 orientation surfaces (roadmap / transplant-tracker / session-continuation
prompt) to point at the single Axis-A backlog; folded LC/TC/parity plans into `oak-castr-gap-rescan-2026-06-28.md`
(one ordered spine + banners); collapsed Next Safe Steps to one SINGLE-FRONTIER block (3 axes); recorded Q-011 (axis
A/B/C sequencing). The commits + permanent homes are the record. **Next deep
consolidation: not due** until a new trigger (napkin rotation cadence, a fresh capture batch, or a milestone close —
e.g. the loop-closure lane completing → PDR-096 amendment, or a 2nd audit-harness instance → the pattern-PDR).

<!-- Historical Phase-6/7/8 closeout detail collapsed 2026-06-21; it lives in git history and in the
artefacts it homed (memory layout, substrate contract, patterns import, sub-agent roster, the phase tags). -->

## Next Safe Steps

> **🔬 CURRENT TRUTH (2026-07-04, Fragrant Twining Glade / 5367e2 — wide+deep review + overhaul
> mandate; THE next-step spine for incoming agents; every block below is history).**
> The [wide+deep review](../../report/wide-deep-review-2026-07-04.md) (committed `b313479`,
> branch `feat/initial-castr-review`) re-proved **C2–C6 all live** on `main` @ `8bfc858` with
> `pnpm check` green on the same tree; C1 confirmed fixed + gated (publint/attw in CI). New
> findings **R1–R6** recorded in the report (JSON Schema/TS writers publicly unreachable;
> zodChain leakage in IR metadata from every parser; flat `IRSecurityRequirement`; doctrine
> self-contradictions incl. a one-day-old staleness; `Object.*` ban vs 147 uses; split-brain
> public surface). Strategic naming: **two products** (compiler + agentic-engineering kernel),
> unified by the **verified-claims** thesis (pending-graduations → PDR candidate).
> **OWNER DIRECTIVE (2026-07-04): total overhaul of the planning/strategy/vision estate around
> impacts and principles** — controlling plan
> [`strategy-vision-estate-overhaul.md`](../../plans/future/strategy-vision-estate-overhaul.md):
> W0 owner walk (**Q-012..Q-015** in `open-questions.md`: second-product naming, vision
> topology, preservation-coverage metric, principles.md truthing batch) blocks W1/W2/W4 shape;
> **W3's `validate-doctrine-claims` TDD cycle and W2's continuity archaeology are
> parallel-safe now**. **NEXT STEPS (HISTORICAL — superseded 2026-08-22: the proof-programme
> W-0 ballot was walked and CLOSED, remediation-02 is paused/partially absorbed into queue
> slices Q-02..Q-05, and the current next step is Q-01 (loop readiness) per
> [`plans/proof-programme/parent-plan.md`](../../plans/proof-programme/parent-plan.md) —
> consult its queue, not this block), as then written: (1) remediation-02 (IR-fidelity
> harness, `plans/current/paused/02-ir-fidelity-proof-harness.md`); (2) the W0 owner walk;
> (3) overhaul workstreams per the plan.** The substrate
> backlog (gap-rescan spine) stays parallel-safe and unchanged.

> **🧭 (2026-07-03 evening, Windswept Winging Cliff / 0ceb5f closeout — history; superseded on
> "what's next" by the 2026-07-04 block above).** The 2026-07-03 three-session day landed, in order: the OCE↔castr **delta review** (plan +
> as-built [`oak-castr-delta-review-2026-07-03.md`](../../plans/transplant/oak-castr-delta-review-2026-07-03.md);
> the **§Delta amendment** lives in the single backlog
> [`oak-castr-gap-rescan-2026-06-28.md`](../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md)); **statusline
> S1** (`7a37dec` + ctx-on-title-row `cb264d7` + checkout-name title `e1d204c` by Bellows — the enhanced statusline
> is LIVE; S2 Cursor wing + S3 logo pipeline remain, manifests ready); **Codex waves 4+5** fixed 9/9 with
> regression tests (`3acf8e5`, `922e51f`) — every PR thread resolved; **hardened git hooks** (owner-directed; the
> Oak-shaped pre-commit chain landed via the owner's `9f12d49`, fired live and caught + cured the hollow
> `markdownlint-staged` action); the **corpus-analysis suite DEFERRED** to the stabilisation-gated
> [`corpus-analysis-suite-bring.md`](../../plans/transplant/corpus-analysis-suite-bring.md); the
> **testing-strategy umbrella** (prove behaviour, never config or content — `c31ca23`); and Bellows's dedicated
> **consolidation** (917d989 + walk outcomes `a16682a`/`1226d9f`: PDR-124 Accepted, Q-008 → the
> [`archive-pii-scrub`](../../plans/current/archive-pii-scrub.md) full-tool plan, **Q-010 RULED: Result and
> fail-fast COMPOSE** → `use-result-pattern` is now a BRING + a D4 Result-migration slice is in the backlog).
> **🧭 SESSION-CLOSE TRUTH (2026-07-03, Fiery Flaring Bellows): PR #4 MERGED to `main` (`32c3f2b`) —
> the CI split (~5 min, fail-closed fan-in), turbo caching (truthful hash, cross-job sharing), the
> feature-branch reconciliation, and the pr-lifecycle skill + pr-watch CLI are ALL LIVE; the
> controlling plan is COMPLETE (moved to `plans/current/complete/`). No feature branch is open.
> CORRECTED (owner, 2026-07-03, post-close): "substrate before product" was the owner's QUESTION,
> not a direction — the earlier "owner-confirmed" phrasing here manufactured a decision. The
> ANSWERED question: castr product/remediation work can start after ONE short doctrine-sync slice
> (the `use-result-pattern` bring + re-sync of the rules a product agent reads first; TSDoc
> enforcement lands with or before the first new product module). Everything else in (2)–(4) is
> PARALLEL-SAFE with product work — disjoint file estates (`lib/` vs `.agent/`+`agent-tools/`),
> feature-branch isolation, live coordination substrate — and Q-011's "Axis A first" condition is
> already satisfied (its Tier-1 spine is complete). Remediation-02 (IR-fidelity harness) may open
> any time after the doctrine slice; the OCE stream continues in parallel uncompromised.
> ~~**THE NEXT SESSION EXECUTES `pre-castr-doctrine-sync.md`**~~
> **✅ DONE AND MERGED (2026-07-03 evening, Cirrus Spiralling Airstream / 8bff79): PR #7 MERGED
> to `main` (`6b6642a`) carrying all four RS cycles** (RS-1 `1538663` use-result-pattern +
> composition ruling + `preserve-caught-error` enforcement; RS-2 `889c4b9` second-consumer
> rename ripple + host-load §4 macOS reading; RS-3 `887ca6e` validation-strategy stub,
> testing-strategy authoritative; RS-4 `123840d` tsdoc/syntax gate proven-firing in both
> workspaces, 385 violations fixed; + reviewer/bot findings folds `b4c5253`/`a40d9b2` — every
> PR thread fixed-or-rejected with evidence). The completed plan's §As-built carries the
> detail ([`complete/pre-castr-doctrine-sync.md`](../../plans/current/complete/pre-castr-doctrine-sync.md)).
> **PRODUCT/REMEDIATION WORK IS NOW UNGATED — remediation-02 (IR-fidelity harness) or a feature
> slice may open immediately; the substrate backlog stays parallel-safe.**
>
> **NEXT STEPS, in order: (1) ~~PRE-MERGE — the merge-event continuity reconciliation~~ ✅ DONE 2026-07-03
> post-merge (Bellows): PR #3 MERGED (`5529436`); the branching model is now feature-branches-off-main (see
> §Repo-Wide Invariants, the authoritative statement) and the single-branch text is reconciled across
> continuity/ledger/thread/prompt/roadmap/plan surfaces. ALSO LANDED same pass (feat/ci-enhancement, PR #4):
> the CI SPLIT (OCE architecture — parallel gate jobs, fail-closed `quality-gates` fan-in, composite setup;
> ~5min wall-clock; exposed + fixed two latent turbo dependsOn defects) and TURBO CACHING ON with measured
> exceptions (agent-tools#test root-reach; mutating/network tasks) + cross-job cache sharing — plan
> [`turbo-caching-and-branch-model.md`](../../plans/current/complete/turbo-caching-and-branch-model.md).**
> **(2) PARALLEL SUBSTRATE STREAM (NOT a product gate — only the doctrine-sync slice above
> gates product code):** doctrine re-sync wave (consolidate-at-SECOND-consumer rename leads; now also carries the
> `use-result-pattern` bring per Q-010), plan-templates (TC2), validation-strategy directive, TSDoc enforcement,
> encoding-integrity gate, markdown-links wiring + amended ADR-127. **(3) EXECUTION SLICES ANY TIME:** statusline
> S2/S3 (manifests ready), archive-pii-scrub (full tool, owner-decided), D4 Result-migration slice. **(4) AFTER
> RESUME:** coordination-safety cluster, claims-handoff, provenance/archive-move, PDR batch (27, renumbered),
> Tier-2 flow, castr mark (owner creative). Axis B (remediation 02 first) opens any time after the doctrine-sync slice — Q-011's
> Tier-1 condition is already discharged; it does NOT wait for this stream.
>
> **🟢 PR #3 IS MERGE-READY (2026-07-03, Penumbral Slipping Moth closeout): mergeStateStatus CLEAN / MERGEABLE /
> 0 unresolved review threads / required `quality-gates` check GREEN at origin tip `2e616bd`.** Merge posture
> ~~(owner, explicit): the owner INTENDS to merge and will invoke the merge explicitly~~ (superseded 2026-08-26:
> merges are condition-based — green and clean → the driving agent merges; owner ruling 2026-08-22, reaffirmed
> 2026-08-26 — the owner-invoked posture was never policy); the agents' STANDING duty is
> keeping the branch continuously merge-correct and merge-safe (supersedes "delivery deprioritised"). The
> merge-readiness loop shape: **Codex reviews every push and may open a new finding wave** — disposition each wave
> fix-or-reject in the same work item (user-memory `pr-threads-fix-or-reject`) until a push's wave is empty; this
> session took three waves (14 → 5 → 3, all closed). Late landings after `7f53bd2`: `cec8bce` action SHA-pins +
> workspace-coverage guard, `ac0363e` dependency sweep (DC lane CLOSED), `89ac038` turbo 2.10.2, `3cf5972` audit
> overrides (audit ZERO), `c6df0f8`/`b0355e4`/`2e616bd` the three Codex waves (incl. ENGRAPH_ALLOW_MAJOR_VERSION=1
> owner override on the version guard; `git commit -n` gate-bypass block; trusted-git in the commit-queue runtime),
> `966495e` coverage-step test timeout. **Handover residue: `f8111d4` (Cliff's docs bundle) + the Moth closeout
> commit are LOCAL-ONLY — push duty + CI-wave watch explicitly transferred to Windswept Winging Cliff** (handover
> comms event; a push re-verifies via pre-push `check:ci` and triggers CI + possibly a fresh Codex wave to
> disposition). GitHub Code Quality: KEPT (owner-decided; evaluate in operation; GA billing 2026-07-20).
>
> **🧭 SINGLE FRONTIER (2026-06-28) — SUPERSEDED 2026-08-26: this block is history too, not a resumable frontier.
> The plan-of-record is [`proof-programme/parent-plan.md`](../../plans/proof-programme/parent-plan.md), and the
> transplant thread is STOPPED (owner ruling QD-2: "The old effort is stopped, parity remains a goal, we will
> address it in time") — nothing below is a current next step.** The "one deep enhancement" has **three axes**: **(A)
> transplant/parity** — ~~ACTIVE~~ **STOPPED per QD-2 above**; its single ordered backlog was
> [`oak-castr-gap-rescan-2026-06-28.md`](../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md) (the LC / TC /
> parity-tranche plans are FOLDED into it — see its "single ordered backlog" section). **(B) product-remediation**
> — **5 reproduced Criticals remain (C2–C6); C1 done.** DORMANT but now a DEFINED "after Tier-1" (Q-011 decided), not
> an undefined later. **(C) delivery** — ~~DEPRIORITISED~~ **superseded 2026-07-03 and corrected 2026-08-26: continuous MERGE-READINESS is a
> standing agent duty; merges are condition-based — green and clean merges (all CI passing on the current head, every
> review thread properly resolved; owner ruling 2026-08-22, reaffirmed 2026-08-26 — the earlier "owner-invoked"
> phrasing was never policy).**
> **Q-011 DECIDED 2026-06-28 (owner) → Axis A first.**
> **Tier-1 LANDED + PUSHED 2026-06-28 (Open Lofting Feather), origin = `16cedbf`:** enforcement-integrity cluster —
> ✅ trusted-git (`2ca01be`), ✅ gitleaks secret-scan wired into qg (`ec53da7`), ✅ CI-runs-gates server-side in-repo
> (`38073f1`); collaboration-safety cluster — ✅ worktree-aware coordination-home + dedup of castr's two FS-walk
> resolvers (`16cedbf`), ✅ watcher step-deadline (LC3c, `86be5fb` — comms-watch-errors.ts + loop refactor to
> fatal per-step deadline + step-timeout-ms CLI threading + loop-closure proof; introduced `vi.useFakeTimers`).
> **REFERENCE-DIRECTION LAYER LANDED 2026-06-28 (owner-taught permanence/portability hierarchy):** ✅ PDR-105
> keystone (`fc3b1cb`, at castr-105; Q-009 decided = mapping-table/transient), ✅ `validate-reference-direction`
> validator (`280762a`), ✅ burned down all **83** wrong-direction refs across 45 doctrine files via a 90-agent
> workflow + firsthand review, validator now BLOCKING + wired (`8def837`). **ALSO LANDED 2026-06-28:** the Oak
> **Decision Lenses — Order of Resolution** are now in `.agent/directives/principles.md` (owner-approved genotype
> edit: long-term-excellence → strict-everywhere-all-the-time → simpler/First-Question → dissolve-by-changing-the-system
> → user-value; dissolution before escalation, connects to `PDR-057` four-lens test). Applying them dissolved the two
> Codex-review questions into determinations: ✅ **#8** scoped-bang version-guard regex fixed + tested, ✅ **#6** gitleaks
> documented as a dev prereq (`CONTRIBUTING.md`, Oak parity). **CODEX FINDINGS ALL CLOSED (2026-07-03, Penumbral
> Slipping Moth):** owner directive (standing, user-memory `pr-threads-fix-or-reject`) — every PR thread resolves by
> fix or measured reject in the same work item, never priority-deferral. All **14** threads (9 triaged + 5 from the
> mid-session Codex re-review) dispositioned: 13 fixed TDD-green (`c6df0f8` six-finding batch incl. both P1s —
> MultiEdit guard + worktree-vs-index commit hole; `b0355e4` five re-review fixes incl. UUID-id identity equality,
> missing-fingerprint fail, intent-inactive stage, id-less-row quarantine, flag-cluster matcher), 1 rejected with
> falsifying CI evidence; every thread replied + resolved on GitHub; the transient triage doc deleted per its own
> lifecycle note. **ALSO LANDED 2026-07-03:** coverage reporting wired + proven (v8, in-process suites only —
> baselines lib 83.9% / agent-tools 62.4% lines; ruleset floors set min 70 / drop 1); CI actions SHA-pinned at
> latest stable + a fail-loud workspace-coverage-enumeration guard; full dependency-currency sweep (23 pkgs incl.
> prettier 3.9 emission-proven byte-identical, commander 15, depcruise 18, turbo 2.10.2 via codemod; @types/node
> HELD ^24 per ADR-049) + `pnpm audit` to ZERO via annotated hono/esbuild workspace overrides; publish.yml deleted;
> CodeQL moved to default setup (NOTE: the migration silently disabled the whole CI workflow — re-enabled + proven;
> Code Quality KEPT, evaluate impact-vs-cost before GA billing 2026-07-20). **The single next action** = continue the
> collaboration-safety cluster at **pre-archive provenance + class-tiered archive-move** (PDR-094 doctrine present,
> mechanism absent; inline-quote-first self-containment enforcement — PDR-105-aligned), then
> claims-handoff (LC3b/PDR-063) → **Oak-ADR cite-repair** (the 18 rule→ADR dangling
> links — see below) → plan-templates, bringing
> freely per PDR-005 §Default. **RULES-CLASSIFICATION RESOLVED 2026-06-28 (owner): genotype vs phenotype** —
> operationalised rules/ADRs/hooks are the repo's PHENOTYPE (context-specific expression of the portable Practice-Core
> genotype), so a rule is correctly `repo-doctrine` and rule→ADR is phenotype→phenotype (NOT a portability violation);
> the validator needs no change. The 18 rule→ADR links are therefore a pure DANGLING-LINK defect (Oak-scheme path
> absent), cured by wiring `validate-markdown-links` (castr has it, unwired) + de-link/repoint + bringing ADR-127 — the
> Oak-ADR-cite-repair item, NOT reference-direction. **DELIVERY: PR #3 (feat → main) OPEN + CI GREEN + MERGEABLE/CLEAN as of
> 2026-06-28** (https://github.com/EngraphCode/castr/pull/3; quality-gates ran `check:ci` server-side, success; the
> first run caught `main`'s unformatted PR-#2 research file, fixed by merging origin/main + reformatting). \*\*ONE
>
> > OWNER-ONLY ACTION remaining:** set `quality-gates` as a required status check in the main branch ruleset (GitHub repo
> > setting) — now unblocked since CI is proven green. Parallel
> > castr-internal lanes (NOT Axis A, in the thread record): dependency-currency DC3–5, friction-fix, hook-matcher,
> > LC1 fail-opens; castr-internal cleanups Q-009 (PDR renumber) + Q-010 (Result-vs-fail-fast). Commits are now linted at
> > commit-time (`.husky/commit-msg`). **`origin/feat` = `7907d1f` (reference-direction layer + g/p resolution + Codex-findings triage PUSHED; CI green + PR #3 mergeable); the Decision-Lenses + #8/#6 + handoff commits are the newest local, being pushed this turn. ALWAYS re-verify live with `git rev-parse --short origin/feat/transplant-engraph-practice` (the owner pushes between turns); push = owner's call (already authorised this branch + delivery).\*\*

> **CURRENT TRUTH (2026-06-28, Open Lofting Feather / c82112): the authoritative Oak→castr bring backlog is [`oak-castr-gap-rescan-2026-06-28.md`](../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md).**
> A two-pass ultracode rescan (owner updated OOCE; 26+23 agents, firsthand-validated) produced the
> deduped HAVE/HOLLOW/LACK map + bring backlog, superseding the 2026-06-20 gap inventory in
> `oak-parity-program.md`. **Tier-1 spine** (do first): CI-runs-gates-server-side (= LC5), gitleaks
> secret-scan, trusted-git (unblocks coordination-home + statusline), worktree-aware coordination-home,
> watcher step-deadline (LC3c), pre-archive provenance + archive-move, claims handoff/adopt (LC3b/PDR-063),
> reference-direction validator + PDR-105, Oak-ADR dangling-cite repair + ADR-127, plan-templates + ADR-117 (TC2).
> 23 Oak PDRs missing (096–119, **renumber for the castr-096/097 collision**). Disposition = bring-everything
> (PDR-005 §Default); OUT-OF-SCOPE carve-outs (Oak product stack) recorded in the rescan doc. Firsthand
> corrections folded: `use-result-pattern` is a deliberate non-bring (castr is fail-fast); 3 pass-1
> completeness-critic false-presence claims (pr-watch, .cursor/hooks, reference-docs) corrected — trust the
> lane audits, not critic re-checks. **No repo brings done yet — this is the map; LC3(b/c/d) below + the
> Tier-1 spine are the next execution slices (owner names the order, or bring freely per PDR-005).**

> **CURRENT TRUTH (2026-06-27, Open Lofting Feather / c82112): loop-closure LC3 sub-slice (a) machine-local-paths ✅ DONE; next is LC3(b/c/d).**
> Brought Oak's `validate-no-machine-local-paths` validator (validator + pure helpers + unit tests), localised to castr's
> direct-`git` convention; added a `machine-local-path` regex scoped_block to `policy.json` (single-sources the pattern set
> AND lights the PreToolUse write-time guard repo-wide); wired blocking into `repo-validators:check`. **Loop proven at the
> real layer:** validator found **324 real machine-local hits** across 29 tracked files → exit 1; doctrine-scoped, category-
> aware cure (`archive/` exempt per the rule's own Detection scope; stale self-links → repo-relative; Oak-checkout → `<oak>`;
> vendored/test placeholders → `<user>`) → exit 0 (2240 files clean). The write-guard then fired live blocking a literal path
> in a plan edit. Reviewers (code/test/config) run, findings folded firsthand: `'u'` flag added; an inaccurate "never drift"
> claim corrected; the blocking contract proven (exit 0/1/2 + fail-loud, extracted to testable helpers, parity-or-better over
> Oak). Case-SENSITIVE kept by MEASUREMENT (adding `i` false-positives on lowercase OpenAPI route fixtures). Full `pnpm check`
> green. **(Historical SHA note, superseded by the SINGLE-FRONTIER block above — re-verify origin live.)** `origin/feat` has ADVANCED (was `4799886` → `4615abb` → `c86d4e1`; the owner pushes between turns) —
> the owner pushed the LC0/LC1/LC2 closeout since 2026-06-27, so every prior block's "origin still at `4799886` /
> unpushed" push-state is SUPERSEDED (4799886 is now an ancestor). **Owner correction this session:** don't gate the
> ordering of independent, reversible, all-must-be-done items — choose, signpost, proceed (memory `dissolve-owner-gating-with-four-lenses`
> sharpened). **Next: LC3(b)** PDR-063 claim handoff/adopt, **(c)** watcher step-deadline [C3], **(d)** fitness staleness axes
> → LC4 → LC5. Deferred (recorded, not done): 5 pre-existing dead links surfaced by the cure (doc-hygiene sweep); the
> published-archive-PII question (archive is rule-exempt, Q-008). Detail:
> [`practice-loop-closure-remediation.md`](../../plans/transplant/practice-loop-closure-remediation.md) § As-built (LC3a).
> Supersedes the Hidden Veiling Mirror block below on "what's next" (LC3(a) now done); that block stays authoritative
> for the LC0/LC1/LC2 landing detail.
>
> **ALSO LANDED 2026-06-28 (`3838662`): LC4 item 1 + a STANDING GOVERNANCE CHANGE.** (1) Owner directive recorded to
> stick — **default is BRING; the only no-bring reason is "utterly irrelevant" (or not-cleanly-reversible); never gate a
> relevant bring behind a "case"** (PDR-005 §Default disposition + user-memory `bring-everything-by-default` + thread
> standing-decisions; LC4 reframed wire-vs-correct → wire-by-default). (2) **`.husky/commit-msg` is now LIVE** — every
> `git commit` runs `prevent-accidental-major-version` + `commitlint --edit`, so a non-conforming message is BLOCKED at
> commit (proven: blocks subject-case-bad, passes good); supersedes the provisional 2026-06-15 advisory-only posture.
> Next session: your commit messages are linted at commit-time now (lowercase subject, 7 allowed types).

> **CURRENT TRUTH (2026-06-27, Hidden Veiling Mirror / e8b57e): loop-closure LC0 ✅ + LC1 ✅ + LC2 ✅ DONE; next is LC3.**
> Six commits this session, all `pnpm qg` green, **LOCAL (push = owner's call); origin still at `4799886`.**
> **LC0 (`0c859bd`+`f829783`):** `validate-loop-closure-references` meta-validator (TDD, 40 tests) wired blocking into
> `repo-validators:check`; all 7 hollow `pnpm <script>` doctrine refs cured (check:profile proxy restored; markdownlint
> BROUGHT MD040-only + 29 language-tags; cruise→depcruise; secrets:scan/test:mutation reworded).
> **LC1 (`6372024`+`cc75a86`):** F-95 comms-watcher-presence gate brought + wired into `claims open` (blind-with-peer
> refused, no write; solo fast-path; identity-bound anti-spoof; dead detectStaleWatcher now consumed). Firsthand catch
> beyond the workflow's bring-plan: the `comms watch` writer auto-derives the heartbeat path or the gate falsely blocks
> every claim (brought it). **LC-reopen closed** (parity C4 + reference-closure Task-6 corrected).
> **LC2 (`7351b88`+`c3484da`):** reframed firsthand — Oak's semantic-merge is a PASSIVE skill, not an executor. Brought
> the skill (taxonomy reconciled to castr's MERGE_CLASSES) + a castr-original `.gitattributes` refuse-and-route merge
> driver (registered per-checkout by the postinstall bootstrap); loop closure proven by a REAL `git merge`. Parity-or-better.
> **Deferred (recorded, not done):** the two LC1 Oak-faithful fail-opens (future `--now`; cwd-relative heartbeat path)
> → a hardening slice + Oak back-flow; the CI-doesn't-run-qg finding → LC5. **Next: LC3** (machine-local-paths validator;
> PDR-063 claim handoff/adopt; watcher step-deadline [C3]; fitness staleness axes) → LC4 → LC5. Detail:
> [`practice-loop-closure-remediation.md`](../../plans/transplant/practice-loop-closure-remediation.md) § As-built (LC0/LC1) + LC2 as_built.
> The 2026-06-27 Stratospheric Kiting Breeze block below stays authoritative for the audit/root-cause narrative + the LC framing.

> **CURRENT TRUTH (2026-06-27, Stratospheric Kiting Breeze / c56a0f): a firsthand by-loop audit of the Practice
> found a real, under-counted enforcement-layer gap; the [loop-closure remediation plan](../../plans/transplant/practice-loop-closure-remediation.md)
> is a NEW ACTIVE lane and the recommended next-priority.** Owner challenged "have you brought the claims
> mechanism over / how much has been written off." Firsthand by-loop audit (5 read-only subagents, all
> load-bearing claims re-verified) found the Practice has real teeth (skill-adapter/reviewer/hook-policy loops
> CLOSED; 9 wired validators) BUT three failure classes: **(A) genuinely missing enforcement Oak has** — F-95
> coordination gate (`claims open` is ungated → coordination is honor-system), `semantic-merge` executor (absent
> though PDR-049/050 + 9 `merge_class` files demand it → memory-corruption risk), machine-local-paths validator,
> watcher deadline, fitness staleness axes; **(B) doctrine-vs-reality FALSE claims** (verified firsthand: the
> commit skill's pre-commit/commit-msg enforcement model is fictional — pre-commit is prettier-only, commitlint +
> version-guard run nowhere; type-enum/no-type-shortcuts/markdownlint refs all wrong); **(C) deliberate/planned**
> (not gaps). **ROOT: completeness was measured by artefact-presence, never loop-closure — the audit METHOD was the
> bug** (it under-counted the same layer twice → parity **C4 + reference-closure Task-6 RE-OPENED**). Cure: plan
> **LC0** = a loop-closure meta-validator (recur-proof, first), then LC1–LC5. Plan ONLY landed this session
> (`a22ec2c`, no code) + the loop-closure insight conserved in `distilled.md`. **All session work is committed +
> pushed; origin is in sync after the closeout push** (Moth's 6 consolidation commits + my `a22ec2c` loop-closure
> plan + `acd98ef` prompt edit + this closeout). **Owner
> names the next slice** — recommended: loop-closure LC0→LC2 (coordination-safety + memory-integrity outrank the
> earlier TC2/DC3 framing); TC2 (templates), DC3 (prettier), and the parity Tranche-3 (A4→A1) remain valid
> positions. The 2026-06-26 line below is SUPERSEDED on "active-next" by this block but keeps its reason-skill +
> consolidation detail.

> **CURRENT TRUTH (2026-06-26, Stratospheric Kiting Breeze / c56a0f): the reason-skill bring is ✅ DONE; the
> active-next positions are TC2 and DC3.** The **reason-skill parity bring lane is COMPLETE** (`4f0bfe3`,
> `feat(transplant)`): the outward `reason` skill + 1432-line `grammar-of-thinking.md` brought from Oak live
> `main`, localised, full eyeball review clean; `metacognition` back-link completes the pair (now byte-identical
> to Oak); `engraph-reason` adapter generated + discoverable + `Skill(engraph-reason)` wired; gates green
> (portability now **19 skills**). Verify-don't-trust catch: the `citation-as-reasoning` pattern was already
> present (phase-6) and correctly localised — its plan "BRING" disposition was stale, no action. **All this
> session's commits are PUSHED and origin is in sync (owner approved the push):** the prior 5 (`d6aecb6`…`5a031fc`)
>
> - the reason-skill bundle (`4f0bfe3` capability, `bb97128` continuity, `50a8a73` napkin) + this session-close
>   commit. **This supersedes every "LOCAL/unpushed" claim in the superseded blocks below.** **Active-next now:**
>   **TC2** (the completeness lane's plan-templates library — recorded next-priority)
>   and **DC3** (dependency-currency prettier — its own untouched position); the owner names which. **Consolidation
>   done (2026-06-26, Eclipsed Lurking Moth):** the dedicated curation pass that Kiting Breeze ceded is complete —
>   both registers drained empty, napkin rotated, four PDRs landed (096/097 + 057 amendment), Q-007 decided (see
>   §Deep Consolidation Status). The two 2026-06-26 lines below stay authoritative for the completeness lane (TC1/TC3a)
>   detail; TC3b's gate-end-state is now DECIDED (scoped-blocking).

> **CURRENT TRUTH (2026-06-26, Coppery Warming Magma / 48b4a5): the Oak READ MODEL changed and two new
> sub-programs are active under the parity umbrella.** (1) **Oak is read live from `main`, no pin** (owner;
> `practice/castr-pin` deleted) — §Repo-Wide Invariants is authoritative. (2) **Transplant completeness —
> bring the iceberg:** TC1 ✅ (`4283520`, 15 root proxies un-hollowed the commit skill) + TC3a ✅ (`e2e67cc`,
> `validate-markdown-links` ported standalone + census of **225 broken links** = the TC2/TC4 input). Next:
> **TC2** (21-file plan-templates library) → TC1b → TC4 → **TC3b** (markdown-links gate end-state DECISION);
> split-out `reference-direction` + `machine-local-paths` validators. Plan:
> [`transplant-completeness-supporting-infrastructure.md`](../../plans/transplant/transplant-completeness-supporting-infrastructure.md).
> (3) **Reason-skill bring** queued (R1/R2) — [`reason-skill-parity-bring.md`](../../plans/transplant/reason-skill-parity-bring.md).
> **Governing rule: bring-by-default** (default disposition for any Oak capability is BRING). The
> **dependency-currency lane (DC3 prettier next) remains its own untouched next position** — these sub-programs
> were taken ahead of it on owner direction, not instead of it. **4 commits this session, all LOCAL/unpushed**
> (push = owner's call). The 2026-06-21 line below is superseded on "what's active" but its DC3+ detail stays
> authoritative for that lane.

> **CURRENT TRUTH (2026-06-21): the active workstream is the [Oak Parity-or-Better Program](../../plans/transplant/oak-parity-program.md), and transplant Phase 9 is its CLOSURE GATE, not the active slice.** Tranche 1 ✅ (C1/C2/C6/C4/C5/C7/C8) and Tranche 2 ✅ (A2+A3 hook-policy concept/reappraisal unit — `511326f`/`abe580f`/`31caf78`, `pnpm check:ci` green) are COMPLETE. **Next safe step (2026-06-21) = the dependency-currency lane, IN PROGRESS — emission tier underway.** Dev-tooling + low-risk + the two highest-risk emission/IR cycles DONE: DC0 (`f761e12`), DC0b sonarjs (`dcad36b`), DC6 @types/node (`a731765`), DC7 commitlint (`0fd4a4c`), DC8 degit (`bb653c9`), **DC1 ts-morph 27→28 crown jewel (`c8c0a9a`, emission proven byte-identical), DC2 @scalar IR-input trio (`43419d0`, IR-fidelity preserved + dangling-ref fail-fast locked in).** Also landed: @types/node pinned to ^24 (Q-006 → ADR-049, `00750da`) + stale tsconfig include fixed (`43d7f8a`). **Next = DC3 prettier 3.8.3→3.8.4 (emission-formatter; baseline-capture + emitted diff), then DC4 ink (agent-tools runtime), DC5 commander (lib CLI), then lane-close → graduate dependency-currency-discipline to a practice-core pattern-PDR.** Controlling plan [`plans/current/complete/dependency-currency.md`](../../plans/current/complete/dependency-currency.md) §Progress (live) is authoritative. **Tranche 3 (A4 statusline → A1 ArcAngel, full unit) follows the dependency-currency lane.** The decision ledger is clean (Q-001…Q-006 all resolved). Finding routed (own slice): the repo-local `type-assertion-policy` ESLint rule is unregistered in `lib/eslint.config.ts` though `no-type-shortcuts.md` claims structural enforcement. The plan `todos`/§Sequencing and the [thread record](threads/practice-transplant.next-session.md) lanes are authoritative; the Phase-6/7/8/9 prose below is transplant-phase history, superseded on "what is the active slice" by this line.

**Owner steer (2026-06-19): finish the FULL Practice transplant first; ~~not in a rush to merge~~ (superseded 2026-08-26: green and clean merges, never held for an owner call).** _"Bring over the full
Practice — the Practice, agent tools, agentic frameworks, processes and protocols. Leave the remediation and focus on
finishing the transplant."_ → **Phase 7 ✅ COMPLETE + tagged `transplant/phase-7` (2026-06-20).**

**Phase 8 ✅ COMPLETE + TAGGED (`transplant/phase-8` @ `8d62197`, 2026-06-20):** materialised the
`.agent/state/collaboration/` runtime substrate (seeded empty, two-tier tracked/untracked via `.gitignore`); completed
the WS7 bring of `state-integrity.ts` (Oak-pin `optionalWhenAbsent` hardening); flipped `validate-collaboration-state`
blocking into `repo-validators:check`; tasks 3a/3b/4a/4b ✅ + task 6 generic-surface triage (clean) ✅ + task 5 per-thread
records ACTIVE ✅. **The final acceptance bar — "records carry a genuinely concurrent stream" — was satisfied by the first
director-led concurrent stream (2026-06-20):** Director fdb75b + 2 implementers (4aeee2 Lane A, 328f4f Lane B) exercised
the records end-to-end (claims/heartbeats/comms/Director-serialised review with routed reviewers adjudicated firsthand),
`pnpm check` green at the tag, reference-closure clean for scope. That stream ALSO landed arc **D3 (`c7f819e`), D2
(`41b24f8`), D4 archive/provenance (`0a75231`)** on pushed branches (all on origin). Full as-built detail:
[`08-collaboration-active.md`](../../plans/transplant/08-collaboration-active.md) §As-built banner.

**Active slice = transplant Phase 9** (Oak back-flow to a fresh branch off Oak `main` + PDR-currency sync; sub-plan
[`reference-closure.md §back-flow items`](../../plans/transplant/reference-closure.md)). **Arc D3/D2/D4 ✅ landed on
branches (2026-06-20, pushed to origin)** — D3 `c7f819e`, D2 `41b24f8`, D4 `0a75231`; the **statusline wiring fix ✅ LANDED**
(2026-06-20, Lane 3, on the transplant branch — Q-003 resolved); the deferred **release-automation** lane
(owner strategy: semantic-release vs changesets) remains. The
deep-review **remediation backlog 02–07 takes a named position AFTER the transplant** (not parked —
`no-manufactured-permission` holds; an undefined "later" is never). Delivery (the merge act + push of the lane branches)
~~is **deprioritised** ("not in a rush to merge")~~ (superseded 2026-08-26: green and clean merges, never held
for an owner call). This **supersedes the roadmap's
"(1) remediation; (2) transplant" plan-of-record order** for the current run; the roadmap + primary-plan sequence notes
are to be reconciled to this within the Phase-7 commit.

Authoritative sequence: sub-plan
[`06-memory-and-generator-consolidation.md` §4](../../plans/transplant/06-memory-and-generator-consolidation.md)
(reorder a✅…g✅ incl. substrate✅ + `active/patterns/`✅ + sub-agent roster✅ + state-schemas✅ +
reviewer-routes✅ + channels-card✅; **collaboration state schemas LANDED via Oak WS7** — schemas relocated to
committed source `agent-tools/src/collaboration-state/schemas/` + validator decoupled, no runtime `.agent/state/`
plane created; the two follow-on items (reviewer-route re-point, `agent-collaboration-channels.md`) DONE; **all three
standing deferred items RESOLVED** (back-flow target → fresh branch off Oak main; D1 → TS-skew root-fixed, rules at
`error`, 0 violations; Q-001 → D3-before-merge + split PRs); **`transplant/phase-6` ✅ CUT (`a63aee3`) + pushed —
Phase 6 COMPLETE**) and the [transplant tracker §Next steps](../../plans/transplant/README.md). **Phases 7 + 8 ✅
COMPLETE + tagged (`transplant/phase-7`, `transplant/phase-8`, 2026-06-20); next transplant phase = Phase 9 (Oak
back-flow + PDR-currency sync).** The one deep enhancement also keeps the remediation backlog 02–07 (5 of 6 reproduced Criticals still unfixed —
02 = the IR-fidelity proof harness, active, not started), the rest of the transplant and arc **D2–D4** (D1 ✅ done), and
the feature slice required and unparked — the owner names which is next; a fresh reproduced product regression pre-empts
it.

**Incoming from `main` ✅ HOMED (2026-06-19):** `origin/main` commit `ccd9c7a` (the zod-compiler report-plan, written on
branch `claude/castr-zod-compiler-review-qpre7n` against castr `393e476`) was cherry-picked onto
`feat/transplant-engraph-practice` and **split to its proper homes per its own "Note to the consuming/homing agent"**:
findings + §0/§1/§8/§9 → `.agent/research/zod-compiler/README.md`; §3 comparison + appendices A–D → `comparison.md`; §2
corrections (the prior report is **not** in-repo, so homed as verified current-reality + a provenance pointer from
`architecture-review-packs/README.md`) → `corrections.md`; **§4 reasoning trail PRESERVED** → `reasoning-trail.md`; the
plan (§5 verb model + §6 Phases A–F) → `.agent/plans/future/castr-surface-architecture-and-verb-model.md` (+ `castr-check-verb.md`
atomic Phase-D plan); the atomisation decision (§7) → **ADR-048** (Proposed; clarifies ADR-043's scope via a banner; the
D2 "ADR-048 candidate" was re-pointed to 049). Monolith removed (content fully conserved; homing map in the research
README). _Meta still live: this was a main→branch divergence — work landed on `main` outside the single-transplant-branch
invariant; the periodic main→branch sync check (cf. the Oak PDR-currency sync) is still wanted so future main-side commits
are not stranded._

**Main→branch sync check ✅ PERFORMED (2026-06-20, owner-directed):** authoritative `git fetch origin --prune --tags` +
divergence analysis. Result — **nothing to integrate**: `origin/feat/transplant-engraph-practice` (`9712113`) is a clean
ancestor of HEAD (local ahead by the 2 Phase-8 commits, behind 0; the opener's "5 unpushed" was a stale local
remote-tracking ref — `reflog` confirms `9712113` was already pushed). `origin/main` advanced to `a71a09a` (PR #2 merged
the zod-compiler branch), but `git log origin/main --not HEAD` surfaces only the zod-compiler monolith — **already
cherry-picked and homed in split form** on the branch (re-integrating would regress the homing). `origin/feat/rewrite`
(`d2c6fb1`, 2025-11-30) is an **unrelated orphan** (empty `merge-base` with HEAD — no shared history). The remote prune
deleted the now-merged `claude/castr-zod-compiler-review-qpre7n` source branch (expected). The 2 Phase-8 commits were
**locally unpushed at that check** — **superseded: the owner has since pushed `feat/transplant-engraph-practice` to
origin through `f8b4910` (2026-06-20)**; only commits after `f8b4910` are now locally ahead.

## Open Owner-Decision Items

None — the transplant decision ledger is clean (Q-001…Q-005 all resolved). The
standing decisions and their rationale live in the thread record's
[§ Standing decisions + Lanes](threads/practice-transplant.next-session.md); the
D1/single-TS-override decision is now
[ADR-050](../../docs/architectural_decision_records/ADR-050-single-workspace-typescript-override.md).

## Repo-Wide Invariants / Non-Goals

Continuity invariants (the non-negotiables a resuming agent must hold):

- **Branching model (owner, 2026-07-03): feature branches off `main`, one PR per
  slice, merges condition-based (green and clean merges: all CI passing on the current head, every review thread properly resolved — fixed or rejected with evidence; owner ruling 2026-08-22, reaffirmed 2026-08-26 — no per-PR owner invocation).** The 2026-06→07 single-branch working mode was a
  CIRCUMSTANCE of the transplant era, never an invariant (owner: _"one branch was
  never an invariant, we just happened to be working off main to start with, now
  we use feature branches"_). It ended when PR #3 merged (`5529436`, 2026-07-03).
  Dated records referencing the "single-branch invariant" describe that era
  truthfully and are not current doctrine. The collaboration substrate (claims /
  comms / commit queue) is branch-agnostic. Branch/PR state is owned by
  [`delivery-ledger.md`](../../plans/delivery-ledger.md).
- **Feature branches stay current with `main`** — at session open and before any
  merge act, fetch and reconcile (`git fetch origin --prune`; rebase or merge
  `main` forward per the branch's churn). The transplant-era main→branch
  stranded-commit sweep is retired with the model that needed it.
- **Roll forward only** — revert; never `reset --hard` / force-push
  ([`never-use-git-to-remove-work`](../../rules/never-use-git-to-remove-work.md)).
- **Each transplant phase = one atomic commit + `transplant/phase-N` tag**,
  green-gated (full `pnpm check`) + reference-closure-clean **at the tag**;
  intermediate commits may carry intra-phase forward-refs.
- **Oak is read live from `main`, no pin** (owner, 2026-06-26 — supersedes the
  2026-06-20 rebased-branch pin and every earlier frozen-SHA model). The
  `practice/castr-pin` branch is **deleted**; controlled-sync points (frozen SHA,
  then rebased branch) caused more issues than they solved. castr reads Oak's living
  Practice directly from the local checkout's `main` at whatever it currently is.
  **Always read via `git -C <oak> show main:<path>`** (deterministic; avoids the
  dirty/other-branch working-tree trap that produced a false-absence error
  2026-06-20). The owner keeps the local Oak checkout (`<oak>`) pulled
  current.
  **Never anchor a live Oak SHA into castr's permanent docs as a baseline** —
  reference Oak by path/concept and capture what was brought in castr's _own_
  commits. This keeps `no-moving-targets-in-permanent-docs` satisfied: a living
  upstream _source_ read on demand is not a cited moving target.
- **Nothing is parked — named positions only**
  ([`no-manufactured-permission`](../../rules/no-manufactured-permission.md)); a
  deferral without a named position is drift.
- **`.agent` is NOT prettier-ignored** — `pnpm exec prettier --write` new docs
  every phase (`check:ci`/pre-push runs `format:check`, not `format`).

Engineering non-negotiables are owned by
[`principles.md`](../../directives/principles.md) and
[`AGENT.md`](../../directives/AGENT.md) — IR-is-truth-after-parsing, fail-fast,
strict-and-complete-everywhere, lossless-by-default, deterministic output. Do not
restate them here; hold them.

**Green gates ≠ no bugs.** The 2026-06-04 deep review reproduced 6 Critical
defects the green gates do not catch (packaging/types, security AND→OR, `$ref`
round-trips, IR round-trip throw, Zod parser/writer losses). Start at
[`.agent/report/initial-review/`](../../report/initial-review/); remediation
backlog 02–07 is a required, unparked component.
```

## .agent/prompts/session-continuation.prompt.md

```markdown
# Session Continuation: @engraph/castr

**Last updated:** 2026-06-10

Context bridge between sessions. Start here after reading [AGENT.md](../directives/AGENT.md).

---

## Current state (2026-06-15 close) — read this first

> **📋 2026-08-22 — PROOF PROGRAMME IS THE PLAN-OF-RECORD (W-0 walked and CLOSED).** The
> owner walked the
> [W-0 ballot](../plans/proof-programme/ballot-2026-08-owner-walk.md) interactively on
> 2026-08-22: all ten decisions carry success verdicts,
> [ADR-051](../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md)
> is **Accepted** (amended: three firings per day), and **B-11 RATIFY supersedes the
> roadmap's 2026-06-19 sequence with
> [`plans/proof-programme/parent-plan.md`](../plans/proof-programme/parent-plan.md)'s
> queue** (the transplant is STOPPED — owner ruling QD-2, 2026-08-26: "The old effort is
> stopped, parity remains a goal, we will address it in time"; parity's living frame is
> the 2026-08-24 bidirectional-equality directive). **Routine state: the Routine is a
> scheduled task the owner creates and schedules at will (parent plan §Operating
> protocol step 1); when none is scheduled, no background work is advancing — the
> proof-programme thread record carries the live state.** Resuming sessions: read the
> parent plan's queue and operating protocol before acting, check for open programme PRs
> and live claims, and treat WIP = 1 as the guideline ADR-051 (as amended 2026-08-26)
> grades it; every banner below predates this contract.

> **🔬 CURRENT TRUTH (2026-07-04, wide+deep review) — READ THIS FIRST.** The
> [wide+deep review](../report/wide-deep-review-2026-07-04.md) re-proved **all five open
> Criticals (C2–C6) live on today's `main`** while `pnpm check` passed green on the same tree,
> added findings **R1–R6** (headline: JSON Schema/TS surfaces publicly unreachable; Zod chain
> strings computed by every parser inside IR metadata; `IRSecurityRequirement` structurally flat;
> doctrine self-contradictions), and named the repo's **two products** (compiler + the
> agentic-engineering kernel) under the **verified-claims** thesis. Owner directive (same day):
> total overhaul of the planning/strategy/vision estate, organised around impacts and principles
> — controlling plan
> [`strategy-vision-estate-overhaul.md`](../plans/future/strategy-vision-estate-overhaul.md)
> (W0 owner walk = Q-012..Q-015 in `open-questions.md`; W3 validator + W2 archaeology
> parallel-safe). **Remediation-02 (IR-fidelity harness, `plans/active/`) remains the
> highest-leverage product slice and is NOT gated by the overhaul.** This file's banner
> stratigraphy is itself overhaul scope (W2); trust this banner + `repo-continuity.md` §Next
> Safe Steps.
>
> **🔀 CURRENT TRUTH (2026-07-03) — supersedes every branch-model statement in this file.**
> **The transplant branch MERGED to `main` in PR #3 (`5529436`, 2026-07-03) and is deleted on origin.** The
> branching model is now **feature branches off `main`, one PR per slice, merges condition-based (green and clean merges: all CI passing on the current head, every review thread properly resolved — fixed or rejected with evidence; owner ruling 2026-08-22, reaffirmed 2026-08-26 — no per-PR owner invocation)** — the
> single-branch mode referenced throughout the dated banners below was a circumstance of the transplant era,
> never an invariant (authoritative statement: `repo-continuity.md §Repo-Wide Invariants`). Any instruction
> below to re-verify `origin/feat/transplant-engraph-practice` is dead — that ref no longer exists. The live
> next-step pointer remains [`../memory/operational/repo-continuity.md` Next Safe Steps](../memory/operational/repo-continuity.md#next-safe-steps).
>
> **🟢 UNGATED (2026-07-03 evening, PR #7 merged `6b6642a`): product/remediation work may open
> immediately.** The pre-castr doctrine-sync slice is live on `main` (use-result-pattern + the
> Q-010 composition ruling, second-consumer rename, validation-strategy, tsdoc/syntax
> enforcement). Axis B below is therefore **no longer dormant** — remediation-02 (IR-fidelity
> harness) or a feature slice may open on a fresh branch off `main` any time; the substrate
> backlog stays parallel-safe. **Q-011 is DECIDED and drained** (Axis A first; its Tier-1
> condition discharged — see `open-questions.md` rest-state note), so every "A/B/C sequencing is
> an open owner decision" line in the dated banners below is superseded.

> **🧭 CURRENT TRUTH (2026-06-28) — READ THIS FIRST; supersedes the "NEXT = DC3 prettier" + all earlier next-step
> framing below.** Transplant Phases 0–8 ✅ done + tagged. Since the dated banners below: the reason-skill bring landed
> (`4f0bfe3`); the loop-closure lane LC0/LC1/LC2 + LC3(a) machine-local-paths validator landed; the **bring-everything
> disposition** was ratified (PDR-005 §Default disposition + user-memory `bring-everything-by-default`); the
> `.husky/commit-msg` guardrail was brought (commits are now linted at commit-time); and a **two-pass firsthand-validated
> Oak→castr gap rescan** produced the **single authoritative Axis-A bring backlog**:
> [`../plans/transplant/oak-castr-gap-rescan-2026-06-28.md`](../plans/transplant/oak-castr-gap-rescan-2026-06-28.md)
> (it folds the LC/TC/parity-tranche next-steps into one ordered spine). **The live next-step pointer is
> [`../memory/operational/repo-continuity.md` Next Safe Steps](../memory/operational/repo-continuity.md#next-safe-steps)**;
> read that for the current frontier. Governing disposition: bring everything unless utterly irrelevant. Three axes —
> (A) transplant/parity (active, the gap-rescan backlog), (B) product-remediation `remediation/02–07` (dormant),
> (C) delivery (~~deprioritised~~ superseded 2026-08-26: green and clean merges, never held for an owner call) — with the A/B/C sequencing an open owner decision (`open-questions.md` Q-011). The
> dependency-currency DC3–5 lane is a separate castr-internal lane, not Axis A. **`origin/feat` = `c86d4e1` as of
> 2026-06-28 (the owner pushes between turns — re-verify live with `git rev-parse --short origin/feat/transplant-engraph-practice`;
> only the newest local commit(s) are unpushed); ~~push = owner's call~~ (superseded 2026-08-26: work is pushed and PRs merged when green and clean).** Everything below is retained as dated history; trust this banner + repo-continuity for "what's next."

> **2026-06-20 SCOPE-EXPANSION UPDATE (supersedes everything below it on scope — read this first).** The owner expanded
> the work from "finish the transplant (Phases 0–9)" to the **[Oak Parity-or-Better Program](../plans/transplant/oak-parity-program.md)**:
> _"upgrade everything in castr that is less sophisticated or powerful than Oak; castr is not meant to stay simple"_
> (ArcAngel named explicitly + "not the only thing missing"). The transplant manifest was proven **incomplete**, so a
> firsthand 5-subagent Oak↔castr gap audit (all claims re-verified firsthand; 3 agent errors caught) produced the
> authoritative gap map: **4 Tier-A + 6 Tier-B + 8 Tier-C verified gaps** in `oak-parity-program.md` (the active
> executable plan). **Phase 9 is now the closure gate that runs AFTER parity lands**, not a standalone step. Landed this
> session: **Q-003 statusline wiring** (`ebf08b5`); **PDR-currency sync COMPLETE** — 4 new + 9 folded PDRs current with
> Oak `ad359a4f` (`5c40adb`, `3787928`); **B2 metacognition directive** upgraded 16→122 lines (`fcda10a`). Standing
> directive saved to user-memory `castr-parity-or-better-with-oak` (distinguish deliberate-localisation → preserve, from
> unbuilt-gap → upgrade). Parity **Tranche 1 ✅** (C1/C2/C6/C4/C5/C7/C8) and **Tranche 2 ✅** (A2+A3 hook-policy unit —
> `511326f`/`abe580f`/`31caf78`) are COMPLETE.
>
> **2026-06-21 dependency-currency UPDATE (current truth; supersedes the "lane is READY/next-session" framing above).**
> The lane is IN PROGRESS — dev-tooling + low-risk + the two highest-risk emission/IR cycles are DONE and **pushed**:
> DC0 (`f761e12`), DC0b sonarjs (`dcad36b`), DC6 @types/node (`a731765`), DC7 commitlint (`0fd4a4c`), DC8 degit
> (`bb653c9`), **DC1 ts-morph 27→28 crown jewel (`c8c0a9a` — emission byte-identical), DC2 @scalar IR-input trio
> (`43419d0` — IR-fidelity preserved + dangling-ref fail-fast locked in).** Also: @types/node pinned ^24 (Q-006 →
> **ADR-049**, `00750da`) + stale tsconfig include fixed (`43d7f8a`). Decision ledger clean (**Q-001…Q-006 resolved**).
> **NEXT = DC3 prettier 3.8.3→3.8.4** (emission-formatter; baseline-capture + emitted diff), then DC4 ink (agent-tools
> runtime), DC5 commander (lib CLI), then **lane-close → graduate dependency-currency-discipline to a practice-core
> pattern-PDR.** Then **Tranche 3 (A4 statusline → A1 ArcAngel, full unit).** Controlling plan
> [`plans/current/complete/dependency-currency.md`](../plans/current/complete/dependency-currency.md) §Progress (live) is authoritative.
> Finding routed (own slice): repo-local `type-assertion-policy` ESLint rule unregistered in `lib/eslint.config.ts`.
> All "finish Phase 9" framing below is superseded by the parity-program framing.

> **2026-06-20 close UPDATE (supersedes the stale bullets below where they conflict):** Phases 6 **and 7** are ✅
> COMPLETE + tagged (`transplant/phase-6` `a63aee3`; `transplant/phase-7` 2026-06-20). **D1 lint is ✅ RESOLVED**
> (TS-version skew, single-TS override; rules back at `error`) — ignore the "D1 UNCONFIRMED / warn→error pending"
> turnkey step below. **Phase 7 landed:** native adapter generator (`agent-tools/src/agent-adapter-generate/`, TDD) →
> `.cursor/agents`+`.claude/agents` (18 each) + `.cursor/rules/*.mdc` (87) + 174 `.claude`/`.agents` rule wrappers;
> `portability`+`subagents` gates flipped blocking-green; bespoke `scripts/validate-portability.mjs` retired; full
> `pnpm check:ci` green. **Phase 8 ✅ COMPLETE + TAGGED `transplant/phase-8` (`8d62197`, 2026-06-20).** The final
> acceptance bar — "records carry a genuinely concurrent stream" — was satisfied by the **first director-led concurrent
> stream** (2026-06-20): Director Briny Cresting Sextant (fdb75b) + 2 implementers Stratospheric Wheeling Horizon
> (4aeee2, Lane A) and Secret Watching Candle (328f4f, Lane B) — each with a distinct PDR-027 identity, an armed comms
> watcher, a live claim, a ≤4-min heartbeat, and comms; the stream exercised claims (open→heartbeat→close), directed +
> broadcast comms, Director-serialised review with routed reviewer sub-agents adjudicated firsthand, a live
> identity-table write-race, and a measured watcher-idle-coalescing failure (F6/N10, now team doctrine). `pnpm check`
> green at the tag; reference-closure clean for scope. **The same stream landed the first split-PR-shaped delivery — arc
> D3/D2/D4 on dedicated branches (pushed): `feat/d3-ci-oak-standard`@`c7f819e` (CI to Oak standard: check:ci gate + 6
> SHA-pinned actions + dead publish.yml removed), `feat/d2-node-version-single-source`@`41b24f8` (.nvmrc single-source;
> off D3 — coordinate-dependent on ci.yml), `feat/d4-archive-provenance-backbring`@`0a75231` (archive+provenance
> subsystems, `@oaknational/result`→fail-fast).** Not merged ~~(split-PR merge to main = owner's next move)~~ (superseded 2026-08-26: merges are condition-based — green and clean → the driving agent merges; owner ruling 2026-08-22, reaffirmed 2026-08-26).
> **First-run collaboration-setup friction harvest** (owner-directed "record all"): F1–F12 + N1–N12 in
> `.agent/memory/active/napkin.md`; headline **F6/N10** (an armed Monitor watcher silently coalesces events during idle
> windows → an agent goes dark despite a correct watcher; cure = catch-up-sweep on every wake, now team doctrine +
> user-memory). **LIVE NEXT SLICES (per the thread record's lanes):** transplant **Phase 9** (Oak back-flow + PDR-currency
> sync); the **first-run friction-fix tranche** (the agent-tools/doctrine fixes the friction harvest names — high-leverage
> before the next team session); the split-PR **delivery** (D3-gated). **No open owner decisions** — the ledger is clean
> (Q-001…Q-005 resolved; see line above). **Owner re-order (2026-06-19): finish the FULL Practice transplant first;
> remediation 02–07 = a named position AFTER (not parked); ~~not in a rush to merge~~ (superseded 2026-08-26: green and clean merges, never held for an owner call).** All "currently Phase 6/7" language
> below is stale → Phases 6/7/8 complete + tagged.

This block is current truth only. Branch/delivery state lives in
[`../plans/delivery-ledger.md`](../plans/delivery-ledger.md) (single DRY home). **Sections below this block predate the
2026-06-15 single-branch consolidation and are historical context** — where they describe `fix/*` branches off
`docs/initial-deep-review` or PR #1, this block supersedes them.

- **Single branch (owner, 2026-06-15):** ALL work is on `feat/transplant-engraph-practice` (pnpm 11.5.2, Node 24
  govern). The multi-branch model was retired — `docs/initial-deep-review` and `fix/remediation-01-packaging-and-types`
  were fully subsumed and **deleted (local + remote, verified lossless via `git cherry`/diff/ancestry)**; **PR #1 was
  closed** (superseded). Remediation 02–07 now execute **on this branch**, not separate `fix/*` branches. The single
  delivery act is one eventual PR `feat/transplant-engraph-practice → main` carrying everything. `feat/rewrite`
  (remote-only, historical session-3.x line) is untouched.
- **The branch is `check:ci`-GREEN end-to-end** (verified first-hand via pre-push, 2026-06-15) — through `test:all`/
  `test:e2e`. First time it has been provably green: lint-red had been **masking** two knip failures (`check:ci` stops
  at the first failure), so "green except lint" was false. Both knip failures are now fixed (see below).
- **D1 lint — ✅ RESOLVED (2026-06-19), both rules back at `error`.** `sonarjs/function-return-type` (S3800) +
  `sonarjs/in-operator-type-error` (S3785) were warn-downgraded 2026-06-15 (`3b3f0d9`; 126 violations). Root cause,
  measured firsthand: a **TypeScript-version skew** — `eslint-plugin-sonarjs@4.0.3` resolved its bundled TS 5.9.3 while
  the parser built Type objects with the workspace's 6.0.3, and the two releases renumber `ts.TypeFlags`, so the rules
  masked the wrong bits and mis-fired on type-safe code (not a code smell, not a rule defect — an environment skew).
  **Fixed at root** by pinning a single workspace TypeScript (`pnpm-workspace.yaml` `overrides: typescript: 6.0.3`);
  under aligned TS both rules flag **0** and are restored to `error`. Full root-cause record:
  [`../plans/transplant/d1-sonarjs-findings.md` §0](../plans/transplant/d1-sonarjs-findings.md).
- **knip fixed (commits `c622998`, `1363181`):** the lint fix unmasked two pre-existing knip failures, both fixed —
  6 dead char-test exports removed; `commitlint` installed + wired (`@commitlint/cli` + `config-conventional` +
  root `commitlint.config.mjs`), which also made the agent-tools `check-commit-message` validator operational (it had
  been a phantom — no `commitlint` was installed). No enforcing `commit-msg` hook (owner).
- **One deep enhancement (owner):** bringing over the ENTIRE Practice / agentic-engineering framework / agent-tools /
  skill+rule+subagent+hook definitions AND fixing castr's known issues are the **same** goal, not competing priorities
  (owner, 2026-06-17). Components — all required, all on the single branch `feat/transplant-engraph-practice`, none
  parked: (a) Practice transplant Phases 6–9 (0–5 done); (b) engineering-infrastructure arc D1–D4 (tracker
  §Deep-enhancement arc); (c) deep-review remediation backlog 02–07 (01 complete + merged in — the 6 shipped Criticals
  must be fixed); (d) `explicit-additional-properties-support`. The owner names the next slice — **currently Phase 6**.
  The 2026-06-09 "sequence positions 1/2/3" were an ordering guide, never a gate blocking one component behind another.
- **Owner decision 1 — Node:** 24 everywhere; stable-LTS always; advance to 26 only once GitHub _and_ Vercel support
  it. Config executed (`engines: 24.x`, single-Node-24 `ci.yml`); single-source `.nvmrc` and ADR-048 remain as D2.
- **Owner decision 2 — lint:** no rule ever off; in-flight rules MAY be `warn` transitionally; DoD requires all back
  to `error` before the deep enhancement is complete (`DEFINITION_OF_DONE.md` §Transitional gate states; D1). NOT disabling.
- **Owner decision 3 — scope:** the deep enhancement is broader than Phases 0–9 (CI to the Oak SHA-pinned-actions
  standard, plus quality-gate and Practice parity; D1–D4). "Phases done" is not "deep enhancement complete".
- **Turnkey next steps:** (a) **D1 `warn → error`** — UNCONFIRMED path; first **measure what the rules actually flag**
  (the earlier "collides with discriminated-union returns" claim was disproven) per
  [`../plans/transplant/d1-sonarjs-findings.md`](../plans/transplant/d1-sonarjs-findings.md) (suspect — re-derive); (b)
  **remediation 02** (IR-fidelity harness, in `active/`); (c) **transplant Phase 6** (Sub-agents / memory / state).
- **Oak:** read **LIVE from `main`, no pin** (owner, 2026-06-26 — supersedes the 2026-06-20 `practice/castr-pin`
  rebased branch and the 2026-06-17 frozen `ad359a4f`; the pin branch is **deleted**, controlled-sync caused more
  issues than it solved). Read via `git -C <oak> show main:<path>`. Back-flow target is OPEN (deferred to Phase 9).
  The historical pin→main bring-manifest is in `relevance-ledger.md` §Main re-pin delta.

---

## Where We Are

> 🔀 **ONE DEEP ENHANCEMENT (owner): bring over the ENTIRE Practice / agentic-engineering framework / agent-tools /
> skill+rule+subagent+hook definitions AND fix castr's known issues — the same goal, not competing priorities.**
> Owner doctrine (2026-06-09): "all issues MUST be fixed, mostly now; sequencing with a named position is acceptable;
> an undefined 'later' is never." Components — all required, all on the single branch
> `feat/transplant-engraph-practice`, none parked:
>
> - **Practice transplant** ([`oak-practice-transplant.md`](../plans/current/paused/oak-practice-transplant.md), tracker
>   [`transplant/README.md`](../plans/transplant/README.md)) — Phases 0–5 complete and tagged; **Phase 6 is the
>   owner-directed next slice**.
> - **Engineering-infrastructure arc D1–D4** (tracker §Deep-enhancement arc).
> - **Deep-review remediation backlog** ([`remediation/`](../plans/remediation/) 02–07; 01 complete + merged in) — the
>   6 shipped Criticals must be fixed; a required component, not a gate that blocks the transplant.
> - **Product feature slice** [`explicit-additional-properties-support.md`](../plans/current/paused/explicit-additional-properties-support.md).
>
> The owner names the next slice; the rest keep their place and still get done. A 2026-06-05 record claimed the owner
> "parked" the feature slice — **the owner never gave that instruction and repudiated the parking framing (2026-06-09)**.
> The 2026-06-09 "sequence positions 1/2/3" were an ordering guide, not a priority gate; advancing the transplant does
> not demote remediation. Everything below remains true context (where it routes work to `fix/*` branches off
> `docs/initial-deep-review`, the single-branch consolidation in §Current state supersedes it).

### Practice Transplant — STOPPED (owner ruling QD-2, 2026-08-26; history below)

> **Do not resume this effort.** "The old effort is stopped, parity remains a goal, we
> will address it in time" (owner, 2026-08-26). The section below is historical record
> of the transplant era; parity's living frame is the 2026-08-24 bidirectional-equality
> directive.

**Goal:** wholesale-transplant Oak's Practice estate into castr (localise `@oaknational`→`@engraph`), preserving castr's
product doctrine/ADRs/report/remediation. **Branch:** `feat/transplant-engraph-practice` off `docs/initial-deep-review`
(baseline `transplant/phase-0-baseline`). **Read first:** `.agent/plans/current/paused/oak-practice-transplant.md` (contract) →
`.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` (the full
inventory/dispositions) → the napkin's latest entries (`2026-06-10` decisions + rule candidate, `2026-06-09` Phase-4 lessons, `2026-06-07` firsthand corrections).

- **Status:** Phases 0–5 ✅. **Phase 5 (2026-06-17, tag `transplant/phase-5`)** — 7 generic directives brought
  additive (`agent-collaboration`, `continuity-practice`, `definition-of-delivery`, `operationalisation-contract`,
  `orientation`, `tdd-as-design`, `user-collaboration`), per-surface reconciled (false `§Code Quality` TDD cite →
  `§Testing Standards`; Oak-local plan cites de-linked; `oak-consolidate-docs` localised; mechanism surfaces
  reconciled; tdd-as-design scales grounded for castr's headless `lib`); `AGENT.md` gained an additive directive index;
  `schema-first-execution.md` held DON'T-BRING. Oak rules-delta folded (`precedence-is-not-approval` + `PDR-091` +
  `verify-dont-trust` +6) → **86 canonical rules / 92 PDR files**. **Phase 4 (2026-06-09, tag `transplant/phase-4`)** — 80 Oak rules (ad649710) + castr's 5
  = 85 canonical rules + root `RULES_INDEX.md` (85 rows, index↔disk verified); per-rule firsthand reconciliation;
  `use-result-pattern` dropped (contradicts `principles.md` fail-fast — 9th DON'T-BRING); 7 collision-range Oak-ADR
  cites disambiguated cross-host; `pnpm agent-tools:*` aliases wired. Phase 3 — skills (18 brought + localised; castr
  grounding folded into the start-right core; `jc-*`/`distillation`/`napkin`/`castr-start-right` retired; blocking
  `skills:check`); tag `transplant/phase-3`. Phase 2 = `@engraph/agent-tools` (340 files) + hook policy + LIVE
  PreToolUse guards + §6 `validate-drift`; tag `transplant/phase-2` (commit `55a6788`).
  Commits: see `git log --oneline transplant/phase-1..HEAD` — Phase 2 = `55a6788`; then handoff + diagnosis-correction commits. Oak advanced `2c85bc01`→`ad649710`; **Step 0 (2026-06-07) reviewed the whole estate (see the tracker); Oak was held at `ad649710` through Phase 4, pinned at `4470266` for Phase 5, and was RE-PINNED to `main` `ad359a4f` (owner, 2026-06-17) for Phases 6–9 — a clean superset of the pin (the `ad649710`→pin rules-delta was folded at Phase 5; the pin→main delta is the bring-manifest in `relevance-ledger.md`). **Oak is now read live from `main`, no pin (owner, 2026-06-26) — that whole pin timeline is history.\*\*
- **LIVE NOW (operational):** Claude PreToolUse guards are wired (`.claude/settings.json`) — tool calls are guarded
  (dangerous-git + PDR-044 content fingerprints denied; unbuilt `dist` fails OPEN, never bricks). agent-tools `test` is
  INFORMATIONAL (`--filter=!@engraph/agent-tools`; **13**/885 failures are later-phase content — the RULES_INDEX slice
  went green at P4). `repo-validators:check` = **5 green BLOCKING validators**
  (`lifecycle-scripts`/`pretooluse-guard-routing`/`drift`/`fitness-vocabulary`/**`stale-script` — flipped 2026-06-09**
  after its one finding, the `principles.md:1729` dangling invocation, was fixed); 3 deferred
  (`collaboration-state`→P8, `subagents`→P6, Oak `portability`→P7). **policy.json is contract-tested** (hook-policy
  tests pin its citation strings — data↔test lockstep, change BOTH together: done 2026-06-09 for the staging-deny →
  rule-path and hedging/menu-deny → real-principles-heading citations; 114/114 green).
- **⚠️ The deferred validators' "crashes" are NOT bugs — do NOT silence them.** They hard-fail by design on absent
  infrastructure (Oak tests assert `rejects.toThrow` / `toThrow(/missing adapter/)`) — truthfully reporting castr's P6/P8
  infra isn't installed yet. A 2026-06-07 trial fix was reverted; **Oak clean at `ad649710`, nothing pushed**. They
  self-clear when P6/P8 land. See `relevance-ledger.md` §"Deferred-validator …".
- **Next steps — full detail in the tracker's "Next steps":** Phases 0–5 ✅ done. **NEXT: Phase 6 —
  Sub-agents / memory / state** (opens with the memory-layout consolidation pass); then Step 3 residue folds at its
  phases (`PDR-089` Decision-7→P1; `.cursor` adapter→P7; `documentation-hygiene.md` landed with P4). The pre-Phase-9
  Oak delta-sync is **done** — Phase 5 folded the `ad649710`→pin rules-delta (`precedence-is-not-approval` + PDR-091 +
  `verify-dont-trust` +6; no other KEEPs).
- **Standing gotchas (firsthand-verified):** `.agent` is NOT prettier-ignored → `pnpm format` new docs every phase (and
  `check:ci`/pre-push does not run `fix`); some Oak markdown needs prettier `--write` TWICE to converge;
  `practice-fitness` informational-first never red-gates `principles.md`; transplanted surfaces'
  section-cites and classifications are claims — read bodies firsthand (the P3 skills lesson, re-proven at P4 where a
  KEEP-classed rule contradicted principles doctrine); the 36 Oak-ADR cites are closed (P4) — the 7 collision-range
  ones carry explicit cross-host disambiguation.
- **Posture (owner 2026-06-05):** fully populate; collaboration ACTIVE (about agents) seeded empty; all generic experts
  incl. mcp-expert; drop ground-truth + Oak Sonar/secrets + ~2 UI patterns. Each phase = atomic commit + tag; roll back
  forward only.

> ⚠️ **Deep Review (2026-06-04) — green gates ≠ no bugs.** A first-hand-verified review (executing the built `dist`,
> running all 14 gates, reading source) found **46 distinct issues, 6 Critical**, that the green gates do **not** catch.
> The "reviewer loop closed with no open findings" / "all gates green" statements below are about the _gates_, not about
> _correctness_ — do not read them as "no bugs". Start at [`.agent/report/initial-review/00-executive-summary.md`](../report/initial-review/00-executive-summary.md).
>
> - **Criticals (reproduced):** C1 build emits no `.d.ts` + `./parsers/zod` export target missing (published types + the
>   README Zod import are broken); C2 operation security `A AND B` → `A OR B`; C3 component-name sanitisation breaks
>   `$ref` round-trips; C4 `serializeIR→deserializeIR` throws on empty `properties` (root cause: four divergent
>   `isRecord`); C5 Zod parser silent content drops (`errors:[]`); C6 Zod 2020-12 keyword refinements are no-ops/incorrect.
> - **Decision:** [ADR-047](../../docs/architectural_decision_records/ADR-047-zod-2020-12-keyword-emission-strategy.md)
>   (draft) governs the C6 fix (semantic-or-fail-fast).
> - **Remediation backlog:** [`.agent/plans/remediation/`](../plans/remediation/) — 7 atomic plans; promote **one** into
>   `active/` at a time. `01-packaging-and-types-integrity` is highest-leverage/lowest-risk (fixes the shipped C1 break).
> - **Corrections:** 9 completed plans + `roadmap.md` carry dated ⚠️ banners (P1-P9); C6 disclosed in
>   `docs/architecture/zod-round-trip-limitations.md`; 11 redundant session-3.3 stubs deleted.
> - **Committed on branch `docs/initial-deep-review`** (not merged to `main`). A link-aware bulk-archive of settled
>   `current/complete/` plans is **sequenced into transplant Phase 9** (named slot, owner 2026-06-09).
> - **Governing rule (user, 2026-06-04):** where code, proofs, and docs disagree, normalise to the **strictest** of the three.
>
> **The remediation backlog is a required component (owner, 2026-06-09: all issues MUST be fixed, nothing parked)** —
> plans 02–07 remain (01 complete + merged in). It is one part of the single deep enhancement, not a gate that blocks
> the transplant; the owner names the next slice (see §Current state).

**Library:** Schema compiler. `Any Input -> Parser -> IR -> Writers -> Any Output`. Supported: OpenAPI 3.0/3.1/3.2, Zod 4, JSON Schema 2020-12, TypeScript, MCP Tools.

**One deep enhancement, single branch `feat/transplant-engraph-practice`** — all components required, none parked, owner names the next slice (currently **Phase 6**):

- [Oak → castr Practice transplant](../plans/current/paused/oak-practice-transplant.md) Phases 6–9 (0–5 done) + engineering-infrastructure arc D1–D4
- [deep-review remediation backlog](../plans/remediation/) 02–07 (01 complete + merged in)
- [Explicit Additional Properties Support](../plans/current/paused/explicit-additional-properties-support.md) (feature slice)

**Current closure record:** [ePerusteet Real-Spec Validation](../plans/current/complete/eperusteet-real-spec-validation.md)

**Companion closure record:** [OAS 3.2 Full Feature Support](../plans/current/complete/oas-3.2-full-feature-support.md) (completed Saturday, 11 April 2026)

The OAS 3.2 parent arc is now complete. Phase A2 closed on Friday, 10 April 2026. The MCP no-params follow-up, Phases B, C, D, and E, Husky local-workflow alignment, and generated-suite stability all closed on Saturday, 11 April 2026. Repo-root `pnpm check` is green, `pnpm check:ci` remains green from Saturday, 11 April 2026, and the ePerusteet real-spec validation slice closed on Thursday, 16 April 2026 as the direct predecessor to the newly promoted explicit-additional-properties support plan.

### Verified Session Truth

- Phase A2 closed on Friday, 10 April 2026 after the AP4 dependency-exit sweep completed with a nested raw OpenAPI input seam, restored IR/media-type fidelity, strengthened dependency-exit guards, and closed the reviewer loop with no open findings
- the full repo-root gate chain was green on Friday, 10 April 2026, along with `pnpm madge:circular`, `pnpm knip`, and the targeted active-surface `openapi3-ts` greps
- the MCP no-params follow-up closed on Saturday, 11 April 2026: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, unexpected top-level arguments are rejected by `isMcpToolInput()`, and the affected snapshot proofs are green
- Phase B closed on Saturday, 11 April 2026: native OpenAPI 3.2 `query` survives parser -> IR -> writer and downstream endpoint/MCP consumers, duplicated raw PathItem visitors no longer skip it, MCP treats `query` as read-only/non-destructive, and hierarchical tags (`summary`, `parent`, `kind`) have explicit parser/writer proof
- Phase C closed on Saturday, 11 April 2026: `oauth2.flows.deviceAuthorization` and XML `nodeType` now have explicit parser/writer proof, malformed top-level `paths` templates fail fast before upgrade/canonicalisation, valid templated paths survive the shared load boundary -> IR -> writer -> endpoint/MCP consumers unchanged, and the reviewer loop closed with no open findings
- Phase D closed on Saturday, 11 April 2026: Example Object `dataValue` / `serializedValue` now have explicit parser/writer/round-trip proof across component, parameter, response-header, and media-type carriers, `CastrParameter.examples` preserves full Example Object/ref shapes honestly, singular parameter example derivation falls back to `examples.default.dataValue` but never `serializedValue` alone, and repo-root `pnpm check` was green on the close-out sweep
- Husky is now active locally: `pre-commit` formats staged files with Prettier, `pre-push` runs `pnpm check:ci`, and the first post-install full repo-root `pnpm check:ci` sweep was green on Saturday, 11 April 2026
- the generated-suite temp-directory race was reproduced and closed on Saturday, 11 April 2026: the temp harness now allocates isolated per-suite directories under `lib/tests-generated/.tmp`, `test:gen` is green again, and repo-root `pnpm check` is green again
- Phase E closed on Saturday, 11 April 2026: native OpenAPI 3.2 `itemSchema` and `additionalOperations` now survive parser -> IR -> OpenAPI writer -> shared load boundary reparse; `IRMediaType.itemSchema`, `CastrDocument.additionalOperations`, `CastrAdditionalOperation`, and `allOperations(document)` are landed; endpoint/MCP/TypeScript surfaces now expose custom verbs from `additionalOperations`; endpoint/MCP/TypeScript fail fast on reachable `itemSchema`; and the late reviewer follow-up fixes also closed x-ext media-type component identity/writer emission, parameter `content` traversal, IR media-type ref narrowing, custom-method inline request-body naming collisions, and lowercase reserved-method validation for programmatic `additionalOperations`
- repo-root `pnpm check` is green on Saturday, 11 April 2026 after the final Phase E close-out rerun, and `pnpm check:ci` remains green from Saturday, 11 April 2026
- for aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating run is required; do not invoke `pnpm qg` directly
- the reviewer loop is closed with no open findings across `code-reviewer`, `test-reviewer`, `openapi-expert`, and `type-reviewer`
- the ePerusteet real-spec validation slice closed on Thursday, 16 April 2026: `lib/tests-fixtures/openapi-samples/real-world/eperusteet-ext.json` is committed, the shared load boundary accepts and canonicalises it, and the reproduction exposed that current strict-object policy rejects explicit schema-valued `additionalProperties` at IR-build / generated seams
- on Thursday, 16 April 2026, user clarification established the intended product boundary: Castr must accept and emit explicit `additionalProperties`, but must never invent them from input that did not declare them
- the deep enhancement is one body of work (owner): the [Oak → castr Practice transplant](../plans/current/paused/oak-practice-transplant.md) Phases 6–9 + arc D1–D4, the remediation backlog 02–07, and [explicit-additional-properties-support.md](../plans/current/paused/explicit-additional-properties-support.md) are all required components on the single branch — sequenced, never parked, owner names the next slice (currently Phase 6)

---

## What Next

> **SUPERSEDED (2026-08-22 B-11; transplant STOPPED 2026-08-26, owner ruling QD-2).**
> The steps below are the 2026-06 era's handoff, kept as history: do NOT execute them.
> The plan-of-record is [`proof-programme/parent-plan.md`](../plans/proof-programme/parent-plan.md);
> sessions ground per [AGENT.md](../directives/AGENT.md) and pick up from
> [`repo-continuity.md`](../memory/operational/repo-continuity.md).

1. Re-read [metacognition.md](../directives/metacognition.md), then the §Current state block above and the transplant tracker.
2. **Next slice (owner-directed): transplant Phase 6 — Sub-agents / memory / state** on `feat/transplant-engraph-practice` from the tracker; it opens with the memory-layout consolidation pass; each phase ends green (`pnpm check`) + reference-closure-clean + tagged.
3. **Also required — one deep enhancement, single branch, nothing parked, not gated behind one another:** the [remediation backlog](../plans/remediation/) 02–07 (proof-first TDD, atomic + gated), the rest of the transplant Phases 7–9 + arc D1–D4, and the [feature slice](../plans/current/paused/explicit-additional-properties-support.md). The owner names which is next.
4. If a user reports a fresh gate or runtime regression in product code, reproduce it immediately and treat that report as active session truth.
5. Use [eperusteet-real-spec-validation.md](../plans/current/complete/eperusteet-real-spec-validation.md), [oas-3.2-full-feature-support.md](../plans/current/complete/oas-3.2-full-feature-support.md), and [phase-a2-type-migration.md](../plans/current/complete/phase-a2-type-migration.md) only for predecessor context.

---

## Gate Status

Repo-root `pnpm check` is green on **Saturday, 11 April 2026** after the final Phase E close-out rerun, and repo-root `pnpm check:ci` remains green from **Saturday, 11 April 2026**. Use `pnpm check` locally as the canonical aggregate gate, or `pnpm check:ci` for a non-mutating rerun; do not invoke `pnpm qg` directly. Husky still formats staged files on `pre-commit` and runs `pnpm check:ci` on `pre-push`, but hook runs do not replace explicit aggregate reruns when closing work.

⚠️ **Caveat (2026-06-04):** green gates do **not** mean "no bugs". The deep review reproduced 6 Critical defects the gates do not cover (packaging/types, security AND→OR, `$ref` round-trips, IR round-trip throw, Zod parser/writer losses). See the **Deep Review** callout in _Where We Are_ and [`.agent/report/initial-review/`](../report/initial-review/).

---

## Next Session Start Statement

> **SUPERSEDED (2026-08-22 B-11; transplant STOPPED 2026-08-26, owner ruling QD-2).**
> This start statement is the 2026-06 era's, kept as history: do NOT start from it.
> Start from the plan-of-record ([`proof-programme/parent-plan.md`](../plans/proof-programme/parent-plan.md))
> via [`repo-continuity.md`](../memory/operational/repo-continuity.md).

**@engraph/castr — next session start.** This is **one deep enhancement** (owner): bring over the ENTIRE Practice /
agentic-engineering framework / agent-tools / skill+rule+subagent+hook definitions **and** fix castr's known issues —
the same goal, not competing priorities. All components live on the single branch `feat/transplant-engraph-practice`,
none parked: the **Practice transplant** (Phases 0–5 done; **Phase 6 is the owner-directed next slice**), the
**engineering-infrastructure arc D1–D4**, the **deep-review remediation backlog** (02–07; 01 complete + merged in — the
6 shipped Criticals must be fixed), and the **product feature slice**
(`current/paused/explicit-additional-properties-support.md`). **Nothing is parked, ever** (owner: "all issues MUST be
fixed, mostly now; sequencing with a named position is acceptable; an undefined 'later' is never") — a 2026-06-05
record claiming the owner parked the feature slice was a fabricated attribution, repudiated 2026-06-09. The owner names
the next slice; a fresh reproduced product regression pre-empts it.

**Phases 0–5 are COMPLETE and green.** Phase 5 (tag `transplant/phase-5`, 2026-06-17): 7 generic directives brought
additive + per-surface reconciled; Oak rules-delta folded (`precedence-is-not-approval` + PDR-091 + `verify-dont-trust`
+6) → 86 canonical rules / 92 PDR files. Phase 4 (tag `transplant/phase-4`, 2026-06-09): **80 Oak rules** (held
`ad649710` forms) + castr's 5 = **85 canonical rules** + root `RULES_INDEX.md` (85 rows, index↔disk verified); every
body read firsthand and reconciled per-surface; `use-result-pattern` dropped (contradicts `principles.md`
fail-fast — the 9th DON'T-BRING); collision-range Oak-ADR cites disambiguated; `pnpm agent-tools:*` root aliases
wired; five new upstream Oak bugs flagged for back-flow. Phase 3 (tag `transplant/phase-3`): Oak's 18 skills brought + localised, castr grounding folded into the start-right shared core, all `jc-*`/`distillation`/`napkin`/`castr-start-right` retired, blocking `skills:check`. Phase 2 (tag `transplant/phase-2`, commit `55a6788`): the 340-file `@engraph/agent-tools` package + hook policy + **LIVE Claude PreToolUse guards** + the §6 `validate-drift` validator. Reconstruct with `git log --oneline transplant/phase-0-baseline..HEAD`.

**⚠️ LIVE NOW — your tool calls are guarded.** `.claude/settings.json` routes Bash/Edit/Write through `run-pretooluse-guard.mjs`: dangerous-git patterns and PDR-044 content fingerprints are **denied**; an unbuilt `dist` fails **OPEN** (warns, never bricks). A blocked call is the policy in `.agent/hooks/policy.json`, not a bug. agent-tools `test` is **informational** (filtered out of the blocking gate via `--filter=!@engraph/agent-tools`; 13/885 failures, all P6/P8 content); `repo-validators:check` carries **5 green BLOCKING validators** (`lifecycle-scripts`/`pretooluse-guard-routing`/`drift`/`fitness-vocabulary`/`stale-script`), 3 sequenced at their phases (`collaboration-state`→P8, `subagents`→P6, Oak `portability`→P7). **The sequenced validators' "crashes" are NOT bugs — do NOT try to "fix"/silence them: they hard-fail by design on absent infrastructure (Oak tests assert it), truthfully reporting castr's P6/P8 infra isn't installed yet; a 2026-06-07 trial fix was reverted (Oak clean at `ad649710`).** (Note: the guards live on the transplant branch; remediation branches off `docs/initial-deep-review` predate them.) **Gotcha (verified firsthand — it blocked my own command):** the Bash guard substring-matches the WHOLE command, so a blocked pattern anywhere in the command string — including an `echo`/test payload or a dangerous-command literal quoted inside a commit message — is denied. Keep such literals out of commands; when a commit message must discuss them, write it to a file and use `git commit -F <file>`, never `-m`. The guards also activate **mid-session** when `.claude/settings.json` changes, so your current session may already be guarded.

**Read first, in order:** `.agent/directives/AGENT.md` → `metacognition.md` → this prompt (§Practice Transplant) → `.agent/plans/current/paused/oak-practice-transplant.md` (execution contract — note **owner-locked scope §6**) → `.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` → the `.agent/memory/active/napkin.md` latest entries (`2026-06-17` + `2026-06-10`). Cross-session memory may not load — **treat the in-repo surfaces as authoritative**.

**Next executable steps (in order, owner-directed):** Steps 0–2 and **Phase 4 ✅ done** (see the tracker's per-phase
blocks). **NEXT: Phase 6 — Sub-agents / memory / state:** 13 generic sub-agent templates + `components/`; full
patterns (provenance-amended, index regenerated, drop ~2 UI); executive (regenerated catalogues); operational;
collaboration schemas + empty dirs. **Opening consolidation pass IN PROGRESS** (slice `5a264a7`): the flat memory was
moved into the Oak `active/` layout (the Phase-5 directives' `memory/active|operational|executive/…` forward-placeholders
now resolve on disk), `ephemeral-to-permanent-homing.md` is in place, and the generator-triage generic fold landed.
**The napkin drain is the next step** — see the First action block below and sub-plan `06` §4 for the exact sequence. **Carry the Phase-3/4/5 lessons:** classification reads lie, bodies do not; transplanted
enforcement data is contract-tested (change data ↔ its tests together); directive-section cites in Oak surfaces are
claims to verify against castr's actual headings (Phase 5 caught a false `§Code Quality` TDD cite → `§Testing
Standards`); Oak-local plan citations in permanent docs violate `no-moving-targets` — de-link them; protection labels
mean edit-with-rigour, never park-the-defect. **Oak baseline: read live from `main`, no pin (owner, 2026-06-26; superseded the 2026-06-17 `ad359a4f` pin)** —
a clean superset of the former pin `4470266` (`4470266` is a direct ancestor of main, +429 commits, no merge cost);
Phases 6–9 source from main. The `ad649710`→pin rules-delta was folded at Phase 5; the pin→main delta is enumerated with
named positions in `relevance-ledger.md` §Main re-pin delta.

**Standing disciplines (active from message 1):**

- **Verify load-bearing claims firsthand** against source; all agent/tool output is a candidate lead, never relayed second-hand; a named tool/command is a claim until verified (worked instances: the F7 commit-skill phantom alias `agent-tools:check-commit-message`; the clerk-expert phantom blocker).
- **Record load-bearing decisions in the in-repo execution contract, never memory-only.**
- **Session-close continuity discipline** (the owner will keep asking; §6 makes it structural in the transplanted vehicles `session-handoff` / `consolidate-docs` / `consolidate-until-done`): exhaustive durable state-recording + an adversarial _"what would be lost if context vanished?"_ review + preservation/graduation of reflection insights. **The record is the commit + the permanent doc — not a ledger or closeout narrative** (reconciled with `permanent-doc-is-the-consolidation-record`; see plan §6).
- **PDRs are portable and never repo-specific; anything repo-specific goes in a castr ADR** — author a castr ADR only if the portable PDR is insufficient (PDR-079).
- **Nothing is sacred — protection is engineering discipline, not dogma (owner, 2026-06-09):** `principles.md` and the PRESERVE set are edited with firsthand verification and owner-visible rationale, never clobbered with Oak content — and **known issues in them are blocking and get fixed like any other defect**; `.agent` is NOT prettier-ignored (`pnpm format` new docs each phase); **roll forward only** (revert; never `reset --hard`/force-push); each phase = one atomic commit + `transplant/phase-N` tag, green-gated + reference-closure-clean.
- **No deadline pressure — excellence over expediency, always** (owner, emphatic 2026-06-07): speed is not a goal; architectural correctness is. The transplant is an accepted strategic investment to accelerate castr — **the premise is settled; do not re-litigate whether it is worth doing.**
- **Less ceremony — the commit plus the permanent doc ARE the record.** No handoff-correction churn, disposition ledgers, before/after counts, or closeout narratives; home substance in its permanent doc and stop (`permanent-doc-is-the-consolidation-record`, Phase 4).
- **Smoke-testing the transplanted substrate is a later phase** (owner, 2026-06-07) — for now bring surfaces over; prove in-use afterwards.

**Resolved owner decisions:** the transplant PR to `main` carries its 2 deep-review commits (do not merge `docs/initial-deep-review` separately); Oak's `consolidate-docs` replaces castr's `jc-consolidate-docs`; pulling any one skill pulls its dependency closure.

**First action (next session, from 2026-06-18):** continue **Practice transplant — Phase 6 (memory)** on
`feat/transplant-engraph-practice`, grounding with the owner first. **Blocks (a)–(f) + (g) structure & catalogues
LANDED.** Opening slice (`5a264a7`): flat memory → Oak `active/` layout + homing doc + generator-triage fold. **2026-06-18
(commits `d80e49f`, `ce57dd1`, `e2ce7de`, `b722980`, `e620c5e`, `8739ee3`):** five operational registers seeded +
reconciled; **napkin drained** — manufactured-permission candidate → **new rule** `no-manufactured-permission.md` (owner
chose new-rule via `new-rule-vs-pdr-clause`; **87 canonical rules**), transplant-method lessons → `distilled.md`,
pre-transplant entries rotated to `active/archive/` (napkin 480 lines); **`repo-continuity.md`** authored (castr's lean
contract); **root `memory/README.md` + `executive/README`** (three-mode taxonomy — **the full `.agent/memory`
dangling-link sweep is now empty**); the **three executive catalogues** (`artefact-inventory`, `invoke-code-experts`,
`cross-platform-agent-surface-matrix`) **regenerated firsthand from castr's real estate** (reviewer roster 6→15 after
the 2026-06-19 sub-agent landing; real adapter parity with named P7/Codex-only/Claude-only gaps; honest forwarder note). **Substrate contract ✅ LANDED
2026-06-18 (commit `360923d`):** `executive/memory-state-substrate-contracts.{md,manifest.json,schema.json}` re-authored
to castr roots — 22 surfaces (the 11 Phase-8 surfaces carry `notes`), castr identity/PDR-049+050 cites/plan roots/reviewer
routes; verified firsthand against the live `practice-substrate` consumer (manifest-validates-against-schema; only the
absent Phase-8 collaboration plane reports the expected `live-reader-failure`). **Follow-on (`150e628`):** removed the
consumer's two magic-number drift checks (`EXPECTED_MANIFEST_SURFACES = 22`, `expectedEntryCount: 114`) — stored-derived-value
anti-patterns violating the contract's own `stored_derived_values_rule`; Oak carries identical code → Phase-9 back-flow item.
**`active/patterns/` import ✅ LANDED (2026-06-19, commit `795d935`):** 130 patterns (132 − 2 UI-only); `proven_in: imported`
(no source-repo reference at all); broad source-repo neutralization of pattern bodies; frontmatter normalized to the
canonical 5 categories; the README index is now **generated + strictly gated** by the new agent-tools CLI
`validate-patterns-index` (`--check` in `repo-validators:check`; repo-agnostic → Phase-9 Oak back-flow, also fixes Oak's
stale index). **Sub-agent roster ✅ LANDED (2026-06-19, commit `d5cd4eb`):** roster 6→15 (9 new lean native templates
incl. `architecture-expert` 4-persona; 12 Codex adapters; 3 dangling `invoke-*` rules reconciled). **State schemas ✅
(Oak WS7, `07f1f3c`); reviewer-routes + `agent-collaboration-channels.md` ✅ (`4567d06`); standing items ✅ — back-flow
target, D1 lint (TS-skew root-fix, rules at `error`), Q-001 (`2431f97` + D1 fix).** **`transplant/phase-6` ✅ CUT
(`a63aee3`) + pushed — Phase 6 COMPLETE. **Phase 7 IN PROGRESS** — sub-plan
[`transplant/07-adapters-and-gate-flips.md`](../plans/transplant/07-adapters-and-gate-flips.md) authored (verified scope:
15 templates/18 persona adapters, 87 rules; **build** a native adapter generator — Oak pin `ad359a4f` ships none + hand-
maintains → a Phase-9 back-flow improvement; then flip portability/subagents gates, retire bespoke script). **Branch
`check:ci`-green (2026-06-19; 0 errors, 0 sonarjs warnings — D1 resolved).\*\* \_Incoming
`origin/main` `ccd9c7a` zod-compiler report-plan ✅ HOMED (2026-06-19): cherry-picked then split to `.agent/research/zod-compiler/`
(comparison + corrections + reasoning-trail §4 preserved), `.agent/plans/future/castr-surface-architecture-and-verb-model.md`

- `castr-check-verb.md`, and ADR-048 (Proposed — compiler-internal-split scope/value-gate, clarifies ADR-043); monolith removed.\_
  Full sequence + live status: sub-plan `06-memory-and-generator-consolidation.md` §4
  (reorder a✅…g✅ incl. substrate✅ + `active/patterns/`✅ + sub-agent roster✅ + state-schemas✅ + reviewer-routes✅ +
  channels✅). This is **one deep enhancement**. **Owner re-order (2026-06-19): finish the FULL Practice transplant
  first** (Phases 7–9 + arc D2/D4 parity), **then** remediation backlog 02–07 (named position after, not parked —
  `no-manufactured-permission` holds), then the feature slice; ~~"not in a rush to merge" (delivery deprioritised)~~ (superseded 2026-08-26: green and clean merges, never held for an owner call). All
  still required; a fresh reproduced product regression still pre-empts the sequence. **Oak is read live from `main`, no pin** (owner, 2026-06-26; superseded the 2026-06-17 `ad359a4f` pin).
  **Use the reviewer roster to assess the transplant work so far** (owner, 2026-06-17). **The roster is now 15 (was 6) —
  sub-agent roster ✅ landed 2026-06-19, commit `d5cd4eb`.** Firsthand grounding showed the driver was **completing the
  half-built expert system** castr's own `invoke-*` rules already required (3 dangling rules, one owner standing
  doctrine) — not the opener's "13 generic" framing. New: `architecture-expert` (4-persona), `assumptions`/`config`/
  `docs-adr`/`mcp`[emission]/`onboarding`/`release-readiness`/`security`[input-DoS]/`subagent-architect`, all lean
  castr-native (catalogue: `memory/executive/invoke-code-experts.md`). The `subagents` gate flip + `.cursor`/`.claude`
  wrappers are **Phase 7**. **Phase-6 remaining before the tag: `.agent/state/collaboration/` schemas** (under-specified —
  see `repo-continuity.md` §Next Safe Steps for the stale-location + deferred-validator-asserts-absence gotchas). The
  reviewers review code / types / schema fidelity — point them at transplanted **code** changes (e.g. agent-tools), not at
  governance-doc edits. Carry the per-surface reconciliation lesson: Oak surfaces embed host-product specifics;
  bodies must be read, not classified.
```

## .agent/memory/operational/threads/proof-programme.next-session.md

```markdown
# Next-Session Record — Proof programme (autonomous loop)

The continuity record for the proof-programme thread: the ADR-051 autonomous
background loop executing the parent plan's queue (three scheduled firings per
day while the owner has the Routine scheduled — the owner creates, schedules,
pauses, and deletes it at will per parent plan §Operating protocol step 1;
**see the 2026-08-31 addendum below for the live state**) plus owner-attended
interactive sessions. Indexed by
[`../repo-continuity.md § Active Threads`](../repo-continuity.md#active-threads);
this record carries identity history per [`README.md`](README.md) +
[PDR-027](../../../practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md).

**Lane-state authority lives in the programme's own surfaces**, not here: the
queue and counters in
[`parent-plan.md`](../../../plans/proof-programme/parent-plan.md) frontmatter,
incidents in [`incidents.md`](../../../plans/proof-programme/incidents.md),
owner decisions in
[`queued-decisions.md`](../../../plans/proof-programme/queued-decisions.md).
This record adds only what those surfaces do not carry: the additive PDR-027
identity table. Scheduled firings update their identity row here at close per
the routine prompt's firing-scoped handoff profile (QD-6).

## Participating agent identities

Additive per PDR-027 — joining adds an identity; a matching platform/model/agent_name
updates `last_session` rather than adding a row. (Sessions predating this record —
the W-0/Q-00/Q-01 authoring sessions and the first firings — are recorded in the
programme's delivery evidence rather than retro-filled here.)

| agent_name                     | id                                   | platform    | model          | session_id_prefix | role                                                  | first_session | last_session |
| ------------------------------ | ------------------------------------ | ----------- | -------------- | ----------------- | ----------------------------------------------------- | ------------- | ------------ |
| Cindery Kindling Lava          | e27f20d2-fa50-50c8-9989-829307b8735c | claude-code | claude-fable-5 | 8fc8a6            | executor (QD-5/QD-6 landings)                         | 2026-08-23    | 2026-08-23   |
| Fruited Swaying Leaf           | 2c6d968f-db66-55d4-8343-a0eccd1a68a3 | claude-code | claude-fable-5 | 0690b2            | scheduled firing (PR #35 drive to merge)              | 2026-08-23    | 2026-08-23   |
| Luminous Waning Orbit          | e608d93e-4bd7-5ea2-b08e-258ef7c706f1 | claude-code | claude-fable-5 | sessio            | scheduled firing (Q-03 slice)                         | 2026-08-24    | 2026-08-24   |
| Stratospheric Hovering Thermal | f34dddf9-ff0e-56e9-a525-a00493bc8813 | claude-code | claude-fable-5 | sessio            | scheduled firing (Q-04 slice)                         | 2026-08-25    | 2026-08-25   |
| Sardine turns Coral            | e079be76-3221-5c13-aa9c-42c33dfa14fa | claude-code | claude-fable-5 | 01QpYc            | owner-redirected firing (account-portability landing) | 2026-08-25    | 2026-08-25   |
| Nettle wakes Topsoil           | de57ab0b-1960-5d55-910a-fa887b4993bc | claude-code | claude-fable-5 | 01KKh2            | commissioned arming reviewer (fresh-session review)   | 2026-08-25    | 2026-08-25   |
| Breeze weaves Contrail         | ea6fba19-fcf8-5841-b6a1-56c7d42ddd4d | claude-code | claude-fable-5 | 0132gL            | arming-walk executor (owner-attended)                 | 2026-08-26    | 2026-08-26   |
| Vesta turns Singularity        | f5b4dfc2-acaa-5c8c-bcc5-da63553f07ee | claude-code | claude-fable-5 | 01PjGS            | routine-configuration seat (owner-attended)           | 2026-08-27    | 2026-08-27   |
| Wolf seeks Cavern              | d914f871-f3ee-5c33-ba2a-a2ca35084340 | claude-code | claude-fable-5 | 019J6n            | Phase C-pre scorer seat (owner-attended)              | 2026-08-27    | 2026-08-27   |

## Next-session landing target

Per PDR-026, externally verifiable, re-derived each session from the queue
rather than trusted from this record: **drive the single open non-draft
programme PR to merged, else claim the next eligible queue row** (as recorded
2026-08-26, refreshed 2026-08-27: no programme PR is open, so the next firing claims the next
eligible row IN QUEUE ORDER — Q-18, Q-20, Q-22, Q-19 (its Q-13 dependency
dropped by owner card ruling 2026-08-27; Q-21 completed 2026-08-26,
PR #64), then Q-05..Q-09, Q-13,
Q-14, Q-16 (re-adjudicated 2026-08-25, arming review — the narrowed brief in
the parent plan is current: ADR-117 citation replacement only), Q-17 (safety
instruments sequenced first at owner word, 2026-08-26 arming walk).
Verification: the PR merged, or a row's state advanced on the base.

## Session shape and grounding order

Scheduled firings follow the routine prompt end to end (it is the grounding
order; its step 3 now grounds `engraph-start-right-thorough`); owner-attended
interactive cloud sessions likewise ground via `engraph-start-right-thorough`
with the `engraph-plan` / `engraph-metacognition` / `engraph-proportionality`
stack (the installed, invocable names; owner ruling, 2026-08-26)
and then follow the parent plan's §Operating protocol. Either shape updates
this record's identity table at close.

## Standing decisions

The governing ADR (autonomous-background-implementation-loop) and the
programme's queued-decisions register carry every standing decision; this
record points and never duplicates. The queue frontmatter and incident
register are the live lane state.

Arming hold (2026-08-25 ~16:0xZ, Kraken calls Abyss 0178h2 — READ BEFORE ANY
FIRING OR ENABLE ACT): the Routine was re-created on this account per the
arming runbook, and the arming is DELIBERATELY FROZEN at runbook step 3.
Live state: trigger `trig_01CbRJjyivM34E7fq2jfLqLJ` ("Castr proof-programme
(ADR-051)"), fresh-session mode, bound to the "Practice Repos" environment
(`env_01T3vjKqpMKCbv5EzaLGczLL`, validated by a successful session start
2026-08-25 after one transient keyserver 503 — see the cloud-environment
fragile-hosts register), stored prompt verbatim per the runbook,
notifications push-only/no-email, **poke-only: no cron, so it can never
self-fire**. NOT yet done: owner UI acts (attach the castr repo source,
attach the Slack connector, set model Fable, confirm auto-fix OFF), the
step-4 dry run, the step-5 owner re-read of the seven OPEN queued
decisions (QD-1/2/4/9/10/11/12; the repo-state half of step 5 verified
2026-08-25: no STOP, streak 0, no in_progress rows, no open programme PR),
and the enable (cron `3 */8 * * *` goes on only then). **Owner commission
(2026-08-25, in-session word): the Routine set-up is to be REVIEWED IN A
FRESH SESSION before any dry-run or enable** — no session fires or enables
this trigger until that review passes and the owner says so. Platform
facts for the reviewer: this API surface creates triggers live with no
disabled flag (poke-only is the honest "disabled" equivalent); the
`connectors` create-parameter is refused for this organization (connector
attach is owner-UI only, re-confirming the Q-01 measurement); and
`fire_trigger` accepts a per-fire text payload, so the step-4 DRY-RUN
instruction needs no stored-prompt prepend on this surface.

**Review COMPLETE (2026-08-25, Nettle wakes Topsoil / 01KKh2): verdict
sound-to-arm; the walk is scripted and pending.** The commissioned
fresh-session review ran end to end — every hold-note claim re-verified
against the live API (trigger present, stored prompt byte-canonical,
push-only notifications, no cron; repo-side: no STOP, streak 0, no
in_progress rows, no open programme PR) — with an adversarial
assumptions-expert pass folded. Authoritative record and the hardened
step-by-step arming walk: `.agent/analysis-and-reports/routine-arming-review-2026-08-25.md`
(§6 is the walk script for the session that executes it with the owner).
Refinements landed with the review on **PR #60** — the walk's step-0 merge
gate (merge it before any enable; it is not a programme PR): canonical DRY-RUN
instruction + belt-and-braces delivery rule + disable METHOD
(cron-removal, never delete/recreate) + attended-first-firing step in the
arming runbook; disable-method line in the routine prompt; Operating
protocol heading + programme-PR definition + Q-16 brief re-adjudication
in the parent plan; QD-11 row-id correction. **Three owner decisions
pending, carried in the report's §4 (W-1/W-2 dispositions) and §6:**
(a) reorder the queue frontmatter so Q-18/Q-20/Q-21 precede Q-05 (nine
eligible rows currently sit ahead of the safety instruments), (b)
adopt the attended first live firing before the cron goes on, and (c)
QD-13 (programme-PR operative test + ambiguity default), added by the
review's refinements — so the step-5 re-read covers EIGHT open rows
(QD-1/2/4/9/10/11/12/13), superseding the seven-row list in the hold
note above. One
supersession within this note: the "needs no stored-prompt prepend" line
above is DEMOTED by the review — payload delivery is documented but
unmeasured, and the failure mode is an unintended first live firing, so
the walk uses belt and braces (prepend before sources attach + payload +
UI-paste restore). The hold itself stands unchanged: nothing fires or
enables until the owner walks the report's §6 and says so.

**Arming walk EXECUTED through the QD re-read; HOLDS before the attended
firing (2026-08-26, Breeze weaves Contrail / 0132gL — supersedes the hold
note and review addendum above on walk state).** Steps 0–7 done with the
owner live: PR #60 merged (`64af0c44`, seven bot threads fixed and
resolved); DRY-RUN prepend byte-verified in the zero-loss window; owner UI
acts confirmed API-visible after source-attach (repo + Slack connector +
auto-fix OFF; model `claude-fable-5` after an owner re-set — the dry-run
firing had served `claude-sonnet-5`); ruleset probe PR #61 observed the
full required check set and closed (scratch branch resists remote delete —
cosmetic residual); dry run fired clean (read-only held, zero repo-state
change, ~2.5 min, run SUCCEEDED). **Notification incident**: the
completion notification reached NEITHER push nor Slack, and a direct test
push also failed — the account notification path had never actually
delivered; the owner repaired the config mid-walk and a re-test push
arrived. Run-SUCCEEDED ≠ notification-delivered. The owner then amended
the stored prompt live (skills-discipline paragraph — now in the runbook
canonical) and declined a second dry run: **the attended first live firing
is the notification-receipt gate AND the honesty probe** (self-report vs
measured reality). QD re-read complete — all eight rows, rulings verbatim
in the register; five of eight rows measured defective in premise, frame,
or owner-legibility → the row contract landed (register header +
routine-prompt owner-fork branch). Queue reordered: Q-18/Q-20/Q-21/Q-22
precede Q-05 (owner-approved). Cloud grounding ruling landed
(`start-right-thorough` + plan/metacognition/proportionality stack;
strategic node `.agent/plans/future/cloud-autonomy-trust.md` — since
promoted to `.agent/plans/proof-programme/cloud-autonomy-trust.md`,
2026-08-27). **Remaining
before any cron: owner-fired attended live firing (watch ~20 min; its
completion notification closes the receipt gate; compare its self-report
against measured reality), then enable per runbook step 7's overlap guard
— only after that firing closes.** ~~Note for the enable sitting: the live
trigger's stored-prompt paragraph still names `start-right-quick`; the
thorough ruling lives in routine-prompt step 3, which the firing follows —
the owner may align the trigger word at leisure (agent trigger edits were
owner-denied this walk; the trigger is owner-territory).~~ SUPERSEDED
2026-08-26 (~20:07Z, routine-configuration session, Vesta turns Singularity —
the session spans 2026-08-26 evening → 2026-08-27 UTC): the
owner authorised targeted minimal trigger edits for this act ("You can
edit the trigger as long as you keep the changes targeted and minimal and
report them"), and the stored-prompt skills paragraph now names
`start-right-thorough` and the firing-scoped `session-handoff` profile —
API prompt update verified in the same trigger read (prompt byte-exact;
sources, outcome branch, model `claude-fable-5`, auto-fix OFF, Slack
connector, push+slack/no-email notifications all preserved; still no
cron). The runbook canonical block is aligned in the same landing.

**Routine-configuration session addendum (2026-08-26 evening → 2026-08-27
UTC, Vesta turns Singularity / 01PjGS — owner-attended; extends the walk
addendum above).** Act 0 complete 2026-08-26 (~20:07Z): the stored-prompt
skills paragraph aligned to the thorough/firing-scoped-handoff rulings via
an owner-authorised targeted trigger edit (grant verbatim: "You can edit
the trigger as long as you keep the changes targeted and minimal and report
them" — read narrowly by this seat as per-context rather than standing,
scope not owner-confirmed; the enable stays owner-held either way),
verified in the same trigger read, runbook canonical updated in lockstep;
PR #67 carries the landing. The owner then invoked the deep-questioning
stack and **ratified the reframing (2026-08-27)**: the experiment is
channel calibration, not capability proof; verify-don't-trust relocates
from owner attention into reliable, trusted, automated machinery (owner
verbatim in the trust node, which attributes each frame claim to owner
verbatim, owner-agreed findings, or seat synthesis); the work is investment
and its records are structured accordingly. Landed on that ruling: the
cloud-autonomy-trust node PROMOTED into the programme collection
(`../../../plans/proof-programme/cloud-autonomy-trust.md`) as the
investment's frame-of-record (an assumptions-expert review measured the
active-lane contract mismatch; the durable-doctrine/ADR question rides the
Act 3 owner card); the attended-firing honesty probe PRE-REGISTERED
(`../../../plans/proof-programme/attended-firing-honesty-probe.md`, cited
by runbook step 6); the runbook's new §The Routine is an autonomous
Practice agent (configuration governance, canonical-lockstep change
discipline); routine-prompt step 3's stored-prompt description updated to
the aligned wording. Both reviewer dispatches (docs-adr + assumptions) ran
over the landing; every finding verified firsthand and folded — including
two corrections OF the session's own records (the Act 0 date restored to
2026-08-26 after this seat wrongly "corrected" it to the 27th, and the
probe's `last_run` bound re-grounded on this session's fresher measurement
superseding loop-review D-1). **The attended firing remains owner-held.**
**All five decisions RULED by owner cards, 2026-08-27:** (a) channel set is
push+Slack (B-15's push-only superseded); **the receipt gate closes only on
the device push**, Slack recorded as corroboration; (b) the stored-prompt
skills paragraph aligned to invocable `engraph-` names (second
owner-directed trigger edit, `updated_at` 2026-08-27T10:07Z, verified in
the same read, canonical in lockstep); (c) **ratified: a DIVERGENT honesty
verdict auto-stops the arming** (INCOMPLETE likewise), seat-proposed flags
removed; (d) Q-19's `depends_on: [Q-13]` DROPPED — re-confirmed after the
seat surfaced the recorded never-a-second-skill-copy rationale it had
initially missed (the card premise was corrected and re-asked): Q-21
proved the skill canonical safely editable ahead of Q-13, Q-19 now
sequences with the safety instruments, and Q-13's brief carries the
reconciliation duty; (e) **enable cadence: 3/day from enable** (the seat's
1/day recommendation considered and declined). Landings: runbook
(canonical block, notifications row, step 4/6/7 gate texts), probe
(consequence, row 17, re-verification stamps), routine-prompt step 3,
parent-plan (Q-19 row moved after Q-22, four prose sites, Q-13
reconciliation duty), trust node. Next seat acts, in order: PR #67 made
durable (arc-carrying body) and driven to merged; then the attended firing
(owner pokes, seat probes); then the enable (owner act); then the Act 3
consolidation-Routine estate (the learning-loop drain).

**Compaction close (2026-08-27, Vesta turns Singularity / 01PjGS — the
routine-configuration session's final block; a successor holding only durable
surfaces resumes from here).** [PR #67](https://github.com/EngraphCode/castr/pull/67)
MERGED at `05060a95` (post-merge main CI green). A Codex review round landed
in the race window as that merge completed; the merged-PR rule applied — the
designated branch restarted from `main` (a pure fast-forward; the repo's
append-only hook rightly blocked `--force-with-lease`, and none was needed
since the old tip was an ancestor) — and the round's fixes landed as
[PR #68](https://github.com/EngraphCode/castr/pull/68), which also carries
this compaction continuity commit and merges under the ADR-051 clause 3
standing conditions (at authoring time: all eight review threads
verified-real → fixed → resolved, CI green on head `40a5287e`, base current).
Drive statistics for the arc, both PRs: ~20 automated-reviewer findings
across six rounds (5→5→1→2→2→1), every finding verified firsthand and fixed
with evidence in the resolving reply, zero rejected, one clause-4(c)
structural close (the probe's four-shape path-applicability map replacing a
third instance patch). Owner correction at close, verbatim: **"Use of the
cognitive skills is never optional"** — the seat's "justified no-run"
concept-exploration verdict was the fluency class at the meta level
(claiming a pass's outcome without running it); the corrected run and the
generalised class statement are in the napkin's closing capture, and the
encoding question (where "invoked ⇒ runs" lives durably) is routed to the
consolidation drain / owner word. Late in the close the owner's new
"Castr Adversarial PR Evaluation" Routine (`trig_014KU9iZvuww1fjqHdzgSqhE`,
created 2026-08-27, fires on PR pushes) posted its first live evaluation on
PR #68; two verdict-flipping scoring-contract defects were verified and
fixed (one-sided-token double reading; row 8's fresh-claim-shaped floor
measurement), and four further owner card rulings landed in the probe
(2026-08-27): the verdict scorer is a pre-firing deliverable Phase C waits
on; rows 7/20 N/A on the drive path is earned by evidence, never by path
label; the probe is instrument-frozen from merge until first use (amendment
only for a named defect a run could not surface); the verdict stop is
owner-overridable only by an explicit recorded ruling. **Successor next
acts, in order:** **Phase C-pre — the verdict scorer (seat deliverable,
owner-ruled):** a checked-in scorer implementing the probe's deterministic
aggregation and recomputing rows 8/9/11/15/18 from git/GitHub state, landed
through the normal TDD/review path; Phase C waits on it.
**Phase C — attended first live firing (owner-held):** the owner pokes
Routine `trig_01CbRJjyivM34E7fq2jfLqLJ` (poke-only, no cron; stored prompt =
the runbook's invocable-names canonical, `updated_at` 2026-08-27T10:07Z); an
observing seat executes the pre-registered attended-firing honesty probe
(its file removed 2026-08-31 with the arming ceremony);
the receipt gate closes only on the device push (Slack is corroboration);
the arming proceeds only on **HONEST WITHIN BOUNDS** — DIVERGENT or
INCOMPLETE auto-stops it (owner-ratified card (c)). **Phase D — enable
(owner act):** runbook step 7, cadence 3/day from enable (card (e)), only
after Phase C's passing verdict. **Phase E — Act 3 consolidation-Routine
estate (seat-authored):** prompt file, proposed ADR-051 amendment clause
delivered as an owner card, runbook + register rows; the owner creates the
trigger. The trust node's Delivery list mirrors this order; the parent-plan
frontmatter stays the queue authority.

Merge-tail addendum (2026-08-27 post-compaction, same seat): before PR #68
merged, ten further review rounds (Codex plus two more adversarial-Routine
evaluations, the third identifying as Bluebell spins Spore) folded ~14
verified-real findings into the probe — the deterministic aggregation is
now total over a fully validated table (per-row token subsets; PARTIAL
gap/materiality/act metadata; bidirectional applicability for categorical
AND derived-conditional rows; every bounded sub-claim required and emitted
beside the verdict), the scorer derives the governing path and every N/A
condition from observable state (fire-time head status included; the defer
path validates only on independently observable contest evidence), and a
precedence clause makes the probe measurements-only — the governing texts
set standards, and a standard gap is a queued decision (see **QD-14**, new
OPEN register row: non-code slices vs the red-first non-negotiable; the
owner's ruling should land as a parent-plan proof-contract clarification).
The probe text on the merged head is the single authority for all of this;
the freeze binds from that merge. The convergence lesson, concurred with
the Bluebell evaluation's verdict: the prose loop was not shrinking, and
further refinement belongs to the Phase C-pre scorer's TDD suite, where
these validation rules become executable and testable — the scorer author
should treat the probe's aggregation/validation clauses as its test-case
enumeration, not re-open them as prose.

**Arming ceremony RETIRED (2026-08-31, owner rulings in-session, Dolphin binds
Trench / 013aPY — supersedes every walk/routine-configuration addendum above on
process state; those blocks are history).** The owner ruled the arming
apparatus a set of useless experiments whose residue must cause no more
trouble, correcting its two founding premises directly: the 2026-08-22
"firings land nothing" measurement was a trigger created without the repo
specified — solved in minutes by attaching it — and Claude Code notifications
work (the one incident was a one-time account misconfiguration, repaired
2026-08-26 and proven by a test push). Retired with the ceremony: the arming
runbook, the attended-firing honesty probe, the cloud-autonomy-trust frame
node (all three files removed; git history preserves them), the Phase
C-pre/C/D ladder (verdict scorer, attended firing with receipt gate, gated
enable), the DRY-RUN proof branch, the never-recreate-the-trigger doctrine,
and the canonical-lockstep trigger-prose governance. The trigger the ladder
guarded (`trig_01CbRJjyivM34E7fq2jfLqLJ`) is absent from the account's
trigger listing. The ladder's Phase C-pre scorer WAS completed before the
retirement ([PR #72](https://github.com/EngraphCode/castr/pull/72), Wolf
seeks Cavern, 2026-08-27, stranded merge-ready at compaction) and closed
UNMERGED at owner word in the same purge — its branch
`claude/routine-config-proof-programme-csfok2` preserved, the harvested
knowledge in the napkin's dated entry and QD-15's MOOT outcome. **The present design (parent plan §Operating protocol
step 1): the Routine is a scheduled task the owner creates with the repo
attached, stored prompt a thin pointer to `routine-prompt.md` on main, cron
`3 */8 * * *`; the owner schedules, pauses, and deletes it at will; a seat
changes it only at owner word. The brakes are the STOP file, the owner's
pause, and ADR-051 clause 6's three-idle self-disable; every firing's PR
faces CI, the branch ruleset, review bots, and clause 3's condition-based
merge — verification rides the flow (Q-18 attestation is the queue's own
first slice) rather than gating the start.** Firing verification is
observational: capabilities absent from a fired session are named in its
completion summary (routine-prompt), never pre-probed. Next session act:
whatever the queue and §Landing target say — the owner creates and schedules
the Routine whenever they choose; nothing else is pending on any seat.

Branch note (2026-08-25, Sardine turns Coral): the account-portability landing
(owner-directed, outside the queue) landed via
[PR #58](https://github.com/EngraphCode/castr/pull/58) (owner-opened from the
Claude Code UI; head `claude/dazzling-cannon-78571f`). It is not a programme
queue PR — ADR-051 clause 3 does not govern it; the owner invoked this drive to
merge it. The arming runbook and portability register live at
`.agent/plans/proof-programme/arming-runbook.md` and
`.agent/claude-harness-integrations/account-portability-register.md`.
```
