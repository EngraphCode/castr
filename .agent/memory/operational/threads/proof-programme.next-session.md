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

| agent_name                     | id                                   | platform    | model          | session_id_prefix | role                                                  | first_session | last_session |
| ------------------------------ | ------------------------------------ | ----------- | -------------- | ----------------- | ----------------------------------------------------- | ------------- | ------------ |
| Cindery Kindling Lava          | e27f20d2-fa50-50c8-9989-829307b8735c | claude-code | claude-fable-5 | 8fc8a6            | executor (QD-5/QD-6 landings)                         | 2026-08-23    | 2026-08-23   |
| Fruited Swaying Leaf           | 2c6d968f-db66-55d4-8343-a0eccd1a68a3 | claude-code | claude-fable-5 | 0690b2            | scheduled firing (PR #35 drive to merge)              | 2026-08-23    | 2026-08-23   |
| Luminous Waning Orbit          | e608d93e-4bd7-5ea2-b08e-258ef7c706f1 | claude-code | claude-fable-5 | sessio            | scheduled firing (Q-03 slice)                         | 2026-08-24    | 2026-08-24   |
| Stratospheric Hovering Thermal | f34dddf9-ff0e-56e9-a525-a00493bc8813 | claude-code | claude-fable-5 | sessio            | scheduled firing (Q-04 slice)                         | 2026-08-25    | 2026-08-25   |
| Sardine turns Coral            | e079be76-3221-5c13-aa9c-42c33dfa14fa | claude-code | claude-fable-5 | 01QpYc            | owner-redirected firing (account-portability landing) | 2026-08-25    | 2026-08-25   |

## Next-session landing target

Per PDR-026, externally verifiable, re-derived each session from the queue
rather than trusted from this record: **drive the single open non-draft
programme PR to merged, else claim the next eligible queue row** (as recorded
2026-08-25: Q-04's PR #55 MERGED at `2066a142`; no programme PR is open, so the
next firing claims the next eligible row — Q-05..Q-09, Q-13, Q-14, Q-16 (premises
moved: PR #54 landed the plan templates — re-adjudicate against the merged base
before claiming), Q-17, Q-18, Q-20, Q-21). Verification: the PR merged, or a
row's state advanced on the base.

## Session shape and grounding order

Scheduled firings follow the routine prompt end to end (it is the grounding
order); owner-attended interactive sessions ground via `start-right-quick`
and then follow the parent plan's §Operating protocol. Either shape updates
this record's identity table at close.

## Standing decisions

The governing ADR (autonomous-background-implementation-loop) and the
programme's queued-decisions register carry every standing decision; this
record points and never duplicates. The queue frontmatter and incident
register are the live lane state.

Arming hold (2026-08-25 ~16:0xZ, Kraken calls Abyss 0178h2 — READ BEFORE ANY
FIRING OR ENABLE ACT): the Routine was re-created on this account per the
arming runbook, and the arming is DELIBERATELY FROZEN at runbook step 3.
Live state: trigger `trig_01CbRJjyivM34E7fq2jfLqLJ` ("Castr proof-programme
(ADR-051)"), fresh-session mode, bound to the "Practice Repos" environment
(`env_01T3vjKqpMKCbv5EzaLGczLL`, validated by a successful session start
2026-08-25 after one transient keyserver 503 — see the cloud-environment
fragile-hosts register), stored prompt verbatim per the runbook,
notifications push-only/no-email, **poke-only: no cron, so it can never
self-fire**. NOT yet done: owner UI acts (attach the castr repo source,
attach the Slack connector, set model Fable, confirm auto-fix OFF), the
step-4 dry run, the step-5 owner re-read of the seven OPEN queued
decisions (QD-1/2/4/9/10/11/12; the repo-state half of step 5 verified
2026-08-25: no STOP, streak 0, no in_progress rows, no open programme PR),
and the enable (cron `3 */8 * * *` goes on only then). **Owner commission
(2026-08-25, in-session word): the Routine set-up is to be REVIEWED IN A
FRESH SESSION before any dry-run or enable** — no session fires or enables
this trigger until that review passes and the owner says so. Platform
facts for the reviewer: this API surface creates triggers live with no
disabled flag (poke-only is the honest "disabled" equivalent); the
`connectors` create-parameter is refused for this organization (connector
attach is owner-UI only, re-confirming the Q-01 measurement); and
`fire_trigger` accepts a per-fire text payload, so the step-4 DRY-RUN
instruction needs no stored-prompt prepend on this surface.

Branch note (2026-08-25, Sardine turns Coral): the account-portability landing
(owner-directed, outside the queue) landed via
[PR #58](https://github.com/EngraphCode/castr/pull/58) (owner-opened from the
Claude Code UI; head `claude/dazzling-cannon-78571f`). It is not a programme
queue PR — ADR-051 clause 3 does not govern it; the owner invoked this drive to
merge it. The arming runbook and portability register live at
`.agent/plans/proof-programme/arming-runbook.md` and
`.agent/claude-harness-integrations/account-portability-register.md`.
