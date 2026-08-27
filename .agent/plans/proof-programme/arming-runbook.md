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
editing around it. One sanctioned temporary deviation exists: the arming sequence's
step-3 DRY-RUN prepend (§The DRY-RUN instruction), restored at step 4 — a mid-walk
reader finding the prepend in place follows the walk's restore step, never a bare
re-paste that would strip the pending proof's instruction:

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

Sessions start with the engraph-start-right-thorough skill , plans are structured with the engraph-plan skill, thinking is structured with the engraph-proportionality and other cognitive skills, rabbit holes are defeated with the engraph-metacognition skill, sessions end with the engraph-session-handoff skill (firing-scoped profile)
```

On an account where "jimCresswell" is not the owner identity, replace the owner name in
the parenthesis; nothing else in the prompt is account-specific. The closing
skills-discipline paragraph is the owner's own amendment to the canonical
prompt (added live at the 2026-08-26 arming walk; mid-line spacing conserved
as the owner wrote it). Its wording was aligned to the firing protocol on
2026-08-26 (owner-authorised targeted trigger edit, routine-configuration
session; trigger `updated_at` 2026-08-26T20:07Z), then aligned to invocable
`engraph-` skill names on 2026-08-27 (owner card ruling, same session;
trigger `updated_at` 2026-08-27T10:07Z is the timestamp of record): `start-right-thorough` per the cloud-grounding ruling
(routine-prompt step 3) and the firing-scoped `session-handoff` closeout
profile (routine-prompt step 9, QD-6). The live text carries no trailing
whitespace, so byte-verification against this canonical is exact; the
protocol remains authoritative over the paragraph's words either way, by
the stored prompt's own opening instruction.

## The DRY-RUN instruction (canonical verbatim)

The dry-run proof (arming step 4) is only reproducible if the instruction that trips
routine-prompt step 2's detection is itself repo-carried — an improvised instruction
makes each arming's dry run a fresh authoring act (arming review 2026-08-25). Deliver
this text to the fired session — belt and braces: prepend it to the stored prompt
**before** the owner attaches sources (a zero-loss window), AND pass it as the
per-fire payload where the platform accepts one; restore the canonical stored prompt
afterwards via the owner's settings UI (the preferred route) or an API prompt
update — measured once, 2026-08-26: an API prompt update on a source-attached
trigger preserved sources, model, connector, and notifications, all verifiable in
the same trigger read — and byte-verify:

```text
DRY-RUN (owner-commanded proof firing, arming runbook step 4): take
routine-prompt step 2's read-only path. Ground by reading only; register no
claim; run no install or build beyond what the environment itself provisioned;
write nothing repo-tracked. Your bounded no-op work is one capability report,
delivered in the stand-down echo and the completion summary: name (1) the
repository you checked out and its HEAD SHA; (2) your model id; (3) which tool
surfaces you can SEE, without calling any of them — platform trigger-management
tools, artifact publishing, push notification, and Slack (mcp__claude_ai_* /
Slack-named tools); (4) the OPEN rows from queued-decisions.md. Then post the
stand-down echo with criterion "dry-run complete" and close under the DRY-RUN
READ-ONLY closeout profile. Leave no repo-state change behind.
```

The capability report settles, read-only, the measured-capability caveats the estate
carries (trigger self-disable reach for the OP-6 contingency; the QD-7 Slack tool
surface; the QD-8 ballot/push path) without executing any of them. The API cannot
read a trigger's sources BEFORE they are attached; once the owner attaches them,
sources, outcome branch, model, and connector become visible in trigger reads
(measured 2026-08-26, arming walk) — so a trigger read verifies the attach itself,
and the fired repo + HEAD half of the report remains the end-to-end proof that a
firing actually receives the attached source.

## Trigger configuration

- **Mode:** fresh cloud session per firing — no persistent worker, no parallel workers
  (ADR-051 clause 1).
- **Schedule:** cron `3 */8 * * *` — three firings per day, the clause 2 default as
  amended at acceptance. The owner may change cadence at will; agents may lower it —
  never raise it — when firings repeatedly idle. **Live-state note (2026-08-27):**
  the live trigger currently carries NO cron — poke-only, the arming hold's honest
  disabled state; the cron above is the armed target that goes on only at step 7,
  at the full 3/day default per the owner's 2026-08-27 card ruling (a lower first
  cadence was considered and declined).
- **Sources ("Runs with"):** the castr repository, attached by the owner in the Routine's
  settings UI. Measured constraint (Q-01 probe firings, 2026-08-22): a trigger created via
  the API carries no repo sources and its firings land nothing — the division of labour is
  agent creates/updates the Routine, owner attaches the repo, once per Routine.
- **Model:** owner-set in the Routine's settings UI (Fable as of 2026-08-23, QD-5 owner
  action). Change the model in settings only — recreating the trigger via API loses the
  owner-attached sources (measured, same record).
- **Notifications:** completion notifications ON, **push + Slack, no email** (owner
  card ruling 2026-08-27, superseding ballot B-15's push-only as re-balloted
  2026-08-24): both channels stay live, and **the receipt gate closes only on the
  device push** — the channel QD-8 owner-alerts and clause 6 escalations ride —
  with a Slack arrival recorded as corroboration, never as the gate. Clause 6
  escalation notifications keep a delivery channel regardless of any future
  channel-set change.
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

## The Routine is an autonomous Practice agent

Owner direction (2026-08-27, routine-configuration session): the Routine's
configuration — the stored trigger prompt and every setting the section above
lists — is explicitly part of **creating an autonomous Practice agent**, a
governed Practice surface rather than incidental platform state. The frame of
record is [`cloud-autonomy-trust.md`](./cloud-autonomy-trust.md)
§The autonomous Practice agent, which also carries the structure/support and
learning-across-sessions layers — this section carries only the operational
contract:

- **Canonical lockstep.** Every change to the live trigger lands with its
  repo canonical in the same act: the live edit, the canonical-block edit in
  this runbook, and a trigger-read verification of the result (prompt
  byte-exact; sources, outcome branch, model, auto-fix, connector, and
  notification channels unchanged unless the change targeted them; cron
  present or absent exactly as the change intended). A divergence window
  between live and canonical is a defect with a measured hazard: this
  runbook's own re-paste instruction, followed during such a window, reverts
  the unlanded live change (observed across 2026-08-26→27 — the
  skills-paragraph alignment was live from 2026-08-26 20:07Z while its
  canonical update sat on an unmerged branch; the cure is landing the
  canonical promptly, and this clause). Today this lockstep is review-time
  seat discipline, not machinery — an automated canonical-vs-live compare is
  a named candidate instrument in the trust node's delivery list, not a
  built gate.
- **Change authority.** The owner edits the trigger at will. A seat edits it
  only under explicit owner authorisation, and then keeps the change
  targeted and minimal and reports it (owner grant, 2026-08-26, verbatim:
  "You can edit the trigger as long as you keep the changes targeted and
  minimal and report them" — read narrowly by the authoring seat as
  per-context rather than standing; the owner has not been asked to confirm
  that scope, and the enable act in step 7 and cadence changes remain owner
  acts regardless of the reading).
- The stored prompt stays a thin pointer by design (finding D-5); capability
  never grows trigger-side.

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
scope, attribution credentials, the repository settings (the branch ruleset requiring
the `quality-gates` check plus the scanning/quality/coverage rules, and CodeQL default
setup), and the merge-safety split (ADR-051 clause 3 is the merge AUTHORITY for
programme PRs; the ruleset is the PLATFORM enforcement — both halves must exist) — are
general to every session type, not Routine-specific, and live in
[`account-access.md`](../../claude-harness-integrations/account-access.md). Nothing
beyond them is needed for the Routine.

## Arming sequence on a new account

1. Provision and validate the cloud environment (section above).
2. Grant GitHub access to the repository, **recreate the repository settings** —
   the branch ruleset (required `quality-gates` status check; code-scanning,
   code-quality, and coverage rules with the recorded floors) and CodeQL default
   setup, per
   [`account-access.md`](../../claude-harness-integrations/account-access.md)
   §Repository settings — and **validate them with the draft-PR observation**
   (open a disposable draft PR from a scratch branch, observe the full required
   check set report against the ruleset, close it). Do not proceed to step 3
   until the platform gate is proven live: without it the Routine would run with
   merge and coverage controls silently absent.
3. **Create, prepend, then attach — in that order.** Create the Routine
   **poke-only (no cron expression)**, fresh-session mode, with the verbatim stored
   prompt — the platform has no disabled flag on this API surface (measured, arming
   review 2026-08-25), so a cron-less trigger IS the honest disabled state, and the
   cron goes on only at step 7. Then, while the trigger still has no attached
   sources (the zero-loss window: an API prompt update cannot yet lose anything),
   prepend the canonical DRY-RUN instruction (§The DRY-RUN instruction above) to the
   stored prompt and byte-verify via a trigger read. Only then the owner attaches
   the repo and the Slack connector (where the workspace exists) in the UI, sets the
   model, confirms notifications push + Slack with no email (the device push is the
   sole receipt-gate channel — owner ruling 2026-08-27; §Trigger configuration
   above), and sets auto-fix OFF (per-trigger — a
   fresh set, never a carry-over from a retired trigger).
4. **Dry-run proof before any live firing** (mirrors the Q-01 acceptance). First
   verify no `.agent/plans/proof-programme/STOP` file exists on the new host's
   `main` — this is step 5's STOP check pulled forward for this one item, because
   routine-prompt step 1 checks STOP before anything else: a carried STOP file
   would put the stand-down path ahead of the DRY-RUN branch and the advertised
   read-only proof would land a stand-down bookkeeping mutation instead of
   reporting "dry-run complete". Then fire the Routine once, with the canonical
   DRY-RUN instruction reaching the fired session's message **belt and braces,
   never payload-only** (the step-3 prepend is already in place; also pass the
   instruction as the per-fire payload where the platform accepts one): even where
   the platform documents a per-fire payload, no fire proves delivery until one
   lands, and an undelivered DRY-RUN instruction means the seat takes the LIVE
   path on an unprobed write binding.
   Routine-prompt step 2 then takes the read-only no-op path — grounding by
   reading only, no claim, the queued-decisions read, the stand-down echo with criterion
   "dry-run complete", and the closeout under routine-prompt step 2's **DRY-RUN
   READ-ONLY closeout profile** (defined there as the authoritative narrowing: the
   step-9 sequence exercised with every repo-tracked write withheld, outputs held
   instance-tier, the identity row deferred to the first live firing) — so the proof
   exercises the closeout, never its landing, and leaves no repo-state change.
   **Notification gate (pass/fail):** the completion notification received on the
   owner's device is a hard gate between this step and everything after it — the
   gate-closing channel is the device push (owner card ruling 2026-08-27; the
   channel set is push + Slack, with Slack as corroboration only), and
   an unproven push channel voids the loop's entire observability contract (clause 6
   escalations and QD-8 owner-blocking alerts ride the same path). No receipt →
   stop the arming and diagnose before any further step. **Owner-directed
   replacement gate (2026-08-26 walk, worked instance):** when the dry-run
   receipt FAILS, the arming stops exactly as above; if the owner then repairs
   the notification channel (proven by a direct test push arriving) and declines
   a repeat dry run, the owner may direct that the attended first live firing
   (step 6) serves as the receipt gate instead — its completion notification
   must arrive before the enable, and a silent attended firing stops the arming
   exactly as the dry-run gate would. The dry-run gate remains the default; this
   substitution is an owner call made at the walk, never an agent default. **After the
   dry-run proof passes** (on the replacement path, immediately — selecting that path
   permits and requires the restore BEFORE step 6, since the restore is never gated on
   the replacement receipt, which gates only the enable): restore the canonical stored
   prompt via the owner's settings UI paste
   (the preferred route) or an API prompt update (measured once, 2026-08-26:
   sources, model, connector, and notifications survived an API prompt update on a
   source-attached trigger — verify them in the same trigger read) and byte-verify
   against §The stored trigger prompt — this restore
   completes BEFORE step 6's attended live firing, whose probe value depends on
   the stored prompt being canonical (a leftover prepend would silently send that
   firing down the read-only path and void the write probe).
5. **Pre-enable state reconciliation on main** — the carried-over repo state was written
   on another host, so verify it is drivable here: no
   `.agent/plans/proof-programme/STOP` file present; no queue row left `in_progress`
   (routine-prompt step 5 claims only `pending` rows, so an `in_progress` row inherited
   from another host with no open PR here is drivable by nothing — but FIRST check the
   old host for an open slice PR or blocked draft on that row: `main` plus the open PR
   head is the loop's only durable grounding, and ADR-051 keeps failed-slice drafts
   open precisely to preserve their work, so migrate any surviving branch and PR (push
   the branch to the new host, reopen the draft) or explicitly conserve its diff and
   diagnosis into the row's blocked-note before requeueing; only a row with no
   surviving open work anywhere returns to `pending` clean, else `blocked` with the
   written diagnosis); `zero_progress_streak` and any
   `failures:` counts transfer **unchanged** — they are durable programme state
   (ADR-051 clause 6) and their kill switches must still fire on the new account (a
   carried streak of 2 correctly means one more idle firing disables the Routine);
   repair a counter only on demonstrated corruption (the value provably contradicts
   the attested firing history), landing the repair with an incident-register entry
   as its audit trail; every OPEN row in
   `queued-decisions.md` re-read by the new owner seat.
6. **Attended first live firing (arming review 2026-08-25; owner decides per
   walk — the review recommends it, and skipping it is an explicit owner call
   recorded at the walk, never a silent omission).** The
   §Accepted residuals write-binding disposition makes the first live firing the
   credentialed-write probe — nothing requires that firing to be unattended, and an
   afternoon enable hands it to an overnight slot. Precondition: step 4's restore
   completed and byte-verified (a leftover DRY-RUN prepend sends this firing down
   the read-only path and the write binding stays unprobed while appearing
   observed). Fire once manually with no DRY-RUN payload while the owner is
   present, and watch the
   loud-failure window (~the first 20 minutes: checkout, toolchain provisioning,
   claim, PR-open, first push) plus the outcome-branch behaviour a read-only dry
   run structurally cannot show. The owner holds the pause switch throughout;
   attendance covers the probe window, never the full drive. The firing is also
   the programme's honesty probe: the observing seat runs it against the
   pre-registered claim→measurement table in
   [`attended-firing-honesty-probe.md`](./attended-firing-honesty-probe.md) —
   written before the firing so the verdict is a checklist outcome — and a
   DIVERGENT verdict stops the arming exactly as the notification gate does
   (owner-ratified 2026-08-27, card ruling; the probe's INCOMPLETE verdict
   stops it likewise, for diagnosis of the observation itself).
7. Enable the Routine (set the cron; re-run step 5's state re-verification against
   the live base immediately beforehand — never carried from earlier in the
   sitting). **Verdict gate on the enable act itself (owner-ratified stop rule,
   2026-08-27)**: when step 6's attended firing ran, the cron goes on only
   after that firing has CLOSED with the honesty probe's passing verdict —
   its completion notification received per the receipt-gate channel rule,
   and the probe returning HONEST WITHIN BOUNDS — computed by the probe's
   deterministic aggregation over the recorded row verdicts, never narrated
   (a DIVERGENT or INCOMPLETE verdict stops the arming instead) — and the
   write binding's creation proof in hand: when the attended firing's path
   exercised no branch/PR creation (a drive, or a defer without one), the
   probe records that sub-claim unexercised and readiness question 1 stays
   open — no cron until a firing has proven creation AND that
   creation-proving firing has itself CLOSED (its completion notification
   received): an enable while it still runs would schedule a successor on
   top of it, exactly the overlap this gate exists to prevent. The scheduler never terminates a
   predecessor (ADR-051 clause 2; incident I-1 is the measured
   two-live-workers collision), so an enable mid-drive would schedule a
   successor on top of the still-running attended firing — the verdict gate
   subsumes the overlap concern. When step 4's owner-directed replacement
   gate is in force, the attended firing's completion notification IS the
   receipt gate (a silent attended firing stops the arming, per step 4). The loop resumes from the queue on main; beyond step 5's
   conservation of any surviving open-PR work, no other state transfer exists or is
   needed.

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

**The disable method (arming review 2026-08-25):** where a seat performs the
self-disable, the one safe act is **removing the Routine's cron expression** via the
platform's trigger-update surface, leaving the trigger poke-only — the platform's
honest disabled state, the same shape this arming itself froze at, and the only method
that preserves the owner-attached sources. **Never delete or recreate the trigger**:
recreation loses the owner-attached repo source and connectors (measured, Q-01), and
the result is a Routine that looks alive, re-enables cleanly, and lands nothing —
a silent failure strictly worse than a failed disable. This names the method only; the
substitution decision when the capability itself is absent remains the owner's (the
OP-6 contingency, gated on the Q-15 probe).

## Accepted residuals (recorded dispositions)

Two arming-time gaps are accepted with named bounds rather than cured in this runbook,
in the same family as the unproven self-disable probe above:

- **The Routine's write binding is not probed before enabling.** The dry run is
  read-only by design, so nothing exercises this Routine's push/PR credential binding
  until the first live firing — which IS the credentialed write probe, with a loud,
  bounded failure mode: a push or PR failure lands in the completion notification and
  advances the ADR-051 failure counters. When step 6 runs (its recommended shape), the
  walk's ordering bounds exposure: the firing is owner-attended, and the enable
  waits for its closure with a passing honesty verdict (step 7's verdict
  gate) — so no unattended firing precedes the attended write probe. If the owner exercises step 6's explicit skip, that recorded
  owner call voids this ordering bound and is itself the risk disposition for enabling
  with the write binding unprobed. Past enable, three zero-progress firings self-disable
  the loop (ADR-051 clause 6), and WIP=1 remains the strong best-efforts default
  (QD-13) rather than a guaranteed cap (the
  Q-01 arc measured exactly this discovery path). Reopen condition: a measured SILENT
  write failure — one producing no failing notification — makes this a blocking gap;
  the platform-capability probe family (Q-20 re-scope → Q-15) is its queue home.
- **The Slack workspace/channel/connector binding is an owner-manual account act**
  (workspace OAuth plus connector attach in the claude.ai UI — step 3 names the
  attach) that no repo procedure can perform; the portability register's Slack row
  names the repo-side skills and environment variables, and validation is the
  `talk-to-slack-watcher` probe against a live Watcher. The relay tier is advisory
  (ADR-051 clause 7, QD-7) and gated on the Q-15 capability probe; a restart that
  needs the relay before Q-15 lands reopens this row.

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
