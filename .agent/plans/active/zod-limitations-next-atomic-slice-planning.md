# Plan (Active): Doctor Rescue-Loop Runtime Redesign

**Status:** Active  
**Created:** 2026-03-13  
**Last Updated:** 2026-03-13  
**Predecessor:** [doctor-runtime-characterisation-and-transform-proof-budget-decision.md](../current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md)  
**Parent Context:** [transform-proof-budgeting-and-runtime-architecture-investigation.md](../current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md)  
**Related:** [int64-bigint-semantics-investigation.md](../current/complete/int64-bigint-semantics-investigation.md), [zod-limitations-architecture-investigation.md](../current/paused/zod-limitations-architecture-investigation.md), [recursive-unknown-key-preserving-zod-emission-investigation.md](../current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md), [zod-round-trip-limitations.md](../../../docs/architecture/zod-round-trip-limitations.md), [ADR-035](../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)

---

This file is the active implementation follow-on to the completed doctor runtime-characterisation slice.

The next smallest honest atomic slice is now clear: redesign the doctor's non-standard-property rescue loop. The completed runtime-characterisation record in [doctor-runtime-characterisation-and-transform-proof-budget-decision.md](../current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md) proved that current transform-suite cost is dominated by rescue-loop revalidation, not by Vitest scheduling and not by the superseded recursive preserving-mode seam.

## Summary

Current runtime evidence captured on Friday, 13 March 2026:

| Metric                                     | Value                                   |
| ------------------------------------------ | --------------------------------------- |
| Available worker parallelism               | `14`                                    |
| Isolated `doctor.integration.test.ts`      | `23.76s real`, `22.88s` Vitest duration |
| Full `pnpm test:transforms`                | `25.88s real`, `24.07s` Vitest duration |
| Full transform suite, `--maxWorkers=1`     | `45.73s real`, `45.26s` Vitest duration |
| Problematic fixture size                   | `549,935` bytes                         |
| `doctor:profile` total runtime             | `20.88s`                                |
| `doctor:profile` `nonStandardRescue` phase | `20.77s`                                |
| `doctor:profile` `rescueRetryCount`        | `1159`                                  |
| `doctor:profile` warning count             | `1159`                                  |

Interpretation locked for this slice:

- the doctor proof still dominates the transform gate
- default concurrency remains materially better than serialized execution
- the bottleneck is the one-error-per-pass rescue loop
- the canonical doctor transform proof now carries a `60s` test-local timeout because full-suite contention pushes it beyond the previous `30s` ceiling
- harness splitting is not the next honest fix family
- recursive `.passthrough()` / `.catchall()` work remains historical under ADR-040 and must not be reopened here

## User Impact To Optimise For

- keep `pnpm test:transforms` strict, trustworthy, and explainable
- reduce doctor runtime by fixing the actual cost centre instead of hiding it with harness changes
- leave the next session with one concrete runtime-redesign entrypoint instead of a stale candidate list

## Scope

In scope:

- redesign of the non-standard-property rescue loop in `lib/src/shared/doctor/`
- retaining the new diagnostics seam and profiler as proof tools
- batch rescue strategies that preserve current diagnosis behavior
- updated handoff docs that point directly at this slice

Out of scope:

- harness lane splitting, timeout increases, or any proof weakening
- recursive unknown-key-preserving Zod emission
- `int64` / `bigint`
- broad doctor-pipeline redesign outside the rescue loop
- general public option/doc cleanup around `additionalPropertiesDefaultValue` or `strictObjects`

## Locked Constraints

1. `repairOpenApiDocument(inputDocument)` behavior and `DoctorDiagnosis` semantics must remain unchanged.
2. Root `pnpm test:transforms` remains the canonical outer gate.
3. Final accept/reject must still come from authoritative Scalar validation before and after repair.
4. Warning messages must remain human-readable and tied to the properties actually prefixed.
5. No public package export, CLI option, or external API contract change is allowed in this slice.
6. The existing `60s` doctor-proof timeout is a temporary reflection of current measured runtime; no further timeout inflation, skips, or quarantines are allowed as substitutes for the redesign.

## Primary Code Surfaces

- `lib/src/shared/doctor/index.ts`
- `lib/src/shared/doctor/prefix-nonstandard.ts`
- `lib/src/shared/doctor/runtime-diagnostics.ts`
- `lib/scripts/profile-doctor-runtime.mts`
- `lib/tests-transforms/__tests__/doctor.integration.test.ts`
- `lib/src/shared/doctor/index.unit.test.ts`
- `lib/src/shared/doctor/prefix-nonstandard.unit.test.ts`

## Candidate Families To Compare In Order

1. **All-errors preflight batch rescue** — preferred
   - compile a repo-local AJV validator with `allErrors: true` against the same OpenAPI schema version Scalar uses
   - harvest all prefixable `"Property X is not expected to be here"` errors in one pass
   - batch prefix them using the existing pointer utilities
   - keep Scalar validation authoritative before and after the batch rewrite

2. **Parent-object batch rescue from current error shapes** — fallback only
   - use current Scalar error paths plus parent-node traversal to batch-prefix sibling non-standard properties at the affected parent
   - use this only if family 1 cannot be made semantically equivalent without brittle dependency coupling

3. **Harness or timeout changes** — rejected for this slice
   - current measurements already prove that rescue-loop cost, not scheduling, is the dominant problem

## Success Metrics

1. On the problematic fixture, `rescueRetryCount` drops from `1159` to `<= 10`.
2. On the problematic fixture, `nonStandardRescue` drops from `20.77s` to `< 5s` in `pnpm --dir lib doctor:profile`.
3. The isolated doctor proof drops materially below the current `23.76s real` baseline; target `< 12s real` on this machine.
4. `pnpm test:transforms` remains green and lands materially below the current `25.88s real` baseline.
5. Diagnosis semantics remain unchanged for valid docs, simple repair docs, and the problematic fixture.

## TDD Order

### Stage 1: Characterise the batch-rescue target

Add failing-first coverage for:

- multiple unexpected properties under the root object
- multiple unexpected properties under the same nested parent
- the problematic fixture proving that the redesign meaningfully bounds `rescueRetryCount`

### Stage 2: Implement family 1 first

- keep the existing diagnostics seam in place
- implement all-errors preflight batch rescue
- prove that diagnosis output remains unchanged while retry count and rescue time fall sharply

### Stage 3: Use the fallback only if family 1 is proven unworkable

- record the blocker honestly in this plan and `.agent/memory/napkin.md`
- then switch to family 2 without widening scope into harness work or other doctor phases

### Stage 4: Re-measure and close honestly

Re-run:

- `pnpm --dir lib doctor:profile`
- `/usr/bin/time -p pnpm --dir lib exec vitest run --config vitest.transforms.config.ts tests-transforms/__tests__/doctor.integration.test.ts`
- `/usr/bin/time -p pnpm test:transforms`
- the full repo-root Definition of Done

## Test Cases And Scenarios

- already-valid docs remain zero-rescue fast paths
- simple root-level non-standard properties still prefix correctly
- nested escaped JSON-pointer paths still prefix correctly
- multiple unexpected properties under one parent are fixed in one rescue phase
- the problematic fixture still reports `originalIsValid: false`, still produces warnings, still exposes defined `finalErrors`, and still avoids unhandled throws
- the profiling script continues to emit stable JSON keys and write no repo-tracked artefacts

## Documentation Outputs

- keep this file as the active plan of record
- keep `.agent/prompts/session-entry.prompt.md`, `.agent/plans/roadmap.md`, and `.agent/memory/napkin.md` aligned with this runtime-redesign entrypoint
- update `ADR-035` and `lib/tests-transforms/README.md` only if the redesign changes durable proof-budget expectations

## Completion Criteria

- this active plan, the session-entry prompt, the roadmap, and the napkin all name doctor rescue-loop redesign as the next session's entrypoint
- one rescue-loop redesign family lands, or one is rejected with precise evidence and the fallback family is activated explicitly
- the refreshed profile and timing table are recorded honestly after implementation
- required reviewer outcomes are applied and recorded with no hidden handoff debt
