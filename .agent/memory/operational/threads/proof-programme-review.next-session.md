# Next-Session Record - `proof-programme-review` thread

Owner-commissioned review of the proof-programme autonomous loop (ADR-051):
the parent plan and its queue, the queued decisions and ballot, the routine
definition (file AND live trigger), the incident and loop-test records, and
the skills the loop routes through. Plan:
[`.agent/plans/current/proof-programme-loop-review.md`](../../../plans/current/proof-programme-loop-review.md)
(status current; legs R1–R6; scope guard inside). Distinct from the
`proof-programme` thread itself — that thread RUNS the loop; this one
reviews it. Do not execute queue items from this seat.

## Current Continuation — NOT STARTED (fresh session picks this up)

- **Opening move**: run `engraph-start-right-thorough`, read the plan file
  end to end, then leg R1 — primary sources in full, drift recorded as
  findings.
- **The review's question**: will the loop, unattended, converge — and what
  are its runaway and stall modes? Reflexes, not paperwork. The evidence
  lens is the OCE retrospective
  `why-the-outage-outlived-its-six-character-fix-2026-08-24.md` (unbounded
  review generators; instruments that exist as prose and never fire).
- **Known fresh facts the review must absorb** (2026-08-24): the shared
  cloud environment was broken for ~a day by a find/pipefail defect in the
  setup script's discovery line and is now FIXED (both repos' reference
  scripts carry the cure; see `cloud-environment.md` § Provenance twin) —
  Q-15's fresh-container claims predate this and need re-verification. The
  live Routine (trig_01X4wYy2gHSb8yFhdhwbADGF, cron 3 */8 * * *) continued
  firing THROUGH the outage window; whether those firings failed to start,
  started from cache, or ran is itself review evidence — pull the
  Routine's run history via list_triggers/last_run before theorising.
- **Deliverable**: R6's dated report under `.agent/analysis-and-reports/`,
  verdicts + routed proposals (warrant + falsifier each), thread record and
  plan statuses updated, wrap run.
- **Sibling session**: a parallel review of the Slack Watcher estate runs
  in OCE (thread `slack-watcher-estate-review` there). Independent scopes;
  if a finding belongs to the other estate, route it as a pointer to that
  thread, never absorb it (ship-independent-coordinate-dependent).

## History

- 2026-08-24: thread opened; plan authored born-current and pushed by
  Buzzard weaves Airstream (01e90b) at owner word, alongside the
  environment-outage close-out and retrospective in OCE.

## Participating agent identities

| platform            | model          | agent_name (seed)                 | role                                 | last_session |
| ------------------- | -------------- | --------------------------------- | ------------------------------------ | ------------ |
| claude-code (cloud) | claude-fable-5 | Buzzard weaves Airstream (01e90b) | plan author (review not yet started) | 2026-08-24   |
