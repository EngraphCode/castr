---
pdr_kind: pattern
---

# PDR-124: Multi-Agent Audit Harness — Ground Truth First, Adversarial Verify, Completeness Critic

**Status**: Proposed (drafted at the 2026-07-03 dedicated consolidation pass; the register's
second-instance trigger fired when a second independent audit reused the harness end-to-end)
**Date**: 2026-07-03
**Related**:
[PDR-096](PDR-096-bring-the-iceberg-transplant-completeness.md)
(bring-the-iceberg — the audit-method-under-counts root this harness cures recurs one level up,
at the decomposition itself);
[PDR-019](PDR-019-adr-pdr-reusability-test.md)
(reusability test — this pattern is re-derived by any Practice repo that runs a decomposed
multi-agent audit, so it is PDR-shaped, not host-pattern-shaped).

## Context

A decomposed multi-agent audit (decompose-and-cover: N lanes, each classifying and verifying a
slice of a large surface) systematically under-counts — and the under-count sits at the lane
DESIGN level, where no individual lane can see it. A lane set that feels exhaustive still misses
whole modalities, because the decomposition was drawn from the orchestrator's mental model of the
surface, not from the surface itself.

Two independent worked instances established and then confirmed the harness:

1. **A two-pass full rescan** (first instance): twelve "exhaustive" lanes missed roughly eleven
   whole modalities. A completeness-critic phase caught the misses and a second pass closed them.
   The same instance calibrated the critic's limits: its value was naming uncovered modalities;
   its drive-by "X is present on re-check" claims were wrong three out of three times.
2. **A delta review against the first instance's verified base** (second instance): the harness
   reused end-to-end, adding the delta form (rescan only what moved since a verified base map —
   re-running the full audit would re-derive already-verified truth), a prompt-scoped critic
   (naming-uncovered-surfaces ONLY, its presence-verdict failure mode guarded explicitly), and
   two newly measured failure modes — a lane-input file shared by two scoped lanes produced a
   false scope-completeness disagreement between their verifiers, and head-reading lanes silently
   skipped the deleted/renamed-paths modality (reading a deleted path at the source head simply
   errors, so nothing surfaces).

## Decision

Structure every decompose-and-cover multi-agent audit with these elements:

1. **Firsthand ground truth first.** The orchestrator computes the raw ground-truth skeleton
   (set-diffs, inventories, name-status listings) BEFORE any agent runs. Every downstream "X is
   missing / X differs" claim is then checked against ground truth the orchestrator established,
   not relayed. This also arms independent discovery: load-bearing anomalies tend to surface from
   the skeleton before the synthesis arrives.
2. **Classify → adversarially verify, per lane.** Each lane's findings are verified by an
   independent adversarial pass; verification pipelines per lane rather than waiting on a global
   barrier.
3. **A completeness critic scoped to NAMING ONLY.** One agent independently re-derives the full
   surface and names what the lanes do not cover. Scope the prompt to naming uncovered
   surfaces/modalities only — a critic's presence adjudications are unreliable by measurement,
   and an unscoped critic will volunteer them.
4. **A second pass over the named-uncovered set.** The critic's output is a work list, not a
   report appendix.
5. **Firsthand re-check of every tier-gating claim.** Before the synthesis drives decisions, the
   orchestrator re-verifies each claim that gates a tier, priority, or disposition.
6. **Never enshrine raw subagent synthesis.** Durable docs persist only the verified substance;
   raw synthesis carries corrected-but-still-present errors. Reference run transcripts for
   provenance.
7. **Pre-split lane inputs.** Give each lane its own input file. A shared list with prose scope
   splits makes sibling verifiers flag each other's scope as uncovered; if inputs must be shared,
   tell each verifier the sibling scopes.
8. **Enumerate the modalities head-reads cannot see.** Deletions and renames need their own
   enumeration (e.g. a `--diff-filter=DR` listing); any modality whose absence reads as an error
   or as silence needs an explicit lane.
9. **Prefer the delta form once a verified base exists.** A delta rescan against a verified base
   map covers what moved; a full re-run re-derives verified truth at full cost and re-introduces
   full-run error surface.

## Consequences

- The harness's cost centre moves from lane count to verification: the critic, second pass, and
  firsthand re-checks are where trust is earned. Skipping them returns the audit to
  plausible-but-under-counted output.
- The critic is a coverage instrument, not an oracle. Treat any presence assertion it volunteers
  as a hypothesis for the dedicated lanes or the orchestrator to measure.
- Ground-truth-first means the orchestrator does real work before delegating; an audit whose
  orchestrator only reads syntheses has no independent basis for critical assessment.
- The audit-method-under-counts root (PDR-096 family) is cured at one more level, but not
  eliminated: a future instance may find it recurring at the harness-design level itself. The
  falsifiability check is whether a completeness critic over the harness's own phases ever names
  an uncovered phase.

## Notes

Host-local context (does not travel): the two worked instances are recorded in the host repo's
transplant plan estate (the 2026-06-28 two-pass gap rescan and the 2026-07-03 delta review, each
with run provenance in its own document). The founding calibration numbers — eleven missed
modalities, three-of-three wrong critic presence re-checks, a thirteen-plus firsthand re-check
count — are those instances' measurements, kept in the host records.
