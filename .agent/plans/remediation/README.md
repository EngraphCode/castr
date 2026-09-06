# Remediation evidence and surviving obligations

**Reviewed:** 2026-09-06. These briefs preserve initial-review finding
contracts; they are consumed by the
[proof-programme parent](../proof-programme/parent-plan.md), which owns queue
order and execution state. Do not promote the historic 01–07 sequence independently.

The [initial review](../../report/initial-review/) and later programme evidence
supply the warrants. Reproduce remaining findings on the implementation
base: their age and an old PR's green CI cannot prove them fixed.

| Source                                                                  | Disposition and consuming carrier                                                                         |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [01 packaging](../current/complete/01-packaging-and-types-integrity.md) | Bounded packaging repair complete; retained evidence.                                                     |
| [02 harness](../current/paused/02-ir-fidelity-proof-harness.md)         | Q-02/Q-03/Q-04 bounded slices delivered; full harness Q-11 and residual tranches Q-12 remain.             |
| [02 scouting](./02-preflight-scouting-2026-07-06.md)                    | Historical observations consumed by harness and Q-12; remeasure before implementation.                    |
| [03 keyword semantics](./03-zod-2020-12-keyword-semantics.md)           | Q-05 contains placebo/nested-loss defects; actual keyword support remains Q-12. ADR-047 remains proposed. |
| [04 parser whitelist](./04-zod-parser-strict-whitelist.md)              | Q-05 nested-member containment plus Q-12 parser tranche; no new support implied.                          |
| [05 canonical guards](./05-single-source-type-guards.md)                | Remaining guard/empty-record work and PR #20 value are consumed by Q-12.                                  |
| [06 enforcement](./06-doctrine-enforcement-truthing.md)                 | Q-14 documentary truthing; enforcement Q-12; architecture decision Q-016 remains open.                    |
| [07 hygiene](./07-test-hygiene.md)                                      | Q-07 bounded PR #21 extraction; additional hygiene/enforcement Q-12.                                      |

The [delivery ledger](../delivery-ledger.md) owns current PR dispositions.
Each extraction requires verified surviving value and integrated proof.
Strictness is unchanged: demonstrate preservation for claimed supported surfaces
and record gaps honestly. Never replace executed-validator proof with text
matching or broaden a bounded extraction into scanner/baseline work.
