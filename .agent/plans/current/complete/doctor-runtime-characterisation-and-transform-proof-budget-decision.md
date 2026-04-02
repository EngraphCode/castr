# Plan (Complete): Doctor Runtime Characterisation and Transform-Proof Budget Decision

**Status:** Complete  
**Created:** 2026-03-13  
**Last Updated:** 2026-03-13  
**Predecessor:** [int64-bigint-semantics-investigation.md](./int64-bigint-semantics-investigation.md)  
**Successor Slice:** [doctor-rescue-loop-runtime-redesign.md](./doctor-rescue-loop-runtime-redesign.md)  
**Parent Context:** [transform-proof-budgeting-and-runtime-architecture-investigation.md](../../archive/zod-limitations-historical-cluster/transform-proof-budgeting-and-runtime-architecture-investigation.md)  
**Related:** [zod-limitations-architecture-investigation.md](../../archive/zod-limitations-historical-cluster/zod-limitations-architecture-investigation.md), [ADR-035](../../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md), [README.md](../../../../lib/tests-transforms/README.md)

---

This slice is complete and no longer belongs in `active/`.

On Friday, 13 March 2026, the repo characterised the doctor runtime path, refreshed the transform-proof timing table, and made the next-slice decision explicit: the rescue loop is the cost centre, default concurrency is still the right direction, and harness splitting is not the next honest response.

## Summary

The slice started with one key open question: was `pnpm test:transforms` slow because of worker scheduling, or because the doctor pipeline was doing wasteful product-code work?

That question is now answered.

Current measured repo truth from this completed slice:

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

Decision outcome from those measurements:

1. doctor remains the primary transform-gate cost driver
2. default concurrency is materially better than serial execution
3. repeated rescue-loop revalidation is the dominant defect shape
4. the next atomic slice is doctor rescue-loop runtime redesign
5. harness splitting remains paused context rather than the live next step

## Completed Work

Implemented on 2026-03-13:

- refactored `lib/src/shared/doctor/index.ts` into explicit measured phases: clone, initial validate, rescue, upgrade, and final validate
- added the internal `DoctorRuntimeDiagnostics` seam plus `repairOpenApiDocumentWithRuntimeDiagnostics()` while preserving existing `repairOpenApiDocument()` behavior
- extended `prefix-nonstandard.ts` so rescue retry counts are recorded for diagnostics consumers
- added `pnpm --dir lib doctor:profile` via `lib/scripts/profile-doctor-runtime.mts` for stable JSON profiling of the pathological fixture
- added internal unit coverage for fast-path and rescue-path diagnostics plus transform coverage for the pathological doctor proof
- updated the doctor transform proof to use an explicit `60s` test-local timeout because the real proof now lands beyond the default `30s` ceiling under full-suite contention
- rewrote the old active planning stub into the new rescue-loop redesign plan and aligned the main handoff docs to that decision

## Verification Snapshot

Targeted proof and measurement runs completed on 2026-03-13:

- `node -p "require('node:os').availableParallelism()"`
- `pnpm --dir lib doctor:profile`
- `pnpm --dir lib exec vitest run src/shared/doctor/index.unit.test.ts src/shared/doctor/prefix-nonstandard.unit.test.ts --config vitest.config.ts`
- `pnpm --dir lib exec vitest run --config vitest.transforms.config.ts tests-transforms/__tests__/doctor.integration.test.ts`
- `/usr/bin/time -p pnpm --dir lib exec vitest run --config vitest.transforms.config.ts tests-transforms/__tests__/doctor.integration.test.ts`
- `/usr/bin/time -p pnpm test:transforms`
- `/usr/bin/time -p pnpm --dir lib exec vitest run --config vitest.transforms.config.ts --maxWorkers=1`

The full canonical repo-root Definition of Done chain also completed green on 2026-03-13 during this slice:

- `pnpm clean`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm format:check`
- `pnpm type-check`
- `pnpm lint`
- `pnpm madge:circular`
- `pnpm madge:orphans`
- `pnpm depcruise`
- `pnpm knip`
- `pnpm portability:check`
- `pnpm test`
- `pnpm character`
- `pnpm test:snapshot`
- `pnpm test:gen`
- `pnpm test:transforms`

## Review Outcome

Closure review for this slice was completed manually in-session on Friday, 13 March 2026 using the local reviewer templates rather than nested reviewer runs:

- `code-reviewer`
- `test-reviewer`
- `type-reviewer`

That review found no blocking issues in the final runtime-characterisation diff. The remaining work is product-code redesign, not hidden review debt.

## Documentation Outcome

This completed slice promoted its main conclusions out of temporary session notes and into the active handoff set:

- the next repo entrypoint after this slice was the rescue-loop redesign slice
- the historical transform-proof budgeting investigation remains context, but tranche-zero runtime diagnosis no longer needs to be rediscovered
- the active prompt, roadmap, and napkin now all carry the measured runtime table and the explicit non-harness outcome

## Follow-On Context

The next repo entrypoint after this slice was the rescue-loop redesign slice:

- [doctor-rescue-loop-runtime-redesign.md](./doctor-rescue-loop-runtime-redesign.md)

Only pull the broader historical transform-proof budgeting investigation forward again if new evidence shows that scheduling, setup churn, or another non-doctor runtime concern has become the highest-leverage blocker.
