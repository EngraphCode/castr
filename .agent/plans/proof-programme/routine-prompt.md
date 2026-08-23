# Proof-Programme Firing Prompt

This is the standing prompt each scheduled firing of the proof-programme Routine receives
(ADR-051, Accepted 2026-08-22; fresh cloud session per firing, three per day). You are a
zero-context session: this file plus the repo surfaces it names are your whole brief.
Authority: [`parent-plan.md`](./parent-plan.md) (the queue and §Operating protocol) and
[ADR-051](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md).

## Exit criteria (declared before anything runs)

- **This firing** ends when it has driven or advanced exactly one slice (or completed one
  bounded red-head repair), or determined it must idle/defer — in every case landing its
  counter update and closing with handoff. One slice per firing, never more. **Duration
  bound (QD-5)**: this firing also ends before the next scheduled firing is due (one
  cadence interval) — not finished means land your state (counters, incident record if
  contested) and stop cleanly; the successor continues any un-merged drive from the PR's
  own state. Incident I-1 arose from a predecessor still driving seven hours in when its
  successor spawned.
- **The loop** ends when the queue is empty and the programme-complete acceptance is met, or
  the owner closes it, or the kill switches below fire. Three consecutive zero-progress
  firings → disable the Routine, notify the owner, and post the stand-down broadcast.

## Protocol, in order

1. **STOP check (exact path, before anything opens a claim)**: if the file
   `.agent/plans/proof-programme/STOP` exists, land the stand-down broadcast (below,
   criterion "STOP file present") and do nothing else — no claim, no slice work, no
   grounding beyond what the landing itself needs. The landing is the one piece of work
   the kill switch permits (QD-5): a bookkeeping-scope commit on the open programme PR's
   head when one exists, else a bookkeeping PR driven to merge under clause 3 — the
   record's only route to the base, since no later firing may exist to merge it. Check the
   literal path — no glob, no interpretation. This runs first so the kill switch never
   leaves a live claim behind (ADR-051 clause 1 ordering).
2. **Dry-run detection (before anything opens a claim)**: when the firing's message
   carries an explicit DRY-RUN instruction from the arming session or the owner, take the
   read-only path from here on — ground by READING the directives only, register NO
   active-area claim, and execute only the bounded no-op work the instruction specifies,
   never claiming, driving, or merging any slice or PR — then report criterion "dry-run
   complete" via the stand-down's comms echo and the completion summary (a dry run is
   exempt from the tracked-record duty, QD-5: its audience is the arming session and owner
   who commanded it, and a proof firing must leave no repo-state change behind), close
   with the `engraph-session-handoff` skill exactly as step 9 requires (every firing
   closes with handoff, dry runs included — the proof must exercise it), and stop. Detection sits
   before grounding because normal grounding registers a claim, and a proof firing must
   leave no collision state behind.
3. **Ground** (normal firings only): run the `engraph-start-right-quick` skill; register
   identity per `register-active-areas-at-session-open`.
4. **Claims scan**:
   `pnpm agent-tools:collaboration-state -- claims list --active .agent/state/collaboration/active-claims.json`
   — any live peer or owner claim touching your target surface defers this firing. A
   deferral lands its counter update via the bookkeeping path **only when no non-draft
   programme PR is already open** (step 5's WIP = 1 invariant binds here too — never open a
   second programme PR); when one is open, land the increment as a bookkeeping-scope
   commit pushed to that open PR's head branch (bookkeeping scope: counter, incident, and
   continuity state only, nothing else — QD-5) — it reaches the base when the PR merges,
   so later firings read a true streak.
   A completion summary is not repo state and cannot carry a counter; a deferral that
   cannot land its increment durably records that failure as a blocker in the summary
   instead of silently dropping it. In the same scan, read
   [`incidents.md`](./incidents.md) back to your grounding base — incident context binds
   this firing: an `environment` entry names hazards to re-verify, a `stand-down` entry
   means establish why the loop exited before proceeding, and a prior `collision` entry
   naming the open programme PR's branch means drive it with the pre-push re-check's care
   — and if THIS firing also ends contested on the same branch, write the repeat up as a
   queued decision (cross-firing contention is a genuine fork: something else owns that
   branch), not a third identical incident. Then stop.
5. **WIP = 1 — every open non-draft programme PR counts**: if any non-draft programme PR is
   open — a slice PR **or a bookkeeping PR** — drive it to merged (CI, review threads under
   ADR-051 clause 4, merge under clause 3, which covers both PR kinds per the QD-3
   amendment and whose full four-condition bar governs: every check green on the current
   head, every conversation properly and proportionately resolved — fixed or rejected,
   base not diverged from the tested head's merge base, diff within the PR kind's scope)
   and do nothing else. **Overlap guard (QD-5)**: before starting the drive, check when
   the PR head last moved — a push within the last hour means a predecessor firing or its
   review-fix round is likely still live and driving (incident I-1); defer this firing via
   step 4's deferral path rather than becoming a second live driver on one branch. A
   bookkeeping PR is WIP for
   drive purposes even though merging it never counts as substantive progress — an unmerged
   counter update left behind would let later firings read a stale streak and keep the
   three-idle kill switch from ever firing. Driving a bookkeeping PR is itself
   zero-progress, and THIS firing's increment must land too: push it as a counter-only
   commit onto the bookkeeping PR's head branch **before** merging, so
   one merge carries both firings' counter state — "do nothing else" never waives step 8's
   every-firing counter duty. **Pre-push head re-check (QD-5)**: immediately before every
   push to a programme PR's head, re-fetch and compare the remote head SHA against the
   base of your local work; a moved head means another writer landed first — reconcile
   (merge theirs in, re-verify gates) and re-check before pushing. The push rejection is
   collision detection arriving late, never a retry cue. A second collision on the same
   branch within one firing marks it **contested**: record the incident (§Reporting
   surfaces below), stop pushing to it, and defer — your already-pushed commits survive as
   ancestors of the branch's continuing history. Otherwise claim the next `pending`
   queue row whose `depends_on` and Gate line are satisfied: mark it `in_progress` in the
   parent plan's frontmatter (rides in your slice PR) and re-verify the brief's premises
   against live state — premises moved means re-adjudicate, not execute.
6. **Execute one atomic TDD slice** per the parent plan's §Operating protocol step 4:
   pre-execution code-expert review (two dispatches) → failing proof → minimal change →
   reviewer pass per `invoke-reviewers` → full gates → PR whose final commit carries the
   slice's state landing (row → `complete`, counters, delivery-ledger row, handoff
   surfaces) → green → merge under clause 3 → orphan continuity commit → stop.
7. **Branches** (each is normal operation, not an error):
   - **Red head on arrival** (gates failing for causes outside your slice): at most ONE
     bounded green-the-head repair slice through the normal TDD/gate/review path, recorded
     in the delivery ledger and the completion summary; still red at firing end → stop and
     notify; subsequent firings attempt only head repair. Never skip, disable, or
     quarantine a test.
   - **Genuine owner fork**: write it to [`queued-decisions.md`](./queued-decisions.md)
     (question + recommendation + what-it-blocks) and reroute to the next unblocked row.
     Never decide release claims, `principles.md` edits, ADR acceptance, or sequencing
     supersession yourself.
   - **Slice fails its second consecutive firing**: mark the row `blocked` with a written
     diagnosis, convert its PR to a draft (never close it), and land the queue-state change
     via the bookkeeping path (row `blocked`, `failures:` count, pointer to the draft's
     diagnosis) so the next firing's scan sees it on the base.
8. **Counters** (durable repo state, parent plan §Failure counters): read
   `zero_progress_streak:` and the claimed row's `failures:` before acting; increment or
   reset as part of your landing. The streak resets only on substantive progress (slice PR
   merged, commit advancing a claimed slice, row completed, head-repair landed, queued
   decision recorded); an idle firing always increments it. An idle or deferring firing
   lands its update as a **bookkeeping PR** (counter, incident, and continuity state only,
   no product code; the ADR-051 clause 6 persistence mechanism, merged unattended at the clause 3 bar,
   which covers bookkeeping PRs per the QD-3 amendment; not a slice PR, never substantive
   progress).
9. **Close**: run the `engraph-session-handoff` skill. The completion notification must
   name: what merged, what advanced, queued decisions written, blocked slices, counter
   values landed. Never end with the repo red without a clause-6 record, or a PR
   half-driven without the next firing's path clear.

## Reporting surfaces (QD-5, 2026-08-23)

Your report's primary consumer is the **next firing**, which grounds on `main` plus the
open programme PR — nothing else. Anything a later firing or the owner must read is
therefore durable only as tracked repo state reachable from that grounding path, landed
via the bookkeeping path (a bookkeeping PR, or a bookkeeping-scope commit on the open
programme PR's head). Instance-tier collaboration state — the comms events, the claims
registry, and the rendered shared log under `.agent/state/collaboration/`, all gitignored
and per-container — and session side branches are NOT reporting surfaces: a comms
event dies with your container, and a commit on an unread branch is unreported. (The
tracked `conversations/` and `escalations/` surfaces there are durable and remain the
owner-escalation route `use-agent-comms-log` names.) Incidents
— a push collision, retry exhaustion, an environment anomaly, a stand-down — land as
entries in [`incidents.md`](./incidents.md) (id, date, firing identity, class, what
happened with evidence, response, follow-up routing). The owner is interrupted only for
ADR-051 clause 6 escalation events; everything else they read in batch.

## Stand-down broadcast (used by every loop exit this firing can perform)

The durable broadcast IS an incident record: append a `stand-down`-class entry to
[`incidents.md`](./incidents.md) naming the loop identity, the exit criterion that fired,
and a one-line closeout summary, and land it via the bookkeeping path (per ADR-051
clause 6 as amended by QD-5). Then, as a best-effort local echo — never the record —
also post:

```bash
pnpm agent-tools:collaboration-state -- comms send \
  --title "STAND-DOWN proof-programme Routine" \
  --body "criterion: <which>; closeout: <one line of what the loop accomplished>" \
  --platform claude-code --model <your model id>
```

The echo needs the built `agent-tools/dist` artefact, which a pristine checkout lacks
(`use-built-agent-tools-cli`): when the artefact is absent, skip the echo and name its
absence in the incident record — never run an install/build solely to deliver a
best-effort echo (`no-unbounded-host-load`); the tracked record already carries the
broadcast. Only when the tracked record itself cannot land (push failure on every
bookkeeping route) does the completion summary carry the stand-down verbatim, with that
landing failure named as a blocker — never skip the record silently.

Post it on: STOP-file observation, the three-zero-progress disable, and the terminal
queue-empty exit. An owner pause applied directly to the Routine needs no broadcast from
you.
