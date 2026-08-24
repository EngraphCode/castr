# PDR-132: Changeset health — round budgets bind at authoring time

**Status**: Accepted (owner-commissioned fast-lane 2026-07-20; the owner's
framing: the shaping principle must reach work at planning time, because at
PR time "that is too late to plan work").

## Context

The 2026-07-20 measurement pass over 89 merged PRs (the 2026-07-13 → 07-20
merge window) decomposed ready→merged latency. The corpus and companion
analysis are conserved in the delivering estate's reports surface and
referenced from the delivery record that landed with this PDR — this Core
file stays repo-independent per the portability rule:

- **Review rounds dominate.** Commit count (the cure-push proxy for rounds)
  predicts latency at Spearman +0.63; raw diff size manages +0.25, while
  size→rounds and size→findings associations (both +0.62) are consistent
  with the size effect acting through rounds — an associative reading whose
  caveats (uncontrolled mediator, possible reverse path) the companion
  analysis states. The observed per-COMMIT associations are roughly 35–40
  minutes and ~3 comments (commits proxy rounds; round-level cost
  instrumentation is a named follow-up), and the convergence reading they
  support is that reviews do not converge by attrition.
- **The latency tail is silent waiting, not work.** Of the window's 11
  slowest PRs, 9 went ready in the owner-away evening; the same night
  produced four live silent-wait instances across three state classes: an armed auto-merge sitting
  behind red checks, two PRs whose pushed tips had no reviewer requested,
  and a PR with unresolved threads and no shepherd.
- **Class matters (qualitative).** From named worked instances rather
  than a class-stratified corpus — the evidence CSV carries no class
  field, and the register's class dimension is a named follow-up:
  archival/record PRs (retrospectives, handoff records, coordination
  folds) carry large diffs with low finding density and land fast; code
  and doctrine diffs bind tight.

This record is the authoring-side twin of the estate's merge-mechanics
decision (PDR-131), which established that merge concurrency is free and
quality binds at settled-READY; each record is self-contained and the two
land through different folds. The authoring-side claim here: the round
count a changeset will need is substantially fixed at the moment it is
shaped.

## Decision

1. **The health gate is a round budget, never a size gate: a healthy
   changeset settles in at most two review rounds — every class; the
   archival exemption below narrows only the size warnings.** When a third
   round opens on any PR, the shepherd records budget-exceeded and runs
   the generator question THEN — ahead of the state machine's mechanical
   step-back arms, which remain the failure backstop.
2. **Size thresholds are authoring-time warnings, never blocks**: more than
   ~300 added lines or more than ~8 changed files each predict a heavy
   review (a changeset's final commit count is the outcome proxy itself,
   not an authoring-time predictor; opening-commit instrumentation is a
   named follow-up) (the measured heavy-review
   probability triples past 300 additions). A changeset crossing them is
   re-examined for hidden second stories before it opens — and may still
   legitimately proceed.
3. **Class-aware application**: archival/record-class changesets are exempt
   from the size warnings but keep the round budget.
4. **The Goodhart caution is part of the doctrine**: gating on size would
   incentivise fragmenting one story into many PRs, moving cost into
   integration. The budget binds on rounds because the only ways to beat it
   are genuinely smaller scope or genuinely better first-pass quality.
5. **Slicing happens at planning time.** Executable plan steps are sliced
   to PR-shaped units when the plan is authored — each step names its
   changeset class and is stateable as a two-round PR, or it is
   under-decomposed. The plan, pr-lifecycle, and start-right skills carry
   pointers here; this record is the single source and the numbers above
   never restate in operational skill text (dated evidence artefacts and
   delivery records may quote them as historical fact).
6. **Silent-wait states are part of changeset health.** After every push
   the expected reviewer is verified REQUESTED on the new tip; after every
   arm the checks are verified green-or-progressing; every open PR names a
   shepherd. A PR in a state nobody is watching is unhealthy regardless of
   its diff.

## Prediction and falsifier

Stated as an expected-observable-effect plus falsifier pair, the form the
estate's two-speed-learning discipline (PDR-130) requires of enacted
doctrine; the pair below is self-contained. Prediction: with plan-time slicing and the round budget loaded, the
median rounds-per-PR (all classes) for PRs born after this lands falls
within one month; the class-stratified read is additive once the
register's class dimension lands. Measurement: re-run the delivery
corpus methodology (per-PR
commits, review threads, and latency over the trailing window) at the
one-month mark; the pr-throughput register gains commits-per-PR and
changeset-class dimensions as the standing instrument — a named follow-up,
not an assumed present capability. Falsifier: if the
median does not fall, or plan-time slicing produces fragment-PR churn whose
integration cost exceeds the round savings, the plan-skill slicing
requirement reverts to advisory and this record says so in a dated
amendment.

## Consequences

- `plan` SKILL: PR-shaped-units requirement in §Requirements for All
  Non-Trivial Plans (pointer form).
- `pr-lifecycle` SKILL: round-budget expectation note in the review-round
  state machine; silent-wait verification legs in Phases 6 and 7; Phase 1
  changeset-shape check (pointer form).
- `start-right-team` SKILL: this record joins the foundation reading.
- The falsifier's measurement is the corpus-methodology re-run above; the
  register's added dimensions are the standing instrument once landed.
