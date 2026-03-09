# Plan (Active): Zod Limitations Architecture Investigation

**Status:** Active  
**Created:** 2026-03-09  
**Last Updated:** 2026-03-09  
**Predecessor:** Recursive Wrapper Remediation (complete)  
**Related:** `docs/architecture/zod-round-trip-limitations.md`, `ADR-031`, `ADR-032`, `ADR-035`, `./transform-proof-budgeting-and-runtime-architecture-investigation.md`

---

## Summary

This plan is **investigation-first**, but it is not a deferral plan. Its job is to establish the full set of currently known Zod limitation fixes, turn any proven remediation into an active companion plan under `./`, and then start execution once the current limitation set is fully mapped.

Do **not** start product-code remediation until the current known limitation set below has explicit outcomes and any required remediation plans exist in `active/`.

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

The current limitations to investigate are:

1. recursive `.passthrough()` remains unsafe
2. UUID v4 specificity is not preserved
3. `int64` maps to `bigint` in Zod 4

Companion investigation:

- [transform-proof-budgeting-and-runtime-architecture-investigation.md](./transform-proof-budgeting-and-runtime-architecture-investigation.md) should be consulted whenever limitation analysis touches transform-suite runtime, doctor behavior, proof budgeting, or possible non-test performance architecture debt

Known queued remediation already established in this workstream:

- [recursive-unknown-key-semantics-remediation.md](./recursive-unknown-key-semantics-remediation.md)

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

- deep investigation of the three remaining limitations in `docs/architecture/zod-round-trip-limitations.md`
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

## Working Assumptions To Validate First

These assumptions are intentionally not locked in. The next session should validate or reject them explicitly.

1. The recursive `.passthrough()` limitation is not only a Zod runtime problem; it may also expose an IR-modeling gap around unknown-key retention semantics.
2. UUID v4 specificity may be representable without a custom OpenAPI extension if a standards-compliant `pattern` strategy exists, but that must be proven rather than assumed.
3. The `int64`/`bigint` issue may be less a parser/writer bug than a missing architectural decision about what Castr optimizes for: JSON transport ergonomics, exact numeric domain semantics, or canonical Zod 4 APIs.
4. At least one of the remaining limitations may benefit from a **general architectural mechanism** rather than a one-off patch.

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

- earliest loss point is the Zod parser, not the writer
- current object parsing collapses strip and passthrough to the same acceptance-only IR shape
- `.catchall(schema)` is currently degraded during the first parse as well
- recursive `.passthrough()` and recursive `.catchall()` share the same Zod 4 eager-evaluation runtime failure
- validation-only parity is insufficient; parsed-output parity is required for this seam

Durable outputs created from this tranche:

- [ADR-038](../../../docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md)
- [recursive-unknown-key-semantics.md](../../../docs/architecture/recursive-unknown-key-semantics.md)
- [recursive-unknown-key-semantics-remediation.md](./recursive-unknown-key-semantics-remediation.md)

Recommended direction locked by ADR-038:

- preserve object unknown-key behavior explicitly in IR
- preserve strip vs passthrough through OpenAPI / JSON Schema with a governed extension when standard fields are insufficient
- fail fast instead of silently stripping unknown keys when recursive Zod output cannot yet be reconstructed safely

### Discovery Ledger

- **In scope for queued active remediation:** `.catchall(schema)` currently degrades to plain `additionalProperties: true`
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

Is this limitation fundamentally:

1. a Zod 4 eager-evaluation runtime issue,
2. an IR modeling issue around unknown-key semantics,
3. a writer construction issue for recursive objects,
4. or a combination of the above?

### Architectural Questions

1. Can the current IR distinguish:
   - reject unknown keys
   - accept and strip unknown keys
   - accept and preserve unknown keys
2. If it cannot, is the limitation already partly baked in by the current ADR-032 decision to model validation acceptance rather than output preservation?
3. Can recursive `.passthrough()` be emitted safely with a two-phase or identity-preserving construction strategy without regressing canonical getter recursion?
4. If a fix exists at the writer layer, would it still round-trip losslessly through the parser and interchange formats?
5. If a fix exists only with a new IR distinction, what is the smallest architecturally clean representation?

### Code Surfaces To Inspect

- `lib/src/schema-processing/parsers/zod/types/zod-parser.object.ts`
- `lib/src/schema-processing/writers/zod/additional-properties.ts`
- `lib/src/schema-processing/writers/zod/properties.ts`
- `lib/src/schema-processing/writers/zod/index.ts`
- `lib/src/schema-processing/ir/models/schema.ts`
- object / recursion fixtures and parity payloads

### Fix Families To Compare

1. **Upstream-first:** treat this as a Zod runtime limitation and escalate upstream.
2. **Writer-only construction:** a safe two-phase recursive object builder that preserves schema identity.
3. **IR expansion:** introduce explicit unknown-key policy semantics (`strict` / `strip` / `passthrough` / `catchall` style modeling).
4. **Accepted limitation:** keep the current behavior but strengthen permanent rationale and scope.

### Exit Criteria

The next session must decide whether the fundamental blocker is:

- runtime only,
- partially self-inflicted by current IR semantics,
- or fixable within Castr without doctrine compromise.

If a clean remediation exists, produce or update a separate active remediation plan with TDD order and acceptance criteria.

---

## Tranche 2: Investigate UUID v4 Specificity

### Primary Question

Can UUID v4 specificity be preserved losslessly in an architecturally acceptable way without violating portability or no-escape-hatch principles?

### Architectural Questions

1. Is there a standards-compliant representation using `pattern` plus `format: uuid`, rather than a custom `x-uuid-version` extension?
2. If a `pattern`-based strategy exists, can parser and writer recognition stay centralized and deterministic rather than devolving into string-heuristic sprawl?
3. If non-standard extensions are the only lossless route, does project doctrine allow them for standards gaps of this kind?
4. Should UUID version specificity be treated as a one-off special case or as part of a broader **format refinement** architecture?
5. If the repo rejects non-standard extensions, is the current accepted loss the correct permanent stance, or should the system fail fast on round-trip claims it cannot keep?

### Code Surfaces To Inspect

- `lib/src/schema-processing/parsers/zod/types/zod-parser.zod4-formats.ts`
- `lib/src/schema-processing/writers/zod/generators/primitives.ts`
- OpenAPI / JSON Schema conversion and writer layers that carry `format` and `pattern`
- existing UUID tests and fixtures

### Fix Families To Compare

1. **Standards-only refinement:** `format: uuid` plus `pattern`.
2. **Generic IR refinement model:** preserve format refinements as first-class internal semantics.
3. **Non-standard extension:** `x-uuid-version` or equivalent.
4. **Fail-fast doctrine:** reject round-trip claims for UUID-version-specific input if no lossless portable representation exists.
5. **Accepted limitation:** keep canonicalization to `z.uuid()`.

### Exit Criteria

The next session must determine whether a lossless, architecturally excellent representation exists and whether it generalizes beyond UUID v4.

If the answer changes permanent policy, capture it in an ADR instead of leaving it in session notes.

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
