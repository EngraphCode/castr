# Recursive Unknown-Key Semantics

**Status:** Permanent reference  
**Last Updated:** 2026-03-11  
**Related:** [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md), [ADR-032](../architectural_decision_records/ADR-032-zod-input-strategy.md), [ADR-035](../architectural_decision_records/ADR-035-transform-validation-parity.md), [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md)

---

> [!IMPORTANT]
> On 2026-03-11, [ADR-040](../architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md) changed the forward product direction to default strict object generation, reject-by-default ingest, and one explicit lossy strip-normalization compatibility mode.
>
> This document is now primarily historical diagnosis and evidence for why preserving-mode remediation was investigated. The live product rule is simpler: default strict output, reject-by-default ingest, and strip-only compatibility normalization.

## Purpose

This document records the architecture investigation for recursive object unknown-key behavior in the Zod -> IR -> OpenAPI/JSON Schema -> IR -> Zod pipeline.

It exists to make the stage map, evidence, option comparison, and chosen direction durable outside ephemeral session plans.

## Problem Summary

The repo previously treated recursive `.passthrough()` as a writer/runtime limitation only.

The investigation proved a deeper result:

- parser-stage loss already occurs before any writer runs
- `.catchall(schema)` is also part of the same semantic seam
- recursive writer suppression hides a real semantic regression
- validation-only parity is insufficient to prove correctness here

This is a cross-layer object-semantics problem, not a narrow code-generation quirk.

## Baseline Evidence

| Area             | Confirmed fact                                                                                               | Architectural meaning                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Parser           | Default `z.object()`, explicit `.strip()`, and `.passthrough()` all collapse to `additionalProperties: true` | Earliest loss point is the Zod parser                                          |
| Parser           | `.catchall(schema)` currently degrades to `additionalProperties: true`                                       | Typed unknown-key schemas are also being lost at first parse                   |
| Runtime          | Recursive `.passthrough()` throws because Zod 4 eagerly evaluates getter-backed shapes                       | Writer cannot safely append `.passthrough()` after canonical recursive getters |
| Runtime          | Recursive `.catchall()` has the same eager-evaluation failure                                                | The seam is broader than passthrough alone                                     |
| Runtime          | Naive two-phase constructions either fail later or preserve only root-level extras                           | Writer-only fixes are not a full answer                                        |
| Transform proofs | Scenario 2 / 4 / 6 parity checks `safeParse(...).success` only                                               | Parsed-output drift can stay green in CI                                       |
| Portable formats | `additionalProperties` models acceptance, not parsed-output retention                                        | Strip vs passthrough requires either extension or fail-fast                    |

## Runtime Cost Baseline

Captured on 2026-03-09 while investigating whether proof-budget pressure should change the semantic diagnosis:

| Metric                                                | Value   |
| ----------------------------------------------------- | ------- |
| Available worker parallelism                          | `14`    |
| Isolated doctor proof wall time                       | `16.7s` |
| Full `test:transforms` wall time, default concurrency | `18.9s` |
| Full `test:transforms` wall time, single worker       | `51.3s` |

Conclusion:

- current semantic decisions should not be driven by a transform-suite contention narrative on this machine
- default concurrency is healthier than serialized execution

## Stage Map

| Layer                        | Current behavior                                                                                                                                             | Confirmed issue                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Zod source syntax            | Distinguishes `strict`, `strip`, `passthrough`, and `catchall`                                                                                               | Source semantics are richer than current IR preserves           |
| Zod parser                   | Collapses strip and passthrough; drops typed catchall behavior                                                                                               | First proven semantic loss point                                |
| IR                           | Has `additionalProperties`, but no first-class runtime unknown-key behavior                                                                                  | IR cannot currently be the full source of truth here            |
| OpenAPI / JSON Schema writer | Can express reject and typed additional keys, but not strip vs passthrough                                                                                   | Standard formats cannot carry the full runtime distinction      |
| OpenAPI / JSON Schema parser | Can recover validation acceptance, not parsed-output retention                                                                                               | Round-trip ambiguity remains unless governed explicitly         |
| Zod writer                   | Emits exact non-recursive modes, emits bare recursive `z.object({...})` for strip semantics, and fails fast for recursive passthrough / catchall             | Unsupported preserving modes are now explicit instead of silent |
| Runtime execution            | Recursive getter + `.passthrough()` / `.catchall()` eagerly evaluates shape                                                                                  | Safe recursive preserving reconstruction is still unsolved      |
| Transform proof harness      | Proves validation parity broadly, parsed-output parity for object unknown-key fixtures, and explicit failure for unsupported recursive preserving generation | Output-shape regressions are now covered where they matter      |

## Option Comparison

| Option                               | No silent content loss | IR-first | Canonical getter recursion | Standards portability                                 | Verdict                               |
| ------------------------------------ | ---------------------- | -------- | -------------------------- | ----------------------------------------------------- | ------------------------------------- |
| Writer-only workaround               | No                     | No       | Unproven                   | N/A                                                   | Rejected                              |
| Dedicated IR unknown-key behavior    | Yes                    | Yes      | Compatible                 | Needs extension or fail-fast for strip vs passthrough | Chosen baseline                       |
| Governed extension only              | Partially              | No       | Compatible                 | Weaker                                                | Insufficient alone                    |
| Fail fast for all non-portable cases | Yes                    | Yes      | Compatible                 | Strong                                                | Valid fallback, not primary direction |
| Accept current loss                  | No                     | No       | Superficially convenient   | Strong                                                | Rejected                              |

## Historical Direction Before ADR-040

Before ADR-040, the durable direction was defined by [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md):

1. Preserve object unknown-key runtime behavior as explicit IR semantics via `unknownKeyBehavior`.
2. Keep `additionalProperties` as the portable validation/interchange view.
3. Preserve strip vs passthrough through OpenAPI / JSON Schema with the governed extension `x-castr-unknownKeyBehavior` when needed.
4. Expand transform proofs to include parsed-output parity for object unknown-key fixtures.
5. Replace silent recursive writer degradation with fail-fast errors until a safe recursive construction strategy exists.

## Current Doctrine Supersession

ADR-040 changed the forward target:

1. default ingest should reject non-strict object features with helpful errors
2. one explicit compatibility mode may normalize non-strict object inputs to strip semantics
3. default generated object output remains strict rather than preserving strip / passthrough / catchall as first-class product targets
4. preserving-mode recursive emission is no longer the forward remediation goal

This document therefore explains why the earlier preservation architecture existed and why the compatibility mode must now be documented as deliberately lossy.

## Historical Implementation Record Under The Superseded Preservation Doctrine

The architecture captured here was implemented before ADR-040 changed direction:

- Zod parsing preserved `strict`, `strip`, `passthrough`, and `catchall` distinctly in IR via `unknownKeyBehavior`
- OpenAPI / JSON Schema preserved strip vs passthrough with `x-castr-unknownKeyBehavior`
- non-recursive Zod output emitted the exact unknown-key method for all four modes
- recursive strip output remained supported via bare `z.object({...})`, which is semantically strip-mode in Zod
- recursive `passthrough` and recursive `catchall` failed fast with explicit generation errors instead of silently degrading
- Scenario 2 / 4 / 6 proved parsed-output parity for the supported unknown-key cases

The remaining unsolved boundary is narrow and explicit:

- safe recursive preserving emission for `.passthrough()` and `.catchall()` still does not exist in Zod output
- the next design question is whether getter syntax is universally canonical for recursion or only canonical for strip-compatible recursion, with preserving modes potentially requiring one tightly-scoped second canonical strategy

Under ADR-040 and the 2026-03-11 enforcement slice, that remaining seam is now historical evidence and implementation context rather than the primary product goal. The only live compatibility output rule is strip normalization, with recursive strip still using bare `z.object({...})` for runtime safety.

## Implementation Record

The remediation plan that carried this architecture into product code lives in:

- [recursive-unknown-key-semantics-remediation.md](../../.agent/plans/current/complete/recursive-unknown-key-semantics-remediation.md)

## Discovery Ledger

### Resolved In This Slice

- `.catchall(schema)` no longer degrades to plain `additionalProperties: true`
- strip vs passthrough are now preserved distinctly in IR and portable artifacts

### Remaining Explicit Limitation

- recursive `.catchall()` still has the same runtime construction problem as recursive `.passthrough()`

### Adjacent Slice Now Resolved Elsewhere

- the `int64` / `bigint` native-capability slice now carries `z.bigint()` as first-class IR bigint semantics
- portable OpenAPI / JSON Schema writers reject unsupported bigint emission early instead of inventing `format: "bigint"` artifacts

This is no longer an open question inside the object-semantics workstream.
