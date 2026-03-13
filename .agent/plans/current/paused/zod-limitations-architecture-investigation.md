# Plan (Paused Umbrella): Zod Limitations Architecture Investigation

**Status:** Paused  
**Created:** 2026-03-09  
**Last Updated:** 2026-03-11  
**Predecessor:** [type-safety-remediation.md](../complete/type-safety-remediation.md)  
**Successor Active Slice:** [zod-limitations-next-atomic-slice-planning.md](../../active/zod-limitations-next-atomic-slice-planning.md)  
**Related:** `docs/architecture/zod-round-trip-limitations.md`, `ADR-031`, `ADR-032`, `ADR-035`, `ADR-038`, `ADR-039`, `ADR-040`, `./recursive-unknown-key-preserving-zod-emission-investigation.md`, `./transform-proof-budgeting-and-runtime-architecture-investigation.md`, `../../active/zod-limitations-next-atomic-slice-planning.md`, `../complete/int64-bigint-semantics-investigation.md`, `../complete/type-safety-remediation-follow-up.md`

---

This plan is no longer the repo's primary active entrypoint.

It now serves as the **paused umbrella context** for the broader Zod limitations workstream while the next atomic correctness slices execute independently:

- [strict-object-semantics-enforcement.md](../complete/strict-object-semantics-enforcement.md) is the completed object-semantics execution record.
- [recursive-unknown-key-preserving-zod-emission-investigation.md](./recursive-unknown-key-preserving-zod-emission-investigation.md) remains paused historical evidence after ADR-040 changed product direction.
- [int64-bigint-semantics-investigation.md](../complete/int64-bigint-semantics-investigation.md) is complete.
- [zod-limitations-next-atomic-slice-planning.md](../../active/zod-limitations-next-atomic-slice-planning.md) is the current primary active entrypoint.
- [transform-proof-budgeting-and-runtime-architecture-investigation.md](./transform-proof-budgeting-and-runtime-architecture-investigation.md) remains paused supporting runtime context.

Keep this file as cross-cutting workstream context, not as the next session's default execution plan.

The type-safety remediation workstream is complete:

- `pnpm lint` is fully clean again
- `@typescript-eslint/consistent-type-assertions` is restored to `error`
- `unknown` remains valid only at incoming external boundaries and must be validated immediately
- after validation, types remain strict and no type information may be discarded or widened away

The paused transform-proof budgeting investigation remains important supporting context, but it is **not** the next primary slice.

## Summary

This plan started investigation-first, but it now also serves as the durable execution map for the remaining open Zod limitation work after UUID subtype semantics were decided and implemented.

The goal is to help the next session deeply investigate each remaining Zod round-trip limitation, identify its true architectural origin, and determine the most architecturally excellent response:

1. a lossless remediation path
2. an explicit accepted limitation with a stronger permanent rationale
3. an upstream dependency strategy
4. an ADR and active remediation plan

Strategic goal:

- move the system toward **zero legitimate data structures that Castr cannot handle**
- if the investigation discovers additional legitimate unhandled structures, explicitly decide whether they should be:
  - fixed as part of the current workstream
  - added to the active execution queue
  - recorded durably as later-scope work only if they are genuinely outside the current workstream

Current repo truth:

1. strict object semantics enforcement is complete after ADR-040
2. UUID subtype semantics are now preserved in IR and native Zod output via [ADR-039](../../../../docs/architectural_decision_records/ADR-039-uuid-subtype-semantics-and-native-only-emission.md)
3. portable OpenAPI / JSON Schema detours still widen UUID subtype semantics to plain `uuid`, and that widening is now accepted target-capacity behavior
4. the `int64` / `bigint` slice is complete and recorded under `current/complete/`
5. the preserving-mode recursive investigation remains useful background evidence, but it is no longer the forward product direction

Paused supporting investigation:

- [transform-proof-budgeting-and-runtime-architecture-investigation.md](./transform-proof-budgeting-and-runtime-architecture-investigation.md) should be consulted whenever limitation analysis touches transform-suite runtime, doctor behavior, proof budgeting, or possible non-test performance architecture debt

Completed adjacent slice:

- [int64-bigint-semantics-investigation.md](../complete/int64-bigint-semantics-investigation.md)

Known completed remediation already established in this workstream:

- [recursive-unknown-key-semantics-remediation.md](../complete/recursive-unknown-key-semantics-remediation.md)

Do not create `future/` plans for this Zod workstream. Keep established fixes active until the current known limitation set is fully mapped and ordered for execution.

---

## Intended Impact

The next session should leave the repo with:

- a precise architecture map for each limitation
- explicit evidence about where each loss or trade-off originates
- a comparison of the plausible fix families at the right layer
- a recommendation for each limitation that is good enough to promote into ADRs or into an active remediation plan
- any proven remediation captured as an active execution plan instead of being deferred to `future/`
- an explicit triage outcome for any newly discovered legitimate unhandled structures

We are optimizing for **solving the right problem at the right layer**, not for shipping the fastest local patch.

---

## Scope

In scope:

- deep investigation of the remaining open limitations in `docs/architecture/zod-round-trip-limitations.md`
- durable recording of already-decided UUID subtype semantics and their implications for later work
- architectural-origin analysis across parser, IR, interchange formats, writers, and runtime behavior
- design-option comparison for standards-only, IR-level, writer-level, parser-level, configuration-level, and upstream-library-level answers
- creation of durable decision outputs when the investigation proves something conclusive

Out of scope:

- product-code implementation of a fix before the execution trigger in this plan is satisfied
- speculative fallback behavior or permissive degradation
- unrelated Phase 4 feature work

---

## Non-Negotiable Investigation Rules

1. Re-read `principles.md`, `testing-strategy.md`, `requirements.md`, and `DEFINITION_OF_DONE.md` before starting the investigation.
2. Treat the IR and generator architecture as the source of truth.
3. Do not assume the current limitation write-up already reflects the deepest root cause.
4. Prefer standards-compliant and architecturally general answers over narrow special cases.
5. Do not invent permissive escape hatches just to preserve output shape.
6. If an answer would require doctrine changes, surface that explicitly rather than smuggling it in as an implementation detail.

---

## Reviewer And Specialist Invocation

Read and apply `.agent/rules/invoke-reviewers.md` throughout this workstream.

- After any non-trivial change made during investigation or remediation planning, invoke `code-reviewer` first.
- Invoke `test-reviewer` when tests, fixtures, harnesses, or TDD evidence are added or changed.
- Invoke `type-reviewer` when types, generics, schema flow, or parser/writer contracts are involved.
- Invoke `zod-expert`, `openapi-expert`, or `json-schema-expert` whenever the investigation or remediation touches those semantic surfaces.
- Do not close a tranche with non-trivial changed artefacts unless the required reviewer and specialist coverage has been applied and reflected in the session outcome.

---

## Working Assumptions To Validate First

These assumptions remain active only where they are not already locked by durable records.

1. The recursive unknown-key-preserving limitation is now a writer/runtime construction problem, not a parser/IR/cross-format preservation problem.
2. Getter syntax may remain canonical for recursive strip-compatible output without being the only honest recursive output form for preserving modes; that assumption must be tested explicitly.
3. UUID subtype semantics are locked by ADR-039: first-class IR truth, native-only emission, and accepted widening across portable detours.
4. The `int64`/`bigint` issue is less a parser bug than a missing numeric-semantics policy at the IR/writer boundary.
5. `z.bigint()` remains architecturally adjacent and should be investigated alongside `int64`, not as an unrelated side note.

---

## Success Metrics

The investigation is successful only if all of the following are true:

1. Each limitation has an explicit stage map:
   - source syntax
   - parser
   - IR
   - OpenAPI / JSON Schema detours where relevant
   - writer
   - runtime behavior
2. Each limitation has at least two credible fix families compared at the architectural level.
3. Each limitation is classified clearly as one or more of:
   - standards gap
   - IR expressiveness gap
   - parser/writer contract issue
   - canonicalization choice
   - upstream dependency/runtime behavior
4. The next session produces a recommendation for each limitation:
   - queue for execution in an active remediation plan
   - accept permanently with stronger rationale
   - escalate upstream
5. Any newly discovered legitimate unhandled data structure is explicitly triaged:
   - in-scope for the current workstream
   - out-of-scope but recorded durably without hiding an actionable fix in `future/`
6. Any new permanent knowledge is promoted to ADRs or stable docs rather than left only in a plan.

---

## Progress Update (2026-03-09)

### Activation Update (2026-03-10)

- this investigation is promoted back into `active/` as the primary workstream
- the completed type-safety remediation restored strict lint enforcement and removed the last residual assertion warnings
- the companion transform-proof budgeting investigation remains paused and should only be pulled forward if runtime-cost questions become the highest-leverage blocker again
- the quality-gate warning cleanup slice is complete:
  - `pnpm madge:circular` and `pnpm madge:orphans` no longer emit the known external skipped-module warnings
  - `pnpm knip` no longer emits the stale `type-fest` configuration hint
  - `pnpm character` no longer emits the expected unreachable-URL stderr noise from Scalar
  - `pnpm test:transforms` no longer prints custom doctor/scalar diagnostic logs
- all quality-gate issues, including warning-producing gate noise, are blocking at all times
- investigation should therefore start from a warning-clean gate surface, not from historic noisy output

### Tranche 0 Baseline Captured

| Metric                                      | Value   | Interpretation                                  |
| ------------------------------------------- | ------- | ----------------------------------------------- |
| Available worker parallelism                | `14`    | Healthy default concurrency available           |
| Isolated doctor proof wall time             | `16.7s` | Heavy but stable                                |
| Full `test:transforms`, default concurrency | `18.9s` | Current suite is not obviously contention-bound |
| Full `test:transforms`, single worker       | `51.3s` | Serialization makes the suite materially worse  |

Conclusion:

- current recursive unknown-key decisions should not be driven by a transform-runtime contention narrative on this machine

### Tranche 1 Outcome: Recursive Unknown-Key Semantics

Confirmed findings:

- the original earliest loss point was the Zod parser, not the writer
- that parser/IR/cross-format loss is now remediated and locked by ADR-038
- the remaining open gap is recursive `.passthrough()` / `.catchall()` writer/runtime reconstruction
- recursive `.passthrough()` and recursive `.catchall()` share the same Zod 4 eager-evaluation runtime failure
- validation-only parity is insufficient; parsed-output parity is required for this seam
- the next architectural decision in this seam is whether getter recursion is universally canonical, or whether preserving unknown-key modes require a second tightly-scoped canonical recursion strategy

Durable outputs created from this tranche:

- [ADR-038](../../../../docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md)
- [recursive-unknown-key-semantics.md](../../../../docs/architecture/recursive-unknown-key-semantics.md)
- [recursive-unknown-key-semantics-remediation.md](../complete/recursive-unknown-key-semantics-remediation.md)

Recommended direction locked by ADR-038:

- preserve object unknown-key behavior explicitly in IR
- preserve strip vs passthrough through OpenAPI / JSON Schema with a governed extension when standard fields are insufficient
- fail fast instead of silently stripping unknown keys when recursive Zod output cannot yet be reconstructed safely

### Tranche 2 Outcome: UUID Subtype Semantics

Confirmed findings:

- UUID subtype is first-class IR truth, not source provenance or metadata-only hinting
- `format: 'uuidv7'` was a repo-owned pseudo-format and has been removed from portable truth
- native Zod output now preserves supported subtype helpers (`z.uuidv4()`, `z.uuidv7()`)
- portable OpenAPI / JSON Schema detours still widen to plain `uuid`
- a narrow regex-based subtype inference exception is allowed only at parse time and only through the centralized governed utility

Durable outputs created from this tranche:

- [ADR-039](../../../../docs/architectural_decision_records/ADR-039-uuid-subtype-semantics-and-native-only-emission.md)
- updated [zod-round-trip-limitations.md](../../../../docs/architecture/zod-round-trip-limitations.md)

Recommended direction locked by ADR-039:

- preserve UUID subtype in IR via `uuidVersion`
- emit subtype only when the target has a native construct
- preserve existing `pattern` content when present, but never synthesize subtype-preserving regex for portable output
- accept widening across standard portable detours as target-capacity behavior rather than an IR defect

### Discovery Ledger

- **In scope for queued active remediation:** recursive `.passthrough()` / `.catchall()` Zod emission remains unresolved
- **Recorded for later tranche:** `z.bigint()` currently emits `format: "bigint"` through OpenAPI / JSON Schema artifacts

---

## Tranche 0: Establish The Architecture Map

Before investigating individual limitations, do the following:

1. Re-read:
   - `docs/architecture/zod-round-trip-limitations.md`
   - `docs/architectural_decision_records/ADR-031-zod-output-strategy.md`
   - `docs/architectural_decision_records/ADR-032-zod-input-strategy.md`
   - `docs/architectural_decision_records/ADR-035-transform-validation-parity.md`
   - [transform-proof-budgeting-and-runtime-architecture-investigation.md](./transform-proof-budgeting-and-runtime-architecture-investigation.md)
2. Execute the companion plan's Tranche 0 cost-baseline step before deep semantic analysis:
   - capture isolated heavy-proof runtime
   - capture full-suite transform runtime
   - capture serialized full-suite transform runtime
   - record available worker parallelism on the machine used
   - write down whether current evidence points to contention, deterministic timeout, memory pressure, or an actual leak
3. Build a code-surface map for the relevant layers:
   - Zod parser
   - IR schema model
   - OpenAPI writer/parser
   - JSON Schema writer/parser
   - Zod writer
   - parity fixtures and transform tests
4. For each limitation, write down the first suspected loss point and the deepest suspected architectural origin.
5. Explicitly ask whether the problem is being described from the standpoint of:
   - validation acceptance
   - parsed output shape
   - interchange portability
   - canonical generated code
   - runtime caller ergonomics

Deliverable:

- a short shared baseline table covering transform-proof runtime and contention context
- a short architecture map section in the session notes or successor ADR draft before any fix strategy is chosen
- a running discovery ledger of any additional legitimate unhandled structures uncovered during investigation

---

## Discovery Protocol For New Legitimate Gaps

If the next session finds a legitimate data structure that Castr cannot currently handle, do not let it remain an implicit side note.

For each newly discovered gap:

1. Capture a minimal concrete example.
2. Identify the earliest confirmed failure or loss point.
3. Classify the gap:
   - standards gap
   - IR expressiveness gap
   - parser limitation
   - writer limitation
   - canonicalization choice
   - upstream dependency/runtime issue
4. Decide whether it belongs in the current workstream:
   - **include now** if it is architecturally adjacent and necessary to achieve a coherent answer
   - **record durably but do not queue for immediate execution** if it is real but would distract from the current tranche or broaden scope too far
5. Promote the finding to a durable location before ending the session:
   - permanent limitations doc
   - ADR update
   - active remediation plan if execution work is required

The default should be: investigate enough to understand and classify the new gap, then make an explicit scope decision rather than silently growing or shrinking scope.

---

## Tranche 1: Investigate Recursive `.passthrough()`

### Primary Question

What construction strategy can safely regenerate recursive unknown-key-preserving Zod output, and is getter syntax truly a universal canonical recursion form or only canonical for strip-compatible recursion?

### Architectural Questions

1. Is "getter syntax is canonical" a universal rule, or a best default that needs a narrow exception for recursive preserving modes?
2. Can recursive `.passthrough()` or `.catchall()` be emitted safely with getter syntax, or does preserving behavior require a second tightly-scoped canonical recursion strategy?
3. If a fix exists at the writer layer, does it preserve parsed-output behavior and recursive initialization safety as well as validation behavior?
4. If no safe local construction exists, what is the precise upstream/runtime blocker?
5. What proof shape is required to call the seam remediated rather than merely less broken?

### Code Surfaces To Inspect

- `lib/src/schema-processing/writers/zod/additional-properties.ts`
- `lib/src/schema-processing/writers/zod/properties.ts`
- `lib/src/schema-processing/writers/zod/index.ts`
- object / recursion fixtures and parity payloads

### Fix Families To Compare

1. **Getter-only construction:** prove that canonical getter recursion can safely support preserving modes.
2. **Dual canonical recursion strategy:** keep getter syntax canonical for strip-compatible recursion while allowing one narrowly-scoped second canonical strategy for preserving modes.
3. **Upstream-first:** treat this as a Zod runtime limitation and escalate upstream while keeping a local strategy plan.
4. **Canonical-safe alternative construction:** any approach that preserves parsed-output retention and recursive initialization safety without mutating meaning.

### Exit Criteria

The next session must not close this tranche as a permanent accepted limitation.

It must instead produce one of:

- a clean remediation plan with TDD order and acceptance criteria
- or a precise upstream/runtime blocker plus a concrete local strategy plan

The tranche must also make one explicit doctrine decision:

- getter recursion remains universally canonical
- or getter recursion is narrowed to the cases it can represent honestly, with one tightly-scoped second canonical preserving-mode strategy

---

## Tranche 2: UUID Subtype Work Is Complete

No further architecture investigation is required in this tranche unless one of the following changes:

1. OpenAPI / JSON Schema gain a native UUID subtype/version carrier
2. the project decides to adopt a custom portable UUID subtype extension
3. Zod gains additional native subtype helpers beyond the currently supported set

Until then, ADR-039 governs the UUID seam.

---

## Tranche 3: Investigate `int64` / `bigint`

### Primary Question

What should Castr optimize for when rendering OpenAPI / JSON Schema `int64` into Zod:

1. exact numeric-domain safety,
2. JSON transport ergonomics,
3. canonical Zod 4 helper usage,
4. or an explicit strategy choice between them?

### Architectural Questions

1. Is the current behavior best understood as correct canonicalization, or as an unresolved mismatch between interchange semantics and runtime semantics?
2. Does the IR need to distinguish transport representation from runtime validation representation?
3. Would a configurable strategy be architectural excellence or an escape hatch?
4. Could a standards-faithful but JSON-friendly answer exist using codec, preprocess, coercion, string transport, or dual-schema constructs?
5. If not, is the current `z.int64()` / `bigint` policy the right permanent doctrine?

### Code Surfaces To Inspect

- `lib/src/schema-processing/writers/zod/generators/primitives.ts`
- parser numeric-format handling
- payload fixtures for `int64`
- transform parity tests and generated-code tests touching numeric formats
- relevant TypeScript output semantics if they diverge from Zod runtime behavior

### Fix Families To Compare

1. **Keep current behavior:** canonical `z.int64()` / `bigint`.
2. **JSON-friendly weakening:** `z.number().int()` style output.
3. **Transport/runtime split:** preserve `int64` semantics while validating JSON-compatible carriers.
4. **Configurable strategy:** explicit `int64` policy chosen by users or generation mode.
5. **Accepted limitation with stronger doctrine:** codify that Castr follows canonical Zod 4 semantics over JSON ergonomics.

### Exit Criteria

The next session must produce a clear recommendation about what semantic target Castr is actually preserving and whether the current behavior is final or provisional.

---

## Cross-Cutting Synthesis

After all three tranches, compare them across the same decision axes:

- standards gap
- runtime-library behavior
- IR expressiveness
- parser/writer lockstep
- canonical output policy
- user-visible behavior vs validation parity vs transport ergonomics

Explicitly ask whether there is a shared architecture shape such as:

1. a generalized **refinement** mechanism,
2. a generalized **runtime vs transport semantics** distinction,
3. a generalized **unknown-key policy** representation,
4. a generalized **proof-budget / runtime-cost model** that changes how strictness should be operationalized,
5. or a doctrine rule for when Castr must fail fast instead of canonicalizing lossy semantics

If a common architecture emerges, prefer that over three isolated special cases.

---

## Decision Outputs Required

By the end of the investigation session, produce one of the following for each limitation:

1. an ADR update
2. a new ADR
3. an update to `docs/architecture/zod-round-trip-limitations.md`
4. a dedicated active remediation plan with explicit TDD order
5. an explicit permanent-acceptance note with rationale

No valuable outcome should remain trapped only in ephemeral session notes.

---

## Execution Trigger

Begin product-code execution for this workstream once all of the following are true:

1. recursive unknown-key semantics, UUID v4 specificity, and `int64` / `bigint` each have an explicit outcome
2. every limitation that requires code changes has a linked active remediation plan in `active/`
3. the cross-cutting synthesis has established execution order and any adjacent must-fix gaps have been triaged explicitly

When those conditions are met:

- execute from the active plan queue
- do not create new `future/` plans for this Zod workstream
- start with the highest-leverage remediation, unless the synthesis proves a different order than the current recursive unknown-key lead

---

## TDD Guidance For Any Active Remediation Plan

This plan does not implement changes yet, but any active remediation plan created from it must specify TDD order:

1. characterization tests proving current behavior
2. pure helper unit tests wherever possible
3. narrow parser/writer integration tests where pure seams are impossible
4. transform parity / idempotency tests at the scenario level
5. permanent doc and ADR updates after the behavior is proven

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
