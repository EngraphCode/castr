---
name: 'Inherited Classification Is a Claim to Measure'
polarity: anti-pattern
use_this_when: 'about to act on an inherited classification — blocked, thin, parity-item, not-needed-yet, type-neutral, false-positive, covered — especially one repeated across several surfaces'
category: process
proven_in: '.agent/memory/active/distilled.md (clerk-expert phantom blocker; task-6 thin mis-estimate; per-thread-records not-needed-yet; type-neutral dependency misclassification)'
proven_date: 2026-06-21
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: 'accepting an inherited label (blocked / thin / parity-item / not-needed / type-neutral) as settled, and treating multi-surface repetition of it as confidence rather than suspicion'
  stable: true
related_pattern: evidence-before-classification
related_pdr: PDR-013
---

> **POLARITY: ANTI-PATTERN.** This entry names a _failure mode to avoid_, with the diagnostic for catching it in the moment.
>
> See [`patterns/README.md` § Polarity](README.md#polarity-required-every-pattern) for the polarity discipline.

# Inherited Classification Is a Claim to Measure

## Anti-pattern

A classification arrives already attached to a thing — a `blocked` blocker, a
`thin` estimate, a `parity item`, a `not-needed-yet`, a `type-neutral` dependency,
a `false-positive`, a `covered`. The agent acts on the **label** instead of
measuring the **artefact** the label describes. Worse: the more surfaces repeat
the classification, the more settled it feels — but repetition only **launders an
unmeasured assumption into apparent consensus**. Repetition is a reason for _more_
suspicion, not less.

Sibling to [`evidence-before-classification`](evidence-before-classification.md)
(which governs _your own_ pre-classification of tool output); this entry governs a
classification **inherited** from another surface, plan, or agent.

## Worked instances

- **The phantom blocker.** "4b is blocked on the clerk-expert P7 fix" was relayed
  across four surfaces and treated as settled. One look at the test: `clerk-expert`
  is a source-repo auth phenotype the host never hosts (zero product-source refs).
  The fix was **deleting a bogus assertion**, not building an agent — the inherited
  framing had _inverted_ the real work.
- **The "thin" estimate.** A controlling sub-plan framed a reconciliation "thin
  (most is present)"; firsthand identifier-level diff found genuinely-new
  subsystems the framing under-stated.
- **The "type-neutral tooling" dependency.** Two deps classed type-neutral
  (`prettier`, `@scalar/json-magic`) were in fact a runtime emission formatter and
  the IR-input bundler — the opposite of safe-to-bump-in-a-sweep.

## The diagnostic

Before relaying or acting on "X is blocked / thin / not-needed / type-neutral"
even **once more**, open X and measure what it actually requires against the
artefact. The fix may be the **inverse** of the inherited framing. The more
surfaces already assert the label, the harder the firsthand check must be.

## When to apply

- Any "blocked on X", scope estimate, parity-item disposition, or dependency-risk
  tier inherited from a plan, ledger, continuity surface, or another agent.
- Especially when the same classification appears on multiple surfaces — treat the
  consensus as a smell, not a proof.
