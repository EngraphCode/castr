# Recursive Unknown-Key Semantics

**Status:** Permanent reference  
**Last Updated:** 2026-03-09  
**Related:** [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md), [ADR-032](../architectural_decision_records/ADR-032-zod-input-strategy.md), [ADR-035](../architectural_decision_records/ADR-035-transform-validation-parity.md), [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md)

---

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

| Layer                        | Current behavior                                                                                                     | Confirmed issue                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Zod source syntax            | Distinguishes `strict`, `strip`, `passthrough`, and `catchall`                                                       | Source semantics are richer than current IR preserves      |
| Zod parser                   | Collapses strip and passthrough; drops typed catchall behavior                                                       | First proven semantic loss point                           |
| IR                           | Has `additionalProperties`, but no first-class runtime unknown-key behavior                                          | IR cannot currently be the full source of truth here       |
| OpenAPI / JSON Schema writer | Can express reject and typed additional keys, but not strip vs passthrough                                           | Standard formats cannot carry the full runtime distinction |
| OpenAPI / JSON Schema parser | Can recover validation acceptance, not parsed-output retention                                                       | Round-trip ambiguity remains unless governed explicitly    |
| Zod writer                   | Emits `.strict()`, `.passthrough()`, `.catchall()` for non-recursive objects; suppresses recursive passthrough today | Silent degradation hides unsupported recursive output      |
| Runtime execution            | Recursive getter + `.passthrough()` / `.catchall()` eagerly evaluates shape                                          | Safe recursive reconstruction is still unsolved            |
| Transform proof harness      | Proves acceptance parity only                                                                                        | Output-shape regressions are under-proven                  |

## Option Comparison

| Option                               | No silent content loss | IR-first | Canonical getter recursion | Standards portability                                 | Verdict                               |
| ------------------------------------ | ---------------------- | -------- | -------------------------- | ----------------------------------------------------- | ------------------------------------- |
| Writer-only workaround               | No                     | No       | Unproven                   | N/A                                                   | Rejected                              |
| Dedicated IR unknown-key behavior    | Yes                    | Yes      | Compatible                 | Needs extension or fail-fast for strip vs passthrough | Chosen baseline                       |
| Governed extension only              | Partially              | No       | Compatible                 | Weaker                                                | Insufficient alone                    |
| Fail fast for all non-portable cases | Yes                    | Yes      | Compatible                 | Strong                                                | Valid fallback, not primary direction |
| Accept current loss                  | No                     | No       | Superficially convenient   | Strong                                                | Rejected                              |

## Chosen Direction

The durable direction is defined by [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md):

1. Preserve object unknown-key runtime behavior as explicit IR semantics via `unknownKeyBehavior`.
2. Keep `additionalProperties` as the portable validation/interchange view.
3. Preserve strip vs passthrough through OpenAPI / JSON Schema with the governed extension `x-castr-unknownKeyBehavior` when needed.
4. Expand transform proofs to include parsed-output parity for object unknown-key fixtures.
5. Replace silent recursive writer degradation with fail-fast errors until a safe recursive construction strategy exists.

## What This Means For Current Behavior

Current product behavior is still:

- recursive `.passthrough()` is silently emitted as strip-mode output
- recursive `.catchall()` is not preserved from Zod input
- transform parity can remain green while parsed outputs drift

That behavior is now treated as a defect and an under-proved gap, not as the desired end-state.

## Active Remediation Scope

The queued active remediation plan for this architecture decision lives in:

- [recursive-unknown-key-semantics-remediation.md](../../.agent/plans/active/recursive-unknown-key-semantics-remediation.md)

That plan owns:

- parser support for `unknownKeyBehavior`
- IR updates
- governed extension wiring
- parsed-output parity fixtures and helpers
- fail-fast Zod writer behavior for unsupported recursive passthrough / catchall emission

## Discovery Ledger

### In Scope For The Follow-On Remediation

- `.catchall(schema)` currently degrades to plain `additionalProperties: true`
- recursive `.catchall()` has the same runtime construction problem as recursive `.passthrough()`

### Recorded But Out Of Scope For This Slice

- `z.bigint()` currently emits `format: "bigint"` through OpenAPI / JSON Schema artifacts

This adjacent finding should be revisited during the remaining `int64` / `bigint` investigation rather than folded into the object-semantics remediation by accident.
