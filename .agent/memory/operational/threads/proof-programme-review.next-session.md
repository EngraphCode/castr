# Next-Session Record - `proof-programme-review` thread

Owner-commissioned review of the proof-programme autonomous loop (ADR-051):
the parent plan and its queue, the queued decisions and ballot, the routine
definition (file AND live trigger), the incident and loop-test records, and
the skills the loop routes through. Plan:
[`.agent/plans/active/proof-programme-loop-review.md`](../../../plans/active/proof-programme-loop-review.md)
(status active — promoted current/ → active/ 2026-08-24 as the review
session's first act; legs R1–R6; scope guard inside). Distinct from the
`proof-programme` thread itself — that thread RUNS the loop; this one
reviews it. Do not execute queue items from this seat.

## Current Continuation — IN PROGRESS (2026-08-24, Flamebright Burning Caldera / 01FV6r)

Plan promoted current/ → active/ as the session's first act (thorough
grounding done; claim registered; review-only seat honoured). Leg R1
underway.

## Original opening brief (as commissioned)

- **Opening move**: run `engraph-start-right-thorough`, read the plan
  file end to end, PROMOTE it current/ → active/ per the plan lifecycle
  (move the file; update this record's plan link and the continuity row),
  then leg R1 — primary sources in full, drift recorded as findings.
- **The review's scope** (owner-widened 2026-08-24): general analysis of
  what has actually happened across the loop's firings, general
  evaluation of the routine prompt and the skills it routes through, the
  plan's structured legs, and general opportunities for improvement. The
  framing question: will the loop, unattended, converge — and what are
  its runaway and stall modes? Reflexes, not only paperwork. One sharp
  evidence lens: the OCE retrospective at
  <https://github.com/EngraphCode/oak-open-curriculum-ecosystem/blob/engraph/.agent/reports/agentic-engineering/why-the-outage-outlived-its-six-character-fix-2026-08-24.md>
  (unbounded review generators; instruments that exist as prose and
  never fire). Sessions may carry several repos; when referencing a file
  in another repo, use a GitHub URL (owner word, 2026-08-24).
- **Known fresh facts the review must absorb** (2026-08-24): the shared
  cloud environment was broken for ~a day by a find/pipefail defect in the
  setup script's discovery line and is now FIXED (both repos' reference
  scripts carry the cure; see `cloud-environment.md` § Provenance twin) —
  Q-15's fresh-container claims predate this and need re-verification. The
  live Routine (trig_01X4wYy2gHSb8yFhdhwbADGF, cron 3 */8 * * *) continued
  firing THROUGH the outage window; whether those firings failed to start,
  started from cache, or ran is itself review evidence — list_triggers
  exposes only the most recent run (last_run), so derive expected
  firings from the cron and attest each against durable records (per
  the plan's R2) before theorising; evidence-free firings are
  UNATTESTED, never inferred.
- **Deliverable**: R6's dated report under `.agent/analysis-and-reports/`,
  verdicts + routed proposals (warrant + falsifier each), thread record and
  plan statuses updated, and the `engraph-wrap` closeout programme run
  (ported from OCE at owner word, PR #48 review thread).
- **Sibling session**: a parallel review of the Slack Watcher estate runs
  in OCE (thread `slack-watcher-estate-review` there). Independent scopes;
  if a finding belongs to the other estate, route it as a pointer to that
  thread, never absorb it (ship-independent-coordinate-dependent).

## History

- 2026-08-24: thread opened; plan authored born-current and pushed by
  Buzzard weaves Airstream (01e90b) at owner word, alongside the
  environment-outage close-out and retrospective in OCE.

## Participating agent identities

| platform            | model          | agent_name (seed)                    | role                                 | last_session |
| ------------------- | -------------- | ------------------------------------ | ------------------------------------ | ------------ |
| claude-code (cloud) | claude-fable-5 | Buzzard weaves Airstream (01e90b)    | plan author (review not yet started) | 2026-08-24   |
| claude-code (cloud) | claude-fable-5 | Flamebright Burning Caldera (01FV6r) | reviewer (executing legs R1–R6)      | 2026-08-24   |
