---
title: Proof-Programme Loop Review — general analysis, plan, queues, routine, skills, opportunities
status: active
lane: active
created: 2026-08-24
last_updated: 2026-08-24
owner_directive: >-
  "Review the Castr project including the plan, the queues, the routine
  definition, the associated skills. ... [the] work is not only about the
  areas you identified, it is also about general analysis of what has
  happened, general evaluation of the routine prompt and skills and so on,
  and about general opportunities for improvement." (owner, 2026-08-24,
  commissioned for a fresh session)
controlling_lane: >-
  .agent/memory/operational/threads/proof-programme-review.next-session.md
framing: >-
  The proof-programme (ADR-051) is this estate's first standing autonomous
  production loop: a Routine fires ~every 8 hours into a fresh session,
  reads routine-prompt.md as its complete standing brief, and drives the
  parent plan's queue under WIP=1. The review is OPEN-SCOPED within its
  subject: a general analysis of what has actually happened across the
  loop's firings, a general evaluation of the routine prompt and the
  skills it routes through, the structured legs below, and general
  opportunities for improvement wherever the evidence points. The framing
  question: will this loop, running unattended, converge toward the
  programme's outcome — and what are its runaway and stall modes? One
  sharp evidence lens (not the only one) is the OCE retrospective at
  https://github.com/EngraphCode/oak-open-curriculum-ecosystem/blob/engraph/.agent/reports/agentic-engineering/why-the-outage-outlived-its-six-character-fix-2026-08-24.md
  — unbounded review generators, convergence instruments existing as prose
  but never built, and passive doctrine losing to fluent artefacts are
  measured failure classes of exactly this kind of loop. Review the
  organ's reflexes, not only its paperwork.
todos:
  - id: R1
    content: >-
      Ground on primary sources, in full (read-diagnostic-artefacts-in-full):
      ADR-051; proof-programme/parent-plan.md — the todos queue (Q-00..Q-17
      at authoring; DERIVE the live set from the parent-plan frontmatter,
      never from this plan) and its contract prose; routine-prompt.md;
      queued-decisions.md; incidents.md; ballot-2026-08-owner-walk.md;
      loop-test-kingfisher-report.md; the live Routine's actual trigger
      config AND last-run state (list_triggers — cron, model, prompt,
      session mode, last_run; the platform exposes no fuller run
      history); the proof-programme.next-session.md thread record.
      DONE WHEN every listed surface has been read end to end and every
      drift between surfaces is recorded as a finding (an explicit
      none-found statement counts).
    status: completed
  - id: R2
    content: >-
      General analysis of what has happened: no platform source exports
      every run (list_triggers carries only the most recent run, as
      last_run), so DERIVE the expected firings from the live cron
      expression over the loop's armed window, then attest each expected
      firing against durable records (session outcomes, merged/closed
      PRs and outcome-branch activity, incidents.md, the loop-test
      report) — what each firing did, what it cost, what stalled or ran
      away, and whether the recorded outcomes match the queue's
      completed claims. An expected firing with no durable evidence is
      recorded UNATTESTED, never inferred. DONE WHEN the report carries
      the expected-firing account with each claim traced to its source,
      unattested gaps stated as such, and discrepancies listed as
      findings.
    status: completed
    depends_on: [R1]
  - id: R3
    content: >-
      Loop-dynamics review: exit criteria reachable and tested
      (loop-exit-criteria-required — verify each stand-down predicate
      against the mechanism's real output); WIP=1 drive-or-claim
      enforceability; STOP-file semantics (single path, checked when, race
      windows); what bounds a runaway firing and what un-sticks a stalled
      one (zero_progress_streak: who increments it, what it triggers,
      active instrument or prose). DONE WHEN each named mechanism carries a
      verdict (instrument-backed | prose-only | broken) with the evidence
      that decided it.
    status: completed
    depends_on: [R1]
  - id: R4
    content: >-
      Queue health: the live Q-graph's dependency edges vs reality
      (completed claims verified against git/PR state, not trusted);
      staleness (the fresh-container readiness items predate the
      2026-08-24 environment outage fix — re-verify what still holds);
      queued-decisions.md and the ballot against the parent plan (no
      orphaned or double-owned decisions); incidents.md as a signal
      surface (do incidents feed back into the queue or accumulate
      unread?). DONE WHEN every live queue item has a verified-status row
      and every decision surface a consistency verdict.
    status: completed
    depends_on: [R1]
  - id: R5
    content: >-
      Routine-definition and skills evaluation, general: routine-prompt.md
      against the live trigger's stored prompt and config (drift is a
      finding; the file is the authority — its Authority line binds it to
      parent-plan.md and ADR-051, while the mis-armed fallback lives in
      the TRIGGER's stored prompt, not the file, so diff both
      directions);
      the fresh-session-per-fire model's assumptions (what the fired
      session can see; permission surface; the outcome branch configured
      on the live trigger — read it from the trigger config, not from any
      hard-coded name); failure modes of mis-armed or double-armed
      firings; AND a general evaluation of every skill the routine prompt
      or parent plan routes through (engraph-start-right-*, engraph-go,
      engraph-gates, engraph-pr-lifecycle, engraph-commit,
      engraph-session-handoff, and any named inline): does each compose
      for an UNATTENDED seat, and where does it assume interactivity the
      loop lacks? For bot-reviewed PRs the loop opens: is a round tally
      built at PR-open, and does the loop carry the bounds-not-cures
      disposition for unbounded-reference review findings? DONE WHEN the
      prompt/config diff is recorded and every routed skill has a
      fit-verdict with evidence.
    status: completed
    depends_on: [R1]
  - id: R6
    content: >-
      Synthesis and opportunities: a dated report under
      .agent/analysis-and-reports/ with verdicts (KEEP / FIX / RETIRE per
      surface), the general-analysis narrative from R2, and a distinct
      OPPORTUNITIES section — improvements the evidence suggests beyond
      the defects found — each finding carrying evidence and each proposal
      a warrant + falsifier, routed to castr's lanes (queue slices for
      mechanical fixes; owner ballot items for decision-class changes).
      DONE WHEN the report exists with all three sections populated, the
      thread record and this plan's todo statuses are updated, and the
      engraph-wrap closeout programme (.agent/skills/wrap) has run.
    status: in_progress
    depends_on: [R2, R3, R4, R5]
execution_contract: >-
  Prerequisites: none beyond repo access and list_triggers (read-only);
  the review needs no build beyond the standing gates. Promotion: move
  this file current/ -> active/ (updating the controlling-lane and
  continuity links) as the session's first act, per the plan lifecycle —
  execution does not begin from current/. Risk: LOW — read-and-report
  lane; the one guarded hazard is acting on the live loop (see scope
  guard). Readiness: the plan is executable when R1's source list
  resolves — every named file exists at authoring except the live trigger
  state, which list_triggers supplies at run time. Validation: each
  leg's DONE WHEN is its acceptance criterion, paired with a
  deterministic check on its evidence artefact — R1: every listed
  source exists on disk (test -f per path) and the report's Grounding
  section cites each by path; R2: the report carries the
  cron-derived expected-firing table with exactly one
  attested-with-evidence or UNATTESTED row per expected firing
  (grep-checkable), plus the list_triggers last_run output verbatim as
  the only platform-side run datum; R3: the verdict
  table carries exactly one of instrument-backed|prose-only|broken per
  named mechanism (grep-checkable); R4: each completed-claim row names
  its git log or PR command and output; R5: the prompt-vs-trigger diff
  is included verbatim; R6: the report file exists under
  .agent/analysis-and-reports/, every verdict and proposal row cites
  a named source, and the thread record's closeout entry carries the
  engraph-wrap evidence — the named metaloss fixed point and the
  verbatim git status safety state (grep the thread record for "fixed
  point" and the ahead/behind line). The deterministic command proves
  the evidence exists and is cited; the final verdict is the owner's
  read of the R6 report.
  Foundation alignment: pure review lane — no product code, no doctrine
  amendment, TDD not applicable; strict-and-complete applies to the
  report's claims.
review_note: >-
  Scope guard (proportionality, owner-stopped precedent 2026-08-24): this
  lane produces analysis, verdicts, and routed proposals — it does NOT
  execute queue items, amend doctrine, or fire/disarm the Routine.
  General-scope does not mean unbounded: opportunities are ROUTED (to
  queue slices or ballot items), never enacted from this seat.
  Individual validity is not sufficiency: correct-but-out-of-lane
  findings are routed to named homes, never absorbed. Bot review
  findings against this review's own PR follow the bounds-not-cures
  disposition where the reference surface is unbounded.
---

# Proof-Programme Loop Review

The plan is the frontmatter above: the owner's widened directive
(general analysis of what has happened, general evaluation of the
routine prompt and skills, general opportunities for improvement,
alongside the structured legs), six legs each with a DONE WHEN
acceptance criterion (R1 grounding → R2 what-happened analysis, R3 loop
dynamics, R4 queue health, R5 routine + skills evaluation → R6
synthesis and opportunities), the execution contract (promotion
current/ → active/ first; prerequisites, risk, readiness, validation),
and the scope guard. The controlling thread record carries session
continuity and the opening statement.
