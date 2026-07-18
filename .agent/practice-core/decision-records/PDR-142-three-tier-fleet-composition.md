---
pdr_kind: pattern
---

# PDR-142: Three-Tier Fleet Composition — Correlation-Distance Tiers, Atomic Judgements, Code Aggregation

**Status**: Adopted (owner-graduated 2026-07-13 at the host estate's
batched owner walk, batch-2 ruling "graduate all three now" — an owner
override of the register's hold-for-second-instance note; captured
2026-07-10 and held under Director custody until the walk)
**Date**: 2026-07-13
**Related**: [PDR-124](PDR-124-multi-agent-audit-harness.md) (the
audit-shaped phenotype of this doctrine — its ground-truth lanes,
adversarial verifiers, and completeness critic are one tier-composition
instance, worked twice before this record existed);
[PDR-015](PDR-015-reviewer-authority-and-dispatch.md) (reviewer
dispatch — expert reviewers are depth-tier work under this model);
[PDR-141](PDR-141-compound-agent-composition-invocation-and-dissolution.md)
(compound-agent lifecycle — fleets under this record are ephemeral
decomposition fleets; a fleet that acquires standing custody or
inter-element authority graduates into PDR-141's composition contract).

## Decision

Fleet work — decomposed analysis, design exploration, review sweeps,
audits — composes in three tiers. Tiers are defined by **correlation
distance** (how much of the problem one mind holds at once, and
therefore how far apart two minds' errors can be), never by task noun:

1. **Swarm tier** (small, cheap models): many independent,
   tightly-briefed agents, each holding
   one narrow slice. Each renders **one atomic judgement** as structured
   output.
2. **Depth tier** (mid-capability models): fewer agents holding a whole
   seam or subsystem in one mind,
   adjudicating where swarm judgements disagree or where a single slice
   cannot carry the needed context.
3. **Apex tier** (the strongest model the host estate grants; above the
   standing grant only at owner word): one or few minds holding the
   cross-seam whole:
   synthesis, contradiction-hunting across lanes, and validation of the
   briefs themselves.

**Atomic judgement, code aggregates.** A fleet agent's output is one
narrow, structured judgement; aggregation — counting, deduplication,
majority, thresholds, coverage arithmetic — happens in deterministic
CODE, never in another agent's prose summary. A prose aggregator
re-introduces a single fallible mind exactly where the design paid for
redundancy.

**Each tier cures a distinct failure class, and the mapping is the
load-bearing content:**

| Failure class                            | Curing tier | Mechanism                                                                    |
| ---------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| Random error in an individual result     | Swarm       | Redundancy over independent judgements + code aggregation                    |
| Local misjudgement within a slice        | Depth       | Adjudication with more of the seam in one mind                               |
| Correlated / systemic error and omission | Apex        | Cross-seam validation — only the apex sees the seams and the briefs together |

**The load-bearing insight: redundancy only cures INDEPENDENT errors.**
A swarm running on a wrong shared brief votes itself confidently wrong —
more agents make the wrong answer more convincing, not less. Correlated
error is invisible from inside the tier that shares the correlation;
only a tier that stands outside the shared brief (the apex, or the
custody seat) can catch it. A fleet design must therefore name, for each
failure class, which tier stands between it and the output — a design
with no apex pass has silently accepted correlated error.

**Custody synthesis is not delegable.** The orchestrating seat holds the
critical-synthesis gate: fleet output is INPUT to a custody judgement,
never a conclusion (the `adversarially-verify-subagent-output` rule is
the per-result face of this clause). Tier ceilings are owner-set; each
host estate binds its concrete model vocabulary and grant scope on its
own grant surfaces (this estate's binding at adoption is recorded in the
graduation register row and the walk's ruling mirror).

## Warrant and evidence

- **The founding catch (2026-07-10, a comms-harvest design fleet):** a
  7-verifier + 4-critic research fleet caught four real defects in a
  confident first-draft design — over-ported big-bang shape, mechanism
  mistaken for value-capture, coerced write-time edges where inference
  was correct, ignored native machinery — each verified first-hand. The
  fleet was the structural check that fluency needed.
- **PDR-124's two audit instances** (2026-07-03) are tier-composition
  phenotypes that predate this record's vocabulary: ground-truth lanes
  (swarm), adversarial verifiers (depth), completeness critic
  (apex-shaped, prompt-scoped to naming uncovered surfaces).
- **The 2026-07-11/12 extraction-arc fleets** (the host plan's
  graduation row names them as this graduation's evidence), including
  the 2026-07-12
  pre-compaction verification pass whose apex-tier completeness critic
  surfaced facts invisible from inside the working context.

## Falsifiability

- A swarm whose aggregation runs through an agent's prose summary
  outperforming code aggregation on error detection, repeatedly and
  measurably, falsifies the atomic-judgement clause.
- A correlated-error incident (wrong shared brief) cured by ADDING swarm
  redundancy rather than by an apex/custody pass falsifies the
  failure-class mapping.
- Fleets composed outside these tiers repeatedly beating tiered fleets
  on both cost and quality falsifies the tier boundary itself; the cure
  would be re-drawing tiers, recorded as an amendment here.

## Provenance

Captured 2026-07-10 during the founding comms-harvest design fleet (the
capture payload is conserved verbatim in the host napkin archive; the
host graduation register row carries the event pointers); reserved under
Director custody explicitly so no bench would graduate it without an
owner walk; graduated at the host estate's batched owner walk
(2026-07-13, batch-2), authored at a Director-routed bench wake.
