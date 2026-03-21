# Plan (Complete): Doctor Rescue-Loop Runtime Redesign

**Status:** Complete — Implemented and verified 2026-03-20
**Created:** 2026-03-13
**Last Updated:** 2026-03-20
**Predecessor:** [doctor-runtime-characterisation-and-transform-proof-budget-decision.md](../current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md)
**Parent Context:** [transform-proof-budgeting-and-runtime-architecture-investigation.md](../current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md)
**Related:** [int64-bigint-semantics-investigation.md](../current/complete/int64-bigint-semantics-investigation.md), [zod-limitations-architecture-investigation.md](../current/paused/zod-limitations-architecture-investigation.md), [recursive-unknown-key-preserving-zod-emission-investigation.md](../current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md), [zod-round-trip-limitations.md](../../../docs/architecture/zod-round-trip-limitations.md), [ADR-035](../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)

---

This file records the completed doctor rescue-loop runtime redesign. Family 1 (All-Errors Preflight Batch Rescue) was implemented and verified.

## Results

| Metric                      | Before      | After          | Improvement             |
| --------------------------- | ----------- | -------------- | ----------------------- |
| `rescueRetryCount`          | 1,159       | **1**          | 1,159x fewer            |
| `nonStandardRescue`         | 20,770ms    | **31.79ms**    | 653x faster             |
| `doctor:profile` total      | 20,880ms    | **69.49ms**    | 300x faster             |
| Isolated doctor proof       | 23.76s real | **0.53s** real | 45x faster              |
| Full `pnpm test:transforms` | 25.88s real | **6.92s** real | 3.7x faster             |
| Warning count               | 1,159       | **1,954**      | More properties rescued |

Warning count increased because the preflight AJV `allErrors: true` pass discovers non-standard properties that Scalar's one-error-at-a-time approach never reached (deep nesting, properties shadowed by earlier errors).

## Implementation Summary

**Family 1: All-Errors Preflight Batch Rescue** was chosen and implemented:

1. **New module: `lib/src/shared/doctor/preflight-validator.ts`** — repo-local AJV 2020-12 validator with `allErrors: true`, loading the same OpenAPI 3.1 schema that `@scalar/openapi-parser` bundles internally.
2. **Redesigned `attemptNonStandardPropertyRescue`** in `prefix-nonstandard.ts` — preflight batch harvest of all `unevaluatedProperties` errors → batch prefix → Scalar confirmation → bounded fallback.
3. **Extracted pointer traversal** to `pointer-utils.ts` for complexity compliance.
4. **New repo rule** (principle 8): Explicit dependencies only — no transitive dependency reliance.

**Key discovery:** The OpenAPI 3.1 schema uses JSON Schema 2020-12's `unevaluatedProperties: false`, not `additionalProperties: false`. AJV reports these as `keyword: 'unevaluatedProperties'` with `params.unevaluatedProperty`. The schema file uses ESM `export default` and must be loaded via `import(pathToFileURL(...))` to bypass the package exports map.

Family 2 (parent-object batch rescue from Scalar error shapes) was not needed.

## Scope (Unchanged)

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

## Locked Constraints (All Met)

1. ✅ `repairOpenApiDocument(inputDocument)` behavior and `DoctorDiagnosis` semantics remain unchanged.
2. ✅ Root `pnpm test:transforms` remains the canonical outer gate.
3. ✅ Final accept/reject still comes from authoritative Scalar validation before and after repair.
4. ✅ Warning messages remain human-readable and tied to the properties actually prefixed.
5. ✅ No public package export, CLI option, or external API contract change.
6. ✅ The existing `60s` doctor-proof timeout has been reduced to `10s`; the proof runs in under 1s.

## Success Metrics (All Exceeded)

1. ✅ `rescueRetryCount`: 1 (target was ≤ 10)
2. ✅ `nonStandardRescue`: 31.79ms (target was < 5s)
3. ✅ Isolated doctor proof: 0.53s real (target was < 12s)
4. ✅ `pnpm test:transforms`: 6.92s real, 532 tests green
5. ✅ Diagnosis semantics unchanged — valid docs, simple repair docs, and the problematic fixture all behave correctly

## Quality Gates (All Green, 2026-03-20)

- `pnpm build` ✅
- `pnpm type-check` ✅
- `pnpm lint` ✅
- `pnpm format:check` ✅
- `pnpm test` (1,476 tests) ✅
- `pnpm character` (152 tests) ✅
- `pnpm test:snapshot` (152 tests) ✅
- `pnpm test:gen` (20 tests) ✅
- `pnpm test:transforms` (532 tests) ✅

## Primary Code Surfaces (Final)

- `lib/src/shared/doctor/preflight-validator.ts` — **NEW**: AJV `allErrors: true` validator
- `lib/src/shared/doctor/prefix-nonstandard.ts` — redesigned rescue loop
- `lib/src/shared/doctor/pointer-utils.ts` — extracted pointer traversal
- `lib/src/shared/doctor/preflight-validator.unit.test.ts` — **NEW**: 3 preflight tests
- `lib/src/shared/doctor/prefix-nonstandard.unit.test.ts` — updated: 6 batch-rescue tests
- `lib/src/shared/doctor/index.unit.test.ts` — unchanged: 2 tests
- `lib/src/shared/doctor/runtime-diagnostics.ts` — unchanged
- `lib/scripts/profile-doctor-runtime.mts` — unchanged
- `lib/tests-transforms/__tests__/doctor.integration.test.ts` — unchanged

## Follow-On Considerations

- The doctor-proof timeout has been reduced from `60s` to `10s` since the proof runs in ~0.5s.
- The `warningCount` increase from 1,159 to 1,954 is correct behavior — the preflight now finds properties that the one-error-at-a-time approach could never reach.
- The stale public docs/options around `additionalPropertiesDefaultValue` and `strictObjects` remain deferred.
