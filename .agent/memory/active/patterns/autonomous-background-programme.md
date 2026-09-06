---
name: Autonomous Background Programme
polarity: pattern
use_this_when: Designing bounded unattended work with independently grounded sessions, especially when successive sessions share only a repository remote; adapt the measured continuity and collision lessons to the actual execution environment
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

> **POLARITY: PATTERN.** These are measured lessons from one programme using
> ephemeral sessions and a shared repo remote. Adapt the relevant lessons to the
> actual environment; the Claude implementation is not the definition of
> autonomous development.

## Principle

In the measured configuration, independently grounded agent sessions share
durable state through the repo remote. State a successor needs must reach a
surface it reads, authority must be explicit, and collision/duration claims
need observable evidence. Other execution environments may share state
differently; choose mechanisms from their actual ownership and lifetime
boundaries rather than copying this configuration wholesale.

The owner clarified on 2026-09-06 that the Castr autonomous-development
experiment is platform-neutral and paused; its Claude Routine is disabled.
Current state belongs to the parent plan. The 2026-08-31 retirement of the
arming ceremony also stands: existing checks accompany execution, and this
pattern does not prescribe a separate dry-fire, receipt or capability-probe
programme before starting.

The historical proof site is the castr proof programme's Claude implementation:
a cron Routine spawned three fresh cloud sessions per day against a queue,
ratified in one owner ballot, which then ran — and whose first collision, overlap, and reporting failures
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
   (current execution-state/pause check → STOP check → ground/provision →
   claims + incident read → WIP=1 drive-or-claim → slice → counters → handoff).
   A known pause starts no work and creates no idle or failure count.
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
9. **The invocation needs its actual work context.** The measured Claude
   Routine initially lacked the repo attachment; supplying it corrected the
   problem. Observe the selected adapter's available configuration and actual
   credentialed landing and notification delivery during authorised execution.
   A successful platform run alone does not prove value or notification receipt.
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

## Applying the measured lessons

1. Name the beneficiary, work scope and actual session/state boundaries before
   adopting machinery. This pattern's one-programme evidence is not a universal
   specification for autonomous development.
2. Record standing authority and current execution state separately. An accepted
   design can be paused; only the owner resumes it. The queue remains durable
   without manufacturing missed work during the pause.
3. Keep one queue and one ordered invocation prompt. The prompt reads current
   execution state before provisioning or claims; an eligible row is not an
   independent grant to run.
4. Preserve the checks that protect real value: current-head CI and review,
   scope/ownership checks, durable reports, bounded execution and the applicable
   stop conditions. Observe their actual outcomes during execution.
5. Treat the platform recipe as an implementation: record its account-side
   context and notification route without asserting other platforms share it.
   Read available settings and verify actual receipt when work runs.
6. Preserve dated incidents and authorisations. Correct a disproved premise at
   its source; the 2026-08-31 arming retirement is an example of simplifying the
   instrument without abandoning in-flow verification.
