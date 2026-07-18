---
pdr_kind: pattern
---

# PDR-125: Adversarial Verification of Delegated Work — Acceptance Means Verified, and Only the Context-Holder Can Verify Context

**Status**: Accepted (owner-approved at the 2026-07-04 deep-handoff owner
walk; the register trigger — "next dedicated consolidation" — fired that
pass, with two fresh instances landing the same day)
**Date**: 2026-07-04
**Related**:
[PDR-124](PDR-124-multi-agent-audit-harness.md)
(the multi-agent harness this pattern governs the acceptance edge of);
PDR-011 (continuity surfaces — the loss-scan ownership clause is this
pattern's continuity-surface instance);
the host rule `adversarially-verify-subagent-output.md` (the always-on
enforcement surface this PDR generalises).

## Decision

Three clauses, one pattern (clause 3 added 2026-07-06, owner-approved at a
dedicated curation pass):

1. **Acceptance means verified, never reported.** No delegated result — a
   subagent's finding, a reviewer's verdict, a peer's comms assertion, a
   survey's claim, a predecessor's handoff record — is accepted, acted on,
   synthesised, or propagated until the accepting agent has verified it
   against the source it claims to describe. Convergence of multiple
   delegates on one claim validates the _diagnosis at most, never the
   prescription_; a delegate's "not found" is a claim about its search,
   not about the world.

2. **Verification authority follows what the verifier can see.** A
   context-isolated verifier can check artefacts against a repo and
   against each other — that is real, delegable work. But loss-detection
   (what does the live context hold that the artefacts do not?) is
   structurally exclusive to the context-holder: loss is
   `(what I hold) − (what the artefacts capture)`, and only the holder
   sees the left side. Delegating a loss-scan returns an artefact audit
   wearing a loss-scan's name. The composition that works: delegates
   verify the written record; the context-holder assesses every delegate
   result against context; neither substitutes for the other.

3. **Challenge the clean bills, not only the findings.** A verification
   layer scoped to a delegate's POSITIVE findings leaves the delegate's
   false-negatives structurally untouched. For review-shaped delegation,
   run both passes: verify what was flagged AND adversarially challenge
   what was waved through as sound. Founding instance (2026-07-05, WS3
   roster analysis): verification confirmed 16/16 flagged findings while a
   separate challenge pass over the same reviewer's CONFIRMED-SOUND
   verdicts overturned five of them, each re-verified first-hand before
   entering the ledger. Falsifiability axis: the clause earns demotion if
   sustained challenge passes stop overturning clean bills at a rate that
   justifies their cost.

## Instance base (synthesis evidence)

- A survey agent's false "the Practice donor has no plan templates" claim crossed into a
  second repo's memory before verification caught it (2026-07-03).
- A plan-review panel converged 3/3 on a real diagnosis and 2/3 on a wrong
  prescription that first-hand reading of a neighbouring plan refuted
  (2026-07-04).
- Two peers asserted on the comms stream that a register row existed; a
  verifier's history search proved it never had — both had accepted an
  untracked plane's assertion as the record (2026-07-04).
- A seven-verifier handoff fan-out returned findings that only
  context-comparison could rank: every artefact claim checked true, and
  the two most valuable findings were ones only the context-holder could
  confirm mattered (2026-07-04).

## Consequences

- Delegation prompts state what the delegate CAN verify (artefact ↔ source
  ↔ each other) and never ask for what it cannot (context loss, intent).
- Every acceptance step in skills and plans reads "verified against
  source", not "reported by the delegate".
- Handoff doctrine keeps the loss-scan with the context-holder and the
  falsification pass with fresh eyes — both, never one relabelled as the
  other.
- Refusing to accept an unverified claim is never discourtesy; propagating
  one is the failure mode.
