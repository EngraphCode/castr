# Plan (Paused): Transform Proof Budgeting and Runtime Architecture Investigation

**Status:** Paused  
**Created:** 2026-03-09  
**Last Updated:** 2026-03-10  
**Predecessor:** Emerged from Zod limitations architecture investigation  
**Related:** `../complete/strict-object-semantics-enforcement.md`, `./recursive-unknown-key-preserving-zod-emission-investigation.md`, `./zod-limitations-architecture-investigation.md`, `docs/architecture/zod-round-trip-limitations.md`, `ADR-031`, `ADR-032`, `ADR-035`, `ADR-040`, `../complete/type-safety-remediation.md`

---

**Paused On:** 2026-03-09  
**Pause Reason:** This companion investigation remains paused while [int64-bigint-semantics-investigation.md](../../active/int64-bigint-semantics-investigation.md) is the primary active plan. Pull this companion work forward only if transform-proof runtime questions become the highest-leverage blocker again.

## Baseline Hygiene Update (2026-03-10)

Since this plan was paused, the gate-warning cleanup slice completed:

- `lib/tests-transforms/__tests__/doctor.integration.test.ts` no longer prints diagnosis summaries to stdout
- `lib/tests-transforms/__tests__/scalar-behavior.integration.test.ts` no longer prints exploratory Scalar verdict logs
- `pnpm character` now suppresses the known expected Scalar unreachable-URL stderr diagnostic

Future runtime investigation should therefore treat current transform and characterisation output as signal-bearing test/gate output rather than historical logging noise.

## Summary

This plan is for **investigation and architectural decision-making only**. Do **not** start product-code remediation in this plan unless a later user explicitly asks for implementation after the investigation is complete.

The goal is to help the next session determine:

1. how heavy transform proofs should be scheduled and budgeted without weakening strictness
2. whether current transform-suite instability is caused by test-harness contention, architectural cost in product code, or both
3. which performance and runtime costs belong to the opt-in doctor pipeline, which belong to the main transform path, and which are accidental setup churn
4. what durable architectural response should be promoted into ADRs, permanent docs, or a follow-on implementation plan

This remains a **companion investigation** to the broader Zod limitations workstream and the completed [strict-object-semantics-enforcement.md](../complete/strict-object-semantics-enforcement.md) slice. The plans should still inform each other:

- the Zod limitations work may surface legitimate structures that require heavier transform proofs
- heavy transform-proof runtime may obscure whether a limitation is architectural or merely expensive to prove
- the strict recursive Zod output work may overlap with runtime-construction and validation-cost questions

---

## Intended Impact

The next session should leave the repo with:

- a clear distinction between **contention**, **algorithmic cost**, **setup churn**, and **actual leakage**
- an explicit scheduling and timeout-budget strategy for transform proofs
- a list of confirmed non-test runtime architecture issues, if any, with severity and likely remediation shape
- durable documentation or a follow-on implementation plan for any architectural changes that should actually be made

We are optimizing for **strict proofs that stay trustworthy and affordable**, not for hiding problems behind larger timeouts.

---

## Scope

In scope:

- transform-suite scheduling, worker concurrency, and timeout-budget strategy
- cost analysis of heavy transform proofs, especially `doctor.integration.test.ts`
- architecture of the doctor pipeline under `lib/src/shared/doctor/`
- repeated setup costs in transform-adjacent runtime paths such as Zod parsing and generation
- cross-linking findings back into the Zod limitations investigation when they materially affect limitation analysis

Out of scope:

- weakening transform proofs
- skipping, quarantining, or de-scoping strict proofs as a convenience
- product-code implementation of performance fixes
- unrelated general benchmarking work outside the transform / doctor / Zod-limitations context

---

## Non-Negotiable Investigation Rules

1. Re-read `principles.md`, `testing-strategy.md`, `requirements.md`, and `DEFINITION_OF_DONE.md` before starting the investigation.
2. Treat strict proof quality as non-negotiable. Do not solve runtime pressure by deleting or weakening proofs.
3. Do not assume a timeout failure implies global-state leakage.
4. Do not assume an expensive path is acceptable merely because it is opt-in.
5. Separate harness-level scheduling issues from product-code architectural debt.
6. Promote durable conclusions to ADRs or permanent docs rather than leaving them only in plans or session notes.

---

## Working Assumptions To Validate First

These assumptions are intentionally provisional. The next session should validate or reject them explicitly.

1. The most recent transform-suite instability is better explained by parallel worker contention than by shared mutable global state.
2. The doctor pipeline is algorithmically expensive because it repeatedly re-validates large documents after small repair steps.
3. Some transform-suite cost comes from repeated creation of fresh `ts-morph` projects and other heavy setup work that is architecturally clean but operationally expensive.
4. At least one fix family will live at the **test harness / scheduling** layer, while at least one other fix family may live in **product code**.
5. The results of the Zod limitations investigation may change what a good transform-proof budget looks like.

---

## Success Metrics

The investigation is successful only if all of the following are true:

1. The heavy transform proofs have an explicit cost map:
   - isolated runtime
   - runtime under default suite parallelism
   - runtime under serialized execution
   - memory profile or at least a reasoned conclusion about whether memory retention is material
2. The suite has an explicit classification of each heavy proof:
   - normal proof
   - heavy proof
   - pathological / repair proof
3. The next session produces a recommendation for transform-proof scheduling:
   - worker strategy
   - script/config structure
   - timeout budget policy
4. Any confirmed non-test architecture issue is classified clearly as one or more of:
   - algorithmic inefficiency
   - avoidable setup churn
   - cross-layer orchestration inefficiency
   - acceptable cost of an intentionally expensive feature
5. Any overlap with Zod limitation work is explicitly recorded in both investigation plans.
6. Any durable conclusion is promoted to an ADR update, permanent doc update, or a dedicated follow-on implementation plan.

---

## Tranche 0: Establish The Cost Map

Before proposing any architectural answer, do the following:

1. Re-read:
   - `docs/architecture/zod-round-trip-limitations.md`
   - `docs/architectural_decision_records/ADR-031-zod-output-strategy.md`
   - `docs/architectural_decision_records/ADR-032-zod-input-strategy.md`
   - `docs/architectural_decision_records/ADR-035-transform-validation-parity.md`
   - [strict-object-semantics-enforcement.md](../complete/strict-object-semantics-enforcement.md)
2. Baseline the current transform suite:
   - isolated heavy-test runtime
   - full-suite runtime
   - serialized full-suite runtime
   - available worker parallelism on the machine used
3. Confirm whether the observed instability is:
   - contention only
   - deterministic timeout
   - memory pressure
   - a true leak
4. Capture the result in a short measurement table before evaluating solutions.

Deliverable:

- a baseline table suitable for promotion into a follow-on ADR or implementation plan

---

## Tranche 1: Investigate Transform-Proof Scheduling And Budgeting

### Primary Question

How should heavy transform proofs be scheduled so they remain strict and representative without causing avoidable suite instability?

### Architectural Questions

1. Should all transform proofs continue to share one flat Vitest worker pool?
2. Should heavy proofs run in a dedicated serialized or low-concurrency lane while lighter proofs remain parallel?
3. Should timeout budgets be derived from isolated runtime measurements rather than chosen ad hoc?
4. Should transform-proof classes be reflected in separate scripts/configs while preserving a single canonical `pnpm test:transforms` gate?
5. Does ADR-035 need to record proof classes and budget expectations as part of the scenario matrix?

### Code Surfaces To Inspect

- `lib/vitest.transforms.config.ts`
- `lib/tests-transforms/__tests__/doctor.integration.test.ts`
- `lib/tests-transforms/README.md`
- package scripts and any CI/runtime assumptions that invoke `pnpm test:transforms`

### Fix Families To Compare

1. **Flat suite, larger timeout:** simplest mechanically, weakest architectural answer.
2. **Single gate, multiple internal lanes:** keep one gate but split heavy proofs into a serial or low-concurrency sub-lane.
3. **Cost-class scheduling:** classify transform proofs and schedule by proof cost, not just file name.
4. **Dedicated heavy-proof config:** separate config/script for pathological proofs while preserving the canonical outer gate.

### Exit Criteria

The next session must recommend a scheduling model and a timeout-budget policy that preserves strictness without pretending all proofs cost the same.

---

## Tranche 2: Investigate Doctor Pipeline Runtime Architecture

### Primary Question

Is the doctor pipeline expensive because it is doing fundamentally necessary work, or because the current repair architecture is algorithmically wasteful?

### Architectural Questions

1. Is repeated full-document validation after each small repair step the dominant cost driver?
2. Is the current deep-clone -> validate -> rescue -> upgrade -> validate flow the right sequence?
3. Could repairs be batched or indexed so that validation passes become meaningfully fewer?
4. Is the doctor pipeline meant to optimize for:
   - best-effort repair breadth
   - deterministic diagnosability
   - runtime affordability
   - or an explicit trade-off among them?
5. Which costs are acceptable because doctor is opt-in, and which would still violate architectural excellence?

### Code Surfaces To Inspect

- `lib/src/shared/doctor/index.ts`
- `lib/src/shared/doctor/prefix-nonstandard.ts`
- `lib/src/shared/doctor/pointer-utils.ts`
- `lib/tests-transforms/__tests__/doctor.integration.test.ts`

### Fix Families To Compare

1. **Accept current algorithm, schedule around it:** treat doctor as intentionally expensive.
2. **Algorithmic redesign:** reduce repeated full-document validation and make repair steps more batch-oriented.
3. **Phase separation:** split diagnosis and repair more explicitly so cost and guarantees are clearer.
4. **Scope clarification:** document doctor as a heavyweight repair tool with explicit runtime expectations.

### Exit Criteria

The next session must decide whether the doctor cost is mostly an operational scheduling concern or a product-code architectural defect worth follow-on remediation.

---

## Tranche 3: Investigate Setup Churn In Transform-Adjacent Runtime Paths

### Primary Question

Are repeated setup costs in Zod parsing and generation materially inflating transform-proof runtime, and if so, are they a justified isolation cost or avoidable architecture debt?

### Architectural Questions

1. How often do transform scenarios create fresh `ts-morph` projects for Zod parsing?
2. Would project reuse, declaration caching, or a more centralized parse session concept improve cost without introducing unsafe shared mutable state?
3. Are test-only dynamic evaluation costs acceptable as harness cost, or are they masking product-code inefficiencies?
4. If caching is introduced in the future, how would the architecture preserve determinism and avoid stale semantic state?

### Code Surfaces To Inspect

- `lib/src/schema-processing/parsers/zod/ast/zod-ast.ts`
- `lib/src/schema-processing/parsers/zod/zod-parser.ts`
- `lib/src/rendering/generate-from-context.ts`
- `lib/tests-transforms/utils/transform-helpers.ts`

### Fix Families To Compare

1. **Keep isolated setup:** accept repeated project creation as the cost of correctness and isolation.
2. **Session-scoped reuse:** reuse expensive setup within a single transformation session without introducing cross-run leakage.
3. **Canonical cache layer:** centralize safe reuse of generated declarations or parser scaffolding.
4. **Test-harness-only reduction:** keep product architecture unchanged but reduce repeated work in proof harnesses.

### Exit Criteria

The next session must classify repeated setup cost as either acceptable isolation overhead or a meaningful follow-on architecture target.

---

## Cross-Link Back To Zod Limitations

At the end of each tranche, explicitly ask:

1. Does this finding change how we should investigate recursive `.passthrough()`, UUID v4 specificity, or `int64` / `bigint`?
2. Does this finding reveal that a current Zod limitation is partly a proof-budget problem rather than only a semantic one?
3. Does any newly discovered legitimate unhandled structure belong in the Zod limitations workstream now, or only in a future session?

Any yes-answer must be written back into the current active plan and, when relevant, the completed [strict-object-semantics-enforcement.md](../complete/strict-object-semantics-enforcement.md) record before the session ends.

---

## Decision Outputs Required

By the end of the investigation session, produce one or more of the following:

1. an ADR update, likely touching `ADR-035`
2. a permanent documentation update describing transform-proof budgeting expectations
3. a follow-on implementation plan for:
   - transform-suite scheduling changes
   - doctor algorithm redesign
   - setup-cost reduction in transform-adjacent runtime paths
4. a durable note in the Zod limitations docs or plan if a finding changes limitation triage

No valuable outcome should remain trapped only in ephemeral session notes.

---

## TDD Guidance For Any Follow-On Plan

This plan does not implement changes, but if the investigation proves a remediation path, the follow-on plan must specify TDD order:

1. characterization tests or measurements proving the current cost profile
2. pure helper unit tests for any extracted cost-model or scheduling logic
3. narrow integration tests for scheduling behavior or doctor-step behavior
4. full transform-suite proof verification after the architectural change
5. permanent doc and ADR updates after the new behavior is proven

---

## Quality Gates

Any mutating work done during the investigation session must rerun the full canonical gate chain **one command at a time** from `DEFINITION_OF_DONE.md`:

`pnpm clean`  
`pnpm install --frozen-lockfile`  
`pnpm build`  
`pnpm format:check`  
`pnpm type-check`  
`pnpm lint`  
`pnpm madge:circular`  
`pnpm madge:orphans`  
`pnpm depcruise`  
`pnpm knip`  
`pnpm test`  
`pnpm character`  
`pnpm test:snapshot`  
`pnpm test:gen`  
`pnpm test:transforms`

Analyze failures only after the full sequence completes.
