# Next-Session Record — Proof programme (autonomous loop)

The continuity record for the proof-programme thread: the ADR-051 autonomous
background loop executing the parent plan's queue, three scheduled firings per
day plus owner-attended interactive sessions. Indexed by
[`../repo-continuity.md § Active Threads`](../repo-continuity.md#active-threads);
this record carries identity history per [`README.md`](README.md) +
[PDR-027](../../../practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md).

**Lane-state authority lives in the programme's own surfaces**, not here: the
queue and counters in
[`parent-plan.md`](../../../plans/proof-programme/parent-plan.md) frontmatter,
incidents in [`incidents.md`](../../../plans/proof-programme/incidents.md),
owner decisions in
[`queued-decisions.md`](../../../plans/proof-programme/queued-decisions.md).
This record adds only what those surfaces do not carry: the additive PDR-027
identity table. Scheduled firings update their identity row here at close per
the routine prompt's firing-scoped handoff profile (QD-6).

## Participating agent identities

Additive per PDR-027 — joining adds an identity; a matching platform/model/agent_name
updates `last_session` rather than adding a row. (Sessions predating this record —
the W-0/Q-00/Q-01 authoring sessions and the first firings — are recorded in the
programme's delivery evidence rather than retro-filled here.)

| platform    | model          | session_id_prefix | agent_name            | role                          | first_session | last_session |
| ----------- | -------------- | ----------------- | --------------------- | ----------------------------- | ------------- | ------------ |
| claude-code | claude-fable-5 | 8fc8a6            | Cindery Kindling Lava | executor (QD-5/QD-6 landings) | 2026-08-23    | 2026-08-23   |

## Next safe step

Read the parent plan's frontmatter queue and §Operating protocol; the routine
prompt is the standing brief for scheduled firings. The next safe step is
always what the queue and the open programme PR state — this record never
duplicates them.
