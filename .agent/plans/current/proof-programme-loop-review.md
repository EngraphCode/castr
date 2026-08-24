---
title: Proof-Programme Loop Review — plan, queues, routine, skills
status: current
lane: current
created: 2026-08-24
last_updated: 2026-08-24
owner_directive: >-
  "Review the Castr project including the plan, the queues, the routine
  definition, the associated skills." (owner, 2026-08-24, commissioned for a
  fresh session)
controlling_lane: >-
  .agent/memory/operational/threads/proof-programme-review.next-session.md
framing: >-
  The proof-programme (ADR-051) is this estate's first standing autonomous
  production loop: a Routine fires ~every 8 hours into a fresh session,
  reads routine-prompt.md as its complete standing brief, and drives the
  parent plan's queue under WIP=1. The review's question is NOT "are the
  documents tidy" but "will this loop, running unattended, converge toward
  the programme's outcome — and what are its runaway and stall modes?" The
  freshest evidence lens is the OCE retrospective
  why-the-outage-outlived-its-six-character-fix-2026-08-24.md: unbounded
  review generators, convergence instruments that exist as prose but are
  never built, and passive doctrine losing to fluent artefacts are the
  measured failure classes of exactly this kind of loop. Review the
  organ's reflexes, not its paperwork.
todos:
  - id: R1
    content: >-
      Ground on primary sources, in full (read-diagnostic-artefacts-in-full):
      ADR-051; proof-programme/parent-plan.md (todos Q-00..Q-15 and its
      contract prose); routine-prompt.md; queued-decisions.md; incidents.md;
      ballot-2026-08-owner-walk.md; loop-test-kingfisher-report.md; the live
      Routine's actual trigger config (list_triggers — cron, model, prompt,
      session mode); the proof-programme.next-session.md thread record.
      Record any drift between these surfaces as findings, not silently.
    status: pending
  - id: R2
    content: >-
      Loop-dynamics review: are the exit criteria reachable and tested
      (loop-exit-criteria-required — verify each stand-down predicate against
      the mechanism's real output, per the F-75 worked instance)? Is WIP=1
      drive-or-claim enforceable by the session that inherits it? STOP-file
      semantics: single path, checked when, race windows? What bounds a
      runaway firing (a session that keeps working past its slice) and what
      un-sticks a stalled one (zero_progress_streak: who increments it, what
      does it trigger, is that instrument ACTIVE or prose)?
    status: pending
    depends_on: [R1]
  - id: R3
    content: >-
      Queue health: the Q-graph's dependency edges vs reality (Q-00..Q-15 —
      completed claims verified against git/PR state, not trusted); staleness
      (Q-15's fresh-container readiness claims predate the 2026-08-24
      environment fix — the find/pipefail outage and its cure changed that
      landscape, re-verify what Q-15 still needs); queued-decisions.md and
      the ballot against the parent plan (no orphaned or double-owned
      decisions); incidents.md as a signal surface (are incidents feeding
      back into the queue or accumulating as a log nobody reads?).
    status: pending
    depends_on: [R1]
  - id: R4
    content: >-
      Routine-definition fidelity: routine-prompt.md against the live
      trigger's stored prompt and config (they can drift — the trigger is
      write-once-edit-rarely; the file is the authority per its own
      mis-armed clause); the fresh-session-per-fire model's assumptions
      (what the fired session can and cannot see; permission surface;
      claude/dazzling-cannon outcome branch); failure modes of a mis-armed
      or double-armed firing.
    status: pending
    depends_on: [R1]
  - id: R5
    content: >-
      Associated-skills fit: every skill the routine prompt or parent plan
      routes through (engraph-start-right-*, engraph-go, engraph-gates,
      engraph-pr-lifecycle, engraph-commit, engraph-session-handoff, and any
      named inline) — do they compose for an UNATTENDED seat (no owner mid-
      session), and do any assume interactivity the loop does not have? For
      bot-reviewed PRs the loop opens: is the pr-lifecycle round tally built
      at PR-open (the retrospective's proposal 2), and does the loop carry
      the bounds-not-cures disposition for unbounded-reference review
      findings?
    status: pending
    depends_on: [R1]
  - id: R6
    content: >-
      Synthesis: a dated report under .agent/analysis-and-reports/ with
      verdicts (KEEP / FIX / RETIRE per surface), each finding carrying
      evidence and each proposal a warrant + falsifier, routed to castr's
      lanes (queue slices for mechanical fixes; owner ballot items for
      decision-class changes). Update the thread record and this plan's
      todo statuses; wrap per engraph-session-handoff.
    status: pending
    depends_on: [R2, R3, R4, R5]
review_note: >-
  Scope guard (proportionality, owner-stopped precedent 2026-08-24): this is
  a review lane producing verdicts and routed proposals — it does NOT
  execute queue items, amend doctrine, or widen into re-planning the
  programme. Individual validity is not sufficiency: correct-but-
  out-of-scope findings are routed to named homes, never absorbed. Bot
  review findings against this review's own PR follow the bounds-not-cures
  disposition where the reference surface is unbounded.
---

# Proof-Programme Loop Review

The plan body is the frontmatter above: framing, six review legs (R1
grounding → R2 loop dynamics, R3 queue health, R4 routine fidelity, R5
skills fit → R6 synthesis), and the scope guard. The controlling thread
record carries session continuity; the opening statement for the fresh
session lives there.
