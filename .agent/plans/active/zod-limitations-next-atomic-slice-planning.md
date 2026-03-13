# Plan (Active): Next Zod Limitations Atomic Slice Planning Stub

**Status:** Active  
**Created:** 2026-03-13  
**Last Updated:** 2026-03-13  
**Predecessor:** [int64-bigint-semantics-investigation.md](../current/complete/int64-bigint-semantics-investigation.md)  
**Parent Context:** [zod-limitations-architecture-investigation.md](../current/paused/zod-limitations-architecture-investigation.md)  
**Related:** [recursive-unknown-key-preserving-zod-emission-investigation.md](../current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md), [transform-proof-budgeting-and-runtime-architecture-investigation.md](../current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md), [zod-round-trip-limitations.md](../../../docs/architecture/zod-round-trip-limitations.md), [ADR-031](../../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md), [ADR-032](../../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md), [ADR-035](../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)

---

This file is deliberately a planning stub, not the new umbrella.

The `int64` / `bigint` remediation slice is complete. The next cold-start entrypoint should now choose the next smallest honest atomic slice from the paused Zod limitations workstream without reactivating the entire umbrella plan directly.

## Immediate Priority

If the user reports a fresh gate or runtime issue, reproduce that first.

Otherwise:

1. re-read the paused umbrella context in [zod-limitations-architecture-investigation.md](../current/paused/zod-limitations-architecture-investigation.md)
2. re-check the two paused supporting investigations
3. decide which remaining seam is the highest-leverage next atomic slice
4. write a decision-complete active plan for that slice in collaboration with the user. Once a slice is chosen, the first step is to describe the problem, the reasons it exists, whether or not it is particular to an input-output format pair, and the impact the issue has on users. Also check if we have an existing solution pattern that would apply to this problem.
5. replace this stub once the real next slice is chosen

## Candidate Next Seams

The most likely next atomic slices remain:

- recursive unknown-key-preserving Zod emission
- transform-proof budgeting and runtime architecture

Do not reopen the completed `int64` / `bigint` doctrine or remediation work unless new evidence disproves the now-green closure state recorded in [int64-bigint-semantics-investigation.md](../current/complete/int64-bigint-semantics-investigation.md).
