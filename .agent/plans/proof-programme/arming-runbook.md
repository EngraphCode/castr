# Proof-Programme Routine — Portable Arming Runbook

**Purpose (owner direction, 2026-08-25):** the repository alone must carry everything
required to restart the proof-programme Routine — and the understanding behind it — on an
unrelated account in a completely different environment. This runbook is the single entry
point for that restart. It consolidates; it supersedes nothing: authority stays with
[ADR-051](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md)
(the loop's contract), the [parent plan](./parent-plan.md) (the queue, counters, and
operating protocol), and [`routine-prompt.md`](./routine-prompt.md) (the standing firing
brief). The first arming's evidence lives in the parent plan's Q-01 evidence record; this
runbook turns that history into a repeatable procedure. The Routine is one row of the
session estate's wider account-side inventory — for every other account-side dependency
and its recreate procedure, read the
[account-portability register](../../claude-harness-integrations/account-portability-register.md).

## What the repo carries vs what an account must provide

**Repo-carried (nothing to recreate):** the loop's contract and every amendment
(ADR-051); the firing brief (`routine-prompt.md`); the queue, failure counters, and
operating protocol (parent-plan frontmatter and body); the decision register
([`queued-decisions.md`](./queued-decisions.md)); the incident register
([`incidents.md`](./incidents.md)); the programme thread record
(`../../memory/operational/threads/proof-programme.next-session.md`); the arming arc's
evidence record (parent plan, Q-01) and its review
([loop review 2026-08-24](../../analysis-and-reports/proof-programme-loop-review-2026-08-24.md));
the Practice rules, skills, hooks, and the `agent-tools` CLIs they invoke; the
cloud-environment setup and preflight scripts
([`cloud-environment.md`](../../claude-harness-integrations/cloud-environment.md)); and CI
(`.github/workflows/ci.yml`). Per ADR-051's Consequences: "state is entirely in the repo,
so any future firing resumes from the queue."

**Account-provided (recreate on any new account, per the sections below):** the Routine
(the scheduled trigger and its settings), the cloud environment configuration (setup
script paste, network allow-list, environment variables), the GitHub access grant, the
optional Slack connector and The Watcher session, and the owner seat.

## The stored trigger prompt (canonical verbatim)

The Routine's stored prompt is a deliberate thin pointer: the protocol lives in
`routine-prompt.md` on main, so protocol evolution edits that file and never the trigger;
only the mis-armed fallback lives trigger-side (finding D-5,
[loop review 2026-08-24](../../analysis-and-reports/proof-programme-loop-review-2026-08-24.md)).
Store this text verbatim as the Routine's prompt. If the live trigger's stored prompt
ever differs from this text, the trigger is what fires — re-paste this text rather than
editing around it:

```text
You are a scheduled firing of the castr proof-programme autonomous loop
(ADR-051, Accepted 2026-08-22; owner: jimCresswell). Read
`.agent/plans/proof-programme/routine-prompt.md` on the repository's main
branch and follow it exactly — it is your complete standing brief (exit
criteria, STOP check at the literal path
.agent/plans/proof-programme/STOP, claims scan, WIP=1 drive-or-claim, the
red-head/queued-decision/blocked-slice branches, counter landing rules,
stand-down broadcast, session handoff). If that file does not exist on
main, treat this firing as mis-armed: post the stand-down broadcast naming
the missing prompt, notify the owner in your completion summary, and stop
without touching the queue.
```

On an account where "jimCresswell" is not the owner identity, replace the owner name in
the parenthesis; nothing else in the prompt is account-specific.

## Trigger configuration

- **Mode:** fresh cloud session per firing — no persistent worker, no parallel workers
  (ADR-051 clause 1).
- **Schedule:** cron `3 */8 * * *` — three firings per day, the clause 2 default as
  amended at acceptance. The owner may change cadence at will; agents may lower it —
  never raise it — when firings repeatedly idle.
- **Sources ("Runs with"):** the castr repository, attached by the owner in the Routine's
  settings UI. Measured constraint (Q-01 probe firings, 2026-08-22): a trigger created via
  the API carries no repo sources and its firings land nothing — the division of labour is
  agent creates/updates the Routine, owner attaches the repo, once per Routine.
- **Model:** owner-set in the Routine's settings UI (Fable as of 2026-08-23, QD-5 owner
  action). Change the model in settings only — recreating the trigger via API loses the
  owner-attached sources (measured, same record).
- **Notifications:** completion notifications ON, **push-only, no digest** (ballot B-15
  as amended by owner re-ballot 2026-08-24). Clause 6 escalation notifications keep a
  delivery channel regardless of any future B-15 change.
- **Platform "Auto-fix pull requests": OFF** (owner action 2026-08-23) — firings monitor
  and drive their own PRs; no platform-side second writer.
- **Connectors:** Slack, attached per the QD-7 owner direction (advisory second opinions
  and owner-alert relay via The Watcher). Like repo sources, connectors are UI-attach
  only — the API cannot attach them (Q-01 evidence record), so the owner attaches the
  connector in the Routine's settings. Optional: when the tools are absent from a fired
  session, firings proceed without them and name the absence in the completion summary
  (routine-prompt §Slack and The Watcher).
- **Outcome branches:** the configured outcome branch is a single prefix
  (`claude/<routine-codename>`) that the platform suffixes per firing session (finding
  D-6, [loop review 2026-08-24](../../analysis-and-reports/proof-programme-loop-review-2026-08-24.md);
  fuller documentation is owned by queue rows Q-20/Q-15).

## Cloud environment

Follow
[`cloud-environment.md`](../../claude-harness-integrations/cloud-environment.md) — it is
the complete contract. In summary, on the new account: create the environment; paste the
reference [`cloud-environment-setup.sh`](../../claude-harness-integrations/cloud-environment-setup.sh)
as its setup script; set Network access to Custom with the default package-manager list
plus the extra hosts that document names; set the Slack Watcher environment variables
(`SLACK_WATCHER_CHANNEL_ID`, `SLACK_WATCHER_WORKSPACE`) to the new workspace's values —
they live in the environment, never in the repo. Validate by pasting
[`cloud-environment-preflight.sh`](../../claude-harness-integrations/cloud-environment-preflight.sh)
as a temporary setup script and reading the session-start card: the fresh builder is the
only true test bench.

## GitHub side

The GitHub prerequisites — hosting with Actions running CI, the access grant and its
scope, attribution credentials, and the no-platform-merge-gate posture — are general to
every session type, not Routine-specific, and live in
[`account-access.md`](../../claude-harness-integrations/account-access.md). Nothing
beyond them is needed for the Routine.

## Arming sequence on a new account

1. Provision and validate the cloud environment (section above).
2. Grant GitHub access to the repository.
3. Create the Routine **disabled**, fresh-session mode, with the verbatim stored prompt
   and the cron above; owner attaches the repo and the Slack connector (where the
   workspace exists) in the UI; set the model; notifications push-only; auto-fix OFF.
4. **Dry-run proof before any live firing** (mirrors the Q-01 acceptance): fire the
   disabled Routine once with an explicit DRY-RUN instruction reaching the fired
   session's message. A manual fire may carry no per-run payload — it executes the
   stored prompt — so where the platform offers no per-fire message, temporarily
   prepend the DRY-RUN instruction to the disabled Routine's stored prompt, fire, then
   restore and verify the canonical prompt (the section above) before enabling.
   Routine-prompt step 2 then takes the read-only no-op path — grounding by
   reading only, no claim, the queued-decisions read, the stand-down echo with criterion
   "dry-run complete", session handoff — and leaves no repo-state change. Those last two
   compose per routine-prompt step 2's own bound: the handoff's sequence is exercised
   with every repo-tracked write withheld — nothing committed or pushed, outputs held
   instance-tier only — so the proof exercises the closeout, never its landing; the new
   identity's row lands with the first live firing instead. Confirm the
   completion notification reaches the owner.
5. **Pre-enable state reconciliation on main** — the carried-over repo state was written
   on another host, so verify it is drivable here: no
   `.agent/plans/proof-programme/STOP` file present; no queue row left `in_progress`
   (routine-prompt step 5 claims only `pending` rows, so an `in_progress` row inherited
   from another host with no open PR here is drivable by nothing — return it to
   `pending`, or `blocked` with a written diagnosis); `zero_progress_streak` and any
   `failures:` counts transfer **unchanged** — they are durable programme state
   (ADR-051 clause 6) and their kill switches must still fire on the new account (a
   carried streak of 2 correctly means one more idle firing disables the Routine);
   repair a counter only on demonstrated corruption (the value provably contradicts
   the attested firing history), landing the repair with an incident-register entry
   as its audit trail; every OPEN row in
   `queued-decisions.md` re-read by the new owner seat.
6. Enable the Routine. The loop resumes from the queue on main; no other state transfer
   exists or is needed.

## Stopping and kill switches

Unchanged from ADR-051 clause 6: commit a file at the literal path
`.agent/plans/proof-programme/STOP` (checked before anything else, every firing); pause or
delete the Routine (owner-side, needs no broadcast); three consecutive zero-progress
firings self-disable the Routine with the stand-down broadcast landed on the incident
register. Measured caveat
([loop review 2026-08-24](../../analysis-and-reports/proof-programme-loop-review-2026-08-24.md),
R3/R5): no fired session has yet proven it can call the platform's trigger tools, so the
self-disable act is unproven — the probe is queued (Q-20 re-scope → Q-15), and if it
fails, the clause 6 three-idle response substitution is an owner decision. The owner-side
pause/delete and the STOP file are the proven switches.

## Account-bound identifiers are history, not configuration

The evidence records and registers name identifiers minted on the original account —
trigger ids (`trig_…`), session ids and codenames, artifact and ballot URLs, notification
receipts. They attest the 2026-08-22..24 arming arc and do not resolve, and do not need
to resolve, on a new account: nothing operational reads them. Pull-request numbers refer
to the original `EngraphCode/castr` GitHub repository and stay meaningful as history
wherever the repo moves. The live state a new arming consumes is exactly: the parent-plan
frontmatter (queue rows and `zero_progress_streak`), `queued-decisions.md`,
`incidents.md`, and the programme thread record.

## The owner seat

"Owner" is a role defined by the doctrine, not a bound identity: the seat holds release
claims, ballot verdicts, ADR acceptance,
[`principles.md`](../../directives/principles.md) edits, sequencing supersession, and the
UI-only Routine steps named above (repo and connector attach, model, cadence,
notification channels). On a new account, whoever holds the seat performs those steps;
every OPEN entry in `queued-decisions.md` transfers to them unchanged. The Watcher, where
wanted, is an interactive session the owner runs per the `slack-watcher` skill (canonical
under `.agent/skills/slack-watcher/`, with the firing-side counterpart
`talk-to-slack-watcher`); it needs the Slack workspace and channel to exist, the Slack
connector on the account, and the two environment variables above.
