# Next-Session Record — Proof programme (autonomous loop)

The continuity record for the proof-programme thread: the ADR-051 autonomous
background loop executing the parent plan's queue (three scheduled firings per
day once enabled — **currently POKE-ONLY, no cron: nothing self-fires until the
owner completes the attended firing and enable; see the 2026-08-26 walk
addendum below**) plus owner-attended interactive sessions. Indexed by
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
| Nettle wakes Topsoil           | de57ab0b-1960-5d55-910a-fa887b4993bc | claude-code | claude-fable-5 | 01KKh2            | commissioned arming reviewer (fresh-session review)   | 2026-08-25    | 2026-08-25   |
| Breeze weaves Contrail         | ea6fba19-fcf8-5841-b6a1-56c7d42ddd4d | claude-code | claude-fable-5 | 0132gL            | arming-walk executor (owner-attended)                 | 2026-08-26    | 2026-08-26   |
| Vesta turns Singularity        | f5b4dfc2-acaa-5c8c-bcc5-da63553f07ee | claude-code | claude-fable-5 | 01PjGS            | routine-configuration seat (owner-attended)           | 2026-08-27    | 2026-08-27   |

## Next-session landing target

Per PDR-026, externally verifiable, re-derived each session from the queue
rather than trusted from this record: **drive the single open non-draft
programme PR to merged, else claim the next eligible queue row** (as recorded
2026-08-26: no programme PR is open, so the next firing claims the next
eligible row IN QUEUE ORDER — Q-18, Q-20, Q-22 (Q-21 completed 2026-08-26,
PR #64), then Q-05..Q-09, Q-13,
Q-14, Q-16 (re-adjudicated 2026-08-25, arming review — the narrowed brief in
the parent plan is current: ADR-117 citation replacement only), Q-17 (safety
instruments sequenced first at owner word, 2026-08-26 arming walk).
Verification: the PR merged, or a row's state advanced on the base.

## Session shape and grounding order

Scheduled firings follow the routine prompt end to end (it is the grounding
order; its step 3 now grounds `engraph-start-right-thorough`); owner-attended
interactive cloud sessions likewise ground via `engraph-start-right-thorough`
with the `engraph-plan` / `engraph-metacognition` / `engraph-proportionality`
stack (the installed, invocable names; owner ruling, 2026-08-26)
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

**Review COMPLETE (2026-08-25, Nettle wakes Topsoil / 01KKh2): verdict
sound-to-arm; the walk is scripted and pending.** The commissioned
fresh-session review ran end to end — every hold-note claim re-verified
against the live API (trigger present, stored prompt byte-canonical,
push-only notifications, no cron; repo-side: no STOP, streak 0, no
in_progress rows, no open programme PR) — with an adversarial
assumptions-expert pass folded. Authoritative record and the hardened
step-by-step arming walk: `.agent/analysis-and-reports/routine-arming-review-2026-08-25.md`
(§6 is the walk script for the session that executes it with the owner).
Refinements landed with the review on **PR #60** — the walk's step-0 merge
gate (merge it before any enable; it is not a programme PR): canonical DRY-RUN
instruction + belt-and-braces delivery rule + disable METHOD
(cron-removal, never delete/recreate) + attended-first-firing step in the
arming runbook; disable-method line in the routine prompt; Operating
protocol heading + programme-PR definition + Q-16 brief re-adjudication
in the parent plan; QD-11 row-id correction. **Three owner decisions
pending, carried in the report's §4 (W-1/W-2 dispositions) and §6:**
(a) reorder the queue frontmatter so Q-18/Q-20/Q-21 precede Q-05 (nine
eligible rows currently sit ahead of the safety instruments), (b)
adopt the attended first live firing before the cron goes on, and (c)
QD-13 (programme-PR operative test + ambiguity default), added by the
review's refinements — so the step-5 re-read covers EIGHT open rows
(QD-1/2/4/9/10/11/12/13), superseding the seven-row list in the hold
note above. One
supersession within this note: the "needs no stored-prompt prepend" line
above is DEMOTED by the review — payload delivery is documented but
unmeasured, and the failure mode is an unintended first live firing, so
the walk uses belt and braces (prepend before sources attach + payload +
UI-paste restore). The hold itself stands unchanged: nothing fires or
enables until the owner walks the report's §6 and says so.

**Arming walk EXECUTED through the QD re-read; HOLDS before the attended
firing (2026-08-26, Breeze weaves Contrail / 0132gL — supersedes the hold
note and review addendum above on walk state).** Steps 0–7 done with the
owner live: PR #60 merged (`64af0c44`, seven bot threads fixed and
resolved); DRY-RUN prepend byte-verified in the zero-loss window; owner UI
acts confirmed API-visible after source-attach (repo + Slack connector +
auto-fix OFF; model `claude-fable-5` after an owner re-set — the dry-run
firing had served `claude-sonnet-5`); ruleset probe PR #61 observed the
full required check set and closed (scratch branch resists remote delete —
cosmetic residual); dry run fired clean (read-only held, zero repo-state
change, ~2.5 min, run SUCCEEDED). **Notification incident**: the
completion notification reached NEITHER push nor Slack, and a direct test
push also failed — the account notification path had never actually
delivered; the owner repaired the config mid-walk and a re-test push
arrived. Run-SUCCEEDED ≠ notification-delivered. The owner then amended
the stored prompt live (skills-discipline paragraph — now in the runbook
canonical) and declined a second dry run: **the attended first live firing
is the notification-receipt gate AND the honesty probe** (self-report vs
measured reality). QD re-read complete — all eight rows, rulings verbatim
in the register; five of eight rows measured defective in premise, frame,
or owner-legibility → the row contract landed (register header +
routine-prompt owner-fork branch). Queue reordered: Q-18/Q-20/Q-21/Q-22
precede Q-05 (owner-approved). Cloud grounding ruling landed
(`start-right-thorough` + plan/metacognition/proportionality stack;
strategic node `.agent/plans/future/cloud-autonomy-trust.md`). **Remaining
before any cron: owner-fired attended live firing (watch ~20 min; its
completion notification closes the receipt gate; compare its self-report
against measured reality), then enable per runbook step 7's overlap guard
— only after that firing closes.** ~~Note for the enable sitting: the live
trigger's stored-prompt paragraph still names `start-right-quick`; the
thorough ruling lives in routine-prompt step 3, which the firing follows —
the owner may align the trigger word at leisure (agent trigger edits were
owner-denied this walk; the trigger is owner-territory).~~ SUPERSEDED
2026-08-27 (routine-configuration session, Vesta turns Singularity): the
owner authorised targeted minimal trigger edits for this act ("You can
edit the trigger as long as you keep the changes targeted and minimal and
report them"), and the stored-prompt skills paragraph now names
`start-right-thorough` and the firing-scoped `session-handoff` profile —
API prompt update verified in the same trigger read (prompt byte-exact;
sources, outcome branch, model `claude-fable-5`, auto-fix OFF, Slack
connector, push+slack/no-email notifications all preserved; still no
cron). The runbook canonical block is aligned in the same landing.

**Routine-configuration session addendum (2026-08-27, Vesta turns
Singularity / 01PjGS — owner-attended; extends the walk addendum above).**
Act 0 complete: the stored-prompt skills paragraph aligned to the
thorough/firing-scoped-handoff rulings via an owner-authorised targeted
trigger edit (grant verbatim: "You can edit the trigger as long as you keep
the changes targeted and minimal and report them" — per-context, never
standing; the enable stays owner-held), verified in the same trigger read,
runbook canonical updated in lockstep; PR #67 carries the landing. The
owner then invoked the deep-questioning stack and **ratified the reframing
(2026-08-27)**: the experiment is channel calibration, not capability proof;
verify-don't-trust relocates from owner attention into reliable, trusted,
automated machinery (owner verbatim in the trust node); the work is
investment and its records are structured accordingly. Landed on that
ruling: the cloud-autonomy-trust node PROMOTED to `plans/active/` as the
investment's frame-of-record; the attended-firing honesty probe
PRE-REGISTERED (`../../../plans/proof-programme/attended-firing-honesty-probe.md`,
cited by runbook step 6 — a DIVERGENT verdict stops the arming); the
runbook's new §The Routine is an autonomous Practice agent (configuration
governance, canonical-lockstep change discipline, the cross-session
learning loop); routine-prompt step 3's stored-prompt description updated
to the aligned wording. **The attended firing remains owner-held.** Owner
decisions pending before it: (a) notification channels — the live trigger
reads push+slack while the B-15 record says push-only, and the receipt
gate's satisfying channel (device push vs any channel) is undefined; (b)
stored-prompt paragraph wording — current minimal owner-idiom vs invocable
`engraph-` names (the PR #63 round-17 precedent). Next seat act: author the
Act 3 consolidation-Routine estate (the learning-loop drain).

Branch note (2026-08-25, Sardine turns Coral): the account-portability landing
(owner-directed, outside the queue) landed via
[PR #58](https://github.com/EngraphCode/castr/pull/58) (owner-opened from the
Claude Code UI; head `claude/dazzling-cannon-78571f`). It is not a programme
queue PR — ADR-051 clause 3 does not govern it; the owner invoked this drive to
merge it. The arming runbook and portability register live at
`.agent/plans/proof-programme/arming-runbook.md` and
`.agent/claude-harness-integrations/account-portability-register.md`.
