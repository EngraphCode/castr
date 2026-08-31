---
name: Autonomous Background Programme
polarity: pattern
use_this_when: Standing up a large piece of work that must proceed unattended — scheduled agent sessions executing a queue over days or weeks with the owner away — and you need to know what operating machinery to build before the first firing, not discover it by incident
category: agent
related_pattern: owner-decision-ballot
proven_in: '.agent/plans/proof-programme/parent-plan.md — one programme, W-0 ballot through the first firings (2026-08)'
proven_date: 2026-08-23
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: 'Launching an unattended agent loop on interactive-session assumptions — instance-tier state as a reporting channel, cadence mistaken for a duration bound, per-container registries mistaken for collision defence, per-ask owner approvals as the authority model — and paying for each wrong assumption as a live incident instead of a design decision'
  stable: true
---

> **POLARITY: PATTERN.** This is a shape to repeat: the operating machinery an
> unattended agent programme needs, designed for ephemeral sessions sharing only
> a repo remote — skipping any piece of it is paid for later as a live incident.

## Principle

An unattended programme is a **distributed system whose nodes are ephemeral
agent sessions and whose only shared memory is the repo remote**. Every piece
of operating machinery must be designed for that shape from the start: state a
later firing must read lands as tracked repo state on a surface that firing
grounds on; authority the loop needs is converted from per-ask owner approvals
into standing written conditions; every liveness assumption (who else is
running, how long a firing lasts, who else can write a branch) is treated as
false until a mechanism makes it observable.

The proof site is the castr proof programme: a cron Routine spawning three
fresh cloud sessions per day against a queue, ratified in one owner ballot,
which then ran — and whose first collision, overlap, and reporting failures
were each measured, cured, and folded back into the standing machinery within
a day, the evidence trail living in the programme's own incident register,
queued-decisions register, Q-01 evidence record, and the governing ADR's
amendment history. Evidence base as of capture: one programme, two rows
completed interactively, one brief claimed and driven by a firing to an open
PR; the collision machinery below is designed from the measured incident and
not yet exercised by a subsequent firing.

## The shape as built (measured once: one proof programme, 2026-08)

1. **One ballot, walked one question at a time.** Front-load every owner
   decision the loop would otherwise need mid-flight into a single ballot,
   delivered as sequenced single questions with a recommendation first
   (never a document to parse). Success verdicts gate queue rows; the loop
   thereafter queues genuine forks instead of asking.
2. **Condition-based merge authority.** The owner sets the conditions that
   make a merge safe (checks green on the head, conversations properly
   resolved, base not diverged, diff in scope) and never approves individual
   merges — "any required user intervention is a problem". Written as an ADR
   clause the loop cites, not remembered.
3. **The queue as machine-readable frontmatter** in one parent plan: rows
   with `depends_on`, gate lines, and per-row failure counters, plus an
   explicitly initialised `zero_progress_streak` — kill-switch counters are
   never read through an absence default.
4. **One standing firing prompt, read from the base branch.** A zero-context
   firing's whole brief is one file: exit criteria first, protocol in order
   (STOP check → ground/provision → claims + incident
   read → WIP=1 drive-or-claim → slice → counters → handoff), every landing
   rule stated with its route for every case.
5. **Queue briefs are the per-slice plans.** Each row's brief is a
   delegation contract (surface, non-goals, acceptance with proof level,
   source to re-derive from, premise re-verification duty). Separate
   implementation-plan files exist only for plan-authoring acts. (Owner-ratified
   2026-08-23, programme-scoped; at ratification one brief had been claimed and
   driven to an open PR — the ratification chose the brief form over separate
   plan files, not a completed-slice track record.)
6. **Reports follow the audience.** Anything a later firing or the owner
   must read lands via a bookkeeping path onto the base or the open
   programme PR's head: an incident register, counter updates, queued
   decisions. Instance-tier collaboration state and session side branches
   are not reporting surfaces. The owner is interrupted (mobile push) the
   moment anything blocks on them; everything else they read in batch.
7. **Collision machinery for a shared remote** (designed from the measured
   collision; not yet exercised by a later firing as of capture): pre-push
   head re-check (git's compare-and-swap used proactively, not learned from
   rejections); a drive lease as a PR comment (observable cross-container
   ownership); a firing duration bound with a landing cutoff inside the
   cadence interval; a single shared deferral draft so stacked deferrals
   count each firing exactly once; contest-aware routing for every landing
   path, the kill-switch path included.
8. **Review-bot convergence cap with a blocking-defect exception.** Two fix
   rounds for automated reviewers, then carry-forward dispositions with the
   substance queued — but genuine correctness/security/data-loss findings
   block in every round. Measured: early rounds are real, later rounds
   sample an unbounded refinement space; on authority machinery nearly every
   round is real, so enumerate the defect surface deliberately up front.
9. **A Routine without the repo attached lands nothing**: whenever creating
   or recreating the Routine, specify the repo source and re-apply the
   owner-side settings (model, connectors, behaviour toggles), then verify
   them in a config re-read. The first firing observed end to end (spawn →
   credentialed landing → notification receipt) is the mechanism proof.
10. **Structured owner decisions while away**: the owner-decision-ballot
    pattern (sibling entry) — publish a tap-to-answer artifact, push-notify,
    and let any later session read the attributed answers. Composes with the
    cadence; no liveness needed.

## What failed, and the cure each failure bought

- **Instance-tier comms as a broadcast surface** — unobservable across
  containers; a stand-down posted there is read by nobody. Cure: the
  broadcast surface follows the audience (now doctrine in
  `loop-exit-criteria-required` item 4).
- **Cadence mistaken for a duration bound** — a firing ran past its
  successor's spawn; two live sessions drove one branch (the measured
  collision). Cure: duration bound + landing cutoff + overlap guard.
- **Per-container claims registry as collision defence** — structurally
  blind across containers; only the shared remote's state is real. Cure:
  head re-check + lease; claims stay useful within a container only.
- **Sequential ids allocated under concurrency** — two firings on the same
  base pick the same id. Cure: reallocate at the final pre-push refresh.
- **A platform auto-fix toggle as an invisible second writer** — review-fix
  pushes arriving with no session behind them the loop could see. Cure:
  turn it off; firings own PR reaction explicitly.
- **Doctrine references that do not resolve** (transplanted skill pointing
  at absent templates) — an unexecutable instruction is drift waiting to
  fire in a zero-context session. Cure: verify every referenced surface
  exists before scheduling; queue repairs as rows.
- **Assuming a special bot identity** — the default credentials were fine;
  the identity convention was another host's. Verify, don't inherit.

## Setup checklist for the next programme

1. Ballot walked, one question at a time; every verdict recorded. Verify:
   each gated queue row names its ballot items and their verdicts exist.
2. Authority ADR Accepted, carrying merge conditions, cadence, duration
   bound, escalation and kill switches. Verify: every "never/only" the loop
   relies on is a clause it can cite, not conversation memory.
3. Parent plan authored: queue frontmatter with `depends_on` and explicit
   counters, each row's brief a delegation contract. Verify: no eligible row
   lacks a brief; the kill-switch counter is initialised, not defaulted.
4. Standing firing prompt on the base branch, every landing route stated
   and contest-aware. Verify: walk each protocol branch and confirm its
   landing has a route to the base in every case, kill-switch paths
   included.
5. Incident and queued-decisions registers seeded. Verify: the firing
   prompt names a read duty for each, not just a write duty.
6. End-to-end firing proof: spawn → credentialed landing → notification
   receipts, observed firsthand. Verify: a pushed commit and a received
   notification, never the platform's "run succeeded".
7. The Routine carries the repo, model, connectors, and behaviour toggles
   (a Routine missing the repo fires read-only sessions). Verify: re-read
   the Routine's config after they are set.
8. Arm — and fold every reviewer- or incident-found gap back into the
   standing machinery in the same landing that fixes it.
